/**
 * TDD contract for the production composition-root binding: the seam that
 * wires the `SessionCoordinator` to the real Sia transport and worker-mode
 * MSE, without rewriting `RangedReader`/`ReadBudget`/`LruChunkCache` or the
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
 * Scope: exercised over fMP4 fixtures through the real Sia transport
 * composition; per-container producer internals are covered by the dedicated
 * producer specs.
 */

import { describe, expect, it, vi } from 'vitest';
import type { AppMetadata, Slab } from '@siafoundation/sia-storage';
import { capabilityVerdict } from '../capabilities/codec-verdict.ts';
import type { PlaybackCapabilities } from '../capabilities/browser-capabilities.ts';
import { encryptToWorker } from '../app-key-handshake.ts';
import type { WorkerConfig, WorkerToMainMessage } from '../protocol.ts';
import type { SiaObjectLike } from '../ranged-reader.ts';
import { createSiaWorkerComposition } from '../session/sia-composition.ts';
import { defaultSupportsWorkerMse, type SessionCoordinator } from '../session/session-coordinator.ts';
import { createWorkerMseRoot } from '../session/worker-mse-root.ts';
import { createWorkerMseSinkFactory } from '../sink/mse-adapter.ts';
import type { ByteSource } from '../transport/byte-source.ts';
import {
  createSiaByteSourceFactory,
  type SiaByteSourceSdk,
} from '../transport/sia-byte-source.ts';

// ---- transport fixtures ------------------------------------------------------

interface FakeSiaSdkResult {
  downloads: number[];
  objectKeys: string[];
  sdk: SiaByteSourceSdk;
  shareForms: string[];
}

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

/** Three 30 s RAP ranges, each 5008 bytes (segments marked 0x11/0x22/0x33). */
function boundedIndexedFmp4Payload(): Uint8Array {
  const u16 = (value: number) => [value >>> 8, value & 255];
  const u32 = (value: number) => [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
  const segmentLength = 5008;
  const ftyp = isoBox('ftyp', [105, 115, 111, 109]);
  const mvhd = isoBox('mvhd', [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ...u32(1000), ...u32(90_000)]);
  const moov = isoBox('moov', [...mvhd]);
  const sidx = isoBox('sidx', [
    0, 0, 0, 0, ...u32(1), ...u32(1000), ...u32(0), ...u32(0), ...u16(0), ...u16(3),
    ...u32(segmentLength), ...u32(30_000), 0x80, 0, 0, 0,
    ...u32(segmentLength), ...u32(30_000), 0x80, 0, 0, 0,
    ...u32(segmentLength), ...u32(30_000), 0x80, 0, 0, 0,
  ]);
  const segment = (marker: number) =>
    new Uint8Array([...isoBox('moof', []), ...isoBox('mdat', Array.from(new Uint8Array(4992).fill(marker)))]);
  return new Uint8Array([...ftyp, ...moov, ...sidx, ...segment(0x11), ...segment(0x22), ...segment(0x33)]);
}

// ---- MSE harness (mirrors append-sink.spec.ts) -------------------------------

function concatBytes(chunks: Uint8Array[]): Uint8Array {
  const total = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

function containsInOrder(bytes: Uint8Array, needle: number[]): boolean {
  let at = 0;
  for (const value of needle) {
    const index = bytes.indexOf(value, at);
    if (index < 0) return false;
    at = index + 1;
  }
  return true;
}

// ---- fMP4 fixture (mirrors session-coordinator.spec.ts) ----------------------

// objectSize() derives the payload size from the slab map, so fakes must
// return slabs whose lengths add up to the content length.
function fakeObject(contentLength: number): SiaObjectLike {
  const slab = { length: contentLength } as unknown as Slab;
  return { id: () => 'composition-object', size: () => contentLength, slabs: () => [slab] };
}

/** SDK (object + optional sharedObject) whose downloads slice `payload`. */
function fakeSiaSdk(payload: Uint8Array, options: { shared?: boolean } = {}): FakeSiaSdkResult {
  const downloads: number[] = [];
  const objectKeys: string[] = [];
  const shareForms: string[] = [];
  const sdk = {
    download: (_object: SiaObjectLike, dl?: { length?: number; offset?: number }) => {
      downloads.push(dl?.offset ?? 0);
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
    object: (key: string): Promise<SiaObjectLike> => {
      objectKeys.push(key);
      return Promise.resolve(fakeObject(payload.length));
    },
    ...(options.shared
      ? {
          sharedObject: (fetchForm: string): Promise<SiaObjectLike> => {
            shareForms.push(fetchForm);
            return Promise.resolve(fakeObject(payload.length));
          },
        }
      : {}),
  };
  return { downloads, objectKeys, sdk, shareForms };
}

async function flush(): Promise<void> {
  await Promise.resolve();
  await new Promise((resolve) => setTimeout(resolve, 10));
}

function isoBox(type: string, body: number[]): number[] {
  const u32 = (value: number) => [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
  const size = body.length + 8;
  return [...u32(size), ...type.split('').map((c) => c.charCodeAt(0)), ...body];
}

function permissiveCapabilities(): PlaybackCapabilities {
  return {
    canConstructWorkerMse: () => false,
    mayDecode: () => capabilityVerdict['unknown-codec'],
    mseSupported: () => true,
    webCodecsAvailable: () => false,
    workerHandleAvailable: () => false,
  };
}

/** Shared-object resolving SDK whose `object()` rejects (network failure). */
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

function segmentMarker(marker: number): number[] {
  return [marker, marker, marker, marker, marker, marker, marker, marker];
}

/** Valid Sia share URL (64-hex object key + 32-byte base64url key). */
function shareSrc(): string {
  const key = Uint8Array.from({ length: 32 }, (_, i) => i + 1);
  let binary = '';
  for (const byte of key) binary += String.fromCharCode(byte);
  const fragment = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_');
  return `https://indexer.example/objects/${'a1b2c3d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff01'}/shared?req=abc#encryption_key=${fragment}`;
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
    for await (const chunk of source.read({ length: 1024, offset: 100 }, { epoch: 1 })) {
      chunks.push(chunk);
    }
    const delivered = concatBytes(chunks);
    expect(delivered.byteLength).toBe(1024);
    expect(delivered).toEqual(payload.slice(100, 1124));
  });

  it('resolves a sia:// share URL through sdk.sharedObject(fetchForm)', async () => {
    const payload = new Uint8Array(4096).fill(7);
    const { objectKeys, sdk, shareForms } = fakeSiaSdk(payload, { shared: true });
    const factory = createSiaByteSourceFactory(sdk);

    const source = await factory(shareSrc());
    // A share src is NOT an object key; resolution goes through sharedObject
    // with the sia://-normalized fetchForm (never the https original).
    expect(objectKeys).toEqual([]);
    expect(shareForms).toEqual([shareSrc().replace('https://', 'sia://')]);

    const chunks: Uint8Array[] = [];
    for await (const chunk of source.read({ length: 512, offset: 0 }, { epoch: 1 })) {
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
    const drain = async (source: ByteSource) => {
      const chunks: Uint8Array[] = [];
      for await (const chunk of source.read({ length: 512, offset: 0 }, { epoch: 1 })) {
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

  it('forwards resetParser and requestEndOfStream epoch scoping to the pipe', async () => {
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
  it('wires the Sia transport and worker MSE into a SessionCoordinator', async () => {
    const payload = boundedIndexedFmp4Payload();
    const { sdk } = fakeSiaSdk(payload, { shared: true });
    const fakeMediaSource = new FakeMediaSource();
    const fakeSourceBuffer = new FakeSourceBuffer();
    const messages: WorkerToMainMessage[] = [];

    const coordinator = createSiaWorkerComposition({
      capabilities: permissiveCapabilities(),
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

    await coordinator.handleMessage({ requestId: 1, type: 'ATTACH' });
    expect(messages.find((m) => m.type === 'ATTACH_OK')).toMatchObject({ mode: 'worker', requestId: 1 });

    await coordinator.handleMessage({ preload: 'auto', requestId: 2, src: 'fmp4', type: 'SOURCE' });
    await flush();

    const ok = messages.find((m) => m.type === 'SOURCE_OK');
    expect(ok).toBeDefined();
    if (ok && ok.type === 'SOURCE_OK') {
      expect(ok.requestId).toBe(2);
      expect(ok.info.container).toBe('fmp4');
      expect(ok.info.mode).toBe('worker');
    }

    // Worker mode: no CHUNK is posted; produced segments went to the MSE sink.
    expect(messages.filter((m) => m.type === 'CHUNK')).toEqual([]);
    const delivered = concatBytes(fakeSourceBuffer.appended);
    expect(containsInOrder(delivered, segmentMarker(0x11))).toBe(true);
    expect(containsInOrder(delivered, segmentMarker(0x22))).toBe(true);
    expect(containsInOrder(delivered, segmentMarker(0x33))).toBe(true);
  });

  it('posts CHUNK (protocol-compatible) when no worker MSE is supplied', async () => {
    const payload = boundedIndexedFmp4Payload();
    const { sdk } = fakeSiaSdk(payload);
    const messages: WorkerToMainMessage[] = [];

    const coordinator = createSiaWorkerComposition({
      capabilities: permissiveCapabilities(),
      post: (message) => messages.push(message),
      sdk,
      supportsWorkerMse: () => false,
    });

    await coordinator.handleMessage({ requestId: 1, type: 'ATTACH' });
    expect(messages.find((m) => m.type === 'ATTACH_OK')).toMatchObject({ mode: 'main' });

    await coordinator.handleMessage({ preload: 'auto', requestId: 2, src: 'fmp4', type: 'SOURCE' });
    await flush();

    const chunks = messages.filter((m) => m.type === 'CHUNK');
    expect(chunks.length).toBeGreaterThan(0);
    const delivered = concatBytes(chunks.map((c) => (c.type === 'CHUNK' ? c.bytes : new Uint8Array(0))));
    expect(containsInOrder(delivered, segmentMarker(0x11))).toBe(true);
  });

  it('resolves a Sia share URL end to end through the composition root', async () => {
    const payload = boundedIndexedFmp4Payload();
    const { objectKeys, sdk, shareForms } = fakeSiaSdk(payload, { shared: true });
    const messages: WorkerToMainMessage[] = [];

    const coordinator = createSiaWorkerComposition({
      capabilities: permissiveCapabilities(),
      post: (message) => messages.push(message),
      sdk,
      supportsWorkerMse: () => false,
    });

    await coordinator.handleMessage({ preload: 'auto', requestId: 2, src: shareSrc(), type: 'SOURCE' });
    await flush();

    expect(objectKeys).toEqual([]);
    expect(shareForms).toEqual([shareSrc().replace('https://', 'sia://')]);
    const ok = messages.find((m) => m.type === 'SOURCE_OK');
    expect(ok).toBeDefined();
    expect(ok?.type === 'SOURCE_OK' && ok.info.container).toBe('fmp4');
  });

  it('wires a workerMseRoot: worker mode, per-load HANDLE transfer, playhead reflection, no CHUNK', async () => {
    const payload = boundedIndexedFmp4Payload();
    const { sdk } = fakeSiaSdk(payload);
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
      post: (message) => messages.push(message),
      sdk,
      supportsWorkerMse: () => true,
      workerMseRoot: root,
    });

    await coordinator.handleMessage({ requestId: 1, type: 'ATTACH' });
    expect(messages.find((m) => m.type === 'ATTACH_OK')).toMatchObject({ mode: 'worker', requestId: 1 });

    await coordinator.handleMessage({ preload: 'auto', requestId: 2, src: 'fmp4', type: 'SOURCE' });
    await flush();

    // One worker MediaSource per accepted load, its handle transferred as HANDLE.
    expect(mediaSources).toHaveLength(1);
    const handle = messages.find((m) => m.type === 'HANDLE');
    expect(handle?.type === 'HANDLE' && handle.requestId).toBe(2);
    expect(root.deps.getMediaSource()).toBe(mediaSources[0]);

    // Worker mode: produced segments go to the MSE sink, never as CHUNK.
    expect(messages.filter((m) => m.type === 'CHUNK')).toEqual([]);
    const delivered = concatBytes(mediaSources[0].sourceBuffers[0].appended);
    expect(containsInOrder(delivered, segmentMarker(0x11))).toBe(true);
    expect(containsInOrder(delivered, segmentMarker(0x22))).toBe(true);
    expect(containsInOrder(delivered, segmentMarker(0x33))).toBe(true);

    // The validated playhead is reflected into the root's eviction boundary.
    await coordinator.handleMessage({ requestId: 2, time: 15, type: 'PLAYHEAD' });
    expect(root.deps.getPlayheadSeconds()).toBe(15);
  });

  it('keeps the main-thread CHUNK fallback when worker MSE is unsupported even with a root', async () => {
    const payload = boundedIndexedFmp4Payload();
    const { sdk } = fakeSiaSdk(payload);
    const opened: FakeMediaSource[] = [];
    const messages: WorkerToMainMessage[] = [];
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
      post: (message) => messages.push(message),
      sdk,
      supportsWorkerMse: () => false,
      workerMseRoot: root,
    });

    await coordinator.handleMessage({ requestId: 1, type: 'ATTACH' });
    expect(messages.find((m) => m.type === 'ATTACH_OK')).toMatchObject({ mode: 'main' });

    await coordinator.handleMessage({ preload: 'auto', requestId: 2, src: 'fmp4', type: 'SOURCE' });
    await flush();

    // The root is never opened; the coordinator posts CHUNK as before.
    expect(opened).toHaveLength(0);
    expect(messages.filter((m) => m.type === 'CHUNK').length).toBeGreaterThan(0);
    expect(messages.filter((m) => m.type === 'HANDLE')).toEqual([]);
    expect(messages.find((m) => m.type === 'ENDED')).toBeDefined();
  });

  it('honors a host main preference: CHUNK and no HANDLE even with a root on a capable runtime', async () => {
    const payload = boundedIndexedFmp4Payload();
    const { sdk } = fakeSiaSdk(payload);
    const opened: FakeMediaSource[] = [];
    const messages: WorkerToMainMessage[] = [];
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
      post: (message) => messages.push(message),
      sdk,
      supportsWorkerMse: () => true,
      workerMseRoot: root,
    });

    await coordinator.handleMessage({
      config: { app: appMetadata(), indexerUrl: 'https://sia.storage', workerMse: 'main' },
      requestId: 1,
      type: 'HELLO',
    });
    await coordinator.handleMessage({ requestId: 2, type: 'ATTACH' });
    expect(messages.find((m) => m.type === 'ATTACH_OK')).toMatchObject({ mode: 'main' });

    await coordinator.handleMessage({ preload: 'auto', requestId: 3, src: 'fmp4', type: 'SOURCE' });
    await flush();

    // The host preference overrides the capable runtime: the root is never
    // opened (no worker MediaSource), no HANDLE transfer, CHUNK posts instead.
    expect(opened).toHaveLength(0);
    expect(messages.filter((m) => m.type === 'HANDLE')).toEqual([]);
    expect(messages.filter((m) => m.type === 'CHUNK').length).toBeGreaterThan(0);
    expect(messages.find((m) => m.type === 'SOURCE_OK')).toMatchObject({ info: { mode: 'main' } });
    expect(messages.find((m) => m.type === 'ENDED')).toBeDefined();
  });
});



/** Minimal HELLO `WorkerConfig` connection identity for preference tests. */
function appMetadata(): AppMetadata {
  return { appId: 'app', callbackUrl: '', description: '', logoUrl: '', name: 'app', serviceUrl: 'https://app.example' };
}

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
    const payload = boundedIndexedFmp4Payload();
    const { sdk } = fakeSiaSdk(payload);
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
      post: (message) => messages.push(message),
      supportsWorkerMse: () => false,
    });

    await coordinator.handleMessage({ config: WORKER_CONFIG, requestId: 1, type: 'HELLO' });
    const helloOk = messages.find((m) => m.type === 'HELLO_OK');
    expect(helloOk?.type === 'HELLO_OK' ? helloOk.publicKey.byteLength : 0).toBe(32);

    const seed = new Uint8Array(32).fill(9);
    const envelope = await encryptToWorker(
      helloOk?.type === 'HELLO_OK' ? helloOk.publicKey : new Uint8Array(32),
      seed,
    );
    await coordinator.handleMessage({ envelope, requestId: 2, type: 'APP_KEY' });
    await coordinator.handleMessage({ preload: 'auto', requestId: 3, src: 'pin-key', type: 'SOURCE' });
    await flush();

    // The SDK must NOT be built before a SOURCE needs it, and must be built
    // exactly once with the live config + decrypted seed (never the wire
    // ciphertext).
    expect(built).toHaveLength(1);
    expect(built[0].config).toEqual(WORKER_CONFIG);
    expect(built[0].seed).toEqual(seed);
    const ok = messages.find((m) => m.type === 'SOURCE_OK');
    expect(ok?.type === 'SOURCE_OK' && ok.info.container).toBe('fmp4');
  });

  it('reuses the memoized SDK for repeat loads and rebuilds + disposes it on a connection change', async () => {
    const payload = boundedIndexedFmp4Payload();
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
    const load = async (requestId: number, indexerUrl: string): Promise<void> => {
      await coordinator.handleMessage({ config: { ...WORKER_CONFIG, indexerUrl }, requestId, type: 'HELLO' });
      const helloOk = messages.find((m) => m.type === 'HELLO_OK');
      const envelope = await encryptToWorker(
        helloOk?.type === 'HELLO_OK' ? helloOk.publicKey : new Uint8Array(32),
        new Uint8Array(32).fill(9),
      );
      await coordinator.handleMessage({ envelope, requestId: requestId + 1, type: 'APP_KEY' });
      await coordinator.handleMessage({ preload: 'auto', requestId: requestId + 2, src: 'fmp4', type: 'SOURCE' });
      await flush();
    };

    const coordinator = createSiaWorkerComposition({
      capabilities: permissiveCapabilities(),
      createSdk,
      post: (message) => messages.push(message),
      supportsWorkerMse: () => false,
    });

    await load(1, 'https://one.example');
    expect(built).toEqual(['A']);
    // Same connection, second SOURCE: memoized SDK, no rebuild.
    await coordinator.handleMessage({ preload: 'auto', requestId: 100, src: 'fmp4', type: 'SOURCE' });
    await flush();
    expect(built).toEqual(['A']);
    expect(disposeA).not.toHaveBeenCalled();

    await load(4, 'https://two.example');
    expect(built).toEqual(['A', 'B']);
    // The connection changed: the old SDK was disposed before the new one took over.
    expect(disposeA).toHaveBeenCalledTimes(1);
    expect(disposeB).not.toHaveBeenCalled();
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
