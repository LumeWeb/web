/**
 * Generic ranged-byte transport contract.
 *
 * `container/*` remux/index code must consume generic bytes through
 * `ByteSource`, never the Sia SDK or `RangedReader` directly. This file
 * carries the interface plus the small epoch/read-lifecycle bookkeeping shared
 * by the concrete in-memory and Sia sources, so their supersede/cancel
 * semantics never diverge.
 */

/** One explicit byte window to read from an object. */
export interface ByteRange {
  readonly length: number;
  readonly offset: number;
}

/**
 * A logical byte read over an object that supports ranges.
 *
 * Each `read()` returns a cancellable stream of exactly the requested bytes,
 * clamped at EOF (a short read, never garbage), that always settles — it
 * closes (fully delivered) or errors (superseded, cancelled, or transport
 * failure); it never hangs. Reads started under an epoch older than the
 * source's newest accepted epoch are superseded and error with
 * {@link ByteSourceSupersededError}; starting a newer epoch supersedes every
 * older in-flight read. `cancel()` aborts everything and forgets epoch state
 * (e.g. on a source change).
 */
export interface ByteSource {
  /** Abort everything in flight and forget epoch state (e.g. source change). */
  cancel(reason?: unknown): void;
  /** Cancellable, bounded, byte-exact ranged read. */
  read(range: ByteRange, options: ReadOptions): ReadableStream<Uint8Array>;
  /** Object payload size in bytes. */
  readonly size: number;
}

/** Options for one ranged read. */
export interface ReadOptions {
  /**
   * Epoch guard: deliveries past a superseded epoch are dropped. A read under
   * an epoch older than the source's newest accepted epoch is superseded.
   */
  epoch: number;
  /** Optional external abort; aborts this read with the signal's reason. */
  signal?: AbortSignal;
  /**
   * Stall watchdog in ms: abort+error when a transport read yields no bytes
   * for this long. Sia-only; a memory source can never stall.
   */
  stallTimeoutMs?: number;
  /**
   * Max bytes per transport download window (SDK fan-out bound). The Sia
   * source tiles the range with bounded sequential `Sdk.download` calls; the
   * in-memory source has no transport windows and ignores it. Unset preserves
   * the single-download behavior.
   */
  windowBytes?: number;
}

interface ReadHandle {
  /**
   * Called exactly once when the read is superseded or the source is
   * cancelled. It may fire before the read's stream has been started.
   */
  stop(reason?: unknown): void;
}

/**
 * Epoch scoping + active-read cancellation shared by concrete byte sources.
 * Concrete sources call `open()`/`settle()` around each read and forward
 * `cancel()` to `reset()`.
 */
export class ByteSourceEpoch {
  readonly #active = new Set<ReadHandle>();
  #epoch = 0;

  /**
   * Opens a read under `epoch`. Returns false when the read is already stale
   * (an older epoch than the newest accepted) — the caller returns a dead
   * stream and must not register any work. A newer epoch supersedes every
   * older in-flight read first (they error).
   */
  open(epoch: number, handle: ReadHandle): boolean {
    if (epoch < this.#epoch) return false;
    if (epoch > this.#epoch) {
      this.#epoch = epoch;
      this.#supersede(undefined);
    }
    this.#active.add(handle);
    return true;
  }

  /** Aborts everything in flight with `reason` and forgets epoch state. */
  reset(reason?: unknown): void {
    this.#supersede(reason);
    this.#epoch = 0;
  }

  /** Removes a settled read; safe to call exactly once after `open()` returned true. */
  settle(handle: ReadHandle): void {
    this.#active.delete(handle);
  }

  #supersede(reason?: unknown): void {
    for (const handle of this.#active) handle.stop(reason);
    this.#active.clear();
  }
}

/** Signals a read that was superseded by a newer epoch or by `cancel()`. */
export class ByteSourceSupersededError extends Error {
  readonly name = 'ByteSourceSupersededError';

  constructor(reason?: unknown) {
    super(describeSupersedeReason(reason));
  }
}

/** A stream that closes immediately with no bytes (EOF / empty range). */
export function emptyByteStream(): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      controller.close();
    },
  });
}

/** A stream that settles immediately with a superseded error and no bytes. */
export function supersededStream(reason?: unknown): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      try {
        controller.error(toSupersededError(reason));
      } catch {
        /* stream already closed/cancelled before start */
      }
    },
  });
}

/** Normalizes an arbitrary supersede reason into the Error a stream errors with. */
export function toSupersededError(reason?: unknown): Error {
  if (reason instanceof Error) return reason;
  return reason === undefined ? new ByteSourceSupersededError() : new ByteSourceSupersededError(reason);
}

/** Safely stringifies an arbitrary supersede reason for an error message. */
function describeSupersedeReason(reason: unknown): string {
  if (reason === undefined) return 'byte source read superseded';
  if (typeof reason === 'string') return reason;
  if (reason instanceof Error) return reason.message;
  if (typeof reason === 'number' || typeof reason === 'bigint' || typeof reason === 'boolean') return String(reason);
  if (typeof reason === 'symbol') return reason.toString();
  return 'byte source read superseded';
}
