/**
 * Bundler-friendly worker entry (`@lumeweb/sia-video-source/worker`).
 *
 * Consume it either by URL — `new Worker(new URL('./worker.js', import.meta.url),
 * { type: 'module' })`, which the default `SiaVideoSource` factory already
 * emits, or via the package export with your own worker construction. Once
 * imported as the worker global scope, this module installs the protocol
 * message listener.
 */

import { SiaVideoWorkerCore, type SiaVideoWorkerOptions } from './sia-video-source-worker.ts';
import { isMainToWorkerMessage } from './protocol.ts';

export {
  DEFAULT_FMP4_MIME,
  PROTOCOL_VERSION,
  type SiaVideoMessage,
  type WorkerConfig,
  type WorkerToMainMessage,
} from './protocol.ts';

export {
  HEAD_PROBE_LENGTH,
  type PostMessage,
  type SiaVideoSdk,
  SiaVideoWorkerCore,
  type SiaVideoWorkerOptions,
} from './sia-video-source-worker.ts';

/** Installs the worker's message loop; call once at module top level. */
export function installSiaVideoSourceWorker(options: SiaVideoWorkerOptions = {}): void {
  const core = new SiaVideoWorkerCore(options);
  (self as unknown as { addEventListener(type: 'message', listener: (event: MessageEvent) => void): void })
    .addEventListener('message', (event) => {
      // Malformed or foreign payloads must not reach the state machine.
      if (!isMainToWorkerMessage(event.data)) return;
      void core.handleMessage(event.data);
    });
}

if (typeof document === 'undefined' && typeof self !== 'undefined' && typeof window === 'undefined') {
  installSiaVideoSourceWorker();
}
