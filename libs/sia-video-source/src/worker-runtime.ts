/**
 * Worker-entry runtime helpers for `worker.ts` (the
 * `@lumeweb/sia-video-source/worker` entry): the browser-global surfaces the
 * entry consults (default SDK registration, default postMessage, worker MSE
 * options) plus the shared option/host types. The worker entry is a pure
 * session-coordinator host.
 */

import { AppKey, Builder, initSia, SharedSdk } from '@siafoundation/sia-storage';
import type { PlaybackCapabilities } from './capabilities/browser-capabilities.ts';
import { parseSiaShareUrl } from './share-url.ts';
import type { MainToWorkerMessage, WorkerConfig, WorkerToMainMessage } from './protocol.ts';
import {
  type LruChunkCache,
  type SiaObjectLike,
  type SiaSdkLike,
} from './ranged-reader.ts';
import type { LoadPipeline } from './session/load-pipeline.ts';

/** Back-buffer window the worker-side MSE root evicts beyond. */
export const MSE_BACK_BUFFER_SECONDS = 30;

/** Outbound protocol channel (same shape as the coordinator's `PostMessage`). */
export type PostMessage = (message: WorkerToMainMessage, transfer?: Transferable[]) => void;

/**
 * The Sia SDK surface the worker needs: ranged reads plus object resolution.
 * `object` covers the pinned-object (directly known object key) path;
 * `objectFromShareUrl` covers the share-URL path (see `share-url.ts`).
 *
 * Both credential modes satisfy this surface: the app-key `Sdk` resolves a
 * share URL through its own `objectFromShareUrl`, while the keyless
 * `SharedSdk` (ADR 0008) is wrapped by an adapter whose `objectFromShareUrl`
 * routes through `SharedSdk.object(parseSiaShareUrl(url).objectKey)` — the
 * underlying primitive is object-id based, not URL based. The seam is optional
 * so SDKs predating share support can still be injected.
 */
export type SiaVideoSdk = {
  /**
   * Optional release hook for SDKs that hold native resources (WASM
   * instances, WebTransport connections). Invoked whenever a created SDK is
   * discarded without ever being used — superseded by a config change mid-
   * creation or torn down with the worker. Absent on SDKs that need no
   * explicit cleanup.
   */
  dispose?: () => Promise<void> | void;
  object(key: string): Promise<SiaObjectLike>;
  /** Resolves a `sia://` share URL (see `share-url.ts`) into a playable object. */
  objectFromShareUrl?(shareUrl: string): Promise<SiaObjectLike>;
} & SiaSdkLike;

export interface SiaVideoWorkerOptions {
  /** Replaces the default byte chunk cache (capacity-limited LRU). */
  cache?: LruChunkCache;
  /**
   * Capability snapshot for the MSE/codec checks. Defaults to
   * `detectBrowserCapabilities()`; the composition root forwards it so tests
   * and alternative runtimes can inject verdicts without a real MediaSource.
   */
  capabilities?: PlaybackCapabilities;
  /**
   * Composition-root adapter override for the worker entry. When supplied,
   * `installSiaVideoSourceWorker` installs the returned
   * {@link WorkerCompositionHost} (e.g. an injected
   * `createSiaWorkerComposition`-built `SessionCoordinator`) instead of the
   * default worker-side Sia composition root. The options are forwarded so an
   * injected root can reuse `post`, `supportsWorkerMse`, `loadPipeline`, etc.
   */
  createCompositionRoot?: (options: SiaVideoWorkerOptions) => WorkerCompositionHost;
  /**
   * Creates the worker-side `MediaSource` the default Sia composition root
   * opens per load (this library is browser-only, so no Node branch exists).
   * Defaults to `() => new MediaSource()`; injected in tests so a fake
   * (or a real detached MediaSource that never fires `sourceopen`) can stand
   * in for the handle-transfer harness.
   */
  createMediaSource?: () => MediaSource;
  /**
   * Builds the SDK used to resolve and download pinned objects. Defaults to
   * the worker-local registration flow driven by the `HELLO` config plus the
   * decrypted `APP_KEY` seeds; apps that own SDK registration elsewhere inject
   * a resolved `SiaVideoSdk` here. Both seed arguments are the worker's
   * decrypted copies and stay inside this isolate — they must not be forwarded
   * anywhere. The `sharingSeed` argument is new (keyless playback, ADR 0008);
   * injected factories written against the old two-argument shape keep working
   * (unused trailing arguments are ignored).
   */
  createSdk?: (
    config: undefined | WorkerConfig,
    appKeySeed: null | Uint8Array,
    sharingSeed: null | Uint8Array,
  ) => Promise<SiaVideoSdk>;
  /**
   * Injected load-pipeline seam for package-owned tests; production defaults to
   * the real media-library pipeline owned by the composition root.
   */
  loadPipeline?: LoadPipeline;
  /** Overrides message delivery; useful when the caller wires its own channel. */
  post?: PostMessage;
  /** Overrides the worker-MSE capability probe (e.g. for alternative runtimes). */
  supportsWorkerMse?: () => boolean;
}

/**
 * The minimal message-loop surface the worker entry (`worker.ts`) installs.
 * The `SessionCoordinator` built by `createSiaWorkerComposition` satisfies it,
 * so the entry hosts it behind the same validated-message listener without any
 * protocol change (`handleMessage` only ever receives messages the
 * main→worker guard has already narrowed).
 */
export interface WorkerCompositionHost {
  /** Permanently stops the composition root; later messages are ignored. */
  destroy(): void;
  /** Processes one validated main→worker message. */
  handleMessage(message: MainToWorkerMessage): Promise<void>;
}

export async function createDefaultSdk(
  config: undefined | WorkerConfig,
  appKeySeed: null | Uint8Array,
  sharingSeed: null | Uint8Array,
): Promise<SiaVideoSdk> {
  // A seed only exists after a completed APP_KEY handshake (or has been
  // injected via a custom createSdk); config alone can never authenticate.
  const hasAppKey = appKeySeed instanceof Uint8Array && appKeySeed.byteLength > 0;
  const hasSharing = sharingSeed instanceof Uint8Array && sharingSeed.byteLength > 0;
  if (!config || (!hasAppKey && !hasSharing)) {
    throw new Error('No Sia SDK is available: complete the HELLO + APP_KEY handshake or inject createSdk.');
  }

  await initSia();

  // Both credentials present (ADR 0006 app key + ADR 0008 sharing key): route
  // by source kind — pinned object keys resolve through the app-key SDK, share
  // URLs through the sharing-key SDK. NEITHER SDK connects eagerly: each
  // connects on first use of its own route, so a dual-seed app playing only
  // one source kind pays zero connection/WASM-object cost for the credential's
  // SDK it never uses. The single-credential paths below stay eager — with
  // exactly one thing to validate, fail-fast is the cheapest way to surface an
  // unregistered key; when both are held we keep both, but never pay for the
  // one we don't use. Tradeoff: an unregistered app/sharing key no longer
  // fails at createDefaultSdk — it surfaces on the route's first source
  // resolution, which stream-controller's error reporting already handles.
  if (hasSharing && hasAppKey) {
    return createDualSourceSdk(
      () => connectAppKeySdk(config, appKeySeed),
      () => connectSharedSdk(config, sharingSeed),
    );
  }

  // Keyless path (ADR 0008): a sharing-key seed grants read-only access to the
  // objects attached to the key — no app key, no builder, no SSO/approval. The
  // WASM `SharedSdk.connect` expects the seed as a hex string (browser build;
  // Node would take a Buffer), so the decrypted bytes are hex-encoded here,
  // inside this isolate, right at the call site — the plaintext never travels.
  if (hasSharing) {
    return connectSharedSdk(config, sharingSeed);
  }

  return connectAppKeySdk(config, appKeySeed!);
}

export function defaultPost(message: WorkerToMainMessage, transfer?: Transferable[]): void {
  (self as unknown as { postMessage(message: unknown, options?: { transfer?: Transferable[] }): void }).postMessage(
    message,
    transfer?.length ? { transfer } : undefined,
  );
}

/**
 * Exposes the worker's `dispose` cleanup contract on a WASM SDK whose own
 * lifecycle API is `free()`/`[Symbol.dispose]`, so every "abandon this SDK"
 * path releases the native (WASM/WebTransport) resources it holds.
 */
export function withDisposal(sdk: SiaVideoSdk): SiaVideoSdk {
  // Non-mutating: the WASM SDK object (and any shared injected instance) is
  // left untouched; the wrapper forwards to it and exposes the release
  // contract (`dispose` and [Symbol.dispose]) over the SDK's own lifecycle
  // API, with both entry points sharing one release-once latch.
  const underlying = sdk as unknown as {
    [Symbol.dispose]?: () => unknown;
    dispose?: () => unknown;
    free?: () => unknown;
  };
  const nativeDispose = typeof underlying.dispose === 'function' ? underlying.dispose : undefined;
  const nativeSymbolDispose =
    typeof underlying[Symbol.dispose] === 'function' ? underlying[Symbol.dispose] : undefined;
  const nativeFree = typeof underlying.free === 'function' ? underlying.free : undefined;

  // The real @siafoundation/sia-storage SDK aliases [Symbol.dispose] to
  // free(), so running more than one hook would double-release the WASM
  // object. Exactly one hook runs: the SDK's own dispose() when present,
  // otherwise [Symbol.dispose], otherwise free(). Both synthesized entry
  // points share this one latched release, so a caller (or teardown path)
  // that invokes dispose() and then [Symbol.dispose] still releases exactly
  // once.
  const release = nativeDispose ?? nativeSymbolDispose ?? nativeFree;
  let releaseOnce: (() => unknown) | undefined;
  if (release) {
    let released = false;
    releaseOnce = (): unknown => {
      if (released) return undefined;
      released = true;
      return release.call(underlying);
    };
  }

  // Bound forwards and synthesized hooks are memoized so every repeated read
  // of a member yields one stable identity; a fresh bind per access would
  // break WeakMap-keyed use and stored method references.
  const members = new Map<string | symbol, unknown>();

  return new Proxy(sdk, {
    get(target, property) {
      if (members.has(property)) return members.get(property);
      // Both disposal entry points route through the shared latched release:
      // handing out a genuine underlying hook bound would let it fire a second
      // time after the other entry point already released (the sia-storage SDK
      // aliases [Symbol.dispose] to free()). The selected native hook is still
      // the one that runs — just behind the latch.
      if (releaseOnce && (property === 'dispose' || property === Symbol.dispose)) {
        members.set(property, releaseOnce);
        return releaseOnce;
      }
      const value = Reflect.get(target, property, target) as unknown;
      if (typeof value === 'function') {
        const callable = value as (...args: unknown[]) => unknown;
        const bound = callable.bind(target);
        members.set(property, bound);
        return bound;
      }
      return value;
    },
  });
}

/** Lowercase hex encoding of a byte array (the browser `SharedSdk` seed form). */
function bytesToHex(bytes: Uint8Array): string {
  let hex = '';
  for (const byte of bytes) hex += byte.toString(16).padStart(2, '0');
  return hex;
}

/**
 * Builds the app-key SDK (ADR 0006): `Builder.connected` over the registered
 * app key, wrapped in `withDisposal` so the WASM object's lifecycle hook is
 * released exactly once by the worker's disposal contract. Throws when the app
 * key is not registered with the indexer.
 */
async function connectAppKeySdk(config: WorkerConfig, appKeySeed: Uint8Array): Promise<SiaVideoSdk> {
  const builder = new Builder(config.indexerUrl, config.app);
  const appKey = new AppKey(appKeySeed);
  const sdk = await builder.connected(appKey);
  if (!sdk) throw new Error('The Sia app key is not registered with the indexer.');
  return withDisposal(sdk);
}

/**
 * Builds the keyless SDK (ADR 0008): `SharedSdk.connect(indexerUrl, hex(seed))`
 * wrapped in the `SiaVideoSdk` adapter (share URLs route through
 * `SharedSdk.object(objectKey)`). Throws when the sharing key is not
 * registered with the indexer.
 */
async function connectSharedSdk(config: WorkerConfig, sharingSeed: Uint8Array): Promise<SiaVideoSdk> {
  const sharedSdk = await SharedSdk.connect(config.indexerUrl, bytesToHex(sharingSeed));
  if (!sharedSdk) throw new Error('The Sia sharing key is not registered with the indexer.');
  return toSiaVideoSdk(sharedSdk);
}

/**
 * Routing adapter for a connection authenticated by BOTH credentials, built
 * LAZILY from two factories: neither underlying SDK is connected up front.
 * Each source kind resolves through the credential that can read it — plain
 * object keys via the app-key SDK's `object(key)`, share URLs via the keyless
 * SharedSdk's `object(parseSiaShareUrl(url).objectKey)` (the shared key, not
 * the app key, decrypts and funds shared-object downloads) — and each route
 * connects its SDK on FIRST use. What stays intact vs. an eager dual connect:
 * the per-route WeakMap (each resolved object remembers which SDK produced it,
 * so `download` reaches the right payer/decryption without the caller tracking
 * it; untagged objects default to the app-key SDK once a route has connected),
 * the identical `SiaVideoSdk` surface, and the release-once dispose latch.
 *
 * Why lazy: a dual-seed app that plays only one source kind pays zero
 * connection/WASM-object cost for the unused credential's SDK. Single-credential
 * paths (sharing-only, app-key-only) deliberately stay eager in
 * `createDefaultSdk` — with exactly one thing to validate, failing fast on the
 * connection is the cheapest way to surface an unregistered key. That eager
 * fast-fail is a documented tradeoff here: a bogus app/sharing key no longer
 * fails at `createDefaultSdk`; it surfaces on the route's first source
 * resolution, which stream-controller's error reporting already handles.
 *
 * Each route memoizes its in-flight CONNECTION (not just the resolved SDK), so
 * concurrent first calls share one connect. FAILED CREATION IS NEVER CACHED: a
 * rejection clears that route's memo so a later call reattempts — a retry must
 * not inherit a dead promise.
 *
 * Disposal mirrors `withDisposal`'s release-once latch, but releases only the
 * SDKs that actually exist. An in-flight first-use creation is awaited so its
 * SDK is captured and released too; an untouched route is NEVER connected by
 * dispose — cleaning up must not pay the very connection cost this design
 * removes.
 */
function createDualSourceSdk(
  connectAppKey: () => Promise<SiaVideoSdk>,
  connectShared: () => Promise<SiaVideoSdk>,
): SiaVideoSdk {
  const ownerOf = new WeakMap<object, SiaVideoSdk>();
  // Resolved SDKs, captured as each route's connect settles. These are the
  // only "real" SDKs dispose may touch; an untouched route has none.
  let connectedAppKey: SiaVideoSdk | undefined;
  let connectedShared: SiaVideoSdk | undefined;
  // Each route's in-flight/connected connect promise, memoized so concurrent
  // first uses share one connection. Cleared on rejection (never-cache-failed).
  let appKeyPending: Promise<SiaVideoSdk> | undefined;
  let sharedPending: Promise<SiaVideoSdk> | undefined;
  let released = false;

  const surface: SiaVideoSdk & { readonly [Symbol.dispose]: () => void } = {
    dispose: (): Promise<void> => {
      return release();
    },
    download: (object, options) => {
      const owner = ownerOf.get(object);
      if (owner) return owner.download(object, options);
      // Untagged object (not resolved through this surface): default to the
      // app-key SDK — the same fallback the eager dual adapter used. Lazily
      // created means the fallback exists only once a route has connected;
      // resolving a source before downloading always happens first in the
      // byte-source flow, so a connected route is guaranteed by then.
      return (connectedAppKey ?? connectedShared ?? throwUnresolvedObject()).download(object, options);
    },
    object: (key) => connectAppKeyRoute().then((sdk) => tagged(sdk, sdk.object(key))),
    objectFromShareUrl: (shareUrl) =>
      connectSharedRoute().then((sdk) => tagged(sdk, sdk.object(parseSiaShareUrl(shareUrl).objectKey))),
    [Symbol.dispose]: () => {
      void release();
    },
  };
  return surface;

  function connectAppKeyRoute(): Promise<SiaVideoSdk> {
    // `??=` memoizes the in-flight connect so concurrent first calls share one
    // connection (the promise here is never nullish once created).
    appKeyPending ??= connectAppKey().then(
      (sdk) => {
        connectedAppKey = sdk;
        return sdk;
      },
      (error: unknown) => {
        // Never cache a failed connect: clear the memo so a retry reattempts.
        appKeyPending = undefined;
        throw error;
      },
    );
    return appKeyPending;
  }

  function connectSharedRoute(): Promise<SiaVideoSdk> {
    // `??=` memoizes the in-flight connect so concurrent first calls share one
    // connection (the promise here is never nullish once created).
    sharedPending ??= connectShared().then(
      (sdk) => {
        connectedShared = sdk;
        return sdk;
      },
      (error: unknown) => {
        sharedPending = undefined;
        throw error;
      },
    );
    return sharedPending;
  }

  function tagged(sdk: SiaVideoSdk, resolved: Promise<SiaObjectLike> | SiaObjectLike): Promise<SiaObjectLike> {
    // Promise.resolve keeps a synchronous object resolution (tests/fakes) and
    // the real async `Sdk.object` both working.
    return Promise.resolve(resolved).then((object) => {
      ownerOf.set(object, sdk);
      return object;
    });
  }

  function throwUnresolvedObject(): never {
    throw new Error('Cannot download an object this dual-source SDK did not resolve; resolve a source first.');
  }

  function release(): Promise<void> {
    if (released) return Promise.resolve();
    released = true;
    // Await any in-flight first-use creation so its connect settles and the
    // SDK lands in `connectedAppKey`/`connectedShared` before release checks
    // them, then release exactly the SDKs that exist. An untouched route is
    // never connected here — dispose never connects just to release.
    return Promise.allSettled([appKeyPending, sharedPending]).then(() => {
      void Promise.resolve(connectedAppKey?.dispose?.());
      void Promise.resolve(connectedShared?.dispose?.());
    });
  }
}

/**
 * Wraps a WASM `SharedSdk` into the worker's `SiaVideoSdk` seam. `SharedSdk`
 * resolves objects by *id* (`object(id)`) rather than by URL, so the share-URL
 * path is bridged here: `objectFromShareUrl` extracts the `objectKey` via
 * `parseSiaShareUrl` (the same 64-hex id `SharedSdk.object` fetches) and
 * routes through it. `download` is structurally identical to the app-key SDK's
 * (`DownloadOptions`, same `PinnedObject`), so downstream streaming code is
 * untouched. `dispose` comes from `withDisposal` over the WASM lifecycle.
 */
function toSiaVideoSdk(sharedSdk: SharedSdk): SiaVideoSdk {
  const wrapped = withDisposal(sharedSdk);
  return {
    dispose: (): Promise<void> | void => wrapped.dispose?.(),
    download: (object, options) => wrapped.download(object, options),
    object: (key) => wrapped.object(key),
    objectFromShareUrl: (shareUrl) => wrapped.object(parseSiaShareUrl(shareUrl).objectKey),
  };
}
