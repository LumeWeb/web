/**
 * The shared Video.js v10 feature tuple (`src/sia-features.ts`). These specs
 * drive a real `@videojs/store` store built with `combine(...siaFeatures)` and
 * read state through the exported selectors exactly as consumers do — the one
 * tuple must seed the recovery, load and source-info slices, each event
 * touching only its own slice, and detach resetting all three. No DOM, no
 * worker, no mocks.
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
import {
  selectSiaSourceInfo,
  siaSourceInfoFeature,
  type SiaSourceInfoState,
} from '../sia-source-info-feature.ts';
import { type SourceInfo, workerMode } from '../protocol.ts';
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

/** The inert source-info slice a fresh store / detached tuple reports. */
const INERT_SOURCE_INFO = {
  sourceInfo: { active: false },
} as const;

/** A representative worker-vouched SourceInfo for the tuple's third slice. */
const SOURCE_INFO: SourceInfo = {
  container: 'fmp4',
  durationSeconds: 3919.08,
  mime: 'video/mp4; codecs="avc1.64001f, mp4a.40.2"',
  mode: workerMode.main,
  tracks: [{ codec: 'avc1.64001f', kind: 'video' }],
};

describe('the shared siaFeatures tuple', () => {
  it('carries the exact recovery, load then source-info feature identities in order', () => {
    expect(siaFeatures).toHaveLength(3);
    expect(siaFeatures[0]).toBe(siaRecoveryFeature);
    expect(siaFeatures[1]).toBe(siaLoadFeature);
    expect(siaFeatures[2]).toBe(siaSourceInfoFeature);
  });

  it('is an explicitly typed mutable triple, not a readonly as-const literal', () => {
    // The exact public tuple type is the ordered triple of the individual
    // feature consts. Assigning the tuple to the explicit MUTABLE triple type
    // (`[PlayerFeature<...>, PlayerFeature<...>, PlayerFeature<...>]`) proves
    // it is not a `readonly` as-const literal — React `createPlayer`'s
    // `Features extends AnyPlayerFeature[]` constraint rejects readonly tuples
    // (TS2769).
    const ordered: SiaFeatures = [siaRecoveryFeature, siaLoadFeature, siaSourceInfoFeature];
    const exact: SiaFeatures = siaFeatures;
    const mutableTriple: [
      PlayerFeature<SiaRecoveryState>,
      PlayerFeature<SiaLoadState>,
      PlayerFeature<SiaSourceInfoState>,
    ] = siaFeatures;
    void mutableTriple;
    void ordered;
    void exact;
  });

  it('combining the tuple seeds all three inert slices and updates only each own slice', () => {
    const media = new FakeSiaMedia();
    const store = createStore<PlayerTarget>()(combine(...siaFeatures));
    const detach = store.attach(mediaTarget(media));

    // All three slices initialize inert from a single combine(...siaFeatures).
    expect(selectSiaRecovery(store.state)).toEqual(INERT_RECOVERY);
    expect(selectSiaLoad(store.state)).toEqual(INERT_LOAD);
    expect(selectSiaSourceInfo(store.state)).toEqual(INERT_SOURCE_INFO);

    // A source-info detail touches only the source-info slice.
    media.emitSourceInfo({ active: true, info: SOURCE_INFO });
    expect(selectSiaSourceInfo(store.state)).toEqual({ sourceInfo: { active: true, info: SOURCE_INFO } });
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
    expect(selectSiaSourceInfo(store.state)).toEqual({ sourceInfo: { active: true, info: SOURCE_INFO } });
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
    expect(selectSiaSourceInfo(store.state)).toEqual({ sourceInfo: { active: true, info: SOURCE_INFO } });

    // Detaching resets ALL THREE slices and stops further events from leaking.
    detach();
    expect(selectSiaRecovery(store.state)).toEqual(INERT_RECOVERY);
    expect(selectSiaLoad(store.state)).toEqual(INERT_LOAD);
    expect(selectSiaSourceInfo(store.state)).toEqual(INERT_SOURCE_INFO);

    media.emitRecovery({ active: true, reason: 'seek', resumeSeconds: 3, wantsPlay: false });
    media.emitLoad({ accepted: true });
    media.emitSourceInfo({ active: true, info: SOURCE_INFO });
    expect(selectSiaRecovery(store.state)).toEqual(INERT_RECOVERY);
    expect(selectSiaLoad(store.state)).toEqual(INERT_LOAD);
    expect(selectSiaSourceInfo(store.state)).toEqual(INERT_SOURCE_INFO);
  });

  it("keeps the three slices' top-level store keys disjoint for the flat combine", () => {
    // combine(...siaFeatures) (and React createPlayer) write every feature's
    // keys to ONE top-level state object (Object.assign-style flattening; set()
    // shallow-patches, never deletes), so a shared key would couple slices:
    // recovery owns `active`, load owns `accepted`, and source info owns the
    // single collision-safe `sourceInfo` key (its own `active`/`info` are
    // NESTED, not top-level). No key may appear in more than one slice.
    const recoveryKeys = new Set(Object.keys(INERT_RECOVERY));
    const loadKeys = new Set(Object.keys(INERT_LOAD));
    const sourceInfoKeys = new Set(Object.keys(INERT_SOURCE_INFO));

    const overlap = [...recoveryKeys, ...loadKeys, ...sourceInfoKeys].filter(
      (key, index, all) => all.indexOf(key) !== index,
    );
    expect(overlap).toEqual([]);
    expect(recoveryKeys.has('active')).toBe(true);
    expect(loadKeys.has('accepted')).toBe(true);
    // Source info does NOT squat on the flat `active`/`info` keys.
    expect(sourceInfoKeys.has('active')).toBe(false);
    expect(sourceInfoKeys.has('info')).toBe(false);
    expect(sourceInfoKeys).toEqual(new Set(['sourceInfo']));
  });
});
