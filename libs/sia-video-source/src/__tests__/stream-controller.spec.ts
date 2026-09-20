/**
 * TDD contract for the `StreamController` seam: the generic session
 * coordinator that turns one load's index + producer + sink + source into a
 * play session — start/seek/playhead trigger semantics, epoch-scoped seeks,
 * FLOOR RAP selection, bounded lookahead, back-buffer eviction, terminal EOS,
 * and fatal-error reporting.
 *
 * The controller depends only on injected interfaces (`RandomAccessIndex`,
 * `AppendableProducer`, `AppendSink`, `ByteSource`, `Clock`, `ErrorReporter`);
 * it imports no Sia SDK and no MSE internals. Everything below runs against
 * deterministic fakes with a `ManualClock`, so the orchestration is testable
 * without Sia or a real MediaSource.
 */

import { describe, expect, it } from 'vitest';
import type { ByteRange, ByteSource, ReadOptions } from '../transport/byte-source.ts';
import type { AppendableProducer, ProducedSegment } from '../container/producer/appendable-producer.ts';
import type { RandomAccessIndex, RangeRead } from '../media/types.ts';
import { ManualClock } from '../session/clock.ts';
import type { ErrorReporter, PlaybackFailure } from '../session/error-reporter.ts';
import {
  createStreamController,
  type StreamController,
  type StreamLoad,
  type StreamState,
} from '../session/stream-controller.ts';
import type { AppendSink } from '../sink/append-sink.ts';
import { MemoryByteSource } from '../transport/memory-byte-source.ts';

describe('StreamController', () => {
  it('start() streams every index range in order and ends at the terminal range', async () => {
    const harness = harnessWith();
    const states: StreamState[] = [];
    harness.controller.onStateChange((state) => states.push(state));

    harness.controller.start(harness.loadBytes(twoRangeIndex(), new Uint8Array(100)));

    await flush();

    expect(harness.producer.pushes.map((push) => push.offset)).toEqual([0, 40]);
    expect(harness.producer.pushes[0].bytes).toHaveLength(40);
    expect(harness.producer.pushes[1].bytes).toHaveLength(60);
    expect(harness.sink.appends).toHaveLength(2);
    expect(harness.sink.eosEpochs).toEqual([1]);
    expect(harness.controller.state).toBe('ended');
    expect(states.at(-1)).toBe('ended');
    expect(harness.reporter.reports).toEqual([]);
  });

  it('seek() bumps the epoch, floor-selects a RAP range, and resets producer + parser', async () => {
    const harness = harnessWith();

    harness.controller.start(harness.loadBytes(threeRangeIndex(), new Uint8Array(90)));
    // Synchronous: supersedes the in-flight first read before it can deliver.
    harness.controller.seek(3.5);

    await flush();

    expect(harness.producer.resets).toEqual([1, 2]);
    expect(harness.sink.resetEpochs).toEqual([1, 2]);
    // Only the sought range (t=2 → offset 30) and its successor were fetched.
    expect(harness.producer.pushes.map((push) => push.offset)).toEqual([30, 60]);
    expect(harness.sink.eosEpochs).toEqual([2]);
    expect(harness.reporter.reports).toEqual([]);
    expect(harness.controller.state).toBe('ended');
  });

  it('drops a cancelled/aborted read without reporting it', async () => {
    const harness = harnessWith();

    harness.controller.start(harness.load(singleTerminalIndex(), new AbortByteSource()));
    await flush();

    expect(harness.reporter.reports).toEqual([]);
    // The aborted read never reached the producer.
    expect(harness.producer.pushes).toEqual([]);
    expect(harness.controller.state).toBe('playing');
  });

  it('bounds lookahead to the playhead budget and resumes when the playhead advances', async () => {
    const clock = new ManualClock();
    clock.setMediaTime(3);
    const harness = harnessWith({ clock, lookaheadSeconds: 0.5 });
    const index = new FakeIndex([
      range(0, 30, 0, 2),
      range(30, 30, 2, 4),
      range(60, 30, 4, 6, { terminal: true }),
    ], 6);

    harness.controller.start(harness.loadBytes(index, new Uint8Array(90)));
    await flush();

    // r0 and r1 are within the 0.5 s budget from playhead 3; r2 is beyond it.
    expect(harness.producer.pushes.map((push) => push.offset)).toEqual([0, 30]);
    expect(harness.controller.state).toBe('playing');
    expect(harness.sink.eosEpochs).toEqual([]);

    harness.controller.playhead(4.5);
    await flush();

    expect(harness.producer.pushes.map((push) => push.offset)).toEqual([0, 30, 60]);
    expect(harness.sink.evictions).toContain(4.5);
    expect(harness.sink.eosEpochs).toEqual([1]);
    expect(harness.controller.state).toBe('ended');
    expect(harness.reporter.reports).toEqual([]);
  });

  it('reports a non-superseded read failure as transport:unreachable and fails the controller', async () => {
    const harness = harnessWith();

    harness.controller.start(harness.load(singleTerminalIndex(), new ThrowingByteSource()));
    await flush();

    expect(harness.reporter.reports).toHaveLength(1);
    expect(harness.reporter.reports[0]).toMatchObject({ code: 'unreachable', condition: 'transport' });
    expect(harness.controller.state).toBe('failed');
    expect(harness.sink.aborted).toBe(true);
  });

  it('reports a producer error as normalization:failed and never requests EOS', async () => {
    const harness = harnessWith();

    harness.controller.start(harness.loadBytes(twoRangeIndex(), new Uint8Array(100)));
    // Fire while the first read is still in flight so the session is playing,
    // not already ended.
    harness.producer.emitError(new Error('remux failed'));

    expect(harness.reporter.reports).toHaveLength(1);
    expect(harness.reporter.reports[0]).toMatchObject({ code: 'failed', condition: 'normalization' });
    expect(harness.controller.state).toBe('failed');
    expect(harness.sink.aborted).toBe(true);

    await flush();
    // A failed controller never requests EOS, even when the read it raced drains.
    expect(harness.sink.eosEpochs).toEqual([]);
  });

  it('destroy() aborts the sink and ignores later control messages', async () => {
    const harness = harnessWith();

    harness.controller.start(harness.loadBytes(twoRangeIndex(), new Uint8Array(100)));
    harness.controller.destroy('bye');
    harness.controller.seek(2);
    harness.controller.playhead(1);
    harness.controller.endOfStream();

    await flush();

    expect(harness.controller.state).toBe('destroyed');
    expect(harness.sink.aborted).toBe(true);
    expect(harness.sink.abortReason).toBe('bye');
    expect(harness.sink.eosEpochs).toEqual([]);
    expect(harness.sink.evictions).toEqual([]);
    expect(harness.reporter.reports).toEqual([]);
  });

  it('streams a sequential load (no index) as one terminal range from byte 0', async () => {
    const harness = harnessWith();

    harness.controller.start({ index: null, producer: harness.producer, sink: harness.sink, source: new MemoryByteSource(new Uint8Array(50)) });
    await flush();

    expect(harness.producer.pushes).toHaveLength(1);
    expect(harness.producer.pushes[0].offset).toBe(0);
    expect(harness.producer.pushes[0].bytes).toHaveLength(50);
    expect(harness.producer.flushed).toEqual([1]);
    expect(harness.sink.eosEpochs).toEqual([1]);
    expect(harness.controller.state).toBe('ended');
    expect(harness.reporter.reports).toEqual([]);
  });

  it('endOfStream() forces a terminal completion and stops the pump', async () => {
    const harness = harnessWith();

    harness.controller.start(harness.loadBytes(twoRangeIndex(), new Uint8Array(100)));
    harness.controller.endOfStream();
    await flush();

    // EOS is requested once and the pump stops before the second range.
    expect(harness.sink.eosEpochs).toEqual([1]);
    expect(harness.controller.state).toBe('ended');
    expect(harness.producer.pushes.map((push) => push.offset)).not.toContain(40);
  });

  it('delegates EOS to the producer terminal when an async producer is still pending at flush', async () => {
    // The mediabunny refragmenter emits asynchronously: the controller ends the
    // terminal read and flushes before the segments exist, so it must NOT
    // request endOfStream itself — the producer's terminal media segment does.
    const harness = harnessWith();
    const producer: AppendableProducer = {
      flush: () => undefined,
      isPending: () => true,
      mode: 'normalized' as const,
      onError: () => () => undefined,
      onSegment: () => () => undefined,
      outputMime: 'video/mp4; codecs="avc1.640032,mp4a.40.2"',
      push: () => undefined,
      reportError: () => undefined,
      reset: () => undefined,
    };
    harness.controller.start({
      index: null,
      producer,
      sink: harness.sink,
      source: new MemoryByteSource(new Uint8Array(50)),
    });
    await flush();

    // The controller ended its own model but deferred the sink EOS to the
    // producer's terminal media (driven later through the MSE adapter).
    expect(harness.controller.state).toBe('ended');
    expect(harness.sink.eosEpochs).toEqual([]);
  });

  it('requests EOS itself when the producer is not pending at flush', async () => {
    const harness = harnessWith();
    const producer: AppendableProducer = {
      flush: () => undefined,
      isPending: () => false,
      mode: 'normalized' as const,
      onError: () => () => undefined,
      onSegment: () => () => undefined,
      outputMime: 'video/mp4; codecs="avc1.640032,mp4a.40.2"',
      push: () => undefined,
      reportError: () => undefined,
      reset: () => undefined,
    };
    harness.controller.start({
      index: null,
      producer,
      sink: harness.sink,
      source: new MemoryByteSource(new Uint8Array(50)),
    });
    await flush();
    expect(harness.sink.eosEpochs).toEqual([1]);
    expect(harness.controller.state).toBe('ended');
  });

  it('start() replaces an active load and aborts the previous sink without leaking stale pushes', async () => {
    const harness = harnessWith();
    const sinkA = new FakeSink();
    const producerA = new FakeProducer();
    const sinkB = new FakeSink();
    const producerB = new FakeProducer();

    harness.controller.start({ index: twoRangeIndex(), producer: producerA, sink: sinkA, source: new MemoryByteSource(new Uint8Array(100)) });
    harness.controller.start({ index: new FakeIndex([range(0, 60, 0, 4, { terminal: true })], 4), producer: producerB, sink: sinkB, source: new MemoryByteSource(new Uint8Array(60)) });
    await flush();

    expect(sinkA.aborted).toBe(true);
    expect(sinkA.abortReason).toBe('source-replaced');
    expect(producerA.pushes).toEqual([]);
    expect(producerB.pushes.map((push) => push.offset)).toEqual([0]);
    expect(sinkB.eosEpochs).toEqual([2]);
    expect(harness.reporter.reports).toEqual([]);
    expect(harness.controller.state).toBe('ended');
  });

  it('fails as transport:timeout when a read delivers late past the stall budget', async () => {
    const clock = new ManualClock();
    const harness = harnessWith({ clock, stallTimeoutMs: 1000 });
    const source = new LatchedByteSource(new Uint8Array(8));

    harness.controller.start({
      index: singleTerminalIndex(),
      producer: harness.producer,
      sink: harness.sink,
      source,
    });
    await Promise.resolve(); // let the first read park on the latch

    expect(harness.controller.state).toBe('playing');
    clock.setNow(5000);
    source.release();
    await flush();

    expect(harness.reporter.reports).toHaveLength(1);
    expect(harness.reporter.reports[0]).toMatchObject({ code: 'timeout', condition: 'transport' });
    expect(harness.controller.state).toBe('failed');
    expect(harness.sink.aborted).toBe(true);
  });

  it('fails as transport:timeout when a read never delivers (silently stalled transport)', async () => {
    const clock = new ManualClock();
    const harness = harnessWith({ clock, stallTimeoutMs: 1000 });
    const source = new StalledByteSource(new Uint8Array(8));

    harness.controller.start({
      index: singleTerminalIndex(),
      producer: harness.producer,
      sink: harness.sink,
      source,
    });
    await Promise.resolve(); // let the first read park on the never-resolving read

    expect(harness.controller.state).toBe('playing');
    clock.setNow(5000);
    await stallTick(); // let the watchdog observe the deadline

    expect(harness.reporter.reports).toHaveLength(1);
    expect(harness.reporter.reports[0]).toMatchObject({ code: 'timeout', condition: 'transport' });
    expect(harness.controller.state).toBe('failed');
    expect(harness.sink.aborted).toBe(true);
    expect(harness.producer.pushes).toEqual([]);

    // The aborted run unwound: a fresh start streams to the end.
    harness.controller.start(harness.loadBytes(threeRangeIndex(), new Uint8Array(90)));
    await flush();
    expect(harness.controller.state).toBe('ended');
    expect(harness.producer.pushes.map((push) => push.offset)).toEqual([0, 30, 60]);
  });
});

// ---- fakes ------------------------------------------------------------------

interface Harness {
  clock: ManualClock;
  controller: StreamController;
  load(index: FakeIndex, source: ByteSource): StreamLoad;
  loadBytes(index: FakeIndex, bytes: Uint8Array): StreamLoad;
  producer: FakeProducer;
  reporter: RecordingErrorReporter;
  sink: FakeSink;
}

/** Errors every read with a cancellation-style AbortError immediately. */
class AbortByteSource implements ByteSource {
  readonly size = 8;

  cancel(): void {
    // Test double: no transport work to cancel.
  }

  read(_range: ByteRange, _options: ReadOptions): ReadableStream<Uint8Array> {
    return new ReadableStream<Uint8Array>({
      start(controller) {
        controller.error(Object.assign(new Error('aborted by signal'), { name: 'AbortError' }));
      },
    });
  }
}

class FakeIndex implements RandomAccessIndex {
  readonly durationSeconds: null | number;
  readonly granularity = 'exact-byte' as const;
  readonly ranges: readonly RangeRead[];

  get first(): null | RangeRead {
    return this.ranges[0] ?? null;
  }

  constructor(ranges: readonly RangeRead[], durationSeconds: null | number = null) {
    this.durationSeconds = durationSeconds;
    this.ranges = ranges;
  }

  next(from: RangeRead): null | RangeRead {
    const at = this.ranges.findIndex((candidate) => candidate.offset === from.offset);
    if (at < 0) return null;
    return this.ranges[at + 1] ?? null;
  }

  seek(timeSeconds: number): null | RangeRead {
    let candidate: null | RangeRead = null;
    for (const item of this.ranges) {
      if (item.startSeconds <= timeSeconds) candidate = item;
      else break;
    }
    return candidate;
  }
}

class FakeProducer implements AppendableProducer {
  readonly flushed: number[] = [];
  readonly mode = 'passthrough' as const;
  readonly outputMime = 'video/mp4';
  readonly pushes: { bytes: Uint8Array; epoch: number; offset: number }[] = [];
  readonly resets: number[] = [];
  #epoch = 0;
  #onError: ((error: unknown) => void) | null = null;
  readonly #onSegment = new Set<(segment: ProducedSegment) => void>();

  emitError(error: unknown): void {
    this.#onError?.(error);
  }

  flush(epoch: number): void {
    if (epoch >= this.#epoch) this.flushed.push(epoch);
  }

  onError(listener: (error: unknown) => void): () => void {
    this.#onError = listener;
    return () => {
      if (this.#onError === listener) this.#onError = null;
    };
  }

  onSegment(listener: (segment: ProducedSegment) => void): () => void {
    this.#onSegment.add(listener);
    return () => {
      this.#onSegment.delete(listener);
    };
  }

  push(bytes: Uint8Array, absoluteOffset: number, epoch: number): void {
    if (epoch < this.#epoch) return;
    this.pushes.push({ bytes, epoch, offset: absoluteOffset });
    for (const listener of this.#onSegment) listener({ bytes, kind: 'media' });
  }

  reportError(error: unknown): void {
    this.emitError(error);
  }

  reset(epoch: number): void {
    this.#epoch = Math.max(this.#epoch, epoch);
    this.resets.push(epoch);
  }
}

class FakeSink implements AppendSink {
  aborted = false;
  abortReason: unknown = undefined;
  readonly appends: ProducedSegment[] = [];
  readonly eosEpochs: number[] = [];
  readonly evictions: number[] = [];
  readonly resetEpochs: number[] = [];

  abort(reason?: unknown): void {
    this.aborted = true;
    this.abortReason = reason;
  }

  append(segment: ProducedSegment): void {
    this.appends.push(segment);
  }

  evictBackBuffer(playheadSeconds: number): Promise<boolean> {
    this.evictions.push(playheadSeconds);
    return Promise.resolve(true);
  }

  requestEndOfStream(epoch: number): void {
    this.eosEpochs.push(epoch);
  }

  resetParser(epoch: number): void {
    this.resetEpochs.push(epoch);
  }
}

/**
 * In-memory source that parks its first read on a manual latch and delivers
 * later reads immediately — used to hold one read in flight while the test
 * advances the `ManualClock` past the stall budget.
 */
class LatchedByteSource implements ByteSource {
  get size(): number {
    return this.#bytes.byteLength;
  }
  readonly #bytes: Uint8Array;
  #latched = false;

  #release: (() => void) | null = null;

  constructor(bytes: Uint8Array) {
    this.#bytes = bytes;
  }

  cancel(): void {
    // Test double: no transport work to cancel.
  }

  read(range: ByteRange, _options: ReadOptions): ReadableStream<Uint8Array> {
    const start = Math.max(0, Math.floor(range.offset));
    const end = Math.min(this.#bytes.byteLength, start + Math.max(0, Math.floor(range.length)));
    return new ReadableStream<Uint8Array>({
      start: (controller) => {
        const deliver = () => {
          controller.enqueue(this.#bytes.slice(start, end));
          controller.close();
        };
        if (this.#latched) {
          queueMicrotask(deliver);
        } else {
          this.#latched = true;
          this.#release = deliver;
        }
      },
    });
  }

  release(): void {
    const release = this.#release;
    this.#release = null;
    release?.();
  }
}

class RecordingErrorReporter implements ErrorReporter {
  readonly reports: PlaybackFailure[] = [];

  report(failure: PlaybackFailure): void {
    this.reports.push(failure);
  }
}

/**
 * Source whose read never delivers and never reaches EOF — a silently stalled
 * transport that parks `reader.read()` forever.
 */
class StalledByteSource implements ByteSource {
  get size(): number {
    return this.#bytes.byteLength;
  }
  readonly #bytes: Uint8Array;

  constructor(bytes: Uint8Array) {
    this.#bytes = bytes;
  }

  cancel(): void {
    // Test double: no transport work to cancel.
  }

  read(_range: ByteRange, _options: ReadOptions): ReadableStream<Uint8Array> {
    return new ReadableStream<Uint8Array>({
      pull() {
        // Never enqueues and never closes: the read stays pending forever.
      },
    });
  }
}

/** Errors every read with a hard (non-superseded) transport failure. */
class ThrowingByteSource implements ByteSource {
  readonly size = 8;

  cancel(): void {
    // Test double: no transport work to cancel.
  }

  read(_range: ByteRange, _options: ReadOptions): ReadableStream<Uint8Array> {
    return new ReadableStream<Uint8Array>({
      start(controller) {
        controller.error(new Error('transport down'));
      },
    });
  }
}

async function flush(): Promise<void> {
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 0));
}

function harnessWith(options: { clock?: ManualClock; lookaheadSeconds?: number; stallTimeoutMs?: number } = {}): Harness {
  const clock = options.clock ?? new ManualClock();
  const reporter = new RecordingErrorReporter();
  const controller = createStreamController({
    clock,
    errorReporter: reporter,
    lookaheadSeconds: options.lookaheadSeconds,
    stallTimeoutMs: options.stallTimeoutMs,
  });
  const producer = new FakeProducer();
  const sink = new FakeSink();
  return {
    clock,
    controller,
    load: (index, source) => ({ index, producer, sink, source }),
    loadBytes: (index, bytes) => ({ index, producer, sink, source: new MemoryByteSource(bytes) }),
    producer,
    reporter,
    sink,
  };
}

function range(
  offset: number,
  length: number,
  startSeconds: number,
  endSeconds: number,
  options: { rap?: boolean; terminal?: boolean } = {},
): RangeRead {
  return {
    endSeconds,
    length,
    offset,
    rap: options.rap ?? true,
    startSeconds,
    terminal: options.terminal ?? false,
  };
}

// ---- harness ----------------------------------------------------------------

function singleTerminalIndex(): FakeIndex {
  return new FakeIndex([range(0, 8, 0, 2, { terminal: true })], 2);
}

/** Lets the controller's stall watchdog poll the deadline at least once. */
function stallTick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 250));
}

function threeRangeIndex(): FakeIndex {
  return new FakeIndex([
    range(0, 30, 0, 2),
    range(30, 30, 2, 4),
    range(60, 30, 4, 6, { terminal: true }),
  ], 6);
}

function twoRangeIndex(): FakeIndex {
  return new FakeIndex([
    range(0, 40, 0, 4),
    range(40, 60, 4, 10, { terminal: true }),
  ], 10);
}
