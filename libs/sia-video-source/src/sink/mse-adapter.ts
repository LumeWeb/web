/**
 * MSE `AppendSink` adapter: a thin, role-agnostic façade over the existing
 * `MseAppendPipe`, whose SPF-backed append/evict/EOS internals are unchanged.
 * The controller gets one `AppendSink` interface whether MSE runs in the
 * worker (the pipe the worker already builds) or on the main thread (the pipe
 * `SiaVideoSource` builds), so container-specific append branches never need
 * to live in the controller.
 *
 * The adapter adds only the contract's load-generation scoping on top of the
 * pipe: load-generation-tagged `resetParser`/`requestEndOfStream` calls from
 * a superseded load are dropped before they touch the pipe, so one load's
 * teardown can never reset or end the next source's SourceBuffer. `append`
 * carries no generation — stale ordering is already dropped by the
 * generation-aware media playback that fed the bytes and by the pipe's own
 * reset.
 */
import {
  DEFAULT_MSE_AHEAD_TARGET_SECONDS,
  DEFAULT_MSE_APPEND_CAPACITY_BYTES,
  type MseAppendFailureKind,
  MseAppendPipe,
} from '../mse-pipe.ts';
import type { AppendSink, AppendUnit } from './append-sink.ts';

export interface MseAdapterOptions {
  /**
   * The load generation the controller starts from. Later
   * `resetParser(loadGeneration, ...)` calls raise it; stale (older)
   * load-generation-tagged calls are ignored.
   */
  initialLoadGeneration?: number;
  /** The composition root's existing `MseAppendPipe` for this MediaSource. */
  pipe: MseAppendPipe;
}

/**
 * Live worker MediaSource state the worker-mode sink factory binds one
 * per-load `MseAppendPipe` to, matching the pipe the worker already builds.
 * The getters read the worker's live state so the pipe serializes appends
 * into whatever SourceBuffer the (possibly still-opening) MediaSource yields,
 * and `onError` reports fatal append failures onto the load's request id.
 */
export interface WorkerMseSinkFactoryDeps {
  /**
   * The primary producer ahead-duration target in seconds handed to each
   * load's `MseAppendPipe` (`aheadTargetSeconds`): how many seconds of playable
   * media
   * the real SourceBuffer may hold ahead of the playhead before
   * `waitForBufferedAhead()` parks the media library's reads. Defaults to
   * `DEFAULT_MSE_AHEAD_TARGET_SECONDS`, so the worker-mode pipeline waits on
   * the real buffered window unless a caller explicitly overrides it. (A
   * direct `MseAppendPipe` constructor without `aheadTargetSeconds` leaves the
   * wait open, so the option stays opt-in, which preserves the pipe's own
   * contract.)
   */
  aheadTargetSeconds?: number;
  /** Seconds of media kept buffered behind the playhead before eviction. */
  backBufferSeconds: number;
  /**
   * The secondary transient-backlog bound in bytes handed to each load's
   * `MseAppendPipe` (`capacityBytes`): the maximum queued + in-flight append
   * payload the media library may hand the sink before `waitForCapacity()`
   * parks its reads. Defaults to `DEFAULT_MSE_APPEND_CAPACITY_BYTES`, so the
   * worker-mode pipeline is bounded unless a caller explicitly overrides it;
   * pass a larger budget for very high-bitrate objects or a smaller one for
   * memory-tight workers. It caps the remux backlog while the SourceBuffer is
   * slow to absorb; the buffered-ahead duration wait is the quota protection.
   * (A direct `MseAppendPipe` constructor without `capacityBytes` stays
   * unbounded, the wait never blocks, which preserves the pipe's own opt-in
   * contract.)
   */
  capacityBytes?: number;
  /** The worker MediaSource the sink appends into (EOS deferral). */
  getMediaSource(): MediaSource | null;
  /** Current playhead seconds; the eviction boundary derives from it. */
  getPlayheadSeconds(): number;
  /** The SourceBuffer for this load's MSE pipeline (may appear late). */
  getSourceBuffer(): null | SourceBuffer;
  /**
   * Optional MSE-pipe diagnostics (eviction / parser-reset / EOS breadcrumbs),
   * forwarded straight from the pipe's own `onDiag` hook.
   */
  onDiag?(name: string, detail: Readonly<Record<string, unknown>>): void;
  /** Fatal MSE append failure; fires at most once per pipe lifetime. */
  onError(error: unknown, kind: MseAppendFailureKind): void;
}

export class MseAdapter implements AppendSink {
  #loadGeneration: number;
  readonly #pipe: MseAppendPipe;

  constructor(options: MseAdapterOptions) {
    this.#loadGeneration = options.initialLoadGeneration ?? 0;
    this.#pipe = options.pipe;
  }

  abort(_reason?: unknown): void {
    // The pipe's own load-generation/teardown state dominates; `reason` carries
    // no behavior (the pipe stops permanently regardless).
    this.#pipe.abort();
  }

  append(unit: AppendUnit): void {
    // End-of-stream is requested by conversion completion, never by a byte
    // unit; the pipe's EOS deferral already waits for the queue to drain.
    this.#pipe.append(unit.bytes);
  }

  async evictBackBuffer(_playheadSeconds: number): Promise<boolean> {
    // The pipe derives the eviction boundary from its own playhead provider;
    // the argument exists for contract uniformity across future sinks.
    return this.#pipe.evictBackBuffer();
  }

  requestEndOfStream(loadGeneration: number): void {
    if (loadGeneration < this.#loadGeneration) return;
    this.#pipe.requestEndOfStream();
  }

  resetParser(loadGeneration: number, targetTimeSeconds?: number): void {
    if (loadGeneration < this.#loadGeneration) return;
    this.#loadGeneration = Math.max(this.#loadGeneration, loadGeneration);
    this.#pipe.reset(targetTimeSeconds);
  }

  waitForBufferedAhead(): Promise<void> {
    return this.#pipe.waitForBufferedAhead();
  }

  waitForCapacity(): Promise<void> {
    return this.#pipe.waitForCapacity();
  }
}

/**
 * Worker-mode MSE `sinkFactory`: builds one fresh `AppendSink` per call — a
 * `MseAdapter` over a fresh `MseAppendPipe` for the worker MediaSource — so
 * every load gets its own append queue/load generation while sharing the live
 * worker MSE state behind the injected getters. This is the production
 * composition-root binding the coordinator's `sinkFactory` connects to.
 */
export function createWorkerMseSinkFactory(deps: WorkerMseSinkFactoryDeps): () => AppendSink {
  return () =>
    new MseAdapter({
      pipe: new MseAppendPipe({
        aheadTargetSeconds: deps.aheadTargetSeconds ?? DEFAULT_MSE_AHEAD_TARGET_SECONDS,
        backBufferSeconds: deps.backBufferSeconds,
        capacityBytes: deps.capacityBytes ?? DEFAULT_MSE_APPEND_CAPACITY_BYTES,
        getMediaSource: () => deps.getMediaSource(),
        getPlayheadSeconds: () => deps.getPlayheadSeconds(),
        getSourceBuffer: () => deps.getSourceBuffer(),
        onDiag: (name, detail) => deps.onDiag?.(name, detail),
        onError: (error, kind) => deps.onError(error, kind),
      }),
    });
}
