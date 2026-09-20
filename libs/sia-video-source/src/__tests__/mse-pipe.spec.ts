/**
 * Focused tests for the shared MSE append pipe (`src/mse-pipe.ts`), the thin
 * production-library adapter around the public `@videojs/spf/dom` primitives
 * (`appendSegment` / `flushBuffer`).
 *
 * The pipe centralizes the append-queue serialization, back-buffer eviction,
 * stale-epoch cancellation, fatal-error suppression and end-of-stream deferral
 * that used to be duplicated between the worker-side MSE pipeline (mode
 * 'worker') and the main-thread MSE fallback path (`sia-video-source.ts`,
 * mode 'main').
 *
 * These tests run under the node vitest environment (SIA_TEST_ENV=node) and
 * drive a fake SourceBuffer that mirrors the browser's async `updateend` /
 * `error` contract so the real SPF `appendSegment` / `flushBuffer`
 * implementations are exercised.
 */
import { describe, expect, it, vi } from 'vitest';
import {
  MseAppendPipe,
  type MseAppendPipeOptions,
} from '../mse-pipe.ts';

// ---- fake MSE primitives -----------------------------------------------------

interface Harness {
  fakeMediaSource: FakeMediaSource;
  fakeSourceBuffer: FakeSourceBuffer;
  onError: ReturnType<typeof vi.fn>;
  pipe: MseAppendPipe;
  playhead: () => number;
  /** Moves the playhead the pipe's `getPlayheadSeconds` reports. */
  setPlayhead: (seconds: number) => void;
}

/** Minimal fake MediaSource for end-of-stream deferral. */
class FakeMediaSource extends EventTarget {
  endOfStreamCalls = 0;
  readyState: unknown = 'open';
  endOfStream(): void {
    this.endOfStreamCalls += 1;
    this.readyState = 'ended';
  }
}

/** Minimal fake SourceBuffer honoring the browser's async update/error model. */
class FakeSourceBuffer extends EventTarget {
  abortCalls = 0;
  appended: Uint8Array[] = [];
  /** Chronological record of `abort` and successful `append:<firstByte>`. */
  eventLog: string[] = [];
  /** Dispatch an error event after the next append (fatal append failure). */
  failNextAppendWithEvent = false;
  /** Throw synchronously from the next appendBuffer call (e.g. quota). */
  failNextAppendWithThrow: Error | null = null;
  /** Hold the next append in-flight (updating) until `releaseHeldAppend`. */
  holdNextAppend = false;
  ranges: [number, number][] = [];
  removed: [number, number][] = [];
  updating = false;
  get buffered(): unknown {
    return {
      end: (index: number) => this.ranges[index][1],
      length: this.ranges.length,
      start: (index: number) => this.ranges[index][0],
    };
  }

  private heldCommit: (() => void) | null = null;

  abort(): void {
    this.abortCalls += 1;
    this.eventLog.push('abort');
    if (this.updating) {
      this.updating = false;
      this.dispatchEvent(new Event('updateend'));
    }
  }

  appendBuffer(data: BufferSource): void {
    if (this.updating) {
      throw new DOMException('updating', 'InvalidStateError');
    }
    if (this.failNextAppendWithThrow !== null && this.failNextAppendWithThrow !== undefined) {
      const error = this.failNextAppendWithThrow;
      this.failNextAppendWithThrow = null;
      throw error;
    }
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBuffer);
    const failWithEvent = this.failNextAppendWithEvent;
    this.failNextAppendWithEvent = false;
    this.updating = true;
    const commit = () => {
      this.updating = false;
      if (failWithEvent) {
        this.dispatchEvent(new Event('error'));
        return;
      }
      this.appended.push(bytes);
      this.eventLog.push(`append:${bytes[0]}`);
      this.dispatchEvent(new Event('updateend'));
    };
    if (this.holdNextAppend) {
      this.holdNextAppend = false;
      this.heldCommit = commit;
      return;
    }
    queueMicrotask(commit);
  }

  /**
   * Resolves a held append (the one that set `holdNextAppend`). Dispatches
   * synchronously; SPF registers its `updateend` listener before appendBuffer,
   * so a synchronous settle is observable exactly like the browser's async one.
   */
  releaseHeldAppend(): void {
    if (!this.heldCommit) return;
    const commit = this.heldCommit;
    this.heldCommit = null;
    commit();
  }

  remove(start: number, end: number): void {
    if (this.updating) {
      throw new DOMException('updating', 'InvalidStateError');
    }
    this.removed.push([start, end]);
    this.updating = true;
    queueMicrotask(() => {
      this.updating = false;
      // Subtract [start, end] from the tracked ranges, mirroring a real SB.
      const next: [number, number][] = [];
      for (const [rangeStart, rangeEnd] of this.ranges) {
        if (end <= rangeStart || start >= rangeEnd) {
          next.push([rangeStart, rangeEnd]);
          continue;
        }
        if (rangeStart < start) next.push([rangeStart, start]);
        if (rangeEnd > end) next.push([end, rangeEnd]);
      }
      this.ranges = next;
      this.dispatchEvent(new Event('updateend'));
    });
  }
}

// ---- fixtures -----------------------------------------------------------------

function createHarness(overrides: Partial<MseAppendPipeOptions> = {}): Harness {
  const fakeMediaSource = new FakeMediaSource();
  const fakeSourceBuffer = new FakeSourceBuffer();
  const onError = vi.fn();
  let playhead = 30;
  const pipe = new MseAppendPipe({
    backBufferSeconds: 30,
    getMediaSource: () => fakeMediaSource as unknown as MediaSource,
    getPlayheadSeconds: () => playhead,
    getSourceBuffer: () => fakeSourceBuffer as unknown as SourceBuffer,
    onError,
    ...overrides,
  });
  return {
    fakeMediaSource,
    fakeSourceBuffer,
    onError,
    pipe,
    playhead: () => playhead,
    setPlayhead: (seconds: number) => {
      playhead = seconds;
    },
  };
}

function settle(rounds = 12): Promise<void> {
  return new Promise((resolve) => {
    const tick = (left: number) =>
      setTimeout(() => {
        if (left <= 0) resolve();
        else tick(left - 1);
      }, 0);
    tick(rounds);
  });
}

const bytes = (marker: number, length = 16) => new Uint8Array(length).fill(marker);

describe('MseAppendPipe', () => {
  describe('append serialization', () => {
    it('appends queued bytes in FIFO order, one update at a time', async () => {
      const { fakeSourceBuffer, pipe } = createHarness();

      pipe.append(bytes(1));
      pipe.append(bytes(2));
      pipe.append(bytes(3));
      expect(fakeSourceBuffer.appended).toEqual([]);

      await settle();

      expect(fakeSourceBuffer.appended.map((a) => a[0])).toEqual([1, 2, 3]);
      // Serialization: every append saw the buffer quiescent (no sync
      // InvalidStateError thrown by the fake, and appends never overlapped).
      expect(fakeSourceBuffer.removed).toEqual([]);
    });

    it('waits for a SourceBuffer that appears after the bytes are queued', async () => {
      const { fakeSourceBuffer, pipe } = createHarness();
      const deferredSb = new FakeSourceBuffer();
      // Simulate a pipeline where the SourceBuffer is created later: swap the
      // getSourceBuffer to return null initially, then hand out the real one.
      let available = false;
      const pipe2 = new MseAppendPipe({
        backBufferSeconds: 30,
        getMediaSource: () => ({} as MediaSource),
        getPlayheadSeconds: () => 0,
        getSourceBuffer: () => (available ? (deferredSb as unknown as SourceBuffer) : null),
        onError: vi.fn(),
      });

      pipe2.append(bytes(9));
      await settle();
      expect(deferredSb.appended).toEqual([]);

      available = true;
      pipe2.append(bytes(10));
      await settle();

      expect(deferredSb.appended.map((a) => a[0])).toEqual([9, 10]);
      void pipe;
      void fakeSourceBuffer;
    });
  });

  describe('flush / eviction', () => {
    it('evicts the back-buffer range behind the playhead via flushBuffer', async () => {
      const { fakeSourceBuffer, pipe, setPlayhead } = createHarness();
      fakeSourceBuffer.ranges = [[0, 120]];
      // Default harness playhead is 30 → target end = 0 (nothing to evict).
      // Advance it so the target end lands at 30 and a removal is owed.
      setPlayhead(60);

      await pipe.evictBackBuffer();

      expect(fakeSourceBuffer.removed).toEqual([[0, 30]]);
      expect(fakeSourceBuffer.ranges).toEqual([[30, 120]]);
    });

    it('evicts only the first overlapping range and stops', async () => {
      const { fakeSourceBuffer, pipe, setPlayhead } = createHarness();
      fakeSourceBuffer.ranges = [[0, 40], [100, 200]];
      setPlayhead(75); // target end = 45, so only [0, 40] overlaps

      await pipe.evictBackBuffer();

      expect(fakeSourceBuffer.removed).toEqual([[0, 40]]);
      expect(fakeSourceBuffer.ranges).toEqual([[100, 200]]);
    });

    it('recovers from QuotaExceededError by evicting then retrying the same head', async () => {
      const { fakeSourceBuffer, onError, pipe, setPlayhead } = createHarness();
      fakeSourceBuffer.ranges = [[0, 120]];
      setPlayhead(60); // target end = 30, so the eviction can free a window
      fakeSourceBuffer.failNextAppendWithThrow = new DOMException('quota', 'QuotaExceededError');
      void (onError);

      pipe.append(bytes(7));

      await settle();

      // The failing head is retried after eviction and must be appended once.
      expect(fakeSourceBuffer.appended.map((a) => a[0])).toEqual([7]);
      expect(fakeSourceBuffer.removed).toEqual([[0, 30]]);
    });
  });

  describe('stale seek / epoch cancellation', () => {
    it('drops queued appends when the epoch is reset (new source/load)', async () => {
      const { fakeSourceBuffer, pipe } = createHarness();

      // Hold the first append in flight so the reset lands mid-load, with the
      // head copying done and bytes 2 & 3 still parked in the queue.
      fakeSourceBuffer.holdNextAppend = true;
      pipe.append(bytes(1));
      pipe.append(bytes(2));
      pipe.append(bytes(3));

      // Let the pump start the first append (it stays in flight, held), but not
      // the later ones: while updating, the pump is awaited inside appendSegment.
      await settle(1);
      expect(fakeSourceBuffer.updating).toBe(true);
      expect(fakeSourceBuffer.appended).toEqual([]);

      // A superseded load resets the epoch: everything still queued dies with it.
      pipe.reset();
      fakeSourceBuffer.releaseHeldAppend();

      await settle();

      // The in-flight head may settle, but nothing queued behind it (2, 3) may
      // start after the reset bumped the epoch.
      expect(fakeSourceBuffer.appended.map((a) => a[0])).toEqual([1]);

      // A fresh epoch reuses the pipe cleanly.
      pipe.append(bytes(9));
      await settle();
      expect(fakeSourceBuffer.appended[fakeSourceBuffer.appended.length - 1][0]).toBe(9);
    });

    it('aborts the SourceBuffer parser between a superseded seek and the fresh fragment', async () => {
      const { fakeSourceBuffer, pipe } = createHarness();

      // A rapid seek cuts the previous position's fragment while its head is
      // mid-append (`updating`) and its tail (2, 3) is still queued. The head
      // cannot be retracted, but the queued tail must die with the seek and the
      // segment parser must be reset (abort) before the fresh fragment — else
      // Chrome swallows the new moof into the stale, truncated mdat and fails
      // with PipelineStatus::CHUNK_DEMUXER_ERROR_APPEND_FAILED.
      fakeSourceBuffer.holdNextAppend = true;
      pipe.append(bytes(1));
      pipe.append(bytes(2));
      pipe.append(bytes(3));
      await settle(1);
      expect(fakeSourceBuffer.updating).toBe(true);

      // Seek supersedes the old position: queued appends die, parser reset armed.
      pipe.reset();

      // The superseded in-flight append settles (its mdat tail was cut off).
      fakeSourceBuffer.releaseHeldAppend();
      await settle();
      expect(fakeSourceBuffer.appended.map((a) => a[0])).toEqual([1]);

      // Fresh fragment for the new position arrives after the seek.
      pipe.append(bytes(9));
      await settle();

      expect(fakeSourceBuffer.appended.map((a) => a[0])).toEqual([1, 9]);
      // The parser must have been reset exactly once, and strictly before the
      // fresh fragment, so Chrome parses it as a new fragment.
      expect(fakeSourceBuffer.abortCalls).toBe(1);
      expect(fakeSourceBuffer.eventLog.indexOf('abort')).toBeGreaterThan(0);
      expect(fakeSourceBuffer.eventLog.indexOf('abort')).toBeLessThan(
        fakeSourceBuffer.eventLog.lastIndexOf('append:9'),
      );
    });

    it('never appends a fresh moof while the parser reset a seek owes is still pending', async () => {
      const { fakeSourceBuffer, onError, pipe } = createHarness();

      // A fully settled first fragment (the old position's buffered data).
      pipe.append(bytes(1));
      await settle();
      expect(fakeSourceBuffer.appended.map((a) => a[0])).toEqual([1]);

      // A seek lands while the SourceBuffer is STILL mid-update — e.g. the
      // back-buffer eviction the seek started (`remove()` in flight) or a
      // superseded position's tail still quiescing. `reset()` arms the parser
      // reset but the buffer has not quiesced yet, so it cannot run yet.
      fakeSourceBuffer.updating = true; // simulated in-flight remove/update
      pipe.reset();

      // The fresh position's `moof` is queued immediately (its RAP bytes are
      // cached), racing the owed parser reset. The pump's next iteration now
      // OBSERVES `updating=true` with a reset owed — it must PARK and abort
      // FIRST; appending the moof here would let the deferred `abort()` land
      // AFTER it, destroying its parser context before the `mdat` continuation
      // (Chromium CHUNK_DEMUXER_ERROR_APPEND_FAILED on the live far seek).
      pipe.append(bytes(2));
      await settle(1);

      // The in-flight update quiesces; the parked pump may proceed.
      fakeSourceBuffer.updating = false;
      fakeSourceBuffer.dispatchEvent(new Event('updateend'));
      await settle();

      // The fresh fragment must survive intact — no fatal append error.
      expect(onError).not.toHaveBeenCalled();
      expect(fakeSourceBuffer.appended.map((a) => a[0])).toEqual([1, 2]);
      // The parser reset runs exactly once, and STRICTLY BEFORE the fresh moof
      // is appended — never after it.
      expect(fakeSourceBuffer.abortCalls).toBe(1);
      const abortIdx = fakeSourceBuffer.eventLog.indexOf('abort');
      const append2Idx = fakeSourceBuffer.eventLog.lastIndexOf('append:2');
      expect(abortIdx).toBeGreaterThan(-1);
      expect(abortIdx).toBeLessThan(append2Idx);
    });

    it('ignores further appends once aborted', async () => {
      const { fakeSourceBuffer, pipe } = createHarness();

      pipe.append(bytes(1));
      await settle();
      pipe.abort();
      pipe.append(bytes(2));

      await settle();

      expect(fakeSourceBuffer.appended.map((a) => a[0])).toEqual([1]);
    });
  });

  describe('fatal-error append suppression', () => {
    it('reports a SourceBuffer error event exactly once and suppresses later appends', async () => {
      const { fakeSourceBuffer, onError, pipe } = createHarness();
      fakeSourceBuffer.failNextAppendWithEvent = true;

      pipe.append(bytes(1));
      await settle();

      expect(onError).toHaveBeenCalledTimes(1);

      pipe.append(bytes(2));
      await settle();

      expect(fakeSourceBuffer.appended).toEqual([]);
      expect(onError).toHaveBeenCalledTimes(1);
    });

    it('reports a synchronous non-quota append throw and suppresses later appends', async () => {
      const { fakeSourceBuffer, onError, pipe } = createHarness();
      fakeSourceBuffer.failNextAppendWithThrow = new Error('decode garbage');

      pipe.append(bytes(1));
      await settle();

      expect(onError).toHaveBeenCalledTimes(1);
      pipe.append(bytes(2));
      await settle();
      expect(fakeSourceBuffer.appended).toEqual([]);
      expect(onError).toHaveBeenCalledTimes(1);
    });
  });

  describe('end-of-stream deferral', () => {
    it('ends the MediaSource once the queue drains and the buffer is quiescent', async () => {
      const { fakeMediaSource, pipe } = createHarness();

      pipe.requestEndOfStream();
      expect(fakeMediaSource.endOfStreamCalls).toBe(0);

      await settle();
      expect(fakeMediaSource.endOfStreamCalls).toBe(1);
    });

    it('defers endOfStream until pending appends are drained', async () => {
      const { fakeMediaSource, fakeSourceBuffer, pipe } = createHarness();

      pipe.append(bytes(1));
      pipe.append(bytes(2));
      pipe.requestEndOfStream();
      expect(fakeMediaSource.endOfStreamCalls).toBe(0);

      await settle();
      expect(fakeMediaSource.endOfStreamCalls).toBe(1);
      expect(fakeSourceBuffer.appended.map((a) => a[0])).toEqual([1, 2]);
    });

    it('does not end a MediaSource that is not open', async () => {
      const { fakeMediaSource, pipe } = createHarness();
      fakeMediaSource.readyState = 'closed';

      pipe.requestEndOfStream();
      await settle();

      expect(fakeMediaSource.endOfStreamCalls).toBe(0);
    });

    it('never ends the stream after a fatal append error', async () => {
      const { fakeMediaSource, fakeSourceBuffer, pipe } = createHarness();
      fakeSourceBuffer.failNextAppendWithThrow = new Error('fatal');

      pipe.append(bytes(1));
      pipe.requestEndOfStream();
      await settle();

      expect(fakeMediaSource.endOfStreamCalls).toBe(0);
    });
  });
});
