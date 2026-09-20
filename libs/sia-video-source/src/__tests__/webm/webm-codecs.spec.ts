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
import { buildWebm } from '../fixtures/webm-fixture.ts';

const VP8: CodecDescriptor = { codec: 'vp8', kind: 'video', mimeCodec: 'vp8' };
const VORBIS: CodecDescriptor = { codec: 'vorbis', kind: 'audio', mimeCodec: 'vorbis' };
const OPUS: CodecDescriptor = { codec: 'opus', kind: 'audio', mimeCodec: 'opus' };

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
