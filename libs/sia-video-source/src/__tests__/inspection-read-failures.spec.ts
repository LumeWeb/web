/** Exercises inspection read failures through mediabunny and the session wire. */
import { expect, test, vi } from 'vitest';
import { inspectMediaLibrary } from '../media/library-load.ts';
import { MainToWorkerMessageType, type WorkerToMainMessage, WorkerToMainMessageType } from '../protocol.ts';
import { ReadStalledError, ReadTransportError } from '../ranged-reader.ts';
import { createSessionCoordinator } from '../session/session-coordinator.ts';
import { type ByteSource, ByteSourceSupersededError } from '../transport/byte-source.ts';
import { MemoryByteSource } from '../transport/memory-byte-source.ts';
import { permissiveCapabilities } from './fixtures/fmp4-fixture.ts';

const failures = [
  { error: new Error('not enough shards: 0/10'), kind: 'shard-shortage' },
  { error: new ReadStalledError('read watchdog expired', { position: 0, stallTimeoutMs: 100 }), kind: 'read-stalled' },
  { error: new ReadTransportError('transport exhausted', { attempts: 3, expectedBytes: 1024, position: 0 }), kind: 'network' },
  { error: new Error('wrapped shard failure', { cause: new Error('not enough shards: 0/10') }), kind: 'shard-shortage' },
  { error: new Error('wrapped transport failure', { cause: new ReadTransportError('transport exhausted', { attempts: 3, expectedBytes: 1024, position: 0 }) }), kind: 'network' },
];

/** Injects transport errors without replacing the inspector or load pipeline. */
function failingSource(error: unknown) {
  const streams: ReadableStream<Uint8Array>[] = [];
  const cancel = vi.fn();
  const source: ByteSource = {
    cancel,
    read: () => {
      const stream = new ReadableStream<Uint8Array>({ start: (controller) => controller.error(error) });
      streams.push(stream);
      return stream;
    },
    size: 1024,
  };
  return { cancel, source, streams };
}

test.each(failures)('inspection preserves $kind read failures and releases the source', async ({ error }) => {
  const { cancel, source, streams } = failingSource(error);
  await expect(inspectMediaLibrary(source, { capabilities: permissiveCapabilities() })).rejects.toBe(error);
  expect(cancel).toHaveBeenCalledOnce();
  expect(streams.length).toBeGreaterThan(0);
  expect(streams.every((stream) => !stream.locked)).toBe(true);
});

test.each(failures)('the session reports $kind for an inspection read failure', async ({ error, kind }) => {
  const { cancel, source, streams } = failingSource(error);
  const messages: WorkerToMainMessage[] = [];
  const coordinator = createSessionCoordinator({
    capabilities: permissiveCapabilities(),
    createSource: () => Promise.resolve(source),
    post: (message) => messages.push(message),
    supportsWorkerMse: () => false,
  });
  try {
    await coordinator.handleMessage({ requestId: 1, type: MainToWorkerMessageType.HELLO });
    await coordinator.handleMessage({ requestId: 7, src: 'shared-object', type: MainToWorkerMessageType.SOURCE });
    expect(messages.filter((message) => message.type === WorkerToMainMessageType.ERROR)).toMatchObject([
      { kind, requestId: 7 },
    ]);
    expect(messages.find((message) => message.type === WorkerToMainMessageType.ERROR)?.context).toContain(error.message);
    expect(messages.some((message) => message.type === WorkerToMainMessageType.SOURCE_OK)).toBe(false);
    expect(cancel).toHaveBeenCalled();
    expect(streams.every((stream) => !stream.locked)).toBe(true);
  } finally {
    coordinator.destroy();
  }
});

test('malformed bytes remain unsupported', async () => {
  const result = await inspectMediaLibrary(new MemoryByteSource(new Uint8Array(1024)), {
    capabilities: permissiveCapabilities(),
  });
  expect(result).toMatchObject({ reason: 'format-unreadable', status: 'unsupported' });
});

test.each([new ByteSourceSupersededError(), new DOMException('aborted', 'AbortError')])(
  'cancelled inspection releases its source without a failure', async (error) => {
    const { cancel, source, streams } = failingSource(error);
    await expect(inspectMediaLibrary(source, { capabilities: permissiveCapabilities() })).resolves.toEqual({ status: 'cancelled' });
    expect(cancel).toHaveBeenCalledOnce();
    expect(streams.every((stream) => !stream.locked)).toBe(true);
  },
);

test('a superseded inspection failure stays quiet while the replacement reports its own result', async () => {
  const messages: WorkerToMainMessage[] = [];
  let failRead: (() => void) | undefined;
  let markReading!: () => void;
  const reading = new Promise<void>((resolve) => { markReading = resolve; });
  let stream: ReadableStream<Uint8Array> | undefined;
  const cancel = vi.fn(() => failRead?.());
  const source: ByteSource = {
    cancel,
    read: () => {
      stream = new ReadableStream<Uint8Array>({ start(controller) {
        failRead = () => controller.error(new Error('not enough shards: 0/10'));
        markReading();
      } });
      return stream;
    },
    size: 1024,
  };
  const coordinator = createSessionCoordinator({
    capabilities: permissiveCapabilities(),
    createSource: (src) => Promise.resolve(src === 'first' ? source : new MemoryByteSource(new Uint8Array(1024))),
    post: (message) => messages.push(message),
    supportsWorkerMse: () => false,
  });
  try {
    await coordinator.handleMessage({ requestId: 1, type: MainToWorkerMessageType.HELLO });
    const first = coordinator.handleMessage({ requestId: 7, src: 'first', type: MainToWorkerMessageType.SOURCE });
    await reading;
    await coordinator.handleMessage({ requestId: 8, src: 'replacement', type: MainToWorkerMessageType.SOURCE });
    await first;
    expect(messages.find((message) => message.type === WorkerToMainMessageType.ERROR)?.context).toContain('format-unreadable');
    expect(messages.filter((message) => message.type === WorkerToMainMessageType.ERROR)).toMatchObject([
      { kind: 'unsupported', requestId: 8 },
    ]);
    expect(messages.some((message) => message.type === WorkerToMainMessageType.SOURCE_OK)).toBe(false);
    expect(cancel).toHaveBeenCalled();
    expect(stream?.locked).toBe(false);
  } finally {
    coordinator.destroy();
  }
});

test.each([new ByteSourceSupersededError(), new DOMException('aborted', 'AbortError')])(
  'the session keeps cancelled inspection quiet', async (error) => {
    const { cancel, source } = failingSource(error);
    const messages: WorkerToMainMessage[] = [];
    const coordinator = createSessionCoordinator({
      capabilities: permissiveCapabilities(),
      createSource: () => Promise.resolve(source),
      post: (message) => messages.push(message),
      supportsWorkerMse: () => false,
    });
    try {
      await coordinator.handleMessage({ requestId: 1, type: MainToWorkerMessageType.HELLO });
      await coordinator.handleMessage({ requestId: 7, src: 'cancelled', type: MainToWorkerMessageType.SOURCE });
      expect(messages.filter((message) => message.type === WorkerToMainMessageType.ERROR || message.type === WorkerToMainMessageType.SOURCE_OK)).toEqual([]);
      expect(cancel).toHaveBeenCalledOnce();
    } finally {
      coordinator.destroy();
    }
  },
);
