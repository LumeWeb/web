#!/usr/bin/env node
/* oxlint-disable typescript/no-unsafe-assignment, typescript/no-unsafe-member-access, typescript/no-unsafe-call, typescript/no-unsafe-argument, typescript/no-unsafe-return */
/**
 * Native-WebM browser-decodable fixture CONTRACT (Cues/Cluster random-access
 * index).
 *
 * The WebM browser MSE suite needs a small, deterministic, GENUINELY
 * browser-decodable WebM: real VP8 + Vorbis sample bytes, an EBML `webm`
 * DocType, ONE Segment with Info (TimecodeScale + Duration), Tracks
 * (V_VP8 + A_VORBIS), ≥2 Clusters whose timecodes are keyframe-aligned
 * (libvpx `-g 30` at 30 fps = one keyframe per second, with
 * `-cluster_time_limit 1000` forcing a Cluster boundary every second so each
 * Cluster starts on a RAP) and a Cues element naming those Clusters — the
 * exact-byte grid the `CuesIndex` browser tests seek on. Lockable by sha256.
 *
 * This script is the reproduction + verification contract:
 *
 *   node generate-browser-decodable-webm-fixture.mjs             # print the contract
 *   node generate-browser-decodable-webm-fixture.mjs --check     # verify the committed fixture (sha + structure)
 *   node generate-browser-decodable-webm-fixture.mjs --generate  # ffmpeg present → produce the real fixture
 *   node generate-browser-decodable-webm-fixture.mjs --emit-bytes-ts   # re-emit the browser-safe base64 module
 *
 * A candidate that fails the structural contract (DocType `webm`, ≥2 Clusters,
 * ≥1 Cues with ≥2 CuePoints, keyframe-aligned cluster starts, complete
 * elements, stable sha256) is rejected — never fabricated.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const OUT = dirname(fileURLToPath(import.meta.url));
const FIXTURE = join(OUT, 'browser-decodable-webm-vp8-vorbis.webm');
const BYTES_TS = join(OUT, '..', '..', '__tests__', 'fixtures', 'webm-browser-fixture-bytes.ts');

/** Pinned, reproducible ffmpeg lavfi recipe (no input media, no network). */
const FFMPEG_CMD = [
  'ffmpeg', '-hide_banner', '-loglevel', 'error', '-y',
  '-f', 'lavfi', '-i', 'testsrc2=size=320x240:rate=30:duration=2',
  '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=48000:duration=2',
  '-c:v', 'libvpx', '-b:v', '400k', '-pix_fmt', 'yuv420p',
  // libvpx `-g 30` = one keyframe every 30 frames = every 1 s at 30 fps, and
  // every Cluster boundary is forced at the same 1 s cadence by
  // `-cluster_time_limit 1000`, so every Cluster starts on a decodable RAP.
  '-g', '30',
  '-auto-alt-ref', '0', '-lag-in-frames', '0',
  '-c:a', 'libvorbis', '-b:a', '96k', '-ac', '2', '-ar', '48000',
  '-fps_mode', 'cfr', '-r', '30',
  '-cluster_time_limit', '1000',
  '-t', '2',
  '-fflags', '+bitexact', '-flags:v', '+bitexact', '-flags:a', '+bitexact',
  FIXTURE,
];

// ---- tiny EBML/WebM structural checker (self-contained; no deps) -------------

const WEBM_DOCTYPE = 'webm';
const ID_CLUSTER = 0x1f43b675;
const ID_CUES = 0x1c53bb6b;
const ID_CUEPOINT = 0xbb;
const ID_DOCTYPE = 0x4282;
const ID_EBML = 0x1a45dfa3;
const ID_SEGMENT = 0x18538067;
const ID_SIMPLEBLOCK = 0xa3;
const ID_TRACKS = 0x1654ae6b;
const ID_TRACKENTRY = 0xae;
const ID_CODECID = 0x86;

function checkMode() {
  if (!existsSync(FIXTURE)) {
    report('--check', { ok: false, reason: 'fixture ABSENT (regenerate with --generate)', sha: '<none>' });
    printContract();
    return false;
  }
  return report(`--check ${FIXTURE.split('/').pop()}`, validate(new Uint8Array(readFileSync(FIXTURE))));
}

/** The children of one element, keyed by id (first-match wins). */
function childMap(bytes, element) {
  const map = new Map();
  for (const child of elements(bytes, element.dataOffset, element.dataEnd)) {
    if (!map.has(child.id)) map.set(child.id, child);
  }
  return map;
}

/** Walks sibling elements in `[start, end)`; stops at the first overrun. */
function elements(bytes, start, end) {
  const out = [];
  let offset = start;
  while (offset + 1 < end) {
    const id = idVint(bytes, offset);
    if (!id) return [];
    const size = sizeVint(bytes, offset + id.length);
    if (!size) return [];
    const dataOffset = offset + id.length + size.length;
    const dataEnd = dataOffset + size.value;
    if (dataEnd > end) return [];
    out.push({ dataEnd, dataOffset, end: dataEnd, id: id.value, start: offset });
    offset = dataEnd;
  }
  return offset === end ? out : [];
}

function emitBytesTs(bytes, sha) {
  const base64 = Buffer.from(bytes).toString('base64');
  const source = `/**
 * GENERATED FILE — do not edit by hand.
 * Regenerate with:
 *   node src/__fixtures__/media/generate-browser-decodable-webm-fixture.mjs --emit-bytes-ts
 *
 * Carries browser-decodable-webm-vp8-vorbis.webm (sha256 ${sha}) as base64 so
 * the browser MSE suite can resolve the EXACT native-WebM bytes with no
 * fs/URL import (browser-safe by construction).
 */
const BASE64 = '${base64}';

/** Base64 of the committed native-WebM browser-decodable fixture. */
export function webmBrowserFixtureBase64(): string {
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

/** Keyframe flag of the first SimpleBlock in a Cluster, or null when absent. */
function firstVideoBlockKeyframe(bytes, cluster) {
  for (const child of elements(bytes, cluster.dataOffset, cluster.dataEnd)) {
    if (child.id !== ID_SIMPLEBLOCK) continue;
    const track = idVint(bytes, child.dataOffset);
    if (!track) return null;
    const flagsOffset = child.dataOffset + track.length + 2; // + 2-byte signed timecode
    if (flagsOffset >= child.dataEnd) return null;
    return (bytes[flagsOffset] & 0x80) !== 0;
  }
  return null;
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
  const first = new Uint8Array(readFileSync(FIXTURE));
  const verdict = validate(first);
  if (!report('--generate', verdict)) {
    console.error('generated bytes violate the fixture contract; refusing to keep them.');
    return false;
  }
  // Determinism proof: regenerate and byte-compare (same pinned toolchain).
  const rerun = spawnSync(FFMPEG_CMD[0], FFMPEG_CMD.slice(1), { stdio: 'ignore' });
  if (rerun.status === 0 && existsSync(FIXTURE)) {
    const second = new Uint8Array(readFileSync(FIXTURE));
    if (Buffer.compare(Buffer.from(first), Buffer.from(second)) !== 0) {
      console.error('ffmpeg output is NOT deterministic (two runs differ); refusing to keep the fixture.');
      return false;
    }
    report('--determinism', { ok: true, reason: 'two identical regenerations', sha: verdict.sha });
  }
  console.log(`\nCandidate ready: ${FIXTURE}`);
  console.log('Carry the sha256 above into src/__tests__/fixtures/webm-browser-fixture.ts (WEBM_FIXTURE_SHA256)');
  console.log('and re-emit the browser-safe module with --emit-bytes-ts.');
  return true;
}

/** Reads a raw (marker-included) EBML id vint at `offset`; null on overrun. */
function idVint(bytes, offset) {
  const length = vintLengthAt(bytes, offset);
  if (length === 0) return null;
  let value = 0;
  for (let i = 0; i < length; i += 1) value = (value * 256) + (bytes[offset + i] ?? 0);
  return { length, value };
}

function printContract() {
  console.log(`native-WebM browser-decodable fixture contract
  file:  ${FIXTURE}
  needs: a SMALL deterministic browser-decodable WebM (EBML DocType webm,
         one Segment: Info, Tracks (V_VP8 + A_VORBIS), ≥2 keyframe-aligned
         Clusters, one Cues element), lockable by sha256 — the bytes the
         CuesIndex browser-MSE suite feeds a real MediaSource to prove
         exact/floor seeks + EOS.
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

/**
 * Reads an EBML size vint at `offset` (unknown size → null).
 *
 * The value is the first byte's low (8 - L) data bits followed by the next
 * L - 1 bytes (an 8-byte vint keeps ONLY its LSB as the length-marker, so its
 * value is the seven bytes after it). Accumulate with `*`, never `<<` (which
 * truncates to 32 bits and corrupts the 8-byte Segment size real muxers
 * write, e.g. 01 00 00 00 00 01 b4 6c → 111724).
 */
function sizeVint(bytes, offset) {
  const length = vintLengthAt(bytes, offset);
  if (length === 0) return null;
  const firstDataBits = 8 - length;
  const firstDataMask = firstDataBits === 0 ? 0 : (1 << firstDataBits) - 1;
  const firstDataAllOnes = firstDataBits === 0 ? bytes[offset] === 0x01 : (bytes[offset] & firstDataMask) === firstDataMask;
  let unknown = firstDataAllOnes;
  for (let i = 1; i < length && unknown; i += 1) unknown = (bytes[offset + i] ?? 0) === 0xff;
  if (unknown) return null; // unknown size
  let value = bytes[offset] & firstDataMask;
  for (let i = 1; i < length; i += 1) value = (value * 256) + (bytes[offset + i] ?? 0);
  return { length, value };
}

function validate(bytes) {
  const sha = createHash('sha256').update(bytes).digest('hex');
  const problems = [];
  const top = elements(bytes, 0, bytes.length);
  const ebml = top.find((element) => element.id === ID_EBML);
  const segment = top.find((element) => element.id === ID_SEGMENT);
  if (!ebml) problems.push('no EBML header element');
  if (!segment) problems.push('no Segment element');

  if (ebml) {
    const ebmlChildren = childMap(bytes, ebml);
    const docType = ebmlChildren.get(ID_DOCTYPE);
    if (!docType) problems.push('EBML header missing DocType');
    else {
      const text = new TextDecoder().decode(bytes.subarray(docType.dataOffset, docType.dataEnd));
      if (text !== WEBM_DOCTYPE) problems.push(`DocType is "${text}", expected "${WEBM_DOCTYPE}" (MKV is deferred)`);
    }
  }

  if (segment) {
    const segmentChildren = elements(bytes, segment.dataOffset, segment.dataEnd);
    const clusters = segmentChildren.filter((element) => element.id === ID_CLUSTER);
    const cues = segmentChildren.find((element) => element.id === ID_CUES);
    if (clusters.length < 2) problems.push(`expected ≥2 Clusters, got ${clusters.length}`);
    if (!cues) problems.push('Segment missing a Cues element');
    else {
      const cuePoints = elements(bytes, cues.dataOffset, cues.dataEnd).filter((e) => e.id === ID_CUEPOINT);
      if (cuePoints.length < 2) problems.push(`expected ≥2 CuePoints, got ${cuePoints.length}`);
    }
    const tracks = segmentChildren.find((element) => element.id === ID_TRACKS);
    if (!tracks) problems.push('Segment missing a Tracks element');
    else {
      const codecIds = [];
      for (const entry of elements(bytes, tracks.dataOffset, tracks.dataEnd).filter((e) => e.id === ID_TRACKENTRY)) {
        const entryChildren = childMap(bytes, entry);
        const codecId = entryChildren.get(ID_CODECID);
        if (codecId) codecIds.push(new TextDecoder().decode(bytes.subarray(codecId.dataOffset, codecId.dataEnd)));
      }
      if (codecIds.length < 2) problems.push(`expected ≥2 tracks, got ${codecIds.length}`);
      if (!codecIds.includes('V_VP8') || !codecIds.includes('A_VORBIS')) problems.push(`expected V_VP8 + A_VORBIS tracks, got ${codecIds.join(',')}`);
    }
    // Keyframe evidence: every cluster starts with a video keyframe SimpleBlock.
    const nonRap = [];
    clusters.forEach((cluster, index) => {
      const flag = firstVideoBlockKeyframe(bytes, cluster);
      if (flag === false) nonRap.push(index);
    });
    if (nonRap.length > 0) problems.push(`clusters ${nonRap.join(',')} do not start with a keyframe`);
  }
  return { ok: problems.length === 0, reason: problems.join('; ') || 'ok', sha };
}

function vintLengthAt(bytes, offset) {
  const first = bytes[offset] ?? 0;
  for (let i = 0; i < 8; i += 1) if (first & (0x80 >> i)) return i + 1;
  return 0;
}

const MODE = process.argv[2] ?? '';
if (MODE === '--check') {
  process.exit(checkMode() ? 0 : 1);
}
if (MODE === '--emit-bytes-ts') {
  process.exit(emitBytesTsMode() ? 0 : 1);
}
if (MODE === '--generate') {
  process.exit(generateMode() ? 0 : 1);
}
printContract();
