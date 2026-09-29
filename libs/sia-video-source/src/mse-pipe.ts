/**
 * Shared MSE append pipe.
 *
 * One instance serializes every SourceBuffer mutation for a MediaSource
 * pipeline through the public `@videojs/spf/dom` primitives (`appendSegment`
 * to hand it bytes one `updateend`-quiesced append at a time, `flushBuffer`
 * to trim the back-buffer). It keeps the bookkeeping shared by the worker-side
 * MSE pipeline (mode 'worker') and the main-thread MSE fallback
 * (`SiaVideoSource`, mode 'main'):
 *
 * - append-queue FIFO serialization (one append in flight, driven by the
 *   SourceBuffer's async `updateend` / `error` contract),
 * - back-buffer eviction behind the playhead (`backBufferSeconds`), retried
 *   after a `QuotaExceededError` so the failing head is re-appended once
 *   memory is freed; a transient quota (an in-flight update still settling,
 *   or no immediately evictable range) is waited out across a bounded number
 *   of re-checks before it is reported as the `quota` class rather than the
 *   generic `append`/decode class,
 * - stale-load-generation cancellation (`reset()`): appends queued for a
 *   superseded load die with their load generation, so a torn-down pipeline
 *   can never append into the next source's buffer,
 * - fatal-error suppression (`abort()` / one-shot `onError`): a SourceBuffer
 *   `error` event or a synchronous non-quota throw is reported exactly once
 *   and every later append is dropped,
 * - end-of-stream deferral (`requestEndOfStream()`): `MediaSource.endOfStream`
 *   fires only after the queue drains, the SourceBuffer quiesces, and the
 *   source is still `open`, and never on a failed pipeline,
 * - buffered-ahead backpressure (`aheadTargetSeconds` +
 *   `waitForBufferedAhead()`): the primary quota protection. The pipe parks
 *   the media library's reads on the buffered window covering the playhead.
 *   Once the playable media ahead
 *   of the live playhead reaches the target, the reads park (the worker stops
 *   downloading / remuxing) and resume when playback advances, the buffer is
 *   trimmed, or the pipeline changes state. This is what actually bounds the
 *   browser quota: unlike a queue-byte cap, it holds even when the
 *   SourceBuffer absorbs appends instantly while the playhead stays put,
 * - transient-backlog backpressure (`capacityBytes` + `waitForCapacity()`):
 *   the secondary bound. The pipe also counts queued + in-flight append bytes
 *   so the producer parks while the SourceBuffer is slow to absorb (the pipe
 *   never piles a huge remux backlog ahead of what has actually landed);
 *   alone it cannot protect the quota under fast-append, which is the
 *   buffered-ahead wait's job.
 *
 * Sia-specific layers (WASM transport, app-key handshake, mediabunny remux)
 * live outside this module; the worker and host feed it plain bytes and read
 * fatal failures from `onError`, mapping them onto their own `ERROR`
 * messaging.
 */
import { workerLogEventName } from './protocol.ts';
import { appendSegment, flushBuffer } from '@videojs/spf/dom';

export interface MseAppendPipeOptions {
  /**
   * The primary quota-protection target: how many seconds of playable media
   * the real SourceBuffer may hold ahead of the live playhead before
   * `waitForBufferedAhead()` parks the producer's reads. The pipe measures
   * only the buffered window covering the playhead. Undefined (the default)
   * leaves the wait open. Absent or empty TimeRanges also leave it open, so an
   * initial or oversized segment is never deadlocked. Nonpositive or nonfinite
   * values disable this wait.
   */
  aheadTargetSeconds?: number;
  /** Seconds of media to keep buffered behind the playhead before eviction. */
  backBufferSeconds: number;
  /**
   * The secondary transient-backlog bound in bytes: the maximum queued +
   * in-flight append payload `waitForCapacity()` lets a producer accept before
   * it blocks. It limits how large a remux backlog can pile up while the
   * SourceBuffer is slow to absorb, but it does not bound the buffered-ahead
   * duration: a fast absorbing SourceBuffer never fills it, and that is
   * exactly what `aheadTargetSeconds` covers. Undefined (the default) keeps
   * the pipe unbounded, `waitForCapacity()` never blocks, and callers that do
   * not opt in see zero behavior change. A single unit larger than the bound
   * is still appended (it drains and then re-opens the wait), so the bound
   * never deadlocks the producer. Nonpositive or nonfinite values disable this
   * wait.
   */
  capacityBytes?: number;
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
   * Optional MSE-pipe diagnostics hook: receives best-effort facts the pipe
   * neither acts on nor reports through `onError` — the evicted back-buffer
   * span (`mse.evict`, `{ start, end, seconds }` where `start`/`end` are
   * TimeRanges seconds and `seconds` is the flushed span length in seconds), a
   * failed eviction trim (`mse.evict-failed`, `{ message }`), a failed parser
   * reset / timestamp rebase (`mse.parser-reset-failed`), and a failed
   * deferred end-of-stream (`mse.eos-failed`, both `{ message }`). Only scalar
   * detail is passed, never bytes or object references, and a throwing
   * listener is swallowed so a diagnostic hook can never change pipe behavior
   * (every error it reports was already being swallowed). No requestId is
   * available inside the pipe; the owner binds one if it can. Undefined (the
   * default) is a single optional-call check and zero behavior change.
   */
  onDiag?(name: string, detail: Readonly<Record<string, unknown>>): void;
  /**
   * Fatal append failure. Invoked at most once per pipe lifetime (a SourceBuffer
   * `error` event, a synchronous non-quota append throw, or a quota failure the
   * bounded eviction retries could not recover). After it fires, further
   * appends and end-of-stream are suppressed. The second argument classifies the
   * failure so the owner can thread a meaningful MSE failure kind to its host:
   * `mseAppendFailureKind.quota` for an exhausted `QuotaExceededError`,
   * `mseAppendFailureKind.append` for every other fatal append failure.
   */
  onError(error: unknown, kind: MseAppendFailureKind): void;
}

/** The MSE append failure classes the pipe can distinguish (see `onError`). */
export const mseAppendFailureKind = {
  /** Any fatal append/`error`-event failure that is not a quota refusal. */
  append: 'append',
  /** A `QuotaExceededError` the bounded eviction wait/retry could not recover. */
  quota: 'quota',
} as const;

/** A fatal MSE append failure class; see {@link mseAppendFailureKind}. */
export type MseAppendFailureKind = (typeof mseAppendFailureKind)[keyof typeof mseAppendFailureKind];

// Bounded quota-recovery budget: after a `QuotaExceededError`, the pipe waits
// for an in-flight SourceBuffer update to settle and re-checks the back-buffer
// for an evictable range up to this many times (with a short turn between
// checks) before treating the quota as persistent and escalating through
// `onError`. The retries give a transient quota (nothing evictable yet, or the
// browser freeing memory asynchronously) a chance to clear without collapsing
// into a fatal decode failure; the bound keeps a genuinely exhausted buffer
// from spinning forever.
export const MAX_QUOTA_RECOVERY_ATTEMPTS = 2;
export const QUOTA_RETRY_WAIT_MS = 50;

/**
 * Default secondary transient-backlog bound (`capacityBytes`) the worker-mode
 * MSE composition roots commit to: the maximum queued + in-flight CMAF append
 * bytes the media library may hand the sink before `waitForCapacity()` parks
 * its reads. Sized to mediabunny's `network` prefetch cap (its sequential
 * extension grows to at most 8 MiB per read worker), so the wait re-opens as
 * each window drains without stalling the pipeline, and the worker can never
 * remux more than one window of media ahead of what the SourceBuffer has
 * absorbed. The buffered-ahead duration target
 * (`DEFAULT_MSE_AHEAD_TARGET_SECONDS`) is the primary quota protection; a
 * per-load override still wins.
 */
export const DEFAULT_MSE_APPEND_CAPACITY_BYTES = 8 * 1024 * 1024;

/**
 * Default buffered-ahead target (`aheadTargetSeconds`) the worker-mode MSE
 * composition roots commit to: how many seconds of playable media the real
 * SourceBuffer may hold ahead of the playhead before the media library's reads
 * park. Symmetric with the 30-second back-buffer, so a normal player's
 * steady-state buffer stays on the order of a minute of playback instead of
 * the worker converting an entire object while the playhead is seconds in,
 * the pattern that exhausts the browser's SourceBuffer quota. A per-load
 * override still wins; a direct `MseAppendPipe` without `aheadTargetSeconds`
 * leaves the wait open (opt-in).
 */
export const DEFAULT_MSE_AHEAD_TARGET_SECONDS = 30;

export class MseAppendPipe {
  /**
   * Bytes the source-side producer has handed the sink but the SourceBuffer
   * has not absorbed yet: every queued append unit plus the in-flight head
   * retained in the queue while its async append settles (exactly what the
   * `capacityBytes` bound measures). Reads 0 only at rest.
   */
  get pendingBytes(): number {
    return this.#pendingBytes;
  }

  // The primary quota target: how many seconds of playable media the real
  // SourceBuffer may hold ahead of the playhead before `waitForBufferedAhead()`
  // parks the producer's reads. See `DEFAULT_MSE_AHEAD_TARGET_SECONDS`.
  readonly #aheadTargetSeconds: number | undefined;
  // Producers parked on `waitForBufferedAhead()`; `#evaluateBufferedAhead()`
  // resolves them FIFO when the real buffered-ahead drops below the target
  // (playhead advance / buffer trim), or the pipe stops.
  #aheadWaiters: (() => void)[] = [];
  readonly #capacityBytes: number | undefined;
  // Producers parked on `waitForCapacity()`; `#drainCapacity()` resolves them
  // FIFO when pending drops below the bound (or the pipe stops).
  #capacityWaiters: (() => void)[] = [];
  #eosRequested = false;
  #errorReported = false;
  // Single-flight eviction so rapid playhead updates coalesce onto one removal.
  #evicting: null | Promise<boolean> = null;
  #failed = false;
  #kickQueued = false;
  // Monotonic load generation; `reset()`/`abort()` bump it so an in-flight pump
  // abandons work that a superseded load queued.
  #loadGeneration = 0;
  readonly #options: MseAppendPipeOptions;
  // Set by `reset()` (a seek superseding an in-flight position): once the
  // SourceBuffer quiesces, its segment parser is aborted so the next append
  // starts a fresh fragment instead of continuing the truncated one that the
  // seek cut off (Chromium's RunSegmentParserLoop append failure).
  #parserResetPending = false;
  // Sum of the byteLength of every queued append unit, including the in-flight
  // head retained in the queue while its async append settles. This is exactly
  // the "queued/pending" payload the source-side producer has handed the sink
  // but the SourceBuffer has not absorbed yet.
  #pendingBytes = 0;
  // Timestamp a seek's `reset(target)` holds until the owed parser reset runs:
  // the trimmed conversion rebases its output timestamps to zero, so the
  // buffer must be told the sought position (`timestampOffset`) before its
  // fresh init/media lands. Null when no seek target is owed.
  #pendingTargetOffset: null | number = null;
  #pumping = false;
  #queue: Uint8Array[] = [];
  // Permanent stop (`abort()`), used on teardown: nothing further appends or ends.
  #stopped = false;

  constructor(options: MseAppendPipeOptions) {
    this.#aheadTargetSeconds = normalizeBound(options.aheadTargetSeconds);
    this.#capacityBytes = normalizeBound(options.capacityBytes);
    this.#options = options;
  }

  /**
   * Permanently stops the pipe (pipeline teardown). Nothing further appends,
   * evicts, or ends; the owner is discarding the whole MediaSource. Waiters
   * parked on `waitForCapacity()` are released (a torn-down sink has no
   * capacity to offer, and a teardown must never hang a producer).
   */
  abort(): void {
    this.#stopped = true;
    this.#loadGeneration += 1;
    this.#queue.length = 0;
    this.#pendingBytes = 0;
    this.#eosRequested = false;
    this.#drainCapacity();
    this.#releaseAheadWaiters();
  }

  /**
   * Queues bytes for the SourceBuffer; the pump drains it in FIFO order. The
   * unit is counted against `capacityBytes` whether it is queued or, once the
   * pump starts it, retained as the in-flight head, so a producer parked on
   * `waitForCapacity()` sees the whole backlog it has handed to the sink. A
   * unit larger than the bound is still accepted; it re-opens the wait once
   * it drains, so the bound can never drop or deadlock a real segment.
   */
  append(bytes: Uint8Array): void {
    if (this.#stopped || this.#failed) return;
    this.#queue.push(bytes);
    this.#pendingBytes += bytes.byteLength;
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
   * load). Queued appends and a pending end-of-stream die with the old load
   * generation, and once the in-flight append quiesces the SourceBuffer's
   * segment parser is reset (`abort`) so the next queued fragment parses
   * fresh — a fragment whose head the seek cut off mid-`mdat` would otherwise
   * swallow the new position's `moof` and fail Chromium's segment parser
   * loop. When a seek target is given, the parser reset also sets the
   * SourceBuffer's `timestampOffset` to it so the trimmed conversion's
   * zero-based output lands at the sought position. The pipe stays live for
   * the same MediaSource / SourceBuffer; `abort()` is for teardown.
   */
  reset(targetTimeSeconds?: number): void {
    this.#loadGeneration += 1;
    this.#queue.length = 0;
    this.#pendingBytes = 0;
    this.#drainCapacity();
    // A seek / load start supersedes the buffered-ahead position: parked
    // producers from the old position must never wait on a buffer about to be
    // reset, so they are released now; the fresh run's reads park again on
    // the new position.
    this.#releaseAheadWaiters();
    this.#eosRequested = false;
    // Hold the seek target for the owed parser reset. Each reset stores its
    // own value, so a newer reset supersedes an older held target and a
    // target-less reset (a load start) holds none — the buffer's current
    // offset is left untouched until a seek target actually lands.
    this.#pendingTargetOffset = targetTimeSeconds ?? null;
    this.#parserResetPending = true;
    this.#kick();
  }

  /**
   * The primary producer backpressure wait: resolves once the buffered window
   * covering the playhead holds less than `aheadTargetSeconds` of playable
   * media ahead, or immediately when no ahead target is configured, no
   * buffered window covers the playhead, or the pipe stopped/failed. A
   * producer (the mediabunny conversion's reads) awaits this before pulling,
   * so the worker stops downloading / remuxing once the browser-side buffer
   * is ahead enough and resumes when playback advances, the buffer is
   * trimmed, or the pipeline changes state: `#kick()`, `abort()`, `reset()`,
   * and `#fail()` all re-evaluate or release waiters. Always settles.
   */
  waitForBufferedAhead(): Promise<void> {
    if (this.#stopped || this.#failed) return Promise.resolve();
    if (this.#aheadTargetSeconds === undefined) return Promise.resolve();
    const ahead = this.#bufferedAheadSeconds();
    if (ahead === null || ahead < this.#aheadTargetSeconds) return Promise.resolve();
    return new Promise((resolve) => {
      this.#aheadWaiters.push(resolve);
    });
  }

  /**
   * The secondary producer backpressure wait: resolves once queued +
   * in-flight append bytes drop below `capacityBytes` (room for the next
   * unit), or immediately when no capacity is configured. A producer (the
   * mediabunny conversion's reads) awaits this before pulling, so the
   * pipeline stops reading far ahead when the sink's backlog is full and
   * resumes when the pipe drains. Always settles: a stopped/failed pipe
   * releases every waiter, and a single oversized unit re-opens the wait
   * once it drains.
   */
  waitForCapacity(): Promise<void> {
    if (this.#stopped || this.#failed) return Promise.resolve();
    if (this.#capacityBytes === undefined || this.#pendingBytes < this.#capacityBytes) {
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      this.#capacityWaiters.push(() => {
        resolve();
      });
    });
  }

  // Resets the SourceBuffer's segment parser so the next appendBuffer begins
  // a fresh segment. Best-effort: a SourceBuffer mid-update, or a MediaSource
  // that left 'open', refuses abort() — the queued bytes are still dropped,
  // and the next append simply proceeds. The swallow is unchanged, but a
  // refused reset is now reported (`mse.parser-reset-failed`).
  #abortParser(sourceBuffer: SourceBuffer): void {
    try {
      sourceBuffer.abort();
    } catch (error) {
      // Best-effort parser reset; nothing further to recover. The queued bytes
      // are dropped regardless, so this must never fail the pipeline.
      this.#diag(workerLogEventName.mseParserResetFailed, { message: errorMessage(error) });
    }
  }

  // The parser reset a seek owes, plus its timestamp rebase: abort the
  // SourceBuffer FIRST (so the fresh fragment starts a clean segment), then,
  // when a seek target was held, set `timestampOffset` to it — all before
  // anything is dequeued. Both places a reset can complete (before a dequeue,
  // or behind a settling in-flight append) call this one helper so the order
  // can never drift. The timestamp assignment is best-effort like the parser
  // reset, and its refusal reports through the same parser-reset breadcrumb.
  #applyParserReset(sourceBuffer: SourceBuffer): void {
    this.#parserResetPending = false;
    this.#abortParser(sourceBuffer);
    const target = this.#pendingTargetOffset;
    this.#pendingTargetOffset = null;
    if (target !== null) {
      try {
        sourceBuffer.timestampOffset = target;
      } catch (error) {
        // Best-effort timestamp assignment; nothing further to recover, but
        // reported.
        this.#diag(workerLogEventName.mseParserResetFailed, { message: errorMessage(error) });
      }
    }
  }

  // Reads only the window covering the playhead. A stale range left after a
  // seek does not describe media available from the current position.
  #bufferedAheadSeconds(): null | number {
    const sourceBuffer = this.#options.getSourceBuffer();
    if (!sourceBuffer) return null;
    try {
      return bufferedAheadInContainingWindow(sourceBuffer.buffered, this.#options.getPlayheadSeconds());
    } catch {
      // A SourceBuffer whose buffered state cannot be read must never
      // deadlock the producer: report room and retry on the next check.
      return null;
    }
  }

  // One diagnostic line through the optional onDiag hook. Untrusted host code
  // may feed it to a logger; a throw is swallowed so it can never corrupt the
  // pipe's append/evict/EOS flow — the sole rule of this hook.
  #diag(name: string, detail: Readonly<Record<string, unknown>>): void {
    try {
      this.#options.onDiag?.(name, detail);
    } catch {
      // A throwing diagnostic hook must never affect pipe behavior.
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
        // A real trim reached flushBuffer: report the evicted span. The pipe
        // knows only TimeRanges, so `start`/`end` and the flushed span length
        // are ALL seconds — the field is named `seconds`, never a fabricated
        // byte count for what the browser discarded.
        this.#diag(workerLogEventName.mseEvict, { end, seconds: end - start, start });
        // A trim changed the buffered state: a parked buffered-ahead producer
        // may now have room again (the ahead extent shrank), so the
        // buffered-ahead check re-runs after the removal settles.
        this.#evaluateBufferedAhead();
      } catch (error) {
        // SourceBuffer state can change between the range read and the remove;
        // eviction is a best-effort trim and must never fail the pipeline.
        // The swallow is unchanged, but the failed trim is now reported.
        this.#diag(workerLogEventName.mseEvictFailed, { message: errorMessage(error) });
      }
      return true;
    }
    return false;
  }

  /**
   * Releases every producer parked on `waitForCapacity()` once the pipe has
   * room again: queued + in-flight dropped below the bound, or the pipeline
   * stopped/failed, in which case there is no capacity to wait for and a
   * teardown must never strand a reader. FIFO, so parked producers cannot
   * overtake each other.
   */
  #drainCapacity(): void {
    if (
      !this.#stopped &&
      !this.#failed &&
      this.#capacityBytes !== undefined &&
      this.#pendingBytes >= this.#capacityBytes
    ) {
      return;
    }
    const waiters = this.#capacityWaiters;
    this.#capacityWaiters = [];
    for (const resolve of waiters) resolve();
  }

  /**
   * Re-checks the buffered-ahead condition against the current real
   * SourceBuffer state and releases parked producers that now have room.
   * Called from `#kick()` (so a playhead update reflected by `setPlayhead`
   * into `pipe.kick()`, and any SourceBuffer `updateend`, re-runs the check),
   * after a back-buffer trim, and after each absorbed append. A missing window
   * covering the playhead releases the waiters.
   */
  #evaluateBufferedAhead(): void {
    if (this.#stopped || this.#failed || this.#aheadTargetSeconds === undefined) {
      this.#releaseAheadWaiters();
      return;
    }
    const ahead = this.#bufferedAheadSeconds();
    if (ahead === null || ahead < this.#aheadTargetSeconds) this.#releaseAheadWaiters();
  }

  #fail(error: unknown, kind: MseAppendFailureKind = mseAppendFailureKind.append): void {
    if (this.#errorReported || this.#stopped || this.#failed) return;
    this.#errorReported = true;
    this.#failed = true;
    this.#queue.length = 0;
    this.#pendingBytes = 0;
    this.#drainCapacity();
    // A fatal failure leaves no pipeline left to fill a buffer: every parked
    // buffered-ahead producer must be released so it can observe the failure,
    // never hang awaiting room on a dead sink.
    this.#releaseAheadWaiters();
    this.#eosRequested = false;
    this.#options.onError(error, kind);
  }

  #kick(): void {
    // Defer so multiple synchronous kicks coalesce into one pump run and so a
    // caller can never observe a synchronous side effect — in particular an
    // endOfStream fired from inside requestEndOfStream. The buffered-ahead
    // condition is re-checked on the same turn, so a playhead update
    // reflected by `setPlayhead` into `pipe.kick()` (or any SourceBuffer
    // `updateend`) releases a parked producer the moment its ahead window
    // shrinks.
    queueMicrotask(() => {
      this.#evaluateBufferedAhead();
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
    } catch (error) {
      // endOfStream requires readyState 'open' and no in-flight updates; the
      // guards above cover both, so a racing platform rejection is a no-op
      // here. The swallow is unchanged, but that rejected EOS is now reported.
      this.#diag(workerLogEventName.mseEosFailed, { message: errorMessage(error) });
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
        const loadGeneration = this.#loadGeneration;
        const sourceBuffer = this.#options.getSourceBuffer();
        // No SourceBuffer yet: wait until the owner creates one and kicks.
        if (!sourceBuffer) return;
        // A seek asked for a parser reset but the SourceBuffer is still
        // updating — e.g. the back-buffer eviction the seek started, or the
        // superseded position's tail still quiescing. Never append across this
        // window: dequeuing the fresh fragment now would let the deferred
        // parser reset land AFTER its `moof`, and Chromium then parses the
        // following `mdat` continuation without the fragment's context —
        // PipelineStatus::CHUNK_DEMUXER_ERROR_APPEND_FAILED, reported as
        // `SourceBuffer append error` on the live far seek. Wait for the
        // update to settle, then the reset below runs before anything is
        // dequeued.
        if (this.#parserResetPending && sourceBuffer.updating) {
          await waitForUpdateEnd(sourceBuffer);
          continue;
        }
        // A seek asked for a parser reset; do it as soon as the buffer
        // quiesces, even if nothing new is queued yet, so the next fragment
        // parses fresh rather than continuing the superseded position (and,
        // when a target was held, the buffer's `timestampOffset` is set to the
        // seek target).
        if (this.#parserResetPending && !sourceBuffer.updating) {
          this.#applyParserReset(sourceBuffer);
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
          if (this.#stopped || this.#loadGeneration !== loadGeneration) return;
          if (isQuotaExceeded(error)) {
            // Transient quota: wait for an in-flight update to settle and free
            // the back-buffer window across a bounded number of re-checks, then
            // retry the SAME head (it was never dequeued). Only once the
            // eviction retries are spent does the pipeline report the failure,
            // classified as the quota (transient) class so the host does not
            // mistake memory pressure for a real decode contract failure.
            const recovered = await this.#recoverQuota(sourceBuffer);
            if (this.#stopped || this.#loadGeneration !== loadGeneration) return;
            if (!recovered) {
              this.#fail(error, mseAppendFailureKind.quota);
              return;
            }
            continue;
          }
          this.#fail(error);
          return;
        }
        // The in-flight append was the superseded position's: once it settles
        // the parser is reset so the next append (a fresh fragment) starts
        // clean instead of continuing the truncated one — same helper as the
        // no-queue path, so the timestamp ordering cannot drift.
        if (this.#parserResetPending && !sourceBuffer.updating) {
          this.#applyParserReset(sourceBuffer);
        }
        if (this.#stopped || this.#loadGeneration !== loadGeneration) return;
        this.#queue.shift();
        // The drained unit is no longer pending: a producer parked on
        // `waitForCapacity()` may resume (an oversize head re-opens it too).
        this.#pendingBytes -= head.byteLength;
        this.#drainCapacity();
        // An absorbed append changed the real buffered state, so re-check the
        // buffered-ahead condition against the fresh ranges: a SourceBuffer
        // that just absorbed everything is now judgeable, and a directly
        // driven pipe (no root kicking on `updateend`) still gets the check.
        this.#evaluateBufferedAhead();
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

  /**
   * Tries to free memory for a `QuotaExceededError` without escalating. First
   * any in-flight SourceBuffer update is allowed to settle (a completing
   * remove/append can free memory, and eviction cannot run mid-update), then
   * the back-buffer is evicted. If nothing is immediately evictable (the
   * buffer is still updating, or the eviction boundary has not reached a range
   * yet), the pipe yields a short turn (letting the browser free memory or the
   * playhead advance, which moves the boundary) and re-checks, a bounded
   * number of times. Resolves `true` once an eviction freed a window (the
   * caller retries the same head), `false` once the bound is spent (the
   * caller escalates).
   */
  async #recoverQuota(sourceBuffer: SourceBuffer): Promise<boolean> {
    if (sourceBuffer.updating) await waitForUpdateEnd(sourceBuffer);
    for (let attempt = 0; attempt < MAX_QUOTA_RECOVERY_ATTEMPTS; attempt += 1) {
      if (await this.evictBackBuffer()) return true;
      // Nothing evictable yet: yield a turn, then give a settling in-flight
      // update its chance before the next eviction re-check.
      await sleep(QUOTA_RETRY_WAIT_MS);
      if (sourceBuffer.updating) await waitForUpdateEnd(sourceBuffer);
    }
    return false;
  }

  /**
   * Releases every producer parked on `waitForBufferedAhead()`: the pipe
   * stopped/failed, or a state change (reset/abort) superseded the buffered
   * position, in which case there is nothing worth waiting on and a teardown
   * must never strand a reader. FIFO, so parked producers cannot overtake
   * each other.
   */
  #releaseAheadWaiters(): void {
    const waiters = this.#aheadWaiters;
    this.#aheadWaiters = [];
    for (const resolve of waiters) resolve();
  }
}

// currentTime can fall just before a range start after an eviction or timestamp
// rebase. Keep that rounding error in the same playable window.
export const PLAYHEAD_WINDOW_TOLERANCE_SECONDS = 0.1;

/**
 * Returns playable seconds from the buffered window covering the playhead.
 * Disjoint future ranges cannot satisfy the producer's ahead target.
 */
export function bufferedAheadInContainingWindow(ranges: TimeRanges, playhead: number): null | number {
  for (let index = 0; index < ranges.length; index += 1) {
    const start = ranges.start(index);
    const end = ranges.end(index);
    if (playhead >= start - PLAYHEAD_WINDOW_TOLERANCE_SECONDS && playhead <= end) {
      return end - playhead;
    }
  }
  return null;
}

/** Scalar message of a caught best-effort failure (DOMException or Error alike). */
function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isQuotaExceeded(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'QuotaExceededError';
}

/** Keeps finite positive backpressure bounds; all other values disable the wait. */
function normalizeBound(value: number | undefined): number | undefined {
  return value !== undefined && Number.isFinite(value) && value > 0 ? value : undefined;
}

/** Short bounded yield for the quota-recovery retry loop. */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Resolves once the SourceBuffer's in-flight update quiesces (`updateend`, or
 * `error` — either way `updating` is false again). Uses the same one-shot
 * `updateend` wait SPF's `appendSegment` does, so an owed parser reset can
 * hold the pump for exactly as long as the platform update lasts.
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
