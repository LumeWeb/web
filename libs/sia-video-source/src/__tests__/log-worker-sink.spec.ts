/**
 * Worker-side `LOG` emission contract: the HELLO `log` forwarding threshold
 * (proto `WorkerToMainMessageType.LOG`) gates every derived milestone end to
 * end — absent = fully silent, `'debug'` = all milestones, `'error'` = only
 * error-severity milestones. Exercised through the REAL worker sink wiring
 * (`createDefaultWorkerComposition`: its `logSink` forwards `LOG` messages
 * over the same `post` channel), the direct `createSiaWorkerComposition`
 * `logSink` dep, and the exported `emitLog` helper's threshold + 256 cap.
 * Node-safe: main-mode CHUNK fallback, no MediaSource.
 */
import { describe, expect, it } from 'vitest';
import {
  MainToWorkerMessageType,
  type WorkerConfig,
  type WorkerLogLevel,
  type WorkerToMainMessage,
  WorkerToMainMessageType,
} from '../protocol.ts';
import type { SiaObjectLike } from '../ranged-reader.ts';
import { createSiaWorkerComposition, emitLog, type WorkerLogSink } from '../session/sia-composition.ts';
import type { SiaByteSourceSdk } from '../transport/sia-byte-source.ts';
import { createDefaultWorkerComposition } from '../worker.ts';
import { FakeLoadPipeline, fakeSiaSdk, flush, permissiveCapabilities, shareSrc } from './fixtures/fmp4-fixture.ts';

/** Minimal HELLO `WorkerConfig` connection identity. */
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

/** HELLO (with the optional `log` threshold) + ATTACH + one auto-starting SOURCE. */
async function driveSource(
  root: ReturnType<typeof createDefaultWorkerComposition>,
  log: undefined | WorkerLogLevel,
  requestId = 3,
  src = 'pin-key',
): Promise<void> {
  await root.handleMessage({ config: WORKER_CONFIG, log, requestId: 1, type: MainToWorkerMessageType.HELLO });
  await root.handleMessage({ requestId: 2, type: MainToWorkerMessageType.ATTACH });
  await root.handleMessage({ preload: 'auto', requestId, src, type: MainToWorkerMessageType.SOURCE });
  await flush();
}

/** Default root in main-mode fallback; `logSink` = `post`, so LOGs ride `messages`. */
function loggedRoot(): { messages: WorkerToMainMessage[]; root: ReturnType<typeof createDefaultWorkerComposition> } {
  const { sdk } = fakeSiaSdk(new Uint8Array(2048).fill(1));
  const messages: WorkerToMainMessage[] = [];
  const root = createDefaultWorkerComposition({
    capabilities: permissiveCapabilities(),
    createSdk: () => Promise.resolve(sdk),
    loadPipeline: new FakeLoadPipeline(),
    post: (message) => messages.push(message),
    supportsWorkerMse: () => false,
  });
  return { messages, root };
}

/** Narrows worker→main messages to the `LOG` half. */
function logsOf(
  messages: readonly WorkerToMainMessage[],
): Extract<WorkerToMainMessage, { type: WorkerToMainMessageType.LOG }>[] {
  return messages.filter(
    (message): message is Extract<WorkerToMainMessage, { type: WorkerToMainMessageType.LOG }> =>
      message.type === WorkerToMainMessageType.LOG,
  );
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

describe('HELLO log threshold wiring (real worker sink)', () => {
  it('log: debug posts sdk.built + lifecycle milestones over post; attach/detach are connection-level', async () => {
    const { messages, root } = loggedRoot();
    await driveSource(root, 'debug');
    const logs = logsOf(messages);

    // sdk.built is connection-level (null requestId) and carries only the
    // indexer identity — never seeds or share-URL strings.
    const built = logs.find((log) => log.name === 'sdk.built');
    expect(built).toBeDefined();
    expect(built).toMatchObject({
      detail: { indexerUrl: WORKER_CONFIG.indexerUrl },
      level: 'info',
      requestId: null,
    });

    // Request-scoped milestones carry the owning load's requestId.
    expect(logs.find((log) => log.name === 'stream.started')).toMatchObject({ level: 'info', requestId: 3 });
    // Attach is connection-level (null requestId).
    expect(logs.find((log) => log.name === 'session.attach')).toMatchObject({ level: 'info', requestId: null });

    // Source resolution: the plain pin-key src resolves with share:false plus
    // the object's size (2048-byte fake payload), scoped to the owning SOURCE
    // request id (3). The src string itself ("pin-key") must never appear in
    // any milestone detail — share URLs embed encryption keys, so the locator
    // is never echoed.
    expect(logs.find((log) => log.name === 'object.resolved')).toMatchObject({
      detail: { share: false, size: 2048 },
      level: 'info',
      requestId: 3,
    });
    expect(JSON.stringify(logs)).not.toContain('pin-key');

    // DETACH derives session.detach at the abandon boundary, still
    // connection-level, carrying the DETACH stop reason.
    await root.handleMessage({ type: MainToWorkerMessageType.DETACH });
    expect(logsOf(messages).find((log) => log.name === 'session.detach')).toMatchObject({
      detail: { reason: 'detach' },
      level: 'info',
      requestId: null,
    });
  });

  it('log: debug resolves a share-URL src with share:true, never leaking the encryption key', async () => {
    const { sdk } = fakeSiaSdk(new Uint8Array(2048).fill(1), { shared: true });
    const messages: WorkerToMainMessage[] = [];
    const root = createDefaultWorkerComposition({
      capabilities: permissiveCapabilities(),
      createSdk: () => Promise.resolve(sdk),
      loadPipeline: new FakeLoadPipeline(),
      post: (message) => messages.push(message),
      supportsWorkerMse: () => false,
    });
    await root.handleMessage({ config: WORKER_CONFIG, log: 'debug', requestId: 1, type: MainToWorkerMessageType.HELLO });
    await root.handleMessage({ requestId: 2, type: MainToWorkerMessageType.ATTACH });
    await root.handleMessage({ preload: 'auto', requestId: 3, src: shareSrc(), type: MainToWorkerMessageType.SOURCE });
    await flush();

    const logs = logsOf(messages);
    // `object.resolved` marks the share path with share:true and the object
    // size, scoped to the owning SOURCE request (3).
    expect(logs.find((log) => log.name === 'object.resolved')).toMatchObject({
      detail: { share: true, size: 2048 },
      level: 'info',
      requestId: 3,
    });
    // Hard security rule: the share URL carries the decryption key, so the
    // URL string and its `encryption_key` fragment must never appear anywhere
    // in the emitted LOG messages.
    const serialized = JSON.stringify(logs);
    expect(serialized).not.toContain('encryption_key');
    expect(serialized).not.toContain('/objects/');
  });

  it('a HELLO without a log threshold keeps the wire fully silent (zero LOG messages)', async () => {
    const { messages, root } = loggedRoot();
    await driveSource(root, undefined);
    expect(logsOf(messages)).toHaveLength(0);
  });

  it('log: error suppresses info milestones but still posts a derived session.error', async () => {
    const payload = new Uint8Array(1024).fill(1);
    const messages: WorkerToMainMessage[] = [];
    const root = createDefaultWorkerComposition({
      capabilities: permissiveCapabilities(),
      createSdk: () => Promise.resolve(rejectingObjectSdk(payload)),
      loadPipeline: new FakeLoadPipeline(),
      post: (message) => messages.push(message),
      supportsWorkerMse: () => false,
    });
    await root.handleMessage({ config: WORKER_CONFIG, log: 'error', requestId: 1, type: MainToWorkerMessageType.HELLO });
    await root.handleMessage({ requestId: 2, type: MainToWorkerMessageType.ATTACH });
    await root.handleMessage({ preload: 'auto', requestId: 3, src: 'broken-key', type: MainToWorkerMessageType.SOURCE });
    await flush();

    const logs = logsOf(messages);
    // session.error is error-severity (at/above the 'error' threshold) so it posts.
    const sessionError = logs.find((log) => log.name === 'session.error');
    expect(sessionError).toMatchObject({
      detail: { kind: 'network' },
      level: 'error',
      requestId: 3,
    });
    // The ERROR envelope's context (the rejecting object()'s "boom") rides
    // along in the detail — scalar only, never a share URL or credential.
    expect(sessionError?.detail).toMatchObject({ context: 'boom', kind: 'network' });
    expect(JSON.stringify(logs)).not.toContain('encryption_key');
    expect(JSON.stringify(logs)).not.toContain('/objects/');
    // Every info-level milestone (sdk.built, session.attach, …) is suppressed.
    expect(logs.filter((log) => log.level !== 'error')).toHaveLength(0);
  });
});

describe('createSiaWorkerComposition logSink dep', () => {
  it('routes derived LOG messages through an injected logSink, not the protocol post channel', async () => {
    const { sdk } = fakeSiaSdk(new Uint8Array(2048).fill(1));
    const posted: WorkerToMainMessage[] = [];
    const logged: Extract<WorkerToMainMessage, { type: WorkerToMainMessageType.LOG }>[] = [];
    const logSink: WorkerLogSink = (message) => logged.push(message);
    const coordinator = createSiaWorkerComposition({
      capabilities: permissiveCapabilities(),
      createSdk: () => Promise.resolve(sdk),
      loadPipeline: new FakeLoadPipeline(),
      logSink,
      post: (message) => posted.push(message),
      supportsWorkerMse: () => false,
    });
    await coordinator.handleMessage({ config: WORKER_CONFIG, log: 'debug', requestId: 1, type: MainToWorkerMessageType.HELLO });
    await coordinator.handleMessage({ requestId: 2, type: MainToWorkerMessageType.ATTACH });
    await coordinator.handleMessage({ preload: 'auto', requestId: 3, src: 'pin-key', type: MainToWorkerMessageType.SOURCE });
    await flush();

    expect(logged.some((log) => log.name === 'sdk.built')).toBe(true);
    expect(logged.some((log) => log.name === 'stream.started')).toBe(true);
    // With a dedicated sink, LOG messages stay off the protocol channel.
    expect(posted.filter((message) => message.type === WorkerToMainMessageType.LOG)).toHaveLength(0);
  });
});

describe('emitLog threshold + 256 cap', () => {
  it('drops below-threshold events and caps LOG messages at 256 per sink instance', () => {
    const emitted: Extract<WorkerToMainMessage, { type: WorkerToMainMessageType.LOG }>[] = [];
    const sink: WorkerLogSink = (message) => emitted.push(message);

    // Below threshold ('info'/'warn' < 'error') dropped; at/above posted.
    emitLog(sink, 'error', 'info', 'stream.started');
    emitLog(sink, 'error', 'warn', 'stream.ended');
    emitLog(sink, 'error', 'error', 'session.error');
    expect(emitted.map((log) => log.level)).toEqual(['error']);
    expect(emitted[0]).toMatchObject({ name: 'session.error', requestId: null });

    // 300 attempts against a FRESH sink -> hard cap at 256, nothing escapes it
    // (the cap is per sink instance, so the earlier emits above are irrelevant).
    const capEmitted: Extract<WorkerToMainMessage, { type: WorkerToMainMessageType.LOG }>[] = [];
    const capSink: WorkerLogSink = (message) => capEmitted.push(message);
    for (let i = 0; i < 300; i++) {
      emitLog(capSink, 'debug', 'info', 'stream.started', { index: i }, i);
    }
    expect(capEmitted).toHaveLength(256);
    expect(capEmitted[255]).toMatchObject({ name: 'stream.started', requestId: 255 });
  });

  it('caps the posted LOG stream through the real composition at 256, so pathological loops never flood post', async () => {
    const { messages, root } = loggedRoot();
    await root.handleMessage({ config: WORKER_CONFIG, log: 'debug', requestId: 1, type: MainToWorkerMessageType.HELLO });
    await root.handleMessage({ requestId: 2, type: MainToWorkerMessageType.ATTACH });
    // 130 sequential loads attempt 2N+1 = 261 milestone LOGs (see cap math in
    // the module doc of emitLog); only the first 256 may reach the wire.
    for (let requestId = 3; requestId < 3 + 130; requestId++) {
      await root.handleMessage({ preload: 'auto', requestId, src: 'pin-key', type: MainToWorkerMessageType.SOURCE });
    }
    await flush();
    const logs = logsOf(messages);
    expect(logs).toHaveLength(256);
    expect(logs[255]).toBeDefined();
  });
});
