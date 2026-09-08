import { describe, expect, it } from 'vitest';
import type { AppMetadata } from '@siafoundation/sia-storage';
import {
  decryptAppKeyEnvelope,
  exportWorkerPublicKey,
  generateWorkerKeyPair,
} from '../app-key-handshake.ts';
import { type AppKeyEnvelope, isAppKeyEnvelope, type MainToWorkerMessage, PROTOCOL_VERSION, WORKER_PUBLIC_KEY_LENGTH, type WorkerToMainMessage } from '../protocol.ts';
import { siaVideoDefaultProps, SiaVideoSource } from '../sia-video-source.ts';

/**
 * Host (main thread) state-machine tests. They need a DOM and MediaSource, so
 * they run in browser mode only; `SIA_TEST_ENV=node` skips them.
 */
const IN_BROWSER = typeof document !== 'undefined' && typeof MediaSource !== 'undefined';

/** Records what the host posts and lets tests inject worker replies. */
class FakeWorker {
  listener: ((event: { data: unknown; }) => void) | null = null;
  readonly sent: MainToWorkerMessage[] = [];

  addEventListener(_type: 'message', listener: (event: { data: unknown; }) => void): void {
    this.listener = listener;
  }
  postMessage(message: unknown): void {
    this.sent.push(message as MainToWorkerMessage);
  }
  removeEventListener(): void {
    this.listener = null;
  }
  reply(message: WorkerToMainMessage): void {
    this.listener?.({ data: message });
  }
  terminate(): void { /* noop */ }
}

function appMetadata(): AppMetadata {
  return { appId: 'test-app-id', callbackUrl: '', description: 'test', logoUrl: '', name: 'app', serviceUrl: 'https://app.example' };
}

function workerConfig(indexerUrl = 'https://sia.storage') {
  return { app: appMetadata(), indexerUrl };
}

describe('SiaVideoSource (host state machine)', () => {
  it.skipIf(!IN_BROWSER)('sends HELLO with the configured SDK material on attach', () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({
      createWorker: () => worker as unknown as Worker,
      workerConfig: workerConfig(),
    });
    const target = document.createElement('video');
    host.attach(target);

    expect(worker.sent.at(-1)).toMatchObject({
      config: { indexerUrl: 'https://sia.storage' },
      type: 'HELLO',
    });
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('proceeds to ATTACH only after a matching protocol version', () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    host.attach(document.createElement('video'));

    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 1, type: 'HELLO_OK', version: 999 });
    expect(worker.sent.some((m) => m.type === 'ATTACH')).toBe(false);
    expect(host.error?.code).toBe(4);

    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 2, type: 'HELLO_OK', version: PROTOCOL_VERSION });
    expect(worker.sent.some((m) => m.type === 'ATTACH')).toBe(true);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('goes through the full main-mode handshake: ATTACH → SOURCE_OK → blob src', () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    const target = document.createElement('video');
    host.attach(target);

    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 1, type: 'HELLO_OK', version: PROTOCOL_VERSION });
    expect(worker.sent.some((m) => m.type === 'ATTACH')).toBe(true);

    host.src = 'k';
    const source = worker.sent.find((m) => m.type === 'SOURCE') as
      | undefined
      | { preload: string; requestId: number; src: string; type: 'SOURCE'; };
    expect(source?.src).toBe('k');
    expect(source?.preload).toBe(siaVideoDefaultProps.preload);
    expect(typeof source?.requestId).toBe('number');

    if (!source) throw new Error('SOURCE was not sent');
    worker.reply({
      info: { container: 'fmp4', durationSeconds: null, mime: 'video/mp4', mode: 'main' },
      requestId: source.requestId,
      type: 'SOURCE_OK',
    });
    expect(target.src.startsWith('blob:')).toBe(true);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('forwards native play and seeking intents to the engine', () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    const target = document.createElement('video');
    host.attach(target);
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 1, type: 'HELLO_OK', version: PROTOCOL_VERSION });
    worker.sent.length = 0;

    target.currentTime = 12.5;
    target.dispatchEvent(new Event('seeking'));
    const seek = worker.sent.at(-1);
    expect(seek).toMatchObject({ time: 12.5, type: 'SEEK' });

    target.dispatchEvent(new Event('play'));
    expect(worker.sent.at(-1)).toMatchObject({ type: 'PLAY' });
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('drops stale ERROR reports but surfaces current-load ones', () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    const target = document.createElement('video');
    host.attach(target);
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 1, type: 'HELLO_OK', version: PROTOCOL_VERSION });

    host.src = 'k';
    // A superseded load's error must not surface.
    worker.reply({ context: 'stale', kind: 'network', requestId: 999, type: 'ERROR' });
    expect(host.error).toBeNull();

    const loadId = (worker.sent.find((m) => m.type === 'SOURCE') as undefined | { requestId: number; })?.requestId ?? 0;
    worker.reply({ context: 'container: mp4', kind: 'unsupported', requestId: loadId, type: 'ERROR' });
    expect(host.error?.code).toBe(4);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('drops a request-scoped ERROR that arrives after the source was cleared', () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    const target = document.createElement('video');
    let errorEvents = 0;
    host.addEventListener('error', () => errorEvents++);
    host.attach(target);
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 1, type: 'HELLO_OK', version: PROTOCOL_VERSION });

    host.src = 'k';
    const loadId = (worker.sent.find((m) => m.type === 'SOURCE') as undefined | { requestId: number; })?.requestId ?? 0;

    // Clearing the source resets the active request id...
    host.src = '';
    // ...so the abandoned load's late failure must die with it — not surface
    // as a MediaError on the emptied element.
    worker.reply({ context: 'late probe failure', kind: 'network', requestId: loadId, type: 'ERROR' });
    expect(host.error).toBeNull();
    expect(errorEvents).toBe(0);

    // Globally-scoped reports (no request id) still stand.
    worker.reply({ context: 'worker stopped', kind: 'network', requestId: null, type: 'ERROR' });
    expect(host.error?.code).toBe(2);
    expect(errorEvents).toBe(1);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('attach on a destroyed host is a no-op', () => {
    let spawned = 0;
    const worker = new FakeWorker();
    const host = new SiaVideoSource({
      createWorker: () => {
        spawned++;
        return worker as unknown as Worker;
      },
    });
    host.attach(document.createElement('video'));
    host.destroy();
    worker.sent.length = 0;
    expect(() => host.attach(document.createElement('video'))).not.toThrow();
    // No zombie re-spawn: the destroyed host wires no engine and posts nothing.
    expect(spawned).toBe(1);
    expect(worker.sent).toHaveLength(0);
  });

  it.skipIf(!IN_BROWSER)('a re-attach renegotiates with a fresh HELLO for new config', () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    host.attach(document.createElement('video'));
    host.workerConfig = workerConfig('https://changed.example');
    host.detach();
    host.attach(document.createElement('video'));

    const hellos = worker.sent.filter((m) => m.type === 'HELLO');
    expect(hellos.length).toBe(2);
    expect(hellos.at(-1)).toMatchObject({ config: { indexerUrl: 'https://changed.example' } });
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('sends an APP_KEY envelope after HELLO_OK and never retains or replays the plaintext seed', async () => {
    const worker = new FakeWorker();
    // The supplier returns a buffer whose contents stay observable only
    // through this snapshot; the host is expected to scrub the returned
    // buffer once the envelope is built.
    const seed = crypto.getRandomValues(new Uint8Array(32));
    const expectedSeed = new Uint8Array(seed);
    const keyPair = generateWorkerKeyPair();
    const publicKey = exportWorkerPublicKey(keyPair);
    let supplierCalls = 0;
    const host = new SiaVideoSource({
      createWorker: () => worker as unknown as Worker,
      getAppKeySeed: () => {
        supplierCalls++;
        return seed;
      },
      workerConfig: workerConfig(),
    });
    host.attach(document.createElement('video'));

    worker.reply({ features: { workerMse: false }, publicKey, requestId: 1, type: 'HELLO_OK', version: PROTOCOL_VERSION });
    // The seed→envelope chain is async; let it settle.
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Exactly one APP_KEY was sent, immediately after HELLO_OK.
    const appKeyMessages = worker.sent.filter((m) => m.type === 'APP_KEY');
    expect(appKeyMessages).toHaveLength(1);
    const appKey = appKeyMessages[0] as unknown as { envelope: AppKeyEnvelope; requestId: number; type: 'APP_KEY'; };
    expect(isAppKeyEnvelope(appKey.envelope)).toBe(true);

    // The envelope decrypts (inside a "worker") to exactly the supplied seed:
    // a real X25519+AEAD round trip, not a pass-through copy.
    const decapsulated = await decryptAppKeyEnvelope(keyPair, appKey.envelope);
    expect(Array.from(decapsulated)).toEqual(Array.from(expectedSeed));

    // No sent message carries the plaintext (or a private-key-sized array
    // equal to the seed): only ciphertext, IV, ephemeral key, and metadata.
    for (const message of worker.sent) {
      for (const bytes of byteArraysOf(message)) {
        if (bytes.byteLength === expectedSeed.byteLength) {
          expect(Array.from(bytes)).not.toEqual(Array.from(expectedSeed));
        }
      }
    }

    // The host scrubbed the supplier's buffer after the handoff, and the
    // supplier was read exactly once for this handshake.
    expect(seed.every((b) => b === 0)).toBe(true);
    expect(supplierCalls).toBe(1);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('re-handshakes a fresh envelope on every HELLO_OK without a seed field lingering on the host', async () => {
    const worker = new FakeWorker();
    const keyPair = generateWorkerKeyPair();
    const publicKey = exportWorkerPublicKey(keyPair);
    // A distinct random seed per call: the supplier is consumed per handshake.
    const host = new SiaVideoSource({
      createWorker: () => worker as unknown as Worker,
      getAppKeySeed: () => crypto.getRandomValues(new Uint8Array(32)),
      workerConfig: workerConfig(),
    });
    host.attach(document.createElement('video'));
    worker.reply({ features: { workerMse: false }, publicKey, requestId: 1, type: 'HELLO_OK', version: PROTOCOL_VERSION });
    await new Promise((resolve) => setTimeout(resolve, 0));
    worker.sent.length = 0;

    host.detach();
    host.attach(document.createElement('video'));
    worker.reply({ features: { workerMse: false }, publicKey, requestId: 2, type: 'HELLO_OK', version: PROTOCOL_VERSION });
    await new Promise((resolve) => setTimeout(resolve, 0));

    // A second envelope was delivered for the second handshake.
    const envelopes = worker.sent.filter((m) => m.type === 'APP_KEY');
    expect(envelopes).toHaveLength(1);
    const envelope = (envelopes[0] as unknown as { envelope: AppKeyEnvelope; }).envelope;
    expect(envelope.ephemeralPublicKey.byteLength).toBe(WORKER_PUBLIC_KEY_LENGTH);

    // Nothing retrievable from the host surface speaks of the seed: the
    // config getter exposes only metadata.
    expect(host.workerConfig?.indexerUrl).toBe('https://sia.storage');
    expect('getAppKeySeed' in (host as unknown as { getAppKeySeed?: unknown; })).toBe(false);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('sends no APP_KEY message when no seed supplier is configured', async () => {
    const worker = new FakeWorker();
    const keyPair = generateWorkerKeyPair();
    const publicKey = exportWorkerPublicKey(keyPair);
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    host.attach(document.createElement('video'));
    worker.reply({ features: { workerMse: false }, publicKey, requestId: 1, type: 'HELLO_OK', version: PROTOCOL_VERSION });
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Apps injecting their own SDK factory have no handshake to perform.
    expect(worker.sent.some((m) => m.type === 'APP_KEY')).toBe(false);
    host.destroy();
  });
});

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
