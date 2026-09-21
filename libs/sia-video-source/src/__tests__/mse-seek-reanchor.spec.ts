/**
 * MSE-level seek re-anchor contract, end to end: a real mediabunny conversion
 * over the package's progressive MP4 fixture streams into a real
 * `MseAppendPipe` through the `MseAdapter` surface, and a
 * `StreamController.seek()` re-anchors the pipeline while the ORIGINAL
 * position's conversion output is still queueing. The seek must (i) reach the
 * shared pipe as exactly one extra parser reset, (ii) lead the bytes queued
 * for the new position with a fresh init segment, and (iii) leave the session
 * `playing` through the re-anchor boundary (the seek transitions no state; the
 * restarted run's eventual completion ends the session only afterwards).
 *
 * Two scenario groups cover both MSE plumbing roles:
 *
 * - `worker-MSE`: the `createWorkerMseRoot` composition opens a fresh
 *   per-load worker `MediaSource` (SourceBuffer deferred to `sourceopen`) and
 *   hands the controller a `MseAdapter` sink;
 * - `main-thread MSE`: a single shared main `MediaSource` + `MseAppendPipe`
 *   wrapped in a `MseAdapter`, mirroring the host's main-thread fallback.
 *
 * Neither group fakes the load or the bytes: the committed progressive fixture
 * is inspected with `inspectMediaLibrary`, so the seek is a real
 * `playback.restart` over mediabunny. The fixture's eager single-range read
 * would finish the whole conversion before a test callback could observe it,
 * so the transport is a gated test seam that serves the SAME fixture bytes
 * across macrotask gaps — the conversion then builds a genuine in-flight
 * window where output for the original position is still queueing. The
 * re-anchor is observed at the SourceBuffer level through the fakes' recorded
 * append order and `abort()` calls (the same fake MSE lifecycle the
 * composition specs use).
 */
import { describe, expect, it } from 'vitest';
import type { PlaybackCapabilities } from '../capabilities/browser-capabilities.ts';
import { inspectMediaLibrary, type MediaPlayback, type ReadyMediaLoad } from '../media/library-load.ts';
import { MseAppendPipe } from '../mse-pipe.ts';
import type { ErrorReporter, PlaybackFailure } from '../session/error-reporter.ts';
import { createStreamController, type StreamLoad } from '../session/stream-controller.ts';
import { createWorkerMseRoot } from '../session/worker-mse-root.ts';
import { MseAdapter } from '../sink/mse-adapter.ts';
import type { ByteRange, ByteSource, ReadOptions } from '../transport/byte-source.ts';
import { progressiveMp4Fixture } from './fixtures/progressive-mp4-fixture.ts';

/** Seconds of media in the built fixture; large enough that the conversion
 * builds a real in-flight window when its source is served incrementally. */
const SEEKABLE_SECONDS = 60;

/** Mid-timeline timestamp the seek re-anchors at. */
const TARGET_SECONDS = 30;

/** Macrotask gap between served source chunks; keeps the conversion yieldable. */
const SOURCE_CHUNK_GAP_MS = 12;

/** Bytes served per gated chunk; small enough to spread the conversion out. */
const SOURCE_CHUNK_SIZE = 64 * 1024;

// ---- fake MSE lifecycle (mirrors the composition/pipe specs) -----------------

interface MseHarness {
  destroy(): void;
  sink: MseAdapter;
  sourceBuffer: FakeSourceBuffer;
}

/** Minimal fake SourceBuffer honoring the browser's async update/error model. */
class FakeSourceBuffer extends EventTarget {
  abortCalls = 0;
  appended: Uint8Array[] = [];
  /** Chronological record of `abort` and successful `append:<firstByte>`. */
  eventLog: string[] = [];
  ranges: [number, number][] = [];
  removed: [number, number][] = [];
  /** Chronological record of every assigned `timestampOffset`, in order. */
  timestampOffsets: number[] = [];
  updating = false;
  get buffered(): unknown {
    return {
      end: (index: number) => this.ranges[index][1],
      length: this.ranges.length,
      start: (index: number) => this.ranges[index][0],
    };
  }
  get timestampOffset(): number {
    return this.#timestampOffset;
  }
  set timestampOffset(value: number) {
    this.#timestampOffset = value;
    this.timestampOffsets.push(value);
    this.eventLog.push(`timestampOffset:${value}`);
  }
  #timestampOffset = 0;

  abort(): void {
    this.abortCalls += 1;
    this.eventLog.push('abort');
    if (this.updating) {
      this.updating = false;
      this.dispatchEvent(new Event('updateend'));
    }
  }

  appendBuffer(data: BufferSource): void {
    if (this.updating) throw new DOMException('updating', 'InvalidStateError');
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBuffer);
    this.updating = true;
    queueMicrotask(() => {
      this.updating = false;
      this.appended.push(bytes);
      this.eventLog.push(`append:${bytes[0]}`);
      this.dispatchEvent(new Event('updateend'));
    });
  }

  remove(start: number, end: number): void {
    if (this.updating) throw new DOMException('updating', 'InvalidStateError');
    this.removed.push([start, end]);
    this.updating = true;
    queueMicrotask(() => {
      this.updating = false;
      this.dispatchEvent(new Event('updateend'));
    });
  }
}

// ---- helpers -----------------------------------------------------------------

class FakeMediaSource extends EventTarget {
  durationCalls: number[] = [];
  endOfStreamCalls = 0;
  handle = {} as MediaSourceHandle;
  readyState = 'closed';
  sourceBuffers: FakeSourceBuffer[] = [];

  set duration(value: number) {
    this.durationCalls.push(value);
  }

  get duration(): number {
    return this.durationCalls.length ? this.durationCalls[this.durationCalls.length - 1] : 0;
  }

  addSourceBuffer(_mime: string): FakeSourceBuffer {
    const sourceBuffer = new FakeSourceBuffer();
    this.sourceBuffers.push(sourceBuffer);
    return sourceBuffer;
  }

  endOfStream(): void {
    this.endOfStreamCalls += 1;
    this.readyState = 'ended';
  }

  open(): void {
    this.readyState = 'open';
    this.dispatchEvent(new Event('sourceopen'));
  }

  removeSourceBuffer(sourceBuffer: FakeSourceBuffer): void {
    const index = this.sourceBuffers.indexOf(sourceBuffer);
    if (index >= 0) this.sourceBuffers.splice(index, 1);
  }
}

/**
 * Serves the same committed fixture bytes over MANY macrotask gaps, so the
 * real mediabunny conversion stays yieldable and builds an observable in-flight
 * window: output for a position is still being queued while the session is
 * `playing`, which is exactly the state a mid-stream seek must re-anchor.
 * Test machinery only — the media bytes themselves come from the committed
 * `progressiveMp4Fixture`.
 */
class GatedByteSource implements ByteSource {
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

/** Number of `append:` events recorded strictly before `beforeIndex` in the log. */
function appendsBefore(log: readonly string[], beforeIndex: number): number {
  let count = 0;
  for (let index = 0; index < beforeIndex; index += 1) {
    if (log[index].startsWith('append:')) count += 1;
  }
  return count;
}

/**
 * The shared re-anchor proof, driven through `StreamController.seek()`:
 * (i) exactly one extra parser reset reaches the shared MseAppendPipe,
 * (ii) the first append after that reset is the fresh init segment, and
 * (iii) the session stays `playing` through the re-anchor boundary — the seek
 * itself transitions no state, so the session is still `playing` with the
 * restarted run in flight (its eventual completion legitimately ends it).
 */
async function assertSeekReanchor(config: {
  load: StreamLoad;
  sourceBuffer: FakeSourceBuffer;
  targetSeconds: number;
}): Promise<void> {
  const { load, sourceBuffer, targetSeconds } = config;
  const failures: PlaybackFailure[] = [];
  const errorReporter: ErrorReporter = {
    report: (failure) => {
      failures.push(failure);
    },
  };
  const controller = createStreamController({ errorReporter });

  controller.start(load);
  expect(controller.state).toBe('playing');

  // Wait for the ORIGINAL position's output to start queueing: init + a media
  // fragment drained into the SourceBuffer while the (multisecond) conversion
  // is still in flight.
  await waitFor(() => sourceBuffer.appended.length >= 2);
  expect(controller.state).toBe('playing');

  // The START reset is target-less: a load start re-anchors nothing, so the
  // offset stays untouched until a seek parks one.
  expect(sourceBuffer.timestampOffsets).toEqual([]);

  const appendedBefore = sourceBuffer.appended.length;
  const abortsBefore = sourceBuffer.abortCalls;

  // A mid-stream seek: the controller restarts the conversion at the target
  // and has the sink reset its parser so the fresh init segment lands clean.
  controller.seek(targetSeconds);

  // (iii) The re-anchor leaves the session playing: the seek transitions no
  // state, and the restarted run is still in flight (gated transport spreads
  // its read across macrotasks), so a synchronous check right after the seek
  // and again once the seek's parser abort lands is deterministic.
  expect(controller.state).toBe('playing');

  // (i) Wait for the seek's parser abort, then assert exactly one extra reset
  // on the shared MseAppendPipe per accepted re-anchor — observed as exactly
  // one additional SourceBuffer `abort()` (the START reset is the baseline).
  await waitFor(() => sourceBuffer.abortCalls >= abortsBefore + 1);
  expect(sourceBuffer.abortCalls).toBe(abortsBefore + 1);
  expect(controller.state).toBe('playing');

  // The seek re-anchors the SourceBuffer to the target: the trimmed conversion
  // rebases its output timestamps to zero, so the buffer must be told the new
  // position before the fresh init/media lands — else the buffered window
  // collapses to [0, fragment duration] and the element seeks forever.
  expect(sourceBuffer.timestampOffsets).toEqual([targetSeconds]);

  // (ii) The bytes queued after the re-anchor start with an init segment:
  // wait until the first append after the SEEK's parser abort is the fresh
  // init (the aborted SourceBuffer cannot accept the fresh moof before the
  // reset lands). The `>= appendedBefore` guard keeps the predicate from
  // matching the original run's init that followed the START abort.
  await waitFor(() => {
    const seekAbortIndex = sourceBuffer.eventLog.lastIndexOf('abort');
    if (seekAbortIndex < 0) return false;
    const firstAppendAfterAbort = appendsBefore(sourceBuffer.eventLog, seekAbortIndex);
    return (
      firstAppendAfterAbort >= appendedBefore &&
      firstAppendAfterAbort < sourceBuffer.appended.length &&
      isFtypLed(sourceBuffer.appended[firstAppendAfterAbort])
    );
  });

  // Deterministic re-check of the queued-bytes ordering at the SourceBuffer.
  const seekAbortIndex = sourceBuffer.eventLog.lastIndexOf('abort');
  const firstAppendAfterAbort = appendsBefore(sourceBuffer.eventLog, seekAbortIndex);
  expect(seekAbortIndex).toBeGreaterThanOrEqual(0);
  expect(firstAppendAfterAbort).toBeGreaterThanOrEqual(appendedBefore);
  expect(isFtypLed(sourceBuffer.appended[firstAppendAfterAbort])).toBe(true);

  // Strict ordering at the SourceBuffer: the parser abort, then the timestamp
  // re-anchor to the seek target, then the fresh init segment.
  const timestampOffsetIndex = sourceBuffer.eventLog.indexOf(`timestampOffset:${targetSeconds}`);
  const freshAppendIndex = sourceBuffer.eventLog.findIndex(
    (entry, index) => index > seekAbortIndex && entry.startsWith('append:'),
  );
  expect(timestampOffsetIndex).toBeGreaterThan(seekAbortIndex);
  expect(freshAppendIndex).toBeGreaterThan(timestampOffsetIndex);

  controller.destroy();
  expect(failures).toEqual([]);
}

/** Whether a recorded SourceBuffer append is an init segment (ftyp-led). */
function isFtypLed(bytes: Uint8Array | undefined): boolean {
  if (!bytes || bytes.byteLength < 8) return false;
  return bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70;
}

/** Loads the real progressive fixture and returns its ready playback + metadata. */
async function loadRealPlayback(): Promise<ReadyMediaLoad> {
  const result = await inspectMediaLibrary(
    new GatedByteSource(progressiveMp4Fixture({ seconds: SEEKABLE_SECONDS })),
    { capabilities: permissiveCapabilities() },
  );
  expect(result.status).toBe('ready');
  return result as ReadyMediaLoad;
}

/** Main-thread MSE fallback: one shared MediaSource + pipe behind an adapter. */
function mainMseHarness(ready: ReadyMediaLoad): MseHarness {
  const mediaSource = new FakeMediaSource();
  mediaSource.open();
  const sourceBuffer = mediaSource.addSourceBuffer(ready.mime);
  const playheadSeconds = 0;
  const pipe = new MseAppendPipe({
    backBufferSeconds: 30,
    getMediaSource: () => mediaSource as unknown as MediaSource,
    getPlayheadSeconds: () => playheadSeconds,
    getSourceBuffer: () => sourceBuffer as unknown as SourceBuffer,
    onError: () => undefined,
  });
  return {
    destroy: () => {
      pipe.abort();
    },
    sink: new MseAdapter({ pipe }),
    sourceBuffer,
  };
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

/** Polls until `predicate` holds or `timeoutMs` elapses. */
async function waitFor(predicate: () => boolean, timeoutMs = 15000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!predicate()) {
    if (Date.now() > deadline) throw new Error('timed out waiting for the MSE pipeline to settle');
    await new Promise((resolve) => setTimeout(resolve, 1));
  }
}

/** Worker-MSE composition: a fresh per-load root MediaSource + MseAdapter. */
function workerMseHarness(ready: ReadyMediaLoad): MseHarness {
  const mediaSources: FakeMediaSource[] = [];
  const root = createWorkerMseRoot({
    backBufferSeconds: 30,
    createMediaSource: () => {
      const created = new FakeMediaSource();
      mediaSources.push(created);
      return created as unknown as MediaSource;
    },
    post: () => undefined,
  });
  const sink = root.createSink({
    durationSeconds: ready.durationSeconds,
    mime: ready.mime,
    requestId: 1,
  });
  // A worker MediaSource opens when the host attaches its handle; the root
  // then decides the SourceBuffer for its MseAppendPipe.
  const mediaSource = mediaSources[0];
  mediaSource.open();
  const sourceBuffer = mediaSource.sourceBuffers[0];
  return {
    destroy: () => {
      root.teardown();
    },
    sink: sink as MseAdapter,
    sourceBuffer,
  };
}

// ---- scenario groups ---------------------------------------------------------

describe('MSE seek re-anchor (worker-MSE composition)', () => {
  it('runs seek-reanchor over the real pipeline through the worker root', async () => {
    const ready = await loadRealPlayback();
    const harness = workerMseHarness(ready);
    const playback: MediaPlayback = ready.playback;
    try {
      await assertSeekReanchor({
        load: { loadGeneration: 1, playback, sink: harness.sink },
        sourceBuffer: harness.sourceBuffer,
        targetSeconds: TARGET_SECONDS,
      });
    } finally {
      harness.destroy();
    }
  });
});

describe('MSE seek re-anchor (main-thread MSE fallback)', () => {
  it('runs seek-reanchor over the real pipeline through the shared main pipe', async () => {
    const ready = await loadRealPlayback();
    const harness = mainMseHarness(ready);
    const playback: MediaPlayback = ready.playback;
    try {
      await assertSeekReanchor({
        load: { loadGeneration: 1, playback, sink: harness.sink },
        sourceBuffer: harness.sourceBuffer,
        targetSeconds: TARGET_SECONDS,
      });
    } finally {
      harness.destroy();
    }
  });
});
