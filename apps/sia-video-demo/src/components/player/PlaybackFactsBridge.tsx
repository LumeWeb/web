/**
 * Inside-Player Video.js v10 playback-facts bridge: reads the four generic
 * player-store selectors (`selectPlayback`, `selectTime`, `selectBuffer`,
 * `selectError`) through `usePlayer`, normalizes their possibly-undefined
 * states into one stable typed snapshot (every field defined; absent feature
 * ⇒ `available: false`, malformed times/ranges ⇒ deterministic values), and
 * reports it to the parent through `onFacts`. Only store selectors are read
 *, no DOM listeners, refs, or phase derivation; mirroring the
 * SiaStatusBridge contract.
 */

import { useEffect, useMemo } from "react";
import { usePlayer } from "@videojs/react";
import {
  selectBuffer,
  selectError,
  selectPlayback,
  selectTime,
} from "@videojs/core/dom";
import type {
  MediaBufferState,
  MediaErrorState,
  MediaPlaybackState,
  MediaTimeState,
} from "@videojs/media";

/**
 * The stable typed display-facts snapshot the bridge sends to the parent;
 * consumers never branch on `undefined`.
 */
export interface PlaybackFacts {
  readonly buffer: PlaybackFactsBuffer;
  readonly error: PlaybackFactsError;
  readonly playback: PlaybackFactsPhase;
  readonly time: PlaybackFactsTime;
}

/** Props accepted by the inside-Player playback-facts bridge. */
export interface PlaybackFactsBridgeProps {
  /** Receives the normalized snapshot on every render where it changes. */
  readonly onFacts: (facts: PlaybackFacts) => void;
}

/** Normalized buffer/seekable facts from the `selectBuffer` selector. */
export interface PlaybackFactsBuffer {
  /** Whether the player store was built with the `buffer` feature. */
  readonly available: boolean;
  /** Normalized buffered ranges, empty when absent. */
  readonly buffered: readonly PlaybackTimeRange[];
  /** Whether at least one buffered range is present. */
  readonly bufferedAvailable: boolean;
  /** Normalized seekable ranges, empty when absent. */
  readonly seekable: readonly PlaybackTimeRange[];
  /** Whether at least one seekable range is present (timeline known). */
  readonly seekableAvailable: boolean;
}

/** Normalized error-presence facts from the `selectError` selector. */
export interface PlaybackFactsError {
  /** Whether the player store was built with the `error` feature. */
  readonly available: boolean;
  /** The media error code, or `null` while no error is present. */
  readonly code: null | number;
  /** The media error message, or `null` while no error is present. */
  readonly message: null | string;
  /** Whether the media currently reports an error. */
  readonly present: boolean;
}

/** The four possibly-undefined selector states the normalizer accepts. */
export interface PlaybackFactsInputs {
  readonly buffer: MediaBufferState | undefined;
  readonly error: MediaErrorState | undefined;
  readonly playback: MediaPlaybackState | undefined;
  readonly time: MediaTimeState | undefined;
}

/** Normalized playback-phase facts from the `selectPlayback` selector. */
export interface PlaybackFactsPhase {
  /** Whether the player store was built with the `playback` feature. */
  readonly available: boolean;
  /** Whether playback has reached the end of the media. */
  readonly ended: boolean;
  /** Whether playback is paused. */
  readonly paused: boolean;
  /** Whether playback has started (played or seeked). */
  readonly started: boolean;
  /** Whether playback is stalled waiting for data. */
  readonly waiting: boolean;
}

/** Normalized time facts from the `selectTime` selector. */
export interface PlaybackFactsTime {
  /** Whether the player store was built with the `time` feature. */
  readonly available: boolean;
  /** Current playback position in seconds (0 before data). */
  readonly currentTime: number;
  /** Total duration in seconds (0 when unknown). */
  readonly duration: number;
  /** Whether a seek operation is in progress. */
  readonly seeking: boolean;
}

/** A normalized media time range `[start, end]` in seconds. */
export type PlaybackTimeRange = readonly [start: number, end: number];

/** The fully-inert snapshot: no feature available, every fact at its default. */
export function emptyPlaybackFacts(): PlaybackFacts {
  return normalizePlaybackFacts({
    buffer: undefined,
    error: undefined,
    playback: undefined,
    time: undefined,
  });
}

/** Normalizes all four selector states into one stable typed snapshot. */
export function normalizePlaybackFacts(
  inputs: PlaybackFactsInputs,
): PlaybackFacts {
  return {
    buffer: normalizePlaybackFactsBuffer(inputs.buffer),
    error: normalizePlaybackFactsError(inputs.error),
    playback: normalizePlaybackFactsPhase(inputs.playback),
    time: normalizePlaybackFactsTime(inputs.time),
  };
}

/**
 * Normalizes a possibly-undefined buffer state; `undefined` is inert, and
 * malformed ranges are dropped deterministically.
 */
export function normalizePlaybackFactsBuffer(
  state?: MediaBufferState,
): PlaybackFactsBuffer {
  const buffered = normalizePlaybackRanges(state?.buffered);
  const seekable = normalizePlaybackRanges(state?.seekable);
  return {
    available: state !== undefined,
    buffered,
    bufferedAvailable: buffered.length > 0,
    seekable,
    seekableAvailable: seekable.length > 0,
  };
}

/**
 * Normalizes a possibly-undefined error state; `undefined` is inert and an
 * absent error carries explicit `null` details.
 */
export function normalizePlaybackFactsError(
  state?: MediaErrorState,
): PlaybackFactsError {
  const error = state?.error ?? null;
  return {
    available: state !== undefined,
    code: error?.code ?? null,
    message: error?.message ?? null,
    present: error !== null,
  };
}

/**
 * Normalizes a possibly-undefined playback-phase state; `undefined` is inert
 * and matches the feature's own `paused: true` idle default.
 */
export function normalizePlaybackFactsPhase(
  state?: MediaPlaybackState,
): PlaybackFactsPhase {
  return {
    available: state !== undefined,
    ended: state?.ended ?? false,
    paused: state?.paused ?? true,
    started: state?.started ?? false,
    waiting: state?.waiting ?? false,
  };
}

/**
 * Normalizes a possibly-undefined time state; `undefined` is inert and
 * non-finite or negative media times normalize to `0`.
 */
export function normalizePlaybackFactsTime(
  state?: MediaTimeState,
): PlaybackFactsTime {
  return {
    available: state !== undefined,
    currentTime: normalizePlaybackSeconds(state?.currentTime),
    duration: normalizePlaybackSeconds(state?.duration),
    seeking: state?.seeking ?? false,
  };
}

/**
 * Inside-Player playback-facts bridge. Renders `null` and relays the four
 * selector states as one stable snapshot. Must stay a child of the player
 * `<Player>` so `usePlayer` (behind every selector) resolves.
 */
export function PlaybackFactsBridge({ onFacts }: PlaybackFactsBridgeProps) {
  const buffer = usePlayer(selectBuffer);
  const error = usePlayer(selectError);
  const playback = usePlayer(selectPlayback);
  const time = usePlayer(selectTime);
  // Memoize against the four stable selector values: the selector-backed
  // hooks return referentially stable states until a genuine store change,
  // so the report effect only re-fires on a genuine change, a fresh object
  // per render would loop the parent's setFacts on every re-render.
  const facts = useMemo(
    () => normalizePlaybackFacts({ buffer, error, playback, time }),
    [buffer, error, playback, time],
  );

  useEffect(() => {
    onFacts(facts);
  }, [facts, onFacts]);

  return null;
}

/**
 * Normalizes media time ranges, dropping non-finite, negative, or inverted
 * bounds so the snapshot only carries well-formed, JSON-safe ranges.
 */
function normalizePlaybackRanges(
  ranges?: readonly [number, number][],
): readonly PlaybackTimeRange[] {
  if (!ranges) return [];
  return ranges
    .filter(
      ([start, end]) =>
        Number.isFinite(start) &&
        Number.isFinite(end) &&
        start >= 0 &&
        end >= start,
    )
    .map(([start, end]) => [start, end] as const);
}

/** Normalizes a media-time value: non-finite or negative values become `0`. */
function normalizePlaybackSeconds(value?: number): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? value
    : 0;
}
