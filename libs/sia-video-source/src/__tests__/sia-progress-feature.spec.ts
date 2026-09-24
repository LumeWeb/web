/**
 * The OPTIONAL reader-progress player feature + selector
 * (`src/sia-progress-feature.ts`). These specs drive a real `@videojs/store`
 * store with the `FakeSiaMedia` fixture, deriving the state from typed
 * `sia-worker-milestone-change` events (real worker `LOG` facts) exactly as
 * consumers do: no log-text parsing, no timers.
 *
 * The derivation rules pinned here:
 *   - `read.window-start` opens `reading` and counts a fetch;
 *   - `read.retry` flags `retrying` and counts an attempt (window stays open);
 *   - `read.window-complete` closes a successful window (retrying clears);
 *   - `bytes.read` tracks the worker's cumulative scalar;
 *   - `read.stalled` kills the in-flight read/retry window;
 *   - every other milestone name changes nothing;
 *   - `sia-load-change { accepted: false }` (and detach/reattach) reset the
 *     whole state.
 */
import { describe, expect, it } from 'vitest';
import { combine, createStore, type UnknownState } from '@videojs/store';
import type { PlayerTarget } from '@videojs/core/dom';
import {
  selectSiaProgress,
  siaProgressFeature,
  type SiaProgressState,
} from '../sia-progress-feature.ts';
import { FakeSiaMedia, mediaTarget } from './fixtures/fake-sia-media.ts';

/** The inert progress state a fresh store / detached feature reports. */
const INERT_PROGRESS_STATE: SiaProgressState = {
  bytesRead: 0,
  last: undefined,
  reading: false,
  reads: 0,
  retries: 0,
  retrying: false,
};

/** Emits one typed milestone as the host payload shape (detail defaulted like the dispatcher). */
function milestone(
  media: FakeSiaMedia,
  name: string,
  detail: Readonly<Record<string, unknown>> = {},
  requestId: null | number = 7,
  sequence = 1,
): void {
  media.emitMilestone({ detail, level: 'debug', name, requestId, sequence });
}

describe('the Sia progress player feature', () => {
  it('starts inert and readable through the exported selector', () => {
    const store = createStore<PlayerTarget>()(siaProgressFeature);

    expect(store.state).toEqual(INERT_PROGRESS_STATE);
    expect(selectSiaProgress(store.state)).toEqual(INERT_PROGRESS_STATE);
    expect(selectSiaProgress.displayName).toBe('siaProgress');
  });

  it('reports undefined when the feature is not configured on the store', () => {
    const other = createStore<PlayerTarget>()({ name: 'other', state: () => ({ x: 1 as const }) });

    expect(selectSiaProgress(other.state as UnknownState)).toBeUndefined();
  });

  it('a read window opens reading and counts the fetch', () => {
    const media = new FakeSiaMedia();
    const store = createStore<PlayerTarget>()(siaProgressFeature);
    store.attach(mediaTarget(media));
    const snapshot = () => selectSiaProgress(store.state)!;

    milestone(media, 'read.window-start', { deltaBytes: 1024, position: 512 });
    expect(snapshot().reading).toBe(true);
    expect(snapshot().reads).toBe(1);
    expect(snapshot().last).toEqual({ name: 'read.window-start', position: 512, requestId: 7 });

    // A second window increments the fetch count; the first already cleared.
    milestone(media, 'read.window-complete', { deltaBytes: 1024, position: 512 });
    expect(snapshot().reading).toBe(false);
    milestone(media, 'read.window-start', { deltaBytes: 512, position: 1536 });
    expect(snapshot().reads).toBe(2);
    expect(snapshot().reading).toBe(true);
  });

  it('a retry flags retrying, counts the attempt, and a completed window clears it', () => {
    const media = new FakeSiaMedia();
    const store = createStore<PlayerTarget>()(siaProgressFeature);
    store.attach(mediaTarget(media));
    const snapshot = () => selectSiaProgress(store.state)!;

    milestone(media, 'read.window-start', { position: 0 });
    milestone(media, 'read.retry', { reason: 'network-error', windowPosition: 0 });
    expect(snapshot().retrying).toBe(true);
    expect(snapshot().retries).toBe(1);
    // The window stays in flight across a retry.
    expect(snapshot().reading).toBe(true);

    // A second retry increment the count.
    milestone(media, 'read.retry', { reason: 'network-error', windowPosition: 0 });
    expect(snapshot().retries).toBe(2);

    // The eventual success of the same window closes the retry.
    milestone(media, 'read.window-complete', { position: 0 });
    expect(snapshot().retrying).toBe(false);
    expect(snapshot().reading).toBe(false);
    // The retry count survives: it is a per-load counter, not a flag.
    expect(snapshot().retries).toBe(2);
  });

  it('bytes.read tracks the cumulative scalar and ignores a non-scalar detail', () => {
    const media = new FakeSiaMedia();
    const store = createStore<PlayerTarget>()(siaProgressFeature);
    store.attach(mediaTarget(media));
    const snapshot = () => selectSiaProgress(store.state)!;

    milestone(media, 'bytes.read', { bytes: 1048576 });
    expect(snapshot().bytesRead).toBe(1048576);

    milestone(media, 'bytes.read', { bytes: 2097152 });
    expect(snapshot().bytesRead).toBe(2097152);

    // A malformed detail must never clobber the count.
    milestone(media, 'bytes.read', {});
    expect(snapshot().bytesRead).toBe(2097152);
    // But provenance is still recorded.
    expect(snapshot().last?.name).toBe('bytes.read');
  });

  it('a stalled read clears the in-flight read/retry state', () => {
    const media = new FakeSiaMedia();
    const store = createStore<PlayerTarget>()(siaProgressFeature);
    store.attach(mediaTarget(media));
    const snapshot = () => selectSiaProgress(store.state)!;

    milestone(media, 'read.window-start', { position: 4096 });
    milestone(media, 'read.retry', { windowPosition: 4096 });
    expect(snapshot().retrying).toBe(true);

    milestone(media, 'read.stalled', { position: 4096, stallTimeoutMs: 8000 });
    expect(snapshot().reading).toBe(false);
    expect(snapshot().retrying).toBe(false);
    expect(snapshot().last).toEqual({ name: 'read.stalled', position: 4096, requestId: 7 });
  });

  it('unknown milestone names change nothing (ignored entirely, not even provenance)', () => {
    const media = new FakeSiaMedia();
    const store = createStore<PlayerTarget>()(siaProgressFeature);
    store.attach(mediaTarget(media));

    milestone(media, 'read.window-start', { position: 0 });
    milestone(media, 'session.attach', {});
    milestone(media, 'sdk.built', { indexerUrl: 'https://x' });

    // The state still reflects the last DERIVED milestone only; lifecycle
    // names never touch it.
    expect(store.state).toEqual({
      ...INERT_PROGRESS_STATE,
      last: { name: 'read.window-start', position: 0, requestId: 7 },
      reading: true,
      reads: 1,
    });
  });

  it('a load boundary (accepted: false) resets the whole state', () => {
    const media = new FakeSiaMedia();
    const store = createStore<PlayerTarget>()(siaProgressFeature);
    store.attach(mediaTarget(media));

    milestone(media, 'read.window-start', { position: 0 });
    milestone(media, 'read.retry', { position: 0 });
    milestone(media, 'bytes.read', { bytes: 1048576 });
    media.emitLoad({ accepted: true });
    expect(store.reads).toBe(1);

    media.emitLoad({ accepted: false });

    expect(selectSiaProgress(store.state)).toEqual(INERT_PROGRESS_STATE);
    // Telemetry for the NEW load starts from zero cleanly.
    milestone(media, 'read.window-start', { position: 0 });
    expect(store.reads).toBe(1);
    expect(store.bytesRead).toBe(0);
  });

  it('accepted: true changes nothing', () => {
    const media = new FakeSiaMedia();
    const store = createStore<PlayerTarget>()(siaProgressFeature);
    store.attach(mediaTarget(media));

    milestone(media, 'read.window-start', { position: 0 });
    media.emitLoad({ accepted: true });

    expect(store.reads).toBe(1);
    expect(store.reading).toBe(true);
  });

  it('detaching stops updates and resets to inert; the superseded media is never observed again', () => {
    const first = new FakeSiaMedia();
    const second = new FakeSiaMedia();
    const store = createStore<PlayerTarget>()(siaProgressFeature);
    const detach = store.attach(mediaTarget(first));

    milestone(first, 'read.window-start', { position: 0 });
    expect(store.reading).toBe(true);

    detach();
    expect(selectSiaProgress(store.state)).toEqual(INERT_PROGRESS_STATE);

    // A detached media's events leak nothing.
    milestone(first, 'read.retry', { position: 0 });
    expect(store.retrying).toBe(false);

    const attachSecond = store.attach(mediaTarget(second));
    expect(selectSiaProgress(store.state)).toEqual(INERT_PROGRESS_STATE);

    milestone(second, 'read.window-start', { position: 0 });
    expect(store.reads).toBe(1);
    attachSecond();
  });

  it('derives correctly on a combined store assembled like a player store', () => {
    const media = new FakeSiaMedia();
    const store = createStore<PlayerTarget>()(combine(siaProgressFeature));
    const snapshot = () => selectSiaProgress(store.state)!;

    const detach = store.attach(mediaTarget(media));

    // The exact demo sequence: window activity, then retry, then success.
    milestone(media, 'read.window-start', { position: 0 });
    expect(snapshot().reading).toBe(true);
    milestone(media, 'read.retry', { windowPosition: 0 });
    expect(snapshot().retrying).toBe(true);
    expect(snapshot().retries).toBe(1);
    milestone(media, 'read.window-complete', { position: 0 });
    expect(snapshot().retrying).toBe(false);
    expect(snapshot().reads).toBe(1);
    expect(snapshot().retries).toBe(1);

    detach();
    expect(snapshot()).toEqual(INERT_PROGRESS_STATE);
  });

  it('initializes without a target: the state factory and selector are safe at module time', () => {
    expect(() => {
      const store = createStore<PlayerTarget>()(siaProgressFeature);
      void selectSiaProgress(store.state);
      expect(store.reads).toBe(0);
    }).not.toThrow();
  });
});
