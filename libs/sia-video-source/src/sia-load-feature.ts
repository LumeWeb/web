/**
 * A minimal custom Video.js v10 player feature that mirrors the host's typed
 * `sia-load-change` DOM event into the flat player store, plus the shared
 * selector that reads that slice back out.
 *
 * Why a player feature at all: the host already owns load acceptance as a
 * typed, boolean-only window (`{ accepted: true }` one detail when the
 * current request's SOURCE_OK acknowledges the load, `{ accepted: false }`
 * one detail at every load boundary — see `SiaLoadChangeDetail`). Generic
 * playback/error/load state stays owned by the packaged video.js features;
 * this slice only surfaces the *Sia-specific* acceptance fact through the
 * exact same store/selector mechanism, so a non-React store consumer and a
 * React `usePlayer(selectSiaLoad)` consumer share one source of truth. There
 * is deliberately no standalone controller or duplicated listener.
 *
 * The feature attaches to the player's current `media`, subscribes to the
 * load event the `SiaVideoSource` host forwards on its own EventTarget (the
 * same detail it dispatches on the attached `<video>` element), and aborts
 * via the attach `signal` on detach/reattach — so a disconnected media never
 * leaks a stale window. `accepted` is a pure boolean: no metadata, no
 * progress, no retries, no broad phase — a `true` here means the worker
 * pipeline accepted the source at SOURCE_OK, not that it is playable/ready.
 */
import { definePlayerFeature, type PlayerFeature } from '@videojs/core/dom';
import type { Media } from '@videojs/media';
import { createSelector } from '@videojs/store';
import { siaLoadChange, type SiaLoadChangeDetail } from './sia-video-source.ts';

/** The load-acceptance facts a consumer reads off the player store. */
export interface SiaLoadState {
  /** Whether the attached Sia media's current load was accepted by the worker pipeline. */
  accepted: boolean;
}

/**
 * A media capable of emitting the Sia load event. The video.js `Media`
 * contract keys `addEventListener` to the packaged `MediaEvents`, so this
 * widens the listener surface for this library's one custom event — a
 * structural view the `SiaVideoSource` host satisfies (it forwards element
 * events to host listeners for the types that have a listener).
 */
type SiaLoadCapable = Pick<Media, 'addEventListener' | 'removeEventListener'> & {
  addEventListener(
    type: typeof siaLoadChange,
    listener: (event: SiaLoadChangeEvent) => void,
    options?: { signal?: AbortSignal },
  ): void;
};

/** The `sia-load-change` payload shape the host dispatches on a media. */
type SiaLoadChangeEvent = CustomEvent<SiaLoadChangeDetail>;

/** Inert state: no load has been accepted (or the boundary already reset it). */
function inertLoadState(): SiaLoadState {
  return { accepted: false };
}

/**
 * The custom Video.js v10 load-acceptance feature. Combine it into a
 * `@videojs/store` player store with the non-React `combine(...)` API (or
 * `createPlayer` from the stack's React subpath) to publish load acceptance
 * next to the packaged playback/error features. It only depends on
 * `@videojs/core/dom` and `@videojs/store`, so a non-React v10 consumer needs
 * neither the React subpath of the video.js stack nor React itself.
 */
export const siaLoadFeature: PlayerFeature<SiaLoadState> = definePlayerFeature({
  attach({ set, signal, target }) {
    const media = target.media as SiaLoadCapable;
    const onLoadChange = (event: SiaLoadChangeEvent): void => {
      const detail = event.detail;
      if (!detail) return;
      set({ accepted: detail.accepted });
    };
    media.addEventListener(siaLoadChange, onLoadChange, { signal });
  },
  name: 'siaLoad',
  state: inertLoadState,
});

/**
 * Reads the Sia load slice off a player store's flat state; `undefined` when
 * the store was built without `siaLoadFeature`. This is the single selector
 * both non-React store consumers and React `usePlayer(selectSiaLoad)`
 * subscribe with, so every consumer sees identical state.
 */
export const selectSiaLoad = createSelector(siaLoadFeature);
