/**
 * TDD contract for `SidxIndex` — the sidx / `finite-vod.ts` implementation of
 * the generic `RandomAccessIndex` contract.
 *
 * `SidxIndex` wraps `parseFiniteVodIndex`/`segmentForTime` without changing
 * semantics: `seek` FLOOR-selects the last range whose start is at or before
 * the target (anneal/floor), byte offsets/lengths are the exact
 * top-level sidx ranges, `durationSeconds` comes from the init's mvhd,
 * zero-duration co-located audio tiles at a RAP anchor are tolerated, and only
 * the terminal range may drive EOS. Every parsed entry is a SAP/RAP, so every
 * range reports `rap: true`.
 */

import { describe, expect, it } from 'vitest';
import { SidxIndex } from '../container/index/sidx-index.ts';
import type { RangeRead } from '../media/types.ts';

function box(type: string, body: number[]): number[] {
  const size = body.length + 8;
  return [(size >>> 24) & 255, (size >>> 16) & 255, (size >>> 8) & 255, size & 255, ...type.split('').map((c) => c.charCodeAt(0)), ...body];
}

function expectSidx(head: Uint8Array): SidxIndex {
  const index = SidxIndex.parse(head);
  if (index === null) throw new Error('expected a parsed SidxIndex');
  return index;
}

/** ftyp+moov+sidx head for a 10s two-segment finite VOD object. */
function finiteVodHead(): Uint8Array {
  const mvhd = box('mvhd', [0, 0, 0, 0, ...u32(0), ...u32(0), ...u32(1000), ...u32(10_000)]);
  const moov = box('moov', mvhd);
  const ftyp = box('ftyp', [105, 115, 111, 109]);
  const sidx = box('sidx', [
    0, 0, 0, 0, ...u32(1), ...u32(1000), ...u32(0), ...u32(0),
    0, 0, 0, 2,
    ...u32(100), ...u32(5000), 0x80, 0, 0, 0,
    ...u32(120), ...u32(5000), 0x80, 0, 0, 0,
  ]);
  return new Uint8Array([...ftyp, ...moov, ...sidx, ...Array<number>(220).fill(0)]);
}

function u32(value: number): number[] {
  return [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
}

/**
 * Head with a zero-duration co-located audio tile at the 0s RAP anchor: the
 * video-anchored publisher emits a duration-0 entry followed by the video RAP
 * at the same instant. Parsing must succeed and the seek grid must stay exact
 * (a minimum-duration clamp would shift later RAPs forward cumulatively).
 */
function zeroDurationHead(): Uint8Array {
  const mvhd = box('mvhd', [0, 0, 0, 0, ...u32(0), ...u32(0), ...u32(1000), ...u32(10_000)]);
  const moov = box('moov', mvhd);
  const ftyp = box('ftyp', [105, 115, 111, 109]);
  const sidx = box('sidx', [
    0, 0, 0, 0, ...u32(1), ...u32(1000), ...u32(0), ...u32(0),
    0, 0, 0, 3,
    ...u32(100), ...u32(0), 0x80, 0, 0, 0, // audio tile at 0s, duration 0
    ...u32(120), ...u32(5000), 0x80, 0, 0, 0, // video RAP at 0s, 5s
    ...u32(140), ...u32(5000), 0x80, 0, 0, 0, // video RAP at 5s, 5s
  ]);
  return new Uint8Array([...ftyp, ...moov, ...sidx, ...Array<number>(300).fill(0)]);
}

describe('SidxIndex', () => {
  it('wraps a parsed top-level sidx as an exact-byte RandomAccessIndex', () => {
    const index = expectSidx(finiteVodHead());
    expect(index.granularity).toBe('exact-byte');
    expect(index.durationSeconds).toBe(10);
    expect(index.first).not.toBeNull();
  });

  it('preserves exact RAP-aligned byte offsets and lengths', () => {
    const index = expectSidx(finiteVodHead());
    expect(index.first).toEqual({
      endSeconds: 5,
      length: 100,
      offset: 104,
      rap: true,
      startSeconds: 0,
      terminal: false,
    });
    const second = index.next(index.first!);
    expect(second).toEqual({
      endSeconds: 10,
      length: 120,
      offset: 204,
      rap: true,
      startSeconds: 5,
      terminal: true,
    });
  });

  it('marks every range a RAP but only the terminal range as terminal', () => {
    const index = expectSidx(finiteVodHead());
    const first = index.first!;
    expect(first.rap).toBe(true);
    expect(first.terminal).toBe(false);
    const second = index.next(first)!;
    expect(second.rap).toBe(true);
    expect(second.terminal).toBe(true);
    expect(index.next(second)).toBeNull();
  });

  it('FLOOR-selects the range containing the seek time', () => {
    const index = expectSidx(finiteVodHead());
    expect(index.seek(0)?.offset).toBe(104);
    expect(index.seek(4.9)?.offset).toBe(104);
    expect(index.seek(5)?.offset).toBe(204);
    expect(index.seek(7.5)?.offset).toBe(204);
  });

  it('clamps a terminal seek to the final RAP and a negative seek to the first', () => {
    const index = expectSidx(finiteVodHead());
    expect(index.seek(999)?.offset).toBe(204);
    expect(index.seek(-1)?.offset).toBe(104);
  });

  it('floors across index drift so appends never begin ahead of the seek', () => {
    const index = SidxIndex.fromParsed({
      durationSeconds: 25,
      segments: [
        { durationSeconds: 5, endSeconds: 5, length: 100, offset: 0, startSeconds: 0, terminal: false },
        { durationSeconds: 5, endSeconds: 25, length: 120, offset: 100, startSeconds: 20, terminal: true },
      ],
    });
    expect(index.seek(10)?.offset).toBe(0);
    expect(index.seek(22)?.offset).toBe(100);
    expect(index.seek(999)?.offset).toBe(100);
    expect(index.seek(0)?.offset).toBe(0);
  });

  it('rejects non-finite times and empty indexes with null', () => {
    const index = expectSidx(finiteVodHead());
    expect(index.seek(Number.NaN)).toBeNull();
    expect(index.seek(Number.POSITIVE_INFINITY)).toBeNull();
    const empty = SidxIndex.fromParsed({ durationSeconds: null, segments: [] });
    expect(empty.first).toBeNull();
    expect(empty.durationSeconds).toBeNull();
    expect(empty.seek(0)).toBeNull();
    expect(empty.next({} as RangeRead)).toBeNull();
  });

  it('accepts zero-duration co-located tiles and keeps the RAP grid exact', () => {
    const index = expectSidx(zeroDurationHead());
    expect(index.durationSeconds).toBe(10);
    const first = index.first!;
    const second = index.next(first)!;
    const third = index.next(second)!;
    expect(first.startSeconds).toBe(0);
    expect(first.endSeconds).toBe(0); // zero-duration co-located tile
    expect(second.startSeconds).toBe(0); // co-located at the same instant as the tile
    expect(third.startSeconds).toBe(5);
    // A mid-clip seek floors to the RAP whose content covers the target.
    expect(index.seek(4.2)).toBe(second);
  });

  it('returns null from parse when the head holds no top-level sidx', () => {
    expect(SidxIndex.parse(new Uint8Array([0, 1, 2, 3]))).toBeNull();
    expect(SidxIndex.parse(new Uint8Array())).toBeNull();
  });

  it('walks forward lookahead ranges and rejects foreign ranges', () => {
    const index = expectSidx(finiteVodHead());
    const first = index.first!;
    const second = index.next(first)!;
    expect(index.next(second)).toBeNull();
    expect(index.next({ endSeconds: 5, length: 1, offset: 999, rap: true, startSeconds: 0, terminal: false })).toBeNull();
  });
});
