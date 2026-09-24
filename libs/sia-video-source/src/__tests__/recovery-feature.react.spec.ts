/**
 * React binding test for `useSiaRecovery`: the hook must read the exact same
 * `selectSiaRecovery` slice the non-React store tests drive, through a real
 * `@videojs/react` `createPlayer` `<Player>` and one shared feature. This
 * needs a DOM renderer, so it runs only where a real DOM exists (the package's
 * browser test mode); in node mode it is skipped so `SIA_TEST_ENV=node` stays
 * DOM-free.
 */
import { describe, expect, it } from 'vitest';
import type { Media } from '@videojs/media';
import {
  emitRecovery,
  mountRecoveryReactHarness,
  waitFor,
} from './fixtures/recovery-react-harness.tsx';
import { FakeSiaMedia } from './fixtures/fake-sia-media.ts';

const IN_BROWSER = typeof document !== 'undefined';

/** The inert recovery state a Player without an open window reports. */
const INERT = {
  active: false,
  reason: undefined,
  resumeSeconds: undefined,
  wantsPlay: undefined,
};

describe('useSiaRecovery within a @videojs/react Player', () => {
  it.skipIf(!IN_BROWSER)(
    'reports the same recovery state the shared selector publishes',
    async () => {
      const media = new FakeSiaMedia();
      const harness = await mountRecoveryReactHarness();

      try {
        // Inert before any media: the store exists with the feature, so the
        // selector returns the initial inert slice (not undefined).
        expect(harness.snapshots.at(-1)).toEqual(INERT);

        // Attach a media (the store's effect wires the feature's listener).
        await harness.attach(media as unknown as Media);

        // An active detail drives the same state a non-React store consumer sees.
        emitRecovery(media, {
          active: true,
          reason: 'decode',
          resumeSeconds: 12.5,
          wantsPlay: true,
        });
        await waitFor(() => {
          expect(harness.snapshots.at(-1)).toEqual({
            active: true,
            reason: 'decode',
            resumeSeconds: 12.5,
            wantsPlay: true,
          });
        });

        // Closing the window clears the transient fields in the hook too.
        emitRecovery(media, { active: false });
        await waitFor(() => {
          expect(harness.snapshots.at(-1)).toEqual(INERT);
        });
      } finally {
        harness.unmount();
      }
    },
  );
});
