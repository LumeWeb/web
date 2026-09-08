import { describe, expect, it } from 'vitest';
import {
  isWorkerToMainMessage,
  type MainToWorkerMessage,
  nextRequestId,
  PROTOCOL_VERSION,
  type WorkerToMainMessage,
} from '../protocol.ts';

describe('protocol', () => {
  it('bumps but keeps a single version constant', () => {
    expect(PROTOCOL_VERSION).toBeGreaterThanOrEqual(1);
  });

  it('allocates monotonically increasing request ids', () => {
    const first = nextRequestId();
    const second = nextRequestId();
    expect(second).toBeGreaterThan(first);
  });

  it('survives a structured-clone round trip (postMessage semantics)', () => {
    const chunk: WorkerToMainMessage = {
      bytes: new Uint8Array([0, 0, 0, 24, 102, 116, 121, 112]),
      kind: 'init',
      requestId: 7,
      type: 'CHUNK',
    };
    const clone = structuredClone(chunk) as WorkerToMainMessage;
    expect(clone).toEqual(chunk);
    if (clone.type !== 'CHUNK') throw new Error('expected CHUNK');
    expect(clone.bytes).toBeInstanceOf(Uint8Array);
    expect(Array.from(clone.bytes)).toEqual(Array.from(chunk.bytes));
  });

  it('discriminates worker→main messages in both directions', () => {
    const fromWorker: WorkerToMainMessage = { mode: 'main', requestId: 3, type: 'ATTACH_OK' };
    const fromMain: MainToWorkerMessage = { requestId: 3, time: 12.5, type: 'SEEK' };

    expect(isWorkerToMainMessage(fromWorker)).toBe(true);
    // The never-implemented WORKER_READY discriminator stays rejected.
    expect(isWorkerToMainMessage({ type: 'WORKER_READY' })).toBe(false);
    expect(isWorkerToMainMessage(fromMain)).toBe(false);
    expect(isWorkerToMainMessage(null)).toBe(false);
    expect(isWorkerToMainMessage('HELLO')).toBe(false);
  });

  it('recognizes every declared worker→main discriminator', () => {
    const samples: WorkerToMainMessage[] = [
      { features: { workerMse: true }, requestId: 1, type: 'HELLO_OK', version: 1 },
      { mode: 'worker', requestId: 1, type: 'ATTACH_OK' },
      { handle: null as unknown as MediaSourceHandle, requestId: 1, type: 'HANDLE' },
      { info: { container: 'fmp4', durationSeconds: null, mime: 'video/mp4', mode: 'worker' }, requestId: 1, type: 'SOURCE_OK' },
      { bytes: new Uint8Array(8), kind: 'media', requestId: 1, type: 'CHUNK' },
      { buffered: [{ end: 5, start: 0 }], received: 1024, requestId: 1, type: 'PROGRESS' },
      { kind: 'network', requestId: 1, type: 'ERROR' },
    ];

    for (const sample of samples) {
      expect(isWorkerToMainMessage(sample), sample.type).toBe(true);
    }
  });
});
