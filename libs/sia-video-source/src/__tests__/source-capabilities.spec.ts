/**
 * TDD contract for the session capability-report module: the pure mapping from
 * one load's facts — container, codecs, the built index, the producer's own
 * mode, and the MSE MIME — into the domain `SourceCapabilities` and the
 * optional `SOURCE_OK.info` capability fields (`playback`, `indexGranularity`,
 * `tracks`) the worker reports to the host.
 *
 * This module is deliberately generic: it carries no Sia SDK, no MSE internals,
 * and no worker routing knowledge. It is also the shared vocabulary the
 * `LoadPipeline` seam emits and the worker hands to `SOURCE_OK`, so the
 * mapping is tested here once instead of inline.
 */

import { describe, expect, it } from 'vitest';
import { SidxIndex } from '../container/index/sidx-index.ts';
import { containerKind, type ContainerKind, indexGranularity, mediaKind, type PlaybackMode, producerMode } from '../media/types.ts';
import { DEFAULT_FMP4_MIME, workerMode } from '../protocol.ts';
import {
  codecDescriptorsFromRfc6381,
  indexGranularityFor,
  sourceCapabilitiesFor,
  type SourceCapabilityFacts,
  sourceInfoFor,
  tracksFromCodecs,
  TS_REMUX_CODECS,
} from '../session/source-capabilities.ts';

/** @returns a minimal exact-byte index stand-in (granularity + duration). */
function exactByteIndex(durationSeconds: null | number = null) {
  return {
    durationSeconds,
    first: null,
    granularity: indexGranularity['exact-byte'],
    next: () => null,
    seek: () => null,
  };
}

function facts(overrides: Partial<SourceCapabilityFacts> = {}): SourceCapabilityFacts {
  return {
    codecs: [],
    container: containerKind.fmp4,
    durationSeconds: null,
    index: null,
    mime: 'video/mp4',
    playback: producerMode.passthrough,
    ...overrides,
  };
}

describe('codecDescriptorsFromRfc6381', () => {
  it('splits an RFC 6381 CSV into track-ordered codec descriptors', () => {
    expect(codecDescriptorsFromRfc6381('avc1.640028,mp4a.40.2')).toEqual([
      { codec: 'avc1.640028', kind: mediaKind.video, mimeCodec: 'avc1.640028' },
      { codec: 'mp4a.40.2', kind: mediaKind.audio, mimeCodec: 'mp4a.40.2' },
    ]);
  });

  it('classifies known audio prefixes as audio and everything else as video', () => {
    expect(codecDescriptorsFromRfc6381('mp4a.40.2,opus,vorbis,ac-3,ec-3').map((c) => c.kind)).toEqual([
      mediaKind.audio, mediaKind.audio, mediaKind.audio, mediaKind.audio, mediaKind.audio,
    ]);
    expect(codecDescriptorsFromRfc6381('avc1.640028,vp09.00.10.08,av01.0.04M.08,hev1.1.6.L120.90')[0].kind).toBe(mediaKind.video);
  });

  it('returns an empty list for an empty or whitespace CSV', () => {
    expect(codecDescriptorsFromRfc6381('')).toEqual([]);
    expect(codecDescriptorsFromRfc6381('  ')).toEqual([]);
  });

  it('exposes the mux.js H.264+AAC remux codec set as the TS default', () => {
    expect(TS_REMUX_CODECS).toEqual(codecDescriptorsFromRfc6381('avc1.640028,mp4a.40.2'));
  });
});

describe('tracksFromCodecs', () => {
  it('maps codec descriptors to {kind, codec} track summaries in order', () => {
    expect(tracksFromCodecs(codecDescriptorsFromRfc6381('avc1.640028,mp4a.40.2'))).toEqual([
      { codec: 'avc1.640028', kind: mediaKind.video },
      { codec: 'mp4a.40.2', kind: mediaKind.audio },
    ]);
  });

  it('returns an empty list when no codecs are known', () => {
    expect(tracksFromCodecs([])).toEqual([]);
  });
});

describe('indexGranularityFor', () => {
  it('trusts the index granularity when an index exists', () => {
    expect(indexGranularityFor(containerKind.fmp4, exactByteIndex(90))).toBe(indexGranularity['exact-byte']);
    expect(indexGranularityFor(containerKind.ts, exactByteIndex(10))).toBe(indexGranularity['exact-byte']);
  });

  it('falls back to throughput for an unindexed fMP4 or TS object', () => {
    expect(indexGranularityFor(containerKind.fmp4, null)).toBe(indexGranularity.throughput);
    expect(indexGranularityFor(containerKind.ts, null)).toBe(indexGranularity.throughput);
  });

  it('reports none for containers that have no index and are not streamable yet', () => {
    for (const container of [containerKind.unknown, containerKind.mp4, containerKind.webm, containerKind.mkv] as readonly ContainerKind[]) {
      expect(indexGranularityFor(container, null), container).toBe(indexGranularity.none);
    }
  });
});

describe('sourceCapabilitiesFor', () => {
  it('builds the domain SourceCapabilities for an indexed fMP4 passthrough load', () => {
    const codecs = codecDescriptorsFromRfc6381('avc1.640028,mp4a.40.2');
    const index = exactByteIndex(90);
    const capabilities = sourceCapabilitiesFor(
      facts({ codecs, container: containerKind.fmp4, durationSeconds: 90, index, mime: DEFAULT_FMP4_MIME, playback: producerMode.passthrough }),
    );
    expect(capabilities).toEqual({
      codecs,
      container: containerKind.fmp4,
      durationSeconds: 90,
      indexGranularity: indexGranularity['exact-byte'],
      mime: DEFAULT_FMP4_MIME,
      playbackMode: producerMode.passthrough,
    });
  });

  it('prefers the index duration over the transport estimate', () => {
    const capabilities = sourceCapabilitiesFor(
      facts({ container: containerKind.fmp4, durationSeconds: 12, index: exactByteIndex(90) }),
    );
    expect(capabilities.durationSeconds).toBe(90);
  });

  it('reports throughput granularity for an unindexed TS remux load', () => {
    const capabilities = sourceCapabilitiesFor(
      facts({ codecs: TS_REMUX_CODECS, container: containerKind.ts, durationSeconds: null, mime: DEFAULT_FMP4_MIME, playback: producerMode.normalized }),
    );
    expect(capabilities.playbackMode).toBe(producerMode.normalized);
    expect(capabilities.indexGranularity).toBe(indexGranularity.throughput);
    expect(capabilities.mime).toBe(DEFAULT_FMP4_MIME);
  });
});

describe('sourceInfoFor', () => {
  it('renders the full SOURCE_OK.info shape with capability fields for the worker mode', () => {
    const codecs = codecDescriptorsFromRfc6381('avc1.640028,mp4a.40.2');
    const info = sourceInfoFor(
      facts({ codecs, container: containerKind.fmp4, durationSeconds: 90, index: exactByteIndex(90), mime: DEFAULT_FMP4_MIME, playback: producerMode.passthrough }),
      workerMode.worker,
    );
    expect(info.container).toBe(containerKind.fmp4);
    expect(info.durationSeconds).toBe(90);
    expect(info.mime).toBe(DEFAULT_FMP4_MIME);
    expect(info.mode).toBe(workerMode.worker);
    expect(info.playback).toBe(producerMode.passthrough);
    expect(info.indexGranularity).toBe(indexGranularity['exact-byte']);
    expect(info.tracks).toEqual([
      { codec: 'avc1.640028', kind: mediaKind.video },
      { codec: 'mp4a.40.2', kind: mediaKind.audio },
    ]);
  });

  it('reports an empty tracks list when no codecs could be discovered', () => {
    const info = sourceInfoFor(facts({ container: containerKind.fmp4, playback: producerMode.passthrough }), workerMode.main);
    expect(info.tracks).toEqual([]);
    expect(info.playback).toBe(producerMode.passthrough);
    expect(info.indexGranularity).toBe(indexGranularity.throughput);
  });

  it('keeps an unindexed TS remux report honest about seek granularity', () => {
    const info = sourceInfoFor(
      facts({ codecs: TS_REMUX_CODECS, container: containerKind.ts, mime: DEFAULT_FMP4_MIME, playback: producerMode.normalized }),
      workerMode.main,
    );
    expect(info.playback).toBe(producerMode.normalized);
    expect(info.indexGranularity).toBe(indexGranularity.throughput);
  });

  it('agrees with SidxIndex.parse for a real sidx head', () => {
    const head = finiteVodHead();
    const parsed = SidxIndex.parse(head);
    expect(parsed).not.toBeNull();
    const playback: PlaybackMode = producerMode.passthrough;
    const info = sourceInfoFor(facts({ container: containerKind.fmp4, index: parsed, playback }), workerMode.worker);
    expect(info.indexGranularity).toBe(indexGranularity['exact-byte']);
    expect(info.durationSeconds).toBe(10);
  });
});

// ---- minimal sidx fixture (mirrors sidx-index.spec.ts) -----------------------

function box(type: string, body: number[]): number[] {
  const size = body.length + 8;
  return [(size >>> 24) & 255, (size >>> 16) & 255, (size >>> 8) & 255, size & 255, ...type.split('').map((c) => c.charCodeAt(0)), ...body];
}

/** ftyp+moov+sidx head for a 10s two-segment finite VOD object. */
function finiteVodHead(): Uint8Array {
  const mvhd = box('mvhd', [0, 0, 0, 0, ...u32(0), ...u32(0), ...u32(1000), ...u32(10_000)]);
  const moov = box('moov', mvhd);
  const ftyp = box('ftyp', [105, 115, 111, 109]);
  const sidx = box('sidx', [
    0, 0, 0, 0, ...u32(1), ...u32(1000), ...u32(0), ...u32(0),
    0, 0, 0, 2,
    ...u32(100), ...u32(5000), 0x80, 0, 0, 0,
    ...u32(120), ...u32(5000), 0x80, 0, 0, 0,
  ]);
  return new Uint8Array([...ftyp, ...moov, ...sidx, ...Array<number>(220).fill(0)]);
}

function u32(value: number): number[] {
  return [(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255];
}
