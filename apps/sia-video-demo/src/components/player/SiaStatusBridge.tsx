/**
 * Inside-Player Sia status bridge: reads the four typed Sia feature hooks
 * from `@lumeweb/sia-video-source/react`, normalizes their possibly-undefined
 * states into one stable typed snapshot (every field defined; absent feature
 * ⇒ `available: false`, closed-window transients ⇒ explicit `null`s), and
 * reports it to the parent through `onStatus`. It only relays the library's
 * typed facts, no playback-phase derivation, no DOM events, refs, or timers.
 */

import { useEffect, useMemo } from "react";
import {
  useSiaLoad,
  useSiaProgress,
  useSiaRecovery,
  useSiaSourceInfo,
} from "@lumeweb/sia-video-source/react";
import type {
  SiaLoadState,
  SiaProgressState,
  SiaRecoveryState,
  SiaSourceInfoState,
  SourceInfo,
} from "@lumeweb/sia-video-source";

/** Normalized load-acceptance window. */
export interface SiaLoadStatus {
  /** Whether the attached media's current load was accepted by the worker pipeline. */
  readonly accepted: boolean;
  /** Whether the load feature is configured on the player store. */
  readonly available: boolean;
}

/** Normalized last-read milestone, with optional fields as explicit `null`s. */
export interface SiaProgressMilestoneStatus {
  /** The coarse milestone name (e.g. `read.window-complete`). */
  readonly name: string;
  /** The milestone position, or `null` when the milestone carried none. */
  readonly position: null | number;
  /** The milestone request id, or `null` when the milestone carried none. */
  readonly requestId: null | number;
}

/** Normalized reader-progress window; every counter always defined. */
export interface SiaProgressStatus {
  /** Whether the progress feature is configured on the player store. */
  readonly available: boolean;
  /** Cumulative whole-MiB bytes the worker reported for the current load. */
  readonly bytesRead: number;
  /** The most recent derived milestone, or `null` before the first one. */
  readonly last: null | SiaProgressMilestoneStatus;
  /** Whether the current load is inside a read window. */
  readonly reading: boolean;
  /** Total read windows opened for the current load. */
  readonly reads: number;
  /** Total retry attempts for the current load. */
  readonly retries: number;
  /** Whether the reader is actively retrying the current read window. */
  readonly retrying: boolean;
}

/** A recovery reason, derived from the library's own typed catalog. */
export type SiaRecoveryReason = NonNullable<SiaRecoveryState["reason"]>;

/** Normalized recovery window: every transient an explicit `null` when closed. */
export interface SiaRecoveryStatus {
  /** Whether a recovery window is open on the attached Sia media. */
  readonly active: boolean;
  /** Whether the recovery feature is configured on the player store. */
  readonly available: boolean;
  /** The recovery reason, or `null` while no recovery window is open. */
  readonly reason: null | SiaRecoveryReason;
  /** Playhead (seconds) the recovery resumes from, or `null` while closed. */
  readonly resumeSeconds: null | number;
  /** Whether the recovery expects to resume playback, or `null` while closed. */
  readonly wantsPlay: boolean | null;
}

/** Normalized source-info window; `info` is `null` while closed. */
export interface SiaSourceInfoStatus {
  /** Whether a source-info window is open on the attached Sia media. */
  readonly active: boolean;
  /** Whether the source-info feature is configured on the player store. */
  readonly available: boolean;
  /** The vetted `SourceInfo`, or `null` while no window is open. */
  readonly info: null | SourceInfo;
}

/**
 * The stable typed display-facts snapshot the bridge sends to the parent;
 * consumers never branch on `undefined`.
 */
export interface SiaStatus {
  readonly load: SiaLoadStatus;
  readonly progress: SiaProgressStatus;
  readonly recovery: SiaRecoveryStatus;
  readonly sourceInfo: SiaSourceInfoStatus;
}

/** Props accepted by the inside-Player Sia status bridge. */
export interface SiaStatusBridgeProps {
  /** Receives the normalized snapshot on every render where it changes. */
  readonly onStatus: (status: SiaStatus) => void;
}

/** The four possibly-undefined feature states the normalizer accepts. */
export interface SiaStatusInputs {
  readonly load: SiaLoadState | undefined;
  readonly progress: SiaProgressState | undefined;
  readonly recovery: SiaRecoveryState | undefined;
  readonly sourceInfo: SiaSourceInfoState | undefined;
}

/** The fully-inert snapshot: no feature available, every fact at its default. */
export function emptySiaStatus(): SiaStatus {
  return normalizeSiaStatus({
    load: undefined,
    progress: undefined,
    recovery: undefined,
    sourceInfo: undefined,
  });
}

/** Normalizes a possibly-undefined load state; `undefined` is inert. */
export function normalizeSiaLoad(state?: SiaLoadState): SiaLoadStatus {
  return {
    accepted: state?.accepted ?? false,
    available: state !== undefined,
  };
}

/** Normalizes a possibly-undefined progress state; `undefined` is inert. */
export function normalizeSiaProgress(
  state?: SiaProgressState,
): SiaProgressStatus {
  return {
    available: state !== undefined,
    bytesRead: state?.bytesRead ?? 0,
    last: state?.last
      ? {
          name: state.last.name,
          position: state.last.position ?? null,
          requestId: state.last.requestId ?? null,
        }
      : null,
    reading: state?.reading ?? false,
    reads: state?.reads ?? 0,
    retries: state?.retries ?? 0,
    retrying: state?.retrying ?? false,
  };
}

/**
 * Normalizes a possibly-undefined recovery state; `undefined` is inert and
 * closed-window transients become explicit `null`s.
 */
export function normalizeSiaRecovery(
  state?: SiaRecoveryState,
): SiaRecoveryStatus {
  const open = state?.active ?? false;
  return {
    active: open,
    available: state !== undefined,
    reason: open ? (state?.reason ?? null) : null,
    resumeSeconds: open ? (state?.resumeSeconds ?? null) : null,
    wantsPlay: open ? (state?.wantsPlay ?? null) : null,
  };
}

/**
 * Normalizes a possibly-undefined source-info state; `undefined` is inert
 * and a closed window carries `info: null`.
 */
export function normalizeSiaSourceInfo(
  state?: SiaSourceInfoState,
): SiaSourceInfoStatus {
  // Develop's source-info window is worker-shaped (`info` + `kind: "worker"`)
  // or native-shaped (`kind: "native"`, no `info`): only a worker window
  // carries the vetted `SourceInfo`; a native window normalizes to `null`.
  const window = state?.sourceInfo;
  return {
    active: window?.active ?? false,
    available: state !== undefined,
    info: window?.active && window.kind === "worker" ? window.info : null,
  };
}

/** Normalizes all four feature states into one stable typed snapshot. */
export function normalizeSiaStatus(inputs: SiaStatusInputs): SiaStatus {
  return {
    load: normalizeSiaLoad(inputs.load),
    progress: normalizeSiaProgress(inputs.progress),
    recovery: normalizeSiaRecovery(inputs.recovery),
    sourceInfo: normalizeSiaSourceInfo(inputs.sourceInfo),
  };
}

/**
 * Inside-Player Sia status bridge. Renders `null` and relays the four Sia
 * feature hooks as one stable snapshot. Must stay a child of the SiaPlayer
 * `<Player>` so `usePlayer` (behind every hook) resolves.
 */
export function SiaStatusBridge({ onStatus }: SiaStatusBridgeProps) {
  const load = useSiaLoad();
  const progress = useSiaProgress();
  const recovery = useSiaRecovery();
  const sourceInfo = useSiaSourceInfo();
  // Memoize against the four stable hook values: the selector-backed hooks
  // return referentially stable states until a genuine store change, so the
  // report effect below only re-fires on a genuine change, a fresh object
  // per render would loop the parent's setStatus on every re-render.
  const status = useMemo(
    () => normalizeSiaStatus({ load, progress, recovery, sourceInfo }),
    [load, progress, recovery, sourceInfo],
  );

  useEffect(() => {
    onStatus(status);
  }, [onStatus, status]);

  return null;
}
