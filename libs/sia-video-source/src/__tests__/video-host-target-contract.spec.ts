/**
 * Video-host target contract: the structural capabilities the native reanchor
 * and buffered helpers in `sia-video-source.ts` rely on once their parameters
 * are widened from `HTMLVideoElement`-specific to `HTMLVideoTargetLike`.
 *
 * The regression gate for that widening is the package typecheck itself (the
 * two call sites are in a private / module-private helper, so they are not
 * reachable from tests); these compile-time assertions pin the upstream
 * capability contract (`currentTime`, `buffered`) so a future `@videojs/media`
 * change cannot silently break the widened parameters.
 */

import { type HTMLVideoTargetLike } from '@videojs/media/dom/video-host';
import { type TimeRangeLike } from '@videojs/media';
import { expectTypeOf, it } from 'vitest';

it('HTMLVideoTargetLike keeps the writable currentTime the reanchor helpers set', () => {
  expectTypeOf<HTMLVideoTargetLike['currentTime']>().toEqualTypeOf<number>();
});

it('HTMLVideoTargetLike keeps the buffered ranges nativeBufferedEnd reads', () => {
  expectTypeOf<HTMLVideoTargetLike['buffered']>().toEqualTypeOf<TimeRangeLike>();
});
