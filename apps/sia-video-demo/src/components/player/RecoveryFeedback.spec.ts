import { describe, expect, it } from "vitest";
import type { SiaRecoveryStatus, SiaStatus } from "./SiaStatusBridge";
import { emptySiaStatus } from "./SiaStatusBridge";
import type {
  RecoveryFeedbackDecision,
  RecoveryLabel,
} from "./RecoveryFeedback";
import {
  recoveryDecision,
  recoveryDecisionFromStatus,
  recoveryLabel,
} from "./RecoveryFeedback";

/**
 * Node unit tests for the pure Sia recovery-feedback decision, expressed
 * entirely in the hoisted typed recovery facts from `SiaStatusBridge`
 * (`active`, `reason`, `resumeSeconds`, `wantsPlay`) — never old native DOM
 * events, ref mirrors, timers, or log parsing.
 *
 * The chip exists for one thing: a recovery that an actual FAILURE caused and
 * that is about to RESUME playback (`active && wantsPlay` for the failure
 * reasons only). Three states are deliberately NOT busy feedback:
 *
 * - a closed window (ordinary playback; nothing to say),
 * - a non-play repair (`wantsPlay: false` — e.g. a paused user seek restarts
 *   the source staying paused, which is silent by design), and
 * - a user far seek while playing (`reason: 'seek'` with `wantsPlay: true`) —
 *   that is ordinary seeking with the native spinner, never a recovery whose
 *   playback was interrupted.
 *
 * The React `RecoveryFeedback` component only renders the Tailwind chip while
 * `recoveryDecision` says to; like the bridge/cover/preparing specs, only the
 * pure decision and its hoisted-fact adapter are pinned here.
 */

/** A normalized recovery status; the bridge's closed window is the default. */
function recovery(
  overrides: Partial<SiaRecoveryStatus> = {},
): SiaRecoveryStatus {
  return {
    active: false,
    available: true,
    reason: null,
    resumeSeconds: null,
    wantsPlay: null,
    ...overrides,
  };
}

/** The decision the current rule reaches; only a shown variant names a label. */
function shown(decision: RecoveryFeedbackDecision): null | {
  label: RecoveryLabel;
} {
  return decision.show ? { label: decision.label } : null;
}

/** A full SiaStatus whose recovery slice carries the given recovery status. */
function statusWithRecovery(recoveryStatus: SiaRecoveryStatus): SiaStatus {
  return { ...emptySiaStatus(), recovery: recoveryStatus };
}

describe("recoveryDecision (busy recovery chip)", () => {
  it("stays hidden while no recovery window is open", () => {
    expect(recoveryDecision(recovery())).toEqual({ show: false });
  });

  it("never shows busy on a closed window even with stale transient facts", () => {
    // The bridge already nulls transients when closed; this is defensive.
    expect(
      recoveryDecision(
        recovery({ active: false, reason: "network", wantsPlay: true }),
      ),
    ).toEqual({ show: false });
  });

  it("stays hidden for a non-play repair that will not resume playback", () => {
    // A pause-side repair restarts the source staying paused; only recoveries
    // that resume playback carry the busy chip.
    expect(
      recoveryDecision(
        recovery({ active: true, reason: "network", wantsPlay: false }),
      ),
    ).toEqual({ show: false });
  });

  it("stays hidden while an open recovery's resume intent is unknown", () => {
    expect(
      recoveryDecision(
        recovery({ active: true, reason: "network", wantsPlay: null }),
      ),
    ).toEqual({ show: false });
  });

  it("never labels a far seek as busy while playback is resuming", () => {
    // A user far-seek reopens the load with `reason: 'seek'` and
    // `wantsPlay: true`; that is ordinary seeking carried by the native
    // spinner, not failure recovery — so it must NOT look like a recovery.
    expect(
      recoveryDecision(
        recovery({ active: true, reason: "seek", wantsPlay: true }),
      ),
    ).toEqual({ show: false });
  });

  it("labels a resuming network recovery as reconnecting", () => {
    expect(
      recoveryDecision(
        recovery({ active: true, reason: "network", wantsPlay: true }),
      ),
    ).toEqual({ label: "reconnecting…", show: true });
  });

  it("labels a resuming decode recovery as recovering playback", () => {
    expect(
      recoveryDecision(
        recovery({ active: true, reason: "decode", wantsPlay: true }),
      ),
    ).toEqual({ label: "recovering playback…", show: true });
  });

  it("labels a resuming native recovery as recovering playback", () => {
    expect(
      recoveryDecision(
        recovery({ active: true, reason: "native", wantsPlay: true }),
      ),
    ).toEqual({ label: "recovering playback…", show: true });
  });

  it("only ever offers a recovery label (never the preparing label)", () => {
    // Recovery feedback is the typed recovery signal's job, never the
    // source-opening overlay's.
    expect(
      shown(
        recoveryDecision(
          recovery({ active: true, reason: "decode", wantsPlay: true }),
        ),
      ),
    ).toEqual({ label: "recovering playback…" });
  });
});

describe("recoveryDecisionFromStatus (fold the hoisted SiaStatus recovery slice)", () => {
  it("folds a resuming network recovery through to the reconnecting label", () => {
    const status = statusWithRecovery(
      recovery({ active: true, reason: "network", wantsPlay: true }),
    );
    expect(recoveryDecisionFromStatus(status)).toEqual({
      label: "reconnecting…",
      show: true,
    });
  });

  it("surfaces a closed window as silent", () => {
    expect(recoveryDecisionFromStatus(emptySiaStatus())).toEqual({
      show: false,
    });
  });

  it("surfaces a non-play repair as silent", () => {
    const status = statusWithRecovery(
      recovery({ active: true, reason: "decode", wantsPlay: false }),
    );
    expect(recoveryDecisionFromStatus(status)).toEqual({ show: false });
  });

  it("surfaces a far seek while playing as silent", () => {
    const status = statusWithRecovery(
      recovery({ active: true, reason: "seek", wantsPlay: true }),
    );
    expect(recoveryDecisionFromStatus(status)).toEqual({ show: false });
  });
});

describe("recoveryLabel (typed reason → chip label)", () => {
  it("maps a network recovery to the reconnecting label", () => {
    expect(recoveryLabel("network")).toBe("reconnecting…");
  });

  it("maps decode and native recoveries to the recovering-playback label", () => {
    expect(recoveryLabel("decode")).toBe("recovering playback…");
    expect(recoveryLabel("native")).toBe("recovering playback…");
  });
});
