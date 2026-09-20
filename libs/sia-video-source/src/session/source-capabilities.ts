/**
 * Session capability reporting: the pure mapping from one load's facts —
 * container, codecs, the built random access index, the producer's own mode,
 * and the MSE MIME — into the domain `SourceCapabilities` and the optional
 * `SOURCE_OK.info` capability fields (`playback`, `indexGranularity`,
 * `tracks`) the worker reports to the host.
 *
 * This module is generic by construction: it imports no Sia SDK, no MSE
 * internals, and no worker routing. The `LoadPipeline` seam emits
 * `SourceCapabilities` through these functions, and the worker renders
 * `SOURCE_OK.info` through `sourceInfoFor`, so the mapping is defined (and
 * tested) exactly once instead of live in the worker's load handler.
 */

import {
  type CodecDescriptor,
  containerKind,
  type ContainerKind,
  indexGranularity,
  type IndexGranularity,
  mediaKind,
  type MediaKind,
  type PlaybackMode,
  type RandomAccessIndex,
  type SourceCapabilities,
  type TrackSummary,
} from '../media/types.ts';
import type { SourceInfo, WorkerMode } from '../protocol.ts';

/** Codec-id prefixes that unambiguously name an audio track. */
const AUDIO_CODEC_PREFIXES = ['ac-3', 'alac', 'ec-3', 'flac', 'mp4a.', 'opus', 'vorbis'] as const;

/**
 * Everything the capability report needs to know about one accepted load,
 * independent of how the bytes were produced or fetched.
 */
export interface SourceCapabilityFacts {
  /** Codecs discovered on the object, in track order (video then audio). */
  readonly codecs: readonly CodecDescriptor[];
  /** Container family the classifier reported. */
  readonly container: ContainerKind;
  /** Transport/media duration estimate when one exists, else `null`. */
  readonly durationSeconds: null | number;
  /** A built random-access index, or `null` when none exists yet. */
  readonly index: null | RandomAccessIndex;
  /** MSE-ready MIME the worker will append with (the producer's output MIME). */
  readonly mime: string;
  /** Container/codec-decided playback mode (the producer's own mode). */
  readonly playback: PlaybackMode;
}

/**
 * Codecs the mux.js TS→fMP4 remux pipeline vouches for (H.264 + AAC; the
 * `DEFAULT_FMP4_MIME` set). Used when a TS object's real codec table lives
 * inside the stream rather than a probe-able init segment.
 */
export const TS_REMUX_CODECS: readonly CodecDescriptor[] = codecDescriptorsFromRfc6381('avc1.640028,mp4a.40.2');

/**
 * Splits an RFC 6381 codec CSV (e.g. `avc1.640028,mp4a.40.2`) into
 * track-ordered {@link CodecDescriptor}s. Known audio prefixes classify as
 * `audio`; anything else is conservatively `video` (the AED/track classification
 * carries the real decodability verdict).
 */
export function codecDescriptorsFromRfc6381(csv: string): CodecDescriptor[] {
  return csv
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((mimeCodec) => ({ codec: mimeCodec, kind: kindOfCodec(mimeCodec), mimeCodec }));
}

/**
 * How precisely this object can answer "give me the bytes around time T".
 * An authoritative index wins (its own granularity); without one, fMP4 and TS
 * fall back to throughput-directed reads and every other container has no
 * usable index today.
 */
export function indexGranularityFor(container: ContainerKind, index: null | RandomAccessIndex): IndexGranularity {
  if (index) return index.granularity;
  return container === containerKind.fmp4 || container === containerKind.ts ? indexGranularity.throughput : indexGranularity.none;
}

/** Builds the domain capability summary `SOURCE_OK` will carry. */
export function sourceCapabilitiesFor(facts: SourceCapabilityFacts): SourceCapabilities {
  return {
    codecs: facts.codecs,
    container: facts.container,
    // The index's vouch for duration outranks a transport estimate.
    durationSeconds: facts.index?.durationSeconds ?? facts.durationSeconds,
    indexGranularity: indexGranularityFor(facts.container, facts.index),
    mime: facts.mime,
    playbackMode: facts.playback,
  };
}

/**
 * Renders the complete `SOURCE_OK.info` shape for a load, including the
 * optional capability fields (`playback`, `indexGranularity`, `tracks`).
 * `mode` is the worker/main MSE construction site for this session.
 */
export function sourceInfoFor(facts: SourceCapabilityFacts, mode: WorkerMode): SourceInfo {
  const capabilities = sourceCapabilitiesFor(facts);
  return {
    container: capabilities.container,
    durationSeconds: capabilities.durationSeconds,
    indexGranularity: capabilities.indexGranularity,
    // `facts.mime` is the MSE string actually appended with (never null);
    // `capabilities.mime` may be `null` pre-MSE and would not type-check here.
    mime: facts.mime,
    mode,
    playback: capabilities.playbackMode,
    tracks: tracksFromCodecs(capabilities.codecs),
  };
}

/** Maps codec descriptors to `{ kind, codec }` track summaries in track order. */
export function tracksFromCodecs(codecs: readonly CodecDescriptor[]): TrackSummary[] {
  return codecs.map(({ codec, kind }) => ({ codec, kind }));
}

function kindOfCodec(mimeCodec: string): MediaKind {
  return AUDIO_CODEC_PREFIXES.some((prefix) => mimeCodec.startsWith(prefix)) ? mediaKind.audio : mediaKind.video;
}
