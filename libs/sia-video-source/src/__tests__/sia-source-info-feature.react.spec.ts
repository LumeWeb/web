/**
 * React binding test for `useSiaSourceInfo`: the hook must read the exact same
 * `selectSiaSourceInfo` slice the non-React store tests drive, through a real
 * `@videojs/react` `createPlayer` `<Player>` and one shared feature. This
 * needs a DOM renderer, so it runs only where a real DOM exists (the package's
 * browser test mode); in node mode it is skipped so `SIA_TEST_ENV=node` stays
 * DOM-free.
 */
import { describe, expect, it } from 'vitest';
import type { Media } from '@videojs/media';
import { type SourceInfo, workerMode } from '../protocol.ts';
import {
  emitSourceInfo,
  mountSourceInfoReactHarness,
  waitFor,
} from './fixtures/source-info-react-harness.tsx';
import { FakeSiaMedia } from './fixtures/fake-sia-media.ts';

const IN_BROWSER = typeof document !== 'undefined';

/** The inert source-info state a Player without an open window reports. */
const INERT = {
  sourceInfo: { active: false },
};

/** A representative worker-vouched SourceInfo the hook must surface. */
const SOURCE_INFO: SourceInfo = {
  container: 'fmp4',
  durationSeconds: 3919.08,
  mime: 'video/mp4; codecs="avc1.64001f, mp4a.40.2"',
  mode: workerMode.main,
  tracks: [{ codec: 'avc1.64001f', kind: 'video' }],
};

describe('useSiaSourceInfo within a @videojs/react Player', () => {
  it.skipIf(!IN_BROWSER)(
    'reads the exact same source-info state the shared selector publishes',
    async () => {
      const media = new FakeSiaMedia();
      const harness = await mountSourceInfoReactHarness();

      try {
        // Inert before any media: the store exists with the feature, so the
        // selector returns the initial inert slice (not undefined).
        expect(harness.snapshots.at(-1)).toEqual(INERT);

        // Attach a media (the store's effect wires the feature's listener).
        await harness.attach(media as unknown as Media);

        // An active detail drives the same state a non-React store consumer
        // sees, carrying the exact SourceInfo under the nested window.
        emitSourceInfo(media, { active: true, info: SOURCE_INFO });
        await waitFor(() => {
          expect(harness.snapshots.at(-1)).toEqual({
            sourceInfo: { active: true, info: SOURCE_INFO },
          });
        });
        const win = harness.snapshots.at(-1)?.sourceInfo;
        if (win?.active) {
          expect(win.info.durationSeconds).toBe(3919.08);
        } else {
          expect.unreachable('the window must be open after an active detail');
        }

        // Closing the window clears the info field in the hook too.
        emitSourceInfo(media, { active: false });
        await waitFor(() => {
          expect(harness.snapshots.at(-1)).toEqual(INERT);
        });
        expect(harness.snapshots.at(-1)?.sourceInfo).toEqual({ active: false });
      } finally {
        harness.unmount();
      }
    },
  );
});
