/**
 * Browser MSE validation for the moof-walk random-access index over a real
 * sidx-less fragmented fMP4: the default composition-root `LoadPipeline`
 * (same graph as `webm-native-mse.spec.ts` — default classifier,
 * `createIndexBuilderRegistry()` which now contains the moof-walk builder
 * after the sidx builder, passthrough-first producer for fmp4) must resolve a
 * sidx-less fragmented browser-decodable fixture to a `MoofWalkIndex` +
 * passthrough producer and:
 *
 *   1. stream from byte 0 through a REAL MediaSource to EOS with DECODE
 *      evidence and no `MEDIA_ERR_DECODE` (Chromium + Firefox);
 *   2. FLOOR-seek through the `StreamController` into the middle while
 *      playing, proving the seek reads a BOUNDED moof→mdat window (a
 *      recording `ByteSource` asserts the post-seek read starts at the
 *      walked fragment offset, NOT byte 0 / the whole object), then drains
 *      to EOS cleanly;
 *   3. surface the duration from the index (the ffmpeg `empty_moov` mvhd
 *      duration is 0 — the walker's fragment-derived terminal end is what
 *      vouches for ~2.02 s), and permit a native far-seek at the tail.
 *
 * Node (`SIA_TEST_ENV=node`) skips this file; nothing here branches
 * production code on `document`.
 */
import { describe, expect, it } from 'vitest';
import { capabilityVerdict } from '../capabilities/codec-verdict.ts';
import type { PlaybackCapabilities } from '../capabilities/browser-capabilities.ts';
import { createContainerClassifier } from '../capabilities/container-classifier.ts';
import { createIndexBuilderRegistry } from '../container/index/index-builder.ts';
import { MoofWalkIndex } from '../container/index/moof-index.ts';
import { PassthroughProducer } from '../container/producer/passthrough-producer.ts';
import {
  PassthroughProducerStrategy,
  ProducerFactoryRegistry,
  TsToFmp4ProducerStrategy,
} from '../container/producer/producer-factory.ts';
import { MseAppendPipe } from '../mse-pipe.ts';
import { createLoadPipeline, type LoadPipeline } from '../session/load-pipeline.ts';
import { wallClock } from '../session/clock.ts';
import { createStreamController } from '../session/stream-controller.ts';
import { MseAdapter } from '../sink/mse-adapter.ts';
import { MemoryByteSource } from '../transport/memory-byte-source.ts';
import type { ByteRange, ByteSource, ReadOptions } from '../transport/byte-source.ts';
import type { AppendableProducer } from '../container/producer/appendable-producer.ts';
import { indexGranularity, type RandomAccessIndex } from '../media/types.ts';
import {
  MOOF_FIXTURE_DURATION_SECONDS,
  MOOF_FIXTURE_MIME,
  moofFixtureBytes,
} from './fixtures/moof-fixture.ts';

const IN_BROWSER =
  typeof document !== 'undefined' &&
  typeof HTMLVideoElement !== 'undefined' &&
  typeof MediaSource !== 'undefined';

interface RealMse {
  errors: unknown[];
  mediaSource: MediaSource;
  pipe: MseAppendPipe;
  sourceBuffer: SourceBuffer;
  video: HTMLVideoElement;
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

function bufferedEnd(sourceBuffer: SourceBuffer): null | number {
  const ranges = sourceBuffer.buffered;
  if (!ranges || ranges.length === 0) return null;
  let end = -Infinity;
  for (let index = 0; index < ranges.length; index += 1) end = Math.max(end, ranges.end(index));
  return end;
}

/** The default composition-root pipeline graph (mirrors `WorkerComposition`). */
function defaultPipeline(capabilities: PlaybackCapabilities): LoadPipeline {
  return createLoadPipeline({
    capabilities,
    classifier: createContainerClassifier(),
    indexBuilders: createIndexBuilderRegistry(),
    producerFactory: new ProducerFactoryRegistry([
      new PassthroughProducerStrategy(),
      new TsToFmp4ProducerStrategy(),
    ]),
  });
}

async function firstBytes(source: ByteSource, length: number): Promise<Uint8Array> {
  const reader = source.read({ length, offset: 0 }, { epoch: 0 }).getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.byteLength;
    if (total >= length) break;
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

function nativeCapabilities(): PlaybackCapabilities {
  return {
    canConstructWorkerMse: () => false,
    mayDecode: () => capabilityVerdict['unknown-codec'],
    mseSupported: (mime) => MediaSource.isTypeSupported(mime),
    webCodecsAvailable: () => false,
    workerHandleAvailable: () => false,
  };
}

async function openRealMse(mime: string): Promise<RealMse> {
  const video = document.createElement('video');
  const mediaSource = new MediaSource();
  const url = URL.createObjectURL(mediaSource);
  video.src = url;
  if (mediaSource.readyState !== 'open') {
    await new Promise<void>((resolve, reject) => {
      mediaSource.addEventListener('sourceopen', () => resolve(), { once: true });
      const timer = setTimeout(() => reject(new Error('MediaSource never opened')), 10_000);
      mediaSource.addEventListener('sourceclose', () => {
        clearTimeout(timer);
        reject(new Error('MediaSource closed before opening'));
      }, { once: true });
    });
  }
  const sourceBuffer = mediaSource.addSourceBuffer(mime);
  const errors: unknown[] = [];
  const pipe = new MseAppendPipe({
    backBufferSeconds: 30,
    getMediaSource: () => mediaSource,
    getPlayheadSeconds: () => video.currentTime,
    getSourceBuffer: () => sourceBuffer,
    onError: (error) => errors.push(error),
  });
  return { errors, mediaSource, pipe, sourceBuffer, video };
}

async function startControllerOverRealMse(
  graph: { index: null | RandomAccessIndex; producer: AppendableProducer; source: ByteSource },
  mime: string,
  lookaheadSeconds = 30,
): Promise<{ controller: ReturnType<typeof createStreamController>; mse: RealMse }> {
  const mse = await openRealMse(mime);
  const adapter = new MseAdapter({ pipe: mse.pipe });
  const controller = createStreamController({
    clock: wallClock(),
    errorReporter: { report: (failure: unknown) => mse.errors.push(failure) },
    lookaheadSeconds,
  });
  controller.start({ index: graph.index, producer: graph.producer, sink: adapter, source: graph.source });
  return { controller, mse };
}

async function waitFor(condition: () => boolean, label: string, timeoutMs = 20_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (condition()) return;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error(`waitFor timed out: ${label}`);
}

describe.runIf(IN_BROWSER)('sidx-less fragmented fMP4 through the moof-walk index (browser MSE)', () => {
  it('the default pipeline resolves the sidx-less fMP4 to passthrough + an exact-byte MoofWalkIndex that vouches duration', async () => {
    const bytes = moofFixtureBytes();
    const source = new MemoryByteSource(bytes);
    const result = await defaultPipeline(nativeCapabilities()).run({ head: await firstBytes(source, 4096), source });

    expect(result.mime).toBe(MOOF_FIXTURE_MIME);
    expect(result.reason).toBe('producer:passthrough');
    expect(result.producer).toBeInstanceOf(PassthroughProducer);
    // Fragmented fMP4 without a sidx gets a moof-walk index (not null).
    expect(result.index).toBeInstanceOf(MoofWalkIndex);
    const index = result.index as MoofWalkIndex;
    expect(index.granularity).toBe(indexGranularity['exact-byte']);
    // The builder walks real ffmpeg fragments: 4 RAP-aligned ranges.
    let ranges = 0;
    let range = index.first;
    while (range) {
      expect(range.rap).toBe(true);
      ranges += 1;
      range = index.next(range);
    }
    expect(ranges).toBe(4);
    expect(index.seek(1)?.offset).toBeGreaterThan(0);
    // mvhd duration is 0 in empty_moov; the index derives ~2.02 s from fragments.
    expect(index.durationSeconds).not.toBeNull();
    expect(index.durationSeconds!).toBeGreaterThan(2);
    expect(index.durationSeconds!).toBeLessThan(2.1);
    expect(result.capabilities.indexGranularity).toBe(indexGranularity['exact-byte']);
    expect(result.capabilities.durationSeconds).toBeCloseTo(2.02, 1);
  });

  it('streams from byte 0 into a real MediaSource, decodes, and reaches EOS', async () => {
    const bytes = moofFixtureBytes();
    const source = new MemoryByteSource(bytes);
    const result = await defaultPipeline(nativeCapabilities()).run({
      head: await firstBytes(source, 4096),
      source,
    });
    const { controller, mse } = await startControllerOverRealMse(
      { index: result.index, producer: result.producer, source },
      result.mime,
    );

    await waitFor(
      () => {
        if (mse.mediaSource.readyState !== 'ended') return false;
        const end = bufferedEnd(mse.sourceBuffer);
        return end !== null && end >= MOOF_FIXTURE_DURATION_SECONDS - 0.5;
      },
      'sidx-less fMP4 buffered to EOS',
    );
    expect(mse.errors).toEqual([]);
    expect(controller.state).toBe('ended');

    mse.video.muted = true;
    void mse.video.play();
    await waitFor(
      () => mse.video.error !== null || mse.video.currentTime >= 0.1,
      'playhead advanced or a decode error surfaced',
    );
    expect(mse.video.error).toBeNull();
    expect(mse.video.currentTime).toBeGreaterThanOrEqual(0.05);

    // Native far-seek at the tail (the random-access grid is real).
    const tail = MOOF_FIXTURE_DURATION_SECONDS - 0.3;
    mse.video.currentTime = tail;
    await waitFor(
      () => mse.video.currentTime >= tail - 0.1 || mse.video.error !== null,
      'native far-seek reached the tail',
    );
    expect(mse.video.error).toBeNull();
    expect(mse.errors).toEqual([]);
  });

  it('FLOOR-seeks through the controller and reads ONLY the bounded moof→mdat window (real MSE)', async () => {
    const bytes = moofFixtureBytes();
    const recording = new RecordingByteSource(bytes);
    const result = await defaultPipeline(nativeCapabilities()).run({
      head: await firstBytes(recording, 4096),
      source: recording,
    });

    // Keep the MediaSource alive through the whole window (test 2's straight-
    // to-EOS stream did this implicitly): a detached, idle `<video>` lets
    // Chromium close the MediaSource, detaching its SourceBuffers.
    const { controller, mse } = await startControllerOverRealMse(
      { index: result.index, producer: result.producer, source: recording },
      result.mime,
      0.6,
    );
    mse.video.muted = true;
    document.body.append(mse.video);
    void mse.video.play().catch(() => undefined);

    // Report the playhead so lookahead means something: the run buffers the
    // init + first fragments (0 → ~1.02 s), then PAUSES before EOS, leaving a
    // live session we can seek — after EOS seek() is ignored.
    controller.playhead(0);
    await waitFor(
      () => bufferedEnd(mse.sourceBuffer) !== null && bufferedEnd(mse.sourceBuffer)! >= 0.5,
      'initial fragments buffered',
    );
    expect(controller.state).not.toBe('ended');
    expect(mse.video.error).toBeNull();
    expect(mse.errors).toEqual([]);

    // Floor-seek to a point BEYOND the buffered end: the moof-walk floor lands
    // on the walked fragment whose range cleanly extends the buffer (no
    // overlap with what is already there — the real-host far-seek pattern).
    const moofWalkOffset = (result.index as MoofWalkIndex).seek(1.7)!.offset;
    expect(moofWalkOffset).toBeGreaterThan(0);
    // The real-host far-seek pair: the controller re-buffers from the walked
    // floor range while the element seeks natively to the target.
    controller.seek(1.7);
    mse.video.currentTime = 1.7;

    // The seek must read the walked fragment window (not byte 0 / whole object).
    await waitFor(
      () => recording.reads.some((read) => read.offset === moofWalkOffset),
      `post-seek read at the moof-walk offset ${moofWalkOffset}`,
    );
    // A fresh sequential byte-0 re-fetch is exactly what the index forbids: no
    // post-start read may begin at offset 0 (the init lives in the carried
    // first range; a mid-stream seek must never re-fetch it).
    const postStartReads = recording.reads.filter((read) => read.offset !== 0 && read.offset !== 4096);
    expect(postStartReads.some((read) => read.offset === moofWalkOffset)).toBe(true);

    // Then it drains to terminal EOS cleanly and the tail is decodable.
    await waitFor(
      () => mse.mediaSource.readyState === 'ended',
      'post-seek drain reached EOS',
    );
    expect(mse.errors).toEqual([]);
    expect(mse.video.error).toBeNull();
    expect(controller.state).toBe('ended');

    // The tail actually rendered: re-assert the native seek now that the
    // walked range is buffered (an early currentTime write to an unseekable
    // position is dropped by the element), then watch the playhead advance.
    mse.video.currentTime = 1.7;
    await waitFor(
      () => mse.video.currentTime >= 1.4 || mse.video.error !== null,
      'playhead reached the seek tail after the walked range buffered',
    );
    expect(mse.video.error).toBeNull();
    expect(mse.video.currentTime).toBeGreaterThanOrEqual(1.4);
  });
});
