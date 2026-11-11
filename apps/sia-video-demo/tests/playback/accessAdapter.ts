/** Supplies controlled account sessions while mock-browser tests exercise the real access controller. */
import {
  createSiaAccess as createCoreSiaAccess,
  PhraseValidation,
} from "@lumeweb/sia-app-access";
import type {
  AccessConnection,
  AccessSession,
  SiaAccessAdapter,
} from "@lumeweb/sia-app-access";
import type {
  SiaSdkAccessOptions,
  SiaSession,
} from "@lumeweb/sia-app-access/sia";
import {
  type AuthRequest,
  type AuthSession,
  connectAppKey,
  openAuthRequest,
} from "./backend";
import { toHex } from "../../src/lib/hex";

// The mock /sia entry supplies the controlled adapter while keeping the real controller.
export function createSiaAccess(options: SiaSdkAccessOptions) {
  return createCoreSiaAccess({
    ...options,
    adapter: options.adapter ?? createSiaAdapter(),
  });
}

export function createSiaAdapter(): SiaAccessAdapter<SiaSession> {
  return {
    async begin(scope) {
      const request = await openAuthRequest(scope.indexerUrl);
      try {
        return ownConnection(request);
      } catch (error) {
        request.free();
        throw error;
      }
    },
    async generateRecoveryPhrase() {
      const { generateRecoveryPhrase, initSia } =
        await import("@siafoundation/sia-storage");
      await initSia();
      return generateRecoveryPhrase();
    },
    async reconnect(scope, _application, bytes) {
      return ownSession(await connectAppKey(scope.indexerUrl, toHex(bytes)));
    },
    async validateRecoveryPhrase(phrase) {
      const { initSia, validateRecoveryPhrase } =
        await import("@siafoundation/sia-storage");
      await initSia();
      try {
        validateRecoveryPhrase(phrase);
        return PhraseValidation.Valid;
      } catch {
        return PhraseValidation.Invalid;
      }
    },
  };
}

function ownConnection(request: AuthRequest): AccessConnection<SiaSession> {
  let retired = false;
  let busy = false;
  let freed = false;
  let resolveClosed: () => void = () => undefined;
  let rejectClosed: (error: unknown) => void = () => undefined;
  const closed = new Promise<void>((resolve, reject) => {
    resolveClosed = resolve;
    rejectClosed = reject;
  });
  void closed.catch(() => undefined);
  function release() {
    if (retired && !busy && !freed) {
      freed = true;
      try {
        void Promise.resolve(request.free()).then(resolveClosed, rejectClosed);
      } catch (error) {
        rejectClosed(error);
      }
    }
  }
  function dispose(): Promise<void> {
    retired = true;
    release();
    return closed;
  }
  function perform<T>(work: () => Promise<T>): Promise<T> {
    if (retired || busy)
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
    approvalUrl: request.responseUrl(),
    dispose,
    matchesExistingAppKey: (phrase) =>
      perform(() => request.matchesExistingAppKey(phrase)),
    register: (phrase) =>
      perform(async () => {
        try {
          return ownSession(await request.register(phrase));
        } finally {
          dispose();
        }
      }),
    waitForApproval: () => perform(() => request.waitForApproval()),
  };
}

function ownSession(sdk: AuthSession): AccessSession<SiaSession> {
  let disposed = false;
  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      sdk.free();
    },
    exportAppKey() {
      const key = sdk.appKey();
      try {
        return key.export();
      } finally {
        key.free();
      }
    },
    value: sdk as unknown as SiaSession,
  };
}
