/**
 * The append sink: the stream controller has ONE sink surface regardless
 * of worker vs main-thread MSE role. `MseAdapter` is the thin wrapper over the
 * existing, already-tested `MseAppendPipe` (whose SPF-backed internals are
 * unchanged); this spec drives it through the same fake SourceBuffer async
 * `updateend` / `error` model the pipe spec uses.
 *
 * Covered behaviors: append, resetParser (stale-ignored), back-buffer
 * eviction, requestEndOfStream (stale-ignored), abort.
 */
import { describe, expect, it } from 'vitest';
import type { AppendUnit } from '../sink/append-sink.ts';
import { MseAppendPipe } from '../mse-pipe.ts';
import { MseAdapter } from '../sink/mse-adapter.ts';

// ---- fake MSE primitives (same fakes as mse-pipe.spec.ts) --------------------

interface Harness {
  adapter: MseAdapter;
  fakeMediaSource: FakeMediaSource;
  fakeSourceBuffer: FakeSourceBuffer;
  setPlayhead: (seconds: number) => void;
}

class FakeMediaSource extends EventTarget {
  endOfStreamCalls = 0;
  readyState: unknown = 'open';
  endOfStream(): void {
    this.endOfStreamCalls += 1;
    this.readyState = 'ended';
  }
}

class FakeSourceBuffer extends EventTarget {
  abortCalls = 0;
  appended: Uint8Array[] = [];
  /** Chronological record of `abort` and successful `append:<firstByte>`. */
  eventLog: string[] = [];
  /** Hold the next append in-flight (updating) until `releaseHeldAppend`. */
  holdNextAppend = false;
  ranges: [number, number][] = [];
  removed: [number, number][] = [];
  /** Chronological record of every assigned `timestampOffset`, in order. */
  timestampOffsets: number[] = [];
  updating = false;
  get buffered(): unknown {
    return {
      end: (index: number) => this.ranges[index][1],
      length: this.ranges.length,
      start: (index: number) => this.ranges[index][0],
    };
  }
  get timestampOffset(): number {
    return this.#timestampOffset;
  }
  set timestampOffset(value: number) {
    this.#timestampOffset = value;
    this.timestampOffsets.push(value);
    this.eventLog.push(`timestampOffset:${value}`);
  }
  #timestampOffset = 0;
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
    if (this.updating) throw new DOMException('updating', 'InvalidStateError');
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBuffer);
    this.updating = true;
    const commit = () => {
      this.updating = false;
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

  /** Resolves a held append; SPF sees the same `updateend` the browser fires. */
  releaseHeldAppend(): void {
    if (!this.heldCommit) return;
    const commit = this.heldCommit;
    this.heldCommit = null;
    commit();
  }

  remove(start: number, end: number): void {
    if (this.updating) throw new DOMException('updating', 'InvalidStateError');
    this.removed.push([start, end]);
    this.updating = true;
    queueMicrotask(() => {
      this.updating = false;
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

function createHarness(backBufferSeconds = 30, capacityBytes?: number, aheadTargetSeconds?: number): Harness {
  const fakeMediaSource = new FakeMediaSource();
  const fakeSourceBuffer = new FakeSourceBuffer();
  let playhead = 30;
  const pipe = new MseAppendPipe({
    aheadTargetSeconds,
    backBufferSeconds,
    capacityBytes,
    getMediaSource: () => fakeMediaSource as unknown as MediaSource,
    getPlayheadSeconds: () => playhead,
    getSourceBuffer: () => fakeSourceBuffer as unknown as SourceBuffer,
    onError: () => undefined,
  });
  const adapter = new MseAdapter({ pipe });
  return {
    adapter,
    fakeMediaSource,
    fakeSourceBuffer,
    setPlayhead: (seconds: number) => {
      playhead = seconds;
      // The production root reflects playhead updates into the pipe by
      // calling kick on it; the fixture mirrors that contract so a
      // parked buffered-ahead producer is released on playhead advance.
      pipe.kick();
    },
  };
}

/** Drains pending microtasks/queued kicks until appends quiesce. */
function settle(rounds = 20): Promise<void> {
  return new Promise((resolve) => {
    const tick = (left: number) =>
      setTimeout(() => {
        if (left <= 0) resolve();
        else tick(left - 1);
      }, 0);
    tick(rounds);
  });
}

const unit = (marker: number, kind: 'init' | 'media' = 'media'): AppendUnit => ({
  bytes: new Uint8Array(16).fill(marker),
  kind,
});

describe('MseAdapter (AppendSink)', () => {
  it('append forwards produced bytes to the SourceBuffer in FIFO order', async () => {
    const { adapter, fakeSourceBuffer } = createHarness();

    adapter.append(unit(1));
    adapter.append(unit(2));
    expect(fakeSourceBuffer.appended).toEqual([]);

    await settle();

    expect(fakeSourceBuffer.appended.map((a) => a[0])).toEqual([1, 2]);
    expect(fakeSourceBuffer.appended.map((a) => a.byteLength)).toEqual([16, 16]);
  });

  it('resetParser(loadGeneration) drops queued appends and resets the parser on quiesce', async () => {
    const { adapter, fakeSourceBuffer } = createHarness();

    adapter.append(unit(1));
    adapter.resetParser(1);
    adapter.append(unit(2));

    await settle();

    // The stale append (1) died with the reset; only the post-reset append (2)
    // survives, and the parser abort ran before it.
    expect(fakeSourceBuffer.appended.map((a) => a[0])).toEqual([2]);
    expect(fakeSourceBuffer.eventLog).toContain('abort');
  });

  it('resetParser ignores a stale (older) load generation', async () => {
    const { adapter, fakeSourceBuffer } = createHarness();

    // A legit reset advances the adapter load generation to 5 (its parser abort on the
    // empty queue is expected). A stale reset must NOT clear the queued
    // appends — forwarding one would drop them via pipe.reset().
    adapter.resetParser(5);
    adapter.append(unit(1));
    adapter.append(unit(2));
    adapter.resetParser(1); // stale: must leave the queue intact

    await settle();

    expect(fakeSourceBuffer.appended.map((a) => a[0])).toEqual([1, 2]);
  });

  it('resetParser forwards the seek target so the pipe points the SourceBuffer at that time', async () => {
    const { adapter, fakeSourceBuffer } = createHarness();

    adapter.append(unit(1));
    await settle();

    adapter.resetParser(2, 37);
    adapter.append(unit(2));
    await settle();

    expect(fakeSourceBuffer.appended.map((a) => a[0])).toEqual([1, 2]);
    // The target passes through the adapter to the pipe's parser reset.
    expect(fakeSourceBuffer.timestampOffsets).toEqual([37]);
  });

  it('resetParser ignores a stale generation even when it carries a target', async () => {
    const { adapter, fakeSourceBuffer } = createHarness();

    adapter.resetParser(3, 15);
    adapter.append(unit(1));
    adapter.resetParser(1, 45); // stale: must not bump the generation or reset again

    await settle();

    expect(fakeSourceBuffer.appended.map((a) => a[0])).toEqual([1]);
    expect(fakeSourceBuffer.timestampOffsets).toEqual([15]);
  });

  it('requestEndOfStream(loadGeneration) fires endOfStream once the queue drains', async () => {
    const { adapter, fakeMediaSource } = createHarness();

    adapter.append(unit(1));
    adapter.requestEndOfStream(0);
    expect(fakeMediaSource.endOfStreamCalls).toBe(0);

    await settle();

    expect(fakeMediaSource.endOfStreamCalls).toBe(1);
  });

  it('requestEndOfStream ignores a stale (older) load generation', async () => {
    const { adapter, fakeMediaSource } = createHarness();

    adapter.resetParser(3);
    adapter.requestEndOfStream(1); // stale
    await settle();
    expect(fakeMediaSource.endOfStreamCalls).toBe(0);

    adapter.requestEndOfStream(3); // current
    await settle();
    expect(fakeMediaSource.endOfStreamCalls).toBe(1);
  });

  it('evictBackBuffer trims the aged range via the pipe (delegation)', async () => {
    const { adapter, fakeSourceBuffer, setPlayhead } = createHarness(30);
    fakeSourceBuffer.ranges = [
      [0, 10],
      [20, 30],
    ];
    setPlayhead(100); // targetEnd = 70 → [0,10] is removable

    const evicted = await adapter.evictBackBuffer(100);

    expect(evicted).toBe(true);
    expect(fakeSourceBuffer.removed).toEqual([[0, 10]]);
  });

  it('abort permanently stops appends and end-of-stream', async () => {
    const { adapter, fakeMediaSource, fakeSourceBuffer } = createHarness();

    adapter.abort(new Error('teardown'));
    adapter.append(unit(1));
    adapter.requestEndOfStream(0);

    await settle();

    expect(fakeSourceBuffer.appended).toEqual([]);
    expect(fakeMediaSource.endOfStreamCalls).toBe(0);
  });

  it('waitForCapacity holds producers while the pipe backlog reaches capacity', async () => {
    const { adapter, fakeSourceBuffer } = createHarness(30, 48);
    // Hold the head so nothing drains: three 16-byte units keep the pipe full
    // (48 = capacity) and the sink's capacity wait must hold the producer.
    fakeSourceBuffer.holdNextAppend = true;
    adapter.append(unit(1));
    adapter.append(unit(2));
    adapter.append(unit(3));
    await settle(1);

    let released = false;
    const gate = adapter.waitForCapacity().then(() => {
      released = true;
    });
    await settle(1);
    expect(released).toBe(false);

    // The pipe drains: the same wait the media library consults resolves.
    fakeSourceBuffer.releaseHeldAppend();
    await settle();
    expect(released).toBe(true);
    await gate;
  });

  it('waitForBufferedAhead parks producers on the pipe ahead-duration wait', async () => {
    const { adapter, fakeSourceBuffer, setPlayhead } = createHarness(30, undefined, 30);
    // 60s buffered ahead of a 0s playhead with a 30s ahead target: the sink's
    // ahead wait must hold the producer even though the pipe is otherwise empty.
    fakeSourceBuffer.ranges = [[0, 60]];
    let released = false;
    const gate = adapter.waitForBufferedAhead().then(() => {
      released = true;
    });
    await settle(1);
    expect(released).toBe(false);

    // Playback advances (setPlayhead kicks the pipe, as the worker root does):
    // buffered ahead 15s < 30: the same wait the media library consults resolves.
    setPlayhead(45);
    await settle(1);
    expect(released).toBe(true);
    await gate;
  });
});
