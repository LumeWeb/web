/**
 * Session capability reporting: the pure mapping from one ready load's facts —
 * container, duration, MSE MIME, and track codecs — plus the session's MSE
 * construction site into the `SOURCE_OK.info` wire shape.
 *
 * The module stays generic: it imports no Sia SDK, no MSE internals, and no
 * worker routing, so `sourceInfoFor` is defined (and tested) here exactly once
 * instead of live in the worker's load handler.
 */

import type { PlaybackTrack } from '../media/types.ts';
import type { SourceInfo, WorkerMode } from '../protocol.ts';

/** Everything the `SOURCE_OK.info` mapping needs to know about one ready load. */
export interface SourceCapabilityFacts {
  /** Container family the library reported. */
  readonly container: string;
  /** Media duration in seconds when one exists, else null. */
  readonly durationSeconds: null | number;
  /** MSE-ready MIME the worker will append with. */
  readonly mime: string;
  /** Track codecs in track order; empty when unknown. */
  readonly tracks: readonly PlaybackTrack[];
}

/**
 * Renders the `SOURCE_OK.info` wire shape for a ready load: the container,
 * duration, MIME, and track codecs the load resolved, plus `mode` (the
 * worker/main MSE construction site for this session).
 */
export function sourceInfoFor(facts: SourceCapabilityFacts, mode: WorkerMode): SourceInfo {
  return {
    container: facts.container,
    durationSeconds: facts.durationSeconds,
    mime: facts.mime,
    mode,
    tracks: facts.tracks,
  };
}
