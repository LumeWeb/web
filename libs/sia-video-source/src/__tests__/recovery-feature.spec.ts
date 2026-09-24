/**
 * The shared Video.js v10 recovery player feature + selector
 * (`src/sia-recovery-feature.ts`). These specs drive a real `@videojs/store`
 * store with a small EventTarget-like fake for the media, and read state
 * through the exported selector exactly as consumers (player features, React
 * `usePlayer(selectSiaRecovery)`) do. No DOM, no worker, no mocks.
 */
import { describe, expect, it } from 'vitest';
import { combine, createStore, flush, type UnknownState } from '@videojs/store';
import type { PlayerTarget } from '@videojs/core/dom';
import {
  selectSiaRecovery,
  siaRecoveryFeature,
} from '../sia-recovery-feature.ts';
import { FakeSiaMedia, mediaTarget } from './fixtures/fake-sia-media.ts';

/** The inert recovery state a fresh store / detached feature reports. */
const INITIAL_RECOVERY_STATE = {
  active: false,
  reason: undefined,
  resumeSeconds: undefined,
  wantsPlay: undefined,
} as const;

describe('the Sia recovery player feature', () => {
  it('starts inert and readable through the exported selector', () => {
    const store = createStore<PlayerTarget>()(siaRecoveryFeature);

    expect(store.active).toBe(false);
    expect(store.state).toEqual(INITIAL_RECOVERY_STATE);
    expect(selectSiaRecovery(store.state)).toEqual(INITIAL_RECOVERY_STATE);
    expect(typeof store.active).toBe('boolean');
    expect('reason' in store.state).toBe(true);
  });

  it('reports undefined when the feature is not configured on the store', () => {
    const other = createStore<PlayerTarget>()({ name: 'other', state: () => ({ x: 1 as const }) });

    expect(selectSiaRecovery(other.state as UnknownState)).toBeUndefined();
  });

  it('opens a recovery window from an active detail, keeping every host field', () => {
    const media = new FakeSiaMedia();
    const store = createStore<PlayerTarget>()(siaRecoveryFeature);
    store.attach(mediaTarget(media));

    media.emitRecovery({ active: true, reason: 'decode', resumeSeconds: 12.5, wantsPlay: true });

    expect(store.active).toBe(true);
    expect(store.reason).toBe('decode');
    expect(store.resumeSeconds).toBe(12.5);
    expect(store.wantsPlay).toBe(true);
    expect(selectSiaRecovery(store.state)).toEqual({
      active: true,
      reason: 'decode',
      resumeSeconds: 12.5,
      wantsPlay: true,
    });
  });

  it('opens a recovery window for a seek reason too', () => {
    const media = new FakeSiaMedia();
    const store = createStore<PlayerTarget>()(siaRecoveryFeature);
    store.attach(mediaTarget(media));

    media.emitRecovery({ active: true, reason: 'seek', resumeSeconds: 0, wantsPlay: false });

    expect(store.reason).toBe('seek');
    expect(store.wantsPlay).toBe(false);
  });

  it('closing the recovery window clears the transient fields', () => {
    const media = new FakeSiaMedia();
    const store = createStore<PlayerTarget>()(siaRecoveryFeature);
    store.attach(mediaTarget(media));

    media.emitRecovery({ active: true, reason: 'network', resumeSeconds: 30, wantsPlay: true });
    expect(store.active).toBe(true);

    media.emitRecovery({ active: false });

    expect(store.active).toBe(false);
    expect(store.reason).toBeUndefined();
    expect(store.resumeSeconds).toBeUndefined();
    expect(store.wantsPlay).toBeUndefined();
    expect(selectSiaRecovery(store.state)).toEqual({
      active: false,
      reason: undefined,
      resumeSeconds: undefined,
      wantsPlay: undefined,
    });
  });

  it('detaching stops updates from the detached media and resets to inert', () => {
    const media = new FakeSiaMedia();
    const store = createStore<PlayerTarget>()(siaRecoveryFeature);
    const detach = store.attach(mediaTarget(media));

    media.emitRecovery({ active: true, reason: 'decode', resumeSeconds: 5, wantsPlay: true });
    expect(store.active).toBe(true);

    detach();

    expect(store.active).toBe(false);
    expect(store.reason).toBeUndefined();

    // A detached media's event must not leak into the store again.
    media.emitRecovery({ active: true, reason: 'seek', resumeSeconds: 9, wantsPlay: false });
    expect(store.active).toBe(false);
    expect(store.reason).toBeUndefined();
  });

  it('reattaching starts from a fresh inert window and tracks only the new media', () => {
    const first = new FakeSiaMedia();
    const second = new FakeSiaMedia();
    const store = createStore<PlayerTarget>()(siaRecoveryFeature);
    const detach = store.attach(mediaTarget(first));

    first.emitRecovery({ active: true, reason: 'network', resumeSeconds: 3, wantsPlay: true });
    expect(store.reason).toBe('network');

    detach();
    const detachSecond = store.attach(mediaTarget(second));

    expect(store.active).toBe(false);
    expect(store.reason).toBeUndefined();

    // The superseded media is no longer observed.
    first.emitRecovery({ active: true, reason: 'decode', resumeSeconds: 1, wantsPlay: true });
    expect(store.active).toBe(false);

    second.emitRecovery({ active: true, reason: 'seek', resumeSeconds: 42, wantsPlay: false });
    expect(store.active).toBe(true);
    expect(store.reason).toBe('seek');
    detachSecond();
  });

  it('initializes without a target: the state factory and selector are safe at module time', () => {
    // `createSelector` already ran the state factory at import; recreating the
    // store here exercises the same path without any attached media and proves
    // the factory never calls target()/get()/set() (which throw pre-attach).
    expect(() => {
      const store = createStore<PlayerTarget>()(siaRecoveryFeature);
      void selectSiaRecovery(store.state);
      expect(store.active).toBe(false);
    }).not.toThrow();
    expect(selectSiaRecovery.displayName).toBe('siaRecovery');
  });

  it('a non-React store assembled like a player store publishes and notifies subscribers', () => {
    const media = new FakeSiaMedia();
    // Mirror how @videojs/react createPlayer assembles the store:
    // combine(...features) -> createStore<PlayerTarget>()(slice).
    const store = createStore<PlayerTarget>()(combine(siaRecoveryFeature));
    const seen: [boolean, string | undefined][] = [];
    const unsubscribe = store.subscribe(() => seen.push([store.active, store.reason]));

    const detach = store.attach(mediaTarget(media));
    expect(seen).toEqual([]);

    media.emitRecovery({ active: true, reason: 'decode', resumeSeconds: 7, wantsPlay: true });
    // The store notifies subscribers on a scheduled flush; drive it with the
    // same public `flush` the store exports.
    flush();

    expect(seen).toEqual([[true, 'decode']]);
    expect(store.active).toBe(true);
    // The selector reads exactly the state a React subscription would receive.
    expect(selectSiaRecovery(store.state)).toEqual({
      active: true,
      reason: 'decode',
      resumeSeconds: 7,
      wantsPlay: true,
    });

    detach();
    flush();
    expect(seen.at(-1)).toEqual([false, undefined]);
    expect(store.active).toBe(false);
    unsubscribe();
  });
});
