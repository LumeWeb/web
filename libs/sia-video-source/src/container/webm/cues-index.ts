/**
 * `CuesIndex` — the `cues` implementation of the generic `RandomAccessIndex`
 * contract for native-WebM MSE.
 *
 * A WebM object's random-access grid lives in two places: the `Cues` element
 * (CuePoint → CueClusterPosition, relative to the Segment body start, naming
 * every cluster the muxer considered seekable) and the Clusters themselves
 * (each with a `Timecode` in TimecodeScale ticks and keyframe-evidence in its
 * first SimpleBlock). This index walks both through the dependency-neutral
 * `probeWebm` reader and exposes the exact-byte contract:
 *
 *   - `seek` FLOOR-selects the last cluster whose start is at or before the
 *     target (the same anneal/floor semantics as `SidxIndex`),
 *     and clamps a terminal seek to the final cluster / a negative seek to
 *     the first;
 *   - the FIRST range begins at byte 0 so an append always delivers the WebM
 *     init (EBML header + Segment + Info + Tracks) with the first Cluster;
 *     every later range spans exactly one Cluster, so seeks read bounded
 *     Cluster windows instead of re-fetching the whole object;
 *   - granularity is `exact-byte` once the walk completes;
 *   - `rap` reports keyframe evidence: a parsed first-video-SimpleBlock flag
 *     wins, Cues membership backs a cluster with no block evidence, and only
 *     the terminal range may drive EOS.
 *
 * Probed facts come from `probeWebm` in `strict` mode: the whole object is in
 * hand, so the walk always sees every Cluster (Cues membership only upgrades
 * `rap` evidence; it is not required).
 */
import { indexGranularity } from '../../media/legacy-types.ts';
import type { IndexGranularity, RandomAccessIndex, RangeRead } from '../index/random-access-index.ts';
import { ebmlWalkMode } from './ebml-reader.ts';
import { probeWebm } from './webm-probe.ts';
import type { WebmProbeResult } from './webm-probe.ts';

/** One range: an exact, time-anchored, RAP-aware Cluster window. */
interface CuesRange {
  readonly endSeconds: number;
  readonly length: number;
  readonly offset: number;
  readonly rap: boolean;
  readonly startSeconds: number;
  readonly terminal: boolean;
}

export class CuesIndex implements RandomAccessIndex {
  readonly durationSeconds: null | number;
  readonly first: null | RangeRead;
  readonly granularity: IndexGranularity = indexGranularity['exact-byte'];

  readonly #ranges: readonly CuesRange[];

  constructor(ranges: readonly CuesRange[], durationSeconds: null | number) {
    this.#ranges = ranges;
    this.durationSeconds = durationSeconds;
    this.first = this.#ranges[0] ?? null;
  }

  /**
   * Walks `bytes` (one whole WebM object) into a `CuesIndex`. Returns null
   * when the object is not a parseable WebM (wrong/absent DocType — MKV is
   * deferred) or when it carries no Cluster to anchor the index.
   */
  static build(bytes: Uint8Array): CuesIndex | null {
    const probe = probeWebm(bytes, ebmlWalkMode.strict);
    return probe === null ? null : CuesIndex.fromProbe(probe);
  }

  /**
   * Turns probed facts (full-buffer or windowed-streamed) into a `CuesIndex`.
   * Returns null when the object carried no Cluster to anchor the index.
   */
  static fromProbe(probe: WebmProbeResult): CuesIndex | null {
    if (probe.clusters.length === 0) return null;

    const ranges: CuesRange[] = [];
    for (let index = 0; index < probe.clusters.length; index += 1) {
      const cluster = probe.clusters[index];
      const next = probe.clusters[index + 1] ?? null;
      const last = next === null;
      // Keyframe evidence beats Cues membership: a SimpleBlock that says the
      // cluster does NOT start on a keyframe (non-sync) must win even when the
      // muxer still wrote a CuePoint for it. Absent block evidence, a cued
      // cluster is assumed RAP; an uncued, block-less cluster falls back to
      // optimistic-true so a floor-seek still has somewhere to land.
      const rap = cluster.keyframe ?? probe.cuedClusterOffsets.has(cluster.offset);
      // First range carries the init (byte 0 → first cluster end); later
      // ranges start at the Cluster id so a bounded read spans exactly that
      // cluster (its Timecode + SimpleBlocks, self-contained per WebM).
      const offset = index === 0 ? 0 : cluster.offset;
      // Non-terminal ranges end at the next cluster's start (the plan's
      // exact-after-index grid); the terminal range's end is Info's floating
      // Duration when it vouches for one, else the cluster's own timecode.
      const endSeconds = last ? (probe.durationSeconds ?? cluster.timecodeSeconds) : next.timecodeSeconds;
      ranges.push({
        endSeconds,
        length: cluster.end - offset,
        offset,
        rap,
        startSeconds: cluster.timecodeSeconds,
        terminal: last,
      });
    }
    const overall = probe.durationSeconds ?? (ranges.length > 0 ? ranges[ranges.length - 1].endSeconds : null);
    return ranges.length > 0 ? new CuesIndex(ranges, overall) : null;
  }

  next(from: RangeRead): null | RangeRead {
    const position = this.#ranges.indexOf(from);
    if (position < 0 || position + 1 >= this.#ranges.length) return null;
    return this.#ranges[position + 1];
  }

  seek(timeSeconds: number): null | RangeRead {
    if (this.#ranges.length === 0 || !Number.isFinite(timeSeconds)) return null;
    const target = Math.max(0, timeSeconds);
    let selected: CuesRange | null = null;
    for (const range of this.#ranges) {
      if (range.startSeconds > target) break;
      selected = range;
    }
    return selected ?? this.#ranges[0];
  }
}
