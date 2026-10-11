/**
 * Sia player wiring for the hoisted selected source, the only place the
 * player shell, media, and status bridge are composed from the selection.
 *
 * - An unarmed selection mounts nothing: no player chrome, media, or worker.
 * - An armed selection mounts the SiaPlayer shell around the library
 *   `SiaVideo` wrapper and the
 *   inside-Player bridges (SiaStatusBridge, PlaybackFactsBridge,
 *   AutoPlayBridge, UserPlayBridge). The worker HELLO config comes from the
 *   current indexer; the transport `src` and the selected supplier callback
 *   come from the selected union (app key in publish, sharing key in
 *   shared, never both, never the other mode's). The demo-wide
 *   `eventLogLogger` singleton is the media `logger`, so every host/worker
 *   record lands in the event-log store.
 * - The playback backend policy and the native stream provider come from the
 *   ONE centralized developer-options store: `resolvePlaybackBackend` maps
 *   the options deterministically: native enabled uses `auto`; native disabled
 *   uses worker-only `media-worker`. The demo native stream provider is
 *   built ONCE at module scope from the demo stream service through the
 *   concise `createSiaNativeStreamProvider(service)` factory. No player
 *   component owns a feature flag.
 * - Source/supplier/indexer changes reload IN PLACE via the `reloadKey`
 *   (which drives `reloadConfiguration()`), never a React `key` remount.
 *   The reload key is display-safe only: it deliberately excludes the
 *   publish `fetchForm` (a share URL embedding the decryption key) and any
 *   seed, so key material never reaches the reload identity string.
 *   Developer options update the persistent media instance in place; log
 *   verbosity updates the worker threshold without restarting playback.
 *
 * The pure derivations are exported so the mount props and reload-key
 * contract can be unit-tested without a DOM (SiaVideoMount.spec.ts).
 */

/* oxlint-disable perfectionist/sort-modules, typescript(unbound-method) */
import {
  createSiaNativeStreamProvider,
  SIA_PLAYBACK_BACKENDS,
  type SiaNativeStreamProvider,
  type SiaPlaybackBackend,
} from "@lumeweb/sia-video-source";
import { useEffect, useMemo, useState } from "react";
import { useStore } from "zustand";
import type { WorkerConfig } from "@lumeweb/sia-video-source";
import { APP_META } from "../../lib/constants";
import { eventLogLogger } from "../../lib/eventLogLogger";
import { resolvePlaybackBackend } from "../../lib/playbackBackend";
import { getDemoNativeStreamService } from "../../lib/streamService";
import { useDeveloperOptionsStore } from "../../stores/developerOptions";
import { useEventLogStore } from "../../stores/eventLog";
import { AutoPlayBridge } from "./AutoPlayBridge";
import { PlaybackFactsBridge } from "./PlaybackFactsBridge";
import { UserPlayBridge } from "./UserPlayBridge";
import type { PlaybackFacts } from "./PlaybackFactsBridge";
import type { PublishAppKeySupplier } from "./PublishSuppliers";
import type { SelectedSource } from "./SelectedSource";
import type { SharedSharingKeySupplier } from "./SharedSuppliers";
import { SiaPlayer } from "./SiaPlayer";
import { SiaVideo } from "@lumeweb/sia-video-source/react";
import { SiaStatusBridge } from "./SiaStatusBridge";
import type { SiaStatus } from "./SiaStatusBridge";

/**
 * The demo native stream provider, built ONCE at module scope from the
 * demo stream service through the concise `createSiaNativeStreamProvider`
 * factory. Module-stable identity: the library wrapper assigns it only on a
 * reference change, and the service reads the centralized developer-options
 * store at call time, so the single provider serves every mount.
 */
const demoNativeStreamProvider: SiaNativeStreamProvider =
  createSiaNativeStreamProvider({
    isAvailable: (signal) => getDemoNativeStreamService().isAvailable(signal),
    resolve: (src) => getDemoNativeStreamService().resolve(src),
    session: (source, signal) =>
      getDemoNativeStreamService().session(source, signal),
  });

/** Inputs the mount derivation needs that are not part of the selected union. */
export interface SiaVideoMountDeps {
  /**
   * The deterministic playback backend resolved from the centralized
   * developer options (`resolvePlaybackBackend`).
   */
  readonly backend: SiaPlaybackBackend;
  /** Current indexer config; feeds the worker's HELLO connection metadata. */
  readonly indexerUrl: string;
  /** The demo native stream provider (module-stable identity). */
  readonly nativeStreamProvider: SiaNativeStreamProvider;
}

/** Props accepted by the Sia player wiring component. */
export interface SiaVideoMountProps {
  /**
   * A pending best-effort autoplay intent (a shared row user selection or a
   * share-fragment preselection); routed to the inside-Player AutoPlayBridge.
   */
  readonly autoplayPending: boolean;
  /** Current indexer config routed into the worker HELLO. */
  readonly indexerUrl: string;
  /** The pending autoplay intent was consumed by one play attempt. */
  readonly onAutoplayConsumed: () => void;
  /** Receives the hoisted, always-defined PlaybackFacts snapshot. */
  readonly onFacts: (facts: PlaybackFacts) => void;
  /** The pending stage-click play request was consumed by one play attempt. */
  readonly onPlayConsumed: () => void;
  /** Receives the hoisted, always-defined SiaStatus snapshot. */
  readonly onStatus: (status: SiaStatus) => void;
  /**
   * A user-gesture stage-click play request is pending; routed to the
   * inside-Player UserPlayBridge, which plays once the Sia load is accepted.
   */
  readonly playRequested: boolean;
  /** The display-safe selected source union; null mounts no player. */
  readonly selectedSource: null | SelectedSource;
}

/**
 * Every prop the player composition derives from the armed selection. The
 * supplier fields are the selected union's callback identities, `undefined`
 * when that mode has no authenticated session.
 */
export interface SiaVideoMountState {
  /** The deterministic playback backend from the centralized developer options. */
  readonly backend: SiaPlaybackBackend;
  /** The selected publish app-key supplier callback, or `undefined`. */
  readonly getAppKeySeed: PublishAppKeySupplier["getAppKeySeed"] | undefined;
  /** The selected shared sharing-key supplier callback, or `undefined`. */
  readonly getSharingKeySeed:
    SharedSharingKeySupplier["getSharingKeySeed"] | undefined;
  /** The demo native stream provider (module-stable identity). */
  readonly nativeStreamProvider: SiaNativeStreamProvider;
  /** Display-safe in-place reload identity (see module doc). */
  readonly reloadKey: string;
  /** Worker HELLO connection metadata, app metadata + current indexer. */
  readonly sia: WorkerConfig;
  /** The transport source the media element loads (`fetchForm` / object key). */
  readonly src: string;
}

/**
 * Renders the player composition for the armed selection, or nothing for an
 * unarmed one. The shell is never remounted on source/supplier/indexer
 * changes, `reloadKey` covers those in place; the inside-Player bridges
 * hoist their typed snapshots up through `onStatus`/`onFacts`.
 */
export function SiaVideoMount({
  autoplayPending,
  indexerUrl,
  onAutoplayConsumed,
  onFacts,
  onPlayConsumed,
  onStatus,
  playRequested,
  selectedSource,
}: SiaVideoMountProps) {
  // The ONE centralized developer-options store: the mount reads it, never
  // owns a flag. The deterministic backend choice derives from the single
  // native-disable option.
  const disableNativePlayback = useStore(
    useDeveloperOptionsStore,
    (s) => s.disableNativePlayback,
  );
  const disableWorkerPlayback = useStore(
    useDeveloperOptionsStore,
    (s) => s.disableWorkerPlayback,
  );
  // Re-render the persistent SiaVideo wrapper when verbose changes. Its
  // per-render sync reads the singleton's live level and calls
  // setWorkerLogLevel(), which sends LOG_LEVEL in place (never reloadKey or a
  // playback restart).
  useStore(useEventLogStore, (s) => s.verbose);
  const [streamingPrepared, setStreamingPrepared] = useState(false);
  const [preparationFailed, setPreparationFailed] = useState(false);
  useEffect(() => {
    let active = true;
    setStreamingPrepared(false);
    setPreparationFailed(false);
    void getDemoNativeStreamService()
      .prepare()
      .then(
        () => {
          if (active) setStreamingPrepared(true);
        },
        () => {
          if (active) {
            // A failed startup must select the worker explicitly. Otherwise the
            // provider's retryable preparation can make AUTO select native again.
            setPreparationFailed(true);
            setStreamingPrepared(true);
          }
        },
      );
    return () => {
      active = false;
    };
  }, []);
  const backend = useMemo(
    () =>
      preparationFailed && !disableWorkerPlayback
        ? SIA_PLAYBACK_BACKENDS.MEDIA_WORKER
        : resolvePlaybackBackend({ disableNativePlayback, disableWorkerPlayback }),
    [disableNativePlayback, disableWorkerPlayback, preparationFailed],
  );
  const mount = useMemo(
    () =>
      siaVideoMountState(selectedSource, {
        backend,
        indexerUrl,
        nativeStreamProvider: demoNativeStreamProvider,
      }),
    [backend, indexerUrl, selectedSource],
  );
  if (!shouldMountSiaVideo(mount, streamingPrepared)) return null;
  return (
    <SiaPlayer>
      <SiaVideo
        backend={mount.backend}
        getAppKeySeed={mount.getAppKeySeed}
        getSharingKeySeed={mount.getSharingKeySeed}
        // Demo-wide event-log sink; stable singleton so the host's per-render
        // `media.logger = logger` re-application stays on one sink.
        logger={eventLogLogger}
        nativeStreamProvider={mount.nativeStreamProvider}
        preload="auto"
        reloadKey={mount.reloadKey}
        sia={mount.sia}
        src={mount.src}
      />
      <AutoPlayBridge
        onConsumed={onAutoplayConsumed}
        pending={autoplayPending}
      />
      <UserPlayBridge onConsumed={onPlayConsumed} pending={playRequested} />
      <SiaStatusBridge onStatus={onStatus} />
      <PlaybackFactsBridge onFacts={onFacts} />
    </SiaPlayer>
  );
}

/** Mounting waits for native streaming preparation so AUTO can select it on first load. */
export function shouldMountSiaVideo(
  mount: null | SiaVideoMountState,
  streamingPrepared: boolean,
): mount is SiaVideoMountState {
  return mount !== null && streamingPrepared;
}

/**
 * Display-safe in-place reload identity for an armed selection: mode, public
 * display identity, and current indexer URL, so any of those changes runs
 * `reloadConfiguration()` instead of a remount. Shared identity adds the
 * SHA-256 `sourceId` digest (it folds the sharing-key seed in, so a seed
 * swap bumps the reload even though the object and `src` are unchanged);
 * publish identity is the public object key, never the key-bearing
 * `fetchForm`.
 */
export function siaVideoMountReloadKey(
  selectedSource: SelectedSource,
  deps: Pick<SiaVideoMountDeps, "indexerUrl">,
): string {
  if (selectedSource.mode === "publish") {
    return `${selectedSource.mode}|${selectedSource.source.objectKey}|${deps.indexerUrl}`;
  }
  return [
    selectedSource.mode,
    selectedSource.source.objectKey,
    selectedSource.source.sourceId,
    deps.indexerUrl,
  ].join("|");
}

/**
 * The transport source string for an armed selection: publish streams the
 * `sia://` fetch form (the worker re-derives the encryption key from it);
 * shared streams the bare 64-hex object key through the sharing-key SDK.
 */
export function siaVideoMountSrc(selectedSource: SelectedSource): string {
  return selectedSource.mode === "publish"
    ? selectedSource.source.fetchForm
    : selectedSource.source.objectKey;
}

/**
 * Derives the full player composition props, or `null` when unarmed. Routes
 * exactly the selected supplier callback: publish carries only the app-key
 * supplier, shared only the sharing-key supplier. Carries the deterministic
 * backend and the module-stable native stream provider from the deps.
 */
export function siaVideoMountState(
  selectedSource: null | SelectedSource,
  deps: SiaVideoMountDeps,
): null | SiaVideoMountState {
  if (selectedSource === null) return null;
  return {
    backend: deps.backend,
    getAppKeySeed:
      selectedSource.mode === "publish"
        ? selectedSource.supplier?.getAppKeySeed
        : undefined,
    getSharingKeySeed:
      selectedSource.mode === "shared"
        ? selectedSource.supplier?.getSharingKeySeed
        : undefined,
    nativeStreamProvider: deps.nativeStreamProvider,
    reloadKey: siaVideoMountReloadKey(selectedSource, deps),
    sia: { app: APP_META, indexerUrl: deps.indexerUrl },
    src: siaVideoMountSrc(selectedSource),
  };
}
