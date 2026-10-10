import { describe, expect, it } from "vitest";
import type { PlaybackFacts } from "./PlaybackFactsBridge";
import { emptyPlaybackFacts } from "./PlaybackFactsBridge";
import type { SiaStatus } from "./SiaStatusBridge";
import { emptySiaStatus } from "./SiaStatusBridge";
import {
  initialSourceSwitchCoverState,
  type SourceSwitchCoverAction,
  sourceSwitchCoverCurrentReveal,
  sourceSwitchCoverLoadReset,
  sourceSwitchCoverReducer,
  type SourceSwitchCoverState,
} from "./SourceSwitchCover";

/**
 * Node unit tests for the pure source-switch cover decision. The cover is the
 * only historical source-switch overlay behavior: NO cover for the first armed
 * source, an opaque loading cover while switching between DISTINCT
 * selected-source identities, and a reveal ONLY when the CURRENT source
 * reports a suitable Video.js/Sia store fact.
 *
 * The "current source" boundary is the SIA LOAD RESET — `load.accepted: false`,
 * the typed reset the host emits exactly once per load boundary — NOT the
 * sticky `playback.started` flag. A replaced MediaSource keeps the superseded
 * source's `started: true` (and `currentTime > 0`) alive until (and sometimes
 * past) the fresh resource attaches, so waiting for `started: false` would
 * leave the cover permanently armed. Once the load reset boundary is observed,
 * a reveal fact is trustworthy only if it is per-load (a present media error, a
 * nonempty accepted load) or a `started` that was observed NOT-started since
 * the current identity armed — a stale `started: true` from the old source can
 * neither reveal nor update the current load.
 *
 * The reducer is the whole decision: the React `SourceSwitchCover` component
 * only tracks the displayed source's reload identity and feeds it (plus the
 * hoisted facts/status snapshots) into `sourceSwitchCoverReducer`. Like the
 * bridge specs, the component itself is not exercised here — only the pure
 * decision is pinned.
 */

/** A facts slice reporting whether a media error is present. */
function errorFacts(present: boolean): PlaybackFacts {
  const base = emptyPlaybackFacts();
  return {
    ...base,
    error: {
      ...base.error,
      code: present ? 4 : null,
      message: present ? "MEDIA_ERR_SRC_NOT_SUPPORTED" : null,
      present,
    },
  };
}

function inertFacts(): PlaybackFacts {
  return emptyPlaybackFacts();
}

function inertStatus(): SiaStatus {
  return emptySiaStatus();
}

/** A status slice for an accepted/unaccepted load with a byte-progress count. */
function loadStatus(accepted: boolean, bytesRead: number): SiaStatus {
  const base = emptySiaStatus();
  return {
    ...base,
    load: { ...base.load, accepted, available: true },
    progress: { ...base.progress, available: true, bytesRead },
  };
}

/** Runs a captured reducer state through a sequence of snapshot actions. */
function reduce(
  actions: readonly SourceSwitchCoverAction[],
  from: SourceSwitchCoverState = initialSourceSwitchCoverState(),
): SourceSwitchCoverState {
  return actions.reduce(
    (state, action) => sourceSwitchCoverReducer(state, action),
    from,
  );
}

/** Folds the current snapshot the reducer consumes into a reducer action. */
function snapshot(
  identity: null | string,
  facts: PlaybackFacts = inertFacts(),
  status: SiaStatus = inertStatus(),
): SourceSwitchCoverAction {
  return { facts, identity, status, type: "snapshot" };
}

/** A playback slice reporting whether the CURRENT media has started. */
function startedFacts(started: boolean): PlaybackFacts {
  const base = emptyPlaybackFacts();
  return { ...base, playback: { ...base.playback, started } };
}

describe("initialSourceSwitchCoverState", () => {
  it("is fully idle: no identity seen, nothing armed, cover hidden", () => {
    expect(initialSourceSwitchCoverState()).toEqual({
      armedFor: null,
      boundarySeen: false,
      lastIdentity: null,
      startedResetSeen: false,
      visible: false,
    });
  });
});

describe("sourceSwitchCoverLoadReset (the CURRENT-source boundary)", () => {
  it("is true while the Sia load reports unaccepted (its reset state)", () => {
    expect(sourceSwitchCoverLoadReset(inertStatus())).toBe(true);
    expect(sourceSwitchCoverLoadReset(loadStatus(false, 0))).toBe(true);
    expect(sourceSwitchCoverLoadReset(loadStatus(false, 4))).toBe(true);
  });

  it("is false while the Sia load reports accepted", () => {
    expect(sourceSwitchCoverLoadReset(loadStatus(true, 0))).toBe(false);
    expect(sourceSwitchCoverLoadReset(loadStatus(true, 4))).toBe(false);
  });
});

describe("sourceSwitchCoverCurrentReveal (a CURRENT-source reveal after the reset)", () => {
  it("reveals on a present media error regardless of the started gate", () => {
    expect(
      sourceSwitchCoverCurrentReveal(errorFacts(true), inertStatus(), false),
    ).toBe(true);
  });

  it("reveals on a nonempty accepted load regardless of the started gate", () => {
    expect(
      sourceSwitchCoverCurrentReveal(inertFacts(), loadStatus(true, 4), false),
    ).toBe(true);
  });

  it("does NOT reveal on an accepted-but-empty load", () => {
    expect(
      sourceSwitchCoverCurrentReveal(inertFacts(), loadStatus(true, 0), true),
    ).toBe(false);
  });

  it("reveals on playback started ONLY when the current identity was observed not-started", () => {
    expect(
      sourceSwitchCoverCurrentReveal(startedFacts(true), inertStatus(), true),
    ).toBe(true);
    expect(
      sourceSwitchCoverCurrentReveal(startedFacts(true), inertStatus(), false),
    ).toBe(false);
  });

  it("is false for an inert snapshot", () => {
    expect(
      sourceSwitchCoverCurrentReveal(inertFacts(), inertStatus(), true),
    ).toBe(false);
  });
});

describe("sourceSwitchCoverReducer (historical cover behavior)", () => {
  it("shows no cover for the FIRST armed source", () => {
    const state = reduce([snapshot("publish|object-a|idx")]);
    expect(state).toEqual({
      armedFor: null,
      boundarySeen: false,
      lastIdentity: "publish|object-a|idx",
      startedResetSeen: false,
      visible: false,
    });
  });

  it("arms an opaque cover when switching between DISTINCT identities", () => {
    const state = reduce([
      snapshot("publish|object-a|idx"),
      snapshot("publish|object-b|idx"),
    ]);
    expect(state).toEqual({
      armedFor: "publish|object-b|idx",
      boundarySeen: true,
      lastIdentity: "publish|object-b|idx",
      startedResetSeen: true,
      visible: true,
    });
  });

  it("keeps the cover armed while the same identity stays mid-load", () => {
    const state = reduce([
      snapshot("A"),
      snapshot("B"),
      snapshot("B"),
      snapshot("B"),
    ]);
    expect(state.visible).toBe(true);
    expect(state.armedFor).toBe("B");
  });

  it("does NOT treat a stale previous-source fact as the boundary before the current load resets", () => {
    // A is playing and its load is ACCEPTED. A switch to B arrives BEFORE the
    // current load's reset boundary, so the hoisted Sia load is still A's
    // `accepted: true` and playback is still A's `started: true`. Neither may
    // count as B's boundary: the cover waits for the Sia load reset
    // (`accepted: false`).
    const state = reduce([
      snapshot("A"),
      snapshot("A", startedFacts(true), loadStatus(true, 4)),
      snapshot("B", startedFacts(true), loadStatus(true, 4)),
      snapshot("B", startedFacts(true), loadStatus(true, 4)),
    ]);
    expect(state.visible).toBe(true);
    expect(state.armedFor).toBe("B");
    expect(state.boundarySeen).toBe(false);
  });

  it("uses the Sia load reset as the boundary even while the stale started stays true", () => {
    // A is playing (started), then B's load boundary resets (`accepted:false`)
    // while the element STILL reports the superseded source's `started: true`.
    // The boundary must be observed — the reducer must NOT keep waiting for a
    // `started: false` that may never arrive (the permanent-cover bug). The
    // cover still stays armed because stale `started: true` cannot reveal.
    const state = reduce([
      snapshot("A", startedFacts(true), loadStatus(true, 4)),
      snapshot("B", startedFacts(true), loadStatus(true, 4)),
      snapshot("B", startedFacts(true), loadStatus(false, 0)),
    ]);
    expect(state.visible).toBe(true);
    expect(state.armedFor).toBe("B");
    expect(state.boundarySeen).toBe(true);
    expect(state.startedResetSeen).toBe(false);
  });

  it("reveals only AFTER the reset boundary, then a suitable current-source fact", () => {
    const state = reduce([
      snapshot("A", startedFacts(true), loadStatus(true, 4)),
      snapshot("A", startedFacts(true), loadStatus(true, 4)),
      // Distinct switch; A's stale accepted+started fact cannot reveal yet.
      snapshot("B", startedFacts(true), loadStatus(true, 4)),
      // The current B-load boundary resets the store: load unaccepted, and
      // playback genuinely not-started (the fresh resource is HAVE_NOTHING).
      snapshot("B", startedFacts(false), loadStatus(false, 0)),
      // B genuinely starts (a fresh started observed after the not-started
      // reset): reveal.
      snapshot("B", startedFacts(true), loadStatus(false, 0)),
    ]);
    expect(state).toEqual({
      armedFor: null,
      boundarySeen: false,
      lastIdentity: "B",
      startedResetSeen: false,
      visible: false,
    });
  });

  it("reveals on a nonempty accepted load from the current source", () => {
    const state = reduce([
      snapshot("A"),
      snapshot("B"),
      snapshot("B", inertFacts(), loadStatus(true, 8)),
    ]);
    expect(state.visible).toBe(false);
  });

  it("does NOT reveal on an accepted but still empty load", () => {
    const state = reduce([
      snapshot("A"),
      snapshot("B"),
      snapshot("B", inertFacts(), loadStatus(true, 0)),
    ]);
    expect(state.visible).toBe(true);
  });

  it("reveals on a present error from the current source", () => {
    const state = reduce([
      snapshot("A"),
      snapshot("B"),
      snapshot("B", errorFacts(true)),
    ]);
    expect(state.visible).toBe(false);
  });

  it("never re-covers the same identity once revealed", () => {
    const state = reduce([
      snapshot("A"),
      snapshot("B"),
      snapshot("B", inertFacts(), loadStatus(true, 8)),
      // The load transiently looks un-ready again (e.g. a stall) — the cover
      // must NOT come back for the same already-revealed identity.
      snapshot("B"),
      snapshot("B"),
    ]);
    expect(state.visible).toBe(false);
    expect(state.armedFor).toBeNull();
  });

  it("re-arms when a FURTHER distinct source arrives after a reveal", () => {
    const state = reduce([
      snapshot("A"),
      snapshot("B"),
      snapshot("B", startedFacts(true)),
      snapshot("C"),
    ]);
    expect(state.visible).toBe(true);
    expect(state.armedFor).toBe("C");
  });

  it("resets to idle when the selection unarms", () => {
    const state = reduce([snapshot("A"), snapshot("B"), snapshot(null)]);
    expect(state).toEqual(initialSourceSwitchCoverState());
  });

  it("treats a re-arm after a full unarm as a fresh first arm (no flash)", () => {
    // After mounting, switching, then unarming the player entirely, a re-arm
    // mounts a fresh empty stage — the historical rule shows no cover, even
    // though stale pre-unmount facts (started) are still hoisted.
    const state = reduce([
      snapshot("A"),
      snapshot("B"),
      snapshot("B", startedFacts(true)),
      snapshot(null),
      snapshot("A", startedFacts(true)),
    ]);
    expect(state).toEqual({
      armedFor: null,
      boundarySeen: false,
      lastIdentity: "A",
      startedResetSeen: false,
      visible: false,
    });
  });

  it("playing A → seek → B: stale A cannot reveal/update B, cover reveals only after B is ready", () => {
    // The deterministic switch lifecycle: A plays, the user seeks within A
    // (bytes grow), then the user selects B. A's stale `started: true` (and
    // its accepted load) must never reveal B or mark the boundary; B's load
    // reset (`accepted:false`) opens the boundary; B's empty accept still has
    // no frame; only B's nonempty accepted load reveals the cover.
    const afterA = reduce([
      snapshot("A", startedFacts(true), loadStatus(true, 6)),
      // A seek within A: still the same identity, still A's started+accepted.
      snapshot("A", startedFacts(true), loadStatus(true, 9)),
    ]);
    const armed = reduce(
      [snapshot("B", startedFacts(true), loadStatus(true, 9))],
      afterA,
    );
    expect(armed.visible).toBe(true);
    expect(armed.armedFor).toBe("B");
    expect(armed.boundarySeen).toBe(false);

    // B's load reset arrives; A's stale `started:true` is STILL hoisted. The
    // boundary is now seen, but the cover must not reveal on A's started.
    const boundary = reduce(
      [snapshot("B", startedFacts(true), loadStatus(false, 0))],
      armed,
    );
    expect(boundary.visible).toBe(true);
    expect(boundary.boundarySeen).toBe(true);

    // B is accepted but has no bytes yet — no frame, cover stays.
    const emptyAccepted = reduce(
      [snapshot("B", startedFacts(true), loadStatus(true, 0))],
      boundary,
    );
    expect(emptyAccepted.visible).toBe(true);

    // B accepted AND substantive bytes read — B is ready, the cover reveals.
    const bReady = reduce(
      [snapshot("B", startedFacts(true), loadStatus(true, 2))],
      emptyAccepted,
    );
    expect(bReady.visible).toBe(false);
    expect(bReady.armedFor).toBeNull();
  });

  it("reveals once B is ready even when B never reports a not-started reset (sticky started)", () => {
    // The permanent-cover regression: if the element keeps the superseded
    // source's `started: true` through the whole replacement, the reveal must
    // still happen once B's own load has been accepted and delivered bytes —
    // it must NOT wait for a `started: false` that never arrives.
    const state = reduce([
      snapshot("A", startedFacts(true), loadStatus(true, 4)),
      snapshot("B", startedFacts(true), loadStatus(true, 4)),
      snapshot("B", startedFacts(true), loadStatus(false, 0)),
      snapshot("B", startedFacts(true), loadStatus(true, 0)),
      snapshot("B", startedFacts(true), loadStatus(true, 3)),
    ]);
    expect(state.visible).toBe(false);
    expect(state.armedFor).toBeNull();
  });
});
