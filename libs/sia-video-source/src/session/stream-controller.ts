/**
 * StreamController contract + generic reference implementation: the play-side
 * session coordinator that turns one load's mediabunny conversion and sink
 * into a play session.
 *
 * Responsibilities:
 *
 * - start/seek/playhead trigger semantics;
 * - starting and tearing down the library conversion (one per play session);
 * - back-buffer eviction on `playhead()`;
 * - restarting the conversion through the playback's restart seam on `seek()`;
 * - fatal-error reporting.
 *
 * The conversion owns its reads through the transport and requests
 * end-of-stream itself once its final fragment appends; the controller only
 * observes completion and moves state. A seek restarts the conversion from
 * the requested timestamp via the playback's restart seam and has the sink
 * reset its parser, so the fresh init segment lands in a clean SourceBuffer;
 * the controller never reads bytes or resets the parser itself.
 *
 * The controller depends only on injected seams (`MediaPlayback`,
 * `AppendSink`, `ErrorReporter`): it imports no Sia SDK and no MSE internals.
 *
 * The coordinator's `loadGeneration` arrives inside `StreamLoad`; the
 * controller stamps each `start()` with it, so callbacks from a replaced
 * playback carry the older generation and are ignored — a stale conversion
 * can never end or fail a newer load.
 */

import type { MediaPlayback } from '../media/library-load.ts';
import type { AppendSink } from '../sink/append-sink.ts';
import { type ErrorReporter, failureCode, failureCondition } from './error-reporter.ts';

/** Fatal-failure + state-change surface the coordinator observes. */
export interface StreamController {
  /** Permanently stops the session, disposes the playback, aborts the sink. */
  destroy(reason?: unknown): void;
  /** Unsubscribes the passed state listener. */
  onStateChange(listener: (state: StreamState) => void): () => void;
  /** Reports the media playhead: drives back-buffer eviction. */
  playhead(timeSeconds: number): void;
  /**
   * Re-anchors the pipeline at `timeSeconds`: mirrors the playhead for
   * back-buffer eviction, then restarts the conversion from the requested
   * timestamp via the playback's restart seam and has the sink reset its
   * parser — passing the target so the fresh init segment lands in a clean
   * SourceBuffer re-anchored at the sought position. When the playback exposes
   * no restart seam (or refuses the timestamp) the seek only mirrors the
   * playhead.
   */
  seek(timeSeconds: number): void;
  /** Binds one load and starts its conversion. */
  start(load: StreamLoad): void;
  /** Current lifecycle state. */
  readonly state: StreamState;
}

/** Constructor bag for {@link createStreamController}. */
export interface StreamControllerOptions {
  /** Injectable fatal-failure reporting (maps to protocol ERROR). */
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

class GenericStreamController implements StreamController {
  get state(): StreamState {
    return this.#state;
  }

  #destroyed = false;
  readonly #errorReporter: ErrorReporter;
  #load: null | StreamLoad = null;
  #loadGeneration = 0;
  readonly #onStateChange = new Set<(state: StreamState) => void>();
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
    // playback's restart seam accepts the position, the sink's parser reset
    // makes sure the fresh init segment lands in a clean SourceBuffer
    // re-anchored at the target (its output timestamps rebase to zero). The
    // load generation stays bound and no second playback is started; a
    // playback that exposes no restart seam falls back to playhead mirroring.
    if (load.playback.restart?.(timeSeconds) === true) {
      load.sink.resetParser(load.loadGeneration, timeSeconds);
    }
  }

  start(load: StreamLoad): void {
    if (this.#destroyed) return;
    this.#teardown();
    this.#load = load;
    const loadGeneration = load.loadGeneration;
    this.#loadGeneration = loadGeneration;
    load.sink.resetParser(loadGeneration);
    this.#setState(streamState.starting);
    load.playback.start(load.sink, loadGeneration, {
      onComplete: () => this.#onComplete(loadGeneration),
      onError: (error) => this.#onError(loadGeneration, error),
    });
    this.#setState(streamState.playing);
  }

  #onComplete(loadGeneration: number): void {
    if (this.#destroyed || loadGeneration !== this.#loadGeneration || this.#state === streamState.ended || this.#state === streamState.failed) return;
    this.#setState(streamState.ended);
  }

  #onError(loadGeneration: number, error: unknown): void {
    if (this.#destroyed || loadGeneration !== this.#loadGeneration || this.#state === streamState.ended || this.#state === streamState.failed) return;
    const load = this.#load;
    if (!load) return;
    this.#setState(streamState.failed);
    this.#errorReporter.report({
      cause: error,
      code: failureCode.failed,
      condition: failureCondition.normalization,
    });
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

/** Builds a generic {@link StreamController} over injected seams. */
export function createStreamController(options: StreamControllerOptions): StreamController {
  return new GenericStreamController(options);
}
