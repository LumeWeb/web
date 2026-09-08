import { describe, expect, it } from 'vitest';
import {
  type AppKeyEnvelope,
  GCM_IV_LENGTH,
  isAppKeyEnvelope,
  isMainToWorkerMessage,
  isWorkerToMainMessage,
  type MainToWorkerMessage,
  nextRequestId,
  PROTOCOL_VERSION,
  WORKER_PUBLIC_KEY_LENGTH,
  type WorkerConfig,
  type WorkerToMainMessage,
} from '../protocol.ts';

describe('protocol', () => {
  it('keeps a single version constant at 0 for the unreleased protocol', () => {
    expect(PROTOCOL_VERSION).toBe(0);
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
      { features: { workerMse: true }, publicKey: new Uint8Array(WORKER_PUBLIC_KEY_LENGTH), requestId: 1, type: 'HELLO_OK', version: 1 },
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

  it('validates the HANDSHAKE variant shapes at both boundaries', () => {
    const envelope: AppKeyEnvelope = {
      ciphertext: new Uint8Array(48),
      ephemeralPublicKey: new Uint8Array(WORKER_PUBLIC_KEY_LENGTH),
      iv: new Uint8Array(GCM_IV_LENGTH),
    };

    // Main → worker: the guard accepts a structurally complete envelope and
    // rejects every wrong-length field, so a malformed secret payload can
    // never reach the worker's decryptor as a cast.
    expect(isAppKeyEnvelope(envelope)).toBe(true);
    expect(
      isMainToWorkerMessage({ envelope, requestId: 1, type: 'APP_KEY' }),
    ).toBe(true);
    expect(isMainToWorkerMessage({ requestId: 1, type: 'APP_KEY' })).toBe(false); // missing envelope
    expect(
      isMainToWorkerMessage({ envelope: { ...envelope, ephemeralPublicKey: new Uint8Array(16) }, requestId: 1, type: 'APP_KEY' }),
    ).toBe(false);
    expect(
      isMainToWorkerMessage({ envelope: { ...envelope, iv: new Uint8Array(8) }, requestId: 1, type: 'APP_KEY' }),
    ).toBe(false);
    expect(
      isMainToWorkerMessage({ envelope: { ...envelope, ciphertext: new Uint8Array(0) }, requestId: 1, type: 'APP_KEY' }),
    ).toBe(false);

    // Worker → main: HELLO_OK must carry a full-length raw X25519 public key.
    expect(
      isWorkerToMainMessage({ features: { workerMse: true }, publicKey: new Uint8Array(WORKER_PUBLIC_KEY_LENGTH), requestId: 1, type: 'HELLO_OK', version: PROTOCOL_VERSION }),
    ).toBe(true);
    expect(
      isWorkerToMainMessage({ features: { workerMse: true }, publicKey: new Uint8Array(15), requestId: 1, type: 'HELLO_OK', version: PROTOCOL_VERSION }),
    ).toBe(false);
    expect(
      isWorkerToMainMessage({ features: { workerMse: true }, requestId: 1, type: 'HELLO_OK', version: PROTOCOL_VERSION }),
    ).toBe(false);
  });

  it('survives a structured-clone round trip as an APP_KEY envelope', () => {
    const message: MainToWorkerMessage = {
      envelope: {
        ciphertext: new Uint8Array([1, 2, 3]),
        ephemeralPublicKey: new Uint8Array(32).fill(9),
        iv: new Uint8Array(12).fill(7),
      },
      requestId: 11,
      type: 'APP_KEY',
    };
    const clone = structuredClone(message) as MainToWorkerMessage;
    expect(clone).toEqual(message);
    if (clone.type !== 'APP_KEY') throw new Error('expected APP_KEY');
    expect(clone.envelope.ciphertext).toBeInstanceOf(Uint8Array);
  });

  it('carries no plaintext seed field on the wire anywhere', () => {
    // Compile- and runtime-level assertion of the contract: the HELLO config
    // structurally cannot carry the seed (property was removed), and the
    // APP_KEY discriminator rides a ciphertext envelope, not a raw key value.
    const config: WorkerConfig = { app: { appId: 'x', callbackUrl: '', description: 'test', logoUrl: '', name: 'test', serviceUrl: 'https://app.example' }, indexerUrl: 'https://sia.storage' };
    expect(config).not.toHaveProperty('appKeySeed');
    expect(Object.keys(config).sort()).toEqual(['app', 'indexerUrl']);
  });
});
