/**
 * Bundler-friendly worker entry (`@lumeweb/sia-video-source/worker`).
 *
 * Consume it either by URL — `new Worker(new URL('./worker.js', import.meta.url),
 * { type: 'module' })`, which the default `SiaVideoSource` factory already
 * emits, or via the package export with your own worker construction. Once
 * imported as the worker global scope, this module installs the protocol
 * message listener.
 */

import { isMainToWorkerMessage, workerErrorCode } from './protocol.ts';
import { createSiaWorkerComposition, createWorkerMseRoot } from './session/sia-composition.ts';
import {
  createDefaultSdk,
  defaultPost,
  FINITE_VOD_BACK_BUFFER_SECONDS,
  type SiaVideoWorkerOptions,
  type WorkerCompositionHost,
} from './worker-runtime.ts';

export {
  type AppKeySeedProvider,
  decryptAppKeyEnvelope,
  encryptToWorker,
  exportWorkerPublicKey,
  generateWorkerKeyPair,
  scrub,
} from './app-key-handshake.ts';

export {
  type AppKeyEnvelope,
  DEFAULT_FMP4_MIME,
  isAppKeyEnvelope,
  PROTOCOL_VERSION,
  type SiaVideoMessage,
  type WorkerConfig,
  type WorkerToMainMessage,
} from './protocol.ts';

export {
  HEAD_PROBE_LENGTH,
  type PostMessage,
  type SiaVideoSdk,
  type SiaVideoWorkerOptions,
  type WorkerCompositionHost,
} from './worker-runtime.ts';

/**
 * The minimal browser global-scope surface the worker entry consults when
 * deciding whether to auto-install. This library is browser-only, so the
 * decision is made from browser globals (`self` / `window`) alone and never
 * branches on `document` or Node.
 */
export interface WorkerScopeRuntime {
  self?: unknown;
  window?: unknown;
}

/**
 * The worker-side default Sia composition root that
 * `installSiaVideoSourceWorker` installs by default. Wires the coordinator to
 * the browser-side surfaces only: `self.postMessage` as the outbound
 * channel, the worker-local SDK factory (`createSdk`, defaulting to
 * the HELLO/APP_KEY registration flow) for the lazily bound transport, and
 * the worker-side MSE root (`createWorkerMseRoot`) that owns one fresh worker
 * `MediaSource` per load and transfers its `MediaSourceHandle` to the host as
 * a `HANDLE` message. Where the runtime cannot construct MSE in a dedicated
 * worker (Firefox), the composition never opens the root and keeps the
 * protocol-safe main-mode CHUNK posting sink — the host owns MSE in that
 * case. No Node-vs-browser branch exists here: this entry is browser-only, so
 * the browser globals (`self`) are used directly.
 */
export function createDefaultWorkerComposition(options: SiaVideoWorkerOptions = {}): WorkerCompositionHost {
  const post = options.post ?? defaultPost;
  const workerMseRoot = createWorkerMseRoot({
    backBufferSeconds: FINITE_VOD_BACK_BUFFER_SECONDS,
    createMediaSource: options.createMediaSource,
    onError: (requestId, error) => {
      if (requestId === null) return;
      post({
        context: error instanceof Error ? error.message.slice(0, 240) : String(error).slice(0, 240),
        kind: workerErrorCode.decode,
        requestId,
        type: 'ERROR',
      });
    },
    post,
  });
  return createSiaWorkerComposition({
    byteSource: options.cache ? { cache: options.cache } : undefined,
    capabilities: options.capabilities,
    createSdk: options.createSdk ?? createDefaultSdk,
    post,
    stallTimeoutMs: options.stallTimeoutMs,
    supportsWorkerMse: options.supportsWorkerMse,
    workerMseRoot,
  });
}

/**
 * Installs the worker's message loop; call once at module top level.
 *
 * By default this installs the worker-side default Sia composition root
 * (`createDefaultWorkerComposition`, a `createSiaWorkerComposition`-built
 * `SessionCoordinator`) behind the validated-message listener: it binds the
 * real Sia transport lazily from the HELLO config + decrypted APP_KEY seed,
 * owns worker MSE through the worker-side root where the runtime allows it,
 * honors a host `workerMse: 'main'` preference in the HELLO config, and keeps
 * the protocol-safe main-thread CHUNK fallback otherwise. A caller can inject
 * any {@link WorkerCompositionHost} via `options.createCompositionRoot`, which
 * takes precedence and replaces the default root entirely.
 */
export function installSiaVideoSourceWorker(options: SiaVideoWorkerOptions = {}): void {
  const host: WorkerCompositionHost = options.createCompositionRoot
    ? options.createCompositionRoot(options)
    : createDefaultWorkerComposition(options);
  (self as unknown as { addEventListener(type: 'message', listener: (event: MessageEvent) => void): void })
    .addEventListener('message', (event) => {
      // Malformed or foreign payloads must not reach the state machine.
      if (!isMainToWorkerMessage(event.data)) return;
      void host.handleMessage(event.data);
    });
}

/**
 * True only when this module is evaluated as a browser worker global scope
 * (dedicated/shared worker): `self` is the `WorkerGlobalScope` and `window`
 * is absent. On the browser main thread `window` exists (so this is false and
 * the entry does not install a `message` listener on the page), and in a
 * non-worker runtime there is no `self` at all.
 */
export function isBrowserWorkerGlobalScope(runtime: WorkerScopeRuntime = globalThis): boolean {
  return typeof runtime.self !== 'undefined' && typeof runtime.window === 'undefined';
}

if (isBrowserWorkerGlobalScope()) {
  installSiaVideoSourceWorker();
}
