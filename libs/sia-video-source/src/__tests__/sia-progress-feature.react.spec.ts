/**
 * React binding test for `useSiaProgress`: the hook must read the exact same
 * `selectSiaProgress` state the non-React store tests drive, through a real
 * `@videojs/react` `createPlayer` `<Player>` and the opt-in
 * `siaProgressFeature` composed explicitly by the app (it is not part of
 * `siaFeatures`). This needs a DOM renderer, so it runs only where a real DOM
 * exists (the package's browser test mode); in node mode it is skipped so
 * `SIA_TEST_ENV=node` stays DOM-free.
 */
import { describe, expect, it } from 'vitest';
import type { Media } from '@videojs/media';
import {
  emitMilestone,
  mountProgressReactHarness,
  waitFor,
} from './fixtures/progress-react-harness.tsx';
import { FakeSiaMedia } from './fixtures/fake-sia-media.ts';
import type { SiaWorkerMilestoneDetail } from '../sia-video-source.ts';

const IN_BROWSER = typeof document !== 'undefined';

/** A milestone detail shaped like the host's dispatch (read.retry naming attempt 2). */
const RETRY_MILESTONE: SiaWorkerMilestoneDetail = {
  detail: { attempt: 2, position: 0 },
  level: 'debug',
  name: 'read.retry',
  requestId: 7,
  sequence: 1,
};

describe('useSiaProgress within a @videojs/react Player', () => {
  it.skipIf(!IN_BROWSER)(
    'reads the exact same reader-progress state the shared selector publishes',
    async () => {
      const media = new FakeSiaMedia();
      const harness = await mountProgressReactHarness();

      try {
        // Inert before any media: the store exists with the feature, so the
        // selector returns the initial inert state (not undefined).
        expect(harness.snapshots.at(-1)).toEqual({
          bytesRead: 0,
          last: undefined,
          reading: false,
          reads: 0,
          retries: 0,
          retrying: false,
        });

        await harness.attach(media as unknown as Media);

        // A window opens, then a retry becomes active: the demo's
        // `(retrying)` fact, driven by a real milestone.
        emitMilestone(media, {
          detail: { position: 0 },
          level: 'debug',
          name: 'read.window-start',
          requestId: 7,
          sequence: 1,
        });
        emitMilestone(media, RETRY_MILESTONE);
        await waitFor(() => {
          expect(harness.snapshots.at(-1)).toEqual({
            bytesRead: 0,
            last: { name: 'read.retry', position: 0, requestId: 7 },
            reading: true,
            reads: 1,
            retries: 1,
            retrying: true,
          });
        });

        // The window completes: retrying clears, counts stay.
        emitMilestone(media, {
          detail: { position: 0 },
          level: 'debug',
          name: 'read.window-complete',
          requestId: 7,
          sequence: 3,
        });
        await waitFor(() => {
          expect(harness.snapshots.at(-1)?.retrying).toBe(false);
          expect(harness.snapshots.at(-1)?.reading).toBe(false);
          expect(harness.snapshots.at(-1)?.retries).toBe(1);
        });
      } finally {
        harness.unmount();
      }
    },
  );
});
