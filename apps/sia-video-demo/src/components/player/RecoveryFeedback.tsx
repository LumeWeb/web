/**
 * "Recovering…" feedback chip: when to show the chip that says a Sia
 * recovery is re-establishing resumed playback.
 *
 * The chip exists for exactly one moment: a recovery caused by a real FAILURE
 * that is about to RESUME playback (`active && wantsPlay`). Three states are
 * not this chip's job: a closed window says nothing; a non-play repair
 * (`wantsPlay: false`, source restarted while paused) is silent by design;
 * and a user far seek (`reason: 'seek'`) reopens the load as part of ordinary
 * seeking, the native video.js spinner carries it, so it must never appear
 * as a recovery whose playback was interrupted.
 *
 * The decision is the pure `recoveryDecision` rule, fed by the hoisted typed
 * Sia recovery facts from `SiaStatusBridge` (no DOM listeners, ref mirrors,
 * timers, or log parsing): `recoveryDecisionFromStatus` folds the hoisted
 * snapshot, `recoveryLabel` maps the typed failure reason to the chip's
 * label. The chip is a pointer-events-none pill at the top of the stage that
 * never blocks the click-to-play gesture.
 */

import type {
  SiaRecoveryReason,
  SiaRecoveryStatus,
  SiaStatus,
} from "./SiaStatusBridge";
import { emptySiaStatus } from "./SiaStatusBridge";

/** A failure reason that carries busy feedback; a user seek never does. */
export type RecoveryBusyReason = Exclude<SiaRecoveryReason, "seek">;

/** The chip's shown decision carries the one recovery label it ever offers. */
export type RecoveryFeedbackDecision =
  { label: RecoveryLabel; show: true } | { show: false };

/** Props accepted by the recovery-feedback chip. */
export interface RecoveryFeedbackProps {
  /** Hoisted SiaStatus snapshot, or null before the bridge's first report. */
  readonly status: null | SiaStatus;
}

/** The chip's labels: reconnect for transport, recovering-playback otherwise. */
export type RecoveryLabel = "reconnecting…" | "recovering playback…";

/**
 * The busy-chip decision: a recovery window that will resume playback and
 * whose reason is a real failure (network, decode, native). A closed window,
 * a non-play repair, and a user far seek are all silent.
 */
export function recoveryDecision(
  recovery: SiaRecoveryStatus,
): RecoveryFeedbackDecision {
  // No window: ordinary playback, nothing to say.
  if (!recovery.active) return { show: false };
  // A recovery that will not resume playback (paused repair) is silent.
  if (recovery.wantsPlay !== true) return { show: false };
  // A user far seek reopens the load as part of ordinary seeking: the native
  // spinner carries it, and it must never look like busy failure recovery.
  if (recovery.reason === null || recovery.reason === "seek") {
    return { show: false };
  }
  return { label: recoveryLabel(recovery.reason), show: true };
}

/** Folds the hoisted SiaStatus snapshot's recovery slice into the decision. */
export function recoveryDecisionFromStatus(
  status: SiaStatus,
): RecoveryFeedbackDecision {
  return recoveryDecision(status.recovery);
}

/**
 * Renders the chip (spinner + recovery label) at the top of the stage while
 * the pure decision says to. A null hoisted snapshot normalizes to inert
 * recovery facts; a closed or non-resuming recovery renders nothing.
 */
export function RecoveryFeedback({ status }: RecoveryFeedbackProps) {
  const decision = recoveryDecisionFromStatus(status ?? emptySiaStatus());
  if (!decision.show) return null;
  return (
    <div
      aria-live="polite"
      className="border-border-default pointer-events-none absolute top-3 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border bg-black/70 px-3 py-1.5"
      data-recovery-feedback="true"
      role="status">
      <span
        aria-hidden="true"
        className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"
      />
      <span className="text-sm text-white">{decision.label}</span>
    </div>
  );
}

/** Maps a typed failure reason to the chip's label; a user seek never does. */
export function recoveryLabel(reason: RecoveryBusyReason): RecoveryLabel {
  return reason === "network" ? "reconnecting…" : "recovering playback…";
}
