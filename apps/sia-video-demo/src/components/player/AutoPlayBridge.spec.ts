import { describe, expect, it } from "vitest";
import type { MediaPlaybackState } from "@videojs/media";
import {
  autoplayIntentForPreselection,
  autoplayIntentForRowToggle,
  autoplayIntentIsLive,
  shouldAttemptAutoplayAfterReset,
} from "./AutoPlayBridge";

/**
 * Node unit tests for the pure best-effort autoplay model exposed by
 * `AutoPlayBridge`: the pending-intent arming/denarming helpers (a shared row
 * USER selection and a share-fragment preselection are the ONLY arming
 * events) and the reset-aware play-attempt gate. The React
 * `AutoPlayBridge` component itself is not exercised here (it needs a
 * `<Player>` DOM host to resolve `usePlayer`/`useSiaLoad`); only the pure
 * model is pinned, exactly as the Sia status bridge spec limits itself to its
 * normalizers.
 */

const OBJECT_KEY =
  "a1b2c3d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff01";
const OTHER_OBJECT_KEY =
  "ffeeddccbbaa99887766554433221100a1b2c3d4e5f60718293a4b5c6d7e8f90";

/** A typed Video.js v10 playback slice the pure gate decides against. */
const PLAYBACK: Pick<MediaPlaybackState, "play"> = {
  play: () => Promise.resolve(),
};

describe("shouldAttemptAutoplayAfterReset (never consume the intent against old/dead media)", () => {
  it("is false with no pending intent", () => {
    expect(shouldAttemptAutoplayAfterReset(false, true, true, PLAYBACK)).toBe(
      false,
    );
  });

  it("is false while the load acceptance was NOT observed at its reset for the current source", () => {
    // The intent armed for a NEW source while the store still reports the
    // SUPERSEDED source's stale `accepted: true` (the load reset has not been
    // observed). The intent must not be consumed by a play against the
    // old/dead pipeline — only the fresh source's acceptance may autoplay.
    expect(shouldAttemptAutoplayAfterReset(true, true, false, PLAYBACK)).toBe(
      false,
    );
  });

  it("is false while the current load is not accepted", () => {
    expect(shouldAttemptAutoplayAfterReset(true, false, true, PLAYBACK)).toBe(
      false,
    );
  });

  it("is false when the player store exposes no play API (feature absent)", () => {
    expect(shouldAttemptAutoplayAfterReset(true, true, true, undefined)).toBe(
      false,
    );
  });

  it("is true only when pending AND load accepted AND the reset was observed AND play is available", () => {
    expect(shouldAttemptAutoplayAfterReset(true, true, true, PLAYBACK)).toBe(
      true,
    );
  });
});

describe("autoplayIntentForRowToggle (arm on shared row user selection)", () => {
  it("arms the intent for a newly selected shared row", () => {
    expect(autoplayIntentForRowToggle(null, OBJECT_KEY)).toBe(OBJECT_KEY);
  });

  it("arms the intent when the selection moves to a different row", () => {
    expect(autoplayIntentForRowToggle(OBJECT_KEY, OTHER_OBJECT_KEY)).toBe(
      OTHER_OBJECT_KEY,
    );
  });

  it("denarms (null) when the already-selected row is toggled off", () => {
    expect(autoplayIntentForRowToggle(OBJECT_KEY, OBJECT_KEY)).toBeNull();
  });

  it("canonicalizes the clicked id (lowercase, no 0x prefix)", () => {
    expect(
      autoplayIntentForRowToggle(null, `0x${OBJECT_KEY.toUpperCase()}`),
    ).toBe(OBJECT_KEY);
  });

  it("arms no intent for a malformed row id", () => {
    expect(autoplayIntentForRowToggle(null, "not-a-key")).toBeNull();
  });
});

describe("autoplayIntentForPreselection (arm on share-fragment preselection)", () => {
  it("arms the intent for a canonical fragment object key", () => {
    expect(autoplayIntentForPreselection(OBJECT_KEY)).toBe(OBJECT_KEY);
  });

  it("canonicalizes the fragment object key", () => {
    expect(autoplayIntentForPreselection(`0x${OBJECT_KEY.toUpperCase()}`)).toBe(
      OBJECT_KEY,
    );
  });

  it("arms no intent for an absent or malformed fragment key", () => {
    expect(autoplayIntentForPreselection(null)).toBeNull();
    expect(autoplayIntentForPreselection(undefined)).toBeNull();
    expect(autoplayIntentForPreselection("")).toBeNull();
    expect(autoplayIntentForPreselection("nope")).toBeNull();
  });
});

describe("autoplayIntentIsLive (an armed intent stays tied to its selection)", () => {
  it("is true while the pending intent matches the selected shared key", () => {
    expect(autoplayIntentIsLive(OBJECT_KEY, OBJECT_KEY)).toBe(true);
  });

  it("is false with no pending intent", () => {
    expect(autoplayIntentIsLive(null, OBJECT_KEY)).toBe(false);
  });

  it("is false when the selection moved to a different key", () => {
    expect(autoplayIntentIsLive(OBJECT_KEY, OTHER_OBJECT_KEY)).toBe(false);
  });

  it("is false when nothing is selected", () => {
    expect(autoplayIntentIsLive(OBJECT_KEY, null)).toBe(false);
  });
});
