/**
 * The shared Video.js v10 load-acceptance player feature + selector
 * (`src/sia-load-feature.ts`). These specs drive a real `@videojs/store`
 * store with a small EventTarget-like fake for the media, and read state
 * through the exported selector exactly as consumers (player features, React
 * `usePlayer(selectSiaLoad)`) do. No DOM, no worker, no mocks.
 *
 * Acceptance is boolean-only: `{ accepted: false }` is the inert state and
 * `{ accepted: true }` means the worker pipeline accepted the source at the
 * host's SOURCE_OK — it deliberately says nothing about playability.
 */
import { describe, expect, it } from 'vitest';
import { combine, createStore, flush, type UnknownState } from '@videojs/store';
import type { PlayerTarget } from '@videojs/core/dom';
import {
  selectSiaLoad,
  siaLoadFeature,
} from '../sia-load-feature.ts';
import { FakeSiaMedia, mediaTarget } from './fixtures/fake-sia-media.ts';

/** The inert load state a fresh store / detached feature reports. */
const INERT_LOAD_STATE = {
  accepted: false,
} as const;

describe('the Sia load player feature', () => {
  it('starts inert and readable through the exported selector', () => {
    const store = createStore<PlayerTarget>()(siaLoadFeature);

    expect(store.accepted).toBe(false);
    expect(store.state).toEqual(INERT_LOAD_STATE);
    expect(selectSiaLoad(store.state)).toEqual(INERT_LOAD_STATE);
    expect(typeof store.accepted).toBe('boolean');
    expect('accepted' in store.state).toBe(true);
  });

  it('reports undefined when the feature is not configured on the store', () => {
    const other = createStore<PlayerTarget>()({ name: 'other', state: () => ({ x: 1 as const }) });

    expect(selectSiaLoad(other.state as UnknownState)).toBeUndefined();
  });

  it('opens from an accepted detail', () => {
    const media = new FakeSiaMedia();
    const store = createStore<PlayerTarget>()(siaLoadFeature);
    store.attach(mediaTarget(media));

    media.emitLoad({ accepted: true });

    expect(store.accepted).toBe(true);
    expect(selectSiaLoad(store.state)).toEqual({ accepted: true });
  });

  it('closes from an unaccepted detail', () => {
    const media = new FakeSiaMedia();
    const store = createStore<PlayerTarget>()(siaLoadFeature);
    store.attach(mediaTarget(media));

    media.emitLoad({ accepted: true });
    expect(store.accepted).toBe(true);

    media.emitLoad({ accepted: false });

    expect(store.accepted).toBe(false);
    expect(selectSiaLoad(store.state)).toEqual(INERT_LOAD_STATE);
  });

  it('detaching stops updates from the detached media and resets to inert', () => {
    const media = new FakeSiaMedia();
    const store = createStore<PlayerTarget>()(siaLoadFeature);
    const detach = store.attach(mediaTarget(media));

    media.emitLoad({ accepted: true });
    expect(store.accepted).toBe(true);

    detach();

    expect(store.accepted).toBe(false);

    // A detached media's event must not leak into the store again.
    media.emitLoad({ accepted: true });
    expect(store.accepted).toBe(false);
  });

  it('reattaching starts from a fresh inert window and tracks only the new media', () => {
    const first = new FakeSiaMedia();
    const second = new FakeSiaMedia();
    const store = createStore<PlayerTarget>()(siaLoadFeature);
    const detach = store.attach(mediaTarget(first));

    first.emitLoad({ accepted: true });
    expect(store.accepted).toBe(true);

    detach();
    const detachSecond = store.attach(mediaTarget(second));

    expect(store.accepted).toBe(false);

    // The superseded media is no longer observed.
    first.emitLoad({ accepted: true });
    expect(store.accepted).toBe(false);

    second.emitLoad({ accepted: true });
    expect(store.accepted).toBe(true);
    detachSecond();
  });

  it('initializes without a target: the state factory and selector are safe at module time', () => {
    // `createSelector` already ran the state factory at import; recreating the
    // store here exercises the same path without any attached media and proves
    // the factory never calls target()/get()/set() (which throw pre-attach).
    expect(() => {
      const store = createStore<PlayerTarget>()(siaLoadFeature);
      void selectSiaLoad(store.state);
      expect(store.accepted).toBe(false);
    }).not.toThrow();
    expect(selectSiaLoad.displayName).toBe('siaLoad');
  });

  it('a non-React store assembled like a player store publishes and notifies subscribers', () => {
    const media = new FakeSiaMedia();
    // Mirror how @videojs/react createPlayer assembles the store:
    // combine(...features) -> createStore<PlayerTarget>()(slice).
    const store = createStore<PlayerTarget>()(combine(siaLoadFeature));
    const seen: boolean[] = [];
    const unsubscribe = store.subscribe(() => seen.push(store.accepted));

    const detach = store.attach(mediaTarget(media));
    expect(seen).toEqual([]);

    media.emitLoad({ accepted: true });
    // The store notifies subscribers on a scheduled flush; drive it with the
    // same public `flush` the store exports.
    flush();

    expect(seen).toEqual([true]);
    expect(store.accepted).toBe(true);
    // The selector reads exactly the state a React subscription would receive.
    expect(selectSiaLoad(store.state)).toEqual({ accepted: true });

    detach();
    flush();
    expect(seen.at(-1)).toBe(false);
    expect(store.accepted).toBe(false);
    unsubscribe();
  });
});
