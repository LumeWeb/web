/**
 * End-to-end backpressure proof through the real pipeline: a real mediabunny
 * conversion (`inspectMediaLibrary` to ready playback) over a real
 * `MseAppendPipe` (with a byte capacity bound) behind a real `MseAdapter`.
 *
 * How the proof works: while the MSE sink is held full (its first SourceBuffer
 * parked in flight, so the pipe cannot drain below its `capacityBytes` bound),
 * the conversion's reads park on the bound sink's capacity wait and the
 * conversion does not complete; its queued + in-flight payload stays at the
 * bound. When the pipe drains, the wait resolves and the conversion finishes.
 * Without the wired wait a held-but-unbounded pipe would let the conversion
 * complete regardless, so completion deferral is the observable that proves
 * the backpressure works.
 */
import { describe, expect, it, vi } from 'vitest';
import type { PlaybackCapabilities } from '../capabilities/browser-capabilities.ts';
import { inspectMediaLibrary, type MediaPlayback, type ReadyMediaLoad } from '../media/library-load.ts';
import { MseAppendPipe } from '../mse-pipe.ts';
import { MseAdapter } from '../sink/mse-adapter.ts';
import type { ByteSource } from '../transport/byte-source.ts';
import { MemoryByteSource } from '../transport/memory-byte-source.ts';
import { progressiveMp4Fixture } from './fixtures/progressive-mp4-fixture.ts';

/** A 60-second MP4: big enough that the remux emits far more than the bound. */
const FIXTURE_SECONDS = 60;

/**
 * The fast-append integration fixture: large enough, far beyond the media
 * bytes mediabunny prefetches during inspect, that the buffered-ahead wait
 * bites while the object still has the bulk of its media unread, so the
 * held-playhead proof distinguishes a bounded producer (parks shortly after
 * reaching the ahead target) from an unbounded one (reads to the end).
 */
const LARGE_FIXTURE_SECONDS = 600;

/** The sink's queued + in-flight bound, far below the fixture's converted media. */
const CAPACITY_BYTES = 8 * 1024;

/**
 * The producer's buffered-ahead target: how many seconds of media the real
 * SourceBuffer may hold past the playhead before the producer's reads park.
 * Far below the 60s fixture, so an unbounded producer would blow through it;
 * the pipe picks it up as `aheadTargetSeconds`.
 */
const AHEAD_TARGET_SECONDS = 8;

/** Buffered `end` grows by this much for each committed media fragment (~1s). */
const APPEND_SECONDS = 1;

/** Minimal SourceBuffer honoring the browser's async `updateend` contract. */
class FakeSourceBuffer extends EventTarget {
  appended = 0;
  holdNextAppend = false;
  updating = false;

  get buffered(): unknown {
    return { end: () => this.appended, length: 1, start: () => 0 };
  }

  private heldCommit: (() => void) | null = null;

  appendBuffer(_data: BufferSource): void {
    if (this.updating) throw new DOMException('updating', 'InvalidStateError');
    this.updating = true;
    const commit = () => {
      this.updating = false;
      this.appended += 1;
      this.dispatchEvent(new Event('updateend'));
    };
    if (this.holdNextAppend) {
      this.holdNextAppend = false;
      this.heldCommit = commit;
      return;
    }
    queueMicrotask(commit);
  }

  releaseHeldAppend(): void {
    if (!this.heldCommit) return;
    const commit = this.heldCommit;
    this.heldCommit = null;
    commit();
  }

  remove(): void {
    // Back-buffer eviction is not under test here.
  }
}

/**
 * A fast-absorbing SourceBuffer: every append commits on the next microtask
 * (no held append), and each committed media fragment extends the buffered
 * range by `APPEND_SECONDS`. This models a SourceBuffer that instantly drains
 * the pipe while the playhead stays put, exactly the scenario a queue-byte
 * cap cannot bound (the pipe is never byte-full) but a buffered-ahead
 * duration wait must.
 */
class FastAppendSourceBuffer extends EventTarget {
  /** Number of committed appends (the first is the init segment). */
  appended = 0;
  ranges: [number, number][] = [];
  updating = false;

  get buffered(): unknown {
    return {
      end: (index: number) => this.ranges[index][1],
      length: this.ranges.length,
      start: (index: number) => this.ranges[index][0],
    };
  }

  appendBuffer(_data: BufferSource): void {
    if (this.updating) throw new DOMException('updating', 'InvalidStateError');
    this.updating = true;
    queueMicrotask(() => {
      this.updating = false;
      this.appended += 1;
      // The first committed append is the init segment (no samples); every
      // later one is a ~1s media fragment that extends the contiguous range.
      if (this.appended > 1) {
        const end = this.bufferedEnd();
        this.ranges = end === 0 ? [[0, APPEND_SECONDS]] : [[0, end + APPEND_SECONDS]];
      }
      this.dispatchEvent(new Event('updateend'));
    });
  }

  bufferedEnd(): number {
    return this.ranges.length === 0 ? 0 : this.ranges[this.ranges.length - 1][1];
  }

  remove(): void {
    // Back-buffer eviction is not under test here.
  }
}

async function loadPlayback(source: ByteSource): Promise<MediaPlayback> {
  const result = await inspectMediaLibrary(source, { capabilities: permissiveCapabilities() });
  expect(result.status).toBe('ready');
  return (result as ReadyMediaLoad).playback;
}

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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Polls until a predicate holds or the probe times out. */
async function waitFor(predicate: () => boolean, timeoutMs = 10_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!predicate()) {
    if (Date.now() > deadline) throw new Error('timed out waiting for pipeline state');
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

describe('library-load MSE backpressure (through the real pipeline)', () => {
  it(
    'a full real MSE sink parks the conversion and drain releases it',
    async () => {
      const playback = await loadPlayback(new MemoryByteSource(progressiveMp4Fixture({ seconds: FIXTURE_SECONDS })));

      const fakeSourceBuffer = new FakeSourceBuffer();
      const onError = vi.fn();
      const pipe = new MseAppendPipe({
        backBufferSeconds: 30,
        capacityBytes: CAPACITY_BYTES,
        getMediaSource: () => ({ readyState: 'open' } as unknown as MediaSource),
        getPlayheadSeconds: () => 0,
        getSourceBuffer: () => fakeSourceBuffer as unknown as SourceBuffer,
        onError,
      });
      const sink = new MseAdapter({ pipe });
      const onComplete = vi.fn();
      const onRunError = vi.fn();

      // Hold the first SourceBuffer append in flight so the pipe cannot drain:
      // queued + in-flight bytes exceed the bound and the conversion parks.
      fakeSourceBuffer.holdNextAppend = true;
      playback.start(sink, 1, { onComplete, onError: onRunError });

      // The conversion fills the sink: queued + pending bytes rise to (and
      // stay at) the bound because the SourceBuffer cannot absorb them.
      await waitFor(() => pipe.pendingBytes >= CAPACITY_BYTES);
      expect(fakeSourceBuffer.updating).toBe(true);

      // Parked: the full sink holds the producer, so the pipeline may neither
      // complete nor fail while no SourceBuffer capacity is available.
      await sleep(250);
      expect(pipe.pendingBytes).toBeGreaterThanOrEqual(CAPACITY_BYTES);
      expect(onComplete).not.toHaveBeenCalled();
      expect(onRunError).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();

      // Drain the pipe: the held append settles, queued units are dequeued,
      // capacity frees, the parked reads resume, and the conversion completes.
      fakeSourceBuffer.releaseHeldAppend();
      await waitFor(() => onComplete.mock.calls.length > 0 || onRunError.mock.calls.length > 0, 20_000);
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onRunError).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
      expect(fakeSourceBuffer.appended).toBeGreaterThan(0);
    },
    30_000,
  );

  // The primary quota protection, proven at the real SourceBuffer: reads must
  // stop once the buffered-ahead duration reaches the target even when the
  // sink absorbs appends instantly (a held append alone would not exercise
  // this, since the pipe is never byte-full here), and must resume when the
  // playhead advances. This is the mechanism that bounds the SourceBuffer,
  // unlike queue-byte caps which only bound the pipe's transient backlog.
  it(
    'fast-append sink: reads stay bounded by the ahead target while the playhead is held, and playhead advance releases more reads',
    async () => {
      // A large fixture: over 600s of media, so the wait bites while the bulk
      // of the object is still unread; a bounded producer parks within a few
      // tens of seconds of the ahead target instead of streaming to the end.
      const playback = await loadPlayback(
        new MemoryByteSource(progressiveMp4Fixture({ seconds: LARGE_FIXTURE_SECONDS })),
      );

      const fakeSourceBuffer = new FastAppendSourceBuffer();
      const onError = vi.fn();
      let playhead = 0;
      const pipe = new MseAppendPipe({
        // Only the buffered-ahead wait is under test here: no capacityBytes, so
        // the fast-absorbing sink never trips the secondary byte wait and the
        // bounded reads are attributable to the ahead-duration wait alone.
        aheadTargetSeconds: AHEAD_TARGET_SECONDS,
        backBufferSeconds: 30,
        getMediaSource: () => ({ readyState: 'open' } as unknown as MediaSource),
        getPlayheadSeconds: () => playhead,
        getSourceBuffer: () => fakeSourceBuffer as unknown as SourceBuffer,
        onError,
      });
      const sink = new MseAdapter({ pipe });
      const onComplete = vi.fn();
      const onRunError = vi.fn();
      playback.start(sink, 1, { onComplete, onError: onRunError });

      // The sink absorbs every append immediately (no held append): buffered
      // grows one ~1s fragment at a time, and the pipe's byte backlog never
      // fills. Only a duration wait on the real buffered range can stop the
      // producer now.
      await waitFor(() => fakeSourceBuffer.bufferedEnd() >= AHEAD_TARGET_SECONDS);
      const plateau = fakeSourceBuffer.bufferedEnd();
      expect(plateau).toBeGreaterThanOrEqual(AHEAD_TARGET_SECONDS);

      // Parked: with the playhead held at 0 the producer must not keep reading
      // to the end of the 600s object, so buffered-ahead stays bounded well
      // short of the fixture end (and the pipeline never completes or fails).
      // The plateau is a few tens of seconds (the target plus mediabunny's
      // per-batch emit granularity), far below a full read-through.
      await sleep(400);
      expect(fakeSourceBuffer.bufferedEnd()).toBe(plateau);
      expect(fakeSourceBuffer.bufferedEnd()).toBeLessThan(LARGE_FIXTURE_SECONDS / 2);
      expect(onComplete).not.toHaveBeenCalled();
      expect(onRunError).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();

      // Playhead advance releases more reads: the real SourceBuffer now holds
      // ~0s ahead at the parked position, so the wait resolves, the parked
      // read resumes, and buffered grows past the held-again plateau until it
      // re-parks at the new playhead + ahead target.
      playhead = plateau;
      pipe.kick();
      await waitFor(() => fakeSourceBuffer.bufferedEnd() > plateau + AHEAD_TARGET_SECONDS);
      expect(fakeSourceBuffer.bufferedEnd()).toBeGreaterThan(playhead);

      // Advancing the playhead to the very tail (ahead can never reach the
      // target: the object ends before it) keeps the wait open for whatever is
      // left, so the remaining reads run and the conversion completes normally.
      playhead = LARGE_FIXTURE_SECONDS - 2;
      pipe.kick();
      await waitFor(() => onComplete.mock.calls.length > 0 || onRunError.mock.calls.length > 0, 20_000);
      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onRunError).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
      expect(fakeSourceBuffer.appended).toBeGreaterThan(AHEAD_TARGET_SECONDS);
    },
    30_000,
  );
});

