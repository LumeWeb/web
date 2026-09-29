/**
 * Firefox-main MSE scaffold: prove the long browser-decodable fixture can
 * initialize a real main-thread `MediaSource` and `SourceBuffer` in each
 * configured browser project (Chromium and Firefox).
 *
 * This is the `workerMse: 'main'` path: the `MediaSource` and its
 * `SourceBuffer` are built on the main thread, never inside a dedicated
 * worker. The committed fixture is a progressive MP4 (a `moov` without
 * `mvex`) and a real `SourceBuffer` rejects it as unfragmented, so the test
 * feeds it through the same conversion production runs in this mode:
 * `inspectMediaLibrary` refragments the bytes into CMAF over the byte
 * source, and the load's playback starts against the main-thread
 * `MseAppendPipe` (the one `SiaVideoSource` builds in that mode), which
 * writes the resulting fragments into the real `SourceBuffer`.
 *
 * The single assertion: once the conversion has drained, the real
 * `SourceBuffer` holds a non-empty buffered range. That is the base every
 * buffered-ahead check in this file later reads off the same `SourceBuffer`.
 *
 * A second block drives the real `SiaVideoSource` host (not the coordinator
 * seam): after a full main-mode handshake with a fake worker, the fake worker
 * runs a real mediabunny conversion of the long fixture and posts its fMP4
 * output as `CHUNK`s, which the host absorbs into its real main-thread
 * SourceBuffer. Every real `updateend` must then make the host post the
 * current request's `BUFFERED_STATE` (copied real nonempty buffered
 * windows, a finite playhead, a finite pending append payload), and
 * changing the element's `currentTime` and dispatching `timeupdate` must
 * be echoed by a later current-request report carrying that playhead.
 */
import { describe, expect, it } from 'vitest';
import type { PlaybackCapabilities } from '../capabilities/browser-capabilities.ts';
import { inspectMediaLibrary } from '../media/library-load.ts';
import { MseAppendPipe } from '../mse-pipe.ts';
import {
  type BufferWindow,
  type MainToWorkerMessage,
  MainToWorkerMessageType,
  PROTOCOL_VERSION,
  type WorkerToMainMessage,
  WorkerToMainMessageType,
} from '../protocol.ts';
import { createLoadPipeline } from '../session/load-pipeline.ts';
import { sourceInfoFor } from '../session/source-capabilities.ts';
import { SiaVideoSource } from '../sia-video-source.ts';
import type { AppendSink } from '../sink/append-sink.ts';
import { MseAdapter } from '../sink/mse-adapter.ts';
import type { ByteRange, ByteSource, ReadOptions } from '../transport/byte-source.ts';
import { MemoryByteSource } from '../transport/memory-byte-source.ts';
import {
  BROWSER_DECODABLE_LONG_FIXTURE_DURATION_SECONDS,
  BROWSER_DECODABLE_LONG_FIXTURE_MIME,
  browserDecodableLongFixtureBytes,
} from './fixtures/browser-decodable-long-fixture.ts';

/** Runs only in a real browser with a `MediaSource` API (both Playwright projects). */
const IN_BROWSER = typeof document !== 'undefined' && typeof MediaSource !== 'undefined';

/** Renders an unknown captured failure for a message: an Error's own message, anything else as JSON. */
function describeFailure(failure: unknown): string {
  return failure instanceof Error ? failure.message : JSON.stringify(failure);
}

/** Capability snapshot that forces the main-thread mode: no dedicated-worker MSE. */
function mainThreadCapabilities(): PlaybackCapabilities {
  return {
    canConstructWorkerMse: () => false,
    mayDecode: () => ({ decodable: true } as never),
    mseImpl: () => ({ canConstructInDedicatedWorker: false, impl: 'standard', managed: false }),
    mseSupported: () => true,
    webCodecsAvailable: () => false,
    workerHandleAvailable: () => false,
  };
}

/** The real `SourceBuffer`'s last buffered-range end (0 when nothing is buffered). */
function realBufferedEnd(sourceBuffer: SourceBuffer): number {
  const ranges = sourceBuffer.buffered;
  return ranges.length === 0 ? 0 : ranges.end(ranges.length - 1);
}

/** Polls until a predicate holds or the probe times out. */
async function waitFor(predicate: () => boolean, timeoutMs = 30_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (!predicate()) {
    if (Date.now() > deadline) throw new Error('timed out waiting for the main-thread conversion');
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

/**
 * Resolves once the `MediaSource` transitions to `open` (`sourceopen`) after
 * an element takes it as its resource (the production attach, see the
 * header). Rejects (instead of hanging) if the source never opens within the
 * timeout.
 */
function waitForSourceOpen(mediaSource: MediaSource, timeoutMs = 30_000): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      mediaSource.removeEventListener('sourceopen', onOpen);
      reject(new Error('timed out waiting for the main-thread MediaSource to open'));
    }, timeoutMs);
    const onOpen = (): void => {
      if (settled) return;
      settled = true;
      mediaSource.removeEventListener('sourceopen', onOpen);
      clearTimeout(timer);
      resolve();
    };
    if (mediaSource.readyState === 'open') {
      onOpen();
      return;
    }
    mediaSource.addEventListener('sourceopen', onOpen);
  });
}

/**
 * Like `waitFor`, but settles with a boolean instead of throwing on timeout, so
 * a phase that is allowed to stall (a parked producer) gets a bounded chance to
 * resume without a hard failure; the caller makes the real assertion.
 */
async function waitUntil(predicate: () => boolean, timeoutMs = 30_000): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (!predicate()) {
    if (Date.now() > deadline) return false;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  return true;
}

/**
 * Emulates the transport latency of a real ranged download (Sia over the
 * network): a `MemoryByteSource` serves bytes on microtasks, faster than a
 * real `SourceBuffer` can absorb them, so a producer that only parks before
 * issuing a read would fire every read in one microtask burst and the gate
 * would never get a chance to bind. Delaying each ranged read by the amount
 * of a network round-trip puts the producer on the latency the ahead gate
 * was designed for: it must now decide to park between individually-delivered
 * reads, exactly as it does against a real network source.
 */
const READ_DELAY_MS = 100;

/** Delivers each ranged read of `inner` only `delayMs` after the request. */
class DelayedByteSource implements ByteSource {
  get size(): number {
    return this.#inner.size;
  }

  readonly #delayMs: number;
  readonly #inner: MemoryByteSource;

  constructor(inner: MemoryByteSource, delayMs: number) {
    this.#inner = inner;
    this.#delayMs = delayMs;
  }

  cancel(reason?: unknown): void {
    this.#inner.cancel(reason);
  }

  read(range: ByteRange, options: ReadOptions): ReadableStream<Uint8Array> {
    // The ReadableStream callbacks run with the underlying source object as
    // `this`, never the class instance, so the private fields are captured here.
    const inner = this.#inner;
    const delayMs = this.#delayMs;
    let innerReader: null | ReadableStreamDefaultReader<Uint8Array> = null;
    let canceled = false;
    return new ReadableStream<Uint8Array>({
      cancel(reason) {
        canceled = true;
        const reader = innerReader;
        if (reader) void reader.cancel(reason).catch(() => undefined);
      },
      start(controller) {
        // The inner read starts only after the emulated latency; a read the
        // consumer abandons before then never touches the inner source (an
        // abandoned probe must not cancel the inner source's active read).
        setTimeout(() => {
          if (canceled) return;
          try {
            innerReader = inner.read(range, options).getReader();
          } catch {
            return;
          }
          const pump = (): void => {
            const reader = innerReader;
            if (reader === null) return;
            void reader
              .read()
              .then(
                ({ done, value }) => {
                  if (canceled) return;
                  if (done) {
                    controller.close();
                    return;
                  }
                  controller.enqueue(value);
                  pump();
                },
                () => {
                  // The inner read was superseded or cancelled by the source:
                  // the consumer that caused it already knows; stop pumping
                  // silently rather than erroring the outer stream.
                },
              )
              .catch(() => undefined);
          };
          pump();
        }, delayMs);
      },
    });
  }
}

/**
 * The small ahead target the held-playhead plateau run parks on: far below
 * the 12 s fixture, so a producer that is never gated by it blows through
 * the whole object, while a gated one must stop early.
 */
const AHEAD_TARGET_SECONDS = 2;

/** How long the real buffered end must stop growing before the plateau is judged. */
const PLATEAU_STABLE_MS = 3_000;

/**
 * How far short of the plateau's buffered end to place the resumed playhead: the
 * covered-ahead it leaves sits well under the ahead target, so a parked producer
 * has room again and resumes.
 */
const RESUME_PLAYHEAD_OFFSET_SECONDS = 0.5;

/**
 * Minimum real buffered-end growth past the plateau that counts as the
 * conversion clearly resuming: under one keyframe, so a single appended
 * fragment clears it.
 */
const RESUME_PROGRESS_SECONDS = 0.25;

/**
 * The bounded, non-fatal time the resumed producer gets to keep converting
 * before the resume assertion is judged (a producer left parked times out here).
 */
const RESUME_WAIT_MS = 12_000;

/**
 * Mid-file playhead the host proof writes into the element's `currentTime`:
 * inside the real buffered window the conversion has built by then (the test
 * waits until a report shows the window covering it).
 */
const PLAYHEAD_SECONDS = 5;

/**
 * Fake playback worker: captures the main-to-worker messages (`sent`),
 * collects the host's `BUFFERED_STATE` reports (`bufferedReports`), and lets
 * the test reply with worker-to-main messages as if it were the real isolate.
 * It implements only the worker surface `SiaVideoSource` uses:
 * `addEventListener` / `removeEventListener` / `postMessage` / `terminate`.
 */
class HostFakeWorker {
  bufferedReports: { buffered: unknown[]; pendingBytes: number; playhead: number; requestId: number }[] = [];
  listener: ((event: { data: unknown }) => void) | null = null;
  readonly sent: MainToWorkerMessage[] = [];

  addEventListener(_type: 'message', listener: (event: { data: unknown }) => void): void {
    this.listener = listener;
  }
  helloRequestId(): number {
    const hello = this.sent.find((m) => m.type === MainToWorkerMessageType.HELLO);
    if (!hello || !('requestId' in hello)) throw new Error('no HELLO');
    return hello.requestId;
  }
  newestAttachRequestId(): number {
    const attach = [...this.sent].reverse().find((m) => m.type === MainToWorkerMessageType.ATTACH);
    if (!attach || !('requestId' in attach)) throw new Error('no ATTACH');
    return attach.requestId;
  }
  postMessage(message: unknown, _transfer?: Transferable[]): void {
    this.sent.push(message as MainToWorkerMessage);
    const typed = message as MainToWorkerMessage;
    if (typed.type === MainToWorkerMessageType.BUFFERED_STATE) {
      this.bufferedReports.push({
        buffered: typed.buffered as unknown[],
        pendingBytes: typed.pendingBytes,
        playhead: typed.playhead,
        requestId: typed.requestId,
      });
    }
  }
  removeEventListener(): void {
    this.listener = null;
  }
  reply(message: WorkerToMainMessage): void {
    this.listener?.({ data: message });
  }
  terminate(): void { /* noop */ }
}

describe.skipIf(!IN_BROWSER)('Firefox-main MSE: the long fixture initializes a real main-thread SourceBuffer', () => {
  it('a real main-thread SourceBuffer accepts the long fixture (initializes with a non-empty buffer)', async () => {
    // The real conversion over the real byte source: the progressive file is
    // refragmented into CMAF exactly as the production main-thread pipeline
    // does, so the SourceBuffer never sees the rejected unfragmented layout.
    const result = await inspectMediaLibrary(
      new MemoryByteSource(browserDecodableLongFixtureBytes()),
      { capabilities: mainThreadCapabilities() },
    );
    if (result.status !== 'ready') {
      throw new Error(`load did not come back ready (${result.status}${'reason' in result ? `: ${result.reason}` : ''})`);
    }

    // The `<video>` is what opens the `MediaSource`: `sourceopen` never fires
    // for an unattached one, so the attach mirrors `#beginMainThreadMse`.
    const video = document.createElement('video');
    video.playsInline = true;
    document.body.appendChild(video);
    const mediaSource = new MediaSource();
    const objectUrl = URL.createObjectURL(mediaSource);
    let sourceBuffer: null | SourceBuffer = null;
    try {
      video.src = objectUrl;
      await waitForSourceOpen(mediaSource);

      // Mirrors `#addMainSourceBuffer`: the duration is set while the source
      // is open, then one SourceBuffer for the load's codec-qualified MIME.
      if (result.durationSeconds !== null) mediaSource.duration = result.durationSeconds;
      const buffer = mediaSource.addSourceBuffer(result.mime);
      sourceBuffer = buffer;

      // The pipe production builds in this mode: no ahead target and no
      // capacity bound, so its producer waits never bind and the conversion
      // drains the whole fixture into the real buffer.
      let appendFailure: unknown = null;
      const pipe = new MseAppendPipe({
        backBufferSeconds: 30,
        getMediaSource: () => mediaSource,
        getPlayheadSeconds: () => video.currentTime,
        getSourceBuffer: () => sourceBuffer,
        onError: (error) => {
          appendFailure = error;
        },
      });
      const sink = new MseAdapter({ pipe });

      let completed = false;
      let runFailure: unknown = null;
      result.playback.start(sink, 1, {
        onComplete: () => {
          completed = true;
        },
        onError: (error) => {
          runFailure = error;
        },
      });
      await waitFor(() => completed || runFailure !== null || appendFailure !== null);
      if (runFailure !== null) throw new Error(`main-thread conversion failed: ${describeFailure(runFailure)}`);
      if (appendFailure !== null) {
        throw new Error(`main-thread SourceBuffer append failed: ${describeFailure(appendFailure)}`);
      }

      // The conversion's completion callback fires as the last unit is handed
      // to the pipe, not when the pipe drains: mediabunny emits its trailing
      // fragment batch at once, so the pump still owes appends at that point.
      // Wait for the same quiescence the pipe's deferred endOfStream waits for
      // (queue empty, SourceBuffer not updating) before reading the buffer.
      await waitFor(() => pipe.pendingBytes === 0 && !buffer.updating);
      const bufferedEnd = realBufferedEnd(buffer);

      // End-of-stream the way the production main mode does: the pipe defers
      // it until the queue drains and the buffer quiesces, and refuses it on
      // a source that is no longer open.
      pipe.requestEndOfStream();

      expect(bufferedEnd).toBeGreaterThan(0);
    } finally {
      result.playback.dispose();
      video.remove();
      URL.revokeObjectURL(objectUrl);
    }
  }, 60_000);

  it('a held playhead plateaus the conversion at a small ahead target (stops before the end)', async () => {
    // The same real conversion as the initialization test: the progressive
    // fixture is refragmented into CMAF over the byte source and the load's
    // playback starts against the main-thread MseAppendPipe, so the producer
    // parks on the sink's real-SourceBuffer gates exactly as in production.
    // The byte source is latency-emulating: memory delivery runs on
    // microtasks and would outrun the real SourceBuffer's absorption, so the
    // reads are stretched to network round-trip spacing where a before-read
    // gate can actually bind, as it does against a real network source.
    const result = await inspectMediaLibrary(
      new DelayedByteSource(new MemoryByteSource(browserDecodableLongFixtureBytes()), READ_DELAY_MS),
      { capabilities: mainThreadCapabilities() },
    );
    if (result.status !== 'ready') {
      throw new Error(`load did not come back ready (${result.status}${'reason' in result ? `: ${result.reason}` : ''})`);
    }
    const durationSeconds = result.durationSeconds ?? BROWSER_DECODABLE_LONG_FIXTURE_DURATION_SECONDS;

    // The element opens the MediaSource (the production attach) and holds the
    // playhead: it is never played, so `currentTime` stays at the start
    // position for the whole run and the pipe's playhead provider reads 0.
    const video = document.createElement('video');
    video.playsInline = true;
    document.body.appendChild(video);
    const mediaSource = new MediaSource();
    const objectUrl = URL.createObjectURL(mediaSource);
    let sourceBuffer: null | SourceBuffer = null;
    let pipe: MseAppendPipe | null = null;
    try {
      video.src = objectUrl;
      await waitForSourceOpen(mediaSource);
      if (result.durationSeconds !== null) mediaSource.duration = result.durationSeconds;
      const buffer = mediaSource.addSourceBuffer(result.mime);
      sourceBuffer = buffer;

      let appendFailure: unknown = null;
      const created = new MseAppendPipe({
        // The small ahead target: the pipe parks the conversion's reads once
        // the real SourceBuffer holds this much ahead of the held playhead.
        aheadTargetSeconds: AHEAD_TARGET_SECONDS,
        backBufferSeconds: 30,
        getMediaSource: () => mediaSource,
        getPlayheadSeconds: () => video.currentTime,
        getSourceBuffer: () => sourceBuffer,
        onError: (error) => {
          appendFailure = error;
        },
      });
      pipe = created;
      const sink = new MseAdapter({ pipe: created });

      let completed = false;
      let runFailure: unknown = null;
      result.playback.start(sink, 1, {
        onComplete: () => {
          completed = true;
        },
        onError: (error) => {
          runFailure = error;
        },
      });

      // 1. The real buffer must first hold at least the small ahead target
      // ahead of the held playhead; before that point the gate cannot yet
      // have parked anything, so the plateau is only meaningful past it.
      await waitFor(() => realBufferedEnd(buffer) >= AHEAD_TARGET_SECONDS);
      // The playhead is genuinely held: the element never plays, so the pipe's
      // playhead provider reads the start position throughout the plateau.
      expect(video.currentTime).toBe(0);

      // 2. Give the conversion every chance to keep going: it either completes
      // (a producer that never parks) or its buffered end stops growing (a
      // producer parked at the ahead target). Whichever happens first defines
      // the plateau.
      let lastEnd = -1;
      let stableSince = Date.now();
      await waitFor(() => {
        const end = realBufferedEnd(buffer);
        if (end !== lastEnd) {
          lastEnd = end;
          stableSince = Date.now();
        }
        return completed || Date.now() - stableSince >= PLATEAU_STABLE_MS;
      });
      if (runFailure !== null) throw new Error(`main-thread conversion failed: ${describeFailure(runFailure)}`);
      if (appendFailure !== null) {
        throw new Error(`main-thread SourceBuffer append failed: ${describeFailure(appendFailure)}`);
      }
      const plateauEnd = realBufferedEnd(buffer);

      // 3. Plateau: with the playhead held, the conversion must stop before
      // the fixture's end once the buffer holds the ahead target: it must
      // neither convert the whole object nor report completion.
      expect(plateauEnd).toBeLessThan(durationSeconds - 1);
      expect(completed).toBe(false);

      // 4. Resume: advance the real element's playhead into the window the
      // buffer already covers. Held at the start, that window's covered-ahead is
      // what parked the producer; moving the playhead into the window shrinks
      // the covered-ahead below the target. In production the playhead change
      // arrives via `setPlayhead`, which kicks the pipe.
      const targetTime = plateauEnd - RESUME_PLAYHEAD_OFFSET_SECONDS;
      video.currentTime = targetTime;
      // An MSE seek settles asynchronously; the kick must read the moved
      // playhead, so hold until the element has actually taken the position.
      await waitUntil(() => video.currentTime > 0, RESUME_WAIT_MS);

      // 5. The resume trigger: production's `setPlayhead` kicks the pipe (and
      // an `updateend` does too), but a directly-constructed pipe does neither,
      // so the test fires the same kick the playhead change would. The pipe
      // re-checks the ahead condition against the moved playhead and releases
      // the parked producer; without this kick the assertion below stays red.
      pipe.kick();

      // 6. Prove the conversion keeps going past the plateau: give the producer
      // the bounded time the kick would give it, then assert it reaches the
      // fixture's end or its real buffered end clearly grows past the plateau.
      await waitUntil(
        () => completed || realBufferedEnd(buffer) > plateauEnd + RESUME_PROGRESS_SECONDS,
        RESUME_WAIT_MS,
      );
      expect(completed || realBufferedEnd(buffer) > plateauEnd + RESUME_PROGRESS_SECONDS).toBe(true);
    } finally {
      // A producer parked on the pipe's ahead gate must not outlive the test:
      // abort the pipe (teardown releases its waiters) before disposing the
      // load, the same order a real main-mode teardown takes.
      pipe?.abort();
      result.playback.dispose();
      video.remove();
      URL.revokeObjectURL(objectUrl);
    }
  }, 60_000);
});

describe.skipIf(!IN_BROWSER)('SiaVideoSource host reports main-thread buffered state (BUFFERED_STATE)', () => {
  it(
    'real main-mode SourceBuffer updates post a current-request BUFFERED_STATE (finite playhead, pendingBytes, nonempty copied windows); a later timeupdate reports the changed playhead',
    async () => {
      const mediaSourceCtor = (globalThis as { MediaSource?: typeof MediaSource }).MediaSource;
      if (!mediaSourceCtor || !mediaSourceCtor.isTypeSupported(BROWSER_DECODABLE_LONG_FIXTURE_MIME)) return;

      const worker = new HostFakeWorker();
      const host = new SiaVideoSource({
        createWorker: () => worker as unknown as Worker,
        logger: undefined,
      });
      const target = document.createElement('video');
      target.muted = true;
      target.playsInline = true;
      document.body.appendChild(target);
      host.attach(target);

      worker.reply({
        features: { workerMse: false },
        publicKey: new Uint8Array(32),
        requestId: worker.helloRequestId(),
        type: WorkerToMainMessageType.HELLO_OK,
        version: PROTOCOL_VERSION,
      });
      worker.reply({
        mode: 'main',
        requestId: worker.newestAttachRequestId(),
        type: WorkerToMainMessageType.ATTACH_OK,
      });
      host.src = 'k';
      await waitFor(() => worker.sent.some((m) => m.type === MainToWorkerMessageType.SOURCE));
      const source = worker.sent.find((m) => m.type === MainToWorkerMessageType.SOURCE);
      if (!source || !('requestId' in source)) throw new Error('SOURCE was not posted');

      // The fake worker stands in for the production worker's conversion
      // half: it runs a real mediabunny conversion of the long fixture through
      // the same load pipeline the coordinator drives, and posts the converted
      // fMP4 output as `CHUNK`s under the load's request id. The host absorbs
      // those bytes into its own real main-thread SourceBuffer, so every real
      // `updateend` is a real main-mode SourceBuffer update the host's own
      // reporting gluing must turn into a `BUFFERED_STATE` post.
      const abort = new AbortController();
      const byteSource = new MemoryByteSource(browserDecodableLongFixtureBytes());
      const pipeline = createLoadPipeline({ capabilities: mainThreadCapabilities() });
      const result = await pipeline.run({
        loadGeneration: 1,
        signal: abort.signal,
        source: byteSource,
      });
      if (result.status !== 'ready') {
        throw new Error(`long fixture load was not ready (status: ${result.status})`);
      }
      worker.reply({
        info: sourceInfoFor(
          {
            container: result.container,
            durationSeconds: result.durationSeconds,
            mime: result.mime,
            tracks: result.tracks,
          },
          'main',
        ),
        requestId: source.requestId,
        type: WorkerToMainMessageType.SOURCE_OK,
      });
      let conversionFailed = false;
      const sink: AppendSink = {
        abort: () => abort.abort(),
        append: (unit) => {
          worker.reply({
            bytes: unit.bytes,
            kind: unit.kind,
            requestId: source.requestId,
            type: WorkerToMainMessageType.CHUNK,
          });
        },
        evictBackBuffer: () => Promise.resolve(false),
        requestEndOfStream: () => undefined,
        resetParser: () => undefined,
        waitForBufferedAhead: () => Promise.resolve(),
        waitForCapacity: () => Promise.resolve(),
      };
      result.playback.start(sink, 1, {
        onComplete: () => {
          worker.reply({ requestId: source.requestId, type: WorkerToMainMessageType.ENDED });
        },
        onError: () => {
          conversionFailed = true;
        },
      });

      // A real main-mode SourceBuffer update (an absorbed append whose
      // `updateend` fired) must make the host post the current request's
      // `BUFFERED_STATE`: copied real buffered windows (nonempty), a finite
      // playhead, and a finite pending append payload.
      await waitFor(
        () =>
          worker.bufferedReports.some(
            (r) => r.requestId === source.requestId && r.buffered.length > 0,
          ),
      );
      const first = worker.bufferedReports.find(
        (r) => r.requestId === source.requestId && r.buffered.length > 0,
      )!;
      expect(first.requestId).toBe(source.requestId);
      expect(Number.isFinite(first.playhead)).toBe(true);
      expect(first.playhead).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(first.pendingBytes)).toBe(true);
      expect(first.pendingBytes).toBeGreaterThanOrEqual(0);
      expect(first.buffered.length).toBeGreaterThan(0);
      for (const window of first.buffered as BufferWindow[]) {
        expect(Number.isFinite(window.start)).toBe(true);
        expect(Number.isFinite(window.end)).toBe(true);
        expect(window.end).toBeGreaterThan(window.start);
      }
      expect(conversionFailed).toBe(false);
      expect(host.error).toBeNull();

      // Wait until the real buffered window covers the mid-file playhead the
      // test writes next, so the seek lands inside the host's window.
      await waitFor(
        () =>
          worker.bufferedReports.at(-1)?.buffered.some(
            (w) => (w as BufferWindow).end >= PLAYHEAD_SECONDS + 1,
          ) ?? false,
      );
      const before = worker.bufferedReports.length;
      target.currentTime = PLAYHEAD_SECONDS;
      target.dispatchEvent(new Event('timeupdate'));
      await waitFor(
        () =>
          worker.bufferedReports.slice(before).some(
            (r) => r.requestId === source.requestId && r.playhead === PLAYHEAD_SECONDS,
          ),
      );
      const after = worker.bufferedReports.slice(before).find(
        (r) => r.requestId === source.requestId && r.playhead === PLAYHEAD_SECONDS,
      )!;
      expect(after.requestId).toBe(source.requestId);
      expect(after.playhead).toBe(PLAYHEAD_SECONDS);

      result.playback.dispose();
      byteSource.cancel();
      host.destroy();
      target.remove();
    },
    60_000,
  );
});
