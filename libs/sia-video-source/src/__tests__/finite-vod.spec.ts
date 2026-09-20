import { describe, expect, it } from 'vitest';
import { parseFiniteVodIndex, segmentForTime } from '../finite-vod.ts';

function box(type: string, body: number[]): number[] {
  const size = body.length + 8;
  return [(size >>> 24) & 255, (size >>> 16) & 255, (size >>> 8) & 255, size & 255, ...type.split('').map((c) => c.charCodeAt(0)), ...body];
}

function fixture(): Uint8Array {
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

describe('finite VOD sidx', () => {
  it('maps presentation times to exact RAP-aligned object ranges', () => {
    const bytes = fixture();
    const index = parseFiniteVodIndex(bytes);
    expect(index?.durationSeconds).toBe(10);
    expect(index?.segments).toEqual([
      { durationSeconds: 5, endSeconds: 5, length: 100, offset: 104, startSeconds: 0, terminal: false },
      { durationSeconds: 5, endSeconds: 10, length: 120, offset: 204, startSeconds: 5, terminal: true },
    ]);
    expect(segmentForTime(index?.segments ?? [], 7.5)).toMatchObject({ length: 120, offset: 204, terminal: true });
  });

  it('rejects non-RAP or hierarchical index entries rather than guessing a seek offset', () => {
    const bytes = fixture();
    bytes[48 + 40] = 0;
    expect(parseFiniteVodIndex(bytes)).toBeNull();
  });

  it('accepts zero-duration entries: co-located tiles at a RAP anchor keep the grid exact', () => {
    // The publisher's video-anchored sidx emits audio tiles co-located at their
    // anchor video's exact frame with duration 0. A zero LENGTH is still a hard
    // reject (it would break byte-range reads), but a zero DURATION is a
    // legitimate co-located tile: the seek grid floors by start, so parsing must
    // succeed and the following RAP must keep its exact start (a minimum 1ms
    // clamp would shift later RAPs forward cumulatively and reopen the far-seek
    // gap that the video-anchored merge closes).
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
    const bytes = new Uint8Array([...ftyp, ...moov, ...sidx, ...Array<number>(300).fill(0)]);
    const index = parseFiniteVodIndex(bytes);
    expect(index).not.toBeNull();
    expect(index?.segments).toHaveLength(3);
    expect(index?.segments[0]?.startSeconds).toBe(0);
    expect(index?.segments[0]?.durationSeconds).toBe(0);
    expect(index?.segments[1]?.startSeconds).toBe(0); // co-located at the same instant
    expect(index?.segments[2]?.startSeconds).toBe(5);
    // A mid-clip seek floors to the RAP whose content covers the target.
    expect(segmentForTime(index?.segments ?? [], 4.2)).toBe(index?.segments[1]);
  });

  it('floors the selected segment to start at or before the seek target across index drift', () => {
    // A published index whose per-segment durations fall short of the real
    // media timeline leaves a gap: segment[0] covers [0,5) and segment[1]
    // starts at 20s. "First end > target" (the old selection) returns the
    // segment STARTING AFTER the target (20s) for a 10s seek, so the appended
    // fragment begins past the playhead and the target never buffers (stall).
    // The seek must floor into the index instead: the last segment whose start
    // is at or before the target, so appends never begin ahead of the seek.
    const segments = [
      { durationSeconds: 5, endSeconds: 5, length: 100, offset: 0, startSeconds: 0, terminal: false },
      { durationSeconds: 5, endSeconds: 25, length: 120, offset: 100, startSeconds: 20, terminal: true },
    ] as const;
    expect(segmentForTime(segments, 10)).toBe(segments[0]);
    // On a contiguous index the floor selection is identical to the containing
    // segment for an in-range target…
    expect(segmentForTime(segments, 22)).toBe(segments[1]);
    // …and terminal seeks still clamp to the final RAP.
    expect(segmentForTime(segments, 999)).toBe(segments[1]);
    // A seek before the first segment start falls back to the first RAP.
    expect(segmentForTime(segments, 0)).toBe(segments[0]);
  });
});
