/**
 * Seek-aware read loop over the Sia SDK's ranged download API
 * (`Sdk.download(object, { offset, length })` → `ReadableStream`).
 *
 * A seek cancels the in-flight stream (the SDK aborts its WebTransport shard
 * recovery on drop) and starts a fresh download from the target byte offset;
 * a small LRU chunk cache re-serves recently delivered ranges so small
 * re-reads and short backward seeks never touch the network. The Sia SDK and
 * pinned-object handle are injected, which keeps this module testable and
 * lets the caller own SDK registration.
 */

import type { Slab } from '@siafoundation/sia-storage';
import { type RequestId, workerLogEventName } from './protocol.ts';

/** Whole-MiB granularity for `'bytes.read'` milestone boundaries (1048576 bytes). */
const MIB = 1024 * 1024;

/**
 * Total attempts a read window gets (the original download plus retries)
 * before a transient transport failure is reported as `read.error`. A single
 * blipped ranged `sdk.download()` (0 bytes delivered, early close, or a
 * failed stream) previously aborted the whole normalization conversion;
 * retrying the same window keeps a blip from killing the session.
 */
const DEFAULT_MAX_ATTEMPTS = 3;

/**
 * Fixed backoff delay in milliseconds before each retry attempt, so a burst
 * of transient transport failures does not hammer the SDK. The default waits
 * 250ms before the second attempt and 500ms before the third (two retries in
 * the default budget); a single number applies the same delay to every retry.
 */
const DEFAULT_RETRY_BACKOFF_MS: readonly number[] = [250, 500];

export interface RangedReaderOptions {
  /**
   * Shared concurrency permit (see {@link ReadBudget}). When set, the reader
   * waits for a free permit before opening its SDK download, so every reader
   * sharing a budget — the independent concurrent reads mediabunny can issue
   * share one — is guaranteed never to exceed the budget's concurrency limit.
   * Unset (the default) opens downloads without a cap.
   */
  budget?: ReadBudget;
  cache?: LruChunkCache;
  /** Max bytes per chunk handed to `onChunk`; larger stream chunks are split. */
  chunkSize?: number;
  /** Forwarded to each `Sdk.download` call. */
  downloadOptions?: { maxBufferedChunks?: number };
  /**
   * Total download attempts for one read window: the original download plus
   * retries on a transient failure (a download-open throw, a stream error, or
   * a short/dropped read that delivered < expected including zero bytes).
   * Defaults to 3 (`DEFAULT_MAX_ATTEMPTS`, i.e. two retries). A run superseded
   * by a seek/stop, the stall watchdog (which has its own semantics), or a
   * throwing `onChunk` (the caller's own handler, never a transport blip) is
   * never retried; after the budget is exhausted the failure is reported
   * exactly as before.
   */
  maxAttempts?: number;
  object: SiaObjectLike;
  /** Called with delivered bytes and their absolute byte offset in the object. */
  onChunk: (chunk: Uint8Array, position: number) => void;
  onComplete?: () => void;
  onError?: (error: unknown) => void;
  /**
   * Optional milestone listener for windowed-read progress:
   * `'read.window-start'` when an SDK download opens, `'read.window-complete'`
   * when it completes successfully, `'bytes.read'` each time cumulative
   * delivery to `onChunk` crosses a whole 1 MiB boundary, `'read.cache-hit'`
   * (at most once per read-window, when the LRU replay served bytes before any
   * download), `'read.budget-wait'` (once per blocking `ReadBudget.acquire`,
   * i.e. when a permit wait begins behind the concurrency cap), `'read.stalled'`
   * when the stall watchdog aborts a read that yielded no bytes, `'read.retry'`
   * once per retry of a failed download (carrying the attempt number,
   * the window's position/length, and the previous attempt's error message),
   * and `'read.error'` when a run fails for any other reason after the retry
   * budget is exhausted (short read / SDK stream error; the stall error is
   * reported only as `read.stalled`, never also as `read.error`) (names follow
   * `WORKER_LOG_EVENT_NAMES` in protocol.ts). The owning SOURCE `requestId`
   * rides each call (null when the
   * reader has none) so a load's milestones keep their request-scoped
   * identity. Only scalar detail is ever passed, and a throwing listener is
   * swallowed so it can never interrupt the read. Undefined (the default)
   * adds no per-chunk work — each site is a single optional call check, so
   * the hot path is unchanged.
   */
  onMilestone?: (name: string, requestId: null | RequestId, detail: Readonly<Record<string, unknown>>) => void;
  /** The SOURCE requestId owning this reader; null when constructed without one. */
  requestId?: null | RequestId;
  /**
   * Fixed backoff delay in milliseconds before each retry attempt: a single
   * number applies the same delay to every retry, while an array gives one
   * delay per retry (indexed by retry ordinal, the last value reused beyond
   * its length). Defaults to `DEFAULT_RETRY_BACKOFF_MS` (`[250, 500]` for the
   * two retries in the default budget). 0 disables the wait entirely.
   */
  retryBackoffMs?: number | readonly number[];
  sdk: SiaSdkLike;
  /**
   * Stall watchdog: maximum milliseconds a single SDK read may yield no bytes
   * before the stream is aborted and `onError` receives a descriptive error.
   * A real SDK read that stalls forever (e.g. every WebTransport session is
   * pending and the browser drops new ones) otherwise hangs the caller and the
   * media element stays `seeking` indefinitely. Unset (undefined) disables the
   * watchdog, preserving the original no-timeout behavior.
   */
  stallTimeoutMs?: number;
}

/** Narrowest shape of the `onShardDownloaded` payload the SDK forwards. */
export type ShardProgress = unknown;

/**
 * The slice of a `PinnedObject` the reader depends on. `slabs()` is local
 * metadata — range → slab math costs no I/O — and the sum of slab lengths is
 * the object size.
 */
export interface SiaObjectLike {
  id(): string;
  size(): number;
  slabs(): Slab[];
}

/**
 * The slice of the Sia SDK the reader depends on. `download` may resolve
 * either synchronously (the app-key and keyless SDKs) or as a promise (the
 * lazy dual-seed adapter connects an untagged download's app-key route on
 * demand, see `worker-runtime.ts`), so callers await the result before
 * reading — a plain `ReadableStream` passes through unchanged.
 *
 * Once resolved, the caller owns the stream until it is read to EOF or
 * cancelled, and adopting also means releasing on exit: the reader cancels any
 * stream it stops owning instead of dropping it open (adopt-or-cancel). That
 * rule holds on every exit path — superseded/stale runs, `stop()`, the stall
 * watchdog, exact-length completion, and a chunk-error throw — so the SDK's
 * WebTransport sessions (held until EOF or cancel) are always released
 * deterministically, never left to a nondeterministic GC.
 */
export interface SiaSdkLike {
  download(
    object: SiaObjectLike,
    options?: {
      length?: number;
      maxBufferedChunks?: number;
      offset?: number;
      onShardDownloaded?: (progress: ShardProgress) => void;
    }
  ): Promise<ReadableStream<Uint8Array>> | ReadableStream<Uint8Array>;
}

/**
 * Exact-window LRU cache. Keyed by `(offset, length)` pairs as delivered, so
 * hit rates follow the download window shape: good for re-reads of, and
 * backward seeks within, buffered history; a miss otherwise.
 */
export class LruChunkCache {
  get size(): number {
    return this.#entries.size;
  }
  readonly #capacity: number;
  readonly #entries = new Map<string, Uint8Array>();

  /** offset → length, for finding a window that starts at a given position. */
  readonly #offsets = new Map<number, number>();

  /** @param capacity - Maximum number of chunks held; oldest evicted first. */
  constructor(capacity = 64) {
    this.#capacity = Math.max(1, capacity);
  }

  clear(): void {
    this.#entries.clear();
    this.#offsets.clear();
  }

  /** Returns the cached bytes spanning `[offset, offset + length)`, refreshing recency. */
  get(offset: number, length: number): Uint8Array | undefined {
    const key = `${offset}:${length}`;
    const bytes = this.#entries.get(key);
    if (bytes === undefined) return undefined;
    this.#entries.delete(key);
    this.#entries.set(key, bytes);
    return bytes;
  }

  /** Stores bytes for one delivered window, evicting the least-recent chunk. */
  put(offset: number, length: number, bytes: Uint8Array): void {
    const previous = this.#offsets.get(offset);
    if (previous !== undefined) {
      // A re-put with a different length replaces the offset index; purge the
      // stale twin so the cache never accumulates unreachable entries.
      this.#offsets.delete(offset);
      this.#entries.delete(`${offset}:${previous}`);
    }
    const key = `${offset}:${length}`;
    if (this.#entries.has(key)) {
      this.#entries.delete(key);
      this.#offsets.delete(offset);
    }
    this.#entries.set(key, bytes);
    this.#offsets.set(offset, length);

    while (this.#entries.size > this.#capacity) {
      const oldest = this.#entries.keys().next().value;
      if (oldest === undefined) break;
      const [start, end] = oldest.split(':');
      this.#entries.delete(oldest);
      // The evicted offset may already index a newer replacement window; only
      // the index entry belonging to this evicted window may go.
      if (this.#offsets.get(Number(start)) === Number(end)) {
        this.#offsets.delete(Number(start));
      }
      void end;
    }
  }

  /** Returns the window cached at exactly `offset`, if one starts there. Dropping the index also drops the cached twin itself; a later re-put at the same offset then has no orphan to strand. */
  takeAt(offset: number): Uint8Array | undefined {
    const length = this.#offsets.get(offset);
    if (length === undefined) return undefined;
    const bytes = this.get(offset, length);
    if (bytes === undefined) {
      this.#offsets.delete(offset);
      return undefined;
    }
    this.#offsets.delete(offset);
    this.#entries.delete(`${offset}:${length}`);
    return bytes;
  }
}

/**
 * Owns one logical playback position. `seek(offset)` cancels whatever read is
 * in flight and restarts from the new offset; delivered chunks are cached
 * first, replayed while they chain contiguously, and the network read resumes
 * from the first cache miss.
 */
export class RangedReader {
  /** Whether a network read is currently in flight. */
  get active(): boolean {
    return this.#reader !== null;
  }
  /** Absolute byte offset this reader is positioned at. */
  get position(): number {
    return this.#position;
  }
  /** Object payload size in bytes. */
  get size(): number {
    return objectSize(this.#options.object);
  }
  /** Cumulative bytes handed to `onChunk` since construction; monotonic, never reset on seek. */
  #bytesRead = 0;
  readonly #cache: LruChunkCache;
  // Per-run supersede counter; `start()`/`stop()` bump it so an abandoned run
  // can never clobber the streams of the run that replaced it.
  #loadGeneration = 0;
  /** Next whole-1 MiB cumulative boundary a `'bytes.read'` milestone fires for (fired at most once each). */
  #nextBytesMilestone = MIB;
  readonly #options: RangedReaderOptions;

  #position = 0;
  #rangeEnd: null | number = null;

  #reader: null | ReadableStreamDefaultReader = null;

  #stream: null | ReadableStream = null;

  constructor(options: RangedReaderOptions) {
    this.#options = options;
    this.#cache = options.cache ?? new LruChunkCache();
  }

  /**
   * Seek: aborts the current stream and re-downloads from `offset`.
   *
   * @param offset - Absolute byte offset in the object.
   */
  seek(offset: number): void {
    this.start(Math.max(0, offset));
  }

  /**
   * (Re)starts delivery at `offset`. Any in-flight download is aborted, and
   * cached windows chaining forward from `offset` are replayed before resuming
   * from the network.
   */
  start(offset = 0, length?: number): void {
    this.stop();
    this.#position = offset;
    this.#rangeEnd = length === undefined ? null : Math.max(offset, offset + length);
    const loadGeneration = ++this.#loadGeneration;
    void this.#run(loadGeneration);
  }

  /** Cancels the in-flight stream; the cache survives for later re-reads. */
  stop(): void {
    this.#loadGeneration++;
    const reader = this.#reader;
    const stream = this.#stream;
    this.#reader = null;
    this.#stream = null;
    if (reader) void reader.cancel().catch(() => { /* empty */ });
    if (stream) void stream.cancel().catch(() => { /* empty */ });
  }

  /**
   * Accumulates delivered bytes and crosses whole-1 MiB `'bytes.read'`
   * boundaries as they are reached (fired at most once per boundary, never
   * per chunk). When no milestone listener is set the whole accounting
   * short-circuits on a single check, so the no-opt-in hot path costs nothing
   * beyond today.
   */
  #accountBytes(count: number): void {
    if (this.#options.onMilestone === undefined) return;
    this.#bytesRead += count;
    while (this.#bytesRead >= this.#nextBytesMilestone) {
      const boundary = this.#nextBytesMilestone;
      this.#nextBytesMilestone += MIB;
      this.#milestone(workerLogEventName.bytesRead, { bytes: boundary });
    }
  }

  #emitChunk(bytes: Uint8Array, position: number, maxChunkSize?: number): void {
    if (bytes.byteLength <= (maxChunkSize ?? Infinity)) {
      this.#cache.put(position, bytes.byteLength, bytes);
      this.#options.onChunk(bytes, position);
      this.#accountBytes(bytes.byteLength);
      return;
    }
    for (let offset = 0; offset < bytes.byteLength; offset += maxChunkSize!) {
      const slice = bytes.subarray(offset, Math.min(offset + maxChunkSize!, bytes.byteLength));
      this.#cache.put(position + offset, slice.byteLength, slice);
      this.#options.onChunk(slice, position + offset);
      this.#accountBytes(slice.byteLength);
    }
  }

  /**
   * Fires one milestone, tagged with the owning SOURCE requestId (null when
   * the reader has none). The listener is untrusted host code (it may feed a
   * logger or telemetry), so a throw is silently swallowed: it must never
   * abort the read or report an error that belongs to the stream, which the
   * caller owns, not this hint hook.
   */
  #milestone(name: string, detail: Readonly<Record<string, unknown>>): void {
    const onMilestone = this.#options.onMilestone;
    if (onMilestone === undefined) return;
    try {
      onMilestone(name, this.#options.requestId ?? null, detail);
    } catch {
      // Untrusted listener: a throwing onMilestone must not corrupt the
      // stream — swallow and keep reading.
    }
  }

  /**
   * One `reader.read()`, raced against a stall watchdog. When no bytes arrive
   * within `stallTimeoutMs` the stalled stream is aborted (freeing its SDK
   * sessions) and the promise rejects with a descriptive error, so a
   * WebTransport-session-exhausted read is reported through `onError` instead
   * of hanging the caller forever. The watchdog always settles the awaited
   * promise — even for an already-superseded run — so the run unwinds and
   * releases its budget permit; whether an error is actually emitted is
   * decided by `#run`'s load-generation guard. The abort side effects are
   * load-generation-scoped: a late watchdog can never cancel a newer run's
   * active streams.
   */
  #readWithStallWatchdog(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    loadGeneration: number,
    timeoutMs: number | undefined,
  ): Promise<ReadableStreamReadResult<Uint8Array>> {
    if (timeoutMs === undefined) return reader.read();

    return new Promise<ReadableStreamReadResult<Uint8Array>>((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.#loadGeneration === loadGeneration) {
          this.#reader?.cancel().catch(() => { /* empty */ });
          this.#stream?.cancel().catch(() => { /* empty */ });
          this.#reader = null;
          this.#stream = null;
          // Only an in-flight run's watchdog reports the stall (a superseded
          // run's late watchdog must not blame the replacement). No bytes
          // arrived, so the position is still the read's start offset.
          this.#milestone(workerLogEventName.readStalled, { position: this.#position, stallTimeoutMs: timeoutMs });
        }
        reject(new Error(`Sia SDK read stalled: no bytes for ${timeoutMs}ms`));
      }, timeoutMs);
      reader.read().then(
        (result) => {
          clearTimeout(timer);
          resolve(result);
        },
        (error: unknown) => {
          clearTimeout(timer);
          reject(error instanceof Error ? error : new Error(String(error)));
        },
      );
    });
  }

  async #run(loadGeneration: number): Promise<void> {
    const { budget, chunkSize, maxAttempts, object, onComplete, onError, retryBackoffMs, sdk, stallTimeoutMs } = this.#options;
    // Total attempts for the read window, capped at the configured budget
    // (default: original download + two retries).
    const attempts = maxAttempts === undefined ? DEFAULT_MAX_ATTEMPTS : Math.max(1, Math.floor(maxAttempts));

    // Hoisted so the failure milestone below can report the read window even
    // when the download throws before `read.window-complete`; `start` is
    // seeded with the current position so a pre-download failure (e.g. a
    // cache-replay onChunk throw) still names where the read stood.
    let end = 0;
    let start = this.#position;

    try {
      // Replay contiguous cached windows before the network read; a listener
      // sees one seamless delivery either way. The replay ahead of budget
      // dispatch is the "cache" phase: what it serves is what a seek or re-read
      // spared the network, reported once per read-window (never per chunk).
      const cacheReplayStart = this.#position;
      let cacheBytes = 0;
      while (this.#loadGeneration === loadGeneration) {
        const cached = this.#cache.takeAt(this.#position);
        if (cached === undefined) break;
        const remaining = this.#rangeEnd === null ? cached.byteLength : this.#rangeEnd - this.#position;
        if (remaining <= 0) break;
        const delivered = cached.subarray(0, remaining);
        this.#emitChunk(delivered, this.#position, chunkSize);
        this.#position += delivered.byteLength;
        cacheBytes += delivered.byteLength;
        if (delivered.byteLength < cached.byteLength) break;
      }
      // A window served fully or partly from the LRU cache before any SDK
      // download opened: `{ bytes }` served and where the replay started. The
      // un-served tail (when any) continues from the network below, so this is
      // a cache hit even for a partial replay.
      if (cacheBytes > 0) {
        this.#milestone(workerLogEventName.readCacheHit, { bytes: cacheBytes, position: cacheReplayStart });
      }

      if (this.#loadGeneration !== loadGeneration) return;

      const size = objectSize(object);
      end = Math.min(this.#rangeEnd ?? size, size);
      start = Math.min(this.#position, size);
      if (start >= end) {
        onComplete?.();
        return;
      }

      // A mitigation permit held from just before the first SDK download until
      // that run ends (delivered, aborted, abandoned, or retry-budget
      // exhausted). One acquire, one release: every retry attempt of the same
      // window keeps the same permit (never re-acquired, never leaked), so a
      // stale or stalled run can never double-hold or double-free its slot.
      let release: (() => void) | undefined;
      try {
        // Hold the shared budget so concurrent library reads — mediabunny can
        // issue independent overlapping reads — can never open more SDK
        // downloads at once than the budget allows; see {@link ReadBudget}.
        if (budget) {
          // When the acquire actually blocks (every permit is held — e.g. the
          // 64 pending WebTransport sessions are exhausted), the wait is the
          // backpressure event worth surfacing: one emit per wait, carrying the
          // live budget counters that describe how deep the queue sat.
          release = await budget.acquire(() => {
            this.#milestone(workerLogEventName.readBudgetWait, {
              inFlight: budget.inFlight,
              limit: budget.limit,
              waiters: budget.waiters,
            });
          });
          // A seek/stop arrived while this run waited for its permit: abandon
          // (the `finally` releases the just-acquired slot).
          if (this.#loadGeneration !== loadGeneration) return;
        }

        // Milestone: a network read window begins here — after cache replay
        // and budget dispatch, at the single point where the first SDK
        // download actually starts. Emitted once per read window (the original
        // open), never again for a retry — retries add `read.retry` lines
        // instead, so the external log keeps one start per completed/pending
        // window.
        this.#milestone(workerLogEventName.readWindowStart, { deltaBytes: end - start, position: start });

        // Bounded retry loop: one attempt is one full SDK download serving the
        // window's un-delivered tail. A transient transport failure — the
        // download open throwing, a stream read error, or a short/dropped read
        // (delivered < expected, including zero bytes) — retries the SAME
        // window from the point delivery stopped, so a single blipped ranged
        // `sdk.download()` can never abort the whole conversion. The retry
        // budget is `maxAttempts` (default 3 = two retries); `read.window-start`
        // is not re-emitted per attempt and `read.error` fires only once, after
        // the final attempt. Never retried: a run superseded by a seek/stop,
        // the stall watchdog (own semantics, `read.stalled` already fired), or
        // a throwing `onChunk` (the caller's own handler, never a transport
        // blip).
        let attempt = 0;
        // `consumer` records whether the failed attempt was the caller's own
        // throwing onChunk (never a transport blip, never retried) so the
        // final wrap below can classify what actually exhausted the loop.
        let failure: null | { consumer: boolean; delivered: number; error: unknown } = null;
        while (attempt < attempts && this.#loadGeneration === loadGeneration) {
          if (attempt > 0) {
            // Modest fixed backoff so a burst of transient blips does not
            // hammer the SDK. A seek/stop that lands mid-wait supersedes the
            // run: no further attempt is started.
            const backoffMs = retryBackoffMsFor(attempt, retryBackoffMs);
            if (backoffMs > 0) await new Promise((resolve) => setTimeout(resolve, backoffMs));
            if (this.#loadGeneration !== loadGeneration) return;
            this.#milestone(workerLogEventName.readRetry, {
              attempt: attempt + 1,
              error: failure === null ? '' : errorDescription(failure.error),
              expectedBytes: Math.max(0, end - start),
              position: start,
            });
          }
          attempt++;
          // A fresh download serves `[this.#position, end)` — the range still
          // owed to onChunk. For a zero-byte failure that is the whole
          // `[start, end)` window retried from scratch; after a partial
          // delivery it resumes where delivery stopped so bytes already
          // consumed by onChunk are never re-delivered (a from-scratch retry
          // would duplicate them).
          let consumerError: unknown = null;
          try {
            // One SDK download serves the whole un-delivered range with exact
            // offset/length; the reader never tiles a read across requests. A
            // lazy dual-seed SDK may resolve an untagged download through a
            // connect-on-demand route (see worker-runtime.ts), which yields a
            // promise; a settled stream is used synchronously so `active`
            // reflects the in-flight read without an extra microtask.
            const resolved = sdk.download(object, {
              length: end - this.#position,
              offset: this.#position,
              ...this.#options.downloadOptions,
            });
            const stream = resolved instanceof Promise ? await resolved : resolved;
            // A stale async (connect-on-demand) download that resolves after a
            // seek landed would otherwise be dropped still open, leaking its
            // WebTransport sessions (the SDK holds them until EOF or cancel);
            // adopt-or-cancel: cancel it. The cancel is fire-and-forget so a
            // stalled WASM cancel never blocks this run's unwinding and permit
            // release.
            if (this.#loadGeneration !== loadGeneration) {
              void stream.cancel().catch(() => { /* empty */ });
              return;
            }
            this.#stream = stream;
            const reader = stream.getReader();
            this.#reader = reader;

            while (this.#loadGeneration === loadGeneration && this.#position < end) {
              const result = await this.#readWithStallWatchdog(reader, loadGeneration, stallTimeoutMs);
              if (this.#loadGeneration !== loadGeneration) break;
              if (result.done) {
                // A download that closes before the range end is data loss, not
                // a clean stop: exact range reads must deliver every requested
                // byte. Surface the short read so the retry loop re-downloads
                // the owed range rather than silently skipping bytes.
                throw new Error('Sia SDK read ended before the requested range was delivered');
              }
              const remaining = end - this.#position;
              const delivered = result.value.subarray(0, remaining);
              try {
                this.#emitChunk(delivered, this.#position, chunkSize);
              } catch (error) {
                // onChunk is the caller's own handler: a throw there is a
                // consumer failure, never a transport blip, so it is not
                // retried — the run fails as today.
                consumerError = error;
                throw error;
              }
              this.#position += delivered.byteLength;
              if (delivered.byteLength < result.value.byteLength) break;
            }

            if (this.#loadGeneration !== loadGeneration) return;
            // Milestone: the window completed successfully (possibly after
            // retries). Emitted once, with the same window `read.window-start`
            // opened; retries never add another start/complete pair.
            this.#milestone(workerLogEventName.readWindowComplete, { deltaBytes: end - start, position: start });
            onComplete?.();
            failure = null;
            break;
          } catch (error) {
            failure = { consumer: consumerError !== null, delivered: Math.max(0, this.#position - start), error };
            // The stall watchdog has its own semantics (read.stalled already
            // fired) and a throwing onChunk is the caller's failure — neither
            // is a retryable transport blip, so both end the retry loop now.
            if (isStallWatchdogError(error) || consumerError !== null) break;
          } finally {
            // The attempt ended (delivered, dropped, or failed): cancel the
            // stream it still owns before the next attempt or the final
            // unwinding — exactly once per attempt, and only while this run is
            // still the current load generation so a superseded run's teardown
            // can never orphan a replacement's reader. cancel() is
            // fire-and-forget (never delays permit release or the next attempt)
            // and a no-op on an already-closed stream; the wasm-bindgen
            // slab-recovery tasks ahead of a dead read head are the reason the
            // stream is always aborted deterministically.
            if (this.#loadGeneration === loadGeneration) {
              void this.#reader?.cancel().catch(() => { /* empty */ });
              this.#reader = null;
              this.#stream = null;
            }
          }
        }

        // The retry budget was exhausted (or the run was stalled / hit a
        // consumer error): surface the failure through the catch below, which
        // reports it exactly once with the read-window facts. A superseded run
        // exits silently — a stale failure must not reach onError.
        if (failure !== null && this.#loadGeneration === loadGeneration) {
          // A transport/ranged-read failure that exhausted the budget is
          // wrapped so the stream chain (and the host's recovery handling) can
          // classify it: the message names the read window it gave up on,
          // `cause` keeps the SDK/short-read error, and the window facts ride
          // as fields. A throwing onChunk (the caller's own handler) and the
          // stall watchdog are never transport failures and keep their
          // original identity — and the wrapped message below, not a bare SDK
          // string, is what describes the failure to the wire.
          if (!failure.consumer && !isStallWatchdogError(failure.error)) {
            throw new ReadTransportError(
              `Sia SDK ranged read failed after ${attempts} attempts (expected ${Math.max(0, end - start)} bytes at ${start})`,
              {
                attempts,
                cause: failure.error,
                expectedBytes: Math.max(0, end - start),
                position: start,
              },
            );
          }
          throw failure.error;
        }
      } finally {
        if (release) release();
        // The per-attempt finally already cancelled and cleared this run's
        // stream; this guard only defends paths that never opened one (e.g. a
        // supersede right after permit acquire). Same generation-scoped rule:
        // only the current load generation may touch the refs.
        if (this.#loadGeneration === loadGeneration) {
          void this.#reader?.cancel().catch(() => { /* empty */ });
          this.#reader = null;
          this.#stream = null;
        }
      }
    } catch (error) {
      if (this.#loadGeneration === loadGeneration) {
        // The stall watchdog already reported `read.stalled` with its own
        // timeout detail; do not double-report it as a generic read.error.
        // Every other failure (short read / SDK stream error / a throwing
        // onChunk) reports the read window it failed on, with only scalar
        // facts: the start position, the requested length, and how many bytes
        // were actually delivered (omitted when none were).
        if (!isStallWatchdogError(error)) {
          const deliveredBytes = this.#position - start;
          this.#milestone(workerLogEventName.readError, {
            expectedBytes: Math.max(0, end - start),
            position: start,
            ...(deliveredBytes > 0 ? { deliveredBytes } : {}),
          });
        }
        onError?.(error);
      }
    }
  }
}

/**
 * Default cap on how many SDK ranged downloads may be open at once across the
 * worker. The Sia SDK opens one or more WebTransport sessions the moment
 * `download()` is called (one per slab/renter) and holds them until the stream
 * is read to EOF or cancelled, and Chromium caps *pending* sessions at 64:
 * unbounded concurrent library reads burst past that budget and every later
 * download fails with `Too many pending WebTransport sessions (64)`, the
 * recurring stream-error storm behind the QUIC idle timeouts observed in the
 * live demo. 4 concurrent downloads keeps aggregate session establishment far
 * below the cap while leaving enough parallelism for mediabunny's overlapping
 * reads to make progress. The worker creates one shared `ReadBudget` at this
 * limit; a host that knows better injects its own via `SiaVideoWorkerOptions`.
 */
export const DEFAULT_SDK_READ_CONCURRENCY = 4;

/**
 * Bounded dispatcher for SDK reads. A shared budget caps how many
 * `Sdk.download()` streams may be open at once across every reader that shares
 * it. It never splits a range: each concurrent read acquires one permit and
 * keeps its own exact offset/length.
 *
 * The underlying Sia SDK opens one or more WebTransport sessions the moment
 * `download()` is called (one per slab/renter touched by the requested range,
 * bounded only by the download's `maxBufferedChunks`) and holds them until the
 * returned stream is read to EOF or cancelled — or, for a stale async download
 * that resolves after its run was superseded, until `RangedReader` cancels it
 * (adopt-or-cancel), so a dropped-open stream can never leak its sessions.
 * Chromium caps *pending*
 * sessions at 64: too many simultaneous downloads — as when mediabunny issues
 * an overlapping batch of independent reads — exhaust that budget and later
 * reads stall forever with `Too many pending WebTransport sessions (64)`. This
 * permit serializes stream creation so the SDK never holds more than `limit`
 * downloads' worth of sessions at once, and `RangedReader`'s stall watchdog
 * aborts (and releases) a permit when a read never delivers. The SDK exposes
 * no timeout or concurrency option itself, which is why the dispatch limiter
 * lives here, around the SDK.
 */
export class ReadBudget {
  /** Number of permits currently held by active reads. */
  get inFlight(): number {
    return this.#inFlight;
  }
  /** The configured concurrency cap. */
  get limit(): number {
    return this.#limit;
  }
  /** Number of readers queued waiting for a permit (the blocking one included once queued). */
  get waiters(): number {
    return this.#waiters.length;
  }
  #inFlight = 0;
  readonly #limit: number;
  #waiters: (() => void)[] = [];

  /** @param limit - Maximum concurrent SDK downloads; floored to ≥ 1. */
  constructor(limit = 1) {
    this.#limit = Math.max(1, Math.floor(limit));
  }

  /**
   * Resolves once a permit is free. The returned function releases the permit;
   * call it exactly once when the read it capped has ended (delivered, aborted,
   * or abandoned). Waits are FIFO so callers cannot starve each other.
   *
   * `onWait`, when supplied, runs synchronously exactly when this call
   * actually blocks — queued behind the limit rather than granted a free
   * permit — which is the single place a caller can observe a backpressure
   * wait beginning. The live `inFlight`/`limit`/`waiters` counters are
   * readable at that instant. Never invoked for an immediately-granted
   * acquire, and a throwing callback is swallowed so a diagnostic hook can
   * never corrupt the dispatch queue.
   */
  acquire(onWait?: () => void): Promise<() => void> {
    if (this.#inFlight < this.#limit) {
      this.#inFlight++;
      return Promise.resolve(() => this.#release());
    }
    return new Promise((resolve) => {
      this.#waiters.push(() => {
        this.#inFlight++;
        resolve(() => this.#release());
      });
      try {
        onWait?.();
      } catch {
        // A throwing diagnostic hook must not corrupt the wait queue.
      }
    });
  }

  #release(): void {
    this.#inFlight--;
    const next = this.#waiters.shift();
    next?.();
  }
}

/**
 * A ranged-read (transport) failure that exhausted the reader's bounded retry
 * budget. It surfaces through `onError` → the byte-source's `controller.error`
 * → mediabunny's conversion rejection (which passes the original instance
 * through unwrapped), so the host can tell a genuinely broken/unreachable
 * transport apart from a conversion problem: this kind gets its own bounded
 * reload recovery instead of being treated as an `unsupported` container.
 * Carries the read-window facts and the original failure as `cause`; use
 * {@link isTransportReadError} to recognize it (even when some layer wrapped
 * it with its own `cause`).
 */
export class ReadTransportError extends Error {
  /** Total download attempts the failed window consumed (original + retries). */
  readonly attempts: number;
  /** Bytes the window tried to deliver (`end - start`). */
  readonly expectedBytes: number;
  /** Absolute byte offset the failed window started at. */
  readonly position: number;

  constructor(
    message: string,
    options: { readonly attempts: number; readonly cause?: unknown; readonly expectedBytes: number; readonly position: number },
  ) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = 'ReadTransportError';
    this.attempts = options.attempts;
    this.expectedBytes = options.expectedBytes;
    this.position = options.position;
  }
}

/**
 * True when `error` is (or is wrapped around) a {@link ReadTransportError}.
 * mediabunny surfaces a failed byte-source stream by rejecting with the exact
 * controller.error() instance, so the direct check usually fires — but a layer
 * that wraps the failure (an `Error` with its own `cause`, or a chain of
 * them) must not hide the transport kind, so the check walks the `cause`
 * chain defensively. Cycle-safe (a corrupted cause graph can never loop).
 */
export function isTransportReadError(error: unknown): boolean {
  let current: unknown = error;
  const seen = new Set<unknown>();
  while (current !== null && current !== undefined && !seen.has(current)) {
    if (current instanceof ReadTransportError) return true;
    seen.add(current);
    current = current instanceof Error ? current.cause : undefined;
  }
  return false;
}

/** Object payload size in bytes, from the local slab map. */
export function objectSize(object: SiaObjectLike): number {
  return object.slabs().reduce((total, slab) => total + slab.length, 0);
}

/** Scalar, log-safe rendering of a caught failure for a `read.retry` milestone. */
function errorDescription(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * True when the caught error is the stall watchdog's own rejection, which
 * already fired `read.stalled` — the run's catch must not re-report it as a
 * generic `read.error`. Coupled to the message this module itself raises in
 * `#readWithStallWatchdog`, never to an SDK-provided string.
 */
function isStallWatchdogError(error: unknown): boolean {
  return error instanceof Error && error.message.startsWith('Sia SDK read stalled: ');
}

/**
 * Resolves the backoff delay before retry number `retry` (1-based, so 1 is the
 * first retry): a number option applies the same delay to every retry, an
 * array applies one delay per retry (the last value reused past its length),
 * and the unset default is `DEFAULT_RETRY_BACKOFF_MS` (`[250, 500]`).
 */
function retryBackoffMsFor(retry: number, configured: number | readonly number[] | undefined): number {
  const schedule: readonly number[] =
    configured === undefined ? DEFAULT_RETRY_BACKOFF_MS : typeof configured === 'number' ? [configured] : configured;
  return schedule[Math.min(retry, schedule.length) - 1] ?? 0;
}
