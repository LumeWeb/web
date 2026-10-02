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
 *
 * Reads are admitted one at a time per adapter instance: mediabunny's
 * orchestrator runs up to two workers in parallel, and under the network
 * prefetch profile each expands its window up to 8 MiB. The buffered-ahead
 * and capacity gates are consulted once, at read start, so two concurrent
 * windows would collectively bypass them; the single-flight admission
 * (promise-chain queue) instead serializes the whole read — gate waits and
 * the full transport drain — so every window re-evaluates the gates fresh.
 * The queue is per CustomSource instance, never module-global: independent
 * loads must not serialize against each other. A queued read whose load is
 * superseded (aborted signal) fails with the abort reason before any
 * transport bytes are requested, and the slot always releases when the read
 * settles (success, short read, transport error, abort), so a torn-down load
 * can never pin it.
 */
export function mediaLibrarySource(source: ByteSource, options: MediaLibrarySourceOptions = {}): CustomSource {
  // Per-adapter-instance single-flight admission queue.
  let admission: Promise<void> = Promise.resolve();

  /** Gate waits + transport drain for one admitted range read. */
  async function runRead(start: number, end: number): Promise<Uint8Array> {
    const expected = end - start;
    const signal = options.signal;
    // A pre-aborted signal must fail the read before any bytes are requested;
    // the transport only aborts a read after its stream exists. This also
    // catches a queued read whose load was superseded while it waited behind
    // the in-flight read, so it never opens a transport read on a dead
    // pipeline.
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
  }

  return new CustomSource({
    dispose: () => source.cancel(),
    getSize: () => source.size,
    prefetchProfile: 'network',
    read: (start: number, end: number) => {
      // Chain the admission onto the previous read's full settle (drain
      // included), then extend the chain so the next read waits on this one.
      // Both handlers run `runRead` so a settled (resolved or rejected)
      // predecessor never blocks the queue.
      const admitted = admission.then(() => runRead(start, end), () => runRead(start, end));
      admission = admitted.then(
        () => undefined,
        () => undefined,
      );
      return admitted;
    },
  });
}
