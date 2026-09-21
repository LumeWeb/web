/**
 * Keyless share-link streaming (ADR 0008): the `APP_KEY` envelope `keyType`
 * extension and the worker's `SharedSdk` resolution order.
 *
 * This spec is purely node-runnable: the SDK-binding seam (`createDefaultSdk`)
 * is exercised over a mocked `@siafoundation/sia-storage` — never the real
 * WASM — and the session handshake routing is exercised through
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
import type { WorkerConfig } from '../protocol.ts';
import type { SiaVideoSdk } from '../worker-runtime.ts';
import { createDefaultSdk } from '../worker-runtime.ts';
import { shareSrc } from './fixtures/fmp4-fixture.ts';

/** Recorded side effects of the mocked sia-storage seam, captured per test. */
const mocks = vi.hoisted(() => ({
  appFreeCalls: 0,
  appKeyCtorSeeds: [] as Uint8Array[],
  appSdkObjectCalls: [] as string[],
  appSdkShareFormCalls: [] as string[],
  builderConnectedCalls: [] as unknown[],
  builderCtorCalls: [] as unknown[],
  sharedConnectCalls: [] as [string, string][],
  sharedConnectResultOverride: undefined as null | undefined,
  sharedFreeCalls: 0,
  sharedObjectCalls: [] as string[],
}));

// A node-runnable fake `@siafoundation/sia-storage` (the real WASM SDK stays
// out of these tests). `SharedSdk.connect` records its (indexerUrl, hex-seed)
// arguments; `SharedSdk.object(id)` records the id `createSdk` routes share
// URLs through; `Builder.connected` + `AppKey` mirror the app-key path; the
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
    download = () => new ReadableStream<Uint8Array>({ start: (controller) => controller.close() });
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
      return {
        download: () => new ReadableStream<Uint8Array>({ start: (controller) => controller.close() }),
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
    }
  }
  return { AppKey, Builder, initSia: () => undefined, SharedSdk };
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

/** Lowercase hex encoding (mirrors the worker-runtime bytesToHex helper). */
function bytesToHex(bytes: Uint8Array): string {
  let hex = '';
  for (const byte of bytes) hex += byte.toString(16).padStart(2, '0');
  return hex;
}

function resetMocks(): void {
  mocks.appFreeCalls = 0;
  mocks.appKeyCtorSeeds.length = 0;
  mocks.builderConnectedCalls.length = 0;
  mocks.builderCtorCalls.length = 0;
  mocks.sharedConnectCalls.length = 0;
  mocks.sharedConnectResultOverride = undefined;
  mocks.sharedFreeCalls = 0;
  mocks.sharedObjectCalls.length = 0;
  mocks.appSdkObjectCalls.length = 0;
  mocks.appSdkShareFormCalls.length = 0;
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

  it('connects NEITHER SDK eagerly when both seeds are present — createDefaultSdk resolves with zero connects', async () => {
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

  it('dispose releases only the SDKs actually created and never connects the untouched route', async () => {
    const sdk = await createDefaultSdk(WORKER_CONFIG, new Uint8Array(32).fill(0x51), new Uint8Array(32).fill(0x52));

    // Only the app-key route was used: dispose must release exactly that SDK,
    // and must NOT pay a connection to "clean up" the unused sharing route.
    await sdk.object('pinned-key');
    await sdk.dispose?.();
    expect(mocks.appFreeCalls).toBe(1);
    expect(mocks.sharedFreeCalls).toBe(0);
    expect(mocks.sharedConnectCalls).toEqual([]);

    // Mirror case: using only the share route releases only the SharedSdk.
    const sharingOnly = await createDefaultSdk(WORKER_CONFIG, new Uint8Array(32).fill(0x53), new Uint8Array(32).fill(0x54));
    const src = shareSrc();
    const parsed = parseSiaShareUrl(src);
    await sharingOnly.objectFromShareUrl?.(parsed.fetchForm);
    await sharingOnly.dispose?.();
    expect(mocks.sharedFreeCalls).toBe(1);
    expect(mocks.appFreeCalls).toBe(1);
    expect(mocks.builderCtorCalls).toHaveLength(1); // only the first test's app route
  });

  it('does not cache a failed sharing connect — a second share-URL resolution reconnects', async () => {
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

  it('returns an SiaVideoSdk-shaped surface whose download forwards unchanged', async () => {
    const sdk = await createDefaultSdk(WORKER_CONFIG, null, new Uint8Array(32).fill(0x61));
    // The seam this resolves into is a SiaVideoSdk: object + optional
    // objectFromShareUrl + download (same DownloadOptions/PinnedObject shape as
    // the app-key SDK, so downstream streaming code needs no churn).
    const surface: SiaVideoSdk = sdk;
    expect(typeof surface.object).toBe('function');
    expect(typeof surface.objectFromShareUrl).toBe('function');
    expect(typeof surface.download).toBe('function');

    const object = await sdk.object('shared-key');
    const stream = sdk.download(object, { length: 8, offset: 0 });
    const reader = stream.getReader();
    const { done } = await reader.read();
    expect(done).toBe(true);
    void (sdk as unknown as { dispose?: () => void }).dispose;
  });
});
