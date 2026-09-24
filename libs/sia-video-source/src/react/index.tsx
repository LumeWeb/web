'use client';

/**
 * React wrapper for the Sia media engine, following the packaged video.js v10
 * media components (e.g. `HlsJsVideo`): the media instance is created once and
 * attached through the player context via `useMediaInstance`, and a ref
 * callback connects the real `<video>` element to it.
 *
 * Media props (`src`, `preload`, `streamType`) and the
 * `sia`/`mimeType`/`logger`/`getAppKeySeed`/`getSharingKeySeed` config are
 * synced from JSX into the media object during render instead of becoming HTML
 * attributes,
 * exactly what the packaged components' internal prop-syncing hook does.
 * Because the media instance persists across renders, these are synced on
 * EVERY render — `mimeType` forwards immediately on the next `SOURCE`, while
 * `sia` and the seed suppliers reach the worker on the next `attach`/re-attach,
 * which is where the host applies worker configuration.
 *
 * Neither seed may ever become React state: pass `getAppKeySeed` / (for
 * keyless playback, ADR 0008) `getSharingKeySeed` supplier functions (callbacks
 * that fetch the seed from the SDK login flow on demand) instead of the seed
 * values themselves. The host invokes each once per handshake and scrubs the
 * returned buffer; nothing in this component, in the host's fields, or in the
 * postMessage channel stores the plaintext.
 */

import { forwardRef, type ReactNode, useEffect, useRef, type VideoHTMLAttributes } from 'react';
import { useAttachMedia, useComposedRefs, useMediaInstance, usePlayer } from '@videojs/react';
import { type AppKeySeedProvider } from '../app-key-handshake.ts';
import type { Logger } from '../log/logger.ts';
import {
  selectSiaRecovery,
  type SiaRecoveryState,
} from '../sia-recovery-feature.ts';
import {
  selectSiaLoad,
  type SiaLoadState,
} from '../sia-load-feature.ts';
import {
  selectSiaProgress,
  type SiaProgressState,
} from '../sia-progress-feature.ts';
import {
  selectSiaSourceInfo,
  type SiaSourceInfoState,
} from '../sia-source-info-feature.ts';
import { siaVideoDefaultProps, SiaVideoSource } from '../sia-video-source.ts';
import type { WorkerConfig } from '../protocol.ts';

export interface SiaVideoProps
  extends Omit<VideoHTMLAttributes<HTMLVideoElement>, keyof typeof siaVideoDefaultProps>,
    Partial<typeof siaVideoDefaultProps> {
  children?: ReactNode;
  /**
   * Supplies the 32-byte Sia app-key seed for the encrypted worker handshake.
   * Pass a supplier, never the value: defining it with `useState(seed)` would
   * pin the plaintext into the React component tree and defeat the handshake's
   * containment guarantees.
   */
  getAppKeySeed?: AppKeySeedProvider;
  /**
   * Supplies the 32-byte Sia sharing-key seed for keyless playback (ADR 0008),
   * forwarded to the worker exactly like `getAppKeySeed` (inside an `APP_KEY`
   * envelope tagged `keyType: 'sharing'`). Pass a supplier, never the value.
   * When present, a share-URL `src` streams via `SharedSdk` without an app key.
   */
  getSharingKeySeed?: AppKeySeedProvider;
  /**
   * Logging hook for the underlying media host (see
   * `SiaVideoSourceOptions.logger`). Synced to the persistent media instance
   * on every render; a change applies immediately to host-side worker-event
   * forwarding and to the worker's HELLO `log` threshold on the next
   * (re)attach. Defaults to `createConsoleLogger()`.
   */
  logger?: Logger;
  /** Declared content type for the source; forwarded to the worker on every `SOURCE`. */
  mimeType?: string;
  /**
   * Explicit in-place reload trigger: when this string changes (e.g. a mode or
   * account identifier the app increments), the persistent media instance
   * calls `reloadConfiguration()` exactly once — re-running the HELLO/APP_KEY/
   * ATTACH handshake against the current config and seed suppliers without
   * remounting the media or the element. Combined with the structural
   * auto-detection below, so changing `reloadKey` and a structural HELLO input
   * in the same render still reloads exactly once.
   */
  reloadKey?: string;
  /** Connection metadata for the worker's default Sia SDK factory (no seed — see `getAppKeySeed`). */
  sia?: WorkerConfig;
}

type MediaLike = Record<string, unknown>;

/**
 * Value facts the reload auto-detection compares: primitives/booleans only
 * (`reloadKey`, worker-config presence, `indexerUrl`, `workerMse`, seed-supplier
 * presence). Computed element-wise per render — NEVER a composite string (a
 * NUL-joined signature would be collision-prone for the free-form
 * `reloadKey`/`indexerUrl` strings) and NEVER supplier function refs.
 */
type ReloadValueDependency = boolean | string | undefined;

/**
 * Views the persistent media instance as its dynamic prop interface. The fixed
 * config fields (`mimeType`, `workerConfig`, the seed-supplier setters) are
 * typed on `SiaVideoSource` and assigned directly without a cast; only the
 * keyed prop-sync loops below need the anonymous record shape, and the single
 * `as unknown as` for that lives here.
 */
function asMediaLike(media: SiaVideoSource): MediaLike {
  return media as unknown as MediaLike;
}

/**
 * `<SiaVideo src={objectKey} sia={{ indexerUrl, app }} getAppKeySeed={() => …} />` — a
 * `<video>` element backed by the Sia engine. Render inside a video.js v10
 * `Player` for the skin/error-dialog features; standalone rendering works
 * too, with bare native media events.
 *
 * `src` accepts either a hex object key or a full Sia share URL — the latter
 * identifies the object and carries its decryption key, so no separately
 * passed object identity is needed; `sia` and `getAppKeySeed` are still
 * required for the account connection that funds the downloads.
 */
export const SiaVideo = forwardRef<HTMLVideoElement, SiaVideoProps>(function SiaVideo(
  { children, getAppKeySeed, getSharingKeySeed, logger, reloadKey, sia, ...props },
  ref,
) {
  // The media instance is created lazily and kept for the component's whole
  // lifetime; `workerConfig`/`mimeType` are applied per-render below.
  const media = useMediaInstance(SiaVideoSource);

  // Structural HELLO inputs only. The host applies configuration at handshake
  // time, so a CHANGE to any of these after the initial attach must push an
  // explicit `reloadConfiguration()`. The comparison deliberately uses value
  // facts only — presence booleans and primitives/strings, compared ELEMENT-WISE
  // (a composite signature string would be collision-prone for the free-form
  // `reloadKey`/`indexerUrl`) — NEVER supplier function refs (inline arrows
  // change on every render), NEVER the nested `app` metadata, NEVER the logger
  // identity: those reach the worker at the next attach and must not re-handshake.
  //
  // The element attaches during commit (the ref callback spawns the worker), so
  // by the time this passive effect runs the initial attach has already HELLO'd
  // with the first render's props. The FIRST run therefore only records the
  // mount-time baseline and never reloads — otherwise a fresh mount would
  // double-HELLO. Every later primitive change to a structural HELLO input
  // (including `reloadKey`) triggers exactly one in-place
  // `reloadConfiguration()`; the previous facts are recorded in a ref so a
  // re-render with unchanged facts (or a StrictMode effect re-run) is a no-op.
  const appliedReloadDeps = useRef<null | readonly ReloadValueDependency[]>(null);
  useEffect(() => {
    if (!media.engine) return;
    const next: ReloadValueDependency[] = [
      reloadKey,
      sia !== undefined,
      sia?.indexerUrl,
      sia?.workerMse,
      getAppKeySeed !== undefined,
      getSharingKeySeed !== undefined,
    ];
    const prev = appliedReloadDeps.current;
    if (prev === null) {
      appliedReloadDeps.current = next;
      return;
    }
    const changed =
      prev.length !== next.length || next.some((value, index) => prev[index] !== value);
    appliedReloadDeps.current = next;
    if (changed) media.reloadConfiguration();
  }, [media, reloadKey, sia, getAppKeySeed, getSharingKeySeed]);

  let htmlProps = props as VideoHTMLAttributes<HTMLVideoElement>;
  if (media) {
    const sourceProps = props as Record<string, unknown>;
    const rest: Record<string, unknown> = {};
    // The media instance persists across renders, so every config field is
    // synced on EVERY render. The fixed fields below are typed setters on the
    // engine and need no cast; only the keyed default/present-prop loops use
    // the anonymous record view, whose one `as unknown as` lives in the helper.
    const owning = asMediaLike(media);
    for (const [key, value] of Object.entries(sourceProps)) {
      if (key in siaVideoDefaultProps) {
        if (value !== undefined && owning[key] !== value) {
          owning[key] = value;
        }
        continue;
      }
      // `mimeType` is a media property, not an HTML attribute — never a DOM
      // attribute. Synchronized unconditionally below (i.e. cleared when the
      // prop is omitted entirely), not in this present-props-only loop.
      if (key === 'mimeType') continue;
      rest[key] = value;
    }
    // Unconditional each render: setting mimeType to `undefined` when the prop
    // is absent clears whatever a previous render stored, so a later source on
    // the same persistent media instance never inherits a stale declared MIME.
    media.mimeType = props.mimeType;
    // Also unconditional: an updated `sia` configuration and the seed suppliers
    // must land on the persistent instance even if the setup callback (which
    // only runs on mount) already ran. The host applies them on the next
    // (re)attach — the suppliers are consumed there, not here, so the seeds
    // never live in this component's render output, state, or the media
    // instance.
    media.workerConfig = sia;
    media.getAppKeySeed = getAppKeySeed;
    media.getSharingKeySeed = getSharingKeySeed;
    // Also unconditional: the logger sink is a live reference the host re-reads
    // from its `logger.level` for the worker's HELLO threshold and forwards
    // worker events through; swapping it per-render needs no attach.
    media.logger = logger;
    for (const [key, value] of Object.entries(siaVideoDefaultProps)) {
      if (sourceProps[key] === undefined && value !== undefined && owning[key] !== value) {
        owning[key] = value;
      }
    }
    htmlProps = rest;
  }

  const attachRef = useAttachMedia(media);
  const composedRef = useComposedRefs(attachRef, ref);

  return <video ref={composedRef} {...htmlProps}>{children}</video>;
});

/**
 * Subscribes to the Sia load-acceptance state of the nearest `<Player>`.
 *
 * Reads the same `selectSiaLoad` slice the non-React store consumers use
 * (via `usePlayer(selectSiaLoad)`), so one feature/store drives both. The
 * store must be built with `siaLoadFeature`; only the absence of that
 * configured feature makes this yield `undefined`.
 *
 * `accepted: true` means the current load's worker pipeline accepted the
 * source at the host's SOURCE_OK — a boolean fact, not a playable/ready
 * signal.
 *
 * @returns The Sia load-acceptance state for the attached media, or `undefined`
 *   when the player store was built without `siaLoadFeature`.
 * @throws If called outside a `<Player>` — `usePlayer` requires the player
 *   context.
 */
export function useSiaLoad(): SiaLoadState | undefined {
  return usePlayer(selectSiaLoad);
}

/**
 * Subscribes to the Sia reader-progress state of the nearest `<Player>`.
 *
 * Reads the same `selectSiaProgress` state the non-React store consumers use
 * (via `usePlayer(selectSiaProgress)`), so one feature/store drives both. The
 * store must explicitly configure the opt-in `siaProgressFeature`
 * (`features: [...videoFeatures, ...siaFeatures, siaProgressFeature]`), which
 * is deliberately not part of `siaFeatures`, and the host logger must be at
 * `debug` for reader milestones to be forwarded and derived; a louder logger
 * yields an inert state without errors.
 *
 * `retrying: true` means the worker is retrying the current read window
 * (show `(retrying)`); `reading`/`reads` show `loading… (N fetches)`;
 * `bytesRead` is the cumulative whole-MiB count of the current load. All
 * counters reset at every load boundary.
 *
 * @returns The Sia reader-progress state for the attached media, or
 *   `undefined` when the player store was built without
 *   `siaProgressFeature`.
 * @throws If called outside a `<Player>` (`usePlayer` requires the player
 *   context).
 */
export function useSiaProgress(): SiaProgressState | undefined {
  return usePlayer(selectSiaProgress);
}

/**
 * Subscribes to the Sia recovery state of the nearest `<Player>`.
 *
 * Reads the same `selectSiaRecovery` slice the non-React store consumers use
 * (via `usePlayer(selectSiaRecovery)`), so one feature/store drives both. The
 * store must be built with `siaRecoveryFeature`; only the absence of that
 * configured feature makes this yield `undefined`.
 *
 * @returns The Sia recovery state for the attached media, or `undefined` when
 *   the player store was built without `siaRecoveryFeature`.
 * @throws If called outside a `<Player>` — `usePlayer` requires the player
 *   context.
 */
export function useSiaRecovery(): SiaRecoveryState | undefined {
  return usePlayer(selectSiaRecovery);
}

/**
 * Subscribes to the Sia source-info state of the nearest `<Player>`.
 *
 * Reads the same `selectSiaSourceInfo` slice the non-React store consumers use
 * (via `usePlayer(selectSiaSourceInfo)`), so one feature/store drives both.
 * The store must be built with `siaSourceInfoFeature`; only the absence of
 * that configured feature makes this yield `undefined`.
 *
 * The whole window nests under the single collision-safe `sourceInfo` key:
 * `{ sourceInfo: { active: false } }` closed, `{ sourceInfo: { active: true,
 * info } }` open. `sourceInfo.active: true` means the current load's worker
 * pipeline accepted the source and vouched for `info` at the host's SOURCE_OK
 * — the exact `SourceInfo` (`durationSeconds` may be `null`), not a
 * playable/ready signal, and `info` is read-only.
 *
 * @returns The Sia source-info state for the attached media, or `undefined`
 *   when the player store was built without `siaSourceInfoFeature`.
 * @throws If called outside a `<Player>` — `usePlayer` requires the player
 *   context.
 */
export function useSiaSourceInfo(): SiaSourceInfoState | undefined {
  return usePlayer(selectSiaSourceInfo);
}
