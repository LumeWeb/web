/**
 * Inside-Player user-gesture play bridge: honors a stage-click play request
 * through the typed Video.js v10 `play` API, once the Sia worker accepts the
 * source load, no raw media element, no DOM events, no v8 imperative shim.
 *
 * The screen hoists a `playRequested` flag (an explicit user gesture) and
 * hands it down as a boolean plus a consumption callback. When the request
 * is pending, the load is accepted, and a typed `play` API exists, the
 * bridge calls `play()` exactly once, it consumes the request immediately
 * so no re-render can schedule a second attempt. A rejected play is swallowed
 * silently; the player chrome and a fresh stage click remain the explicit
 * ways to start playback.
 *
 * The pure model function is exported so the gate is unit-tested without a
 * DOM (UserPlayBridge.spec.ts).
 */

import { useEffect, useRef } from "react";
import { usePlayer } from "@videojs/react";
import { selectPlayback } from "@videojs/core/dom";
import { useSiaLoad } from "@lumeweb/sia-video-source/react";
import type { MediaPlaybackState } from "@videojs/media";

/** Props accepted by the inside-Player user-gesture play bridge. */
export interface UserPlayBridgeProps {
  /** The pending play request was consumed by a single play attempt. */
  readonly onConsumed: () => void;
  /** Whether a user-gesture play request is pending for the current source. */
  readonly pending: boolean;
}

/** The typed Video.js v10 playback slice the user-play gate decides against. */
type UserPlayPlaybackApi = Pick<MediaPlaybackState, "play">;

/**
 * Pure gate for a single user-gesture play attempt; doubles as a type guard
 * narrowing the caller's play call.
 */
export function shouldAttemptUserPlay(
  pending: boolean,
  loadAccepted: boolean,
  playback: undefined | UserPlayPlaybackApi,
): playback is UserPlayPlaybackApi {
  return pending && loadAccepted && playback !== undefined;
}

/**
 * Inside-Player user-gesture play bridge. Renders `null` and, when the
 * pending request's gates open (see `shouldAttemptUserPlay`), calls the
 * typed `play()` exactly once, silently swallowing a rejection, then reports
 * the request consumed. Must stay a child of the SiaPlayer `<Player>` so
 * `usePlayer` / `useSiaLoad` resolve.
 */
export function UserPlayBridge({ onConsumed, pending }: UserPlayBridgeProps) {
  const load = useSiaLoad();
  const playback = usePlayer(selectPlayback);

  // One attempt per pending request: guards against a store update
  // interleaving a second play call before the parent re-renders.
  const attemptedThisRequest = useRef(false);

  useEffect(() => {
    if (!pending) {
      // Armed for the next request once this one clears.
      attemptedThisRequest.current = false;
      return;
    }
    if (attemptedThisRequest.current) return;
    if (!shouldAttemptUserPlay(pending, load?.accepted ?? false, playback)) {
      return;
    }
    // Consume the request up front: strictly one play call per request.
    attemptedThisRequest.current = true;
    onConsumed();
    // A rejected play is swallowed silently.
    void playback.play().catch(() => undefined);
  }, [load, onConsumed, pending, playback]);

  return null;
}
