import { describe, expect, it } from "vitest";
import type { MediaPlaybackState } from "@videojs/media";
import { shouldAttemptUserPlay } from "./UserPlayBridge";

/**
 * Node unit tests for the pure stage-click user-play model exposed by
 * `UserPlayBridge`: the exact play-attempt gate (a user-gesture play request
 * is pending AND the Sia load is accepted AND a typed Video.js v10 `play` API
 * is present). The React `UserPlayBridge` component itself is not exercised
 * here (it needs a `<Player>` DOM host to resolve `usePlayer`/`useSiaLoad`);
 * only the pure model is pinned, exactly as the Sia status bridge spec limits
 * itself to its normalizers.
 */

/** A typed Video.js v10 playback slice the pure gate decides against. */
const PLAYBACK: Pick<MediaPlaybackState, "play"> = {
  play: () => Promise.resolve(),
};

describe("shouldAttemptUserPlay (stage-click user-play gate)", () => {
  it("is false with no pending play request", () => {
    expect(shouldAttemptUserPlay(false, true, PLAYBACK)).toBe(false);
  });

  it("is false while the Sia worker has not accepted the current load", () => {
    expect(shouldAttemptUserPlay(true, false, PLAYBACK)).toBe(false);
  });

  it("is false when the player store exposes no play API (feature absent)", () => {
    expect(shouldAttemptUserPlay(true, true, undefined)).toBe(false);
  });

  it("is true only when a request is pending AND load accepted AND play is available", () => {
    expect(shouldAttemptUserPlay(true, true, PLAYBACK)).toBe(true);
  });
});
