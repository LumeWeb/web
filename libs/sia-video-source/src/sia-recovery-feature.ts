/**
 * A minimal custom Video.js v10 player feature that mirrors the host's typed
 * `sia-recovery-change` DOM event into the flat player store, plus the shared
 * selector that reads that slice back out.
 *
 * Why a player feature at all: the host already owns recovery as a typed,
 * one-shot window (`active: true` one detail, `active: false` one detail —
 * see `RecoveryChangeDetail`). Generic playback state (paused/started/waiting/
 * seeking/ended/error) stays owned by the packaged video.js features; this
 * slice only surfaces the *Sia-specific* recovery facts through the exact
 * same store/selector mechanism, so a non-React store consumer and a React
 * `usePlayer(selectSiaRecovery)` consumer share one source of truth. There is
 * deliberately no standalone controller or duplicated listener.
 *
 * The feature attaches to the player's current `media`, subscribes to the
 * recovery event the `SiaVideoSource` host forwards on its own EventTarget
 * (the same detail it dispatches on the attached `<video>` element), and
 * aborts via the attach `signal` on detach/reattach — so a disconnected media
 * never leaks a stale window. State carries no transient reason/resume/wants
 * values while `active` is false: the close detail (`{ active: false }`)
 * clears them, and detach resets the slice to its inert initial state.
 */
import { definePlayerFeature, type PlayerFeature } from '@videojs/core/dom';
import type { Media } from '@videojs/media';
import { createSelector } from '@videojs/store';
import type { RecoveryReason } from './host-playback-machine.ts';
import { type RecoveryChangeDetail, siaRecoveryChange } from './sia-video-source.ts';

/** The recovery facts a consumer reads off the player store. */
export interface SiaRecoveryState {
  /** Whether a recovery window is open on the attached Sia media. */
  active: boolean;
  /** The recovery reason; present only while a recovery window is open. */
  reason?: RecoveryReason;
  /** Playhead (seconds) the recovery resumes from; present only while open. */
  resumeSeconds?: number;
  /** Whether the recovery is expected to resume playback; present only while open. */
  wantsPlay?: boolean;
}

/**
 * A media capable of emitting the Sia recovery event. The video.js `Media`
 * contract keys `addEventListener` to the packaged `MediaEvents`, so this
 * widens the listener surface for this library's one custom event — a
 * structural view the `SiaVideoSource` host satisfies (it forwards element
 * events to host listeners for the types that have a listener).
 */
type SiaRecoveryCapable = Pick<Media, 'addEventListener' | 'removeEventListener'> & {
  addEventListener(
    type: typeof siaRecoveryChange,
    listener: (event: SiaRecoveryChangeEvent) => void,
    options?: { signal?: AbortSignal },
  ): void;
};

/** The `sia-recovery-change` payload shape the host dispatches on a media. */
type SiaRecoveryChangeEvent = CustomEvent<RecoveryChangeDetail>;

/** Inert state: no open window, no transient fields leaking. */
function inertRecoveryState(): SiaRecoveryState {
  return { active: false, reason: undefined, resumeSeconds: undefined, wantsPlay: undefined };
}

/**
 * The custom Video.js v10 recovery feature. Combine it into a `@videojs/store`
 * player store with the non-React `combine(...)` API (or `createPlayer` from
 * the stack's React subpath) to publish recovery state next to the packaged
 * playback/error features. It only depends on `@videojs/core/dom` and
 * `@videojs/store`, so a non-React v10 consumer needs neither the React
 * subpath of the video.js stack nor React itself.
 */
export const siaRecoveryFeature: PlayerFeature<SiaRecoveryState> = definePlayerFeature({
  attach({ set, signal, target }) {
    const media = target.media as SiaRecoveryCapable;
    const onRecoveryChange = (event: SiaRecoveryChangeEvent): void => {
      const detail = event.detail;
      if (!detail) return;
      if (detail.active) {
        set({
          active: true,
          reason: detail.reason,
          resumeSeconds: detail.resumeSeconds,
          wantsPlay: detail.wantsPlay,
        });
        return;
      }
      // The host closes a recovery window exactly once with `active: false`;
      // clear every transient field so a later play never reads a stale
      // reason/resume/wantsPlay from a superseded window.
      set(inertRecoveryState());
    };
    media.addEventListener(siaRecoveryChange, onRecoveryChange, { signal });
  },
  name: 'siaRecovery',
  state: inertRecoveryState,
});

/**
 * Reads the Sia recovery slice off a player store's flat state; `undefined`
 * when the store was built without `siaRecoveryFeature`. This is the single
 * selector both non-React store consumers and React `usePlayer(selectSiaRecovery)`
 * subscribe with, so every consumer sees identical state.
 */
export const selectSiaRecovery = createSelector(siaRecoveryFeature);
