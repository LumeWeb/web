/**
 * `SiaVideoSource.reloadConfiguration()` — the public in-place re-handshake
 * that reapplies the CURRENT configuration without remounting the media: a
 * fresh HELLO (carrying the current worker config + seed-presence flags), the
 * current suppliers re-read into fresh encrypted APP_KEY envelopes, an ATTACH,
 * and the current source replayed with the preserved play/pause intent, all
 * through the same worker and element.
 *
 * These specs cover the host side of the reload contract:
 *   - A: an attached reload posts a fresh HELLO carrying the updated config
 *   - B: a changed supplier is re-read into a fresh APP_KEY envelope at reload
 *   - C: the current source replays on ATTACH_OK; PLAY is re-stated only when
 *        the preserved playback choice is playing
 *   - D: the same worker and element survive the reload (no remount/respawn)
 *   - E: an active recovery observation closes exactly once, and the reload's
 *        load boundary drops stored load facts / a fatal error
 *   - F: an unattached / detached / destroyed host ignores the call
 *   - G: plain setters never handshake on their own
 *   - H: overlapping reloads cannot let an older async seed chain win
 *   - I: detach / destroy invalidates pending handshake work (a stale HELLO_OK
 *        or a stale async chain is dropped)
 *
 * Requires a DOM and MediaSource, so these run in browser mode only;
 * `SIA_TEST_ENV=node` skips them (same gate as `sia-video-source.spec.ts`).
 */

import type { AppMetadata } from '@siafoundation/sia-storage';
import { type HTMLVideoTargetLike } from '@videojs/media/dom/video-host';
import { describe, expect, it } from 'vitest';
import {
  decryptAppKeyEnvelope,
  exportWorkerPublicKey,
  generateWorkerKeyPair,
} from '../app-key-handshake.ts';
import {
  type AppKeyEnvelope,
  DEFAULT_FMP4_MIME,
  isAppKeyEnvelope,
  type MainToWorkerMessage,
  MainToWorkerMessageType,
  PROTOCOL_VERSION,
  type WorkerToMainMessage,
  WorkerToMainMessageType,
} from '../protocol.ts';
import {
  type RecoveryChangeDetail,
  siaRecoveryChange,
  SiaVideoSource,
} from '../sia-video-source.ts';

const IN_BROWSER = typeof document !== 'undefined' && typeof MediaSource !== 'undefined';

/** Records what the host posts and lets tests inject worker replies. */
class FakeWorker {
  listener: ((event: { data: unknown }) => void) | null = null;
  readonly sent: MainToWorkerMessage[] = [];

  addEventListener(_type: 'message', listener: (event: { data: unknown }) => void): void {
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

/**
 * Test-only seam that widens the host's PROTECTED attach target into a public,
 * read-only view. Test (D) must prove the SAME element survives a reload, and
 * the library deliberately keeps the element behind `protected target` (part
 * of its encapsulation). A fixture subclass is the legitimate place to widen
 * that visibility for assertions; production code is untouched.
 */
class ObservableSiaVideoSource extends SiaVideoSource {
  /** The element the host is currently attached to (public test view). */
  get attachedTarget(): HTMLVideoTargetLike | null {
    return this.target;
  }
}

function appMetadata(): AppMetadata {
  return { appId: 'test-app-id', callbackUrl: '', description: 'test', logoUrl: '', name: 'app', serviceUrl: 'https://app.example' };
}

/** attach + HELLO_OK (seed-less) → a ready, main-mode host. */
function attachAndHandshake(): { host: SiaVideoSource; target: HTMLVideoElement; worker: FakeWorker } {
  const worker = new FakeWorker();
  const host = new SiaVideoSource({
    createWorker: () => worker as unknown as Worker,
    workerConfig: workerConfig(),
  });
  const target = document.createElement('video');
  host.attach(target);
  replyHelloOk(worker);
  return { host, target, worker };
}

/** The requestId of the newest HELLO the host posted — what a faithful HELLO_OK echoes. */
function latestHelloRequestId(worker: FakeWorker): number {
  const hello = worker.sent.filter((m) => m.type === MainToWorkerMessageType.HELLO).at(-1);
  if (!hello || !('requestId' in hello)) throw new Error('no HELLO posted to echo');
  return hello.requestId;
}

/** Loads `src` and acknowledges it (main-mode SOURCE_OK), returning its request id. */
function loadAndAcknowledge(host: SiaVideoSource, worker: FakeWorker, src: string): number {
  host.src = src;
  const source = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE).at(-1);
  if (!source || !('requestId' in source)) throw new Error('SOURCE was not sent');
  worker.reply({
    info: mainInfo,
    requestId: source.requestId,
    type: WorkerToMainMessageType.SOURCE_OK,
  });
  return source.requestId;
}

const mainInfo = { container: 'fmp4', durationSeconds: null, mime: DEFAULT_FMP4_MIME, mode: 'main', tracks: [] } as const;

/** The newest ATTACH on the wire (its requestId feeds the ATTACH_OK reply). */
function newestAttach(worker: FakeWorker): { requestId: number; type: MainToWorkerMessageType.ATTACH } {
  const attach = worker.sent.filter((m) => m.type === MainToWorkerMessageType.ATTACH).at(-1);
  if (!attach || !('requestId' in attach)) throw new Error('no ATTACH on the wire');
  return attach;
}

/** Replies a HELLO_OK echoing the newest HELLO, with optional field overrides. */
function replyHelloOk(
  worker: FakeWorker,
  overrides: Partial<{ features: { workerMse: boolean }; publicKey: Uint8Array; version: number }> = {},
): void {
  worker.reply({
    features: { workerMse: false },
    publicKey: new Uint8Array(32),
    requestId: latestHelloRequestId(worker),
    type: WorkerToMainMessageType.HELLO_OK,
    version: PROTOCOL_VERSION,
    ...overrides,
  });
}

/** Lets queued microtasks/timers from the async seed chain flush out. */
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

function targetPaused(host: SiaVideoSource): boolean {
  // `paused` is a PUBLIC base-class delegate for the attached target, so the
  // play/pause intent is observable without touching the protected element.
  return host.paused;
}

function workerConfig(indexerUrl = 'https://sia.storage') {
  return { app: appMetadata(), indexerUrl };
}

describe('SiaVideoSource.reloadConfiguration', () => {
  it.skipIf(!IN_BROWSER)('posts a fresh HELLO carrying the current workerConfig (A)', async () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({
      createWorker: () => worker as unknown as Worker,
      workerConfig: workerConfig('https://a.example'),
    });
    host.attach(document.createElement('video'));
    replyHelloOk(worker);
    await settle();
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.HELLO)).toHaveLength(1);
    worker.sent.length = 0;

    host.workerConfig = workerConfig('https://b.example');
    host.reloadConfiguration();

    const hellos = worker.sent.filter((m) => m.type === MainToWorkerMessageType.HELLO);
    expect(hellos).toHaveLength(1);
    expect(hellos.at(-1)).toMatchObject({
      config: { indexerUrl: 'https://b.example' },
      type: MainToWorkerMessageType.HELLO,
    });
    // The reload posts the HELLO first; no ATTACH has been sent because its
    // HELLO_OK has not arrived/processed yet.
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.ATTACH)).toHaveLength(0);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('re-reads the current seed supplier into a fresh encrypted APP_KEY envelope (B)', async () => {
    const worker = new FakeWorker();
    const keyPair = generateWorkerKeyPair();
    const publicKey = exportWorkerPublicKey(keyPair);
    const firstSeed = crypto.getRandomValues(new Uint8Array(32));
    const secondSeed = crypto.getRandomValues(new Uint8Array(32));
    const expectedSecond = new Uint8Array(secondSeed);
    let supplierCalls = 0;
    const host = new SiaVideoSource({
      createWorker: () => worker as unknown as Worker,
      getAppKeySeed: () => {
        supplierCalls++;
        return supplierCalls === 1 ? firstSeed : secondSeed;
      },
      workerConfig: workerConfig(),
    });
    host.attach(document.createElement('video'));
    replyHelloOk(worker, { publicKey });
    await settle();
    // First handshake consumed the original supplier exactly once.
    expect(supplierCalls).toBe(1);
    worker.sent.length = 0;

    host.reloadConfiguration();
    const helloId = latestHelloRequestId(worker);
    worker.reply({
      features: { workerMse: false },
      publicKey,
      requestId: helloId,
      type: WorkerToMainMessageType.HELLO_OK,
      version: PROTOCOL_VERSION,
    });
    await settle();

    // A fresh envelope for the CURRENT (second) seed, never the first one.
    const appKeys = worker.sent.filter((m) => m.type === MainToWorkerMessageType.APP_KEY);
    expect(appKeys).toHaveLength(1);
    expect(worker.sent.map((m) => m.type)).toEqual([MainToWorkerMessageType.HELLO, MainToWorkerMessageType.APP_KEY, MainToWorkerMessageType.ATTACH]);
    const envelope = (appKeys[0] as unknown as { envelope: AppKeyEnvelope }).envelope;
    expect(isAppKeyEnvelope(envelope)).toBe(true);
    const decrypted = await decryptAppKeyEnvelope(keyPair, envelope);
    expect(Array.from(decrypted)).toEqual(Array.from(expectedSecond));
    expect(supplierCalls).toBe(2);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('replays the current source on ATTACH_OK and re-states PLAY for a preserved playing intent (C)', () => {
    const { host, target, worker } = attachAndHandshake();
    loadAndAcknowledge(host, worker, 'k');
    // The user asked to play (machine playback choice 'playing').
    target.dispatchEvent(new Event('play'));
    worker.sent.length = 0;

    host.reloadConfiguration();
    replyHelloOk(worker);
    const attach = newestAttach(worker);
    worker.sent.length = 0;
    worker.reply({ mode: 'main', requestId: attach.requestId, type: WorkerToMainMessageType.ATTACH_OK });

    const sources = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE);
    expect(sources).toHaveLength(1);
    expect(sources[0]).toMatchObject({ src: 'k', type: MainToWorkerMessageType.SOURCE });
    const plays = worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY);
    expect(plays).toHaveLength(1);
    expect(plays[0].requestId).toBe(sources[0].requestId);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('does not re-state PLAY when the user is paused (C)', () => {
    const { host, worker } = attachAndHandshake();
    loadAndAcknowledge(host, worker, 'k');
    expect(targetPaused(host)).toBe(true);
    worker.sent.length = 0;

    host.reloadConfiguration();
    replyHelloOk(worker);
    const attach = newestAttach(worker);
    worker.sent.length = 0;
    worker.reply({ mode: 'main', requestId: attach.requestId, type: WorkerToMainMessageType.ATTACH_OK });

    const sentTypes = worker.sent.map((m) => m.type);
    expect(sentTypes.filter((t) => t === MainToWorkerMessageType.SOURCE || t === MainToWorkerMessageType.PLAY)).toEqual([
      MainToWorkerMessageType.SOURCE,
    ]);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('keeps the same worker and element across a reload (D)', () => {
    let spawns = 0;
    const worker = new FakeWorker();
    const host = new ObservableSiaVideoSource({
      createWorker: () => {
        spawns++;
        return worker as unknown as Worker;
      },
      workerConfig: workerConfig(),
    });
    const target = document.createElement('video');
    host.attach(target);
    replyHelloOk(worker);
    const engineBefore = host.engine;
    expect(engineBefore).toBe(worker);
    expect(host.attachedTarget).toBe(target);

    host.reloadConfiguration();
    replyHelloOk(worker);

    expect(host.engine).toBe(engineBefore);
    // The fixture subclass widens the otherwise-protected element so the "no
    // remount" guarantee is asserted on the real attached element.
    expect(host.attachedTarget).toBe(target);
    expect(spawns).toBe(1);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.HELLO)).toHaveLength(2);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('closes an active recovery exactly once and resets the load on reload (E)', () => {
    const { host, target, worker } = attachAndHandshake();
    const loadId = loadAndAcknowledge(host, worker, 'k');
    const seen: RecoveryChangeDetail[] = [];
    host.addEventListener(siaRecoveryChange, (event: Event) => {
      seen.push((event as CustomEvent<RecoveryChangeDetail>).detail);
    });

    target.dispatchEvent(new Event('play'));
    target.currentTime = 42.5;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;
    worker.reply({ context: 'append failed', kind: 'decode', requestId: loadId, type: WorkerToMainMessageType.ERROR });
    expect(seen).toEqual([{ active: true, reason: 'decode', resumeSeconds: 42.5, wantsPlay: true }]);

    worker.sent.length = 0;
    host.reloadConfiguration();
    replyHelloOk(worker);
    const attach = newestAttach(worker);
    worker.sent.length = 0;
    worker.reply({ mode: 'main', requestId: attach.requestId, type: WorkerToMainMessageType.ATTACH_OK });

    // The replayed load names a fresh request id and the recovery window
    // closes exactly once — a re-open or a duplicate close is a bug.
    const source = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE).at(-1);
    expect(source && 'requestId' in source ? source.requestId : undefined).not.toBe(loadId);
    expect(seen).toEqual([
      { active: true, reason: 'decode', resumeSeconds: 42.5, wantsPlay: true },
      { active: false },
    ]);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('drops a stored fatal error at the reload load boundary (E)', () => {
    const { host, worker } = attachAndHandshake();
    const loadId = loadAndAcknowledge(host, worker, 'k');
    worker.reply({ context: 'connection reset', kind: 'network', requestId: loadId, type: WorkerToMainMessageType.ERROR });
    expect(host.error).not.toBeNull();

    worker.sent.length = 0;
    host.reloadConfiguration();
    replyHelloOk(worker);
    const attach = newestAttach(worker);
    worker.sent.length = 0;
    worker.reply({ mode: 'main', requestId: attach.requestId, type: WorkerToMainMessageType.ATTACH_OK });

    expect(host.error).toBeNull();
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(1);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('is a no-op before attach, when detached, and after destroy (F)', () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({
      createWorker: () => worker as unknown as Worker,
      workerConfig: workerConfig(),
    });

    // Never attached: nothing to reload.
    host.reloadConfiguration();
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.HELLO)).toHaveLength(0);

    const target = document.createElement('video');
    host.attach(target);
    replyHelloOk(worker);
    worker.sent.length = 0;

    // Detached (still has a worker, but no element to replay into): no-op.
    host.detach();
    host.reloadConfiguration();
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.HELLO)).toHaveLength(0);

    host.attach(document.createElement('video'));
    replyHelloOk(worker);
    worker.sent.length = 0;

    // Destroyed: no-op.
    host.destroy();
    host.reloadConfiguration();
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.HELLO)).toHaveLength(0);
  });

  it.skipIf(!IN_BROWSER)('setters alone never handshake (G)', () => {
    const { host, worker } = attachAndHandshake();
    worker.sent.length = 0;

    host.workerConfig = workerConfig('https://changed.example');
    host.workerMse = 'main';
    host.getAppKeySeed = () => crypto.getRandomValues(new Uint8Array(32));
    host.getSharingKeySeed = () => crypto.getRandomValues(new Uint8Array(32));

    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.HELLO)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.ATTACH)).toHaveLength(0);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('ignores a stale HELLO_OK answered before a newer reload HELLO was posted (H/race)', async () => {
    const worker = new FakeWorker();
    const keyPair = generateWorkerKeyPair();
    const publicKey = exportWorkerPublicKey(keyPair);
    const host = new SiaVideoSource({
      createWorker: () => worker as unknown as Worker,
      getAppKeySeed: () => crypto.getRandomValues(new Uint8Array(32)),
      workerConfig: workerConfig(),
    });
    host.attach(document.createElement('video'));
    const firstHelloId = latestHelloRequestId(worker);

    // A reload posts a NEWER HELLO while the first handshake's HELLO_OK is
    // still in flight toward the host (a real MessagePort reply is async).
    host.reloadConfiguration();

    // The worker's reply intended for the OLD handshake finally arrives: its
    // requestId no longer matches the current handshake, so it must not gate
    // the session (#ready) nor launch a seed chain.
    worker.reply({
      features: { workerMse: false },
      publicKey,
      requestId: firstHelloId,
      type: WorkerToMainMessageType.HELLO_OK,
      version: PROTOCOL_VERSION,
    });
    await settle();
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.APP_KEY)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.ATTACH)).toHaveLength(0);

    // The CURRENT handshake's HELLO_OK proceeds normally.
    worker.reply({
      features: { workerMse: false },
      publicKey,
      requestId: latestHelloRequestId(worker),
      type: WorkerToMainMessageType.HELLO_OK,
      version: PROTOCOL_VERSION,
    });
    await settle();
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.APP_KEY)).toHaveLength(1);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.ATTACH)).toHaveLength(1);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('overlapping reloads cannot let the older async seed chain win (H)', async () => {
    const worker = new FakeWorker();
    const keyPair = generateWorkerKeyPair();
    const publicKey = exportWorkerPublicKey(keyPair);
    const firstSeed = crypto.getRandomValues(new Uint8Array(32));
    const secondSeed = crypto.getRandomValues(new Uint8Array(32));
    const expectedSecond = new Uint8Array(secondSeed);
    let resolveFirst: ((seed: Uint8Array) => void) | undefined;
    let supplierCalls = 0;
    const host = new SiaVideoSource({
      createWorker: () => worker as unknown as Worker,
      getAppKeySeed: () => {
        supplierCalls++;
        if (supplierCalls === 1) {
          // The FIRST handshake's supplier is slow: its chain stays pending.
          return new Promise<Uint8Array>((resolve) => {
            resolveFirst = resolve;
          });
        }
        // The reload's supplier resolves immediately with the CURRENT seed.
        return Promise.resolve(secondSeed);
      },
      workerConfig: workerConfig(),
    });
    host.attach(document.createElement('video'));
    worker.reply({
      features: { workerMse: false },
      publicKey,
      requestId: latestHelloRequestId(worker),
      type: WorkerToMainMessageType.HELLO_OK,
      version: PROTOCOL_VERSION,
    });
    // The first chain is awaiting the slow supplier; nothing is on the wire yet.
    worker.sent.length = 0;

    // Reload starts a second handshake whose fast supplier posts its envelope
    // and ATTACH before the first chain ever resolves.
    host.reloadConfiguration();
    worker.reply({
      features: { workerMse: false },
      publicKey,
      requestId: latestHelloRequestId(worker),
      type: WorkerToMainMessageType.HELLO_OK,
      version: PROTOCOL_VERSION,
    });
    await settle();
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.APP_KEY)).toHaveLength(1);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.ATTACH)).toHaveLength(1);

    // The OLD chain finally resolves — it must be dropped, not win the wire.
    if (resolveFirst === undefined) throw new Error('first supplier was never invoked');
    resolveFirst(firstSeed);
    await settle();
    const appKeys = worker.sent.filter((m) => m.type === MainToWorkerMessageType.APP_KEY);
    expect(appKeys).toHaveLength(1);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.ATTACH)).toHaveLength(1);
    const envelope = (appKeys[0] as unknown as { envelope: AppKeyEnvelope }).envelope;
    expect(Array.from(await decryptAppKeyEnvelope(keyPair, envelope))).toEqual(Array.from(expectedSecond));
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('a pending reload chain is dropped when the host detaches before it completes (I)', async () => {
    const worker = new FakeWorker();
    let resolveFirst: ((seed: Uint8Array) => void) | undefined;
    const staleSeed = crypto.getRandomValues(new Uint8Array(32));
    const host = new SiaVideoSource({
      createWorker: () => worker as unknown as Worker,
      getAppKeySeed: () =>
        new Promise<Uint8Array>((resolve) => {
          resolveFirst = resolve;
        }),
      workerConfig: workerConfig(),
    });
    host.attach(document.createElement('video'));
    worker.reply({
      features: { workerMse: false },
      publicKey: new Uint8Array(32),
      requestId: latestHelloRequestId(worker),
      type: WorkerToMainMessageType.HELLO_OK,
      version: PROTOCOL_VERSION,
    });
    worker.sent.length = 0;

    // Detach bumps the handshake generation: the in-flight chain is dead.
    host.detach();
    if (resolveFirst === undefined) throw new Error('supplier was never invoked');
    resolveFirst(staleSeed);
    await settle();

    // The stale chain must not post its envelope/ATTACH into the detached
    // session (the worker is still alive — only the generation guard stops it).
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.APP_KEY)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.ATTACH)).toHaveLength(0);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('rapid repeated reloads while playing keep the newest chain and replay with PLAY (H)', async () => {
    const worker = new FakeWorker();
    const keyPair = generateWorkerKeyPair();
    const publicKey = exportWorkerPublicKey(keyPair);
    const host = new SiaVideoSource({
      createWorker: () => worker as unknown as Worker,
      getAppKeySeed: () => crypto.getRandomValues(new Uint8Array(32)),
      workerConfig: workerConfig(),
    });
    const target = document.createElement('video');
    host.attach(target);
    replyHelloOk(worker);
    await settle();
    loadAndAcknowledge(host, worker, 'k');
    // The user asked to play.
    target.dispatchEvent(new Event('play'));
    worker.sent.length = 0;

    // Two reloads issued back-to-back before any HELLO_OK returns: only the
    // newest handshake may drive ATTACH/replay, and the preserved playing
    // choice survives onto the replayed load.
    host.reloadConfiguration();
    host.reloadConfiguration();
    const secondReloadHello = latestHelloRequestId(worker);
    worker.reply({
      features: { workerMse: false },
      publicKey,
      requestId: latestHelloRequestId(worker),
      type: WorkerToMainMessageType.HELLO_OK,
      version: PROTOCOL_VERSION,
    });
    await settle();
    expect(secondReloadHello).toBe(latestHelloRequestId(worker));

    // The SUPERSEDED first reload's HELLO_OK arrives now — it must not spawn a
    // second seed chain nor an extra ATTACH.
    const firstReloadHello = worker.sent.filter((m) => m.type === MainToWorkerMessageType.HELLO).at(-2);
    if (!firstReloadHello || !('requestId' in firstReloadHello)) throw new Error('first reload HELLO not found');
    worker.reply({
      features: { workerMse: false },
      publicKey,
      requestId: firstReloadHello.requestId,
      type: WorkerToMainMessageType.HELLO_OK,
      version: PROTOCOL_VERSION,
    });
    await settle();

    // Exactly one APP_KEY + ATTACH for the newest handshake; its ATTACH_OK
    // replays the source and re-states PLAY for the preserved playing intent.
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.APP_KEY)).toHaveLength(1);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.ATTACH)).toHaveLength(1);
    const attach = newestAttach(worker);
    worker.sent.length = 0;
    worker.reply({ mode: 'main', requestId: attach.requestId, type: WorkerToMainMessageType.ATTACH_OK });
    const sources = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE);
    expect(sources).toHaveLength(1);
    const plays = worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY);
    expect(plays).toHaveLength(1);
    expect(plays[0].requestId).toBe(sources[0].requestId);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('ignores a HELLO_OK that answers a handshake superseded by destroy (I)', async () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({
      createWorker: () => worker as unknown as Worker,
      getAppKeySeed: () => crypto.getRandomValues(new Uint8Array(32)),
      workerConfig: workerConfig(),
    });
    host.attach(document.createElement('video'));
    const helloId = latestHelloRequestId(worker);

    host.destroy();
    // A late reply to the now-dead handshake must not gate anything.
    worker.reply({
      features: { workerMse: false },
      publicKey: new Uint8Array(32),
      requestId: helloId,
      type: WorkerToMainMessageType.HELLO_OK,
      version: PROTOCOL_VERSION,
    });
    await settle();
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.APP_KEY)).toHaveLength(0);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.ATTACH)).toHaveLength(0);
  });
});
