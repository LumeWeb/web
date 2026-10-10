import { describe, expect, it } from "vitest";
import type {
  SiaLoadState,
  SiaProgressState,
  SiaRecoveryState,
  SiaSourceInfoState,
  SourceInfo,
} from "@lumeweb/sia-video-source";
import {
  emptySiaStatus,
  normalizeSiaLoad,
  normalizeSiaProgress,
  normalizeSiaRecovery,
  normalizeSiaSourceInfo,
  normalizeSiaStatus,
} from "./SiaStatusBridge";

/**
 * Node unit tests for the pure Sia status normalizer(s). The state shapes feed
 * the four React hooks from `@lumeweb/sia-video-source/react` (`useSiaRecovery`,
 * `useSiaLoad`, `useSiaSourceInfo`, `useSiaProgress`), each of which yields
 * `undefined` when the player store was built without that feature. The bridge
 * normalizes those possibly-undefined feature states into one stable typed
 * display-facts snapshot whose fields are ALWAYS defined — so a consumer (the
 * later overlay wiring) never branches on `undefined`, and an absent feature
 * is a distinct, explicit fact. The React component itself is not exercised
 * here (it needs a `<Player>` host); only the pure normalizers are pinned.
 */

/** An open recovery window with every optional fact present. */
const RECOVERY_OPEN: SiaRecoveryState = {
  active: true,
  reason: "seek",
  resumeSeconds: 12.5,
  wantsPlay: true,
};

/** A closed recovery window (the inert shape the feature emits at a boundary). */
const RECOVERY_CLOSED: SiaRecoveryState = { active: false };

/** A load accepted by the worker pipeline. */
const LOAD_ACCEPTED: SiaLoadState = { accepted: true };

/** A progress state mid-read with a completed milestone. */
const PROGRESS_READING: SiaProgressState = {
  bytesRead: 7,
  last: { name: "read.window-complete", position: 42, requestId: 0 },
  reading: true,
  reads: 3,
  retries: 1,
  retrying: false,
};

/** A progress state whose last milestone has no optional position. */
const PROGRESS_STALLED: SiaProgressState = {
  bytesRead: 7,
  last: { name: "read.stalled", requestId: null },
  reading: true,
  reads: 3,
  retries: 1,
  retrying: false,
};

/** The vetted `SourceInfo` an open source-info window carries. */
const SOURCE_INFO_VALUE: SourceInfo = {
  container: "mp4",
  durationSeconds: 120,
  mime: "video/mp4",
  mode: "worker",
  tracks: [{ codec: "avc1.42E01E", kind: "video" }],
};

/** An open source-info window carrying the vetted `SourceInfo`. */
const SOURCE_INFO_OPEN: SiaSourceInfoState = {
  sourceInfo: { active: true, info: SOURCE_INFO_VALUE, kind: "worker" },
};

/** The closed source-info window the feature emits at a boundary. */
const SOURCE_INFO_CLOSED: SiaSourceInfoState = {
  sourceInfo: { active: false },
};

describe("emptySiaStatus", () => {
  it("is fully inert: every display fact defined and no feature available", () => {
    const status = emptySiaStatus();
    expect(status).toEqual({
      load: { accepted: false, available: false },
      progress: {
        available: false,
        bytesRead: 0,
        last: null,
        reading: false,
        reads: 0,
        retries: 0,
        retrying: false,
      },
      recovery: {
        active: false,
        available: false,
        reason: null,
        resumeSeconds: null,
        wantsPlay: null,
      },
      sourceInfo: { active: false, available: false, info: null },
    });
  });
});

describe("normalizeSiaStatus", () => {
  it("treats every undefined feature state as the inert baseline", () => {
    const status = normalizeSiaStatus({
      load: undefined,
      progress: undefined,
      recovery: undefined,
      sourceInfo: undefined,
    });
    expect(status).toEqual(emptySiaStatus());
  });

  it("is stable: identical inputs always normalize to equal snapshots", () => {
    const inputs = {
      load: LOAD_ACCEPTED,
      progress: PROGRESS_READING,
      recovery: RECOVERY_OPEN,
      sourceInfo: SOURCE_INFO_OPEN,
    };
    expect(normalizeSiaStatus(inputs)).toEqual(normalizeSiaStatus(inputs));
  });

  it("composes each normalized feature slice", () => {
    const status = normalizeSiaStatus({
      load: LOAD_ACCEPTED,
      progress: PROGRESS_READING,
      recovery: RECOVERY_OPEN,
      sourceInfo: SOURCE_INFO_OPEN,
    });
    expect(status.load).toEqual({ accepted: true, available: true });
    expect(status.recovery).toEqual({
      active: true,
      available: true,
      reason: "seek",
      resumeSeconds: 12.5,
      wantsPlay: true,
    });
    expect(status.progress).toEqual({
      available: true,
      bytesRead: 7,
      last: { name: "read.window-complete", position: 42, requestId: 0 },
      reading: true,
      reads: 3,
      retries: 1,
      retrying: false,
    });
    expect(status.sourceInfo).toEqual({
      active: true,
      available: true,
      info: SOURCE_INFO_VALUE,
    });
  });

  it("never leaks undefined into the snapshot shape", () => {
    const status = emptySiaStatus();
    const json = JSON.stringify(status);
    expect(json).not.toContain("undefined");
    expect(status.recovery.reason).not.toBeUndefined();
    expect(status.recovery.resumeSeconds).not.toBeUndefined();
    expect(status.recovery.wantsPlay).not.toBeUndefined();
    expect(status.progress.last).not.toBeUndefined();
    expect(status.sourceInfo.info).not.toBeUndefined();
  });
});

describe("normalizeSiaRecovery", () => {
  it("maps an open recovery window to defined display facts", () => {
    expect(normalizeSiaRecovery(RECOVERY_OPEN)).toEqual({
      active: true,
      available: true,
      reason: "seek",
      resumeSeconds: 12.5,
      wantsPlay: true,
    });
  });

  it("normalizes a closed window with null transients and available: true", () => {
    expect(normalizeSiaRecovery(RECOVERY_CLOSED)).toEqual({
      active: false,
      available: true,
      reason: null,
      resumeSeconds: null,
      wantsPlay: null,
    });
  });

  it("normalizes an open window missing optional transients to null, never undefined", () => {
    expect(normalizeSiaRecovery({ active: true, reason: "network" })).toEqual({
      active: true,
      available: true,
      reason: "network",
      resumeSeconds: null,
      wantsPlay: null,
    });
  });

  it("is inert and unavailable for an undefined state", () => {
    expect(normalizeSiaRecovery(undefined)).toEqual({
      active: false,
      available: false,
      reason: null,
      resumeSeconds: null,
      wantsPlay: null,
    });
  });
});

describe("normalizeSiaLoad", () => {
  it("reports an accepted load", () => {
    expect(normalizeSiaLoad(LOAD_ACCEPTED)).toEqual({
      accepted: true,
      available: true,
    });
  });

  it("reports a not-yet-accepted load as false", () => {
    expect(normalizeSiaLoad({ accepted: false })).toEqual({
      accepted: false,
      available: true,
    });
  });

  it("is inert and unavailable for an undefined state", () => {
    expect(normalizeSiaLoad(undefined)).toEqual({
      accepted: false,
      available: false,
    });
  });
});

describe("normalizeSiaProgress", () => {
  it("maps counters and a completed milestone", () => {
    expect(normalizeSiaProgress(PROGRESS_READING)).toEqual({
      available: true,
      bytesRead: 7,
      last: { name: "read.window-complete", position: 42, requestId: 0 },
      reading: true,
      reads: 3,
      retries: 1,
      retrying: false,
    });
  });

  it("normalizes an absent optional milestone position/requestId to null", () => {
    expect(normalizeSiaProgress(PROGRESS_STALLED)).toMatchObject({
      available: true,
      last: { name: "read.stalled", position: null, requestId: null },
    });
  });

  it("normalizes a milestone-less state to last: null", () => {
    expect(
      normalizeSiaProgress({
        bytesRead: 2,
        reading: false,
        reads: 1,
        retries: 0,
        retrying: false,
      }),
    ).toMatchObject({ last: null });
  });

  it("is inert and unavailable for an undefined state", () => {
    expect(normalizeSiaProgress(undefined)).toEqual({
      available: false,
      bytesRead: 0,
      last: null,
      reading: false,
      reads: 0,
      retries: 0,
      retrying: false,
    });
  });
});

describe("normalizeSiaSourceInfo", () => {
  it("maps an open source-info window", () => {
    expect(normalizeSiaSourceInfo(SOURCE_INFO_OPEN)).toEqual({
      active: true,
      available: true,
      info: SOURCE_INFO_VALUE,
    });
  });

  it("normalizes a closed window to info: null", () => {
    expect(normalizeSiaSourceInfo(SOURCE_INFO_CLOSED)).toEqual({
      active: false,
      available: true,
      info: null,
    });
  });

  it("is inert and unavailable for an undefined state", () => {
    expect(normalizeSiaSourceInfo(undefined)).toEqual({
      active: false,
      available: false,
      info: null,
    });
  });
});
