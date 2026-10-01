/**
 * Tail/far-seek clamping in `library-load`: a `restart()` whose target sits at
 * or beyond the media's last sample must never end as an "incomplete CMAF
 * stream" — the driver pulls the target inside the last reachable fragment and
 * serves the fragment that CONTAINS it, instead of erroring and surfacing a
 * decode-class failure to the host.
 *
 * Three layers:
 *
 * - `clampSeekTarget` — a pure function: a target past the servable end is
 *   pulled back inside the last fragment (still as close to the tail as the
 *   media allows); a target within the media is untouched; a trivially short
 *   media never clamps below zero.
 *
 * - The real mediabunny pipeline over the committed progressive fixture: a
 *   restart to a timestamp far past the object ends (`duration + 500 s`) and
 *   one at the exact metadata-duration boundary yield a re-emitted init plus
 *   the containing tail media fragment and a clean completion — never an
 *   "incomplete CMAF stream" error — so the clamp keeps the seek serviceable
 *   end to end.
 *
 * - A clamped restart whose second (clamped) preparation fails reports the
 *   clamped trim target to the playback's error callback, not the raw seek
 *   target the clamp pulled back.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PlaybackCapabilities } from '../capabilities/browser-capabilities.ts';
import {
  clampSeekTarget,
  type ConversionRunOrigin,
  inspectMediaLibrary,
  type ReadyMediaLoad,
} from '../media/library-load.ts';
import type { AppendSink, AppendUnit } from '../sink/append-sink.ts';
import { MemoryByteSource } from '../transport/memory-byte-source.ts';
import { progressiveMp4Fixture } from './fixtures/progressive-mp4-fixture.ts';

/**
 * Fault injection for `Conversion.init`, counted by call. The shared input
 * caches every range it has read, so a restart's preparations never touch the
 * ByteSource again and a source-level fault cannot reach the clamped prepare;
 * failing the Nth init is the only seam that lands on a chosen preparation.
 */
const initFault = vi.hoisted(() => ({ calls: 0, failAtCall: 0 }));

vi.mock('mediabunny', async (importOriginal) => {
  const actual = await importOriginal<typeof import('mediabunny')>();
  return {
    ...actual,
    Conversion: {
      ...actual.Conversion,
      init: (options: Parameters<typeof actual.Conversion.init>[0]) => {
        initFault.calls += 1;
        if (initFault.failAtCall > 0 && initFault.calls === initFault.failAtCall) {
          throw new Error('injected clamped-prepare failure');
        }
        return actual.Conversion.init(options);
      },
    },
  };
});

beforeEach(() => {
  initFault.calls = 0;
  initFault.failAtCall = 0;
});

/** Seconds of media in the built fixture. */
const FIXTURE_SECONDS = 120;

/** How far inside the servable end a seek may still point (see library-load). */
const SEEK_TAIL_GUARD_SECONDS = 0.25;

/** Records appends, end-of-stream calls, and aborts in arrival order. */
class RecordingSink implements AppendSink {
  readonly aborts: unknown[] = [];
  readonly eos: number[] = [];
  readonly resets: number[] = [];
  readonly units: AppendUnit[] = [];

  abort(reason?: unknown): void {
    this.aborts.push(reason);
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

/** Inspects the fixture and returns the ready load's playback and duration. */
async function loadPlayback(): Promise<{ readonly durationSeconds: number; readonly playback: ReadyMediaLoad['playback'] }> {
  const result = await inspectMediaLibrary(new MemoryByteSource(progressiveMp4Fixture({ seconds: FIXTURE_SECONDS })), {
    capabilities: permissiveCapabilities(),
  });
  expect(result.status).toBe('ready');
  const load = result as ReadyMediaLoad;
  // The fixture carries metadata duration, so the ready load always reports
  // one; narrow the nullable field for the seek-target math below.
  expect(load.durationSeconds).not.toBeNull();
  return { durationSeconds: load.durationSeconds!, playback: load.playback };
}

/** Fast, permissive capability snapshot matching the other pipeline specs. */
function permissiveCapabilities(): PlaybackCapabilities {
  return {
    canConstructWorkerMse: () => false,
    mayDecode: () => ({ decodable: true } as never),
    mseImpl: () => ({ canConstructInDedicatedWorker: false, impl: 'standard', managed: false }),
    mseSupported: () => true,
    webCodecsAvailable: () => false,
    workerHandleAvailable: () => false,
  };
}

/** Media units appended strictly after the run's own init segment. */
function unitsAfterInit(units: readonly AppendUnit[], initIndex: number): AppendUnit[] {
  return units.slice(initIndex + 1);
}

/** Polls until `predicate` holds or `timeoutMs` elapses. */
async function waitFor(predicate: () => boolean, timeoutMs = 10000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!predicate()) {
    if (Date.now() > deadline) throw new Error('timed out waiting for the conversion to settle');
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

describe('clampSeekTarget', () => {
  it('leaves a target inside the servable media untouched', () => {
    expect(clampSeekTarget(30, 120)).toBe(30);
    expect(clampSeekTarget(0, 120)).toBe(0);
    expect(clampSeekTarget(119.5, 120)).toBe(119.5);
  });

  it('pulls a target at or past the last sample inside the last reachable fragment', () => {
    // 120 s of media → the last reachable fragment guard leaves 0.25 s for the
    // clamp; any request beyond it must land exactly on the guarded boundary.
    const guarded = 120 - SEEK_TAIL_GUARD_SECONDS;
    expect(clampSeekTarget(120, 120)).toBe(guarded);
    expect(clampSeekTarget(121, 120)).toBe(guarded);
    expect(clampSeekTarget(500, 120)).toBe(guarded);
  });

  it('never clamps below zero, even for a trivially short media', () => {
    expect(clampSeekTarget(500, 0.1)).toBe(0);
    expect(clampSeekTarget(500, 0)).toBe(0);
  });
});

describe('tail/far seek restart serves the containing fragment instead of failing', () => {
  it('a restart far past the last sample completes with the containing tail fragment', async () => {
    const { durationSeconds, playback } = await loadPlayback();
    expect(durationSeconds).not.toBeNull();
    expect(durationSeconds).toBeGreaterThan(FIXTURE_SECONDS - 1);
    const sink = new RecordingSink();
    const errors: unknown[] = [];
    let completed = 0;

    playback.start(sink, 2, {
      onComplete: () => {
        completed += 1;
      },
      onError: (error) => {
        errors.push(error);
      },
    });
    await waitFor(() => sink.eos.length >= 1);

    // A target hundreds of seconds past the object's real end: the driver must
    // clamp it into the last reachable fragment rather than trimming to
    // nothing.
    expect(playback.restart?.(durationSeconds + 500)).toBe(true);
    await waitFor(() => sink.eos.length >= 2);

    expect(errors).toEqual([]);
    expect(completed).toBeGreaterThanOrEqual(1);
    expect(sink.eos.length).toBeGreaterThanOrEqual(2);

    // The restarted run re-emitted its own init, then a containing tail media
    // fragment — never an empty stream.
    const initIndices: number[] = [];
    sink.units.forEach((unit, index) => {
      if (unit.kind === 'init') initIndices.push(index);
    });
    expect(initIndices.length).toBe(2);
    const restartUnits = unitsAfterInit(sink.units, initIndices[1]);
    expect(restartUnits.some((unit) => unit.kind === 'media')).toBe(true);

    playback.dispose();
  });

  it('a restart at the exact metadata-duration boundary serves the last fragment too', async () => {
    const { durationSeconds, playback } = await loadPlayback();
    const sink = new RecordingSink();
    const errors: unknown[] = [];

    playback.start(sink, 3, {
      onComplete: () => undefined,
      onError: (error) => {
        errors.push(error);
      },
    });
    await waitFor(() => sink.eos.length >= 1);

    expect(playback.restart?.(durationSeconds)).toBe(true);
    await waitFor(() => sink.eos.length >= 2);

    expect(errors).toEqual([]);
    const initIndices: number[] = [];
    sink.units.forEach((unit, index) => {
      if (unit.kind === 'init') initIndices.push(index);
    });
    expect(initIndices.length).toBe(2);
    expect(unitsAfterInit(sink.units, initIndices[1]).some((unit) => unit.kind === 'media')).toBe(true);

    playback.dispose();
  });

  it('a restart well inside the media keeps the run armed at the requested target', async () => {
    const { durationSeconds, playback } = await loadPlayback();
    const sink = new RecordingSink();
    const errors: unknown[] = [];
    let completed = 0;

    playback.start(sink, 4, {
      onComplete: () => {
        completed += 1;
      },
      onError: (error) => {
        errors.push(error);
      },
    });
    await waitFor(() => sink.eos.length >= 1);

    // A target deep inside the media cannot clear the true end, so the driver
    // must keep the already-armed raw replacement (the deferred true-end query
    // is a no-op clamp) and never fall back to a re-armed clamped run.
    const inside = FIXTURE_SECONDS / 4;
    expect(inside).toBeLessThan(durationSeconds);
    expect(playback.restart?.(inside)).toBe(true);
    await waitFor(() => sink.eos.length >= 2);

    expect(errors).toEqual([]);
    expect(completed).toBeGreaterThanOrEqual(1);
    expect(sink.eos.length).toBeGreaterThanOrEqual(2);

    const initIndices: number[] = [];
    sink.units.forEach((unit, index) => {
      if (unit.kind === 'init') initIndices.push(index);
    });
    expect(initIndices.length).toBe(2);
    expect(unitsAfterInit(sink.units, initIndices[1]).some((unit) => unit.kind === 'media')).toBe(true);

    playback.dispose();
  });

  it('a clamped restart whose second prepare fails reports the clamped target, not the raw seek target', async () => {
    // Fail the third Conversion.init: the first is the initial run, the
    // second the raw replacement armed at the requested target, the third the
    // clamped re-arm the driver arms after the true-end query resolves.
    initFault.failAtCall = 3;
    const { durationSeconds, playback } = await loadPlayback();
    const sink = new RecordingSink();
    const errors: {
      readonly error: unknown;
      readonly origin: ConversionRunOrigin;
      readonly targetSeconds: number | undefined;
    }[] = [];

    playback.start(sink, 5, {
      onComplete: () => undefined,
      onError: (error, origin, targetSeconds) => {
        errors.push({ error, origin, targetSeconds });
      },
    });
    await waitFor(() => sink.eos.length >= 1);

    const raw = durationSeconds + 500;
    expect(playback.restart?.(raw)).toBe(true);
    await waitFor(() => errors.length >= 1);

    // The failed run is the clamped re-arm: a seek-restart origin and the
    // clamped trim target the run was prepared at, not the raw request that
    // cleared the media's true end.
    expect(errors.length).toBe(1);
    expect((errors[0].error as Error).message).toBe('injected clamped-prepare failure');
    expect(errors[0].origin).toBe('seek-restart');
    expect(errors[0].targetSeconds).toBe(durationSeconds - SEEK_TAIL_GUARD_SECONDS);
    expect(errors[0].targetSeconds).not.toBe(raw);

    playback.dispose();
  });
});
