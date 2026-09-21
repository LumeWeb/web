/**
 * Far-seek ByteSource contract at the library seam: drive the real production
 * wiring — `inspectMediaLibrary` -> `createStreamController` -> a recording
 * sink, no MSE involved — and prove that a far `StreamController.seek()` makes
 * the pipeline REQUEST bytes from the target region. The transport read cursor
 * must jump to a fixed deep offset in the fixture, not keep streaming on from
 * the front and rely on a local in-memory seek.
 *
 * The committed fixture delivers eagerly (MemoryByteSource settles on a
 * microtask), which would finish the first conversion before a test observer
 * could seek into it, so the transport here is a paced test seam that serves
 * the SAME fixture bytes across macrotask gaps — the trick the MSE seek-reanchor
 * spec uses. A first full run records the strictly sequential read order (the
 * object tiles from the front, one contiguous run to EOF); then a fresh
 * identical load is driven through the SAME controller and re-anchored far into
 * the timeline. The restart's trimmed conversion needs bytes the fresh input
 * has not cached yet, so a NEW ranged read beginning at or after a fixed
 * deep-offset scalar is issued AFTER the seek: the pipeline jumped the
 * ByteSource read cursor into the target region instead of streaming on to it.
 *
 * The seek is issued at the very start of the fresh run (its conversion is
 * armed and streaming, but no media bytes have been pulled yet). Streaming the
 * run a few fragments first makes the restart continue from exactly where the
 * front reads paused — the target-region request then loses its sharp offset,
 * so the immediate re-anchor keeps the byte jump to the deep scalar
 * unambiguous at this seam.
 */
import { describe, expect, it } from 'vitest';
import type { PlaybackCapabilities } from '../capabilities/browser-capabilities.ts';
import { inspectMediaLibrary, type ReadyMediaLoad } from '../media/library-load.ts';
import type { ErrorReporter, PlaybackFailure } from '../session/error-reporter.ts';
import { createStreamController } from '../session/stream-controller.ts';
import type { AppendSink, AppendUnit } from '../sink/append-sink.ts';
import type { ByteRange, ByteSource, ReadOptions } from '../transport/byte-source.ts';
import { progressiveMp4Fixture } from './fixtures/progressive-mp4-fixture.ts';

/** Seconds of media in the built fixture. */
const FIXTURE_SECONDS = 120;

/** Far seek target: deep into the 120 s timeline. */
const SEEK_SECONDS = 90;

/**
 * Fixed ByteSource offset the far seek must reach. The 120 s fixture is a
 * fixed 2 387 758 bytes, so a read starting at or after this scalar sits
 * comfortably past the object's midpoint: it can only mean the pipeline asked
 * for target-region bytes rather than continuing the sequential front reads.
 * Hardcoded from the known fixture size, never derived from the observed reads.
 */
const FIXED_TARGET_BYTE_OFFSET = 1_500_000;

/** Macrotask gap between served source chunks; keeps the conversion yieldable. */
const SOURCE_CHUNK_GAP_MS = 12;

/** Bytes served per paced chunk; small enough to spread the conversion out. */
const SOURCE_CHUNK_SIZE = 64 * 1024;

/** One (offset, length) pair as issued to the transport. */
interface RecordedRead {
  readonly length: number;
  readonly offset: number;
}

/**
 * Records every ByteSource `read({offset, length})` and serves the same
 * committed fixture bytes across macrotask gaps, so a far seek lands while the
 * fresh load is still streaming the front of the object. Test machinery only —
 * the media bytes are the committed `progressiveMp4Fixture`.
 */
class PacedRecordingByteSource implements ByteSource {
  readonly reads: RecordedRead[] = [];

  get size(): number {
    return this.#bytes.byteLength;
  }

  readonly #bytes: Uint8Array;
  #disposed = false;

  constructor(bytes: Uint8Array) {
    this.#bytes = bytes;
  }

  cancel(_reason?: unknown): void {
    this.#disposed = true;
  }

  read(range: ByteRange, _options: ReadOptions): ReadableStream<Uint8Array> {
    this.reads.push({ length: range.length, offset: range.offset });
    const start = range.offset;
    const end = Math.min(start + range.length, this.#bytes.byteLength);
    let at = start;
    let cancelled = false;
    return new ReadableStream<Uint8Array>({
      cancel: () => {
        cancelled = true;
      },
      start: (controller) => {
        const pushNext = (): void => {
          if (this.#disposed || cancelled || at >= end) {
            controller.close();
            return;
          }
          const size = Math.min(SOURCE_CHUNK_SIZE, end - at);
          controller.enqueue(this.#bytes.slice(at, at + size));
          at += size;
          setTimeout(pushNext, SOURCE_CHUNK_GAP_MS);
        };
        pushNext();
      },
    });
  }
}

/** Records sink calls in arrival order, mirroring the sibling seam specs. */
class RecordingSink implements AppendSink {
  readonly eos: number[] = [];
  readonly resets: number[] = [];
  readonly units: AppendUnit[] = [];

  abort(_reason?: unknown): void {
    // Aborts belong to the controller teardown, not this scenario.
  }

  append(unit: AppendUnit): void {
    this.units.push(unit);
  }

  evictBackBuffer(_timeSeconds: number): Promise<boolean> {
    return Promise.resolve(false);
  }

  requestEndOfStream(loadGeneration: number): void {
    this.eos.push(loadGeneration);
  }

  resetParser(loadGeneration: number): void {
    this.resets.push(loadGeneration);
  }
}

/** Fast, permissive capability snapshot matching the other seam specs. */
function permissiveCapabilities(): PlaybackCapabilities {
  return {
    canConstructWorkerMse: () => false,
    mayDecode: () => ({ decodable: true } as never),
    mseSupported: () => true,
    webCodecsAvailable: () => false,
    workerHandleAvailable: () => false,
  };
}

/** Inspects the fixture through `seam` and returns the ready load's playback. */
async function readyPlayback(seam: ByteSource, loadGeneration: number): Promise<ReadyMediaLoad> {
  const result = await inspectMediaLibrary(seam, {
    capabilities: permissiveCapabilities(),
    loadGeneration,
  });
  expect(result.status).toBe('ready');
  return result as ReadyMediaLoad;
}

/** Polls until `predicate` holds or `timeoutMs` elapses. */
async function waitFor(predicate: () => boolean, timeoutMs = 30000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!predicate()) {
    if (Date.now() > deadline) throw new Error('timed out waiting for the seek pipeline to settle');
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

describe('far seek requests bytes from the target region at the ByteSource seam', () => {
  it('jumps the transport read cursor into the target region after a far seek', async () => {
    const fixture = progressiveMp4Fixture({ seconds: FIXTURE_SECONDS });
    // The fixed scalar sits comfortably past the object's midpoint (the 120 s
    // fixture is 2 387 758 bytes). A fixture smaller than twice the scalar
    // would invalidate the "past half" premise, so pin the relationship.
    expect(fixture.byteLength).toBeLessThan(FIXED_TARGET_BYTE_OFFSET * 2);

    const failures: PlaybackFailure[] = [];
    const errorReporter: ErrorReporter = {
      report: (failure) => {
        failures.push(failure);
      },
    };
    const controller = createStreamController({ errorReporter });

    // --- full sequential run; capture the read order (baseline) ---------------
    const baselineSeam = new PacedRecordingByteSource(fixture);
    const baselineSink = new RecordingSink();
    const baselineLoad = await readyPlayback(baselineSeam, 1);
    controller.start({ loadGeneration: 1, playback: baselineLoad.playback, sink: baselineSink });
    await waitFor(() => baselineSink.eos.length === 1);

    // Without a seek a full run streams the object strictly sequentially from
    // the front: the reads tile the whole object contiguously, offset 0 to EOF,
    // with no jumps and no out-of-order reads.
    let covered = 0;
    for (const read of baselineSeam.reads) {
      expect(read.offset).toBe(covered);
      covered = read.offset + read.length;
    }
    expect(covered).toBe(baselineSeam.size);

    // --- reset: a fresh identical load through the same controller -----------
    const seam = new PacedRecordingByteSource(fixture);
    const sink = new RecordingSink();
    const load = await readyPlayback(seam, 2);

    // The fresh load starts streaming its front reads; the seek below is issued
    // right away, so everything recorded before it is the front inspection read.
    controller.start({ loadGeneration: 2, playback: load.playback, sink });
    const readCountBeforeSeek = seam.reads.length;
    const readsBeforeSeek = seam.reads.slice();
    expect(readsBeforeSeek.length).toBeGreaterThan(0);

    // --- far seek -------------------------------------------------------------
    controller.seek(SEEK_SECONDS);

    // Everything issued before the seek started below the fixed scalar: the
    // deep read can only be the seek's work, not ongoing sequential streaming.
    expect(readsBeforeSeek.every((read) => read.offset < FIXED_TARGET_BYTE_OFFSET)).toBe(true);

    // The accepted restart re-anchors the sink parser so the fresh init lands
    // in a clean SourceBuffer.
    await waitFor(() => sink.resets.length >= 2);

    // The trimmed conversion needs bytes the fresh input has not cached, so the
    // transport is asked for a range starting at or after the fixed scalar.
    await waitFor(() => seam.reads.some((read) => read.offset >= FIXED_TARGET_BYTE_OFFSET));
    const afterSeek = seam.reads.slice(readCountBeforeSeek);
    const firstDeep = afterSeek.findIndex((read) => read.offset >= FIXED_TARGET_BYTE_OFFSET);
    // Condition (a): a read starting at N >= scalar appears after earlier
    // smaller-offset reads — a byte jump into the target region rather than
    // sequential-only reads (or a re-stream from byte 0).
    expect(firstDeep).toBeGreaterThanOrEqual(0);
    expect(afterSeek.slice(0, firstDeep).every((read) => read.offset < FIXED_TARGET_BYTE_OFFSET)).toBe(true);

    controller.destroy();
    expect(failures).toEqual([]);
  });
});
