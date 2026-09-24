/**
 * Shared media vocabulary (`src/media/types.ts`): the only media facts the
 * library and the session wire share — a track is a codec plus a kind, and a
 * container is one of the families mediabunny can recognize.
 */

import { describe, expect, expectTypeOf, it } from 'vitest';
import { type ContainerKind, type MediaKind, type PlaybackTrack } from '../media/types.ts';

describe('media domain vocabulary', () => {
  it('restricts the track/codec kinds to video and audio', () => {
    expectTypeOf<MediaKind>().toEqualTypeOf<'audio' | 'video'>();
  });

  it('restricts the container family to what mediabunny recognizes', () => {
    expectTypeOf<ContainerKind>().toEqualTypeOf<'mkv' | 'mp4' | 'ts' | 'unknown' | 'webm'>();
  });

  it('describes one discovered track', () => {
    const track: PlaybackTrack = { codec: 'avc1.640028', kind: 'video' };
    expect(track.kind).toBe('video');
    expect(track.codec).toBe('avc1.640028');
  });
});
