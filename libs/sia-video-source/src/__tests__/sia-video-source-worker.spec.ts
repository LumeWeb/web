import { describe, expect, it, vi } from 'vitest';
import type { AppMetadata, Slab } from '@siafoundation/sia-storage';
import { encryptToWorker } from '../app-key-handshake.ts';
import { LruChunkCache, type SiaObjectLike } from '../ranged-reader.ts';
import {
  HEAD_PROBE_LENGTH,
  type PostMessage,
  probeDurationSeconds,
  type SiaVideoSdk,
  SiaVideoWorkerCore,
  withDisposal,
} from '../sia-video-source-worker.ts';
import {
  DEFAULT_FMP4_MIME,
  isMainToWorkerMessage,
  isWorkerToMainMessage,
  type MainToWorkerMessage,
  PROTOCOL_VERSION,
  WORKER_PUBLIC_KEY_LENGTH,
  type WorkerConfig,
  type WorkerToMainMessage,
} from '../protocol.ts';

// ---- fixture builders --------------------------------------------------------

interface Driver {
  all<Type extends WorkerToMainMessage['type']>(type: Type): Extract<Posted, { type: Type; }>[];
  cache: LruChunkCache;
  core: SiaVideoWorkerCore;
  find<Type extends WorkerToMainMessage['type']>(type: Type): Extract<Posted, { type: Type; }> | undefined;
  messages: Posted[];
  nextRequestId(): number;
  say(message: MainToWorkerMessage): Promise<void>;
}

interface FakeSdkOptions {
  /** Delays `object()` resolution, simulating an in-flight indexer round-trip. */
  objectDelayMs?: number;
  /** Rejects `object()`, simulating an indexer failure. */
  objectError?: Error;
  /** When set with `objectError`, only this object key is rejected. */
  objectErrorKey?: string;
  onDownload?: (options: { length?: number; offset?: number; }) => void;
}

type Posted = WorkerToMainMessage;

/** A structurally valid browser-shape `AppMetadata` (its `appId` is a string). */
function appMetadataFor(appId: string): AppMetadata {
  return { appId, callbackUrl: undefined, description: 'test', logoUrl: undefined, name: 'test-app', serviceUrl: 'https://app.example' };
}

/** Depth-first walk collecting every Uint8Array embedded in a message. */
function* byteArraysOf(value: unknown): Generator<Uint8Array> {
  if (value instanceof Uint8Array) {
    yield value;
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) yield* byteArraysOf(item);
    return;
  }
  if (typeof value === 'object' && value !== null) {
    for (const item of Object.values(value as Record<string, unknown>)) yield* byteArraysOf(item);
  }
}

function createDriver(payload: Uint8Array, sdkOptions: FakeSdkOptions = {}): Driver {
  const messages: Posted[] = [];
  const cache = new LruChunkCache(32);
  const sdk = fakeSiaSdk(payload, sdkOptions);
  const post: PostMessage = (message) => messages.push(message);
  // No MediaSource in the node test environment → the core runs in 'main'
  // mode, which is exactly the pure, MSE-free state machine to inspect.
  const core = new SiaVideoWorkerCore({ cache, createSdk: () => Promise.resolve(sdk), post, supportsWorkerMse: () => false });
  let requestId = 0;
  return {
    all(type) {
      return messages.filter((m): m is Extract<Posted, { type: typeof type; }> => m.type === type);
    },
    cache,
    core,
    find(type) {
      return this.all(type).at(-1);
    },
    messages,
    nextRequestId() {
      return ++requestId;
    },
    async say(message) {
      await core.handleMessage(message);
      await new Promise((resolve) => setTimeout(resolve, 0));
    },
  };
}

/** Distinct-content fragmented MP4 per key, so cross-source leaks are visible. */
function fakeMultiSiaSdk(
  objects: Record<string, Uint8Array>,
  options: { trickleKeys?: ReadonlySet<string>; } = {},
): SiaVideoSdk {
  return {
    download: (object, downloadOptions) => {
      const id = object.id();
      const payload = objects[id];
      const size = payload?.length ?? 0;
      const start = downloadOptions?.offset ?? 0;
      const length = Math.min(downloadOptions?.length ?? size - start, size - start);
      return new ReadableStream<Uint8Array>({
        start: (controller) => {
          if (payload && length > 0) controller.enqueue(payload.slice(start, start + length));
          // A trickled key stays open: it models a stream that is genuinely
          // still delivering when a replacement load begins.
          if (!options.trickleKeys?.has(id)) controller.close();
        },
      });
    },
    object: vi.fn((key: string) => {
      const size = objects[key].length;
      const slab = { length: size } as unknown as Slab;
      return Promise.resolve({ id: () => key, size: () => size, slabs: () => [slab] });
    }),
  };
}

function fakeSiaSdk(payload: Uint8Array, options: FakeSdkOptions = {}): SiaVideoSdk {
  const size = payload.length;
  const slab = { length: size } as unknown as Slab;
  const object: SiaObjectLike = { id: () => 'test-object', size: () => size, slabs: () => [slab] };
  return {
    download: (_object, downloadOptions) => {
      options.onDownload?.({ length: downloadOptions?.length, offset: downloadOptions?.offset });
      const start = downloadOptions?.offset ?? 0;
      const length = Math.min(downloadOptions?.length ?? size - start, size - start);
      return new ReadableStream<Uint8Array>({
        start: (controller) => {
          if (length > 0) controller.enqueue(payload.slice(start, start + length));
          controller.close();
        },
      });
    },
    object: vi.fn((key: string) => {
      if (options.objectError && (options.objectErrorKey === undefined || key === options.objectErrorKey)) {
        return Promise.reject(options.objectError);
      }
      if (!options.objectDelayMs) return Promise.resolve(object);
      return new Promise((resolve) => setTimeout(() => resolve(object), options.objectDelayMs));
    }) as unknown as SiaVideoSdk['object'],
  };
}

// ---- mocked Sia SDK ---------------------------------------------------------

/** Fragmented MP4: ftyp + moof (+ arbitrary media tail). Appends via MSE as-is. */
function fmp4Payload(tail = 64, marker = 0): Uint8Array {
  const ftyp = isoBox('ftyp', [105, 115, 111, 109, 0, 0, 2, 0]);
  const moof = isoBox('moof', []);
  return new Uint8Array([...ftyp, ...moof, ...Array.from(new Uint8Array(tail)).fill(marker)]);
}

function hello(driver: Driver): Promise<void> {
  return driver.say({ requestId: driver.nextRequestId(), type: 'HELLO' });
}

function isoBox(type: string, body: readonly number[]): Uint8Array {
  const size = 8 + body.length;
  return new Uint8Array([size >>> 24, (size >>> 16) & 255, (size >>> 8) & 255, size & 255,
    ...[...type].map((c) => c.charCodeAt(0)), ...body]);
}

function mkvPayload(doctype: string, signature = true): Uint8Array {
  const docType = new TextEncoder().encode(doctype);
  const ebml = signature ? new Uint8Array([0x1a, 0x45, 0xdf, 0xa3]) : new Uint8Array();
  return new Uint8Array([...ebml, 66, 66, docType.length, ...docType]);
}

/** Progressive MP4: ftyp + moov + mdat. MSE cannot append this without remuxing. */
function progressiveMp4Payload(): Uint8Array {
  const ftyp = isoBox('ftyp', [105, 115, 111, 109, 0, 0, 2, 0]);
  const moov = isoBox('moov', Array.from(new Uint8Array(32)));
  const mdat = isoBox('mdat', Array.from(new Uint8Array(48)));
  return new Uint8Array([...ftyp, ...moov, ...mdat]);
}

function source(
  driver: Driver,
  src: string,
  preload: 'auto' | 'metadata' | 'none' = 'auto',
): Promise<void> {
  return driver.say({ preload, requestId: driver.nextRequestId(), src, type: 'SOURCE' });
}

function sourceWithMime(driver: Driver, src: string, mimeType: string): Promise<void> {
  return driver.say({ mimeType, requestId: driver.nextRequestId(), src, type: 'SOURCE' });
}

function tsPayload(packets = 3): Uint8Array {
  return new Uint8Array(packets * 188).map((_, i) => (i % 188 === 0 ? 0x47 : i % 251));
}

function unknownPayload(): Uint8Array {
  return new Uint8Array(512).map((_, i) => i % 251);
}

// ---- tests --------------------------------------------------------------------

describe('SiaVideoWorkerCore', () => {
  describe('protocol guards', () => {
    it('rejects garbage payloads at the main→worker boundary', () => {
      expect(isMainToWorkerMessage({ requestId: 1, src: 'k', type: 'SOURCE' })).toBe(true);
      expect(isMainToWorkerMessage({ requestId: 1, type: 'PLAY' })).toBe(true);
      expect(isMainToWorkerMessage({ type: 'CHUNK' })).toBe(false);
      expect(isMainToWorkerMessage(null)).toBe(false);
      expect(isMainToWorkerMessage({ type: 'NOT_A_THING' })).toBe(false);
      });
    it('rejects garbage payloads at the worker→main boundary', () => {
      expect(isWorkerToMainMessage({ info: {}, requestId: 1, type: 'SOURCE_OK' })).toBe(true);
      expect(isWorkerToMainMessage({ type: 'SOURCE' })).toBe(false);
      expect(isWorkerToMainMessage(undefined)).toBe(false);
    });
    it('requires the fields each handler will dereference', () => {
      // A missing `src` would reach sdk.object(undefined).
      expect(isMainToWorkerMessage({ requestId: 1, type: 'SOURCE' })).toBe(false);
      expect(isMainToWorkerMessage({ requestId: 1, src: 42, type: 'SOURCE' })).toBe(false);
      // A NaN seek time would poison the byte-offset math.
      expect(isMainToWorkerMessage({ requestId: 1, time: Number.NaN, type: 'SEEK' })).toBe(false);
      // A missing `info` would throw in the SOURCE_OK handler.
      expect(isWorkerToMainMessage({ requestId: 1, type: 'SOURCE_OK' })).toBe(false);
      expect(isWorkerToMainMessage({ info: {}, type: 'SOURCE_OK' })).toBe(false);
      expect(isWorkerToMainMessage({ info: { container: 'fmp4' }, requestId: 1, type: 'SOURCE_OK' })).toBe(true);
    });
  });

  describe('HELLO', () => {
    it('answers with the protocol version and worker-MSE capability', async () => {
      const driver = createDriver(fmp4Payload());
      await hello(driver);
      const ok = driver.find('HELLO_OK');
      expect(ok?.version).toBe(PROTOCOL_VERSION);
      expect(ok?.features.workerMse).toBe(false);
    });
    it('mirrors worker MSE support when present', async () => {
      const messages: Posted[] = [];
      const core = new SiaVideoWorkerCore({
        post: (m) => messages.push(m),
        supportsWorkerMse: () => true,
      });
      await core.handleMessage({ requestId: 1, type: 'HELLO' });
      expect(messages.at(-1)).toMatchObject({ features: { workerMse: true }, type: 'HELLO_OK' });
      expect(core.mode).toBe('worker');
    });

    it('rebuilds the SDK when a later HELLO changes or clears the config', async () => {
      const messages: Posted[] = [];
      const usedConfigs: (undefined | WorkerConfig)[] = [];
      const fakeSdkFactory = () => fakeSiaSdk(fmp4Payload(128));
      const core = new SiaVideoWorkerCore({
        createSdk: (config) => {
          usedConfigs.push(config);
          return Promise.resolve(fakeSdkFactory());
        },
        post: (m) => messages.push(m),
        supportsWorkerMse: () => false,
      });
      const configA: WorkerConfig = {
        app: appMetadataFor('a'),

        indexerUrl: 'https://a.storage',
      };
      const configB: WorkerConfig = {
        app: appMetadataFor('b'),

        indexerUrl: 'https://b.storage',
      };

      await core.handleMessage({ config: configA, requestId: 1, type: 'HELLO' });
      await core.handleMessage({ preload: 'auto', requestId: 2, src: 'k', type: 'SOURCE' });
      expect(usedConfigs.at(-1)).toBe(configA);

      // Reattach with a different config → the cached SDK must be discarded.
      await core.handleMessage({ config: configB, requestId: 3, type: 'HELLO' });
      await core.handleMessage({ preload: 'auto', requestId: 4, src: 'k', type: 'SOURCE' });
      expect(usedConfigs.at(-1)).toBe(configB);

      // Clearing the config entirely also forces a rebuild-free state.
      await core.handleMessage({ config: undefined, requestId: 5, type: 'HELLO' });
      await core.handleMessage({ preload: 'auto', requestId: 6, src: 'k', type: 'SOURCE' });
      expect(usedConfigs.at(-1)).toBe(undefined);
    });

    it('builds the SDK from a seed decapsulated out of an APP_KEY envelope', async () => {
      const messages: Posted[] = [];
      const seenSeeds: (null | Uint8Array)[] = [];
      const core = new SiaVideoWorkerCore({
        createSdk: (_config, seed) => {
          seenSeeds.push(seed);
          return Promise.resolve(fakeSiaSdk(fmp4Payload(64)));
        },
        post: (m) => messages.push(m),
        supportsWorkerMse: () => false,
      });
      const first = crypto.getRandomValues(new Uint8Array(32));
      const second = crypto.getRandomValues(new Uint8Array(32));

      await core.handleMessage({ requestId: 1, type: 'HELLO' });
      // HELLO_OK publishes the worker's raw 32-byte X25519 public half; this
      // (the host's view) is the only key material the worker ever reveals.
      const ok = messages.at(-1);
      expect(ok?.type).toBe('HELLO_OK');
      const publicKey = (ok as { publicKey: Uint8Array; }).publicKey;
      expect(publicKey.byteLength).toBe(WORKER_PUBLIC_KEY_LENGTH);
      expect(typeof (ok as { privateKey?: unknown; }).privateKey).toBe('undefined');

      await core.handleMessage({ envelope: await encryptToWorker(publicKey, first), requestId: 2, type: 'APP_KEY' });
      await core.handleMessage({ preload: 'auto', requestId: 3, src: 'k', type: 'SOURCE' });
      expect(seenSeeds).toHaveLength(1);
      // The injected factory received the plaintext seed bytes — and only the
      // worker isolate (this code path) ever sees them.
      expect(Array.from(seenSeeds[0]!)).toEqual(Array.from(first));

      await core.handleMessage({ envelope: await encryptToWorker(publicKey, second), requestId: 4, type: 'APP_KEY' });
      await core.handleMessage({ preload: 'auto', requestId: 5, src: 'k', type: 'SOURCE' });
      expect(seenSeeds).toHaveLength(2);
      expect(Array.from(seenSeeds[1]!)).toEqual(Array.from(second));

      // No reply ever carries the plaintext seed (or the private key): the
      // only posted byte arrays are the public key and CHUNK media bytes.
      const firstBytes = Array.from(first);
      const secondBytes = Array.from(second);
      for (const message of messages) {
        for (const bytes of byteArraysOf(message)) {
          expect(Array.from(bytes)).not.toEqual(firstBytes);
          expect(Array.from(bytes)).not.toEqual(secondBytes);
        }
      }
    });

    it('rejects a tampered APP_KEY envelope without disturbing the current SDK', async () => {
      const messages: Posted[] = [];
      let builds = 0;
      const core = new SiaVideoWorkerCore({
        createSdk: () => {
          builds++;
          return Promise.resolve(fakeSiaSdk(fmp4Payload(64)));
        },
        post: (m) => messages.push(m),
        supportsWorkerMse: () => false,
      });
      const seed = crypto.getRandomValues(new Uint8Array(32));

      await core.handleMessage({ requestId: 1, type: 'HELLO' });
      // Encrypt to the key the worker actually published in HELLO_OK.
      const publicKey = (messages.at(-1) as { publicKey: Uint8Array; }).publicKey;
      expect(publicKey.byteLength).toBe(WORKER_PUBLIC_KEY_LENGTH);
      await core.handleMessage({ envelope: await encryptToWorker(publicKey, seed), requestId: 2, type: 'APP_KEY' });
      await core.handleMessage({ preload: 'auto', requestId: 3, src: 'k', type: 'SOURCE' });
      expect(builds).toBe(1);

      // A single flipped ciphertext bit must fail AEAD integrity — and the
      // rejection must NOT clear the seed or invalidate the cached SDK: garbage
      // never gets to impersonate a credential change.
      const tampered = await encryptToWorker(publicKey, seed);
      tampered.ciphertext[0] ^= 0x01;
      const errorsBefore = messages.filter((m) => m.type === 'ERROR').length;
      await core.handleMessage({ envelope: tampered, requestId: 4, type: 'APP_KEY' });
      // The rejection is a global (requestId null) ERROR naming the handshake,
      // not a request-scoped SOURCE failure.
      const errors = messages.filter((m) => m.type === 'ERROR');
      expect(errors).toHaveLength(errorsBefore + 1);
      expect(errors.at(-1)).toMatchObject({ kind: 'network', requestId: null, type: 'ERROR' });

      await core.handleMessage({ preload: 'auto', requestId: 5, src: 'k', type: 'SOURCE' });
      expect(builds).toBe(1);
      // A later well-formed envelope of a fresh seed still rebuilds: the
      // rejected one cached nothing, but the honest handshake still works.
      await core.handleMessage({ envelope: await encryptToWorker(publicKey, crypto.getRandomValues(new Uint8Array(32))), requestId: 6, type: 'APP_KEY' });
      await core.handleMessage({ preload: 'auto', requestId: 7, src: 'k', type: 'SOURCE' });
      expect(builds).toBe(2);
    });

    it('keeps the SDK cached when a re-encrypted envelope holds the same seed', async () => {
      const messages: Posted[] = [];
      let builds = 0;
      const core = new SiaVideoWorkerCore({
        createSdk: (_config, _seed) => {
          builds++;
          return Promise.resolve(fakeSiaSdk(fmp4Payload(64)));
        },
        post: (m) => messages.push(m),
        supportsWorkerMse: () => false,
      });
      const seed = crypto.getRandomValues(new Uint8Array(32));

      await core.handleMessage({ requestId: 1, type: 'HELLO' });
      // Encrypt to the key the worker actually published in HELLO_OK.
      const publicKey = (messages.at(-1) as { publicKey: Uint8Array; }).publicKey;
      expect(publicKey.byteLength).toBe(WORKER_PUBLIC_KEY_LENGTH);
      await core.handleMessage({ envelope: await encryptToWorker(publicKey, seed), requestId: 2, type: 'APP_KEY' });
      await core.handleMessage({ preload: 'auto', requestId: 3, src: 'k', type: 'SOURCE' });

      // Fresh IV + fresh ephemeral key (byte-identical envelopes are
      // impossible), but the decapsulated seed is the same → same connection,
      // so a re-attach's APP_KEY must not force an SDK rebuild.
      await core.handleMessage({ envelope: await encryptToWorker(publicKey, seed), requestId: 4, type: 'APP_KEY' });
      await core.handleMessage({ preload: 'auto', requestId: 5, src: 'k', type: 'SOURCE' });

      expect(builds).toBe(1);
      expect(messages.filter((m) => m.type === 'ERROR')).toHaveLength(0);
    });

    it('does not re-cache an SDK whose config changed while creation was pending', async () => {
      const messages: Posted[] = [];
      let resolveCreate: (sdk: SiaVideoSdk) => void;
      const createdFor: (undefined | WorkerConfig)[] = [];
      const core = new SiaVideoWorkerCore({
        createSdk: (config) => {
          createdFor.push(config);
          // Only the first (config A) build is deferred, simulating a slow SDK
          // init; subsequent builds resolve immediately.
          if (config !== configA) return Promise.resolve(fakeSiaSdk(fmp4Payload(128)));
          return new Promise<SiaVideoSdk>((resolve) => {
            resolveCreate = resolve;
          });
        },
        post: (m) => messages.push(m),
        supportsWorkerMse: () => false,
      });
      const configA: WorkerConfig = {
        app: appMetadataFor('a'),

        indexerUrl: 'https://a.storage',
      };
      const configB: WorkerConfig = {
        app: appMetadataFor('b'),

        indexerUrl: 'https://b.storage',
      };

      await core.handleMessage({ config: configA, requestId: 1, type: 'HELLO' });
      // SOURCE starts SDK creation for config A; it stays unresolved here.
      const sourcePromise = core.handleMessage({ preload: 'auto', requestId: 2, src: 'k', type: 'SOURCE' });
      expect(createdFor).toEqual([configA]);

      // A reattach with config B invalidates the pending A creation.
      await core.handleMessage({ config: configB, requestId: 3, type: 'HELLO' });
      resolveCreate!(fakeSiaSdk(fmp4Payload(128)));
      await sourcePromise;

      // The stale A SDK must not have been cached.
      await core.handleMessage({ preload: 'auto', requestId: 4, src: 'k', type: 'SOURCE' });
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(createdFor.at(-1)).toBe(configB);
      // No A-built SOURCE_OK reached the host (B was produced for config B, or
      // the SOURCE aborted on the config mismatch).
      expect(messages.some((m) => m.type === 'SOURCE_OK')).toBe(true);
    });

    it('disposes an SDK abandoned by a mid-creation config change', async () => {
      const messages: Posted[] = [];
      let resolveCreate!: () => void;
      const disposed = { count: 0 };
      const configA: WorkerConfig = {
        app: appMetadataFor('a'),

        indexerUrl: 'https://a.storage',
      };
      const configB: WorkerConfig = {
        app: appMetadataFor('b'),

        indexerUrl: 'https://b.storage',
      };
      const core = new SiaVideoWorkerCore({
        createSdk: (config) => {
          const sdk = Object.assign(fakeSiaSdk(fmp4Payload(128)), {
            dispose: () => {
              disposed.count++;
            },
          });
          if (config !== configA) return Promise.resolve(sdk);
          return new Promise<SiaVideoSdk>((resolve) => {
            resolveCreate = () => resolve(sdk);
          });
        },
        post: (m) => messages.push(m),
        supportsWorkerMse: () => false,
      });

      await core.handleMessage({ config: configA, requestId: 1, type: 'HELLO' });
      const sourcePromise = core.handleMessage({ preload: 'auto', requestId: 2, src: 'k', type: 'SOURCE' });

      // Config changes while the config-A SDK is still being built.
      await core.handleMessage({ config: configB, requestId: 3, type: 'HELLO' });
      resolveCreate();
      await sourcePromise;
      await new Promise((resolve) => setTimeout(resolve, 0));

      // The stale config-A SDK was released, not merely dropped.
      expect(disposed.count).toBe(1);
    });

    it('does not let a stale rejection clear a newer memoized build', async () => {
      const messages: Posted[] = [];
      const createdFor: (undefined | WorkerConfig)[] = [];
      let rejectA!: (error: Error) => void;
      let resolveB!: (sdk: SiaVideoSdk) => void;
      const core = new SiaVideoWorkerCore({
        createSdk: (config) => {
          createdFor.push(config);
          if ((config as { indexerUrl?: string })?.indexerUrl === 'https://a.storage') {
            return new Promise<SiaVideoSdk>((_, reject) => {
              rejectA = reject;
            });
          }
          return new Promise<SiaVideoSdk>((resolve) => {
            resolveB = resolve;
          });
        },
        post: (m) => messages.push(m),
        supportsWorkerMse: () => false,
      });
      const configA: WorkerConfig = {
        app: appMetadataFor('a'),

        indexerUrl: 'https://a.storage',
      };
      const configB: WorkerConfig = {
        app: appMetadataFor('b'),

        indexerUrl: 'https://b.storage',
      };

      await core.handleMessage({ config: configA, requestId: 1, type: 'HELLO' });
      // A starts building for config A; it stays pending.
      const sourceA = core.handleMessage({ preload: 'auto', requestId: 2, src: 'k', type: 'SOURCE' });
      // Config changes → A's build is superseded and the memo slot is cleared.
      await core.handleMessage({ config: configB, requestId: 3, type: 'HELLO' });
      // B starts building for config B and is now the memoized promise.
      const sourceB = core.handleMessage({ preload: 'auto', requestId: 4, src: 'k', type: 'SOURCE' });

      // A now rejects: it must NOT clear B's memo slot.
      rejectA(new Error('a failed'));
      await sourceA.catch(() => undefined);
      resolveB(fakeSiaSdk(fmp4Payload(128)));
      await Promise.all([sourceB, Promise.resolve()]);
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Only A then B were attempted — no spurious third build, and B cached.
      expect(createdFor.filter((c) => c === configA)).toHaveLength(1);
      expect(createdFor.filter((c) => c === configB)).toHaveLength(1);
      expect(messages.filter((m) => m.type === 'SOURCE_OK').length).toBeGreaterThan(0);
    });

    it('memoizes concurrent same-config SDK creation to a single build', async () => {
      const messages: Posted[] = [];
      const createdFor: (undefined | WorkerConfig)[] = [];
      let resolveCreate!: (sdk: SiaVideoSdk) => void;
      const core = new SiaVideoWorkerCore({
        createSdk: (config) => {
          createdFor.push(config);
          return new Promise<SiaVideoSdk>((resolve) => {
            resolveCreate = resolve;
          });
        },
        post: (m) => messages.push(m),
        supportsWorkerMse: () => false,
      });
      const config: WorkerConfig = {
        app: appMetadataFor('a'),

        indexerUrl: 'https://a.storage',
      };

      await core.handleMessage({ config, requestId: 1, type: 'HELLO' });
      // Two overlapping loads for the same config: the second must reuse the
      // in-flight build instead of creating a duplicate that would orphan it.
      const s1 = core.handleMessage({ preload: 'auto', requestId: 2, src: 'k', type: 'SOURCE' });
      const s2 = core.handleMessage({ preload: 'auto', requestId: 3, src: 'k', type: 'SOURCE' });
      resolveCreate(fakeSiaSdk(fmp4Payload(128)));
      await Promise.all([s1, s2]);
      await new Promise((resolve) => setTimeout(resolve, 0));

      // The in-flight build was shared — exactly one SDK was created even
      // though two loads raced for it. Only the newest load delivers (the
      // other abandons at its epoch checkpoint), so one SOURCE_OK is correct.
      expect(createdFor).toHaveLength(1);
      expect(messages.filter((m) => m.type === 'SOURCE_OK')).toHaveLength(1);
    });

    it('swallows a rejecting SDK disposal without an unhandled rejection', async () => {
      const messages: Posted[] = [];
      const core = new SiaVideoWorkerCore({
        createSdk: (config) => {
          if (config !== undefined) {
            return Promise.resolve(
              Object.assign(fakeSiaSdk(fmp4Payload(128)), {
                dispose: () => Promise.reject(new Error('dispose fail')),
              }),
            );
          }
          return Promise.resolve(fakeSiaSdk(fmp4Payload(128)));
        },
        post: (m) => messages.push(m),
        supportsWorkerMse: () => false,
      });
      const config: WorkerConfig = {
        app: appMetadataFor('a'),

        indexerUrl: 'https://a.storage',
      };

      await core.handleMessage({ config, requestId: 1, type: 'HELLO' });
      await core.handleMessage({ preload: 'auto', requestId: 2, src: 'k', type: 'SOURCE' });
      // Config change disposes the cached SDK whose dispose() rejects. The
      // rejection must be swallowed — the test completing without an
      // unhandled-rejection failure is the assertion.
      await core.handleMessage({ config: undefined, requestId: 3, type: 'HELLO' });
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(messages.filter((m) => m.type === 'HELLO_OK')).toHaveLength(2);
    });

    it('tears down a live trickling load before an SDK-disposing config change', async () => {
      const messages: Posted[] = [];
      const disposed = { count: 0 };
      const payload = fmp4Payload(16 * 1024, 0x27);
      const sdk = {
        dispose: () => {
          disposed.count++;
        },
        download: (_object: SiaObjectLike, downloadOptions?: { length?: number; offset?: number; }) => {
          const offset = downloadOptions?.offset ?? 0;
          if (offset === 0) {
            // Head probe: completes so the container can be sniffed.
            return new ReadableStream<Uint8Array>({
              start: (controller) => {
                controller.enqueue(payload.slice(0, payload.length));
                controller.close();
              },
            });
          }
          // Tail read: stays open, modelling a live stream mid-delivery.
          return new ReadableStream<Uint8Array>({
            start: (controller) => {
              controller.enqueue(payload.slice(offset, offset + 1024));
            },
          });
        },
        object: vi.fn(() => {
          const slab = { length: payload.length } as unknown as Slab;
          return Promise.resolve({ id: () => 'k', size: () => payload.length, slabs: () => [slab] });
        }),
      } as SiaVideoSdk;
      const core = new SiaVideoWorkerCore({
        createSdk: () => Promise.resolve(sdk),
        post: (m) => messages.push(m),
        supportsWorkerMse: () => false,
      });
      const configA: WorkerConfig = {
        app: appMetadataFor('a'),

        indexerUrl: 'https://a.storage',
      };
      const configB: WorkerConfig = {
        app: appMetadataFor('b'),

        indexerUrl: 'https://b.storage',
      };

      await core.handleMessage({ config: configA, requestId: 1, type: 'HELLO' });
      await core.handleMessage({ preload: 'auto', requestId: 2, src: 'k', type: 'SOURCE' });
      const chunksBefore = messages.filter((m) => m.type === 'CHUNK').length;
      expect(chunksBefore).toBeGreaterThan(0);

      // A config change disposes the SDK and must stop the live trickle — not
      // leave it draining against the SDK being disposed.
      await core.handleMessage({ config: configB, requestId: 3, type: 'HELLO' });
      const chunksAtChange = messages.filter((m) => m.type === 'CHUNK').length;
      await new Promise((resolve) => setTimeout(resolve, 2));
      expect(disposed.count).toBe(1);
      expect(messages.filter((m) => m.type === 'CHUNK').length).toBe(chunksAtChange);
    });
  });

  describe('SOURCE acceptance', () => {
    it('accepts fragmented MP4 and delivers its bytes to the host', async () => {
      const driver = createDriver(fmp4Payload(128));
      await hello(driver);
      await source(driver, 'object-key');

      const ok = driver.find('SOURCE_OK');
      expect(ok?.info.container).toBe('fmp4');
      expect(ok?.info.mode).toBe('main');

      const chunks = driver.all('CHUNK');
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0].kind).toBe('init');
    });

    it('delivers the full payload across cached head + network tail', async () => {
      const payload = fmp4Payload(16 * 1024);
      const driver = createDriver(payload);
      await hello(driver);
      await source(driver, 'object-key');

      const chunks = driver.all('CHUNK');
      const bytes = new Uint8Array(chunks.reduce((total, c) => total + c.bytes.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        bytes.set(chunk.bytes, offset);
        offset += chunk.bytes.byteLength;
      }
      expect(bytes).toEqual(payload);
    });

    it('remaps a declared transport MIME on remuxed TS input', async () => {
      const driver = createDriver(tsPayload());
      await hello(driver);
      await sourceWithMime(driver, 'object-key', 'video/mp2t');
      expect(driver.find('SOURCE_OK')?.info.mime).toBe(DEFAULT_FMP4_MIME);
    });

    it('keeps a codec-qualified declared MIME on passthrough fMP4 input', async () => {
      const driver = createDriver(fmp4Payload(64));
      await hello(driver);
      await sourceWithMime(driver, 'object-key', 'video/mp4; codecs="avc1.64001f"');
      expect(driver.find('SOURCE_OK')?.info.mime).toBe('video/mp4; codecs="avc1.64001f"');
    });

    it('remaps a non-MP4 declared MIME on passthrough fMP4 input instead of trusting it', async () => {
      const driver = createDriver(fmp4Payload(64));
      await hello(driver);
      await sourceWithMime(driver, 'object-key', 'video/webm');
      expect(driver.find('SOURCE_OK')?.info.mime).toBe('video/mp4');
    });
  });

  describe('unsupported formats', () => {
    it.each([
      ['progressive MP4 (not fragmented) cannot be appended by MSE', progressiveMp4Payload()],
      ['Matroska has no remuxer', mkvPayload('matroska')],
      ['WebM has no remuxer', mkvPayload('webm')],
      ['unknown bytes', unknownPayload()],
    ])('rejects %s before any large download', async (_label, payload) => {
      const driver = createDriver(payload);
      await hello(driver);
      await source(driver, 'object-key');

      const error = driver.find('ERROR');
      expect(error?.kind).toBe('unsupported');
      expect(driver.all('CHUNK')).toHaveLength(0);
   });
    it('keeps the probe bounded to one small ranged read for rejected objects', async () => {
      const requested: { length?: number; offset?: number; }[] = [];
      const driver = createDriver(progressiveMp4Payload(), {
        onDownload: (options) => requested.push(options),
      });
      await hello(driver);
      await source(driver, 'object-key');
      // Exactly one small probe read — never a full-stream request.
      expect(requested).toEqual([{ length: 4096, offset: 0 }]);
    });
  });

  describe('concurrent source loads (epoch discipline)', () => {
    it('abandons a superseded load: only the newest source delivers', async () => {
      const slow = createDriver(fmp4Payload(128), { objectDelayMs: 5 });
      await hello(slow);

      // Load A resolves slowly; load B races in meanwhile.
      const pendingA = slow.core.handleMessage({ requestId: slow.nextRequestId(), src: 'a', type: 'SOURCE' });
      await source(slow, 'b');

      await pendingA;
      await new Promise((resolve) => setTimeout(resolve, 10));

      const oks = slow.all('SOURCE_OK');
      expect(oks).toHaveLength(1);
      expect(oks[0].requestId).toBe(3);
      expect(slow.all('CHUNK').every((c) => c.requestId === 3)).toBe(true);
      expect(slow.all('ERROR')).toHaveLength(0);
    });
    it('reports per-source failures without leaking stale request ids', async () => {
      const driver = createDriver(fmp4Payload(), {
        objectError: new Error('object not found'),
      });
      await hello(driver);
      await source(driver, 'missing-object');

      const error = driver.find('ERROR');
      expect(error?.kind).toBe('network');
      expect(error?.requestId).toBe(2);
    });
    it('stops the superseded reader so no stale request can deliver', async () => {
      // Load A trickles (its stream stays open) so a broken replacement would
      // keep producing A deliveries; loading B must kill A's request id
      // entirely — no chunk carrying A's id may arrive after B's SOURCE_OK.
      const messages: Posted[] = [];
      const sdk = fakeMultiSiaSdk({ a: fmp4Payload(8 * 1024, 0x11), b: fmp4Payload(8 * 1024, 0x22) }, { trickleKeys: new Set(['a']) });
      const core = new SiaVideoWorkerCore({
        cache: new LruChunkCache(32),
        createSdk: () => Promise.resolve(sdk),
        post: (m) => messages.push(m),
        supportsWorkerMse: () => false,
      });
      const say = async (message: MainToWorkerMessage) => {
        await core.handleMessage(message);
        await new Promise((resolve) => setTimeout(resolve, 0));
      };

      await say({ requestId: 1, type: 'HELLO' });
      await say({ preload: 'auto', requestId: 2, src: 'a', type: 'SOURCE' });
      const aId = 2;
      const aChunks = messages.filter((m) => m.type === 'CHUNK' && m.requestId === aId).length;
      expect(aChunks).toBeGreaterThan(0);

      await say({ preload: 'auto', requestId: 3, src: 'b', type: 'SOURCE' });
      const bChunks = messages.filter((m) => m.type === 'CHUNK' && m.requestId === 3) as { bytes: Uint8Array; }[];
      expect(bChunks.length).toBeGreaterThan(0);
      // A's reader was cancelled at B's load start, so its open stream can no
      // longer deliver — and B's requests contain none of A's marker bytes.
      expect(messages.filter((m) => m.type === 'CHUNK' && m.requestId === aId)).toHaveLength(aChunks);
      expect(bChunks.every((c) => !Array.from(c.bytes).includes(0x11))).toBe(true);
    });
  });

  describe('seek during a still-probing load', () => {
    it('starts streaming when a seek arrives during the probe (intent not lost)', async () => {
      const driver = createDriver(fmp4Payload(8 * 1024), { objectDelayMs: 5 });
      await hello(driver);

      const pendingSource = driver.core.handleMessage({
        preload: 'metadata',
        requestId: driver.nextRequestId(),
        src: 'object-key',
        type: 'SOURCE',
      });
      await driver.say({ requestId: 4, time: 2, type: 'SEEK' });
      await pendingSource;
      await new Promise((resolve) => setTimeout(resolve, 5));

      // Streaming began despite the deferred preload: the player's seek
      // intent was applied by starting; the element re-seeks once buffered.
      expect(driver.find('SOURCE_OK')).toBeDefined();
      expect(driver.all('CHUNK').length).toBeGreaterThan(0);
    });

    it('drops parked seek and play intent when the load fails', async () => {
      const driver = createDriver(fmp4Payload(128), {
        objectError: new Error('object not found'),
        objectErrorKey: 'missing',
      });
      await hello(driver);

      const pending = driver.core.handleMessage({ requestId: 2, src: 'missing', type: 'SOURCE' });
      await driver.say({ requestId: 3, type: 'PLAY' });
      await driver.say({ requestId: 4, time: 5, type: 'SEEK' });
      await pending;

      expect(driver.find('ERROR')?.kind).toBe('network');

      // The intent must not leak into a later, unrelated deferred load:
      // 'other' resolves, but 'none' preload + no play intent → no streaming.
      await source(driver, 'other', 'none');
      const oks = driver.all('SOURCE_OK');
      expect(oks.length).toBe(1);
      expect(driver.all('CHUNK')).toHaveLength(0);
    });
  });

  describe('preload behaviour', () => {
    it('defers full streaming until PLAY when preload is "none"', async () => {
      const driver = createDriver(fmp4Payload(128));
      await hello(driver);
      await source(driver, 'object-key', 'none');

      expect(driver.find('SOURCE_OK')).toBeDefined();
      expect(driver.all('CHUNK')).toHaveLength(0);

      await driver.say({ requestId: 4, type: 'PLAY' });
      expect(driver.all('CHUNK').length).toBeGreaterThan(0);
    });

    it('starts streaming immediately with preload "auto"', async () => {
      const driver = createDriver(fmp4Payload(128));
      await hello(driver);
      await source(driver, 'object-key', 'auto');

      expect(driver.all('CHUNK').length).toBeGreaterThan(0);
    });

    it('starts streaming on SEEK when deferred', async () => {
      const driver = createDriver(fmp4Payload(128));
      await hello(driver);
      await source(driver, 'object-key', 'metadata');

      await driver.say({ requestId: 3, time: 2, type: 'SEEK' });
      expect(driver.all('CHUNK').length).toBeGreaterThan(0);
    });
  });

  describe('seekres', () => {
    it('keeps a live passthrough pipeline healthy across a SEEK (no errors of any kind)', async () => {
      const driver = createDriver(fmp4Payload(32 * 1024), { });
      await hello(driver);
      await source(driver, 'object-key', 'auto');

      // With the passthrough path no decoder is involved, so a healthy seek
      // must produce no errors at all — network, unsupported, or decode.
      await driver.say({ requestId: 3, time: 2, type: 'SEEK' });
      expect(driver.all('ERROR')).toHaveLength(0);
    });

    it('seeking a deferred stream does not re-fetch the object start', async () => {
      const requested: { length?: number; offset?: number; }[] = [];
      const payload = fmp4Payload(16 * 1024);
      const driver = createDriver(payload, { onDownload: (o) => requested.push(o) });
      await hello(driver);
      await source(driver, 'object-key', 'metadata');

      // No bytes delivered yet → throughput estimate is 0 → the seek parks at
      // offset 0, where the probe head is already cached.
      await driver.say({ requestId: 3, time: 10, type: 'SEEK' });
      expect(driver.all('CHUNK').length).toBeGreaterThan(0);
      // Exactly one read at offset 0 — the probe. The replayed cache window
      // covering it must not trigger a second full-start download.
      expect(requested.filter((o) => o.offset === 0)).toHaveLength(1);
    });
  });

  describe('attach / detach lifecycle', () => {
    it('stops reads on DETACH and rebuilds on reattach + fresh SOURCE', async () => {
      const driver = createDriver(fmp4Payload(128));
      await hello(driver);
      await source(driver, 'object-key', 'none');
      await driver.say({ requestId: 4, type: 'PLAY' });
      expect(driver.all('CHUNK').length).toBeGreaterThan(0);

      await driver.say({ type: 'DETACH' });
      const chunkCountAfterDetach = driver.all('CHUNK').length;
      // No new deliveries should sneak in after teardown.
      await new Promise((resolve) => setTimeout(resolve, 2));
      expect(driver.all('CHUNK')).toHaveLength(chunkCountAfterDetach);

      // Re-attach resets the MSE state; the host follows with a fresh SOURCE.
      await driver.say({ requestId: 5, type: 'ATTACH' });
      await source(driver, 'object-key');
      await driver.say({ requestId: 6, type: 'PLAY' });

      const oks = driver.all('SOURCE_OK');
      expect(oks.length).toBe(2);
      expect(driver.all('CHUNK').length).toBeGreaterThan(chunkCountAfterDetach);
    });

    it('answers ATTACH before any source is loaded', async () => {
      const driver = createDriver(fmp4Payload());
      await hello(driver);
      await driver.say({ requestId: 9, type: 'ATTACH' });
      expect(driver.find('ATTACH_OK')?.mode).toBe('main');
      expect(driver.all('ERROR')).toHaveLength(0);
    });

    it('invalidates a load still probing when DETACH arrives', async () => {
      const driver = createDriver(fmp4Payload(256), { objectDelayMs: 5 });
      await hello(driver);

      const pending = driver.core.handleMessage({ preload: 'auto', requestId: 2, src: 'object-key', type: 'SOURCE' });
      // DETACH races the probe; the continuation must abandon cleanly.
      await driver.say({ type: 'DETACH' });
      await pending;
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(driver.all('SOURCE_OK')).toHaveLength(0);
      expect(driver.all('CHUNK')).toHaveLength(0);
      expect(driver.all('ERROR')).toHaveLength(0);
    });
  });

  describe('destroy', () => {
    it('stops responding to messages after DESTROY', async () => {
      const driver = createDriver(fmp4Payload());
      await hello(driver);
      await driver.say({ type: 'DESTROY' });
      await source(driver, 'object-key');
      expect(driver.all('SOURCE_OK')).toHaveLength(0);
      expect(driver.all('CHUNK')).toHaveLength(0);
    });
  });

  describe('error paths', () => {
    it('reports a network error when the SDK cannot be created', async () => {
      const messages: Posted[] = [];
      const core = new SiaVideoWorkerCore({
        createSdk: () => {
          throw new Error('indexer unreachable');
        },
        post: (m) => messages.push(m),
      });
      await core.handleMessage({ requestId: 1, type: 'HELLO' });
      await core.handleMessage({ requestId: 2, src: 'k', type: 'SOURCE' });

      expect(messages.at(-1)).toMatchObject({ kind: 'network', requestId: 2 });
    });

    it('reports a network error for an empty object', async () => {
      const driver = createDriver(new Uint8Array(0));
      await hello(driver);
      await source(driver, 'object-key');
      expect(driver.find('ERROR')?.kind).toBe('network');
    });
  });

  describe('buffer ownership across the transfer boundary', () => {
    it('hands the host chunks it can detach without corrupting the cache', async () => {
      const payload = fmp4Payload(8 * 1024);
      const driver = createDriver(payload, { });
      await hello(driver);
      await source(driver, 'object-key', 'auto');

      const cacheBytes = driver.cache.get(0, 4096);
      const firstChunk = driver.all('CHUNK')[0];

      // Delivered buffer is an owned copy, not the cache's ArrayBuffer…
      expect(firstChunk.bytes.buffer).not.toBe(cacheBytes!.buffer);
      // …and the cache survives (would read as a detached zero-length view
      // had the chunk been transferred without copying).
      expect(cacheBytes?.length).toBe(4096);
      expect(Array.from(cacheBytes!.subarray(0, 8))).toEqual(Array.from(payload.subarray(0, 8)));
    });
  });

  describe('source switching', () => {
    function joinChunks(chunks: { bytes: Uint8Array; kind: string; }[]): Uint8Array {
      const joined = new Uint8Array(chunks.reduce((total, c) => total + c.bytes.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        joined.set(chunk.bytes, offset);
        offset += chunk.bytes.byteLength;
      }
      return joined;
    }

    function createMultiDriver(objects: Record<string, Uint8Array>): Driver {
      const messages: Posted[] = [];
      const cache = new LruChunkCache(32);
      const sdk = fakeMultiSiaSdk(objects);
      const post: PostMessage = (message) => messages.push(message);
      const core = new SiaVideoWorkerCore({ cache, createSdk: () => Promise.resolve(sdk), post, supportsWorkerMse: () => false });
      let requestId = 0;
      return {
        all(type) {
          return messages.filter((m): m is Extract<Posted, { type: typeof type; }> => m.type === type);
        },
        cache,
        core,
        find(type) {
          return this.all(type).at(-1);
        },
        messages,
        nextRequestId() {
          return ++requestId;
        },
        async say(message) {
          await core.handleMessage(message);
          await new Promise((resolve) => setTimeout(resolve, 0));
        },
      };
    }

    it('delivers the replacement source after a full switch (reader replacement)', async () => {
      const objects = { a: fmp4Payload(8 * 1024, 0x11), b: fmp4Payload(8 * 1024, 0x22) };
      const driver = createMultiDriver(objects);
      await hello(driver);
      await source(driver, 'a', 'auto');
      await source(driver, 'b', 'auto');

      expect(driver.find('SOURCE_OK')?.info.container).toBe('fmp4');
      // Only chunks from the load of B — A's deliveries are history.
      const bSourceId = driver.all('SOURCE_OK').at(-1)?.requestId;
      const bChunks = driver.all('CHUNK').filter((c) => c.requestId === bSourceId);
      expect(bChunks.length).toBeGreaterThan(0);
      expect(joinChunks(bChunks)).toEqual(objects.b);
      // Source A's marker bytes must have disappeared after the switch.
      expect(joinChunks(bChunks).includes(0x11)).toBe(false);
    });

    it('a mid-probe SEEK never routes a stale object to the replacement load', async () => {
      // A trickles a stream that stays open delivering 0x11 bytes; B resolves
      // only after a delay. A seek issued while B is still probing must not
      // start streaming A's bytes under B's request id.
      const messages: Posted[] = [];
      const cache = new LruChunkCache(32);
      const aMarker = fmp4Payload(1024, 0x11);
      const bPayload = fmp4Payload(8 * 1024, 0x22);
      const sdk = {
        download: (object: SiaObjectLike, downloadOptions?: { length?: number; offset?: number; }) => {
          if (object.id() === 'a') {
            const offset = downloadOptions?.offset ?? 0;
            // A's head probe (offset 0) completes so the worker can sniff the
            // container; the tail read (offset > 0) trickles — staying open so
            // A is genuinely still streaming when the replacement begins.
            if (offset === 0) {
              const remaining = Math.max(0, Math.min(aMarker.length, aMarker.length - offset));
              return new ReadableStream<Uint8Array>({
                start: (controller) => {
                  if (remaining > 0) controller.enqueue(aMarker.slice(0, remaining));
                  controller.close();
                },
              });
            }
            return new ReadableStream<Uint8Array>({
              start: (controller) => {
                controller.enqueue(aMarker.slice(offset, offset + 1024));
              },
            });
          }
          const start = downloadOptions?.offset ?? 0;
          const length = Math.min(downloadOptions?.length ?? bPayload.length - start, bPayload.length - start);
          return new ReadableStream<Uint8Array>({
            start: (controller) => {
              if (length > 0) controller.enqueue(bPayload.slice(start, start + length));
              controller.close();
            },
          });
        },
        object: vi.fn(async (key: string) => {
          if (key === 'b') await new Promise((resolve) => setTimeout(resolve, 5));
          const size = key === 'a' ? aMarker.length : bPayload.length;
          const slab = { length: size } as unknown as Slab;
          return { id: () => key, size: () => size, slabs: () => [slab] };
        }),
      } as SiaVideoSdk;
      const post: PostMessage = (m) => messages.push(m);
      const core = new SiaVideoWorkerCore({ cache, createSdk: () => Promise.resolve(sdk), post, supportsWorkerMse: () => false });
      const say = async (message: MainToWorkerMessage) => {
        await core.handleMessage(message);
        await new Promise((resolve) => setTimeout(resolve, 0));
      };

      await say({ requestId: 1, type: 'HELLO' });
      await say({ preload: 'auto', requestId: 2, src: 'a', type: 'SOURCE' });

      // Begin the B probe; it resolves after 5 ms.
      const bProbe = core.handleMessage({ preload: 'metadata', requestId: 3, src: 'b', type: 'SOURCE' });
      await Promise.resolve();
      // SEEK lands while B's probe is still pending (no current object).
      await say({ requestId: 4, time: 1, type: 'SEEK' });
      await bProbe;
      await new Promise((resolve) => setTimeout(resolve, 10));

      const bOks = messages.filter((m) => m.type === 'SOURCE_OK');
      expect(bOks).toHaveLength(2);
      const bId = 3;
      const bChunks = messages.filter((m) => m.type === 'CHUNK' && m.requestId === bId) as { bytes: Uint8Array; }[];
      expect(bChunks.length).toBeGreaterThan(0);
      // Zero A marker bytes under B's id — the stale-object leak is gone.
      expect(bChunks.every((c) => !Array.from(c.bytes).includes(0x11))).toBe(true);
    });
  });

  describe('declared MIME handling', () => {
    it('remaps a declared transport MIME to the fMP4 remux default for TS input', async () => {
      const driver = createDriver(tsPayload());
      await hello(driver);
      await sourceWithMime(driver, 'object-key', 'video/mp2t');
      expect(driver.find('SOURCE_OK')?.info.mime).toBe(DEFAULT_FMP4_MIME);
    });

    it('keeps an MP4-flavoured declared MIME for passthrough fMP4 input', async () => {
      const declared = 'video/mp4; codecs="avc1.64001f"';
      const driver = createDriver(fmp4Payload(64));
      await hello(driver);
      await sourceWithMime(driver, 'object-key', declared);
      expect(driver.find('SOURCE_OK')?.info.mime).toBe(declared);
    });
  });

  describe('deferred playback intent', () => {
    it('starts streaming when PLAY arrives while the source is still probing', async () => {
      const driver = createDriver(fmp4Payload(255), { objectDelayMs: 5 });
      await hello(driver);

      const pendingSource = driver.core.handleMessage({
        preload: 'metadata',
        requestId: driver.nextRequestId(),
        src: 'object-key',
        type: 'SOURCE',
      });
      // Playback intent arrives mid-probe; it must survive the load.
      await driver.say({ requestId: 4, type: 'PLAY' });
      await pendingSource;
      await new Promise((resolve) => setTimeout(resolve, 5));

      expect(driver.find('SOURCE_OK')).toBeDefined();
      expect(driver.all('CHUNK').length).toBeGreaterThan(0);
    });
  });

  describe('SDK disposal across config oscillation', () => {
    it('disposes the intermediate SDKs on an A→B→A oscillation and memoizes the final build', async () => {
      const messages: Posted[] = [];
      let builds = 0;
      let disposed = 0;
      const core = new SiaVideoWorkerCore({
        createSdk: () => {
          builds++;
          return Promise.resolve(
            Object.assign(fakeSiaSdk(fmp4Payload(128)), {
              dispose: () => {
                disposed++;
              },
            }),
          );
        },
        post: (m) => messages.push(m),
        supportsWorkerMse: () => false,
      });
      const configA: WorkerConfig = {
        app: appMetadataFor('a'),

        indexerUrl: 'https://a.storage',
      };
      const configB: WorkerConfig = {
        app: appMetadataFor('b'),

        indexerUrl: 'https://b.storage',
      };

      await core.handleMessage({ config: configA, requestId: 1, type: 'HELLO' });
      await core.handleMessage({ preload: 'auto', requestId: 2, src: 'k', type: 'SOURCE' });
      await core.handleMessage({ config: configB, requestId: 3, type: 'HELLO' });
      await core.handleMessage({ preload: 'auto', requestId: 4, src: 'k', type: 'SOURCE' });
      await core.handleMessage({ config: configA, requestId: 5, type: 'HELLO' });
      await core.handleMessage({ preload: 'auto', requestId: 6, src: 'k', type: 'SOURCE' });
      await new Promise((resolve) => setTimeout(resolve, 0));

      // One build per configuration, and each superseded SDK (A then B) was
      // released exactly once — the returning config A cannot orphan the A
      // build that already served the first load.
      expect(builds).toBe(3);
      expect(disposed).toBe(2);
      expect(messages.filter((m) => m.type === 'SOURCE_OK')).toHaveLength(3);

      // A subsequent load for the same config reuses the memoized current
      // SDK (identity-guarded) instead of building a fourth instance.
      await core.handleMessage({ preload: 'auto', requestId: 7, src: 'k', type: 'SOURCE' });
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(builds).toBe(3);
      expect(disposed).toBe(2);
      expect(messages.filter((m) => m.type === 'SOURCE_OK')).toHaveLength(4);
    });

    it('disposes the superseded SDKs while their builds are still in flight', async () => {
      const messages: Posted[] = [];
      // Each build is deferred and resolved only after ALL of them exist, so
      // the oscillation happens while builds overlap and adoption (not HELLO
      // teardown) must release every superseded instance.
      const resolvers: (() => void)[] = [];
      const disposedCounts: number[] = [];
      const core = new SiaVideoWorkerCore({
        createSdk: () =>
          new Promise<SiaVideoSdk>((resolve) => {
            const index = resolvers.length;
            disposedCounts[index] = 0;
            resolvers.push(() =>
              resolve(
                Object.assign(fakeSiaSdk(fmp4Payload(128)), {
                  dispose: () => {
                    disposedCounts[index] = (disposedCounts[index] ?? 0) + 1;
                  },
                }),
              ),
            );
          }),
        post: (m) => messages.push(m),
        supportsWorkerMse: () => false,
      });
      const configA: WorkerConfig = {
        app: appMetadataFor('a'),

        indexerUrl: 'https://a.storage',
      };
      const configB: WorkerConfig = {
        app: appMetadataFor('b'),

        indexerUrl: 'https://b.storage',
      };

      await core.handleMessage({ config: configA, requestId: 1, type: 'HELLO' });
      // None of the three SOURCE operations is awaited: all builds are still
      // pending while the B and A HELLOs land.
      const loadA1 = core.handleMessage({ preload: 'auto', requestId: 2, src: 'k', type: 'SOURCE' });
      await core.handleMessage({ config: configB, requestId: 3, type: 'HELLO' });
      const loadB = core.handleMessage({ preload: 'auto', requestId: 4, src: 'k', type: 'SOURCE' });
      await core.handleMessage({ config: configA, requestId: 5, type: 'HELLO' });
      const loadA2 = core.handleMessage({ preload: 'auto', requestId: 6, src: 'k', type: 'SOURCE' });

      expect(resolvers).toHaveLength(3);
      resolvers[0]();
      resolvers[1]();
      resolvers[2]();
      await Promise.all([loadA1, loadB, loadA2]);
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Only the newest load — config A's returning build — survives long
      // enough to deliver.
      const oks = messages.filter((m) => m.type === 'SOURCE_OK');
      expect(oks).toHaveLength(1);
      expect(oks[0]?.requestId).toBe(6);

      // [0] was adopted and then superseded by [2]/config A's return: the
      // adoption path must have released it exactly once. [1] died as a stale
      // build; [2] is live and must never be released.
      expect(disposedCounts).toEqual([1, 1, 0]);
    });
  });

  describe('withDisposal', () => {
    it('releases an SDK exposing only free() through its dispose hook', async () => {
      let freed = 0;
      const sdk = Object.assign(fakeSiaSdk(fmp4Payload(8)), {
        free: () => {
          freed++;
        },
      }) as SiaVideoSdk;
      const wrapped = withDisposal(sdk);

      expect(typeof wrapped.dispose).toBe('function');
      await wrapped.dispose?.();
      expect(freed).toBe(1);

      // Forwarded surface still works after wrapping.
      await expect(wrapped.object('k')).resolves.toBeDefined();
      expect(typeof wrapped.download).toBe('function');
    });

    it('releases an SDK exposing only [Symbol.dispose] through its dispose hook', () => {
      let disposed = 0;
      const sdk = Object.assign(fakeSiaSdk(fmp4Payload(8)), {
        [Symbol.dispose]: () => {
          disposed++;
        },
      }) as SiaVideoSdk;
      const wrapped = withDisposal(sdk);

      void wrapped.dispose?.();
      expect(disposed).toBe(1);
      expect(typeof wrapped.dispose).toBe('function');
    });

    it('releases an SDK exposing aliased free() and [Symbol.dispose] exactly once', () => {
      // The real sia-storage WASM SDK aliases the symbol to free(): exercising
      // both hooks would double-release the same WASM object.
      let released = 0;
      const release = () => {
        released++;
      };
      const sdk = Object.assign(fakeSiaSdk(fmp4Payload(8)), {
        free: release,
        [Symbol.dispose]: release,
      }) as SiaVideoSdk;
      const wrapped = withDisposal(sdk);

      void wrapped.dispose?.();
      expect(released).toBe(1);
    });

    it('prefers [Symbol.dispose] over free() when an SDK exposes both', () => {
      let freed = 0;
      let disposed = 0;
      const sdk = Object.assign(fakeSiaSdk(fmp4Payload(8)), {
        free: () => {
          freed++;
        },
        [Symbol.dispose]: () => {
          disposed++;
        },
      }) as SiaVideoSdk;
      const wrapped = withDisposal(sdk);

      void wrapped.dispose?.();
      expect(disposed).toBe(1);
      expect(freed).toBe(0);
    });

    it("uses an SDK's own genuine dispose() without falling through to free() or [Symbol.dispose]", () => {
      let disposeCalls = 0;
      let freed = 0;
      let symbolDisposes = 0;
      const sdk = Object.assign(fakeSiaSdk(fmp4Payload(8)), {
        dispose: () => {
          disposeCalls++;
        },
        free: () => {
          freed++;
        },
        [Symbol.dispose]: () => {
          symbolDisposes++;
        },
      }) as SiaVideoSdk;
      const wrapped = withDisposal(sdk);

      // A teardown path may invoke both entry points; only the genuine
      // dispose() may run, exactly once, through the release-once latch.
      void wrapped.dispose?.();
      const surface = wrapped as unknown as Record<string | symbol, unknown>;
      void (surface[Symbol.dispose] as () => void)();

      expect(disposeCalls).toBe(1);
      expect(freed).toBe(0);
      expect(symbolDisposes).toBe(0);
    });

    it('returns one stable identity per member across repeated reads', () => {
      let freed = 0;
      const sdk = Object.assign(fakeSiaSdk(fmp4Payload(8)), {
        free: () => {
          freed++;
        },
      }) as SiaVideoSdk;
      const wrapped = withDisposal(sdk);

      // Same bound method and same synthesized hook on every read — callers
      // can WeakMap-key or store them safely.
      const surface = wrapped as unknown as Record<string | symbol, unknown>;
      expect(surface.object).toBe(surface.object);
      expect(surface.download).toBe(surface.download);
      expect(wrapped.dispose).toBe(wrapped.dispose);
      expect(surface[Symbol.dispose]).toBe(surface[Symbol.dispose]);

      void wrapped.dispose?.();
      void (surface[Symbol.dispose] as () => void)();
      // Both synthesized hooks share one release-once latch: invoking both
      // entry points releases the aliased free() exactly once.
      expect(freed).toBe(1);
    });

    it('releases exactly once when both disposal entry points are invoked', () => {
      // Mirrors the real sia-storage WASM SDK, whose [Symbol.dispose] aliases
      // free(): the proxy synthesizes both hooks over one native release, so
      // a teardown path invoking dispose() and then [Symbol.dispose] must not
      // double-free the (possibly shared) WASM object.
      let released = 0;
      const release = () => {
        released++;
      };
      const sdk = Object.assign(fakeSiaSdk(fmp4Payload(8)), {
        free: release,
        [Symbol.dispose]: release,
      }) as SiaVideoSdk;
      const wrapped = withDisposal(sdk);

      void wrapped.dispose?.();
      const surface = wrapped as unknown as Record<string | symbol, unknown>;
      void (surface[Symbol.dispose] as () => void)();

      expect(released).toBe(1);
    });

    it('does not mutate or freeze the original SDK object', async () => {
      let freed = 0;
      const sdk = Object.assign(fakeSiaSdk(fmp4Payload(8)), {
        free: () => {
          freed++;
        },
      }) as SiaVideoSdk;
      const raw = sdk as unknown as Record<string | symbol, unknown>;

      const wrapped = withDisposal(sdk);
      await wrapped.dispose?.();

      // Non-mutating guarantee: no `dispose` own property was grafted onto the
      // (possibly shared) underlying WASM SDK object, and it is freezable; the
      // forwarding lives entirely on the proxy, not on the target.
      expect(Object.hasOwn(raw, 'dispose')).toBe(false);
      expect(Object.isFrozen(sdk)).toBe(false);
      expect(Object.isExtensible(sdk)).toBe(true);
      expect(freed).toBe(1);
      expect(Object.hasOwn(raw, 'dispose')).toBe(false);
      // Forwarded methods bind to the original target.
      await expect(wrapped.object('k')).resolves.toBeDefined();
    });

    it('passes an SDK with no release hooks through unharmed', async () => {
      const sdk = fakeSiaSdk(fmp4Payload(8));
      const wrapped = withDisposal(sdk);
      expect(wrapped.dispose).toBeUndefined();
      await expect(wrapped.object('k')).resolves.toBeDefined();
    });
  });

  describe('attach clears per-load intent', () => {
    it('starts streaming from a seek parked between ATTACH and the replacement SOURCE', async () => {
      const driver = createDriver(fmp4Payload(8 * 1024));
      await hello(driver);
      await driver.say({ requestId: driver.nextRequestId(), type: 'ATTACH' });

      // The seek parks while the worker has no object (the ATTACH→SOURCE
      // window); no PLAY is ever sent, so only the parked seek can start
      // streaming once the deferred replacement load completes.
      await driver.say({ requestId: driver.nextRequestId(), time: 1, type: 'SEEK' });
      await source(driver, 'object-key', 'none');

      expect(driver.find('SOURCE_OK')).toBeDefined();
      expect(driver.all('CHUNK').length).toBeGreaterThan(0);
      expect(driver.all('ERROR')).toHaveLength(0);
    });

    it('the parked seek survives SOURCE supersession and starts the replacement load', async () => {
      const driver = createDriver(fmp4Payload(8 * 1024), { objectDelayMs: 5 });
      await hello(driver);
      await driver.say({ requestId: driver.nextRequestId(), type: 'ATTACH' });

      // The seek parks while the worker has no object (the ATTACH→SOURCE
      // window); no PLAY is ever sent, so only the parked seek can start
      // streaming.
      await driver.say({ requestId: driver.nextRequestId(), time: 1, type: 'SEEK' });

      // SOURCE₁ begins probing…
      const firstId = driver.nextRequestId();
      const first = driver.core.handleMessage({
        preload: 'none',
        requestId: firstId,
        src: 'object-key',
        type: 'SOURCE',
      });
      // …and SOURCE₂ supersedes it before SOURCE₁ delivered anything. Both
      // loads resolve, but with preload 'none' and no PLAY only a preserved
      // seek intent can start streaming once the replacement load completes.
      const secondId = driver.nextRequestId();
      const second = driver.core.handleMessage({
        preload: 'none',
        requestId: secondId,
        src: 'object-key',
        type: 'SOURCE',
      });
      await first;
      await second;
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(driver.all('SOURCE_OK')).toHaveLength(1);
      const chunks = driver.all('CHUNK');
      expect(chunks.length).toBeGreaterThan(0);
      // Every delivered chunk belongs to the replacement load's stream.
      expect(chunks.every((c) => c.requestId === secondId)).toBe(true);
      expect(driver.all('ERROR')).toHaveLength(0);
    });

    it('an ATTACH after a SOURCE must not replay a stale play intent on the replacement load', async () => {
      const driver = createDriver(fmp4Payload(8 * 1024), { objectDelayMs: 5 });
      await hello(driver);

      // PLAY parks while the load is still probing…
      const pending = driver.core.handleMessage({ preload: 'none', requestId: 2, src: 'k', type: 'SOURCE' });
      await driver.say({ requestId: 3, type: 'PLAY' });
      // …and the re-attach must kill the parked intent with the dead load.
      await driver.say({ requestId: 4, type: 'ATTACH' });
      await pending;
      await new Promise((resolve) => setTimeout(resolve, 10));

      // The deferred replacement load stays deferred: no auto-play from the
      // prior load's PLAY intent.
      await source(driver, 'k', 'none');
      expect(driver.find('SOURCE_OK')).toBeDefined();
      expect(driver.all('CHUNK')).toHaveLength(0);
      expect(driver.all('ERROR')).toHaveLength(0);
    });

    it('a SEEK between ATTACH and the replacement SOURCE cannot route the stale object', async () => {
      const driver = createDriver(fmp4Payload(8 * 1024), { objectDelayMs: 5 });
      await hello(driver);
      await source(driver, 'k', 'auto');
      const chunksBefore = driver.all('CHUNK').length;
      expect(chunksBefore).toBeGreaterThan(0);

      await driver.say({ requestId: 3, type: 'ATTACH' });
      // A seek landing before the replacement SOURCE must never bind the
      // stale object's reader under the new epoch.
      await driver.say({ requestId: 4, time: 2, type: 'SEEK' });
      await new Promise((resolve) => setTimeout(resolve, 5));
      expect(driver.all('CHUNK')).toHaveLength(chunksBefore);
      expect(driver.all('ERROR')).toHaveLength(0);

      await source(driver, 'k', 'auto');
      expect(driver.find('SOURCE_OK')).toBeDefined();
      expect(driver.all('CHUNK').length).toBeGreaterThan(chunksBefore);
    });
  });

  describe('strays parked seeks must not auto-start deferred loads', () => {
    it('a MIME-rejected SOURCE clears its parked seek so the replacement stays deferred', async () => {
      // The codec-qualified MIME check only decides anything when MediaSource
      // exists; stubbing it keeps the check deterministic in both test envs.
      vi.stubGlobal('MediaSource', {
        canConstructInDedicatedWorker: false,
        isTypeSupported: (type: string) => !type.includes('bogus'),
      });
      try {
        const driver = createDriver(fmp4Payload(8 * 1024));
        await hello(driver);
        await driver.say({ requestId: driver.nextRequestId(), type: 'ATTACH' });

        // The seek parks in the ATTACH→SOURCE window; the subsequent
        // codec-qualified MIME is then rejected by isTypeSupported, which
        // must clear the parked seek along with the failed load.
        await driver.say({ requestId: driver.nextRequestId(), time: 1, type: 'SEEK' });
        await sourceWithMime(driver, 'object-key', 'video/mp4; codecs="bogus.codec"');
        expect(driver.find('ERROR')?.kind).toBe('unsupported');
        expect(driver.all('SOURCE_OK')).toHaveLength(0);

        // A later, unrelated replacement source stays deferred under preload
        // 'none': without a PLAY it must never auto-start streaming.
        await source(driver, 'object-key', 'none');
        expect(driver.find('SOURCE_OK')).toBeDefined();
        expect(driver.all('CHUNK')).toHaveLength(0);
        expect(driver.all('ERROR')).toHaveLength(1);
      } finally {
        vi.unstubAllGlobals();
      }
    });

    it('a seek parked with no ATTACH session must not auto-start a superseding deferred load', async () => {
      const driver = createDriver(fmp4Payload(8 * 1024));
      await hello(driver);

      // The seek parks while no object exists and no ATTACH session is live:
      // this is a stray, not ATTACH-scoped intent.
      await driver.say({ requestId: driver.nextRequestId(), time: 1, type: 'SEEK' });

      // The start of this load drops the stray parked seek, so with preload
      // 'none' and no PLAY nothing may stream.
      await source(driver, 'object-key', 'none');
      expect(driver.find('SOURCE_OK')).toBeDefined();
      expect(driver.all('CHUNK')).toHaveLength(0);
      expect(driver.all('ERROR')).toHaveLength(0);
    });
  });

  describe('a MIME-rejected object must not be restartable', () => {
    it('a SEEK after a MIME-rejected SOURCE must not restream the rejected object', async () => {
      // The codec-qualified MIME check only decides anything when MediaSource
      // exists; stubbing it keeps the check deterministic in both test envs.
      vi.stubGlobal('MediaSource', {
        canConstructInDedicatedWorker: false,
        isTypeSupported: (type: string) => !type.includes('bogus'),
      });
      try {
        const downloads: { length?: number; offset?: number; }[] = [];
        const driver = createDriver(fmp4Payload(8 * 1024), {
          onDownload: (o) => downloads.push(o),
        });
        await hello(driver);
        await driver.say({ requestId: driver.nextRequestId(), type: 'ATTACH' });

        // The codec-qualified MIME is rejected, yet the load had already
        // bound the object: only the unbind below stops the SEEK here from
        // restarting that download under the dead load's request id.
        await sourceWithMime(driver, 'object-key', 'video/mp4; codecs="bogus.codec"');
        expect(driver.find('ERROR')?.kind).toBe('unsupported');
        expect(driver.all('SOURCE_OK')).toHaveLength(0);

        await driver.say({ requestId: driver.nextRequestId(), time: 1, type: 'SEEK' });
        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(driver.all('CHUNK')).toHaveLength(0);
        // Only the probe head was ever fetched: the rejected object's stream
        // was restarted by nothing.
        expect(downloads.filter((d) => d.length !== HEAD_PROBE_LENGTH)).toHaveLength(0);
        // The only error is the unsupported-MIME rejection itself.
        expect(driver.all('ERROR')).toHaveLength(1);
      } finally {
        vi.unstubAllGlobals();
      }
    });

    it('a PLAY after a MIME-rejected SOURCE must not restream the rejected object', async () => {
      // The codec-qualified MIME check only decides anything when MediaSource
      // exists; stubbing it keeps the check deterministic in both test envs.
      vi.stubGlobal('MediaSource', {
        canConstructInDedicatedWorker: false,
        isTypeSupported: (type: string) => !type.includes('bogus'),
      });
      try {
        const downloads: { length?: number; offset?: number; }[] = [];
        const driver = createDriver(fmp4Payload(8 * 1024), {
          onDownload: (o) => downloads.push(o),
        });
        await hello(driver);
        await driver.say({ requestId: driver.nextRequestId(), type: 'ATTACH' });

        await sourceWithMime(driver, 'object-key', 'video/mp4; codecs="bogus.codec"');
        expect(driver.find('ERROR')?.kind).toBe('unsupported');

        // The rejected object is gone; the play intent may park for the next
        // load, but it must not stream anything now.
        await driver.say({ requestId: driver.nextRequestId(), type: 'PLAY' });
        await new Promise((resolve) => setTimeout(resolve, 10));

        expect(driver.all('CHUNK')).toHaveLength(0);
        // Only the probe head was ever fetched: the rejected object's stream
        // was restarted by nothing.
        expect(downloads.filter((d) => d.length !== HEAD_PROBE_LENGTH)).toHaveLength(0);
        expect(driver.all('ERROR')).toHaveLength(1);
      } finally {
        vi.unstubAllGlobals();
      }
    });
  });
});

// ---- probeDurationSeconds bounds (truncated mvhd must not throw) -------------

function mvhdHead(version: 0 | 1): Uint8Array {
  const ftyp = isoBox('ftyp', [105, 115, 111, 109, 0, 0, 2, 0]);
  const timescale = 1000;
  const duration = 42_000;
  const ts = [timescale >>> 24, (timescale >>> 16) & 255, (timescale >>> 8) & 255, timescale & 255];
  const f32 = (v: number) => [v >>> 24, (v >>> 16) & 255, (v >>> 8) & 255, v & 255];
  const body: number[] = [version, 0, 0, 0];
  if (version === 1) {
    body.push(...new Array<number>(16).fill(0)); // creation + modification (64-bit each)
    body.push(...ts);
    // duration is a 64-bit field: four zero bytes, then the low 32 bits.
    body.push(0, 0, 0, 0, ...f32(duration));
  } else {
    body.push(...new Array<number>(8).fill(0)); // creation + modification (32-bit each)
    body.push(...ts);
    body.push(...f32(duration));
  }
  const mvhd = new Uint8Array([...f32(8 + body.length), ...[...('mvhd' as string)].map((c) => c.charCodeAt(0)), ...body]);
  return new Uint8Array([...ftyp, ...isoBox('moov', [...mvhd])]);
}

describe('probeDurationSeconds', () => {
  it('computes duration from a complete version-1 mvhd', () => {
    expect(probeDurationSeconds(mvhdHead(1))).toBe(42);
  });

  it('computes duration from a complete version-0 mvhd', () => {
    expect(probeDurationSeconds(mvhdHead(0))).toBe(42);
  });

  it('returns null (not RangeError) for a head truncated inside a version-1 mvhd', () => {
    const full = mvhdHead(1);
    // Cut between timescale (mvhd+24) and duration end (mvhd+36).
    expect(() => probeDurationSeconds(full.slice(0, full.length - 6))).not.toThrow();
    expect(probeDurationSeconds(full.slice(0, full.length - 6))).toBeNull();
  });

  it('returns null for a head truncated inside a version-0 mvhd', () => {
    const full = mvhdHead(0);
    expect(() => probeDurationSeconds(full.slice(0, full.length - 4))).not.toThrow();
    expect(probeDurationSeconds(full.slice(0, full.length - 4))).toBeNull();
  });

  it('returns null when no mvhd is present', () => {
    expect(probeDurationSeconds(fmp4Payload())).toBeNull();
  });
});
