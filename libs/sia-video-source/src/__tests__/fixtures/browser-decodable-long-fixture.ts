/**
 * Long browser-decodable AVC/AAC fixture contract for the real-browser
 * buffered-ahead proof.
 *
 * The committed `browser-decodable-avc-aac.mp4` (2 s) is genuinely decodable
 * but refragments to a small number of media segments: a real host's first
 * `updateend` cannot fire before the whole object is already read, so a
 * posting-sink buffered-ahead gate never observes a mid-file plateau on it.
 * The buffered-ahead browser proof needs a long multi-fragment file that is
 * genuinely decodable by the strict engines (Chromium and Firefox reject
 * hand-assembled AVC "looks-valid" payloads with `MEDIA_ERR_DECODE`).
 *
 * This fixture is the same pinned ffmpeg lavfi recipe as the short one, with
 * `-t 12` and a finer keyframe grid: real testsrc2 + sine AVC/AAC,
 * moov-first progressive, complete `mdat`, 2 distinct tracks, a 0.5 s
 * keyframe interval (keyint 15 @ 30 fps, one IDR every 500 ms), and
 * genuinely decodable. Its bytes are locked by sha256 here and embedded
 * (base64) in the sibling `browser-decodable-long-fixture-bytes.ts`, which the
 * browser suite imports (browser-safe: no fs/URL).
 *
 * Regeneration: `src/__fixtures__/media/generate-browser-decodable-long-fixture.mjs`
 * (--check / --generate / --emit-bytes-ts), mirroring the short fixture's
 * contract. The sha below must match the generator's PINNED_SHA and the
 * committed `.mp4`.
 */
import { browserDecodableLongFixtureBase64 } from './browser-decodable-long-fixture-bytes.ts';

/** sha256 of the committed browser-decodable-long.mp4 (see the generator contract). */
export const BROWSER_DECODABLE_LONG_FIXTURE_SHA256 =
  'a5a4a316d89bc57147a83da064b3e440ca9fee243916712f2bf65fa00a550f58';

/** Documented presentation duration (seconds): 12 s at 30 fps / 44.1 kHz. */
export const BROWSER_DECODABLE_LONG_FIXTURE_DURATION_SECONDS = 12;

/** Codec-qualified fMP4 MIME the refragmented long fixture carries (matches the 2 s fixture). */
export const BROWSER_DECODABLE_LONG_FIXTURE_MIME = 'video/mp4; codecs="avc1.640032,mp4a.40.2"';

/** Expected byte length of the committed fixture (integrity tripwire, not a substitute for the sha). */
const BROWSER_DECODABLE_LONG_FIXTURE_BYTE_LENGTH = 689899;

/**
 * Returns the committed long fixture bytes (decoded from the generated
 * browser-safe base64 module). Throws if the embedded module does not carry the
 * pinned length, which is the contract's way of refusing to fabricate bytes.
 */
export function browserDecodableLongFixtureBytes(): Uint8Array {
  const bytes = decodeBase64(browserDecodableLongFixtureBase64());
  if (bytes.byteLength !== BROWSER_DECODABLE_LONG_FIXTURE_BYTE_LENGTH) {
    throw new Error(
      'browserDecodableLongFixtureBytes() returned bytes whose length does not match the ' +
        `committed fixture (${BROWSER_DECODABLE_LONG_FIXTURE_BYTE_LENGTH} B). Regenerate with ` +
        'src/__fixtures__/media/generate-browser-decodable-long-fixture.mjs --generate --emit-bytes-ts ' +
        'and re-pin BROWSER_DECODABLE_LONG_FIXTURE_SHA256. Never fabricate bytes.',
    );
  }
  return bytes;
}

function decodeBase64(base64: string): Uint8Array {
  const binary = globalThis.atob(base64);
  const out = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) out[index] = binary.charCodeAt(index);
  return out;
}
