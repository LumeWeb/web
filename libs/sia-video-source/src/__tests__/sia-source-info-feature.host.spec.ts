/**
 * `SiaVideoSource` source information: the typed `sia-source-info-change`
 * DOM event the host emits, feeding the shared `siaSourceInfoFeature`.
 *
 * Source info mirrors the host's existing typed `SOURCE_OK.info` verdict
 * about the CURRENT load — no protocol change, the SAME `SourceInfo` payload
 * the host already receives. The rules pinned here:
 *   - A SOURCE_OK acknowledging the CURRENT request emits
 *     `{ active: true, info }` exactly once per load, carrying the exact
 *     `SourceInfo` the worker vouched for (`info.durationSeconds` may be
 *     `null`; `accepted` is not `playable`).
 *   - `active: true` really is just a load-opened fact: a duplicate ack of
 *     the same load never re-announces, and a stale/superseded SOURCE_OK
 *     (requestId no longer current) emits nothing and never re-opens state.
 *   - Every load boundary (fresh source/load, reloadConfiguration/reattach
 *     replay, recovery restart) closes to `active: false` exactly once, and
 *     only when info was actually open (no duplicate close when already
 *     inactive).
 *   - detach/destroy are lifecycle boundaries too: source info closes, the
 *     stored info is cleared (no stale info leaks), and no event can fire
 *     after destroy.
 *
 * Requires a DOM and MediaSource, so these run in browser mode only;
 * `SIA_TEST_ENV=node` skips them (same gate as `config-reload.spec.ts`).
 */
import { describe, expect, it } from 'vitest';
import {
  type MainToWorkerMessage,
  MainToWorkerMessageType,
  PROTOCOL_VERSION,
  type SourceInfo,
  type WorkerToMainMessage,
  WorkerToMainMessageType,
} from '../protocol.ts';
import {
  siaLoadChange,
  siaSourceInfoChange,
  type SiaSourceInfoChangeDetail,
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
function loadAndAcknowledge(
  host: SiaVideoSource,
  worker: FakeWorker,
  src: string,
  info: SourceInfo = MAIN_INFO,
): number {
  host.src = src;
  const requestId = newestSourceId(worker);
  worker.reply({ info, requestId, type: WorkerToMainMessageType.SOURCE_OK });
  return requestId;
}

/**
 * A real worker-vouched SourceInfo (with a named duration) so the tests assert
 * the host forwards the exact payload it received, not a synthetic subset.
 */
const MAIN_INFO: SourceInfo = {
  container: 'fmp4',
  durationSeconds: 3919.08,
  mime: 'video/mp4; codecs="avc1.64001f, mp4a.40.2"',
  mode: 'main',
  tracks: [
    { codec: 'avc1.64001f', kind: 'video' },
    { codec: 'mp4a.40.2', kind: 'audio' },
  ],
};

/** Main-mode SOURCE_OK info with no vouched duration. */
const MAIN_INFO_NO_DURATION: SourceInfo = {
  ...MAIN_INFO,
  durationSeconds: null,
};

/** Registers a host listener and returns the collected `sia-source-info-change` details. */
function collectSourceInfoDetails(host: SiaVideoSource): SiaSourceInfoChangeDetail[] {
  const seen: SiaSourceInfoChangeDetail[] = [];
  host.addEventListener(siaSourceInfoChange, (event: Event) => {
    seen.push((event as CustomEvent<SiaSourceInfoChangeDetail>).detail);
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

describe('SiaVideoSource source info (sia-source-info-change)', () => {
  it.skipIf(!IN_BROWSER)(
    'emits the exact SourceInfo payload once when SOURCE_OK acknowledges the current request',
    () => {
      const { host, worker } = attachAndHandshake();
      const seen = collectSourceInfoDetails(host);

      const id = loadAndAcknowledge(host, worker, 'k', MAIN_INFO);

      expect(seen).toEqual([{ active: true, info: MAIN_INFO }]);
      // The forwarded info is the exact object the worker vouched for.
      expect((seen[0] as { active: true; info: SourceInfo }).info).toBe(MAIN_INFO);
      // A duplicate ack of the same load must not re-announce.
      worker.reply({ info: MAIN_INFO, requestId: id, type: WorkerToMainMessageType.SOURCE_OK });
      expect(seen).toEqual([{ active: true, info: MAIN_INFO }]);
      host.destroy();
    },
  );

  it.skipIf(!IN_BROWSER)('keeps a null duration from the payload', () => {
    const { host, worker } = attachAndHandshake();
    const seen = collectSourceInfoDetails(host);

    loadAndAcknowledge(host, worker, 'k', MAIN_INFO_NO_DURATION);

    expect(seen).toEqual([{ active: true, info: MAIN_INFO_NO_DURATION }]);
    expect((seen[0] as { active: true; info: SourceInfo }).info.durationSeconds).toBeNull();
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('ignores a stale/superseded SOURCE_OK requestId without touching source info', () => {
    const { host, worker } = attachAndHandshake();
    const seen = collectSourceInfoDetails(host);

    const oldId = loadAndAcknowledge(host, worker, 'k', MAIN_INFO);
    expect(seen).toEqual([{ active: true, info: MAIN_INFO }]);

    // A newer source supersedes the load; the current request id advances and
    // the boundary closes source info before the fresh ack can arrive.
    host.src = 'k2';
    const currentId = newestSourceId(worker);
    expect(currentId).not.toBe(oldId);
    expect(seen).toEqual([{ active: true, info: MAIN_INFO }, { active: false }]);

    // The stale ack for the OLD load must not re-open source info.
    worker.reply({ info: MAIN_INFO, requestId: oldId, type: WorkerToMainMessageType.SOURCE_OK });
    expect(seen).toEqual([{ active: true, info: MAIN_INFO }, { active: false }]);

    // Only the genuine ack for the CURRENT load opens it again.
    worker.reply({
      info: MAIN_INFO_NO_DURATION,
      requestId: currentId,
      type: WorkerToMainMessageType.SOURCE_OK,
    });
    expect(seen).toEqual([
      { active: true, info: MAIN_INFO },
      { active: false },
      { active: true, info: MAIN_INFO_NO_DURATION },
    ]);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('emits active false exactly once at a load boundary after an open', () => {
    const { host, worker } = attachAndHandshake();
    const seen = collectSourceInfoDetails(host);

    loadAndAcknowledge(host, worker, 'k');
    expect(seen).toEqual([{ active: true, info: MAIN_INFO }]);

    host.load();

    expect(seen).toEqual([{ active: true, info: MAIN_INFO }, { active: false }]);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('a boundary when already inactive emits no duplicate close', () => {
    const { host, worker } = attachAndHandshake();
    const seen = collectSourceInfoDetails(host);

    loadAndAcknowledge(host, worker, 'k');
    host.load(); // open -> close
    expect(seen).toEqual([{ active: true, info: MAIN_INFO }, { active: false }]);

    // Another boundary with no open in between must not re-announce.
    host.load();
    expect(seen).toEqual([{ active: true, info: MAIN_INFO }, { active: false }]);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('reloadConfiguration replay closes source info and a fresh SOURCE_OK reopens it', () => {
    const { host, worker } = attachAndHandshake();
    const seen = collectSourceInfoDetails(host);

    loadAndAcknowledge(host, worker, 'k');
    expect(seen).toEqual([{ active: true, info: MAIN_INFO }]);

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

    // The replayed load boundary closes source info...
    expect(seen).toEqual([{ active: true, info: MAIN_INFO }, { active: false }]);

    // ...and the fresh SOURCE_OK for the replayed source reopens it.
    const replayedId = newestSourceId(worker);
    worker.reply({
      info: MAIN_INFO_NO_DURATION,
      requestId: replayedId,
      type: WorkerToMainMessageType.SOURCE_OK,
    });
    expect(seen).toEqual([
      { active: true, info: MAIN_INFO },
      { active: false },
      { active: true, info: MAIN_INFO_NO_DURATION },
    ]);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('detach closes source info exactly once', () => {
    const { host, worker } = attachAndHandshake();
    const seen = collectSourceInfoDetails(host);

    loadAndAcknowledge(host, worker, 'k');
    expect(seen).toEqual([{ active: true, info: MAIN_INFO }]);

    host.detach();

    expect(seen).toEqual([{ active: true, info: MAIN_INFO }, { active: false }]);
    // A second detach (already closed, target gone) emits nothing further.
    host.detach();
    expect(seen).toEqual([{ active: true, info: MAIN_INFO }, { active: false }]);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('destroy closes source info once and never emits after', () => {
    const { host, worker } = attachAndHandshake();
    const seen = collectSourceInfoDetails(host);

    const id = loadAndAcknowledge(host, worker, 'k');
    expect(seen).toEqual([{ active: true, info: MAIN_INFO }]);

    host.destroy();

    expect(seen).toEqual([{ active: true, info: MAIN_INFO }, { active: false }]);
    // A late worker reply can no longer reach the destroyed host's listener.
    worker.reply({ info: MAIN_INFO, requestId: id, type: WorkerToMainMessageType.SOURCE_OK });
    expect(seen).toEqual([{ active: true, info: MAIN_INFO }, { active: false }]);
  });

  it.skipIf(!IN_BROWSER)(
    'a late SOURCE_OK for a detached host never re-opens source info into the next attach',
    () => {
      const { host, worker } = attachAndHandshake();
      const seen = collectSourceInfoDetails(host);

      const id = loadAndAcknowledge(host, worker, 'k');
      expect(seen).toEqual([{ active: true, info: MAIN_INFO }]);

      host.detach();
      expect(seen).toEqual([{ active: true, info: MAIN_INFO }, { active: false }]);

      // A SOURCE_OK still in flight for the detached load lands after detach.
      // There is no current request once detached: it must not re-open source
      // info (a phantom re-open would make the next attach's boundary emit a
      // spurious second close).
      worker.reply({ info: MAIN_INFO, requestId: id, type: WorkerToMainMessageType.SOURCE_OK });

      // Re-attach replays the source; the boundary stays silent (already closed
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

      expect(seen).toEqual([{ active: true, info: MAIN_INFO }, { active: false }]);

      const replayedId = newestSourceId(worker);
      worker.reply({
        info: MAIN_INFO_NO_DURATION,
        requestId: replayedId,
        type: WorkerToMainMessageType.SOURCE_OK,
      });
      expect(seen).toEqual([
        { active: true, info: MAIN_INFO },
        { active: false },
        { active: true, info: MAIN_INFO_NO_DURATION },
      ]);
      host.destroy();
    },
  );

  it.skipIf(!IN_BROWSER)('a recovery restart closes source info exactly once and the fresh SOURCE_OK reopens it', () => {
    const { host, target, worker } = attachAndHandshake();
    const seen = collectSourceInfoDetails(host);

    const id = loadAndAcknowledge(host, worker, 'k');
    expect(seen).toEqual([{ active: true, info: MAIN_INFO }]);

    // A decode failure only restarts (rather than defers) while the load is
    // playing; mark it so with the native `play` the host observes.
    target.dispatchEvent(new Event('play'));

    worker.reply({ kind: 'decode', requestId: id, type: WorkerToMainMessageType.ERROR });
    expect(seen).toEqual([{ active: true, info: MAIN_INFO }, { active: false }]);

    // The restart posted a fresh SOURCE; only its ack re-opens source info.
    const restartId = newestSourceId(worker);
    expect(restartId).not.toBe(id);
    worker.reply({
      info: MAIN_INFO_NO_DURATION,
      requestId: restartId,
      type: WorkerToMainMessageType.SOURCE_OK,
    });
    expect(seen).toEqual([
      { active: true, info: MAIN_INFO },
      { active: false },
      { active: true, info: MAIN_INFO_NO_DURATION },
    ]);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)(
    'dispatches once on the attached element and forwards once to host listeners (no double event)',
    () => {
      const { host, target, worker } = attachAndHandshake();
      const elementSeen: SiaSourceInfoChangeDetail[] = [];
      const hostSeen: SiaSourceInfoChangeDetail[] = [];
      target.addEventListener(siaSourceInfoChange, (event: Event) => {
        elementSeen.push((event as CustomEvent<SiaSourceInfoChangeDetail>).detail);
      });
      host.addEventListener(siaSourceInfoChange, (event: Event) => {
        hostSeen.push((event as CustomEvent<SiaSourceInfoChangeDetail>).detail);
      });

      // The one element dispatch reaches EACH receiver exactly once, in order.
      loadAndAcknowledge(host, worker, 'k');
      expect(elementSeen).toEqual([{ active: true, info: MAIN_INFO }]);
      expect(hostSeen).toEqual([{ active: true, info: MAIN_INFO }]);

      host.load();
      expect(elementSeen).toEqual([{ active: true, info: MAIN_INFO }, { active: false }]);
      expect(hostSeen).toEqual([{ active: true, info: MAIN_INFO }, { active: false }]);
      host.destroy();
    },
  );

  it.skipIf(!IN_BROWSER)('leaves the boolean-only sia-load-change untouched', () => {
    const { host, worker } = attachAndHandshake();
    const sourceInfoSeen = collectSourceInfoDetails(host);
    const loadSeen: { accepted: boolean }[] = [];
    host.addEventListener(siaLoadChange, (event: Event) => {
      loadSeen.push((event as CustomEvent<{ accepted: boolean }>).detail);
    });

    loadAndAcknowledge(host, worker, 'k');

    // Source info carries the payload; load acceptance stays boolean-only.
    expect(sourceInfoSeen).toEqual([{ active: true, info: MAIN_INFO }]);
    expect(loadSeen).toEqual([{ accepted: true }]);
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)(
    'forwards a frozen SourceInfo payload without mutating it (treated immutable)',
    () => {
      const { host, worker } = attachAndHandshake();
      const seen = collectSourceInfoDetails(host);

      // Deep-freeze the worker payload (including the nested `tracks` array).
      // The host must only READ it (durationSeconds/mode) and forward the exact
      // object; any mutation attempt throws in strict mode and fails the test.
      const frozen: SourceInfo = Object.freeze({
        ...MAIN_INFO,
        tracks: Object.freeze(MAIN_INFO.tracks.map((track) => Object.freeze({ ...track }))),
      });

      expect(() => {
        host.src = 'k';
        const requestId = newestSourceId(worker);
        worker.reply({ info: frozen, requestId, type: WorkerToMainMessageType.SOURCE_OK });
      }).not.toThrow();

      expect(seen).toEqual([{ active: true, info: frozen }]);
      // The forwarded info is the exact frozen object, identity preserved.
      expect((seen[0] as { active: true; info: SourceInfo }).info).toBe(frozen);
      host.destroy();
    },
  );
});
