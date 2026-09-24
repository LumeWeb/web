/**
 * `SiaVideoSource` load acceptance: the typed `sia-load-change` DOM event the
 * host emits, feeding the shared `siaLoadFeature`.
 *
 * Acceptance is boolean-only and mirrors the existing recovery event
 * dispatch pattern exactly (same element dispatch, same element→host
 * forwarding for host listeners). The rules pinned here:
 *   - A SOURCE_OK acknowledging the CURRENT request emits `accepted: true`
 *     exactly once per load. It means the worker pipeline accepted the source
 *     — not that it is playable/ready.
 *   - `accepted: true` really is just a load-opened fact: a duplicate ack of
 *     the same load never re-announces, and a stale/superseded SOURCE_OK
 *     (requestId no longer current) emits nothing and never re-opens state.
 *   - Every load boundary (fresh source/load, reloadConfiguration/reattach
 *     replay, recovery restart) resets to `accepted: false` exactly once,
 *     and only when a load had actually been accepted (no duplicate false
 *     when already false).
 *   - detach/destroy are lifecycle boundaries too: acceptance resets, and no
 *     event can fire after destroy.
 *
 * Requires a DOM and MediaSource, so these run in browser mode only;
 * `SIA_TEST_ENV=node` skips them (same gate as `config-reload.spec.ts`).
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
import {
  siaLoadChange,
  type SiaLoadChangeDetail,
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

/** attach + HELLO_OK (seed-less) → a ready, main-mode host. */
function attachAndHandshake(): { host: SiaVideoSource; target: HTMLVideoElement; worker: FakeWorker } {
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
  return { host, target, worker };
}

/** The requestId of the newest HELLO the host posted — what a HELLO_OK must echo. */
function helloRequestId(worker: FakeWorker): number {
  const hello = worker.sent.filter((m) => m.type === MainToWorkerMessageType.HELLO).at(-1);
  if (!hello || !('requestId' in hello)) throw new Error('no HELLO posted to echo');
  return hello.requestId;
}

/** Loads `src` and acknowledges it (main-mode SOURCE_OK), returning its request id. */
function loadAndAcknowledge(host: SiaVideoSource, worker: FakeWorker, src: string): number {
  host.src = src;
  const requestId = newestSourceId(worker);
  worker.reply({ info: mainInfo, requestId, type: WorkerToMainMessageType.SOURCE_OK });
  return requestId;
}

/** Main-mode SOURCE_OK info (the host builds an object URL for it). */
const mainInfo = { container: 'fmp4', durationSeconds: null, mime: DEFAULT_FMP4_MIME, mode: 'main', tracks: [] } as const;

/** Registers a host listener and returns the collected `sia-load-change` details. */
function collectLoadDetails(host: SiaVideoSource): SiaLoadChangeDetail[] {
  const seen: SiaLoadChangeDetail[] = [];
  host.addEventListener(siaLoadChange, (event: Event) => {
    seen.push((event as CustomEvent<SiaLoadChangeDetail>).detail);
  });
  return seen;
}

/** The newest ATTACH on the wire (its requestId feeds the ATTACH_OK reply). */
function newestAttach(worker: FakeWorker): { requestId: number; type: MainToWorkerMessageType.ATTACH } {
  const attach = worker.sent.filter((m) => m.type === MainToWorkerMessageType.ATTACH).at(-1);
  if (!attach || !('requestId' in attach)) throw new Error('no ATTACH on the wire');
  return attach;
}

/** The newest SOURCE request id on the wire — what a faithful SOURCE_OK echoes. */
function newestSourceId(worker: FakeWorker): number {
  const source = worker.sent.filter((m) => m.type === MainToWorkerMessageType.SOURCE).at(-1);
  if (!source || !('requestId' in source)) throw new Error('no SOURCE posted to echo');
  return source.requestId;
}

describe('SiaVideoSource load acceptance (sia-load-change)', () => {
  it.skipIf(!IN_BROWSER)('emits accepted true exactly once when SOURCE_OK acknowledges the current request', () => {
    const { host, worker } = attachAndHandshake();
    const seen = collectLoadDetails(host);

    const id = loadAndAcknowledge(host, worker, 'k');

    expect(seen).toEqual([{ accepted: true }]);
    // A duplicate ack of the same load must not re-announce acceptance.
    worker.reply({ info: mainInfo, requestId: id, type: WorkerToMainMessageType.SOURCE_OK });
    expect(seen).toEqual([{ accepted: true }]);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('ignores a stale/superseded SOURCE_OK requestId without touching acceptance', () => {
    const { host, worker } = attachAndHandshake();
    const seen = collectLoadDetails(host);

    const oldId = loadAndAcknowledge(host, worker, 'k');
    expect(seen).toEqual([{ accepted: true }]);

    // A newer source supersedes the load; the current request id advances and
    // the boundary resets acceptance before the fresh ack can arrive.
    host.src = 'k2';
    const currentId = newestSourceId(worker);
    expect(currentId).not.toBe(oldId);
    expect(seen).toEqual([{ accepted: true }, { accepted: false }]);

    // The stale ack for the OLD load must not re-open acceptance.
    worker.reply({ info: mainInfo, requestId: oldId, type: WorkerToMainMessageType.SOURCE_OK });
    expect(seen).toEqual([{ accepted: true }, { accepted: false }]);

    // Only the genuine ack for the CURRENT load opens it again.
    worker.reply({ info: mainInfo, requestId: currentId, type: WorkerToMainMessageType.SOURCE_OK });
    expect(seen).toEqual([{ accepted: true }, { accepted: false }, { accepted: true }]);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('emits accepted false exactly once at a load boundary after an acceptance', () => {
    const { host, worker } = attachAndHandshake();
    const seen = collectLoadDetails(host);

    loadAndAcknowledge(host, worker, 'k');
    expect(seen).toEqual([{ accepted: true }]);

    host.load();

    expect(seen).toEqual([{ accepted: true }, { accepted: false }]);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('a boundary when already false emits no duplicate false', () => {
    const { host, worker } = attachAndHandshake();
    const seen = collectLoadDetails(host);

    loadAndAcknowledge(host, worker, 'k');
    host.load(); // accepted → false
    expect(seen).toEqual([{ accepted: true }, { accepted: false }]);

    // Another boundary with no acceptance in between must not re-announce.
    host.load();
    expect(seen).toEqual([{ accepted: true }, { accepted: false }]);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('reloadConfiguration replay resets acceptance and a fresh SOURCE_OK reopens it', () => {
    const { host, worker } = attachAndHandshake();
    const seen = collectLoadDetails(host);

    loadAndAcknowledge(host, worker, 'k');
    expect(seen).toEqual([{ accepted: true }]);

    worker.sent.length = 0;
    host.reloadConfiguration();
    worker.reply({
      features: { workerMse: false },
      publicKey: new Uint8Array(32),
      requestId: helloRequestId(worker),
      type: WorkerToMainMessageType.HELLO_OK,
      version: PROTOCOL_VERSION,
    });
    const attach = newestAttach(worker);
    worker.sent.length = 0;
    worker.reply({ mode: 'main', requestId: attach.requestId, type: WorkerToMainMessageType.ATTACH_OK });

    // The replayed load boundary resets acceptance...
    expect(seen).toEqual([{ accepted: true }, { accepted: false }]);

    // ...and the fresh SOURCE_OK for the replayed source reopens it.
    const replayedId = newestSourceId(worker);
    worker.reply({ info: mainInfo, requestId: replayedId, type: WorkerToMainMessageType.SOURCE_OK });
    expect(seen).toEqual([{ accepted: true }, { accepted: false }, { accepted: true }]);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('detach resets acceptance to false exactly once', () => {
    const { host, worker } = attachAndHandshake();
    const seen = collectLoadDetails(host);

    loadAndAcknowledge(host, worker, 'k');
    expect(seen).toEqual([{ accepted: true }]);

    host.detach();

    expect(seen).toEqual([{ accepted: true }, { accepted: false }]);
    // A second detach (already false, target gone) emits nothing further.
    host.detach();
    expect(seen).toEqual([{ accepted: true }, { accepted: false }]);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('destroy resets acceptance once and never emits after', () => {
    const { host, worker } = attachAndHandshake();
    const seen = collectLoadDetails(host);

    const id = loadAndAcknowledge(host, worker, 'k');
    expect(seen).toEqual([{ accepted: true }]);

    host.destroy();

    expect(seen).toEqual([{ accepted: true }, { accepted: false }]);
    // A late worker reply can no longer reach the destroyed host's listener.
    worker.reply({ info: mainInfo, requestId: id, type: WorkerToMainMessageType.SOURCE_OK });
    expect(seen).toEqual([{ accepted: true }, { accepted: false }]);
  });

  it.skipIf(!IN_BROWSER)(
    'a late SOURCE_OK for a detached host never re-opens acceptance into the next attach',
    () => {
      const { host, worker } = attachAndHandshake();
      const seen = collectLoadDetails(host);

      const id = loadAndAcknowledge(host, worker, 'k');
      expect(seen).toEqual([{ accepted: true }]);

      host.detach();
      expect(seen).toEqual([{ accepted: true }, { accepted: false }]);

      // A SOURCE_OK still in flight for the detached load lands after detach.
      // There is no current request once detached: it must not re-open the
      // acceptance state (a phantom `accepted: true` would make the next
      // attach's boundary emit a spurious second `accepted: false`).
      worker.reply({ info: mainInfo, requestId: id, type: WorkerToMainMessageType.SOURCE_OK });

      // Re-attach replays the source; the boundary stays silent (already reset
      // at detach) until the fresh SOURCE_OK re-opens it.
      host.attach(document.createElement('video'));
      worker.reply({
        features: { workerMse: false },
        publicKey: new Uint8Array(32),
        requestId: helloRequestId(worker),
        type: WorkerToMainMessageType.HELLO_OK,
        version: PROTOCOL_VERSION,
      });
      const attach = newestAttach(worker);
      worker.sent.length = 0;
      worker.reply({ mode: 'main', requestId: attach.requestId, type: WorkerToMainMessageType.ATTACH_OK });

      expect(seen).toEqual([{ accepted: true }, { accepted: false }]);

      const replayedId = newestSourceId(worker);
      worker.reply({ info: mainInfo, requestId: replayedId, type: WorkerToMainMessageType.SOURCE_OK });
      expect(seen).toEqual([{ accepted: true }, { accepted: false }, { accepted: true }]);
      host.destroy();
    },
  );

  it.skipIf(!IN_BROWSER)('a recovery restart resets acceptance exactly once and the fresh SOURCE_OK reopens it', () => {
    const { host, target, worker } = attachAndHandshake();
    const seen = collectLoadDetails(host);

    const id = loadAndAcknowledge(host, worker, 'k');
    expect(seen).toEqual([{ accepted: true }]);

    // A decode failure only restarts (rather than defers) while the load is
    // playing; mark it so with the native `play` the host observes.
    target.dispatchEvent(new Event('play'));

    worker.reply({ kind: 'decode', requestId: id, type: WorkerToMainMessageType.ERROR });
    expect(seen).toEqual([{ accepted: true }, { accepted: false }]);

    // The restart posted a fresh SOURCE; only its ack re-opens acceptance.
    const restartId = newestSourceId(worker);
    expect(restartId).not.toBe(id);
    worker.reply({ info: mainInfo, requestId: restartId, type: WorkerToMainMessageType.SOURCE_OK });
    expect(seen).toEqual([{ accepted: true }, { accepted: false }, { accepted: true }]);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)(
    'dispatches once on the attached element and forwards once to host listeners (no double event)',
    () => {
      const { host, target, worker } = attachAndHandshake();
      const elementSeen: SiaLoadChangeDetail[] = [];
      const hostSeen: SiaLoadChangeDetail[] = [];
      target.addEventListener(siaLoadChange, (event: Event) => {
        elementSeen.push((event as CustomEvent<SiaLoadChangeDetail>).detail);
      });
      host.addEventListener(siaLoadChange, (event: Event) => {
        hostSeen.push((event as CustomEvent<SiaLoadChangeDetail>).detail);
      });

      // The one element dispatch reaches EACH receiver exactly once, in order.
      loadAndAcknowledge(host, worker, 'k');
      expect(elementSeen).toEqual([{ accepted: true }]);
      expect(hostSeen).toEqual([{ accepted: true }]);

      host.load();
      expect(elementSeen).toEqual([{ accepted: true }, { accepted: false }]);
      expect(hostSeen).toEqual([{ accepted: true }, { accepted: false }]);
      host.destroy();
    },
  );
});
