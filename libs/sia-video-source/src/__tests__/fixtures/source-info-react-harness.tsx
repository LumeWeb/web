/**
 * A minimal React harness for `useSiaSourceInfo`: mounts a real `@videojs/react`
 * `createPlayer` `<Player>` built with `siaSourceInfoFeature`, attaches the
 * same fake media the non-React source-info spec uses, and records every
 * source-info snapshot the hook re-renders with. Test-only; lives outside the
 * package surface (`.spec.ts` files stay runnable against `@videojs/store`
 * alone).
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
import { useSiaSourceInfo } from '../../react/index.tsx';
import {
  siaSourceInfoFeature,
  type SiaSourceInfoState,
} from '../../sia-source-info-feature.ts';
import type { SiaSourceInfoChangeDetail } from '../../sia-video-source.ts';
import { FakeSiaMedia } from './fake-sia-media.ts';

const { Player } = createPlayer({
  displayName: 'SiaSourceInfoTestPlayer',
  features: [siaSourceInfoFeature],
});

export interface SourceInfoReactHarness {
  /** Attach a media to the player (mirrors the real element -> player handoff). */
  attach(media: Media | null): Promise<void>;
  /** Every source-info value the mounted probe has rendered with, in order. */
  snapshots: (SiaSourceInfoState | undefined)[];
  /** Unmount the root and detach from the DOM. */
  unmount(): void;
}

/** Fire a source-info detail through the attached media (the caller polls). */
export function emitSourceInfo(media: FakeSiaMedia, detail: SiaSourceInfoChangeDetail): void {
  media.emitSourceInfo(detail);
}

export async function mountSourceInfoReactHarness(): Promise<SourceInfoReactHarness> {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  const snapshots: (SiaSourceInfoState | undefined)[] = [];
  let setMedia: ((media: Media | null) => void) | null = null;
  let readTarget: (() => unknown) | null = null;

  function Probe(): null {
    // The standalone usePlayer() returns the (untyped) store without
    // subscribing; capture it so the harness can inspect `target` (when the
    // Player has attached) without calling a hook outside a component.
    const store = usePlayer();
    readTarget = () => (store as { target: unknown }).target;
    snapshots.push(useSiaSourceInfo());
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
    snapshots,
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
