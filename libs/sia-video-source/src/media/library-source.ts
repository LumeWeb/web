/**
 * Maps the package's ranged ByteSource onto mediabunny's CustomSource so the
 * media library drives its own reads and prefetching. No media-format knowledge
 * lives here; this module only adapts the transport contract (exact ranges,
 * cancellation) to the library's source contract.
 */
import { CustomSource } from 'mediabunny';
import type { ByteSource } from '../transport/byte-source.ts';

export interface MediaLibrarySourceOptions {
  /** Load-generation counter forwarded to every ByteSource read. */
  readonly loadGeneration?: number;
  /** External abort signal forwarded to every ByteSource read. */
  readonly signal?: AbortSignal;
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
    prefetchProfile: 'network',
    read: async (start: number, end: number) => {
      const expected = end - start;
      const signal = options.signal;
      // A pre-aborted signal must fail the read before any bytes are requested;
      // the transport only aborts a read after its stream exists.
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
