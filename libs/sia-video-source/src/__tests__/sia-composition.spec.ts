/**
 * Contract for the production composition-root binding: the seam that wires
 * the `SessionCoordinator` to the real Sia transport and worker-mode MSE,
 * without rewriting `RangedReader`/`ReadBudget`/`LruChunkCache` or the
 * worker's `MseAppendPipe` internals.
 *
 * The three exported seams under test:
 *
 * - `createSiaByteSourceFactory(sdk, opts)` — a `ByteSourceFactory` that
 *   resolves a SOURCE `src` locator — a pinned object key or a `sia://`
 *   share URL — into a `SiaByteSource` sharing one budget/cache across loads.
 * - `createWorkerMseSinkFactory(deps)` — per-load `AppendSink` that adapts
 *   the worker MediaSource through `MseAdapter`/`MseAppendPipe`.
 * - `createSiaWorkerComposition(deps)` — the composition-root binding that
 *   injects both into `createSessionCoordinator` and stays protocol-compatible
 *   with the existing worker (`ATTACH_OK.mode`, `SOURCE_OK.info`,
 *   `HELLO_OK.features.workerMse`, CHUNK posting when no MSE is supplied).
 *
 * Scope: composition tests inject a fake ready `LoadPipeline` so no real
 * inspection runs. The real Sia transport factory is still exercised (locator
 * resolution, SDK wiring, shared window cache); the fake transport only slices
 * bytes and asserts nothing about media validity.
 */

import { describe, expect, it, vi } from 'vitest';
import type { AppMetadata } from '@siafoundation/sia-storage';
import { encryptToWorker } from '../app-key-handshake.ts';
import {
  MainToWorkerMessageType,
  type WorkerConfig,
  type WorkerToMainMessage,
  WorkerToMainMessageType,
} from '../protocol.ts';
import type { SiaObjectLike } from '../ranged-reader.ts';
import { createSiaWorkerComposition } from '../session/sia-composition.ts';
import {
  defaultSupportsWorkerMse,
  type SessionCoordinator,
} from '../session/session-coordinator.ts';
import { createWorkerMseRoot } from '../session/worker-mse-root.ts';
import { createWorkerMseSinkFactory } from '../sink/mse-adapter.ts';
import type { ByteSource } from '../transport/byte-source.ts';
import type { SiaByteSourceSdk } from '../transport/sia-byte-source.ts';
import { createSiaByteSourceFactory } from '../transport/sia-byte-source.ts';
import {
  concatBytes,
  containsInOrder,
  FakeLoadPipeline,
  FakeMediaPlayback,
  fakeSiaSdk,
  flush,
  permissiveCapabilities,
  readyLoadResult,
  shareSrc,
} from './fixtures/fmp4-fixture.ts';

// ---- MSE harness (mirrors append-sink.spec.ts) -------------------------------

class FakeSourceBuffer extends EventTarget {
  abortCalls = 0;
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
    queueMicrotask(() => {
      this.updating = false;
      this.appended.push(bytes);
      this.eventLog.push(`append:${bytes[0]}`);
      this.dispatchEvent(new Event('updateend'));
    });
  }
}

class FakeMediaSource extends EventTarget {
  endOfStreamCalls = 0;
  handle = {} as MediaSourceHandle;
  readyState: unknown = 'open';
  sourceBuffers: FakeSourceBuffer[] = [];
  addSourceBuffer(_mime: string): FakeSourceBuffer {
    const sourceBuffer = new FakeSourceBuffer();
    this.sourceBuffers.push(sourceBuffer);
    return sourceBuffer;
  }
  endOfStream(): void {
    this.endOfStreamCalls += 1;
    this.readyState = 'ended';
  }
  removeSourceBuffer(sourceBuffer: FakeSourceBuffer): void {
    const index = this.sourceBuffers.indexOf(sourceBuffer);
    if (index >= 0) this.sourceBuffers.splice(index, 1);
  }
}

/** Minimal HELLO `WorkerConfig` connection identity for preference tests. */
function appMetadata(): AppMetadata {
  return { appId: 'app', callbackUrl: '', description: '', logoUrl: '', name: 'app', serviceUrl: 'https://app.example' };
}

/** SDK whose `object()` rejects (network failure) while `download` slices payload. */
function rejectingObjectSdk(payload: Uint8Array): SiaByteSourceSdk {
  return {
    download: (_object: SiaObjectLike, dl?: { length?: number; offset?: number }) => {
      const start = dl?.offset ?? 0;
      const end = Math.min(start + (dl?.length ?? payload.length - start), payload.length);
      return new ReadableStream<Uint8Array>({
        start: (controller) => {
          const size = Math.max(0, end - start);
          if (size > 0) controller.enqueue(payload.slice(start, end));
          controller.close();
        },
      });
    },
    object: () => Promise.reject(new Error('boom')),
  };
}

// ---- tests -------------------------------------------------------------------

describe('createSiaByteSourceFactory (Sia transport seam)', () => {
  it('resolves a plain object key into a SiaByteSource serving exact ranges', async () => {
    const payload = new Uint8Array(8192).map((_, i) => i % 251);
    const { objectKeys, sdk } = fakeSiaSdk(payload);
    const factory = createSiaByteSourceFactory(sdk);

    const source = await factory('pin-key');
    expect(objectKeys).toEqual(['pin-key']);

    const chunks: Uint8Array[] = [];
    for await (const chunk of source.read({ length: 1024, offset: 100 }, { loadGeneration: 1 })) {
      chunks.push(chunk);
    }
    const delivered = concatBytes(chunks);
    expect(delivered.byteLength).toBe(1024);
    expect(delivered).toEqual(payload.slice(100, 1124));
  });

  it('resolves a sia:// share URL through sdk.objectFromShareUrl(fetchForm)', async () => {
    const payload = new Uint8Array(4096).fill(7);
    const { objectKeys, sdk, shareForms } = fakeSiaSdk(payload, { shared: true });
    const factory = createSiaByteSourceFactory(sdk);

    const source = await factory(shareSrc());
    // A share src is NOT an object key; resolution goes through
    // objectFromShareUrl with the sia://-normalized fetchForm (never the
    // https original).
    expect(objectKeys).toEqual([]);
    expect(shareForms).toEqual([shareSrc().replace('https://', 'sia://')]);

    const chunks: Uint8Array[] = [];
    for await (const chunk of source.read({ length: 512, offset: 0 }, { loadGeneration: 1 })) {
      chunks.push(chunk);
    }
    expect(concatBytes(chunks).byteLength).toBe(512);
  });

  it('propagates a rejected object resolution as a rejected factory promise', async () => {
    const payload = new Uint8Array(1024);
    const factory = createSiaByteSourceFactory(rejectingObjectSdk(payload));

    await expect(factory('broken-key')).rejects.toThrow('boom');
  });

  it('shares one exact-window cache across the sources it creates', async () => {
    const payload = new Uint8Array(2048).map((_, i) => i % 251);
    const { downloads, sdk } = fakeSiaSdk(payload);
    const factory = createSiaByteSourceFactory(sdk);

    const first = await factory('a');
    const second = await factory('b');
    // Same range read through two sources; the shared cache replays the second
    // delivery, so only ONE SDK download actually opens for the window.
    const drain = async (source: ByteSource): Promise<number> => {
      const chunks: Uint8Array[] = [];
      for await (const chunk of source.read({ length: 512, offset: 0 }, { loadGeneration: 1 })) {
        chunks.push(chunk);
      }
      return concatBytes(chunks).byteLength;
    };
    await drain(first);
    const secondLength = await drain(second);
    expect(secondLength).toBe(512);
    // The second read re-served bytes from the shared cache, not the SDK.
    expect(downloads.filter((offset) => offset === 0)).toHaveLength(1);
  });
});

describe('createWorkerMseSinkFactory (worker MSE seam)', () => {
  it('returns a fresh per-load AppendSink adapting MseAppendPipe', async () => {
    const fakeMediaSource = new FakeMediaSource();
    const fakeSourceBuffer = new FakeSourceBuffer();
    const playhead = 0;

    const makeSink = createWorkerMseSinkFactory({
      backBufferSeconds: 30,
      getMediaSource: () => fakeMediaSource as unknown as MediaSource,
      getPlayheadSeconds: () => playhead,
      getSourceBuffer: () => fakeSourceBuffer as unknown as SourceBuffer,
      onError: () => undefined,
    });

    const first = makeSink();
    const second = makeSink();
    expect(first).not.toBe(second);

    first.append({ bytes: new Uint8Array(16).fill(1), kind: 'init' });
    first.append({ bytes: new Uint8Array(16).fill(2), kind: 'media' });
    await flush();

    expect(fakeSourceBuffer.appended.map((a) => a[0])).toEqual([1, 2]);
  });

  it('forwards resetParser and requestEndOfStream load-generation scoping to the pipe', async () => {
    const fakeMediaSource = new FakeMediaSource();
    const fakeSourceBuffer = new FakeSourceBuffer();

    const sink = createWorkerMseSinkFactory({
      backBufferSeconds: 30,
      getMediaSource: () => fakeMediaSource as unknown as MediaSource,
      getPlayheadSeconds: () => 0,
      getSourceBuffer: () => fakeSourceBuffer as unknown as SourceBuffer,
      onError: () => undefined,
    })();

    sink.append({ bytes: new Uint8Array(16).fill(1), kind: 'media' });
    sink.resetParser(1);
    sink.append({ bytes: new Uint8Array(16).fill(2), kind: 'media' });
    sink.requestEndOfStream(1);
    await flush();

    expect(fakeSourceBuffer.appended.map((a) => a[0])).toEqual([2]);
    expect(fakeSourceBuffer.eventLog).toContain('abort');
    expect(fakeMediaSource.endOfStreamCalls).toBe(1);
  });
});

describe('createSiaWorkerComposition (composition root)', () => {
  it('wires the real Sia transport and worker MSE into a SessionCoordinator', async () => {
    const { sdk } = fakeSiaSdk(new Uint8Array(2048).fill(1), { shared: true });
    const fakeMediaSource = new FakeMediaSource();
    const fakeSourceBuffer = new FakeSourceBuffer();
    const messages: WorkerToMainMessage[] = [];
    const pipeline = new FakeLoadPipeline();

    const coordinator = createSiaWorkerComposition({
      capabilities: permissiveCapabilities(),
      loadPipeline: pipeline,
      post: (message) => messages.push(message),
      sdk,
      supportsWorkerMse: () => true,
      workerMse: {
        backBufferSeconds: 30,
        getMediaSource: () => fakeMediaSource as unknown as MediaSource,
        getPlayheadSeconds: () => 0,
        getSourceBuffer: () => fakeSourceBuffer as unknown as SourceBuffer,
        onError: () => undefined,
      },
    });

    // SessionCoordinator surface is protocol-compatible.
    const coordinatorInterface: SessionCoordinator = coordinator;
    void coordinatorInterface;

    await coordinator.handleMessage({ requestId: 1, type: MainToWorkerMessageType.ATTACH });
    expect(messages.find((m) => m.type === WorkerToMainMessageType.ATTACH_OK)).toMatchObject({ mode: 'worker', requestId: 1 });

    await coordinator.handleMessage({ preload: 'auto', requestId: 2, src: 'pin-key', type: MainToWorkerMessageType.SOURCE });
    await flush();

    // The fake pipeline resolved the real SiaByteSource (never inspected) and
    // the load was accepted from its ready verdict.
    expect(pipeline.calls).toHaveLength(1);
    const ok = messages.find((m) => m.type === WorkerToMainMessageType.SOURCE_OK);
    expect(ok).toBeDefined();
    if (ok && ok.type === WorkerToMainMessageType.SOURCE_OK) {
      expect(ok.requestId).toBe(2);
      expect(ok.info.container).toBe('mp4');
      expect(ok.info.mode).toBe('worker');
      expect(ok.info.mime).toBe('video/mp4; codecs="avc1.640032,mp4a.40.2"');
      expect(ok.info.tracks).toEqual([
        { codec: 'avc1.640032', kind: 'video' },
        { codec: 'mp4a.40.2', kind: 'audio' },
      ]);
    }

    // Worker mode: no CHUNK is posted; the fake playback's marker units went to
    // the MSE sink in order.
    expect(messages.filter((m) => m.type === WorkerToMainMessageType.CHUNK)).toEqual([]);
    const delivered = concatBytes(fakeSourceBuffer.appended);
    expect(containsInOrder(delivered, [0x11])).toBe(true);
    expect(containsInOrder(delivered, [0x22])).toBe(true);
    expect(containsInOrder(delivered, [0x33])).toBe(true);
  });

  it('posts CHUNK (protocol-compatible) when no worker MSE is supplied', async () => {
    const { sdk } = fakeSiaSdk(new Uint8Array(2048).fill(1));
    const messages: WorkerToMainMessage[] = [];

    const coordinator = createSiaWorkerComposition({
      capabilities: permissiveCapabilities(),
      loadPipeline: new FakeLoadPipeline(),
      post: (message) => messages.push(message),
      sdk,
      supportsWorkerMse: () => false,
    });

    await coordinator.handleMessage({ requestId: 1, type: MainToWorkerMessageType.ATTACH });
    expect(messages.find((m) => m.type === WorkerToMainMessageType.ATTACH_OK)).toMatchObject({ mode: 'main' });

    await coordinator.handleMessage({ preload: 'auto', requestId: 2, src: 'pin-key', type: MainToWorkerMessageType.SOURCE });
    await flush();

    const chunks = messages.filter((m) => m.type === WorkerToMainMessageType.CHUNK);
    expect(chunks.length).toBeGreaterThan(0);
    const delivered = concatBytes(chunks.map((c) => (c.type === WorkerToMainMessageType.CHUNK ? c.bytes : new Uint8Array(0))));
    expect(containsInOrder(delivered, [0x11])).toBe(true);
  });

  it('resolves a Sia share URL end to end through the composition root', async () => {
    const { objectKeys, sdk, shareForms } = fakeSiaSdk(new Uint8Array(2048).fill(1), { shared: true });
    const messages: WorkerToMainMessage[] = [];

    const coordinator = createSiaWorkerComposition({
      capabilities: permissiveCapabilities(),
      loadPipeline: new FakeLoadPipeline(),
      post: (message) => messages.push(message),
      sdk,
      supportsWorkerMse: () => false,
    });

    await coordinator.handleMessage({ preload: 'auto', requestId: 2, src: shareSrc(), type: MainToWorkerMessageType.SOURCE });
    await flush();

    expect(objectKeys).toEqual([]);
    expect(shareForms).toEqual([shareSrc().replace('https://', 'sia://')]);
    const ok = messages.find((m) => m.type === WorkerToMainMessageType.SOURCE_OK);
    expect(ok).toBeDefined();
    expect(ok?.type === WorkerToMainMessageType.SOURCE_OK && ok.info.container).toBe('mp4');
  });

  it('wires a workerMseRoot: worker mode, per-load HANDLE transfer, playhead reflection, no CHUNK', async () => {
    const { sdk } = fakeSiaSdk(new Uint8Array(2048).fill(1));
    const mediaSources: FakeMediaSource[] = [];
    const messages: WorkerToMainMessage[] = [];
    const root = createWorkerMseRoot({
      backBufferSeconds: 30,
      createMediaSource: () => {
        const mediaSource = new FakeMediaSource();
        mediaSources.push(mediaSource);
        return mediaSource as unknown as MediaSource;
      },
      post: (message) => messages.push(message),
    });

    const coordinator = createSiaWorkerComposition({
      capabilities: permissiveCapabilities(),
      loadPipeline: new FakeLoadPipeline(),
      post: (message) => messages.push(message),
      sdk,
      supportsWorkerMse: () => true,
      workerMseRoot: root,
    });

    await coordinator.handleMessage({ requestId: 1, type: MainToWorkerMessageType.ATTACH });
    expect(messages.find((m) => m.type === WorkerToMainMessageType.ATTACH_OK)).toMatchObject({ mode: 'worker', requestId: 1 });

    await coordinator.handleMessage({ preload: 'auto', requestId: 2, src: 'pin-key', type: MainToWorkerMessageType.SOURCE });
    await flush();

    // One worker MediaSource per accepted load, its handle transferred as HANDLE.
    expect(mediaSources).toHaveLength(1);
    const handle = messages.find((m) => m.type === WorkerToMainMessageType.HANDLE);
    expect(handle?.type === WorkerToMainMessageType.HANDLE && handle.requestId).toBe(2);
    expect(root.deps.getMediaSource()).toBe(mediaSources[0]);

    // Worker mode: the fake playback's units reached the MSE sink, never CHUNK.
    expect(messages.filter((m) => m.type === WorkerToMainMessageType.CHUNK)).toEqual([]);
    const delivered = concatBytes(mediaSources[0].sourceBuffers[0].appended);
    expect(containsInOrder(delivered, [0x11])).toBe(true);
    expect(containsInOrder(delivered, [0x22])).toBe(true);
    expect(containsInOrder(delivered, [0x33])).toBe(true);

    // The validated playhead is reflected into the root's eviction boundary.
    await coordinator.handleMessage({ requestId: 2, time: 15, type: MainToWorkerMessageType.PLAYHEAD });
    expect(root.deps.getPlayheadSeconds()).toBe(15);
  });

  it('keeps the main-thread CHUNK fallback when worker MSE is unsupported even with a root', async () => {
    const { sdk } = fakeSiaSdk(new Uint8Array(2048).fill(1));
    const opened: FakeMediaSource[] = [];
    const messages: WorkerToMainMessage[] = [];
    const playback = new FakeMediaPlayback();
    const root = createWorkerMseRoot({
      backBufferSeconds: 30,
      createMediaSource: () => {
        const mediaSource = new FakeMediaSource();
        opened.push(mediaSource);
        return mediaSource as unknown as MediaSource;
      },
      post: (message) => messages.push(message),
    });

    const coordinator = createSiaWorkerComposition({
      capabilities: permissiveCapabilities(),
      loadPipeline: new FakeLoadPipeline([readyLoadResult(playback)]),
      post: (message) => messages.push(message),
      sdk,
      supportsWorkerMse: () => false,
      workerMseRoot: root,
    });

    await coordinator.handleMessage({ requestId: 1, type: MainToWorkerMessageType.ATTACH });
    expect(messages.find((m) => m.type === WorkerToMainMessageType.ATTACH_OK)).toMatchObject({ mode: 'main' });

    await coordinator.handleMessage({ preload: 'auto', requestId: 2, src: 'pin-key', type: MainToWorkerMessageType.SOURCE });
    await flush();

    // The root is never opened; the coordinator posts CHUNK as before.
    expect(opened).toHaveLength(0);
    expect(messages.filter((m) => m.type === WorkerToMainMessageType.CHUNK).length).toBeGreaterThan(0);
    expect(messages.filter((m) => m.type === WorkerToMainMessageType.HANDLE)).toEqual([]);

    // Main-mode completion posts one ENDED for the load's request id.
    playback.complete();
    await flush();
    expect(messages.find((m) => m.type === WorkerToMainMessageType.ENDED)?.requestId).toBe(2);
  });

  it('honors a host main preference: CHUNK and no HANDLE even with a root on a capable runtime', async () => {
    const { sdk } = fakeSiaSdk(new Uint8Array(2048).fill(1));
    const opened: FakeMediaSource[] = [];
    const messages: WorkerToMainMessage[] = [];
    const playback = new FakeMediaPlayback();
    const root = createWorkerMseRoot({
      backBufferSeconds: 30,
      createMediaSource: () => {
        const mediaSource = new FakeMediaSource();
        opened.push(mediaSource);
        return mediaSource as unknown as MediaSource;
      },
      post: (message) => messages.push(message),
    });

    const coordinator = createSiaWorkerComposition({
      capabilities: permissiveCapabilities(),
      loadPipeline: new FakeLoadPipeline([readyLoadResult(playback)]),
      post: (message) => messages.push(message),
      sdk,
      supportsWorkerMse: () => true,
      workerMseRoot: root,
    });

    await coordinator.handleMessage({
      config: { app: appMetadata(), indexerUrl: 'https://sia.storage', workerMse: 'main' },
      requestId: 1,
      type: MainToWorkerMessageType.HELLO,
    });
    await coordinator.handleMessage({ requestId: 2, type: MainToWorkerMessageType.ATTACH });
    expect(messages.find((m) => m.type === WorkerToMainMessageType.ATTACH_OK)).toMatchObject({ mode: 'main' });

    await coordinator.handleMessage({ preload: 'auto', requestId: 3, src: 'pin-key', type: MainToWorkerMessageType.SOURCE });
    await flush();

    // The host preference overrides the capable runtime: the root is never
    // opened (no worker MediaSource), no HANDLE transfer, CHUNK posts instead.
    expect(opened).toHaveLength(0);
    expect(messages.filter((m) => m.type === WorkerToMainMessageType.HANDLE)).toEqual([]);
    expect(messages.filter((m) => m.type === WorkerToMainMessageType.CHUNK).length).toBeGreaterThan(0);
    expect(messages.find((m) => m.type === WorkerToMainMessageType.SOURCE_OK)).toMatchObject({ info: { mode: 'main' } });

    // Completion posts one ENDED for the accepted load.
    playback.complete();
    await flush();
    expect(messages.find((m) => m.type === WorkerToMainMessageType.ENDED)?.requestId).toBe(3);
  });
});

describe('createSiaWorkerComposition (lazy real-transport root binding)', () => {
  // A HELLO config whose app metadata matches the Sia `AppMetadata` shape.
  const WORKER_CONFIG: WorkerConfig = {
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

  it('builds the SDK from HELLO config + decrypted APP_KEY seed on the first SOURCE', async () => {
    const { sdk } = fakeSiaSdk(new Uint8Array(2048).fill(1));
    const built: { config: undefined | WorkerConfig; seed: null | Uint8Array }[] = [];
    const createSdk: (config: undefined | WorkerConfig, seed: null | Uint8Array) => Promise<SiaByteSourceSdk> = vi.fn(
      (config: undefined | WorkerConfig, seed: null | Uint8Array) => {
        built.push({ config, seed });
        return Promise.resolve(sdk);
      },
    );
    const messages: WorkerToMainMessage[] = [];

    const coordinator = createSiaWorkerComposition({
      capabilities: permissiveCapabilities(),
      createSdk,
      loadPipeline: new FakeLoadPipeline(),
      post: (message) => messages.push(message),
      supportsWorkerMse: () => false,
    });

    await coordinator.handleMessage({ config: WORKER_CONFIG, requestId: 1, type: MainToWorkerMessageType.HELLO });
    const helloOk = messages.find((m) => m.type === WorkerToMainMessageType.HELLO_OK);
    expect(helloOk?.type === WorkerToMainMessageType.HELLO_OK ? helloOk.publicKey.byteLength : 0).toBe(32);

    const seed = new Uint8Array(32).fill(9);
    const envelope = await encryptToWorker(
      helloOk?.type === WorkerToMainMessageType.HELLO_OK ? helloOk.publicKey : new Uint8Array(32),
      seed,
    );
    await coordinator.handleMessage({ envelope, requestId: 2, type: MainToWorkerMessageType.APP_KEY });
    await coordinator.handleMessage({ preload: 'auto', requestId: 3, src: 'pin-key', type: MainToWorkerMessageType.SOURCE });
    await flush();

    // The SDK must NOT be built before a SOURCE needs it, and must be built
    // exactly once with the live config + decrypted seed (never the wire
    // ciphertext).
    expect(built).toHaveLength(1);
    expect(built[0].config).toEqual(WORKER_CONFIG);
    expect(built[0].seed).toEqual(seed);
    const ok = messages.find((m) => m.type === WorkerToMainMessageType.SOURCE_OK);
    expect(ok?.type === WorkerToMainMessageType.SOURCE_OK && ok.info.container).toBe('mp4');
  });

  it('reuses the memoized SDK for repeat loads and rebuilds + disposes it on a connection change', async () => {
    const payload = new Uint8Array(2048).fill(1);
    const sdkA = fakeSiaSdk(payload).sdk;
    const sdkB = fakeSiaSdk(payload).sdk;
    const disposeA = vi.fn();
    const disposeB = vi.fn();
    const built: string[] = [];
    const createSdk: (config: undefined | WorkerConfig, seed: null | Uint8Array) => Promise<SiaByteSourceSdk> = vi.fn(
      (config: undefined | WorkerConfig) => {
        const tag = config?.indexerUrl === 'https://one.example' ? 'A' : 'B';
        built.push(tag);
        return Promise.resolve({
          ...(tag === 'A' ? sdkA : sdkB),
          dispose: tag === 'A' ? disposeA : disposeB,
        } as SiaByteSourceSdk);
      },
    );
    const messages: WorkerToMainMessage[] = [];
    const pipeline = new FakeLoadPipeline([
      readyLoadResult(),
      readyLoadResult(),
      readyLoadResult(),
    ]);
    const load = async (requestId: number, indexerUrl: string): Promise<void> => {
      await coordinator.handleMessage({ config: { ...WORKER_CONFIG, indexerUrl }, requestId, type: MainToWorkerMessageType.HELLO });
      const helloOk = messages.find((m) => m.type === WorkerToMainMessageType.HELLO_OK);
      const envelope = await encryptToWorker(
        helloOk?.type === WorkerToMainMessageType.HELLO_OK ? helloOk.publicKey : new Uint8Array(32),
        new Uint8Array(32).fill(9),
      );
      await coordinator.handleMessage({ envelope, requestId: requestId + 1, type: MainToWorkerMessageType.APP_KEY });
      await coordinator.handleMessage({ preload: 'auto', requestId: requestId + 2, src: 'fmp4', type: MainToWorkerMessageType.SOURCE });
      await flush();
    };

    const coordinator = createSiaWorkerComposition({
      capabilities: permissiveCapabilities(),
      createSdk,
      loadPipeline: pipeline,
      post: (message) => messages.push(message),
      supportsWorkerMse: () => false,
    });

    await load(1, 'https://one.example');
    expect(built).toEqual(['A']);
    // Same connection, second SOURCE: memoized SDK, no rebuild.
    await coordinator.handleMessage({ preload: 'auto', requestId: 100, src: 'fmp4', type: MainToWorkerMessageType.SOURCE });
    await flush();
    expect(built).toEqual(['A']);
    expect(disposeA).not.toHaveBeenCalled();

    await load(4, 'https://two.example');
    expect(built).toEqual(['A', 'B']);
    // The connection changed: the old SDK was disposed before the new one took over.
    expect(disposeA).toHaveBeenCalledTimes(1);
    expect(disposeB).not.toHaveBeenCalled();
  });

  it('rebuilds + disposes the memoized SDK when a HELLO presence flag scrubs a seed on an identical config', async () => {
    const payload = new Uint8Array(2048).fill(1);
    const sdkA = fakeSiaSdk(payload).sdk;
    const sdkB = fakeSiaSdk(payload).sdk;
    const disposeA = vi.fn();
    const disposeB = vi.fn();
    const built: { seed: null | Uint8Array; sharingSeed: null | Uint8Array; }[] = [];
    const createSdk = vi.fn(
      (
        _config: undefined | WorkerConfig,
        seed: null | Uint8Array,
        sharingSeed: null | Uint8Array,
      ) => {
        built.push({ seed, sharingSeed });
        const tag = sharingSeed === null ? 'B' : 'A';
        return Promise.resolve({
          ...(tag === 'A' ? sdkA : sdkB),
          dispose: tag === 'A' ? disposeA : disposeB,
        } as SiaByteSourceSdk);
      },
    );
    const messages: WorkerToMainMessage[] = [];
    const coordinator = createSiaWorkerComposition({
      capabilities: permissiveCapabilities(),
      createSdk,
      loadPipeline: new FakeLoadPipeline([readyLoadResult(), readyLoadResult()]),
      post: (message) => messages.push(message),
      supportsWorkerMse: () => false,
    });

    // Session 1: HELLO declares BOTH seed providers present; both seeds land
    // in their slots and the first SOURCE builds one SDK keyed on both.
    await coordinator.handleMessage({ appSeed: true, config: WORKER_CONFIG, requestId: 1, sharingSeed: true, type: MainToWorkerMessageType.HELLO });
    const helloOk = messages.find((m) => m.type === WorkerToMainMessageType.HELLO_OK);
    const helloPublic = helloOk?.type === WorkerToMainMessageType.HELLO_OK ? helloOk.publicKey : new Uint8Array(32);
    const appSeed = new Uint8Array(32).fill(0x1a);
    const sharingSeed = new Uint8Array(32).fill(0x1b);
    await coordinator.handleMessage({ envelope: await encryptToWorker(helloPublic, appSeed), requestId: 2, type: MainToWorkerMessageType.APP_KEY });
    await coordinator.handleMessage({ envelope: await encryptToWorker(helloPublic, sharingSeed, 'sharing'), requestId: 3, type: MainToWorkerMessageType.APP_KEY });
    await coordinator.handleMessage({ preload: 'auto', requestId: 4, src: 'fmp4', type: MainToWorkerMessageType.SOURCE });
    await flush();
    expect(built).toHaveLength(1);
    expect(built[0]).toEqual({ seed: appSeed, sharingSeed });

    // Session 2: the host removed getSharingKeySeed but re-attaches the SAME
    // config — HELLO declares sharingSeed: false, so the sharing slot is
    // scrubbed even though workerConfigsEqual stays true. The memo gate now
    // sees sharingSeed null and the next SOURCE rebuilds + disposes SDK A.
    await coordinator.handleMessage({ appSeed: true, config: WORKER_CONFIG, requestId: 5, sharingSeed: false, type: MainToWorkerMessageType.HELLO });
    await coordinator.handleMessage({ preload: 'auto', requestId: 6, src: 'fmp4', type: MainToWorkerMessageType.SOURCE });
    await flush();

    expect(built).toHaveLength(2);
    expect(built[1]).toEqual({ seed: appSeed, sharingSeed: null });
    expect(disposeA).toHaveBeenCalledTimes(1);
    expect(disposeB).not.toHaveBeenCalled();
  });

  it('passes a decrypted sharing seed to createSdk when the APP_KEY envelope is keyed sharing', async () => {
    const { sdk } = fakeSiaSdk(new Uint8Array(2048).fill(1));
    const built: { config: undefined | WorkerConfig; seed: null | Uint8Array; sharingSeed: null | Uint8Array; }[] = [];
    const createSdk = vi.fn(
      (
        config: undefined | WorkerConfig,
        seed: null | Uint8Array,
        sharingSeed: null | Uint8Array,
      ) => {
        built.push({ config, seed, sharingSeed });
        return Promise.resolve(sdk);
      },
    );
    const messages: WorkerToMainMessage[] = [];

    const coordinator = createSiaWorkerComposition({
      capabilities: permissiveCapabilities(),
      createSdk,
      loadPipeline: new FakeLoadPipeline(),
      post: (message) => messages.push(message),
      supportsWorkerMse: () => false,
    });

    // A `keyType: 'sharing'` envelope lands in the sharing-seed slot only.
    await coordinator.handleMessage({ config: WORKER_CONFIG, requestId: 1, type: MainToWorkerMessageType.HELLO });
    const helloOk = messages.find((m) => m.type === WorkerToMainMessageType.HELLO_OK);
    const sharingSeed = new Uint8Array(32).fill(0x7a);
    const envelope = await encryptToWorker(
      helloOk?.type === WorkerToMainMessageType.HELLO_OK ? helloOk.publicKey : new Uint8Array(32),
      sharingSeed,
      'sharing',
    );
    expect(envelope.keyType).toBe('sharing');
    await coordinator.handleMessage({ envelope, requestId: 2, type: MainToWorkerMessageType.APP_KEY });

    // A share-URL src drives the lazy SDK build exactly once, carrying the
    // decrypted sharing seed and no app-key seed.
    await coordinator.handleMessage({ preload: 'auto', requestId: 3, src: shareSrc(), type: MainToWorkerMessageType.SOURCE });
    await flush();
    expect(built).toHaveLength(1);
    expect(built[0].config).toEqual(WORKER_CONFIG);
    expect(built[0].seed).toBeNull();
    expect(built[0].sharingSeed).toEqual(sharingSeed);
  });

  it('falls back to the app-key seed (sharingSeed null) when the envelope is untagged', async () => {
    const { sdk } = fakeSiaSdk(new Uint8Array(2048).fill(1));
    const built: { config: undefined | WorkerConfig; seed: null | Uint8Array; sharingSeed: null | Uint8Array; }[] = [];
    const createSdk = vi.fn(
      (
        config: undefined | WorkerConfig,
        seed: null | Uint8Array,
        sharingSeed: null | Uint8Array,
      ) => {
        built.push({ config, seed, sharingSeed });
        return Promise.resolve(sdk);
      },
    );
    const messages: WorkerToMainMessage[] = [];

    const coordinator = createSiaWorkerComposition({
      capabilities: permissiveCapabilities(),
      createSdk,
      loadPipeline: new FakeLoadPipeline(),
      post: (message) => messages.push(message),
      supportsWorkerMse: () => false,
    });

    // An untagged envelope is the original app-key handshake (backward compat).
    await coordinator.handleMessage({ config: WORKER_CONFIG, requestId: 1, type: MainToWorkerMessageType.HELLO });
    const helloOk = messages.find((m) => m.type === WorkerToMainMessageType.HELLO_OK);
    const seed = new Uint8Array(32).fill(0x3b);
    const envelope = await encryptToWorker(
      helloOk?.type === WorkerToMainMessageType.HELLO_OK ? helloOk.publicKey : new Uint8Array(32),
      seed,
    );
    expect(envelope.keyType).toBeUndefined();
    await coordinator.handleMessage({ envelope, requestId: 2, type: MainToWorkerMessageType.APP_KEY });

    await coordinator.handleMessage({ preload: 'auto', requestId: 3, src: shareSrc(), type: MainToWorkerMessageType.SOURCE });
    await flush();
    expect(built).toHaveLength(1);
    expect(built[0].seed).toEqual(seed);
    expect(built[0].sharingSeed).toBeNull();
  });

  it('rejects at construction when neither sdk nor createSdk is wired', () => {
    expect(() =>
      createSiaWorkerComposition({
        capabilities: permissiveCapabilities(),
        post: () => undefined,
        supportsWorkerMse: () => false,
      }),
    ).toThrow(/requires.*sdk|createSdk/i);
  });
});

// ---- browser-only runtime capability check -----------------------------------

/** Browser page: a real `MediaSource` exists (skipped under SIA_TEST_ENV=node). */
const IN_BROWSER = typeof document !== 'undefined' && typeof MediaSource !== 'undefined';

describe('composition worker-MSE runtime capability check (browser)', () => {
  it.skipIf(!IN_BROWSER)('enables worker MSE only where the runtime can construct it in a dedicated worker', () => {
    // Chromium/Edge (and Safari ≥18.1 on their workers) expose the static
    // canConstructInDedicatedWorker flag; Firefox does not, so it falls back
    // to main-thread MSE. The composition's default check reads exactly that.
    const isFirefox = navigator.userAgent.includes('Firefox/');
    expect(defaultSupportsWorkerMse()).toBe(!isFirefox);
  });
});
