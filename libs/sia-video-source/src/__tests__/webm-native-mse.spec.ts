/**
 * Browser MSE validation for the native-WebM path available at this commit:
 * `WebmNativeProducer` (init/media classification) + `CuesIndex` (bounded
 * Cluster-window ranges) + `MseAppendPipe`/`MseAdapter` (append + EOS
 * deferral), driven by the committed crafted `buildWebm` fixture.
 *
 * This is the C5-era reduced standalone shape: it exercises the whole
 * byte→segment→SourceBuffer seam that exists now (C1/C4 producers + MSE pipe
 * + adapter), so Browser MSE runs stay green before the composition-root
 * graph lands. The final shape restores the full default-pipeline integration
 * when its imported modules arrive:
 *
 *   - index-builder registry + INDEX_HEAD_LENGTH (C6),
 *   - producer-factory strategies (C7),
 *   - stream-controller / wall-clock (C9),
 *   - load-pipeline (C10),
 *   - webm-browser-fixture (C15, browser-decodable bytes for decode evidence).
 *
 * Node (`SIA_TEST_ENV=node`) skips this file; nothing here branches production
 * code on `document`.
 */
import { describe, expect, it } from 'vitest';
import { CuesIndex } from '../container/webm/cues-index.ts';
import { WebmNativeProducer } from '../container/webm/webm-native-producer.ts';
import { MseAppendPipe } from '../mse-pipe.ts';
import { MseAdapter } from '../sink/mse-adapter.ts';
import { MemoryByteSource } from '../transport/memory-byte-source.ts';
import type { ByteRange, ByteSource, ReadOptions } from '../transport/byte-source.ts';
import type { ProducedSegment } from '../container/producer/appendable-producer.ts';
import type { RangeRead } from '../media/types.ts';
import { buildWebm } from './fixtures/webm-fixture.ts';

const IN_BROWSER =
  typeof document !== 'undefined' &&
  typeof HTMLVideoElement !== 'undefined' &&
  typeof MediaSource !== 'undefined';

// JSX-free fake MSE primitives mirroring the browser's async updateend/error
// contract, so the real SPF-backed pipe is exercised deterministically.
class FakeMediaSource extends EventTarget {
  endOfStreamCalls = 0;
  readyState: unknown = 'open';
  endOfStream(): void {
    this.endOfStreamCalls += 1;
    this.readyState = 'ended';
  }
}

class FakeSourceBuffer extends EventTarget {
  appended: Uint8Array[] = [];
  updating = false;
  get buffered(): unknown {
    return { end: () => 0, length: 0, start: () => 0 };
  }
  abort(): void {
    if (this.updating) {
      this.updating = false;
      this.dispatchEvent(new Event('updateend'));
    }
  }
  appendBuffer(data: BufferSource): void {
    if (this.updating) throw new DOMException('updating', 'InvalidStateError');
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBuffer);
    this.updating = true;
    queueMicrotask(() => {
      this.updating = false;
      this.appended.push(bytes);
      this.dispatchEvent(new Event('updateend'));
    });
  }
}

/** ByteSource that records every ranged read (offset/length) — proves bounded reads. */
class RecordingByteSource implements ByteSource {
  readonly reads: { length: number; offset: number }[] = [];
  readonly size: number;
  readonly #inner: MemoryByteSource;
  constructor(bytes: Uint8Array) {
    this.#inner = new MemoryByteSource(bytes);
    this.size = bytes.byteLength;
  }
  cancel(reason?: unknown): void {
    this.#inner.cancel(reason);
  }
  read(range: ByteRange, options: ReadOptions): ReadableStream<Uint8Array> {
    this.reads.push({ length: range.length, offset: range.offset });
    return this.#inner.read(range, options);
  }
}

/** Reads `length` bytes at `offset` from the source (bounded re-fetch). */
async function readExact(source: ByteSource, range: RangeRead): Promise<Uint8Array> {
  const reader = source.read({ length: range.length, offset: range.offset }, { epoch: 0 }).getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.byteLength;
    if (total >= range.length) break;
  }
  void reader.cancel().catch(() => undefined);
  const out = new Uint8Array(total);
  let at = 0;
  for (const chunk of chunks) {
    const n = Math.min(chunk.byteLength, total - at);
    out.set(chunk.subarray(0, n), at);
    at += n;
  }
  return out;
}

function walkRanges(index: CuesIndex): RangeRead[] {
  const seen: RangeRead[] = [];
  let range: null | RangeRead = index.first;
  while (range) {
    seen.push(range);
    range = index.next(range);
  }
  return seen;
}

describe.runIf(IN_BROWSER)('native WebM through the Cues/Cluster index (browser MSE)', () => {
  it('classifies the first pushed range as init and later ranges as media', async () => {
    const bytes = buildWebm(3);
    const index = CuesIndex.build(bytes);
    expect(index).not.toBeNull();
    const source = new MemoryByteSource(bytes);
    const producer = new WebmNativeProducer({ outputMime: 'video/webm; codecs="vp8, vorbis"' });
    const segments: ProducedSegment[] = [];
    producer.onSegment((segment) => segments.push(segment));

    const ranges = walkRanges(index!);
    expect(ranges).toHaveLength(3);
    for (const range of ranges) {
      const chunk = await readExact(source, range);
      producer.push(chunk, range.offset, 0);
    }

    expect(segments.map((segment) => segment.kind)).toEqual(['init', 'media', 'media']);
    expect(segments[0].bytes.byteLength).toBeGreaterThan(0);
    // The init range starts at byte 0 (EBML header + Segment + Info + Tracks
    // + first Cluster); each later range is exactly one bounded Cluster.
    expect(segments[1].bytes.byteLength).toBe(ranges[1].length);
    expect(segments[2].bytes.byteLength).toBe(ranges[2].length);
    expect(producer.outputMime).toBe('video/webm; codecs="vp8, vorbis"');
    expect(producer.mode).toBe('native');
  });

  it('appends produced segments through MseAdapter into the pipe (bounded reads, then EOS)', async () => {
    const bytes = buildWebm(2);
    const recording = new RecordingByteSource(bytes);
    const index = CuesIndex.build(bytes);
    expect(index).not.toBeNull();

    const mediaSource = new FakeMediaSource();
    const sourceBuffer = new FakeSourceBuffer();
    const pipe = new MseAppendPipe({
      backBufferSeconds: 30,
      getMediaSource: () => mediaSource as unknown as MediaSource,
      getPlayheadSeconds: () => 0,
      getSourceBuffer: () => sourceBuffer as unknown as SourceBuffer,
      onError: (error) => {
        throw error;
      },
    });
    const adapter = new MseAdapter({ pipe });
    const producer = new WebmNativeProducer();
    producer.onSegment((segment) => adapter.append(segment));

    const ranges = walkRanges(index!);
    for (const range of ranges) {
      const chunk = await readExact(recording, range);
      producer.push(chunk, range.offset, 0);
    }
    pipe.requestEndOfStream();
    await new Promise((resolve) => setTimeout(resolve, 30));

    // One append per walked range: the init range (byte 0) then each Cluster.
    expect(sourceBuffer.appended).toHaveLength(2);
    expect(recording.reads.map((read) => read.offset)).toEqual(ranges.map((range) => range.offset));
    // A seek on the bounded index reads a mid-object Cluster window, not byte 0.
    expect(index!.seek(1.5)!.offset).toBe(ranges[1].offset);
    expect(mediaSource.endOfStreamCalls).toBe(1);
  });

  it('reset(epoch) drops stale pushes but keeps the one-init classification', () => {
    const bytes = buildWebm(2);
    const producer = new WebmNativeProducer();
    const segments: ProducedSegment[] = [];
    producer.onSegment((segment) => segments.push(segment));

    producer.push(bytes, 0, 0);
    producer.reset(1);
    expect(producer.mode).toBe('native');
    // A stale push under the old epoch is dropped.
    producer.push(bytes, 0, 0);
    expect(segments).toHaveLength(1);
    // A fresh push under the new epoch is media (the init survived the reset,
    // matching a seek within the same load never re-delivering init).
    producer.push(bytes, 0, 1);
    expect(segments.map((segment) => segment.kind)).toEqual(['init', 'media']);
  });
});
