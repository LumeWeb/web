/**
 * "Preparing stream…" overlay: when to show the overlay that says a NEW
 * source is still opening.
 *
 * It exists for one moment: a source opening while a play intent is still
 * held with no buffered future data and no usable (metadata/canplay)
 * pipeline. Once the source is usable it is ordinary playback territory, a
 * later reload is a seek or recovery reload that the native video.js loading
 * spinner carries; forcing this overlay back would turn a normal seek into a
 * second "opening a source" moment. Recovery feedback is not decided here.
 *
 * The decision is the pure `preparingDecision` rule, fed by pure adapters
 * over the hoisted `PlaybackFacts` and `SiaStatus` snapshots (no DOM
 * listeners, ref mirrors, timers, or log parsing):
 *
 * - `preparingBuffering`, no buffered range yet = below HAVE_FUTURE_DATA.
 * - `preparingRecoveryRepair`, a silent non-resuming recovery repair
 *   (`wantsPlay: false`) is re-attaching the same source; it stays silent.
 * - `preparingSourceUsable`, seekable timeline, known duration, or started
 *   playback = the source reached metadata/canplay.
 * - `preparingFactsFromPlayback`, folds those plus the local
 *   `playRequested` flag and the pending autoplay intent into the decision's
 *   `PreparingFacts`; either play intent lights the overlay.
 */

import type { PlaybackFacts } from "./PlaybackFactsBridge";
import { emptyPlaybackFacts } from "./PlaybackFactsBridge";
import type { SiaRecoveryStatus, SiaStatus } from "./SiaStatusBridge";
import { emptySiaStatus } from "./SiaStatusBridge";

/** The shown-overlay decision carries the one preparing label it ever offers. */
export type PreparingDecision =
  { label: PreparingLabel; show: true } | { show: false };

/** The facts driving the overlay, all derived from hoisted typed facts. */
export interface PreparingFacts {
  /** A pending best-effort autoplay intent waits for the opening source. */
  autoplayPending: boolean;
  /** Still below HAVE_FUTURE_DATA (3): no buffered future data yet. */
  buffering: boolean;
  /** The element is paused; an actually-playing element never shows it. */
  paused: boolean;
  /** A user-gesture play was requested and not yet honored (`started` pending). */
  playRequested: boolean;
  /** A silent non-resuming recovery repair is re-attaching the same source. */
  recoveryRepair: boolean;
  /** The current source has reached metadata/canplay, it is usable. */
  sourceUsable: boolean;
}

/** The only label the preparing overlay ever shows. */
export type PreparingLabel = "preparing stream…";

/** Props accepted by the preparing overlay component. */
export interface PreparingOverlayProps {
  /** A pending best-effort autoplay intent for the opening source. */
  readonly autoplayPending: boolean;
  /** Hoisted PlaybackFacts snapshot, or null before the bridge's first report. */
  readonly facts: null | PlaybackFacts;
  /** Whether a user-gesture play request is pending (not yet honored). */
  readonly playRequested: boolean;
  /** Hoisted SiaStatus snapshot, or null before the bridge's first report. */
  readonly status: null | SiaStatus;
}

/**
 * Whether the current load is still below HAVE_FUTURE_DATA: no buffered range
 * has been reported yet.
 */
export function preparingBuffering(facts: PlaybackFacts): boolean {
  return !facts.buffer.bufferedAvailable;
}

/**
 * The source-opening decision: hide once the source is usable (a reload is
 * then a seek/recovery for the native spinner), hide unless a play intent is
 * pending (stage-click request or autoplay intent), hide through a silent
 * non-resuming recovery repair, and hide unless the element is paused and
 * still buffering toward a frame.
 */
export function preparingDecision(facts: PreparingFacts): PreparingDecision {
  // The source is usable: a reload is a seek or recovery, carried by the
  // native loading spinner.
  if (facts.sourceUsable) return { show: false };
  // No stage-click gesture and no pending autoplay intent: wait silently for
  // an explicit play.
  if (!facts.playRequested && !facts.autoplayPending) return { show: false };
  // A silent wantsPlay:false repair re-attaches the same source staying
  // paused; it stays silent even under a pending intent.
  if (facts.recoveryRepair) return { show: false };
  if (!facts.paused || !facts.buffering) return { show: false };
  return { label: "preparing stream…", show: true };
}

/**
 * Folds the hoisted snapshots, the local play-request flag, and the pending
 * autoplay intent into the decision's `PreparingFacts`; a null snapshot
 * normalizes to inert facts.
 */
export function preparingFactsFromPlayback(
  facts: PlaybackFacts,
  playRequested: boolean,
  autoplayPending: boolean,
  recovery: SiaRecoveryStatus,
): PreparingFacts {
  return {
    autoplayPending,
    buffering: preparingBuffering(facts),
    paused: facts.playback.paused,
    playRequested,
    recoveryRepair: preparingRecoveryRepair(recovery),
    sourceUsable: preparingSourceUsable(facts),
  };
}

/**
 * Renders the overlay (spinner + the one preparing label) over the stage
 * while the pure decision says to. A null hoisted snapshot normalizes to
 * inert facts.
 */
export function PreparingOverlay({
  autoplayPending,
  facts,
  playRequested,
  status,
}: PreparingOverlayProps) {
  const decision = preparingDecision(
    preparingFactsFromPlayback(
      facts ?? emptyPlaybackFacts(),
      playRequested,
      autoplayPending,
      status?.recovery ?? emptySiaStatus().recovery,
    ),
  );
  if (!decision.show) return null;
  return (
    <div
      aria-live="polite"
      className="absolute inset-0 z-20 flex items-center justify-center gap-2 bg-black/70"
      data-preparing-overlay="true"
      role="status">
      <span
        aria-hidden="true"
        className="h-6 w-6 animate-spin rounded-full border-2 border-white/20 border-t-white"
      />
      <span className="text-sm text-white">{decision.label}</span>
    </div>
  );
}

/**
 * Whether a silent non-resuming recovery repair is re-attaching the same
 * source: a window that will NOT resume playback (`wantsPlay` false or
 * unknown) restarts the source staying paused and stays silent, even under a
 * pending play intent.
 */
export function preparingRecoveryRepair(recovery: SiaRecoveryStatus): boolean {
  return recovery.active && recovery.wantsPlay !== true;
}

/**
 * Whether the current source has a usable pipeline: seekable timeline known,
 * duration known, or playback started, any one means metadata/canplay.
 */
export function preparingSourceUsable(facts: PlaybackFacts): boolean {
  return (
    facts.buffer.seekableAvailable ||
    facts.playback.started ||
    facts.time.duration > 0
  );
}
