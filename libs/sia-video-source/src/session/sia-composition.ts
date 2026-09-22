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
import {
  type RequestId,
  type WorkerConfig,
  type WorkerLogLevel,
  workerLogLevel,
  type WorkerMode,
  type WorkerToMainMessage,
  WorkerToMainMessageType,
} from '../protocol.ts';
import type { ByteSource } from '../transport/byte-source.ts';
import type { Clock } from './clock.ts';
import type { LoadPipeline } from './load-pipeline.ts';
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
  /** Injectable time (default: `wallClock()`). */
  readonly clock?: Clock;
  /**
   * Builds (lazily, once per connection) the Sia SDK the composition's
   * `createSource` resolves SOURCE locators through. Alternative to `sdk` for
   * the real worker root: the HELLO `WorkerConfig` and the decrypted
   * `APP_KEY` seeds are only known after the handshake, so the coordinator's
   * live handshake config and both decrypted credential seeds (app-key
   * `appKeySeed`, keyless `sharingSeed`) are fed here on the first `SOURCE`
   * (the seeds stay inside this isolate). The build is memoized and
   * connection-guarded; a changed config or seed rebuilds (and disposes) the
   * previous SDK. The `sharingSeed` argument is new: injected factories
   * written against the old two-argument shape keep working (unused trailing
   * arguments are ignored).
   */
  readonly createSdk?: (
    config: undefined | WorkerConfig,
    appKeySeed: null | Uint8Array,
    sharingSeed: null | Uint8Array,
  ) => Promise<SiaByteSourceSdk>;
  /** Handshake for `HELLO`/`APP_KEY` (default: `createSessionHandshake()`). */
  readonly handshake?: SessionHandshake;
  /**
   * Injected load-pipeline seam for package-owned tests; production defaults
   * to `createLoadPipeline({ capabilities })` inside the coordinator.
   */
  readonly loadPipeline?: LoadPipeline;
  /**
   * Optional outbound worker `LOG` sink. When supplied, this binding derives
   * milestones from the coordinator's outbound messages (attach/detach,
   * sdk.built, stream started/ended, session errors) and forwards them here as
   * `LOG` messages, each gated by the live HELLO `log` threshold and the
   * per-sink 256 cap (see `emitLog`). The real worker root wires this to its
   * `post` channel; tests inject a recorder. Absent = no LOG messages.
   */
  readonly logSink?: WorkerLogSink;
  /**
   * Called whenever the coordinator abandons the active load (superseded
   * SOURCE, DETACH, or DESTROY). When `workerMseRoot` is in use this binding
   * ignores a caller-supplied value and tears the root down itself so the
   * previous load's MediaSource/SourceBuffer is released immediately.
   */
  readonly onAbandon?: () => void;
  /** Outbound protocol channel. */
  readonly post: PostMessage;
  /** The Sia SDK used to resolve and download sources (or use `createSdk` for lazy binding). */
  readonly sdk?: SiaByteSourceSdk;
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
 * Outbound worker `LOG` message sink: receives fully-formed `LOG` protocol
 * messages (see `emitLog`) that a host opted into via the HELLO `log`
 * threshold. The sink must be total (never throw): the composition forwards
 * every derived milestone through it after the real protocol message already
 * went out, so a misbehaving consumer can never wedge the wire.
 */
export type WorkerLogSink = (message: Extract<WorkerToMainMessage, { type: WorkerToMainMessageType.LOG }>) => void;

/**
 * Hard ceiling on the number of `LOG` messages one sink instance may receive.
 * A pathological loop (e.g. a per-read milestone inside a tight retry storm)
 * must never flood the worker→main `postMessage` channel, so past this budget
 * `emitLog` silently drops. The count closes over the sink identity via a
 * `WeakMap`, so independent compositions/workers never borrow from each
 * other's budget.
 */
export const MAX_WORKER_LOG_MESSAGES = 256;

/** Severity rank for the four wire levels, least to most severe (drives the threshold gate). */
const LOG_LEVEL_RANK = {
  [workerLogLevel.debug]: 0,
  [workerLogLevel.error]: 3,
  [workerLogLevel.info]: 1,
  [workerLogLevel.warn]: 2,
} as const satisfies Record<WorkerLogLevel, number>;

/** Per-sink `LOG` message counts backing the `MAX_WORKER_LOG_MESSAGES` cap. */
const emitLogCounts = new WeakMap<WorkerLogSink, number>();

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
  const { byteSource, logSink, sdk, workerMse, workerMseRoot, ...rest } = deps;
  if (!sdk && !deps.createSdk) {
    throw new Error(
      'createSiaWorkerComposition requires a resolved `sdk` or a `createSdk` factory (HELLO/APP_KEY-driven).',
    );
  }
  // The composition root owns the handshake instance so `createSource` can
  // read the live connection (config + decrypted seed) for lazy SDK binding.
  const handshake = deps.handshake ?? createSessionHandshake();

  // Reader/source milestones (`read.window-start` / `read.window-complete` /
  // `bytes.read` from `RangedReader`, and `object.resolved` from the byte
  // source factory) route through `emitLog` — the single gated code path — so
  // a missing `logSink` or a below-threshold HELLO `log` keeps every reader
  // milestone fully suppressed. The callback is only attached when a
  // `logSink` exists. The coordinator's `createSource` seam hands the factory
  // only the `src` string, never the SOURCE requestId, so these milestones
  // travel connection-level (requestId null).
  const onMilestone = logSink
    ? (name: string, detail: Readonly<Record<string, unknown>>): void => {
        const level =
          name === 'object.resolved'
            ? workerLogLevel.info
            : // Failure milestones are rare (only on a stalled or errored read),
              // so they never crowd the per-sink 256-message cap.
              name === 'read.stalled' || name === 'read.error'
              ? workerLogLevel.error
              : name === 'read.window-start' || name === 'read.window-complete' || name === 'bytes.read'
                ? workerLogLevel.debug
                : undefined;
        if (level === undefined) return;
        emitLog(logSink, handshake.log, level, name, detail);
      }
    : undefined;
  const byteSourceOptions: SiaByteSourceFactoryOptions | undefined = onMilestone
    ? { ...byteSource, onMilestone }
    : byteSource;
  const createSource: (src: string) => Promise<ByteSource> = deps.createSdk
    ? createLazySiaByteSourceFactory({ byteSource: byteSourceOptions, createSdk: deps.createSdk, handshake, logSink })
    : createSiaByteSourceFactory(sdk!, byteSourceOptions);
  // Worker MSE is used only when the runtime can construct it in a dedicated
  // worker AND a worker MSE binding is supplied; otherwise the coordinator
  // keeps its default main-mode CHUNK posting sink (the Firefox fallback).
  const workerMseSupported = (deps.supportsWorkerMse ?? defaultSupportsWorkerMse)();

  // Derived stream/session milestones, observed at the coordinator's outbound
  // `post` boundary: the coordinator surfaces load success, failure, and
  // terminal conditions as SOURCE_OK / ERROR / ENDED (and ATTACH as ATTACH_OK),
  // all of which flow through this wrapper. The wrapper passes everything
  // through and decides nothing —
  // every message is passed through to the real channel unchanged, AFTER the
  // milestone (if any) was derived, so a milestone can never suppress or delay
  // the protocol message that triggered it.
  let loadAccepted = false;
  // The negotiated MSE site from the last ATTACH_OK (`message.mode`), used to
  // annotate `stream.started`. It lags by design: no whole config is plumbed
  // here, the ATTACH_OK wire field is the one honest source.
  let sessionMode: undefined | WorkerMode;
  const wrappedPost: PostMessage = (message, transfer) => {
    switch (message.type) {
      case WorkerToMainMessageType.ATTACH_OK:
        sessionMode = message.mode;
        emitLog(logSink, handshake.log, workerLogLevel.info, 'session.attach');
        break;
      case WorkerToMainMessageType.ENDED:
        emitLog(logSink, handshake.log, workerLogLevel.info, 'stream.ended', undefined, message.requestId);
        break;
      case WorkerToMainMessageType.ERROR:
        // The ERROR wire already carries the diagnostic context string from
        // `#postError` (describeError of the throwing read/pipeline); include
        // it next to the kind so a gated host sees why the session failed.
        emitLog(
          logSink,
          handshake.log,
          workerLogLevel.error,
          'session.error',
          message.context === undefined || message.context === ''
            ? { kind: message.kind }
            : { context: message.context, kind: message.kind },
          message.requestId,
        );
        break;
      case WorkerToMainMessageType.SOURCE_OK:
        // A load was accepted: the session graph now exists, so the next
        // abandon (DETACH / DESTROY / superseding SOURCE) is a real detach.
        loadAccepted = true;
        emitLog(
          logSink,
          handshake.log,
          workerLogLevel.info,
          'stream.started',
          sessionMode === undefined ? undefined : { mode: sessionMode },
          message.requestId,
        );
        break;
    }
    deps.post(message, transfer);
  };

  // `session.detach` is derived at the coordinator's abandon boundary — the
  // lifecycle hook that fires when the active session graph is torn down by
  // DETACH/DESTROY or superseded by a new SOURCE. The `loadAccepted` latch
  // keeps the no-op first-source abandon (nothing accepted yet) from logging a
  // spurious detach. The root teardown semantics are preserved: with
  // `workerMseRoot` the caller's onAbandon is ignored (the root owns MSE
  // teardown), otherwise the caller's onAbandon still runs.
  const onAbandon = (): void => {
    if (workerMseSupported && workerMseRoot) workerMseRoot.teardown();
    else deps.onAbandon?.();
    if (loadAccepted) {
      loadAccepted = false;
      emitLog(logSink, handshake.log, workerLogLevel.info, 'session.detach');
    }
  };

  return createSessionCoordinator({
    ...rest,
    createSource,
    handshake,
    onAbandon,
    post: wrappedPost,
    supportsWorkerMse: () => workerMseSupported,
    ...(workerMseSupported && workerMseRoot
      ? {
          // The root owns the worker MediaSource + HANDLE transfer per load and
          // derives the pipe's eviction boundary from the playhead reflector.
          // Any abandoned/ended session tears the root's pipeline down so a
          // superseded or detached load never leaves a stale MediaSource +
          // SourceBuffer allocated on the worker.
          onPlayhead: (timeSeconds) => workerMseRoot.setPlayhead(timeSeconds),
          sinkFactory: (context) => workerMseRoot.createSink(context),
        }
      : workerMseSupported && workerMse
        ? { sinkFactory: createWorkerMseSinkFactory(workerMse) }
        : {}),
  });
}

/**
 * Forwards one milestone as a worker→main `LOG` message through `sink`, gated
 * by the HELLO `log` forwarding threshold:
 *
 * - no-ops when `sink` or `threshold` is undefined — no sink wired, or a host
 *   that never opted in (absent HELLO `log` keeps the wire fully silent),
 * - no-ops when the event's severity ranks below `threshold` (severity order
 *   `debug < info < warn < error`; rank via the tiny `LOG_LEVEL_RANK` map over
 *   the `workerLogLevel` const, never the chatty `logger.ts` ranks),
 * - enforces the per-sink `MAX_WORKER_LOG_MESSAGES` cap described above,
 * - otherwise hands `sink` the complete `LOG` message (scalar `detail` only —
 *   never seed bytes or share-URL strings).
 */
export function emitLog(
  sink: undefined | WorkerLogSink,
  threshold: undefined | WorkerLogLevel,
  level: WorkerLogLevel,
  name: string,
  detail?: Readonly<Record<string, unknown>>,
  requestId?: null | RequestId,
): void {
  if (sink === undefined || threshold === undefined) return;
  if (LOG_LEVEL_RANK[level] < LOG_LEVEL_RANK[threshold]) return;
  const count = emitLogCounts.get(sink) ?? 0;
  if (count >= MAX_WORKER_LOG_MESSAGES) return;
  emitLogCounts.set(sink, count + 1);
  sink({
    detail,
    level,
    name,
    requestId: requestId ?? null,
    type: WorkerToMainMessageType.LOG,
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
  cached: {
    config: undefined | WorkerConfig;
    seed: null | Uint8Array;
    sharingSeed: null | Uint8Array;
  },
  config: undefined | WorkerConfig,
  seed: null | Uint8Array,
  sharingSeed: null | Uint8Array,
): boolean {
  return (
    workerConfigsEqual(cached.config, config) &&
    appKeySeedsEqual(cached.seed, seed) &&
    appKeySeedsEqual(cached.sharingSeed, sharingSeed)
  );
}

/**
 * Guards a per-connection SDK memo behind the coordinator handshake's live
 * config + decrypted credential seeds (app-key and sharing-key): the first
 * SOURCE builds the SDK, later SOURCEs reuse it while the connection is
 * unchanged, and a changed connection rebuilds (disposing the superseded SDK)
 * so stale credentials are never cached over a newer one.
 */
function createLazySiaByteSourceFactory(deps: {
  readonly byteSource?: SiaByteSourceFactoryOptions;
  readonly createSdk: (
    config: undefined | WorkerConfig,
    appKeySeed: null | Uint8Array,
    sharingSeed: null | Uint8Array,
  ) => Promise<SiaByteSourceSdk>;
  readonly handshake: Pick<SessionHandshake, 'config' | 'log' | 'seed' | 'sharingSeed'>;
  readonly logSink?: WorkerLogSink;
}): (src: string) => Promise<ByteSource> {
  const { byteSource, createSdk, handshake, logSink } = deps;
  let cached: null | {
    config: undefined | WorkerConfig;
    sdk: SiaByteSourceSdk;
    seed: null | Uint8Array;
    sharingSeed: null | Uint8Array;
  } = null;

  return async (src: string): Promise<ByteSource> => {
    const config = handshake.config;
    const seed = handshake.seed ?? null;
    const sharingSeed = handshake.sharingSeed ?? null;
    let sdk = cached && connectionEquals(cached, config, seed, sharingSeed) ? cached.sdk : null;
    if (!sdk) {
      try {
        sdk = await createSdk(config, seed, sharingSeed);
      } catch (error) {
        // A rejected SDK bootstrap is otherwise invisible (it only surfaces as
        // a generic ERROR after the fact); report it as its own error milestone
        // with the scalar message before rethrowing so the caller's existing
        // failure path is unchanged. The message comes from controlled factory
        // errors ("No Sia SDK is available…" / "The Sia app key is not
        // registered…"), never seeds or share-URL strings.
        emitLog(logSink, handshake.log, workerLogLevel.error, 'sdk.build-failed', {
          message: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
      // A fresh SDK build for this connection: report it at connection level
      // (no owning request), carrying only the indexer identity — never seeds
      // or share-URL strings (share URLs embed encryption keys).
      emitLog(logSink, handshake.log, workerLogLevel.info, 'sdk.built', { indexerUrl: config?.indexerUrl });
      const previous = cached?.sdk;
      cached = { config, sdk, seed, sharingSeed };
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
