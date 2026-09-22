import type { AppMetadata } from '@siafoundation/sia-storage';
import { describe, expect, it, vi } from 'vitest';
import {
  decryptAppKeyEnvelope,
  exportWorkerPublicKey,
  generateWorkerKeyPair,
} from '../app-key-handshake.ts';
import { MseAppendPipe } from '../mse-pipe.ts';
import { type AppKeyEnvelope, DEFAULT_FMP4_MIME, isAppKeyEnvelope, type MainToWorkerMessage, MainToWorkerMessageType, PROTOCOL_VERSION, WORKER_PUBLIC_KEY_LENGTH, type WorkerToMainMessage, WorkerToMainMessageType } from '../protocol.ts';
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
      type: MainToWorkerMessageType.HELLO,
    });
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('proceeds to ATTACH only after a matching protocol version', () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    host.attach(document.createElement('video'));

    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 1, type: WorkerToMainMessageType.HELLO_OK, version: 999 });
    expect(worker.sent.some((m) => m.type === MainToWorkerMessageType.ATTACH)).toBe(false);
    expect(host.error?.code).toBe(4);

    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 2, type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    expect(worker.sent.some((m) => m.type === MainToWorkerMessageType.ATTACH)).toBe(true);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('goes through the full main-mode handshake: ATTACH → SOURCE_OK → blob src', () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    const target = document.createElement('video');
    host.attach(target);

    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 1, type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    expect(worker.sent.some((m) => m.type === MainToWorkerMessageType.ATTACH)).toBe(true);

    host.src = 'k';
    const source = worker.sent.find((m) => m.type === MainToWorkerMessageType.SOURCE) as
      | undefined
      | { preload: string; requestId: number; src: string; type: MainToWorkerMessageType.SOURCE; };
    expect(source?.src).toBe('k');
    expect(source?.preload).toBe(siaVideoDefaultProps.preload);
    expect(typeof source?.requestId).toBe('number');

    if (!source) throw new Error('SOURCE was not sent');
    worker.reply({
      info: { container: 'fmp4', durationSeconds: null, mime: 'video/mp4', mode: 'main', tracks: [] },
      requestId: source.requestId,
      type: WorkerToMainMessageType.SOURCE_OK,
    });
    expect(target.src.startsWith('blob:')).toBe(true);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('forwards native play and seeking intents to the engine', () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    const target = document.createElement('video');
    host.attach(target);
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 1, type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    worker.sent.length = 0;

    target.currentTime = 12.5;
    target.dispatchEvent(new Event('seeking'));
    const seek = worker.sent.at(-1);
    expect(seek).toMatchObject({ time: 12.5, type: MainToWorkerMessageType.SEEK });

    target.dispatchEvent(new Event('play'));
    expect(worker.sent.at(-1)).toMatchObject({ type: MainToWorkerMessageType.PLAY });

    target.currentTime = 13;
    target.dispatchEvent(new Event('timeupdate'));
    expect(worker.sent.at(-1)).toMatchObject({ time: 13, type: MainToWorkerMessageType.PLAYHEAD });
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('drops stale ERROR reports but surfaces current-load ones', () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    const target = document.createElement('video');
    host.attach(target);
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 1, type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });

    host.src = 'k';
    // A superseded load's error must not surface.
    worker.reply({ context: 'stale', kind: 'network', requestId: 999, type: WorkerToMainMessageType.ERROR });
    expect(host.error).toBeNull();

    const loadId = (worker.sent.find((m) => m.type === MainToWorkerMessageType.SOURCE) as undefined | { requestId: number; })?.requestId ?? 0;
    worker.reply({ context: 'container: mp4', kind: 'unsupported', requestId: loadId, type: WorkerToMainMessageType.ERROR });
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
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 1, type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });

    host.src = 'k';
    const loadId = (worker.sent.find((m) => m.type === MainToWorkerMessageType.SOURCE) as undefined | { requestId: number; })?.requestId ?? 0;

    // Clearing the source resets the active request id...
    host.src = '';
    // ...so the abandoned load's late failure must die with it — not surface
    // as a MediaError on the emptied element.
    worker.reply({ context: 'late load failure', kind: 'network', requestId: loadId, type: WorkerToMainMessageType.ERROR });
    expect(host.error).toBeNull();
    expect(errorEvents).toBe(0);

    // Globally-scoped reports (no request id) still stand.
    worker.reply({ context: 'worker stopped', kind: 'network', requestId: null, type: WorkerToMainMessageType.ERROR });
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

    const hellos = worker.sent.filter((m) => m.type === MainToWorkerMessageType.HELLO);
    expect(hellos.length).toBe(2);
    expect(hellos.at(-1)).toMatchObject({ config: { indexerUrl: 'https://changed.example' } });
    host.destroy();
  });


  it.skipIf(!IN_BROWSER)('forwards an explicit worker-MSE preference on HELLO and omits it by default', () => {
    const worker = new FakeWorker();

    const forced = new SiaVideoSource({
      createWorker: () => worker as unknown as Worker,
      workerConfig: workerConfig(),
      workerMse: 'main',
    });
    forced.attach(document.createElement('video'));
    const forcedHello = worker.sent.find((m) => m.type === MainToWorkerMessageType.HELLO) as { config?: { workerMse?: string }; type: MainToWorkerMessageType.HELLO; };
    expect(forcedHello.config).toMatchObject({ workerMse: 'main' });
    forced.destroy();

    // Default auto (or unset) leaves the wire byte-identical: no workerMse.
    const auto = new SiaVideoSource({ createWorker: () => worker as unknown as Worker, workerConfig: workerConfig() });
    auto.attach(document.createElement('video'));
    const autoHello = worker.sent.filter((m) => m.type === MainToWorkerMessageType.HELLO).at(-1) as { config?: Record<string, unknown>; type: MainToWorkerMessageType.HELLO; };
    expect(autoHello.config).not.toHaveProperty('workerMse');
    auto.destroy();
  });

  it.skipIf(!IN_BROWSER)('selects worker mode end-to-end: HANDLE is attached as the element srcObject', () => {
    // A real MediaSourceHandle like the worker would transfer: the DOM
    // srcObject setter brand-checks the value, so a plain stub cannot stand in.
    // Runtimes without MediaSourceHandle (Firefox) exercise the message-level
    // flow but cannot attach a handle — the srcObject assertion is scoped to
    // runtimes that can (Chromium/Edge/Safari).
    const mediaSource = new MediaSource();
    const handle = (mediaSource as unknown as { handle?: MediaSourceHandle }).handle;
    const canAttach = handle !== undefined;

    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    const target = document.createElement('video');
    host.attach(target);

    worker.reply({ features: { workerMse: true }, publicKey: new Uint8Array(32), requestId: 1, type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    worker.reply({ mode: 'worker', requestId: 2, type: WorkerToMainMessageType.ATTACH_OK });

    host.src = 'k';
    const source = worker.sent.find((m) => m.type === MainToWorkerMessageType.SOURCE) as
      | undefined
      | { preload: string; requestId: number; src: string; type: MainToWorkerMessageType.SOURCE; };
    if (!source) throw new Error('SOURCE was not sent');
    worker.reply({
      info: { container: 'fmp4', durationSeconds: null, mime: 'video/mp4', mode: 'worker', tracks: [] },
      requestId: source.requestId,
      type: WorkerToMainMessageType.SOURCE_OK,
    });

    // Worker mode: produced media never leaves the worker — the host only
    // attaches the transferred MediaSourceHandle to the element.
    if (canAttach) {
      worker.reply({ handle, requestId: source.requestId, type: WorkerToMainMessageType.HANDLE });
      expect((target as unknown as { srcObject: unknown }).srcObject).toBe(handle);
      // No main-thread object URL is created in worker mode.
      expect(target.src.startsWith('blob:')).toBe(false);
    }
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

    worker.reply({ features: { workerMse: false }, publicKey, requestId: 1, type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    // The seed→envelope chain is async; let it settle.
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Exactly one APP_KEY was sent, immediately after HELLO_OK.
    const appKeyMessages = worker.sent.filter((m) => m.type === MainToWorkerMessageType.APP_KEY);
    expect(appKeyMessages).toHaveLength(1);
    const appKey = appKeyMessages[0] as unknown as { envelope: AppKeyEnvelope; requestId: number; type: MainToWorkerMessageType.APP_KEY; };
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

  it.skipIf(!IN_BROWSER)('picks up a seed supplier assigned through the setter after construction', async () => {
    const worker = new FakeWorker();
    const keyPair = generateWorkerKeyPair();
    const publicKey = exportWorkerPublicKey(keyPair);
    // React syncs the supplier onto the persistent media instance on every
    // render — i.e. after construction, through the `getAppKeySeed` setter,
    // never through the options object.
    const host = new SiaVideoSource({
      createWorker: () => worker as unknown as Worker,
      workerConfig: workerConfig(),
    });
    const seed = crypto.getRandomValues(new Uint8Array(32));
    const expectedSeed = new Uint8Array(seed);
    let supplierCalls = 0;
    host.getAppKeySeed = () => {
      supplierCalls++;
      return seed;
    };
    host.attach(document.createElement('video'));
    worker.reply({ features: { workerMse: false }, publicKey, requestId: 1, type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    await new Promise((resolve) => setTimeout(resolve, 0));

    // The setter-supplied supplier reached the HELLO_OK handler: the APP_KEY
    // envelope still precedes ATTACH (ordering unchanged for this path)…
    expect(worker.sent.map((m) => m.type)).toEqual([MainToWorkerMessageType.HELLO, MainToWorkerMessageType.APP_KEY, MainToWorkerMessageType.ATTACH]);
    // …and decrypts to exactly the supplied seed, so the worker's SDK is
    // built from real seed bytes rather than the null seed that produces a
    // "No Sia SDK is available" failure at load time.
    const appKey = worker.sent[1] as unknown as { envelope: AppKeyEnvelope; };
    expect(isAppKeyEnvelope(appKey.envelope)).toBe(true);
    expect(Array.from(await decryptAppKeyEnvelope(keyPair, appKey.envelope))).toEqual(Array.from(expectedSeed));
    // No network-class failure surfaced from the handshake window.
    expect(host.error).toBeNull();
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
    worker.reply({ features: { workerMse: false }, publicKey, requestId: 1, type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    await new Promise((resolve) => setTimeout(resolve, 0));
    worker.sent.length = 0;

    host.detach();
    host.attach(document.createElement('video'));
    worker.reply({ features: { workerMse: false }, publicKey, requestId: 2, type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    await new Promise((resolve) => setTimeout(resolve, 0));

    // A second envelope was delivered for the second handshake.
    const envelopes = worker.sent.filter((m) => m.type === MainToWorkerMessageType.APP_KEY);
    expect(envelopes).toHaveLength(1);
    const envelope = (envelopes[0] as unknown as { envelope: AppKeyEnvelope; }).envelope;
    expect(envelope.ephemeralPublicKey.byteLength).toBe(WORKER_PUBLIC_KEY_LENGTH);

    // Nothing retrievable from the host surface speaks of the seed: the
    // config getter exposes only metadata, and the `getAppKeySeed` setter
    // has no getter — reading it yields nothing (the host keeps the
    // supplier function private, never a seed value).
    expect(host.workerConfig?.indexerUrl).toBe('https://sia.storage');
    expect((host as unknown as { getAppKeySeed?: unknown; }).getAppKeySeed).toBeUndefined();
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('orders APP_KEY before ATTACH and anything queued during the handshake window', async () => {
    const worker = new FakeWorker();
    const keyPair = generateWorkerKeyPair();
    const publicKey = exportWorkerPublicKey(keyPair);
    let errorEvents = 0;
    const host = new SiaVideoSource({
      createWorker: () => worker as unknown as Worker,
      getAppKeySeed: () => crypto.getRandomValues(new Uint8Array(32)),
      workerConfig: workerConfig(),
    });
    host.addEventListener('error', () => errorEvents++);
    // The source predates the engine, so it replays on ATTACH_OK rather than
    // going straight out — that replay must land after the seed envelope.
    host.src = 'fifo-ordered-object';
    const target = document.createElement('video');
    host.attach(target);
    // Playback intent arriving while HELLO is in flight goes through the
    // pending queue (SEEK then PLAY); the host must keep holding it until the
    // APP_KEY envelope is actually on the wire, not merely until HELLO_OK is
    // handled.
    target.currentTime = 1;
    target.dispatchEvent(new Event('seeking'));
    target.dispatchEvent(new Event('play'));
    expect(worker.sent.map((m) => m.type)).toEqual([MainToWorkerMessageType.HELLO]);

    worker.reply({ features: { workerMse: false }, publicKey, requestId: 1, type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    // Let the async seed→envelope chain (and whatever is chained behind it)
    // settle; the ordering is only observable after it drains.
    await new Promise((resolve) => setTimeout(resolve, 0));

    // The worker consumes the captured postMessage sequence FIFO: APP_KEY
    // must precede ATTACH and everything the flush released, or the first
    // load hits the worker-side seed requirement and fails with a spurious
    // "No Sia SDK is available" network error at playback start.
    const sentTypes = worker.sent.map((m) => m.type);
    expect(sentTypes).toEqual([MainToWorkerMessageType.HELLO, MainToWorkerMessageType.APP_KEY, MainToWorkerMessageType.ATTACH, MainToWorkerMessageType.SEEK, MainToWorkerMessageType.PLAY]);

    // Playback still proceeds: the ATTACH round trip replays the stored
    // source and the load acknowledges without any spurious error event.
    worker.reply({ mode: 'main', requestId: 2, type: WorkerToMainMessageType.ATTACH_OK });
    const source = worker.sent.find((m) => m.type === MainToWorkerMessageType.SOURCE) as
      | undefined
      | { preload: string; requestId: number; src: string; type: MainToWorkerMessageType.SOURCE; };
    expect(source?.src).toBe('fifo-ordered-object');
    worker.reply({
      info: { container: 'fmp4', durationSeconds: null, mime: 'video/mp4', mode: 'main', tracks: [] },
      requestId: source?.requestId ?? 0,
      type: WorkerToMainMessageType.SOURCE_OK,
    });
    expect(host.error).toBeNull();
    expect(errorEvents).toBe(0);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('sends a keyType "sharing" APP_KEY envelope for the sharing-key supplier, scrubs it, and orders ATTACH after', async () => {
    const worker = new FakeWorker();
    // The supplier returns a buffer whose contents stay observable only
    // through this snapshot; the host is expected to scrub it after the
    // envelope is built (mirrors the app-key seed discipline).
    const sharingSeed = crypto.getRandomValues(new Uint8Array(32));
    const expectedSeed = new Uint8Array(sharingSeed);
    const keyPair = generateWorkerKeyPair();
    const publicKey = exportWorkerPublicKey(keyPair);
    let supplierCalls = 0;
    const host = new SiaVideoSource({
      createWorker: () => worker as unknown as Worker,
      getSharingKeySeed: () => {
        supplierCalls++;
        return sharingSeed;
      },
      workerConfig: workerConfig(),
    });
    host.attach(document.createElement('video'));
    worker.reply({ features: { workerMse: false }, publicKey, requestId: 1, type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Exactly one APP_KEY, tagged sharing, posted before ATTACH.
    const appKeyMessages = worker.sent.filter((m) => m.type === MainToWorkerMessageType.APP_KEY);
    expect(appKeyMessages).toHaveLength(1);
    expect(worker.sent.map((m) => m.type)).toEqual([MainToWorkerMessageType.HELLO, MainToWorkerMessageType.APP_KEY, MainToWorkerMessageType.ATTACH]);
    const appKey = appKeyMessages[0] as unknown as { envelope: AppKeyEnvelope & { keyType?: string }; requestId: number; type: MainToWorkerMessageType.APP_KEY; };
    expect(appKey.envelope.keyType).toBe('sharing');
    expect(isAppKeyEnvelope(appKey.envelope)).toBe(true);

    // The envelope decrypts to exactly the supplied sharing seed and the host
    // scrubbed the supplier's buffer after the handoff (one call).
    const decapsulated = await decryptAppKeyEnvelope(keyPair, appKey.envelope);
    expect(Array.from(decapsulated)).toEqual(Array.from(expectedSeed));
    expect(sharingSeed.every((b) => b === 0)).toBe(true);
    expect(supplierCalls).toBe(1);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('sends both APP_KEY envelopes (app then sharing) when both suppliers are present', async () => {
    const worker = new FakeWorker();
    const keyPair = generateWorkerKeyPair();
    const publicKey = exportWorkerPublicKey(keyPair);
    const appSeed = crypto.getRandomValues(new Uint8Array(32));
    const sharingSeed = crypto.getRandomValues(new Uint8Array(32));
    // Snapshots of the raw seeds for later comparison: the host scrubs the
    // suppliers' buffers once each envelope is built, so the plaintext must
    // be captured before the handshake (mirrors the single-envelope tests).
    const expectedAppSeed = new Uint8Array(appSeed);
    const expectedSharingSeed = new Uint8Array(sharingSeed);
    const host = new SiaVideoSource({
      createWorker: () => worker as unknown as Worker,
      getAppKeySeed: () => appSeed,
      getSharingKeySeed: () => sharingSeed,
      workerConfig: workerConfig(),
    });
    host.attach(document.createElement('video'));
    worker.reply({ features: { workerMse: false }, publicKey, requestId: 1, type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    await new Promise((resolve) => setTimeout(resolve, 0));

    // App first, then sharing — both envelopes precede ATTACH.
    const appKeyMessages = worker.sent.filter((m) => m.type === MainToWorkerMessageType.APP_KEY);
    expect(appKeyMessages).toHaveLength(2);
    const envelopes = appKeyMessages.map(
      (m) => (m as unknown as { envelope: AppKeyEnvelope & { keyType?: string }; }).envelope,
    );
    expect(envelopes[0].keyType).toBe('app'); // explicitly tagged by #encryptAndSendSeeds
    expect(envelopes[1].keyType).toBe('sharing');
    expect(worker.sent.map((m) => m.type)).toEqual([MainToWorkerMessageType.HELLO, MainToWorkerMessageType.APP_KEY, MainToWorkerMessageType.APP_KEY, MainToWorkerMessageType.ATTACH]);

    // Each decrypts to its own seed, independently.
    expect(Array.from(await decryptAppKeyEnvelope(keyPair, envelopes[0]))).toEqual(Array.from(expectedAppSeed));
    expect(Array.from(await decryptAppKeyEnvelope(keyPair, envelopes[1]))).toEqual(Array.from(expectedSharingSeed));
    // Both supplier buffers were scrubbed after the handoff.
    expect(appSeed.every((b) => b === 0)).toBe(true);
    expect(sharingSeed.every((b) => b === 0)).toBe(true);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('re-states play intent for the replayed source after ATTACH_OK', () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    const target = document.createElement('video');
    // The source predates the engine, so it replays on ATTACH_OK rather than
    // going straight out. The user's play() races the handshake and is queued
    // behind the attach, then flushed once the attach completes — the FIFO the
    // worker sees is HELLO, ATTACH, PLAY, so its attach-reset of play
    // bookkeeping lands after the PLAY was already consumed.
    host.src = 'replay-play-object';
    host.attach(target);
    target.dispatchEvent(new Event('play'));

    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 1, type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    // No seed supplier → ATTACH goes out synchronously and the queued PLAY is
    // flushed behind it, mirroring the live player's first-load ordering.
    expect(worker.sent.map((m) => m.type)).toEqual([MainToWorkerMessageType.HELLO, MainToWorkerMessageType.ATTACH, MainToWorkerMessageType.PLAY]);

    worker.sent.length = 0;
    worker.reply({ mode: 'main', requestId: 2, type: WorkerToMainMessageType.ATTACH_OK });

    // The fresh SOURCE alone would start deferred (preload defaults to
    // 'metadata') and the pipeline would stall at byte 0 forever — nothing
    // re-states the user's play after the attach rebuilt the pipeline. The
    // host must re-send PLAY aimed at the replayed source's load so the
    // worker begins streaming once that load completes.
    const sentTypes = worker.sent.map((m) => m.type);
    expect(sentTypes.filter((t) => t === MainToWorkerMessageType.SOURCE || t === MainToWorkerMessageType.PLAY)).toEqual([MainToWorkerMessageType.SOURCE, MainToWorkerMessageType.PLAY]);

    const source = worker.sent.find((m) => m.type === MainToWorkerMessageType.SOURCE);
    const play = worker.sent.find((m) => m.type === MainToWorkerMessageType.PLAY);
    expect(source?.src).toBe('replay-play-object');
    // The re-stated PLAY names the load it belongs to, matching the replayed
    // SOURCE's request id, so the worker honors it when that load completes.
    expect(play?.requestId).toBe(source?.requestId);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('does not resume a playback the user deliberately paused before the re-attach', () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    const target = document.createElement('video');
    host.src = 'paused-object';
    host.attach(target);
    target.dispatchEvent(new Event('play'));
    // The user stops playback before the re-attach completes. The element is
    // genuinely paused (synthetic events never change native paused state), so
    // a re-stated PLAY after ATTACH_OK would be resuming what the user stopped.
    target.dispatchEvent(new Event('pause'));

    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 1, type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    expect(worker.sent.map((m) => m.type)).toEqual([MainToWorkerMessageType.HELLO, MainToWorkerMessageType.ATTACH, MainToWorkerMessageType.PLAY]);

    worker.sent.length = 0;
    worker.reply({ mode: 'main', requestId: 2, type: WorkerToMainMessageType.ATTACH_OK });

    expect(target.paused).toBe(true);
    // The fresh SOURCE replays the current source, but the user's pause won:
    // the rebuilt pipeline must not start streaming on its own.
    expect(worker.sent.map((m) => m.type)).toEqual([MainToWorkerMessageType.SOURCE]);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('keeps play intent sticky across a re-attach when no pause superseded it', () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    const target = document.createElement('video');
    host.src = 'sticky-object';
    host.attach(target);
    target.dispatchEvent(new Event('play'));

    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 1, type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    worker.sent.length = 0;
    worker.reply({ mode: 'main', requestId: 2, type: WorkerToMainMessageType.ATTACH_OK });

    // The harness element reports paused (synthetic play is not a real play),
    // so only the sticky intent can drive the re-stated PLAY — clearing it on
    // every pause must not erase an intent no pause superseded.
    const sentTypes = worker.sent.map((m) => m.type);
    expect(sentTypes.filter((t) => t === MainToWorkerMessageType.SOURCE || t === MainToWorkerMessageType.PLAY)).toEqual([MainToWorkerMessageType.SOURCE, MainToWorkerMessageType.PLAY]);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('re-states play intent after a pause→play sequence leads into the re-attach', () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    const target = document.createElement('video');
    host.src = 'replay-object';
    host.attach(target);
    // The pause predates the play: intent is live again the moment the user
    // plays after stopping, so the re-stated source must still stream.
    target.dispatchEvent(new Event('pause'));
    target.dispatchEvent(new Event('play'));

    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 1, type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    worker.sent.length = 0;
    worker.reply({ mode: 'main', requestId: 2, type: WorkerToMainMessageType.ATTACH_OK });

    const sentTypes = worker.sent.map((m) => m.type);
    expect(sentTypes.filter((t) => t === MainToWorkerMessageType.SOURCE || t === MainToWorkerMessageType.PLAY)).toEqual([MainToWorkerMessageType.SOURCE, MainToWorkerMessageType.PLAY]);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('sends no APP_KEY message when no seed supplier is configured', async () => {
    const worker = new FakeWorker();
    const keyPair = generateWorkerKeyPair();
    const publicKey = exportWorkerPublicKey(keyPair);
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    host.attach(document.createElement('video'));
    worker.reply({ features: { workerMse: false }, publicKey, requestId: 1, type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Apps injecting their own SDK factory have no handshake to perform.
    expect(worker.sent.some((m) => m.type === MainToWorkerMessageType.APP_KEY)).toBe(false);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('calls MediaSource.endOfStream after ENDED once appends drain (main mode)', async () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    const target = document.createElement('video');
    host.attach(target);
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 1, type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    // The host only acts on main-mode CHUNK/ENDED once the mode is known, so
    // complete the ATTACH round trip before the load starts.
    worker.reply({ mode: 'main', requestId: 2, type: WorkerToMainMessageType.ATTACH_OK });

    host.src = 'k';
    const source = worker.sent.find((m) => m.type === MainToWorkerMessageType.SOURCE) as
      | undefined
      | { requestId: number; type: MainToWorkerMessageType.SOURCE; };
    if (!source) throw new Error('SOURCE was not sent');
    worker.reply({
      info: { container: 'fmp4', durationSeconds: null, mime: DEFAULT_FMP4_MIME, mode: 'main', tracks: [] },
      requestId: source.requestId,
      type: WorkerToMainMessageType.SOURCE_OK,
    });
    // Let sourceopen + addSourceBuffer settle, then deliver one init chunk and
    // the end-of-stream signal. The host must defer endOfStream until the
    // main-thread append queue drains (updateend), then end the MediaSource.
    await new Promise((resolve) => setTimeout(resolve, 50));

    const endSpy = vi.spyOn(MediaSource.prototype, 'endOfStream');
    worker.reply({
      bytes: new Uint8Array([0, 0, 0, 32, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]),
      kind: 'init',
      requestId: source.requestId,
      type: WorkerToMainMessageType.CHUNK,
    });
    worker.reply({ requestId: source.requestId, type: WorkerToMainMessageType.ENDED });

    const deadline = Date.now() + 3000;
    while (Date.now() < deadline && endSpy.mock.calls.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    expect(endSpy.mock.calls.length).toBeGreaterThan(0);
    endSpy.mockRestore();
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('ignores a stale ENDED from a superseded request', async () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    host.attach(document.createElement('video'));
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 1, type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });

    host.src = 'k';
    const source = worker.sent.find((m) => m.type === MainToWorkerMessageType.SOURCE) as
      | undefined
      | { requestId: number; type: MainToWorkerMessageType.SOURCE; };
    if (!source) throw new Error('SOURCE was not sent');
    worker.reply({
      info: { container: 'fmp4', durationSeconds: null, mime: 'video/mp4', mode: 'main', tracks: [] },
      requestId: source.requestId,
      type: WorkerToMainMessageType.SOURCE_OK,
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    const endSpy = vi.spyOn(MediaSource.prototype, 'endOfStream');
    worker.reply({ requestId: 999, type: WorkerToMainMessageType.ENDED });
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(endSpy.mock.calls.length).toBe(0);
    endSpy.mockRestore();
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('does not end main-thread MSE after its load reports an error', async () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    host.attach(document.createElement('video'));
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 1, type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    worker.reply({ mode: 'main', requestId: 2, type: WorkerToMainMessageType.ATTACH_OK });

    host.src = 'k';
    const source = worker.sent.find((m) => m.type === MainToWorkerMessageType.SOURCE) as
      | undefined
      | { requestId: number; type: MainToWorkerMessageType.SOURCE; };
    if (!source) throw new Error('SOURCE was not sent');
    worker.reply({
      info: { container: 'fmp4', durationSeconds: null, mime: DEFAULT_FMP4_MIME, mode: 'main', tracks: [] },
      requestId: source.requestId,
      type: WorkerToMainMessageType.SOURCE_OK,
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    const endSpy = vi.spyOn(MediaSource.prototype, 'endOfStream');
    worker.reply({ context: 'append failed', kind: 'decode', requestId: source.requestId, type: WorkerToMainMessageType.ERROR });
    worker.reply({ requestId: source.requestId, type: WorkerToMainMessageType.ENDED });
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(endSpy).not.toHaveBeenCalled();
    endSpy.mockRestore();
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('aborts the SourceBuffer parser on repeated forward/back seeks (main-thread MSE fallback)', async () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    const target = document.createElement('video');
    host.attach(target);
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 1, type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    worker.reply({ mode: 'main', requestId: 2, type: WorkerToMainMessageType.ATTACH_OK });

    host.src = 'seek-object';
    const source = worker.sent.find((m) => m.type === MainToWorkerMessageType.SOURCE) as
      | undefined
      | { requestId: number; type: MainToWorkerMessageType.SOURCE; };
    if (!source) throw new Error('SOURCE was not sent');
    worker.reply({
      info: { container: 'fmp4', durationSeconds: null, mime: DEFAULT_FMP4_MIME, mode: 'main', tracks: [] },
      requestId: source.requestId,
      type: WorkerToMainMessageType.SOURCE_OK,
    });
    // Let sourceopen + addSourceBuffer settle so the shared pipe holds a real
    // SourceBuffer and the seek reset can abort its segment parser.
    await new Promise((resolve) => setTimeout(resolve, 50));

    const abortSpy = vi.spyOn(SourceBuffer.prototype, 'abort');

    const timestampOffsetDescriptor = Object.getOwnPropertyDescriptor(SourceBuffer.prototype, 'timestampOffset');
    const reanchorOffsets: number[] = [];
    const timestampOffsetSpy = vi.spyOn(SourceBuffer.prototype, 'timestampOffset', 'set').mockImplementation(function (this: SourceBuffer, value: number) {
      reanchorOffsets.push(value);
      timestampOffsetDescriptor?.set?.call(this, value);
    });

    // Forward seek: the host resets the pipe for the new position, the
    // quiesced SourceBuffer's segment parser is aborted so the worker's fresh
    // fragment starts a new segment (the main-thread regression from the
    // ac55a7b0 parser-reset change), and the buffer is re-anchored at the new
    // currentTime so the trimmed output's zero-based timestamps land there.
    target.currentTime = 45;
    target.dispatchEvent(new Event('seeking'));
    expect(worker.sent.at(-1)).toMatchObject({ time: 45, type: MainToWorkerMessageType.SEEK });
    await settle(4);
    expect(abortSpy).toHaveBeenCalledTimes(1);
    expect(reanchorOffsets).toEqual([45]);

    // Backward seek: another reset, another parser abort, same buffer reused.
    target.currentTime = 10;
    target.dispatchEvent(new Event('seeking'));
    expect(worker.sent.at(-1)).toMatchObject({ time: 10, type: MainToWorkerMessageType.SEEK });
    await settle(4);
    expect(abortSpy).toHaveBeenCalledTimes(2);
    expect(reanchorOffsets).toEqual([45, 10]);

    // Forward again: rapid repeated seeks each reset the shared pipe exactly
    // once — never re-entering, and never tearing the pipeline down — and each
    // re-anchors the buffer at its own currentTime.
    target.currentTime = 30;
    target.dispatchEvent(new Event('seeking'));
    expect(worker.sent.at(-1)).toMatchObject({ time: 30, type: MainToWorkerMessageType.SEEK });
    await settle(4);
    expect(abortSpy).toHaveBeenCalledTimes(3);
    expect(reanchorOffsets).toEqual([45, 10, 30]);

    timestampOffsetSpy.mockRestore();
    abortSpy.mockRestore();
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('surfaces a fatal SourceBuffer append failure once and never endOfStreams the failed pipeline', async () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    const target = document.createElement('video');
    host.attach(target);
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 1, type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    worker.reply({ mode: 'main', requestId: 2, type: WorkerToMainMessageType.ATTACH_OK });

    host.src = 'k';
    const source = worker.sent.find((m) => m.type === MainToWorkerMessageType.SOURCE) as
      | undefined
      | { requestId: number; type: MainToWorkerMessageType.SOURCE; };
    if (!source) throw new Error('SOURCE was not sent');
    worker.reply({
      info: { container: 'fmp4', durationSeconds: null, mime: DEFAULT_FMP4_MIME, mode: 'main', tracks: [] },
      requestId: source.requestId,
      type: WorkerToMainMessageType.SOURCE_OK,
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    const endSpy = vi.spyOn(MediaSource.prototype, 'endOfStream');
    // A synchronous non-quota append rejection is the pipe's fatal path; the
    // prototype spy routes it through the real SPF appendSegment call, so both
    // browsers surface it through the source buffer the host owns.
    const appendSpy = vi.spyOn(SourceBuffer.prototype, 'appendBuffer').mockImplementationOnce(() => {
      throw new DOMException('decode garbage', 'InvalidStateError');
    });
    let errorEvents = 0;
    host.addEventListener('error', () => errorEvents++);

    worker.reply({
      bytes: new Uint8Array([0, 0, 0, 32, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]),
      kind: 'init',
      requestId: source.requestId,
      type: WorkerToMainMessageType.CHUNK,
    });
    await settle(8);
    expect(appendSpy).toHaveBeenCalledTimes(1);
    expect(host.error).not.toBeNull();
    expect(errorEvents).toBeGreaterThanOrEqual(1);

    // The failed pipe drops every later append...
    worker.reply({
      bytes: new Uint8Array([0, 0, 0, 32, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]),
      kind: 'init',
      requestId: source.requestId,
      type: WorkerToMainMessageType.CHUNK,
    });
    // ...and a late ENDED must not endOfStream a failed pipeline — the
    // main-thread fallback never masks a failure with a clean end.
    worker.reply({ requestId: source.requestId, type: WorkerToMainMessageType.ENDED });
    await settle(8);

    expect(endSpy).not.toHaveBeenCalled();
    appendSpy.mockRestore();
    endSpy.mockRestore();
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('trims the back buffer through the shared pipe on playhead advance (bounded buffering)', async () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    const target = document.createElement('video');
    host.attach(target);
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 1, type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    worker.reply({ mode: 'main', requestId: 2, type: WorkerToMainMessageType.ATTACH_OK });

    host.src = 'k';
    const source = worker.sent.find((m) => m.type === MainToWorkerMessageType.SOURCE) as
      | undefined
      | { requestId: number; type: MainToWorkerMessageType.SOURCE; };
    if (!source) throw new Error('SOURCE was not sent');
    worker.reply({
      info: { container: 'fmp4', durationSeconds: null, mime: DEFAULT_FMP4_MIME, mode: 'main', tracks: [] },
      requestId: source.requestId,
      type: WorkerToMainMessageType.SOURCE_OK,
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Bounded-buffering contract: every native timeupdate routes into the
    // shared pipe's eviction path, which derives the removal range from the
    // live playhead (covered end-to-end against a real SourceBuffer by the
    // pipe spec; here the host wiring is what's under test).
    const evictSpy = vi.spyOn(MseAppendPipe.prototype, 'evictBackBuffer');

    target.currentTime = 60;
    target.dispatchEvent(new Event('timeupdate'));
    expect(evictSpy).toHaveBeenCalledTimes(1);
    expect(worker.sent.at(-1)).toMatchObject({ time: 60, type: MainToWorkerMessageType.PLAYHEAD });

    target.currentTime = 61;
    target.dispatchEvent(new Event('timeupdate'));
    expect(evictSpy).toHaveBeenCalledTimes(2);

    evictSpy.mockRestore();
    host.destroy();
  });
});

describe('decode failure recovery', () => {
  // Recovery spec under test: a worker-reported `decode` ERROR on the ACTIVE
  // load means the pipeline tore down underneath the element (e.g. the worker
  // took its MediaSource down after a fatal append failure), so the host
  // reloads automatically — a fresh SOURCE for the same src, then SEEK back
  // to the last reported playhead and PLAY — a bounded number of times before
  // giving up and surfacing the MediaError normally (MEDIA_ERR_DECODE, code 3).
  // A successful SOURCE_OK and a fresh `src` each reset the budget.
  //
  // Recovery is synchronous and immediate: on the decode ERROR the host posts
  // SOURCE → SEEK → PLAY in the same turn, with SEEK/PLAY naming the NEW
  // SOURCE's request id (the id `#sendSource` assigned synchronously via the
  // `#post` hook). Max reloads per load = 2; the error surfaces on the
  // (maxReloads + 1)-th decode error of the same load.

  /** attach + HELLO_OK → a ready host with a main-mode session. */
  function attachAndHandshake(): { host: SiaVideoSource; target: HTMLVideoElement; worker: FakeWorker; } {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    const target = document.createElement('video');
    host.attach(target);
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 1, type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    return { host, target, worker };
  }

  const mainInfo = { container: 'fmp4', durationSeconds: null, mime: DEFAULT_FMP4_MIME, mode: 'main', tracks: [] } as const;

  /** Loads `src` and acknowledges it (main-mode SOURCE_OK), returning its request id. */
  function loadAndAcknowledge(host: SiaVideoSource, worker: FakeWorker, src: string): number {
    host.src = src;
    // `filter` by the SOURCE discriminator narrows to the SOURCE variant
    // (inferred type predicate), so the id and src are directly readable.
    const source = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE).at(-1);
    if (!source) throw new Error('SOURCE was not sent');
    worker.reply({
      info: mainInfo,
      requestId: source.requestId,
      type: WorkerToMainMessageType.SOURCE_OK,
    });
    return source.requestId;
  }

  /** Request id of the newest SOURCE on the wire (the currently active load). */
  function newestSourceId(worker: FakeWorker): number {
    const source = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE).at(-1);
    if (!source) throw new Error('no SOURCE on the wire');
    return source.requestId;
  }

  it.skipIf(!IN_BROWSER)('reloads the source with a bounded replay after a decode error on the active load', () => {
    const { host, target, worker } = attachAndHandshake();
    const originalLoadId = loadAndAcknowledge(host, worker, 'k');
    // The element is playing, so the reload must resume playback (a paused
    // element would only get SOURCE + SEEK). Register the play intent first,
    // then clear the wire so it never pollutes the replay assertions below.
    target.dispatchEvent(new Event('play'));
    worker.sent.length = 0;

    // The host's most recent playhead: forwarded on timeupdate as PLAYHEAD,
    // and the recovery must reposition the reloaded source there.
    target.currentTime = 42.5;
    target.dispatchEvent(new Event('timeupdate'));
    expect(worker.sent.at(-1)).toMatchObject({ time: 42.5, type: MainToWorkerMessageType.PLAYHEAD });

    worker.reply({ context: 'append failed', kind: 'decode', requestId: originalLoadId, type: WorkerToMainMessageType.ERROR });

    const reloadSources = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE);
    expect(reloadSources).toHaveLength(1);
    expect(reloadSources[0]).toMatchObject({ src: 'k', type: MainToWorkerMessageType.SOURCE });
    expect(reloadSources[0].requestId).not.toBe(originalLoadId);

    // The replay is a bounded reposition-and-resume: SOURCE → SEEK (at the
    // last reported playhead) → PLAY, and both control messages name the NEW
    // load's request id.
    const seeks = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK);
    expect(seeks).toHaveLength(1);
    expect(seeks[0]).toMatchObject({ time: 42.5, type: MainToWorkerMessageType.SEEK });
    expect(seeks[0].requestId).toBe(reloadSources[0].requestId);

    const plays = worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY);
    expect(plays).toHaveLength(1);
    expect(plays[0].requestId).toBe(reloadSources[0].requestId);

    const postError = worker.sent.slice(worker.sent.findIndex((m) => m.type === MainToWorkerMessageType.SOURCE));
    expect(postError.map((m) => m.type)).toEqual([MainToWorkerMessageType.SOURCE, MainToWorkerMessageType.SEEK, MainToWorkerMessageType.PLAY]);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('seeks a fresh source to position 0, not the previous source playhead', () => {
    const { host, target, worker } = attachAndHandshake();
    loadAndAcknowledge(host, worker, 'k');

    // Play the first source to t=42.5 so the host remembers a non-zero playhead.
    target.currentTime = 42.5;
    target.dispatchEvent(new Event('timeupdate'));
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAYHEAD).at(-1)).toMatchObject({ time: 42.5 });

    // The user moves to a fresh source before anything else happens; the new
    // load must recover to its own position 0, never the old source's playhead.
    host.src = 'k2';
    const newLoadId = newestSourceId(worker);

    worker.reply({ context: 'append failed', kind: 'decode', requestId: newLoadId, type: WorkerToMainMessageType.ERROR });

    // The reload repositions the fresh source at the start, not at 42.5.
    const seeks = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK);
    expect(seeks.at(-1)).toMatchObject({ time: 0, type: MainToWorkerMessageType.SEEK });
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE).at(-1)).toMatchObject({ src: 'k2', type: MainToWorkerMessageType.SOURCE });
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('does not force playback when the user never asked to play', () => {
    const { host, target, worker } = attachAndHandshake();
    const originalLoadId = loadAndAcknowledge(host, worker, 'k');
    worker.sent.length = 0;

    // No native `play` ever happened: the element is paused and the host holds
    // no play intent, so the recovery must repair the load without restarting
    // playback behind the user's back.
    expect(target.paused).toBe(true);

    worker.reply({ context: 'append failed', kind: 'decode', requestId: originalLoadId, type: WorkerToMainMessageType.ERROR });

    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY)).toHaveLength(0);
    // The load itself still recovers: a fresh SOURCE plus a SEEK to position 0.
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(1);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK).at(-1)).toMatchObject({ time: 0, type: MainToWorkerMessageType.SEEK });
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('keeps playback intent across recovery', () => {
    const { host, target, worker } = attachAndHandshake();
    const originalLoadId = loadAndAcknowledge(host, worker, 'k');
    worker.sent.length = 0;

    // A user `play` registers intent the recovery must carry over.
    target.dispatchEvent(new Event('play'));
    target.currentTime = 12.5;
    target.dispatchEvent(new Event('timeupdate'));

    worker.reply({ context: 'append failed', kind: 'decode', requestId: originalLoadId, type: WorkerToMainMessageType.ERROR });

    const reloadSources = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE);
    expect(reloadSources).toHaveLength(1);
    expect(reloadSources[0].requestId).not.toBe(originalLoadId);

    // The reload repositions at the remembered playhead, naming the new request id.
    const seeks = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK);
    expect(seeks).toHaveLength(1);
    expect(seeks[0]).toMatchObject({ time: 12.5, type: MainToWorkerMessageType.SEEK });
    expect(seeks[0].requestId).toBe(reloadSources[0].requestId);

    // ...and playback resumes on the NEW load's request id.
    const plays = worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY);
    expect(plays.at(-1)).toMatchObject({ requestId: reloadSources[0].requestId, type: MainToWorkerMessageType.PLAY });
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('seeks subsequent recoveries on the reloaded load back to the original watch position', () => {
    const { host, target, worker } = attachAndHandshake();
    const idA = loadAndAcknowledge(host, worker, 'k');

    // The user is watching at t=12.5 and playback (play intent) must survive
    // every reload: the reloaded source must SEEK back here each time.
    target.currentTime = 12.5;
    target.dispatchEvent(new Event('timeupdate'));
    target.dispatchEvent(new Event('play'));
    worker.sent.length = 0;

    // Decode error #1 on the active load A → reload 1: a fresh SOURCE (id B),
    // a SEEK back to the captured playhead, and a PLAY on the new load.
    worker.reply({ context: 'append failed', kind: 'decode', requestId: idA, type: WorkerToMainMessageType.ERROR });
    const idB = newestSourceId(worker);
    const firstReloadSeeks = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK);
    expect(firstReloadSeeks).toHaveLength(1);
    expect(firstReloadSeeks[0]).toMatchObject({ time: 12.5, type: MainToWorkerMessageType.SEEK });
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY).at(-1)).toMatchObject({ requestId: idB, type: MainToWorkerMessageType.PLAY });

    // The reloaded element stays stalled — the worker's MediaSource died under
    // it, so no further `timeupdate` fires and the host's last known watch
    // position remains 12.5. No SOURCE_OK is needed for load B to trigger the
    // next recovery: it is request-scoped to the active load either way.
    worker.sent.length = 0;

    // Decode error #2 on the reloaded load B → reload 2 must seek to the SAME
    // watch position, not back to 0 as if the position had been lost.
    worker.reply({ context: 'append failed', kind: 'decode', requestId: idB, type: WorkerToMainMessageType.ERROR });
    const secondReloadSeeks = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK);
    expect(secondReloadSeeks).toHaveLength(1);
    expect(secondReloadSeeks[0]).toMatchObject({ time: 12.5, type: MainToWorkerMessageType.SEEK });
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('reports the decode error to the UI only after recovery attempts are exhausted', () => {
    const { host, worker } = attachAndHandshake();
    const initialLoadId = loadAndAcknowledge(host, worker, 'k');
    worker.sent.length = 0;

    let errorEvents = 0;
    host.addEventListener('error', () => errorEvents++);

    // Decode error #1 on the active load → reload 1; no surface yet.
    worker.reply({ context: 'append failed', kind: 'decode', requestId: initialLoadId, type: WorkerToMainMessageType.ERROR });
    expect(errorEvents).toBe(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(1);

    // Decode error #2 on the recovered load → reload 2; still no surface.
    worker.reply({ context: 'append failed', kind: 'decode', requestId: newestSourceId(worker), type: WorkerToMainMessageType.ERROR });
    expect(errorEvents).toBe(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(2);

    // Decode error #3 (max reloads = 2 exhausted) → surfaces with
    // MEDIA_ERR_DECODE, and no third reload is attempted.
    worker.reply({ context: 'append failed', kind: 'decode', requestId: newestSourceId(worker), type: WorkerToMainMessageType.ERROR });
    expect(errorEvents).toBe(1);
    expect(host.error?.code).toBe(3);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(2);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('resets the recovery budget after a successful SOURCE_OK', () => {
    const { host, worker } = attachAndHandshake();
    const initialLoadId = loadAndAcknowledge(host, worker, 'k');
    worker.sent.length = 0;

    let errorEvents = 0;
    host.addEventListener('error', () => errorEvents++);

    // Decode error #1 → reload 1.
    worker.reply({ context: 'append failed', kind: 'decode', requestId: initialLoadId, type: WorkerToMainMessageType.ERROR });
    expect(errorEvents).toBe(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(1);

    // The recovered load acknowledges cleanly: the budget resets, so a later
    // decode error gets a fresh run of reloads instead of surfacing at once.
    const recoveredLoadId = newestSourceId(worker);
    worker.reply({ info: mainInfo, requestId: recoveredLoadId, type: WorkerToMainMessageType.SOURCE_OK });

    // Decode error #2 → reload 2 (budget restarted).
    worker.reply({ context: 'append failed', kind: 'decode', requestId: recoveredLoadId, type: WorkerToMainMessageType.ERROR });
    expect(errorEvents).toBe(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(2);

    // Decode error #3 → reload 3.
    worker.reply({ context: 'append failed', kind: 'decode', requestId: newestSourceId(worker), type: WorkerToMainMessageType.ERROR });
    expect(errorEvents).toBe(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(3);

    // Decode error #4 → exhausted (3 total reloads across the test), surfaces.
    worker.reply({ context: 'append failed', kind: 'decode', requestId: newestSourceId(worker), type: WorkerToMainMessageType.ERROR });
    expect(errorEvents).toBe(1);
    expect(host.error?.code).toBe(3);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('does not reload on decode errors for a superseded load', () => {
    const { host, worker } = attachAndHandshake();
    const supersededLoadId = loadAndAcknowledge(host, worker, 'k');

    let errorEvents = 0;
    host.addEventListener('error', () => errorEvents++);

    // The user moves on to a new source before the old load fails.
    host.src = 'k2';
    const sourcesBeforeError = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE);
    expect(sourcesBeforeError.map((s) => s.src)).toEqual(['k', 'k2']);

    // The stale load's late decode error must neither reload nor surface:
    // recovery is scoped to the ACTIVE load only.
    worker.reply({ context: 'stale append failed', kind: 'decode', requestId: supersededLoadId, type: WorkerToMainMessageType.ERROR });
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(2);
    expect(errorEvents).toBe(0);
    expect(host.error).toBeNull();
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('does not reload for non-decode kinds', () => {
    const { host, worker } = attachAndHandshake();
    const initialLoadId = loadAndAcknowledge(host, worker, 'k');
    worker.sent.length = 0;

    let errorEvents = 0;
    host.addEventListener('error', () => errorEvents++);

    // A network-class failure on the active load is fatal as-is: no replay,
    // surfaced immediately with MEDIA_ERR_NETWORK. Only `decode` reloads.
    worker.reply({ context: 'network down', kind: 'network', requestId: initialLoadId, type: WorkerToMainMessageType.ERROR });
    expect(errorEvents).toBe(1);
    expect(host.error?.code).toBe(2);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(0);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('clears recovery state on a fresh src', () => {
    const { host, worker } = attachAndHandshake();
    const kLoadId = loadAndAcknowledge(host, worker, 'k');

    let errorEvents = 0;
    host.addEventListener('error', () => errorEvents++);

    // Exhaust the recovery budget for 'k': decode error #1 → reload, #2 →
    // reload, #3 → surface with MEDIA_ERR_DECODE.
    worker.reply({ context: 'append failed', kind: 'decode', requestId: kLoadId, type: WorkerToMainMessageType.ERROR });
    worker.reply({ context: 'append failed', kind: 'decode', requestId: newestSourceId(worker), type: WorkerToMainMessageType.ERROR });
    worker.reply({ context: 'append failed', kind: 'decode', requestId: newestSourceId(worker), type: WorkerToMainMessageType.ERROR });
    expect(errorEvents).toBe(1);
    expect(host.error?.code).toBe(3);

    // A fresh source must not inherit the exhausted budget: assigning a new
    // src restarts recovery from a full set of reloads.
    host.src = 'k2';
    const k2Sources = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE).filter((m) => m.src === 'k2');
    expect(k2Sources).toHaveLength(1);
    worker.reply({ info: mainInfo, requestId: k2Sources[0].requestId, type: WorkerToMainMessageType.SOURCE_OK });

    // Decode error on the fresh load → reload happens again (not 0, and not
    // surfacing immediately from the old exhausted budget).
    worker.reply({ context: 'append failed', kind: 'decode', requestId: k2Sources[0].requestId, type: WorkerToMainMessageType.ERROR });
    expect(errorEvents).toBe(1);
    worker.reply({ context: 'append failed', kind: 'decode', requestId: newestSourceId(worker), type: WorkerToMainMessageType.ERROR });
    expect(errorEvents).toBe(1);
    worker.reply({ context: 'append failed', kind: 'decode', requestId: newestSourceId(worker), type: WorkerToMainMessageType.ERROR });
    expect(errorEvents).toBe(2);
    // The fresh load gets its own full budget (2 reloads, then surface): the
    // initial k2 SOURCE plus both reload attempts = 3 k2 SOURCE messages.
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE).filter((m) => m.src === 'k2')).toHaveLength(3);
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

/** Lets queued microtasks/timers from pipe pumps and appends flush out. */
function settle(rounds = 8): Promise<void> {
  return new Promise((resolve) => {
    const tick = (left: number) =>
      setTimeout(() => {
        if (left <= 0) resolve();
        else tick(left - 1);
      }, 0);
    tick(rounds);
  });
}
