/**
 * Tail/far-seek clamping in `library-load`: a `restart()` whose target sits at
 * or beyond the media's last sample must never end as an "incomplete CMAF
 * stream" — the driver pulls the target inside the last reachable fragment and
 * serves the fragment that CONTAINS it, instead of erroring and surfacing a
 * decode-class failure to the host.
 *
 * Two layers:
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
 */
import { describe, expect, it } from 'vitest';
import type { PlaybackCapabilities } from '../capabilities/browser-capabilities.ts';
import { clampSeekTarget, inspectMediaLibrary, type ReadyMediaLoad } from '../media/library-load.ts';
import type { AppendSink, AppendUnit } from '../sink/append-sink.ts';
import { MemoryByteSource } from '../transport/memory-byte-source.ts';
import { progressiveMp4Fixture } from './fixtures/progressive-mp4-fixture.ts';

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
});
