/**
 * React binding test for the shared `siaFeatures` tuple: a real
 * `@videojs/react` `createPlayer` `<Player>` built with `features: siaFeatures`
 * (the shared tuple, not separate per-feature players) must drive all three
 * hooks (`useSiaRecovery`, `useSiaLoad` and `useSiaSourceInfo`) from the same
 * store, each slice updating only on its own event — exactly the slices the
 * non-React store specs drive through `combine(...siaFeatures)`. This needs a
 * DOM renderer, so it runs only where a real DOM exists (the package's browser
 * test mode); in node mode it is skipped so `SIA_TEST_ENV=node` stays
 * DOM-free.
 */
import { describe, expect, it } from 'vitest';
import type { Media } from '@videojs/media';
import { type SourceInfo, workerMode } from '../protocol.ts';
import {
  emitLoad,
  emitRecovery,
  emitSourceInfo,
  mountSiaFeaturesReactHarness,
  waitFor,
} from './fixtures/sia-features-react-harness.tsx';
import { FakeSiaMedia } from './fixtures/fake-sia-media.ts';

const IN_BROWSER = typeof document !== 'undefined';

/** The inert recovery slice a Player without an open window reports. */
const INERT_RECOVERY = {
  active: false,
  reason: undefined,
  resumeSeconds: undefined,
  wantsPlay: undefined,
};

/** The open recovery window driven through the shared tuple. */
const ACTIVE_RECOVERY = {
  active: true,
  reason: 'decode',
  resumeSeconds: 12.5,
  wantsPlay: true,
};

/** The inert load slice a Player without an accepted load reports. */
const INERT_LOAD = { accepted: false };

/** The accepted load slice driven through the shared tuple. */
const ACCEPTED_LOAD = { accepted: true };

/** The inert source-info slice a Player without an open window reports. */
const INERT_SOURCE_INFO = {
  sourceInfo: { active: false },
};

/** A representative worker-vouched SourceInfo driven through the shared tuple. */
const SOURCE_INFO: SourceInfo = {
  container: 'fmp4',
  durationSeconds: 3919.08,
  mime: 'video/mp4; codecs="avc1.64001f, mp4a.40.2"',
  mode: workerMode.main,
  tracks: [{ codec: 'avc1.64001f', kind: 'video' }],
};

describe('all three hooks on a Player built with the shared siaFeatures tuple', () => {
  it.skipIf(!IN_BROWSER)(
    'read and update the same store, each slice on its own event',
    async () => {
      const media = new FakeSiaMedia();
      const harness = await mountSiaFeaturesReactHarness();

      try {
        // All slices inert before any media is attached.
        expect(harness.recoverySnapshots.at(-1)).toEqual(INERT_RECOVERY);
        expect(harness.loadSnapshots.at(-1)).toEqual(INERT_LOAD);
        expect(harness.sourceInfoSnapshots.at(-1)).toEqual(INERT_SOURCE_INFO);

        // Attach a media (the store's effect wires all features' listeners).
        await harness.attach(media as unknown as Media);

        // A recovery detail moves only the recovery hook.
        emitRecovery(media, {
          active: true,
          reason: 'decode',
          resumeSeconds: 12.5,
          wantsPlay: true,
        });
        await waitFor(() => {
          expect(harness.recoverySnapshots.at(-1)).toEqual(ACTIVE_RECOVERY);
        });
        expect(harness.loadSnapshots.at(-1)).toEqual(INERT_LOAD);
        expect(harness.sourceInfoSnapshots.at(-1)).toEqual(INERT_SOURCE_INFO);

        // A load detail moves only the load hook.
        emitLoad(media, { accepted: true });
        await waitFor(() => {
          expect(harness.loadSnapshots.at(-1)).toEqual(ACCEPTED_LOAD);
        });
        expect(harness.recoverySnapshots.at(-1)).toEqual(ACTIVE_RECOVERY);
        expect(harness.sourceInfoSnapshots.at(-1)).toEqual(INERT_SOURCE_INFO);

        // A source-info detail moves only the source-info hook.
        emitSourceInfo(media, { active: true, info: SOURCE_INFO });
        await waitFor(() => {
          expect(harness.sourceInfoSnapshots.at(-1)).toEqual({
            sourceInfo: { active: true, info: SOURCE_INFO },
          });
        });
        expect(harness.recoverySnapshots.at(-1)).toEqual(ACTIVE_RECOVERY);
        expect(harness.loadSnapshots.at(-1)).toEqual(ACCEPTED_LOAD);

        // Closing all three windows returns all hooks to inert.
        emitSourceInfo(media, { active: false });
        await waitFor(() => {
          expect(harness.sourceInfoSnapshots.at(-1)).toEqual(INERT_SOURCE_INFO);
        });
        emitLoad(media, { accepted: false });
        await waitFor(() => {
          expect(harness.loadSnapshots.at(-1)).toEqual(INERT_LOAD);
        });
        emitRecovery(media, { active: false });
        await waitFor(() => {
          expect(harness.recoverySnapshots.at(-1)).toEqual(INERT_RECOVERY);
        });
      } finally {
        harness.unmount();
      }
    },
  );
});
