/**
 * Source-switch loading cover: the playback-stage overlay that hides the prior
 * frame while the player switches between distinct selected-source identities.
 *
 * The decision is a pure reducer over the displayed identity and the hoisted
 * `PlaybackFacts`/`SiaStatus` snapshots. Invariants:
 *
 * - The first armed source never shows a cover.
 * - A distinct identity switch arms an opaque cover.
 * - The cover reveals only on a suitable fact of the CURRENT source, after its
 *   load reset boundary. That boundary is the SIA LOAD RESET
 *   (`load.accepted: false`) the host emits once per load boundary, not
 *   `playback.started: false`, since a replaced MediaSource keeps the old
 *   source's `started: true` alive through the replacement. `started`
 *   additionally requires the current identity to have been observed
 *   not-started, so a stale sticky flag can neither reveal nor update.
 */

import { useEffect, useMemo, useReducer } from "react";
import type { PlaybackFacts } from "./PlaybackFactsBridge";
import { emptyPlaybackFacts } from "./PlaybackFactsBridge";
import type { SelectedSource } from "./SelectedSource";
import type { SiaStatus } from "./SiaStatusBridge";
import { emptySiaStatus } from "./SiaStatusBridge";
import { siaVideoMountReloadKey } from "./SiaVideoMount";

/** Action union for the source-switch cover reducer. */
export interface SourceSwitchCoverAction {
  /** The hoisted, always-defined PlaybackFacts snapshot. */
  readonly facts: PlaybackFacts;
  /** The displayed source's reload identity, or null when unarmed. */
  readonly identity: null | string;
  /** The hoisted, always-defined SiaStatus snapshot. */
  readonly status: SiaStatus;
  readonly type: "snapshot";
}

/** Props accepted by the source-switch cover component. */
export interface SourceSwitchCoverProps {
  /** Hoisted PlaybackFacts snapshot, or null before the first bridge report. */
  readonly facts: null | PlaybackFacts;
  /** Current indexer config; part of the source-switch identity. */
  readonly indexerUrl: string;
  /** The display-safe selected-source union, or null when unarmed. */
  readonly selectedSource: null | SelectedSource;
  /** Hoisted SiaStatus snapshot, or null before the first bridge report. */
  readonly status: null | SiaStatus;
}

/** The pure source-switch cover decision state. */
export interface SourceSwitchCoverState {
  /** Identity the opaque cover is armed over, or null while idle. */
  readonly armedFor: null | string;
  /**
   * The current load was observed in its reset (unaccepted) state since the
   * cover armed, the current-source boundary that proves a later ready fact
   * belongs to the current source, not the superseded one.
   */
  readonly boundarySeen: boolean;
  /** Identity of the last armed source seen, or null when none mounted yet. */
  readonly lastIdentity: null | string;
  /**
   * The current identity was observed not-started since the cover armed; a
   * sticky `started: true` from the old resource must not reveal the cover.
   */
  readonly startedResetSeen: boolean;
  /** Whether the opaque loading cover is currently shown. */
  readonly visible: boolean;
}

/** The fully-idle cover state: nothing seen, nothing armed, cover hidden. */
export function initialSourceSwitchCoverState(): SourceSwitchCoverState {
  return {
    armedFor: null,
    boundarySeen: false,
    lastIdentity: null,
    startedResetSeen: false,
    visible: false,
  };
}

/**
 * Renders the opaque source-switch cover while the reducer says it is
 * visible. A null hoisted snapshot normalizes to the inert facts/status.
 */
export function SourceSwitchCover({
  facts,
  indexerUrl,
  selectedSource,
  status,
}: SourceSwitchCoverProps) {
  const identity = useMemo(
    () =>
      selectedSource === null
        ? null
        : siaVideoMountReloadKey(selectedSource, { indexerUrl }),
    [indexerUrl, selectedSource],
  );
  const [state, dispatch] = useReducer(
    sourceSwitchCoverReducer,
    undefined,
    initialSourceSwitchCoverState,
  );
  useEffect(() => {
    dispatch({
      facts: facts ?? emptyPlaybackFacts(),
      identity,
      status: status ?? emptySiaStatus(),
      type: "snapshot",
    });
  }, [facts, identity, status]);

  if (!state.visible) return null;
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 z-10 bg-black"
      data-source-switch-cover="true"
    />
  );
}

/**
 * Whether the current source produces a reveal fact after its load reset
 * boundary: a present media error, a nonempty accepted Sia load, or
 * `started`, but only once the current identity was observed not-started.
 */
export function sourceSwitchCoverCurrentReveal(
  facts: PlaybackFacts,
  status: SiaStatus,
  startedResetSeen: boolean,
): boolean {
  return (
    facts.error.present ||
    (status.load.accepted && status.progress.bytesRead > 0) ||
    (startedResetSeen && facts.playback.started)
  );
}

/**
 * Whether the current load is in its reset (unaccepted) state, the
 * current-source boundary the cover waits on.
 */
export function sourceSwitchCoverLoadReset(status: SiaStatus): boolean {
  return !status.load.accepted;
}

/**
 * Pure source-switch cover reducer over the displayed identity and the
 * hoisted snapshots. Unarmed selections reset to idle; the first armed
 * source is never covered; a distinct identity switch arms the cover (the
 * boundary counts as seen only if the load is already unaccepted); a covered
 * identity reveals on the first suitable current-source fact after the load
 * reset and stays revealed while selected.
 */
export function sourceSwitchCoverReducer(
  state: SourceSwitchCoverState,
  action: SourceSwitchCoverAction,
): SourceSwitchCoverState {
  const { facts, identity, status } = action;

  // Nothing selected: reset so the next arm is a fresh first-arm.
  if (identity === null) {
    if (
      state.armedFor === null &&
      state.lastIdentity === null &&
      !state.boundarySeen &&
      !state.startedResetSeen &&
      !state.visible
    ) {
      return state;
    }
    return initialSourceSwitchCoverState();
  }

  // First armed source: an empty stage needs no cover.
  if (state.lastIdentity === null) {
    return {
      armedFor: null,
      boundarySeen: false,
      lastIdentity: identity,
      startedResetSeen: false,
      visible: false,
    };
  }

  // Distinct identity: arm the cover. The boundary counts as seen only when
  // the load already reports unaccepted, a still-accepted fact may be the
  // superseded source's.
  if (identity !== state.lastIdentity) {
    return {
      armedFor: identity,
      boundarySeen: sourceSwitchCoverLoadReset(status),
      lastIdentity: identity,
      startedResetSeen: !facts.playback.started,
      visible: true,
    };
  }

  // Covered identity: observe the resets, then reveal on the first suitable
  // current-source fact.
  if (state.armedFor === identity) {
    const startedResetSeen = state.startedResetSeen || !facts.playback.started;
    if (!state.boundarySeen) {
      if (sourceSwitchCoverLoadReset(status)) {
        return { ...state, boundarySeen: true, startedResetSeen };
      }
      return { ...state, startedResetSeen };
    }
    if (sourceSwitchCoverCurrentReveal(facts, status, startedResetSeen)) {
      return {
        armedFor: null,
        boundarySeen: false,
        lastIdentity: identity,
        startedResetSeen: false,
        visible: false,
      };
    }
    return { ...state, startedResetSeen };
  }

  // Revealed identity: stays revealed.
  return state;
}
