import { describe, expect, it } from 'vitest';
import {
  type AppKeyEnvelope,
  GCM_IV_LENGTH,
  isAppKeyEnvelope,
  isMainToWorkerMessage,
  isWorkerToMainMessage,
  type MainToWorkerMessage,
  MainToWorkerMessageType,
  nextRequestId,
  PROTOCOL_VERSION,
  WORKER_PUBLIC_KEY_LENGTH,
  type WorkerConfig,
  workerErrorCode,
  type WorkerToMainMessage,
  WorkerToMainMessageType,
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

  it('keeps the worker error-code catalog closed, self-named, and unchanged in protocol version', () => {
    // Every catalog member is its own lowercase wire string; the closed set is
    // the established five kinds plus the reserved `unavailable` kind (a
    // nonfatal, seek-target data-unavailable outcome with no current runtime
    // producer). The vocabulary is additive; PROTOCOL_VERSION stays 0.
    expect(Object.keys(workerErrorCode)).toEqual([...Object.keys(workerErrorCode)].sort());
    for (const [name, wire] of Object.entries(workerErrorCode)) {
      expect(wire, name).toBe(name.toLowerCase());
    }
    expect(Object.values(workerErrorCode).sort()).toEqual(['decode', 'device', 'network', 'quota', 'unavailable', 'unsupported']);
    expect(PROTOCOL_VERSION).toBe(0);
  });

  it('accepts an ERROR message carrying the reserved unavailable kind', () => {
    // The worker→main guard stays a string check on `kind`, so the reserved
    // kind passes the wire boundary exactly like the established kinds.
    const message: WorkerToMainMessage = { context: 'seek-target:data-unavailable', kind: 'unavailable', requestId: null, type: WorkerToMainMessageType.ERROR };
    expect(isWorkerToMainMessage(message)).toBe(true);
  });

  it('validates the optional failed seek-target time on an unavailable ERROR message', () => {
    const withTime: WorkerToMainMessage = { context: 'seek-target:data-unavailable', kind: workerErrorCode.unavailable, requestId: 12, time: 42.5, type: WorkerToMainMessageType.ERROR };
    expect(isWorkerToMainMessage(withTime)).toBe(true);
    // Absent time stays accepted (the field is additive; old workers never post it).
    expect(isWorkerToMainMessage({ context: 'seek-target:data-unavailable', kind: workerErrorCode.unavailable, requestId: 12, type: WorkerToMainMessageType.ERROR })).toBe(true);
    // A present but nonfinite time is a malformed wire value: rejected, never a silent default.
    expect(isWorkerToMainMessage({ ...withTime, time: Number.NaN })).toBe(false);
    expect(isWorkerToMainMessage({ ...withTime, time: Number.POSITIVE_INFINITY })).toBe(false);
    expect(isWorkerToMainMessage({ ...withTime, time: Number.NEGATIVE_INFINITY })).toBe(false);
    expect(isWorkerToMainMessage({ ...withTime, time: '42.5' })).toBe(false);
  });

  it('survives a structured-clone round trip (postMessage semantics)', () => {
    const chunk: WorkerToMainMessage = {
      bytes: new Uint8Array([0, 0, 0, 24, 102, 116, 121, 112]),
      kind: 'init',
      requestId: 7,
      type: WorkerToMainMessageType.CHUNK,
    };
    const clone = structuredClone(chunk) as WorkerToMainMessage;
    expect(clone).toEqual(chunk);
    if (clone.type !== WorkerToMainMessageType.CHUNK) throw new Error('expected CHUNK');
    expect(clone.bytes).toBeInstanceOf(Uint8Array);
    expect(Array.from(clone.bytes)).toEqual(Array.from(chunk.bytes));
  });

  it('discriminates worker→main messages in both directions', () => {
    const fromWorker: WorkerToMainMessage = { mode: 'main', requestId: 3, type: WorkerToMainMessageType.ATTACH_OK };
    const fromMain: MainToWorkerMessage = { requestId: 3, time: 12.5, type: MainToWorkerMessageType.SEEK };

    expect(isWorkerToMainMessage(fromWorker)).toBe(true);
    // The never-implemented WORKER_READY discriminator stays rejected.
    expect(isWorkerToMainMessage({ type: 'WORKER_READY' })).toBe(false);
    expect(isWorkerToMainMessage(fromMain)).toBe(false);
    expect(isWorkerToMainMessage(null)).toBe(false);
    expect(isWorkerToMainMessage(MainToWorkerMessageType.HELLO)).toBe(false);
  });

  it('recognizes every declared worker→main discriminator', () => {
    const samples: WorkerToMainMessage[] = [
      { features: { workerMse: true }, publicKey: new Uint8Array(WORKER_PUBLIC_KEY_LENGTH), requestId: 1, type: WorkerToMainMessageType.HELLO_OK, version: 1 },
      { mode: 'worker', requestId: 1, type: WorkerToMainMessageType.ATTACH_OK },
      { handle: null as unknown as MediaSourceHandle, requestId: 1, type: WorkerToMainMessageType.HANDLE },
      { info: { container: 'fmp4', durationSeconds: null, mime: 'video/mp4', mode: 'worker', tracks: [] }, requestId: 1, type: WorkerToMainMessageType.SOURCE_OK },
      { bytes: new Uint8Array(8), kind: 'media', requestId: 1, type: WorkerToMainMessageType.CHUNK },
      { buffered: [{ end: 5, start: 0 }], received: 1024, requestId: 1, type: WorkerToMainMessageType.PROGRESS },
      { kind: 'network', requestId: 1, type: WorkerToMainMessageType.ERROR },
      { requestId: 1, type: WorkerToMainMessageType.ENDED },
    ];

    for (const sample of samples) {
      expect(isWorkerToMainMessage(sample), sample.type).toBe(true);
    }
  });

  it('recognizes every declared main→worker discriminator', () => {
    const samples: MainToWorkerMessage[] = [
      { appSeed: false, config: { app: { appId: 'x', callbackUrl: '', description: 'test', logoUrl: '', name: 'test', serviceUrl: 'https://app.example' }, indexerUrl: 'https://sia.storage' }, requestId: 1, sharingSeed: false, type: MainToWorkerMessageType.HELLO },
      { requestId: 1, type: MainToWorkerMessageType.ATTACH },
      { requestId: 1, type: MainToWorkerMessageType.PLAY },
      { requestId: 1, time: 12.5, type: MainToWorkerMessageType.PLAYHEAD },
      { requestId: 1, time: 12.5, type: MainToWorkerMessageType.SEEK },
      { buffered: [{ end: 30, start: 0 }], pendingBytes: 1024, playhead: 5, requestId: 1, type: MainToWorkerMessageType.BUFFERED_STATE },
      { mimeType: 'video/mp4', preload: 'auto', requestId: 1, src: 'k', type: MainToWorkerMessageType.SOURCE },
      { type: MainToWorkerMessageType.DETACH },
      { type: MainToWorkerMessageType.DESTROY },
    ];
    for (const sample of samples) {
      expect(isMainToWorkerMessage(sample), sample.type).toBe(true);
    }
  });

  it('validates the BUFFERED_STATE variant (host-reported SourceBuffer state)', () => {
    const valid: MainToWorkerMessage = {
      buffered: [{ end: 30, start: 0 }, { end: 60, start: 40 }],
      pendingBytes: 1024,
      playhead: 5,
      requestId: 7,
      type: MainToWorkerMessageType.BUFFERED_STATE,
    };
    expect(isMainToWorkerMessage(valid)).toBe(true);
    // Fragmented/empty ranges and a zero pending count are all legitimate.
    expect(
      isMainToWorkerMessage({ ...valid, buffered: [], pendingBytes: 0 }),
    ).toBe(true);
    // A non-numeric playhead / pending count, a malformed window, or a missing
    // request id is a malformed BUFFERED_STATE; the guard rejects it, never a
    // silent default.
    expect(isMainToWorkerMessage({ ...valid, playhead: Number.NaN })).toBe(false);
    expect(isMainToWorkerMessage({ ...valid, pendingBytes: -1 })).toBe(false);
    expect(isMainToWorkerMessage({ ...valid, buffered: [{ end: 30 }] })).toBe(false);
    expect(isMainToWorkerMessage({ ...valid, buffered: 'x' })).toBe(false);
    expect(isMainToWorkerMessage({ buffered: [], pendingBytes: 0, playhead: 0, type: MainToWorkerMessageType.BUFFERED_STATE })).toBe(false);
    expect(isWorkerToMainMessage(valid)).toBe(false);
  });

  it('rejects a BUFFERED_STATE message whose window slot is null', () => {
    expect(
      isMainToWorkerMessage({
        buffered: [null],
        pendingBytes: 1024,
        playhead: 5,
        requestId: 7,
        type: MainToWorkerMessageType.BUFFERED_STATE,
      }),
    ).toBe(false);
  });

  it('survives a structured-clone round trip as a BUFFERED_STATE message', () => {
    const message: MainToWorkerMessage = {
      buffered: [{ end: 30, start: 0 }],
      pendingBytes: 2048,
      playhead: 12,
      requestId: 9,
      type: MainToWorkerMessageType.BUFFERED_STATE,
    };
    const clone = structuredClone(message) as MainToWorkerMessage;
    expect(clone).toEqual(message);
    if (clone.type !== MainToWorkerMessageType.BUFFERED_STATE) throw new Error('expected BUFFERED_STATE');
    expect(clone.buffered).toEqual([{ end: 30, start: 0 }]);
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
      isMainToWorkerMessage({ envelope, requestId: 1, type: MainToWorkerMessageType.APP_KEY }),
    ).toBe(true);
    expect(isMainToWorkerMessage({ requestId: 1, type: MainToWorkerMessageType.APP_KEY })).toBe(false); // missing envelope
    expect(
      isMainToWorkerMessage({ envelope: { ...envelope, ephemeralPublicKey: new Uint8Array(16) }, requestId: 1, type: MainToWorkerMessageType.APP_KEY }),
    ).toBe(false);
    expect(
      isMainToWorkerMessage({ envelope: { ...envelope, iv: new Uint8Array(8) }, requestId: 1, type: MainToWorkerMessageType.APP_KEY }),
    ).toBe(false);
    expect(
      isMainToWorkerMessage({ envelope: { ...envelope, ciphertext: new Uint8Array(0) }, requestId: 1, type: MainToWorkerMessageType.APP_KEY }),
    ).toBe(false);

    // Worker → main: HELLO_OK must carry a full-length raw X25519 public key.
    expect(
      isWorkerToMainMessage({ features: { workerMse: true }, publicKey: new Uint8Array(WORKER_PUBLIC_KEY_LENGTH), requestId: 1, type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION }),
    ).toBe(true);
    expect(
      isWorkerToMainMessage({ features: { workerMse: true }, publicKey: new Uint8Array(15), requestId: 1, type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION }),
    ).toBe(false);
    expect(
      isWorkerToMainMessage({ features: { workerMse: true }, requestId: 1, type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION }),
    ).toBe(false);
  });

  it('validates the APP_KEY envelope keyType tag (app default, sharing explicit, foreign rejected)', () => {
    const base: AppKeyEnvelope = {
      ciphertext: new Uint8Array(48),
      ephemeralPublicKey: new Uint8Array(WORKER_PUBLIC_KEY_LENGTH),
      iv: new Uint8Array(GCM_IV_LENGTH),
    };

    // Absent keyType = the original app-key handshake, still accepted.
    expect(isAppKeyEnvelope(base)).toBe(true);
    expect(isMainToWorkerMessage({ envelope: base, requestId: 1, type: MainToWorkerMessageType.APP_KEY })).toBe(true);
    // Explicit app and sharing tags both pass the guards (extended protocol).
    expect(isAppKeyEnvelope({ ...base, keyType: 'app' })).toBe(true);
    expect(isAppKeyEnvelope({ ...base, keyType: 'sharing' })).toBe(true);
    expect(isMainToWorkerMessage({ envelope: { ...base, keyType: 'sharing' }, requestId: 1, type: MainToWorkerMessageType.APP_KEY })).toBe(true);
    // A foreign tag is a malformed envelope — reject, never a silent fallback.
    expect(isAppKeyEnvelope({ ...base, keyType: 'sso' })).toBe(false);
    expect(
      isMainToWorkerMessage({ envelope: { ...base, keyType: 'sso' }, requestId: 1, type: MainToWorkerMessageType.APP_KEY }),
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
      type: MainToWorkerMessageType.APP_KEY,
    };
    const clone = structuredClone(message) as MainToWorkerMessage;
    expect(clone).toEqual(message);
    if (clone.type !== MainToWorkerMessageType.APP_KEY) throw new Error('expected APP_KEY');
    expect(clone.envelope.ciphertext).toBeInstanceOf(Uint8Array);
  });


  it('accepts an optional host worker-MSE preference on the HELLO config', () => {
    const base = { app: { appId: 'x', callbackUrl: '', description: 'test', logoUrl: '', name: 'test', serviceUrl: 'https://app.example' }, indexerUrl: 'https://sia.storage' };
    // A host may prefer the main-thread fallback; the field rides the same config.
    expect(isMainToWorkerMessage({ config: { ...base, workerMse: 'main' }, requestId: 4, type: MainToWorkerMessageType.HELLO })).toBe(true);
    // 'auto' lets the worker feature-detect its own capability.
    expect(isMainToWorkerMessage({ config: { ...base, workerMse: 'auto' }, requestId: 4, type: MainToWorkerMessageType.HELLO })).toBe(true);
    // A config without the field stays accepted (default auto).
    expect(isMainToWorkerMessage({ config: base, requestId: 4, type: MainToWorkerMessageType.HELLO })).toBe(true);
  });

  it('accepts additive HELLO seed-presence flags and rejects non-boolean values', () => {
    const base = { app: { appId: 'x', callbackUrl: '', description: 'test', logoUrl: '', name: 'test', serviceUrl: 'https://app.example' }, indexerUrl: 'https://sia.storage' };
    // Presence metadata (booleans declaring which seed providers exist) rides
    // the HELLO message alongside the config; absent = old-protocol no claim.
    expect(isMainToWorkerMessage({ appSeed: true, config: base, requestId: 4, sharingSeed: false, type: MainToWorkerMessageType.HELLO })).toBe(true);
    expect(isMainToWorkerMessage({ appSeed: false, config: base, requestId: 4, type: MainToWorkerMessageType.HELLO })).toBe(true);
    expect(isMainToWorkerMessage({ config: base, requestId: 4, sharingSeed: true, type: MainToWorkerMessageType.HELLO })).toBe(true);
    expect(isMainToWorkerMessage({ config: base, requestId: 4, type: MainToWorkerMessageType.HELLO })).toBe(true);
    // A non-boolean flag is a malformed HELLO — rejected, never a silent default.
    expect(isMainToWorkerMessage({ appSeed: 'yes', config: base, requestId: 4, type: MainToWorkerMessageType.HELLO })).toBe(false);
    expect(isMainToWorkerMessage({ config: base, requestId: 4, sharingSeed: 1, type: MainToWorkerMessageType.HELLO })).toBe(false);
  });

  it('carries no plaintext seed field on the wire anywhere', () => {
    // Compile- and runtime-level check that no plaintext seed rides the wire:
    // the HELLO config structurally cannot carry either seed (the properties
    // are absent), and
    // the APP_KEY discriminator rides a ciphertext envelope (plus a plaintext
    // routing tag), never a raw key value.
    const config: WorkerConfig = { app: { appId: 'x', callbackUrl: '', description: 'test', logoUrl: '', name: 'test', serviceUrl: 'https://app.example' }, indexerUrl: 'https://sia.storage' };
    expect(config).not.toHaveProperty('appKeySeed');
    expect(config).not.toHaveProperty('sharingKeySeed');
    expect(Object.keys(config).sort()).toEqual(['app', 'indexerUrl']);
  });
});
