/**
 * Deterministic developer-options to playback-backend mapping: the one place
 * the native-disable option becomes a backend choice.
 *
 * - Native enabled (the default): the library's `auto` policy. Native
 *   stream first when the demo stream service is available, media worker
 *   fallback otherwise.
 * - Native disabled: the deterministic WORKER-ONLY choice
 *   (`SIA_PLAYBACK_BACKENDS.MEDIA_WORKER`).
 * - Worker disabled: the explicit native service-worker choice, so AUTO cannot
 *   fall back to a worker.
 */

import {
  SIA_PLAYBACK_BACKENDS,
  type SiaPlaybackBackend,
} from "@lumeweb/sia-video-source";
import type { DeveloperOptions } from "../stores/developerOptions";

export function resolvePlaybackBackend(
  options: Pick<
    DeveloperOptions,
    "disableNativePlayback" | "disableWorkerPlayback"
  >,
): SiaPlaybackBackend {
  if (options.disableNativePlayback) return SIA_PLAYBACK_BACKENDS.MEDIA_WORKER;
  if (options.disableWorkerPlayback) return SIA_PLAYBACK_BACKENDS.SERVICE_WORKER;
  return SIA_PLAYBACK_BACKENDS.AUTO;
}
