/**
 * Replaced-media-resource events. Worker-MSE recovery tears the old pipeline
 * down (the worker removes the old SourceBuffer) but the element keeps the OLD
 * MediaSourceHandle attached until the fresh HANDLE arrives, and that replaced
 * MediaSource still emits native `timeupdate` / `pause` / `ended` for a few
 * hundred milliseconds — advancing the playhead, then clamping to the cached
 * duration. Without an identity check the host mistakes those events for the
 * reload playing (`recoverPlayed` wants to close recovery early), a user
 * pause, and a real end-of-stream. These specs pin the rule: native events are
 * trusted only from the media resource the CURRENT load attached (the
 * request-scoped HANDLE in worker mode, the current object URL in main mode),
 * and a replaced resource's `ended` never reaches host observers.
 *
 * The test browser (headless Chromium) has no `MediaSourceHandle` — `srcObject`
 * brand-checks the value and accepts `MediaStream` — so worker-mode specs hand
 * the host `MediaStream` stand-ins: settable on `srcObject`, identical on read,
 * which is the whole comparison the identity check needs.
 */
import { describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_FMP4_MIME,
  type MainToWorkerMessage,
  MainToWorkerMessageType,
  PROTOCOL_VERSION,
  type WorkerToMainMessage,
  WorkerToMainMessageType,
} from '../protocol.ts';
import { type RecoveryChangeDetail, siaRecoveryChange, SiaVideoSource } from '../sia-video-source.ts';

/**
 * These specs need a DOM and MediaSource, so they run in browser mode only;
 * `SIA_TEST_ENV=node` skips them.
 */
const IN_BROWSER = typeof document !== 'undefined' && typeof MediaSource !== 'undefined';

/** Records what the host posts and lets specs inject worker replies. */
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
  terminate(): void {
    /* noop */
  }
}

/** The requestId of the newest HELLO the host posted — what a HELLO_OK must echo. */
function helloRequestId(worker: FakeWorker): number {
  const hello = worker.sent.filter((m) => m.type === MainToWorkerMessageType.HELLO).at(-1);
  if (!hello || !('requestId' in hello)) throw new Error('no HELLO posted to echo');
  return hello.requestId;
}

/** Main-mode SOURCE_OK info (the host builds an object URL for it). */
const mainInfo = {
  container: 'fmp4',
  durationSeconds: null,
  mime: DEFAULT_FMP4_MIME,
  mode: 'main',
  tracks: [],
} as const;

/** Worker-mode SOURCE_OK info (the host waits for HANDLE). */
const workerInfo = {
  container: 'fmp4',
  durationSeconds: null,
  mime: DEFAULT_FMP4_MIME,
  mode: 'worker',
  tracks: [],
} as const;

function decodeError(requestId: number): WorkerToMainMessage {
  return {
    context: 'append failed',
    kind: 'decode',
    requestId,
    type: WorkerToMainMessageType.ERROR,
  };
}

/** Loads `src` in main mode and lets the object URL attach. Returns its id. */
function loadMainSource(host: SiaVideoSource, worker: FakeWorker, src: string): number {
  host.src = src;
  const requestId = newestSourceId(worker);
  worker.reply({ info: mainInfo, requestId, type: WorkerToMainMessageType.SOURCE_OK });
  return requestId;
}

/** Loads `src` in worker mode and attaches `handle` as the element srcObject. */
function loadWorkerSource(
  host: SiaVideoSource,
  worker: FakeWorker,
  src: string,
  handle: MediaStream,
): number {
  host.src = src;
  const requestId = newestSourceId(worker);
  worker.reply({ info: workerInfo, requestId, type: WorkerToMainMessageType.SOURCE_OK });
  worker.reply({ handle, requestId, type: WorkerToMainMessageType.HANDLE } as unknown as WorkerToMainMessage);
  return requestId;
}

/** Attaches and drives the session into main mode. */
function mainSession(): { host: SiaVideoSource; target: HTMLVideoElement; worker: FakeWorker } {
  const worker = new FakeWorker();
  const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
  const target = document.createElement('video');
  host.attach(target);
  worker.reply({
    features: { workerMse: false },
    publicKey: new Uint8Array(32),
    requestId: helloRequestId(worker),
    type: WorkerToMainMessageType.HELLO_OK,
    version: PROTOCOL_VERSION,
  });
  worker.reply({ mode: 'main', requestId: 2, type: WorkerToMainMessageType.ATTACH_OK });
  return { host, target, worker };
}

/** Request id of the newest SOURCE the host posted (the active load). */
function newestSourceId(worker: FakeWorker): number {
  const source = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE).at(-1);
  if (!source) throw new Error('no SOURCE on the wire');
  return source.requestId;
}

function plays(worker: FakeWorker): MainToWorkerMessage[] {
  return worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAY);
}

/** Lets a `setTimeout(..., 0)` confirm (pause-confirm) settle. */
function settle(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function sources(worker: FakeWorker): MainToWorkerMessage[] {
  return worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE);
}

function srcObjectOf(target: HTMLVideoElement): unknown {
  return (target as unknown as { srcObject: unknown }).srcObject;
}

/** Wait `ms` for the main-thread MediaSource to open. */
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Attaches and drives the session into worker mode. */
function workerSession(): { host: SiaVideoSource; target: HTMLVideoElement; worker: FakeWorker } {
  const worker = new FakeWorker();
  const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
  const target = document.createElement('video');
  host.attach(target);
  worker.reply({
    features: { workerMse: true },
    publicKey: new Uint8Array(32),
    requestId: helloRequestId(worker),
    type: WorkerToMainMessageType.HELLO_OK,
    version: PROTOCOL_VERSION,
  });
  worker.reply({ mode: 'worker', requestId: 2, type: WorkerToMainMessageType.ATTACH_OK });
  return { host, target, worker };
}

describe('replaced-media-resource events (worker mode)', () => {
  it.skipIf(!IN_BROWSER)('keeps recovery open when the superseded handle advances', () => {
    const { host, target, worker } = workerSession();
    const oldHandle = new MediaStream();
    const idA = loadWorkerSource(host, worker, 'k', oldHandle);
    expect(srcObjectOf(target)).toBe(oldHandle);

    // Watching at 12.5.
    target.dispatchEvent(new Event('play'));
    target.currentTime = 12.5;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;

    const recovery: RecoveryChangeDetail[] = [];
    target.addEventListener(siaRecoveryChange, (e) => {
      recovery.push((e as CustomEvent<RecoveryChangeDetail>).detail);
    });

    worker.reply(decodeError(idA));
    expect(recovery).toHaveLength(1);
    expect(recovery[0]).toMatchObject({ active: true });
    worker.sent.length = 0;

    // The superseded handle keeps advancing during teardown. This must not read as
    // the reload playing: no PLAYHEAD, no close of the recovery window.
    target.currentTime = 13.5;
    target.dispatchEvent(new Event('timeupdate'));

    expect(recovery).toHaveLength(1);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAYHEAD)).toHaveLength(0);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('does not reset the recovery budget when the superseded handle advances', () => {
    const { host, target, worker } = workerSession();
    const oldHandle = new MediaStream();
    const idA = loadWorkerSource(host, worker, 'k', oldHandle);
    target.dispatchEvent(new Event('play'));
    target.currentTime = 12.5;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;

    let errors = 0;
    host.addEventListener('error', () => {
      errors += 1;
    });

    // Error #1 → recovery (attempt 1), reload B posts.
    worker.reply(decodeError(idA));
    const idB = newestSourceId(worker);
    worker.sent.length = 0;

    // The superseded handle advances; without the identity check this resets
    // the budget back to enable an endless attempt=1 loop.
    target.currentTime = 13.5;
    target.dispatchEvent(new Event('timeupdate'));

    // Error #2 on the reload → attempt 2, still silent.
    worker.reply(decodeError(idB));
    expect(errors).toBe(0);
    expect(sources(worker)).toHaveLength(1);

    // Error #3 → exhausted: surfaces MEDIA_ERR_DECODE, no third reload. A
    // reset budget would still be on attempt=1 and reload yet again.
    worker.reply(decodeError(newestSourceId(worker)));
    expect(errors).toBe(1);
    expect(host.error?.code).toBe(3);
    expect(sources(worker)).toHaveLength(1);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('ignores a superseded-handle pause so a later recovery replays', async () => {
    const { host, target, worker } = workerSession();
    const oldHandle = new MediaStream();
    const idA = loadWorkerSource(host, worker, 'k', oldHandle);
    target.dispatchEvent(new Event('play'));
    target.currentTime = 12.5;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;

    worker.reply(decodeError(idA));
    const idB = newestSourceId(worker);
    worker.sent.length = 0;

    // The superseded pipeline advances, then pauses (the clamp artifact).
    target.currentTime = 13.5;
    target.dispatchEvent(new Event('timeupdate'));
    target.dispatchEvent(new Event('pause'));
    await settle(); // any accidental pause-confirm settles here

    // The fresh handle attaches and genuinely plays.
    const freshHandle = new MediaStream();
    worker.reply({
      handle: freshHandle,
      requestId: idB,
      type: WorkerToMainMessageType.HANDLE,
    } as unknown as WorkerToMainMessage);
    target.currentTime = 14;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;

    // The current load fails next: recovery must still want playback — the
    // superseded pause must not have flipped the machine's choice to paused.
    worker.reply(decodeError(idB));
    expect(plays(worker)).toHaveLength(1);
    expect(plays(worker)[0]).toMatchObject({
      requestId: newestSourceId(worker),
      type: MainToWorkerMessageType.PLAY,
    });
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('a superseded-handle ended never reaches host ended observers', () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    const target = document.createElement('video');
    // Observer registered BEFORE attach, exactly how video.js would: the base
    // host registers its element `ended` forwarding for it, ahead of this
    // host's own handler — the ordering a stale-ended interception must beat.
    const endedObserver = vi.fn();
    host.addEventListener('ended', endedObserver);
    host.attach(target);
    worker.reply({
      features: { workerMse: true },
      publicKey: new Uint8Array(32),
      requestId: 1,
      type: WorkerToMainMessageType.HELLO_OK,
      version: PROTOCOL_VERSION,
    });
    worker.reply({ mode: 'worker', requestId: 2, type: WorkerToMainMessageType.ATTACH_OK });

    const oldHandle = new MediaStream();
    host.src = 'k';
    const idA = newestSourceId(worker);
    worker.reply({ info: workerInfo, requestId: idA, type: WorkerToMainMessageType.SOURCE_OK });
    worker.reply({
      handle: oldHandle,
      requestId: idA,
      type: WorkerToMainMessageType.HANDLE,
    } as unknown as WorkerToMainMessage);
    target.dispatchEvent(new Event('play'));
    target.currentTime = 12.5;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;

    worker.reply(decodeError(idA));
    const idB = newestSourceId(worker);
    worker.sent.length = 0;

    // Old pipeline: advance, then ended. It must neither reach observers nor
    // latch end-of-stream.
    target.currentTime = 13.5;
    target.dispatchEvent(new Event('timeupdate'));
    target.dispatchEvent(new Event('ended'));

    expect(endedObserver).not.toHaveBeenCalled();

    // A genuine ended on the CURRENT handle still reaches the observer.
    const freshHandle = new MediaStream();
    worker.reply({
      handle: freshHandle,
      requestId: idB,
      type: WorkerToMainMessageType.HANDLE,
    } as unknown as WorkerToMainMessage);
    target.currentTime = 14;
    target.dispatchEvent(new Event('timeupdate'));
    target.dispatchEvent(new Event('ended'));

    expect(endedObserver).toHaveBeenCalledTimes(1);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('closes recovery exactly once on the fresh handle advance and restores the budget', () => {
    const { host, target, worker } = workerSession();
    const oldHandle = new MediaStream();
    const idA = loadWorkerSource(host, worker, 'k', oldHandle);
    target.dispatchEvent(new Event('play'));
    target.currentTime = 12.5;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;

    const recovery: RecoveryChangeDetail[] = [];
    target.addEventListener(siaRecoveryChange, (e) => {
      recovery.push((e as CustomEvent<RecoveryChangeDetail>).detail);
    });

    worker.reply(decodeError(idA));
    expect(recovery).toHaveLength(1);
    const idB = newestSourceId(worker);

    // The superseded handle advances (ignored)…
    target.currentTime = 13.5;
    target.dispatchEvent(new Event('timeupdate'));
    expect(recovery).toHaveLength(1);

    // …then the fresh handle genuinely advances: exactly one close.
    const freshHandle = new MediaStream();
    worker.reply({
      handle: freshHandle,
      requestId: idB,
      type: WorkerToMainMessageType.HANDLE,
    } as unknown as WorkerToMainMessage);
    target.currentTime = 14;
    target.dispatchEvent(new Event('timeupdate'));

    expect(recovery).toHaveLength(2);
    expect(recovery[1]).toEqual({ active: false });

    // The fresh advance proved the load played, so the budget is restored: the
    // next failures spend a fresh two-reload run before surfacing.
    let errors = 0;
    host.addEventListener('error', () => {
      errors += 1;
    });
    worker.sent.length = 0;
    worker.reply(decodeError(idB));
    expect(errors).toBe(0);
    worker.reply(decodeError(newestSourceId(worker)));
    expect(errors).toBe(0);
    worker.reply(decodeError(newestSourceId(worker)));
    expect(errors).toBe(1);
    expect(host.error?.code).toBe(3);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('a genuine ended on the current handle latches end-of-stream', () => {
    const { host, target, worker } = workerSession();
    const oldHandle = new MediaStream();
    const idA = loadWorkerSource(host, worker, 'k', oldHandle);
    target.dispatchEvent(new Event('play'));
    target.currentTime = 12.5;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;

    // A buffered window the far seek can fall outside of.
    worker.sent.length = 0;
    worker.reply(decodeError(idA));
    const idB = newestSourceId(worker);
    worker.reply({
      buffered: [{ end: 100, start: 0 }],
      received: 0,
      requestId: idB,
      type: WorkerToMainMessageType.PROGRESS,
    });

    // Fresh handle attaches and genuinely plays; the recovery closes.
    const freshHandle = new MediaStream();
    worker.reply({
      handle: freshHandle,
      requestId: idB,
      type: WorkerToMainMessageType.HANDLE,
    } as unknown as WorkerToMainMessage);
    target.currentTime = 14;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;

    // A genuine ended on the current handle latches end-of-stream…
    target.dispatchEvent(new Event('ended'));

    // …so a far seek past the delivered buffer is provably out-of-window:
    // the source restarts instead of hanging the element in `seeking`.
    target.currentTime = 200;
    target.dispatchEvent(new Event('seeking'));
    expect(sources(worker)).toHaveLength(1);
    host.destroy();
  });
});

describe('replaced-media-resource events (main mode)', () => {
  it.skipIf(!IN_BROWSER)('ignores timeupdate/pause/ended from the superseded object URL during recovery', async () => {
    const { host, target, worker } = mainSession();
    const idA = loadMainSource(host, worker, 'k');
    target.dispatchEvent(new Event('play'));
    target.currentTime = 12.5;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;

    const recovery: RecoveryChangeDetail[] = [];
    target.addEventListener(siaRecoveryChange, (e) => {
      recovery.push((e as CustomEvent<RecoveryChangeDetail>).detail);
    });

    worker.reply(decodeError(idA));
    expect(recovery).toHaveLength(1);
    const idB = newestSourceId(worker);
    worker.sent.length = 0;

    // The OLD blob (still the element src while the pipeline tears down)
    // advances, pauses, and ends.
    target.currentTime = 13.5;
    target.dispatchEvent(new Event('timeupdate'));
    target.dispatchEvent(new Event('pause'));
    target.dispatchEvent(new Event('ended'));
    await settle();

    // Recovery stays open, nothing forwarded, choice untouched.
    expect(recovery).toHaveLength(1);
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAYHEAD)).toHaveLength(0);

    // The fresh load's object URL attaches and genuinely plays: exactly one
    // close.
    worker.reply({ info: mainInfo, requestId: idB, type: WorkerToMainMessageType.SOURCE_OK });
    target.currentTime = 14;
    target.dispatchEvent(new Event('timeupdate'));
    expect(recovery).toHaveLength(2);
    expect(recovery[1]).toEqual({ active: false });

    // The old blob's pause must not have flipped the choice: a decode error on
    // the current load restarts WITH playback.
    worker.sent.length = 0;
    worker.reply(decodeError(idB));
    expect(plays(worker)).toHaveLength(1);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('a request-scoped worker ENDED for the current load still reaches the wire after replacement', async () => {
    const { host, target, worker } = mainSession();
    const idA = loadMainSource(host, worker, 'k');
    target.dispatchEvent(new Event('play'));
    target.currentTime = 12.5;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;

    // One recovery, then the fresh load's blob attaches.
    worker.reply(decodeError(idA));
    const idB = newestSourceId(worker);
    worker.reply({ info: mainInfo, requestId: idB, type: WorkerToMainMessageType.SOURCE_OK });
    await wait(50); // let sourceopen + addSourceBuffer settle

    const endSpy = vi.spyOn(MediaSource.prototype, 'endOfStream');
    worker.reply({ requestId: idB, type: WorkerToMainMessageType.ENDED });
    await wait(100);

    // The current load's wire ENDED still drives endOfStream (the native-event
    // identity check never touches the wire signal).
    expect(endSpy.mock.calls.length).toBeGreaterThan(0);
    endSpy.mockRestore();
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('accepts a genuine native ended from the current object URL after replacement', () => {
    const worker = new FakeWorker();
    const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
    const target = document.createElement('video');
    const endedObserver = vi.fn();
    host.addEventListener('ended', endedObserver);
    host.attach(target);
    worker.reply({
      features: { workerMse: false },
      publicKey: new Uint8Array(32),
      requestId: 1,
      type: WorkerToMainMessageType.HELLO_OK,
      version: PROTOCOL_VERSION,
    });
    worker.reply({ mode: 'main', requestId: 2, type: WorkerToMainMessageType.ATTACH_OK });
    host.src = 'k';
    const idA = newestSourceId(worker);
    worker.reply({ info: mainInfo, requestId: idA, type: WorkerToMainMessageType.SOURCE_OK });
    target.dispatchEvent(new Event('play'));
    target.currentTime = 12.5;
    target.dispatchEvent(new Event('timeupdate'));

    // Decode error → recovery; the OLD blob is still on the element.
    worker.reply(decodeError(idA));
    const idB = newestSourceId(worker);
    target.dispatchEvent(new Event('ended'));
    expect(endedObserver).not.toHaveBeenCalled();

    // The fresh object URL attaches; a genuine ended on it IS forwarded.
    worker.reply({ info: mainInfo, requestId: idB, type: WorkerToMainMessageType.SOURCE_OK });
    target.currentTime = 14;
    target.dispatchEvent(new Event('timeupdate'));
    target.dispatchEvent(new Event('ended'));
    expect(endedObserver).toHaveBeenCalledTimes(1);
    host.destroy();
  });
});
