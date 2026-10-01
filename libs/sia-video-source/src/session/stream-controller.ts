/**
 * StreamController: the play-side session coordinator that turns one load's
 * mediabunny conversion and sink into a play session.
 *
 * Responsibilities:
 *
 * - start/seek/playhead trigger semantics;
 * - starting and tearing down the library conversion (one per play session);
 * - back-buffer eviction on `playhead()`;
 * - failure reporting, which receives the failed run's origin (initial
 *   sequential vs seek-restart) and, for a seek-restart run, the trim
 *   target the run was prepared at: a raw shard-shortage failure from a
 *   seek-restart run reports the reserved seek-target/data-unavailable
 *   failure (`unavailable` wire kind, carrying the trim target as `time`
 *   when the run names one) and stays NONFATAL; the session keeps its
 *   `playing` state and its live sink, so the host's follow-up seek can
 *   restart the conversion into the same sink. From the initial run, and
 *   every other condition, the fatal mapping applies (state `failed`,
 *   sink aborted, playback disposed on teardown).
 *
 * The conversion drives its own reads through the transport and requests
 * end-of-stream itself once its final fragment appends; the controller only
 * observes completion and moves state. A seek restarts the conversion from
 * the requested timestamp via the playback's `restart` and has the sink
 * reset its parser, so the fresh init segment lands in a clean SourceBuffer;
 * the controller never reads bytes or resets the parser itself.
 *
 * The controller depends only on injected deps (`MediaPlayback`,
 * `AppendSink`, `ErrorReporter`): it imports no Sia SDK and no MSE internals.
 *
 * The coordinator's `loadGeneration` arrives inside `StreamLoad`; the
 * controller stamps each `start()` with it, so callbacks from a replaced
 * playback carry the older generation and are ignored — a stale conversion
 * can never end or fail a newer load.
 */

import type { ConversionRunOrigin, MediaPlayback } from '../media/library-load.ts';
import { isShardShortageError, isTransportReadError } from '../ranged-reader.ts';
import type { AppendSink } from '../sink/append-sink.ts';
import { type ErrorReporter, failureCode, failureCondition, type PlaybackFailure } from './error-reporter.ts';

/** Failure + state-change surface the coordinator observes. */
export interface StreamController {
  /** Permanently stops the session, disposes the playback, aborts the sink. */
  destroy(reason?: unknown): void;
  /** Unsubscribes the passed state listener. */
  onStateChange(listener: (state: StreamState) => void): () => void;
  /** Reports the media playhead: drives back-buffer eviction. */
  playhead(timeSeconds: number): void;
  /**
   * Seeks to `timeSeconds`: reports the playhead for back-buffer eviction,
   * then restarts the conversion from the requested timestamp via the
   * playback's `restart` and has the sink reset its parser — passing the
   * target so the fresh init segment lands in a clean SourceBuffer at the
   * sought position. An accepted restart clears the nonfatal seek-fault
   * latch so the replacement run's own failure reports again. When the
   * playback exposes no restart (or refuses the timestamp) the seek only
   * reports the playhead.
   */
  seek(timeSeconds: number): void;
  /** Binds one load and starts its conversion. */
  start(load: StreamLoad): void;
  /** Current lifecycle state. */
  readonly state: StreamState;
}

/** Constructor bag for {@link createStreamController}. */
export interface StreamControllerOptions {
  /** Injectable failure reporting (maps to protocol ERROR). */
  readonly errorReporter: ErrorReporter;
}

/**
 * Everything one play session needs. Cancellation of the shared source is
 * owned by the Input/CustomSource disposal path, not by this controller.
 */
export interface StreamLoad {
  /**
   * The coordinator's load generation for this load; stamped through the sink
   * and playback so stale (superseded) callbacks are ignored.
   */
  readonly loadGeneration: number;
  /** The mediabunny conversion that appends fragments into `sink`. */
  readonly playback: MediaPlayback;
  /** The MSE surface produced segments are appended to. */
  readonly sink: AppendSink;
}

/** The controller state set. */
export const streamState = {
  destroyed: 'destroyed',
  ended: 'ended',
  failed: 'failed',
  idle: 'idle',
  playing: 'playing',
  starting: 'starting',
} as const;

/** The controller state set. */
export type StreamState = (typeof streamState)[keyof typeof streamState];

class GenericStreamController implements StreamController {
  get state(): StreamState {
    return this.#state;
  }

  #destroyed = false;
  readonly #errorReporter: ErrorReporter;
  #load: null | StreamLoad = null;
  #loadGeneration = 0;
  readonly #onStateChange = new Set<(state: StreamState) => void>();
  // Latches one nonfatal seek-target report per failed run so a repeat
  // failure from the same dead run is not re-posted before the follow-up
  // seek restarts the conversion (which clears the latch).
  #seekFaultReported = false;
  #state: StreamState = streamState.idle;

  constructor(options: StreamControllerOptions) {
    this.#errorReporter = options.errorReporter;
  }

  destroy(reason?: unknown): void {
    if (this.#destroyed) return;
    this.#destroyed = true;
    this.#teardown(reason);
    this.#setState(streamState.destroyed);
  }

  onStateChange(listener: (state: StreamState) => void): () => void {
    this.#onStateChange.add(listener);
    return () => {
      this.#onStateChange.delete(listener);
    };
  }

  playhead(timeSeconds: number): void {
    if (this.#destroyed || this.#state === streamState.failed || !this.#load) return;
    void this.#load.sink.evictBackBuffer(timeSeconds).catch(() => {
      // Eviction is best-effort; the sink reports its own failures.
    });
  }

  seek(timeSeconds: number): void {
    if (this.#destroyed || this.#state === streamState.failed || !this.#load) return;
    const load = this.#load;
    void load.sink.evictBackBuffer(timeSeconds).catch(() => {
      // Eviction is best-effort; the sink reports its own failures.
    });
    // A seek restarts the conversion from the requested timestamp: when the
    // playback's restart accepts the position, the sink's parser reset makes
    // sure the fresh init segment lands in a clean SourceBuffer at the target
    // (its output timestamps rebase to zero). The load generation stays bound
    // and no second playback is started; a playback that exposes no restart
    // only reports the playhead.
    if (load.playback.restart?.(timeSeconds) === true) {
      // The replacement run is fresh: allow its own failure to report.
      this.#seekFaultReported = false;
      load.sink.resetParser(load.loadGeneration, timeSeconds);
    }
  }

  start(load: StreamLoad): void {
    if (this.#destroyed) return;
    this.#teardown();
    this.#load = load;
    const loadGeneration = load.loadGeneration;
    this.#loadGeneration = loadGeneration;
    // A new load is a new run: any earlier seek-fault report is stale.
    this.#seekFaultReported = false;
    load.sink.resetParser(loadGeneration);
    this.#setState(streamState.starting);
    load.playback.start(load.sink, loadGeneration, {
      onComplete: () => this.#onComplete(loadGeneration),
      onError: (error, origin, targetSeconds) => this.#onError(loadGeneration, error, origin, targetSeconds),
    });
    this.#setState(streamState.playing);
  }

  /**
   * Classifies a failed run's error into the `PlaybackFailure` domain:
   *
   * - a transport/ranged-read failure (a `ReadTransportError` that already
   *   exhausted its retry budget, possibly wrapped by an intermediate layer)
   *   is a distinct condition, not a normalization slip; error-reporter maps
   *   it to the `network` wire kind so the HOST can run its reload recovery,
   *   regardless of which run produced it;
   * - a raw shard-shortage failure (ranged-reader surfaces it unwrapped: a
   *   data-availability gap no retry can close) is the one case where the
   *   run's origin matters. From a seek-restart run the requested seek
   *   target cannot be serviced, so it reports the reserved `seekTarget` /
   *   `data-unavailable` failure (the `unavailable` wire kind, nonfatal)
   *   naming the run's trim target as `time` when the run has one; that
   *   value is the position the failed conversion was trimmed at, never one
   *   read out of the error. From the initial run there is no seek target to
   *   name, so it maps through `normalization` to `unsupported` (fatal, no
   *   auto-reload) and carries no `time`;
   * - everything else is a genuine conversion failure, reported as
   *   `normalization`, which maps to `unsupported`.
   *
   * The underlying cause's message rides as `detail` either way, so the wire
   * context (via error-reporter's describeFailure) names the real failure
   * instead of a bare `normalization:failed` / `transport:failed` /
   * `seek-target:data-unavailable`.
   *
   * `targetSeconds` is the trim target the failed run was prepared at (only
   * seek-restart runs have one); it reaches the seek-target failure as
   * `time` when present and never reaches the transport or normalization
   * variants.
   */
  #failureFor(error: unknown, origin: ConversionRunOrigin, targetSeconds?: number): PlaybackFailure {
    const detail = error instanceof Error ? error.message : String(error);
    if (isTransportReadError(error)) {
      return { cause: error, code: failureCode.failed, condition: failureCondition.transport, detail };
    }
    if (origin === 'seek-restart' && isShardShortageError(error)) {
      if (targetSeconds === undefined) {
        return { cause: error, code: failureCode.dataUnavailable, condition: failureCondition.seekTarget, detail };
      }
      return { cause: error, code: failureCode.dataUnavailable, condition: failureCondition.seekTarget, detail, time: targetSeconds };
    }
    return { cause: error, code: failureCode.failed, condition: failureCondition.normalization, detail };
  }

  #onComplete(loadGeneration: number): void {
    if (this.#destroyed || loadGeneration !== this.#loadGeneration || this.#state === streamState.ended || this.#state === streamState.failed) return;
    this.#setState(streamState.ended);
  }

  #onError(loadGeneration: number, error: unknown, origin: ConversionRunOrigin, targetSeconds?: number): void {
    if (this.#destroyed || loadGeneration !== this.#loadGeneration || this.#state === streamState.ended || this.#state === streamState.failed) return;
    const load = this.#load;
    if (!load) return;
    const failure = this.#failureFor(error, origin, targetSeconds);
    if (failure.condition === failureCondition.seekTarget) {
      // The session stays live on this outcome (no `failed` transition,
      // sink and playback untouched) so the host's follow-up seek restarts
      // the conversion into the same sink. One report per failed run; the
      // latch clears on the next accepted restart (or new load).
      if (this.#seekFaultReported) return;
      this.#seekFaultReported = true;
      this.#errorReporter.report(failure);
      return;
    }
    // Fatal path: the session fails, the sink is aborted, and the playback
    // is released by the coordinator's teardown.
    this.#seekFaultReported = false;
    this.#setState(streamState.failed);
    this.#errorReporter.report(failure);
    load.sink.abort(error);
  }

  #setState(state: StreamState): void {
    if (this.#state === state) return;
    this.#state = state;
    for (const listener of [...this.#onStateChange]) listener(state);
  }

  #teardown(reason?: unknown): void {
    const current = this.#load;
    this.#load = null;
    if (!current) return;
    current.playback.dispose();
    current.sink.abort(reason);
  }
}

/** Builds a generic {@link StreamController} over injected dependencies. */
export function createStreamController(options: StreamControllerOptions): StreamController {
  return new GenericStreamController(options);
}
