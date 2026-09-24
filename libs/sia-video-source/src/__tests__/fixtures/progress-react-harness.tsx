/**
 * A minimal React harness for `useSiaProgress`: mounts a real `@videojs/react`
 * `createPlayer` `<Player>` built with the OPT-IN `siaProgressFeature`,
 * attaches the same fake media the non-React progress spec uses, and records
 * every reader-progress snapshot the hook re-renders with. Test-only; lives
 * outside the package surface.
 *
 * The harness deliberately does not use React `act` (see `load-react-harness`
 * for why): updates are awaited by polling for the next hook snapshot.
 */
import { createRoot } from 'react-dom/client';
import { createPlayer, useMediaAttach, usePlayer } from '@videojs/react';
import type { Media } from '@videojs/media';
import { useSiaProgress } from '../../react/index.tsx';
import {
  siaProgressFeature,
  type SiaProgressState,
} from '../../sia-progress-feature.ts';
import type { SiaWorkerMilestoneDetail } from '../../sia-video-source.ts';
import { FakeSiaMedia } from './fake-sia-media.ts';
import { waitFor } from './load-react-harness.tsx';

const { Player } = createPlayer({
  displayName: 'SiaProgressTestPlayer',
  features: [siaProgressFeature],
});

export interface ProgressReactHarness {
  /** Attach a media to the player (mirrors the real element -> player handoff). */
  attach(media: Media | null): Promise<void>;
  /** Every progress value the mounted probe has rendered with, in order. */
  snapshots: (SiaProgressState | undefined)[];
  /** Unmount the root and detach from the DOM. */
  unmount(): void;
}

/** Fire a milestone detail through the attached media (the caller polls). */
export function emitMilestone(media: FakeSiaMedia, detail: SiaWorkerMilestoneDetail): void {
  media.emitMilestone(detail);
}

export async function mountProgressReactHarness(): Promise<ProgressReactHarness> {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const snapshots: (SiaProgressState | undefined)[] = [];
  let setMedia: ((media: Media | null) => void) | null = null;
  let readTarget: (() => unknown) | null = null;

  function Probe(): null {
    // The standalone usePlayer() returns the (untyped) store without
    // subscribing; capture it so the harness can inspect `target` (when the
    // Player has attached) without calling a hook outside a component.
    const store = usePlayer();
    readTarget = () => (store as { target: unknown }).target;
    snapshots.push(useSiaProgress());
    setMedia = useMediaAttach() ?? null;
    return null;
  }

  root.render(
    <Player>
      <Probe />
    </Player>,
  );
  await waitFor(() => {
    if (setMedia === null) throw new Error('probe not mounted');
  });

  return {
    attach: async (media) => {
      setMedia?.(media);
      await waitFor(() => {
        if ((readTarget?.() as (null | { media: unknown }))?.media !== media) {
          throw new Error('store not attached');
        }
      });
    },
    snapshots,
    unmount: () => {
      root.unmount();
      container.remove();
    },
  };
}

export { waitFor };
