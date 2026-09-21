/**
 * Container-agnostic random-access index contracts.
 *
 * `RandomAccessIndex`, `RangeRead`, `MediaRange`, and `IndexGranularity` are
 * the shared domain vocabulary defined in `src/media/legacy-types.ts`; this module
 * re-exports them as the canonical import path for `container/*` index code
 * and adds the `IndexBuilder` registry seam plus the minimal `ContainerProfile`
 * it is keyed on. Index builders consume generic bytes through `ByteSource`
 * (see `src/transport/byte-source.ts`) and never the Sia SDK.
 */

import type {
  ContainerKind,
  IndexGranularity,
  MediaRange,
  ProducerMode,
  RandomAccessIndex,
  RangeRead,
} from '../../media/legacy-types.ts';
import type { ByteSource } from '../../transport/byte-source.ts';

export type { IndexGranularity, MediaRange, RandomAccessIndex, RangeRead };

/**
 * Container classification an index builder and the future load pipeline key
 * on. The classifier (`capabilities/container-classifier.ts`)
 * produces one of these from a `ContainerKind` verdict, and index builders
 * keep reading only `.container` so the existing sidx path is unchanged.
 */
export interface ContainerProfile {
  readonly container: ContainerKind;
  /** Ordered best-effort random-access index strategies (array order = preference). */
  readonly indexSources: readonly IndexSourceKind[];
  /** Whether this container appends as-is where its codecs are MSE-supported. */
  readonly mseAppendable: boolean;
  /** Which producer engine would handle this container; `reject` ⇒ fail up front. */
  readonly producerFamily: ProducerFamily;
  /** Playback mode the container-level route implies; never `sequential` (that is a per-source fallback decision). */
  readonly producerMode: ProducerMode;
}

/**
 * One strategy in the ordered index-builder registry. Builders answer
 * `supports(profile)` and are tried in registration order at the composition
 * root; the first that returns a non-null index wins.
 */
export interface IndexBuilder {
  build(source: ByteSource, profile: ContainerProfile): Promise<null | RandomAccessIndex>;
  supports(profile: ContainerProfile): boolean;
}

/**
 * Ordered best-effort index strategies a container can feed, in preference
 * order. `none` is never listed: a container without any
 * usable index source simply has an empty `indexSources`.
 */
export const indexSourceKind = {
  cues: 'cues',
  'moof-walk': 'moof-walk',
  packet: 'packet',
  sidx: 'sidx',
  stbl: 'stbl',
  'ts-rap': 'ts-rap',
} as const;

export type IndexSourceKind = (typeof indexSourceKind)[keyof typeof indexSourceKind];

/**
 * The container-level producer family. This names *which* producer would make
 * MSE-appendable bytes for the container — it does not construct one. `reject`
 * marks containers that must fail up front with a container-specific
 * unsupported reason rather than attempting a producer.
 */
export const producerFamily = {
  'mkv-to-webm': 'mkv-to-webm',
  passthrough: 'passthrough',
  'progressive-mp4': 'progressive-mp4',
  reject: 'reject',
  'ts-to-fmp4': 'ts-to-fmp4',
  'webm-native': 'webm-native',
} as const;

export type ProducerFamily = (typeof producerFamily)[keyof typeof producerFamily];
