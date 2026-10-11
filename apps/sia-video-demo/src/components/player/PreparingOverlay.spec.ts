import { describe, expect, it } from "vitest";
import type { PlaybackFacts } from "./PlaybackFactsBridge";
import { emptyPlaybackFacts } from "./PlaybackFactsBridge";
import type { PreparingDecision, PreparingFacts } from "./PreparingOverlay";
import {
  preparingBuffering,
  preparingDecision,
  preparingFactsFromPlayback,
  preparingRecoveryRepair,
  preparingSourceUsable,
} from "./PreparingOverlay";
import type { SiaRecoveryStatus } from "./SiaStatusBridge";

/**
 * Node unit tests for the pure "Preparing stream…" overlay decision, expressed
 * entirely in the hoisted typed Video.js v10 facts (plus an explicit local
 * user-gesture play-request flag) — never old native DOM listeners, ref
 * mirrors, timers, or log parsing.
 *
 * The historical rule is preserved verbatim: the overlay belongs to opening a
 * NEW source — a requested play still held below HAVE_FUTURE_DATA while the
 * current source has no usable (metadata/canplay) pipeline yet. Either play
 * intent lights it — the explicit stage-click gesture and a pending autoplay
 * intent for a user-chosen shared row — while a silent non-resuming recovery
 * repair (`wantsPlay: false`) keeps it hidden. Once the source is usable, a
 * later reload is a seek or recovery, and the native video.js loading spinner
 * carries it. Recovery feedback is deliberately NOT this overlay's job, so the
 * decision never labels a recovery.
 *
 * The React `PreparingOverlay` component only renders the Tailwind overlay
 * while `preparingDecision` says to; like the bridge/cover specs, only the
 * pure decision and its hoisted-fact adapters are pinned here.
 */

/** A facts slice reporting whether a buffered range is present. */
function bufferedFacts(buffered: boolean): PlaybackFacts {
  const base = emptyPlaybackFacts();
  return {
    ...base,
    buffer: {
      ...base.buffer,
      buffered: buffered ? [[0, 10]] : [],
      bufferedAvailable: buffered,
    },
  };
}

/**
 * Default PreparingFacts describe the mid-load state that lights the overlay:
 * a play was asked for, the element is paused, and data is still buffering
 * (below HAVE_FUTURE_DATA) on a source that is not usable yet.
 */
function decide(overrides: Partial<PreparingFacts> = {}): PreparingFacts {
  return {
    autoplayPending: false,
    buffering: false,
    paused: false,
    playRequested: false,
    recoveryRepair: false,
    sourceUsable: false,
    ...overrides,
  };
}

/** A facts slice reporting a known timeline duration (metadata loaded). */
function durationFacts(duration: number): PlaybackFacts {
  const base = emptyPlaybackFacts();
  return { ...base, time: { ...base.time, duration } };
}

/** A data-less facts slice: no buffered/seekable data, not started, paused. */
function inertFacts(): PlaybackFacts {
  return emptyPlaybackFacts();
}

/** A normalized recovery slice; the closed window is the default. */
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

/** A facts slice reporting whether the seekable timeline is known. */
function seekableFacts(seekable: boolean): PlaybackFacts {
  const base = emptyPlaybackFacts();
  return {
    ...base,
    buffer: {
      ...base.buffer,
      seekable: seekable ? [[0, 30]] : [],
      seekableAvailable: seekable,
    },
  };
}

/** The decision the current rule reaches; only a shown variant names a label. */
function shown(decision: PreparingDecision): null | { label: string } {
  return decision.show ? { label: decision.label } : null;
}

/** A facts slice reporting whether the media has started (played/seeked). */
function startedFacts(started: boolean): PlaybackFacts {
  const base = emptyPlaybackFacts();
  return { ...base, playback: { ...base.playback, started } };
}

describe("preparingDecision (historical source-opening rule)", () => {
  it("stays hidden unless a play was requested", () => {
    expect(
      preparingDecision(decide({ buffering: true, paused: true })),
    ).toEqual({ show: false });
  });

  it("stays hidden while the element is actually playing", () => {
    expect(
      preparingDecision(
        decide({ buffering: true, paused: false, playRequested: true }),
      ),
    ).toEqual({ show: false });
  });

  it("stays hidden once data is ready even before the play lands", () => {
    expect(
      preparingDecision(
        decide({ buffering: false, paused: true, playRequested: true }),
      ),
    ).toEqual({ show: false });
  });

  it("ends the preparing phase when a terminal media error is present", () => {
    const base = emptyPlaybackFacts();
    const facts = {
      ...base,
      error: { ...base.error, present: true },
    };
    expect(
      preparingFactsFromPlayback(facts, true, false, recovery()),
    ).toMatchObject({ sourceUsable: true });
    expect(
      preparingDecision(
        decide({
          buffering: true,
          paused: true,
          playRequested: true,
          sourceUsable: true,
        }),
      ),
    ).toEqual({ show: false });
  });

  it("labels a play requested while still buffering as preparing", () => {
    expect(
      preparingDecision(
        decide({ buffering: true, paused: true, playRequested: true }),
      ),
    ).toEqual({ label: "preparing stream…", show: true });
  });

  it("labels a pending autoplay intent as preparing while still buffering", () => {
    // A shared row user selection / fragment preselection holds a pending
    // autoplay intent for the opening source; that play intent lights the
    // overlay exactly like the explicit stage-click gesture does.
    expect(
      preparingDecision(
        decide({ autoplayPending: true, buffering: true, paused: true }),
      ),
    ).toEqual({ label: "preparing stream…", show: true });
  });

  it("activates once either intent is pending while still buffering", () => {
    // Both the stage-click gesture and the pending autoplay intent light the
    // overlay; only the absence of both leaves it hidden.
    expect(
      preparingDecision(
        decide({ buffering: true, paused: true, playRequested: true }),
      ),
    ).toEqual({ label: "preparing stream…", show: true });
    expect(
      preparingDecision(
        decide({ autoplayPending: true, buffering: true, paused: true }),
      ),
    ).toEqual({ label: "preparing stream…", show: true });
  });

  it("gates a pending autoplay intent behind the source-usability check", () => {
    // The autoplay intent is a play intent, not an override: it still hides
    // once the current source is usable (a reload is then a seek/recovery).
    expect(
      preparingDecision(
        decide({
          autoplayPending: true,
          buffering: true,
          paused: true,
          sourceUsable: true,
        }),
      ),
    ).toEqual({ show: false });
  });

  it("gates a pending autoplay intent behind paused and buffering", () => {
    expect(
      preparingDecision(
        decide({ autoplayPending: true, buffering: false, paused: true }),
      ),
    ).toEqual({ show: false });
    expect(
      preparingDecision(
        decide({ autoplayPending: true, buffering: true, paused: false }),
      ),
    ).toEqual({ show: false });
  });

  it("stays hidden through a silent non-play repair even with an autoplay intent", () => {
    // A wantsPlay:false repair restarts the source staying paused; it stays
    // silent — even a pending autoplay intent must not resurrect the opening
    // overlay over an in-flight repair.
    expect(
      preparingDecision(
        decide({
          autoplayPending: true,
          buffering: true,
          paused: true,
          recoveryRepair: true,
        }),
      ),
    ).toEqual({ show: false });
  });

  it("stays hidden through a silent non-play repair even with a stage click", () => {
    expect(
      preparingDecision(
        decide({
          buffering: true,
          paused: true,
          playRequested: true,
          recoveryRepair: true,
        }),
      ),
    ).toEqual({ show: false });
  });

  it("hides on a reload/seek once the current source is usable", () => {
    // A mid-playback seek/recovery re-runs the load on the SAME source: it is
    // ordinary playback work, so the native spinner, not this overlay, carries
    // it. The usable check alone is enough to hide it.
    expect(
      preparingDecision(
        decide({
          buffering: true,
          paused: true,
          playRequested: true,
          sourceUsable: true,
        }),
      ),
    ).toEqual({ show: false });
  });

  it("only ever offers the preparing label", () => {
    // Recovery is the typed recovery signal's job, never this overlay: every
    // shown overlay carries the preparing label only.
    expect(
      shown(
        preparingDecision(
          decide({ buffering: true, paused: true, playRequested: true }),
        ),
      ),
    ).toEqual({ label: "preparing stream…" });
  });
});

describe("preparingBuffering (still below HAVE_FUTURE_DATA)", () => {
  it("is true while no data is buffered yet", () => {
    expect(preparingBuffering(inertFacts())).toBe(true);
  });

  it("is true with a seekable timeline but still no buffered frame", () => {
    // Metadata alone is not future data: the source can be usable (and thus
    // handled by the usable gate) without a buffered range being present.
    expect(preparingBuffering(seekableFacts(true))).toBe(true);
  });

  it("is false once a buffered range is present", () => {
    expect(preparingBuffering(bufferedFacts(true))).toBe(false);
  });
});

describe("preparingSourceUsable (current source reached metadata/canplay)", () => {
  it("is false for a data-less source that has not started", () => {
    expect(preparingSourceUsable(inertFacts())).toBe(false);
  });

  it("is false with only a buffered range and no metadata signal yet", () => {
    expect(preparingSourceUsable(bufferedFacts(true))).toBe(false);
  });

  it("is true once the seekable timeline is known", () => {
    expect(preparingSourceUsable(seekableFacts(true))).toBe(true);
  });

  it("is true once the duration is known", () => {
    expect(preparingSourceUsable(durationFacts(120))).toBe(true);
  });

  it("is true once playback has started", () => {
    expect(preparingSourceUsable(startedFacts(true))).toBe(true);
  });
});

describe("preparingFactsFromPlayback (hoisted typed facts into the decision)", () => {
  it("maps a data-less paused element plus a play request onto the mid-load state", () => {
    expect(
      preparingFactsFromPlayback(inertFacts(), true, false, recovery()),
    ).toEqual({
      autoplayPending: false,
      buffering: true,
      paused: true,
      playRequested: true,
      recoveryRepair: false,
      sourceUsable: false,
    });
  });

  it("maps a playing element with buffered data onto non-buffering, unpaused", () => {
    const base = emptyPlaybackFacts();
    const playing: PlaybackFacts = {
      ...base,
      buffer: { ...base.buffer, buffered: [[0, 10]], bufferedAvailable: true },
      playback: { ...base.playback, paused: false },
    };
    expect(preparingFactsFromPlayback(playing, true, true, recovery())).toEqual(
      {
        autoplayPending: true,
        buffering: false,
        paused: false,
        playRequested: true,
        recoveryRepair: false,
        sourceUsable: false,
      },
    );
  });

  it("maps the absence of a play request through unchanged", () => {
    expect(
      preparingFactsFromPlayback(inertFacts(), false, false, recovery()),
    ).toEqual({
      autoplayPending: false,
      buffering: true,
      paused: true,
      playRequested: false,
      recoveryRepair: false,
      sourceUsable: false,
    });
  });

  it("maps a pending autoplay intent through to the play-intent fact", () => {
    expect(
      preparingFactsFromPlayback(inertFacts(), false, true, recovery()),
    ).toEqual({
      autoplayPending: true,
      buffering: true,
      paused: true,
      playRequested: false,
      recoveryRepair: false,
      sourceUsable: false,
    });
  });

  it("maps an already-started source as usable regardless of any play intent", () => {
    expect(
      preparingFactsFromPlayback(startedFacts(true), true, false, recovery()),
    ).toEqual({
      autoplayPending: false,
      buffering: true,
      paused: true,
      playRequested: true,
      recoveryRepair: false,
      sourceUsable: true,
    });
  });

  it("maps a silent non-play repair onto the recovery-repair fact", () => {
    expect(
      preparingFactsFromPlayback(
        inertFacts(),
        false,
        true,
        recovery({ active: true, reason: "network", wantsPlay: false }),
      ),
    ).toEqual({
      autoplayPending: true,
      buffering: true,
      paused: true,
      playRequested: false,
      recoveryRepair: true,
      sourceUsable: false,
    });
  });
});

describe("preparingRecoveryRepair (silent non-resuming recovery in flight)", () => {
  it("is false while no recovery window is open", () => {
    expect(preparingRecoveryRepair(recovery())).toBe(false);
  });

  it("is true for a silent wantsPlay:false repair", () => {
    expect(
      preparingRecoveryRepair(
        recovery({ active: true, reason: "network", wantsPlay: false }),
      ),
    ).toBe(true);
  });

  it("is true while the resume intent is unknown", () => {
    expect(
      preparingRecoveryRepair(
        recovery({ active: true, reason: "network", wantsPlay: null }),
      ),
    ).toBe(true);
  });

  it("is false for a play-resuming recovery", () => {
    expect(
      preparingRecoveryRepair(
        recovery({ active: true, reason: "decode", wantsPlay: true }),
      ),
    ).toBe(false);
  });
});
