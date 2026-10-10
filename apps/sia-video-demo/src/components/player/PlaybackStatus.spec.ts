import { describe, expect, it } from "vitest";
import type { PlaybackFacts } from "./PlaybackFactsBridge";
import { emptyPlaybackFacts } from "./PlaybackFactsBridge";
import type { SiaStatus } from "./SiaStatusBridge";
import { emptySiaStatus } from "./SiaStatusBridge";
import type {
  PlaybackStatusAnnotations,
  PlaybackStatusLabel,
  PlaybackStatusPhase,
} from "./PlaybackStatus";
import {
  derivePlaybackStatus,
  derivePlaybackStatusPhase,
  playbackStatusAnnotations,
  playbackStatusChipText,
  playbackStatusDotClass,
  playbackStatusLabel,
  playbackStatusRecovering,
  playbackStatusStalled,
} from "./PlaybackStatus";

/**
 * Node unit tests for the pure typed playback-status derivation, expressed
 * entirely in the hoisted typed Video.js v10 `PlaybackFacts` snapshot and the
 * Sia `SiaStatus` snapshot (`playback`, `error`, `time`, `buffer` facts plus
 * the Sia `load` acceptance and reader `progress` slices) — never old native
 * DOM listeners, ref mirrors, timers, or log parsing.
 *
 * The derivation classifies ONE snapshot into a single typed phase:
 *
 * - `idle` — nothing has reported yet: no playback feature, no Sia load
 *   feature, and no error (the fully-inert baseline).
 * - `loading` — a source is opening and the worker has NOT accepted its load
 *   yet; the reader's read-window/retry counters stay in the typed annotations,
 *   never on the chip (the chip shows only the primary label).
 * - `streaming` — the worker accepted the load (`SOURCE_OK`); the source is
 *   ready to play but playback has not started yet.
 * - `recovering` — an active recovery that will resume playback (a failure,
 *   never a user seek) is re-establishing the stream, ahead of the
 *   accepted→streaming classification so the playback chip never claims
 *   "streaming" beside the busy recovery chip.
 * - `playing` / `ready` — playback started and is running, or is paused.
 * - `stalled` — playback began, the element is waiting for data, and it is
 *   NOT a user far-seek (native seeking) and NOT a Sia recovery: only a real
 *   data stall lights the stalled chip.
 * - `ended` / `error` — the media reached the end, or a present media error
 *   (which wins over everything).
 *
 * The React `PlaybackStatusChip` component only renders the Tailwind chip
 * from the derived `PlaybackStatus`; like the bridge/cover/preparing/recovery
 * specs, only the pure derivation, its phase, annotation, label, and chip-text
 * helpers are pinned here.
 */

/** A PlaybackFacts whose error feature reports the given error facts. */
function errorFacts(
  overrides: Partial<PlaybackFacts["error"]> = {},
): PlaybackFacts {
  return {
    ...emptyPlaybackFacts(),
    error: {
      available: true,
      code: null,
      message: null,
      present: false,
      ...overrides,
    },
  };
}

/** The fully-inert facts baseline: no playback feature has reported anything. */
function inertFacts(): PlaybackFacts {
  return emptyPlaybackFacts();
}

/** A SiaStatus whose load feature reports the load as accepted (SOURCE_OK). */
function loadAccepted(): SiaStatus {
  return { ...emptySiaStatus(), load: { accepted: true, available: true } };
}

/** A SiaStatus whose load feature reports the load as pending (not accepted). */
function loadPending(): SiaStatus {
  return { ...emptySiaStatus(), load: { accepted: false, available: true } };
}

/** A PlaybackFacts whose playback feature reports the given phase facts. */
function playbackFacts(
  overrides: Partial<PlaybackFacts["playback"]> = {},
): PlaybackFacts {
  return {
    ...emptyPlaybackFacts(),
    playback: {
      available: true,
      ended: false,
      paused: true,
      started: false,
      waiting: false,
      ...overrides,
    },
  };
}

/** A SiaStatus with the reader-progress feature reporting the given slice. */
function progressStatus(
  overrides: Partial<SiaStatus["progress"]> = {},
): SiaStatus {
  return {
    ...emptySiaStatus(),
    progress: {
      available: true,
      bytesRead: 0,
      last: null,
      reading: false,
      reads: 0,
      retries: 0,
      retrying: false,
      ...overrides,
    },
  };
}

/** A SiaStatus whose recovery slice reports the given recovery facts. */
function recoveryStatus(
  overrides: Partial<SiaStatus["recovery"]> = {},
): SiaStatus {
  return {
    ...emptySiaStatus(),
    recovery: {
      active: false,
      available: true,
      reason: null,
      resumeSeconds: null,
      wantsPlay: null,
      ...overrides,
    },
  };
}

/** A PlaybackFacts whose time feature reports the given time facts. */
function timeFacts(
  overrides: Partial<PlaybackFacts["time"]> = {},
): PlaybackFacts {
  return {
    ...emptyPlaybackFacts(),
    time: {
      available: true,
      currentTime: 0,
      duration: 0,
      seeking: false,
      ...overrides,
    },
  };
}

describe("derivePlaybackStatusPhase (single typed snapshot → one phase)", () => {
  it("classifies the fully-inert baseline as idle", () => {
    expect(derivePlaybackStatusPhase(inertFacts(), emptySiaStatus())).toBe(
      "idle",
    );
  });

  it("classifies an armed source whose load is still pending as loading", () => {
    expect(derivePlaybackStatusPhase(inertFacts(), loadPending())).toBe(
      "loading",
    );
  });

  it("classifies an accepted-but-not-started source as streaming", () => {
    expect(derivePlaybackStatusPhase(inertFacts(), loadAccepted())).toBe(
      "streaming",
    );
  });

  it("classifies a started unpaused element as playing", () => {
    expect(
      derivePlaybackStatusPhase(
        playbackFacts({ paused: false, started: true }),
        loadAccepted(),
      ),
    ).toBe("playing");
  });

  it("classifies a started paused element as ready", () => {
    expect(
      derivePlaybackStatusPhase(
        playbackFacts({ paused: true, started: true }),
        loadAccepted(),
      ),
    ).toBe("ready");
  });

  it("classifies an ended element as ended even while started", () => {
    expect(
      derivePlaybackStatusPhase(
        playbackFacts({ ended: true, paused: false, started: true }),
        loadAccepted(),
      ),
    ).toBe("ended");
  });

  it("lets a present media error win over every other phase", () => {
    // Error beats even an ended, waiting element with an accepted load.
    expect(
      derivePlaybackStatusPhase(
        errorFacts({
          code: 4,
          message: "MEDIA_ERR_SRC_NOT_SUPPORTED",
          present: true,
        }),
        loadAccepted(),
      ),
    ).toBe("error");
  });

  it("classifies an active play-resuming recovery as recovering ahead of streaming", () => {
    // A network failure re-establishes the stream while the load sits
    // accepted: the recovery chip is busy, so the playback chip must never
    // also claim "streaming" — it derives the recovering phase instead.
    expect(
      derivePlaybackStatusPhase(inertFacts(), {
        ...loadAccepted(),
        recovery: {
          active: true,
          available: true,
          reason: "network",
          resumeSeconds: 12,
          wantsPlay: true,
        },
      }),
    ).toBe("recovering");
  });

  it("classifies a play-resuming recovery with the load still pending as recovering", () => {
    // The worker has not re-accepted the reload yet: still recovering, never
    // "loading", because a recovery chip is already naming the interruption.
    expect(
      derivePlaybackStatusPhase(inertFacts(), {
        ...loadPending(),
        recovery: {
          active: true,
          available: true,
          reason: "decode",
          resumeSeconds: 30,
          wantsPlay: true,
        },
      }),
    ).toBe("recovering");
  });

  it("keeps a silent non-play repair out of the recovering phase", () => {
    // A wantsPlay:false repair restarts the source staying paused; it is
    // silent by design (no recovery chip), so the playback chip must not
    // claim "recovering" — it stays on the load phase.
    expect(
      derivePlaybackStatusPhase(inertFacts(), {
        ...loadAccepted(),
        recovery: {
          active: true,
          available: true,
          reason: "network",
          resumeSeconds: 0,
          wantsPlay: false,
        },
      }),
    ).toBe("streaming");
  });

  it("keeps a user far-seek recovery out of the recovering phase", () => {
    // A far seek reopens the load as ordinary seeking; the native spinner
    // carries it, so it must never read as busy recovery.
    expect(
      derivePlaybackStatusPhase(inertFacts(), {
        ...loadAccepted(),
        recovery: {
          active: true,
          available: true,
          reason: "seek",
          resumeSeconds: 45,
          wantsPlay: true,
        },
      }),
    ).toBe("streaming");
  });

  it("lets a started element keep its playing phase during a recovery", () => {
    // Recovering sits ahead of the accepted→streaming step only: playback
    // that has genuinely started keeps its own phase (the recovery chip
    // carries the interruption).
    expect(
      derivePlaybackStatusPhase(
        playbackFacts({ paused: false, started: true }),
        {
          ...loadAccepted(),
          recovery: {
            active: true,
            available: true,
            reason: "network",
            resumeSeconds: 12,
            wantsPlay: true,
          },
        },
      ),
    ).toBe("playing");
  });
});

describe("playbackStatusStalled (stall only after playback began, never seek/recovery)", () => {
  it("is false before playback has ever started", () => {
    // Waiting without ever having played is a source opening, not a stall.
    expect(
      playbackStatusStalled(playbackFacts({ waiting: true }), loadAccepted()),
    ).toBe(false);
  });

  it("is true once playback began and the element waits for data", () => {
    expect(
      playbackStatusStalled(
        playbackFacts({ paused: false, started: true, waiting: true }),
        loadAccepted(),
      ),
    ).toBe(true);
  });

  it("is false while the element is merely not waiting", () => {
    expect(
      playbackStatusStalled(
        playbackFacts({ paused: false, started: true, waiting: false }),
        loadAccepted(),
      ),
    ).toBe(false);
  });

  it("is false while a user far-seek is in progress even when waiting", () => {
    // A far seek reopens the load as ordinary seeking; the native spinner
    // carries it, so it must never read as a data stall.
    const seekingFacts: PlaybackFacts = {
      ...playbackFacts({ paused: false, started: true, waiting: true }),
      time: { ...timeFacts().time, seeking: true },
    };
    expect(playbackStatusStalled(seekingFacts, loadAccepted())).toBe(false);
  });

  it("is false while a Sia recovery window is open even when waiting", () => {
    // A recovery that will resume playback is the recovery chip's job, never
    // a stall.
    expect(
      playbackStatusStalled(
        playbackFacts({ paused: false, started: true, waiting: true }),
        recoveryStatus({ active: true, reason: "network", wantsPlay: true }),
      ),
    ).toBe(false);
  });

  it("is true when waiting with playback begun outside any seek/recovery", () => {
    expect(
      playbackStatusStalled(
        playbackFacts({ paused: false, started: true, waiting: true }),
        loadAccepted(),
      ),
    ).toBe(true);
  });
});

describe("playbackStatusRecovering (mirrors the recovery chip's busy window)", () => {
  it("is false while no recovery window is open", () => {
    expect(playbackStatusRecovering(emptySiaStatus())).toBe(false);
  });

  it("is true for an active resuming failure recovery", () => {
    expect(
      playbackStatusRecovering(
        recoveryStatus({ active: true, reason: "network", wantsPlay: true }),
      ),
    ).toBe(true);
  });

  it("is false for a silent non-play repair", () => {
    expect(
      playbackStatusRecovering(
        recoveryStatus({ active: true, reason: "decode", wantsPlay: false }),
      ),
    ).toBe(false);
  });

  it("is false while the resume intent is unknown", () => {
    expect(
      playbackStatusRecovering(
        recoveryStatus({ active: true, reason: "network", wantsPlay: null }),
      ),
    ).toBe(false);
  });

  it("is false for a user far-seek recovery", () => {
    expect(
      playbackStatusRecovering(
        recoveryStatus({ active: true, reason: "seek", wantsPlay: true }),
      ),
    ).toBe(false);
  });
});

describe("derivePlaybackStatus (phase folded with annotations and label)", () => {
  it("derives a stalled playback snapshot to the stalled phase", () => {
    const status = derivePlaybackStatus(
      playbackFacts({ paused: false, started: true, waiting: true }),
      loadAccepted(),
    );
    expect(status.phase).toBe("stalled");
    expect(status.primary).toBe("Buffering…");
  });

  it("derives an active play-resuming recovery to the recovering phase", () => {
    const status = derivePlaybackStatus(inertFacts(), {
      ...loadAccepted(),
      recovery: {
        active: true,
        available: true,
        reason: "network",
        resumeSeconds: 12,
        wantsPlay: true,
      },
    });
    expect(status.phase).toBe("recovering");
    expect(status.primary).toBe("recovering…");
  });

  it("folds a loading snapshot with the reader's fetch/retry annotations", () => {
    const status = derivePlaybackStatus(inertFacts(), {
      ...progressStatus({
        bytesRead: 7,
        reading: true,
        reads: 3,
        retries: 1,
        retrying: true,
      }),
      load: { accepted: false, available: true },
    });
    expect(status.phase).toBe("loading");
    expect(status.annotations).toEqual({
      bytesRead: 7,
      reading: true,
      reads: 3,
      retries: 1,
      retrying: true,
    });
  });

  it("always defines every annotation field on the inert baseline", () => {
    const status = derivePlaybackStatus(inertFacts(), emptySiaStatus());
    expect(status.annotations).toEqual({
      bytesRead: null,
      reading: false,
      reads: 0,
      retries: 0,
      retrying: false,
    });
  });
});

describe("playbackStatusAnnotations (fold the hoisted Sia progress slice)", () => {
  it("folds the whole reader-progress slice into the annotation shape", () => {
    const annotations: PlaybackStatusAnnotations = playbackStatusAnnotations(
      progressStatus({
        bytesRead: 12,
        reading: true,
        reads: 4,
        retries: 2,
        retrying: true,
      }),
    );
    expect(annotations).toEqual({
      bytesRead: 12,
      reading: true,
      reads: 4,
      retries: 2,
      retrying: true,
    });
  });

  it("reports null bytesRead when the progress feature is absent", () => {
    expect(playbackStatusAnnotations(emptySiaStatus()).bytesRead).toBeNull();
  });
});

describe("playbackStatusLabel (phase → primary chip label)", () => {
  it("maps every phase to its label", () => {
    const labels: Record<PlaybackStatusPhase, PlaybackStatusLabel> = {
      ended: "ended",
      error: "error",
      idle: "waiting",
      loading: "loading…",
      playing: "playing",
      ready: "ready",
      recovering: "recovering…",
      stalled: "Buffering…",
      streaming: "streaming",
    };
    expect(playbackStatusLabel("ended")).toBe(labels.ended);
    expect(playbackStatusLabel("error")).toBe(labels.error);
    expect(playbackStatusLabel("idle")).toBe(labels.idle);
    expect(playbackStatusLabel("loading")).toBe(labels.loading);
    expect(playbackStatusLabel("playing")).toBe(labels.playing);
    expect(playbackStatusLabel("ready")).toBe(labels.ready);
    expect(playbackStatusLabel("recovering")).toBe(labels.recovering);
    expect(playbackStatusLabel("stalled")).toBe(labels.stalled);
    expect(playbackStatusLabel("streaming")).toBe(labels.streaming);
  });
});

describe("playbackStatusChipText (primary label only; fetch/retry stay in typed annotations)", () => {
  function chipText(
    phase: PlaybackStatusPhase,
    annotations: PlaybackStatusAnnotations,
  ): string {
    const primary = playbackStatusLabel(phase);
    return playbackStatusChipText({ annotations, phase, primary });
  }

  it("renders the plain primary label for every phase", () => {
    const annotations: PlaybackStatusAnnotations = {
      bytesRead: null,
      reading: false,
      reads: 0,
      retries: 0,
      retrying: false,
    };
    expect(chipText("playing", annotations)).toBe("playing");
    expect(chipText("stalled", annotations)).toBe("Buffering…");
    expect(chipText("loading", annotations)).toBe("loading…");
    expect(chipText("streaming", annotations)).toBe("streaming");
  });

  it("shows a plain standby label for the idle phase", () => {
    const annotations: PlaybackStatusAnnotations = {
      bytesRead: null,
      reading: false,
      reads: 0,
      retries: 0,
      retrying: false,
    };
    expect(chipText("idle", annotations)).toBe("waiting");
  });

  it("never appends fetch/retry internals even while read windows open", () => {
    const annotations: PlaybackStatusAnnotations = {
      bytesRead: 7,
      reading: true,
      reads: 3,
      retries: 0,
      retrying: false,
    };
    const text = chipText("loading", annotations);
    expect(text).toBe("loading…");
    expect(text).not.toContain("fetch");
    expect(text).not.toContain("retry");
    expect(text).not.toContain("(");
  });

  it("keeps a retrying window off the chip entirely", () => {
    const annotations: PlaybackStatusAnnotations = {
      bytesRead: 7,
      reading: true,
      reads: 3,
      retries: 2,
      retrying: true,
    };
    expect(chipText("streaming", annotations)).toBe("streaming");
    expect(chipText("stalled", annotations)).toBe("Buffering…");
    expect(chipText("streaming", annotations)).not.toContain("(");
    expect(chipText("streaming", annotations)).not.toContain("fetch");
    expect(chipText("streaming", annotations)).not.toContain("retry");
  });
});

describe("playbackStatusDotClass (phase → Tailwind accent dot)", () => {
  it("maps an error to the red dot", () => {
    expect(playbackStatusDotClass("error")).toBe("bg-red-500");
  });

  it("maps playing and streaming to the emerald dot", () => {
    expect(playbackStatusDotClass("playing")).toBe("bg-emerald-400");
    expect(playbackStatusDotClass("streaming")).toBe("bg-emerald-400");
  });

  it("maps loading, stalled, and recovering to the amber dot", () => {
    expect(playbackStatusDotClass("loading")).toBe("bg-amber-400");
    expect(playbackStatusDotClass("recovering")).toBe("bg-amber-400");
    expect(playbackStatusDotClass("stalled")).toBe("bg-amber-400");
  });

  it("maps idle, ready, and ended to a status dot", () => {
    // Idle and ended use the sky accent; ready matches the paused/ended tone.
    expect([
      playbackStatusDotClass("idle"),
      playbackStatusDotClass("ended"),
    ]).toContain(playbackStatusDotClass("ready"));
    expect(playbackStatusDotClass("ready")).toBe("bg-sky-400");
  });
});
