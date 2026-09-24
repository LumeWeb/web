/**
 * The shared Video.js v10 feature tuple (`src/sia-features.ts`). These specs
 * drive a real `@videojs/store` store built with `combine(...siaFeatures)` and
 * read state through the exported selectors exactly as consumers do — the one
 * tuple must seed BOTH the recovery and load slices, each event touching only
 * its own slice, and detach resetting both. No DOM, no worker, no mocks.
 */
import { describe, expect, it } from 'vitest';
import { combine, createStore } from '@videojs/store';
import { type PlayerFeature, type PlayerTarget } from '@videojs/core/dom';
import {
  siaFeatures,
  type SiaFeatures,
} from '../sia-features.ts';
import {
  selectSiaLoad,
  siaLoadFeature,
  type SiaLoadState,
} from '../sia-load-feature.ts';
import {
  selectSiaRecovery,
  siaRecoveryFeature,
  type SiaRecoveryState,
} from '../sia-recovery-feature.ts';
import { FakeSiaMedia, mediaTarget } from './fixtures/fake-sia-media.ts';

/** The inert recovery slice a fresh store / detached tuple reports. */
const INERT_RECOVERY = {
  active: false,
  reason: undefined,
  resumeSeconds: undefined,
  wantsPlay: undefined,
} as const;

/** The inert load slice a fresh store / detached tuple reports. */
const INERT_LOAD = { accepted: false } as const;

describe('the shared siaFeatures tuple', () => {
  it('carries the exact recovery then load feature identities in order', () => {
    expect(siaFeatures).toHaveLength(2);
    expect(siaFeatures[0]).toBe(siaRecoveryFeature);
    expect(siaFeatures[1]).toBe(siaLoadFeature);
  });

  it('is an explicitly typed mutable pair, not a readonly as-const literal', () => {
    // The exact public tuple type is the ordered pair of the individual
    // feature consts. Assigning the tuple to the explicit MUTABLE pair type
    // (`[PlayerFeature<...>, PlayerFeature<...>]`) proves it is not a
    // `readonly` as-const literal — React `createPlayer`'s `Features extends
    // AnyPlayerFeature[]` constraint rejects readonly tuples (TS2769).
    const ordered: SiaFeatures = [siaRecoveryFeature, siaLoadFeature];
    const exact: SiaFeatures = siaFeatures;
    const mutablePair: [PlayerFeature<SiaRecoveryState>, PlayerFeature<SiaLoadState>] = siaFeatures;
    void mutablePair;
    void ordered;
    void exact;
  });

  it('combining the tuple seeds both inert slices and updates only each own slice', () => {
    const media = new FakeSiaMedia();
    const store = createStore<PlayerTarget>()(combine(...siaFeatures));
    const detach = store.attach(mediaTarget(media));

    // Both slices initialize inert from a single combine(...siaFeatures).
    expect(selectSiaRecovery(store.state)).toEqual(INERT_RECOVERY);
    expect(selectSiaLoad(store.state)).toEqual(INERT_LOAD);

    // A recovery detail touches only the recovery slice.
    media.emitRecovery({ active: true, reason: 'decode', resumeSeconds: 12.5, wantsPlay: true });
    expect(selectSiaRecovery(store.state)).toEqual({
      active: true,
      reason: 'decode',
      resumeSeconds: 12.5,
      wantsPlay: true,
    });
    expect(selectSiaLoad(store.state)).toEqual(INERT_LOAD);

    // A load detail touches only the load slice.
    media.emitLoad({ accepted: true });
    expect(selectSiaRecovery(store.state)).toEqual({
      active: true,
      reason: 'decode',
      resumeSeconds: 12.5,
      wantsPlay: true,
    });
    expect(selectSiaLoad(store.state)).toEqual({ accepted: true });

    // Detaching resets BOTH slices and stops further events from leaking.
    detach();
    expect(selectSiaRecovery(store.state)).toEqual(INERT_RECOVERY);
    expect(selectSiaLoad(store.state)).toEqual(INERT_LOAD);

    media.emitRecovery({ active: true, reason: 'seek', resumeSeconds: 3, wantsPlay: false });
    media.emitLoad({ accepted: true });
    expect(selectSiaRecovery(store.state)).toEqual(INERT_RECOVERY);
    expect(selectSiaLoad(store.state)).toEqual(INERT_LOAD);
  });
});
