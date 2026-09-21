/**
 * MSE `AppendSink` adapter: a thin, role-agnostic façade over the existing
 * `MseAppendPipe`, whose SPF-backed append/evict/EOS internals are
 * deliberately unchanged. The controller gets
 * one `AppendSink` surface whether MSE runs in the worker (the pipe the
 * worker already builds) or on the main thread (the pipe `SiaVideoSource`
 * builds), so container-specific append branches never need to live in the
 * controller.
 *
 * The adapter adds only the contract's load-generation scoping on top of the
 * pipe: load-generation-tagged `resetParser`/`requestEndOfStream` calls from
 * a superseded load are dropped before they touch the pipe, so one load's
 * teardown can never reset or end the next source's SourceBuffer. `append`
 * carries no generation — stale ordering is already dropped by the
 * generation-aware media playback that fed the bytes and by the pipe's own
 * reset.
 */
import { MseAppendPipe } from '../mse-pipe.ts';
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
 * per-load `MseAppendPipe` to, mirroring the pipe the worker already builds.
 * The getters read the worker's live state so the pipe serializes appends
 * into whatever SourceBuffer the (possibly still-opening) MediaSource yields,
 * and `onError` reports fatal append failures onto the load's request id.
 */
export interface WorkerMseSinkFactoryDeps {
  /** Seconds of media kept buffered behind the playhead before eviction. */
  backBufferSeconds: number;
  /** The worker MediaSource the sink appends into (EOS deferral). */
  getMediaSource(): MediaSource | null;
  /** Current playhead seconds; the eviction boundary derives from it. */
  getPlayheadSeconds(): number;
  /** The SourceBuffer for this load's MSE pipeline (may appear late). */
  getSourceBuffer(): null | SourceBuffer;
  /** Fatal MSE append failure; fires at most once per pipe lifetime. */
  onError(error: unknown): void;
}

export class MseAdapter implements AppendSink {
  #loadGeneration: number;
  readonly #pipe: MseAppendPipe;

  constructor(options: MseAdapterOptions) {
    this.#loadGeneration = options.initialLoadGeneration ?? 0;
    this.#pipe = options.pipe;
  }

  abort(_reason?: unknown): void {
    // The pipe's own load-generation/teardown state dominates; `reason` is informational
    // at the seam (the pipe stops permanently regardless).
    this.#pipe.abort();
  }

  append(unit: AppendUnit): void {
    // A producer-declared terminal media unit ends the stream once it drains —
    // the only EOS signal for asynchronous producers whose media arrives after
    // the stream controller's terminal-range read. From the next series branch
    // the conversion-completion path covers this and the field goes away; the
    // pipe's EOS deferral makes the re-request idempotent.
    this.#pipe.append(unit.bytes);
    if (unit.terminal === true) this.#pipe.requestEndOfStream();
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
}

/**
 * Worker-mode MSE `sinkFactory` seam: builds one fresh `AppendSink` per call —
 * a `MseAdapter` over a fresh `MseAppendPipe` for the worker MediaSource — so
 * every load owns its own append queue/load generation while sharing the live
 * worker MSE
 * state behind the injected getters. This is the production composition-root
 * binding the coordinator's `sinkFactory` seam defers to.
 */
export function createWorkerMseSinkFactory(deps: WorkerMseSinkFactoryDeps): () => AppendSink {
  return () =>
    new MseAdapter({
      pipe: new MseAppendPipe({
        backBufferSeconds: deps.backBufferSeconds,
        getMediaSource: () => deps.getMediaSource(),
        getPlayheadSeconds: () => deps.getPlayheadSeconds(),
        getSourceBuffer: () => deps.getSourceBuffer(),
        onError: (error) => deps.onError(error),
      }),
    });
}
