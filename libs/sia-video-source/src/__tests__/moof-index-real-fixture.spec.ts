/**
 * Node contract for `MoofWalkIndex` against a REAL ffmpeg-generated sidx-less
 * fragmented fMP4 (the committed `browser-decodable-frag-avc-aac.mp4`): the
 * same browser-decodable AVC/AAC recipe as the progressive fixture, but
 * fragmented with `-movflags frag_keyframe+empty_moov+default_base_moof` and
 * a 500 ms fragment duration, `-bf 0`, `-g 15 -keyint_min 15` so EVERY video
 * fragment begins with an IDR (all-RAP-aligned), and NO top-level `sidx`.
 *
 * ffmpeg's `empty_moov` writes mvhd duration 0 (the real length lives in the
 * fragments), so this file also exercises the walker's terminal-duration
 * fallback (last fragment start + its media span in track timescale).
 *
 * The browser MSE seek/EOS suite consumes the same bytes via the base64-
 * embedded `moof-fixture-bytes.ts` module.
 *
 * Node-only; it reads the committed file directly from `src/__fixtures__/media/`
 * (browser tests cannot fs-read, which is why the embedded-bytes module
 * exists). `node:*` builtins are loaded lazily from node-scoped test bodies so
 * the module itself still loads in the browser client (where `node:fs` is
 * externalized).
 */
import { describe, expect, it } from 'vitest';
import { MoofWalkIndex } from '../container/index/moof-index.ts';
import type { RangeRead } from '../media/types.ts';

const IN_NODE = typeof document === 'undefined';

interface NodeApi { fs: typeof import('node:fs'); path: typeof import('node:path') }
let nodeApi: NodeApi | undefined;

async function fixtureBytes(): Promise<Uint8Array> {
  const { fs, path } = await loadNodeApi();
  return new Uint8Array(
    fs.readFileSync(path.join(process.cwd(), 'src', '__fixtures__', 'media', 'browser-decodable-frag-avc-aac.mp4')),
  );
}

/** Lazy node builtins: only resolved from node-scoped test bodies. */
async function loadNodeApi(): Promise<NodeApi> {
  nodeApi ??= await Promise.all([import('node:fs'), import('node:path')]).then(([fs, path]) => ({ fs, path }));
  return nodeApi!;
}

/** Windows/backport-safe box scanner for asserting the fixture's real layout. */
function scanTopLevel(bytes: Uint8Array): { end: number; start: number; type: string }[] {
  const boxes: { end: number; start: number; type: string }[] = [];
  let offset = 0;
  const u32 = (o: number): number => (bytes[o] * 2 ** 24) + (bytes[o + 1] << 16) + (bytes[o + 2] << 8) + (bytes[o + 3] ?? 0);
  const four = (o: number): string => String.fromCharCode(bytes[o] ?? 0, bytes[o + 1] ?? 0, bytes[o + 2] ?? 0, bytes[o + 3] ?? 0);
  while (offset + 8 <= bytes.byteLength) {
    const size = u32(offset);
    if (size < 8 || offset + size > bytes.byteLength) break;
    boxes.push({ end: offset + size, start: offset, type: four(offset + 4) });
    offset += size;
  }
  return boxes;
}

function walkedRanges(
  bytes: Uint8Array,
): { endSeconds: number; length: number; offset: number; rap: boolean; startSeconds: number; terminal: boolean }[] {
  const index = MoofWalkIndex.parse(bytes);
  if (index === null) throw new Error('expected a parsed MoofWalkIndex');
  const seen: { endSeconds: number; length: number; offset: number; rap: boolean; startSeconds: number; terminal: boolean }[] = [];
  let range: null | RangeRead = index.first;
  while (range) {
    seen.push({
      endSeconds: range.endSeconds,
      length: range.length,
      offset: range.offset,
      rap: range.rap,
      startSeconds: range.startSeconds,
      terminal: range.terminal,
    });
    range = index.next(range);
  }
  return seen;
}

describe.runIf(IN_NODE)('MoofWalkIndex against the real sidx-less fragmented fMP4', () => {
  it('walks the ffmpeg object into an exact-byte RAP-aligned index: no sidx, 4 fragments, bounded windows', async () => {
    const bytes = await fixtureBytes();
    const top = scanTopLevel(bytes);
    expect(top.some((b) => b.type === 'sidx')).toBe(false);
    expect(top[0]?.type).toBe('ftyp');
    expect(top[1]?.type).toBe('moov');
    expect(top.filter((b) => b.type === 'moof')).toHaveLength(4);

    const seen = walkedRanges(bytes);
    expect(seen).toHaveLength(4);
    expect(seen[0].offset).toBe(0); // first range carries the init
    for (let i = 1; i < seen.length; i += 1) {
      expect(seen[i].offset).toBeGreaterThan(0); // bounded fragment windows
    }
    expect(seen[3].terminal).toBe(true);
    // keyint 15 + -bf 0 + frag_keyframe ⇒ every fragment starts at an IDR.
    expect(seen.every((s) => s.rap)).toBe(true);

    // Half-second fragments: starts ≈ 0, 0.523, 1.023, 1.523 (real timeline).
    const starts = seen.map((s) => s.startSeconds);
    expect(starts[0]).toBeCloseTo(0, 2);
    for (let i = 1; i < starts.length; i += 1) expect(starts[i]).toBeCloseTo(starts[i - 1] + 0.523, 1);
  });

  it('recovers a real duration from the fragments when mvhd duration is 0 (empty_moov)', async () => {
    const index = MoofWalkIndex.parse(await fixtureBytes());
    expect(index).not.toBeNull();
    expect(index!.durationSeconds).not.toBeNull();
    expect(index!.durationSeconds!).toBeGreaterThan(2);
    expect(index!.durationSeconds!).toBeLessThan(2.1);
    // The terminal range's end is the fragment-derived duration, not 0.
    const last = walkedRanges(await fixtureBytes())[3];
    expect(last.endSeconds).toBeGreaterThan(2);
    expect(index!.seek(99)!.offset).toBe(last.offset);
  });

  it('FLOOR-selects real ranges for exact and mid-fragment targets, clamping edges', async () => {
    const index = MoofWalkIndex.parse(await fixtureBytes());
    expect(index).not.toBeNull();
    const targets = [0, 0.49, 0.5, 0.51, 1, 1.4, 1.9, 1.99, 2, 99];
    const offsets = targets.map((t) => index!.seek(t)?.offset ?? -1);
    for (let i = 1; i < offsets.length; i += 1) {
      expect(offsets[i]).toBeGreaterThanOrEqual(offsets[i - 1]);
    }
    expect(offsets[0]).toBe(0);
    expect(offsets[offsets.length - 1]).toBeGreaterThan(0); // terminal clamp
    expect(index!.seek(-1)?.offset).toBe(0); // negative clamp
    expect(index!.seek(Number.NaN)).toBeNull();
    expect(index!.seek(Number.POSITIVE_INFINITY)).toBeNull();
  });
});
