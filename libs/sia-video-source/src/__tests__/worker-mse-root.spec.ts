/**
 * Worker-side MSE composition root:
 * `createWorkerMseRoot` owns the worker `MediaSource` lifecycle for the
 * `SessionCoordinator` — one fresh MediaSource per load, its
 * `MediaSourceHandle` transferred to the host as a `HANDLE` protocol message,
 * live getters served to the per-load `MseAppendPipe`, and worker-side
 * teardown/rebuild semantics.
 *
 * These tests drive a fake MediaSource injected through `createMediaSource`,
 * so the lifecycle is deterministic in both node and browser environments — a
 * real detached MediaSource never fires `sourceopen` (MSE opening events on
 * attachment to a video element), so a real `MediaSourceHandle` is not
 * constructible in a unit test page.
 */
import { describe, expect, it } from 'vitest';
import { DEFAULT_FMP4_MIME, type WorkerToMainMessage } from '../protocol.ts';
import { createWorkerMseRoot, type WorkerMseRoot } from '../session/worker-mse-root.ts';

// ---- MSE fakes (sourceopen-scoped; mirror the pipe-compatible SB shape) -------

class FakeSourceBuffer extends EventTarget {
  appended: Uint8Array[] = [];
  eventLog: string[] = [];
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

  abort(): void {
    this.eventLog.push('abort');
    this.updating = false;
    this.dispatchEvent(new Event('updateend'));
  }

  appendBuffer(data: BufferSource): void {
    if (this.updating) throw new DOMException('updating', 'InvalidStateError');
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBuffer);
    this.updating = true;
    queueMicrotask(() => {
      this.updating = false;
      this.appended.push(bytes);
      this.eventLog.push(`append:${bytes[0]}`);
      this.dispatchEvent(new Event('updateend'));
    });
  }

  remove(start: number, end: number): void {
    this.removed.push([start, end]);
  }
}

class FakeMediaSource extends EventTarget {
  durationCalls: number[] = [];
  endOfStreamCalls = 0;
  handle = {} as MediaSourceHandle;
  readyState = 'closed';
  sourceBuffers: FakeSourceBuffer[] = [];

  set duration(value: number) {
    this.durationCalls.push(value);
  }

  get duration(): number {
    return this.durationCalls.length ? this.durationCalls[this.durationCalls.length - 1] : 0;
  }

  addSourceBuffer(_mime: string): FakeSourceBuffer {
    const sourceBuffer = new FakeSourceBuffer();
    this.sourceBuffers.push(sourceBuffer);
    return sourceBuffer;
  }

  endOfStream(): void {
    this.endOfStreamCalls += 1;
    this.readyState = 'ended';
  }

  open(): void {
    this.readyState = 'open';
    this.dispatchEvent(new Event('sourceopen'));
  }

  removeSourceBuffer(sourceBuffer: FakeSourceBuffer): void {
    const index = this.sourceBuffers.indexOf(sourceBuffer);
    if (index >= 0) this.sourceBuffers.splice(index, 1);
  }
}

async function flush(): Promise<void> {
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 10));
}

function rootOf(mediaSource: FakeMediaSource, extra: Partial<Parameters<typeof createWorkerMseRoot>[0]> = {}): WorkerMseRoot {
  return createWorkerMseRoot({
    backBufferSeconds: 30,
    createMediaSource: () => mediaSource as unknown as MediaSource,
    post: () => undefined,
    ...extra,
  });
}

// ---- tests -------------------------------------------------------------------

describe('createWorkerMseRoot (worker MSE composition root)', () => {
  it('opens one worker MediaSource per load and transfers its handle via HANDLE', () => {
    const mediaSource = new FakeMediaSource();
    const posted: WorkerToMainMessage[] = [];
    const transfers: Transferable[][] = [];
    const root = createWorkerMseRoot({
      backBufferSeconds: 30,
      createMediaSource: () => mediaSource as unknown as MediaSource,
      post: (message, transfer) => {
        posted.push(message);
        if (transfer) transfers.push(transfer);
      },
    });

    const sink = root.createSink({ durationSeconds: 90, mime: DEFAULT_FMP4_MIME, requestId: 7 });

    const handle = posted.find((message) => message.type === 'HANDLE');
    expect(handle).toBeDefined();
    if (handle && handle.type === 'HANDLE') {
      expect(handle.requestId).toBe(7);
      expect(handle.handle).toBe(mediaSource.handle);
    }
    expect(transfers.at(-1)).toEqual([mediaSource.handle]);
    expect(typeof sink.append).toBe('function');
    expect(typeof sink.requestEndOfStream).toBe('function');
  });

  it('creates the SourceBuffer (with mime + duration) once the MediaSource opens', async () => {
    const mediaSource = new FakeMediaSource();
    const root = rootOf(mediaSource);

    root.createSink({ durationSeconds: 120, mime: 'video/mp4', requestId: 3 });

    // MediaSource not attached to an element yet: no SourceBuffer until sourceopen.
    expect(mediaSource.sourceBuffers).toHaveLength(0);
    expect(root.deps.getSourceBuffer()).toBeNull();

    mediaSource.open();
    await flush();

    expect(mediaSource.sourceBuffers).toHaveLength(1);
    expect(root.deps.getSourceBuffer()).toBe(mediaSource.sourceBuffers[0]);
    expect(mediaSource.durationCalls).toEqual([120]);
  });

  it('drains appends queued before the SourceBuffer appeared once it opens', async () => {
    const mediaSource = new FakeMediaSource();
    const root = rootOf(mediaSource);
    const sink = root.createSink({ durationSeconds: 90, mime: DEFAULT_FMP4_MIME, requestId: 4 });

    sink.append({ bytes: new Uint8Array(8).fill(7), kind: 'media' });
    expect(mediaSource.sourceBuffers).toHaveLength(0);

    mediaSource.open();
    await flush();

    expect(mediaSource.sourceBuffers).toHaveLength(1);
    expect(mediaSource.sourceBuffers[0].appended.map((bytes) => bytes[0])).toEqual([7]);
  });

  it('reflects setPlayhead into the pipe eviction-boundary getter', () => {
    const root = rootOf(new FakeMediaSource());
    expect(root.deps.getPlayheadSeconds()).toBe(0);
    root.setPlayhead(42);
    expect(root.deps.getPlayheadSeconds()).toBe(42);
    root.setPlayhead(0);
    expect(root.deps.getPlayheadSeconds()).toBe(0);
  });

  it('ends its own MediaSource on requestEndOfStream (worker-mode EOS)', async () => {
    const mediaSource = new FakeMediaSource();
    const root = rootOf(mediaSource);
    const sink = root.createSink({ durationSeconds: 90, mime: DEFAULT_FMP4_MIME, requestId: 5 });
    mediaSource.open();

    sink.append({ bytes: new Uint8Array(8).fill(2), kind: 'media' });
    sink.requestEndOfStream(0);
    await flush();

    expect(mediaSource.endOfStreamCalls).toBe(1);
  });

  it('tears down the pipeline and opens a fresh MediaSource per load', () => {
    const created: FakeMediaSource[] = [];
    const root = createWorkerMseRoot({
      backBufferSeconds: 30,
      createMediaSource: () => {
        const mediaSource = new FakeMediaSource();
        created.push(mediaSource);
        return mediaSource as unknown as MediaSource;
      },
      post: () => undefined,
    });

    root.createSink({ durationSeconds: 90, mime: DEFAULT_FMP4_MIME, requestId: 1 });
    const first = created[0];
    first.open();
    expect(first.sourceBuffers).toHaveLength(1);

    root.teardown();
    expect(first.sourceBuffers).toHaveLength(0); // source buffer removed

    root.createSink({ durationSeconds: 90, mime: DEFAULT_FMP4_MIME, requestId: 2 });
    expect(created).toHaveLength(2); // a fresh MediaSource (new HANDLE) per load
    expect(root.deps.getMediaSource()).toBe(created[1]);
  });

  it('reports a fatal append failure through onError scoped to the active load', async () => {
    const errors: { error: unknown; requestId: null | number; }[] = [];
    const mediaSource = new FakeMediaSource();
    mediaSource.addSourceBuffer = () => {
      const sourceBuffer = new FakeSourceBuffer();
      sourceBuffer.appendBuffer = () => {
        throw new Error('append exploded');
      };
      return sourceBuffer;
    };
    const root = rootOf(mediaSource, {
      onError: (requestId, error) => errors.push({ error, requestId }),
    });

    const sink = root.createSink({ durationSeconds: 90, mime: DEFAULT_FMP4_MIME, requestId: 9 });
    mediaSource.open();
    await flush();
    sink.append({ bytes: new Uint8Array(4).fill(1), kind: 'init' });
    await flush();

    expect(errors).toHaveLength(1);
    expect(errors[0].requestId).toBe(9);
    expect(errors[0].error).toBeInstanceOf(Error);
  });
});
