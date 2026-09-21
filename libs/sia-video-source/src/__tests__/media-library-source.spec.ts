/**
 * Contracts for the CustomSource adapter that maps the ranged ByteSource onto
 * mediabunny. A fake ByteSource stands in for the transport so the adapter is
 * exercised without any media fixture or mediabunny Input.
 */
import { describe, expect, it, vi } from 'vitest';
import type { CustomSource } from 'mediabunny';
import { mediaLibrarySource } from '../media/library-source.ts';
import type { ByteRange, ByteSource, ReadOptions } from '../transport/byte-source.ts';

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
  it('forwards the requested range unmodified and passes loadGeneration to the transport read', async () => {
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

  it('forwards dispose to the underlying ByteSource cancel', () => {
    const fake = fakeByteSource(() => streamOf());
    const adapter = mediaLibrarySource(fake.source);

    dispose(adapter);

    expect(fake.cancelled).toHaveBeenCalledOnce();
  });
});
