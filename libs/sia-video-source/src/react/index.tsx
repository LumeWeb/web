'use client';

/**
 * React wrapper for the Sia media engine, following the packaged video.js v10
 * media components (e.g. `HlsJsVideo`): the media instance is created once and
 * attached through the player context via `useMediaInstance`, and a ref
 * callback wires the real `<video>` element into it.
 *
 * Media props (`src`, `preload`, `streamType`) and the
 * `sia`/`mimeType`/`getAppKeySeed`/`getSharingKeySeed` config are synced from
 * JSX into the media object during render instead of becoming HTML attributes,
 * exactly what the packaged components' internal prop-syncing hook does.
 * Because the media instance persists across renders, these are synced on
 * EVERY render — `mimeType` forwards immediately on the next `SOURCE`, while
 * `sia` and the seed suppliers reach the worker on the next `attach`/re-attach,
 * which is where the host applies worker configuration.
 *
 * Neither seed may ever become React state: pass `getAppKeySeed` / (for
 * keyless playback, ADR 0008) `getSharingKeySeed` supplier functions (callbacks
 * that fetch the seed from the SDK login flow on demand) instead of the seed
 * values themselves. The host invokes each once per handshake and scrubs the
 * returned buffer; nothing in this component, in the host's fields, or in the
 * postMessage channel stores the plaintext.
 */

import { forwardRef, type ReactNode, type VideoHTMLAttributes } from 'react';
import { useAttachMedia, useComposedRefs, useMediaInstance } from '@videojs/react';
import { type AppKeySeedProvider } from '../app-key-handshake.ts';
import { siaVideoDefaultProps, SiaVideoSource } from '../sia-video-source.ts';
import type { WorkerConfig } from '../protocol.ts';

export interface SiaVideoProps
  extends Omit<VideoHTMLAttributes<HTMLVideoElement>, keyof typeof siaVideoDefaultProps>,
    Partial<typeof siaVideoDefaultProps> {
  children?: ReactNode;
  /**
   * Supplies the 32-byte Sia app-key seed for the encrypted worker handshake.
   * Pass a supplier, never the value: defining it with `useState(seed)` would
   * pin the plaintext into the React component tree and defeat the handshake's
   * containment guarantees.
   */
  getAppKeySeed?: AppKeySeedProvider;
  /**
   * Supplies the 32-byte Sia sharing-key seed for keyless playback (ADR 0008),
   * forwarded to the worker exactly like `getAppKeySeed` (inside an `APP_KEY`
   * envelope tagged `keyType: 'sharing'`). Pass a supplier, never the value.
   * When present, a share-URL `src` streams via `SharedSdk` without an app key.
   */
  getSharingKeySeed?: AppKeySeedProvider;
  /** Declared content type for the source; forwarded to the worker on every `SOURCE`. */
  mimeType?: string;
  /** Connection metadata for the worker's default Sia SDK factory (no seed — see `getAppKeySeed`). */
  sia?: WorkerConfig;
}

type MediaLike = Record<string, unknown>;

/**
 * Views the persistent media instance as its dynamic prop surface. The fixed
 * config fields (`mimeType`, `workerConfig`, the seed-supplier setters) are
 * typed on `SiaVideoSource` and assigned directly without a cast; only the
 * keyed prop-sync loops below need the anonymous record shape, and the single
 * `as unknown as` for that lives here.
 */
function asMediaLike(media: SiaVideoSource): MediaLike {
  return media as unknown as MediaLike;
}

/**
 * `<SiaVideo src={objectKey} sia={{ indexerUrl, app }} getAppKeySeed={() => …} />` — a
 * `<video>` element backed by the Sia engine. Render inside a video.js v10
 * `Player` for the skin/error-dialog features; standalone rendering works
 * too, with bare native media events.
 *
 * `src` accepts either a hex object key or a full Sia share URL — the latter
 * identifies the object and carries its decryption key, so no separately
 * passed object identity is needed; `sia` and `getAppKeySeed` are still
 * required for the account connection that funds the downloads.
 */
export const SiaVideo = forwardRef<HTMLVideoElement, SiaVideoProps>(function SiaVideo(
  { children, getAppKeySeed, getSharingKeySeed, sia, ...props },
  ref,
) {
  // The media instance is created lazily and kept for the component's whole
  // lifetime; `workerConfig`/`mimeType` are applied per-render below.
  const media = useMediaInstance(SiaVideoSource);

  let htmlProps = props as VideoHTMLAttributes<HTMLVideoElement>;
  if (media) {
    const sourceProps = props as Record<string, unknown>;
    const rest: Record<string, unknown> = {};
    // The media instance persists across renders, so every config field is
    // synced on EVERY render. The fixed fields below are typed setters on the
    // engine and need no cast; only the keyed default/present-prop loops use
    // the anonymous record view, whose one `as unknown as` lives in the helper.
    const owning = asMediaLike(media);
    for (const [key, value] of Object.entries(sourceProps)) {
      if (key in siaVideoDefaultProps) {
        if (value !== undefined && owning[key] !== value) {
          owning[key] = value;
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
    media.mimeType = props.mimeType;
    // Also unconditional: an updated `sia` configuration and the seed suppliers
    // must land on the persistent instance even if the setup callback (which
    // only runs on mount) already ran. The host applies them on the next
    // (re)attach — the suppliers are consumed there, not here, so the seeds
    // never live in this component's render output, state, or the media
    // instance.
    media.workerConfig = sia;
    media.getAppKeySeed = getAppKeySeed;
    media.getSharingKeySeed = getSharingKeySeed;
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
