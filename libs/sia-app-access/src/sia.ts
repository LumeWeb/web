/** Released WASM classes keep authorization independent of Node's native facade. */
import { PhraseValidation } from "./access-types.ts";
import type {
  AppMetadata,
  Builder,
  Sdk,
} from "@siafoundation/sia-storage/wasm";
import type {
  AccessConnection,
  AccessSession,
  SiaAccessAdapter,
  SiaApplication,
} from "./access-types.ts";
import type { CredentialScope } from "./credentials.ts";
export type SiaSession = Omit<Sdk, "free" | symbol>;
type SiaSdkModule = typeof import("@siafoundation/sia-storage/wasm");
let initialized: Promise<SiaSdkModule> | undefined;
let facadeRejected = false;
export function createSiaAdapter(): SiaAccessAdapter<SiaSession> {
  return {
    async begin(scope, application) {
      const app = metadata(scope, application);
      const module = await sdkModule();
      const builder = new module.Builder(scope.indexerUrl, app);
      try {
        await builder.requestConnection();
        return connection(builder, builder.responseUrl());
      } catch (error) {
        builder.free();
        throw error;
      }
    },
    async generateRecoveryPhrase() {
      return (await sdkModule()).generateRecoveryPhrase();
    },
    async reconnect(scope, application, bytes) {
      const app = metadata(scope, application);
      const module = await sdkModule();
      const builder = new module.Builder(scope.indexerUrl, app);
      let key: InstanceType<typeof module.AppKey> | undefined;
      try {
        key = new module.AppKey(bytes);
        const sdk = await builder.connected(key);
        return sdk ? session(sdk) : null;
      } finally {
        try {
          key?.free();
        } finally {
          builder.free();
        }
      }
    },
    async validateRecoveryPhrase(phrase) {
      const module = await sdkModule();
      // Initialization rejection is operational; only the synchronous phrase check rejects input.
      try {
        module.validateRecoveryPhrase(phrase);
        return PhraseValidation.Valid;
      } catch {
        return PhraseValidation.Invalid;
      }
    },
  };
}
/** Retirement denies new borrows while uncancellable calls retain their builder. */
function connection(
  builder: Builder,
  approvalUrl: string,
): AccessConnection<SiaSession> {
  let retired = false;
  let busy = false;
  let freed = false;
  let consumed = false;
  function release() {
    if (retired && !busy && !freed) {
      freed = true;
      builder.free();
    }
  }
  function dispose() {
    retired = true;
    release();
  }
  function perform<T>(work: () => Promise<T>): Promise<T> {
    if (retired || busy || consumed)
      return Promise.reject(new Error("Connection unavailable"));
    busy = true;
    return Promise.resolve()
      .then(work)
      .finally(() => {
        busy = false;
        release();
      });
  }
  return {
    approvalUrl,
    dispose,
    matchesExistingAppKey(phrase) {
      return perform(() => builder.matchesExistingAppKey(phrase));
    },
    register(phrase) {
      return perform(async () => {
        consumed = true;
        try {
          // The controller owns every returned session, including one returned after cancellation.
          return session(await builder.register(phrase));
        } finally {
          dispose();
        }
      });
    },
    waitForApproval() {
      return perform(() => builder.waitForApproval());
    },
  };
}
function metadata(scope: CredentialScope, app: SiaApplication): AppMetadata {
  if (scope.appId !== app.appId)
    throw new TypeError("Application does not match scope");
  return { ...app, callbackUrl: app.callbackUrl, logoUrl: app.logoUrl };
}
function sdkModule(): Promise<SiaSdkModule> {
  initialized ??= import("@siafoundation/sia-storage/wasm")
    .then(async (module) => {
      const facade = await import("@siafoundation/sia-storage").catch(
        () => undefined,
      );
      const facadeAppKey: unknown = facade?.AppKey;
      if (facade && facadeAppKey === module.AppKey && !facadeRejected) {
        try {
          await facade.initSia();
        } catch (error) {
          // SDK 0.2.0 keeps its rejected initialization promise. Only a later operation
          // retries the raw loader; facade callers cannot race that retry with a new load.
          facadeRejected = true;
          throw error;
        }
      } else await module.default();
      return module;
    })
    .catch((error: unknown) => {
      initialized = undefined;
      throw error;
    });
  return initialized;
}
function session(sdk: Sdk): AccessSession<SiaSession> {
  let retired = false;
  return {
    dispose() {
      if (!retired) {
        retired = true;
        sdk.free();
      }
    },
    exportAppKey() {
      if (retired) throw new Error("Session retired");
      const key = sdk.appKey();
      try {
        return key.export();
      } finally {
        key.free();
      }
    },
    value: sdk,
  };
}
