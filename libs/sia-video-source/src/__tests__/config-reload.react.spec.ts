/**
 * React binding for `reloadConfiguration`: `reloadKey` + structural HELLO
 * auto-detection on `<SiaVideo>`. These specs render the REAL component
 * (through `fixtures/config-reload-react-harness.tsx`) with the global worker
 * stubbed by a recorder, and count HELLOs at the wire level.
 *
 *   - J: a reloadKey change triggers exactly one reload without remount
 *   - K: structural HELLO inputs (workerConfig presence/indexerUrl, workerMse,
 *        seed-supplier presence) each trigger exactly one reload
 *   - L: inline supplier refs alone never trigger a reload
 *   - M: the first render does not duplicate the initial HELLO
 *
 * Needs a DOM renderer, so these run in browser mode only (the same gate as
 * the other host/React specs); `SIA_TEST_ENV=node` skips them.
 */
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import type { AppMetadata } from '@siafoundation/sia-storage';
import { nullLogger } from '../log/logger.ts';
import type { SiaVideoProps } from '../react/index.tsx';
import { type AppKeySeedProvider } from '../app-key-handshake.ts';
import {
  type ConfigReloadHarness,
  FakeWorker,
  mountSiaVideo,
  waitFor,
} from './fixtures/config-reload-react-harness.tsx';

const IN_BROWSER = typeof document !== 'undefined' && typeof MediaSource !== 'undefined';

function appMetadata(): AppMetadata {
  return { appId: 'test-app-id', callbackUrl: '', description: 'test', logoUrl: '', name: 'app', serviceUrl: 'https://app.example' };
}

/** A brand-new inline supplier function each call, as JSX would create. */
function seedSupplier(): AppKeySeedProvider {
  return () => crypto.getRandomValues(new Uint8Array(32));
}

/** Lets React flush passive effects (the reload effect) and the host chain. */
function settle(rounds = 8): Promise<void> {
  return new Promise((resolve) => {
    const tick = (left: number) =>
      setTimeout(() => {
        if (left <= 0) resolve();
        else tick(left - 1);
      }, 0);
    tick(rounds);
  });
}

function workerConfig(indexerUrl = 'https://sia.storage') {
  return { app: appMetadata(), indexerUrl };
}

describe('SiaVideo reload triggers', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    FakeWorker.instances.length = 0;
  });

  async function mount(props: SiaVideoProps): Promise<ConfigReloadHarness> {
    vi.stubGlobal('Worker', FakeWorker);
    // A quiet sink (the default console logger would print every HELLO).
    return mountSiaVideo({ logger: nullLogger, ...props });
  }

  it.skipIf(!IN_BROWSER)('first render does not duplicate the initial HELLO (M)', async () => {
    // Compile-time contract (exercised on every typecheck): `src` is a plain
    // string — a hex object key or a full Sia share URL — never the `''`
    // literal an `as const` on the default props would expose. The `src: 'k'`
    // props below depend on it.
    expectTypeOf<SiaVideoProps['src']>().toEqualTypeOf<string | undefined>();
    const h = await mount({ getAppKeySeed: seedSupplier(), reloadKey: 'a', sia: workerConfig(), src: 'k' });
    // Let the mount's attach + passive reload effect fully flush.
    await settle();
    await waitFor(() => {
      if (h.hellos() !== 1) throw new Error('expected exactly one HELLO after mount');
    });
    expect(h.hellos()).toBe(1);
    h.unmount();
  });

  it.skipIf(!IN_BROWSER)('a reloadKey change triggers exactly one reload without remount (J)', async () => {
    const h = await mount({ reloadKey: 'a', sia: workerConfig(), src: 'k' });
    await settle();
    expect(h.hellos()).toBe(1);
    const elementBefore = h.element();
    const workerBefore = h.worker;

    h.render({ reloadKey: 'b', sia: workerConfig(), src: 'k' });
    await waitFor(() => {
      if (h.hellos() !== 2) throw new Error('reloadKey change did not reload exactly once');
    });
    await settle();
    expect(h.hellos()).toBe(2);
    // No remount: the same media/worker and the same DOM element survive.
    expect(h.worker).toBe(workerBefore);
    expect(h.element()).toBe(elementBefore);
    h.unmount();
  });

  it.skipIf(!IN_BROWSER)('structural HELLO changes trigger exactly one reload each (K)', async () => {
    const h = await mount({ sia: workerConfig('https://a.example'), src: 'k' });
    await settle();
    expect(h.hellos()).toBe(1);

    // workerConfig indexerUrl change → one reload.
    h.render({ sia: workerConfig('https://b.example'), src: 'k' });
    await waitFor(() => {
      if (h.hellos() !== 2) throw new Error('indexerUrl change did not reload');
    });
    await settle();
    expect(h.hellos()).toBe(2);

    // workerMse change (nested in the worker config) → one reload.
    h.render({ sia: { ...workerConfig('https://b.example'), workerMse: 'main' }, src: 'k' });
    await waitFor(() => {
      if (h.hellos() !== 3) throw new Error('workerMse change did not reload');
    });
    await settle();
    expect(h.hellos()).toBe(3);

    // seed-supplier presence change (absent → present) → one reload.
    h.render({ getAppKeySeed: seedSupplier(), sia: { ...workerConfig('https://b.example'), workerMse: 'main' }, src: 'k' });
    await waitFor(() => {
      if (h.hellos() !== 4) throw new Error('supplier presence change did not reload');
    });
    await settle();
    expect(h.hellos()).toBe(4);

    // workerConfig removal (defined → undefined) → one reload.
    h.render({ getAppKeySeed: seedSupplier(), src: 'k' });
    await waitFor(() => {
      if (h.hellos() !== 5) throw new Error('workerConfig removal did not reload');
    });
    expect(h.hellos()).toBe(5);
    h.unmount();
  });

  it.skipIf(!IN_BROWSER)('inline supplier refs alone never trigger a reload (L)', async () => {
    const h = await mount({ getAppKeySeed: seedSupplier(), sia: workerConfig(), src: 'k' });
    await settle();
    expect(h.hellos()).toBe(1);

    // A brand-new inline supplier function (same PRESENCE, different ref).
    h.render({ getAppKeySeed: seedSupplier(), sia: workerConfig(), src: 'k' });
    await settle();
    expect(h.hellos()).toBe(1);
    h.unmount();
  });

  it.skipIf(!IN_BROWSER)('NUL-bearing structural values never collide in the change signal (N)', async () => {
    // `reloadKey` and `indexerUrl` are free-form strings, so either may contain
    // '\u0000'. A NUL-joined composite signature cannot tell these two tuples
    // apart (both reloadKey AND indexerUrl changed — a reload is required), but
    // they must not be conflated: element-wise primitive comparison treats them
    // as distinct facts.
    const h = await mount({ reloadKey: '', sia: { ...workerConfig(), indexerUrl: '\u0000true\u0000', workerMse: 'main' } });
    await settle();
    expect(h.hellos()).toBe(1);

    h.render({ reloadKey: '\u0000true\u0000', sia: { ...workerConfig(), indexerUrl: '', workerMse: 'main' } });
    await waitFor(() => {
      if (h.hellos() !== 2) throw new Error('structural reloadKey/indexerUrl change was conflated — no reload');
    });
    await settle();
    expect(h.hellos()).toBe(2);
    h.unmount();
  });
});
