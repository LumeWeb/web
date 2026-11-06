/**
 * Keyless share-link streaming (ADR 0008): the `APP_KEY` envelope `keyType`
 * extension and the worker's `SharedSdk` resolution order.
 *
 * This spec is purely node-runnable: the SDK binding (`createDefaultSdk`) is
 * exercised over a mocked `@siafoundation/sia-storage` — never the real WASM —
 * and the session handshake routing is exercised through
 * `createSessionHandshake` directly.
 *
 * Covered:
 * - `encryptToWorker(…, 'sharing')` tags the envelope; the default stays
 *   untagged (backward compatible with the original app-key handshake).
 * - `createSessionHandshake` routes an envelope's decrypted seed into the
 *   `seed` (app) or `sharingSeed` slot by `keyType`, and scrubs both on a
 *   config change / dispose.
 * - `createDefaultSdk` resolution order: sharing seed → `SharedSdk.connect`
 *   with (indexerUrl, hex seed), share src routed through `SharedSdk.object`
 *   (by `objectKey`, not the URL); app-key seed alone → `Builder.connected`
 *   path with `objectFromShareUrl` untouched; neither → descriptive error.
 *   With BOTH seeds the dual route is lazy per SDK — each credential connects
 *   only on its route's first resolution (never eagerly at `createDefaultSdk`),
 *   failed connects are retryable (never cached), and dispose releases only
 *   the SDKs actually created.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  decryptAppKeyEnvelope,
  encryptToWorker,
  exportWorkerPublicKey,
  generateWorkerKeyPair,
  type WorkerKeyPair,
} from '../app-key-handshake.ts';
import { parseSiaShareUrl } from '../share-url.ts';
import { createSessionHandshake } from '../session/session-coordinator.ts';
import { MainToWorkerMessageType, type WorkerConfig, type WorkerToMainMessage, WorkerToMainMessageType } from '../protocol.ts';
import { createSiaWorkerComposition } from '../session/sia-composition.ts';
import type { SiaVideoSdk } from '../worker-runtime.ts';
import { createDefaultSdk } from '../worker-runtime.ts';
import { FakeLoadPipeline, flush, permissiveCapabilities, shareSrc } from './fixtures/fmp4-fixture.ts';

/** Recorded side effects of the mocked sia-storage SDK, captured per test. */
const mocks = vi.hoisted(() => ({
  appConnectResultOverride: undefined as null | undefined,
  appFreeCalls: 0,
  appKeyCtorSeeds: [] as Uint8Array[],
  appKeyCtorValues: [] as number[][],
  appSdkDownloadCalls: 0,
  appSdkObjectCalls: [] as string[],
  appSdkShareFormCalls: [] as string[],
  builderConnectedCalls: [] as unknown[],
  builderCtorCalls: [] as unknown[],
  initPending: undefined as Promise<void> | undefined,
  sharedConnectCalls: [] as [string, string][],
  sharedConnectResultOverride: undefined as null | undefined,
  sharedDownloadCalls: 0,
  sharedFreeCalls: 0,
  sharedObjectCalls: [] as string[],
}));

// A node-runnable fake `@siafoundation/sia-storage` (the real WASM SDK stays
// out of these tests). `SharedSdk.connect` records its (indexerUrl, hex-seed)
// arguments; `SharedSdk.object(id)` records the id `createSdk` routes share
// URLs through; `Builder.connected` + `AppKey` stand in for the app-key path; the
// `free` hooks count how many times each WASM object is released (the real
// SDK aliases [Symbol.dispose] to free(), and `withDisposal` latches it). All
// recorded through `vi.hoisted` so assertions read fresh per test.
vi.mock('@siafoundation/sia-storage', () => {
  const fakeObject = () => ({ id: () => 'obj', size: () => 24, slabs: () => [] });
  class SharedSdk {
    static connect = vi.fn((indexerUrl: string, seed: string) => {
      mocks.sharedConnectCalls.push([indexerUrl, seed]);
      // Non-promise returns are awaited by callers; no `async` needed because
      // nothing here awaits (keeps oxlint require-await quiet). A test override
      // lets a caller simulate an indexer that does not know the sharing key.
      if (mocks.sharedConnectResultOverride === null) return null;
      return new SharedSdk();
    });
    download = () => {
      mocks.sharedDownloadCalls += 1;
      return new ReadableStream<Uint8Array>({ start: (controller) => controller.close() });
    };
    free = () => {
      mocks.sharedFreeCalls += 1;
    };
    object = (id: string) => {
      mocks.sharedObjectCalls.push(id);
      return fakeObject();
    };
  }
  class Builder {
    connected = vi.fn((appKey: unknown) => {
      mocks.builderConnectedCalls.push(appKey);
      if (mocks.appConnectResultOverride === null) return null;
      return {
        download: () => {
          mocks.appSdkDownloadCalls += 1;
          return new ReadableStream<Uint8Array>({ start: (controller) => controller.close() });
        },
        free: () => {
          mocks.appFreeCalls += 1;
        },
        object: (key: string) => {
          mocks.appSdkObjectCalls.push(key);
          return fakeObject();
        },
        objectFromShareUrl: (fetchForm: string) => {
          mocks.appSdkShareFormCalls.push(fetchForm);
          return fakeObject();
        },
      };
    });
    constructor(indexerUrl: string, app: unknown) {
      mocks.builderCtorCalls.push([indexerUrl, app]);
    }
  }
  class AppKey {
    constructor(seed: Uint8Array) {
      mocks.appKeyCtorSeeds.push(seed);
      mocks.appKeyCtorValues.push(Array.from(seed));
    }
  }
  return { AppKey, Builder, initSia: () => mocks.initPending, SharedSdk };
});

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

/** Lowercase hex encoding (same as the worker-runtime bytesToHex helper). */
function bytesToHex(bytes: Uint8Array): string {
  let hex = '';
  for (const byte of bytes) hex += byte.toString(16).padStart(2, '0');
  return hex;
}

function resetMocks(): void {
  mocks.initPending = undefined;
  mocks.appConnectResultOverride = undefined;
  mocks.appFreeCalls = 0;
  mocks.appKeyCtorSeeds.length = 0;
  mocks.appKeyCtorValues.length = 0;
  mocks.appSdkDownloadCalls = 0;
  mocks.appSdkObjectCalls.length = 0;
  mocks.appSdkShareFormCalls.length = 0;
  mocks.builderConnectedCalls.length = 0;
  mocks.builderCtorCalls.length = 0;
  mocks.sharedConnectCalls.length = 0;
  mocks.sharedConnectResultOverride = undefined;
  mocks.sharedDownloadCalls = 0;
  mocks.sharedFreeCalls = 0;
  mocks.sharedObjectCalls.length = 0;
}

function workerKeyWithPublicKey(): { keyPair: WorkerKeyPair; publicKey: Uint8Array; } {
  const keyPair = generateWorkerKeyPair();
  return { keyPair, publicKey: exportWorkerPublicKey(keyPair) };
}

// ---- envelope keyType round trip --------------------------------------------

describe('APP_KEY envelope keyType (app default, sharing explicit)', () => {
  it("encrypts 'sharing' tags onto the envelope and defaults an untagged envelope to the app slot", async () => {
    const { keyPair, publicKey } = workerKeyWithPublicKey();
    const sharingSeed = new Uint8Array(32).fill(8);
    const appSeed = new Uint8Array(32).fill(9);

    const sharingEnvelope = await encryptToWorker(publicKey, sharingSeed, 'sharing');
    const appEnvelope = await encryptToWorker(publicKey, appSeed);

    // Explicit sharing: the tag rides the envelope ciphertext container.
    expect(sharingEnvelope.keyType).toBe('sharing');
    // Untagged = the original app-key handshake (backward compatible).
    expect(appEnvelope.keyType).toBeUndefined();

    // AEAD machinery is untouched: both decrypt to their seeds in the worker.
    expect(Array.from(await decryptAppKeyEnvelope(keyPair, sharingEnvelope))).toEqual(Array.from(sharingSeed));
    expect(Array.from(await decryptAppKeyEnvelope(keyPair, appEnvelope))).toEqual(Array.from(appSeed));
  });
});

// ---- session handshake routing -----------------------------------------------

describe('createSessionHandshake keyType routing', () => {
  it('routes a sharing envelope into sharingSeed and an app envelope into seed, independently', async () => {
    const handshake = createSessionHandshake();
    // hello() mints the handshake's own memoized worker key pair and returns
    // its public half — the only public key its acceptAppKey can decrypt to.
    const { publicKey } = handshake.hello(1, WORKER_CONFIG);

    const sharingSeed = new Uint8Array(32).fill(11);
    const appSeed = new Uint8Array(32).fill(12);
    await handshake.acceptAppKey(await encryptToWorker(publicKey, sharingSeed, 'sharing'));
    await handshake.acceptAppKey(await encryptToWorker(publicKey, appSeed)); // keyType default 'app'

    expect(handshake.sharingSeed).toEqual(sharingSeed);
    expect(handshake.seed).toEqual(appSeed);
  });

  it('keeps the sharing seed immune to a fresh app-key envelope and vice versa', async () => {
    const handshake = createSessionHandshake();
    const { publicKey } = handshake.hello(1, WORKER_CONFIG);

    const sharingSeed = new Uint8Array(32).fill(21);
    const appSeed = new Uint8Array(32).fill(22);
    await handshake.acceptAppKey(await encryptToWorker(publicKey, sharingSeed, 'sharing'));
    // A second sharing envelope with DIFFERENT bytes replaces only sharingSeed.
    const newSharing = new Uint8Array(32).fill(23);
    await handshake.acceptAppKey(await encryptToWorker(publicKey, newSharing, 'sharing'));
    expect(handshake.sharingSeed).toEqual(newSharing);
    // The app slot stays untouched (still null until an app envelope arrives).
    expect(handshake.seed).toBeNull();

    await handshake.acceptAppKey(await encryptToWorker(publicKey, appSeed));
    expect(handshake.seed).toEqual(appSeed);
    expect(handshake.sharingSeed).toEqual(newSharing);
  });

  it('scrubs both seeds on a HELLO config change and on dispose', async () => {
    const handshake = createSessionHandshake();
    const { publicKey } = handshake.hello(1, WORKER_CONFIG);
    await handshake.acceptAppKey(await encryptToWorker(publicKey, new Uint8Array(32).fill(31), 'sharing'));
    await handshake.acceptAppKey(await encryptToWorker(publicKey, new Uint8Array(32).fill(32)));

    // A changed indexer invalidates the connection: both credentials drop.
    handshake.hello(2, { ...WORKER_CONFIG, indexerUrl: 'https://other.example' });
    expect(handshake.seed).toBeNull();
    expect(handshake.sharingSeed).toBeNull();

    // Re-arm then dispose: dispose also scrubs both.
    handshake.hello(3, WORKER_CONFIG);
    await handshake.acceptAppKey(await encryptToWorker(publicKey, new Uint8Array(32).fill(33), 'sharing'));
    expect(handshake.sharingSeed).not.toBeNull();
    handshake.dispose?.();
    expect(handshake.sharingSeed).toBeNull();
    expect(handshake.seed).toBeNull();
  });
});

// ---- createDefaultSdk resolution order ---------------------------------------

describe('createDefaultSdk (worker SDK resolution)', () => {
  afterEach(() => {
    resetMocks();
  });

  it.each([
    ['app', false], ['sharing', false], ['app', true], ['sharing', true],
  ] as const)('reads the original %s bytes after initSia pauses across credential replacement (return=%s)', async (keyType, returnToOriginal) => {
    let finishInit!: () => void;
    mocks.initPending = new Promise<void>((resolve) => { finishInit = resolve; });
    const handshake = createSessionHandshake();
    const messages: WorkerToMainMessage[] = [];
    const inputs: (null | Uint8Array)[] = [];
    const coordinator = createSiaWorkerComposition({
      capabilities: permissiveCapabilities(),
      createSdk: (config, app, sharing) => {
        inputs.push(keyType === 'app' ? app : sharing);
        return createDefaultSdk(config, app, sharing);
      },
      handshake,
      loadPipeline: new FakeLoadPipeline(),
      post: (message) => messages.push(message),
      supportsWorkerMse: () => false,
    });
    await coordinator.handleMessage({ config: WORKER_CONFIG, requestId: 1, type: MainToWorkerMessageType.HELLO });
    const hello = messages.find((message) => message.type === WorkerToMainMessageType.HELLO_OK);
    if (hello?.type !== WorkerToMainMessageType.HELLO_OK) throw new Error('Missing HELLO_OK');
    const key = async (value: number) => coordinator.handleMessage({
      envelope: await encryptToWorker(hello.publicKey, new Uint8Array<number>(32).fill(value), keyType),
      requestId: 2, type: MainToWorkerMessageType.APP_KEY,
    });
    const source = (requestId: number) => coordinator.handleMessage({
      preload: 'auto', requestId, src: keyType === 'app' ? 'pinned' : shareSrc(), type: MainToWorkerMessageType.SOURCE,
    });
    await key(9);
    const originalHandshakeBytes = keyType === 'app' ? handshake.seed : handshake.sharingSeed;
    const first = source(3);
    await flush();
    await key(4);
    if (returnToOriginal) await key(9);
    const second = source(4);
    await flush();
    expect(inputs[0]).not.toBe(originalHandshakeBytes);
    expect(Array.from(originalHandshakeBytes!)).toEqual(Array(32).fill(0));
    expect(Array.from(inputs[0]!)).toEqual(Array(32).fill(9));
    finishInit();
    await Promise.all([first, second]);
    const expected = returnToOriginal ? [9] : [9, 4];
    if (keyType === 'app') {
      expect(mocks.appKeyCtorValues).toEqual(expected.map((value) => Array<number>(32).fill(value)));
    } else {
      expect(mocks.sharedConnectCalls.map((call) => call[1])).toEqual(expected.map((value) => value === 9 ? '09'.repeat(32) : '04'.repeat(32)));
    }
    expect(inputs.every((seed) => seed!.every((byte) => byte === 0))).toBe(true);
    coordinator.destroy();
  });

  it('keeps the original dual sharing credential for late use after replacement during initSia', async () => {
    let finishInit!: () => void;
    mocks.initPending = new Promise<void>((resolve) => { finishInit = resolve; });
    const messages: WorkerToMainMessage[] = [];
    let built!: SiaVideoSdk;
    let inputSharing!: Uint8Array;
    const coordinator = createSiaWorkerComposition({
      capabilities: permissiveCapabilities(),
      createSdk: async (config, app, sharing) => {
        inputSharing = sharing!;
        built = await createDefaultSdk(config, app, sharing);
        return built;
      },
      loadPipeline: new FakeLoadPipeline(),
      post: (message) => messages.push(message),
      supportsWorkerMse: () => false,
    });
    await coordinator.handleMessage({ config: WORKER_CONFIG, requestId: 1, type: MainToWorkerMessageType.HELLO });
    const hello = messages.find((message) => message.type === WorkerToMainMessageType.HELLO_OK);
    if (hello?.type !== WorkerToMainMessageType.HELLO_OK) throw new Error('Missing HELLO_OK');
    const key = async (value: number, keyType: 'app' | 'sharing') => coordinator.handleMessage({
      envelope: await encryptToWorker(hello.publicKey, new Uint8Array(32).fill(value), keyType),
      requestId: 2, type: MainToWorkerMessageType.APP_KEY,
    });
    await key(9, 'app');
    await key(4, 'sharing');
    const source = coordinator.handleMessage({ preload: 'auto', requestId: 3, src: 'pinned', type: MainToWorkerMessageType.SOURCE });
    await flush();
    await key(6, 'sharing');
    finishInit();
    await source;
    expect(Array.from(inputSharing)).toEqual(Array(32).fill(0));
    expect(mocks.appKeyCtorValues).toEqual([Array(32).fill(9)]);
    expect(mocks.sharedConnectCalls).toEqual([]);
    await built.objectFromSharedKey!('late');
    expect(mocks.sharedConnectCalls).toEqual([[WORKER_CONFIG.indexerUrl, '04'.repeat(32)]]);
    await built.dispose?.();
    coordinator.destroy();
  });

  it.each([false, true])('coordinator destruction scrubs unused dual credentials with initSia pending=%s', async (pendingInit) => {
    let finishInit!: () => void;
    if (pendingInit) mocks.initPending = new Promise<void>((resolve) => { finishInit = resolve; });
    const handshake = createSessionHandshake();
    const messages: WorkerToMainMessage[] = [];
    const buildInputs: Uint8Array[] = [];
    let built!: SiaVideoSdk;
    const coordinator = createSiaWorkerComposition({
      capabilities: permissiveCapabilities(),
      createSdk: async (config, app, sharing) => {
        buildInputs.push(app!, sharing!);
        built = await createDefaultSdk(config, app, sharing);
        return built;
      },
      handshake,
      loadPipeline: new FakeLoadPipeline(),
      post: (message) => messages.push(message),
      supportsWorkerMse: () => false,
    });
    await coordinator.handleMessage({ config: WORKER_CONFIG, requestId: 1, type: MainToWorkerMessageType.HELLO });
    const hello = messages.find((message) => message.type === WorkerToMainMessageType.HELLO_OK);
    if (hello?.type !== WorkerToMainMessageType.HELLO_OK) throw new Error('Missing HELLO_OK');
    for (const [keyType, value] of [['app', 9], ['sharing', 4]] as const) {
      await coordinator.handleMessage({
        envelope: await encryptToWorker(hello.publicKey, new Uint8Array(32).fill(value), keyType),
        requestId: 2, type: MainToWorkerMessageType.APP_KEY,
      });
    }
    const handshakeInputs = [handshake.seed, handshake.sharingSeed];
    const source = coordinator.handleMessage({ preload: 'auto', requestId: 3, src: 'pinned', type: MainToWorkerMessageType.SOURCE });
    if (pendingInit) await flush();
    else await source;
    expect(buildInputs).toHaveLength(2);
    expect(mocks.appKeyCtorValues).toEqual(pendingInit ? [] : [Array(32).fill(9)]);
    expect(mocks.sharedConnectCalls).toEqual([]);

    const scrubbed: { before: number[]; bytes: Uint8Array }[] = [];
    const fill = Reflect.get(Uint8Array.prototype, 'fill');
    const spy = vi.spyOn(Uint8Array.prototype, 'fill').mockImplementation(function (this: Uint8Array, value, start, end) {
      // Exclude handshake and factory buffers so only SDK-owned copies prove cleanup.
      if (value === 0 && !handshakeInputs.includes(this) && !buildInputs.includes(this)) {
        scrubbed.push({ before: Array.from(this), bytes: this });
      }
      return fill.call(this, value, start, end);
    });
    try {
      coordinator.destroy();
      if (pendingInit) finishInit();
      await source;
      await flush();
      expect(scrubbed.map((entry) => entry.before)).toEqual(
        pendingInit ? [Array(32).fill(9), Array(32).fill(4)] : [Array(32).fill(0), Array(32).fill(4)],
      );
      expect(scrubbed.every((entry) => entry.bytes.every((byte) => byte === 0))).toBe(true);
      expect(buildInputs.every((bytes) => bytes.every((byte) => byte === 0))).toBe(true);
      expect(mocks.appKeyCtorValues).toEqual(pendingInit ? [] : [Array(32).fill(9)]);
      expect(mocks.appFreeCalls).toBe(pendingInit ? 0 : 1);
      expect(mocks.sharedConnectCalls).toEqual([]);
      expect(mocks.sharedFreeCalls).toBe(0);
      if (pendingInit) await expect(built.object('after-destroy')).rejects.toThrow('disposed');
      await expect(built.objectFromSharedKey!('after-destroy')).rejects.toThrow('disposed');
    } finally {
      spy.mockRestore();
      coordinator.destroy();
    }
  });

  it('scrubs failed app connection arguments while retaining credentials for retry', async () => {
    const sdk = await createDefaultSdk(WORKER_CONFIG, new Uint8Array(32).fill(9), new Uint8Array(32).fill(4));
    mocks.appConnectResultOverride = null;
    await expect(sdk.object('pinned')).rejects.toThrow('not registered');
    expect(Array.from(mocks.appKeyCtorSeeds[0])).toEqual(Array(32).fill(0));
    mocks.appConnectResultOverride = undefined;
    await sdk.object('pinned');
    expect(mocks.appKeyCtorValues).toEqual([Array(32).fill(9), Array(32).fill(9)]);
    expect(Array.from(mocks.appKeyCtorSeeds[1])).toEqual(Array(32).fill(0));
    await sdk.dispose?.();
  });

  it('scrubs both unused route credentials on disposal without connecting', async () => {
    const sdk = await createDefaultSdk(WORKER_CONFIG, new Uint8Array(32).fill(9), new Uint8Array(32).fill(4));
    const scrubbed: { before: number[]; bytes: Uint8Array }[] = [];
    const fill = Reflect.get(Uint8Array.prototype, 'fill');
    const spy = vi.spyOn(Uint8Array.prototype, 'fill').mockImplementation(function (this: Uint8Array, value, start, end) {
      scrubbed.push({ before: Array.from(this), bytes: this });
      return fill.call(this, value, start, end);
    });
    try {
      await sdk.dispose?.();
      expect(scrubbed.map((entry) => entry.before)).toEqual([Array(32).fill(9), Array(32).fill(4)]);
      expect(scrubbed.every((entry) => entry.bytes.every((byte) => byte === 0))).toBe(true);
      expect(mocks.builderConnectedCalls).toEqual([]);
      expect(mocks.sharedConnectCalls).toEqual([]);
      await expect(sdk.object('unused')).rejects.toThrow('disposed');
    } finally {
      spy.mockRestore();
    }
  });

  it('keeps lazy routes authenticated after factory input bytes are scrubbed', async () => {
    const app = new Uint8Array(32).fill(9);
    const sharing = new Uint8Array(32).fill(4);
    const sdk = await createDefaultSdk(WORKER_CONFIG, app, sharing);
    app.fill(0);
    sharing.fill(0);
    expect(mocks.builderConnectedCalls).toEqual([]);
    expect(mocks.sharedConnectCalls).toEqual([]);
    await sdk.object('pinned');
    expect(mocks.appKeyCtorValues[0]).toEqual(Array(32).fill(9));
    expect(Array.from(mocks.appKeyCtorSeeds[0])).toEqual(Array(32).fill(0));
    mocks.sharedConnectResultOverride = null;
    await expect(sdk.objectFromSharedKey!('shared')).rejects.toThrow();
    mocks.sharedConnectResultOverride = undefined;
    await sdk.objectFromSharedKey!('shared');
    expect(mocks.sharedConnectCalls.map((call) => call[1])).toEqual(['04'.repeat(32), '04'.repeat(32)]);
    await sdk.dispose?.();
  });

  it('connects via SharedSdk.connect(indexerUrl, hex seed) and routes a share URL through SharedSdk.object(objectKey)', async () => {
    const sharingSeed = new Uint8Array(32).fill(0x3c);
    const sdk = await createDefaultSdk(WORKER_CONFIG, null, sharingSeed);

    // The sharing path never touches the app-key Builder/AppKey registration.
    expect(mocks.builderCtorCalls).toEqual([]);
    expect(mocks.appKeyCtorSeeds).toEqual([]);
    // SharedSdk.connect received the indexer URL and the hex string form the
    // browser WASM expects — never the raw bytes, never the URL.
    expect(mocks.sharedConnectCalls).toEqual([[WORKER_CONFIG.indexerUrl, bytesToHex(sharingSeed)]]);

    // A share src is routed through SharedSdk.object by its 64-hex objectKey:
    // parseSiaShareUrl(fetchForm).objectKey — never the full URL string.
    const src = shareSrc();
    const parsed = parseSiaShareUrl(src);
    const resolved = await sdk.objectFromShareUrl?.(parsed.fetchForm);
    expect(resolved).toBeDefined();
    expect(mocks.sharedObjectCalls).toEqual([parsed.objectKey]);
    expect(parsed.objectKey.length).toBe(64);
  });

  it('routes a plain object key through SharedSdk.object(id)', async () => {
    const sdk = await createDefaultSdk(WORKER_CONFIG, null, new Uint8Array(32).fill(0x41));
    await sdk.object('pinned-key');
    expect(mocks.sharedObjectCalls).toEqual(['pinned-key']);
    expect(mocks.appSdkObjectCalls).toEqual([]);
  });

  it('connects no SDK eagerly when both seeds are present (createDefaultSdk resolves with zero connects)', async () => {
    const sdk = await createDefaultSdk(WORKER_CONFIG, new Uint8Array(32).fill(0x51), new Uint8Array(32).fill(0x52));

    // The dual path is now lazy per route: creating the surface connects no
    // SDK at all. The app-key Builder/connected path and the SharedSdk connect
    // are untouched until a source of that kind first resolves.
    expect(mocks.sharedConnectCalls).toEqual([]);
    expect(mocks.builderCtorCalls).toEqual([]);
    expect(mocks.builderConnectedCalls).toEqual([]);
    expect(mocks.appKeyCtorSeeds).toEqual([]);
    void sdk;
  });

  it('routes pinned keys via the app SDK and share URLs via the SharedSdk, connecting each SDK on first route use', async () => {
    const appKeySeed = new Uint8Array(32).fill(0x51);
    const sharingSeed = new Uint8Array(32).fill(0x52);
    const sdk = await createDefaultSdk(WORKER_CONFIG, appKeySeed, sharingSeed);

    // A plain pinned object key resolves through the APP-key SDK's object(),
    // never the sharing path (previously it fell through SharedSdk.object and
    // failed for objects not attached to the sharing key). This first use is
    // what connects the app-key route.
    await sdk.object('pinned-key');
    expect(mocks.builderCtorCalls).toHaveLength(1);
    expect(mocks.appKeyCtorSeeds).toHaveLength(1);
    expect(mocks.appSdkObjectCalls).toEqual(['pinned-key']);
    expect(mocks.sharedObjectCalls).toEqual([]);
    expect(mocks.sharedConnectCalls).toEqual([]);

    // A share URL resolves through the keyless SharedSdk, by objectKey; this
    // first use connects the sharing route with the indexer URL + hex seed.
    const src = shareSrc();
    const parsed = parseSiaShareUrl(src);
    await sdk.objectFromShareUrl?.(parsed.fetchForm);
    expect(mocks.sharedConnectCalls).toEqual([[WORKER_CONFIG.indexerUrl, bytesToHex(sharingSeed)]]);
    expect(mocks.sharedObjectCalls).toEqual([parsed.objectKey]);
    expect(mocks.appSdkShareFormCalls).toEqual([]);

    // Disposal releases BOTH SDKs exactly once, and once only across the
    // dispose() and [Symbol.dispose] entry points (the release-once latch).
    await sdk.dispose?.();
    const surface = sdk as unknown as Record<string | symbol, unknown>;
    void (surface[Symbol.dispose] as () => void)();
    expect(mocks.appFreeCalls).toBe(1);
    expect(mocks.sharedFreeCalls).toBe(1);
  });

  it('connects the app-key SDK once on first pinned-object resolution and reuses it', async () => {
    const sdk = await createDefaultSdk(WORKER_CONFIG, new Uint8Array(32).fill(0x51), new Uint8Array(32).fill(0x52));

    await sdk.object('pinned-key');
    await sdk.object('pinned-key-2');

    // Exactly one Builder construction/connect for the whole app route; the
    // sharing route was never touched.
    expect(mocks.builderCtorCalls).toHaveLength(1);
    expect(mocks.builderConnectedCalls).toHaveLength(1);
    expect(mocks.appKeyCtorSeeds).toHaveLength(1);
    expect(mocks.appSdkObjectCalls).toEqual(['pinned-key', 'pinned-key-2']);
    expect(mocks.sharedConnectCalls).toEqual([]);
    expect(mocks.sharedObjectCalls).toEqual([]);
  });

  it('connects the SharedSdk once on first share-URL resolution with (indexerUrl, hex seed) and reuses it', async () => {
    const sharingSeed = new Uint8Array(32).fill(0x52);
    const sdk = await createDefaultSdk(WORKER_CONFIG, new Uint8Array(32).fill(0x51), sharingSeed);
    const src = shareSrc();
    const parsed = parseSiaShareUrl(src);

    await sdk.objectFromShareUrl?.(parsed.fetchForm);
    await sdk.objectFromShareUrl?.(parsed.fetchForm);

    // Exactly one SharedSdk.connect, on the first share-URL use, with the
    // indexer URL + hex sharing seed; the app-key route was never touched.
    expect(mocks.sharedConnectCalls).toEqual([[WORKER_CONFIG.indexerUrl, bytesToHex(sharingSeed)]]);
    expect(mocks.sharedObjectCalls).toEqual([parsed.objectKey, parsed.objectKey]);
    expect(mocks.builderCtorCalls).toEqual([]);
    expect(mocks.appSdkObjectCalls).toEqual([]);
  });

  it('connects the app-key route on demand for an untagged download instead of falling through to the shared SDK', async () => {
    const appKeySeed = new Uint8Array(32).fill(0x71);
    const sharingSeed = new Uint8Array(32).fill(0x72);
    const sdk = await createDefaultSdk(WORKER_CONFIG, appKeySeed, sharingSeed);

    // Resolve a share URL first so ONLY the shared route has connected: the
    // app-key Builder route has not been touched yet.
    const src = shareSrc();
    const parsed = parseSiaShareUrl(src);
    await sdk.objectFromShareUrl?.(parsed.fetchForm);
    expect(mocks.builderCtorCalls).toEqual([]);
    expect(mocks.builderConnectedCalls).toEqual([]);

    // An UNTAGGED object (never resolved through either route) must download
    // through the app-key SDK — the eager dual adapter's default — so the lazy
    // dual adapter connects the app-key route on demand rather than handing a
    // pinned object to the shared SDK, which cannot read it.
    const untagged = { id: () => 'untagged', size: () => 8, slabs: () => [] };
    const stream = await sdk.download(untagged, { length: 8, offset: 0 });
    const reader = stream.getReader();
    const { done } = await reader.read();
    expect(done).toBe(true);

    // The app-key route connected exactly once (on demand) and its SDK served
    // the untagged download; the shared SDK never saw the object.
    expect(mocks.builderConnectedCalls).toHaveLength(1);
    expect(mocks.appSdkDownloadCalls).toBe(1);
    expect(mocks.sharedDownloadCalls).toBe(0);
  });

  it('dispose releases only the SDKs actually created and never connects the untouched route', async () => {
    const sdk = await createDefaultSdk(WORKER_CONFIG, new Uint8Array(32).fill(0x51), new Uint8Array(32).fill(0x52));

    // Only the app-key route was used: dispose must release exactly that SDK,
    // and must NOT pay a connection to "clean up" the unused sharing route.
    await sdk.object('pinned-key');
    await sdk.dispose?.();
    expect(mocks.appFreeCalls).toBe(1);
    expect(mocks.sharedFreeCalls).toBe(0);
    expect(mocks.sharedConnectCalls).toEqual([]);

    // The reverse: using only the share route releases only the SharedSdk.
    const sharingOnly = await createDefaultSdk(WORKER_CONFIG, new Uint8Array(32).fill(0x53), new Uint8Array(32).fill(0x54));
    const src = shareSrc();
    const parsed = parseSiaShareUrl(src);
    await sharingOnly.objectFromShareUrl?.(parsed.fetchForm);
    await sharingOnly.dispose?.();
    expect(mocks.sharedFreeCalls).toBe(1);
    expect(mocks.appFreeCalls).toBe(1);
    expect(mocks.builderCtorCalls).toHaveLength(1); // only the first test's app route
  });

  it('does not cache a failed sharing connect (a second share-URL resolution reconnects)', async () => {
    mocks.sharedConnectResultOverride = null;
    const sdk = await createDefaultSdk(WORKER_CONFIG, new Uint8Array(32).fill(0x51), new Uint8Array(32).fill(0x52));
    const src = shareSrc();
    const parsed = parseSiaShareUrl(src);

    await expect(sdk.objectFromShareUrl?.(parsed.fetchForm)).rejects.toThrow(
      'The Sia sharing key is not registered with the indexer.',
    );
    expect(mocks.sharedConnectCalls).toHaveLength(1);

    // The failed connect was NOT cached: a retry reattempts SharedSdk.connect
    // and succeeds once the indexer knows the key.
    mocks.sharedConnectResultOverride = undefined;
    const resolved = await sdk.objectFromShareUrl?.(parsed.fetchForm);
    expect(resolved).toBeDefined();
    expect(mocks.sharedConnectCalls).toHaveLength(2);
  });

  it('surfaces the sharing-key registration error on the first share-URL resolution when both seeds are present', async () => {
    // Force SharedSdk.connect to return null (indexer does not know the key).
    mocks.sharedConnectResultOverride = null;
    const sdk = await createDefaultSdk(WORKER_CONFIG, new Uint8Array(32).fill(0x61), new Uint8Array(32).fill(0x62));

    // Lazy creation resolved without connecting either SDK, so the
    // unregistered-sharing-key failure surfaces on the route's first use
    // rather than at createDefaultSdk (the documented eager fast-fail
    // tradeoff; stream-controller error reporting handles first-resolution
    // failures).
    expect(mocks.sharedConnectCalls).toEqual([]);
    expect(mocks.builderCtorCalls).toEqual([]);

    const src = shareSrc();
    const parsed = parseSiaShareUrl(src);
    await expect(sdk.objectFromShareUrl?.(parsed.fetchForm)).rejects.toThrow(
      'The Sia sharing key is not registered with the indexer.',
    );
    // Share URLs must never silently degrade to app-key resolution: the
    // app-key Builder path is not reached when the sharing connect fails.
    expect(mocks.builderCtorCalls).toEqual([]);
  });

  it('keeps the app-key path untouched when only an app key seed is present', async () => {
    const appKeySeed = new Uint8Array(32).fill(0x51);
    const sdk = await createDefaultSdk(WORKER_CONFIG, appKeySeed, null);

    // App-key registration: no SharedSdk at all.
    expect(mocks.sharedConnectCalls).toEqual([]);
    expect(mocks.builderCtorCalls).toHaveLength(1);
    expect(mocks.appKeyCtorSeeds).toHaveLength(1);

    // The app-key share-URL path stays available via objectFromShareUrl.
    const src = shareSrc();
    const parsed = parseSiaShareUrl(src);
    await sdk.objectFromShareUrl?.(parsed.fetchForm);
    expect(mocks.appSdkShareFormCalls).toEqual([parsed.fetchForm]);
    expect(mocks.sharedObjectCalls).toEqual([]);

    // Plain object keys still resolve through the app-key SDK's object().
    await sdk.object('pin-key');
    expect(mocks.appSdkObjectCalls).toEqual(['pin-key']);
  });

  it('throws a descriptive error when neither credential seed is present', async () => {
    await expect(createDefaultSdk(WORKER_CONFIG, null, null)).rejects.toThrow(
      /No Sia SDK is available: complete the HELLO \+ APP_KEY handshake or inject createSdk/,
    );
    await expect(createDefaultSdk(undefined, new Uint8Array(32).fill(1), null)).rejects.toThrow(
      /No Sia SDK is available/,
    );
  });

  it('returns an SiaVideoSdk whose download forwards unchanged', async () => {
    const sdk = await createDefaultSdk(WORKER_CONFIG, null, new Uint8Array(32).fill(0x61));
    // The resolved surface is a SiaVideoSdk: object + optional
    // objectFromShareUrl + download (same DownloadOptions/PinnedObject shape as
    // the app-key SDK, so downstream streaming code needs no churn).
    const surface: SiaVideoSdk = sdk;
    expect(typeof surface.object).toBe('function');
    expect(typeof surface.objectFromShareUrl).toBe('function');
    expect(typeof surface.download).toBe('function');

    const object = await sdk.object('shared-key');
    const stream = await sdk.download(object, { length: 8, offset: 0 });
    const reader = stream.getReader();
    const { done } = await reader.read();
    expect(done).toBe(true);
    void (sdk as unknown as { dispose?: () => void }).dispose;
  });
});
