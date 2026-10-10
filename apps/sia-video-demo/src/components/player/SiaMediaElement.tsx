/**
 * Demo-owned Sia media element for the Video.js v10 player shell.
 *
 * The library's `SiaVideo` React wrapper does not expose the host's
 * `backend` / `nativeStreamProvider` options (it forwards only
 * worker config, seed suppliers, logger, mimeType, and the reload key), so
 * the demo owns the media instance here to carry the developer-options
 * output: the playback backend policy and the demo native stream provider.
 *
 * The element mirrors the library wrapper's contract:
 * - the `SiaVideoSource` instance is created ONCE (kept for the component's
 *   whole lifetime) with the mount-time `backend` + `nativeStreamProvider`
 *   applied in the constructor, before any attach;
 * - the worker config (`sia`), the seed suppliers, and the logger are
 *   synced onto the persistent instance on EVERY render (they reach the
 *   worker on the next (re)attach / next SOURCE);
 * - `src`/`preload`/the provider are applied only when they change (the
 *   provider setter has real side effects, so a stable-identity re-assign
 *   must be a no-op);
 * - a CHANGE to the structural reload inputs (display-safe `reloadKey`,
 *   indexer, seed-supplier presence) triggers exactly one in-place
 *   `reloadConfiguration()`. The baseline is recorded on the first run so
 *   a fresh mount never double-handshakes;
 * - a CHANGE to the `backend` (the centralized developer-options toggle)
 *   assigns `media.backend` in place: the host's backend setter tears down
 *   the active backend, resets the load state, and restarts the current
 *   source on the new backend, so playback updates safely after toggling.
 */

import {
  useAttachMedia,
  useComposedRefs,
  useMediaInstance,
} from "@videojs/react";
import {
  type AppKeySeedProvider,
  type Logger,
  type SiaNativeStreamProvider,
  type SiaPlaybackBackend,
  SiaVideoSource,
  type WorkerConfig,
} from "@lumeweb/sia-video-source";
import { forwardRef, useEffect, useRef } from "react";

/** Props the demo media element accepts (a subset of the library wrapper's). */
export interface SiaMediaElementProps {
  /** Playback backend policy (from the centralized developer options). */
  readonly backend: SiaPlaybackBackend;
  /** The publish app-key seed supplier, or `undefined` for shared mode. */
  readonly getAppKeySeed?: AppKeySeedProvider;
  /** The shared sharing-key seed supplier, or `undefined` for publish mode. */
  readonly getSharingKeySeed?: AppKeySeedProvider;
  /** Demo-wide event-log sink. */
  readonly logger: Logger;
  /** The demo native stream provider (built once, module-stable identity). */
  readonly nativeStreamProvider: SiaNativeStreamProvider;
  readonly preload?: "auto" | "metadata" | "none";
  /** Display-safe in-place reload identity. */
  readonly reloadKey: string;
  /** Worker HELLO connection metadata. */
  readonly sia: WorkerConfig;
  /** The transport source the media element loads (`fetchForm` / object key). */
  readonly src: string;
}

/**
 * The ONE React component that composes the demo's `SiaVideoSource` media
 * element: media instance + element attachment + config sync + reload and
 * backend effects.
 */
export const SiaMediaElement = forwardRef<
  HTMLVideoElement,
  SiaMediaElementProps
>(function SiaMediaElement(
  {
    backend,
    getAppKeySeed,
    getSharingKeySeed,
    logger,
    nativeStreamProvider,
    preload = "auto",
    reloadKey,
    sia,
    src,
  },
  ref,
) {
  // The media instance is created lazily and kept for the component's whole
  // lifetime. The subclass constructor applies the mount-time backend
  // policy and native provider BEFORE any attach, so the initial
  // configuration is plain field setup (no setter side effects).
  const media = useMediaInstance(
    class extends SiaVideoSource {
      constructor() {
        super({ backend, nativeStreamProvider });
      }
    },
  );

  // The host's `backend` setter switches backends IN PLACE (releases the
  // active backend, resets the load state, restarts the current source on
  // the new backend), so a developer-options toggle updates playback
  // safely without a remount. The equality guard keeps the effect a no-op
  // while the policy is unchanged.
  useEffect(() => {
    if (media.backend !== backend) media.backend = backend;
  }, [media, backend]);

  // Structural reload inputs only. This uses the same value-fact comparison
  // library wrapper uses (primitives/presence booleans, never supplier
  // function refs). The FIRST run records the mount-time baseline and
  // never reloads; every later change triggers exactly one in-place
  // `reloadConfiguration()`.
  const appliedReloadDeps = useRef<
    null | readonly (boolean | string | undefined)[]
  >(null);
  useEffect(() => {
    if (!media.engine) return;
    const next: (boolean | string | undefined)[] = [
      reloadKey,
      sia !== undefined,
      sia?.indexerUrl,
      getAppKeySeed !== undefined,
      getSharingKeySeed !== undefined,
    ];
    const prev = appliedReloadDeps.current;
    if (prev === null) {
      appliedReloadDeps.current = next;
      return;
    }
    const changed =
      prev.length !== next.length ||
      next.some((value, index) => prev[index] !== value);
    appliedReloadDeps.current = next;
    if (changed) media.reloadConfiguration();
  }, [media, reloadKey, sia, getAppKeySeed, getSharingKeySeed]);

  // The media instance persists across renders, so every config field is
  // synced on EVERY render (the host applies them on the next (re)attach);
  // `src`/`preload`/the provider are applied only when they change (the
  // provider setter destroys and rebuilds the service-worker backend, so a
  // stable-identity re-assign must be a no-op).
  media.workerConfig = sia;
  media.getAppKeySeed = getAppKeySeed;
  media.getSharingKeySeed = getSharingKeySeed;
  media.logger = logger;
  if (media.nativeStreamProvider !== nativeStreamProvider) {
    media.nativeStreamProvider = nativeStreamProvider;
  }
  if (media.src !== src) media.src = src;
  if (media.preload !== preload) media.preload = preload;

  const attachRef = useAttachMedia(media);
  const composedRef = useComposedRefs(attachRef, ref);
  return <video ref={composedRef} />;
});
