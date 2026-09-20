/**
 * Focused TDD contract for the generic media domain vocabulary
 * (`src/media/types.ts`). These types carry no Sia specifics and no MSE
 * details: byte addressing is explicit (`RangeRead`), time is always seconds,
 * and codec identity is a plain string. Capability reporting, random-access
 * index builders, producers, and the MSE sink all speak this vocabulary.
 */

import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  type CodecDescriptor,
  containerKind,
  type ContainerKind,
  indexGranularity,
  type IndexGranularity,
  mediaKind,
  type MediaKind,
  type MediaRange,
  type MediaSegment,
  type PlaybackMode,
  type Presentation,
  producerMode,
  type ProducerMode,
  type RandomAccessIndex,
  type RangeRead,
  type SegmentMeta,
  type SourceCapabilities,
  type TrackSummary,
} from '../media/types.ts';

/**
 * Minimal contract-compliant index built over a flat list of ranges. Its
 * `seek` FLOOR-selects the last range whose start is at or before the target —
 * the same anneal/floor semantics `finite-vod.ts`'s `segmentForTime` already
 * gives the sidx path.
 */
function indexFrom(segments: readonly RangeRead[]): RandomAccessIndex {
  return {
    durationSeconds: segments.length > 0 ? segments[segments.length - 1].endSeconds : null,
    first: segments[0] ?? null,
    granularity: indexGranularity['exact-byte'],
    next(from) {
      const position = segments.indexOf(from);
      if (position < 0 || position + 1 >= segments.length) return null;
      return segments[position + 1];
    },
    seek(timeSeconds) {
      if (segments.length === 0 || !Number.isFinite(timeSeconds)) return null;
      const target = Math.max(0, timeSeconds);
      let selected: null | RangeRead = null;
      for (const segment of segments) {
        if (segment.startSeconds > target) break;
        selected = segment;
      }
      return selected ?? segments[0] ?? null;
    },
  };
}

function range(
  range: Omit<RangeRead, 'rap' | 'terminal'> & Partial<Pick<RangeRead, 'rap' | 'terminal'>>,
): RangeRead {
  return { rap: true, terminal: false, ...range };
}

describe('media domain vocabulary', () => {
  it('keeps the container vocabulary in sync with the classifier', () => {
    expectTypeOf<ContainerKind>().toEqualTypeOf<'fmp4' | 'mkv' | 'mp4' | 'ts' | 'unknown' | 'webm'>();
  });

  it('keeps the track/codec kind to video and audio', () => {
    expectTypeOf<MediaKind>().toEqualTypeOf<'audio' | 'video'>();
  });

  it('keeps the index-granularity ladder ordered best to worst', () => {
    expectTypeOf<IndexGranularity>().toEqualTypeOf<
      | 'downloaded-range'
      | 'exact-byte'
      | 'none'
      | 'rap-range'
      | 'throughput'
    >();
  });

  it('keeps producer modes distinct from the sequential narrowest fallback', () => {
    expectTypeOf<ProducerMode>().toEqualTypeOf<
      | 'degraded'
      | 'native'
      | 'normalized'
      | 'passthrough'
      | 'repatch'
    >();
    expectTypeOf<PlaybackMode>().toEqualTypeOf<'sequential' | ProducerMode>();
  });
});

describe('RangeRead', () => {
  it('describes a byte-exact, time-anchored, RAP/terminal range', () => {
    const read: RangeRead = {
      endSeconds: 6.0,
      length: 512,
      offset: 1024,
      rap: true,
      startSeconds: 4.2,
      terminal: false,
    };
    expect(read.offset).toBe(1024);
    expect(read.length).toBe(512);
    expect(read.startSeconds).toBe(4.2);
    expect(read.endSeconds).toBe(6);
    expect(read.rap).toBe(true);
    expect(read.terminal).toBe(false);
  });

  it('is structurally interchangeable with the MediaRange alias', () => {
    const read: RangeRead = range({ endSeconds: 2, length: 100, offset: 0, startSeconds: 0 });
    const mediaRange: MediaRange = read;
    expect(mediaRange).toEqual(read);
  });
});

describe('RandomAccessIndex contract', () => {
  const first = range({ endSeconds: 2, length: 100, offset: 0, startSeconds: 0 });
  const segments = [
    first,
    range({ endSeconds: 4, length: 100, offset: 100, startSeconds: 2 }),
    range({ endSeconds: 6, length: 100, offset: 200, startSeconds: 4, terminal: true }),
  ];

  it('exposes granularity, duration, and first range', () => {
    const index = indexFrom(segments);
    expect(index.granularity).toBe(indexGranularity['exact-byte']);
    expect(index.durationSeconds).toBe(6);
    expect(index.first).toBe(segments[0]);
  });

  it('FLOOR-selects the last range starting at or before the seek time', () => {
    const index = indexFrom(segments);
    expect(index.seek(0)).toBe(segments[0]);
    expect(index.seek(1.9)).toBe(segments[0]);
    expect(index.seek(2)).toBe(segments[1]);
    expect(index.seek(5.9)).toBe(segments[2]);
    // Beyond the final range the floor lands on the terminal range.
    expect(index.seek(999)).toBe(segments[2]);
  });

  it('clamps a negative seek to the first range', () => {
    expect(indexFrom(segments).seek(-5)).toBe(segments[0]);
  });

  it('returns null from an empty index and for non-finite times', () => {
    const empty = indexFrom([]);
    expect(empty.seek(0)).toBeNull();
    expect(empty.first).toBeNull();
    expect(empty.durationSeconds).toBeNull();
    expect(indexFrom(segments).seek(Number.NaN)).toBeNull();
    expect(indexFrom(segments).seek(Number.POSITIVE_INFINITY)).toBeNull();
  });

  it('walks forward lookahead ranges with next()', () => {
    const index = indexFrom(segments);
    expect(index.next(segments[0])).toBe(segments[1]);
    expect(index.next(segments[1])).toBe(segments[2]);
    expect(index.next(segments[2])).toBeNull();
  });

  it('treats only the terminal range as terminal', () => {
    expect(segments[0].terminal).toBe(false);
    expect(segments[2].terminal).toBe(true);
  });
});

describe('track and codec vocabulary', () => {
  it('summarizes a track for UI/debug without byte metadata', () => {
    const track: TrackSummary = { codec: 'avc1.640028', kind: mediaKind.video };
    expect(track.kind).toBe(mediaKind.video);
    expect(track.codec).toBe('avc1.640028');
  });

  it('describes a codec with its MIME codec component', () => {
    const descriptor: CodecDescriptor = {
      codec: 'avc1.640028',
      kind: mediaKind.video,
      mimeCodec: 'avc1.640028',
    };
    expect(descriptor.kind).toBe(mediaKind.video);
    expect(descriptor.mimeCodec).toBe(descriptor.codec);
  });

  it('reports the whole-load capability summary', () => {
    const source: SourceCapabilities = {
      codecs: [{ codec: 'avc1.640028', kind: mediaKind.video, mimeCodec: 'avc1.640028' }],
      container: containerKind.fmp4,
      durationSeconds: 6,
      indexGranularity: indexGranularity['exact-byte'],
      mime: 'video/mp4; codecs="avc1.640028"',
      playbackMode: producerMode.passthrough,
    };
    expect(source.container).toBe(containerKind.fmp4);
    expect(source.playbackMode).toBe(producerMode.passthrough);
    expect(source.indexGranularity).toBe(indexGranularity['exact-byte']);
    // Duration may legitimately be unknown; the shape allows null.
    expect(source.durationSeconds).toBe(6);
  });
});

describe('segment and presentation vocabulary', () => {
  it('describes one independently appendable media unit', () => {
    const meta: SegmentMeta = {
      endSeconds: 6,
      producedBy: producerMode.passthrough,
      rap: true,
      startSeconds: 4,
      terminal: true,
    };
    const segment: MediaSegment = {
      init: new Uint8Array([0, 1]),
      media: new Uint8Array([2, 3]),
      meta,
    };
    expect(segment.init?.byteLength).toBe(2);
    expect(segment.media.byteLength).toBe(2);
    expect(segment.meta.producedBy).toBe(producerMode.passthrough);
    expect(segment.meta.terminal).toBe(true);
  });

  it('binds a seconds-domain timeline to a byte index', () => {
    const segments = [range({ endSeconds: 2, length: 100, offset: 0, startSeconds: 0, terminal: true })];
    const presentation: Presentation = {
      durationSeconds: 2,
      index: indexFrom(segments),
      timeline: 'on-demand',
    };
    expect(presentation.index.first).toBe(segments[0]);
    expect(presentation.timeline).toBe('on-demand');
  });
});
