/**
 * Real default composition-root end-to-end lifecycle tests: the ACTUAL root
 * `createDefaultWorkerComposition` installs (the `createSiaWorkerComposition`
 * binding), driven over its real handshake + lazy SDK transport + worker-side
 * MSE root / main-mode CHUNK fallback — not a directly-built coordinator.
 *
 * Focus: SDK transport + worker-MSE/main fallback lifecycle, cancellation,
 * teardown, and no stale handles. The two
 * RED tests — `DETACH` and `DESTROY` must release the worker MediaSource /
 * SourceBuffer a load opened — drive the `onAbandon` teardown seam on the
 * composition root; the rest validate that a superseded load's handle is
 * dropped immediately and that neither worker-MSE nor main-mode CHUNK
 * delivery can outlive its load.
 *
 * Browser-only surfaces are marked `it.skipIf(!IN_BROWSER)`; the lazy SDK
 * transport rebuild (node-safe) is marked `it.skipIf(!IN_NODE)`. Scope: the
 * root lifecycle (transport + MSE wiring) is the object under test; producer
 * container internals are covered by the dedicated producer specs.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { WorkerConfig } from '../protocol.ts';
import type { WorkerToMainMessage } from '../protocol.ts';
import type { SiaByteSourceSdk } from '../transport/sia-byte-source.ts';
import { boundedIndexedFmp4Payload, concatBytes, fakeSiaSdk, flush, permissiveCapabilities } from './fixtures/fmp4-fixture.ts';
import { createDefaultWorkerComposition } from '../worker.ts';

/** Node-only: the browser guards below assert against a real DOM page. */
const IN_NODE = typeof document === 'undefined';
/** Browser-only: real DOM, where the default root can open a fake MediaSource. */
const IN_BROWSER = !IN_NODE;

/** Minimal HELLO `WorkerConfig` connection identity for lifecycle tests. */
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

// ---- MSE fakes (mirror worker-entry.spec.ts) --------------------------------

class FakeSourceBuffer extends EventTarget {
  abortCalls = 0;
  appended: Uint8Array[] = [];
  eventLog: string[] = [];
  /** Dispatch an `error` event after the next append (fatal append failure). */
  failNextAppendWithEvent = false;
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
    const failWithEvent = this.failNextAppendWithEvent;
    this.failNextAppendWithEvent = false;
    this.updating = true;
    queueMicrotask(() => {
      this.updating = false;
      if (failWithEvent) {
        this.dispatchEvent(new Event('error'));
        return;
      }
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

async function openWorkerLoad(
  root: ReturnType<typeof createDefaultWorkerComposition>,
  _messages: WorkerToMainMessage[],
  requestId: number,
  src = 'pin-key',
): Promise<void> {
  await root.handleMessage({ config: { ...WORKER_CONFIG, workerMse: 'auto' }, requestId: 1, type: 'HELLO' });
  await root.handleMessage({ requestId: 2, type: 'ATTACH' });
  await root.handleMessage({ preload: 'auto', requestId, src, type: 'SOURCE' });
  await flush();
}

/** Builds a worker-mode default root whose MediaSources are all recorded. */
function workerModeRoot(messages: WorkerToMainMessage[]): {
  mediaSources: FakeMediaSource[];
  root: ReturnType<typeof createDefaultWorkerComposition>;
} {
  const payload = boundedIndexedFmp4Payload();
  const { sdk } = fakeSiaSdk(payload);
  const mediaSources: FakeMediaSource[] = [];
  const root = createDefaultWorkerComposition({
    capabilities: permissiveCapabilities(),
    createMediaSource: () => {
      const mediaSource = new FakeMediaSource();
      mediaSources.push(mediaSource);
      return mediaSource as unknown as MediaSource;
    },
    createSdk: () => Promise.resolve(sdk),
    post: (message) => messages.push(message),
    supportsWorkerMse: () => true,
  });
  return { mediaSources, root };
}

describe('createDefaultWorkerComposition worker-MSE lifecycle (browser)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.skipIf(!IN_BROWSER)('DETACH releases the worker MediaSource + SourceBuffer the load opened (no stale handle)', async () => {
    const messages: WorkerToMainMessage[] = [];
    const { mediaSources, root } = workerModeRoot(messages);
    await openWorkerLoad(root, messages, 3);
    // Worker load owns one MediaSource with a live SourceBuffer.
    expect(messages.find((m) => m.type === 'ATTACH_OK')).toMatchObject({ mode: 'worker' });
    expect(mediaSources).toHaveLength(1);
    expect(messages.filter((m) => m.type === 'HANDLE')).toHaveLength(1);
    expect(mediaSources[0].sourceBuffers).toHaveLength(1);

    // RED: abandoning the session (DETACH) must tear the worker MSE root down —
    // the SourceBuffer is removed and the MediaSource is dropped immediately,
    // not left open until some later SOURCE re-opens the pipeline.
    await root.handleMessage({ type: 'DETACH' });
    await flush();
    expect(mediaSources[0].sourceBuffers).toHaveLength(0);
  });

  it.skipIf(!IN_BROWSER)('DESTROY tears the worker MSE pipeline down permanently', async () => {
    const messages: WorkerToMainMessage[] = [];
    const { mediaSources, root } = workerModeRoot(messages);
    await openWorkerLoad(root, messages, 3);
    expect(mediaSources).toHaveLength(1);
    expect(mediaSources[0].sourceBuffers).toHaveLength(1);

    // RED: DESTROY is permanent — no later load can ever re-open this root, so
    // the open MediaSource + SourceBuffer must be released at destroy time.
    await root.handleMessage({ type: 'DESTROY' });
    await flush();
    expect(mediaSources[0].sourceBuffers).toHaveLength(0);
  });

  it.skipIf(!IN_BROWSER)('superseding SOURCE releases the previous load pipeline and posts exactly one fresh HANDLE per load', async () => {
    const messages: WorkerToMainMessage[] = [];
    const { mediaSources, root } = workerModeRoot(messages);
    // One connection at worker mode, then two sequential loads on it.
    await root.handleMessage({ config: { ...WORKER_CONFIG, workerMse: 'auto' }, requestId: 1, type: 'HELLO' });
    await root.handleMessage({ requestId: 2, type: 'ATTACH' });
    await root.handleMessage({ preload: 'auto', requestId: 3, src: 'pin-key', type: 'SOURCE' });
    await flush();
    expect(mediaSources).toHaveLength(1);
    expect(messages.filter((m) => m.type === 'HANDLE')).toHaveLength(1);

    const superseded = mediaSources[0].sourceBuffers[0];
    const supersededAppendCount = superseded.appended.length;
    expect(supersededAppendCount).toBeGreaterThan(0); // the superseded load genuinely appended

    // SOURCE 4 supersedes the active load on the same connection.
    await root.handleMessage({ preload: 'auto', requestId: 4, src: 'pin-key', type: 'SOURCE' });
    await flush();

    // Exactly one HANDLE per accepted load, scoped to its request id; the old
    // pipeline's SourceBuffer is released and receives no stale appends, and
    // the new load owns the one live pipeline that streams.
    expect(messages.filter((m) => m.type === 'HANDLE').map((m) => (m.type === 'HANDLE' ? m.requestId : null))).toEqual([
      3, 4,
    ]);
    expect(mediaSources).toHaveLength(2);
    expect(mediaSources[0].sourceBuffers).toHaveLength(0);
    expect(mediaSources[1].sourceBuffers).toHaveLength(1);
    expect(superseded.appended.length).toBe(supersededAppendCount);
    const delivered = concatBytes(mediaSources[1].sourceBuffers[0].appended);
    expect(delivered.byteLength).toBeGreaterThan(0);
  });

  it.skipIf(!IN_BROWSER)('a fatal worker-MSE append error posts a request-scoped decode ERROR and releases the SourceBuffer immediately (no stale handle on the errored pipeline)', async () => {
    const messages: WorkerToMainMessage[] = [];
    const { mediaSources, root } = workerModeRoot(messages);
    // Build the pipeline WITHOUT streaming (preload none): the worker MediaSource
    // + SourceBuffer exist but nothing has appended yet, so the first PLAY can
    // deterministically trigger the failing append.
    await root.handleMessage({ config: { ...WORKER_CONFIG, workerMse: 'auto' }, requestId: 1, type: 'HELLO' });
    await root.handleMessage({ requestId: 2, type: 'ATTACH' });
    await root.handleMessage({ preload: 'none', requestId: 3, src: 'pin-key', type: 'SOURCE' });
    await flush();
    expect(messages.filter((m) => m.type === 'ERROR')).toHaveLength(0);
    expect(mediaSources).toHaveLength(1);

    const sourceBuffer = mediaSources[0].sourceBuffers[0];
    expect(sourceBuffer.appended.length).toBe(0); // nothing streamed yet

    // RED: a fatal append failure must surface a request-scoped decode ERROR AND
    // release the worker SourceBuffer straight away — an errored pipeline must
    // never leave a dead MediaSource/SourceBuffer allocated until some later
    // DETACH/supersede happens to tear it down.
    sourceBuffer.failNextAppendWithEvent = true;
    await root.handleMessage({ requestId: 4, type: 'PLAY' });
    await flush();
    const errors = messages.filter((m): m is Extract<WorkerToMainMessage, { type: 'ERROR'; }> => m.type === 'ERROR');
    expect(errors).toEqual([expect.objectContaining({ kind: 'decode', requestId: 3 })]);
    expect(mediaSources[0].sourceBuffers).toHaveLength(0);

    // Recovery: the dead pipeline does not wedge the root — the next load opens
    // a fresh worker MediaSource + HANDLE and streams.
    await root.handleMessage({ preload: 'auto', requestId: 5, src: 'pin-key', type: 'SOURCE' });
    await flush();
    expect(mediaSources).toHaveLength(2);
    expect(messages.filter((m) => m.type === 'HANDLE').map((m) => (m.type === 'HANDLE' ? m.requestId : null))).toEqual([
      3, 5,
    ]);
    expect(mediaSources[1].sourceBuffers).toHaveLength(1);
    expect(concatBytes(mediaSources[1].sourceBuffers[0].appended).byteLength).toBeGreaterThan(0);
  });

  it.skipIf(!IN_BROWSER)('a failing transport in worker mode posts a request-scoped network ERROR, opens no MediaSource, and recovers on the next load', async () => {
    const payload = boundedIndexedFmp4Payload();
    const sdk = fakeSiaSdk(payload).sdk;
    const messages: WorkerToMainMessage[] = [];
    const mediaSources: FakeMediaSource[] = [];
    let buildCalls = 0;
    const root = createDefaultWorkerComposition({
      capabilities: permissiveCapabilities(),
      createMediaSource: () => {
        const mediaSource = new FakeMediaSource();
        mediaSources.push(mediaSource);
        return mediaSource as unknown as MediaSource;
      },
      createSdk: () => {
        buildCalls += 1;
        return buildCalls === 1 ? Promise.reject(new Error('transport down')) : Promise.resolve(sdk);
      },
      post: (message) => messages.push(message),
      supportsWorkerMse: () => true,
    });
    await root.handleMessage({ config: { ...WORKER_CONFIG, workerMse: 'auto' }, requestId: 1, type: 'HELLO' });
    await root.handleMessage({ requestId: 2, type: 'ATTACH' });
    await root.handleMessage({ preload: 'auto', requestId: 3, src: 'pin-key', type: 'SOURCE' });
    await flush();

    // The failing transport never opens a worker MediaSource nor posts a HANDLE;
    // the failure surfaces as a request-scoped network ERROR.
    const errors = messages.filter((m): m is Extract<WorkerToMainMessage, { type: 'ERROR'; }> => m.type === 'ERROR');
    expect(errors).toEqual([expect.objectContaining({ kind: 'network', requestId: 3 })]);
    expect(mediaSources).toHaveLength(0);
    expect(messages.filter((m) => m.type === 'HANDLE')).toHaveLength(0);

    // The root is not wedged: the same connection retries the (unmemoized)
    // failed SDK build and the next load opens exactly one MediaSource + HANDLE.
    await root.handleMessage({ preload: 'auto', requestId: 5, src: 'pin-key', type: 'SOURCE' });
    await flush();
    expect(buildCalls).toBe(2);
    expect(mediaSources).toHaveLength(1);
    expect(mediaSources[0].sourceBuffers).toHaveLength(1);
    expect(messages.filter((m) => m.type === 'HANDLE').map((m) => (m.type === 'HANDLE' ? m.requestId : null))).toEqual([
      5,
    ]);
    expect(concatBytes(mediaSources[0].sourceBuffers[0].appended).byteLength).toBeGreaterThan(0);
  });
});

describe('createDefaultWorkerComposition main-mode CHUNK fallback lifecycle (browser)', () => {
  it.skipIf(!IN_BROWSER)('DETACH stops CHUNK delivery from the cancelled load (fallback cancellation)', async () => {
    const payload = boundedIndexedFmp4Payload();
    const { sdk } = fakeSiaSdk(payload);
    const messages: WorkerToMainMessage[] = [];
    const root = createDefaultWorkerComposition({
      capabilities: permissiveCapabilities(),
      createSdk: () => Promise.resolve(sdk),
      post: (message) => messages.push(message),
      supportsWorkerMse: () => false, // Firefox-style main-thread MSE fallback
    });
    await root.handleMessage({ config: { ...WORKER_CONFIG, workerMse: 'auto' }, requestId: 1, type: 'HELLO' });
    await root.handleMessage({ requestId: 2, type: 'ATTACH' });
    expect(messages.find((m) => m.type === 'ATTACH_OK')).toMatchObject({ mode: 'main' });

    const chunkCount = () => messages.filter((m) => m.type === 'CHUNK').length;
    await root.handleMessage({ preload: 'auto', requestId: 3, src: 'pin-key', type: 'SOURCE' });
    await flush();
    expect(chunkCount()).toBeGreaterThan(0); // fallback really posts CHUNK

    // Cancellation: after DETACH the replaced load may post no further CHUNK.
    await root.handleMessage({ type: 'DETACH' });
    await flush();
    const frozen = chunkCount();
    await flush();
    expect(chunkCount()).toBe(frozen);
  });

  it.skipIf(!IN_BROWSER)('a failing transport in main-mode fallback posts a request-scoped network ERROR, no CHUNK, and recovers on the next load', async () => {
    const payload = boundedIndexedFmp4Payload();
    const sdk = fakeSiaSdk(payload).sdk;
    const messages: WorkerToMainMessage[] = [];
    let buildCalls = 0;
    const root = createDefaultWorkerComposition({
      capabilities: permissiveCapabilities(),
      createSdk: () => {
        buildCalls += 1;
        return buildCalls === 1 ? Promise.reject(new Error('transport down')) : Promise.resolve(sdk);
      },
      post: (message) => messages.push(message),
      supportsWorkerMse: () => false, // Firefox-style main-thread MSE fallback
    });
    await root.handleMessage({ config: { ...WORKER_CONFIG, workerMse: 'auto' }, requestId: 1, type: 'HELLO' });
    await root.handleMessage({ requestId: 2, type: 'ATTACH' });
    expect(messages.find((m) => m.type === 'ATTACH_OK')).toMatchObject({ mode: 'main' });

    const chunkCount = () => messages.filter((m) => m.type === 'CHUNK').length;
    await root.handleMessage({ preload: 'auto', requestId: 3, src: 'pin-key', type: 'SOURCE' });
    await flush();
    expect(messages.filter((m) => m.type === 'ERROR')).toEqual([
      expect.objectContaining({ kind: 'network', requestId: 3 }),
    ]);
    expect(chunkCount()).toBe(0); // a failed load never posts CHUNK

    // Recovery: the (unmemoized) failed SDK build is retried on the same
    // connection and the fallback stream resumes — CHUNK delivery is restored.
    await root.handleMessage({ preload: 'auto', requestId: 5, src: 'pin-key', type: 'SOURCE' });
    await flush();
    expect(buildCalls).toBe(2);
    expect(messages.filter((m) => m.type === 'ERROR')).toHaveLength(1);
    expect(chunkCount()).toBeGreaterThan(0);
  });
});

describe('createDefaultWorkerComposition lazy SDK transport (node)', () => {
  it.skipIf(!IN_NODE)('binds the SDK lazily and rebuilds + disposes it when the HELLO config changes', async () => {
    const payload = boundedIndexedFmp4Payload();
    const sdkA = fakeSiaSdk(payload).sdk;
    const sdkB = fakeSiaSdk(payload).sdk;
    const disposeA = vi.fn();
    const disposeB = vi.fn();
    const built: { config: undefined | WorkerConfig; seed: null | Uint8Array }[] = [];
    const messages: WorkerToMainMessage[] = [];
    const root = createDefaultWorkerComposition({
      capabilities: permissiveCapabilities(),
      createSdk: (config, seed) => {
        built.push({ config, seed });
        const tag = config?.indexerUrl === 'https://one.example' ? 'A' : 'B';
        return Promise.resolve({
          ...(tag === 'A' ? sdkA : sdkB),
          dispose: tag === 'A' ? disposeA : disposeB,
        } as SiaByteSourceSdk);
      },
      post: (message) => messages.push(message),
      supportsWorkerMse: () => false,
    });
    const load = async (requestId: number, indexerUrl: string): Promise<void> => {
      await root.handleMessage({ config: { ...WORKER_CONFIG, indexerUrl }, requestId, type: 'HELLO' });
      await root.handleMessage({ preload: 'none', requestId: requestId + 1, src: 'pin-key', type: 'SOURCE' });
      await flush();
    };

    await load(1, 'https://one.example');
    expect(built).toHaveLength(1);
    expect(built[0].config?.indexerUrl).toBe('https://one.example');
    expect(built[0].seed).toBeNull(); // no APP_KEY yet: null seed, never the instance

    await load(4, 'https://two.example');
    expect(built).toHaveLength(2);
    expect(built[1].config?.indexerUrl).toBe('https://two.example');

    // A changed connection supersedes the memoized SDK: the old one is disposed
    // before the new build takes over (no stale credentials cached over a new
    // indexer).
    expect(disposeA).toHaveBeenCalledTimes(1);
    expect(disposeB).not.toHaveBeenCalled();
  });
});
