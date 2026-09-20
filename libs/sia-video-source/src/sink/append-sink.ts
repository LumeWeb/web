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

import type { ProducedSegment } from '../container/producer/appendable-producer.ts';

/**
 * One MSE append surface. Epoch-tagged calls (`resetParser`,
 * `requestEndOfStream`) must be ignored when the epoch is older than the
 * sink's current one, so a superseded load can never reset or end the next
 * load's SourceBuffer.
 */
export interface AppendSink {
  /** Permanently stops the sink (pipeline teardown / source replacement). */
  abort(reason?: unknown): void;
  /** Queues one produced segment (init or media) for the SourceBuffer. */
  append(segment: ProducedSegment): void;
  /**
   * Trims the back-buffer behind `playheadSeconds`. Resolves `true` when
   * media was actually removed. The concrete MSE adapter derives the exact
   * boundary from its playhead provider, so this argument is informational at
   * the seam.
   */
  evictBackBuffer(playheadSeconds: number): Promise<boolean>;
  /**
   * Requests `endOfStream()` once queued appends drain. Stale epochs are
   * ignored (a failed/superseded pipeline must never end the wrong source).
   */
  requestEndOfStream(epoch: number): void;
  /**
   * Drops queued appends belonging to a superseded position and arms a
   * SourceBuffer parser reset for when it next quiesces (seek). Stale epochs
   * are ignored.
   */
  resetParser(epoch: number): void;
}
