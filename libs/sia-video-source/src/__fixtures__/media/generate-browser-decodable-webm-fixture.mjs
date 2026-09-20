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
 * Cluster carries a video RAP) and a Cues element naming those Clusters — the
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
 * ≥1 Cues with ≥2 CuePoints, every cued Cluster carrying a video keyframe
 * SimpleBlock, complete elements, stable sha256) is rejected — never
 * fabricated.
 */
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
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
const ID_TRACKNUMBER = 0xd7;
const ID_TRACKTYPE = 0x83;
const ID_CUETRACKPOSITIONS = 0xb7;
const ID_CUECLUSTERPOSITION = 0xf1;

/** Assembles a Cluster of SimpleBlocks; returns the raw bytes plus the cluster element as `elements()` parses it. */
function buildCluster(blocks) {
  const payload = [];
  for (const block of blocks) payload.push(...block);
  const bytes = new Uint8Array([0x1f, 0x43, 0xb6, 0x75, 0x80 | payload.length, ...payload]);
  const [cluster] = elements(bytes, 0, bytes.length);
  return { bytes, cluster };
}

/** Builds one SimpleBlock: id, size vint, track vint, 2-byte timecode, flags, payload filler. */
function buildSimpleBlock(trackNumber, timecode, flags, dataBytes = 4) {
  const body = [0x80 | (trackNumber & 0x7f), (timecode >> 8) & 0xff, timecode & 0xff, flags & 0xff];
  for (let i = 0; i < dataBytes; i += 1) body.push(0xab);
  return new Uint8Array([ID_SIMPLEBLOCK, 0x80 | body.length, ...body]);
}

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

/** Segment-relative Cluster start named by each CuePoint, in Cues order. */
function cueClusterPositions(bytes, cues) {
  const positions = [];
  for (const cuePoint of elements(bytes, cues.dataOffset, cues.dataEnd)) {
    if (cuePoint.id !== ID_CUEPOINT) continue;
    for (const trackPositions of elements(bytes, cuePoint.dataOffset, cuePoint.dataEnd)) {
      if (trackPositions.id !== ID_CUETRACKPOSITIONS) continue;
      const position = childMap(bytes, trackPositions).get(ID_CUECLUSTERPOSITION);
      if (position) positions.push(elementInteger(bytes, position));
    }
  }
  return positions;
}

/** Unsigned integer carried by an element's payload (TrackNumber/TrackType). */
function elementInteger(bytes, element) {
  let value = 0;
  for (let o = element.dataOffset; o < element.dataEnd && o < bytes.length; o += 1) value = value * 256 + (bytes[o] ?? 0);
  return value;
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

/**
 * Keyframe flag of the first SimpleBlock belonging to `trackNumber` inside a
 * Cluster, or null when the cluster carries no such block — mirrors the
 * production reader `firstBlockKeyframe` in webm-probe.ts, so a keyframe bit
 * on an audio block can never vouch for the cluster's video random-access
 * start.
 */
function firstVideoBlockKeyframe(bytes, cluster, trackNumber) {
  for (const child of elements(bytes, cluster.dataOffset, cluster.dataEnd)) {
    if (child.id !== ID_SIMPLEBLOCK) continue;
    const flag = simpleBlockKeyframe(bytes, child, trackNumber);
    if (flag !== null) return flag;
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

/**
 * Reads a value vint at `offset` with its length marker stripped — the
 * SimpleBlock track-number encoding (a size vint per EBML framing, unlike the
 * id vints whose raw bytes are kept).
 */
function readValueVint(bytes, offset) {
  const length = vintLengthAt(bytes, offset);
  if (length === 0) return null;
  let value = 0;
  for (let i = 0; i < length; i += 1) {
    const b = bytes[offset + i] ?? 0;
    value = value * 256 + (i === 0 ? b & (0xff >> length) : b);
  }
  return { length, value };
}

function report(label, verdict) {
  console.log(`${label}: ${verdict.ok ? 'OK' : 'CONTRACT VIOLATION'}`);
  if (!verdict.ok) console.log(`  reason: ${verdict.reason}`);
  console.log(`  sha256 ${verdict.sha}`);
  return verdict.ok;
}

/**
 * Inspects one SimpleBlock: track number (value vint), 2-byte signed timecode,
 * then a flags byte whose 0x80 bit marks a keyframe. Returns null for a block
 * of a different track or a truncated header — mirrors the production reader
 * `simpleBlockKeyframe` in webm-probe.ts.
 */
function simpleBlockKeyframe(bytes, block, trackNumber) {
  const track = readValueVint(bytes, block.dataOffset);
  if (!track) return null;
  if (trackNumber !== null && track.value !== trackNumber) return null;
  const flagsOffset = block.dataOffset + track.length + 2; // + 2-byte signed timecode
  if (flagsOffset >= block.dataEnd) return null;
  return (bytes[flagsOffset] & 0x80) !== 0;
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
    // A missing Tracks/Cues element is a contract violation, not a crash:
    // the video-track lookup and the cued-cluster keyframe check both stay
    // silent here and let the recorded problems above speak.
    const videoNumber = tracks === undefined ? null : videoTrackNumber(bytes, tracks);
    if (videoNumber === null) problems.push('no video TrackEntry (TrackType 1) to keyframe-check against');
    // Keyframe evidence: every cluster the Cues index names must carry a
    // SimpleBlock of the VIDEO track whose keyframe bit is set — the cued
    // grid is what seeks resolve through. An audio block can carry the 0x80
    // bit without meaning anything for video random access (and this
    // muxer's clusters open on audio blocks), so the first block of any
    // track is never accepted as evidence.
    if (videoNumber !== null && cues) {
      const nonRap = [];
      const unmatched = [];
      for (const position of cueClusterPositions(bytes, cues)) {
        const index = clusters.findIndex((cluster) => cluster.start - segment.dataOffset === position);
        if (index === -1) {
          unmatched.push(position);
          continue;
        }
        if (firstVideoBlockKeyframe(bytes, clusters[index], videoNumber) !== true) nonRap.push(index);
      }
      if (unmatched.length > 0) problems.push(`CueClusterPositions ${unmatched.join(',')} match no Cluster`);
      if (nonRap.length > 0) problems.push(`cued clusters ${nonRap.join(',')} carry no video keyframe SimpleBlock`);
    }
  }
  return { ok: problems.length === 0, reason: problems.join('; ') || 'ok', sha };
}

// Exported for the generator's regression spec (src/__tests__/fixtures/
// generator-webm-fixture.spec.ts); the script stays a plain CLI otherwise.
export { buildCluster, buildSimpleBlock, firstVideoBlockKeyframe, simpleBlockKeyframe, validate };

/** Track number of the TrackEntry whose TrackType is 1 (video), or null. */
function videoTrackNumber(bytes, tracks) {
  for (const entry of elements(bytes, tracks.dataOffset, tracks.dataEnd)) {
    if (entry.id !== ID_TRACKENTRY) continue;
    const children = childMap(bytes, entry);
    const type = children.get(ID_TRACKTYPE);
    const number = children.get(ID_TRACKNUMBER);
    if (!type || !number) continue;
    if (elementInteger(bytes, type) === 1) return elementInteger(bytes, number);
  }
  return null;
}

function vintLengthAt(bytes, offset) {
  const first = bytes[offset] ?? 0;
  for (let i = 0; i < 8; i += 1) if (first & (0x80 >> i)) return i + 1;
  return 0;
}

// Test imports must not run the CLI dispatch; only real CLI invocations do.
const RUN_AS_CLI = process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
if (RUN_AS_CLI) {
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
}
