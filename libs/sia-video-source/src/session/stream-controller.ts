/**
 * StreamController contract + generic reference implementation: the play-side
 * session coordinator that turns one load's index + producer + sink + source
 * into a play session.
 *
 * Responsibilities:
 *
 * - start/seek/playhead trigger semantics;
 * - epoch-scoped seeks (a seek cancels stale in-flight work);
 * - FLOOR RAP selection through the `RandomAccessIndex`;
 * - bounded lookahead (seconds ahead of the playhead, not whole-file);
 * - back-buffer eviction on `playhead()`;
 * - read completion, stall detection, and fatal-error reporting;
 * - terminal EOS (only the terminal range, once per epoch).
 *
 * The controller depends only on injected interfaces (`RandomAccessIndex`,
 * `AppendableProducer`, `AppendSink`, `ByteSource`, `Clock`, `ErrorReporter`):
 * it imports no Sia SDK and no MSE internals. The composition root wires
 * concrete producers/indexes/MSE at construction. Fakes drive every decision
 * in tests (`clock?`, `sinkFactory?`, fake producers/indexes).
 *
 * Epoch discipline: every `start()`/`seek()` bumps the epoch; reads started
 * under an older epoch are dropped (their delivery is stopped by the
 * `ByteSource` supersede rule) and never feed the producer or request EOS.
 * `source.cancel()` on teardown unblocks a pump parked on a read.
 *
 * `endOfStream()` is the explicit host-signalled completion hook; the internal
 * pump also demands EOS when the terminal range drains.
 */

import type { AppendableProducer } from '../container/producer/appendable-producer.ts';
import type { RandomAccessIndex, RangeRead } from '../media/types.ts';
import type { AppendSink } from '../sink/append-sink.ts';
import type { ByteSource, ReadOptions } from '../transport/byte-source.ts';
import { ByteSourceSupersededError } from '../transport/byte-source.ts';
import type { Clock } from './clock.ts';
import { type ErrorReporter, failureCode, failureCondition, type PlaybackFailure } from './error-reporter.ts';

/** Fatal-failure + state-change surface the coordinator observes. */
export interface StreamController {
  /** Permanently stops the session and aborts the sink. */
  destroy(reason?: unknown): void;
  /** Explicit host-signalled completion: flushes and requests EOS once. */
  endOfStream(): void;
  /** Unsubscribes the passed state listener. */
  onStateChange(listener: (state: StreamState) => void): () => void;
  /** Reports the media playhead: drives eviction and bounded lookahead. */
  playhead(timeSeconds: number): void;
  /** Epoch-scoped seek: cancels stale work and streams from the RAP floor. */
  seek(timeSeconds: number): void;
  /** Binds one load and begins streaming from the earliest range. */
  start(load: StreamLoad): void;
  /** Current lifecycle state. */
  readonly state: StreamState;
}

/** Constructor bag for {@link createStreamController}. */
export interface StreamControllerOptions {
  /** Injectable time; deterministic (`ManualClock`) in tests. */
  readonly clock: Clock;
  /** Injectable fatal-failure reporting (maps to protocol ERROR). */
  readonly errorReporter: ErrorReporter;
  /** Seconds of media to fetch ahead of the playhead before pausing. Default 30. */
  readonly lookaheadSeconds?: number;
  /**
   * Max monotonic-clock milliseconds of silence between bytes before failing
   * as `transport:timeout`; `0` disables the controller-level stall check
   * (the Sia transport has its own watchdog). Default 0.
   */
  readonly stallTimeoutMs?: number;
}

/**
 * Everything one play session needs, independent of how the bytes were
 * produced or fetched (decoupled from `LoadResult` so the controller can be
 * unit-tested with fakes).
 */
export interface StreamLoad {
  /** Random-access index to schedule reads from; null = sequential byte-0. */
  readonly index: null | RandomAccessIndex;
  /** The producer read bytes are fed into; its output is appended to the sink. */
  readonly producer: AppendableProducer;
  /** The MSE surface produced segments are appended to. */
  readonly sink: AppendSink;
  /** The transport the ranges are read from. */
  readonly source: ByteSource;
}

/** The controller lifecycle. */
export const streamState = {
  destroyed: 'destroyed',
  ended: 'ended',
  failed: 'failed',
  idle: 'idle',
  playing: 'playing',
  starting: 'starting',
} as const;

/** The controller lifecycle. */
export type StreamState = (typeof streamState)[keyof typeof streamState];

/** Reason used when `start()` replaces an active load's sink/source. */
const SOURCE_REPLACED = 'source-replaced';

/** Default forward-buffer budget (30 s of lookahead). */
const DEFAULT_LOOKAHEAD_SECONDS = 30;

interface PendingPosition {
  readonly epoch: number;
  /** The last fully-read range; `playhead()` resumes `index.next(from)`. */
  readonly resumeFrom: null | RangeRead;
}

class GenericStreamController implements StreamController {
  get state(): StreamState {
    return this.#state;
  }

  readonly #clock: Clock;
  #destroyed = false;
  #ended = false;
  #epoch = 0;
  readonly #errorReporter: ErrorReporter;
  #load: null | StreamLoad = null;
  readonly #lookaheadSeconds: number;
  readonly #onStateChange = new Set<(state: StreamState) => void>();
  #pending: null | PendingPosition = null;
  #playheadSeconds: null | number = null;
  #producerErrorUnsub: (() => void) | null = null;
  #producerSegmentUnsub: (() => void) | null = null;
  #runInFlight = false;
  readonly #stallTimeoutMs: number;
  #state: StreamState = streamState.idle;

  constructor(options: StreamControllerOptions) {
    this.#clock = options.clock;
    this.#errorReporter = options.errorReporter;
    this.#lookaheadSeconds = options.lookaheadSeconds ?? DEFAULT_LOOKAHEAD_SECONDS;
    this.#stallTimeoutMs = options.stallTimeoutMs ?? 0;
  }

  destroy(reason?: unknown): void {
    if (this.#destroyed) return;
    this.#destroyed = true;
    this.#pending = null;
    this.#teardown(reason);
    this.#setState(streamState.destroyed);
  }

  endOfStream(): void {
    if (this.#destroyed || this.#state === streamState.failed || this.#ended) return;
    const load = this.#load;
    if (!load) return;
    this.#ended = true;
    this.#pending = null;
    load.producer.flush(this.#epoch);
    load.sink.requestEndOfStream(this.#epoch);
    this.#setState(streamState.ended);
  }

  onStateChange(listener: (state: StreamState) => void): () => void {
    this.#onStateChange.add(listener);
    return () => {
      this.#onStateChange.delete(listener);
    };
  }

  playhead(timeSeconds: number): void {
    if (this.#destroyed || this.#state === streamState.failed || !this.#load) return;
    this.#playheadSeconds = timeSeconds;
    const sink = this.#load.sink;
    void sink.evictBackBuffer(timeSeconds).catch(() => {
      // Eviction is best-effort; the pipe reports its own failures.
    });
    this.#resumeFromPending();
  }

  seek(timeSeconds: number): void {
    if (this.#destroyed || this.#state === streamState.failed || this.#state === streamState.ended || !this.#load) return;
    const load = this.#load;
    const epoch = ++this.#epoch;
    this.#pending = null;
    this.#playheadSeconds = timeSeconds;
    this.#ended = false;

    load.producer.reset(epoch);
    load.sink.resetParser(epoch);
    this.#startAt(load, epoch, this.#seekRange(load, timeSeconds));
  }

  start(load: StreamLoad): void {
    if (this.#destroyed) return;
    this.#teardown(SOURCE_REPLACED);
    this.#load = load;
    this.#ended = false;
    this.#playheadSeconds = null;

    const epoch = ++this.#epoch;
    this.#pending = null;
    load.producer.reset(epoch);
    load.sink.resetParser(epoch);
    this.#producerSegmentUnsub = load.producer.onSegment((segment) => {
      load.sink.append(segment);
    });
    this.#producerErrorUnsub = load.producer.onError((_error) => {
      this.#fail({ code: failureCode.failed, condition: failureCondition.normalization });
    });

    this.#setState(streamState.starting);
    this.#startAt(load, epoch, load.index?.first ?? sequentialRange(load.source.size));
  }

  #currentPlayhead(): null | number {
    return this.#playheadSeconds ?? this.#clock.mediaTime();
  }

  #fail(failure: PlaybackFailure): void {
    if (this.#destroyed || this.#state === streamState.failed || this.#state === streamState.ended || this.#state === streamState.destroyed) return;
    this.#pending = null;
    this.#producerErrorUnsub?.();
    this.#producerErrorUnsub = null;
    this.#setState(streamState.failed);
    this.#errorReporter.report(failure);
    const cause = 'cause' in failure ? failure.cause : undefined;
    this.#load?.sink.abort(cause);
  }

  #isEnded(): boolean {
    return this.#state === streamState.ended;
  }

  #isFailed(): boolean {
    return this.#state === streamState.failed;
  }

  #nextInBudget(from: RangeRead): null | RangeRead {
    const next = this.#load?.index?.next(from) ?? null;
    if (!next) return null;
    const playhead = this.#currentPlayhead();
    if (playhead === null) return next;
    const ahead = next.startSeconds - playhead;
    return ahead <= this.#lookaheadSeconds ? next : null;
  }

  async #readRange(epoch: number, range: RangeRead): Promise<boolean> {
    const load = this.#load;
    if (!load) return false;
    const readStartedAt = this.#clock.now();
    let lastByteAt = readStartedAt;
    const stream = load.source.read({ length: range.length, offset: range.offset }, { epoch } satisfies ReadOptions);
    const reader = stream.getReader();
    let ok = true;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        if (this.#destroyed || epoch !== this.#epoch) {
          ok = false;
          break;
        }
        const now = this.#clock.now();
        if (this.#stallTimeoutMs > 0 && now - lastByteAt > this.#stallTimeoutMs) {
          this.#fail({ cause: new Error(`no bytes for ${now - lastByteAt}ms`), code: failureCode.timeout, condition: failureCondition.transport });
          ok = false;
          break;
        }
        lastByteAt = now;
        load.producer.push(value, range.offset, epoch);
      }
    } catch (error) {
      if (this.#destroyed || epoch !== this.#epoch || isSupersededOrAbort(error)) {
        // A superseded/cancelled read is a dropped read, never a failure.
        ok = false;
      } else {
        this.#fail({ cause: error, code: failureCode.unreachable, condition: failureCondition.transport });
        ok = false;
      }
    } finally {
      void reader.cancel().catch(() => {
        /* stream already closed/errored */
      });
    }
    return ok;
  }

  #resumeFromPending(): void {
    const pending = this.#pending;
    if (!pending || pending.epoch !== this.#epoch || this.#runInFlight || this.#destroyed) return;
    const after = pending.resumeFrom ? this.#nextInBudget(pending.resumeFrom) : null;
    if (!after) return;
    this.#pending = null;
    void this.#run(this.#epoch, after);
  }

  async #run(epoch: number, start: null | RangeRead): Promise<void> {
    if (this.#destroyed || epoch !== this.#epoch || this.#isFailed()) return;
    this.#runInFlight = true;
    try {
      let at = start;
      while (
        !this.#destroyed &&
        epoch === this.#epoch &&
        !this.#isFailed() &&
        !this.#isEnded() &&
        at
      ) {
        this.#pending = { epoch, resumeFrom: at };
        const terminal = at.terminal;
        const ok = await this.#readRange(epoch, at);
        if (!ok || this.#destroyed || epoch !== this.#epoch || this.#isFailed()) return;
        if (terminal) {
          const load = this.#load;
          if (load) load.producer.flush(epoch);
          if (!this.#ended) {
            this.#ended = true;
            // An asynchronous producer (the mediabunny refragmenter) that is
            // still emitting defers EOS to its own `terminal` media segment —
            // the MSE adapter requests endOfStream when that final fragment is
            // appended, after everything that precedes it has drained. Requesting
            // EOS here instead could end an empty/partial MediaSource before its
            // media ever arrives.
            const pending = load?.producer.isPending?.() ?? false;
            if (!pending) load?.sink.requestEndOfStream(epoch);
          }
          this.#pending = null;
          this.#setState(streamState.ended);
          return;
        }
        const after = this.#nextInBudget(at);
        if (!after) {
          // Waiting: playhead() will resume `index.next(at)` once in budget.
          this.#pending = { epoch, resumeFrom: at };
          return;
        }
        at = after;
      }
    } finally {
      // Only a current-epoch run owns the in-flight flag; a superseded run
      // must not clear it underneath the replacement run that took over.
      if (epoch === this.#epoch) this.#runInFlight = false;
    }
  }

  #seekRange(load: StreamLoad, timeSeconds: number): null | RangeRead {
    const index = load.index;
    if (index) return index.seek(timeSeconds) ?? index.first;
    return sequentialRange(load.source.size);
  }

  #setState(state: StreamState): void {
    if (this.#state === state) return;
    this.#state = state;
    for (const listener of [...this.#onStateChange]) listener(state);
  }

  #startAt(load: StreamLoad, epoch: number, start: null | RangeRead): void {
    if (!start || load.source.size <= 0) {
      load.sink.requestEndOfStream(epoch);
      this.#ended = true;
      this.#setState(streamState.ended);
      return;
    }
    this.#setState(streamState.playing);
    void this.#run(epoch, start);
  }

  #teardown(reason: unknown): void {
    this.#producerSegmentUnsub?.();
    this.#producerSegmentUnsub = null;
    this.#producerErrorUnsub?.();
    this.#producerErrorUnsub = null;
    const current = this.#load;
    if (current) {
      current.sink.abort(reason);
      current.source.cancel(reason);
    }
  }
}

/** Builds a generic {@link StreamController} over injected interfaces. */
export function createStreamController(options: StreamControllerOptions): StreamController {
  return new GenericStreamController(options);
}

/** Whether a read error is a supersede/abort that must be dropped, not reported. */
function isSupersededOrAbort(error: unknown): boolean {
  if (error instanceof ByteSourceSupersededError) return true;
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    (error as { name?: unknown }).name === 'AbortError'
  );
}

/** One whole-object read for a sequential (index-less) load. */
function sequentialRange(size: number): RangeRead {
  return { endSeconds: 0, length: size, offset: 0, rap: true, startSeconds: 0, terminal: true };
}
