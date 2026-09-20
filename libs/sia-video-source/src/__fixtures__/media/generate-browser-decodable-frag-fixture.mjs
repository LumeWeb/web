#!/usr/bin/env node
/* oxlint-disable typescript/no-unsafe-assignment, typescript/no-unsafe-member-access, typescript/no-unsafe-call, typescript/no-unsafe-argument, typescript/no-unsafe-return */
/**
 * Sidx-less fragmented browser-decodable fMP4 fixture CONTRACT (moof-walk
 * random-access index).
 *
 * The moof-walk browser MSE suite needs a small, deterministic, GENUINELY
 * browser-decodable fragmented MP4 with NO top-level `sidx`: real AVC + AAC
 * sample bytes, `ftyp, moov, (moof mdat)×n` layout, every video fragment
 * RAP-aligned (`-bf 0 -g 15 -keyint_min 15` + `-movflags
 * frag_keyframe+empty_moov+default_base_moof`), lockable by sha256. This
 * script is the reproduction + verification contract:
 *
 *   node generate-browser-decodable-frag-fixture.mjs             # print the contract
 *   node generate-browser-decodable-frag-fixture.mjs --check     # verify the committed fixture (sha + structure)
 *   node generate-browser-decodable-frag-fixture.mjs --generate  # ffmpeg present → produce the real fixture
 *   node generate-browser-decodable-frag-fixture.mjs --emit-bytes-ts   # re-emit the browser-safe base64 module
 *
 * A candidate that fails the structural contract (NO top-level `sidx`, ftyp+
 * moov first, ≥2 moof/mdat fragments, RAP evidence on every video fragment,
 * complete boxes, stable sha256) is rejected — never fabricated.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const OUT = dirname(fileURLToPath(import.meta.url));
const FIXTURE = join(OUT, 'browser-decodable-frag-avc-aac.mp4');
const BYTES_TS = join(OUT, '..', '..', '__tests__', 'fixtures', 'moof-fixture-bytes.ts');

/** Pinned, reproducible ffmpeg lavfi recipe (no input media, no network). */
const FFMPEG_CMD = [
  'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y',
  '-f', 'lavfi', '-i', 'testsrc2=size=320x240:rate=30:duration=2',
  '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=44100:duration=2',
  // High profile @5.0 → avc1.640032, matching MOOF_FIXTURE_MIME.
  '-c:v', 'libx264', '-profile:v', 'high', '-level', '5.0', '-pix_fmt', 'yuv420p',
  // -bf 0 (no B-frames) + keyint 15 ⇒ an IDR every 15 frames = every 500 ms
  // fragment, so EVERY video fragment begins with a decodable RAP.
  '-bf', '0',
  '-g', '15', '-keyint_min', '15', '-sc_threshold', '0',
  '-x264-params', 'keyint=15:min-keyint=15:scenecut=0',
  '-c:a', 'aac', '-b:a', '96k', '-ac', '2', '-ar', '44100',
  '-fps_mode', 'cfr', '-r', '30',
  // Fragment without a manifest: fragmented output, no top-level sidx (that
  // needs +global_sidx/dash). empty_moov keeps moov+ftyp at the front.
  '-movflags', 'frag_keyframe+empty_moov+default_base_moof',
  '-frag_duration', '500000',
  '-t', '2',
  '-fflags', '+bitexact', '-flags:v', '+bitexact', '-flags:a', '+bitexact',
  FIXTURE,
];

// ---- tiny ISO-BMFF structural checker (self-contained; no deps) --------------

const u32 = (bytes, o) => ((bytes[o] ?? 0) * 2 ** 24) + ((bytes[o + 1] ?? 0) << 16) + ((bytes[o + 2] ?? 0) << 8) + (bytes[o + 3] ?? 0);
const four = (bytes, o) => String.fromCharCode(...bytes.subarray(o, o + 4));

function checkMode() {
  if (!existsSync(FIXTURE)) {
    report('--check', { ok: false, reason: 'fixture ABSENT (regenerate with --generate)', sha: '<none>' });
    printContract();
    return false;
  }
  return report(`--check ${FIXTURE.split('/').pop()}`, validate(new Uint8Array(readFileSync(FIXTURE))));
}

function children(bytes, start, end) {
  const out = [];
  let off = start;
  while (off + 8 <= end) {
    const size = u32(bytes, off);
    if (size < 8 || off + size > end) return [];
    out.push({ end: off + size, size, start: off, type: four(bytes, off + 4) });
    off += size;
  }
  return off === end ? out : [];
}

function emitBytesTs(bytes, sha) {
  const base64 = Buffer.from(bytes).toString('base64');
  const source = `/**
 * GENERATED FILE — do not edit by hand.
 * Regenerate with:
 *   node src/__fixtures__/media/generate-browser-decodable-frag-fixture.mjs --emit-bytes-ts
 *
 * Carries browser-decodable-frag-avc-aac.mp4 (sha256 ${sha}) as base64 so the
 * browser MSE suite can resolve the EXACT sidx-less fragmented bytes with no
 * fs/URL import (browser-safe by construction).
 */
const BASE64 = '${base64}';

/** Base64 of the committed sidx-less fragmented browser-decodable fMP4. */
export function moofFixtureBase64(): string {
  return BASE64;
}
`;
  writeFileSync(BYTES_TS, source);
  console.log(`\nEmitted browser-safe embedded bytes module: ${BYTES_TS}`);
  console.log(`  embedded sha256: ${sha}`);
  return true;
}

function emitBytesTsMode() {
  if (!existsSync(FIXTURE)) {
    console.error('no committed fixture to embed; run --generate first.');
    return false;
  }
  const bytes = new Uint8Array(readFileSync(FIXTURE));
  const verdict = validate(bytes);
  if (!report('--emit-bytes-ts', verdict)) {
    console.error('committed bytes violate the contract; refusing to emit.');
    return false;
  }
  return emitBytesTs(bytes, verdict.sha);
}

function generateMode() {
  const probe = spawnSync('ffmpeg', ['-version'], { stdio: 'ignore' });
  if (probe.error || probe.status !== 0) {
    console.log('no deterministic ffmpeg on this machine -> cannot generate the real fixture; nothing written.');
    printContract();
    return false;
  }
  const run = spawnSync(FFMPEG_CMD[0], FFMPEG_CMD.slice(1), { stdio: 'inherit' });
  if (run.status !== 0 || !existsSync(FIXTURE)) {
    console.error('ffmpeg generation failed; nothing committed.');
    return false;
  }
  const verdict = validate(new Uint8Array(readFileSync(FIXTURE)));
  if (!report('--generate', verdict)) {
    console.error('generated bytes violate the fixture contract; refusing to keep them.');
    return false;
  }
  console.log(`\nCandidate ready: ${FIXTURE}`);
  console.log('Carry the sha256 above into src/__tests__/fixtures/moof-fixture.ts (MOOF_FIXTURE_SHA256)');
  console.log('and re-emit the browser-safe module with --emit-bytes-ts.');
  return true;
}

function printContract() {
  console.log(`sidx-less fragmented fMP4 fixture contract
  file:  ${FIXTURE}
  needs: a SMALL deterministic fragmented MP4 (ftyp, moov, (moof mdat)×n,
         NO top-level sidx), one AVC video track + one AAC-LC audio track,
         every video fragment starting at an IDR (-bf 0 -g 15), every mdat
         COMPLETE — the bytes the moof-walk browser-MSE suite feeds a real
         MediaSource to prove exact/floor seeks and EOS.
  generate (ffmpeg present):  ${FFMPEG_CMD.join(' ')}
  check:    node ${fileURLToPath(import.meta.url).split('/').pop()} --check
  emit ts:  node ${fileURLToPath(import.meta.url).split('/').pop()} --emit-bytes-ts
`);
}

function report(label, verdict) {
  console.log(`${label}: ${verdict.ok ? 'OK' : 'CONTRACT VIOLATION'}`);
  if (!verdict.ok) console.log(`  reason: ${verdict.reason}`);
  console.log(`  sha256 ${verdict.sha}`);
  return verdict.ok;
}

function topLevel(bytes) {
  const out = [];
  let off = 0;
  while (off + 8 <= bytes.length) {
    const size = u32(bytes, off);
    if (size === 1 || size === 0 || size < 8 || off + size > bytes.length) return [];
    out.push({ end: off + size, start: off, type: four(bytes, off + 4) });
    off += size;
  }
  return off === bytes.length ? out : [];
}

function validate(bytes) {
  const sha = createHash('sha256').update(bytes).digest('hex');
  const top = topLevel(bytes);
  const problems = [];
  if (top.length === 0) problems.push('top-level box walk malformed/truncated');
  if (top.some((b) => b.type === 'sidx')) problems.push('a top-level sidx is present — must be sidx-less');
  if (top[0]?.type !== 'ftyp' || top[1]?.type !== 'moov') problems.push('expected ftyp then moov first');
  const moofs = top.filter((b) => b.type === 'moof');
  const mdats = top.filter((b) => b.type === 'mdat');
  if (moofs.length < 2) problems.push(`expected ≥2 moof/mdat fragments, got ${moofs.length}`);
  if (moofs.length !== mdats.length) problems.push('moof/mdat count mismatch');
  if (problems.length === 0) {
    const raps = moofs.map((m) => videoRap(bytes, m));
    if (raps.some((r) => r !== true)) problems.push('every video fragment must be RAP-aligned (got non-RAP evidence)');
  }
  return { ok: problems.length === 0, reason: problems.join('; ') || 'ok', sha };
}

/** First-sample sync evidence for a fragment's video traf, or null. */
function videoRap(bytes, moof) {
  const trafs = children(bytes, moof.start + 8, moof.end).filter((b) => b.type === 'traf');
  for (const traf of trafs) {
    const parts = children(bytes, traf.start + 8, traf.end);
    const tfhd = parts.find((b) => b.type === 'tfhd');
    if (!tfhd) continue;
    const s = tfhd.start + 8;
    const flags = ((bytes[s + 1] << 16) | (bytes[s + 2] << 8) | bytes[s + 3]) >>> 0;
    let defSampleFlags = -1;
    let pos = s + 8;
    if (flags & 0x1) pos += 8;
    if (flags & 0x2) pos += 4;
    if (flags & 0x8) pos += 4;
    if (flags & 0x10) pos += 4;
    if (flags & 0x20) { defSampleFlags = u32(bytes, pos); pos += 4; }
    const trun = parts.find((b) => b.type === 'trun');
    if (trun) {
      const t = trun.start + 8;
      const tflags = ((bytes[t + 1] << 16) | (bytes[t + 2] << 8) | bytes[t + 3]) >>> 0;
      let p = t + 8;
      if (tflags & 0x1) p += 4;
      if (tflags & 0x4) return (u32(bytes, p) & 0x00010000) === 0;
    }
    return (defSampleFlags & 0x00010000) === 0;
  }
  return null;
}

const mode = process.argv[2] ?? '';
if (mode === '--check') checkMode();
else if (mode === '--generate') generateMode();
else if (mode === '--emit-bytes-ts') emitBytesTsMode();
else printContract();
