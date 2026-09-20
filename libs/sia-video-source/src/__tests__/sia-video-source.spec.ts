import type { AppMetadata } from '@siafoundation/sia-storage';
import { describe, expect, it, vi } from 'vitest';
import {
  decryptAppKeyEnvelope,
  exportWorkerPublicKey,
  generateWorkerKeyPair,
} from '../app-key-handshake.ts';
import { MseAppendPipe } from '../mse-pipe.ts';
import { type AppKeyEnvelope, DEFAULT_FMP4_MIME, isAppKeyEnvelope, type MainToWorkerMessage, PROTOCOL_VERSION, WORKER_PUBLIC_KEY_LENGTH, type WorkerToMainMessage } from '../protocol.ts';
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

    target.currentTime = 13;
    target.dispatchEvent(new Event('timeupdate'));
    expect(worker.sent.at(-1)).toMatchObject({ time: 13, type: 'PLAYHEAD' });
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


  it.skipIf(!IN_BROWSER)('forwards an explicit worker-MSE preference on HELLO and omits it by default', () => {
    const worker = new FakeWorker();

    const forced = new SiaVideoSource({
      createWorker: () => worker as unknown as Worker,
      workerConfig: workerConfig(),
      workerMse: 'main',
    });
    forced.attach(document.createElement('video'));
    const forcedHello = worker.sent.find((m) => m.type === 'HELLO') as { config?: { workerMse?: string }; type: 'HELLO'; };
    expect(forcedHello.config).toMatchObject({ workerMse: 'main' });
    forced.destroy();

    // Default auto (or unset) leaves the wire byte-identical: no workerMse.
    const auto = new SiaVideoSource({ createWorker: () => worker as unknown as Worker, workerConfig: workerConfig() });
    auto.attach(document.createElement('video'));
    const autoHello = worker.sent.filter((m) => m.type === 'HELLO').at(-1) as { config?: Record<string, unknown>; type: 'HELLO'; };
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

    worker.reply({ features: { workerMse: true }, publicKey: new Uint8Array(32), requestId: 1, type: 'HELLO_OK', version: PROTOCOL_VERSION });
    worker.reply({ mode: 'worker', requestId: 2, type: 'ATTACH_OK' });

    host.src = 'k';
    const source = worker.sent.find((m) => m.type === 'SOURCE') as
      | undefined
      | { preload: string; requestId: number; src: string; type: 'SOURCE'; };
    if (!source) throw new Error('SOURCE was not sent');
    worker.reply({
      info: { container: 'fmp4', durationSeconds: null, mime: 'video/mp4', mode: 'worker' },
      requestId: source.requestId,
      type: 'SOURCE_OK',
    });

    // Worker mode: produced media never leaves the worker — the host only
    // attaches the transferred MediaSourceHandle to the element.
    if (canAttach) {
      worker.reply({ handle, requestId: source.requestId, type: 'HANDLE' });
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
    worker.reply({ features: { workerMse: false }, publicKey, requestId: 1, type: 'HELLO_OK', version: PROTOCOL_VERSION });
    await new Promise((resolve) => setTimeout(resolve, 0));

    // The setter-supplied supplier reached the HELLO_OK handler: the APP_KEY
    // envelope still precedes ATTACH (ordering unchanged for this path)…
    expect(worker.sent.map((m) => m.type)).toEqual(['HELLO', 'APP_KEY', 'ATTACH']);
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
    expect(worker.sent.map((m) => m.type)).toEqual(['HELLO']);

    worker.reply({ features: { workerMse: false }, publicKey, requestId: 1, type: 'HELLO_OK', version: PROTOCOL_VERSION });
    // Let the async seed→envelope chain (and whatever is chained behind it)
    // settle; the old code posted ATTACH + flush synchronously in the
    // HELLO_OK handler, so this wait is what exposes the ordering.
    await new Promise((resolve) => setTimeout(resolve, 0));

    // The worker consumes the captured postMessage sequence FIFO: APP_KEY
    // must precede ATTACH and everything the flush released, or the first
    // load hits the worker-side seed requirement and fails with a spurious
    // "No Sia SDK is available" network error at playback start.
    const sentTypes = worker.sent.map((m) => m.type);
    expect(sentTypes).toEqual(['HELLO', 'APP_KEY', 'ATTACH', 'SEEK', 'PLAY']);

    // Playback still proceeds: the ATTACH round trip replays the stored
    // source and the load acknowledges without any spurious error event.
    worker.reply({ mode: 'main', requestId: 2, type: 'ATTACH_OK' });
    const source = worker.sent.find((m) => m.type === 'SOURCE') as
      | undefined
      | { preload: string; requestId: number; src: string; type: 'SOURCE'; };
    expect(source?.src).toBe('fifo-ordered-object');
    worker.reply({
      info: { container: 'fmp4', durationSeconds: null, mime: 'video/mp4', mode: 'main' },
      requestId: source?.requestId ?? 0,
      type: 'SOURCE_OK',
    });
    expect(host.error).toBeNull();
    expect(errorEvents).toBe(0);
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

    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 1, type: 'HELLO_OK', version: PROTOCOL_VERSION });
    // No seed supplier → ATTACH goes out synchronously and the queued PLAY is
    // flushed behind it, mirroring the live player's first-load ordering.
    expect(worker.sent.map((m) => m.type)).toEqual(['HELLO', 'ATTACH', 'PLAY']);

    worker.sent.length = 0;
    worker.reply({ mode: 'main', requestId: 2, type: 'ATTACH_OK' });

    // The fresh SOURCE alone would start deferred (preload defaults to
    // 'metadata') and the pipeline would stall at byte 0 forever — nothing
    // re-states the user's play after the attach rebuilt the pipeline. The
    // host must re-send PLAY aimed at the replayed source's load so the
    // worker begins streaming once its probe completes.
    const sentTypes = worker.sent.map((m) => m.type);
    expect(sentTypes.filter((t) => t === 'SOURCE' || t === 'PLAY')).toEqual(['SOURCE', 'PLAY']);

    const source = worker.sent.find((m) => m.type === 'SOURCE');
    const play = worker.sent.find((m) => m.type === 'PLAY');
    expect(source?.src).toBe('replay-play-object');
    // The re-stated PLAY names the load it belongs to, matching the replayed
    // SOURCE's request id, so the worker honors it when that load completes.
    expect(play?.requestId).toBe(source?.requestId);
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

  it.skipIf(!IN_BROWSER)('calls MediaSource.endOfStream after ENDED once appends drain (main mode)', async () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    const target = document.createElement('video');
    host.attach(target);
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 1, type: 'HELLO_OK', version: PROTOCOL_VERSION });
    // The host only acts on main-mode CHUNK/ENDED once the mode is known, so
    // complete the ATTACH round trip before the load starts.
    worker.reply({ mode: 'main', requestId: 2, type: 'ATTACH_OK' });

    host.src = 'k';
    const source = worker.sent.find((m) => m.type === 'SOURCE') as
      | undefined
      | { requestId: number; type: 'SOURCE'; };
    if (!source) throw new Error('SOURCE was not sent');
    worker.reply({
      info: { container: 'fmp4', durationSeconds: null, mime: DEFAULT_FMP4_MIME, mode: 'main' },
      requestId: source.requestId,
      type: 'SOURCE_OK',
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
      type: 'CHUNK',
    });
    worker.reply({ requestId: source.requestId, type: 'ENDED' });

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
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 1, type: 'HELLO_OK', version: PROTOCOL_VERSION });

    host.src = 'k';
    const source = worker.sent.find((m) => m.type === 'SOURCE') as
      | undefined
      | { requestId: number; type: 'SOURCE'; };
    if (!source) throw new Error('SOURCE was not sent');
    worker.reply({
      info: { container: 'fmp4', durationSeconds: null, mime: 'video/mp4', mode: 'main' },
      requestId: source.requestId,
      type: 'SOURCE_OK',
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    const endSpy = vi.spyOn(MediaSource.prototype, 'endOfStream');
    worker.reply({ requestId: 999, type: 'ENDED' });
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(endSpy.mock.calls.length).toBe(0);
    endSpy.mockRestore();
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('does not end main-thread MSE after its load reports an error', async () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    host.attach(document.createElement('video'));
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 1, type: 'HELLO_OK', version: PROTOCOL_VERSION });
    worker.reply({ mode: 'main', requestId: 2, type: 'ATTACH_OK' });

    host.src = 'k';
    const source = worker.sent.find((m) => m.type === 'SOURCE') as
      | undefined
      | { requestId: number; type: 'SOURCE'; };
    if (!source) throw new Error('SOURCE was not sent');
    worker.reply({
      info: { container: 'fmp4', durationSeconds: null, mime: DEFAULT_FMP4_MIME, mode: 'main' },
      requestId: source.requestId,
      type: 'SOURCE_OK',
    });
    await new Promise((resolve) => setTimeout(resolve, 50));

    const endSpy = vi.spyOn(MediaSource.prototype, 'endOfStream');
    worker.reply({ context: 'append failed', kind: 'decode', requestId: source.requestId, type: 'ERROR' });
    worker.reply({ requestId: source.requestId, type: 'ENDED' });
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
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 1, type: 'HELLO_OK', version: PROTOCOL_VERSION });
    worker.reply({ mode: 'main', requestId: 2, type: 'ATTACH_OK' });

    host.src = 'seek-object';
    const source = worker.sent.find((m) => m.type === 'SOURCE') as
      | undefined
      | { requestId: number; type: 'SOURCE'; };
    if (!source) throw new Error('SOURCE was not sent');
    worker.reply({
      info: { container: 'fmp4', durationSeconds: null, mime: DEFAULT_FMP4_MIME, mode: 'main' },
      requestId: source.requestId,
      type: 'SOURCE_OK',
    });
    // Let sourceopen + addSourceBuffer settle so the shared pipe holds a real
    // SourceBuffer and the seek reset can abort its segment parser.
    await new Promise((resolve) => setTimeout(resolve, 50));

    const abortSpy = vi.spyOn(SourceBuffer.prototype, 'abort');

    // Forward seek: the host resets the pipe for the new position and the
    // quiesced SourceBuffer's segment parser is aborted so the worker's fresh
    // fragment starts a new segment (the main-thread regression from the
    // ac55a7b0 parser-reset change).
    target.currentTime = 45;
    target.dispatchEvent(new Event('seeking'));
    expect(worker.sent.at(-1)).toMatchObject({ time: 45, type: 'SEEK' });
    await settle(4);
    expect(abortSpy).toHaveBeenCalledTimes(1);

    // Backward seek: another reset, another parser abort, same buffer reused.
    target.currentTime = 10;
    target.dispatchEvent(new Event('seeking'));
    expect(worker.sent.at(-1)).toMatchObject({ time: 10, type: 'SEEK' });
    await settle(4);
    expect(abortSpy).toHaveBeenCalledTimes(2);

    // Forward again: rapid repeated seeks each reset the shared pipe exactly
    // once — never re-entering, and never tearing the pipeline down.
    target.currentTime = 30;
    target.dispatchEvent(new Event('seeking'));
    expect(worker.sent.at(-1)).toMatchObject({ time: 30, type: 'SEEK' });
    await settle(4);
    expect(abortSpy).toHaveBeenCalledTimes(3);

    abortSpy.mockRestore();
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('surfaces a fatal SourceBuffer append failure once and never endOfStreams the failed pipeline', async () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    const target = document.createElement('video');
    host.attach(target);
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 1, type: 'HELLO_OK', version: PROTOCOL_VERSION });
    worker.reply({ mode: 'main', requestId: 2, type: 'ATTACH_OK' });

    host.src = 'k';
    const source = worker.sent.find((m) => m.type === 'SOURCE') as
      | undefined
      | { requestId: number; type: 'SOURCE'; };
    if (!source) throw new Error('SOURCE was not sent');
    worker.reply({
      info: { container: 'fmp4', durationSeconds: null, mime: DEFAULT_FMP4_MIME, mode: 'main' },
      requestId: source.requestId,
      type: 'SOURCE_OK',
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
      type: 'CHUNK',
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
      type: 'CHUNK',
    });
    // ...and a late ENDED must not endOfStream a failed pipeline — the
    // main-thread fallback never masks a failure with a clean end.
    worker.reply({ requestId: source.requestId, type: 'ENDED' });
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
    worker.reply({ features: { workerMse: false }, publicKey: new Uint8Array(32), requestId: 1, type: 'HELLO_OK', version: PROTOCOL_VERSION });
    worker.reply({ mode: 'main', requestId: 2, type: 'ATTACH_OK' });

    host.src = 'k';
    const source = worker.sent.find((m) => m.type === 'SOURCE') as
      | undefined
      | { requestId: number; type: 'SOURCE'; };
    if (!source) throw new Error('SOURCE was not sent');
    worker.reply({
      info: { container: 'fmp4', durationSeconds: null, mime: DEFAULT_FMP4_MIME, mode: 'main' },
      requestId: source.requestId,
      type: 'SOURCE_OK',
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
    expect(worker.sent.at(-1)).toMatchObject({ time: 60, type: 'PLAYHEAD' });

    target.currentTime = 61;
    target.dispatchEvent(new Event('timeupdate'));
    expect(evictSpy).toHaveBeenCalledTimes(2);

    evictSpy.mockRestore();
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
