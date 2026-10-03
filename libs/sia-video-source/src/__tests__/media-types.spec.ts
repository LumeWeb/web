/**
 * Shared media vocabulary (`src/media/types.ts`): the only media facts the
 * library and the session wire share — a track is a codec plus a kind, and a
 * container is one of the families mediabunny can recognize.
 */

import { describe, expectTypeOf, it } from 'vitest';
import { type ContainerKind, type MediaKind } from '../media/types.ts';

describe('media domain vocabulary', () => {
  it('restricts the track/codec kinds to video and audio', () => {
    expectTypeOf<MediaKind>().toEqualTypeOf<'audio' | 'video'>();
  });

  it('restricts the container family to what mediabunny recognizes', () => {
    expectTypeOf<ContainerKind>().toEqualTypeOf<'mkv' | 'mp4' | 'ts' | 'unknown' | 'webm'>();
  });

});
