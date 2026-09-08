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
  start(offset = 0): void {
    this.stop();
    this.#position = offset;
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

  async #run(epoch: number): Promise<void> {
    const { chunkSize, object, onComplete, onError, sdk } = this.#options;

    try {
      // Replay contiguous cached windows before the network read; a listener
      // sees one seamless delivery either way.
      while (this.#epoch === epoch) {
        const cached = this.#cache.takeAt(this.#position);
        if (cached === undefined) break;
        this.#emitChunk(cached, this.#position, chunkSize);
        this.#position += cached.byteLength;
      }

      if (this.#epoch !== epoch) return;

      const size = objectSize(object);
      const start = Math.min(this.#position, size);
      const length = Math.max(0, size - start);
      if (length === 0) {
        onComplete?.();
        return;
      }

      const stream = sdk.download(object, { length, offset: start, ...this.#options.downloadOptions });
      this.#stream = stream;
      const reader = stream.getReader();
      this.#reader = reader;

      while (this.#epoch === epoch) {
        const result = await reader.read();
        if (this.#epoch !== epoch) break;
        if (result.done) {
          onComplete?.();
          return;
        }
        this.#emitChunk(result.value, this.#position, chunkSize);
        this.#position += result.value.byteLength;
      }
    } catch (error) {
      if (this.#epoch === epoch) onError?.(error);
    } finally {
      // A cancelled run can settle after its replacement already assigned
      // fresh `#reader`/`#stream` references — only the current epoch may
      // clear them, or the replacement's reader would be orphaned and later
      // seeks would find no active reader.
      if (this.#epoch === epoch) {
        this.#reader = null;
        this.#stream = null;
      }
    }
  }
}

/** Object payload size in bytes, from the local slab map. */
export function objectSize(object: SiaObjectLike): number {
  return object.slabs().reduce((total, slab) => total + slab.length, 0);
}
