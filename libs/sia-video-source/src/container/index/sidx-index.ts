/**
 * `SidxIndex` — the sidx / `finite-vod.ts` implementation of the generic
 * `RandomAccessIndex` contract.
 *
 * It wraps `parseFiniteVodIndex`/`segmentForTime` without changing their
 * semantics:
 *
 * - `seek` FLOOR-selects the last range whose start is at or before the target
 *   (anneal/floor), and clamps a terminal seek to the final RAP;
 * - byte offsets/lengths are the exact top-level `sidx` ranges;
 * - `durationSeconds` comes from the init's mvhd when present, else `null`;
 * - zero-duration co-located audio tiles at a RAP anchor are tolerated;
 * - every parsed entry is a SAP/RAP, so every range reports `rap: true`, and
 *   only the terminal range may drive EOS.
 *
 * `finite-vod.ts` keeps its exports as compatibility wrappers; the worker can
 * migrate to `RandomAccessIndex` behind this type without touching parse
 * behavior.
 */

import { type FiniteVodIndex, parseFiniteVodIndex, segmentForTime, type VodSegment } from '../../finite-vod.ts';
import { indexGranularity } from '../../media/legacy-types.ts';
import type { IndexGranularity, RandomAccessIndex, RangeRead } from './random-access-index.ts';

export class SidxIndex implements RandomAccessIndex {
  readonly durationSeconds: null | number;
  readonly first: null | RangeRead;
  readonly granularity: IndexGranularity = indexGranularity['exact-byte'];

  readonly #ranges: readonly RangeRead[];
  readonly #segments: readonly VodSegment[];

  constructor(segments: readonly VodSegment[], durationSeconds: null | number) {
    this.#segments = segments;
    this.#ranges = segments.map(toRange);
    this.durationSeconds = durationSeconds;
    this.first = this.#ranges[0] ?? null;
  }

  static fromParsed(parsed: FiniteVodIndex): SidxIndex {
    return new SidxIndex(parsed.segments, parsed.durationSeconds);
  }

  static parse(head: Uint8Array): null | SidxIndex {
    const parsed = parseFiniteVodIndex(head);
    return parsed ? new SidxIndex(parsed.segments, parsed.durationSeconds) : null;
  }

  next(from: RangeRead): null | RangeRead {
    const position = this.#ranges.indexOf(from);
    if (position < 0 || position + 1 >= this.#ranges.length) return null;
    return this.#ranges[position + 1];
  }

  seek(timeSeconds: number): null | RangeRead {
    const selected = segmentForTime(this.#segments, timeSeconds);
    if (!selected) return null;
    return this.#ranges[this.#segments.indexOf(selected)] ?? null;
  }
}

/** Maps a `VodSegment` to the contract `RangeRead`, marking it SAP/RAP. */
function toRange(segment: VodSegment): RangeRead {
  return {
    endSeconds: segment.endSeconds,
    length: segment.length,
    offset: segment.offset,
    rap: true,
    startSeconds: segment.startSeconds,
    terminal: segment.terminal,
  };
}
