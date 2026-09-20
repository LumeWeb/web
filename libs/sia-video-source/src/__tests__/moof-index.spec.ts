/**
 * TDD contract for `MoofWalkIndex` (`src/container/index/moof-index.ts`) — the
 * `moof-walk` implementation of the generic `RandomAccessIndex` contract for
 * fMP4 WITHOUT a top-level `sidx`. `SidxIndex` already covers manifested fMP4;
 * foreign fragmented MP4 (no sidx) previously had NO index, so the stream
 * controller restarted from byte zero / re-read the whole object on every
 * seek.
 *
 * `MoofWalkIndex` walks the top-level `moof`/`mdat` pairs, parses each
 * fragment's `tfdt` (presentation start), its sync evidence (`trun`
 * first-sample-flags / per-sample flags, or `tfhd` default-sample-flags), and
 * the init's mvhd duration, and exposes the exact-byte contract:
 *
 *   - `seek` FLOOR-selects the last fragment whose start is at or before the
 *     target (the ADR 0008 anneal/floor semantics), clamping terminal/negative
 *     seeks to the final/first fragment;
 *   - the FIRST range starts at byte 0 (it carries the init segment plus the
 *     first moof+mdat), so a passthrough append always delivers init before
 *     media; every later range spans exactly one `moof`+`mdat` pair — bounded
 *     reads instead of whole-object re-fetches;
 *   - granularity is `exact-byte` once the walk completes;
 *   - `rap` reports parsed sync evidence; `terminal` only on the last range.
 */
import { describe, expect, it } from 'vitest';
import { MoofWalkIndex } from '../container/index/moof-index.ts';
import { indexGranularity, type RangeRead } from '../media/types.ts';
import { MemoryByteSource } from '../transport/memory-byte-source.ts';
import type { ByteRange, ByteSource, ReadOptions } from '../transport/byte-source.ts';
import { buildSidxFmp4, buildSidxLessFmp4, scanTopLevel } from './fixtures/moof-fmp4-fixture.ts';

/** ByteSource wrapper that records every ranged read (offset/length). */
class RecordingByteSource implements ByteSource {
  readonly reads: { length: number; offset: number }[] = [];
  readonly size: number;
  readonly #inner: MemoryByteSource;

  constructor(bytes: Uint8Array) {
    this.#inner = new MemoryByteSource(bytes);
    this.size = bytes.byteLength;
  }

  cancel(reason?: unknown): void {
    this.#inner.cancel(reason);
  }

  read(range: ByteRange, options: ReadOptions): ReadableStream<Uint8Array> {
    this.reads.push({ length: range.length, offset: range.offset });
    return this.#inner.read(range, options);
  }
}

/** Drains one read stream and concatenates its bytes. */
async function drain(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }
  const out = new Uint8Array(chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0));
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

/** Parses the fixture and throws when the index builder refused it. */
function expectIndex(bytes: Uint8Array): MoofWalkIndex {
  const index = MoofWalkIndex.parse(bytes);
  if (index === null) throw new Error('expected a parsed MoofWalkIndex');
  return index;
}

/** Top-level layout of the 3-fragment fixture (ftyp, moov, moof, mdat ×3). */
function threeFragmentLayout(bytes: Uint8Array): { mdatEnds: number[]; moofStarts: number[] } {
  const boxes = scanTopLevel(bytes);
  const moofStarts = boxes.filter((b) => b.type === 'moof').map((b) => b.start);
  const mdatEnds = boxes.filter((b) => b.type === 'mdat').map((b) => b.end);
  return { mdatEnds, moofStarts };
}

const THREE_FRAGMENTS = buildSidxLessFmp4(3);

describe('MoofWalkIndex', () => {
  it('walks sidx-less fMP4 into an exact-byte RandomAccessIndex with init-first ranges', () => {
    const index = expectIndex(THREE_FRAGMENTS);
    expect(index.granularity).toBe(indexGranularity['exact-byte']);
    expect(index.durationSeconds).toBe(10);

    const { mdatEnds, moofStarts } = threeFragmentLayout(THREE_FRAGMENTS);
    // First range starts at byte 0 (init + first moof/mdat); later ranges are
    // exactly one moof→mdat pair each (bounded reads).
    expect(index.first).toEqual({
      endSeconds: 1,
      length: mdatEnds[0],
      offset: 0,
      rap: true,
      startSeconds: 0,
      terminal: false,
    });
    const second = index.next(index.first!);
    expect(second).toEqual({
      endSeconds: 2,
      length: mdatEnds[1] - moofStarts[1],
      offset: moofStarts[1],
      rap: true,
      startSeconds: 1,
      terminal: false,
    });
    const third = index.next(second!);
    expect(third).toEqual({
      endSeconds: 10,
      length: mdatEnds[2] - moofStarts[2],
      offset: moofStarts[2],
      rap: true,
      startSeconds: 2,
      terminal: true,
    });
    expect(index.next(third!)).toBeNull();
  });

  it('FLOOR-selects the fragment containing the seek time and clamps edges', () => {
    const index = expectIndex(THREE_FRAGMENTS);
    const { moofStarts } = threeFragmentLayout(THREE_FRAGMENTS);
    expect(index.seek(0)?.offset).toBe(0);
    expect(index.seek(0.99)?.offset).toBe(0);
    expect(index.seek(1)?.offset).toBe(moofStarts[1]);
    expect(index.seek(1.5)?.offset).toBe(moofStarts[1]);
    expect(index.seek(2)?.offset).toBe(moofStarts[2]);
    expect(index.seek(99)?.offset).toBe(moofStarts[2]); // terminal clamp
    expect(index.seek(-1)?.offset).toBe(0); // negative clamp
    expect(index.seek(Number.NaN)).toBeNull();
    expect(index.seek(Number.POSITIVE_INFINITY)).toBeNull();
  });

  it('walks forward lookahead and rejects foreign ranges', () => {
    const index = expectIndex(THREE_FRAGMENTS);
    const { moofStarts } = threeFragmentLayout(THREE_FRAGMENTS);
    const second = index.next(index.first!);
    expect(second?.offset).toBe(moofStarts[1]);
    const third = index.next(second!);
    expect(third?.terminal).toBe(true);
    expect(index.next(third!)).toBeNull();
    expect(index.next({ endSeconds: 5, length: 1, offset: 999, rap: true, startSeconds: 0, terminal: false })).toBeNull();
  });

  it('marks a fragment whose first sample is not sync as rap:false (detects non-RAP-leading fragments)', () => {
    const bytes = buildSidxLessFmp4(2, { firstSampleNonSync: true });
    const index = expectIndex(bytes);
    expect(index.first?.rap).toBe(false);
    expect(index.next(index.first!)?.rap).toBe(false);
    // A fully-sync fixture reports rap:true from the same evidence path.
    const sync = expectIndex(buildSidxLessFmp4(2));
    expect(sync.first?.rap).toBe(true);
    expect(index.granularity).toBe(indexGranularity['exact-byte']);
  });

  it('reads sync evidence from tfhd default-sample-flags when trun omits it', () => {
    const nonSyncViaDefaults = expectIndex(buildSidxLessFmp4(2, { firstSampleNonSync: true, viaTfhdDefault: true }));
    expect(nonSyncViaDefaults.first?.rap).toBe(false);
    const syncViaDefaults = expectIndex(buildSidxLessFmp4(2, { viaTfhdDefault: true }));
    expect(syncViaDefaults.first?.rap).toBe(true);
  });

  it('returns null for garbage, empty, sidx-present, or moof-less inputs', () => {
    expect(MoofWalkIndex.parse(new Uint8Array([0, 1, 2, 3]))).toBeNull();
    expect(MoofWalkIndex.parse(new Uint8Array())).toBeNull();
    // A manifested fMP4 (top-level sidx + moofs) is SidxIndex's job.
    expect(MoofWalkIndex.parse(buildSidxFmp4())).toBeNull();
    // ftyp + moov only (progressive shell): no moof fragments to walk.
    expect(MoofWalkIndex.parse(buildSidxLessFmp4(0))).toBeNull();
  });

  it('keeps time exact when the video timescale differs from the mvhd timescale', () => {
    // Fixture: mvhd @1000 (10 s), video mdhd @30000; tfdt 30000 ⇒ 1 s. The
    // walk must use the TRACK timescale, not the mvhd one.
    const index = expectIndex(buildSidxLessFmp4(4));
    let range: null | RangeRead = index.first;
    const starts: number[] = [];
    while (range) {
      starts.push(range.startSeconds);
      range = index.next(range);
    }
    expect(starts).toEqual([0, 1, 2, 3]);
    expect(index.seek(3.4)?.startSeconds).toBe(3);
  });

  it('drives bounded reads: a mid-stream seek fetches only the selected moof→mdat window', async () => {
    const bytes = buildSidxLessFmp4(3);
    const { mdatEnds, moofStarts } = threeFragmentLayout(bytes);
    const source = new RecordingByteSource(bytes);
    const index = expectIndex(bytes);

    // Seam-consumer behaviour: read the range the index returns, byte-exact.
    const selected = index.seek(1.5)!;
    expect(selected.offset).toBe(moofStarts[1]);
    const fetched = await drain(source.read({ length: selected.length, offset: selected.offset }, { epoch: 0 }));
    expect(fetched.byteLength).toBe(mdatEnds[1] - moofStarts[1]);
    // The fetched window starts at the second moof, not at byte 0.
    expect(fetched[0]).toBe((selected.length >>> 24) & 255);

    // The full walk still exposes the init-carrying first range for a fresh play.
    expect(index.first!.offset).toBe(0);
    expect(index.first!.length).toBe(mdatEnds[0]);

    // Only the window we asked for was read — no latent whole-object read.
    expect(source.reads).toEqual([{ length: selected.length, offset: moofStarts[1] }]);
  });
});
