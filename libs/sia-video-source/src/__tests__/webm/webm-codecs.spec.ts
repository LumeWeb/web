/**
 * TDD contract for WebM codec discovery: turn the Tracks
 * element's `CodecID` strings (V_VP8, V_VP9, A_OPUS, A_VORBIS, …) into
 * `CodecDescriptor`s and a codec-qualified `video/webm` MIME — the dependency-
 * neutral input the native-WebM producer eligibility check runs with
 * `MediaSource.isTypeSupported`.
 */
import { describe, expect, it } from 'vitest';
import { webmCodecFromId, webmCodecsFromHead, webmMimeForCodecs } from '../../container/webm/webm-codecs.ts';
import type { CodecDescriptor } from '../../media/types.ts';
import { buildWebm, scanEbmlTop } from '../fixtures/webm-fixture.ts';

const VP8: CodecDescriptor = { codec: 'vp8', kind: 'video', mimeCodec: 'vp8' };
const VORBIS: CodecDescriptor = { codec: 'vorbis', kind: 'audio', mimeCodec: 'vorbis' };
const OPUS: CodecDescriptor = { codec: 'opus', kind: 'audio', mimeCodec: 'opus' };

/** Full extent (header + data) of the element at `offset`, or null when truncated. */
function elementExtentAt(bytes: Uint8Array, offset: number): null | number {
  const idLen = vintLengthAt(bytes, offset);
  if (idLen === 0) return null;
  const sizeOffset = offset + idLen;
  const sizeLen = vintLengthAt(bytes, sizeOffset);
  if (sizeLen === 0) return null;
  let raw = 0;
  for (let i = 0; i < sizeLen; i += 1) raw = (raw << 8) | (bytes[sizeOffset + i] ?? 0);
  raw &= (1 << (8 * sizeLen - sizeLen)) - 1;
  if (raw === (1 << (8 * sizeLen - sizeLen)) - 1) return null; // unknown size
  return idLen + sizeLen + raw;
}

/** Absolute offset of the first Cluster's id, or -1 when none parses. */
function firstClusterStart(bytes: Uint8Array): number {
  const top = scanEbmlTop(bytes);
  const segment = top.find((box) => box.id === 0x18538067);
  if (!segment) return -1;
  let offset = segment.start + headerLengthAt(bytes, segment.start);
  const segEnd = segment.end;
  while (offset + 1 < segEnd && offset + 1 < bytes.byteLength) {
    const id = readIdAt(bytes, offset);
    if (id === 0x1f43b675) return offset;
    const extent = elementExtentAt(bytes, offset);
    if (extent === null) return -1;
    offset += extent;
  }
  return -1;
}

/** Byte length of the element's id + size header, from the marker bits. */
function headerLengthAt(bytes: Uint8Array, offset: number): number {
  const idLen = vintLengthAt(bytes, offset);
  return idLen + vintLengthAt(bytes, offset + idLen);
}

function readIdAt(bytes: Uint8Array, offset: number): number {
  const length = vintLengthAt(bytes, offset);
  if (length === 0) return 0;
  let value = 0;
  for (let i = 0; i < length; i += 1) value = (value << 8) | (bytes[offset + i] ?? 0);
  return value;
}

/** The vint byte length at `offset` (0 for a byte with no marker bit). */
function vintLengthAt(bytes: Uint8Array, offset: number): number {
  const first = bytes[offset] ?? 0;
  for (let i = 0; i < 8; i += 1) {
    if (first & (0x80 >> i)) return i + 1;
  }
  return 0;
}

describe('webm codec discovery', () => {
  it('maps WebM CodecID strings to codec descriptors', () => {
    expect(webmCodecFromId('V_VP8')).toEqual(VP8);
    expect(webmCodecFromId('V_VP9')).toEqual({ codec: 'vp9', kind: 'video', mimeCodec: 'vp9' });
    expect(webmCodecFromId('A_VORBIS')).toEqual(VORBIS);
    expect(webmCodecFromId('A_OPUS')).toEqual(OPUS);
    expect(webmCodecFromId('A_FLAC')).toEqual({ codec: 'flac', kind: 'audio', mimeCodec: 'flac' });
    expect(webmCodecFromId('V_MPEG4/ISO/AVC')).toBeNull();
    expect(webmCodecFromId('')).toBeNull();
  });

  it('sniffs the VP8+Vorbis tracks from a crafted WebM head', () => {
    const bytes = buildWebm(2);
    const head = bytes.subarray(0, 512);
    expect(webmCodecsFromHead(head)).toEqual([VP8, VORBIS]);
  });

  it('still sniffs codecs when the head ends before the first Cluster', () => {
    // A bounded head that covers EBML + Info + Tracks but cuts off before the
    // first Cluster carries every CodecID the producer eligibility check needs;
    // it must not be refused for lacking a Cluster to anchor the index.
    const bytes = buildWebm(2);
    const head = bytes.subarray(0, firstClusterStart(bytes));
    expect(head.byteLength).toBeGreaterThan(0);
    expect(head.byteLength).toBeLessThan(bytes.byteLength);
    expect(webmCodecsFromHead(head)).toEqual([VP8, VORBIS]);
  });

  it('returns [] for a head with no parseable Tracks element', () => {
    expect(webmCodecsFromHead(new Uint8Array())).toEqual([]);
    expect(webmCodecsFromHead(new Uint8Array([0x1a, 0x45, 0xdf, 0xa3, 0xff]))).toEqual([]);
  });

  it('builds a codec-qualified video/webm MIME', () => {
    expect(webmMimeForCodecs([VP8, VORBIS])).toBe('video/webm; codecs="vp8,vorbis"');
    expect(webmMimeForCodecs([VP8])).toBe('video/webm; codecs="vp8"');
    expect(webmMimeForCodecs([])).toBe('video/webm');
  });
});
