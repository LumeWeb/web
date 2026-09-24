/**
 * A minimal custom Video.js v10 player feature that mirrors the host's typed
 * `sia-source-info-change` DOM event into the flat player store, plus the
 * shared selector that reads that slice back out.
 *
 * Why a player feature at all: the host already owns source information as a
 * typed, per-load window — `{ active: true, info }` one detail when the
 * current request's SOURCE_OK acknowledges the load (carrying the exact
 * `SourceInfo` the worker vouched for), `{ active: false }` one detail at
 * every load boundary — see `SiaSourceInfoChangeDetail`. Generic
 * playback/error/load state stays owned by the packaged video.js features;
 * this slice only surfaces the *Sia-specific* source facts through the exact
 * same store/selector mechanism, so a non-React store consumer and a React
 * `usePlayer(selectSiaSourceInfo)` consumer share one source of truth. There
 * is deliberately no standalone controller or duplicated listener.
 *
 * The feature attaches to the player's current `media`, subscribes to the
 * source-info event the `SiaVideoSource` host forwards on its own EventTarget
 * (the same detail it dispatches on the attached `<video>` element), and
 * aborts via the attach `signal` on detach/reattach — so a disconnected media
 * never leaks a stale window. State carries no `info` while the window is
 * closed: the close detail (`{ active: false }`) sets the closed branch, and
 * detach resets the slice to its inert initial state. An open window's `info`
 * means the worker pipeline accepted the source with those facts at SOURCE_OK
 * — not that the load is playable/ready, and `durationSeconds` may be `null`.
 *
 * The `SourceInfo` payload (including its `tracks` array) is the exact object
 * the worker vouched for on the wire and is treated as IMMUTABLE: the feature
 * never clones or mutates it, and consumers must treat it as read-only.
 *
 * ## Why one globally-unique `sourceInfo` key wrapping a nested discriminant
 *
 * The flat `@videojs/store` state that `combine(...siaFeatures)` (or React
 * `createPlayer({ features: siaFeatures })`) assembles is ONE object: every
 * combined feature writes its slice keys to the same top-level state
 * (`combine` does `Object.assign`, `set()` shallow-patches and never deletes
 * keys), so slice keys must not overlap. `siaRecoveryFeature` already owns the
 * top-level `active` key, and `siaLoadFeature` owns `accepted`; a source-info
 * slice keyed `active` would couple the two independent windows — opening
 * recovery would flip source info open and vice versa. The DOM detail keeps
 * the approved `active` discriminator (`SiaSourceInfoChangeDetail`); the STORE
 * slice is the library's own shape, so it wraps the whole window in the single
 * collision-safe `sourceInfo` key with a NESTED discriminant:
 * `{ sourceInfo: { active: false } | { active: true; info } }`.
 *
 * Nesting under one key is what keeps it collision-safe AND compatible with
 * `createSelector`: the selector fixes its returned keys from the initial
 * state factory (here just `sourceInfo`), and because `active`/`info` live
 * *inside* that one key they are never flattened into (or lost from) the
 * shared top-level state. A FLAT discriminated union on the store top level
 * would not survive: `createSelector` would only pick the keys of the initial
 * closed branch, so the open branch's `info` would never be returned — hence
 * the window discriminator stays nested. The union also preserves the store's
 * own type narrowing for free: an open window guarantees a non-optional
 * `SourceInfo`, so `sourceInfo.active ? sourceInfo.info : …` compiles to a
 * plain payload read.
 */
import { definePlayerFeature, type PlayerFeature } from '@videojs/core/dom';
import type { Media } from '@videojs/media';
import { createSelector } from '@videojs/store';
import type { SourceInfo } from './protocol.ts';
import { siaSourceInfoChange, type SiaSourceInfoChangeDetail } from './sia-video-source.ts';

/**
 * The source-info facts a consumer reads off the player store.
 *
 * The whole window lives under the single, collision-safe `sourceInfo` key —
 * a nested discriminant mirroring the host's per-load window exactly once per
 * load (open at the current request's SOURCE_OK, closed at every load
 * boundary). The closed branch carries no `info`, so a stale payload can never
 * leak across sources or players, and the discriminated union gives consumers
 * free type narrowing: reading `sourceInfo` and testing `.active` yields a
 * non-optional `SourceInfo` in the open branch. `info` is the exact
 * `SourceInfo` the host already receives on `SOURCE_OK` (no new metadata
 * shape, `durationSeconds` may be `null`). See the module doc for why the
 * discriminant is nested instead of flat on the store top level.
 */
export interface SiaSourceInfoState {
  /** Whether a source-info window is open on the attached Sia media. */
  sourceInfo: SiaSourceInfoWindow;
}

/** A source-info window in its two states: closed, or open with the payload. */
export type SiaSourceInfoWindow =
  | { active: false }
  | { active: true; info: SourceInfo };

/**
 * A media capable of emitting the Sia source-info event. The video.js `Media`
 * contract keys `addEventListener` to the packaged `MediaEvents`, so this
 * widens the listener surface for this library's one custom event — a
 * structural view the `SiaVideoSource` host satisfies (it forwards element
 * events to host listeners for the types that have a listener).
 */
type SiaSourceInfoCapable = Pick<Media, 'addEventListener' | 'removeEventListener'> & {
  addEventListener(
    type: typeof siaSourceInfoChange,
    listener: (event: SiaSourceInfoChangeEvent) => void,
    options?: { signal?: AbortSignal },
  ): void;
};

/** The `sia-source-info-change` payload shape the host dispatches on a media. */
type SiaSourceInfoChangeEvent = CustomEvent<SiaSourceInfoChangeDetail>;

/**
 * Inert state: no open window, no stale `info` leaking. The selector returns
 * the `sourceInfo` key on every read; the closed branch carries no `info`.
 */
function inertSourceInfoState(): SiaSourceInfoState {
  return { sourceInfo: { active: false } };
}

/**
 * The custom Video.js v10 source-info feature. Combine it into a
 * `@videojs/store` player store with the non-React `combine(...)` API (or
 * `createPlayer` from the stack's React subpath) to publish source information
 * next to the packaged playback/error features. It only depends on
 * `@videojs/core/dom` and `@videojs/store`, so a non-React v10 consumer needs
 * neither the React subpath of the video.js stack nor React itself.
 */
export const siaSourceInfoFeature: PlayerFeature<SiaSourceInfoState> = definePlayerFeature({
  attach({ set, signal, target }) {
    const media = target.media as SiaSourceInfoCapable;
    const onSourceInfoChange = (event: SiaSourceInfoChangeEvent): void => {
      const detail = event.detail;
      if (!detail) return;
      if (detail.active) {
        set({ sourceInfo: { active: true, info: detail.info } });
        return;
      }
      // The host closes a source-info window exactly once with `active: false`;
      // restore the closed branch so a later consumer never reads a stale
      // payload from a superseded load.
      set(inertSourceInfoState());
    };
    media.addEventListener(siaSourceInfoChange, onSourceInfoChange, { signal });
  },
  name: 'siaSourceInfo',
  state: inertSourceInfoState,
});

/**
 * Reads the Sia source-info slice off a player store's flat state; `undefined`
 * when the store was built without `siaSourceInfoFeature`. This is the single
 * selector both non-React store consumers and React
 * `usePlayer(selectSiaSourceInfo)` subscribe with, so every consumer sees
 * identical state.
 */
export const selectSiaSourceInfo = createSelector(siaSourceInfoFeature);
