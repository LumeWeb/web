/**
 * Native-WebM browser-decodable fixture contract for the Cues/Cluster
 * random-access index.
 *
 * The native-WebM browser MSE suite feeds a REAL MediaSource the WebM bytes
 * that the load pipeline indexes with `CuesIndex` and streams with the
 * native-WebM producer. A fixture qualifies only when it is GENUINELY
 * browser-decodable AND a real Cues/Cluster WebM object:
 *
 *   - EBML header with DocType `webm` (MKV normalization stays deferred);
 *   - ONE Segment whose 8-byte size vint is what real muxers write (ffmpeg
 *     writes the Segment size as an 8-byte vint — the byte-exact test the
 *     dependency-neutral EBML reader must survive);
 *   - real VP8 + Vorbis tracks (widely MSE-supported), Info with TimecodeScale
 *     + Duration, ≥2 Clusters whose timecodes are keyframe-aligned (libvpx
 *     `-g 30` at 30 fps = a keyframe per second, with `-cluster_time_limit
 *     1000` forcing a Cluster boundary each second), and a Cues element
 *     naming the seekable Clusters;
 *   - ffmpeg writes the Info Duration ~2.003 s and an audio-only tail
 *     Cluster (no video keyframe, not Cues-referenced) — the index must
 *     report that terminal range `rap:false` (bad news wins) yet keep it
 *     terminal for EOS.
 *
 * The bytes are generated + committed as
 * `src/__fixtures__/media/browser-decodable-webm-vp8-vorbis.webm` by the
 * pinned ffmpeg recipe in
 * `src/__fixtures__/media/generate-browser-decodable-webm-fixture.mjs` and
 * embedded (base64) in the sibling `webm-browser-fixture-bytes.ts`, which the
 * browser MSE suite imports (browser-safe: no fs/URL).
 *
 * Browser-safe by construction (no node imports).
 */
import { webmBrowserFixtureBase64 } from './webm-browser-fixture-bytes.ts';

/** Set to `true` ONLY when the real native-WebM browser fixture is committed (see the generator script). */
export const HAS_WEBM_FIXTURE = true;

/**
 * sha256 of the committed `browser-decodable-webm-vp8-vorbis.webm`. Regenerate
 * on a pinned toolchain with the native-WebM fixture generator and carry the
 * NEW hash here AND into the browser MSE suite — a mismatch fails RED.
 */
export const WEBM_FIXTURE_SHA256 = '95acf5cc5b72f7f5df810b9cafbcacdd2ee60dbdf33f339da01715da02ffa7e2';

/** Documented presentation duration (seconds) of the real fixture (~2.003 s). */
export const WEBM_FIXTURE_DURATION_SECONDS = 2;

/**
 * Codec-qualified WebM MIME the fixture carries (VP8 + Vorbis), so both the
 * producer verdict's `MediaSource.isTypeSupported` and the strict engines accept
 * the append.
 */
export const WEBM_FIXTURE_MIME = 'video/webm; codecs="vp8,vorbis"';

/** Expected byte length of the committed fixture (integrity tripwire, not a substitute for the sha). */
const WEBM_FIXTURE_BYTE_LENGTH = 111772;

/**
 * Returns the committed native-WebM browser-decodable bytes (decoded from the
 * generated browser-safe base64 module). Throws if the embedded module does
 * not carry the pinned length — the contract's way of refusing to fabricate
 * bytes.
 */
export function webmFixtureBytes(): Uint8Array {
  const bytes = decodeBase64(webmBrowserFixtureBase64());
  if (bytes.byteLength !== WEBM_FIXTURE_BYTE_LENGTH) {
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
    'webmFixtureBytes() returned bytes whose length does not match',
    `the committed fixture (${WEBM_FIXTURE_BYTE_LENGTH} B). Regenerate with`,
    'src/__fixtures__/media/generate-browser-decodable-webm-fixture.mjs --emit-bytes-ts',
    'and re-pin WEBM_FIXTURE_SHA256. Never fabricate bytes.',
  ].join(' ');
}
