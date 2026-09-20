/**
 * Deterministic progressive-MP4 fixture for the mediabunny producer: a
 * moov-first progressive MP4 with DISTINCT track ids (video `tkhd` id 1, audio
 * id 2), real avc1/mp4a sample entries (real BBB AVC decoder config + the BBB
 * AAC ES descriptor), real sample tables, a video `stss` RAP grid, and REAL
 * MSE-parseable sample payloads.
 *
 * Real files always carry unique track ids (a duplicate id makes track
 * identity ambiguous for demuxers and for the producer's fragmented output);
 * this builder is the de-duplicated, multi-second shape the producer and its
 * appendability tests need, and these bytes carry the same real structure.
 *
 * The sample payloads are byte-exact AVC/AAC packets extracted from a real BBB
 * progressive file — the IDR slice that anchors each RAP, a small P-slice for
 * the inter-frame samples, and a full AAC-LC raw frame for the audio track
 * (AAC-LC 44.1 kHz stereo, matching the fixture's `esds` AudioSpecificConfig
 * `0x1210`). They are REQUIRED for real MSE: Chromium/Firefox demux the
 * length-prefixed AVC NALs and the AAC frame headers during append, so opaque
 * filler (`0xab`) makes a SourceBuffer fire a fatal `error` event. Repeating
 * real frames keeps the fixture self-contained (no encoder, no external
 * tooling) while staying container-and-demux valid; mediabunny's packet-copy
 * mux can
 * refragment them without decoding.
 */
export interface ProgressiveMp4FixtureOptions {
  /** mp4a frame payload override (defaults to the real BBB AAC-LC frame). */
  readonly audioFrame?: Uint8Array;
  /** Audio `tkhd` track id (defaults to 2, a distinct positive id). */
  readonly audioTrackId?: number;
  /** Seconds of media; drives sample counts at 30fps / 44.1kHz 1024-frame audio. */
  readonly seconds?: number;
  /** RAP anchors every N video samples (default 15 = 0.5 s at 30 fps). */
  readonly syncInterval?: number;
  /** 1-based video sample indices to mark as RAP anchors in `stss` (default every {@link PROGRESSIVE_MP4_DEFAULT_SYNC_INTERVAL}). */
  readonly syncSamples?: readonly number[];
  /** avc1 P-slice payload for non-anchor video samples (defaults to a real BBB inter-frame AU). */
  readonly videoDeltaFrame?: Uint8Array;
  /** avc1 IDR slice payload for RAP anchors (defaults to the real BBB keyframe AU). */
  readonly videoRapFrame?: Uint8Array;
  /** Video `tkhd` track id (defaults to 1, a distinct positive id). */
  readonly videoTrackId?: number;
}

const REAL_AVC1_AVCC_HEX = '000000356176634301640032ffe1001b67640032ac7284405005bb0110000003001000000303c0f183184601000768e843874b22c0';

/** Default RAP cadence: a real IDR every 0.5 s keeps fragments seekable. */
export const PROGRESSIVE_MP4_DEFAULT_SYNC_INTERVAL = 15;

/**
 * Real BBB AVC keyframe access unit (1058 B): one 1054-byte IDR slice NAL
 * (`0x25` = nal_unit_type 5 → keyframe). Received as the first video sample of
 * the real progressive file, so it is a self-contained RAP anchor.
 */
export const PROGRESSIVE_MP4_REAL_IDR_AU = hexBytes(
  '0000041e25b84005dffef527f814d4d4142340bd0619ac54b7fc540bbb3d99361e8001c8566237000003000362134a20166962c63a27011bd6931f1fb9bcd15bc8c631a7c57a1fd31ce218c7cf8d499b19bb63e5902bc163b9ed9d484853a0f53eb96c210069c98e0701070381c0e068a070381c170440e070381c0e070381c0e070381c0e070381c0e0705a841c0e070381c0e070381c0e070381c0e070381c0e07cb50381c0e070381c0e070381c0e070381c0e070381c15be381c0e070381c0e070381c0e070381c0e070381c0e550e070381c0e070381c0e070381c0e070381c0e07038550e070381c0e070381c0e070381c0e070381c0e07038534381c0e070381c0e070381c0e070381c0e070381c0e4810381c0e070381c0e070381c0e070381c0e070381c13fdc0e070381c0e070381c0e070381c0e070381c0e0709501c0e070381c0e070381c0e070381c0e070381c0e077b8e070381c0e070381c0e070381c0e070381c0e07038e81c0e070381c0e070381c0e070381c0e070381c0e071ce381c0e070381c0e070381c0e070381c0e070381c0de1c70381c0e070381c0e070381c0e070381c0e070381bb98e070381c0e070381c0e070381c0e070381c0e07037841c0e070381c0e070381c0e070381c0e070381c0e06f1c0e070381c0e070381c0e070381c0e070381c0e07035881c0e070381c0e070381c0e070381c0e070381c0e06b140e070381c0e070381c0e070381c0e070381c0e0702c8e070381c0e070381c0e070381c0e070381c0e07037fd01c0e070381c0e070381c0e070381c0e070381c0e06bc70381c0e070381c0e070381c0e070381c0e070381bfde381c0e070381c0e070381c0e070381c0e070381c0de7e070381c0e070381c0e070381c0e070381c0e070381851c0e070381c0e070381c0e070381c0e070381c0e06f590381c0e070381c0e070381c0e070381c0e070381c0bcb81c0e070381c0e070381c0e070381c0e070381c0e00481c0e070381c0e070381c0e070381c0e070381c0e05ec70381c0e070381c0e070381c0e070381c0e070381bdcf0381c0e070381c0e070381c0e070381c0e070381c02b0381c0e070381c0e070381c0e070381c0e070381c0c60e070381c0e070381c0e070381c0e070381c0e07037c9e070381c0e070381c0e070381c0e070381c0e07038016070381c0e070381c0e070381c0e070381c0e07038195070381c0e070381c0e070381c0e070381c0e070381b8870381c0e070381c0e070381c0e070381c0e070381be270381c0e070381c0e070381c0e070381c0e070381c0230381c0e070381c0e070381c0e070381c0e070381c0c68e070381c0e070381c0e070381c0e070381c0e07037d4e070381c0e070381c0e070381c0e070381c0e0703806a070381c0e070381c0e070381c0e070381c0e07038193070381c0e070381c0e070381c0e070381c0e070382124a',
);

/** Real BBB AVC non-keyframe access unit (38 B): a 34-byte P-slice NAL with emulation-prevention bytes. */
export const PROGRESSIVE_MP4_REAL_DELTA_AU = hexBytes(
  '0000002201a907c897ffeae047c000000300000300000300000300000300000300000300ee92',
);

/** Real BBB AAC-LC raw frame (371 B, 44.1 kHz stereo — matches the fixture's `esds`). */
export const PROGRESSIVE_MP4_REAL_AAC_FRAME = hexBytes(
  '21000500a01bffc00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000037a700000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000007b',
);

/** Decodes a flat hex string into bytes. */
function hexBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let index = 0; index < out.length; index += 1) {
    out[index] = parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return out;
}

const u16 = (value: number) => [value >>> 8, value & 255];
const u32 = (value: number) => [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];

/**
 * Builds a deterministic moov-first progressive MP4. Defaults to 6 s of media:
 * video at 30 fps (timescale 90000, 90000/30 = 3000 per sample) interleaved
 * with AAC audio at 1024-frame granularity (timescale 44100, AAC-LC stereo).
 *
 * Payloads are REAL frames (see the header): every RAP-anchor video sample
 * carries the real BBB IDR access unit, the in-between samples carry a real
 * BBB P-slice, and every audio sample carries a real BBB AAC-LC frame. The
 * `stss` grid (every {@link PROGRESSIVE_MP4_DEFAULT_SYNC_INTERVAL} video
 * sample, 1-based) tells the demuxers and MSE which samples are RAP anchors,
 * so the multi-second span yields genuinely seekable aligned fragments that
 * the browser demuxers accept.
 */
export function progressiveMp4Fixture(options: ProgressiveMp4FixtureOptions = {}): Uint8Array {
  const seconds = options.seconds ?? 6;
  const syncInterval = options.syncInterval ?? PROGRESSIVE_MP4_DEFAULT_SYNC_INTERVAL;
  const videoCount = seconds * 30;
  const syncSamples = Array.from({ length: videoCount }, (_, index) => index + 1).filter(
    (sampleIndex) => (sampleIndex - 1) % syncInterval === 0,
  );
  const videoRapFrame = options.videoRapFrame ?? PROGRESSIVE_MP4_REAL_IDR_AU;
  const videoDeltaFrame = options.videoDeltaFrame ?? PROGRESSIVE_MP4_REAL_DELTA_AU;
  const audioFrame = options.audioFrame ?? PROGRESSIVE_MP4_REAL_AAC_FRAME;
  const overrideSync = options.syncSamples;
  const syncSet = new Set(overrideSync ?? syncSamples);

  const videoPayloads = Array.from({ length: videoCount }, (_, index) =>
    syncSet.has(index + 1) ? videoRapFrame : videoDeltaFrame,
  );
  const audioCount = Math.round(seconds * (44_100 / 1024));
  const audioPayloads = Array.from({ length: audioCount }, () => audioFrame);
  const videoSizes = videoPayloads.map((payload) => payload.byteLength);
  const audioSizes = audioPayloads.map((payload) => payload.byteLength);

  const VIDEO_TIMESCALE = 90_000;
  const VIDEO_DURATION_PER_SAMPLE = Math.round(VIDEO_TIMESCALE / 30); // 3000 @ 30fps
  const AUDIO_TIMESCALE = 44_100;
  const AUDIO_DURATION_PER_SAMPLE = 1024;
  const videoTrackId = options.videoTrackId ?? 1;
  const audioTrackId = options.audioTrackId ?? 2;
  const video = sampleTrack('video', videoTrackId, videoSizes, VIDEO_DURATION_PER_SAMPLE, VIDEO_TIMESCALE, [...syncSet].sort((a, b) => a - b));
  const audio = sampleTrack('audio', audioTrackId, audioSizes, AUDIO_DURATION_PER_SAMPLE, AUDIO_TIMESCALE);
  const totalVideoBytes = videoSizes.reduce((sum, size) => sum + size, 0);
  const moov = isoBox('moov', concat(authMvhd(seconds), video.trak, audio.trak));
  const head = concat(ftypBox(), moov);
  const mdatBody = concat(...videoPayloads, ...audioPayloads);
  const mdat = isoBox('mdat', mdatBody);
  const mdatPayload = head.byteLength + 8;
  const ftypLength = ftypBox().byteLength;
  const videoTrakStart = ftypLength + 8 + authMvhd(seconds).byteLength;
  const audioTrakStart = videoTrakStart + video.trak.byteLength;
  patchStcoEntry(head, videoTrakStart + video.stcoEntryOffsetInTrak, mdatPayload);
  patchStcoEntry(head, audioTrakStart + audio.stcoEntryOffsetInTrak, mdatPayload + totalVideoBytes);
  return concat(head, mdat);
}

function authMvhd(durationSeconds: number): Uint8Array {
  return fullIsoBox('mvhd', [
    ...u32(0), ...u32(0), ...u32(1000), ...u32(durationSeconds * 1000),
    ...u32(0x00010000), 0x01, 0x00, 0x00, 0x00, ...new Uint8Array(8),
    0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x40, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ...new Uint8Array(24), ...u32(3),
  ]);
}

function avc1Entry(): Uint8Array {
  const avcC = new Uint8Array(REAL_AVC1_AVCC_HEX.match(/../g)!.map((byte) => parseInt(byte, 16)));
  return isoBox('avc1', [
    ...new Uint8Array(6), ...u16(1),
    ...u16(0), ...u16(0), ...new Uint8Array(12),
    ...u16(320), ...u16(240),
    ...u32(0x00480000), ...u32(0x00480000), ...u32(0),
    ...u16(1), ...new Uint8Array(32), ...u16(0x0018), ...u16(0xffff),
    ...avcC,
  ]);
}

function concat(...parts: readonly (readonly number[] | Uint8Array)[]): Uint8Array {
  const arrays = parts.map((p) => (p instanceof Uint8Array ? p : new Uint8Array(p)));
  const total = arrays.reduce((sum, part) => sum + part.byteLength, 0);
  const out = new Uint8Array(total);
  let at = 0;
  for (const part of arrays) {
    out.set(part, at);
    at += part.byteLength;
  }
  return out;
}

function descriptor(tag: number, body: readonly number[]): number[] {
  return [tag, body.length, ...body];
}

function esds(): number[] {
  const decSpecific = descriptor(0x05, [0x12, 0x10]);
  const decConfig = descriptor(0x04, [0x40, 0x15, 0, 0, 0, ...u32(0), ...u32(0), ...decSpecific]);
  const slConfig = descriptor(0x06, [0x02]);
  return descriptor(0x03, [...u16(1), 0x00, ...decConfig, ...slConfig]);
}

function ftypBox(): Uint8Array {
  return isoBox('ftyp', [
    ...str4('isom'), ...u32(0x00000200), ...str4('isom'), ...str4('iso2'), ...str4('avc1'), ...str4('mp41'),
  ]);
}

function fullIsoBox(type: string, body: readonly number[] | Uint8Array): Uint8Array {
  return isoBox(type, new Uint8Array([0, 0, 0, 0, ...(body instanceof Uint8Array ? Array.from(body) : body)]));
}

function isoBox(type: string, body: readonly number[] | Uint8Array): Uint8Array {
  const bodyBytes = body instanceof Uint8Array ? body : new Uint8Array(body);
  const size = bodyBytes.byteLength + 8;
  const out = new Uint8Array(size);
  const view = new DataView(out.buffer);
  view.setUint32(0, size);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(bodyBytes, 8);
  return out;
}

function mp4aEntry(): Uint8Array {
  return isoBox('mp4a', [
    ...new Uint8Array(6), ...u16(1),
    ...u16(0), ...u16(0), ...u32(0),
    ...u16(2), ...u16(16), ...u16(0), ...u16(0),
    ...u32((44_100 << 16) >>> 0),
    ...fullIsoBox('esds', esds()),
  ]);
}

/** Patches a single `stco` chunk_offset absolute value (32-bit) in place. */
function patchStcoEntry(bytes: Uint8Array, offset: number, value: number): void {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  view.setUint32(offset, value);
}

function sampleTrack(
  kind: 'audio' | 'video',
  trackId: number,
  sizes: readonly number[],
  durationPerSample: number,
  timescale: number,
  syncSamples?: readonly number[],
): { stcoEntryOffsetInTrak: number; trak: Uint8Array } {
  const totalDuration = sizes.length * durationPerSample;
  const mdhd = fullIsoBox('mdhd', [...u32(0), ...u32(0), ...u32(timescale), ...u32(totalDuration), 0x55, 0xc4, 0, 0]);
  // hdlr is a FullBox (v0/flags + pre_defined + handler_type + 12 B reserved)
  // followed by a null-terminated UTF-8 `name` field. Real files carry a
  // C-string name, and a strict parser can mis-read an hdlr that ends right
  // after reserved — keep the real shape so the emitted init segment is
  // unambiguous.
  const handlerName = kind === 'video' ? 'VideoHandler' : 'SoundHandler';
  const hdlr = fullIsoBox('hdlr', [0, 0, 0, 0, ...str4(kind === 'video' ? 'vide' : 'soun'), ...new Uint8Array(12), ...Array.from(handlerName, (char) => char.charCodeAt(0)), 0]);
  const stsdBox = stsd(kind);
  const stts = fullIsoBox('stts', [...u32(1), ...u32(sizes.length), ...u32(durationPerSample)]);
  const stsc = fullIsoBox('stsc', [...u32(1), ...u32(1), ...u32(sizes.length), ...u32(1)]);
  const stsz = fullIsoBox('stsz', [...u32(0), ...u32(sizes.length), ...sizes.flatMap((size) => u32(size))]);
  const stss = syncSamples?.length
    ? fullIsoBox('stss', [...u32(syncSamples.length), ...syncSamples.flatMap((index) => u32(index))])
    : null;
  const stco = fullIsoBox('stco', [...u32(1), ...u32(0)]);
  const stblBody = concat(stsdBox, stts, stsc, stsz, ...(stss ? [stss] : []), stco);
  const stbl = isoBox('stbl', stblBody);
  const mediaHeader = kind === 'video' ? fullIsoBox('vmhd', [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0]) : fullIsoBox('smhd', [0, 0, 0, 0, 0, 0]);
  const dinf = isoBox('dinf', fullIsoBox('dref', [...u32(1), ...isoBox('url ', [0, 0, 0, 1])]));
  const minf = isoBox('minf', concat(mediaHeader, dinf, stbl));
  const tkhdBox = tkhd(trackId, totalDuration, kind === 'video' ? 320 : 0, kind === 'video' ? 240 : 0);
  const mdia = isoBox('mdia', concat(mdhd, hdlr, minf));
  const trak = isoBox('trak', concat(tkhdBox, mdia));

  // Byte offset of the stco `chunk_offset` entry, 0-relative to the trak box,
  // computed from the actual assembled layout: trak(8) tkhd mdia(8) mdhd hdlr
  // minf(8) vmhd/smhd dinf stbl(8) [stsd stts stsc stsz (stss)] stco(8+4+4).
  let trakRelative = 0;
  const boxesBeforeStco = [tkhdBox, mdhd, hdlr, mediaHeader, dinf, stsdBox, stts, stsc, stsz, ...(stss ? [stss] : [])];
  trakRelative += 8; // trak header
  for (const box of boxesBeforeStco) trakRelative += box.byteLength;
  trakRelative += 8; // mdia header
  trakRelative += 8; // minf header
  trakRelative += 8; // stbl header
  trakRelative += 8 + 4 + 4; // stco header + version/flags + entry_count
  return { stcoEntryOffsetInTrak: trakRelative, trak };
}

function str4(text: string): number[] {
  return Array.from(text, (char) => char.charCodeAt(0));
}

function stsd(kind: 'audio' | 'video'): Uint8Array {
  return fullIsoBox('stsd', [...u32(1), ...(kind === 'video' ? avc1Entry() : mp4aEntry())]);
}

function tkhd(trackId: number, duration: number, width: number, height: number): Uint8Array {
  // tkhd is a FullBox: the `0,0,0,7` prefix IS its version+flags (in-movie |
  // in-preview). fullIsoBox would double-add version+flags and shift track_ID
  // into reserved (a latent bug that can degenerate track ids) — build with a
  // plain isoBox instead, with the EXACT 84-byte v0 body: version/flags(4) +
  // creation(4) + modification(4) + track_ID(4) + reserved(4) + duration(4) +
  // reserved[2](8) + layer(2) + alternate_group(2) + volume(2) + reserved(2) +
  // matrix[9](36) + width(4) + height(4). A short tkhd (a truncated matrix)
  // makes a strict parser read past the box.
  return isoBox('tkhd', [
    0, 0, 0, 7, ...u32(0), ...u32(0), ...u32(trackId), ...u32(0), ...u32(duration), ...new Uint8Array(8),
    0, 0, 0, 0, 0, 0, 0, 0,
    0x00, 0x01, 0x00, 0x00, 0, 0, 0, 0, 0, 0, 0, 0,
    0x00, 0x01, 0x00, 0x00, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0x40, 0x00, 0x00, 0x00,
    ...u32((width << 16) >>> 0), ...u32((height << 16) >>> 0),
  ]);
}
