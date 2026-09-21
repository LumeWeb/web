/**
 * TEMPORARY glue for this branch: the pre-restructure media vocabulary on which
 * develop's old container/session/sink consumers still rely. The final-state
 * `types.ts` carries only the media-library types; this copy keeps the old
 * consumers compiling until later branches replace them, then it is deleted.
 */
/**
 * Stable domain vocabulary for Sia video playback.
 *
 * These types are the shared, container-agnostic vocabulary that capability
 * reporting, random-access index builders, producers, and the MSE sink all
 * speak. They carry no Sia specifics and no MSE details: byte addressing is
 * explicit (`RangeRead`), time is always seconds, and codec identity is a plain
 * string. Container and transport code may import these types without ever
 * importing the Sia SDK or deep SPF internals.
 */

/** One track/codec identity used to build codec-qualified MIME strings. */
export interface CodecDescriptor {
  /** Short codec id, e.g. `avc1.640028` or `vp09.00.10.08`. */
  readonly codec: string;
  readonly kind: MediaKind;
  /** The codec component for a codec-qualified MIME string, e.g. `avc1.640028`. */
  readonly mimeCodec: string;
}

/** Container families the classifier may report. */
export const containerKind = {
  fmp4: 'fmp4',
  mkv: 'mkv',
  mp4: 'mp4',
  ts: 'ts',
  unknown: 'unknown',
  webm: 'webm',
} as const;

/** Container families the classifier may report. */
export type ContainerKind = (typeof containerKind)[keyof typeof containerKind];

/**
 * How precisely a stream can answer "give me the bytes around time T", ordered
 * best to worst:
 *
 * - `exact-byte` — authoritative byte-precise ranges (sidx / stbl / Cues /
 *   moof-walk);
 * - `rap-range` — GOP-granular ranges (TS RAP map / per-chunk);
 * - `downloaded-range` — seekable grows as bytes arrive;
 * - `throughput` — estimate only (degraded);
 * - `none` — no index exists at all.
 */
export const indexGranularity = {
  'downloaded-range': 'downloaded-range',
  'exact-byte': 'exact-byte',
  none: 'none',
  'rap-range': 'rap-range',
  throughput: 'throughput',
} as const;

export type IndexGranularity = (typeof indexGranularity)[keyof typeof indexGranularity];

/** A track or codec kind. */
export const mediaKind = {
  audio: 'audio',
  video: 'video',
} as const;

export type MediaKind = (typeof mediaKind)[keyof typeof mediaKind];

/** Whether appended bytes are the init segment or media samples. */
export const segmentKind = {
  init: 'init',
  media: 'media',
} as const;

/** Alias kept for the index-builder/stream-controller contract naming. */
export type MediaRange = RangeRead;

/**
 * One independently appendable MSE unit: optional init (ftyp+moov(+mvex),
 * WebM header) plus the media bytes (moof+mdat, Cluster, or repaired
 * fragment).
 */
export interface MediaSegment {
  readonly init: null | Uint8Array;
  readonly media: Uint8Array;
  readonly meta: SegmentMeta;
}

/**
 * Playback mode reported to the host: every `ProducerMode` plus `sequential`,
 * the narrowest fallback that restarts from byte 0 when random access is
 * structurally invalid.
 */
export type PlaybackMode = (typeof playbackMode)[keyof typeof playbackMode];

/** The playable timeline: seconds-domain duration + byte index. */
export interface Presentation {
  readonly durationSeconds: null | number;
  readonly index: RandomAccessIndex;
  /** Every presentation is on-demand (no live timelines). */
  readonly timeline: 'on-demand';
}

export type SegmentKind = (typeof segmentKind)[keyof typeof segmentKind];

/**
 * How bytes are produced for MSE, chosen once per load:
 *
 * - `passthrough` — bytes appended unchanged (indexed fMP4);
 * - `native` — container appended as-is (WebM where MSE supports it);
 * - `normalized` — runtime remux/refragment (progressive MP4, TS, MKV→fMP4);
 * - `repatch` — light header rewrite (MKV→WebM);
 * - `degraded` — throughput scheduling, no authoritative index.
 */
export const producerMode = {
  degraded: 'degraded',
  native: 'native',
  normalized: 'normalized',
  passthrough: 'passthrough',
  repatch: 'repatch',
} as const;

export type ProducerMode = (typeof producerMode)[keyof typeof producerMode];

/** Every `ProducerMode` plus `sequential` (see {@link PlaybackMode}). */
export const playbackMode = {
  ...producerMode,
  sequential: 'sequential',
} as const;

/**
 * Time→byte random-access index independent of container specifics.
 *
 * `seek` FLOOR-selects the last range whose start is at or before the target
 * (the `finite-vod.ts` floor semantics), returning `null` when no range
 * qualifies. `next` walks bounded lookahead,
 * and `first` is the earliest range (starting playable point).
 */
export interface RandomAccessIndex {
  readonly durationSeconds: null | number;
  readonly first: null | RangeRead;
  readonly granularity: IndexGranularity;
  /** Next lookahead range after `from` (bounded forward scheduling). */
  next(from: RangeRead): null | RangeRead;
  /** FLOOR-select the range containing `time` (must start at or before it). */
  seek(timeSeconds: number): null | RangeRead;
}

/**
 * A byte-exact, time-anchored range to read from the object.
 *
 * Reuses the existing `VodSegment` semantics (`finite-vod.ts`): ranges are
 * FLOOR-selected by start, zero-duration co-located audio tiles at an anchor
 * video RAP are tolerated, and only the terminal range may drive EOS.
 */
export interface RangeRead {
  readonly endSeconds: number;
  readonly length: number;
  readonly offset: number;
  /** Whether this range begins on a random-access point. */
  readonly rap: boolean;
  readonly startSeconds: number;
  /** Only the terminal range may trigger end-of-stream. */
  readonly terminal: boolean;
}

/** Metadata for one independently appendable media unit. */
export interface SegmentMeta {
  readonly endSeconds: number;
  /** Which producer made the bytes this metadata describes. */
  readonly producedBy: ProducerMode;
  /** Whether the media begins at a sync sample. */
  readonly rap: boolean;
  readonly startSeconds: number;
  /** Whether this is the terminal segment (only it may request EOS). */
  readonly terminal: boolean;
}

/** Whole-load capability summary; the domain model of what `SOURCE_OK` reports. */
export interface SourceCapabilities {
  readonly codecs: readonly CodecDescriptor[];
  readonly container: ContainerKind;
  readonly durationSeconds: null | number;
  readonly indexGranularity: IndexGranularity;
  /** Producer-owned, always codec-qualified MIME when set; `null` pre-MSE. */
  readonly mime: null | string;
  readonly playbackMode: PlaybackMode;
}

/**
 * Human/debug trace of a discovered track; intentionally carries no byte or
 * sample metadata.
 */
export interface TrackSummary {
  readonly codec: string;
  readonly kind: MediaKind;
}
