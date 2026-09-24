/**
 * The shared Video.js v10 source-info player feature + selector
 * (`src/sia-source-info-feature.ts`). These specs drive a real
 * `@videojs/store` store with a small EventTarget-like fake for the media,
 * and read state through the exported selector exactly as consumers (player
 * features, React `usePlayer(selectSiaSourceInfo)`) do. No DOM, no worker, no
 * mocks.
 *
 * Source info mirrors the host's `SOURCE_OK.info` verdict about the CURRENT
 * load. The public, collision-safe store slice is ONE globally unique key —
 * `sourceInfo: { active: false } | { active: true; info }` — so the `active`
 * and `info` fields are nested and can never collide with `siaRecoveryFeature`'s
 * top-level `active` (or any future feature's top-level keys) when the flat
 * player store combines them. The window is open (`active: true`) exactly
 * while the current load is accepted, carrying the exact typed `SourceInfo`
 * the worker vouched for (it says nothing about playability, and
 * `durationSeconds` may be `null`); the closed branch carries no `info`, so a
 * stale payload can never leak across loads.
 */
import { describe, expect, it } from 'vitest';
import { combine, createStore, flush, type UnknownState } from '@videojs/store';
import type { PlayerTarget } from '@videojs/core/dom';
import { type SourceInfo, workerMode } from '../protocol.ts';
import {
  selectSiaSourceInfo,
  siaSourceInfoFeature,
  type SiaSourceInfoState,
} from '../sia-source-info-feature.ts';
import { FakeSiaMedia, mediaTarget } from './fixtures/fake-sia-media.ts';

/** The inert source-info state a fresh store / detached feature reports. */
const INERT_SOURCE_INFO_STATE: SiaSourceInfoState = {
  sourceInfo: { active: false },
};

/** A representative worker-vouched SourceInfo (main-mode, no duration). */
const SOURCE_INFO: SourceInfo = {
  container: 'fmp4',
  durationSeconds: null,
  mime: 'video/mp4; codecs="avc1.64001f, mp4a.40.2"',
  mode: workerMode.main,
  tracks: [
    { codec: 'avc1.64001f', kind: 'video' },
    { codec: 'mp4a.40.2', kind: 'audio' },
  ],
};

/** A worker-vouched SourceInfo that names a duration (main-mode). */
const SOURCE_INFO_WITH_DURATION: SourceInfo = {
  container: 'fmp4',
  durationSeconds: 3919.08,
  mime: 'video/mp4; codecs="avc1.64001f, mp4a.40.2"',
  mode: workerMode.main,
  tracks: [{ codec: 'avc1.64001f', kind: 'video' }],
};

describe('the Sia source-info player feature', () => {
  it('starts inert and readable through the exported selector', () => {
    const store = createStore<PlayerTarget>()(siaSourceInfoFeature);

    expect(store.sourceInfo).toEqual({ active: false });
    expect(store.sourceInfo.active).toBe(false);
    expect(store.state).toEqual(INERT_SOURCE_INFO_STATE);
    expect(selectSiaSourceInfo(store.state)).toEqual(INERT_SOURCE_INFO_STATE);
    expect(typeof store.sourceInfo.active).toBe('boolean');
    expect('sourceInfo' in store.state).toBe(true);
  });

  it('reports undefined when the feature is not configured on the store', () => {
    const other = createStore<PlayerTarget>()({ name: 'other', state: () => ({ x: 1 as const }) });

    expect(selectSiaSourceInfo(other.state as UnknownState)).toBeUndefined();
  });

  it('opens from an active detail carrying the exact SourceInfo', () => {
    const media = new FakeSiaMedia();
    const store = createStore<PlayerTarget>()(siaSourceInfoFeature);
    store.attach(mediaTarget(media));

    media.emitSourceInfo({ active: true, info: SOURCE_INFO });

    expect(store.sourceInfo).toEqual({ active: true, info: SOURCE_INFO });
    expect(store.sourceInfo.active).toBe(true);
    expect(selectSiaSourceInfo(store.state)).toEqual({
      sourceInfo: { active: true, info: SOURCE_INFO },
    });
    // The forwarded payload is the exact object the worker vouched for.
    expect(selectSiaSourceInfo(store.state)?.sourceInfo).toBe(store.sourceInfo);
    // A narrowed read (the documented consumer shape) types `info` non-optional.
    const win = selectSiaSourceInfo(store.state)?.sourceInfo;
    if (win?.active) {
      expect(win.info).toBe(SOURCE_INFO);
      expect(win.info.durationSeconds).toBeNull();
    } else {
      expect.unreachable('the window must be open after an active detail');
    }
  });

  it('keeps a vouched duration while open', () => {
    const media = new FakeSiaMedia();
    const store = createStore<PlayerTarget>()(siaSourceInfoFeature);
    store.attach(mediaTarget(media));

    media.emitSourceInfo({ active: true, info: SOURCE_INFO_WITH_DURATION });

    expect(store.sourceInfo).toEqual({ active: true, info: SOURCE_INFO_WITH_DURATION });
    const win = selectSiaSourceInfo(store.state)?.sourceInfo;
    if (win?.active) {
      expect(win.info.durationSeconds).toBe(3919.08);
    } else {
      expect.unreachable('the window must be open after an active detail');
    }
    expect(selectSiaSourceInfo(store.state)).toEqual({
      sourceInfo: { active: true, info: SOURCE_INFO_WITH_DURATION },
    });
  });

  it('closing the source-info window clears the transient info field', () => {
    const media = new FakeSiaMedia();
    const store = createStore<PlayerTarget>()(siaSourceInfoFeature);
    store.attach(mediaTarget(media));

    media.emitSourceInfo({ active: true, info: SOURCE_INFO });
    expect(store.sourceInfo.active).toBe(true);

    media.emitSourceInfo({ active: false });

    expect(store.sourceInfo).toEqual({ active: false });
    expect(store.sourceInfo.active).toBe(false);
    expect(selectSiaSourceInfo(store.state)).toEqual(INERT_SOURCE_INFO_STATE);
  });

  it('treats the worker-vouched payload as immutable and never mutates it', () => {
    const media = new FakeSiaMedia();
    const store = createStore<PlayerTarget>()(siaSourceInfoFeature);
    store.attach(mediaTarget(media));

    // Deep-freeze the payload (including the nested `tracks` array): any
    // mutation attempt by the feature (or the store) throws in strict mode,
    // so a green test pins the "treated immutable, never cloned or mutated"
    // contract for the shared wire `SourceInfo`.
    const frozen: SourceInfo = Object.freeze({
      ...SOURCE_INFO,
      tracks: Object.freeze(SOURCE_INFO.tracks.map((track) => Object.freeze({ ...track }))),
    });
    expect(() => media.emitSourceInfo({ active: true, info: frozen })).not.toThrow();

    const win = selectSiaSourceInfo(store.state)?.sourceInfo;
    if (win?.active) {
      // The store retains the exact object (identity preserved, not cloned).
      expect(win.info).toBe(frozen);
      expect(win.info.tracks).toBe(frozen.tracks);
    } else {
      expect.unreachable('the window must be open after an active detail');
    }
  });

  it('detaching stops updates from the detached media and resets to inert', () => {
    const media = new FakeSiaMedia();
    const store = createStore<PlayerTarget>()(siaSourceInfoFeature);
    const detach = store.attach(mediaTarget(media));

    media.emitSourceInfo({ active: true, info: SOURCE_INFO });
    expect(store.sourceInfo.active).toBe(true);

    detach();

    expect(store.sourceInfo).toEqual({ active: false });
    expect(store.sourceInfo.active).toBe(false);

    // A detached media's event must not leak into the store again.
    media.emitSourceInfo({ active: true, info: SOURCE_INFO_WITH_DURATION });
    expect(store.sourceInfo).toEqual({ active: false });
  });

  it('reattaching starts from a fresh inert window and tracks only the new media', () => {
    const first = new FakeSiaMedia();
    const second = new FakeSiaMedia();
    const store = createStore<PlayerTarget>()(siaSourceInfoFeature);
    const detach = store.attach(mediaTarget(first));

    first.emitSourceInfo({ active: true, info: SOURCE_INFO });
    expect(store.sourceInfo.active).toBe(true);

    detach();
    const detachSecond = store.attach(mediaTarget(second));

    expect(store.sourceInfo).toEqual({ active: false });

    // The superseded media is no longer observed.
    first.emitSourceInfo({ active: true, info: SOURCE_INFO_WITH_DURATION });
    expect(store.sourceInfo).toEqual({ active: false });

    second.emitSourceInfo({ active: true, info: SOURCE_INFO_WITH_DURATION });
    expect(store.sourceInfo).toEqual({ active: true, info: SOURCE_INFO_WITH_DURATION });
    detachSecond();
  });

  it('initializes without a target: the state factory and selector are safe at module time', () => {
    // `createSelector` already ran the state factory at import; recreating the
    // store here exercises the same path without any attached media and proves
    // the factory never calls target()/get()/set() (which throw pre-attach).
    expect(() => {
      const store = createStore<PlayerTarget>()(siaSourceInfoFeature);
      void selectSiaSourceInfo(store.state);
      expect(store.sourceInfo.active).toBe(false);
    }).not.toThrow();
    expect(selectSiaSourceInfo.displayName).toBe('siaSourceInfo');
  });

  it('a non-React store assembled like a player store publishes and notifies subscribers', () => {
    const media = new FakeSiaMedia();
    // Mirror how @videojs/react createPlayer assembles the store:
    // combine(...features) -> createStore<PlayerTarget>()(slice).
    const store = createStore<PlayerTarget>()(combine(siaSourceInfoFeature));
    const seen: SiaSourceInfoState[] = [];
    const unsubscribe = store.subscribe(() => seen.push(selectSiaSourceInfo(store.state)!));

    const detach = store.attach(mediaTarget(media));
    expect(seen).toEqual([]);

    media.emitSourceInfo({ active: true, info: SOURCE_INFO });
    // The store notifies subscribers on a scheduled flush; drive it with the
    // same public `flush` the store exports.
    flush();

    expect(seen).toEqual([{ sourceInfo: { active: true, info: SOURCE_INFO } }]);
    expect(store.sourceInfo.active).toBe(true);
    // The selector reads exactly the state a React subscription would receive.
    expect(selectSiaSourceInfo(store.state)).toEqual({
      sourceInfo: { active: true, info: SOURCE_INFO },
    });
    const win = selectSiaSourceInfo(store.state)?.sourceInfo;
    if (win?.active) {
      expect(win.info.mode).toBe(workerMode.main);
    } else {
      expect.unreachable('the window must be open after an active detail');
    }

    detach();
    flush();
    expect(seen.at(-1)).toEqual(INERT_SOURCE_INFO_STATE);
    expect(store.sourceInfo.active).toBe(false);
    unsubscribe();
  });
});
