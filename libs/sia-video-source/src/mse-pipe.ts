/**
 * Shared MSE append pipe.
 *
 * One instance serializes every SourceBuffer mutation for a MediaSource
 * pipeline through the public `@videojs/spf/dom` primitives (`appendSegment`
 * to hand it bytes one `updateend`-quiesced append at a time, `flushBuffer`
 * to trim the back-buffer). It owns the bookkeeping that used to be
 * duplicated between the worker-side MSE pipeline (mode 'worker') and the
 * main-thread MSE fallback (`SiaVideoSource`, mode 'main'):
 *
 * - append-queue FIFO serialization (one append in flight, driven by the
 *   SourceBuffer's async `updateend` / `error` contract),
 * - back-buffer eviction behind the playhead (`backBufferSeconds`), retried
 *   after a `QuotaExceededError` so the failing head is re-appended once
 *   memory is freed,
 * - stale-epoch cancellation (`reset()`): appends queued for a superseded
 *   load die with their epoch so a torn-down pipeline can never append into
 *   the next source's buffer,
 * - fatal-error suppression (`abort()` / one-shot `onError`): a SourceBuffer
 *   `error` event or a synchronous non-quota throw is reported exactly once
 *   and every later append is dropped,
 * - end-of-stream deferral (`requestEndOfStream()`): `MediaSource.endOfStream`
 *   fires only after the queue drains, the SourceBuffer quiesces, and the
 *   source is still `open` — never on a failed pipeline.
 *
 * Sia-specific layers (WASM transport, app-key handshake, sidx indexing,
 * remux) live outside this module; the worker and host feed it plain bytes
 * and read fatal failures from `onError`, mapping them onto their own
 * `ERROR` messaging.
 */
import { appendSegment, flushBuffer } from '@videojs/spf/dom';

export interface MseAppendPipeOptions {
  /** Seconds of media to keep buffered behind the playhead before eviction. */
  backBufferSeconds: number;
  /** The MediaSource the appended SourceBuffer belongs to (for EOS deferral). */
  getMediaSource(): MediaSource | null;
  /** Current playhead time in seconds; the eviction boundary is derived from it. */
  getPlayheadSeconds(): number;
  /**
   * The SourceBuffer to append into / evict from. May be `null` until the
   * pipeline is created; queued appends wait for it to appear.
   */
  getSourceBuffer(): null | SourceBuffer;
  /**
   * Fatal append failure. Invoked at most once per pipe lifetime (a SourceBuffer
   * `error` event or a synchronous non-quota append throw). After it fires,
   * further appends and end-of-stream are suppressed.
   */
  onError(error: unknown): void;
}

export class MseAppendPipe {
  #eosRequested = false;
  // Monotonic load epoch; `reset()`/`abort()` bump it so an in-flight pump
  // abandons work that a superseded load queued.
  #epoch = 0;
  #errorReported = false;
  // Single-flight eviction so rapid playhead updates coalesce onto one removal.
  #evicting: null | Promise<boolean> = null;
  #failed = false;
  #kickQueued = false;
  readonly #options: MseAppendPipeOptions;
  // Armed by `reset()` (a seek superseding an in-flight position): once the
  // SourceBuffer quiesces, its segment parser is aborted so the next append
  // starts a fresh fragment instead of continuing the truncated one that the
  // seek cut off (Chromium's RunSegmentParserLoop append failure).
  #parserResetPending = false;
  #pumping = false;
  #queue: Uint8Array[] = [];
  // Permanent stop (`abort()`), used on teardown: nothing further appends or ends.
  #stopped = false;

  constructor(options: MseAppendPipeOptions) {
    this.#options = options;
  }

  /**
   * Permanently stops the pipe (pipeline teardown). Nothing further appends,
   * evicts, or ends; the owner is discarding the whole MediaSource.
   */
  abort(): void {
    this.#stopped = true;
    this.#epoch += 1;
    this.#queue.length = 0;
    this.#eosRequested = false;
  }

  /** Queues bytes for the SourceBuffer; the pump drains it in FIFO order. */
  append(bytes: Uint8Array): void {
    if (this.#stopped || this.#failed) return;
    this.#queue.push(bytes);
    this.#kick();
  }

  /**
   * Removes the back-buffer (behind-the-playhead) range from the SourceBuffer
   * via the public `flushBuffer` primitive. Fire-and-forget safe: overlapping
   * callers share one in-flight removal and await its outcome together.
   * Resolves `true` when media was actually removed, `false` when there was
   * nothing to trim (or the pipeline is not yet present).
   */
  evictBackBuffer(): Promise<boolean> {
    if (this.#evicting) return this.#evicting;
    const run = this.#doEvict();
    this.#evicting = run.finally(() => {
      this.#evicting = null;
    });
    return this.#evicting;
  }

  /**
   * Re-runs the pump. Call when external state the option getters observe
   * changes without a new append — most importantly when the SourceBuffer
   * comes into existence after bytes were already queued.
   */
  kick(): void {
    this.#kick();
  }

  /**
   * Requests `MediaSource.endOfStream()` once the append queue has drained and
   * the SourceBuffer has quiesced. Refused (and retried at the next pump) for a
   * source that is not `open`, and silently dropped on a failed pipeline.
   */
  requestEndOfStream(): void {
    if (this.#stopped || this.#failed) return;
    this.#eosRequested = true;
    this.#kick();
  }

  /**
   * Drops state belonging to a superseded position (a seek, or the end of a
   * load). Queued appends and a parked end-of-stream die with the old epoch,
   * and once the in-flight append quiesces the SourceBuffer's segment parser
   * is reset (`abort`) so the next queued fragment parses fresh — a fragment
   * whose head the seek cut off mid-`mdat` would otherwise swallow the new
   * position's `moof` and fail Chromium's segment parser loop. The pipe stays
   * live for the same MediaSource / SourceBuffer; `abort()` is for teardown.
   */
  reset(): void {
    this.#epoch += 1;
    this.#queue.length = 0;
    this.#eosRequested = false;
    this.#parserResetPending = true;
    this.#kick();
  }

  // Resets the SourceBuffer's segment parser so the next appendBuffer begins
  // a fresh segment. Best-effort: a SourceBuffer mid-update, or a MediaSource
  // that left 'open', refuses abort() — the queued bytes are still dropped,
  // and the next append simply proceeds.
  #abortParser(sourceBuffer: SourceBuffer): void {
    try {
      sourceBuffer.abort();
    } catch {
      // Best-effort parser reset; nothing further to recover.
    }
  }

  async #doEvict(): Promise<boolean> {
    const sourceBuffer = this.#options.getSourceBuffer();
    if (!sourceBuffer || sourceBuffer.updating) return false;
    const ranges = sourceBuffer.buffered;
    if (ranges.length === 0) return false;
    const targetEnd = this.#options.getPlayheadSeconds() - this.#options.backBufferSeconds;
    for (let index = 0; index < ranges.length; index++) {
      const start = ranges.start(index);
      const end = Math.min(ranges.end(index), targetEnd);
      if (end <= start) continue;
      try {
        await flushBuffer(sourceBuffer, start, end);
      } catch {
        // SourceBuffer state can change between the range read and the remove;
        // eviction is a best-effort trim and must never fail the pipeline.
      }
      return true;
    }
    return false;
  }

  #fail(error: unknown): void {
    if (this.#errorReported || this.#stopped || this.#failed) return;
    this.#errorReported = true;
    this.#failed = true;
    this.#queue.length = 0;
    this.#eosRequested = false;
    this.#options.onError(error);
  }

  #kick(): void {
    // Defer so multiple synchronous kicks coalesce into one pump run and so a
    // caller can never observe a synchronous side effect — in particular an
    // endOfStream fired from inside requestEndOfStream.
    queueMicrotask(() => {
      void this.#pump();
    });
  }

  #maybeEndOfStream(): void {
    if (!this.#eosRequested || this.#stopped || this.#failed) return;
    const mediaSource = this.#options.getMediaSource();
    const sourceBuffer = this.#options.getSourceBuffer();
    if (!mediaSource || !sourceBuffer || sourceBuffer.updating) return;
    if (mediaSource.readyState !== 'open') return;
    try {
      mediaSource.endOfStream();
    } catch {
      // endOfStream requires readyState 'open' and no in-flight updates; the
      // guards above own both, so a racing platform rejection is a no-op here.
    }
    this.#eosRequested = false;
  }

  async #pump(): Promise<void> {
    if (this.#pumping) {
      this.#kickQueued = true;
      return;
    }
    this.#pumping = true;
    try {
      while (!this.#stopped && !this.#failed) {
        const epoch = this.#epoch;
        const sourceBuffer = this.#options.getSourceBuffer();
        // No SourceBuffer yet: park until the owner creates one and kicks.
        if (!sourceBuffer) return;
        // A seek asked for a parser reset but the SourceBuffer is still
        // updating — e.g. the back-buffer eviction the seek started, or the
        // superseded position's tail still quiescing. NEVER append across this
        // window: dequeuing the fresh fragment now would let the deferred
        // parser reset land AFTER its `moof`, and Chromium then parses the
        // following `mdat` continuation without the fragment's context —
        // PipelineStatus::CHUNK_DEMUXER_ERROR_APPEND_FAILED, surfaced as
        // `SourceBuffer append error` on the live far seek. Park until the
        // update settles, then the reset below runs before anything is dequeued.
        if (this.#parserResetPending && sourceBuffer.updating) {
          await waitForUpdateEnd(sourceBuffer);
          continue;
        }
        // A seek asked for a parser reset; do it as soon as the buffer
        // quiesces, even if nothing new is queued yet, so the next fragment
        // parses fresh rather than continuing the superseded position.
        if (this.#parserResetPending && !sourceBuffer.updating) {
          this.#parserResetPending = false;
          this.#abortParser(sourceBuffer);
          continue;
        }
        if (this.#queue.length === 0) break;

        const head = this.#queue[0];
        // Hand SPF a standalone buffer: stream chunks are views into the Sia
        // SDK's reusable download buffers, which the reader can rewrite while
        // this head waits behind earlier appends. The copy detaches the append
        // from that backing memory for its whole (async) lifetime.
        const bytes = head.slice();
        try {
          await appendSegment(sourceBuffer, bytes.buffer);
        } catch (error) {
          if (this.#stopped || this.#epoch !== epoch) return;
          if (isQuotaExceeded(error)) {
            // Free the back-buffer window, then retry the SAME head (it was
            // never dequeued). If nothing could be freed the pipeline cannot
            // recover — report once and stop instead of looping forever.
            const evicted = await this.evictBackBuffer();
            if (this.#stopped || this.#epoch !== epoch) return;
            if (!evicted) {
              this.#fail(error);
              return;
            }
            continue;
          }
          this.#fail(error);
          return;
        }
        // The in-flight append was the superseded position's: once it settles
        // the parser is reset so the next append (a fresh fragment) starts
        // clean instead of continuing the truncated one.
        if (this.#parserResetPending && !sourceBuffer.updating) {
          this.#parserResetPending = false;
          this.#abortParser(sourceBuffer);
        }
        if (this.#stopped || this.#epoch !== epoch) return;
        this.#queue.shift();
      }
      this.#maybeEndOfStream();
    } finally {
      this.#pumping = false;
      if (this.#kickQueued) {
        this.#kickQueued = false;
        void this.#pump();
      }
    }
  }
}

function isQuotaExceeded(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'QuotaExceededError';
}

/**
 * Resolves once the SourceBuffer's in-flight update quiesces (`updateend`, or
 * `error` — either way `updating` is false again). Mirrors SPF's own
 * one-shot `updateend` wait used inside `appendSegment`, so an owed parser
 * reset can park the pump for exactly as long as the platform update lasts.
 */
function waitForUpdateEnd(sourceBuffer: SourceBuffer): Promise<void> {
  return new Promise((resolve) => {
    const onDone = (): void => {
      sourceBuffer.removeEventListener('updateend', onDone);
      sourceBuffer.removeEventListener('error', onDone);
      resolve();
    };
    sourceBuffer.addEventListener('updateend', onDone);
    sourceBuffer.addEventListener('error', onDone);
  });
}
