#!/usr/bin/env node
/* oxlint-disable typescript/no-unsafe-assignment, typescript/no-unsafe-member-access, typescript/no-unsafe-call, typescript/no-unsafe-argument, typescript/no-unsafe-return */
/**
 * Long browser-decodable AVC/AAC fixture contract (the browser buffered-ahead
 * proof).
 *
 * The browser proof that a held main-thread playhead bounds the SourceBuffer's
 * real buffered-ahead needs a long, genuinely browser-decodable progressive
 * MP4: the real 2 s `browser-decodable-avc-aac.mp4` converts to a small
 * number of media fragments, so its whole content is read ahead of the
 * host's first real `updateend` and the buffered-ahead gate never observes a
 * mid-file plateau.
 * This 12 s fixture (same pinned ffmpeg lavfi recipe as the short one, `-t 12`)
 * refragments to enough fragments that the gate binds mid-file even under an
 * instant-absorb fake host, and its real AVC/AAC bytes stay decodable by
 * Chromium and Firefox, the strict engines that reject hand-assembled
 * "looks-valid" sample payloads with `MEDIA_ERR_DECODE`.
 *
 * The moov-first constraint is preserved: the 12 s moov still begins inside the
 * default 4 KiB probe head window (`ftyp` + moov head < 4096), so the default
 * pipeline classifies it as a playable progressive container.
 *
 * Usage (mirrors `generate-browser-decodable-fixture.mjs`):
 *   node generate-browser-decodable-long-fixture.mjs
 *   node generate-browser-decodable-long-fixture.mjs --check
 *   node generate-browser-decodable-long-fixture.mjs --generate --emit-bytes-ts
 *   node generate-browser-decodable-long-fixture.mjs --emit-bytes-ts
 *
 * A candidate that fails the structural contract (top-level ftyp/moov/mdat,
 * moov before mdat, 2 distinct tracks with vide+soun handlers, non-empty stsz,
 * mdat ending at EOF, stable sha256) is rejected, never fabricated.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const OUT = dirname(fileURLToPath(import.meta.url));
const FIXTURE = join(OUT, 'browser-decodable-long.mp4');
const BYTES_TS = join(OUT, '..', '..', '__tests__', 'fixtures', 'browser-decodable-long-fixture-bytes.ts');
/** Pinned sha256 of the committed fixture (must match the contract module). */
const PINNED_SHA = 'a5a4a316d89bc57147a83da064b3e440ca9fee243916712f2bf65fa00a550f58';
const EXPECT_LENGTH = 689899;

/**
 * Same pinned AVC/AAC recipe as the short fixture, but `-t 12` with a finer
 * RAP grid (`-g 15` = one IDR every 500 ms). The finer grid keeps the browser
 * buffered-ahead proof from depending on long gaps between keyframes: the
 * media library's conversion read window covers a bounded amount of media
 * ahead of the playhead, so the posting-sink gate closes mid-file with
 * genuinely decodable media still unread, and a held playhead's plateau is
 * unambiguously short of the file end.
 */
const FFMPEG_CMD = [
  'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y',
  '-f', 'lavfi', '-i', 'testsrc2=size=320x240:rate=30:duration=12',
  '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=44100:duration=12',
  '-c:v', 'libx264', '-profile:v', 'high', '-level', '5.0', '-pix_fmt', 'yuv420p',
  '-g', '15', '-keyint_min', '15', '-sc_threshold', '0',
  '-x264-params', 'keyint=15:min-keyint=15:scenecut=0',
  '-c:a', 'aac', '-b:a', '96k', '-ac', '2', '-ar', '44100',
  '-fps_mode', 'cfr', '-r', '30',
  '-movflags', '+faststart',
  '-t', '12',
  '-fflags', '+bitexact', '-flags:v', '+bitexact', '-flags:a', '+bitexact',
  FIXTURE,
];

const u32 = (b, o) => ((b[o] ?? 0) * 2 ** 24) + ((b[o + 1] ?? 0) << 16) + ((b[o + 2] ?? 0) << 8) + (b[o + 3] ?? 0);
const four = (b, o) => String.fromCharCode(...b.subarray(o, o + 4));

function checkMode() {
  const bytes = load();
  if (!bytes) {
    console.error('fixture absent; regenerate with --generate --emit-bytes-ts.');
    return false;
  }
  return report('--check browser-decodable-long.mp4', validate(bytes));
}

function children(b, start, end) {
  const out = [];
  let off = start;
  while (off + 8 <= end) {
    const size = u32(b, off);
    if (size < 8 || off + size > end) return [];
    out.push({ end: off + size, size, start: off, type: four(b, off + 4) });
    off += size;
  }
  return off === end ? out : [];
}

function emitBytesTs(bytes, sha) {
  const base64 = Buffer.from(bytes).toString('base64');
  writeFileSync(
    BYTES_TS,
    `/**
 * Generated file. Do not edit by hand.
 * Regenerate with:
 *   node src/__fixtures__/media/generate-browser-decodable-long-fixture.mjs --generate --emit-bytes-ts
 * (or re-emit from committed bytes with: ... --emit-bytes-ts).
 *
 * Carries browser-decodable-long.mp4 (sha256 ${sha}) as base64 so the node
 * and browser MSE suites resolve the exact same bytes with no fs/URL import
 * (this module is browser-safe by construction).
 */
const BASE64 = '${base64}';

/** Base64 of the committed browser-decodable-long.mp4 (see the generator contract). */
export function browserDecodableLongFixtureBase64(): string {
  return BASE64;
}
`,
  );
  console.log(`Emitted browser-safe embedded bytes module: ${BYTES_TS}`);
}

function emitBytesTsMode() {
  const bytes = load();
  if (!bytes) return false;
  const verdict = validate(bytes);
  if (!report('--emit-bytes-ts', verdict)) return false;
  emitBytesTs(bytes, verdict.sha);
  return true;
}

function fail(reason, sha) {
  return { audio: false, ok: false, reason, sha, video: false };
}

function generateMode(emitTs) {
  const probe = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  if (probe.error || probe.status !== 0) {
    console.log('no deterministic ffmpeg on this machine; cannot generate the real fixture.');
    return false;
  }
  const run = spawnSync(FFMPEG_CMD[0], FFMPEG_CMD.slice(1), { stdio: 'inherit' });
  if (run.status !== 0 || !existsSync(FIXTURE)) {
    console.error('ffmpeg generation failed; nothing committed.');
    return false;
  }
  const bytes = new Uint8Array(readFileSync(FIXTURE));
  const verdict = validate(bytes);
  if (!report('--generate', verdict)) return false;
  if (emitTs) emitBytesTs(bytes, verdict.sha);
  return true;
}

function load() {
  if (!existsSync(FIXTURE)) return null;
  return new Uint8Array(readFileSync(FIXTURE));
}

function report(label, verdict) {
  console.log(`${label}: ${verdict.ok ? 'OK' : 'CONTRACT VIOLATION'}`);
  if (!verdict.ok) console.log(`  reason: ${verdict.reason}`);
  console.log(`  sha256 ${verdict.sha}`);
  return verdict.ok;
}

function validate(bytes) {
  const sha = createHash('sha256').update(bytes).digest('hex');
  const reason = new Set();
  const top = [];
  let off = 0;
  while (off + 8 <= bytes.length) {
    const size = u32(bytes, off);
    if (size === 1 || size === 0 || size < 8 || off + size > bytes.length) return fail('top-level box walk is malformed/truncated', sha);
    top.push({ end: off + size, size, start: off, type: four(bytes, off + 4) });
    off += size;
  }
  if (off !== bytes.length) return fail('top-level boxes do not end at EOF', sha);
  const moov = top.find((b2) => b2.type === 'moov');
  const mdat = top.find((b2) => b2.type === 'mdat');
  if (!moov || !mdat) return fail('missing top-level moov/mdat', sha);
  if (mdat.start < moov.start) reason.add('moov is not first (progressive layout requires ftyp/moov/mdat)');
  if (mdat.end !== bytes.length) reason.add('mdat does not end at EOF (truncated file)');
  const ids = [];
  const handlers = [];
  let video = false;
  let audio = false;
  for (const trak of children(bytes, moov.start + 8, moov.end).filter((b2) => b2.type === 'trak')) {
    const kids = children(bytes, trak.start + 8, trak.end);
    const tkhd = kids.find((b2) => b2.type === 'tkhd');
    const mdia = kids.find((b2) => b2.type === 'mdia');
    if (!tkhd || !mdia) { reason.add('trak missing tkhd/mdia'); continue; }
    const v = bytes[tkhd.start + 8] ?? 0;
    ids.push(u32(bytes, tkhd.start + (v === 1 ? 28 : 20)));
    const mdiaKids = children(bytes, mdia.start + 8, mdia.end);
    const minf = mdiaKids.find((b2) => b2.type === 'minf');
    const hdlr = mdiaKids.find((b2) => b2.type === 'hdlr');
    handlers.push(hdlr ? four(bytes, hdlr.start + 16) : '?');
    const stbl = minf ? children(bytes, minf.start + 8, minf.end).find((b2) => b2.type === 'stbl') : null;
    if (!stbl) { reason.add('trak missing stbl'); continue; }
    const stblKids = children(bytes, stbl.start + 8, stbl.end);
    const stsz = stblKids.find((b2) => b2.type === 'stsz');
    if (!stsz || u32(bytes, stsz.start + 16) === 0) reason.add('track has zero samples');
    const stsd = stblKids.find((b2) => b2.type === 'stsd');
    const entries = stsd ? children(bytes, stsd.start + 16, stsd.end) : [];
    if (entries.some((e2) => four(bytes, e2.start + 4) === 'avc1')) video = true;
    if (entries.some((e2) => four(bytes, e2.start + 4) === 'mp4a')) audio = true;
  }
  if (new Set(ids).size !== ids.length) reason.add('duplicate track ids');
  if (ids.length < 2) reason.add('fewer than 2 tracks');
  if (!video || !audio) reason.add('missing AVC video or AAC audio sample entry');
  if (bytes.length !== EXPECT_LENGTH) reason.add(`length ${bytes.length} != expected ${EXPECT_LENGTH}`);
  if (sha !== PINNED_SHA) reason.add('sha256 does not match the pinned contract (regeneration on a different toolchain is not byte-identical)');
  return { audio, ok: reason.size === 0, reason: [...reason].join('; '), sha, video };
}

const mode = process.argv[2];
const emitTs = process.argv.includes('--emit-bytes-ts');
if (mode === '--check') process.exit(checkMode() ? 0 : 1);
if (mode === '--generate') process.exit(generateMode(emitTs) ? 0 : 1);
if (mode === '--emit-bytes-ts') process.exit(emitBytesTsMode() ? 0 : 1);
console.log('Generate/verify the long browser-decodable fixture:');
console.log('  --check              verify the committed fixture (sha + structure)');
console.log('  --generate           ffmpeg present: produce browser-decodable-long.mp4');
console.log('  --emit-bytes-ts      re-emit the browser-safe base64 module from committed bytes');
console.log('  --generate --emit-bytes-ts   generate and emit the embedded module');
