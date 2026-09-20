/**
 * Production composition-root binding: wires the `SessionCoordinator` to the
 * real Sia transport and worker-mode MSE, so the worker entry can construct a
 * fully wired coordinator without touching the protocol wire shapes.
 *
 * Three seams compose here:
 *
 * - `createSiaByteSourceFactory(sdk, opts)` (re-exported from `transport/`) —
 *   the coordinator's `createSource`, resolving a SOURCE `src` locator into a
 *   `SiaByteSource` sharing one budget/cache across loads.
 * - `createWorkerMseSinkFactory(deps)` (re-exported from `sink/`) — the
 *   coordinator's worker-mode `sinkFactory`, adapting the worker MediaSource
 *   through `MseAdapter` over `MseAppendPipe`.
 * - `createSiaWorkerComposition(deps)` — this module's binding, injecting both
 *   into `createSessionCoordinator`. Protocol compatibility is preserved: when
 *   no worker MSE is supplied, the coordinator keeps its default main-mode
 *   CHUNK posting sink, existing messages are not renamed, and the
 *   `SOURCE_OK.info` capability fields stay optional.
 */

import type { PlaybackCapabilities } from '../capabilities/browser-capabilities.ts';
import type { ContainerClassifier } from '../capabilities/container-classifier.ts';
import type { IndexBuilder } from '../container/index/random-access-index.ts';
import type { ProducerFactoryRegistry } from '../container/producer/producer-factory.ts';
import type { WorkerConfig } from '../protocol.ts';
import type { ByteSource } from '../transport/byte-source.ts';
import type { Clock } from './clock.ts';
import type { SessionHandshake } from './session-coordinator.ts';
import {
  createSessionCoordinator,
  createSessionHandshake,
  defaultSupportsWorkerMse,
  type PostMessage,
  type SessionCoordinator,
} from './session-coordinator.ts';
import type { WorkerMseRoot } from './worker-mse-root.ts';
import type { SiaByteSourceSdk } from '../transport/sia-byte-source.ts';
import { createSiaByteSourceFactory, type SiaByteSourceFactoryOptions } from '../transport/sia-byte-source.ts';
import type { WorkerMseSinkFactoryDeps } from '../sink/mse-adapter.ts';
import { createWorkerMseSinkFactory } from '../sink/mse-adapter.ts';

export { createWorkerMseSinkFactory, type WorkerMseSinkFactoryDeps } from '../sink/mse-adapter.ts';
export { createSiaByteSourceFactory, type SiaByteSourceFactoryOptions, type SiaByteSourceSdk } from '../transport/sia-byte-source.ts';
export { createWorkerMseRoot, type WorkerMseRoot, type WorkerMseRootOptions } from './worker-mse-root.ts';

/** Everything the worker entry needs to bind a fully wired coordinator. */
export interface SiaWorkerCompositionDeps {
  /** Construction options shared across every `SiaByteSource` the composition creates. */
  readonly byteSource?: SiaByteSourceFactoryOptions;
  /** Browser capability snapshot for the MSE/codec checks (default: detect). */
  readonly capabilities?: PlaybackCapabilities;
  /** Container classifier (default: `createContainerClassifier()`). */
  readonly classifier?: ContainerClassifier;
  /** Injectable time (default: `wallClock()`). */
  readonly clock?: Clock;
  /**
   * Builds (lazily, once per connection) the Sia SDK the composition's
   * `createSource` resolves SOURCE locators through. Alternative to `sdk` for
   * the real worker root: the HELLO `WorkerConfig` and the decrypted
   * `APP_KEY` seed are only known after the handshake, so the coordinator's
   * live handshake config/seed are fed here on the first `SOURCE` (the seed
   * stays inside this isolate). The build is memoized and connection-guarded;
   * a changed config or seed rebuilds (and disposes) the previous SDK.
   */
  readonly createSdk?: (config: undefined | WorkerConfig, appKeySeed: null | Uint8Array) => Promise<SiaByteSourceSdk>;
  /** Handshake for `HELLO`/`APP_KEY` (default: `createSessionHandshake()`). */
  readonly handshake?: SessionHandshake;
  /** Bounded head-probe length fed to the classifier (default 4096). */
  readonly headProbeLength?: number;
  /** Ordered best-effort index builders (default: sidx registry). */
  readonly indexBuilders?: readonly IndexBuilder[];
  /** Forward lookahead seconds handed to each session's controller. */
  readonly lookaheadSeconds?: number;
  /**
   * Called whenever the coordinator abandons the active load (superseded
   * SOURCE, DETACH, or DESTROY). When `workerMseRoot` is in use this binding
   * ignores a caller-supplied value and tears the root down itself so the
   * previous load's MediaSource/SourceBuffer is released immediately.
   */
  readonly onAbandon?: () => void;
  /** Outbound protocol channel. */
  readonly post: PostMessage;
  /** Producer registry whose `select` exposes the winning reason. */
  readonly producerFactory?: ProducerFactoryRegistry;
  /** The Sia SDK used to resolve and download sources (or use `createSdk` for lazy binding). */
  readonly sdk?: SiaByteSourceSdk;
  /** Controller-level stall timeout (0 disables). */
  readonly stallTimeoutMs?: number;
  /** Worker-MSE capability check; false in node, true where `canConstructInDedicatedWorker`. */
  readonly supportsWorkerMse?: () => boolean;
  /**
   * Live worker MediaSource state. When present and worker MSE is supported,
   * each load gets an MSE-backed `AppendSink` (one `MseAdapter` per load, no
   * MediaSource ownership — the caller's getters decide what it appends into).
   */
  readonly workerMse?: WorkerMseSinkFactoryDeps;
  /**
   * Worker-side MSE composition root (production): owns the worker MediaSource
   * lifecycle and transfers each load's `MediaSourceHandle` as a `HANDLE`
   * protocol message. Prefer this over `workerMse` for the real worker entry;
   * it keeps the main-thread CHUNK fallback whenever the runtime cannot
   * construct MSE in a dedicated worker.
   */
  readonly workerMseRoot?: WorkerMseRoot;
}

/**
 * Composition-root factory: builds a fully wired, protocol-compatible
 * `SessionCoordinator` for a Sia worker. A resolved `sdk` becomes
 * `createSource` directly; with `createSdk` instead, the real transport root is
 * bound lazily — the coordinator's live HELLO config + decrypted APP_KEY seed
 * are fed to `createSdk` on the first `SOURCE`, memoized per connection.
 * When `workerMse` is provided (and worker MSE is supported), `sinkFactory`
 * produces one `MseAdapter` per load.
 */
export function createSiaWorkerComposition(deps: SiaWorkerCompositionDeps): SessionCoordinator {
  const { byteSource, sdk, workerMse, workerMseRoot, ...rest } = deps;
  if (!sdk && !deps.createSdk) {
    throw new Error(
      'createSiaWorkerComposition requires a resolved `sdk` or a `createSdk` factory (HELLO/APP_KEY-driven).',
    );
  }
  // The composition root owns the handshake instance so `createSource` can
  // read the live connection (config + decrypted seed) for lazy SDK binding.
  const handshake = deps.handshake ?? createSessionHandshake();
  const createSource: (src: string) => Promise<ByteSource> = deps.createSdk
    ? createLazySiaByteSourceFactory({ byteSource, createSdk: deps.createSdk, handshake })
    : createSiaByteSourceFactory(sdk!, byteSource);
  // Worker MSE is used only when the runtime can construct it in a dedicated
  // worker AND a worker MSE binding is supplied; otherwise the coordinator
  // keeps its default main-mode CHUNK posting sink (the Firefox fallback).
  const workerMseSupported = (deps.supportsWorkerMse ?? defaultSupportsWorkerMse)();
  return createSessionCoordinator({
    ...rest,
    createSource,
    handshake,
    supportsWorkerMse: () => workerMseSupported,
    ...(workerMseSupported && workerMseRoot
      ? {
          // The root owns the worker MediaSource + HANDLE transfer per load and
          // derives the pipe's eviction boundary from the playhead reflector.
          // Any abandoned/ended session tears the root's pipeline down so a
          // superseded or detached load never leaves a stale MediaSource +
          // SourceBuffer allocated on the worker.
          onAbandon: () => workerMseRoot.teardown(),
          onPlayhead: (timeSeconds) => workerMseRoot.setPlayhead(timeSeconds),
          sinkFactory: (context) => workerMseRoot.createSink(context),
        }
      : workerMseSupported && workerMse
        ? { sinkFactory: createWorkerMseSinkFactory(workerMse) }
        : {}),
  });
}

function appKeySeedsEqual(a: null | Uint8Array, b: null | Uint8Array): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.byteLength !== b.byteLength) return false;
  for (let i = 0; i < a.byteLength; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function connectionEquals(
  cached: { config: undefined | WorkerConfig; seed: null | Uint8Array },
  config: undefined | WorkerConfig,
  seed: null | Uint8Array,
): boolean {
  return workerConfigsEqual(cached.config, config) && appKeySeedsEqual(cached.seed, seed);
}

/**
 * Guards a per-connection SDK memo behind the coordinator handshake's live
 * config + decrypted seed: the first SOURCE builds the SDK, later SOURCEs
 * reuse it while the connection is unchanged, and a changed connection
 * rebuilds (disposing the superseded SDK) so stale credentials are never
 * cached over a newer one.
 */
function createLazySiaByteSourceFactory(deps: {
  readonly byteSource?: SiaByteSourceFactoryOptions;
  readonly createSdk: (config: undefined | WorkerConfig, appKeySeed: null | Uint8Array) => Promise<SiaByteSourceSdk>;
  readonly handshake: Pick<SessionHandshake, 'config' | 'seed'>;
}): (src: string) => Promise<ByteSource> {
  const { byteSource, createSdk, handshake } = deps;
  let cached: null | { config: undefined | WorkerConfig; sdk: SiaByteSourceSdk; seed: null | Uint8Array; } = null;

  return async (src: string): Promise<ByteSource> => {
    const config = handshake.config;
    const seed = handshake.seed ?? null;
    let sdk = cached && connectionEquals(cached, config, seed) ? cached.sdk : null;
    if (!sdk) {
      sdk = await createSdk(config, seed);
      const previous = cached?.sdk;
      cached = { config, sdk, seed };
      // Defer the call so a synchronous throw inside dispose() never escapes a
      // next-load failure as a rejection of the new SDK build.
      if (previous && previous !== sdk) {
        queueMicrotask(() => disposeSdk(previous));
      }
    }
    return createSiaByteSourceFactory(sdk, byteSource)(src);
  };
}

function disposeSdk(sdk: unknown): void {
  const dispose = (sdk as { dispose?: () => unknown }).dispose;
  if (typeof dispose === 'function') {
    void Promise.resolve()
      .then(dispose)
      .catch(() => {
        /* best-effort teardown; never propagates */
      });
  }
}

/** True when two HELLO worker configs describe the same connection (indexer identity). */
function workerConfigsEqual(a: undefined | WorkerConfig, b: undefined | WorkerConfig): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.indexerUrl === b.indexerUrl;
}
