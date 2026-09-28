/**
 * Maps the package's ranged ByteSource onto mediabunny's CustomSource so the
 * media library drives its own reads and prefetching. No media-format
 * knowledge lives here; this module only adapts the transport interface (exact
 * ranges, cancellation) to the library's source interface.
 */
import { CustomSource } from 'mediabunny';
import type { ByteSource } from '../transport/byte-source.ts';

export interface MediaLibrarySourceOptions {
  /** Load-generation counter forwarded to every ByteSource read. */
  readonly loadGeneration?: number;
  /** External abort signal forwarded to every ByteSource read. */
  readonly signal?: AbortSignal;
  /**
   * The primary producer wait, awaited before each range read pulls bytes from
   * transport: the bound sink's `waitForBufferedAhead`. Once the real
   * SourceBuffer holds `aheadTargetSeconds` of playable media ahead of the
   * playhead, the mediabunny conversion's reads park, and with them its
   * downloads and remux, until playback advances, the buffer is trimmed, or
   * the pipeline changes state. Undefined (the default) leaves reads unbounded.
   */
  readonly waitForBufferedAhead?: () => Promise<void> | void;
  /**
   * The secondary transient-backlog wait, awaited before each range read pulls
   * bytes: the bound sink's `waitForCapacity`. A SourceBuffer slow to absorb
   * parks the reads once the pipe's queued + in-flight append payload fills
   * the capacity bound, so the worker cannot pile a huge remux backlog ahead
   * of what has actually landed (it does not bound the buffered duration;
   * `waitForBufferedAhead` does that). Undefined (the default) leaves reads
   * unbounded.
   */
  readonly waitForCapacity?: () => Promise<void> | void;
}

/**
 * Wraps `source` as a mediabunny CustomSource. `read` drains the ByteSource
 * stream into one contiguous buffer — mediabunny requires the exact requested
 * byte count back, so a short read is a RangeError. `dispose` forwards to
 * `source.cancel()`.
 */
export function mediaLibrarySource(source: ByteSource, options: MediaLibrarySourceOptions = {}): CustomSource {
  return new CustomSource({
    dispose: () => source.cancel(),
    getSize: () => source.size,
    prefetchProfile: 'fileSystem',
    read: async (start: number, end: number) => {
      const expected = end - start;
      const signal = options.signal;
      // A pre-aborted signal must fail the read before any bytes are requested;
      // the transport only aborts a read after its stream exists.
      if (signal?.aborted) throw signal.reason;
      // The producer parks before this range is requested: the conversion
      // cannot pull (download / remux) the next window until both waits
      // settle, the primary buffered-ahead wait (the real SourceBuffer holds
      // less than the ahead target) and the secondary transient-backlog wait.
      // That backpressure stops the worker from racing media far ahead of the
      // playhead.
      const waits: (() => Promise<void> | void)[] = [];
      if (options.waitForBufferedAhead) waits.push(options.waitForBufferedAhead);
      if (options.waitForCapacity) waits.push(options.waitForCapacity);
      if (waits.length > 0) await Promise.all(waits.map((wait) => Promise.resolve(wait())));
      // A wait can span a teardown: a released wait (aborted pipe) must not
      // let a read pull bytes on a dead pipeline, so the abort is checked
      // again after the waits settle.
      if (signal?.aborted) throw signal.reason;
      const reader = source
        .read({ length: expected, offset: start }, { loadGeneration: options.loadGeneration ?? 0, signal })
        .getReader();
      const chunks: Uint8Array[] = [];
      let received = 0;
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          received += value.byteLength;
        }
      } finally {
        // Leaving the lock in place would pin the transport stream forever.
        reader.releaseLock();
      }
      if (received !== expected) {
        throw new RangeError(`ByteSource delivered ${received} of ${expected} requested bytes`);
      }
      const contiguous = new Uint8Array(expected);
      let offset = 0;
      for (const chunk of chunks) {
        contiguous.set(chunk, offset);
        offset += chunk.byteLength;
      }
      return contiguous;
    },
  });
}
