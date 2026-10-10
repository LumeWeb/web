/**
 * Typed playback-status chip: the pure, single-snapshot playback status
 * derivation plus the Tailwind chip that presents it.
 *
 * The derivation classifies one hoisted snapshot, the Video.js v10
 * `PlaybackFacts` and the Sia `SiaStatus`, into a single typed phase:
 *
 * - `idle`, nothing has reported yet (the fully-inert baseline).
 * - `loading`, a source is opening and the worker has not accepted its load.
 * - `streaming`, the worker accepted the load (`SOURCE_OK`); ready to play,
 *   not playing yet.
 * - `recovering`, an active recovery that will resume playback is
 *   re-establishing the stream; derived ahead of the accepted→streaming step
 *   so the chip never claims "streaming" beside the busy recovery chip.
 * - `playing` / `ready`, playback is running, or is paused.
 * - `stalled`, playback began and the element is waiting for data, but it is
 *   NOT a user far-seek and NOT a Sia recovery: only a real data stall.
 * - `ended` / `error`, the media reached the end, or a present media error
 *   (which wins over everything).
 *
 * Everything is derived purely from the hoisted typed facts, no log parsing,
 * timers, DOM listeners, or ref state machine. This chip only ever names
 * playback state: recovery interruptions belong to `RecoveryFeedback` and
 * source opening to `PreparingOverlay`; the reader's retry/fetch annotations
 * stay typed detail on the derived status, never on the chip.
 */

import { cn } from "../../lib/utils";
import type { PlaybackFacts } from "./PlaybackFactsBridge";
import { emptyPlaybackFacts } from "./PlaybackFactsBridge";
import { recoveryDecision } from "./RecoveryFeedback";
import type { SiaStatus } from "./SiaStatusBridge";
import { emptySiaStatus } from "./SiaStatusBridge";

/** The complete typed playback status: phase, primary label, and annotations. */
export interface PlaybackStatus {
  /** Retry/fetch annotations folded from the Sia reader-progress slice. */
  readonly annotations: PlaybackStatusAnnotations;
  /** The derived playback phase. */
  readonly phase: PlaybackStatusPhase;
  /** The primary chip label for the derived phase. */
  readonly primary: PlaybackStatusLabel;
}

/** Retry/fetch annotations folded from the Sia reader-progress slice. */
export interface PlaybackStatusAnnotations {
  /** Cumulative whole-MiB read for the current load, or null when absent. */
  readonly bytesRead: null | number;
  /** Whether the current read window is in flight (a fetch is active). */
  readonly reading: boolean;
  /** Read windows opened for the current load; the "(N fetches)" counter. */
  readonly reads: number;
  /** Total retry attempts for the current load. */
  readonly retries: number;
  /** Whether the reader is actively retrying its current read window. */
  readonly retrying: boolean;
}

/** Props accepted by the playback-status chip. */
export interface PlaybackStatusChipProps {
  /** Hoisted PlaybackFacts snapshot, or null before the bridge's first report. */
  readonly facts: null | PlaybackFacts;
  /** Hoisted SiaStatus snapshot, or null before the bridge's first report. */
  readonly status: null | SiaStatus;
}

/** The chip's primary labels; one per phase. */
export type PlaybackStatusLabel =
  | "Buffering…"
  | "ended"
  | "error"
  | "loading…"
  | "playing"
  | "ready"
  | "recovering…"
  | "streaming"
  | "waiting";

/** The derived playback phase; the chip's typed discriminant. */
export type PlaybackStatusPhase =
  | "ended"
  | "error"
  | "idle"
  | "loading"
  | "playing"
  | "ready"
  | "recovering"
  | "stalled"
  | "streaming";

/**
 * Derives the complete typed playback status from one hoisted snapshot: the
 * phase, its primary label, and the reader's retry/fetch annotations. Pure
 * and deterministic.
 */
export function derivePlaybackStatus(
  facts: PlaybackFacts,
  status: SiaStatus,
): PlaybackStatus {
  const annotations = playbackStatusAnnotations(status);
  const phase = derivePlaybackStatusPhase(facts, status);
  return { annotations, phase, primary: playbackStatusLabel(phase) };
}

/**
 * Classifies one hoisted snapshot into the typed playback phase. Fixed
 * precedence: present error, then ended, then the began+waiting stall
 * (outside seek/recovery), then playing/ready, then a busy recovery (ahead of
 * the accepted→streaming step), then streaming, then loading, then idle.
 */
export function derivePlaybackStatusPhase(
  facts: PlaybackFacts,
  status: SiaStatus,
): PlaybackStatusPhase {
  if (facts.error.present) return "error";
  if (facts.playback.ended) return "ended";
  if (playbackStatusStalled(facts, status)) return "stalled";
  if (facts.playback.started) {
    return facts.playback.paused ? "ready" : "playing";
  }
  if (playbackStatusRecovering(status)) return "recovering";
  if (status.load.accepted) return "streaming";
  if (facts.playback.available || status.load.available) return "loading";
  return "idle";
}

/**
 * Folds the Sia reader-progress slice into the annotation shape; an absent
 * progress feature reports a `null` byte count (never `undefined`).
 */
export function playbackStatusAnnotations(
  status: SiaStatus,
): PlaybackStatusAnnotations {
  return {
    bytesRead: status.progress.available ? status.progress.bytesRead : null,
    reading: status.progress.reading,
    reads: status.progress.reads,
    retries: status.progress.retries,
    retrying: status.progress.retrying,
  };
}

/**
 * Renders the playback-status chip while a source is mounted: a
 * pointer-events-none pill at the stage's top-right showing the phase's
 * primary label. A null hoisted snapshot normalizes to the inert facts/status.
 */
export function PlaybackStatusChip({ facts, status }: PlaybackStatusChipProps) {
  const playback = derivePlaybackStatus(
    facts ?? emptyPlaybackFacts(),
    status ?? emptySiaStatus(),
  );
  return (
    <div
      aria-live="polite"
      className="border-border-default pointer-events-none absolute top-3 right-3 z-20 flex items-center gap-2 rounded-full border bg-black/70 px-3 py-1.5"
      data-playback-status="true"
      role="status">
      <span
        aria-hidden="true"
        className={cn(
          "h-2 w-2 rounded-full",
          playbackStatusDotClass(playback.phase),
        )}
      />
      <span className="text-sm text-white">
        {playbackStatusChipText(playback)}
      </span>
    </div>
  );
}

/**
 * The chip text: just the primary phase label. The reader's fetch-count and
 * retrying internals stay typed annotation detail, not visible status.
 */
export function playbackStatusChipText(status: PlaybackStatus): string {
  return status.primary;
}

/**
 * The Tailwind accent-dot class for a phase: red for a terminal error, amber
 * while acquiring data, emerald while a healthy stream is live, sky for the
 * settled states.
 */
export function playbackStatusDotClass(phase: PlaybackStatusPhase): string {
  switch (phase) {
    case "ended":
      return "bg-sky-400";
    case "error":
      return "bg-red-500";
    case "idle":
      return "bg-slate-500";
    case "loading":
      return "bg-amber-400";
    case "playing":
      return "bg-emerald-400";
    case "ready":
      return "bg-sky-400";
    case "recovering":
      return "bg-amber-400";
    case "stalled":
      return "bg-amber-400";
    case "streaming":
      return "bg-emerald-400";
  }
}

/** Maps a phase to its primary chip label. */
export function playbackStatusLabel(
  phase: PlaybackStatusPhase,
): PlaybackStatusLabel {
  switch (phase) {
    case "ended":
      return "ended";
    case "error":
      return "error";
    case "idle":
      return "waiting";
    case "loading":
      return "loading…";
    case "playing":
      return "playing";
    case "ready":
      return "ready";
    case "recovering":
      return "recovering…";
    case "stalled":
      return "Buffering…";
    case "streaming":
      return "streaming";
  }
}

/**
 * Whether the playback chip names a busy recovery: an active recovery window
 * that will resume playback with a failure reason, exactly the window the
 * recovery feedback chip presents. A closed window, a silent non-play repair,
 * and a user far seek stay out of the recovering phase.
 */
export function playbackStatusRecovering(status: SiaStatus): boolean {
  return recoveryDecision(status.recovery).show;
}

/**
 * Whether the element is genuinely stalled: playback has begun and the element
 * is waiting for data, but it is not a user far-seek and not a Sia recovery.
 * Waiting before playback began is a source opening, never a stall.
 */
export function playbackStatusStalled(
  facts: PlaybackFacts,
  status: SiaStatus,
): boolean {
  return (
    facts.playback.started &&
    facts.playback.waiting &&
    !facts.time.seeking &&
    !status.recovery.active
  );
}
