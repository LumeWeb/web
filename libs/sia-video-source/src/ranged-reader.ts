/**
 * Seek-aware read loop over the Sia SDK's ranged download API
 * (`Sdk.download(object, { offset, length })` → `ReadableStream`).
 *
 * A seek cancels the in-flight stream (the SDK aborts its WebTransport shard
 * recovery on drop) and starts a fresh download from the target byte offset;
 * a small LRU chunk cache re-serves recently delivered ranges so small
 * re-reads and short backward seeks never touch the network. The Sia SDK and
 * pinned-object handle are injected, which keeps this module testable and
 * lets the caller own SDK registration.
 */

import type { Slab } from '@siafoundation/sia-storage';

export interface RangedReaderOptions {
  /**
   * Shared bounded-dispatch permit (see {@link ReadBudget}). When set, the
   * reader waits for a free permit before opening each SDK download, so every
   * reader sharing a budget — the worker's probe reads and its indexed
   * lookahead reads share one — is guaranteed never to exceed the budget's
   * concurrency limit. Unset (the default) opens downloads without a cap.
   */
  budget?: ReadBudget;
  cache?: LruChunkCache;
  /** Max bytes per chunk handed to `onChunk`; larger stream chunks are split. */
  chunkSize?: number;
  /** Forwarded to every `Sdk.download` call. */
  downloadOptions?: { maxBufferedChunks?: number };
  object: SiaObjectLike;
  /** Called with delivered bytes and their absolute byte offset in the object. */
  onChunk: (chunk: Uint8Array, position: number) => void;
  onComplete?: () => void;
  onError?: (error: unknown) => void;
  sdk: SiaSdkLike;
  /**
   * Stall watchdog: maximum milliseconds a single SDK read may yield no bytes
   * before the stream is aborted and `onError` surfaces a descriptive error.
   * A real SDK read that stalls forever (e.g. every WebTransport session is
   * pending and the browser drops new ones) otherwise hangs the caller and the
   * media element stays `seeking` indefinitely. Unset (undefined) disables the
   * watchdog, preserving the original no-timeout behavior.
   */
  stallTimeoutMs?: number;
  /**
   * Maximum bytes per SDK download. When set, the requested range is fetched
   * as sequential bounded windows that tile it exactly — each a small
   * `Sdk.download(object, { offset, length })` — instead of one download over
   * the whole range. A far-seek range read fans out into one WebTransport
   * session per slab/renter the range touches the moment `download()` is
   * called, and Chromium caps pending sessions at ~64: a single wide read can
   * exhaust that budget and stall, while bounded windows keep the per-download
   * fan-out (and the read-ahead that `maxBufferedChunks` allows) small and let
   * a stalled window be aborted and retried independently. Unset (the
   * default) preserves the original single-download behavior.
   */
  windowBytes?: number;
}

/** Narrowest shape of the `onShardDownloaded` payload the SDK forwards. */
export type ShardProgress = unknown;

/**
 * The slice of a `PinnedObject` the reader depends on. `slabs()` is local
 * metadata — range → slab math costs no I/O — and the sum of slab lengths is
 * the object size.
 */
export interface SiaObjectLike {
  id(): string;
  size(): number;
  slabs(): Slab[];
}

/** The slice of the Sia SDK the reader depends on. */
export interface SiaSdkLike {
  download(
    object: SiaObjectLike,
    options?: {
      length?: number;
      maxBufferedChunks?: number;
      offset?: number;
      onShardDownloaded?: (progress: ShardProgress) => void;
    }
  ): ReadableStream<Uint8Array>;
}

/**
 * Exact-window LRU cache. Keyed by `(offset, length)` pairs as delivered, so
 * hit rates follow the download window shape: good for re-reads of, and
 * backward seeks within, buffered history; a miss otherwise.
 */
export class LruChunkCache {
  get size(): number {
    return this.#entries.size;
  }
  readonly #capacity: number;
  readonly #entries = new Map<string, Uint8Array>();

  /** offset → length, for finding a window that starts at a given position. */
  readonly #offsets = new Map<number, number>();

  /** @param capacity - Maximum number of chunks held; oldest evicted first. */
  constructor(capacity = 64) {
    this.#capacity = Math.max(1, capacity);
  }

  clear(): void {
    this.#entries.clear();
    this.#offsets.clear();
  }

  /** Returns the cached bytes spanning `[offset, offset + length)`, refreshing recency. */
  get(offset: number, length: number): Uint8Array | undefined {
    const key = `${offset}:${length}`;
    const bytes = this.#entries.get(key);
    if (bytes === undefined) return undefined;
    this.#entries.delete(key);
    this.#entries.set(key, bytes);
    return bytes;
  }

  /** Stores bytes for one delivered window, evicting the least-recent chunk. */
  put(offset: number, length: number, bytes: Uint8Array): void {
    const previous = this.#offsets.get(offset);
    if (previous !== undefined) {
      // A re-put with a different length replaces the offset index; purge the
      // stale twin so the cache never accumulates unreachable entries.
      this.#offsets.delete(offset);
      this.#entries.delete(`${offset}:${previous}`);
    }
    const key = `${offset}:${length}`;
    if (this.#entries.has(key)) {
      this.#entries.delete(key);
      this.#offsets.delete(offset);
    }
    this.#entries.set(key, bytes);
    this.#offsets.set(offset, length);

    while (this.#entries.size > this.#capacity) {
      const oldest = this.#entries.keys().next().value;
      if (oldest === undefined) break;
      const [start, end] = oldest.split(':');
      this.#entries.delete(oldest);
      // The evicted offset may already index a newer replacement window; only
      // the index entry belonging to this evicted window may go.
      if (this.#offsets.get(Number(start)) === Number(end)) {
        this.#offsets.delete(Number(start));
      }
      void end;
    }
  }

  /** Returns the window cached at exactly `offset`, if one starts there. Dropping the index also drops the cached twin itself; a later re-put at the same offset then has no orphan to strand. */
  takeAt(offset: number): Uint8Array | undefined {
    const length = this.#offsets.get(offset);
    if (length === undefined) return undefined;
    const bytes = this.get(offset, length);
    if (bytes === undefined) {
      this.#offsets.delete(offset);
      return undefined;
    }
    this.#offsets.delete(offset);
    this.#entries.delete(`${offset}:${length}`);
    return bytes;
  }
}

/**
 * Owns one logical playback position. `seek(offset)` cancels whatever read is
 * in flight and restarts from the new offset; delivered chunks are cached
 * first, replayed while they chain contiguously, and the network read resumes
 * from the first cache miss.
 */
export class RangedReader {
  /** Whether a network read is currently in flight. */
  get active(): boolean {
    return this.#reader !== null;
  }
  /** Absolute byte offset this reader is positioned at. */
  get position(): number {
    return this.#position;
  }
  /** Object payload size in bytes. */
  get size(): number {
    return objectSize(this.#options.object);
  }
  readonly #cache: LruChunkCache;
  #epoch = 0;
  readonly #options: RangedReaderOptions;

  #position = 0;
  #rangeEnd: null | number = null;

  #reader: null | ReadableStreamDefaultReader = null;

  #stream: null | ReadableStream = null;

  constructor(options: RangedReaderOptions) {
    this.#options = options;
    this.#cache = options.cache ?? new LruChunkCache();
  }

  /**
   * Seek: aborts the current stream and re-downloads from `offset`.
   *
   * @param offset - Absolute byte offset in the object.
   */
  seek(offset: number): void {
    this.start(Math.max(0, offset));
  }

  /**
   * (Re)starts delivery at `offset`. Any in-flight download is aborted, and
   * cached windows chaining forward from `offset` are replayed before resuming
   * from the network.
   */
  start(offset = 0, length?: number): void {
    this.stop();
    this.#position = offset;
    this.#rangeEnd = length === undefined ? null : Math.max(offset, offset + length);
    const epoch = ++this.#epoch;
    void this.#run(epoch);
  }

  /** Cancels the in-flight stream; the cache survives for later re-reads. */
  stop(): void {
    this.#epoch++;
    const reader = this.#reader;
    const stream = this.#stream;
    this.#reader = null;
    this.#stream = null;
    if (reader) void reader.cancel().catch(() => { /* empty */ });
    if (stream) void stream.cancel().catch(() => { /* empty */ });
  }

  #emitChunk(bytes: Uint8Array, position: number, maxChunkSize?: number): void {
    if (bytes.byteLength <= (maxChunkSize ?? Infinity)) {
      this.#cache.put(position, bytes.byteLength, bytes);
      this.#options.onChunk(bytes, position);
      return;
    }
    for (let offset = 0; offset < bytes.byteLength; offset += maxChunkSize!) {
      const slice = bytes.subarray(offset, Math.min(offset + maxChunkSize!, bytes.byteLength));
      this.#cache.put(position + offset, slice.byteLength, slice);
      this.#options.onChunk(slice, position + offset);
    }
  }

  /**
   * One `reader.read()`, raced against a stall watchdog. When no bytes arrive
   * within `stallTimeoutMs` the stalled stream is aborted (freeing its SDK
   * sessions) and the promise rejects with a descriptive error, so a
   * WebTransport-session-exhausted read surfaces through `onError` instead of
   * hanging the caller forever. The watchdog always settles the awaited
   * promise — even for an already-superseded run — so the run unwinds and
   * releases its budget permit; whether an error is actually emitted is
   * decided by `#run`'s epoch guard. The abort side effects are epoch-scoped:
   * a late watchdog can never cancel a newer run's active streams.
   */
  #readWithStallWatchdog(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    epoch: number,
    timeoutMs: number | undefined,
  ): Promise<ReadableStreamReadResult<Uint8Array>> {
    if (timeoutMs === undefined) return reader.read();

    return new Promise<ReadableStreamReadResult<Uint8Array>>((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.#epoch === epoch) {
          this.#reader?.cancel().catch(() => { /* empty */ });
          this.#stream?.cancel().catch(() => { /* empty */ });
          this.#reader = null;
          this.#stream = null;
        }
        reject(new Error(`Sia SDK read stalled: no bytes for ${timeoutMs}ms`));
      }, timeoutMs);
      reader.read().then(
        (result) => {
          clearTimeout(timer);
          resolve(result);
        },
        (error: unknown) => {
          clearTimeout(timer);
          reject(error instanceof Error ? error : new Error(String(error)));
        },
      );
    });
  }

  async #run(epoch: number): Promise<void> {
    const { budget, chunkSize, object, onComplete, onError, sdk, stallTimeoutMs, windowBytes } = this.#options;

    try {
      // Replay contiguous cached windows before the network read; a listener
      // sees one seamless delivery either way.
      while (this.#epoch === epoch) {
        const cached = this.#cache.takeAt(this.#position);
        if (cached === undefined) break;
        const remaining = this.#rangeEnd === null ? cached.byteLength : this.#rangeEnd - this.#position;
        if (remaining <= 0) break;
        const delivered = cached.subarray(0, remaining);
        this.#emitChunk(delivered, this.#position, chunkSize);
        this.#position += delivered.byteLength;
        if (delivered.byteLength < cached.byteLength) break;
      }

      if (this.#epoch !== epoch) return;

      const size = objectSize(object);
      const end = Math.min(this.#rangeEnd ?? size, size);

      // Sequential bounded windows. With `windowBytes` set, the requested
      // range is fetched as a series of small `Sdk.download` calls that tile
      // it exactly instead of one wide download: a single far-seek range read
      // would otherwise fan out over many renter/slab WebTransport sessions at
      // once and exhaust Chromium's ~64 pending-session cap, while each small
      // window bounds that fan-out and stalls/aborts independently. Unset (the
      // default) preserves the original single-download behavior for the
      // non-indexed (throughput) path.
      while (this.#epoch === epoch) {
        const start = Math.min(this.#position, size);
        if (start >= end) {
          onComplete?.();
          return;
        }
        const windowEnd = windowBytes === undefined ? end : Math.min(end, start + windowBytes);
        if (windowEnd <= start) {
          onComplete?.();
          return;
        }

        // A mitigation permit held from just before each window's SDK download
        // until that window's read ends (delivered, aborted, or abandoned).
        // Released exactly once in the window's `finally`, so a stale or
        // stalled run can never leak its slot, and the next window cannot open
        // its download (and its WebTransport sessions) until this one drained.
        let release: (() => void) | undefined;
        try {
          // Hold the shared budget so a far-seek's lookahead — and any read
          // that replaces a stalled one — can never open more SDK downloads at
          // once than the budget allows; see {@link ReadBudget} for why that
          // bounds the browser's pending WebTransport sessions.
          if (budget) {
            release = await budget.acquire();
            // A seek/stop arrived while this run waited for its permit: abandon
            // (the `finally` releases the just-acquired slot).
            if (this.#epoch !== epoch) return;
          }

          const stream = sdk.download(object, {
            length: windowEnd - start,
            offset: start,
            ...this.#options.downloadOptions,
          });
          this.#stream = stream;
          const reader = stream.getReader();
          this.#reader = reader;

          while (this.#epoch === epoch && this.#position < windowEnd) {
            const result = await this.#readWithStallWatchdog(reader, epoch, stallTimeoutMs);
            if (this.#epoch !== epoch) break;
            if (result.done) {
              // Window reads must tile the requested range exactly: a bounded
              // download that closes before the range end is data loss, not a
              // clean stop, so surface it and let the caller's retry policy
              // (the worker re-issues the segment on stall) recover rather than
              // silently skipping bytes. The un-windowed path keeps its
              // historical done-means-complete semantics.
              if (windowBytes !== undefined && this.#position < end) {
                throw new Error('Sia SDK read ended before the requested range was delivered');
              }
              onComplete?.();
              return;
            }
            const remaining = windowEnd - this.#position;
            const delivered = result.value.subarray(0, remaining);
            this.#emitChunk(delivered, this.#position, chunkSize);
            this.#position += delivered.byteLength;
            if (delivered.byteLength < result.value.byteLength) {
              // The window filled exactly while the stream's chunk overshot it;
              // the overflow belongs to the next window, which re-downloads it.
              // (Unreachable when `windowBytes` is undefined, since then
              // `windowEnd === end` and the loop also ends by position.)
              break;
            }
          }
        } finally {
          if (release) release();
          // A cancelled run can settle after its replacement already assigned
          // fresh `#reader`/`#stream` references — only the current epoch may
          // clear them, or the replacement's reader would be orphaned and
          // later seeks would find no active reader.
          if (this.#epoch === epoch) {
            this.#reader = null;
            this.#stream = null;
          }
        }

        // A seek/stop abandoned this run mid-window: the replacement owns
        // delivery from here; never start another window under the stale epoch.
        if (this.#epoch !== epoch) return;
      }
    } catch (error) {
      if (this.#epoch === epoch) onError?.(error);
    }
  }
}

/**
 * Bounded dispatcher for SDK reads. A shared budget caps how many
 * `Sdk.download()` streams may be open at once across every reader that
 * shares it, so a far seek's indexed lookahead can never burst more downloads
 * than the budget allows.
 *
 * The underlying Sia SDK opens one or more WebTransport sessions the moment
 * `download()` is called (one per slab/renter touched by the requested range,
 * bounded only by the download's `maxBufferedChunks`) and holds them until the
 * returned stream is read to EOF or cancelled. Chromium caps *pending*
 * sessions at 64: a wide-range download after a far seek exhausts that budget
 * and later reads stall forever with `Too many pending WebTransport sessions
 * (64)`. This permit serializes stream creation so the SDK never holds more than
 * `limit` downloads' worth of sessions at once, and `RangedReader`'s stall
 * watchdog aborts (and releases) a permit when a read never delivers. The SDK
 * exposes no timeout or concurrency option itself, which is why the dispatch
 * limiter lives here, around the SDK.
 */
export class ReadBudget {
  /** Number of permits currently held by active reads. */
  get inFlight(): number {
    return this.#inFlight;
  }
  /** The configured concurrency cap. */
  get limit(): number {
    return this.#limit;
  }
  #inFlight = 0;
  readonly #limit: number;
  #waiters: (() => void)[] = [];

  /** @param limit - Maximum concurrent SDK downloads; floored to ≥ 1. */
  constructor(limit = 1) {
    this.#limit = Math.max(1, Math.floor(limit));
  }

  /**
   * Resolves once a permit is free. The returned function releases the permit;
   * call it exactly once when the read it capped has ended (delivered, aborted,
   * or abandoned). Waits are FIFO so callers cannot starve each other.
   */
  acquire(): Promise<() => void> {
    if (this.#inFlight < this.#limit) {
      this.#inFlight++;
      return Promise.resolve(() => this.#release());
    }
    return new Promise((resolve) => {
      this.#waiters.push(() => {
        this.#inFlight++;
        resolve(() => this.#release());
      });
    });
  }

  #release(): void {
    this.#inFlight--;
    const next = this.#waiters.shift();
    next?.();
  }
}

/** Object payload size in bytes, from the local slab map. */
export function objectSize(object: SiaObjectLike): number {
  return object.slabs().reduce((total, slab) => total + slab.length, 0);
}
