/**
 * Behavior spec for the restartable conversion seam on the ready playback:
 * `restart(seconds)` cancels the current conversion, arms a new one trimmed
 * near the seek point over the same input, re-emits its init segment for the
 * freshly-reset SourceBuffer, and keeps the superseded run out of the sink.
 * Runs against the real mediabunny pipeline over the deterministic MP4
 * fixture. The fixture's eager single-range read makes `execute` resolve on
 * the next tick, so the initial run finishes before the restart; the seam's
 * in-flight cancellation still covers a mid-read Sia object, and its
 * observable contract (guard, re-init, trim, per-run completion) is verified
 * here.
 */
import { describe, expect, it } from 'vitest';
import type { PlaybackCapabilities } from '../capabilities/browser-capabilities.ts';
import { inspectMediaLibrary, type MediaPlayback, type ReadyMediaLoad } from '../media/library-load.ts';
import type { AppendSink, AppendUnit } from '../sink/append-sink.ts';
import type { ByteRange, ByteSource, ReadOptions } from '../transport/byte-source.ts';
import { MemoryByteSource } from '../transport/memory-byte-source.ts';
import { mediabunnyMp4FixtureBytes } from './fixtures/mediabunny-mp4-fixture.ts';

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

/** The append-kind sequence of a unit window. */
function kinds(units: readonly AppendUnit[]): string[] {
  return units.map((unit) => unit.kind);
}

/** Inspects the fixture and returns the runnable playback of the ready load. */
async function loadPlayback(): Promise<MediaPlayback> {
  const result = await inspectMediaLibrary(new MemoryByteSource(mediabunnyMp4FixtureBytes()), {
    capabilities: permissiveCapabilities(),
  });
  expect(result.status).toBe('ready');
  return (result as ReadyMediaLoad).playback;
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
async function waitFor(predicate: () => boolean, timeoutMs = 8000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!predicate()) {
    if (Date.now() > deadline) throw new Error('timed out waiting for the conversion to settle');
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

/** Bytes served per paced chunk; small enough to spread the conversion out. */
const SOURCE_CHUNK_SIZE = 256;

/** Macrotask gap between served source chunks; keeps the conversion yieldable. */
const SOURCE_CHUNK_GAP_MS = 10;

/**
 * Serves the fixture bytes over MANY macrotask gaps, so a real mediabunny
 * conversion stays yieldable: a rapid seek lands while a prior run is still
 * reading, which is exactly the window quick user seeks race through.
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

/** Inspects the fixture through the paced transport and returns its playback. */
async function loadGatedPlayback(): Promise<MediaPlayback> {
  const result = await inspectMediaLibrary(new GatedByteSource(mediabunnyMp4FixtureBytes()), {
    capabilities: permissiveCapabilities(),
  });
  expect(result.status).toBe('ready');
  return (result as ReadyMediaLoad).playback;
}

describe('MediaPlayback.restart', () => {
  it('returns false before start and after dispose', async () => {
    const playback = await loadPlayback();
    expect(playback.restart?.(10)).toBe(false);

    const sink = new RecordingSink();
    playback.start(sink, 1, { onComplete: () => undefined, onError: () => undefined });
    await waitFor(() => sink.eos.length === 1);
    playback.dispose();

    expect(playback.restart?.(10)).toBe(false);
  });

  it('accepts every valid seek and lets only the latest run emit (latest-wins)', async () => {
    const playback = await loadGatedPlayback();
    const sink = new RecordingSink();
    let completed = 0;
    const errors: unknown[] = [];
    playback.start(sink, 4, {
      onComplete: () => {
        completed += 1;
      },
      onError: (error) => {
        errors.push(error);
      },
    });

    // Rapid triple seek while the initial run is still reading: every valid
    // intent is accepted (the old in-flight latch dropped the later seeks, so
    // the playhead could never reach the newest position).
    expect(playback.restart?.(30)).toBe(true);
    expect(playback.restart?.(60)).toBe(true);
    expect(playback.restart?.(90)).toBe(true);
    expect(completed).toBe(0);

    // Only the LATEST run emits and completes; the superseded attempts neither
    // append nor report — their cancellation is not a failure.
    await waitFor(() => sink.eos.length >= 1);
    expect(completed).toBe(1);
    expect(sink.eos).toEqual([4]);
    expect(errors).toEqual([]);

    // The emitted stream belongs to the latest (90 s) run: init first, then
    // media — nothing from the superseded 30 s/60 s runs reached the sink.
    const emitted = sink.units;
    expect(emitted[0]?.kind).toBe('init');
    expect(emitted.slice(1).every((unit) => unit.kind === 'media')).toBe(true);

    playback.dispose();
  });

  it('replaces the superseded run and replays from the seek point with a fresh init', async () => {
    const playback = await loadPlayback();
    const sink = new RecordingSink();
    let completed = 0;
    const errors: unknown[] = [];
    playback.start(sink, 3, {
      onComplete: () => {
        completed += 1;
      },
      onError: (error) => {
        errors.push(error);
      },
    });

    // Wait for the initial run, then restart deep into the timeline.
    await waitFor(() => sink.units.length > 0);
    const before = sink.units.length;
    expect(playback.restart?.(95)).toBe(true);

    await waitFor(() => sink.eos.length >= 2);
    expect(errors).toEqual([]);
    // Every conversion run reports exactly one completion, never onError.
    expect(completed).toBeGreaterThanOrEqual(1);
    expect(sink.eos.length).toBe(completed);
    expect(sink.eos.every((generation) => generation === 3)).toBe(true);

    // The restarted run re-emits init (ftyp+moov) before media so the freshly
    // reset SourceBuffer parser has its header context, then only media. The
    // superseded run contributes nothing into this window.
    const restarted = sink.units.slice(before);
    expect(restarted[0]?.kind).toBe('init');
    expect(restarted.slice(1).every((unit) => unit.kind === 'media')).toBe(true);

    // Trimmed near the 95 s seek, the run drops the early keyframe windows of
    // the full conversion: fewer media fragments than the initial run.
    const initialMedia = kinds(sink.units.slice(0, before)).filter((kind) => kind === 'media').length;
    const restartedMedia = kinds(restarted).filter((kind) => kind === 'media').length;
    expect(restartedMedia).toBeGreaterThan(0);
    expect(restartedMedia).toBeLessThan(initialMedia);

    playback.dispose();
  });
});
