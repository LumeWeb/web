/**
 * React binding test for `useSiaLoad`: the hook must read the exact same
 * `selectSiaLoad` slice the non-React store tests drive, through a real
 * `@videojs/react` `createPlayer` `<Player>` and one shared feature. This
 * needs a DOM renderer, so it runs only where a real DOM exists (the package's
 * browser test mode); in node mode it is skipped so `SIA_TEST_ENV=node` stays
 * DOM-free.
 */
import { describe, expect, it } from 'vitest';
import type { Media } from '@videojs/media';
import {
  emitLoad,
  mountLoadReactHarness,
  waitFor,
} from './fixtures/load-react-harness.tsx';
import { FakeSiaMedia } from './fixtures/fake-sia-media.ts';

const IN_BROWSER = typeof document !== 'undefined';

/** The inert load state a Player without an accepted load reports. */
const INERT = {
  accepted: false,
};

describe('useSiaLoad within a @videojs/react Player', () => {
  it.skipIf(!IN_BROWSER)(
    'reads the exact same accepted state the shared selector publishes',
    async () => {
      const media = new FakeSiaMedia();
      const harness = await mountLoadReactHarness();

      try {
        // Inert before any media: the store exists with the feature, so the
        // selector returns the initial inert slice (not undefined).
        expect(harness.snapshots.at(-1)).toEqual(INERT);

        // Attach a media (the store's effect wires the feature's listener).
        await harness.attach(media as unknown as Media);

        // An accepted detail drives the same state a non-React store consumer
        // sees.
        emitLoad(media, { accepted: true });
        await waitFor(() => {
          expect(harness.snapshots.at(-1)).toEqual({ accepted: true });
        });

        // An unaccepted detail closes it in the hook too.
        emitLoad(media, { accepted: false });
        await waitFor(() => {
          expect(harness.snapshots.at(-1)).toEqual(INERT);
        });
      } finally {
        harness.unmount();
      }
    },
  );
});
