import type { AppMetadata } from '@siafoundation/sia-storage';
import { describe, expect, it, vi } from 'vitest';
import {
  decryptAppKeyEnvelope,
  exportWorkerPublicKey,
  generateWorkerKeyPair,
} from '../app-key-handshake.ts';
import { MseAppendPipe } from '../mse-pipe.ts';
import { type AppKeyEnvelope, DEFAULT_FMP4_MIME, isAppKeyEnvelope, type MainToWorkerMessage, MainToWorkerMessageType, PROTOCOL_VERSION, WORKER_PUBLIC_KEY_LENGTH, workerErrorCode, type WorkerMode, type WorkerToMainMessage, WorkerToMainMessageType } from '../protocol.ts';
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

/** The requestId of the newest HELLO the host posted — what a HELLO_OK must echo. */
function helloRequestId(worker: FakeWorker): number {
  const hello = worker.sent.filter((m) => m.type === MainToWorkerMessageType.HELLO).at(-1);
  if (!hello || !('requestId' in hello)) throw new Error('no HELLO posted to echo');
  return hello.requestId;
}

/** The newest ATTACH the host posted — what an ATTACH_OK must echo. */
function newestAttach(worker: FakeWorker): { requestId: number; type: MainToWorkerMessageType.ATTACH } {
  const attach = worker.sent.filter((m) => m.type === MainToWorkerMessageType.ATTACH).at(-1);
  if (!attach || !('requestId' in attach)) throw new Error('no ATTACH on the wire');
  return attach;
}

/** Replies an ATTACH_OK echoing the newest posted ATTACH's request id. */
function replyAttachOk(worker: FakeWorker, mode: WorkerMode = 'main'): void {
  worker.reply({ mode, requestId: newestAttach(worker).requestId, type: WorkerToMainMessageType.ATTACH_OK });
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

    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: 999 });
    expect(worker.sent.some((m) => m.type === MainToWorkerMessageType.ATTACH)).toBe(false);
    expect(host.error?.code).toBe(4);

    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    expect(worker.sent.some((m) => m.type === MainToWorkerMessageType.ATTACH)).toBe(true);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('goes through the full main-mode handshake: ATTACH → SOURCE_OK → blob src', () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    const target = document.createElement('video');
    host.attach(target);

    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
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
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    // The session is not ready until ATTACH_OK. Load a main-mode source so the
    // replayed load establishes the current-resource identity (object URL) a
    // playhead tick must pass before it is forwarded — with no current load,
    // native events are no longer trusted by default.
    replyAttachOk(worker);
    host.src = 'event-forwarding';
    const loaded = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE).at(-1);
    if (!loaded || !('requestId' in loaded)) throw new Error('SOURCE was not sent');
    worker.reply({
      info: { container: 'fmp4', durationSeconds: null, mime: 'video/mp4', mode: 'main', tracks: [] },
      requestId: loaded.requestId,
      type: WorkerToMainMessageType.SOURCE_OK,
    });
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
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });

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
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });

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

    worker.reply({ features: { workerMse: true }, publicKey: new Uint8Array(32), requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    replyAttachOk(worker, 'worker');

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

    worker.reply({ features: { workerMse: false }, publicKey, requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
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
    worker.reply({ features: { workerMse: false }, publicKey, requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
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
    worker.reply({ features: { workerMse: false }, publicKey, requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    await new Promise((resolve) => setTimeout(resolve, 0));
    worker.sent.length = 0;

    host.detach();
    host.attach(document.createElement('video'));
    worker.reply({ features: { workerMse: false }, publicKey, requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
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

    worker.reply({ features: { workerMse: false }, publicKey, requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    // Let the async seed→envelope chain (and whatever is chained behind it)
    // settle; the ordering is only observable after it drains.
    await new Promise((resolve) => setTimeout(resolve, 0));

    // The worker consumes the captured postMessage sequence FIFO: APP_KEY
    // must precede ATTACH and everything the flush released, or the first
    // load hits the worker-side seed requirement and fails with a spurious
    // "No Sia SDK is available" network error at playback start.
    const sentTypes = worker.sent.map((m) => m.type);
    expect(sentTypes).toEqual([MainToWorkerMessageType.HELLO, MainToWorkerMessageType.APP_KEY, MainToWorkerMessageType.ATTACH]);

    // The handshake window's queued intent (SEEK then PLAY) is released only
    // after ATTACH_OK resyncs the session — fresh SOURCE first, then the SEEK
    // (rebased) and the re-stated PLAY, all scoped to the replayed load's
    // request id rather than the stale handshake's.
    const attach = newestAttach(worker);
    worker.sent.length = 0;
    worker.reply({ mode: 'main', requestId: attach.requestId, type: WorkerToMainMessageType.ATTACH_OK });
    expect(worker.sent.map((m) => m.type)).toEqual([MainToWorkerMessageType.SOURCE, MainToWorkerMessageType.SEEK, MainToWorkerMessageType.PLAY]);
    const replaySource = worker.sent.find((m) => m.type === MainToWorkerMessageType.SOURCE) as undefined | { requestId: number; type: MainToWorkerMessageType.SOURCE; };
    expect(worker.sent.find((m) => m.type === MainToWorkerMessageType.SEEK)?.requestId).toBe(replaySource?.requestId);
    expect(worker.sent.find((m) => m.type === MainToWorkerMessageType.PLAY)?.requestId).toBe(replaySource?.requestId);

    // Playback still proceeds: the ATTACH round trip replays the stored
    // source and the load acknowledges without any spurious error event.
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
    worker.reply({ features: { workerMse: false }, publicKey, requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
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
    worker.reply({ features: { workerMse: false }, publicKey, requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
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

    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    // No seed supplier → ATTACH goes out synchronously, but the queued PLAY
    // stays HELD: the host is not ready until ATTACH_OK resyncs the session.
    expect(worker.sent.map((m) => m.type)).toEqual([MainToWorkerMessageType.HELLO, MainToWorkerMessageType.ATTACH]);
    const attach = newestAttach(worker);

    worker.sent.length = 0;
    worker.reply({ mode: 'main', requestId: attach.requestId, type: WorkerToMainMessageType.ATTACH_OK });

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

    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    expect(worker.sent.map((m) => m.type)).toEqual([MainToWorkerMessageType.HELLO, MainToWorkerMessageType.ATTACH]);
    const attach = newestAttach(worker);

    worker.sent.length = 0;
    worker.reply({ mode: 'main', requestId: attach.requestId, type: WorkerToMainMessageType.ATTACH_OK });

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

    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    const attach = newestAttach(worker);
    worker.sent.length = 0;
    worker.reply({ mode: 'main', requestId: attach.requestId, type: WorkerToMainMessageType.ATTACH_OK });

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

    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    const attach = newestAttach(worker);
    worker.sent.length = 0;
    worker.reply({ mode: 'main', requestId: attach.requestId, type: WorkerToMainMessageType.ATTACH_OK });

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
    worker.reply({ features: { workerMse: false }, publicKey, requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Apps injecting their own SDK factory have no handshake to perform.
    expect(worker.sent.some((m) => m.type === MainToWorkerMessageType.APP_KEY)).toBe(false);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('reports main-thread buffered state when the SourceBuffer opens, updates, and playhead changes', async () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    const target = document.createElement('video');
    let sourceBuffer: SourceBuffer | undefined;
    const addSourceBuffer = Reflect.get(MediaSource.prototype, 'addSourceBuffer');
    const addSourceBufferSpy = vi.spyOn(MediaSource.prototype, 'addSourceBuffer').mockImplementation(function (
      this: MediaSource,
      mime: string,
    ) {
      sourceBuffer = Reflect.apply(addSourceBuffer, this, [mime]);
      return sourceBuffer;
    });
    const bufferedGetter = vi.spyOn(SourceBuffer.prototype, 'buffered', 'get').mockReturnValue({
      end: (index: number) => [4, 18][index],
      length: 2,
      start: (index: number) => [1, 9][index],
    });

    host.attach(target);
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    replyAttachOk(worker);
    host.src = 'buffered-state-object';
    const source = worker.sent.filter((message) => message.type === MainToWorkerMessageType.SOURCE).at(-1);
    if (!source || !('requestId' in source)) throw new Error('SOURCE was not sent');
    worker.reply({
      info: { container: 'fmp4', durationSeconds: null, mime: DEFAULT_FMP4_MIME, mode: 'main', tracks: [] },
      requestId: source.requestId,
      type: WorkerToMainMessageType.SOURCE_OK,
    });

    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(worker.sent).toContainEqual({
      buffered: [{ end: 4, start: 1 }, { end: 18, start: 9 }],
      pendingBytes: 0,
      playhead: 0,
      requestId: source.requestId,
      type: MainToWorkerMessageType.BUFFERED_STATE,
    });

    worker.sent.length = 0;
    target.currentTime = 12;
    target.dispatchEvent(new Event('timeupdate'));
    expect(worker.sent).toContainEqual({
      buffered: [{ end: 4, start: 1 }, { end: 18, start: 9 }],
      pendingBytes: 0,
      playhead: 12,
      requestId: source.requestId,
      type: MainToWorkerMessageType.BUFFERED_STATE,
    });

    worker.sent.length = 0;
    sourceBuffer?.dispatchEvent(new Event('updateend'));
    expect(worker.sent).toContainEqual({
      buffered: [{ end: 4, start: 1 }, { end: 18, start: 9 }],
      pendingBytes: 0,
      playhead: 12,
      requestId: source.requestId,
      type: MainToWorkerMessageType.BUFFERED_STATE,
    });

    bufferedGetter.mockRestore();
    addSourceBufferSpy.mockRestore();
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('calls MediaSource.endOfStream after ENDED once appends drain (main mode)', async () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    const target = document.createElement('video');
    host.attach(target);
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    // The host only acts on main-mode CHUNK/ENDED once the mode is known, so
    // complete the ATTACH round trip before the load starts.
    replyAttachOk(worker);

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
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });

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
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    replyAttachOk(worker);

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
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    replyAttachOk(worker);

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
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    replyAttachOk(worker);

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
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    replyAttachOk(worker);

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
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    replyAttachOk(worker);
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
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    replyAttachOk(worker);
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
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    replyAttachOk(worker);
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

  it.skipIf(!IN_BROWSER)('keeps a provisional pause from becoming a user pause when its confirm settles before the delayed `seeking`', async () => {
    // video.js fires a native `pause` before `seeking` on a far scrub. The
    // pause-confirm task can settle BEFORE the delayed `seeking` event lands
    // (event-pileup), so the rule must use element STATE, never the
    // assumption that `seeking` outranks the confirm timer. Here the
    // scrub's currentTime write has moved the playhead to the far target
    // before the confirm task runs: the confirm arms at the old playhead,
    // finds the playhead far beyond tolerance of it, and must NOT settle,
    // so the far scrub that follows still restarts with play: the incidental
    // pause was never confirmed as the user stopping.
    const { host, target, worker } = attachAndHandshake();
    loadWithDuration(host, worker, 'k', 60);
    target.dispatchEvent(new Event('play'));
    worker.sent.length = 0;

    // The scrub has begun: the `seeking` flag is latched and the playhead
    // moved, but its `seeking` EVENT is still queued behind the next task,
    // the confirm timer runs first.
    Object.defineProperty(target, 'seeking', { configurable: true, get: () => true });
    target.dispatchEvent(new Event('pause')); // incidental, engine work; arms at the old playhead
    target.currentTime = 120; // the scrub's write lands before the confirm task
    await settle(); // next task: the pause confirm fires BEFORE the `seeking`
    target.dispatchEvent(new Event('seeking')); // the delayed seeking lands

    const reloadSources = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE);
    expect(reloadSources).toHaveLength(1);
    expect(reloadSources[0]).toMatchObject({ src: 'k', type: MainToWorkerMessageType.SOURCE });
    // The seek recovery keeps the playing choice: the restart posts PLAY.
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY).at(-1)).toMatchObject({
      requestId: reloadSources[0].requestId,
      type: MainToWorkerMessageType.PLAY,
    });
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('a genuine user pause during an in-flight seek keeps the paused intent through a later recovery, never auto-resuming', async () => {
    // The armed-position rule must tell a scrub's OWN incidental pause (the
    // playhead has moved on to the new scrub target by the time the confirm
    // runs) from a GENUINE pause on top of an in-flight in-window seek (the
    // playhead still sits where the pause landed, the forwarded target).
    // Here the user pauses DURING the buffering seek: the next-task confirm
    // must settle as a deliberate stop even though the element reports
    // `seeking`, so when the seek resolves and a decode failure follows, the
    // recovery defers instead of auto-resuming behind the paused user.
    const { host, target, worker } = attachAndHandshake();
    const loadId = loadWithDuration(host, worker, 'k', 60);
    target.dispatchEvent(new Event('play'));
    worker.sent.length = 0;

    // An in-window scrub is in flight: the host forwarded the target and the
    // element reports `seeking` while it buffers at that target.
    Object.defineProperty(target, 'seeking', { configurable: true, get: () => true });
    target.currentTime = 30;
    target.dispatchEvent(new Event('seeking'));
    // The user genuinely pauses while the element is still seeking, at the
    // forwarded target: the pause lands where the playhead sits.
    target.dispatchEvent(new Event('pause'));
    await settle(); // next task confirms the pause, while the element is seeking

    // The scrub resolves.
    Object.defineProperty(target, 'seeking', { configurable: true, get: () => false });
    target.dispatchEvent(new Event('seeked'));
    worker.sent.length = 0;

    // A later decode failure must defer a repair (no reload, no PLAY): the
    // user is paused, so the recovery never auto-resumes.
    worker.reply({
      context: 'append failed',
      kind: 'decode',
      requestId: loadId,
      type: WorkerToMainMessageType.ERROR,
    });
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY)).toHaveLength(0);
    expect(host.error).toBeNull();
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('an incidental pause on an in-flight in-window seek keeps the playing intent through the far scrub and its chained recovery', async () => {
    // The far scrub's incidental `pause` can confirm while the element is
    // still `seeking`, and its new target can land right at the tolerance
    // boundary of the position the pause armed at (the in-flight in-window
    // seek the host forwarded). A playhead that has moved at all by the time
    // the confirm runs is a new nascent scrub, not the user stopping, so the
    // pause must NOT settle. The out-of-window restart, and the decode
    // failure chaining on its fresh load, must keep the user playing.
    const { host, target, worker } = attachAndHandshake();
    loadWithDuration(host, worker, 'k', 60);
    target.dispatchEvent(new Event('play'));
    worker.sent.length = 0;

    // An in-window scrub near the vouched duration is in flight: forwarded
    // as a plain SEEK, the element `seeking` while it buffers at the
    // forwarded target.
    Object.defineProperty(target, 'seeking', { configurable: true, get: () => true });
    target.currentTime = 60.05;
    target.dispatchEvent(new Event('seeking'));
    expect(worker.sent.at(-1)).toMatchObject({ time: 60.05, type: MainToWorkerMessageType.SEEK });

    // The far scrub begins: video.js fires the native `pause` first (the
    // confirm arms at 60.05), then the new target (60.3, out of window)
    // lands at the tolerance boundary. The confirm timer runs before the
    // `seeking` event.
    target.dispatchEvent(new Event('pause')); // incidental, engine work
    target.currentTime = 60.3;
    await settle(); // next task: the pause confirm must NOT settle
    target.dispatchEvent(new Event('seeking')); // the delayed seeking lands

    const restart1 = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE);
    expect(restart1).toHaveLength(1);
    expect(restart1[0]).toMatchObject({ src: 'k', type: MainToWorkerMessageType.SOURCE });
    // The restart keeps the playing choice: it posts PLAY.
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY).at(-1)).toMatchObject({
      requestId: restart1[0].requestId,
      type: MainToWorkerMessageType.PLAY,
    });

    // The fresh load fails to decode: the chained recovery restarts again,
    // still with the user's playing intent.
    worker.reply({
      info: { ...mainInfo, durationSeconds: 60 },
      requestId: restart1[0].requestId,
      type: WorkerToMainMessageType.SOURCE_OK,
    });
    worker.sent.length = 0;
    worker.reply({
      context: 'append failed',
      kind: 'decode',
      requestId: restart1[0].requestId,
      type: WorkerToMainMessageType.ERROR,
    });
    const restart2 = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE);
    expect(restart2).toHaveLength(1);
    // The chained restart also keeps the playing choice: the trailing PLAY.
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY).at(-1)).toMatchObject({
      requestId: restart2[0].requestId,
      type: MainToWorkerMessageType.PLAY,
    });
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('never re-arms the stall watchdog for a paused seek recovery, so a stale latched far scrub cannot chain a second restart', async () => {
    // A paused user's far scrub starts a wantsPlay=false seek recovery. The
    // reposition seek there belongs to a still-latched scrub (the element's
    // `seeking` flag never clears and the playhead drifts on), and re-arming
    // the 6s stall watchdog would let that stale latch chain into a second
    // restart the paused user never asked for. Paused restarts therefore do
    // NOT re-arm the watchdog; only active/playing restarts get the backstop.
    const SEEK_STALL_MS = 6000;
    const { host, target, worker } = attachAndHandshake();
    loadWithDuration(host, worker, 'k', 60);
    target.dispatchEvent(new Event('play'));
    target.dispatchEvent(new Event('pause')); // genuine: no seeking follows
    await settle(); // the pause settles as deliberate
    worker.sent.length = 0;

    Object.defineProperty(target, 'seeking', { configurable: true, get: () => true });
    vi.useFakeTimers();
    try {
      target.currentTime = 120;
      target.dispatchEvent(new Event('seeking'));
      const restart1 = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE);
      expect(restart1).toHaveLength(1);
      expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY)).toHaveLength(0);
      // Acknowledge the restart so the replacement resource IS current, a
      // (buggy) watchdog armed for it would be scoped to the fresh pipeline.
      if (restart1[0] && 'requestId' in restart1[0]) {
        worker.reply({
          info: { ...mainInfo, durationSeconds: 60 },
          requestId: restart1[0].requestId,
          type: WorkerToMainMessageType.SOURCE_OK,
        });
      }
      worker.sent.length = 0;

      // The full stall interval elapses with the stale latch still held at the
      // far target: no watchdog was re-armed, so no chained restart fires.
      vi.advanceTimersByTime(SEEK_STALL_MS);
      expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(0);
      expect(host.error).toBeNull();
    } finally {
      vi.useRealTimers();
    }
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('honors an explicit play during a paused recovery but ignores a play that never actually started the element', async () => {
    // A paused seek recovery never plays the element itself, so a `play` event
    // whose element stayed `paused` is engine noise and must not flip the
    // machine's choice; a `play` that genuinely left the element unpaused is
    // the explicit user intent a chained recovery must honor (wantsPlay=true).
    const { host, target, worker } = attachAndHandshake();
    loadWithDuration(host, worker, 'k', 60);
    target.dispatchEvent(new Event('play'));
    target.dispatchEvent(new Event('pause')); // genuine user pause
    await settle(); // settles as deliberate
    worker.sent.length = 0;

    // A paused far scrub starts a paused seek recovery in flight.
    target.currentTime = 120;
    target.dispatchEvent(new Event('seeking'));
    const restart1 = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE).at(-1);
    expect(restart1).toBeDefined();
    if (!restart1 || !('requestId' in restart1)) throw new Error('no paused seek restart SOURCE');
    worker.reply({
      info: { ...mainInfo, durationSeconds: 60 },
      requestId: restart1.requestId,
      type: WorkerToMainMessageType.SOURCE_OK,
    });

    // Engine noise: a `play` event that did not start the element (paused
    // stays true in this harness) is teardown work, never user intent.
    target.dispatchEvent(new Event('play'));
    worker.sent.length = 0;
    // A decode failure on the fresh load while the choice is still paused must
    // defer a repair, no restart, no PLAY.
    worker.reply({ context: 'append failed', kind: 'decode', requestId: restart1.requestId, type: WorkerToMainMessageType.ERROR });
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY)).toHaveLength(0);
    expect(host.error).toBeNull();

    // A genuine play: the element actually left the paused state.
    Object.defineProperty(target, 'paused', { configurable: true, get: () => false });
    worker.sent.length = 0;
    target.dispatchEvent(new Event('play'));
    // The fresh load fails again while the user now wants play: the chained
    // recovery must restart WITH play (the machine honored the mid-recovery
    // play), not defer behind the stale paused choice.
    worker.reply({ context: 'append failed', kind: 'decode', requestId: restart1.requestId, type: WorkerToMainMessageType.ERROR });
    const reload2 = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE);
    expect(reload2).toHaveLength(1);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY).at(-1)).toMatchObject({
      requestId: reload2[0] && 'requestId' in reload2[0] ? reload2[0].requestId : NaN,
      type: MainToWorkerMessageType.PLAY,
    });
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('surfaces a decode error once out-of-window seek restarts are exhausted', () => {
    const { host, target, worker } = attachAndHandshake();
    loadWithDuration(host, worker, 'k', 60);
    // An OUT-OF-WINDOW seek recovery that is actively PLAYING keeps its stall
    // watchdog backstop: only paused restarts drop it, so the exhaust path is
    // exercised from the playing side.
    target.dispatchEvent(new Event('play'));
    worker.sent.length = 0;

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
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    replyAttachOk(worker);
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

describe('unavailable seek snap-back (host, nonfatal)', () => {
  // A worker `unavailable` ERROR on a seek target means the data at that
  // position cannot be served. The host snaps the element back to the last
  // playable position (falling back to 0 when the playhead and the target are
  // within tolerance), letting the normal seeking path issue the follow-up
  // SEEK. It does NOT report a fatal error, send loadFailed to the machine,
  // or restart the source.

  function attachAndHandshake(): { host: SiaVideoSource; target: HTMLVideoElement; worker: FakeWorker; } {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    const target = document.createElement('video');
    host.attach(target);
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    replyAttachOk(worker);
    return { host, target, worker };
  }

  const mainInfo = { container: 'fmp4', durationSeconds: null, mime: DEFAULT_FMP4_MIME, mode: 'main', tracks: [] } as const;

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

  /** Simulate the element being in a seeking state (jsdom never sets this natively). */
  function setSeeking(target: HTMLVideoElement, value: boolean): void {
    Object.defineProperty(target, 'seeking', { configurable: true, get: () => value });
  }

  it.skipIf(!IN_BROWSER)('snaps a stuck seek back to the last playable position and sends a follow-up SEEK', () => {
    vi.useFakeTimers();
    const { host, target, worker } = attachAndHandshake();
    const activeId = loadWithDuration(host, worker, 'k', 60);

    // The element played to t=30: the host recorded it as the last playhead.
    target.currentTime = 30;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;

    // The user seeks to 42; the element enters seeking.
    target.currentTime = 42;
    setSeeking(target, true);
    target.dispatchEvent(new Event('seeking'));
    worker.sent.length = 0;

    // The worker reports the seek target as unavailable (nonfatal).
    worker.reply({ kind: workerErrorCode.unavailable, requestId: activeId, time: 42, type: WorkerToMainMessageType.ERROR });

    // The element snapped back to 30 (the last playable position).
    expect(target.currentTime).toBe(30);

    // In a real browser the currentTime setter triggers a fresh `seeking`
    // event; simulate that to exercise the normal seeking path.
    target.dispatchEvent(new Event('seeking'));

    // A follow-up SEEK was sent to the snap-back position via the normal
    // seeking path.
    const seeks = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK);
    expect(seeks).toHaveLength(1);
    expect(seeks[0]).toMatchObject({ time: 30, type: MainToWorkerMessageType.SEEK });

    // No source restart, no PLAY, no fatal error.
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY)).toHaveLength(0);

    vi.useRealTimers();
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('falls back to 0 when the last playhead is within tolerance of the seek target', () => {
    vi.useFakeTimers();
    const { host, target, worker } = attachAndHandshake();
    const activeId = loadWithDuration(host, worker, 'k', 60);

    // Played to t=30.
    target.currentTime = 30;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;

    // Seeks to 30.1 (within 0.25 s of the playhead).
    target.currentTime = 30.1;
    setSeeking(target, true);
    target.dispatchEvent(new Event('seeking'));
    worker.sent.length = 0;

    worker.reply({ kind: workerErrorCode.unavailable, requestId: activeId, time: 30.1, type: WorkerToMainMessageType.ERROR });

    // Within tolerance → snap to 0 instead of 30.
    expect(target.currentTime).toBe(0);

    vi.useRealTimers();
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('ignores an unavailable error when the element is not seeking', () => {
    const { host, target, worker } = attachAndHandshake();
    const activeId = loadWithDuration(host, worker, 'k', 60);

    target.currentTime = 30;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;

    // Element is NOT in a seeking state.
    setSeeking(target, false);

    worker.reply({ kind: workerErrorCode.unavailable, requestId: activeId, time: 42, type: WorkerToMainMessageType.ERROR });

    // Nothing changes: no snap, no seek, no restart.
    expect(target.currentTime).toBe(30);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(0);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('ignores a stale unavailable error with a mismatched request id', () => {
    const { host, target, worker } = attachAndHandshake();
    loadWithDuration(host, worker, 'k', 60);

    target.currentTime = 30;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;

    target.currentTime = 42;
    setSeeking(target, true);
    target.dispatchEvent(new Event('seeking'));
    worker.sent.length = 0;

    // The request id does not match the active load.
    worker.reply({ kind: workerErrorCode.unavailable, requestId: 9999, time: 42, type: WorkerToMainMessageType.ERROR });

    // Dropped by the request filter: no snap, no seek, no restart.
    expect(target.currentTime).toBe(42);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(0);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('preserves the pause preference during snap-back', () => {
    vi.useFakeTimers();
    const { host, target, worker } = attachAndHandshake();
    const activeId = loadWithDuration(host, worker, 'k', 60);

    // Element is paused (no play intent).
    target.dispatchEvent(new Event('pause'));

    target.currentTime = 30;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;

    target.currentTime = 42;
    setSeeking(target, true);
    target.dispatchEvent(new Event('seeking'));
    worker.sent.length = 0;

    worker.reply({ kind: workerErrorCode.unavailable, requestId: activeId, time: 42, type: WorkerToMainMessageType.ERROR });

    expect(target.currentTime).toBe(30);

    // No PLAY was sent (the user is paused).
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(0);

    vi.useRealTimers();
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('cancels the seek watchdog so the original stall deadline does not fire a restart', () => {
    vi.useFakeTimers();
    const { host, target, worker } = attachAndHandshake();
    const activeId = loadWithDuration(host, worker, 'k', 60);

    target.currentTime = 30;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;

    // Start a seek at t=0; the watchdog is armed for 6000 ms.
    target.currentTime = 42;
    setSeeking(target, true);
    target.dispatchEvent(new Event('seeking'));
    worker.sent.length = 0;

    // At t=1000 the worker reports unavailable; the watchdog must be cancelled.
    vi.advanceTimersByTime(1000);
    worker.reply({ kind: workerErrorCode.unavailable, requestId: activeId, time: 42, type: WorkerToMainMessageType.ERROR });

    // Advance past the original 6 s deadline: no restart.
    vi.advanceTimersByTime(6000);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY)).toHaveLength(0);

    vi.useRealTimers();
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('drops a duplicate unavailable report before the snap-back seek has resolved', () => {
    vi.useFakeTimers();
    const { host, target, worker } = attachAndHandshake();
    const activeId = loadWithDuration(host, worker, 'k', 60);

    target.currentTime = 30;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;

    target.currentTime = 42;
    setSeeking(target, true);
    target.dispatchEvent(new Event('seeking'));
    worker.sent.length = 0;

    worker.reply({ kind: workerErrorCode.unavailable, requestId: activeId, time: 42, type: WorkerToMainMessageType.ERROR });
    expect(target.currentTime).toBe(30);
    // The snap-back's own native `seeking` re-enters the normal path: a
    // fresh SEEK at 30 and a watchdog re-armed for the snap-back.
    target.dispatchEvent(new Event('seeking'));
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK)).toHaveLength(1);

    // A duplicate of the ORIGINAL report (same request id, same target)
    // lands before the snap-back emits `seeked`. It names a target the
    // element is no longer seeking, so it must be dropped: no extra SEEK,
    // and the snap-back's watchdog left alone.
    worker.reply({ kind: workerErrorCode.unavailable, requestId: activeId, time: 42, type: WorkerToMainMessageType.ERROR });
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK)).toHaveLength(1);

    // The snap-back is still unresolved: its watchdog must still fire the
    // stalled-seek restart, proving the duplicate did not cancel it.
    vi.advanceTimersByTime(6000);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(1);

    vi.useRealTimers();
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('drops a stale unavailable report while a newer seek is in flight', () => {
    vi.useFakeTimers();
    const { host, target, worker } = attachAndHandshake();
    const activeId = loadWithDuration(host, worker, 'k', 60);

    target.currentTime = 30;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;

    target.currentTime = 42;
    setSeeking(target, true);
    target.dispatchEvent(new Event('seeking'));
    worker.sent.length = 0;

    worker.reply({ kind: workerErrorCode.unavailable, requestId: activeId, time: 42, type: WorkerToMainMessageType.ERROR });
    expect(target.currentTime).toBe(30);
    target.dispatchEvent(new Event('seeking')); // the snap-back's native re-fire
    target.dispatchEvent(new Event('seeked')); // the snap-back resolves
    worker.sent.length = 0;

    // The user starts a newer scrub to 50: fresh SEEK, fresh watchdog.
    target.currentTime = 50;
    target.dispatchEvent(new Event('seeking'));

    // A LATE echo of the original 42 report (same request id) arrives while
    // the 50 seek is in flight. It must not cancel the 50 seek's watchdog
    // or drag the element back to 30.
    worker.reply({ kind: workerErrorCode.unavailable, requestId: activeId, time: 42, type: WorkerToMainMessageType.ERROR });

    expect(target.currentTime).toBe(50);
    const seeks = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK);
    expect(seeks).toHaveLength(1);
    expect(seeks[0]).toMatchObject({ time: 50, type: MainToWorkerMessageType.SEEK });

    // The 50 seek's watchdog must survive the stale echo.
    vi.advanceTimersByTime(6000);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(1);

    vi.useRealTimers();
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('leaves the watchdog armed for a same-position snap-back so the stall deadline still fires the restart', () => {
    vi.useFakeTimers();
    const { host, target, worker } = attachAndHandshake();
    const activeId = loadWithDuration(host, worker, 'k', 60);

    // The element played to t=0.2: the host recorded it as the last playhead.
    target.currentTime = 0.2;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;

    // The user seeks back to 0; the element enters seeking at 0 and the
    // watchdog is armed for it.
    target.currentTime = 0;
    setSeeking(target, true);
    target.dispatchEvent(new Event('seeking'));
    worker.sent.length = 0;

    // The worker reports the seek target (0) as unavailable. The playhead is
    // within tolerance of the target, so the snap-back is 0: the element
    // already sits there, the write is a no-op, and no fresh `seeking`
    // re-arms anything.
    worker.reply({ kind: workerErrorCode.unavailable, requestId: activeId, time: 0, type: WorkerToMainMessageType.ERROR });

    // No snap occurred and no follow-up SEEK was issued.
    expect(target.currentTime).toBe(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK)).toHaveLength(0);

    // The watchdog the original seek armed must survive the no-op write:
    // past its deadline it fires the established stalled-seek recovery (a
    // source restart at the target).
    vi.advanceTimersByTime(6000);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(1);

    vi.useRealTimers();
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('drops a time-less unavailable report while a seek is in flight', () => {
    vi.useFakeTimers();
    const { host, target, worker } = attachAndHandshake();
    const activeId = loadWithDuration(host, worker, 'k', 60);

    target.currentTime = 30;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;

    // The user seeks to 42; the element enters seeking and the watchdog is
    // armed for the in-flight seek.
    target.currentTime = 42;
    setSeeking(target, true);
    target.dispatchEvent(new Event('seeking'));
    worker.sent.length = 0;

    // A time-less unavailable report (a stale echo that names no target)
    // lands while the 42 seek is in flight. It cannot be matched to that
    // seek, so it is dropped: no snap back, and the in-flight seek's
    // watchdog left untouched.
    worker.reply({ kind: workerErrorCode.unavailable, requestId: activeId, type: WorkerToMainMessageType.ERROR });

    expect(target.currentTime).toBe(42);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK)).toHaveLength(0);

    // The in-flight seek's watchdog must survive the dropped report: past
    // its deadline it fires the stalled-seek restart.
    vi.advanceTimersByTime(6000);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(1);

    vi.useRealTimers();
    host.destroy();
  });
});

describe('late unavailable seek retarget (host, nonfatal)', () => {
  // An `unavailable` report can land AFTER the element's native seek already
  // resolved (`seeked` cleared the in-flight marker): the target sat inside
  // buffered data, so the seek resolved, but the worker's replacement run for
  // it then fails on a persistent shard shortage. No in-flight seek remains
  // to match against, so the host retargets on its own: it names the
  // in-flight seek, posts an explicit SEEK for the last playable position,
  // repositions the element there, and arms the seek watchdog for the
  // restored target. The reposition's native `seeking` is the retarget's
  // own echo: `#onSeeking` matches it against the marker the retarget set
  // and drops it, so the restored seek posts exactly one SEEK. An unnamed report
  // names no position to restore and is ignored; a report naming the
  // restored target is an echo of the host's own retarget and is ignored
  // too, or the recovery would seek the same position forever. The
  // retarget stays nonfatal: no machine loadFailed, no source restart.

  function attachAndHandshake(): { host: SiaVideoSource; target: HTMLVideoElement; worker: FakeWorker; } {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    const target = document.createElement('video');
    host.attach(target);
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: helloRequestId(worker), type: WorkerToMainMessageType.HELLO_OK, version: PROTOCOL_VERSION });
    replyAttachOk(worker);
    return { host, target, worker };
  }

  const mainInfo = { container: 'fmp4', durationSeconds: null, mime: DEFAULT_FMP4_MIME, mode: 'main', tracks: [] } as const;

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

  /** Simulate the element being in a seeking state (jsdom never sets this natively). */
  function setSeeking(target: HTMLVideoElement, value: boolean): void {
    Object.defineProperty(target, 'seeking', { configurable: true, get: () => value });
  }

  /** Play to `playedSeconds`, seek to `seekSeconds`, let the native seek
   * resolve, then clear the wire log so the test counts only later traffic. */
  function resolveSeekTo(target: HTMLVideoElement, worker: FakeWorker, playedSeconds: number, seekSeconds: number): void {
    target.currentTime = playedSeconds;
    target.dispatchEvent(new Event('timeupdate'));
    target.currentTime = seekSeconds;
    setSeeking(target, true);
    target.dispatchEvent(new Event('seeking'));
    setSeeking(target, false);
    target.dispatchEvent(new Event('seeked'));
    worker.sent.length = 0;
  }

  it.skipIf(!IN_BROWSER)('retargets to the last playhead on a named late report after the native seek resolved', () => {
    const { host, target, worker } = attachAndHandshake();
    const activeId = loadWithDuration(host, worker, 'k', 60);

    // Played to 30; the seek to 42 resolved natively (target inside buffered
    // data), clearing the in-flight marker.
    resolveSeekTo(target, worker, 30, 42);

    // Late: the worker's replacement run for 42 finally fails, naming 42.
    worker.reply({ kind: workerErrorCode.unavailable, requestId: activeId, time: 42, type: WorkerToMainMessageType.ERROR });

    // The element is repositioned to the last playable position.
    expect(target.currentTime).toBe(30);

    // And an explicit SEEK names it to the worker, aimed at the active load.
    const seeks = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK);
    expect(seeks).toHaveLength(1);
    expect(seeks[0]).toMatchObject({ requestId: activeId, time: 30, type: MainToWorkerMessageType.SEEK });

    // Nonfatal: no source restart, no PLAY, no machine loadFailed.
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY)).toHaveLength(0);

    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('sends exactly one SEEK when the retarget reposition fires a native seeking', () => {
    const { host, target, worker } = attachAndHandshake();
    const activeId = loadWithDuration(host, worker, 'k', 60);

    // Played to 30; the seek to 42 resolved natively (target inside buffered
    // data), clearing the in-flight marker.
    resolveSeekTo(target, worker, 30, 42);

    // Late: the worker's replacement run for 42 finally fails, naming 42.
    worker.reply({ kind: workerErrorCode.unavailable, requestId: activeId, time: 42, type: WorkerToMainMessageType.ERROR });
    expect(target.currentTime).toBe(30);

    // In a real browser the retarget's reposition write puts the element
    // back in `seeking` and fires a native `seeking` for it.
    setSeeking(target, true);
    target.dispatchEvent(new Event('seeking'));

    // The wire must carry exactly one SEEK: the retarget's explicit one. A
    // second, identical SEEK from the native echo is the double-send bug.
    const seeks = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK);
    expect(seeks).toHaveLength(1);
    expect(seeks[0]).toMatchObject({ requestId: activeId, time: 30, type: MainToWorkerMessageType.SEEK });

    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('arms the seek watchdog for the restored target on a late retarget', () => {
    vi.useFakeTimers();
    const { host, target, worker } = attachAndHandshake();
    const activeId = loadWithDuration(host, worker, 'k', 60);

    resolveSeekTo(target, worker, 30, 42);
    worker.reply({ kind: workerErrorCode.unavailable, requestId: activeId, time: 42, type: WorkerToMainMessageType.ERROR });
    expect(target.currentTime).toBe(30);

    // The reposition write puts the element back into seeking. If the
    // restored seek never resolves, its watchdog must run the stalled-seek
    // restart at the deadline.
    setSeeking(target, true);
    worker.sent.length = 0;
    vi.advanceTimersByTime(6000);

    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(1);

    vi.useRealTimers();
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('ignores an unnamed late report after the native seek resolved', () => {
    const { host, target, worker } = attachAndHandshake();
    const activeId = loadWithDuration(host, worker, 'k', 60);

    resolveSeekTo(target, worker, 30, 42);

    // No `time`: names no position the host can restore.
    worker.reply({ kind: workerErrorCode.unavailable, requestId: activeId, type: WorkerToMainMessageType.ERROR });

    expect(target.currentTime).toBe(42);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(0);

    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('ignores an echo late report that names the restored target', () => {
    const { host, target, worker } = attachAndHandshake();
    const activeId = loadWithDuration(host, worker, 'k', 60);

    resolveSeekTo(target, worker, 30, 42);

    worker.reply({ kind: workerErrorCode.unavailable, requestId: activeId, time: 42, type: WorkerToMainMessageType.ERROR });
    expect(target.currentTime).toBe(30);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK)).toHaveLength(1);

    // The restored run at 30 reports unavailable too: an echo of the host's
    // own retarget. Acting on it would seek the same position again and
    // loop, so it is ignored.
    worker.reply({ kind: workerErrorCode.unavailable, requestId: activeId, time: 30, type: WorkerToMainMessageType.ERROR });

    expect(target.currentTime).toBe(30);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK)).toHaveLength(1);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(0);

    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('drops an echo naming the restored target while the restored seek is in flight', () => {
    vi.useFakeTimers();
    const { host, target, worker } = attachAndHandshake();
    const activeId = loadWithDuration(host, worker, 'k', 60);

    resolveSeekTo(target, worker, 30, 42);
    worker.reply({ kind: workerErrorCode.unavailable, requestId: activeId, time: 42, type: WorkerToMainMessageType.ERROR });
    expect(target.currentTime).toBe(30);

    // The reposition's native `seeking` is the echo of the retarget's own
    // post: `#onSeeking` matches it against the marker the retarget set and
    // drops it, so the wire carries exactly one SEEK for the restored
    // position.
    setSeeking(target, true);
    target.dispatchEvent(new Event('seeking'));
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK)).toHaveLength(1);

    // The restored run at 30 fails and reports it, naming 30 while that very
    // seek is in flight. It is an echo of the host's own retarget, not the
    // in-flight seek's failure to act on: dropped, with the restored seek's
    // watchdog left armed.
    worker.reply({ kind: workerErrorCode.unavailable, requestId: activeId, time: 30, type: WorkerToMainMessageType.ERROR });
    expect(target.currentTime).toBe(30);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK)).toHaveLength(1);

    // The restored seek's watchdog still fires the stalled-seek restart.
    vi.advanceTimersByTime(6000);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(1);

    vi.useRealTimers();
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('a late retarget falls back to 0 when the playhead is within tolerance of the dead target', () => {
    const { host, target, worker } = attachAndHandshake();
    const activeId = loadWithDuration(host, worker, 'k', 60);

    resolveSeekTo(target, worker, 30, 30.1);

    worker.reply({ kind: workerErrorCode.unavailable, requestId: activeId, time: 30.1, type: WorkerToMainMessageType.ERROR });

    // 30 is within tolerance of the dead 30.1: restoring back there would
    // re-stick, so the restore falls back to 0.
    expect(target.currentTime).toBe(0);
    const seeks = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK);
    expect(seeks).toHaveLength(1);
    expect(seeks[0]).toMatchObject({ requestId: activeId, time: 0, type: MainToWorkerMessageType.SEEK });

    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('never snaps back onto the known-dead retarget position', () => {
    vi.useFakeTimers();
    const { host, target, worker } = attachAndHandshake();
    const activeId = loadWithDuration(host, worker, 'k', 60);

    resolveSeekTo(target, worker, 30, 42);
    worker.reply({ kind: workerErrorCode.unavailable, requestId: activeId, time: 42, type: WorkerToMainMessageType.ERROR });
    expect(target.currentTime).toBe(30);

    // The user now deliberately seeks to 0.
    worker.sent.length = 0;
    target.currentTime = 0;
    setSeeking(target, true);
    target.dispatchEvent(new Event('seeking'));
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK)).toHaveLength(1);

    // The 0 run fails, naming 0. The last playhead is 30, which the host
    // already knows is dead (it is the retarget position): the snap-back
    // must not drag the element back onto it.
    worker.reply({ kind: workerErrorCode.unavailable, requestId: activeId, time: 0, type: WorkerToMainMessageType.ERROR });

    expect(target.currentTime).toBe(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK)).toHaveLength(1);

    // The in-flight seek's watchdog survives: it fires the stalled-seek
    // restart at the deadline.
    vi.advanceTimersByTime(6000);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(1);

    vi.useRealTimers();
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('snaps a later unavailable seek to the live playhead, not 0, once the retarget run proves it serves', () => {
    const { host, target, worker } = attachAndHandshake();
    const activeId = loadWithDuration(host, worker, 'k', 60);

    // Played to 30; the seek to 42 resolved natively and the worker's
    // replacement run for 42 then failed: the late report retargets to 30.
    resolveSeekTo(target, worker, 30, 42);
    worker.reply({ kind: workerErrorCode.unavailable, requestId: activeId, time: 42, type: WorkerToMainMessageType.ERROR });
    expect(target.currentTime).toBe(30);

    // The restored run serves: the restored seek resolves and the playhead
    // advances past 30 + tolerance, which a dead restored run never does.
    setSeeking(target, false);
    target.dispatchEvent(new Event('seeked'));
    target.currentTime = 30.3;
    target.dispatchEvent(new Event('timeupdate'));

    // The user scrubs back to 30.2 (serving) and then on to 30.5; both
    // resolve natively, so no in-flight marker remains for the late report.
    target.currentTime = 30.2;
    setSeeking(target, true);
    target.dispatchEvent(new Event('seeking'));
    setSeeking(target, false);
    target.dispatchEvent(new Event('seeked'));
    target.dispatchEvent(new Event('timeupdate'));
    target.currentTime = 30.5;
    setSeeking(target, true);
    target.dispatchEvent(new Event('seeking'));
    setSeeking(target, false);
    target.dispatchEvent(new Event('seeked'));
    worker.sent.length = 0;

    // The run for 30.5 fails on a persistent gap and reports it late.
    worker.reply({ kind: workerErrorCode.unavailable, requestId: activeId, time: 30.5, type: WorkerToMainMessageType.ERROR });

    // The snap-back lands on the live, serving playhead 30.2, not on 0:
    // 30.2 is within tolerance of the retarget position 30, but that
    // position has since proven it serves, so it is not the known-dead
    // ground the snap-back must avoid.
    expect(target.currentTime).toBe(30.2);
    const seeks = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK);
    expect(seeks).toHaveLength(1);
    expect(seeks[0]).toMatchObject({ requestId: activeId, time: 30.2, type: MainToWorkerMessageType.SEEK });

    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('does not retarget on a late report while a stalled seek restart is in flight', () => {
    vi.useFakeTimers();
    const { host, target, worker } = attachAndHandshake();
    const activeId = loadWithDuration(host, worker, 'k', 60);

    target.currentTime = 30;
    target.dispatchEvent(new Event('timeupdate'));

    // A seek to 42 that never resolves: at the deadline the machine restarts
    // the source at 42 and the old load is superseded.
    target.currentTime = 42;
    setSeeking(target, true);
    target.dispatchEvent(new Event('seeking'));
    worker.sent.length = 0;
    vi.advanceTimersByTime(6000);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(1);
    worker.sent.length = 0;

    // A late unavailable report for the superseded load must not add a
    // second restart on top of the in-flight recovery.
    worker.reply({ kind: workerErrorCode.unavailable, requestId: activeId, time: 42, type: WorkerToMainMessageType.ERROR });

    expect(target.currentTime).toBe(42);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SEEK)).toHaveLength(0);

    vi.useRealTimers();
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
