/**
 * `SiaVideoSource` worker milestones: the typed `sia-worker-milestone-change`
 * DOM event the host emits for every accepted worker `LOG` message it
 * receives (the structured sibling of the existing `logger.child('worker')`
 * console forwarding, and the input the OPT-IN `siaProgressFeature` derives
 * reader progress from (real worker milestones, never log-text parsing).
 *
 * Rules pinned here:
 *   - Each accepted `LOG` surfaces exactly once on BOTH the attached element
 *     and host listeners (no double dispatch), with the verbatim wire facts:
 *     `name`, `level`, owning `requestId`, and the scalar `detail` (absent
 *     detail becomes `{}`).
 *   - `sequence` is a per-host monotonic counter across multiple loads and
 *     handshakes: it never resets on a load boundary.
 *   - A destroyed host never emits; a foreign/malformed payload is rejected
 *     by the wire guard before any event could fire.
 *
 * Requires a DOM and MediaSource, so these run in browser mode only
 * (`SIA_TEST_ENV=node` skips them).
 */
import { describe, expect, it } from 'vitest';
import {
  type MainToWorkerMessage,
  MainToWorkerMessageType,
  PROTOCOL_VERSION,
  type WorkerToMainMessage,
  WorkerToMainMessageType,
} from '../protocol.ts';
import {
  SiaVideoSource,
  siaWorkerMilestoneChange,
  type SiaWorkerMilestoneDetail,
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

/** attach + HELLO_OK (seed-less) produces a ready host. */
function attachAndHandshake(): { host: SiaVideoSource; target: HTMLVideoElement; worker: FakeWorker } {
  const worker = new FakeWorker();
  const host = new SiaVideoSource({ createWorker: () => worker as unknown as Worker });
  const target = document.createElement('video');
  host.attach(target);
  const hello = worker.sent.filter((m) => m.type === MainToWorkerMessageType.HELLO).at(-1);
  worker.reply({
    features: { workerMse: false },
    publicKey: new Uint8Array(32),
    requestId: (hello && 'requestId' in hello ? hello.requestId : -1),
    type: WorkerToMainMessageType.HELLO_OK,
    version: PROTOCOL_VERSION,
  });
  return { host, target, worker };
}

/** Collects details from both the element and the host listeners. */
function collect(
  target: HTMLVideoElement,
  host: SiaVideoSource,
): { element: SiaWorkerMilestoneDetail[]; host_: SiaWorkerMilestoneDetail[] } {
  const element: SiaWorkerMilestoneDetail[] = [];
  const host_: SiaWorkerMilestoneDetail[] = [];
  target.addEventListener(siaWorkerMilestoneChange, (event: Event) => {
    element.push((event as CustomEvent<SiaWorkerMilestoneDetail>).detail);
  });
  host.addEventListener(siaWorkerMilestoneChange, (event: Event) => {
    host_.push((event as CustomEvent<SiaWorkerMilestoneDetail>).detail);
  });
  return { element, host_ };
}

/** A milestone LOG on the wire: the facts a retrying read produces, scalar-only. */
function logMessage(requestId: null | number, detail?: Record<string, unknown>): WorkerToMainMessage {
  return {
    detail,
    level: 'debug',
    name: 'read.retry',
    requestId,
    type: WorkerToMainMessageType.LOG,
  };
}

describe('SiaVideoSource worker milestones (sia-worker-milestone-change)', () => {
  it.skipIf(!IN_BROWSER)('surfaces the LOG facts verbatim, once per receiver, with an absent detail defaulted to {}', () => {
    const { host, target, worker } = attachAndHandshake();
    const { element, host_ } = collect(target, host);

    worker.reply(logMessage(3, { attempt: 2, position: 0 }));

    expect(element).toEqual([
      {
        detail: { attempt: 2, position: 0 },
        level: 'debug',
        name: 'read.retry',
        requestId: 3,
        sequence: 1,
      },
    ]);
    // The element-to-host forwarding passes it to host listeners exactly once.
    expect(host_).toEqual(element);

    // An absent wire detail is `{}`, never `undefined`.
    worker.reply({
      level: 'info',
      name: 'session.attach',
      requestId: null,
      type: WorkerToMainMessageType.LOG,
    });
    expect(element[1]).toMatchObject({ detail: {}, name: 'session.attach' });
    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('sequence counts monotonically across loads and never resets at a boundary', () => {
    const { host, target, worker } = attachAndHandshake();
    const { element } = collect(target, host);

    // Load A: two milestones.
    worker.reply(logMessage(1, { attempt: 2 }));
    worker.reply(logMessage(1, { attempt: 3 }));
    expect(element.map((entry) => entry.sequence)).toEqual([1, 2]);

    // A load boundary (fresh source) does not reset the counter.
    host.src = 'k2';
    worker.reply(logMessage(2, { attempt: 2 }));
    expect(element[2]?.sequence).toBe(3);
    expect(element[2]?.requestId).toBe(2);

    host.destroy();
  });

  it.skipIf(!IN_BROWSER)('never emits after destroy, even for an in-flight LOG', () => {
    const { host, target, worker } = attachAndHandshake();
    const seen: SiaWorkerMilestoneDetail[] = [];
    target.addEventListener(siaWorkerMilestoneChange, (event: Event) => {
      seen.push((event as CustomEvent<SiaWorkerMilestoneDetail>).detail);
    });

    worker.reply(logMessage(1, {}));
    expect(seen).toHaveLength(1);

    host.destroy();
    worker.reply(logMessage(1, {}));
    expect(seen).toHaveLength(1);
  });

  it.skipIf(!IN_BROWSER)('emits for load-scoped and connection-level LOGs alike (requestId null passes through)', () => {
    const { host, target, worker } = attachAndHandshake();
    const { element } = collect(target, host);

    worker.reply(logMessage(null, { indexerUrl: 'https://indexer' }));
    expect(element).toEqual([
      {
        detail: { indexerUrl: 'https://indexer' },
        level: 'debug',
        name: 'read.retry',
        requestId: null,
        sequence: 1,
      },
    ]);
    host.destroy();
  });
});
