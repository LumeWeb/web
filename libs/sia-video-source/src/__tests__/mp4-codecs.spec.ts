/**
 * `mp4CodecsFromInit` — sniffs the codec parameter set out of an fMP4 init
 * segment (moov → trak → mdia → minf → stbl → stsd) and returns the RFC 6381
 * codec string the MSE `addSourceBuffer` MIME needs (e.g.
 * `avc1.640032,mp4a.40.2`). This is the worker's fix for the fMP4 passthrough
 * path: a bare `video/mp4` MIME is rejected by Chromium, so the worker must
 * qualify it from the object's own init bytes.
 */

import { describe, expect, it } from 'vitest';
import { mp4CodecsFromInit } from '../mp4-codecs.ts';

// ---- tiny ISO BMFF builder helpers (structurally faithful, codec fields real) ----

/** VisualSampleEntry prelude (78 B) then child avcC, as a full `avc1` box. */
function avc1Entry(level: number): number[] {
  const prelude = new Array<number>(78).fill(0);
  prelude[7] = 1; // data_reference_index
  // configVersion=1, AVCProfileIndication=0x64 (High), profile_compatibility=0,
  // AVCLevelIndication=level, then minimal SPS/PPS payload.
  const avcC = box('avcC', [
    1, 0x64, 0x00, level, 0xff, 0xe1, 0, 1, 0x67, 0x64, 0x00,
    level, 0xfd, 1, 0x68, 0xee, 0x3c, 0x80,
  ]);
  return box('avc1', [...prelude, ...avcC]);
}

function box(type: string, body: number[]): number[] {
  return [...boxHeader(type, 8 + body.length), ...body];
}

function boxHeader(type: string, size: number): number[] {
  return [
    (size >>> 24) & 255,
    (size >>> 16) & 255,
    (size >>> 8) & 255,
    size & 255,
    ...[...type].map((c) => c.charCodeAt(0)),
  ];
}

function buildInit(opts: { audio?: boolean; video?: number } = {}): Uint8Array {
  const ftyp = box('ftyp', [105, 115, 111, 109, 0, 0, 2, 0]); // isom
  const tracks: number[] = [];
  if (opts.video !== undefined) tracks.push(...track(opts.video));
  if (opts.audio) tracks.push(...track(undefined, true));
  return new Uint8Array([...ftyp, ...box('moov', tracks)]);
}

/** ISO 14496-1 descriptor: tag + single-byte length (tests never exceed 127). */
function desc(tag: number, payload: number[]): number[] {
  if (payload.length >= 0x80) throw new Error(`test desc too long: ${payload.length}`);
  return [tag, payload.length, ...payload];
}

/** AudioSampleEntry prelude (28 B) then child esds, as a full `mp4a` box. */
function mp4aEntry(): number[] {
  const prelude = new Array<number>(28).fill(0);
  prelude[3] = 1; // data_reference_index
  const dsiDesc = desc(0x05, [0x12, 0x10]); // DecoderSpecificInfo
  // DecoderConfigDescriptor: objectTypeIndication 0x40 (MPEG-4 audio).
  const decCfg = desc(0x04, [0x40, 0x15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, ...dsiDesc]);
  const slCfg = desc(0x06, [0x02]);
  const esDesc = desc(0x03, [0, 1, 0, ...decCfg, ...slCfg]);
  // FullBox esds: version(0) + flags(0) then the ES_Descriptor.
  return box('mp4a', [...prelude, ...box('esds', [0, 0, 0, 0, ...esDesc])]);
}

function track(videoLevel?: number, audio = false): number[] {
  let stsdBody = [0, 0, 0, 0, 0, 0, 0, 1]; // version+flags, entry_count=1
  if (videoLevel !== undefined) stsdBody = [...stsdBody, ...avc1Entry(videoLevel)];
  if (audio) stsdBody = [...stsdBody, ...mp4aEntry()];
  return box('trak', box('mdia', box('minf', box('stbl', box('stsd', stsdBody)))));
}

// ---- tests ------------------------------------------------------------------

describe('mp4CodecsFromInit', () => {
  it('returns undefined for empty bytes', () => {
    expect(mp4CodecsFromInit(new Uint8Array(0))).toBeUndefined();
  });

  it('returns undefined when there is no moov (e.g. ftyp + moof only)', () => {
    const ftyp = box('ftyp', [105, 115, 111, 109, 0, 0, 2, 0]);
    const moof = box('moof', []);
    expect(mp4CodecsFromInit(new Uint8Array([...ftyp, ...moof]))).toBeUndefined();
  });

  it('returns undefined for truncated bytes well short of a full moov', () => {
    const init = buildInit({ video: 0x32 });
    expect(mp4CodecsFromInit(init.subarray(0, 12))).toBeUndefined();
  });

  it('extracts an avc1 H.264 codec string from a video-only init segment', () => {
    expect(mp4CodecsFromInit(buildInit({ video: 0x32 }))).toBe('avc1.640032');
  });

  it('extracts the mp4a AAC codec from an audio init segment', () => {
    expect(mp4CodecsFromInit(buildInit({ audio: true }))).toBe('mp4a.40.2');
  });

  it('joins video and audio codecs in track order (video first)', () => {
    expect(mp4CodecsFromInit(buildInit({ audio: true, video: 0x32 }))).toBe('avc1.640032,mp4a.40.2');
  });

  it('returns undefined when the sample table has no codec sample entries', () => {
    // entry_count=1 but the box body is empty (no avc1/mp4a entry follows).
    const ftyp = box('ftyp', [105, 115, 111, 109, 0, 0, 2, 0]);
    const stsd = box('stsd', [0, 0, 0, 0, 0, 0, 0, 1]);
    const moov = box('moov', trackEmpty(stsd));
    expect(mp4CodecsFromInit(new Uint8Array([...ftyp, ...moov]))).toBeUndefined();
  });

  it('does not panic on a trak with an empty mdia subtree', () => {
    const ftyp = box('ftyp', [105, 115, 111, 109, 0, 0, 2, 0]);
    const emptyTrak = box('trak', box('mdia', box('minf', box('stbl', box('stsd', [0, 0, 0, 0, 0, 0, 0, 0])))));
    const moov = box('moov', emptyTrak);
    expect(mp4CodecsFromInit(new Uint8Array([...ftyp, ...moov]))).toBeUndefined();
  });
});

function trackEmpty(stsd: number[]): number[] {
  return box('trak', box('mdia', box('minf', box('stbl', stsd))));
}
