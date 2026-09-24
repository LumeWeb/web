import type { AppMetadata } from '@siafoundation/sia-storage';
import { describe, expect, it, vi } from 'vitest';
import {
  decryptAppKeyEnvelope,
  exportWorkerPublicKey,
  generateWorkerKeyPair,
} from '../app-key-handshake.ts';
import { MseAppendPipe } from '../mse-pipe.ts';
import { type AppKeyEnvelope, DEFAULT_FMP4_MIME, isAppKeyEnvelope, type MainToWorkerMessage, MainToWorkerMessageType, PROTOCOL_VERSION, WORKER_PUBLIC_KEY_LENGTH, type WorkerToMainMessage, WorkerToMainMessageType } from '../protocol.ts';
import {
  type RecoveryChangeDetail,
  siaRecoveryChange,
  siaVideoDefaultProps,
  SiaVideoSource,
} from '../sia-video-source.ts';

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

  it.skipIf(!IN_BROWSER)('forwards native play and seek events to the worker', () => {
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
    // envelope is built (like the app-key seed discipline).
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
    // be captured before the handshake (same as the single-envelope tests).
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

  it.skipIf(!IN_BROWSER)('a play issued during re-attach is re-sent once the new pipeline is ready', () => {
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
    // flushed behind it, matching the live player's first-load ordering.
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

  it.skipIf(!IN_BROWSER)('does not resume a playback the user deliberately paused before the re-attach', async () => {
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
    // With no seeking following it, the pause settles as deliberate on the next
    // task — the ATTACH_OK replay must read it as the user's stopped choice.
    await settle();

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

  it.skipIf(!IN_BROWSER)('re-attaching resumes a video that was already playing', () => {
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

  it.skipIf(!IN_BROWSER)('pressing play after pausing is still honored across a re-attach', () => {
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

  it.skipIf(!IN_BROWSER)('an ENDED that does not match the active load is ignored', async () => {
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
    const assignedOffsets: number[] = [];
    const timestampOffsetSpy = vi.spyOn(SourceBuffer.prototype, 'timestampOffset', 'set').mockImplementation(function (this: SourceBuffer, value: number) {
      assignedOffsets.push(value);
      timestampOffsetDescriptor?.set?.call(this, value);
    });

    // Forward seek: the host resets the pipe for the new position, the
    // quiesced SourceBuffer's segment parser is aborted so the worker's fresh
    // fragment starts a new segment (the main-thread regression from the
    // ac55a7b0 parser-reset change), and the buffer is repointed at the new
    // currentTime so the trimmed output's zero-based timestamps land there.
    target.currentTime = 45;
    target.dispatchEvent(new Event('seeking'));
    expect(worker.sent.at(-1)).toMatchObject({ time: 45, type: MainToWorkerMessageType.SEEK });
    await settle(4);
    expect(abortSpy).toHaveBeenCalledTimes(1);
    expect(assignedOffsets).toEqual([45]);

    // Backward seek: another reset, another parser abort, same buffer reused.
    target.currentTime = 10;
    target.dispatchEvent(new Event('seeking'));
    expect(worker.sent.at(-1)).toMatchObject({ time: 10, type: MainToWorkerMessageType.SEEK });
    await settle(4);
    expect(abortSpy).toHaveBeenCalledTimes(2);
    expect(assignedOffsets).toEqual([45, 10]);

    // Forward again: rapid repeated seeks each reset the shared pipe exactly
    // once — never re-entering, and never tearing the pipeline down — and each
    // repoints the buffer at its own currentTime.
    target.currentTime = 30;
    target.dispatchEvent(new Event('seeking'));
    expect(worker.sent.at(-1)).toMatchObject({ time: 30, type: MainToWorkerMessageType.SEEK });
    await settle(4);
    expect(abortSpy).toHaveBeenCalledTimes(3);
    expect(assignedOffsets).toEqual([45, 10, 30]);

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

  it.skipIf(!IN_BROWSER)('trims the back buffer through the shared pipe on playhead advance', async () => {
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

    // The back-buffer cap: every native timeupdate routes into the shared
    // pipe's eviction path, which derives the removal range from the
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

  it.skipIf(!IN_BROWSER)('a decode error restarts the stream at the same spot, at most twice', () => {
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

  it.skipIf(!IN_BROWSER)('does not auto-play a fresh source that loads behind a previously played one', () => {
    const { host, target, worker } = attachAndHandshake();
    // The user plays the first source, which records that a play was requested
    // for it; the fresh source that loads afterwards is never played itself.
    loadAndAcknowledge(host, worker, 'k');
    target.dispatchEvent(new Event('play'));
    target.currentTime = 12.5;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;

    host.src = 'k2';
    const freshLoadId = newestSourceId(worker);
    worker.sent.length = 0;

    // The never-played fresh source decode-errors: its recovery repairs the
    // load (fresh SOURCE + SEEK to 0) but must stay paused — the earlier
    // source's play must not leak into an unsolicited PLAY for this one.
    worker.reply({ context: 'append failed', kind: 'decode', requestId: freshLoadId, type: WorkerToMainMessageType.ERROR });

    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(1);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK).at(-1)).toMatchObject({
      time: 0,
      type: MainToWorkerMessageType.SEEK,
    });
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('a decode error does not stop a video that was already playing', () => {
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

  it.skipIf(!IN_BROWSER)('later recovery reloads seek back to the same watch position', () => {
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

  it.skipIf(!IN_BROWSER)('a stream that never plays keeps failing through the same two reloads', () => {
    const { host, worker } = attachAndHandshake();
    const initialLoadId = loadAndAcknowledge(host, worker, 'k');
    worker.sent.length = 0;

    let errorEvents = 0;
    host.addEventListener('error', () => errorEvents++);

    // Decode error #1 → reload 1 (the same broken object, budget now 1).
    worker.reply({ context: 'append failed', kind: 'decode', requestId: initialLoadId, type: WorkerToMainMessageType.ERROR });
    expect(errorEvents).toBe(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(1);

    // The reloaded load acknowledges cleanly — but it has not played, so the
    // budget must stay intact. Resetting here is exactly what let a persistently
    // broken object loop at attempt=1 forever. Decode error #2 on the same
    // object → reload 2, never a fresh budget.
    const recoveredLoadId = newestSourceId(worker);
    worker.reply({ info: mainInfo, requestId: recoveredLoadId, type: WorkerToMainMessageType.SOURCE_OK });
    worker.reply({ context: 'append failed', kind: 'decode', requestId: recoveredLoadId, type: WorkerToMainMessageType.ERROR });
    expect(errorEvents).toBe(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(2);

    // Decode error #3 → exhausted (2 reloads total, never a third attempt=1
    // loop): the failure surfaces and reloading stops for good.
    worker.reply({ context: 'append failed', kind: 'decode', requestId: newestSourceId(worker), type: WorkerToMainMessageType.ERROR });
    expect(errorEvents).toBe(1);
    expect(host.error?.code).toBe(3);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(2);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('once a recovered stream plays, the next error gets two fresh reloads again', () => {
    const { host, target, worker } = attachAndHandshake();
    const initialLoadId = loadAndAcknowledge(host, worker, 'k');
    worker.sent.length = 0;

    let errorEvents = 0;
    host.addEventListener('error', () => errorEvents++);

    // Decode error #1 → reload 1.
    worker.reply({ context: 'append failed', kind: 'decode', requestId: initialLoadId, type: WorkerToMainMessageType.ERROR });
    expect(errorEvents).toBe(0);

    // The recovered load acknowledges cleanly AND then genuinely plays: the
    // playhead advances past the recovery anchor, which is the only thing that
    // proves the load "actually played" and may restore the budget.
    const recoveredLoadId = newestSourceId(worker);
    worker.reply({ info: mainInfo, requestId: recoveredLoadId, type: WorkerToMainMessageType.SOURCE_OK });
    target.currentTime = 1.5;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;

    // From here the budget is restored: decode error #2 → reload 1 again (a
    // fresh run), not an instant surfacing.
    worker.reply({ context: 'append failed', kind: 'decode', requestId: recoveredLoadId, type: WorkerToMainMessageType.ERROR });
    expect(errorEvents).toBe(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(1);

    // Decode error #3 → reload 2; error #4 → exhausted → surfaces.
    worker.reply({ context: 'append failed', kind: 'decode', requestId: newestSourceId(worker), type: WorkerToMainMessageType.ERROR });
    expect(errorEvents).toBe(0);
    worker.reply({ context: 'append failed', kind: 'decode', requestId: newestSourceId(worker), type: WorkerToMainMessageType.ERROR });
    expect(errorEvents).toBe(1);
    expect(host.error?.code).toBe(3);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('pausing during a stream error keeps the video paused until you press play', async () => {
    // The user paused mid-watch at a positive playhead, then the load
    // decode-errorred. The old behavior treated the positive playhead alone
    // as "was watching" and re-issued PLAY every recovery — the observed
    // auto-resume loop (307→338 s while "paused"). The new contract: a
    // deliberate pause is authoritative. The recovery must not reload behind
    // the user's back (a fresh download for a stream nothing is consuming),
    // must not send PLAY, and must repair the pipeline only when the user
    // actually asks to play again.
    const { host, target, worker } = attachAndHandshake();
    const originalLoadId = loadAndAcknowledge(host, worker, 'k');
    worker.sent.length = 0;

    // Play (intent live), advance to 12.5, then a deliberate pause supersedes
    // it: the element is now user-paused at a positive watch position.
    target.dispatchEvent(new Event('pause'));
    target.dispatchEvent(new Event('play')); // intent is live
    target.currentTime = 12.5;
    target.dispatchEvent(new Event('timeupdate'));
    target.dispatchEvent(new Event('pause')); // deliberate pause supersedes it
    expect(target.paused).toBe(true);
    // With no seek following it, the pause settles as deliberate on the next
    // task; the worker error arrives after that settling.
    await settle();
    worker.sent.length = 0;

    worker.reply({ context: 'append failed', kind: 'decode', requestId: originalLoadId, type: WorkerToMainMessageType.ERROR });

    // No reload, no replay: the paused load's failures are deferred, so the
    // host posts nothing and certainly never auto-resumes.
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY)).toHaveLength(0);

    // And it does not spin while the user stays paused: a second report of the
    // same dead load still defers, spending no reload budget and posting no
    // messages (nothing new was started to fail again).
    worker.reply({ context: 'append failed', kind: 'decode', requestId: originalLoadId, type: WorkerToMainMessageType.ERROR });
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY)).toHaveLength(0);

    // The explicit PLAY is the one signal that may resume: it repairs the dead
    // pipeline — fresh SOURCE → SEEK back to the deferred resume point → PLAY.
    target.dispatchEvent(new Event('play'));
    const reloadSources = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE);
    expect(reloadSources).toHaveLength(1);
    expect(reloadSources[0]).toMatchObject({ src: 'k', type: MainToWorkerMessageType.SOURCE });
    const resumedSeeks = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK);
    expect(resumedSeeks.at(-1)).toMatchObject({ time: 12.5, type: MainToWorkerMessageType.SEEK });
    expect(resumedSeeks.at(-1)?.requestId).toBe(reloadSources[0].requestId);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY).at(-1)).toMatchObject({
      requestId: reloadSources[0].requestId,
      type: MainToWorkerMessageType.PLAY,
    });
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('pausing again after a recovered stream starts still leaves it paused', async () => {
    // Regression guard for the full observed lifecycle: un-pause (recovery
    // reload + PLAY), then pause again — the new load's own decode failure
    // must defer again instead of auto-resuming.
    const { host, target, worker } = attachAndHandshake();
    const originalLoadId = loadAndAcknowledge(host, worker, 'k');
    worker.sent.length = 0;

    // Play → watch at 12.5 → pause (deferred; settles on the next task).
    target.dispatchEvent(new Event('play'));
    target.currentTime = 12.5;
    target.dispatchEvent(new Event('timeupdate'));
    target.dispatchEvent(new Event('pause'));
    await settle();
    worker.sent.length = 0;
    worker.reply({ context: 'append failed', kind: 'decode', requestId: originalLoadId, type: WorkerToMainMessageType.ERROR });
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(0);

    // The user plays: recovery reload runs (id B), whose load now plays.
    target.dispatchEvent(new Event('play'));
    const reloadedLoadId = newestSourceId(worker);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY).at(-1)).toMatchObject({
      requestId: reloadedLoadId,
      type: MainToWorkerMessageType.PLAY,
    });
    worker.reply({ info: mainInfo, requestId: reloadedLoadId, type: WorkerToMainMessageType.SOURCE_OK });

    // The reloaded load is watched past its resume point, then the user pauses
    // AGAIN — and its decode failure defers (no reload, no PLAY) rather than
    // re-issuing PLAY on the same breakage.
    target.currentTime = 13;
    target.dispatchEvent(new Event('timeupdate'));
    target.dispatchEvent(new Event('pause'));
    await settle(); // this pause settles as deliberate too
    worker.sent.length = 0;
    worker.reply({ context: 'append failed', kind: 'decode', requestId: reloadedLoadId, type: WorkerToMainMessageType.ERROR });
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY)).toHaveLength(0);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('the pause used while restarting is not mistaken for the user pressing pause', () => {
    // The recovery's own teardown fires a native `pause` (observed at
    // 12:57:29.136 in the live log, right before the spurious `ended`). That
    // pause must NOT flip the load into the deferred/user-paused bucket, or an
    // ACTIVE recovery would start deferring and the legitimate
    // playing-recovery would break. The `#recovering` guard keeps it inert, so
    // a second decode error on the reloaded (still-playing) load keeps reloading
    // with PLAY.
    const { host, target, worker } = attachAndHandshake();
    const originalLoadId = loadAndAcknowledge(host, worker, 'k');
    worker.sent.length = 0;

    // Active playback intent; the decode error starts a recovery reload.
    target.dispatchEvent(new Event('play'));
    target.currentTime = 12.5;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;
    worker.reply({ context: 'append failed', kind: 'decode', requestId: originalLoadId, type: WorkerToMainMessageType.ERROR });
    const reloadedLoadId = newestSourceId(worker);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY).at(-1)).toMatchObject({
      requestId: reloadedLoadId,
      type: MainToWorkerMessageType.PLAY,
    });

    // The engine's teardown fires an incidental pause while `#recovering`
    // holds; it must not clear intent, arm `#userPaused`, or defer anything.
    target.dispatchEvent(new Event('pause'));
    worker.sent.length = 0;

    // The reloaded (still playing) load errors again: the recovery still
    // reloads AND plays — the incidental pause changed nothing.
    worker.reply({ context: 'append failed', kind: 'decode', requestId: reloadedLoadId, type: WorkerToMainMessageType.ERROR });
    const secondReloadId = newestSourceId(worker);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(1);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY).at(-1)).toMatchObject({
      requestId: secondReloadId,
      type: MainToWorkerMessageType.PLAY,
    });
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK).at(-1)).toMatchObject({
      time: 12.5,
      type: MainToWorkerMessageType.SEEK,
    });
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('a late decode error from a replaced load neither reloads nor surfaces', () => {
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

  it.skipIf(!IN_BROWSER)('non-recoverable error kinds surface immediately without a reload', () => {
    const { host, worker } = attachAndHandshake();
    const initialLoadId = loadAndAcknowledge(host, worker, 'k');
    worker.sent.length = 0;

    let errorEvents = 0;
    host.addEventListener('error', () => errorEvents++);

    // An `unsupported` failure (unknown container/codec, or a normalization
    // failure mapped away from recovery) is fatal as-is: no replay, surfaced
    // immediately with MEDIA_ERR_SRC_NOT_SUPPORTED. Only `decode` and
    // `network` (the transport/recovery kinds) reload.
    worker.reply({ context: 'no supported tracks', kind: 'unsupported', requestId: initialLoadId, type: WorkerToMainMessageType.ERROR });
    expect(errorEvents).toBe(1);
    expect(host.error?.code).toBe(4);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(0);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('a network error surfaces immediately without reloading, and explicit play starts a fresh source', () => {
    // A `network` ERROR is the wire form of a transport/ranged-read failure
    // whose in-reader retries are already exhausted. Unlike a decode incident,
    // the host must NOT keep reloading behind the network: it surfaces
    // MEDIA_ERR_NETWORK at once, and only an explicit user play restarts.
    const { host, target, worker } = attachAndHandshake();
    const originalLoadId = loadAndAcknowledge(host, worker, 'k');
    target.dispatchEvent(new Event('play'));
    target.currentTime = 42.5;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;

    let errorEvents = 0;
    host.addEventListener('error', () => errorEvents++);

    worker.reply({ context: 'Sia SDK ranged read failed after 3 attempts', kind: 'network', requestId: originalLoadId, type: WorkerToMainMessageType.ERROR });

    // One surface, MEDIA_ERR_NETWORK, and no automatic reload or seek or play.
    expect(errorEvents).toBe(1);
    expect(host.error?.code).toBe(2);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY)).toHaveLength(0);

    // Pressing play is the one signal that starts a fresh source: it restarts
    // from the position where the network died and resumes playback.
    target.dispatchEvent(new Event('play'));
    const reloadSources = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE);
    expect(reloadSources).toHaveLength(1);
    expect(reloadSources[0]).toMatchObject({ src: 'k', type: MainToWorkerMessageType.SOURCE });
    expect(reloadSources[0].requestId).not.toBe(originalLoadId);
    const seeks = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK);
    expect(seeks).toHaveLength(1);
    expect(seeks[0]).toMatchObject({ time: 42.5, type: MainToWorkerMessageType.SEEK });
    expect(seeks[0].requestId).toBe(reloadSources[0].requestId);
    const plays = worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY);
    expect(plays).toHaveLength(1);
    expect(plays[0].requestId).toBe(reloadSources[0].requestId);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('a second network error from the same incident neither surfaces again nor reloads', () => {
    const { host, worker } = attachAndHandshake();
    const initialLoadId = loadAndAcknowledge(host, worker, 'k');
    worker.sent.length = 0;

    let errorEvents = 0;
    host.addEventListener('error', () => errorEvents++);

    // The first transport failure surfaces MEDIA_ERR_NETWORK once and reloads
    // nothing.
    worker.reply({ context: 'network down', kind: 'network', requestId: initialLoadId, type: WorkerToMainMessageType.ERROR });
    expect(errorEvents).toBe(1);
    expect(host.error?.code).toBe(2);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(0);

    // The same failed load reporting again is the same incident's echo: it
    // must not surface a second error and must not start an auto-reload.
    worker.reply({ context: 'network down', kind: 'network', requestId: initialLoadId, type: WorkerToMainMessageType.ERROR });
    expect(errorEvents).toBe(1);
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

  it.skipIf(!IN_BROWSER)('moves the element back to the resume position once the replacement resource attaches', () => {
    // The recovery never writes `currentTime` on the superseded pipeline (see
    // the "no land-at-duration" test below — that write is what clamps the
    // seek to the stream end). Instead it holds the resume position and applies
    // it once at the FRESH load's resource attach (main-mode SOURCE_OK →
    // beginMainThreadMse), where readyState is HAVE_NOTHING and the write
    // lands on the fresh resource.
    const { host, target, worker } = attachAndHandshake();
    const originalLoadId = loadAndAcknowledge(host, worker, 'k');
    worker.sent.length = 0;

    // Mid-watch playback, then a decode error → recovery reload.
    target.dispatchEvent(new Event('play'));
    target.currentTime = 42;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;
    worker.reply({ context: 'append failed', kind: 'decode', requestId: originalLoadId, type: WorkerToMainMessageType.ERROR });

    // The replacement resource boots the element at 0 anyway (the intervening
    // resource swap resets the playhead), exactly the stranded state this
    // guards.
    target.currentTime = 0;

    // The reloaded load's SOURCE_OK attaches the fresh object URL in main
    // mode; the element must be restored to the resume position, not left
    // at 0 with the worker buffering at 42.
    worker.reply({ info: mainInfo, requestId: newestSourceId(worker), type: WorkerToMainMessageType.SOURCE_OK });
    expect(target.currentTime).toBe(42);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('restarting a stream does not throw the player to the end of the video', () => {
    // The eager `currentTime = resumeSeconds` write on the superseded load
    // (readyState ≥ HAVE_METADATA, its worker MediaSource already torn down →
    // seekable empty but cached duration present) makes Chromium clamp the
    // seek into the cached END → spurious `ended` → emptied/loadstart cascade,
    // and only the next attempt lands at the resume point. So the host writes
    // currentTime ONLY when the fresh resource exposes a usable state — at its
    // attach — and the worker repositions its own stream at the resume point
    // via the SEEK it already received (its `pendingSeekTarget` flow). The
    // element must sit untouched (here at a sentinel far from both the resume
    // point and the vouched duration) until the fresh attach, then land on the
    // resume point — never the duration.
    const { host, target, worker } = attachAndHandshake();
    const originalLoadId = loadAndAcknowledge(host, worker, 'k');
    worker.sent.length = 0;

    // Playing at 12.5 with a vouched 60s duration (so "landing at 12.5" and
    // "landing at duration 60" are distinguishable).
    worker.reply({ info: { ...mainInfo, durationSeconds: 60 }, requestId: originalLoadId, type: WorkerToMainMessageType.SOURCE_OK });
    target.dispatchEvent(new Event('play'));
    target.currentTime = 12.5;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;

    // Leave a sentinel on currentTime: with the (removed) eager write, the
    // recovery would have snapped it to 12.5 (or, in a real browser, to the
    // cached duration); the fixed recovery must not touch it at all.
    target.currentTime = 999;
    worker.reply({ context: 'append failed', kind: 'decode', requestId: originalLoadId, type: WorkerToMainMessageType.ERROR });

    // No synchronous write: the element still sits at the sentinel. The
    // worker-side SEEK is what repositions the fresh stream.
    expect(target.currentTime).toBe(999);
    const seeks = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK);
    expect(seeks).toHaveLength(1);
    expect(seeks[0]).toMatchObject({ time: 12.5, type: MainToWorkerMessageType.SEEK });

    // The fresh resource attaches (main-mode SOURCE_OK) — only here may the
    // host position the element, at the resume point, never at the 60s duration.
    worker.reply({ info: { ...mainInfo, durationSeconds: 60 }, requestId: newestSourceId(worker), type: WorkerToMainMessageType.SOURCE_OK });
    expect(target.currentTime).toBe(12.5);
    expect(target.currentTime).not.toBe(60);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('a seek far past the duration restarts without landing the player at the stream end', () => {
    // Same guard on the seek-restart path: `#recoverFromOutOfWindowSeek`
    // must not write currentTime on the superseded load either -- writing there
    // (readyState >= HAVE_METADATA, torn-down MediaSource, cached duration
    // present) lets Chromium clamp the seek to the stream end. Only the write
    // at the fresh attach may position the element at the target.
    const { host, target, worker } = attachAndHandshake();
    loadAndAcknowledge(host, worker, 'k');
    worker.reply({ info: { ...mainInfo, durationSeconds: 60 }, requestId: newestSourceId(worker), type: WorkerToMainMessageType.SOURCE_OK });
    worker.sent.length = 0;

    target.dispatchEvent(new Event('play'));
    // A far seek past the vouched duration (60s): the element is left at the
    // user's target. An eager write on the superseded load would snap it
    // to the cached duration (60) -- the fixed recovery must leave it exactly
    // where the seek put it, untouched until the fresh attach positions it.
    target.currentTime = 120;
    target.dispatchEvent(new Event('seeking'));
    expect(target.currentTime).toBe(120);

    const reloadSources = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE);
    expect(reloadSources).toHaveLength(1);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK).at(-1)).toMatchObject({
      time: 120,
      type: MainToWorkerMessageType.SEEK,
    });

    // The fresh attach positions the element at the target, never at the
    // cached duration the clamped seek would have landed on.
    worker.reply({ info: { ...mainInfo, durationSeconds: 60 }, requestId: newestSourceId(worker), type: WorkerToMainMessageType.SOURCE_OK });
    expect(target.currentTime).toBe(120);
    expect(target.currentTime).not.toBe(60);
    host.destroy();
  });
});

describe('native media element error handling', () => {
  // The element itself can fire a native `error` (MEDIA_ERR_SRC_NOT_SUPPORTED /
  // PIPELINE_ERROR_COULD_NOT_RENDER) even though the worker may or may not also
  // post a decode ERROR. The host must not treat every native failure as a
  // reason to reboot the stream: an explicitly paused video stays idle, and only
  // a load that is actually consuming bytes (or a user who asks for playback
  // again) gets the bounded repair. The first three tests never touch the worker
  // at all — every error there is a NATIVE element error, so they exercise the
  // host's own element handling, not the worker's decode ERROR echo.

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

  it.skipIf(!IN_BROWSER)('pressing play after a paused video\u2019s native failure repairs it once from the paused spot', async () => {
    const { host, target, worker } = attachAndHandshake();
    const originalLoadId = loadAndAcknowledge(host, worker, 'k');
    let errorEvents = 0;
    host.addEventListener('error', () => errorEvents++);
    worker.sent.length = 0;

    // The user watched to 12.5, then deliberately paused: idle, no play intent.
    target.dispatchEvent(new Event('play'));
    target.currentTime = 12.5;
    target.dispatchEvent(new Event('timeupdate'));
    target.dispatchEvent(new Event('pause'));
    // The deliberate pause settles on the next task before the pipeline dies.
    await settle();
    worker.sent.length = 0;

    // The dead pipeline surfaces natively while the video sits paused — twice,
    // like the element retrying the same render failure.
    target.dispatchEvent(new Event('error'));
    target.dispatchEvent(new Event('error'));

    // An idle paused pipeline never reboots and never surfaces while it sits.
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY)).toHaveLength(0);
    expect(errorEvents).toBe(0);
    expect(host.error).toBeNull();

    // Pressing play is the one signal that may resume: it repairs the dead
    // pipeline exactly once — fresh SOURCE, SEEK back to the paused spot, PLAY —
    // no matter how many times the native error echoed while it was idle.
    target.dispatchEvent(new Event('play'));
    const reloadSources = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE);
    expect(reloadSources).toHaveLength(1);
    expect(reloadSources[0]).toMatchObject({ src: 'k', type: MainToWorkerMessageType.SOURCE });
    expect(reloadSources[0].requestId).not.toBe(originalLoadId);
    const seeks = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK);
    expect(seeks).toHaveLength(1);
    expect(seeks[0]).toMatchObject({ time: 12.5, type: MainToWorkerMessageType.SEEK });
    expect(seeks[0].requestId).toBe(reloadSources[0].requestId);
    const plays = worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY);
    expect(plays).toHaveLength(1);
    expect(plays[0].requestId).toBe(reloadSources[0].requestId);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('seeking while a failed video is paused repairs it at the new position without starting playback', async () => {
    const { host, target, worker } = attachAndHandshake();
    loadAndAcknowledge(host, worker, 'k');
    worker.sent.length = 0;

    // Watched to 12.5, then deliberately paused.
    target.dispatchEvent(new Event('play'));
    target.currentTime = 12.5;
    target.dispatchEvent(new Event('timeupdate'));
    target.dispatchEvent(new Event('pause'));
    // The deliberate pause settles on the next task before the pipeline dies.
    await settle();
    worker.sent.length = 0;

    // The pipeline died natively while idle-paused; the user then scrubs to 40.
    target.dispatchEvent(new Event('error'));
    target.currentTime = 40;
    target.dispatchEvent(new Event('seeking'));

    // The scrub repairs at the new target — fresh SOURCE plus a SEEK there — but
    // a scrub of a paused element implies no play, so no PLAY is issued.
    const reloadSources = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE);
    expect(reloadSources).toHaveLength(1);
    expect(reloadSources[0]).toMatchObject({ src: 'k', type: MainToWorkerMessageType.SOURCE });
    const seeks = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK);
    expect(seeks).toHaveLength(1);
    expect(seeks[0]).toMatchObject({ time: 40, type: MainToWorkerMessageType.SEEK });
    expect(seeks[0].requestId).toBe(reloadSources[0].requestId);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY)).toHaveLength(0);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('a native element error while playing restarts the stream at the same spot without stacking reloads', () => {
    const { host, target, worker } = attachAndHandshake();
    const originalLoadId = loadAndAcknowledge(host, worker, 'k');
    let errorEvents = 0;
    host.addEventListener('error', () => errorEvents++);

    // The element is playing at 42.5.
    target.dispatchEvent(new Event('play'));
    target.currentTime = 42.5;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;

    // A playing stream genuinely cannot continue: the native failure gets the
    // same bounded reposition-and-resume as a worker decode ERROR.
    target.dispatchEvent(new Event('error'));

    const reloadSources = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE);
    expect(reloadSources).toHaveLength(1);
    expect(reloadSources[0].requestId).not.toBe(originalLoadId);
    const seeks = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK);
    expect(seeks).toHaveLength(1);
    expect(seeks[0]).toMatchObject({ time: 42.5, type: MainToWorkerMessageType.SEEK });
    const plays = worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY);
    expect(plays.at(-1)).toMatchObject({ requestId: reloadSources[0].requestId, type: MainToWorkerMessageType.PLAY });
    expect(errorEvents).toBe(0);

    // A second native error from the same incident (while the replacement is in
    // flight) is the old resource's death rattle, not a fresh failure: no
    // second reload is stacked on top of the first.
    worker.sent.length = 0;
    target.dispatchEvent(new Event('error'));
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY)).toHaveLength(0);
    expect(errorEvents).toBe(0);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('a native error while a paused repair is already owed neither surfaces nor reloads twice', async () => {
    const { host, target, worker } = attachAndHandshake();
    const originalLoadId = loadAndAcknowledge(host, worker, 'k');
    let errorEvents = 0;
    host.addEventListener('error', () => errorEvents++);

    // Watched to 12.5, then deliberately paused.
    target.dispatchEvent(new Event('play'));
    target.currentTime = 12.5;
    target.dispatchEvent(new Event('timeupdate'));
    target.dispatchEvent(new Event('pause'));
    // The deliberate pause settles on the next task before the failure lands.
    await settle();
    worker.sent.length = 0;

    // The worker decode ERROR defers the repair while the user is paused.
    worker.reply({ context: 'append failed', kind: 'decode', requestId: originalLoadId, type: WorkerToMainMessageType.ERROR });
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(0);

    // The native error is the same incident's echo: it must neither surface as
    // a fatal UI error nor swap in a second deferred repair.
    target.dispatchEvent(new Event('error'));
    expect(errorEvents).toBe(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(0);

    // Pressing play runs exactly one reload — the deferred one — at the paused spot.
    target.dispatchEvent(new Event('play'));
    const reloadSources = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE);
    expect(reloadSources).toHaveLength(1);
    expect(reloadSources[0].requestId).not.toBe(originalLoadId);
    const seeks = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK);
    expect(seeks).toHaveLength(1);
    expect(seeks[0]).toMatchObject({ time: 12.5, type: MainToWorkerMessageType.SEEK });
    expect(seeks[0].requestId).toBe(reloadSources[0].requestId);
    const plays = worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY);
    expect(plays).toHaveLength(1);
    expect(plays[0].requestId).toBe(reloadSources[0].requestId);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('late native error and pause from a replaced resource neither restart it nor mark the replacement as user-paused', () => {
    const { host, target, worker } = attachAndHandshake();
    const initialLoadId = loadAndAcknowledge(host, worker, 'k');
    let errorEvents = 0;
    host.addEventListener('error', () => errorEvents++);

    // Playing at 12.5; the worker reports a decode ERROR → recovery reload.
    target.dispatchEvent(new Event('play'));
    target.currentTime = 12.5;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;
    worker.reply({ context: 'append failed', kind: 'decode', requestId: initialLoadId, type: WorkerToMainMessageType.ERROR });
    const reloadedLoadId = newestSourceId(worker);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(1);

    // While the replacement is in flight, the OLD resource's late events land: a
    // native error (its death rattle), an incidental teardown pause, and a stale
    // worker error still naming the old load. None of them may start another
    // recovery, surface a fatal error, or flip the new load to user-paused.
    worker.sent.length = 0;
    target.dispatchEvent(new Event('error'));
    target.dispatchEvent(new Event('pause'));
    worker.reply({ context: 'old load', kind: 'decode', requestId: initialLoadId, type: WorkerToMainMessageType.ERROR });
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY)).toHaveLength(0);
    expect(errorEvents).toBe(0);

    // A fresh worker error on the NEW load still reloads WITH play: the
    // incidental pause was not mistaken for the user pressing stop.
    worker.reply({ info: mainInfo, requestId: reloadedLoadId, type: WorkerToMainMessageType.SOURCE_OK });
    worker.sent.length = 0;
    worker.reply({ context: 'new load', kind: 'decode', requestId: reloadedLoadId, type: WorkerToMainMessageType.ERROR });
    const sources = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE);
    expect(sources).toHaveLength(1);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY).at(-1)).toMatchObject({
      requestId: sources[0].requestId,
      type: MainToWorkerMessageType.PLAY,
    });
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('pausing after a seek leaves the video alone when the old pipeline reports a late native error', async () => {
    const { host, target, worker } = attachAndHandshake();
    loadAndAcknowledge(host, worker, 'k');
    let errorEvents = 0;
    host.addEventListener('error', () => errorEvents++);
    worker.sent.length = 0;

    // Watch to 12.5, seek in-window to 30 (a plain SEEK that resolves), then
    // the user pauses and the element just sits.
    target.dispatchEvent(new Event('play'));
    target.currentTime = 12.5;
    target.dispatchEvent(new Event('timeupdate'));
    target.currentTime = 30;
    target.dispatchEvent(new Event('seeking'));
    target.dispatchEvent(new Event('seeked'));
    expect(worker.sent.at(-1)).toMatchObject({ time: 30, type: MainToWorkerMessageType.SEEK });
    target.dispatchEvent(new Event('pause'));
    // The deliberate pause settles on the next task before the old pipeline dies.
    await settle();
    worker.sent.length = 0;

    // The old/torn-down resource dies late with a native error while the video
    // is idle-paused. The host must not reboot, seek, play, or reload it — and
    // the failure must not surface as a fatal UI error for an idle pipeline.
    target.dispatchEvent(new Event('error'));
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY)).toHaveLength(0);
    expect(errorEvents).toBe(0);
    expect(host.error).toBeNull();
    host.destroy();
  });
});

describe('out-of-window seek recovery', () => {
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

  /** Loads `src` and acknowledges it with a known duration, returning its request id. */
  function loadWithDuration(host: SiaVideoSource, worker: FakeWorker, src: string, durationSeconds: number): number {
    host.src = src;
    const source = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE).at(-1);
    if (!source) throw new Error('SOURCE was not sent');
    worker.reply({
      info: { ...mainInfo, durationSeconds },
      requestId: source.requestId,
      type: WorkerToMainMessageType.SOURCE_OK,
    });
    return source.requestId;
  }

  it.skipIf(!IN_BROWSER)('keeps a seek within the known duration on the ordinary SEEK path', () => {
    const { host, target, worker } = attachAndHandshake();
    loadWithDuration(host, worker, 'k', 60);
    worker.sent.length = 0;

    target.currentTime = 30;
    target.dispatchEvent(new Event('seeking'));
    // No source restart, just the plain in-window SEEK.
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(0);
    expect(worker.sent.at(-1)).toMatchObject({ time: 30, type: MainToWorkerMessageType.SEEK });
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('a seek past the known duration restarts the source at that target', () => {
    const { host, target, worker } = attachAndHandshake();
    loadWithDuration(host, worker, 'k', 60);

    // A deliberate pause leaves no play intent: the restart repairs the
    // position (fresh SOURCE + SEEK to the target) without starting playback.
    target.dispatchEvent(new Event('pause'));
    worker.sent.length = 0;

    target.currentTime = 120;
    target.dispatchEvent(new Event('seeking'));

    const reloadSources = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE);
    expect(reloadSources).toHaveLength(1);
    expect(reloadSources[0]).toMatchObject({ src: 'k', type: MainToWorkerMessageType.SOURCE });
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK).at(-1)).toMatchObject({
      requestId: reloadSources[0].requestId,
      time: 120,
      type: MainToWorkerMessageType.SEEK,
    });
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('does not auto-play a fresh source restarted by an out-of-window seek after an earlier source played', () => {
    const { host, target, worker } = attachAndHandshake();
    // The user plays the first source; the next source is never auto-played.
    loadWithDuration(host, worker, 'k', 60);
    target.dispatchEvent(new Event('play'));
    worker.sent.length = 0;

    host.src = 'k2';
    const freshSource = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE).at(-1);
    if (!freshSource) throw new Error('SOURCE was not sent');
    worker.reply({ info: { ...mainInfo, durationSeconds: 60 }, requestId: freshSource.requestId, type: WorkerToMainMessageType.SOURCE_OK });
    // Scrub the never-played fresh source while the element stays paused (the
    // harness's synthetic events never change native paused state): the restart
    // must repair the position without starting playback — the earlier
    // source's stale play intent must not leak into an unsolicited PLAY.
    worker.sent.length = 0;

    target.currentTime = 120;
    target.dispatchEvent(new Event('seeking'));

    const reloadSources = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE);
    expect(reloadSources).toHaveLength(1);
    expect(reloadSources[0]).toMatchObject({ src: 'k2', type: MainToWorkerMessageType.SOURCE });
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK).at(-1)).toMatchObject({
      requestId: reloadSources[0].requestId,
      time: 120,
      type: MainToWorkerMessageType.SEEK,
    });
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('resumes playback when an out-of-window seek restarts a playing element', () => {
    const { host, target, worker } = attachAndHandshake();
    loadWithDuration(host, worker, 'k', 60);

    // Playing element: the restart repositions the source and keeps playing.
    target.dispatchEvent(new Event('play'));
    worker.sent.length = 0;

    target.currentTime = 120;
    target.dispatchEvent(new Event('seeking'));

    const reloadSources = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE);
    expect(reloadSources).toHaveLength(1);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY).at(-1)).toMatchObject({
      requestId: reloadSources[0].requestId,
      type: MainToWorkerMessageType.PLAY,
    });
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('a far seek whose scrub starts with a native pause still restarts with play', () => {
    // video.js emits a native `pause` BEFORE `seeking` on a far scrub of a
    // playing element. That pause is the seek's engine work, not the user
    // stopping: the restart must still post PLAY, or the element settles on
    // the play button instead of advancing at the target.
    const { host, target, worker } = attachAndHandshake();
    loadWithDuration(host, worker, 'k', 60);
    target.dispatchEvent(new Event('play'));
    worker.sent.length = 0;

    target.dispatchEvent(new Event('pause')); // native, lands before `seeking`
    target.currentTime = 120;
    target.dispatchEvent(new Event('seeking'));

    const reloadSources = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE);
    expect(reloadSources).toHaveLength(1);
    expect(reloadSources[0]).toMatchObject({ src: 'k', type: MainToWorkerMessageType.SOURCE });
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK).at(-1)).toMatchObject({
      requestId: reloadSources[0].requestId,
      time: 120,
      type: MainToWorkerMessageType.SEEK,
    });
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY).at(-1)).toMatchObject({
      requestId: reloadSources[0].requestId,
      type: MainToWorkerMessageType.PLAY,
    });
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('a settled user pause without a seek stays paused through a far seek', async () => {
    // A genuine pause settles on the next task; a far seek after that is a
    // scrub of an explicitly paused element and must repair the position
    // without starting playback.
    const { host, target, worker } = attachAndHandshake();
    loadWithDuration(host, worker, 'k', 60);
    target.dispatchEvent(new Event('play'));
    worker.sent.length = 0;

    target.dispatchEvent(new Event('pause')); // genuine: no seeking follows
    await settle(); // next task confirms the pause
    worker.sent.length = 0;

    target.currentTime = 120;
    target.dispatchEvent(new Event('seeking'));
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(1);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY)).toHaveLength(0);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('a settled user pause keeps a later decode error deferred instead of auto-resuming', async () => {
    // The reason the provisional window exists: once the pause settles, a
    // failure on that load must defer a repair (no reload, no PLAY), never
    // auto-resume behind the user.
    const { host, target, worker } = attachAndHandshake();
    const initialLoadId = loadWithDuration(host, worker, 'k', 60);
    target.dispatchEvent(new Event('play'));
    target.currentTime = 12.5;
    target.dispatchEvent(new Event('timeupdate'));
    target.dispatchEvent(new Event('pause')); // genuine
    await settle(); // next task confirms the pause
    worker.sent.length = 0;

    worker.reply({
      context: 'append failed',
      kind: 'decode',
      requestId: initialLoadId,
      type: WorkerToMainMessageType.ERROR,
    });
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY)).toHaveLength(0);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('surfaces a decode error once out-of-window seek restarts are exhausted', () => {
    const { host, target, worker } = attachAndHandshake();
    loadWithDuration(host, worker, 'k', 60);

    let errorEvents = 0;
    host.addEventListener('error', () => errorEvents++);

    // The reposition seek after a restart must stay stuck (this is the case
    // that keeps the element in HAVE_METADATA): the host's recovery restarts
    // suppress re-entry from their own reposition seek via `#recovering`, so a
    // second out-of-window attempt only ever comes from the stall watchdog —
    // not from re-dispatching `seeking`, which `#recovering` now swallows.
    // Model the unresolved seek with a `seeking` flag that never clears and
    // drive the watchdog with fake timers.
    //
    // Keep SEEK_STALL_MS in sync with SEEK_STALL_TIMEOUT_MS in
    // sia-video-source.ts; a drift makes the watchdog fire early or late.
    const SEEK_STALL_MS = 6000;
    Object.defineProperty(target, 'seeking', { configurable: true, get: () => true });
    vi.useFakeTimers();
    try {
      // First out-of-window seek (past the vouched 60s duration) → restart #1
      // (one fresh SOURCE), stall watchdog on. Acknowledging the SOURCE_OK keeps
      // the known duration restored the way a real load would.
      const restartOnce = () => {
        // Set currentTime past the vouched duration so `#onSeeking` classifies
        // it as out-of-window (the recovery's own reposition keeps currentTime
        // at 120 on subsequent watchdog-driven attempts).
        target.currentTime = 120;
        target.dispatchEvent(new Event('seeking'));
        const restart = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE).at(-1);
        expect(restart).toBeDefined();
        if (restart && 'requestId' in restart) {
          worker.reply({ info: { ...mainInfo, durationSeconds: 60 }, requestId: restart.requestId, type: WorkerToMainMessageType.SOURCE_OK });
        }
      };
      worker.sent.length = 0;
      restartOnce();
      expect(errorEvents).toBe(0);
      worker.sent.length = 0;

      // The reposition seek never resolves → the stalled-seek watchdog fires →
      // restart #2 (budget spent), still no error surfaced.
      vi.advanceTimersByTime(SEEK_STALL_MS);
      expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(1);
      expect(errorEvents).toBe(0);
      restartOnce();
      worker.sent.length = 0;

      // Still stuck → watchdog fires again → MAX_EXTERNAL_SEEK_RESTARTS is
      // exhausted: the failure surfaces as a decode-class error and no further
      // SOURCE restart happens.
      vi.advanceTimersByTime(SEEK_STALL_MS);
      expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(0);
      expect(errorEvents).toBe(1);
      expect(host.error?.code).toBe(3);
    } finally {
      vi.useRealTimers();
    }
    host.destroy();
  });
});

describe('the typed recovery-change event', () => {
  type Detail = RecoveryChangeDetail;
  const EVENT = siaRecoveryChange;

  const mainInfo = { container: 'fmp4', durationSeconds: null, mime: DEFAULT_FMP4_MIME, mode: 'main', tracks: [] } as const;

  function attachAndHandshake(): { host: SiaVideoSource; target: HTMLVideoElement; worker: FakeWorker; } {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    const target = document.createElement('video');
    host.attach(target);
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 1, type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    return { host, target, worker };
  }

  function loadWithDuration(host: SiaVideoSource, worker: FakeWorker, src: string, durationSeconds: number): number {
    host.src = src;
    const source = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE).at(-1);
    if (!source) throw new Error('SOURCE was not sent');
    worker.reply({
      info: { ...mainInfo, durationSeconds },
      requestId: source.requestId,
      type: WorkerToMainMessageType.SOURCE_OK,
    });
    return source.requestId;
  }

  function newestSourceId(worker: FakeWorker): number {
    const source = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE).at(-1) as
      | undefined
      | { requestId: number; type: MainToWorkerMessageType.SOURCE; };
    if (!source) throw new Error('SOURCE was not sent');
    return source.requestId;
  }

  function collect(host: SiaVideoSource): Detail[] {
    const seen: Detail[] = [];
    host.addEventListener(EVENT, (event: Event) => {
      seen.push((event as CustomEvent<Detail>).detail);
    });
    return seen;
  }

  it.skipIf(!IN_BROWSER)('announces a recovery with its reason, position, and play choice exactly when it starts', () => {
    const { host, target, worker } = attachAndHandshake();
    loadWithDuration(host, worker, 'k', 60);
    const seen = collect(host);

    // A playing far seek restarts the source; the event must name the seek,
    // the resume position, and that playback is wanted.
    target.dispatchEvent(new Event('play'));
    worker.sent.length = 0;
    target.currentTime = 120;
    target.dispatchEvent(new Event('seeking'));

    expect(seen).toEqual([{ active: true, reason: 'seek', resumeSeconds: 120, wantsPlay: true }]);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('delivers the same detail to listeners on the attached element (the demo path)', () => {
    // The demo subscribes on the <video> element, not the private host; the
    // typed event must arrive there with the identical payload.
    const { host, target, worker } = attachAndHandshake();
    loadWithDuration(host, worker, 'k', 60);
    const seen: Detail[] = [];
    target.addEventListener(EVENT, (event) => {
      seen.push((event as CustomEvent<Detail>).detail);
    });

    target.dispatchEvent(new Event('play'));
    worker.sent.length = 0;
    target.currentTime = 120;
    target.dispatchEvent(new Event('seeking'));

    expect(seen).toEqual([{ active: true, reason: 'seek', resumeSeconds: 120, wantsPlay: true }]);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('emits exactly one closed event once the recovered load genuinely plays again', () => {
    const { host, target, worker } = attachAndHandshake();
    const loadId = loadWithDuration(host, worker, 'k', 60);
    const seen = collect(host);

    target.dispatchEvent(new Event('play'));
    target.currentTime = 42.5;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;
    worker.reply({ context: 'append failed', kind: 'decode', requestId: loadId, type: WorkerToMainMessageType.ERROR });
    expect(seen).toEqual([{ active: true, reason: 'decode', resumeSeconds: 42.5, wantsPlay: true }]);

    // The reloaded load advances the playhead: one active:false, and a later
    // advance adds no duplicate (the window is already closed).
    const reloadedId = newestSourceId(worker);
    worker.reply({ info: mainInfo, requestId: reloadedId, type: WorkerToMainMessageType.SOURCE_OK });
    target.currentTime = 43;
    target.dispatchEvent(new Event('timeupdate'));
    target.currentTime = 43.5;
    target.dispatchEvent(new Event('timeupdate'));
    expect(seen).toEqual([
      { active: true, reason: 'decode', resumeSeconds: 42.5, wantsPlay: true },
      { active: false },
    ]);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('never re-opens or re-closes after the exit (no duplicate false)', () => {
    const { host, target, worker } = attachAndHandshake();
    const loadId = loadWithDuration(host, worker, 'k', 60);
    const seen = collect(host);

    target.dispatchEvent(new Event('play'));
    target.currentTime = 42.5;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;
    worker.reply({ context: 'append failed', kind: 'decode', requestId: loadId, type: WorkerToMainMessageType.ERROR });
    const reloadedId = newestSourceId(worker);
    worker.reply({ info: mainInfo, requestId: reloadedId, type: WorkerToMainMessageType.SOURCE_OK });
    target.currentTime = 43;
    target.dispatchEvent(new Event('timeupdate')); // exit

    // A same-incident end (the teardown destroyed after the exit) must not add
    // a second active:false.
    host.destroy();
    expect(seen).toEqual([
      { active: true, reason: 'decode', resumeSeconds: 42.5, wantsPlay: true },
      { active: false },
    ]);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('defers a repair without announcing any recovery until an explicit play consumes it', async () => {
    const { host, target, worker } = attachAndHandshake();
    const loadId = loadWithDuration(host, worker, 'k', 60);
    const seen = collect(host);

    // Settled deliberate pause, then a decode failure defers the repair: the
    // deferred repair is NOT active recovery, so nothing is announced.
    target.dispatchEvent(new Event('play'));
    target.currentTime = 12.5;
    target.dispatchEvent(new Event('timeupdate'));
    target.dispatchEvent(new Event('pause'));
    await settle();
    worker.sent.length = 0;
    worker.reply({ context: 'append failed', kind: 'decode', requestId: loadId, type: WorkerToMainMessageType.ERROR });
    expect(seen).toEqual([]);

    // The explicit play consumes the deferred repair and runs the restart:
    // only now is a recovery announced.
    target.dispatchEvent(new Event('play'));
    expect(seen).toEqual([{ active: true, reason: 'decode', resumeSeconds: 12.5, wantsPlay: true }]);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('closes an active recovery on a source reset and on destroy', () => {
    const { host, target, worker } = attachAndHandshake();
    loadWithDuration(host, worker, 'k', 60);
    const seen = collect(host);

    target.dispatchEvent(new Event('play'));
    worker.sent.length = 0;
    target.currentTime = 120;
    target.dispatchEvent(new Event('seeking'));
    expect(seen).toEqual([{ active: true, reason: 'seek', resumeSeconds: 120, wantsPlay: true }]);

    // Clearing the source closes the recovery window without a re-open.
    worker.sent.length = 0;
    host.src = '';
    expect(seen).toEqual([
      { active: true, reason: 'seek', resumeSeconds: 120, wantsPlay: true },
      { active: false },
    ]);
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
