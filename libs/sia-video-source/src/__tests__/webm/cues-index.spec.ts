/**
 * TDD contract for the WebM Cues/Cluster random-access index (native WebM
 * MSE): `CuesIndex` parses a WebM Segment's Info (TimecodeScale,
 * Duration), Tracks, Clusters, and Cues through a dependency-neutral EBML
 * reader, then exposes the exact-byte `RandomAccessIndex` contract:
 *
 *   - the FIRST range starts at byte 0 (EBML header + Segment + Info + Tracks
 *     + first Cluster), so a passthrough append always delivers the WebM init
 *     segment before any Cluster;
 *   - every later range spans exactly one Cluster — bounded reads instead of
 *     whole-object re-fetches on seek;
 *   - `seek` FLOOR-selects the last cluster whose start is at or before the
 *     target (the anneal/floor semantics), clamping terminal/negative
 *     seeks to the final/first range;
 *   - granularity is `exact-byte` once the walk completes;
 *   - `rap` reports Cues/SimpleBlock keyframe evidence; `terminal` only on the
 *     last range.
 */
import { describe, expect, it } from 'vitest';
import { CuesIndex } from '../../container/webm/cues-index.ts';

/**
 * Node-only guard for the fixture tests below. Browser-proof: `document` is
 * always defined in the browser MSE runs and never defined in the node unit
 * environment, and this avoids referencing `process` at import time (which a
 * browser bundle would not have). The fixture tests read committed binaries
 * with `node:fs`, which node-only dynamic imports resolve lazily.
 */
const IN_NODE = typeof document === 'undefined';
import type { RangeRead } from '../../media/types.ts';
import { buildWebm, scanEbmlTop } from '../fixtures/webm-fixture.ts';

/** Absolute starts of the `count` top-level Cluster elements (test-side scan). */
function clusterStarts(bytes: Uint8Array): number[] {
  const top = scanEbmlTop(bytes);
  const segment = top.find((box) => box.id === 0x18538067);
  if (!segment) return [];
  const out: number[] = [];
  // Skip the Segment's own id+size header so the walk lands on its children.
  let offset = segment.start + vintLengthAt(bytes, segment.start) + vintLengthAt(bytes, segment.start + vintLengthAt(bytes, segment.start));
  const segEnd = segment.end;
  while (offset < segEnd && offset + 1 < bytes.byteLength) {
    // Walk the Segment's children by element extent; record every Cluster id.
    const id = readIdAt(bytes, offset);
    if (id === 0x1f43b675) out.push(offset);
    const size = readSizeAt(bytes, offset);
    if (size === null) break;
    offset += size.elementLength;
  }
  return out;
}

/** Parses the fixture, throwing when the index builder refused it. */
function expectIndex(bytes: Uint8Array): CuesIndex {
  const index = CuesIndex.build(bytes);
  if (index === null) throw new Error('expected a parsed CuesIndex');
  return index;
}

/** Reads the raw (marker-included) id vint value at `offset`. */
function readIdAt(bytes: Uint8Array, offset: number): number {
  const length = vintLengthAt(bytes, offset);
  if (length === 0) return 0;
  let value = 0;
  for (let i = 0; i < length; i += 1) value = (value << 8) | (bytes[offset + i] ?? 0);
  return value;
}

/**
 * Total element extent (id + size header + data) for the element at `offset`,
 * or null when the size vint is missing/unknown-size. The size vint starts
 * AFTER the id vint and carries its own marker-derived length.
 */
function readSizeAt(bytes: Uint8Array, offset: number): null | { elementLength: number; } {
  const idLength = vintLengthAt(bytes, offset);
  if (idLength === 0) return null;
  const sizeOffset = offset + idLength;
  const sizeLength = vintLengthAt(bytes, sizeOffset);
  if (sizeLength === 0) return null;
  let raw = 0;
  for (let i = 0; i < sizeLength; i += 1) raw = (raw << 8) | (bytes[sizeOffset + i] ?? 0);
  raw &= (1 << (8 * sizeLength - sizeLength)) - 1;
  if (raw === (1 << (8 * sizeLength - sizeLength)) - 1) return null; // unknown size
  return { elementLength: idLength + sizeLength + raw };
}

/** The vint byte length at `offset` (0 for a byte with no marker bit). */
function vintLengthAt(bytes: Uint8Array, offset: number): number {
  const first = bytes[offset] ?? 0;
  for (let i = 0; i < 8; i += 1) {
    if (first & (0x80 >> i)) return i + 1;
  }
  return 0;
}

function walkRanges(index: CuesIndex): RangeRead[] {
  const seen: RangeRead[] = [];
  let range: null | RangeRead = index.first;
  while (range) {
    seen.push(range);
    range = index.next(range);
  }
  return seen;
}

const THREE = buildWebm(3);

describe('CuesIndex (crafted deterministic WebM)', () => {
  it('walks the Segment into an exact-byte RandomAccessIndex with init-first ranges', () => {
    const index = expectIndex(THREE);
    expect(index.granularity).toBe('exact-byte');
    expect(index.durationSeconds).toBe(3);

    const starts = clusterStarts(THREE);
    expect(starts).toHaveLength(3);
    const ranges = walkRanges(index);
    expect(ranges).toHaveLength(3);
    // First range carries the init (byte 0 → first cluster end); later ranges
    // are exactly one Cluster each (bounded reads).
    expect(ranges[0].offset).toBe(0);
    expect(ranges[1].offset).toBe(starts[1]);
    expect(ranges[2].offset).toBe(starts[2]);
    // Cluster i starts at i s (TimecodeScale 1e6, Timecode i*1e6).
    expect(ranges.map((range) => range.startSeconds)).toEqual([0, 1, 2]);
    expect(ranges[0].endSeconds).toBe(1);
    expect(ranges[1].endSeconds).toBe(2);
    expect(ranges[2].endSeconds).toBe(3);
    expect(ranges.map((range) => range.rap)).toEqual([true, true, true]);
    expect(ranges.map((range) => range.terminal)).toEqual([false, false, true]);
    expect(index.next(ranges[2])).toBeNull();
  });

  it('FLOOR-selects the cluster containing the seek time and clamps edges', () => {
    const index = expectIndex(THREE);
    const starts = clusterStarts(THREE);
    expect(index.seek(0)?.offset).toBe(0);
    expect(index.seek(0.99)?.offset).toBe(0);
    expect(index.seek(1)?.offset).toBe(starts[1]);
    expect(index.seek(1.5)?.offset).toBe(starts[1]);
    expect(index.seek(2)?.offset).toBe(starts[2]);
    expect(index.seek(99)?.offset).toBe(starts[2]); // terminal clamp
    expect(index.seek(-1)?.offset).toBe(0); // negative clamp
    expect(index.seek(Number.NaN)).toBeNull();
    expect(index.seek(Number.POSITIVE_INFINITY)).toBeNull();
  });

  it('walks forward lookahead and rejects foreign ranges', () => {
    const index = expectIndex(THREE);
    const second = index.next(index.first!);
    expect(second?.startSeconds).toBe(1);
    expect(index.next(second!)?.terminal).toBe(true);
    expect(
      index.next({ endSeconds: 5, length: 1, offset: 999, rap: true, startSeconds: 0, terminal: false }),
    ).toBeNull();
  });

  it('reports rap:false when a cluster does not start with a keyframe SimpleBlock', () => {
    const bytes = buildWebm(2, { nonSyncLast: true });
    const index = expectIndex(bytes);
    const ranges = walkRanges(index);
    expect(ranges[0].rap).toBe(true);
    expect(ranges[1].rap).toBe(false);
  });

  it('handles an unknown-size Segment element (live-stream convention)', () => {
    const bytes = buildWebm(2, { unknownSegmentSize: true });
    const index = expectIndex(bytes);
    const ranges = walkRanges(index);
    expect(ranges).toHaveLength(2);
    expect(ranges[1].terminal).toBe(true);
    expect(ranges[1].endSeconds).toBe(2);
  });

  it('returns null for garbage, empty, non-webm, or cluster-less inputs', () => {
    expect(CuesIndex.build(new Uint8Array([0, 1, 2, 3]))).toBeNull();
    expect(CuesIndex.build(new Uint8Array())).toBeNull();
  });
});

describe.runIf(IN_NODE)('CuesIndex against the committed webm-cues.bin fixture', () => {
  it('walks the two real clusters into bounded init-first ranges', async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const bytes = new Uint8Array(
      readFileSync(join(process.cwd(), 'src', '__fixtures__', 'media', 'webm-cues.bin')),
    );
    const index = CuesIndex.build(bytes);
    expect(index).not.toBeNull();
    expect(index!.granularity).toBe('exact-byte');
    const ranges = walkRanges(index!);
    expect(ranges).toHaveLength(2);
    expect(ranges[0].offset).toBe(0);
    expect(ranges[0].terminal).toBe(false);
    expect(ranges[0].startSeconds).toBe(0);
    expect(ranges[0].rap).toBe(true);
    expect(ranges[1].terminal).toBe(true);
    expect(ranges[1].offset).toBeGreaterThan(0);
  });
});

describe.runIf(IN_NODE)('CuesIndex against the real ffmpeg browser fixture (8-byte Segment size)', () => {
  it('parses the 111772-byte WebM into an exact-byte cued index', async () => {
    // The browser MSE suite resolves the same bytes browser-safe (base64) from
    // the sibling webm-browser-fixture module; this node section reads the
    // committed .webm from disk (node:fs) so the index is built against the
    // exact bytes the generator reproduced and verified.
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const bytes = new Uint8Array(
      readFileSync(join(process.cwd(), 'src', '__fixtures__', 'media', 'browser-decodable-webm-vp8-vorbis.webm')),
    );
    const index = CuesIndex.build(bytes);
    expect(index).not.toBeNull();
    expect(index!.granularity).toBe('exact-byte');
    const ranges = walkRanges(index!);
    expect(ranges.length).toBeGreaterThanOrEqual(2);
    expect(ranges[0].offset).toBe(0);
    expect(ranges[0].terminal).toBe(false);
    expect(ranges[0].startSeconds).toBe(0);
    // First range carries the init up to the first cluster's end; the next
    // range starts exactly there (bounded Cluster windows, not whole-object).
    expect(ranges[1].offset).toBe(ranges[0].length);
    expect(ranges[1].offset).toBeGreaterThan(0);
    // The two real video-keyframe clusters are honest RAPs.
    expect(ranges[0].rap).toBe(true);
    expect(ranges[1].rap).toBe(true);
    // ffmpeg's final cluster is an audio-only tail (two Vorbis SimpleBlocks,
    // no video keyframe, not referenced by Cues) -> the index must report
    // rap:false ("bad news wins") while still terminating the load.
    expect(ranges[ranges.length - 1].terminal).toBe(true);
    expect(ranges[ranges.length - 1].rap).toBe(false);
    // Info/Duration is in Segment Ticks (2003 @ 1e6 ns/tick): the reader must
    // scale it, not report bare 2003 s.
    expect(index!.durationSeconds).not.toBeNull();
    expect(index!.durationSeconds!).toBeGreaterThan(1.9);
    expect(index!.durationSeconds!).toBeLessThan(2.2);
    expect(ranges[ranges.length - 1].endSeconds).toBeCloseTo(2.003, 1);
  });
});
