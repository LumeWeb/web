/**
 * React harness for the `<SiaVideo>` config-reload binding: renders the REAL
 * component standalone (no Player — the component attaches its own `<video>`
 * through `useAttachMedia`), with the global `Worker` stubbed by a recorder so
 * the host's `defaultCreateWorker` never spawns a real worker and tests can
 * count HELLOs at the wire level.
 *
 * The harness deliberately uses a STABLE ref callback (a module-file const per
 * mount, not an inline arrow): `useComposedRefs` memoizes on ref identity, so
 * an inline ref would change identity every render and React would re-invoke
 * the composition — calling `media.detach()` then `media.attach()` on every
 * prop change, which would post a spurious HELLO and defeat the point of the
 * tests. Test-only; lives outside the package surface.
 */
import { createRoot, type Root } from 'react-dom/client';
import { SiaVideo, type SiaVideoProps } from '../../react/index.tsx';
import { type MainToWorkerMessage, MainToWorkerMessageType } from '../../protocol.ts';

export interface ConfigReloadHarness {
  /** The live `<video>` DOM node, stable across re-renders. */
  element(): HTMLVideoElement | null;
  /** Number of HELLO messages the worker has received so far. */
  hellos(): number;
  /** Re-renders the SiaVideo with new props (reconciles, never remounts). */
  render(props: SiaVideoProps): void;
  unmount(): void;
  /** The single worker the mount spawned (media instance is persistent). */
  worker: FakeWorker;
}

/** Recorder worker standing in for the global `Worker` the host spawns. */
export class FakeWorker {
  static instances: FakeWorker[] = [];
  listener: ((event: { data: unknown }) => void) | null = null;
  readonly sent: MainToWorkerMessage[] = [];

  constructor() {
    FakeWorker.instances.push(this);
  }
  addEventListener(_type: 'message', listener: (event: { data: unknown }) => void): void {
    this.listener = listener;
  }
  postMessage(message: unknown): void {
    this.sent.push(message as MainToWorkerMessage);
  }
  removeEventListener(): void {
    this.listener = null;
  }
  terminate(): void { /* noop */ }
}

export async function mountSiaVideo(initial: SiaVideoProps): Promise<ConfigReloadHarness> {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root: Root = createRoot(container);
  let video: HTMLVideoElement | null = null;
  // Stable callback ref: `useComposedRefs` memoizes on ref identity (see the
  // module docstring), so this must not be an inline arrow.
  const videoRef = (el: HTMLVideoElement | null): void => {
    video = el;
  };
  const render = (props: SiaVideoProps): void => {
    root.render(<SiaVideo ref={videoRef} {...props} />);
  };
  render(initial);
  await waitFor(() => {
    if (video === null) throw new Error('video not mounted');
  });
  const worker = FakeWorker.instances.at(-1);
  if (!worker) throw new Error('no worker spawned');
  return {
    element: () => video,
    hellos: () => worker.sent.filter((m) => m.type === MainToWorkerMessageType.HELLO).length,
    render,
    unmount: () => {
      root.unmount();
      container.remove();
    },
    worker,
  };
}

/** Poll until `ready()` stops throwing or the timeout elapses. */
export async function waitFor(ready: () => void, timeoutMs = 2000): Promise<void> {
  const start = Date.now();
  for (;;) {
    try {
      ready();
      return;
    } catch {
      if (Date.now() - start > timeoutMs) {
        ready(); // rethrow the last assertion for a readable failure
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}
