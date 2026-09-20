/**
 * Clock contract: the injected time surface the session seams (StreamController,
 * LoadPipeline) use for throughput estimates, stall watchdogs, and eviction
 * windows.
 *
 * `Clock` is injectable so those timing decisions are deterministic in tests
 * (`clock?: Clock` in the coordinator's constructor bag):
 *
 * - `now()` is a monotonic wall clock in milliseconds (like
 *   `performance.now()`); deltas, never absolute values, are meaningful.
 * - `mediaTime()` is the current media playhead in seconds when the player
 *   has one, else `null` (used for lookahead budgeting before the host has
 *   sent its first `PLAYHEAD` message).
 *
 * `wallClock()` is the production default (monotonic `performance.now()` plus
 * an optional media-playhead provider wired to the player element); `ManualClock`
 * is the deterministic test double whose time only advances when the test says so.
 */

/** The injectable time surface for session orchestration. */
export interface Clock {
  /** Current media playhead in seconds when one is known, else `null`. */
  mediaTime(): null | number;
  /** Monotonic wall-clock time in milliseconds. */
  now(): number;
}

/**
 * Deterministic test double: time starts at 0 and only moves when the test
 * advances it, so stall budgets and lookahead decisions are reproducible.
 */
export class ManualClock implements Clock {
  #mediaTime: null | number = null;
  #now = 0;

  /** Advances the monotonic clock by `ms` milliseconds. */
  advance(ms: number): void {
    this.#now += ms;
  }

  mediaTime(): null | number {
    return this.#mediaTime;
  }

  now(): number {
    return this.#now;
  }

  /** Replaces the media playhead the clock reports. */
  setMediaTime(seconds: null | number): void {
    this.#mediaTime = seconds;
  }

  /** Replaces the monotonic clock reading outright. */
  setNow(ms: number): void {
    this.#now = ms;
  }
}

/**
 * Default production clock: `performance.now()` for wall time and an injected
 * playhead provider for media time. The provider is normally the player's
 * `currentTime()`, supplied by the composition root.
 */
export function wallClock(mediaTime: () => null | number = () => null): Clock {
  return {
    mediaTime,
    now: () => performance.now(),
  };
}
