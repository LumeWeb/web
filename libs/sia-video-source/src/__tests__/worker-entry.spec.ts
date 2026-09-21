/**
 * Worker-entry (`src/worker.ts`) seam tests: `installSiaVideoSourceWorker`
 * installs the default Sia composition root (`createDefaultWorkerComposition`,
 * a `createSiaWorkerComposition`-built `SessionCoordinator`) by default, and
 * lets a caller inject any `WorkerCompositionHost` via `createCompositionRoot`
 * — all behind the same validated-message listener. The host-side `workerMse`
 * preference is exercised through the ACTUAL installed worker root (not a
 * directly-built coordinator), in both node (message-loop install) and the
 * browser (default root end to end).
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { encryptToWorker } from '../app-key-handshake.ts';
import type { MainToWorkerMessage, WorkerConfig, WorkerToMainMessage } from '../protocol.ts';
import type { SiaByteSourceSdk } from '../transport/sia-byte-source.ts';
import { type WorkerCompositionHost } from '../worker.ts';
import {
  boundedIndexedFmp4Payload,
  concatBytes,
  FakeLoadPipeline,
  fakeSiaSdk,
  flush,
  permissiveCapabilities,
} from './fixtures/fmp4-fixture.ts';
import {
  createDefaultWorkerComposition,
  installSiaVideoSourceWorker,
  isBrowserWorkerGlobalScope,
  type WorkerScopeRuntime,
} from '../worker.ts';

/** Node-only: the seam mounts a fake worker `self`, which a browser page owns. */
const IN_NODE = typeof document === 'undefined';

/** Browser-only: real DOM, where the default root can open a fake MediaSource. */
const IN_BROWSER = !IN_NODE;

/** Driver mounting a fake worker `self` that captures the installed listener. */
function mountWorkerSelf(): { fire(data: unknown): void; restore(): void } {
  const listeners = new Map<string, (event: MessageEvent) => void>();
  const fakeSelf = {
    addEventListener(type: string, listener: (event: MessageEvent) => void): void {
      listeners.set(type, listener);
    },
  };
  const holder = globalThis as unknown as { self?: unknown };
  const previous = holder.self;
  holder.self = fakeSelf;
  return {
    fire(data: unknown): void {
      const listener = listeners.get('message');
      if (!listener) throw new Error('worker installer did not register a message listener');
      listener({ data } as MessageEvent);
    },
    restore(): void {
      holder.self = previous;
    },
  };
}

/** Minimal HELLO `WorkerConfig` connection identity for preference tests. */
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

const posted: WorkerToMainMessage[] = [];

// ---- MSE fakes (mirror sia-composition.spec.ts) ------------------------------

class FakeSourceBuffer extends EventTarget {
  abortCalls = 0;
  appended: Uint8Array[] = [];
  eventLog: string[] = [];
  updating = false;

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

describe('isBrowserWorkerGlobalScope (worker-entry auto-install guard)', () => {
  it('is true in a browser worker global scope: `self` present, no `window` (and does not consider `document`)', () => {
    // A dedicated/shared worker exposes only `self`; the guard must key off
    // `self` + `window` (both browser globals) and never branch on
    // `document` — a main-thread-only global that mislabels "Node".
    const workerScope = {
      document: {},
      self: {},
      window: undefined,
    } as unknown as WorkerScopeRuntime;
    expect(isBrowserWorkerGlobalScope(workerScope)).toBe(true);
  });

  it('is false on the browser main thread: `window` is present', () => {
    const pageScope = {
      document: {},
      self: {},
      window: {},
    } as unknown as WorkerScopeRuntime;
    expect(isBrowserWorkerGlobalScope(pageScope)).toBe(false);
  });

  it('is false where no worker `self` exists (so the entry stays inert outside a worker)', () => {
    expect(isBrowserWorkerGlobalScope({})).toBe(false);
  });
});

describe('installSiaVideoSourceWorker', () => {
  afterEach(() => {
    posted.length = 0;
  });

  it.skipIf(!IN_NODE)('installs the default Sia composition root and answers HELLO through the loop', async () => {
    const mount = mountWorkerSelf();
    try {
      installSiaVideoSourceWorker({ post: (message) => posted.push(message) });
      mount.fire({ requestId: 7, type: 'HELLO' });
      await vi.waitFor(() => {
        expect(posted.some((message) => message.type === 'HELLO_OK')).toBe(true);
      });
      const helloOk = posted.find((message): message is Extract<WorkerToMainMessage, { type: 'HELLO_OK'; }> =>
        message.type === 'HELLO_OK');
      expect(helloOk?.requestId).toBe(7);
    } finally {
      mount.restore();
    }
  });

  it.skipIf(!IN_NODE)('routes validated main messages to an injected composition root and drops foreign payloads', async () => {
    const received: MainToWorkerMessage[] = [];
    const handleMessage = vi.fn((message: MainToWorkerMessage) => {
      received.push(message);
      return Promise.resolve();
    });
    const destroy = vi.fn();
    const fakeHost: WorkerCompositionHost = { destroy, handleMessage };
    const mount = mountWorkerSelf();
    try {
      installSiaVideoSourceWorker({ createCompositionRoot: () => fakeHost });
      mount.fire({ requestId: 3, type: 'HELLO' });
      mount.fire({ bogus: true, type: 'NOT_A_PROTOCOL_MESSAGE' });
      await vi.waitFor(() => {
        expect(received.length).toBe(1);
      });
      expect(received[0]).toMatchObject({ requestId: 3, type: 'HELLO' });
      expect(handleMessage).toHaveBeenCalledTimes(1);
      expect(destroy).not.toHaveBeenCalled();
    } finally {
      mount.restore();
    }
  });
});

describe('installSiaVideoSourceWorker (default Sia composition root)', () => {
  afterEach(() => {
    posted.length = 0;
  });

  it.skipIf(!IN_NODE)('default install honors a host main preference in HELLO config: forced main-thread CHUNK', async () => {
    const mount = mountWorkerSelf();
    try {
      // The runtime claims worker-MSE support, but the host asked the worker
      // to stick to main-thread MSE (`workerMse: 'main'` in the HELLO config):
      // the DEFAULT install's Sia composition must advertise and run main mode
      // — CHUNK posting, no HANDLE, no worker MediaSource — exactly like the
      // Firefox fallback. Only the composition root consumes the preference:
      // the Sia composition re-reads the HELLO `workerMse` field rather than
      // fixing its mode at construction from the runtime capability check.
      const { sdk } = fakeSiaSdk(boundedIndexedFmp4Payload());
      installSiaVideoSourceWorker({
        capabilities: permissiveCapabilities(),
        createSdk: () => Promise.resolve(sdk),
        loadPipeline: new FakeLoadPipeline(),
        post: (message) => posted.push(message),
        supportsWorkerMse: () => true,
      });
      mount.fire({ config: { ...WORKER_CONFIG, workerMse: 'main' }, requestId: 1, type: 'HELLO' });
      await vi.waitFor(() => {
        expect(posted.some((message) => message.type === 'HELLO_OK')).toBe(true);
      });
      const helloOk = posted.find((message) => message.type === 'HELLO_OK');
      expect(helloOk?.type === 'HELLO_OK' ? helloOk.features.workerMse : null).toBe(false);

      const seed = new Uint8Array(32).fill(5);
      const envelope = await encryptToWorker(
        helloOk?.type === 'HELLO_OK' ? helloOk.publicKey : new Uint8Array(32),
        seed,
      );
      mount.fire({ envelope, requestId: 2, type: 'APP_KEY' });
      await flush();
      mount.fire({ requestId: 3, type: 'ATTACH' });
      await flush();
      const attachOk = posted.find((message) => message.type === 'ATTACH_OK');
      expect(attachOk?.type === 'ATTACH_OK' ? attachOk.mode : null).toBe('main');
      mount.fire({ preload: 'auto', requestId: 4, src: 'pin-key', type: 'SOURCE' });
      await vi.waitFor(() => {
        expect(posted.some((message) => message.type === 'CHUNK')).toBe(true);
      });
      expect(posted.filter((message) => message.type === 'CHUNK').length).toBeGreaterThan(0);
      expect(posted.filter((message) => message.type === 'HANDLE')).toEqual([]);
    } finally {
      mount.restore();
    }
  });

  it.skipIf(!IN_NODE)('default install keeps worker mode when the host prefers auto on a capable runtime', async () => {
    const mount = mountWorkerSelf();
    try {
      installSiaVideoSourceWorker({
        post: (message) => posted.push(message),
        supportsWorkerMse: () => true,
      });
      mount.fire({ config: { ...WORKER_CONFIG, workerMse: 'auto' }, requestId: 1, type: 'HELLO' });
      await vi.waitFor(() => {
        expect(posted.some((message) => message.type === 'HELLO_OK')).toBe(true);
      });
      const helloOk = posted.find((message) => message.type === 'HELLO_OK');
      expect(helloOk?.type === 'HELLO_OK' ? helloOk.features.workerMse : null).toBe(true);
      mount.fire({ requestId: 2, type: 'ATTACH' });
      await flush();
      const attachOk = posted.find((message) => message.type === 'ATTACH_OK');
      expect(attachOk?.type === 'ATTACH_OK' ? attachOk.mode : null).toBe('worker');
    } finally {
      mount.restore();
    }
  });

  it.skipIf(!IN_NODE)('default install binds the real transport: HELLO config + APP_KEY seed reach createSdk on the first SOURCE', async () => {
    const mount = mountWorkerSelf();
    const built: { config: undefined | WorkerConfig; seed: null | Uint8Array }[] = [];
    const { sdk } = fakeSiaSdk(boundedIndexedFmp4Payload());
    const createSdk: (config: undefined | WorkerConfig, seed: null | Uint8Array) => Promise<SiaByteSourceSdk> = vi.fn(
      (config: undefined | WorkerConfig, seed: null | Uint8Array) => {
        built.push({ config, seed });
        return Promise.resolve(sdk);
      },
    );
    try {
      installSiaVideoSourceWorker({
        capabilities: permissiveCapabilities(),
        createSdk,
        loadPipeline: new FakeLoadPipeline(),
        post: (message) => posted.push(message),
        supportsWorkerMse: () => false,
      });
      mount.fire({ config: WORKER_CONFIG, requestId: 1, type: 'HELLO' });
      await vi.waitFor(() => {
        expect(posted.some((message) => message.type === 'HELLO_OK')).toBe(true);
      });
      const helloOk = posted.find((message) => message.type === 'HELLO_OK');
      const seed = new Uint8Array(32).fill(4);
      const envelope = await encryptToWorker(
        helloOk?.type === 'HELLO_OK' ? helloOk.publicKey : new Uint8Array(32),
        seed,
      );
      mount.fire({ envelope, requestId: 2, type: 'APP_KEY' });
      // APP_KEY decryption is async and the entry fires messages without
      // awaiting each handleMessage, so let the handshake settle before the
      // SOURCE that lazily binds the SDK (mirrors a host awaiting its own
      // handshake round-trips).
      await flush();
      mount.fire({ requestId: 3, src: 'pin-key', type: 'SOURCE' });

      await vi.waitFor(() => {
        expect(built).toHaveLength(1);
      });
      expect(built[0].config).toEqual(WORKER_CONFIG);
      expect(built[0].seed).toEqual(seed);
      // The load pipeline resolves the source, classifies, and posts SOURCE_OK
      // asynchronously after the SDK build; wait for the wire result so the
      // assertion is not racing the pipeline.
      await vi.waitFor(() => {
        expect(posted.some((message) => message.type === 'SOURCE_OK')).toBe(true);
      });
      expect(posted.find((message) => message.type === 'SOURCE_OK')?.requestId).toBe(3);
    } finally {
      mount.restore();
    }
  });

  it.skipIf(!IN_NODE)('default install preserves the main-thread CHUNK fallback when worker MSE is unsupported', async () => {
    const mount = mountWorkerSelf();
    try {
      // Node has no MediaSource, so the worker-side default composition's
      // runtime capability check stays main-mode even with the worker-MSE root wired: the
      // root is never opened, no HANDLE is posted, and the coordinator streams
      // CHUNK exactly as the main-thread fallback expects (Firefox parity).
      const { sdk } = fakeSiaSdk(boundedIndexedFmp4Payload());
      installSiaVideoSourceWorker({
        capabilities: permissiveCapabilities(),
        createSdk: () => Promise.resolve(sdk),
        loadPipeline: new FakeLoadPipeline(),
        post: (message) => posted.push(message),
      });
      mount.fire({ config: WORKER_CONFIG, requestId: 1, type: 'HELLO' });
      await vi.waitFor(() => {
        expect(posted.some((message) => message.type === 'HELLO_OK')).toBe(true);
      });
      const helloOk = posted.find((message) => message.type === 'HELLO_OK');
      expect(helloOk?.type === 'HELLO_OK' ? helloOk.features.workerMse : null).toBe(false);

      const seed = new Uint8Array(32).fill(5);
      const envelope = await encryptToWorker(
        helloOk?.type === 'HELLO_OK' ? helloOk.publicKey : new Uint8Array(32),
        seed,
      );
      mount.fire({ envelope, requestId: 2, type: 'APP_KEY' });
      await flush();
      mount.fire({ preload: 'auto', requestId: 3, src: 'pin-key', type: 'SOURCE' });

      await vi.waitFor(() => {
        expect(posted.some((message) => message.type === 'CHUNK')).toBe(true);
      });
      expect(posted.filter((message) => message.type === 'CHUNK').length).toBeGreaterThan(0);
      expect(posted.filter((message) => message.type === 'HANDLE')).toEqual([]);
    } finally {
      mount.restore();
    }
  });

});

describe('createDefaultWorkerComposition (actual installed default root, browser coverage)', () => {
  afterEach(() => {
    posted.length = 0;
  });

  it.skipIf(!IN_BROWSER)('honors a host main preference: CHUNK and no HANDLE even with a root on a capable runtime', async () => {
    const payload = boundedIndexedFmp4Payload();
    const { sdk } = fakeSiaSdk(payload);
    const mediaSources: FakeMediaSource[] = [];
    const messages: WorkerToMainMessage[] = [];
    const root = createDefaultWorkerComposition({
      capabilities: permissiveCapabilities(),
      createMediaSource: () => {
        const mediaSource = new FakeMediaSource();
        mediaSources.push(mediaSource);
        return mediaSource as unknown as MediaSource;
      },
      createSdk: () => Promise.resolve(sdk),
      loadPipeline: new FakeLoadPipeline(),
      post: (message) => messages.push(message),
      supportsWorkerMse: () => true,
    });

    await root.handleMessage({ config: { ...WORKER_CONFIG, workerMse: 'main' }, requestId: 1, type: 'HELLO' });
    await root.handleMessage({ requestId: 2, type: 'ATTACH' });
    expect(messages.find((m) => m.type === 'ATTACH_OK')).toMatchObject({ mode: 'main' });

    await root.handleMessage({ preload: 'auto', requestId: 3, src: 'pin-key', type: 'SOURCE' });
    await flush();

    // The host preference overrides the capable runtime: the root is never
    // opened, no HANDLE transfer, CHUNK posts instead.
    expect(mediaSources).toHaveLength(0);
    expect(messages.filter((m) => m.type === 'HANDLE')).toEqual([]);
    expect(messages.filter((m) => m.type === 'CHUNK').length).toBeGreaterThan(0);
    expect(messages.find((m) => m.type === 'SOURCE_OK')).toMatchObject({ info: { mode: 'main' } });
  });

  it.skipIf(!IN_BROWSER)('keeps worker mode for auto on a capable runtime: HANDLE transfer, MSE appends, no CHUNK', async () => {
    const payload = boundedIndexedFmp4Payload();
    const { sdk } = fakeSiaSdk(payload);
    const mediaSources: FakeMediaSource[] = [];
    const messages: WorkerToMainMessage[] = [];
    const root = createDefaultWorkerComposition({
      capabilities: permissiveCapabilities(),
      createMediaSource: () => {
        const mediaSource = new FakeMediaSource();
        mediaSources.push(mediaSource);
        return mediaSource as unknown as MediaSource;
      },
      createSdk: () => Promise.resolve(sdk),
      loadPipeline: new FakeLoadPipeline(),
      post: (message) => messages.push(message),
      supportsWorkerMse: () => true,
    });

    await root.handleMessage({ config: { ...WORKER_CONFIG, workerMse: 'auto' }, requestId: 1, type: 'HELLO' });
    await root.handleMessage({ requestId: 2, type: 'ATTACH' });
    expect(messages.find((m) => m.type === 'ATTACH_OK')).toMatchObject({ mode: 'worker' });

    await root.handleMessage({ preload: 'auto', requestId: 3, src: 'pin-key', type: 'SOURCE' });
    await flush();

    // Auto + capable runtime: worker mode through the ACTUAL installed root —
    // one worker MediaSource per load, its handle transferred as HANDLE, and
    // produced segments appended into the SourceBuffer, never posted as CHUNK.
    expect(mediaSources).toHaveLength(1);
    const handle = messages.find((m) => m.type === 'HANDLE');
    expect(handle?.type === 'HANDLE' && handle.requestId).toBe(3);
    expect(messages.filter((m) => m.type === 'CHUNK')).toEqual([]);
    expect(messages.find((m) => m.type === 'SOURCE_OK')).toMatchObject({ info: { mode: 'worker' } });
    const delivered = concatBytes(mediaSources[0].sourceBuffers[0].appended);
    expect(delivered.byteLength).toBeGreaterThan(0);
  });
});
