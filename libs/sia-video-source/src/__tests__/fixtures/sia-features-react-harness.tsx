/**
 * A minimal React harness for the shared `siaFeatures` tuple: mounts a real
 * `@videojs/react` `createPlayer` `<Player>` built with the SHARED tuple
 * (`features: siaFeatures` — not separate per-feature players), attaches the
 * same fake media the non-React specs use, and records every recovery AND load
 * snapshot the two hooks re-render with — proving one Player/store driven by
 * one feature tuple serves both hooks against the same store.
 *
 * The harness deliberately does not use React `act`: `act` only ships in the
 * development React build (the package's browser tests run against the
 * bundled production build), so updates are awaited by observing the player
 * store itself (`store.target`) and by polling for the next hook snapshot —
 * the same way a browser user would observe the player.
 */
import { createRoot } from 'react-dom/client';
import { createPlayer, useMediaAttach, usePlayer } from '@videojs/react';
import type { Media } from '@videojs/media';
import { useSiaLoad, useSiaRecovery } from '../../react/index.tsx';
import { siaFeatures } from '../../sia-features.ts';
import type { SiaLoadState } from '../../sia-load-feature.ts';
import type { SiaRecoveryState } from '../../sia-recovery-feature.ts';
import type { RecoveryChangeDetail, SiaLoadChangeDetail } from '../../sia-video-source.ts';
import { FakeSiaMedia } from './fake-sia-media.ts';

const { Player } = createPlayer({
  displayName: 'SiaFeaturesTestPlayer',
  features: siaFeatures,
});

export interface SiaFeaturesReactHarness {
  /** Attach a media to the player (mirrors the real element -> player handoff). */
  attach(media: Media | null): Promise<void>;
  /** Every load value the mounted probe has rendered with, in order. */
  loadSnapshots: (SiaLoadState | undefined)[];
  /** Every recovery value the mounted probe has rendered with, in order. */
  recoverySnapshots: (SiaRecoveryState | undefined)[];
  /** Unmount the root and detach from the DOM. */
  unmount(): void;
}

/** Fire a load detail through the attached media (the caller polls). */
export function emitLoad(media: FakeSiaMedia, detail: SiaLoadChangeDetail): void {
  media.emitLoad(detail);
}

/** Fire a recovery detail through the attached media (the caller polls). */
export function emitRecovery(media: FakeSiaMedia, detail: RecoveryChangeDetail): void {
  media.emitRecovery(detail);
}

export async function mountSiaFeaturesReactHarness(): Promise<SiaFeaturesReactHarness> {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const recoverySnapshots: (SiaRecoveryState | undefined)[] = [];
  const loadSnapshots: (SiaLoadState | undefined)[] = [];
  let setMedia: ((media: Media | null) => void) | null = null;
  let readTarget: (() => unknown) | null = null;

  function Probe(): null {
    // The standalone usePlayer() returns the (untyped) store without
    // subscribing; capture it so the harness can inspect `target` (when the
    // Player has attached) without calling a hook outside a component.
    const store = usePlayer();
    readTarget = () => (store as { target: unknown }).target;
    recoverySnapshots.push(useSiaRecovery());
    loadSnapshots.push(useSiaLoad());
    setMedia = useMediaAttach() ?? null;
    return null;
  }

  root.render(
    <Player>
      <Probe />
    </Player>,
  );
  // Initial render + effects settle before the caller drives anything.
  await waitFor(() => {
    if (setMedia === null) throw new Error('probe not mounted');
  });

  return {
    attach: async (media) => {
      setMedia?.(media);
      // The Player attaches the store in an effect after the commit; wait
      // until the store really reports the media as its target.
      await waitFor(() => {
        if ((readTarget?.() as (null | { media: unknown }))?.media !== media) {
          throw new Error('store not attached');
        }
      });
    },
    loadSnapshots,
    recoverySnapshots,
    unmount: () => {
      root.unmount();
      container.remove();
    },
  };
}

/** Poll until `ready()` stops throwing or the timeout elapses. */
export async function waitFor(ready: () => void, timeoutMs = 2000): Promise<void> {
  const start = Date.now();
  for (;;) {
    try {
      ready();
      return;
    } catch {
      if (Date.now() - start > timeoutMs) {
        ready(); // rethrow the last assertion for a readable failure
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}
