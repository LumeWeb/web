/**
 * End-to-end worker→main `LOG` wire integration across the REAL default
 * composition root, driven HELLO→ATTACH→SOURCE like the sibling composition
 * specs (fake SDK/object/pipeline — no media bytes, no MediaSource). The host
 * HELLO `log` opt-in threshold gates whether derived milestones ever reach the
 * post channel as `LOG` messages: an opted-in stream is wire-guard-valid and
 * scalar-only (a share-URL decryption key never leaks), a threshold-less HELLO
 * keeps the channel fully silent, a `warn` threshold still passes the
 * error-severity `session.error`, and the per-sink 256-message cap holds
 * across bursty reloads. The `SiaVideoSource`-level HELLO host path is
 * browser-only, so the host-side contract here is the threshold mapper plus
 * `forwardWorkerLog` rendering onto a console-logger spy (the mapper's full
 * table stays unit-tested in `log-host-forward.spec.ts`).
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createConsoleLogger } from '../log/logger.ts';
import {
  isWorkerToMainMessage,
  MainToWorkerMessageType,
  WORKER_LOG_EVENT_NAMES,
  type WorkerConfig,
  type WorkerLogLevel,
  workerLogLevel,
  type WorkerToMainMessage,
  WorkerToMainMessageType,
} from '../protocol.ts';
import type { SiaObjectLike } from '../ranged-reader.ts';
import { MAX_WORKER_LOG_MESSAGES } from '../session/sia-composition.ts';
import { forwardWorkerLog, logThresholdFor } from '../sia-video-source.ts';
import type { SiaByteSourceSdk } from '../transport/sia-byte-source.ts';
import { createDefaultWorkerComposition } from '../worker.ts';
import { FakeLoadPipeline, fakeSiaSdk, flush, permissiveCapabilities, shareSrc } from './fixtures/fmp4-fixture.ts';

type LogMessage = Extract<WorkerToMainMessage, { type: WorkerToMainMessageType.LOG }>;

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

/** HELLO (with the optional `log` opt-in) + ATTACH + one auto-starting SOURCE. */
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

/** True for values that serialize cleanly: null or a primitive, never a nested object. */
function isScalar(value: unknown): boolean {
  return value === null || (typeof value !== 'object' && typeof value !== 'function');
}

/** Default root in main-mode fallback; `logSink` = `post`, so LOGs ride `messages`. */
function loggedRoot(options: { payload?: Uint8Array; shared?: boolean } = {}): {
  messages: WorkerToMainMessage[];
  root: ReturnType<typeof createDefaultWorkerComposition>;
} {
  const { sdk } = fakeSiaSdk(options.payload ?? new Uint8Array(2048).fill(1), { shared: options.shared });
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
    (message): message is LogMessage => message.type === WorkerToMainMessageType.LOG,
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

// ---- opted-in stream -------------------------------------------------------------

describe('opting in (HELLO log: debug) collects the LOG stream end-to-end', () => {
  it('posts the full milestone sequence for one successful load, every message wire-guard-valid and scalar-only', async () => {
    const { messages, root } = loggedRoot();
    await driveSource(root, 'debug');

    const logs = logsOf(messages);
    // Actual emission order (verified by running): ATTACH is processed before
    // SOURCE, so `session.attach` leads; the lazy SDK build, object
    // resolution, and load acceptance follow on the SOURCE. The fake ready
    // pipeline never reads the byte source, so no read.window-*/bytes.read
    // milestones appear on this path.
    expect(logs.map((log) => log.name)).toEqual([
      'session.attach',
      'sdk.built',
      'object.resolved',
      'stream.started',
    ]);
    expect(logs.map((log) => log.level)).toEqual(['info', 'info', 'info', 'info']);

    // Connection-level milestones (attach, lazy SDK bootstrap, resolution)
    // carry no owning request; only the load-accepted streak is request-scoped.
    expect(logs[0]).toMatchObject({ name: 'session.attach', requestId: null });
    expect(logs[1]).toMatchObject({
      detail: { indexerUrl: WORKER_CONFIG.indexerUrl },
      name: 'sdk.built',
      requestId: null,
    });
    expect(logs[2]).toMatchObject({
      detail: { share: false, size: 2048 },
      name: 'object.resolved',
      requestId: null,
    });
    // SOURCE_OK derives `stream.started` scoped to load 3; the mode comes from
    // the ATTACH_OK that preceded it (this root ran in main-mode fallback).
    expect(logs[3]).toMatchObject({ detail: { mode: 'main' }, name: 'stream.started', requestId: 3 });

    // Every message passes the worker→main wire guard, and its detail is
    // scalar-only — primitives/null, never nested objects or credentials.
    for (const log of logs) {
      expect(isWorkerToMainMessage(log)).toBe(true);
      if (log.detail !== undefined) {
        for (const value of Object.values(log.detail)) expect(isScalar(value)).toBe(true);
      }
    }
    // Scalar-only detail: a plain pin-key load carries share/size/indexerUrl —
    // never the locator and never any encryption_key substring.
    expect(JSON.stringify(logs)).not.toContain('encryption_key');
    expect(JSON.stringify(logs)).not.toContain('pin-key');

    // DETACH derives connection-level session.detach at the abandon boundary.
    await root.handleMessage({ type: MainToWorkerMessageType.DETACH });
    expect(logsOf(messages).at(-1)).toMatchObject({ level: 'info', name: 'session.detach', requestId: null });
    expect(logsOf(messages)).toHaveLength(5);
  });

  it('never echoes a share-URL src or its decryption key in any LOG detail', async () => {
    const { messages, root } = loggedRoot({ shared: true });
    await root.handleMessage({ config: WORKER_CONFIG, log: 'debug', requestId: 1, type: MainToWorkerMessageType.HELLO });
    await root.handleMessage({ requestId: 2, type: MainToWorkerMessageType.ATTACH });
    await root.handleMessage({ preload: 'auto', requestId: 3, src: shareSrc(), type: MainToWorkerMessageType.SOURCE });
    await flush();

    const logs = logsOf(messages);
    // The share path resolves with share:true + the object size…
    expect(logs.find((log) => log.name === 'object.resolved')).toMatchObject({
      detail: { share: true, size: 2048 },
      level: 'info',
      requestId: null,
    });
    // …but the share URL string (which embeds the decryption key) is never
    // serialized anywhere in the LOG stream.
    const serialized = JSON.stringify(logs);
    expect(serialized).not.toContain('encryption_key');
    expect(serialized).not.toContain('/objects/');
    for (const log of logs) expect(isWorkerToMainMessage(log)).toBe(true);
  });
});

// ---- silent default --------------------------------------------------------------

describe('a HELLO without a log threshold keeps the post channel LOG-silent', () => {
  it('posts zero LOG messages for a successful load', async () => {
    const { messages, root } = loggedRoot();
    await driveSource(root, undefined);

    expect(logsOf(messages)).toHaveLength(0);
    // The protocol messages themselves still flow — only LOG is suppressed.
    expect(messages.some((message) => message.type === WorkerToMainMessageType.SOURCE_OK)).toBe(true);
  });
});

// ---- threshold semantics ----------------------------------------------------------

describe('HELLO log: warn suppresses info/debug but still surfaces a failing load', () => {
  it('posts only the error-severity session.error for an unreadable object', async () => {
    const payload = new Uint8Array(1024).fill(1);
    const messages: WorkerToMainMessage[] = [];
    const root = createDefaultWorkerComposition({
      capabilities: permissiveCapabilities(),
      createSdk: () => Promise.resolve(rejectingObjectSdk(payload)),
      loadPipeline: new FakeLoadPipeline(),
      post: (message) => messages.push(message),
      supportsWorkerMse: () => false,
    });
    await root.handleMessage({ config: WORKER_CONFIG, log: 'warn', requestId: 1, type: MainToWorkerMessageType.HELLO });
    await root.handleMessage({ requestId: 2, type: MainToWorkerMessageType.ATTACH });
    await root.handleMessage({ preload: 'auto', requestId: 3, src: 'broken-key', type: MainToWorkerMessageType.SOURCE });
    await flush();

    const logs = logsOf(messages);
    // error (rank 3) is at/above the warn threshold (rank 2), so it reaches
    // the wire; every info/debug milestone is below and dropped.
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      detail: { kind: 'network' },
      level: 'error',
      name: 'session.error',
      requestId: 3,
    });
    // The derived session.error carries the ERROR envelope's context string
    // (here the rejecting SDK's "boom") next to the kind — scalars only.
    expect(logs[0].detail).toMatchObject({ context: 'boom', kind: 'network' });
    // Wire-safety: the context is a controlled error message, never a share
    // URL or credential (a share URL embeds the decryption key).
    const serialized = JSON.stringify(logs);
    expect(serialized).not.toContain('encryption_key');
    expect(serialized).not.toContain('/objects/');
    for (const value of Object.values(logs[0].detail ?? {})) expect(isScalar(value)).toBe(true);
    expect(isWorkerToMainMessage(logs[0])).toBe(true);
    expect(logs.some((log) => log.name === 'session.attach')).toBe(false);
  });
});

// ---- host-side contract ------------------------------------------------------------

describe('host-side contract: threshold mapper + console-logger forwarding', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logThresholdFor raises the wire level for a warn console filter and omits it when silent', () => {
    expect(logThresholdFor('warn')).toBe(workerLogLevel.warn);
    expect(logThresholdFor('silent')).toBeUndefined();
  });

  it('forwardWorkerLog renders a warn LOG onto console.warn with the worker scope in the header', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const logger = createConsoleLogger({ level: 'warn' });
    // A captured wire LOG at warn severity, name straight from the catalog.
    const message: LogMessage = {
      detail: { bytes: 4096, position: 0 },
      level: workerLogLevel.warn,
      name: WORKER_LOG_EVENT_NAMES[9],
      requestId: 7,
      type: WorkerToMainMessageType.LOG,
    };
    forwardWorkerLog(logger, message);

    // The console logger dot-joins the `worker` child scope into the header
    // and the line renders as `worker <name>` with detail spread + requestId.
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith('[sia-video-source:worker] worker read.window-complete', {
      bytes: 4096,
      position: 0,
      requestId: 7,
    });
  });
});

// ---- cap ----------------------------------------------------------------------------

describe('the composition sink enforces the LOG cap across the lifetime', () => {
  it('stops posting LOGs at MAX_WORKER_LOG_MESSAGES even while loads keep succeeding', async () => {
    const { messages, root } = loggedRoot();
    await root.handleMessage({ config: WORKER_CONFIG, log: 'debug', requestId: 1, type: MainToWorkerMessageType.HELLO });
    await root.handleMessage({ requestId: 2, type: MainToWorkerMessageType.ATTACH });
    // 300 sequential loads attempt far more milestones than the budget (attach
    // + sdk.built once + object.resolved + stream.started per accepted load);
    // the per-sink cap must withhold everything past 256.
    for (let requestId = 3; requestId < 303; requestId++) {
      await root.handleMessage({ preload: 'auto', requestId, src: 'pin-key', type: MainToWorkerMessageType.SOURCE });
    }
    await flush();

    const logs = logsOf(messages);
    // Every load still succeeded, proving the suppression is the cap alone.
    expect(messages.filter((message) => message.type === WorkerToMainMessageType.SOURCE_OK)).toHaveLength(300);
    // At most 256 LOG posts total across the lifetime; the oversupply above
    // proves the sink engaged at exactly the budget.
    expect(logs).toHaveLength(MAX_WORKER_LOG_MESSAGES);
    expect(logs.length).toBeLessThanOrEqual(MAX_WORKER_LOG_MESSAGES);
    // The first milestone still arrived and every posted LOG is well-formed.
    expect(logs[0]).toMatchObject({ level: 'info', name: 'session.attach' });
    for (const log of logs) expect(isWorkerToMainMessage(log)).toBe(true);
  });
});
