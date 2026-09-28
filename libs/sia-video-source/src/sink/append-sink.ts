/**
 * Append-sink contract: the MSE append/evict/EOS operations the stream
 * controller calls, regardless of whether MSE lives in the worker or on the
 * main thread.
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
   * boundary from its playhead provider, so this argument does not set it.
   */
  evictBackBuffer(playheadSeconds: number): Promise<boolean>;
  /**
   * Requests `endOfStream()` once queued appends drain. Stale load
   * generations are ignored (a failed/superseded pipeline must never end the
   * wrong source).
   */
  requestEndOfStream(loadGeneration: number): void;
  /**
   * Drops queued appends belonging to a superseded position and sets up a
   * SourceBuffer parser reset for when it next quiesces (seek), applying
   * `targetTimeSeconds` as the buffer's new timestamp offset when a target is
   * given. Stale load generations are ignored.
   */
  resetParser(loadGeneration: number, targetTimeSeconds?: number): void;
  /**
   * The primary producer backpressure wait: resolves once the real SourceBuffer
   * holds less than the sink's `aheadTargetSeconds` of playable media ahead of
   * the live playhead (`buffered.end(last) - playhead < target`), or
   * immediately when no ahead target is configured, no SourceBuffer / buffered
   * range exists yet, or the sink is a passthrough. The media library awaits
   * this before pulling its next read window, so the worker stops downloading
   * and remuxing once the browser-side buffer is ahead enough, and resumes
   * when playback advances, the buffer is trimmed, or the pipeline changes
   * state. The worker-mode MSE adapter implements it by forwarding to the
   * append pipe; a sink without it leaves the producer unbounded here (the
   * caller must never assume it exists). It must always settle, including on
   * a torn-down (aborted) sink, which releases its waiters.
   */
  waitForBufferedAhead?(): Promise<void>;
  /**
   * The secondary producer backpressure wait: resolves once the sink has room
   * another append unit, its queued + in-flight payload dropped below its
   * capacity bound, or immediately when the sink has no bound (or is a
   * passthrough). The media library awaits this before pulling its next read
   * window; it bounds the transient remux backlog while the SourceBuffer is
   * slow to absorb, not the buffered duration. The worker-mode MSE adapter
   * implements it by forwarding to the append pipe; a sink without it leaves
   * the producer unbounded here (the caller must never assume it exists). It
   * must always settle, including on a torn-down (aborted) sink, which
   * releases its waiters.
   */
  waitForCapacity?(): Promise<void>;
}

/** One byte unit appended to a SourceBuffer: init before any media, then media. */
export interface AppendUnit {
  readonly bytes: Uint8Array;
  readonly kind: AppendKind;
}
