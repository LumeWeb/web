/**
 * Immediate source-replacement resource detach. When a DISTINCT non-empty
 * `src` is set on an attached host, the element today keeps the OLD
 * MediaSource resource (the transferred handle in worker mode, the object URL
 * in main mode) live until the FRESH resource attaches a moment later: the
 * superseded frame, its advancing `timeupdate`, its `ended`, and its stuck
 * `seek` all stay live while the replacement resolves. These specs pin the
 * correction: a distinct `src` detaches the old resource on the element
 * IMMEDIATELY (worker mode: `srcObject = null`; main mode: the stale `src`
 * attribute is removed), while a same-value re-assignment and a first
 * assignment on an element with nothing live stay no-ops, and the fresh
 * HANDLE / object-URL attach keeps its existing semantics and event identity
 * (native events from the fresh resource are trusted, ones from the detached
 * old resource are not).
 *
 * The test browser (headless Chromium) has no `MediaSourceHandle` — `srcObject`
 * brand-checks the value and accepts `MediaStream` — so worker-mode specs hand
 * the host `MediaStream` stand-ins, exactly like `replaced-media-resource.spec.ts`.
 */
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FMP4_MIME,
  type MainToWorkerMessage,
  MainToWorkerMessageType,
  PROTOCOL_VERSION,
  type WorkerToMainMessage,
  WorkerToMainMessageType,
} from '../protocol.ts';
import { SiaVideoSource } from '../sia-video-source.ts';

const IN_BROWSER = typeof document !== 'undefined' && typeof MediaSource !== 'undefined';

/**
 * The worker-mode exact-event-stream spec below is Chromium-only: Firefox
 * natively HAS `MediaSourceHandle`, so its `srcObject`/`currentTime` treats a
 * bare no-track `MediaStream` differently and fires extra fresh-resource
 * element events that shift the pinned message streams — the same caveat
 * `replaced-media-resource.spec.ts` documents. The DETACH behaviors themselves
 * are mode-agnostic and run on both runtimes.
 */
const IS_FIREFOX = IN_BROWSER && /Firefox/i.test(navigator.userAgent);

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

/** The newest ATTACH the host posted — what an ATTACH_OK must echo. */
function newestAttach(worker: FakeWorker): { requestId: number; type: MainToWorkerMessageType.ATTACH } {
  const attach = worker.sent.filter((m) => m.type === MainToWorkerMessageType.ATTACH).at(-1);
  if (!attach || !('requestId' in attach)) throw new Error('no ATTACH on the wire');
  return attach;
}

/** Replies an ATTACH_OK echoing the newest posted ATTACH's request id. */
function replyAttachOk(worker: FakeWorker, mode: 'main' | 'worker' = 'main'): void {
  worker.reply({ mode, requestId: newestAttach(worker).requestId, type: WorkerToMainMessageType.ATTACH_OK });
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
  replyAttachOk(worker);
  return { host, target, worker };
}

/** Request id of the newest SOURCE the host posted (the active load). */
function newestSourceId(worker: FakeWorker): number {
  const source = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE).at(-1);
  if (!source) throw new Error('no SOURCE on the wire');
  return source.requestId;
}

function srcObjectOf(target: HTMLVideoElement): unknown {
  return (target as unknown as { srcObject: unknown }).srcObject;
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
  replyAttachOk(worker, 'worker');
  return { host, target, worker };
}

describe('immediate source-replacement detach (worker mode)', () => {
  it.skipIf(!IN_BROWSER)('detaches the superseded srcObject handle at once when a distinct non-empty src is set', () => {
    const { host, target, worker } = workerSession();
    const oldHandle = new MediaStream();

    host.src = 'a';
    const idA = newestSourceId(worker);
    worker.reply({ info: workerInfo, requestId: idA, type: WorkerToMainMessageType.SOURCE_OK });
    worker.reply({ handle: oldHandle, requestId: idA, type: WorkerToMainMessageType.HANDLE } as unknown as WorkerToMainMessage);
    expect(srcObjectOf(target)).toBe(oldHandle);

    // The user switches to a DISTINCT source: the old handle must detach on
    // the element NOW — before the fresh HANDLE for B ever arrives — so the
    // old frame cannot stay live while the replacement resolves.
    host.src = 'b';
    expect(newestSourceId(worker)).not.toBe(idA);
    expect(srcObjectOf(target)).toBeNull();
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('clears the stale srcObject when a distinct src is set after host.load() reset the active handle', () => {
    const { host, target, worker } = workerSession();
    const oldHandle = new MediaStream();

    host.src = 'a';
    const idA = newestSourceId(worker);
    worker.reply({ info: workerInfo, requestId: idA, type: WorkerToMainMessageType.SOURCE_OK });
    worker.reply({ handle: oldHandle, requestId: idA, type: WorkerToMainMessageType.HANDLE } as unknown as WorkerToMainMessage);
    expect(srcObjectOf(target)).toBe(oldHandle);

    // An explicit load() resets the active handle (load-boundary bookkeeping)
    // without detaching the element's srcObject: the old resource stays live.
    host.load();
    expect(srcObjectOf(target)).toBe(oldHandle);

    // A distinct src must clear the stale srcObject NOW, even though
    // #activeHandle was already nulled by load(): the element still exposes
    // the old MediaSourceHandle.
    host.src = 'b';
    expect(srcObjectOf(target)).toBeNull();
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('leaves the element untouched when the same src is re-assigned', () => {
    const { host, target, worker } = workerSession();
    const oldHandle = new MediaStream();

    host.src = 'a';
    const idA = newestSourceId(worker);
    worker.reply({ info: workerInfo, requestId: idA, type: WorkerToMainMessageType.SOURCE_OK });
    worker.reply({ handle: oldHandle, requestId: idA, type: WorkerToMainMessageType.HANDLE } as unknown as WorkerToMainMessage);
    expect(srcObjectOf(target)).toBe(oldHandle);

    // A same-value re-assignment is a no-op: there is no switch, so no detach.
    host.src = 'a';
    expect(srcObjectOf(target)).toBe(oldHandle);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('treats a first src assignment on an empty attached element as a no-op', () => {
    const { host, target, worker } = workerSession();

    // Nothing is live on the element: the first arm is not a replacement.
    host.src = 'a';
    expect(srcObjectOf(target)).toBeNull();
    expect(target.getAttribute('src')).toBeNull();
    // …and the load still starts.
    expect(newestSourceId(worker)).toBeTypeOf('number');
    host.destroy();
  });

  it.skipIf(!IN_BROWSER || IS_FIREFOX)('ignores the detached/superseded resource events, then trusts the fresh HANDLE', () => {
    const { host, target, worker } = workerSession();
    const oldHandle = new MediaStream();
    host.src = 'a';
    const idA = newestSourceId(worker);
    worker.reply({ info: workerInfo, requestId: idA, type: WorkerToMainMessageType.SOURCE_OK });
    worker.reply({ handle: oldHandle, requestId: idA, type: WorkerToMainMessageType.HANDLE } as unknown as WorkerToMainMessage);
    target.dispatchEvent(new Event('play'));
    target.currentTime = 12.5;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;

    // Switch to B: the old handle is detached immediately.
    host.src = 'b';
    const idB = newestSourceId(worker);
    expect(srcObjectOf(target)).toBeNull();
    worker.sent.length = 0;

    // A superseded resource's late timeupdate / ended must not stay live: no
    // PLAYHEAD forwarded, no end-of-stream latched.
    target.currentTime = 13.5;
    target.dispatchEvent(new Event('timeupdate'));
    target.dispatchEvent(new Event('ended'));
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAYHEAD)).toHaveLength(0);
    // The ignored ended must not have latched EOF: a far seek on the element
    // is not treated as an unreachable out-of-window restart.
    target.currentTime = 200;
    target.dispatchEvent(new Event('seeking'));
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE)).toHaveLength(0);

    // The FRESH B handle attaches with the SAME semantics: it is the new
    // resource identity, and its genuine advance is trusted (PLAYHEAD under B).
    const freshHandle = new MediaStream();
    worker.reply({ handle: freshHandle, requestId: idB, type: WorkerToMainMessageType.HANDLE } as unknown as WorkerToMainMessage);
    expect(srcObjectOf(target)).toBe(freshHandle);
    worker.sent.length = 0;
    target.currentTime = 14;
    target.dispatchEvent(new Event('timeupdate'));
    const playheads = worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAYHEAD);
    expect(playheads).toHaveLength(1);
    expect(playheads[0]).toMatchObject({ requestId: idB, time: 14 });
    host.destroy();
  });
});

describe('immediate source-replacement detach (main mode)', () => {
  it.skipIf(!IN_BROWSER)('clears the stale element src (old object URL) when a distinct non-empty src is set', () => {
    const { host, target, worker } = mainSession();
    host.src = 'a';
    const idA = newestSourceId(worker);
    worker.reply({ info: mainInfo, requestId: idA, type: WorkerToMainMessageType.SOURCE_OK });
    // The main-thread attach set the element's src to the object URL it created.
    expect(target.getAttribute('src')).toBeTruthy();

    // A distinct non-empty src must detach the old blob immediately.
    host.src = 'b';
    expect(newestSourceId(worker)).not.toBe(idA);
    expect(target.getAttribute('src')).toBeNull();

    // The FRESH object URL still attaches on the new SOURCE_OK: the new
    // load's object URL replaces the cleared one.
    const idB = newestSourceId(worker);
    worker.reply({ info: mainInfo, requestId: idB, type: WorkerToMainMessageType.SOURCE_OK });
    expect(target.getAttribute('src')).toBeTruthy();
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('ignores detached superseded-src events, then trusts the fresh object URL', () => {
    const { host, target, worker } = mainSession();
    host.src = 'a';
    const idA = newestSourceId(worker);
    worker.reply({ info: mainInfo, requestId: idA, type: WorkerToMainMessageType.SOURCE_OK });
    target.dispatchEvent(new Event('play'));
    target.currentTime = 12.5;
    target.dispatchEvent(new Event('timeupdate'));
    worker.sent.length = 0;

    host.src = 'b';
    const idB = newestSourceId(worker);
    expect(target.getAttribute('src')).toBeNull();
    worker.sent.length = 0;

    // A superseded timeupdate cannot forward PLAYHEAD to the new session.
    target.currentTime = 13.5;
    target.dispatchEvent(new Event('timeupdate'));
    target.dispatchEvent(new Event('ended'));
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAYHEAD)).toHaveLength(0);

    // The fresh object URL attaches and its genuine advance is trusted.
    worker.reply({ info: mainInfo, requestId: idB, type: WorkerToMainMessageType.SOURCE_OK });
    expect(target.getAttribute('src')).toBeTruthy();
    worker.sent.length = 0;
    target.currentTime = 14;
    target.dispatchEvent(new Event('timeupdate'));
    expect(worker.sent.filter((m) => m.type === MainToWorkerMessageType.PLAYHEAD)).toHaveLength(1);
    host.destroy();
  });
});
