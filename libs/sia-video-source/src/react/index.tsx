'use client';

/**
 * React wrapper for the Sia media engine, following the packaged video.js v10
 * media components (e.g. `HlsJsVideo`): the media instance is created once and
 * attached through the player context via `useMediaInstance`, and a ref
 * callback wires the real `<video>` element into it.
 *
 * Media props (`src`, `preload`, `streamType`) and the `sia`/`mimeType`
 * config are synced from JSX into the media object during render instead of
 * becoming HTML attributes, exactly what the packaged components' internal
 * prop-syncing hook does. Because the media instance persists across renders,
 * `sia` and `mimeType` are synced on EVERY render — `mimeType` forwards
 * immediately on the next `SOURCE`, while `sia` (indexer URL, app metadata,
 * app key seed) reaches the worker on the next `attach`/re-attach, which is
 * where the host applies worker configuration.
 */

import { forwardRef, type ReactNode, type VideoHTMLAttributes } from 'react';
import { useAttachMedia, useComposedRefs, useMediaInstance } from '@videojs/react';
import { siaVideoDefaultProps, SiaVideoSource } from '../sia-video-source.ts';
import type { WorkerConfig } from '../protocol.ts';

export interface SiaVideoProps
  extends Omit<VideoHTMLAttributes<HTMLVideoElement>, keyof typeof siaVideoDefaultProps>,
    Partial<typeof siaVideoDefaultProps> {
  children?: ReactNode;
  /** Declared content type for the source; forwarded to the worker on every `SOURCE`. */
  mimeType?: string;
  /** Connection material for the worker's default Sia SDK factory. */
  sia?: WorkerConfig;
}

type MediaLike = Record<string, unknown>;

/**
 * `<SiaVideo src={objectKey} sia={{ indexerUrl, app, appKeySeed }} />` — a
 * `<video>` element backed by the Sia engine. Render inside a video.js v10
 * `Player` for the skin/error-dialog features; standalone rendering works
 * too, with bare native media events.
 */
export const SiaVideo = forwardRef<HTMLVideoElement, SiaVideoProps>(function SiaVideo(
  { children, sia, ...props },
  ref,
) {
  // The media instance is created lazily and kept for the component's whole
  // lifetime; `workerConfig`/`mimeType` are applied per-render below.
  const media = useMediaInstance(SiaVideoSource);

  let htmlProps = props as VideoHTMLAttributes<HTMLVideoElement>;
  if (media) {
    const sourceProps = props as Record<string, unknown>;
    const rest: Record<string, unknown> = {};
    const owning = media as unknown as MediaLike;
    for (const [key, value] of Object.entries(sourceProps)) {
      if (key in siaVideoDefaultProps) {
        if (value !== undefined && (media as unknown as MediaLike)[key] !== value) {
          (media as unknown as MediaLike)[key] = value;
        }
        continue;
      }
      // `mimeType` is a media property, not an HTML attribute — never a DOM
      // attribute. Synchronized unconditionally below (i.e. cleared when the
      // prop is omitted entirely), not in this present-props-only loop.
      if (key === 'mimeType') continue;
      rest[key] = value;
    }
    // Unconditional each render: setting mimeType to `undefined` when the prop
    // is absent clears whatever a previous render stored, so a later source on
    // the same persistent media instance never inherits a stale declared MIME.
    (media as unknown as MediaLike).mimeType = sourceProps.mimeType;
    // Also unconditional: the media instance persists across renders, so an
    // updated `sia` configuration must land on it even if the setup callback
    // (which only runs on mount) already ran. The host applies it on the next
    // (re)attach.
    (media as unknown as MediaLike).workerConfig = sia;
    for (const [key, value] of Object.entries(siaVideoDefaultProps)) {
      if (sourceProps[key] === undefined && value !== undefined && owning[key] !== value) {
        owning[key] = value;
      }
    }
    htmlProps = rest;
  }

  const attachRef = useAttachMedia(media);
  const composedRef = useComposedRefs(attachRef, ref);

  return <video ref={composedRef} {...htmlProps}>{children}</video>;
});
