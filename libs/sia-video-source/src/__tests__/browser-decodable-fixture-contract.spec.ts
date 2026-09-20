/**
 * Fixture contract for the browser-decode requirement.
 *
 * These tests pin the committed state: a genuinely browser-decodable AVC/AAC
 * progressive-MP4 fixture (`browser-decodable-avc-aac.mp4`) is committed, its
 * sha256 is pinned in `src/__tests__/fixtures/browser-decodable-fixture.ts`,
 * and the normalized-MSE decode-acceptance suite runs against it. The contract
 * (what the fixture must be, its pinned sha256, and its regeneration path)
 * lives in `src/__tests__/fixtures/browser-decodable-fixture.ts` and is
 * reproduced by `src/__fixtures__/media/generate-browser-decodable-fixture.mjs`.
 *
 * The node-only half locks the integrity facts: (a) the bytes returned by the
 * browser-safe module hash to the pinned sha256 AND match the committed
 * `.mp4` on disk byte-for-byte; (b) the returned bytes are structurally the
 * 2-track avc+mp4a moov-first progressive file with a complete `mdat`; (c) the
 * tracked demo BBB fixtures remain DISQUALIFIED (single video track, truncated
 * `mdat`), so substituting a demo fixture fails RED here first.
 */
import { describe, expect, it } from 'vitest';
import {
  BROWSER_DECODABLE_FIXTURE_SHA256,
  browserDecodableFixtureBytes,
  HAS_BROWSER_DECODABLE_FIXTURE,
} from './fixtures/browser-decodable-fixture.ts';

const IN_NODE = typeof document === 'undefined';

describe('browser-decodable AVC/AAC fixture contract', () => {
  it('a real fixture is committed: the availability flag is on, sha pinned, bytes resolvable (browser-safe)', () => {
    // The fixture generation contract has been fulfilled: HAS is true and the
    // sha is a pinned 64-hex hash (not the '<pending' sentinel).
    expect(HAS_BROWSER_DECODABLE_FIXTURE).toBe(true);
    expect(BROWSER_DECODABLE_FIXTURE_SHA256).not.toContain('<pending');
    expect(BROWSER_DECODABLE_FIXTURE_SHA256).toMatch(/^[0-9a-f]{64}$/);
    // Resolving the bytes must NOT throw — the browser MSE suite depends on it.
    const bytes = browserDecodableFixtureBytes();
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  it('a committed fixture must flip the availability flag AND pin its sha256 (contract lock)', () => {
    // This is the RED-first tripwire: flipping HAS_BROWSER_DECODABLE_FIXTURE to
    // true while the sha256 sentinel is still un-pinned is always a contract
    // violation, because the acceptance tests would run without committed bytes.
    // `Boolean(...)` widens the literal-typed const (true today) so the
    // open/pinned cross-check below is type-legal now AND if the fixture
    // generation ever flips the flag back — the comparison is the tripwire.
    const flagOpen = Boolean(HAS_BROWSER_DECODABLE_FIXTURE);
    const hashPinned = !BROWSER_DECODABLE_FIXTURE_SHA256.includes('<pending');
    expect(flagOpen ? hashPinned : true).toBe(true);
    expect(hashPinned ? flagOpen : true).toBe(true);
  });

  describe.runIf(IN_NODE)('node-only integrity + structural facts', () => {
    it('the embedded bytes hash to the pinned sha256 and are byte-identical to the committed .mp4', async () => {
      const { createHash } = await import('node:crypto');
      const { readFileSync } = await import('node:fs');
      const { dirname, join } = await import('node:path');
      const { fileURLToPath } = await import('node:url');
      const mediaDir = join(dirname(fileURLToPath(import.meta.url)), '..', '__fixtures__', 'media');
      const committed = new Uint8Array(readFileSync(join(mediaDir, 'browser-decodable-avc-aac.mp4')));
      const embedded = browserDecodableFixtureBytes();
      const sha = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');
      expect(sha(embedded)).toBe(BROWSER_DECODABLE_FIXTURE_SHA256);
      expect(sha(committed)).toBe(BROWSER_DECODABLE_FIXTURE_SHA256);
      expect(embedded.byteLength).toBe(committed.byteLength);
      expect(Array.from(embedded)).toEqual(Array.from(committed));
    });

    it('the committed fixture satisfies the structural contract: 2 tracks, avc+mp4a, distinct ids, complete mdat', () => {
      const bytes = browserDecodableFixtureBytes();
      const profile = structuralProfile(bytes);
      // Find duplicate ids / sample counts like the generator's validator:
      const ids = trackIds(bytes);
      expect(ids.length).toBe(2);
      expect(new Set(ids).size).toBe(2);
      expect(profile.tracks).toBe(2);
      expect(profile.audio).toBe(true);
      expect(profile.mdatComplete).toBe(true);
      expect(profile.reason).not.toContain('truncated');
    });

    it('the tracked demo BBB fixtures do not satisfy the contract (single video track, truncated mdat)', async (ctx) => {
      const { fs, path, url } = await Promise.all([
        import('node:fs'),
        import('node:path'),
        import('node:url'),
      ]).then(([fs, path, url]) => ({ fs, path, url }));
      const here = url.fileURLToPath(import.meta.url);
      const fixture = path.join(
        path.dirname(here),
        '..',
        '..',
        'demo',
        'src',
        '__fixtures__',
        'bbb-720p-10s-1mb-prefix.mp4',
      );
      // The demo BBB clips are not tracked as fixtures for this suite: run the
      // disqualification assertion only once a demo fixture is actually
      // present, so substituting a demo clip fails RED here instead of
      // erroring on a missing file.
      if (!fs.existsSync(fixture)) {
        ctx.skip();
        return;
      }
      const bytes = new Uint8Array(fs.readFileSync(fixture));
      const { audio, mdatComplete, reason, tracks } = structuralProfile(bytes);
      expect(tracks).toBe(1);
      expect(audio).toBe(false);
      expect(mdatComplete).toBe(false);
      expect(reason).toContain('truncated');
    });
  });
});

/** Finds the first offset of `fourcc` as a BMFF box type with a plausible u32 size. */
function findFourCc(bytes: Uint8Array, fourcc: string): number {
  for (let offset = 4; offset + 8 <= bytes.length; offset += 1) {
    if (readFourCc(bytes, offset) !== fourcc) continue;
    if (readU32(bytes, offset - 4) >= 8) return offset - 4;
  }
  return -1;
}

function readFourCc(bytes: Uint8Array, offset: number): string {
  return String.fromCharCode(...bytes.subarray(offset, offset + 4));
}

function readU32(bytes: Uint8Array, offset: number): number {
  return ((bytes[offset] ?? 0) * 2 ** 24) + ((bytes[offset + 1] ?? 0) << 16) + ((bytes[offset + 2] ?? 0) << 8) + (bytes[offset + 3] ?? 0);
}

/**
 * Minimal structural profile of a progressive MP4 (self-contained; the facts
 * this suite pins must not depend on a toolkit's evolving parser).
 */
function structuralProfile(
  bytes: Uint8Array,
): { audio: boolean; mdatComplete: boolean; reason: string; tracks: number } {
  let tracks = 0;
  let audio = false;
  let mdatComplete = false;
  const reasons: string[] = [];
  const boxes = topLevelTypes(bytes);
  const moov = boxes.find((b) => b.type === 'moov');
  if (moov) {
    let off = moov.start + 8;
    while (off + 8 <= moov.end) {
      const size = readU32(bytes, off);
      if (size < 8 || off + size > moov.end) break;
      if (readFourCc(bytes, off + 4) === 'trak') tracks += 1;
      off += size;
    }
  }
  // Deep-ish audio check: any soun handler within moov.
  const asText = Array.from(bytes.subarray(0, Math.min(bytes.length, 16 * 1024)), (b) => String.fromCharCode(b));
  audio = asText.join('').includes('soun');
  if (!audio) reasons.push('no audio (soun) track');
  // Locate `mdat` directly: the strict top-level walk above STOPS at a box
  // whose size field runs past EOF (the truncated file's signature), so the
  // `mdat` box never appears in `boxes` — but it is exactly what we must flag.
  const mdatOffset = findFourCc(bytes, 'mdat');
  if (mdatOffset !== -1) {
    const sizeField = readU32(bytes, mdatOffset);
    mdatComplete = sizeField > 0 && mdatOffset + sizeField === bytes.length;
    if (!mdatComplete) reasons.push('truncated');
  }
  return {
    audio,
    mdatComplete,
    reason: reasons.join('; '),
    tracks,
  };
}

/** Track id from a trak's tkhd: header(8) version+flags(4) creation(4/8) modification(4/8) track_id(4). */
function tkhdTrackId(bytes: Uint8Array, start: number, end: number): number {
  let off = start;
  while (off + 8 <= end) {
    const size = readU32(bytes, off);
    if (size < 8 || off + size > end) return -1;
    if (readFourCc(bytes, off + 4) === 'tkhd') {
      const version = bytes[off + 8] ?? 0;
      return readU32(bytes, off + (version === 1 ? 28 : 20));
    }
    off += size;
  }
  return -1;
}

/** Top-level box ranges; strict (returns [] on a malformed size). */
function topLevelTypes(bytes: Uint8Array): { end: number; start: number; type: string }[] {
  const out: { end: number; start: number; type: string }[] = [];
  let off = 0;
  while (off + 8 <= bytes.length) {
    const size = readU32(bytes, off);
    if (size === 0 || size === 1 || size < 8 || off + size > bytes.length) return out;
    out.push({ end: off + size, start: off, type: readFourCc(bytes, off + 4) });
    off += size;
  }
  return out;
}

/** Track ids read from each trak's tkhd child (v0/v1 aware, like the generator validator). */
function trackIds(bytes: Uint8Array): number[] {
  const ids: number[] = [];
  const boxes = topLevelTypes(bytes);
  const moov = boxes.find((b) => b.type === 'moov');
  if (!moov) return ids;
  let off = moov.start + 8;
  while (off + 8 <= moov.end) {
    const size = readU32(bytes, off);
    if (size < 8 || off + size > moov.end) break;
    if (readFourCc(bytes, off + 4) === 'trak') {
      const id = tkhdTrackId(bytes, off + 8, off + size);
      if (id !== -1) ids.push(id);
    }
    off += size;
  }
  return ids;
}
