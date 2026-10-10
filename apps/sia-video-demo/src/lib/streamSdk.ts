/**
 * Demo-owned page-side SDK lifetime for streaming.
 *
 * The SDK's streaming service worker keeps credentials in memory and re-fetches
 * them from the page if the browser restarts the worker. This means the
 * page-side Sdk/SharedSdk must outlive the streaming session. This module
 * lazily connects and caches one SDK per mode (app or shared), and frees it
 * on mode switch or explicit teardown.
 *
 * The connect functions and auth state reader are injectable so unit tests
 * run with plain fakes; the defaults dynamic-import the WASM SDK (the chunk
 * is only fetched when a stream is actually requested). The auth state reader
 * is required (not defaulted here) to avoid a top-level import of the auth
 * store, whose module-level `ingestSharingFragment()` call needs `window`.
 *
 * The cached handle also carries a credential-identity fingerprint: when the
 * auth state behind it changes (key rotation, logout, indexer change), the
 * next request frees the stale SDK and reconnects, and `watchAuthIdentity`
 * frees it immediately on the change so a restarting worker never re-fetches
 * credentials for a key the page no longer has.
 */

import type {
  AppCredentials,
  Sdk,
  SharedCredentials,
  SharedSdk,
} from "@siafoundation/sia-storage";
import { APP_META } from "./constants";
import { fromHex } from "./hex";
import type { DemoStreamSource } from "./streamService";

/** The auth fields the streaming credentials are built from. */
export interface StreamAuthState {
  indexerUrl: string;
  sharingKeyHex: null | string;
  userKeyHex: string;
}

/** The credentials `openStreams` takes, paired with the connected SDK. */
export type StreamCredentials = AppCredentials | SharedCredentials;

/** A connected SDK and the credentials `openStreams` needs for it. */
export interface StreamSdkHandle {
  readonly credentials: StreamCredentials;
  readonly sdk: Sdk | SharedSdk;
}

/** The demo-owned SDK lifetime manager: lazy connect, cache, free. */
export interface StreamSdkManager {
  /**
   * Returns a connected SDK handle for the given source mode. Lazily connects
   * on first use, caches per mode, frees the previous handle on mode
   * switch, and deduplicates concurrent connects for the same mode and
   * credential identity (single flight).
   */
  free(): void;
  getStreamSdk(source: DemoStreamSource): Promise<StreamSdkHandle>;
}

/**
 * Injectable dependencies for the SDK lifetime manager.
 *
 * `getAuth` is required (not defaulted here) to avoid a top-level import of
 * the auth store, whose module-level `ingestSharingFragment()` call needs
 * `window`.
 */
export interface StreamSdkManagerDeps {
  /** Connects an app-key SDK. Defaults to a lazy dynamic import. */
  connectAppSdk?: (indexerUrl: string, userKeyHex: string) => Promise<Sdk>;
  /** Connects a sharing-key SDK. Defaults to a lazy dynamic import. */
  connectSharedSdk?: (
    indexerUrl: string,
    seedHex: string,
  ) => Promise<SharedSdk>;
  getAuth: () => StreamAuthState;
}

/**
 * A connect in progress: its promise is shared by concurrent callers with
 * the same (mode, identity), and it is obsoleted (never installed as the
 * cached handle) when `free()` runs, a newer same-mode connect replaces it,
 * or the credentials rotate underneath it.
 */
interface InFlightEntry {
  generation: number;
  identity: string;
  mode: "app" | "shared";
  promise: Promise<StreamSdkHandle>;
}

/** Per-mode in-flight slots: cross-mode connects coexist without clobbering. */
interface InFlightMap {
  app: InFlightEntry | null;
  shared: InFlightEntry | null;
}

/**
 * Error thrown to callers of an in-flight connect that was obsoleted before
 * it settled (free() ran, credentials rotated, or a newer connect replaced
 * it). The SDK it built has been freed; the caller must retry with a fresh
 * request.
 */
export class StaleSdkError extends Error {
  constructor(
    message = "SDK connection is stale (credentials changed); retry",
  ) {
    super(message);
    this.name = "StaleSdkError";
  }
}

/**
 * Builds the demo-owned SDK lifetime manager. Lazily connects and caches one
 * SDK per mode; frees the previous handle on mode switch; deduplicates
 * concurrent connects for the same mode and credential identity (single
 * flight).
 */
export function createStreamSdkManager(
  deps: StreamSdkManagerDeps,
): StreamSdkManager {
  const connectApp = deps.connectAppSdk ?? defaultConnectAppSdk;
  const connectShared = deps.connectSharedSdk ?? defaultConnectSharedSdk;
  const getAuth = deps.getAuth;

  let current: null | {
    handle: StreamSdkHandle;
    identity: string;
    mode: "app" | "shared";
  } = null;
  // Per-mode single-flight: one in-flight connect per mode. Concurrent
  // callers with the same (mode, identity) share its promise; a failed
  // connect clears it so it is retryable. Cross-mode connects coexist
  // without clobbering each other.
  const inFlight: InFlightMap = { app: null, shared: null };
  // Bumped whenever an in-flight connect becomes obsolete (free() called, or
  // replaced by a newer same-mode connect): its result must not be
  // installed as the cached handle.
  let generation = 0;

  return {
    free: () => {
      // Obsolete any pending connects: they must not become current, and
      // their SDKs are freed by the resolve path below.
      generation += 1;
      inFlight.app = null;
      inFlight.shared = null;
      if (current) {
        current.handle.sdk.free();
        current = null;
      }
    },
    getStreamSdk: (source) => {
      const mode = source.shared ? "shared" : "app";
      const auth = getAuth();
      const identity = credentialIdentity(mode, auth);
      // Same mode with unchanged credentials: return the cached handle.
      if (current && current.mode === mode && current.identity === identity) {
        return Promise.resolve(current.handle);
      }
      // Mode switch or credential change (rotation, logout, indexer change):
      // free the previous handle so a restarting worker can never be handed
      // its stale credentials.
      if (current) {
        current.handle.sdk.free();
        current = null;
      }
      const existing = inFlight[mode];
      // Same in-flight connect: share its promise instead of starting a
      // second connection (the overwritten handle would be unreachable by
      // free()/watchAuthIdentity, leaking live credentials).
      if (existing && existing.identity === identity) {
        return existing.promise;
      }
      // A pending connect for this mode whose identity is now stale: it can
      // never become current. Let it settle; its resolve handler frees the
      // SDK and rejects with StaleSdkError. No extra .then(free) here —
      // the resolve path is the single free site.
      if (existing) {
        generation += 1;
        inFlight[mode] = null;
      }
      const entry: InFlightEntry = {
        generation,
        identity,
        mode,
        promise: Promise.resolve(null as never),
      };
      entry.promise = (
        mode === "shared"
          ? connectSharedHandle(auth, connectShared)
          : connectAppHandle(auth, connectApp)
      )
        .then((handle) => {
          if (inFlight[mode] === entry) inFlight[mode] = null;
          // Obsolete by the time it settled: free() ran, a newer connect
          // replaced it, or the credentials rotated underneath it. Its SDK
          // is freed and the caller receives a StaleSdkError so it can
          // retry with fresh credentials.
          if (
            entry.generation !== generation ||
            credentialIdentity(mode, getAuth()) !== identity
          ) {
            handle.sdk.free();
            throw new StaleSdkError();
          }
          // Free any existing cached handle (a different mode may have been
          // installed while this connect was in flight) so it is not leaked.
          if (current) {
            current.handle.sdk.free();
            current = null;
          }
          current = { handle, identity, mode };
          return handle;
        })
        .catch((error) => {
          // A failed connect (or a StaleSdkError) must not pin a rejected
          // promise for this identity: the next request starts a fresh
          // connect.
          if (inFlight[mode] === entry) inFlight[mode] = null;
          throw error;
        });
      inFlight[mode] = entry;
      return entry.promise;
    },
  };
}

/**
 * Fingerprint of the credentials a connected handle was built from, per mode.
 * Any change (key rotation, key disappearing, indexer change) makes a cached
 * handle stale: a restarting streaming worker would re-fetch those
 * credentials from the page, so the handle must be freed and rebuilt.
 */
export function credentialIdentity(
  mode: "app" | "shared",
  auth: StreamAuthState,
): string {
  const key = mode === "shared" ? (auth.sharingKeyHex ?? "") : auth.userKeyHex;
  return `${mode}:${auth.indexerUrl}:${key}`;
}

/**
 * Demo-local lifecycle hook: frees the manager's cached SDK as soon as the
 * auth identity changes (logout, key rotation, indexer change), instead of
 * waiting for the next stream request. Returns the unsubscribe.
 */
export function watchAuthIdentity(
  manager: StreamSdkManager,
  store: {
    getState: () => StreamAuthState;
    subscribe: (listener: (state: StreamAuthState) => void) => () => void;
  },
): () => void {
  let previous = authFingerprint(store.getState());
  return store.subscribe((state) => {
    const next = authFingerprint(state);
    if (next !== previous) {
      previous = next;
      manager.free();
    }
  });
}

/**
 * Fingerprint of the whole auth state: with one cached handle, ANY change to
 * the fields above (in either mode) invalidates it.
 */
function authFingerprint(state: StreamAuthState): string {
  return `${state.indexerUrl}:${state.userKeyHex}:${state.sharingKeyHex ?? ""}`;
}

async function connectAppHandle(
  auth: { indexerUrl: string; userKeyHex: string },
  connect: (indexerUrl: string, userKeyHex: string) => Promise<Sdk>,
): Promise<StreamSdkHandle> {
  if (!auth.userKeyHex) {
    throw new Error("no app key configured for streaming");
  }
  const sdk = await connect(auth.indexerUrl, auth.userKeyHex);
  const credentials: AppCredentials = {
    appMeta: APP_META,
    indexerUrl: auth.indexerUrl,
  };
  return { credentials, sdk };
}

async function connectSharedHandle(
  auth: { indexerUrl: string; sharingKeyHex: null | string },
  connect: (indexerUrl: string, seedHex: string) => Promise<SharedSdk>,
): Promise<StreamSdkHandle> {
  if (!auth.sharingKeyHex) {
    throw new Error("no sharing key configured for streaming");
  }
  const sdk = await connect(auth.indexerUrl, auth.sharingKeyHex);
  const credentials: SharedCredentials = {
    indexerUrl: auth.indexerUrl,
    seed: auth.sharingKeyHex,
  };
  return { credentials, sdk };
}

/**
 * Lazily connects an app-key SDK: dynamic-imports the WASM SDK (the chunk is
 * only fetched when a stream is actually requested) and returns the Sdk.
 */
async function defaultConnectAppSdk(
  indexerUrl: string,
  userKeyHex: string,
): Promise<Sdk> {
  const { AppKey, Builder, initSia } =
    await import("@siafoundation/sia-storage");
  await initSia();
  const key = new AppKey(fromHex(userKeyHex));
  const builder = new Builder(indexerUrl, APP_META);
  const sdk = await builder.connected(key);
  builder.free();
  if (!sdk) {
    throw new Error("The Sia app key is not registered with the indexer.");
  }
  return sdk;
}

/**
 * Lazily connects a sharing-key SDK: dynamic-imports the WASM SDK and returns
 * the SharedSdk.
 */
async function defaultConnectSharedSdk(
  indexerUrl: string,
  seedHex: string,
): Promise<SharedSdk> {
  const { initSia, SharedSdk: Sdk } =
    await import("@siafoundation/sia-storage");
  await initSia();
  return Sdk.connect(indexerUrl, seedHex);
}
