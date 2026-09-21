#!/usr/bin/env node
/* oxlint-disable typescript/no-unsafe-assignment, typescript/no-unsafe-member-access, typescript/no-unsafe-call, typescript/no-unsafe-argument, typescript/no-unsafe-return */
/**
 * Deterministic media characterization fixture generator.
 *
 * Builds the small structural container fixtures the package's
 * characterization tests read. Every byte is derived from the constants and
 * helpers below, so regenerating produces byte-identical files (see the sha256
 * manifest printed at the end and frozen in README.md).
 *
 * The fixtures are intentionally *structural*: they carry the top-level box /
 * element layout real files have so the container probe, classifier, and
 * existing index parsers (sidx) can run against tracked bytes, but they do NOT
 * contain decodable codec payloads. That is the honest scope; genuinely
 * decodable payload fixtures are produced separately by the ffmpeg-backed
 * generate-browser-decodable-*.mjs recipes and stay out of this script.
 *
 * Usage: node src/__fixtures__/media/generate.mjs
 */
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = dirname(fileURLToPath(import.meta.url));

// ---- generic byte helpers ---------------------------------------------------

const u16 = (value) => [(value >>> 8) & 0xff, value & 0xff];
const u32 = (value) => [(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff];

function concat(...parts) {
  const total = parts.reduce((sum, part) => sum + part.byteLength, 0);
  const out = new Uint8Array(total);
  let at = 0;
  for (const part of parts) {
    out.set(part, at);
    at += part.byteLength;
  }
  return out;
}

/** Fixed-length descriptor (values here are all < 0x80, so one byte suffices). */
function descriptor(tag, body) {
  return new Uint8Array([tag, body.length, ...body]);
}

// ---- ISOBMFF (MP4) shared pieces ---------------------------------------------

function fmp4NoSidx() {
  return concat(ftypBox(), isoBox('moov', mvhdBox()), fmp4Segment(0x11), fmp4Segment(0x22), fmp4Segment(0x33));
}

/** One moof(empty)+mdat(marker) "fragment" — the proven 5008-byte segment shape. */
function fmp4Segment(marker) {
  const mdat = isoBox('mdat', new Uint8Array(4992).fill(marker));
  return concat(isoBox('moof', []), mdat);
}

/** Eight top-level boxes plus a `free` filler of the given body size. */
function freeBox(bodySize) {
  return isoBox('free', new Uint8Array(bodySize));
}

/** ftyp with the ubiquitous isom minor/brands (still just "ftyp" to the probe). */
function ftypBox() {
  return isoBox('ftyp', [
    ...Array.from('isom', (char) => char.charCodeAt(0)),
    ...u32(0x00000200),
    ...Array.from('isom', (char) => char.charCodeAt(0)),
    ...Array.from('iso2', (char) => char.charCodeAt(0)),
    ...Array.from('avc1', (char) => char.charCodeAt(0)),
    ...Array.from('mp41', (char) => char.charCodeAt(0)),
  ]);
}

/** FullBox (version 0 + flags 0) wrapper around an existing body. */
function fullIsoBox(type, body) {
  return isoBox(type, [0, 0, 0, 0, ...body]);
}

function hexBytes(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let index = 0; index < out.length; index += 1) {
    out[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return out;
}

function indexedFmp4() {
  const segmentLength = 5008;
  return concat(ftypBox(), isoBox('moov', mvhdBox()), sidxBox(segmentLength), fmp4Segment(0x11), fmp4Segment(0x22), fmp4Segment(0x33));
}

function isoBox(type, body) {
  const size = body.length + 8;
  return new Uint8Array([...u32(size), ...Array.from(type, (char) => char.charCodeAt(0)), ...body]);
}

/** avc1 visual sample entry carrying the real BBB AVC decoder configuration. */
function mediabunnyAvc1Entry() {
  return isoBox('avc1', [
    ...new Uint8Array(6), ...u16(1), // reserved + data_reference_index 1
    ...u16(0), ...u16(0), ...new Uint8Array(12), // pre_defined + reserved
    ...u16(320), ...u16(240), // width, height
    ...u32(0x00480000), ...u32(0x00480000), ...u32(0), // resolutions + reserved
    ...u16(1), ...new Uint8Array(32), ...u16(0x0018), ...u16(0xffff), // frame_count, name, depth
    ...hexBytes(REAL_AVC1_AVCC_HEX),
  ]);
}

/** Minimal ES_Descriptor for AAC-LC 44.1 kHz stereo (ASC 0x12 0x10). */
function mediabunnyEsds() {
  const decSpecific = descriptor(0x05, [0x12, 0x10]); // AudioSpecificConfig
  const decConfig = descriptor(0x04, [0x40, 0x15, 0, 0, 0, ...u32(0), ...u32(0), ...decSpecific]);
  const slConfig = descriptor(0x06, [0x02]);
  return descriptor(0x03, [...u16(1), 0x00, ...decConfig, ...slConfig]); // ES_Descriptor
}

function mediabunnyMp4() {
  const mvhd = mediabunnyMvhd();
  const video = mediabunnyTrak('video', { duration: 120_000, height: 240, samples: [100, 100, 100, 100], timescale: 1000, trackId: 1, width: 320 });
  const audio = mediabunnyTrak('audio', { duration: 5_292_000, height: 0, samples: [60, 60, 60, 60], timescale: 44_100, trackId: 2, width: 0 });
  const moov = isoBox('moov', concat(mvhd, video.trak, audio.trak));
  const head = concat(ftypBox(), moov);
  const mdat = isoBox('mdat', new Uint8Array(4 * 100 + 4 * 60 + 512).fill(0xab));
  const mdatPayload = head.length + 8;
  const videoBytes = 4 * 100;
  // trak children start after ftyp + moov header; video trak is moov's second child.
  const ftypLength = ftypBox().length;
  const videoTrakStart = ftypLength + 8 + mvhd.length;
  const audioTrakStart = videoTrakStart + video.trak.length;
  patchStcoEntry(head, videoTrakStart + video.stcoEntryOffsetInTrak, mdatPayload);
  patchStcoEntry(head, audioTrakStart + audio.stcoEntryOffsetInTrak, mdatPayload + videoBytes);
  return concat(head, mdat);
}


/** mp4a audio sample entry with a minimal AAC-LC (mp4a.40.2) ES descriptor. */
function mediabunnyMp4aEntry() {
  return isoBox('mp4a', [
    ...new Uint8Array(6), ...u16(1), // reserved + data_reference_index 1
    ...u16(0), ...u16(0), ...u32(0), // version, revision, vendor
    ...u16(2), ...u16(16), ...u16(0), ...u16(0), // channels 2, 16-bit, compression, packet
    ...u32(44_100 << 16), // samplerate 44100 as 16.16
    ...fullIsoBox('esds', mediabunnyEsds()),
  ]);
}

/** mvhd at timescale 1000 spanning 120 s (timescale + duration locked to the traks). */
function mediabunnyMvhd() {
  return fullIsoBox('mvhd', [
    ...u32(0), ...u32(0), ...u32(1000), ...u32(120_000),
    ...u32(0x00010000), 0x01, 0x00, 0x00, 0x00, ...new Uint8Array(8),
    0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ...new Uint8Array(24), ...u32(3),
  ]);
}

/** stsd with one real sample entry: avc1 (avcC) for video, mp4a (esds) for audio. */
function mediabunnyStsd(kind) {
  return fullIsoBox('stsd', [...u32(1), ...(kind === 'video' ? mediabunnyAvc1Entry() : mediabunnyMp4aEntry())]);
}

/** tkhd for the mediabunny trak (flags 7: in-movie | in-preview). */
function mediabunnyTkhd({ duration, height, trackId, width }) {
  return fullIsoBox('tkhd', [
    0, 0, 0, 7, ...u32(0), ...u32(0), ...u32(trackId), ...u32(0), ...u32(duration), ...new Uint8Array(8),
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ...u32((width << 16) >>> 0), ...u32((height << 16) >>> 0),
  ]);
}

/** One real sample-table-backed trak (fixed samples, patched stco chunk offset). */
function mediabunnyTrak(kind, { duration, height, samples, timescale, trackId, width }) {
  const mdhd = fullIsoBox('mdhd', [...u32(0), ...u32(0), ...u32(timescale), ...u32(duration), 0x55, 0xc4, 0, 0]);
  const hdlr = fullIsoBox('hdlr', [0, 0, 0, 0, ...str4(kind === 'video' ? 'vide' : 'soun'), ...new Uint8Array(12)]);
  const stsd = mediabunnyStsd(kind);
  const stts = fullIsoBox('stts', [...u32(1), ...u32(samples.length), ...u32(Math.round(duration / samples.length))]);
  const stsc = fullIsoBox('stsc', [...u32(1), ...u32(1), ...u32(samples.length), ...u32(1)]);
  const stsz = fullIsoBox('stsz', [...u32(0), ...u32(samples.length), ...samples.flatMap((size) => u32(size))]);
  const stco = fullIsoBox('stco', [...u32(1), ...u32(0)]); // placeholder value patched once mdat sits
  const stbl = isoBox('stbl', concat(stsd, stts, stsc, stsz, stco));
  const mediaHeader = kind === 'video' ? fullIsoBox('vmhd', [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0]) : fullIsoBox('smhd', [0, 0, 0, 0, 0, 0]);
  const dinf = isoBox('dinf', fullIsoBox('dref', [...u32(1), ...isoBox('url ', [0, 0, 0, 1])]));
  const minf = isoBox('minf', concat(mediaHeader, dinf, stbl));
  const tkhd = mediabunnyTkhd({ duration, height, trackId, width });
  const mdia = isoBox('mdia', concat(mdhd, hdlr, minf));
  const trak = isoBox('trak', concat(tkhd, mdia));
  // Relative offset of the single stco chunk_offset entry inside this trak:
  // trak(8) + tkhd + mdia(8) + mdhd + hdlr + minf(8) + mediaHeader + dinf
  //   + stbl(8) + stsd + stts + stsc + stsz + stco(8) + fullbox(4) + count(4)
  const stcoEntryOffsetInTrak =
    8 + tkhd.length +
    8 + mdhd.length + hdlr.length +
    8 + mediaHeader.length + dinf.length +
    8 + stsd.length + stts.length + stsc.length + stsz.length +
    8 + 4 + 4;
  return { stcoEntryOffsetInTrak, trak };
}

/** mvhd v0: timescale 1000, duration 90000 => a 90 s presentation. */
function mvhdBox() {
  return isoBox('mvhd', [
    0, 0, 0, 0, // version 0 + flags
    ...u32(0), // creation_time
    ...u32(0), // modification_time
    ...u32(1000), // timescale
    ...u32(90_000), // duration
    ...u32(0x00010000), // rate 1.0
    0x01, 0x00, // volume 1.0
    0x00, 0x00, // reserved
    ...new Uint8Array(8), // reserved
    0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x00, // matrix
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // matrix
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // matrix
    ...new Uint8Array(24), // pre_defined (six zero u32)
    ...u32(1), // next_track_ID
  ]);
}

/** Overwrites a u32 BE entry inside a mutable byte array at an absolute offset. */
function patchStcoEntry(bytes, offset, value) {
  const encoded = u32(value);
  for (let index = 0; index < 4; index += 1) bytes[offset + index] = encoded[index];
}

function progressiveFront() {
  return concat(ftypBox(), progressiveMoov(), isoBox('mdat', new Uint8Array(512).fill(0xab)));
}

/** moov with one video track (layout only; no decodable samples). */
function progressiveMoov() {
  const mdhd = isoBox('mdhd', [0, 0, 0, 0, ...u32(0), ...u32(0), ...u32(1000), ...u32(90_000), 0x55, 0xc4, 0, 0]);
  const hdlr = isoBox('hdlr', [0, 0, 0, 0, 0, 0, 0, 0, ...Array.from('vide', (char) => char.charCodeAt(0)), ...new Uint8Array(12)]);
  const minf = isoBox('minf', stblBoxes());
  const mdia = isoBox('mdia', concat(mdhd, hdlr, minf));
  const tkhd = isoBox('tkhd', [
    0, 0, 0, 7, // version 0 + flags (enabled | in-movie | in-preview)
    ...u32(0), // creation_time
    ...u32(0), // modification_time
    ...u32(1), // track_ID
    ...u32(0), // reserved
    ...u32(90_000), // duration
    ...new Uint8Array(8), // reserved
    0, 0, // layer
    0, 0, // alternate_group
    0x00, 0x00, // volume (0 for this reserved track)
    0, 0, // reserved
    0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x00, // matrix
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // matrix
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // matrix
    ...u32(0x01400000), // width 320.0
    ...u32(0x00f00000), // height 240.0
  ]);
  const trak = isoBox('trak', concat(tkhd, mdia));
  return isoBox('moov', concat(mvhdBox(), trak));
}

function progressiveTail() {
  // moov lives after mdat — the layout a refragment producer must tail-read.
  return concat(ftypBox(), freeBox(64), isoBox('mdat', new Uint8Array(512).fill(0xab)), progressiveMoov());
}

/**
 * Top-level sidx with three 30 s RAP references of `segmentLength` bytes.
 * Mirrors the pixel-for-pixel proven layout of `boundedIndexedFmp4Payload`.
 */
function sidxBox(segmentLength) {
  const entry = [...u32(segmentLength), ...u32(30_000), 0x80, 0, 0, 0];
  return isoBox('sidx', [
    0, 0, 0, 0, // version 0 + flags
    ...u32(1), // reference_ID
    ...u32(1000), // timescale
    ...u32(0), // earliest_presentation_time
    ...u32(0), // first_offset
    ...u16(0), // reserved
    ...u16(3), // reference_count
    ...entry, ...entry, ...entry,
  ]);
}

/** Minimal progressive-MP4 sample-table skeleton (no samples; layout only). */
function stblBoxes() {
  const emptyCount = [0, 0, 0, 0, ...u32(0)];
  const stsd = isoBox('stsd', [0, 0, 0, 0, ...u32(0)]); // zero sample descriptions
  const stts = isoBox('stts', emptyCount);
  const stsc = isoBox('stsc', emptyCount);
  const stsz = isoBox('stsz', [0, 0, 0, 0, ...u32(0), ...u32(0)]);
  const stco = isoBox('stco', emptyCount);
  const stbl = isoBox('stbl', concat(stsd, stts, stsc, stsz, stco));
  const dref = isoBox('dref', [0, 0, 0, 0, ...u32(1), ...isoBox('url ', [0, 0, 0, 1])]);
  const dinf = isoBox('dinf', dref);
  const vmhd = isoBox('vmhd', [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0]);
  return concat(vmhd, dinf, stbl);
}

function str4(text) {
  return Array.from(text, (char) => char.charCodeAt(0));
}

/** Real H.264 decoder configuration extracted from the demo BBB fixture (High L4.2). */
const REAL_AVC1_AVCC_HEX = '000000356176634301640032ffe1001b67640032ac7284405005bb0110000003001000000303c0f183184601000768e843874b22c0';

/** Builds one 188-byte TS packet with the given PID / PUSI / continuity / payload. */
function tsPacket({ continuity, payload, pid, pusi }) {
  const packet = new Uint8Array(188).fill(0xff);
  packet[0] = 0x47; // sync byte
  packet[1] = (pusi ? 0x40 : 0) | ((pid >> 8) & 0x1f);
  packet[2] = pid & 0xff;
  packet[3] = 0x10 | (continuity & 0x0f); // payload only, no scramble/adaptation
  packet.set(payload.subarray(0, 184), 4);
  return packet;
}

/**
 * Minimal structural PSI + PES packets: PAT, PMT (H.264 video PID 0x100, AAC
 * audio PID 0x101), one video PES starting with an H.264 AUD NAL, and one
 * audio PES. CRC fields are zeroed (structural only).
 */
function tsStream() {
  const pat = tsPacket({
    continuity: 0,
    payload: new Uint8Array([
      0x00, // pointer_field
      0x00, // table_id: PAT
      0xb0, 0x0d, // section_length = 13
      0x00, 0x01, // transport_stream_id
      0xc1, 0x00, // version 0, current; section_number
      0x00, // last_section_number
      0x00, 0x01, // program_number 1
      0xe1, 0x00, // PMT PID 0x1000
      0x00, 0x00, 0x00, 0x00, // CRC (zeros)
    ]),
    pid: 0x0000,
    pusi: true,
  });

  const pmt = tsPacket({
    continuity: 0,
    payload: new Uint8Array([
      0x00, // pointer_field
      0x02, // table_id: PMT
      0xb0, 0x17, // section_length = 23
      0x00, 0x01, // program_number
      0xc1, 0x00, // version 0, current; section_number
      0x00, // last_section_number
      0xe1, 0x00, // PCR_PID 0x0100
      0xf0, 0x00, // program_info_length 0
      0x1b, 0xe1, 0x00, 0xf0, 0x00, // H.264 video, PID 0x100, no ES info
      0x0f, 0xe1, 0x01, 0xf0, 0x00, // AAC audio, PID 0x101, no ES info
      0x00, 0x00, 0x00, 0x00, // CRC (zeros)
    ]),
    pid: 0x1000,
    pusi: true,
  });

  const videoPes = (() => {
    const payload = new Uint8Array(170).fill(0x42); // filler
    payload.set([0x00, 0x00, 0x00, 0x01, 0x09, 0xf0], 0); // AUD NAL
    const header = [
      0x00, 0x00, 0x01, 0xe0, // start code + video stream_id
      0x00, 0xb1, // PES_packet_length = 0x7 + 0xaa = 177
      0x80, 0x80, // data_alignment_indicator + PTS-only
      0x21, 0x00, 0x01, 0x00, 0x01, // PTS = 0
    ];
    return new Uint8Array([...header, ...payload]);
  })();

  const audioPes = (() => {
    const payload = new Uint8Array(6);
    payload.set([0xff, 0xf1, 0x50, 0x00, 0x1f, 0xfc], 0); // ADTS header prefix
    return new Uint8Array([
      0x00, 0x00, 0x01, 0xc0, // start code + audio stream_id
      0x00, 0x0d, // PES_packet_length = 13
      0x80, 0x80, // flags
      0x21, 0x00, 0x01, 0x00, 0x01, // PTS = 0
      ...payload,
    ]);
  })();

  return concat(
    pat,
    pmt,
    tsPacket({ continuity: 0, payload: videoPes, pid: 0x0100, pusi: true }),
    tsPacket({ continuity: 0, payload: audioPes, pid: 0x0101, pusi: true }),
  );
}

// ---- emit ---------------------------------------------------------------------

const FIXTURES = {
  'fmp4-nosidx.bin': fmp4NoSidx,
  'indexed-fmp4.bin': indexedFmp4,
  'mediabunny-mp4.bin': mediabunnyMp4,
  'progressive-mp4-front.bin': progressiveFront,
  'progressive-mp4-tail.bin': progressiveTail,
  'ts.bin': tsStream,
};

const manifest = [];
for (const [name, build] of Object.entries(FIXTURES)) {
  const bytes = build();
  writeFileSync(join(OUT, name), bytes);
  const sha = createHash('sha256').update(bytes).digest('hex');
  manifest.push({ bytes: bytes.length, name, sha });
  console.log(`${name}\t${bytes.length}B\tsha256=${sha}`);
}
