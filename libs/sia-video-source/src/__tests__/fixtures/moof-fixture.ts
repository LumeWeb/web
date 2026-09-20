/**
 * Sidx-less fragmented browser-decodable fMP4 fixture contract for the
 * moof-walk random-access index (`src/container/index/moof-index.ts`).
 *
 * The moof-walk browser MSE suite feeds a REAL MediaSource the sidx-less
 * fragmented fMP4 bytes that the default load pipeline indexes with
 * `MoofWalkIndex` and streams with the passthrough producer. A fixture
 * qualifies only when it is GENUINELY browser-decodable AND genuinely
 * fragmented WITHOUT a top-level `sidx`:
 *
 *   - real AVC/AAC payloads (complete, consecutive, real frames from a real
 *     encode — not zero-filler, not one repeated access unit);
 *   - fMP4 layout `ftyp, moov, (moof mdat)×n` with NO top-level `sidx` (ffmpeg
 *     `-movflags frag_keyframe+empty_moov+default_base_moof`);
 *   - `-bf 0 -g 15 -keyint_min 15` so EVERY video fragment starts at an IDR
 *     (a fully RAP-aligned random-access grid a floor-seek can land on);
 *   - ffmpeg `empty_moov` writes mvhd duration 0, so the walker must recover
 *     the duration from the fragments (its terminal-duration fallback).
 *
 * The bytes are generated + committed as
 * `src/__fixtures__/media/browser-decodable-frag-avc-aac.mp4` by the pinned
 * ffmpeg recipe in `src/__fixtures__/media/generate-browser-decodable-frag-fixture.mjs`
 * and embedded (base64) in the sibling `moof-fixture-bytes.ts`, which the
 * browser MSE suite imports (browser-safe: no fs/URL).
 *
 * Browser-safe by construction (no node imports).
 */
import { moofFixtureBase64 } from './moof-fixture-bytes.ts';

/** Set to `true` ONLY when the real sidx-less fragmented fixture is committed (see the generator script). */
export const HAS_MOOF_FIXTURE = true;

/**
 * sha256 of the committed `browser-decodable-frag-avc-aac.mp4`. Regenerate on
 * a pinned toolchain with the fragmented fixture generator and carry the NEW
 * hash here AND into the browser MSE suite — a mismatch fails RED.
 */
export const MOOF_FIXTURE_SHA256 = '24e79f7d5aff821abc91ec972a53101b2e6066ad01cca0e702c7e2c616aec00c';

/** Documented presentation duration (seconds) of the real fixture (~2.02 s; mvhd duration is 0). */
export const MOOF_FIXTURE_DURATION_SECONDS = 2;

/**
 * Codec-qualified fMP4 MIME the fragmented fixture carries (same AVC High@5.0
 * `avc1.640032` + AAC-LC `mp4a.40.2` as the progressive sibling), so strict
 * engines accept the append.
 */
export const MOOF_FIXTURE_MIME = 'video/mp4; codecs="avc1.640032,mp4a.40.2"';

/** Expected byte length of the committed fixture (integrity tripwire, not a substitute for the sha). */
const MOOF_FIXTURE_BYTE_LENGTH = 114917;

/**
 * Returns the committed sidx-less fragmented fMP4 bytes (decoded from the
 * generated browser-safe base64 module). Throws if the embedded module does
 * not carry the pinned length — the contract's way of refusing to fabricate
 * bytes.
 */
export function moofFixtureBytes(): Uint8Array {
  const bytes = decodeBase64(moofFixtureBase64());
  if (bytes.byteLength !== MOOF_FIXTURE_BYTE_LENGTH) {
    throw new Error(gapMessage());
  }
  return bytes;
}

function decodeBase64(base64: string): Uint8Array {
  const binary = globalThis.atob(base64);
  const out = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) out[index] = binary.charCodeAt(index);
  return out;
}

function gapMessage(): string {
  return [
    'moofFixtureBytes() returned bytes whose length does not match',
    `the committed fixture (${MOOF_FIXTURE_BYTE_LENGTH} B). Regenerate with`,
    'src/__fixtures__/media/generate-browser-decodable-frag-fixture.mjs --emit-bytes-ts',
    'and re-pin MOOF_FIXTURE_SHA256. Never fabricate bytes.',
  ].join(' ');
}
