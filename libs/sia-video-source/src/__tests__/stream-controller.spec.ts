/**
 * The `StreamController` play session: it starts one mediabunny conversion
 * over the shared input, appends its fragments to the sink, ends the stream on
 * conversion completion, and tears the load down on destroy. The controller
 * depends on injected deps (`MediaPlayback`, `AppendSink`, `ErrorReporter`),
 * so the play path is testable without Sia or a real MediaSource.
 */
import { describe, expect, it } from 'vitest';
import type { MediaPlayback } from '../media/library-load.ts';
import { ReadTransportError } from '../ranged-reader.ts';
import { type ErrorReporter, type PlaybackFailure } from '../session/error-reporter.ts';
import {
  createStreamController,
  type StreamController,
  type StreamLoad,
  type StreamState,
} from '../session/stream-controller.ts';
import type { AppendSink, AppendUnit } from '../sink/append-sink.ts';

interface Harness {
  controller: StreamController;
  errors: PlaybackFailure[];
  load: () => StreamLoad;
  playback: FakePlayback;
  sink: FakeSink;
  states: StreamState[];
}

/** One recorded sink parser reset, with the optional seek target. */
interface SinkReset {
  readonly generation: number;
  readonly target?: number;
}

/** Deterministic fake playback whose completion/error the test drives. */
class FakePlayback implements MediaPlayback {
  disposed = 0;
  generation: null | number = null;
  /** When false, `restart` refuses the seek. */
  restartEnabled = true;
  restartInvocations: number[] = [];
  sink: AppendSink | null = null;
  startInvocations = 0;
  #onComplete: (() => void) | null = null;
  #onError: ((error: unknown) => void) | null = null;

  complete(): void {
    this.#onComplete?.();
  }

  dispose(): void {
    this.disposed += 1;
  }

  fail(error: unknown): void {
    this.#onError?.(error);
  }

  restart(fromSeconds: number): boolean {
    // Latest-wins: every valid intent after start is accepted, never latched.
    if (this.disposed > 0 || this.startInvocations === 0 || !this.restartEnabled) {
      return false;
    }
    this.restartInvocations.push(fromSeconds);
    return true;
  }

  start(
    sink: AppendSink,
    loadGeneration: number,
    callbacks: { readonly onComplete: () => void; readonly onError: (error: unknown) => void },
  ): void {
    this.startInvocations += 1;
    this.sink = sink;
    this.generation = loadGeneration;
    this.#onComplete = callbacks.onComplete;
    this.#onError = callbacks.onError;
  }
}

/** Records sink calls in the order they arrived. */
class FakeSink implements AppendSink {
  aborts: unknown[] = [];
  eos: number[] = [];
  evictions: number[] = [];
  resets: SinkReset[] = [];

  abort(reason?: unknown): void {
    this.aborts.push(reason);
  }

  append(_unit: AppendUnit): void {
    // Appends are exercised through the playback/sink path, not this controller.
  }

  evictBackBuffer(timeSeconds: number): Promise<boolean> {
    this.evictions.push(timeSeconds);
    return Promise.resolve(true);
  }

  requestEndOfStream(loadGeneration: number): void {
    this.eos.push(loadGeneration);
  }

  resetParser(loadGeneration: number, targetTimeSeconds?: number): void {
    this.resets.push(
      targetTimeSeconds === undefined ? { generation: loadGeneration } : { generation: loadGeneration, target: targetTimeSeconds },
    );
  }
}

function harness(): Harness {
  const playback = new FakePlayback();
  const sink = new FakeSink();
  const errors: PlaybackFailure[] = [];
  const reporter: ErrorReporter = {
    report: (failure) => {
      errors.push(failure);
    },
  };
  const controller = createStreamController({ errorReporter: reporter });
  const states: StreamState[] = [];
  controller.onStateChange((state) => states.push(state));
  return { controller, errors, load: () => ({ loadGeneration: 1, playback, sink }), playback, sink, states };
}

describe('StreamController', () => {
  it('starts the conversion once and ends the stream on completion', () => {
    const h = harness();
    h.controller.start(h.load());

    expect(h.playback.startInvocations).toBe(1);
    expect(h.playback.generation).toBe(1);
    // The start reset carries no target: no seek target is recorded.
    expect(h.sink.resets).toEqual([{ generation: 1 }]);
    expect(h.states).toContain('starting');
    expect(h.states).toContain('playing');

    h.playback.complete();

    expect(h.controller.state).toBe('ended');
    expect(h.states.at(-1)).toBe('ended');
    // End-of-stream belongs to MediaPlayback; the controller only moves state.
    expect(h.sink.eos).toEqual([]);
    expect(h.errors).toEqual([]);
  });

  it('ignores completion and errors from a replaced playback generation', () => {
    const h = harness();
    h.controller.start(h.load());

    const replacement = new FakePlayback();
    h.controller.start({ loadGeneration: 2, playback: replacement, sink: h.sink });

    expect(h.playback.disposed).toBe(1);
    expect(replacement.startInvocations).toBe(1);
    expect(replacement.generation).toBe(2);

    // The first playback's callbacks still fire with the older generation.
    h.playback.complete();
    h.playback.fail(new Error('stale'));

    expect(h.controller.state).toBe('playing');
    expect(h.errors).toEqual([]);

    replacement.complete();

    expect(h.controller.state).toBe('ended');
  });

  it('reports one normalization failure and aborts the sink', () => {
    const h = harness();
    h.controller.start(h.load());

    h.playback.fail(new Error('engine failed'));
    h.playback.fail(new Error('again'));

    expect(h.controller.state).toBe('failed');
    expect(h.errors).toHaveLength(1);
    expect(h.errors[0].condition).toBe('normalization');
    expect(h.errors[0].code).toBe('failed');
    expect(h.sink.aborts).toHaveLength(1);
  });

  it('carries the underlying Error message into the normalization failure detail', () => {
    // The bare `normalization:failed` the host previously saw hid the real
    // cause (e.g. a failed ranged read). #onError must forward the underlying
    // message as `detail` so error-reporter's describeFailure names it on the
    // wire (`normalization:failed (Sia SDK read ended before ...)`).
    const h = harness();
    h.controller.start(h.load());

    h.playback.fail(new Error('Sia SDK read ended before the requested range was delivered'));

    expect(h.errors).toHaveLength(1);
    const reported = h.errors[0];
    // Narrow the failure union to the normalization variant #onError emits, so
    // the `cause`/`detail` fields it owns are type-checked.
    if (reported.condition === 'normalization') {
      expect(reported.code).toBe('failed');
      expect(reported.detail).toBe('Sia SDK read ended before the requested range was delivered');
      expect(reported.cause).toBeInstanceOf(Error);
    } else {
      throw new Error(`expected a normalization failure, got ${reported.condition}`);
    }
  });

  it('reports a transport-tagged failure as condition transport with the detail retained', () => {
    // A ReadTransportError (a ranged-read failure that exhausted its retry
    // budget, possibly wrapped by an intermediate layer) is a distinct
    // condition: error-reporter maps it to the host's `network` recovery kind.
    const transport = new ReadTransportError('Sia SDK ranged read failed after 3 attempts (expected 65536 bytes at 0)', {
      attempts: 3,
      cause: new Error('Sia SDK read ended before the requested range was delivered'),
      expectedBytes: 65536,
      position: 0,
    });

    // Direct instance: classified as transport.
    const direct = harness();
    direct.controller.start(direct.load());
    direct.playback.fail(transport);
    expect(direct.controller.state).toBe('failed');
    expect(direct.errors).toHaveLength(1);
    const directReport = direct.errors[0];
    if (directReport.condition === 'transport') {
      expect(directReport.code).toBe('failed');
      expect(directReport.detail).toMatch(/failed after 3 attempts/);
      expect(directReport.cause).toBe(transport);
    } else {
      throw new Error(`expected a transport failure, got ${directReport.condition}`);
    }
    expect(direct.sink.aborts).toHaveLength(1);

    // A wrapped transport error (Error with the transport as `cause`) must
    // still classify as transport — the cause-walk reaches it.
    const wrapped = harness();
    wrapped.controller.start(wrapped.load());
    wrapped.playback.fail(new Error('conversion failed', { cause: transport }));
    expect(wrapped.errors).toHaveLength(1);
    const wrappedReport = wrapped.errors[0];
    if (wrappedReport.condition === 'transport') {
      expect(wrappedReport.detail).toBe('conversion failed');
    } else {
      throw new Error(`expected a transport failure, got ${wrappedReport.condition}`);
    }
  });

  it('still reports an ordinary conversion failure as normalization', () => {
    // A non-transport conversion failure (the engine broke, not the transport)
    // must stay on the normalization path → `unsupported`, never the network
    // recovery kind, even when it loosely mentions a read.
    const h = harness();
    h.controller.start(h.load());

    h.playback.fail(new Error('muxer rejected a packet'));

    expect(h.errors).toHaveLength(1);
    const reported = h.errors[0];
    if (reported.condition === 'normalization') {
      expect(reported.code).toBe('failed');
      expect(reported.detail).toBe('muxer rejected a packet');
    } else {
      throw new Error(`expected a normalization failure, got ${reported.condition}`);
    }
  });

  it('suppresses completion and errors after destroy', () => {
    const h = harness();
    h.controller.start(h.load());

    h.controller.destroy();
    h.controller.playhead(9);
    h.playback.complete();
    h.playback.fail(new Error('late'));

    expect(h.controller.state).toBe('destroyed');
    expect(h.sink.eos).toEqual([]);
    expect(h.sink.evictions).toEqual([]);
    expect(h.errors).toEqual([]);
    expect(h.playback.disposed).toBe(1);
    expect(h.sink.aborts).toHaveLength(1);
  });

  it('destroys the playback and aborts the sink exactly once', () => {
    const h = harness();
    h.controller.start(h.load());

    h.controller.destroy();
    h.controller.destroy();

    expect(h.playback.disposed).toBe(1);
    expect(h.sink.aborts).toHaveLength(1);
  });

  it('a seek evicts the back buffer and restarts the conversion at the target time', () => {
    const h = harness();
    h.controller.start(h.load());

    h.controller.playhead(12);
    expect(h.sink.evictions).toEqual([12]);

    h.controller.seek(45);
    expect(h.sink.evictions).toEqual([12, 45]);

    // The seek restarted the conversion from the requested timestamp through
    // the playback's `restart` and had the sink reset its parser so the fresh
    // init segment lands in a clean SourceBuffer repointed at the target (the
    // trim rebases output timestamps to zero). No second playback was started
    // and no end-of-stream was issued.
    expect(h.playback.restartInvocations).toEqual([45]);
    expect(h.sink.resets).toEqual([{ generation: 1 }, { generation: 1, target: 45 }]);
    expect(h.playback.startInvocations).toBe(1);
    expect(h.sink.eos).toEqual([]);
    expect(h.controller.state).toBe('playing');
  });

  it('passes the seek target through to the sink reset when the restart is accepted', () => {
    const h = harness();
    h.controller.start(h.load());

    h.controller.seek(45);

    expect(h.sink.resets).toEqual([{ generation: 1 }, { generation: 1, target: 45 }]);
  });

  it('seeks back-to-back: every accepted restart passes its own target', () => {
    const h = harness();
    h.controller.start(h.load());

    h.controller.seek(30);
    h.controller.seek(90);

    // Each accepted seek resets the parser at its own target; only refused
    // (or absent) restarts leave the prior reset as the last one.
    expect(h.sink.resets).toEqual([
      { generation: 1 },
      { generation: 1, target: 30 },
      { generation: 1, target: 90 },
    ]);
    expect(h.playback.restartInvocations).toEqual([30, 90]);
  });

  it('when a restart is refused, the seek only trims the back buffer', () => {
    const h = harness();
    h.controller.start(h.load());
    expect(h.sink.resets).toEqual([{ generation: 1 }]);

    // A restart that refuses the seek reports false.
    h.playback.restartEnabled = false;
    h.controller.seek(60);

    // Eviction still ran; restart and the second parser reset did not.
    expect(h.sink.evictions).toEqual([60]);
    expect(h.playback.restartInvocations).toEqual([]);
    expect(h.sink.resets).toEqual([{ generation: 1 }]);
    expect(h.playback.startInvocations).toBe(1);
    expect(h.sink.eos).toEqual([]);
    expect(h.controller.state).toBe('playing');
  });

  it('a restart keeps the same load generation', () => {
    const h = harness();
    h.controller.start(h.load());
    expect(h.playback.startInvocations).toBe(1);

    expect(h.playback.restart(90)).toBe(true);
    expect(h.playback.restartInvocations).toEqual([90]);

    // The restarted run reuses the original start callbacks and generation.
    h.playback.complete();

    expect(h.controller.state).toBe('ended');
    expect(h.playback.generation).toBe(1);
    expect(h.sink.resets).toEqual([{ generation: 1 }]);
    expect(h.errors).toEqual([]);
  });

  it('restarts are refused before start and after destroy, and accepted while live', () => {
    const h = harness();
    expect(h.playback.restart(10)).toBe(false);

    h.controller.start(h.load());
    expect(h.playback.restart(10)).toBe(true);
    // Latest-wins: an in-flight restart no longer drops the next seek.
    expect(h.playback.restart(20)).toBe(true);

    h.controller.destroy();
    expect(h.playback.restart(30)).toBe(false);
  });
});
