/**
 * Stable domain vocabulary shared by the media library and the session wire.
 *
 * A track is a codec plus a kind, and a container is one of the families
 * mediabunny can recognize. Everything else about a load is settled by the
 * library (converted to CMAF MP4) or by MSE, so this module stays limited to
 * exactly those two concepts.
 */

/** Container families the media library may report. */
export type ContainerKind = 'mkv' | 'mp4' | 'ts' | 'unknown' | 'webm';

/** A track or codec kind. */
export type MediaKind = 'audio' | 'video';

/** One discovered track: a plain codec string plus its kind. */
export interface PlaybackTrack {
  readonly codec: string;
  readonly kind: MediaKind;
}
