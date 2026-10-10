import { useCallback, useEffect, useMemo, useReducer, useState } from "react";
import { useStore } from "zustand";
import { useAuthStore } from "../../stores/auth";
import {
  autoplayIntentForPreselection,
  autoplayIntentForRowToggle,
  autoplayIntentIsLive,
} from "./AutoPlayBridge";
import type { PlaybackFacts } from "./PlaybackFactsBridge";
import { PlaybackStatusChip } from "./PlaybackStatus";
import { PreparingOverlay } from "./PreparingOverlay";
import { PublishSourceEntry } from "./PublishSourceEntry";
import { RecoveryFeedback } from "./RecoveryFeedback";
import { publishSuppliers } from "./PublishSuppliers";
import {
  initialSelectedSourceState,
  normalizeSelectedSource,
  type PlayerMode,
  selectedSourceReducer,
  SHARED_OBJECT_SELECTED,
} from "./SelectedSource";
import { SharedObjectPicker } from "./SharedObjectPicker";
import { type ArmedSharedSource, sharedSourceState } from "./SharedSourceState";
import { sharedSuppliers } from "./SharedSuppliers";
import type { SiaStatus } from "./SiaStatusBridge";
import { SiaVideoMount, siaVideoMountReloadKey } from "./SiaVideoMount";
import { SourceSwitchCover } from "./SourceSwitchCover";

/** Plain caption under the stage once a source is armed (no mode/raw readout). */
export const SOURCE_SELECTED_CAPTION = "Source selected.";

/** Plain caption under the stage while nothing is armed. */
export const NO_SOURCE_SELECTED_CAPTION = "No source selected yet.";

/** Top-bar action label for a sharing-key-only session. */
export const CLOSE_SHARE_LABEL = "Close share";

/** Top-bar action label for an authenticated (account/SSO) session. */
export const LOGOUT_LABEL = "Log out";

/**
 * Player routing screen. App-key sessions land in "publish" mode (the
 * publish source-entry UI); sharing-key sessions land in "shared" mode and
 * own the object listing/selection stage.
 *
 * This screen OWNs the selected-source state: one explicit, display-safe
 * selected-source union (`normalizeSelectedSource`) that the player wiring
 * consumes. The mode panels are presentational and report selection changes
 * up through callbacks. The union and selection state carry only public
 * fetch/source data plus supplier callbacks, never plaintext seeds (the
 * shared armed identity is a SHA-256 digest; seeds stay in the auth store as
 * callbacks). Clearing the sharing key flips the mode to publish, which drops
 * the shared selection so a stale key can never quietly re-arm.
 *
 * A separately-hoisted best-effort autoplay intent is armed ONLY by the two
 * explicit user events, a shared row selection and a share-fragment
 * preselection, and consumed by one AutoPlayBridge play attempt. The
 * distinct local stage-click play request is honored by the separate
 * UserPlayBridge.
 */
export function PlayerScreen() {
  const clearSharingKeySeed = useStore(
    useAuthStore,
    (s) => s.clearSharingKeySeed,
  );
  const indexerUrl = useStore(useAuthStore, (s) => s.indexerUrl);
  const logout = useStore(useAuthStore, (s) => s.logout);
  const objectKey = useStore(useAuthStore, (s) => s.objectKey);
  const sharingKeyHex = useStore(useAuthStore, (s) => s.sharingKeyHex);
  const userKeyHex = useStore(useAuthStore, (s) => s.userKeyHex);

  const mode: PlayerMode = sharingKeyHex ? "shared" : "publish";

  // Hoisted selection intent: the publish input and the shared object key are
  // owned here; the panels report keystrokes/row clicks up through callbacks.
  // The share-fragment object key pre-selects the shared row on mount.
  const [selection, dispatch] = useReducer(
    selectedSourceReducer,
    undefined,
    () => initialSelectedSourceState(objectKey),
  );

  // Keep the reducer in step with the store-derived mode: clearing the sharing
  // key (mode → publish) drops the shared selection so it cannot re-arm.
  useEffect(() => {
    dispatch({ mode, type: "mode-changed" });
  }, [mode]);

  const publishSuppliersValue = useMemo(
    () => publishSuppliers({ appKeyHex: userKeyHex || null }),
    [userKeyHex],
  );
  const sharedSuppliersValue = useMemo(
    () => sharedSuppliers({ sharingKeyHex }),
    [sharingKeyHex],
  );

  // Display-safe shared armed source derived from the hoisted selection. The
  // sharing-key seed never enters React state here, only the SHA-256 digest
  // (`sourceId`) the shared union carries does.
  const [sharedArmed, setSharedArmed] = useState<ArmedSharedSource | null>(
    null,
  );
  useEffect(() => {
    let cancelled = false;
    setSharedArmed(null);
    const run = async (): Promise<void> => {
      const next = await sharedSourceState(
        sharingKeyHex,
        selection.shared.objectKey,
      );
      if (!cancelled)
        setSharedArmed(next.status === "armed" ? next.source : null);
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [selection.shared.objectKey, sharingKeyHex]);

  // The one explicit selected-source union the player wiring consumes:
  // public fetch/source data plus supplier callbacks, never a seed.
  const selectedSource = useMemo(
    () =>
      normalizeSelectedSource(selection, {
        mode,
        publishSuppliers: publishSuppliersValue,
        sharedArmed,
        sharedSuppliers: sharedSuppliersValue,
      }),
    [mode, publishSuppliersValue, selection, sharedArmed, sharedSuppliersValue],
  );

  // The bridges' always-defined typed display-facts snapshots, hoisted here
  // (the player wiring forwards the inside-Player bridge reports into this
  // state); the overlays and chips above read these raw snapshots.
  const [status, setStatus] = useState<null | SiaStatus>(null);
  const [facts, setFacts] = useState<null | PlaybackFacts>(null);

  // LOCAL user-gesture play request state: the preparing rule needs to know a
  // play was requested but not yet honored, and the hoisted snapshots never
  // expose it. A stage click while a fresh source has not started records the
  // request; the UserPlayBridge consumes it once the Sia load is accepted, and
  // a different armed source forces a fresh gesture.
  const [playRequested, setPlayRequested] = useState(false);

  // The armed source's display-safe reload identity, for resetting the play
  // request when the current source changes.
  const armedIdentity = useMemo(() => {
    if (selectedSource === null) return null;
    return siaVideoMountReloadKey(selectedSource, { indexerUrl });
  }, [indexerUrl, selectedSource]);

  // A different armed source (or unarming) starts a fresh opening: drop any
  // pending play request so the new source never inherits the old one.
  useEffect(() => {
    setPlayRequested(false);
  }, [armedIdentity]);

  // A play request is also spent the moment the current source starts
  // playback, a redundant safety net beside the bridge's own consumption.
  useEffect(() => {
    if (facts?.playback.started) setPlayRequested(false);
  }, [facts?.playback.started]);

  // Pending best-effort autoplay intent, keyed by the canonical shared object
  // key whose armed source should autoplay once the worker accepts its load.
  // Armed only by the two explicit user events; inert the moment the
  // selection leaves its key.
  const [autoplayIntent, setAutoplayIntent] = useState<null | string>(null);

  // Share-fragment preselection is an arming event: the one-shot fragment
  // object key (boot-time ingest or a mid-session hashchange) arms the
  // autoplay intent exactly once per fragment change.
  useEffect(() => {
    if (objectKey) dispatch({ objectKey, type: SHARED_OBJECT_SELECTED });
    setAutoplayIntent(autoplayIntentForPreselection(objectKey));
  }, [objectKey]);

  // Shared row user selection is an arming event: report the toggle to the
  // reducer and arm/denarm the intent to the newly selected key, mirroring
  // the reducer's toggle semantics.
  const onSharedObjectSelect = (objectKey: string): void => {
    dispatch({ objectKey, type: "shared-object-toggled" });
    setAutoplayIntent(
      autoplayIntentForRowToggle(selection.shared.objectKey, objectKey),
    );
  };

  // The armed intent is LIVE only while it matches the currently selected
  // shared key in shared mode; anything else makes it inert, so only the
  // exact manually-chosen source ever autoplays.
  const autoplayPending =
    mode === "shared" &&
    autoplayIntentIsLive(autoplayIntent, selection.shared.objectKey);

  // Consumes the armed intent after a single AutoPlayBridge play attempt;
  // a stable callback identity keeps the bridge's effect from re-firing on
  // unrelated re-renders.
  const consumeAutoplayIntent = useCallback(() => {
    setAutoplayIntent(null);
  }, []);

  // Consumes the pending stage-click play request after a single
  // UserPlayBridge play attempt; stable callback identity as above.
  const consumePlayRequest = useCallback(() => {
    setPlayRequested(false);
  }, []);

  return (
    <section className="bg-canvas-subtle border-border-default mb-4 flex flex-col gap-3 rounded-lg border p-5">
      <div className="text-fg-muted flex items-center text-[13px]">
        {/* Top-bar action buttons only: exactly one action per session. */}
        <div className="ml-auto flex items-center gap-2">
          <button
            className="px-2.5 py-[5px] text-xs"
            onClick={sharingKeyHex ? clearSharingKeySeed : logout}
            type="button">
            {topBarActionLabel(sharingKeyHex, userKeyHex)}
          </button>
        </div>
      </div>
      {mode === "publish" ? (
        <PublishSourceEntry
          input={selection.publish.input}
          onInputChange={(input) =>
            dispatch({ input, type: "publish-input-changed" })
          }
        />
      ) : sharingKeyHex ? (
        <SharedObjectPicker
          indexerUrl={indexerUrl}
          onSelectObject={onSharedObjectSelect}
          selectedKey={selection.shared.objectKey}
          sharingKeyHex={sharingKeyHex}
        />
      ) : null}
      {/* The player stage. An unarmed selection mounts nothing; an armed
          selection mounts the Sia player shell, the SiaVideo media element, and
          the inside-Player bridges (status/facts snapshots hoisted into
          `status`/`facts` above). The source-switch cover overlays the stage
          while the player switches between distinct identities; the preparing
          overlay sits above it while a fresh source opens under a
          not-yet-honored play intent; the recovery chip sits above both while
          an active recovery will resume playback; the playback-status chip
          names the typed phase. Clicking the stage for a not-yet-started
          source is the user-gesture play request. */}
      <div
        className="relative"
        onClick={() => {
          const started = facts?.playback.started ?? false;
          if (selectedSource !== null && !started && !playRequested) {
            setPlayRequested(true);
          }
        }}>
        {selectedSource ? (
          <>
            <SiaVideoMount
              autoplayPending={autoplayPending}
              indexerUrl={indexerUrl}
              onAutoplayConsumed={consumeAutoplayIntent}
              onFacts={setFacts}
              onPlayConsumed={consumePlayRequest}
              onStatus={setStatus}
              playRequested={playRequested}
              selectedSource={selectedSource}
            />
            <SourceSwitchCover
              facts={facts}
              indexerUrl={indexerUrl}
              selectedSource={selectedSource}
              status={status}
            />
            <PreparingOverlay
              autoplayPending={autoplayPending}
              facts={facts}
              playRequested={playRequested}
              status={status}
            />
            <RecoveryFeedback status={status} />
            <PlaybackStatusChip facts={facts} status={status} />
          </>
        ) : null}
      </div>
      <p className="text-fg-muted m-0 text-xs">
        {selectedSource ? SOURCE_SELECTED_CAPTION : NO_SOURCE_SELECTED_CAPTION}
      </p>
    </section>
  );
}

/**
 * The ONE top-bar action a session offers: a sharing-key session gets
 * `Close share` (it clears the sharing key, and any account session behind
 * it reappears with its own action), while an authenticated session keeps
 * the real `Log out`. The two are never offered side by side.
 */
export function topBarActionLabel(
  sharingKeyHex: null | string,
  _userKeyHex: string,
): string {
  return sharingKeyHex ? CLOSE_SHARE_LABEL : LOGOUT_LABEL;
}
