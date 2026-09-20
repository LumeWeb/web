/**
 * MSE `AppendSink` adapter: a thin, role-agnostic façade over the existing
 * `MseAppendPipe`, whose SPF-backed append/evict/EOS internals are
 * deliberately unchanged. The controller gets
 * one `AppendSink` surface whether MSE runs in the worker (the pipe the
 * worker already builds) or on the main thread (the pipe `SiaVideoSource`
 * builds), so container-specific append branches never need to live in the
 * controller.
 *
 * The adapter adds only the contract's epoch scoping on top of the pipe:
 * epoch-tagged `resetParser`/`requestEndOfStream` calls from a superseded
 * load are dropped before they touch the pipe, so one load's teardown can
 * never reset or end the next source's SourceBuffer. `append` is epoch-free
 * per the contract — stale ordering is already dropped by the epoch-aware
 * producer that fed the bytes and by the pipe's own reset.
 */
import type { ProducedSegment } from '../container/producer/appendable-producer.ts';
import { MseAppendPipe } from '../mse-pipe.ts';
import type { AppendSink } from './append-sink.ts';

export interface MseAdapterOptions {
  /**
   * The load epoch the controller starts from. Later `resetParser(epoch)`
   * calls raise it; stale (older) epoch-tagged calls are ignored.
   */
  initialEpoch?: number;
  /** The composition root's existing `MseAppendPipe` for this MediaSource. */
  pipe: MseAppendPipe;
}

/**
 * Live worker MediaSource state the worker-mode sink factory binds one
 * per-load `MseAppendPipe` to, mirroring the pipe the worker already builds.
 * The getters read the worker's live state so the pipe serializes appends
 * into whatever SourceBuffer the (possibly still-opening) MediaSource yields,
 * and `onError` reports fatal append failures onto the load's request id the
 * same way the inline queue used to.
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
  #epoch: number;
  readonly #pipe: MseAppendPipe;

  constructor(options: MseAdapterOptions) {
    this.#epoch = options.initialEpoch ?? 0;
    this.#pipe = options.pipe;
  }

  abort(_reason?: unknown): void {
    // The pipe's own epoch/teardown state dominates; `reason` is informational
    // at the seam (the pipe stops permanently regardless).
    this.#pipe.abort();
  }

  append(segment: ProducedSegment): void {
    this.#pipe.append(segment.bytes);
    // A producer-declared terminal media segment means "this is the last
    // fragment — end the stream once it drains". This is the only EOS path for
    // producers that emit asynchronously (the mediabunny refragmenter), whose
    // media can arrive after the stream controller's terminal-range read. The
    // pipe's EOS deferral already waits for the append queue to drain and the
    // MediaSource to be open, so re-requesting here is idempotent with a
    // controller-side request for synchronous producers.
    if (segment.terminal === true) this.#pipe.requestEndOfStream();
  }

  async evictBackBuffer(_playheadSeconds: number): Promise<boolean> {
    // The pipe derives the eviction boundary from its own playhead provider;
    // the argument exists for contract uniformity across future sinks.
    return this.#pipe.evictBackBuffer();
  }

  requestEndOfStream(epoch: number): void {
    if (epoch < this.#epoch) return;
    this.#pipe.requestEndOfStream();
  }

  resetParser(epoch: number): void {
    if (epoch < this.#epoch) return;
    this.#epoch = Math.max(this.#epoch, epoch);
    this.#pipe.reset();
  }
}

/**
 * Worker-mode MSE `sinkFactory` seam: builds one fresh `AppendSink` per call —
 * a `MseAdapter` over a fresh `MseAppendPipe` for the worker MediaSource — so
 * every load owns its own append queue/epoch while sharing the live worker MSE
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
