/**
 * The CustomSource adapter maps the ranged ByteSource onto mediabunny. A fake
 * ByteSource stands in for the transport so the adapter is exercised without
 * any media fixture or mediabunny Input.
 */
import { describe, expect, it, vi } from 'vitest';
import type { CustomSource } from 'mediabunny';
import { mediaLibrarySource } from '../media/library-source.ts';
import type { ByteRange, ByteSource, ReadOptions } from '../transport/byte-source.ts';

const customSourceConstructor = vi.hoisted(() => vi.fn());

vi.mock('mediabunny', async (importOriginal) => {
  const mediabunny = await importOriginal<typeof import('mediabunny')>();
  customSourceConstructor.mockImplementation(function (options: ConstructorParameters<typeof mediabunny.CustomSource>[0]) {
    return new mediabunny.CustomSource(options);
  });
  return { ...mediabunny, CustomSource: customSourceConstructor };
});

/** The size mediabunny would see; reads below always stay inside it. */
const FAKE_SIZE = 1024;

/** The adapter's read/dispose closures, reached without constructing Input. */
interface AdapterUnderTest {
  _options: {
    dispose: () => unknown;
    read: (start: number, end: number) => Promise<Uint8Array>;
  };
}

function dispose(adapter: CustomSource): void {
  (adapter as unknown as AdapterUnderTest)._options.dispose();
}

/**
 * Builds a ByteSource whose reads are supplied by `readImpl`, recording every
 * call and every stream so tests can inspect ranges and lock state.
 */
function fakeByteSource(readImpl: (range: ByteRange, options: ReadOptions) => ReadableStream<Uint8Array>): {
  calls: { options: ReadOptions; range: ByteRange }[];
  cancelled: ReturnType<typeof vi.fn>;
  source: ByteSource;
  streams: ReadableStream<Uint8Array>[];
} {
  const calls: { options: ReadOptions; range: ByteRange }[] = [];
  const streams: ReadableStream<Uint8Array>[] = [];
  const cancelled = vi.fn();
  const source: ByteSource = {
    cancel: cancelled,
    read: (range, options) => {
      calls.push({ options, range });
      const stream = readImpl(range, options);
      streams.push(stream);
      return stream;
    },
    size: FAKE_SIZE,
  };
  return { calls, cancelled, source, streams };
}

function readFrom(adapter: CustomSource, start: number, end: number): Promise<Uint8Array> {
  return (adapter as unknown as AdapterUnderTest)._options.read(start, end);
}

function streamOf(...chunks: Uint8Array[]): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(chunk);
      controller.close();
    },
  });
}

describe('mediaLibrarySource adapter', () => {
  it('selects the network prefetch profile', () => {
    const fake = fakeByteSource(() => streamOf());
    customSourceConstructor.mockClear();

    mediaLibrarySource(fake.source);

    expect(customSourceConstructor).toHaveBeenCalledOnce();
    expect(customSourceConstructor).toHaveBeenCalledWith(expect.objectContaining({ prefetchProfile: 'network' }));
  });

  it('passes the requested range through unmodified and hands loadGeneration to the transport read', async () => {
    const fake = fakeByteSource(() => streamOf(new Uint8Array(10)));
    const adapter = mediaLibrarySource(fake.source, { loadGeneration: 7 });

    const result = await readFrom(adapter, 10, 20);

    expect(fake.calls).toHaveLength(1);
    expect(fake.calls[0].range).toEqual({ length: 10, offset: 10 });
    expect(fake.calls[0].options.loadGeneration).toBe(7);
    expect(result.byteLength).toBe(10);
  });

  it('defaults the transport load generation to zero when loadGeneration is omitted', async () => {
    const fake = fakeByteSource(() => streamOf(new Uint8Array(3)));
    const adapter = mediaLibrarySource(fake.source);

    await readFrom(adapter, 0, 3);

    expect(fake.calls[0].options.loadGeneration).toBe(0);
  });

  it('joins multiple chunks into one exact-size buffer', async () => {
    const fake = fakeByteSource(() =>
      streamOf(new Uint8Array([1, 2, 3, 4]), new Uint8Array([5, 6, 7, 8, 9, 10])),
    );
    const adapter = mediaLibrarySource(fake.source);

    await expect(readFrom(adapter, 0, 10)).resolves.toEqual(
      new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
    );
  });

  it('rejects a short read with a RangeError', async () => {
    const fake = fakeByteSource(() => streamOf(new Uint8Array([1, 2, 3])));
    const adapter = mediaLibrarySource(fake.source);

    await expect(readFrom(adapter, 0, 10)).rejects.toBeInstanceOf(RangeError);
  });

  it('throws the aborted signal reason before any bytes are requested', async () => {
    const fake = fakeByteSource(() => streamOf(new Uint8Array(10)));
    const controller = new AbortController();
    const reason = new Error('load superseded');
    controller.abort(reason);
    const adapter = mediaLibrarySource(fake.source, { signal: controller.signal });

    await expect(readFrom(adapter, 0, 10)).rejects.toBe(reason);
    expect(fake.calls).toHaveLength(0);
    expect(fake.streams).toHaveLength(0);
  });

  it('releases the ByteSource stream lock after a successful read', async () => {
    const fake = fakeByteSource(() => streamOf(new Uint8Array([1, 2, 3])));
    const adapter = mediaLibrarySource(fake.source);

    await readFrom(adapter, 0, 3);

    expect(fake.streams[0].locked).toBe(false);
  });

  it('releases the ByteSource stream lock when the stream errors', async () => {
    const fake = fakeByteSource(
      () =>
        new ReadableStream<Uint8Array>({
          start(controller) {
            controller.error(new Error('transport failed'));
          },
        }),
    );
    const adapter = mediaLibrarySource(fake.source);

    await expect(readFrom(adapter, 0, 3)).rejects.toThrow('transport failed');
    expect(fake.streams[0].locked).toBe(false);
  });

  it('releases the ByteSource stream lock after a short read is rejected', async () => {
    const fake = fakeByteSource(() => streamOf(new Uint8Array(1)));
    const adapter = mediaLibrarySource(fake.source);

    await expect(readFrom(adapter, 0, 5)).rejects.toBeInstanceOf(RangeError);
    expect(fake.streams[0].locked).toBe(false);
  });

  it('passes dispose through to the underlying ByteSource cancel', () => {
    const fake = fakeByteSource(() => streamOf());
    const adapter = mediaLibrarySource(fake.source);

    dispose(adapter);

    expect(fake.cancelled).toHaveBeenCalledOnce();
  });
});

/** One macrotask turn (the async boundary a transport or wait settles on). */
function tick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('mediaLibrarySource read capacity backpressure', () => {
  it('a full sink blocks the upcoming range read until it drains', async () => {
    const fake = fakeByteSource(() => streamOf(new Uint8Array(10)));
    let release: () => void = () => undefined;
    const adapter = mediaLibrarySource(fake.source, {
      waitForCapacity: () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    });

    const read = readFrom(adapter, 10, 20);
    await tick();
    // The sink is full: the read must park before any transport bytes are
    // requested, so a short-lived full sink does not open an SDK download.
    expect(fake.calls).toHaveLength(0);
    expect(fake.streams).toHaveLength(0);

    release(); // the pipe drained; the read may now pull
    await expect(read).resolves.toHaveLength(10);
    expect(fake.calls).toHaveLength(1);
    expect(fake.calls[0].range).toEqual({ length: 10, offset: 10 });
  });

  it('bounds sequential multi-window reads: a later window waits for the earlier drain', async () => {
    let capacityCalls = 0;
    let releaseSecond: () => void = () => undefined;
    const waitForCapacity = (): Promise<void> => {
      capacityCalls += 1;
      if (capacityCalls === 1) return Promise.resolve(); // first window fits
      // The second window finds the sink full and must wait for it to drain.
      return new Promise<void>((resolve) => {
        releaseSecond = resolve;
      });
    };
    const fake = fakeByteSource(() => streamOf(new Uint8Array(10)));
    const adapter = mediaLibrarySource(fake.source, { waitForCapacity });

    // The first window finds room, so it reads immediately.
    await expect(readFrom(adapter, 0, 10)).resolves.toHaveLength(10);
    expect(fake.calls).toHaveLength(1);

    // Second window: the sink is still full from the first window's media, so
    // the read parks and the transport is not pulled again.
    const second = readFrom(adapter, 10, 20);
    await tick();
    expect(fake.calls).toHaveLength(1);

    // The earlier window drains; the bounded reader resumes with the next window.
    releaseSecond();
    await expect(second).resolves.toHaveLength(10);
    expect(fake.calls).toHaveLength(2);
    expect(fake.calls[1].range).toEqual({ length: 10, offset: 10 });
  });

  it('re-checks the abort signal after a capacity wait so teardown never hangs the read', async () => {
    const fake = fakeByteSource(() => streamOf(new Uint8Array(10)));
    const controller = new AbortController();
    const reason = new Error('load superseded while parking');
    let release: () => void = () => undefined;
    const adapter = mediaLibrarySource(fake.source, {
      signal: controller.signal,
      waitForCapacity: () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    });

    const read = readFrom(adapter, 0, 10);
    await tick();
    expect(fake.calls).toHaveLength(0);

    // Teardown while the reader waits for capacity: the abort lands, then the
    // (now dead) sink releases its waiters. The read must fail with the abort
    // reason, never pull bytes nor hang.
    controller.abort(reason);
    release();
    await expect(read).rejects.toBe(reason);
    expect(fake.calls).toHaveLength(0);
  });

  it('leaves reads untouched when no capacity wait is configured', async () => {
    const fake = fakeByteSource(() => streamOf(new Uint8Array(3)));
    const adapter = mediaLibrarySource(fake.source);

    await expect(readFrom(adapter, 0, 3)).resolves.toHaveLength(3);
    expect(fake.calls).toHaveLength(1);
  });
});

describe('mediaLibrarySource read buffered-ahead backpressure (primary quota protection)', () => {
  it('a SourceBuffer at or over the ahead target parks reads until playback advances', async () => {
    let aheadCalls = 0;
    let release: () => void = () => undefined;
    const waitForBufferedAhead = (): Promise<void> => {
      aheadCalls += 1;
      if (aheadCalls === 1) return Promise.resolve(); // first window: room
      // Buffered ahead hit the target: the producer must park and not pull.
      return new Promise<void>((resolve) => {
        release = resolve;
      });
    };
    const fake = fakeByteSource(() => streamOf(new Uint8Array(10)));
    const adapter = mediaLibrarySource(fake.source, { waitForBufferedAhead });

    // The first window has room, so it reads immediately.
    await expect(readFrom(adapter, 0, 10)).resolves.toHaveLength(10);
    expect(fake.calls).toHaveLength(1);

    // The SourceBuffer reached the ahead target: the next read parks before any
    // transport request, so a full-ahead sink does not open an SDK download.
    const second = readFrom(adapter, 10, 20);
    await tick();
    expect(fake.calls).toHaveLength(1);

    // Playback advances or the buffer is trimmed: the ahead wait resolves and
    // the parked read resumes pulling the next window.
    release();
    await expect(second).resolves.toHaveLength(10);
    expect(fake.calls).toHaveLength(2);
    expect(fake.calls[1].range).toEqual({ length: 10, offset: 10 });
  });

  it('leaves reads untouched when no ahead wait is configured', async () => {
    const fake = fakeByteSource(() => streamOf(new Uint8Array(3)));
    const adapter = mediaLibrarySource(fake.source);

    await expect(readFrom(adapter, 0, 3)).resolves.toHaveLength(3);
    expect(fake.calls).toHaveLength(1);
  });
});

/**
 * A stream that enqueues 4 bytes, then pauses inside pull until `release()`
 * is called, after which it enqueues the remaining `rest` bytes and closes.
 * Models an in-flight multi-MiB drain that a second reader must not overlap.
 */
function heldStream(rest: number): { release: () => void; stream: ReadableStream<Uint8Array> } {
  let releaseFn: () => void = () => undefined;
  let done = false;
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (!done) {
        done = true;
        controller.enqueue(new Uint8Array(4));
        await new Promise<void>((resolve) => {
          releaseFn = resolve;
        });
      }
      for (let i = 0; i < rest; i += 4) {
        controller.enqueue(new Uint8Array(Math.min(4, rest - i)));
      }
      controller.close();
    },
  });
  return { release: () => releaseFn(), stream };
}

describe('mediaLibrarySource read admission (concurrent prefetch windows)', () => {
  it('serializes concurrent reads: a second prefetch window never opens a transport read while the first is draining', async () => {
    const held = heldStream(6); // first read: 4 bytes, hold, then 6 more = 10
    let call = 0;
    const fake = fakeByteSource(() => {
      call += 1;
      return call === 1 ? held.stream : streamOf(new Uint8Array(10));
    });
    const adapter = mediaLibrarySource(fake.source);

    const first = readFrom(adapter, 0, 10);
    const second = readFrom(adapter, 10, 20);
    await tick();

    // The first window is still draining: the second must be queued, not
    // opening a parallel transport read (the 2x8 MiB burst the gate must bound).
    expect(fake.calls).toHaveLength(1);

    held.release();
    await expect(first).resolves.toHaveLength(10);
    await expect(second).resolves.toHaveLength(10);
    expect(fake.calls).toHaveLength(2);
    expect(fake.calls[1].range).toEqual({ length: 10, offset: 10 });
  });

  it('spans the admission over the gate waits and the full drain, not just the entry check', async () => {
    const held = heldStream(6);
    let call = 0;
    let releaseGate: () => void = () => undefined;
    const fake = fakeByteSource(() => {
      call += 1;
      return call === 1 ? held.stream : streamOf(new Uint8Array(10));
    });
    const adapter = mediaLibrarySource(fake.source, {
      waitForCapacity: () =>
        call === 0
          ? new Promise<void>((resolve) => {
              releaseGate = resolve;
            })
          : Promise.resolve(),
    });

    const first = readFrom(adapter, 0, 10);
    const second = readFrom(adapter, 10, 20);
    await tick();

    // First read parks at the gate; the second read must also stay out of
    // the transport (a gate-only admission would already have admitted it).
    expect(fake.calls).toHaveLength(0);

    releaseGate(); // the first read may now pull, but must drain fully first
    await tick();
    expect(fake.calls).toHaveLength(1);
    expect(fake.streams[0].locked).toBe(true);

    held.release();
    await expect(first).resolves.toHaveLength(10);
    await expect(second).resolves.toHaveLength(10);
    expect(fake.calls).toHaveLength(2);
    expect(fake.calls[1].range).toEqual({ length: 10, offset: 10 });
  });

  it('releases the slot when the in-flight read fails, so a queued read proceeds', async () => {
    let call = 0;
    const fake = fakeByteSource(() => {
      call += 1;
      if (call === 1) {
        return new ReadableStream<Uint8Array>({
          start(controller) {
            controller.error(new Error('transport failed'));
          },
        });
      }
      return streamOf(new Uint8Array(10));
    });
    const adapter = mediaLibrarySource(fake.source);

    const first = readFrom(adapter, 0, 10);
    const second = readFrom(adapter, 10, 20);
    await expect(first).rejects.toThrow('transport failed');

    // A leaked slot would hang the second read forever; it must proceed.
    await expect(second).resolves.toHaveLength(10);
    expect(fake.calls).toHaveLength(2);
  });

  it('an aborted queued read rejects with the signal reason and never opens a transport read', async () => {
    const held = heldStream(6);
    let call = 0;
    const fake = fakeByteSource(() => {
      call += 1;
      return call === 1 ? held.stream : streamOf(new Uint8Array(10));
    });
    const controller = new AbortController();
    const reason = new Error('load superseded');
    const adapter = mediaLibrarySource(fake.source, { signal: controller.signal });

    const first = readFrom(adapter, 0, 10);
    const second = readFrom(adapter, 10, 20);
    await tick();
    expect(fake.calls).toHaveLength(1); // only the in-flight read

    // The load is superseded while the second read is queued: it must reject
    // with the abort reason without ever reaching the transport.
    controller.abort(reason);
    held.release();
    await expect(first).resolves.toHaveLength(10);
    await expect(second).rejects.toBe(reason);
    expect(fake.calls).toHaveLength(1);
  });
});
