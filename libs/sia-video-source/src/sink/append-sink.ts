/**
 * Append-sink contract: the MSE append/evict/EOS surface the stream
 * controller talks to, regardless of whether MSE lives in the worker or on
 * the main thread.
 *
 * `MseAppendPipe` *is* this contract today; `MseAdapter` (see `mse-adapter.ts`)
 * is the thin façade that hands the controller one `AppendSink` for either
 * role without replacing the pipe's tested SPF-backed internals.
 *
 * Sink/import rules still apply: `sink/*` must not import the Sia SDK; it
 * receives appendable bytes + MIME only.
 */

/** Whether an append unit initializes a SourceBuffer or carries media. */
export type AppendKind = 'init' | 'media';

/**
 * One MSE append surface. Load-generation-tagged calls (`resetParser`,
 * `requestEndOfStream`) must be ignored when the load generation is older
 * than the sink's current one, so a superseded load can never reset or end
 * the next load's SourceBuffer.
 */
export interface AppendSink {
  /** Permanently stops the sink (pipeline teardown / source replacement). */
  abort(reason?: unknown): void;
  /** Queues one append unit (init or media) for the SourceBuffer. */
  append(unit: AppendUnit): void;
  /**
   * Trims the back-buffer behind `playheadSeconds`. Resolves `true` when
   * media was actually removed. The concrete MSE adapter derives the exact
   * boundary from its playhead provider, so this argument is informational at
   * the seam.
   */
  evictBackBuffer(playheadSeconds: number): Promise<boolean>;
  /**
   * Requests `endOfStream()` once queued appends drain. Stale load
   * generations are ignored (a failed/superseded pipeline must never end the
   * wrong source).
   */
  requestEndOfStream(loadGeneration: number): void;
  /**
   * Drops queued appends belonging to a superseded position and arms a
   * SourceBuffer parser reset for when it next quiesces (seek), re-anchoring
   * the buffer at `targetTimeSeconds` when a re-anchor target is given. Stale
   * load generations are ignored.
   */
  resetParser(loadGeneration: number, targetTimeSeconds?: number): void;
}

/** One byte unit appended to a SourceBuffer: init before any media, then media. */
export interface AppendUnit {
  readonly bytes: Uint8Array;
  readonly kind: AppendKind;
  /**
   * When `true`, this is the producer's final unit: the sink should request
   * end-of-stream once the queue drains. Asynchronous producers (the
   * refragmenter) whose media arrives after the stream controller's
   * terminal-range read announce their last fragment this way. Optional;
   * conversion-completion wiring on a later branch supersedes it and the
   * field goes away.
   */
  readonly terminal?: boolean;
}
