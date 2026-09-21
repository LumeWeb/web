/**
 * Protocol behavior spec for the `SessionCoordinator` (WorkerComposition),
 * driven with an injected fake `LoadPipeline` so no real media bytes or
 * mediabunny objects are needed. One load turns into `SOURCE_OK` (exactly five
 * info fields built from the ready result), streamed units reach the posting
 * sink or an injected MSE sink, unsupported/cancelled verdicts map to one
 * error or silence, and source replacement / detach / destroy tear the
 * previous load down (abort signal first, then its resources).
 */
import { describe, expect, it } from 'vitest';
import { encryptToWorker } from '../app-key-handshake.ts';
import type { PlaybackCapabilities } from '../capabilities/browser-capabilities.ts';
import type { MediaLoadResult, MediaPlayback } from '../media/library-load.ts';
import {
  type MainToWorkerMessage,
  MainToWorkerMessageType,
  PROTOCOL_VERSION,
  type WorkerConfig,
  workerErrorCode,
  type WorkerToMainMessage,
  WorkerToMainMessageType,
} from '../protocol.ts';
import type { LoadPipeline, LoadRequest } from '../session/load-pipeline.ts';
import {
  createSessionCoordinator,
  createSessionHandshake,
  type SessionCoordinator,
  type SessionCoordinatorDeps,
  type SinkFactoryContext,
} from '../session/session-coordinator.ts';
import type { AppendSink, AppendUnit } from '../sink/append-sink.ts';
import type { ByteRange, ByteSource, ReadOptions } from '../transport/byte-source.ts';

interface Driver {
  canceled: Map<string, number>;
  cancelSource: (name: string) => void;
  coordinator: SessionCoordinator;
  message<T extends WorkerToMainMessage['type']>(type: T): Extract<WorkerToMainMessage, { type: T }>[];
  messages: WorkerToMainMessage[];
  pipeline: FakeLoadPipeline;
  say(message: MainToWorkerMessage): Promise<void>;
}

/** ByteSource that never serves bytes; it only records cancellation. */
class CancellationSpy implements ByteSource {
  readonly size = 0;
  readonly #counts: Map<string, number>;
  readonly #name: string;

  constructor(name: string, counts: Map<string, number>) {
    this.#name = name;
    this.#counts = counts;
  }

  cancel(_reason?: unknown): void {
    this.#counts.set(this.#name, (this.#counts.get(this.#name) ?? 0) + 1);
  }

  read(_range: ByteRange, _options: ReadOptions): ReadableStream<Uint8Array> {
    return new ReadableStream();
  }
}

/** Controls what the coordinator's `LoadPipeline.run` returns per call. */
class FakeLoadPipeline implements LoadPipeline {
  readonly calls: LoadRequest[] = [];
  results: MediaLoadResult[] = [];
  readonly #steps = new Map<number, (result: MediaLoadResult) => void>();

  /** Resolves a specific held `run` (by call index) with a verdict. */
  resolveCall(index: number, result: MediaLoadResult): void {
    const step = this.#steps.get(index);
    if (step) {
      this.#steps.delete(index);
      this.#releaseNonReadySource(index, result);
      step(result);
    }
  }

  async run(request: LoadRequest): Promise<MediaLoadResult> {
    const index = this.calls.length;
    this.calls.push(request);
    const queued = this.results.shift();
    if (queued !== undefined) {
      this.#releaseNonReadySource(index, queued);
      return queued;
    }
    return new Promise<MediaLoadResult>((resolve) => {
      this.#steps.set(index, resolve);
    });
  }

  /**
   * Mirrors inspectMediaLibrary: a non-ready verdict disposes its Input,
   * whose CustomSource disposal cancels the byte source — so the coordinator
   * never calls `source.cancel()` a second time for the same load.
   */
  #releaseNonReadySource(index: number, result: MediaLoadResult): void {
    if (result.status === 'ready') return;
    const request = this.calls[index];
    if (request) request.source.cancel();
  }
}

/**
 * Playback fake conforming to the final callbacks-object contract. Dispose is
 * latched like the production playback, so repeated teardown releases it once.
 */
class FakePlayback implements MediaPlayback {
  disposed = 0;
  generation: null | number = null;
  sink: AppendSink | null = null;
  started = 0;
  #disposed = false;
  #onComplete: (() => void) | null = null;
  // Mirrors the production Input/CustomSource disposal path: an accepted
  // load's `dispose()` cancels its byte source. Wired by tests that abandon a
  // ready session so source release stays observable at the coordinator seam.
  readonly #onDispose: (() => void) | undefined;
  #onError: ((error: unknown) => void) | null = null;

  constructor(onDispose?: () => void) {
    this.#onDispose = onDispose;
  }

  complete(): void {
    this.#onComplete?.();
  }

  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    this.disposed += 1;
    this.#onDispose?.();
  }

  emit(kind: 'init' | 'media'): void {
    this.sink?.append({ bytes: new Uint8Array([1, 2, 3]), kind });
  }

  fail(error: unknown): void {
    this.#onError?.(error);
  }

  start(
    sink: AppendSink,
    loadGeneration: number,
    callbacks: { readonly onComplete: () => void; readonly onError: (error: unknown) => void },
  ): void {
    this.started += 1;
    this.generation = loadGeneration;
    this.sink = sink;
    this.#onComplete = callbacks.onComplete;
    this.#onError = callbacks.onError;
  }
}

function makeDriver(options: {
  capabilities?: PlaybackCapabilities;
  createSource?: (src: string) => Promise<ByteSource>;
  onPlayhead?: (timeSeconds: number) => void;
  pipeline?: FakeLoadPipeline;
  sinkFactory?: (context: SinkFactoryContext) => AppendSink;
  supportsWorkerMse?: () => boolean;
} = {}): Driver {
  const messages: WorkerToMainMessage[] = [];
  const canceled = new Map<string, number>();
  const sources = new Map<string, CancellationSpy>();
  const pipeline = options.pipeline ?? new FakeLoadPipeline();
  const createSource =
    options.createSource ??
    ((src: string) => {
      const spy = new CancellationSpy(src, canceled);
      sources.set(src, spy);
      return Promise.resolve(spy);
    });

  const deps: SessionCoordinatorDeps = {
    capabilities: options.capabilities ?? permissiveCapabilities(),
    createSource,
    loadPipeline: pipeline,
    onPlayhead: options.onPlayhead,
    post: (message) => messages.push(message),
    sinkFactory: options.sinkFactory,
    supportsWorkerMse: options.supportsWorkerMse ?? (() => false),
  };
  const coordinator = createSessionCoordinator(deps);
  return {
    canceled,
    cancelSource: (name: string) => sources.get(name)?.cancel(),
    coordinator,
    message: <T extends WorkerToMainMessage['type']>(type: T) =>
      messages.filter((m): m is Extract<WorkerToMainMessage, { type: T }> => m.type === type),
    messages,
    pipeline,
    say: (message) => coordinator.handleMessage(message),
  };
}

function permissiveCapabilities(): PlaybackCapabilities {
  return {
    canConstructWorkerMse: () => false,
    mayDecode: () => ({ decodable: true } as never),
    mseSupported: () => true,
    webCodecsAvailable: () => false,
    workerHandleAvailable: () => false,
  };
}

/** A ready verdict built from the library's track facts, without any bytes. */
function readyLoad(playback: MediaPlayback = new FakePlayback()): MediaLoadResult {
  return {
    container: 'mp4',
    durationSeconds: 6,
    mime: 'video/mp4; codecs="avc1.640032,mp4a.40.2"',
    playback,
    status: 'ready',
    tracks: [
      { codec: 'avc1.640032', kind: 'video' },
      { codec: 'mp4a.40.2', kind: 'audio' },
    ],
  };
}

async function settle(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 15));
}

async function waitForMessage(driver: Driver, type: WorkerToMainMessage['type']): Promise<void> {
  const deadline = Date.now() + 15_000;
  while (driver.message(type).length === 0) {
    if (Date.now() > deadline) throw new Error(`timed out waiting for ${type}`);
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

describe('SessionCoordinator (WorkerComposition adapter)', () => {
  it('answers HELLO and ATTACH, then SOURCE_OK carries exactly the ready-result facts', async () => {
    const driver = makeDriver();
    driver.pipeline.results.push(readyLoad());
    await driver.say({ requestId: 1, type: MainToWorkerMessageType.HELLO });
    await driver.say({ requestId: 2, type: MainToWorkerMessageType.ATTACH });

    expect(driver.message(WorkerToMainMessageType.HELLO_OK)[0]).toMatchObject({ features: { workerMse: false }, version: PROTOCOL_VERSION });
    expect(driver.message(WorkerToMainMessageType.ATTACH_OK)[0]).toMatchObject({ mode: 'main', requestId: 2 });

    await driver.say({ preload: 'auto', requestId: 3, src: 'playable', type: MainToWorkerMessageType.SOURCE });
    await waitForMessage(driver, WorkerToMainMessageType.SOURCE_OK);

    const ok = driver.message(WorkerToMainMessageType.SOURCE_OK);
    expect(ok).toHaveLength(1);
    expect(ok[0].requestId).toBe(3);
    expect(ok[0].info).toEqual({
      container: 'mp4',
      durationSeconds: 6,
      mime: 'video/mp4; codecs="avc1.640032,mp4a.40.2"',
      mode: 'main',
      tracks: [
        { codec: 'avc1.640032', kind: 'video' },
        { codec: 'mp4a.40.2', kind: 'audio' },
      ],
    });
    // The report is reduced to the five allowed fields: no index, no mode.
    expect(Object.keys(ok[0].info).sort()).toEqual(['container', 'durationSeconds', 'mime', 'mode', 'tracks']);
  });

  it('streams a fake playback into CHUNK (main mode) and posts ENDED once on completion', async () => {
    const driver = makeDriver();
    const playback = new FakePlayback();
    driver.pipeline.results.push(readyLoad(playback));
    await driver.say({ preload: 'auto', requestId: 4, src: 'playable', type: MainToWorkerMessageType.SOURCE });
    await waitForMessage(driver, WorkerToMainMessageType.SOURCE_OK);

    expect(playback.started).toBe(1);
    playback.emit('init');
    expect(driver.message(WorkerToMainMessageType.CHUNK)).toHaveLength(1);
    expect(driver.message(WorkerToMainMessageType.CHUNK)[0]).toMatchObject({ kind: 'init', requestId: 4 });

    playback.complete();
    playback.complete();
    expect(driver.message(WorkerToMainMessageType.ENDED)).toHaveLength(1);
    expect(driver.message(WorkerToMainMessageType.ENDED)[0].requestId).toBe(4);
  });

  it('passes the load generation and one abort signal into the pipeline, aborting on teardown', async () => {
    const driver = makeDriver();
    driver.pipeline.results.push(readyLoad());
    await driver.say({ preload: 'auto', requestId: 5, src: 'playable', type: MainToWorkerMessageType.SOURCE });
    await waitForMessage(driver, WorkerToMainMessageType.SOURCE_OK);

    expect(driver.pipeline.calls).toHaveLength(1);
    const call = driver.pipeline.calls[0];
    expect(call.loadGeneration).toBe(1);
    expect(call.signal instanceof AbortSignal).toBe(true);
    expect(call.signal.aborted).toBe(false);

    await driver.say({ type: MainToWorkerMessageType.DETACH });
    expect(call.signal.aborted).toBe(true);
  });

  it('maps an unsupported verdict to one unsupported ERROR carrying the stable reason', async () => {
    const driver = makeDriver();
    const result: MediaLoadResult = { reason: 'video-track-missing', status: 'unsupported' };
    driver.pipeline.results.push(result);
    await driver.say({ preload: 'auto', requestId: 6, src: 'unknown', type: MainToWorkerMessageType.SOURCE });
    await settle();

    expect(driver.message(WorkerToMainMessageType.SOURCE_OK)).toEqual([]);
    const errors = driver.message(WorkerToMainMessageType.ERROR);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({ context: 'video-track-missing', kind: workerErrorCode.unsupported, requestId: 6 });
    expect(driver.message(WorkerToMainMessageType.CHUNK)).toEqual([]);
    expect(driver.message(WorkerToMainMessageType.ENDED)).toEqual([]);
  });

  it('appends the raw failure detail to the unsupported error context', async () => {
    const driver = makeDriver();
    const result: MediaLoadResult = { detail: 'no moov box', reason: 'format-unreadable', status: 'unsupported' };
    driver.pipeline.results.push(result);
    await driver.say({ preload: 'auto', requestId: 7, src: 'broken', type: MainToWorkerMessageType.SOURCE });
    await settle();

    const errors = driver.message(WorkerToMainMessageType.ERROR);
    expect(errors).toHaveLength(1);
    expect(errors[0].context).toBe('format-unreadable: no moov box');
  });

  it('maps a cancelled verdict to silence and releases the source', async () => {
    const driver = makeDriver();
    driver.pipeline.results.push({ status: 'cancelled' });
    await driver.say({ preload: 'auto', requestId: 8, src: 'dropped', type: MainToWorkerMessageType.SOURCE });
    await settle();

    expect(driver.message(WorkerToMainMessageType.SOURCE_OK)).toEqual([]);
    expect(driver.message(WorkerToMainMessageType.ERROR)).toEqual([]);
    expect(driver.message(WorkerToMainMessageType.CHUNK)).toEqual([]);
    expect(driver.canceled.get('dropped') ?? 0).toBeGreaterThan(0);
  });

  it('defers streaming under preload none and starts on a later PLAY', async () => {
    const driver = makeDriver();
    const playback = new FakePlayback();
    driver.pipeline.results.push(readyLoad(playback));
    await driver.say({ preload: 'none', requestId: 9, src: 'playable', type: MainToWorkerMessageType.SOURCE });
    await waitForMessage(driver, WorkerToMainMessageType.SOURCE_OK);

    expect(driver.message(WorkerToMainMessageType.CHUNK)).toEqual([]);
    expect(playback.started).toBe(0);

    await driver.say({ requestId: 10, type: MainToWorkerMessageType.PLAY });
    expect(playback.started).toBe(1);
  });

  it('parks a SEEK while the load is in flight and applies it when the load resolves', async () => {
    const driver = makeDriver();
    const playback = new FakePlayback();
    // The pipeline holds the SOURCE's verdict so a SEEK arrives mid-load.
    const load = driver.say({ preload: 'auto', requestId: 11, src: 'playable', type: MainToWorkerMessageType.SOURCE });
    await settle();
    await driver.say({ requestId: 12, time: 12.5, type: MainToWorkerMessageType.SEEK });

    driver.pipeline.resolveCall(0, readyLoad(playback));
    await load;
    await waitForMessage(driver, WorkerToMainMessageType.SOURCE_OK);

    expect(playback.started).toBe(1);
  });

  it('replacing the source abandons the previous load and streams only the new one', async () => {
    const driver = makeDriver();
    const first = new FakePlayback(() => driver.cancelSource('first'));
    driver.pipeline.results.push(readyLoad(first));
    await driver.say({ preload: 'auto', requestId: 13, src: 'first', type: MainToWorkerMessageType.SOURCE });
    await waitForMessage(driver, WorkerToMainMessageType.SOURCE_OK);
    expect(first.started).toBe(1);
    const firstSignal = driver.pipeline.calls[0].signal;

    const second = new FakePlayback();
    driver.pipeline.results.push(readyLoad(second));
    await driver.say({ preload: 'auto', requestId: 14, src: 'second', type: MainToWorkerMessageType.SOURCE });
    await waitForMessage(driver, WorkerToMainMessageType.SOURCE_OK);

    expect(driver.message(WorkerToMainMessageType.SOURCE_OK)).toHaveLength(2);
    expect(driver.message(WorkerToMainMessageType.SOURCE_OK)[1].requestId).toBe(14);
    expect(first.disposed).toBe(1);
    expect(firstSignal.aborted).toBe(true);
    expect(driver.canceled.get('first') ?? 0).toBeGreaterThan(0);
    expect(second.started).toBe(1);

    second.complete();
    expect(driver.message(WorkerToMainMessageType.ENDED)).toHaveLength(1);
    expect(driver.message(WorkerToMainMessageType.ENDED)[0].requestId).toBe(14);
  });

  it('a superseded load completion disposes its own resources and posts nothing', async () => {
    const driver = makeDriver();
    const stale = new FakePlayback(() => driver.cancelSource('stale'));
    // Both loads resolve through held runs so their order is explicit: the
    // fresh load (call 1) becomes the session, the stale load (call 0) drops.
    const staleLoad = driver.say({ preload: 'auto', requestId: 15, src: 'stale', type: MainToWorkerMessageType.SOURCE });
    await settle();
    const freshLoad = driver.say({ preload: 'auto', requestId: 16, src: 'fresh', type: MainToWorkerMessageType.SOURCE });
    await settle();
    expect(driver.pipeline.calls).toHaveLength(2);

    const staleSignal = driver.pipeline.calls[0].signal;
    driver.pipeline.resolveCall(1, readyLoad());
    await freshLoad;
    await waitForMessage(driver, WorkerToMainMessageType.SOURCE_OK);

    driver.pipeline.resolveCall(0, readyLoad(stale));
    await staleLoad;

    expect(driver.message(WorkerToMainMessageType.SOURCE_OK)).toHaveLength(1);
    expect(stale.started).toBe(0);
    expect(stale.disposed).toBe(1);
    expect(staleSignal.aborted).toBe(true);
    expect(driver.canceled.get('stale') ?? 0).toBeGreaterThan(0);
  });

  it('a stale source creation cancels its own source and posts nothing', async () => {
    let resolveSource: (source: ByteSource) => void = () => undefined;
    const driver = makeDriver({
      createSource: () => new Promise<ByteSource>((resolve) => {
        resolveSource = resolve;
      }),
    });
    const pending = driver.say({ preload: 'auto', requestId: 17, src: 'slow', type: MainToWorkerMessageType.SOURCE });

    driver.coordinator.destroy();
    resolveSource(new CancellationSpy('slow', driver.canceled));
    await pending;

    expect(driver.messages).toEqual([]);
    expect(driver.canceled.get('slow') ?? 0).toBeGreaterThan(0);
  });

  it('DETACH abandons the active load and stops streaming', async () => {
    const driver = makeDriver();
    const playback = new FakePlayback(() => driver.cancelSource('dettach'));
    driver.pipeline.results.push(readyLoad(playback));
    await driver.say({ preload: 'auto', requestId: 18, src: 'dettach', type: MainToWorkerMessageType.SOURCE });
    await waitForMessage(driver, WorkerToMainMessageType.SOURCE_OK);

    await driver.say({ type: MainToWorkerMessageType.DETACH });

    expect(playback.disposed).toBe(1);
    expect(playback.started).toBe(1);
    expect(driver.pipeline.calls[0].signal.aborted).toBe(true);
    expect(driver.canceled.get('dettach') ?? 0).toBeGreaterThan(0);
  });

  it('DETACH disposes a ready-but-never-played conversion and releases its source', async () => {
    const driver = makeDriver();
    const playback = new FakePlayback(() => driver.cancelSource('idle'));
    driver.pipeline.results.push(readyLoad(playback));
    await driver.say({ preload: 'none', requestId: 18, src: 'idle', type: MainToWorkerMessageType.SOURCE });
    await waitForMessage(driver, WorkerToMainMessageType.SOURCE_OK);

    // The conversion was prepared but never started; replacement teardown must
    // still cancel it (dispose) and release the transport source it owns.
    expect(playback.started).toBe(0);
    await driver.say({ type: MainToWorkerMessageType.DETACH });

    expect(playback.disposed).toBe(1);
    expect(driver.pipeline.calls[0].signal.aborted).toBe(true);
    expect(driver.canceled.get('idle') ?? 0).toBeGreaterThan(0);
  });

  it('DESTROY abandons the active load permanently and ignores later messages', async () => {
    const driver = makeDriver();
    const playback = new FakePlayback(() => driver.cancelSource('doom'));
    driver.pipeline.results.push(readyLoad(playback));
    await driver.say({ preload: 'auto', requestId: 19, src: 'doom', type: MainToWorkerMessageType.SOURCE });
    await waitForMessage(driver, WorkerToMainMessageType.SOURCE_OK);

    driver.coordinator.destroy();

    expect(playback.disposed).toBe(1);
    expect(driver.canceled.get('doom') ?? 0).toBeGreaterThan(0);

    const before = driver.messages.length;
    driver.pipeline.results.push(readyLoad());
    await driver.say({ preload: 'auto', requestId: 20, src: 'ignored', type: MainToWorkerMessageType.SOURCE });
    expect(driver.messages.length).toBe(before);
    expect(driver.pipeline.calls).toHaveLength(1);
  });

  it('forwards PLAYHEAD to the onPlayhead reflector and sink eviction', async () => {
    const reflected: number[] = [];
    const evictions: number[] = [];
    const driver = makeDriver({
      onPlayhead: (time) => reflected.push(time),
      sinkFactory: () => ({
        abort: () => undefined,
        append: (_unit: AppendUnit) => undefined,
        evictBackBuffer: (timeSeconds) => {
          evictions.push(timeSeconds);
          return Promise.resolve(true);
        },
        requestEndOfStream: () => undefined,
        resetParser: () => undefined,
      }),
      supportsWorkerMse: () => true,
    });
    driver.pipeline.results.push(readyLoad());
    await driver.say({ preload: 'auto', requestId: 21, src: 'playable', type: MainToWorkerMessageType.SOURCE });
    await waitForMessage(driver, WorkerToMainMessageType.SOURCE_OK);

    await driver.say({ requestId: 21, time: 4.25, type: MainToWorkerMessageType.PLAYHEAD });
    await settle();

    expect(reflected).toContain(4.25);
    expect(evictions).toContain(4.25);
  });

  it('worker mode feeds the injected sink with the load context and never posts CHUNKs', async () => {
    const contexts: SinkFactoryContext[] = [];
    const appended: AppendUnit[] = [];
    const driver = makeDriver({
      sinkFactory: (context) => {
        contexts.push(context);
        return {
          abort: () => undefined,
          append: (unit) => appended.push(unit),
          evictBackBuffer: () => Promise.resolve(false),
          requestEndOfStream: () => undefined,
          resetParser: () => undefined,
        } satisfies AppendSink;
      },
      supportsWorkerMse: () => true,
    });
    const playback = new FakePlayback();
    driver.pipeline.results.push(readyLoad(playback));
    await driver.say({ preload: 'auto', requestId: 22, src: 'playable', type: MainToWorkerMessageType.SOURCE });
    await waitForMessage(driver, WorkerToMainMessageType.SOURCE_OK);

    expect(contexts).toHaveLength(1);
    expect(contexts[0]).toEqual({
      durationSeconds: 6,
      mime: 'video/mp4; codecs="avc1.640032,mp4a.40.2"',
      requestId: 22,
    });
    expect(driver.message(WorkerToMainMessageType.CHUNK)).toEqual([]);
    expect(playback.started).toBe(1);

    playback.emit('init');
    expect(appended).toHaveLength(1);
    expect(appended[0]).toMatchObject({ kind: 'init' });
  });

  it('reports one playback failure as a decode error scoped to the load', async () => {
    const driver = makeDriver();
    const playback = new FakePlayback();
    driver.pipeline.results.push(readyLoad(playback));
    await driver.say({ preload: 'auto', requestId: 23, src: 'playable', type: MainToWorkerMessageType.SOURCE });
    await waitForMessage(driver, WorkerToMainMessageType.SOURCE_OK);

    playback.fail(new Error('engine failed'));
    playback.fail(new Error('again'));

    const errors = driver.message(WorkerToMainMessageType.ERROR);
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({ kind: workerErrorCode.decode, requestId: 23 });
  });

  it('accepts a validated APP_KEY envelope through the real handshake', async () => {
    const driver = makeDriver();
    await driver.say({ requestId: 1, type: MainToWorkerMessageType.HELLO });
    const hello = driver.message(WorkerToMainMessageType.HELLO_OK)[0];

    const seed = new Uint8Array(32).fill(7);
    const envelope = await encryptToWorker(hello.publicKey, seed);
    await driver.say({ envelope, requestId: 2, type: MainToWorkerMessageType.APP_KEY });
    await settle();

    expect(driver.message(WorkerToMainMessageType.ERROR)).toEqual([]);
  });

  it('surfaces a rejected APP_KEY envelope as a network ERROR', async () => {
    const driver = makeDriver();
    await driver.say({ requestId: 1, type: MainToWorkerMessageType.HELLO });

    const wrongKey = new Uint8Array(32).fill(3);
    const envelope = await encryptToWorker(wrongKey, new Uint8Array(32).fill(1));
    await driver.say({ envelope, requestId: 2, type: MainToWorkerMessageType.APP_KEY });
    await settle();

    const errors = driver.message(WorkerToMainMessageType.ERROR);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].kind).toBe(workerErrorCode.network);
  });
});

// ---- Fix 1: HELLO seed-presence flags scrub stale credentials --------------

describe('createSessionHandshake HELLO seed-presence flags', () => {
  const CONFIG: WorkerConfig = {
    app: {
      appId: 'app',
      callbackUrl: '',
      description: '',
      logoUrl: '',
      name: 'app',
      serviceUrl: 'https://app.example',
    },
    indexerUrl: 'https://indexer.example',
  };

  // Every test reuses one handshake so hello() mints the SAME memoized worker
  // key pair — a fresh crypto-random pair per call would mint envelopes the
  // handshake's own acceptAppKey could not decrypt.
  it('scrubs a sharing seed the host declares absent while re-attaching an identical config', async () => {
    const handshake = createSessionHandshake();
    const { publicKey } = handshake.hello(1, CONFIG);

    const appSeed = new Uint8Array(32).fill(81);
    const sharingSeed = new Uint8Array(32).fill(82);
    await handshake.acceptAppKey(await encryptToWorker(publicKey, appSeed));
    await handshake.acceptAppKey(await encryptToWorker(publicKey, sharingSeed, 'sharing'));
    expect(handshake.seed).toEqual(appSeed);
    expect(handshake.sharingSeed).toEqual(sharingSeed);

    // The host removed getSharingKeySeed but re-attached the SAME config:
    // HELLO declares the sharing slot absent (workerConfigsEqual stays true),
    // so the sharing seed — previously "stuck" while the config never changed
    // — is scrubbed. The app slot, declared present, is untouched.
    handshake.hello(2, CONFIG, { app: true, sharing: false });
    expect(handshake.seed).toEqual(appSeed);
    expect(handshake.sharingSeed).toBeNull();
  });

  it('scrubs a declared-absent app seed independently of the sharing slot', async () => {
    const handshake = createSessionHandshake();
    const { publicKey } = handshake.hello(1, CONFIG, { app: true, sharing: true });

    const appSeed = new Uint8Array(32).fill(91);
    const sharingSeed = new Uint8Array(32).fill(92);
    await handshake.acceptAppKey(await encryptToWorker(publicKey, appSeed));
    await handshake.acceptAppKey(await encryptToWorker(publicKey, sharingSeed, 'sharing'));

    handshake.hello(2, CONFIG, { app: false, sharing: true });
    expect(handshake.seed).toBeNull();
    expect(handshake.sharingSeed).toEqual(sharingSeed);
  });

  it('keeps a declared-present seed on re-Hello (sync-back never scrubs)', async () => {
    const handshake = createSessionHandshake();
    const { publicKey } = handshake.hello(1, CONFIG, { app: true, sharing: true });

    const sharingSeed = new Uint8Array(32).fill(0x63);
    await handshake.acceptAppKey(await encryptToWorker(publicKey, sharingSeed, 'sharing'));
    expect(handshake.sharingSeed).toEqual(sharingSeed);

    // The host re-declares the sharing slot present on the same config: the
    // held seed survives (no "envelope not yet arrived" ambiguity).
    handshake.hello(2, CONFIG, { app: true, sharing: true });
    expect(handshake.sharingSeed).toEqual(sharingSeed);
  });

  it('keeps both seeds when HELLO carries no presence flags (old-protocol backward compat)', async () => {
    const handshake = createSessionHandshake();
    const { publicKey } = handshake.hello(1, CONFIG);

    const appSeed = new Uint8Array(32).fill(0x71);
    const sharingSeed = new Uint8Array(32).fill(0x72);
    await handshake.acceptAppKey(await encryptToWorker(publicKey, appSeed));
    await handshake.acceptAppKey(await encryptToWorker(publicKey, sharingSeed, 'sharing'));

    // An old host re-attaches with no appSeed/sharingSeed fields: no claim is
    // made, so nothing is scrubbed beyond the (unchanged) config rule.
    handshake.hello(2, CONFIG);
    expect(handshake.seed).toEqual(appSeed);
    expect(handshake.sharingSeed).toEqual(sharingSeed);
  });

  it('routes HELLO presence flags through the coordinator into the handshake', async () => {
    const driver = makeDriver();
    await driver.say({
      appSeed: true,
      config: CONFIG,
      requestId: 1,
      sharingSeed: false,
      type: MainToWorkerMessageType.HELLO,
    });
    await settle();

    // The flags are accepted wire fields on the default handshake path and the
    // session still negotiates normally (HELLO_OK is posted, no ERROR).
    expect(driver.message(WorkerToMainMessageType.ERROR)).toEqual([]);
    expect(driver.message(WorkerToMainMessageType.HELLO_OK)[0]).toMatchObject({ requestId: 1 });
  });
});
