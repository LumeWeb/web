/**
 * {@link ByteSource} adapter over the Sia ranged-read transport
 * (`RangedReader` + `LruChunkCache` + `ReadBudget`). It composes those pieces
 * rather than reimplementing them: range concurrency, cache replay, stall
 * watchdog, and sequential-window fan-out behavior all live in the underlying
 * transport.
 *
 * Each `read()` wraps a `RangedReader` whose callbacks drain into the returned
 * `ReadableStream`; the shared cache/budget live on this source so consecutive
 * reads re-serve downloaded windows and stay within the dispatch limit.
 */

import {
  type ByteRange,
  type ByteSource,
  ByteSourceEpoch,
  ByteSourceSupersededError,
  emptyByteStream,
  type ReadOptions,
  supersededStream,
  toSupersededError,
} from './byte-source.ts';
import {
  LruChunkCache,
  objectSize,
  RangedReader,
  type ReadBudget,
  type SiaObjectLike,
  type SiaSdkLike,
} from '../ranged-reader.ts';
import { isSiaShareUrl, parseSiaShareUrl } from '../share-url.ts';

/**
 * Construction options shared across every source one factory creates. A
 * caller that constructs the factory once and reuses it gets one shared
 * budget/cache across all loads (mirrors the worker's per-core budget/cache).
 */
export interface SiaByteSourceFactoryOptions {
  /** Shared bounded-dispatch permit (defaults to no cap). */
  budget?: ReadBudget;
  /** Shared exact-window LRU cache (defaults to a fresh per-source one). */
  cache?: LruChunkCache;
  /** Max bytes per chunk handed to the returned stream. */
  chunkSize?: number;
  /** Forwarded to every `Sdk.download` call. */
  downloadOptions?: { maxBufferedChunks?: number };
}

export interface SiaByteSourceOptions {
  /** Shared bounded-dispatch permit; defaults to no cap. */
  budget?: ReadBudget;
  /** Shared exact-window LRU cache; defaults to a fresh per-source cache. */
  cache?: LruChunkCache;
  /** Max bytes per chunk handed to the returned stream. */
  chunkSize?: number;
  /** Forwarded to every `Sdk.download` call. */
  downloadOptions?: { maxBufferedChunks?: number };
  /** Pinned-object handle (or fake) whose payload the source reads. */
  object: SiaObjectLike;
  /** Sia SDK (or fake) that serves ranged downloads. */
  sdk: SiaSdkLike;
}

/**
 * The Sia SDK surface a `ByteSourceFactory` needs to resolve a SOURCE `src`
 * locator: a pinned object key (`object`) or a Sia share URL
 * (`sharedObject`). `sharedObject` is optional so SDKs predating share
 * support can still be injected; resolving a share URL without it rejects
 * with a descriptive error.
 */
export interface SiaByteSourceSdk extends SiaSdkLike {
  object(key: string): Promise<SiaObjectLike>;
  sharedObject?(shareUrl: string): Promise<SiaObjectLike>;
}

export class SiaByteSource implements ByteSource {
  get size(): number {
    return objectSize(this.#options.object);
  }

  readonly #cache: LruChunkCache;
  readonly #epochs = new ByteSourceEpoch();
  readonly #options: SiaByteSourceOptions;

  constructor(options: SiaByteSourceOptions) {
    this.#options = options;
    this.#cache = options.cache ?? new LruChunkCache();
  }

  cancel(reason?: unknown): void {
    this.#epochs.reset(reason);
  }

  read(range: ByteRange, options: ReadOptions): ReadableStream<Uint8Array> {
    const epoch = options.epoch;
    let superseded = false;
    let settled = false;
    let controllerRef: null | ReadableStreamDefaultController<Uint8Array> = null;
    let readerRef: null | RangedReader = null;

    // `settle` references `handle` and vice versa; both are only invoked after
    // `read()` finishes building its stream, so neither forward reference is
    // ever observed before the other is initialized.
    const handle = {
      stop: (reason?: unknown) => {
        if (settled) return;
        superseded = true;
        readerRef?.stop();
        readerRef = null;
        const controller = controllerRef;
        if (controller) {
          try {
            controller.error(toSupersededError(reason));
          } catch {
            /* already errored/closed */
          }
        }
        settle();
      },
    };

    if (!this.#epochs.open(epoch, handle)) {
      return supersededStream(new ByteSourceSupersededError(`stale epoch ${epoch}`));
    }

    const size = this.size;
    const start = Math.max(0, Math.floor(range.offset));
    const want = Math.max(0, Math.floor(range.length));
    const end = Math.min(size, start + want);

    if (end <= start) {
      // Beyond EOF: an empty stream, and no SDK download is opened at all.
      this.#epochs.settle(handle);
      return emptyByteStream();
    }

    const signal = options.signal;
    const onAbort = () => handle.stop(signal?.reason);
    signal?.addEventListener('abort', onAbort, { once: true });

    const settle = () => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener('abort', onAbort);
      this.#epochs.settle(handle);
    };

    const { budget, chunkSize, downloadOptions, object, sdk } = this.#options;
    const cache = this.#cache;

    return new ReadableStream<Uint8Array>({
      cancel: () => {
        handle.stop();
      },
      start: (controller) => {
        controllerRef = controller;
        if (superseded) {
          try {
            controller.error(toSupersededError());
          } catch {
            /* already errored */
          }
          settle();
          return;
        }
        const reader = new RangedReader({
          budget,
          cache,
          chunkSize,
          downloadOptions,
          object,
          onChunk: (chunk) => {
            if (superseded || settled) return;
            try {
              controller.enqueue(chunk);
            } catch {
              /* cancelled mid-delivery: nothing may deliver now */
            }
          },
          onComplete: () => {
            if (superseded || settled) return;
            try {
              controller.close();
            } catch {
              /* already closed/cancelled */
            }
            settle();
          },
          onError: (error) => {
            if (superseded || settled) return;
            try {
              controller.error(error);
            } catch {
              /* already errored */
            }
            settle();
          },
          sdk,
          stallTimeoutMs: options.stallTimeoutMs,
          windowBytes: options.windowBytes,
        });
        readerRef = reader;
        reader.start(start, end - start);
      },
    });
  }
}

/**
 * `ByteSourceFactory` seam: resolves one SOURCE `src` locator into a
 * `SiaByteSource` over the injected SDK. Plain `src` values are pinned object
 * keys; `sia://` (or https alias) share URLs are parsed and resolved through
 * `sdk.sharedObject(fetchForm)`, exactly like the worker's `#resolveObject`.
 * The factory does not rewrite `RangedReader`/`LruChunkCache`/`ReadBudget`
 * internals, and preserves the SDK's existing share URL form.
 */
export function createSiaByteSourceFactory(
  sdk: SiaByteSourceSdk,
  options: SiaByteSourceFactoryOptions = {},
): (src: string) => Promise<ByteSource> {
  // One shared exact-window cache per factory, so every source it creates
  // replays already-downloaded windows across loads (mirrors the worker's
  // per-core cache). An explicit caller-supplied cache still wins.
  const cache = options.cache ?? new LruChunkCache();
  return async (src: string): Promise<ByteSource> => {
    const object = await resolveSiaObject(sdk, src);
    return new SiaByteSource({ ...options, cache, object, sdk });
  };
}

async function resolveSiaObject(sdk: SiaByteSourceSdk, src: string): Promise<SiaObjectLike> {
  if (!isSiaShareUrl(src)) return sdk.object(src);
  const share = parseSiaShareUrl(src);
  if (!sdk.sharedObject) {
    throw new Error('the injected Sia SDK does not support shared-object URLs');
  }
  return sdk.sharedObject(share.fetchForm);
}
