/**
 * Inside-Player best-effort autoplay bridge: plays a source the user
 * explicitly chose to watch (a shared row selection or a share-fragment
 * preselection) through the typed Video.js v10 `play` API, once the Sia
 * worker accepts the current source's load, no raw media element, no DOM
 * events, no v8 imperative `play()` shim.
 *
 * The screen hoists a pending autoplay intent (a canonical shared object key)
 * and hands it down as a boolean plus a consumption callback. The gate opens
 * only when the intent is pending, the load acceptance was observed at its
 * RESET (`accepted: false`) after the intent armed, so a stale
 * `accepted: true` from a superseded source never plays against old media,
 * the current load is accepted, and a typed `play` API exists. The intent is
 * consumed immediately on the single attempt, so no re-render can schedule a
 * second one; a policy-rejected play is swallowed silently.
 *
 * The pure model functions are exported so the arming rules and the gate are
 * unit-tested without a DOM (AutoPlayBridge.spec.ts).
 */

import { useEffect, useRef } from "react";
import { usePlayer } from "@videojs/react";
import { selectPlayback } from "@videojs/core/dom";
import { useSiaLoad } from "@lumeweb/sia-video-source/react";
import type { MediaPlaybackState } from "@videojs/media";
import { canonicalizeSelectedObjectKey } from "../../lib/sourceSelection";

/** Props accepted by the inside-Player best-effort autoplay bridge. */
export interface AutoPlayBridgeProps {
  /** The pending intent was consumed by a single play attempt. */
  readonly onConsumed: () => void;
  /** Whether a best-effort autoplay intent is pending for the current source. */
  readonly pending: boolean;
}

/** The pending best-effort autoplay intent: a canonical shared object key. */
export type AutoPlayIntent = null | string;

/** The typed Video.js v10 playback slice the autoplay gate decides against. */
type AutoPlayPlaybackApi = Pick<MediaPlaybackState, "play">;

/**
 * Inside-Player best-effort autoplay bridge. Renders `null` and, when the
 * pending intent's gates open (see `shouldAttemptAutoplayAfterReset`), calls
 * the typed `play()` exactly once, silently swallowing a policy rejection,
 * then reports the intent consumed. Must stay a child of the SiaPlayer
 * `<Player>` so `usePlayer` / `useSiaLoad` resolve.
 */
export function AutoPlayBridge({ onConsumed, pending }: AutoPlayBridgeProps) {
  const load = useSiaLoad();
  const playback = usePlayer(selectPlayback);

  // One attempt per pending intent: guards against a store update interleaving
  // a second play call before the parent re-renders with the consumed flag.
  const attemptedThisIntent = useRef(false);

  // The load acceptance was observed at its RESET (`accepted: false`) since
  // the intent armed, a stale `accepted: true` from a superseded source must
  // never open the gate.
  const loadResetSeen = useRef(false);

  useEffect(() => {
    if (!pending) {
      // Armed for the next intent once this one clears.
      attemptedThisIntent.current = false;
      loadResetSeen.current = false;
      return;
    }
    if (attemptedThisIntent.current) return;
    const accepted = load?.accepted ?? false;
    if (!accepted) {
      // The load boundary resets the acceptance: a later `accepted: true` is
      // this source's, not a leftover from the superseded one.
      loadResetSeen.current = true;
      return;
    }
    if (
      !shouldAttemptAutoplayAfterReset(
        pending,
        accepted,
        loadResetSeen.current,
        playback,
      )
    ) {
      return;
    }
    // Consume the intent up front: strictly one play call per intent.
    attemptedThisIntent.current = true;
    onConsumed();
    // A policy-rejected play is swallowed silently.
    void playback.play().catch(() => undefined);
  }, [load, onConsumed, pending, playback]);

  return null;
}

/**
 * Pure arming helper for a share-fragment PRESELECTION: a one-shot object key
 * from the share link canonicalizes to a pending intent; an absent or
 * malformed fragment arms nothing.
 */
export function autoplayIntentForPreselection(
  fragmentObjectKey: null | string | undefined,
): AutoPlayIntent {
  return canonicalizeSelectedObjectKey(fragmentObjectKey);
}

/**
 * Pure arming helper for a shared row USER selection: the newly-selected key
 * arms the intent, re-clicking the selected row denarms, a malformed id arms
 * nothing. Mirrors `selectedSourceReducer`'s toggle semantics.
 */
export function autoplayIntentForRowToggle(
  currentlySelectedKey: null | string,
  clickedRowId: string,
): AutoPlayIntent {
  const clicked = canonicalizeSelectedObjectKey(clickedRowId);
  if (!clicked) return null;
  return clicked === currentlySelectedKey ? null : clicked;
}

/**
 * Whether a pending intent is still LIVE for the current selection: it applies
 * only while it matches the selected canonical shared object key.
 */
export function autoplayIntentIsLive(
  intent: AutoPlayIntent,
  selectedKey: null | string,
): boolean {
  return intent !== null && intent === selectedKey;
}

/**
 * Pure gate for a single best-effort autoplay attempt; doubles as a type
 * guard narrowing the caller's play call.
 */
export function shouldAttemptAutoplay(
  pending: boolean,
  loadAccepted: boolean,
  playback: AutoPlayPlaybackApi | undefined,
): playback is AutoPlayPlaybackApi {
  return pending && loadAccepted && playback !== undefined;
}

/**
 * Boundary-aware autoplay gate: all of `shouldAttemptAutoplay` plus the load
 * acceptance observed at its RESET since the intent armed (`loadResetSeen`),
 * so a stale superseded `accepted: true` never consumes the intent against
 * old media. Doubles as a type guard.
 */
export function shouldAttemptAutoplayAfterReset(
  pending: boolean,
  loadAccepted: boolean,
  loadResetSeen: boolean,
  playback: AutoPlayPlaybackApi | undefined,
): playback is AutoPlayPlaybackApi {
  return pending && loadAccepted && loadResetSeen && playback !== undefined;
}
