/** Stable policy values accepted by SiaVideoSource.backend. */
export const SIA_PLAYBACK_BACKENDS = Object.freeze({
  AUTO: "auto",
  MEDIA_WORKER: "media-worker",
  SERVICE_WORKER: "service-worker",
} as const);

export type SiaPlaybackBackend =
  (typeof SIA_PLAYBACK_BACKENDS)[keyof typeof SIA_PLAYBACK_BACKENDS];
