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
  SiaAccessInteractions,
  SiaAccessOptions,
  SiaApplication,
} from "./access-types.ts";
import type { CredentialScope } from "./credentials.ts";
import { createSiaAccess as createCoreSiaAccess } from "./core.ts";
export interface SiaSdkAccessOptions extends Omit<
  SiaAccessOptions<SiaSession>,
  "adapter"
> {
  readonly adapter?: SiaAccessAdapter<SiaSession>;
}
export type SiaSession = Omit<Sdk, "free" | symbol>;
type SiaSdkModule = typeof import("@siafoundation/sia-storage/wasm");

export function createSiaAccess(
  options: SiaSdkAccessOptions,
): SiaAccessInteractions<SiaSession> {
  return createCoreSiaAccess({
    ...options,
    adapter: options.adapter ?? createSiaAdapter(),
  });
}

let initialized: Promise<SiaSdkModule> | undefined;
let facadeRejected = false;

/** Retirement denies new work while an uncancellable Builder call keeps its handle. */
class BuilderConnectionLifetime {
  private busy = false;
  private readonly closed: Promise<void>;
  private consumed = false;
  private freed = false;
  private retired = false;

  constructor(private readonly builder: Builder) {
    this.closed = new Promise<void>((resolve, reject) => {
      this.resolveClosed = resolve;
      this.rejectClosed = reject;
    });
    void this.closed.catch(() => undefined);
  }

  consume(): void {
    this.consumed = true;
  }

  retire(): Promise<void> {
    this.retired = true;
    this.release();
    return this.closed;
  }

  run<T>(work: () => Promise<T>): Promise<T> {
    if (this.retired || this.busy || this.consumed)
      return Promise.reject(new Error("Connection unavailable"));
    this.busy = true;
    return Promise.resolve()
      .then(work)
      .finally(() => {
        this.busy = false;
        this.release();
      });
  }

  private rejectClosed: (error: unknown) => void = () => undefined;

  private release(): void {
    if (!this.retired || this.busy || this.freed) return;
    this.freed = true;
    try {
      this.builder.free();
      this.resolveClosed();
    } catch (error) {
      this.rejectClosed(error);
    }
  }

  private resolveClosed: () => void = () => undefined;
}

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
function connection(
  builder: Builder,
  approvalUrl: string,
): AccessConnection<SiaSession> {
  const lifetime = new BuilderConnectionLifetime(builder);
  return {
    approvalUrl,
    dispose: () => lifetime.retire(),
    matchesExistingAppKey(phrase) {
      return lifetime.run(() => builder.matchesExistingAppKey(phrase));
    },
    register(phrase) {
      return lifetime.run(async () => {
        lifetime.consume();
        try {
          // The controller owns every returned session, including one returned after cancellation.
          return session(await builder.register(phrase));
        } finally {
          void lifetime.retire();
        }
      });
    },
    waitForApproval() {
      return lifetime.run(() => builder.waitForApproval());
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
      } else if (
        facadeAppKey !== module.AppKey &&
        typeof process !== "undefined" &&
        typeof process.versions?.node === "string"
      ) {
        // Node cannot fetch the default file URL. The SDK skips this getter once initialized,
        // so caller-supplied WASM does not require reading the installed asset.
        await module.default({
          get module_or_path() {
            return import("node:fs/promises").then(async ({ readFile }) => {
              const asset = new URL(
                import.meta
                  .resolve("@siafoundation/sia-storage/wasm/sia_storage_wasm_bg.wasm"),
              );
              return new Uint8Array(await readFile(asset));
            });
          },
        });
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
