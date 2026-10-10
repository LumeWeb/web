/**
 * Video.js v10 Sia player constitution: the module-stable `createPlayer` shell
 * every Sia playback screen shares.
 *
 * The store is built once at module scope from a pure feature composition,
 * the packaged `videoFeatures` (playback/volume/time/fullscreen/…), then the
 * Sia triple (`siaFeatures`: recovery, load, source-info), then the opt-in
 * `siaProgressFeature` (reader milestones, deliberately not part of the
 * triple). Because the feature tuple is composed by an exported pure helper,
 * node unit tests can pin the exact ordered feature contract without a DOM.
 *
 * The shell renders the generated `Player` (context provider, no host
 * element) around `VideoSkin` (Container + default video chrome), with
 * arbitrary children, later chunks put the `<SiaVideo>` media element and an
 * inside-Player status child here, both of which read the same store through
 * the exported `usePlayer` hooks. Video.js v10 only: no v8 legacy player, no
 * `videojs()` imperative lifecycle, no manual disposal code.
 */

import { createPlayer, videoFeatures } from "@videojs/react";
import { VideoSkin, type VideoSkinProps } from "@videojs/react/video";
import type { PlayerStore, VideoFeatures } from "@videojs/core/dom";
import {
  siaFeatures,
  type SiaFeatures,
  siaProgressFeature,
} from "@lumeweb/sia-video-source";
import type { ComponentProps } from "react";

/**
 * The ordered player-feature tuple: packaged video features, then the Sia
 * triple, then the opt-in reader-progress feature.
 */
export type SiaPlayerFeatures = [
  ...VideoFeatures,
  ...SiaFeatures,
  typeof siaProgressFeature,
];

/** Props accepted by the Sia player shell: player config + video skin props. */
export interface SiaPlayerProps
  extends Omit<SiaPlayerProviderProps, "children">, VideoSkinProps {}

/** The typed player store the Sia shell's `Player`/`usePlayer` expose. */
export type SiaPlayerStore = PlayerStore<SiaPlayerFeatures>;

/** The generated `Player` provider's config props, minus `children`. */
type SiaPlayerProviderProps = ComponentProps<typeof Player>;

/**
 * Pure feature-composition helper: builds the Sia player feature tuple from
 * the same module-stable inputs `createPlayer` combines. Returns a fresh
 * tuple per call (pure), while every element keeps its canonical identity.
 */
export function siaPlayerFeatures(): SiaPlayerFeatures {
  return [...videoFeatures, ...siaFeatures, siaProgressFeature];
}

/** The Sia player shell's `Player` (context provider) and typed hooks. */
const { Player, useMedia, usePlayer } = createPlayer({
  displayName: "SiaPlayer",
  features: siaPlayerFeatures(),
});

/**
 * Renders the Sia `Player` (feature-backed store provider) around the default
 * `VideoSkin`, with arbitrary in-player children. A later chunk passes the
 * Sia media element and any inside-Player status child through `children`;
 * both stay inside the Player context, so they can subscribe via `usePlayer`.
 */
export function SiaPlayer({ children, ...rest }: SiaPlayerProps) {
  const { className, renderPoster, style, ...playerProps } = rest;
  return (
    <Player {...playerProps}>
      <VideoSkin
        className={className}
        renderPoster={renderPoster}
        style={style}>
        {children}
      </VideoSkin>
    </Player>
  );
}

export { useMedia, usePlayer };
