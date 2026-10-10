/**
 * Deterministic developer-options to playback-backend mapping: the one place
 * the native-disable option becomes a backend choice.
 *
 * - Native enabled (the default): the library's `auto` policy. Native
 *   stream first when the demo stream service is available, media worker
 *   fallback otherwise.
 * - Native disabled: the deterministic WORKER-ONLY choice
 *   (`SIA_PLAYBACK_BACKENDS.MEDIA_WORKER`), independent of any other option
 *   value.
 */

import {
  SIA_PLAYBACK_BACKENDS,
  type SiaPlaybackBackend,
} from "@lumeweb/sia-video-source";
import type { DeveloperOptions } from "../stores/developerOptions";

export function resolvePlaybackBackend(
  options: Pick<DeveloperOptions, "disableNativePlayback">,
): SiaPlaybackBackend {
  return options.disableNativePlayback
    ? SIA_PLAYBACK_BACKENDS.MEDIA_WORKER
    : SIA_PLAYBACK_BACKENDS.AUTO;
}
