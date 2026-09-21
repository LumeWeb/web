/**
 * Worker-entry runtime helpers for `worker.ts` (the
 * `@lumeweb/sia-video-source/worker` entry): the browser-global surfaces the
 * entry consults (default SDK registration, default postMessage, worker MSE
 * options) plus the shared option/host types. The worker entry is a pure
 * session-coordinator host.
 */

import { AppKey, Builder, initSia } from '@siafoundation/sia-storage';
import type { PlaybackCapabilities } from './capabilities/browser-capabilities.ts';
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
 * `sharedObject` covers the share-URL path and is optional so SDKs built
 * against WASM versions predating share support can still be injected.
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
  sharedObject?(shareUrl: string): Promise<SiaObjectLike>;
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
   * decrypted `APP_KEY` seed; apps that own SDK registration elsewhere inject
   * a resolved `SiaVideoSdk` here. The seed argument is the worker's decrypted
   * copy and stays inside this isolate — it must not be forwarded anywhere.
   */
  createSdk?: (config: undefined | WorkerConfig, appKeySeed: null | Uint8Array) => Promise<SiaVideoSdk>;
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

export async function createDefaultSdk(config: undefined | WorkerConfig, seed: null | Uint8Array): Promise<SiaVideoSdk> {
  // The seed only exists after a completed APP_KEY handshake (or has been
  // injected via a custom createSdk); config alone can never authenticate.
  if (!config || !(seed instanceof Uint8Array) || seed.byteLength === 0) {
    throw new Error('No Sia SDK is available: complete the HELLO + APP_KEY handshake or inject createSdk.');
  }

  await initSia();

  const builder = new Builder(config.indexerUrl, config.app);
  const appKey = new AppKey(seed);
  const sdk = await builder.connected(appKey);
  if (!sdk) throw new Error('The Sia app key is not registered with the indexer.');
  return withDisposal(sdk);
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
