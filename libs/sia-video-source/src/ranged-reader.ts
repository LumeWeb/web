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
   * reader waits for a free permit before opening its SDK download, so every
   * reader sharing a budget — the independent concurrent reads mediabunny can
   * issue share one — is guaranteed never to exceed the budget's concurrency
   * limit. Unset (the default) opens downloads without a cap.
   */
  budget?: ReadBudget;
  cache?: LruChunkCache;
  /** Max bytes per chunk handed to `onChunk`; larger stream chunks are split. */
  chunkSize?: number;
  /** Forwarded to the one `Sdk.download` call. */
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

/**
 * The slice of the Sia SDK the reader depends on. `download` may resolve
 * either synchronously (the app-key and keyless SDKs) or as a promise (the
 * lazy dual-seed adapter connects an untagged download's app-key route on
 * demand, see `worker-runtime.ts`), so callers await the result before
 * reading — a plain `ReadableStream` passes through unchanged.
 *
 * Once resolved, the caller owns the stream until it is read to EOF or
 * cancelled, and adopting also means releasing on exit: the reader cancels any
 * stream it stops owning instead of dropping it open (adopt-or-cancel). That
 * rule holds on every exit path — superseded/stale runs, `stop()`, the stall
 * watchdog, exact-length completion, and a chunk-error throw — so the SDK's
 * WebTransport sessions (held until EOF or cancel) are always released
 * deterministically, never left to a nondeterministic GC.
 */
export interface SiaSdkLike {
  download(
    object: SiaObjectLike,
    options?: {
      length?: number;
      maxBufferedChunks?: number;
      offset?: number;
      onShardDownloaded?: (progress: ShardProgress) => void;
    }
  ): Promise<ReadableStream<Uint8Array>> | ReadableStream<Uint8Array>;
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
  // Per-run supersede counter; `start()`/`stop()` bump it so an abandoned run
  // can never clobber the streams of the run that replaced it.
  #loadGeneration = 0;
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
    const loadGeneration = ++this.#loadGeneration;
    void this.#run(loadGeneration);
  }

  /** Cancels the in-flight stream; the cache survives for later re-reads. */
  stop(): void {
    this.#loadGeneration++;
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
   * decided by `#run`'s load-generation guard. The abort side effects are
   * load-generation-scoped: a late watchdog can never cancel a newer run's
   * active streams.
   */
  #readWithStallWatchdog(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    loadGeneration: number,
    timeoutMs: number | undefined,
  ): Promise<ReadableStreamReadResult<Uint8Array>> {
    if (timeoutMs === undefined) return reader.read();

    return new Promise<ReadableStreamReadResult<Uint8Array>>((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.#loadGeneration === loadGeneration) {
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

  async #run(loadGeneration: number): Promise<void> {
    const { budget, chunkSize, object, onComplete, onError, sdk, stallTimeoutMs } = this.#options;

    try {
      // Replay contiguous cached windows before the network read; a listener
      // sees one seamless delivery either way.
      while (this.#loadGeneration === loadGeneration) {
        const cached = this.#cache.takeAt(this.#position);
        if (cached === undefined) break;
        const remaining = this.#rangeEnd === null ? cached.byteLength : this.#rangeEnd - this.#position;
        if (remaining <= 0) break;
        const delivered = cached.subarray(0, remaining);
        this.#emitChunk(delivered, this.#position, chunkSize);
        this.#position += delivered.byteLength;
        if (delivered.byteLength < cached.byteLength) break;
      }

      if (this.#loadGeneration !== loadGeneration) return;

      const size = objectSize(object);
      const end = Math.min(this.#rangeEnd ?? size, size);
      const start = Math.min(this.#position, size);
      if (start >= end) {
        onComplete?.();
        return;
      }

      // A mitigation permit held from just before the SDK download until that
      // read ends (delivered, aborted, or abandoned). Released exactly once in
      // the `finally`, so a stale or stalled run can never leak its slot.
      let release: (() => void) | undefined;
      try {
        // Hold the shared budget so concurrent library reads — mediabunny can
        // issue independent overlapping reads — can never open more SDK
        // downloads at once than the budget allows; see {@link ReadBudget}.
        if (budget) {
          release = await budget.acquire();
          // A seek/stop arrived while this run waited for its permit: abandon
          // (the `finally` releases the just-acquired slot).
          if (this.#loadGeneration !== loadGeneration) return;
        }

        // One SDK download serves the whole remaining [start, end) range with
        // exact offset/length; the reader never tiles a read across requests.
        // A lazy dual-seed SDK may resolve an untagged download through a
        // connect-on-demand route (see worker-runtime.ts), which yields a
        // promise; a settled stream is used synchronously so `active` reflects
        // the in-flight read without an extra microtask.
        const resolved = sdk.download(object, {
          length: end - start,
          offset: start,
          ...this.#options.downloadOptions,
        });
        const stream = resolved instanceof Promise ? await resolved : resolved;
        // A stale async (connect-on-demand) download that resolves after a seek
        // landed would otherwise be dropped still open, leaking its
        // WebTransport sessions (the SDK holds them until EOF or cancel);
        // adopt-or-cancel: cancel it. The cancel is fire-and-forget so a
        // stalled WASM cancel never blocks this run's unwinding and permit
        // release.
        if (this.#loadGeneration !== loadGeneration) {
          void stream.cancel().catch(() => { /* empty */ });
          return;
        }
        this.#stream = stream;
        const reader = stream.getReader();
        this.#reader = reader;

        while (this.#loadGeneration === loadGeneration && this.#position < end) {
          const result = await this.#readWithStallWatchdog(reader, loadGeneration, stallTimeoutMs);
          if (this.#loadGeneration !== loadGeneration) break;
          if (result.done) {
            // A download that closes before the range end is data loss, not a
            // clean stop: exact range reads must deliver every requested byte,
            // so surface the short read and let the caller's retry policy
            // recover rather than silently skipping bytes.
            throw new Error('Sia SDK read ended before the requested range was delivered');
          }
          const remaining = end - this.#position;
          const delivered = result.value.subarray(0, remaining);
          this.#emitChunk(delivered, this.#position, chunkSize);
          this.#position += delivered.byteLength;
          if (delivered.byteLength < result.value.byteLength) break;
        }

        if (this.#loadGeneration === loadGeneration) onComplete?.();
      } finally {
        if (release) release();
        // A cancelled run can settle after its replacement already assigned
        // fresh `#reader`/`#stream` references — only the current load generation may
        // touch them, or the replacement's reader would be orphaned and later
        // seeks would find no active reader. While this run still owns the
        // refs, cancel before clearing so a stream is never dropped open: on a
        // throw the wasm-bindgen slab-recovery tasks ahead of the read head
        // keep running until a nondeterministic GC, and on exact-length
        // completion the pull source may never have self-closed. cancel() is
        // the only deterministic abort — it is fire-and-forget (never delays
        // the permit release above) and a no-op on an already-closed stream.
        if (this.#loadGeneration === loadGeneration) {
          void this.#reader?.cancel().catch(() => { /* empty */ });
          this.#reader = null;
          this.#stream = null;
        }
      }
    } catch (error) {
      if (this.#loadGeneration === loadGeneration) onError?.(error);
    }
  }
}

/**
 * Bounded dispatcher for SDK reads. A shared budget caps how many
 * `Sdk.download()` streams may be open at once across every reader that shares
 * it. It never splits a range: each concurrent read acquires one permit and
 * keeps its own exact offset/length.
 *
 * The underlying Sia SDK opens one or more WebTransport sessions the moment
 * `download()` is called (one per slab/renter touched by the requested range,
 * bounded only by the download's `maxBufferedChunks`) and holds them until the
 * returned stream is read to EOF or cancelled — or, for a stale async download
 * that resolves after its run was superseded, until `RangedReader` cancels it
 * (adopt-or-cancel), so a dropped-open stream can never leak its sessions.
 * Chromium caps *pending*
 * sessions at 64: too many simultaneous downloads — as when mediabunny issues
 * an overlapping batch of independent reads — exhaust that budget and later
 * reads stall forever with `Too many pending WebTransport sessions (64)`. This
 * permit serializes stream creation so the SDK never holds more than `limit`
 * downloads' worth of sessions at once, and `RangedReader`'s stall watchdog
 * aborts (and releases) a permit when a read never delivers. The SDK exposes
 * no timeout or concurrency option itself, which is why the dispatch limiter
 * lives here, around the SDK.
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
