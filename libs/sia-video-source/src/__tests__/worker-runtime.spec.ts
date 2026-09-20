/**
 * Worker-runtime helper tests (`src/worker-runtime.ts`): the SDK `dispose`
 * cleanup contract (`withDisposal`) shipped with `createDefaultSdk`'s default
 * registration flow.
 */
import { describe, expect, it } from 'vitest';
import { type SiaVideoSdk, withDisposal } from '../worker-runtime.ts';
import { fakeSiaSdk } from './fixtures/fmp4-fixture.ts';

function sdkWith(hooks: Record<string | symbol, unknown>): SiaVideoSdk {
  return { ...fakeSiaSdk(new Uint8Array(8)).sdk, ...hooks };
}

describe('withDisposal', () => {
  it('releases an SDK exposing only free() through its dispose hook', async () => {
    let freed = 0;
    const sdk = sdkWith({
      free: () => {
        freed++;
      },
    });
    const wrapped = withDisposal(sdk);

    expect(typeof wrapped.dispose).toBe('function');
    await wrapped.dispose?.();
    expect(freed).toBe(1);

    // Forwarded surface still works after wrapping.
    await expect(wrapped.object('k')).resolves.toBeDefined();
    expect(typeof wrapped.download).toBe('function');
  });

  it('releases an SDK exposing only [Symbol.dispose] through its dispose hook', () => {
    let disposed = 0;
    const sdk = sdkWith({
      [Symbol.dispose]: () => {
        disposed++;
      },
    });
    const wrapped = withDisposal(sdk);

    void wrapped.dispose?.();
    expect(disposed).toBe(1);
    expect(typeof wrapped.dispose).toBe('function');
  });

  it('releases an SDK exposing aliased free() and [Symbol.dispose] exactly once', () => {
    // The real sia-storage WASM SDK aliases the symbol to free(): exercising
    // both hooks would double-release the same WASM object.
    let released = 0;
    const release = () => {
      released++;
    };
    const sdk = sdkWith({ free: release, [Symbol.dispose]: release });
    const wrapped = withDisposal(sdk);

    void wrapped.dispose?.();
    expect(released).toBe(1);
  });

  it('prefers [Symbol.dispose] over free() when an SDK exposes both', () => {
    let freed = 0;
    let disposed = 0;
    const sdk = sdkWith({
      free: () => {
        freed++;
      },
      [Symbol.dispose]: () => {
        disposed++;
      },
    });
    const wrapped = withDisposal(sdk);

    void wrapped.dispose?.();
    expect(disposed).toBe(1);
    expect(freed).toBe(0);
  });

  it("uses an SDK's own genuine dispose() without falling through to free() or [Symbol.dispose]", () => {
    let disposeCalls = 0;
    let freed = 0;
    let symbolDisposes = 0;
    const sdk = sdkWith({
      dispose: () => {
        disposeCalls++;
      },
      free: () => {
        freed++;
      },
      [Symbol.dispose]: () => {
        symbolDisposes++;
      },
    });
    const wrapped = withDisposal(sdk);

    // A teardown path may invoke both entry points; only the genuine
    // dispose() may run, exactly once, through the release-once latch.
    void wrapped.dispose?.();
    const surface = wrapped as unknown as Record<string | symbol, unknown>;
    void (surface[Symbol.dispose] as () => void)();

    expect(disposeCalls).toBe(1);
    expect(freed).toBe(0);
    expect(symbolDisposes).toBe(0);
  });

  it('returns one stable identity per member across repeated reads', () => {
    let freed = 0;
    const sdk = sdkWith({
      free: () => {
        freed++;
      },
    });
    const wrapped = withDisposal(sdk);

    // Same bound method and same synthesized hook on every read — callers
    // can WeakMap-key or store them safely.
    const surface = wrapped as unknown as Record<string | symbol, unknown>;
    expect(surface.object).toBe(surface.object);
    expect(surface.download).toBe(surface.download);
    expect(wrapped.dispose).toBe(wrapped.dispose);
    expect(surface[Symbol.dispose]).toBe(surface[Symbol.dispose]);

    void wrapped.dispose?.();
    void (surface[Symbol.dispose] as () => void)();
    // Both synthesized hooks share one release-once latch: invoking both
    // entry points releases the aliased free() exactly once.
    expect(freed).toBe(1);
  });

  it('releases exactly once when both disposal entry points are invoked', () => {
    // Mirrors the real sia-storage WASM SDK, whose [Symbol.dispose] aliases
    // free(): the proxy synthesizes both hooks over one native release, so
    // a teardown path invoking dispose() and then [Symbol.dispose] must not
    // double-free the (possibly shared) WASM object.
    let released = 0;
    const release = () => {
      released++;
    };
    const sdk = sdkWith({ free: release, [Symbol.dispose]: release });
    const wrapped = withDisposal(sdk);

    void wrapped.dispose?.();
    const surface = wrapped as unknown as Record<string | symbol, unknown>;
    void (surface[Symbol.dispose] as () => void)();

    expect(released).toBe(1);
  });

  it('does not mutate or freeze the original SDK object', async () => {
    let freed = 0;
    const sdk = sdkWith({
      free: () => {
        freed++;
      },
    });
    const raw = sdk as unknown as Record<string | symbol, unknown>;

    const wrapped = withDisposal(sdk);
    await wrapped.dispose?.();

    // Non-mutating guarantee: no `dispose` own property was grafted onto the
    // (possibly shared) underlying WASM SDK object, and it is freezable; the
    // forwarding lives entirely on the proxy, not on the target.
    expect(Object.hasOwn(raw, 'dispose')).toBe(false);
    expect(Object.isFrozen(sdk)).toBe(false);
    expect(Object.isExtensible(sdk)).toBe(true);
    expect(freed).toBe(1);
    expect(Object.hasOwn(raw, 'dispose')).toBe(false);
    // Forwarded methods bind to the original target.
    await expect(wrapped.object('k')).resolves.toBeDefined();
  });

  it('passes an SDK with no release hooks through unharmed', async () => {
    const sdk = fakeSiaSdk(new Uint8Array(8)).sdk as SiaVideoSdk;
    const wrapped = withDisposal(sdk);
    expect(wrapped.dispose).toBeUndefined();
    await expect(wrapped.object('k')).resolves.toBeDefined();
  });
});
