import type { Sdk, SharedSdk } from "@siafoundation/sia-storage";
import { describe, expect, it, vi } from "vitest";
import { createStreamSdkManager, watchAuthIdentity } from "./streamSdk";

const OBJECT_KEY =
  "a1b2c3d4e5f60718293a4b5c6d7e8f90112233445566778899aabbccddeeff01";
const INDEXER = "https://indexer.example";
const USER_KEY_HEX = "aa".repeat(32);
const SHARING_KEY_HEX = "bb".repeat(32);

/** A fixed auth state reader. */
function fakeAuth(overrides?: {
  sharingKeyHex?: null | string;
  userKeyHex?: string;
}) {
  return () => ({
    indexerUrl: INDEXER,
    sharingKeyHex: overrides?.sharingKeyHex ?? null,
    userKeyHex: overrides?.userKeyHex ?? USER_KEY_HEX,
  });
}

/** A fake Sdk with a spied free(). */
function fakeSdk() {
  const free = vi.fn();
  return { free, sdk: { free } as unknown as Sdk };
}

/** A fake SharedSdk with a spied free(). */
function fakeSharedSdk() {
  const free = vi.fn();
  return { free, sdk: { free } as unknown as SharedSdk };
}

/** A fake auth state reader whose current state can be mutated in place. */
function mutableAuth(overrides?: {
  sharingKeyHex?: null | string;
  userKeyHex?: string;
}) {
  const state = {
    indexerUrl: INDEXER,
    sharingKeyHex: overrides?.sharingKeyHex ?? (null as null | string),
    userKeyHex: overrides?.userKeyHex ?? USER_KEY_HEX,
  };
  return { get: () => state, state };
}

describe("createStreamSdkManager", () => {
  it("lazily connects the app SDK on first request and caches it", async () => {
    const { free, sdk } = fakeSdk();
    const connectAppSdk = vi.fn(() => Promise.resolve(sdk));
    const manager = createStreamSdkManager({
      connectAppSdk,
      getAuth: fakeAuth(),
    });

    const first = await manager.getStreamSdk({
      objectKey: OBJECT_KEY,
      shared: false,
    });
    const second = await manager.getStreamSdk({
      objectKey: OBJECT_KEY,
      shared: false,
    });

    expect(connectAppSdk).toHaveBeenCalledTimes(1);
    expect(connectAppSdk).toHaveBeenCalledWith(INDEXER, USER_KEY_HEX);
    expect(first.sdk).toBe(sdk);
    expect(second.sdk).toBe(sdk);
    expect(free).not.toHaveBeenCalled();
  });

  it("lazily connects the shared SDK on first request and caches it", async () => {
    const { sdk } = fakeSharedSdk();
    const connectSharedSdk = vi.fn(() => Promise.resolve(sdk));
    const manager = createStreamSdkManager({
      connectSharedSdk,
      getAuth: fakeAuth({ sharingKeyHex: SHARING_KEY_HEX }),
    });

    const first = await manager.getStreamSdk({
      objectKey: OBJECT_KEY,
      shared: true,
    });
    const second = await manager.getStreamSdk({
      objectKey: OBJECT_KEY,
      shared: true,
    });

    expect(connectSharedSdk).toHaveBeenCalledTimes(1);
    expect(connectSharedSdk).toHaveBeenCalledWith(INDEXER, SHARING_KEY_HEX);
    expect(first.sdk).toBe(sdk);
    expect(second.sdk).toBe(sdk);
  });

  it("frees the cached SDK on mode switch", async () => {
    const appFree = vi.fn();
    const sharedFree = vi.fn();
    const appSdk = { free: appFree } as unknown as Sdk;
    const sharedSdk = { free: sharedFree } as unknown as SharedSdk;
    const connectAppSdk = vi.fn(() => Promise.resolve(appSdk));
    const connectSharedSdk = vi.fn(() => Promise.resolve(sharedSdk));
    const manager = createStreamSdkManager({
      connectAppSdk,
      connectSharedSdk,
      getAuth: fakeAuth({ sharingKeyHex: SHARING_KEY_HEX }),
    });

    // Connect app mode first.
    await manager.getStreamSdk({ objectKey: OBJECT_KEY, shared: false });
    expect(appFree).not.toHaveBeenCalled();

    // Switch to shared mode: the app SDK is freed.
    await manager.getStreamSdk({ objectKey: OBJECT_KEY, shared: true });
    expect(appFree).toHaveBeenCalledTimes(1);
    expect(connectSharedSdk).toHaveBeenCalledTimes(1);

    // Switch back to app mode: the shared SDK is freed.
    await manager.getStreamSdk({ objectKey: OBJECT_KEY, shared: false });
    expect(sharedFree).toHaveBeenCalledTimes(1);
    expect(connectAppSdk).toHaveBeenCalledTimes(2);
  });

  it("free() releases the current SDK and clears the cache", async () => {
    const { free, sdk } = fakeSdk();
    const connectAppSdk = vi.fn(() => Promise.resolve(sdk));
    const manager = createStreamSdkManager({
      connectAppSdk,
      getAuth: fakeAuth(),
    });

    await manager.getStreamSdk({ objectKey: OBJECT_KEY, shared: false });
    manager.free();
    expect(free).toHaveBeenCalledTimes(1);

    // After free, the next request reconnects.
    await manager.getStreamSdk({ objectKey: OBJECT_KEY, shared: false });
    expect(connectAppSdk).toHaveBeenCalledTimes(2);
  });

  it("throws a descriptive error when no app key is configured", async () => {
    const manager = createStreamSdkManager({
      connectAppSdk: vi.fn(),
      getAuth: () => ({
        indexerUrl: INDEXER,
        sharingKeyHex: null,
        userKeyHex: "",
      }),
    });
    await expect(
      manager.getStreamSdk({ objectKey: OBJECT_KEY, shared: false }),
    ).rejects.toThrow("no app key");
  });

  it("throws a descriptive error when no sharing key is configured", async () => {
    const manager = createStreamSdkManager({
      connectSharedSdk: vi.fn(),
      getAuth: () => ({
        indexerUrl: INDEXER,
        sharingKeyHex: null,
        userKeyHex: USER_KEY_HEX,
      }),
    });
    await expect(
      manager.getStreamSdk({ objectKey: OBJECT_KEY, shared: true }),
    ).rejects.toThrow("no sharing key");
  });

  it("passes the correct credentials shape for app sources", async () => {
    const { sdk } = fakeSdk();
    const manager = createStreamSdkManager({
      connectAppSdk: vi.fn(() => Promise.resolve(sdk)),
      getAuth: () => ({
        indexerUrl: INDEXER,
        sharingKeyHex: null,
        userKeyHex: USER_KEY_HEX,
      }),
    });
    const handle = await manager.getStreamSdk({
      objectKey: OBJECT_KEY,
      shared: false,
    });
    const creds = handle.credentials;
    expect(creds).toHaveProperty("indexerUrl", INDEXER);
    expect(creds).toHaveProperty("appMeta");
    const appMeta = (creds as { appMeta: { appId: string } }).appMeta;
    expect(appMeta.appId).toMatch(/^[0-9a-f]{64}$/);
  });

  it("passes the correct credentials shape for shared sources", async () => {
    const { sdk } = fakeSharedSdk();
    const manager = createStreamSdkManager({
      connectSharedSdk: vi.fn(() => Promise.resolve(sdk)),
      getAuth: () => ({
        indexerUrl: INDEXER,
        sharingKeyHex: SHARING_KEY_HEX,
        userKeyHex: USER_KEY_HEX,
      }),
    });
    const handle = await manager.getStreamSdk({
      objectKey: OBJECT_KEY,
      shared: true,
    });
    expect(handle.credentials).toEqual({
      indexerUrl: INDEXER,
      seed: SHARING_KEY_HEX,
    });
  });
});

describe("createStreamSdkManager credential identity", () => {
  it("frees and reconnects the cached SDK when the user key rotates", async () => {
    const oldFree = vi.fn();
    const oldSdk = { free: oldFree } as unknown as Sdk;
    const newSdk = { free: vi.fn() } as unknown as Sdk;
    const connectAppSdk = vi
      .fn()
      .mockResolvedValueOnce(oldSdk)
      .mockResolvedValueOnce(newSdk);
    const auth = mutableAuth();
    const manager = createStreamSdkManager({
      connectAppSdk,
      getAuth: auth.get,
    });

    const first = await manager.getStreamSdk({
      objectKey: OBJECT_KEY,
      shared: false,
    });
    expect(first.sdk).toBe(oldSdk);
    expect(oldFree).not.toHaveBeenCalled();

    // Key rotation: the cached handle's credentials are now stale.
    auth.state.userKeyHex = "cc".repeat(32);
    const second = await manager.getStreamSdk({
      objectKey: OBJECT_KEY,
      shared: false,
    });

    expect(second.sdk).toBe(newSdk);
    expect(oldFree).toHaveBeenCalledTimes(1);
    expect(connectAppSdk).toHaveBeenCalledTimes(2);
    expect(connectAppSdk).toHaveBeenLastCalledWith(INDEXER, "cc".repeat(32));
  });

  it("frees and reconnects the cached SDK when the sharing key rotates", async () => {
    const oldFree = vi.fn();
    const oldSdk = { free: oldFree } as unknown as SharedSdk;
    const newSdk = { free: vi.fn() } as unknown as SharedSdk;
    const connectSharedSdk = vi
      .fn()
      .mockResolvedValueOnce(oldSdk)
      .mockResolvedValueOnce(newSdk);
    const auth = mutableAuth({ sharingKeyHex: SHARING_KEY_HEX });
    const manager = createStreamSdkManager({
      connectSharedSdk,
      getAuth: auth.get,
    });

    const first = await manager.getStreamSdk({
      objectKey: OBJECT_KEY,
      shared: true,
    });
    expect(first.sdk).toBe(oldSdk);

    auth.state.sharingKeyHex = "dd".repeat(32);
    const second = await manager.getStreamSdk({
      objectKey: OBJECT_KEY,
      shared: true,
    });

    expect(second.sdk).toBe(newSdk);
    expect(oldFree).toHaveBeenCalledTimes(1);
    expect(connectSharedSdk).toHaveBeenCalledTimes(2);
    expect(connectSharedSdk).toHaveBeenLastCalledWith(INDEXER, "dd".repeat(32));
  });

  it("frees the cached SDK and throws when the app key disappears (logout)", async () => {
    const { free, sdk } = fakeSdk();
    const connectAppSdk = vi.fn(() => Promise.resolve(sdk));
    const auth = mutableAuth();
    const manager = createStreamSdkManager({
      connectAppSdk,
      getAuth: auth.get,
    });

    await manager.getStreamSdk({ objectKey: OBJECT_KEY, shared: false });
    expect(connectAppSdk).toHaveBeenCalledTimes(1);

    // Logout clears the user key: the stale SDK must be freed and no new
    // connection handed to a worker restart.
    auth.state.userKeyHex = "";
    await expect(
      manager.getStreamSdk({ objectKey: OBJECT_KEY, shared: false }),
    ).rejects.toThrow("no app key");
    expect(free).toHaveBeenCalledTimes(1);
    expect(connectAppSdk).toHaveBeenCalledTimes(1);
  });

  it("frees the cached SDK and throws when the sharing key disappears", async () => {
    const { free, sdk } = fakeSharedSdk();
    const connectSharedSdk = vi.fn(() => Promise.resolve(sdk));
    const auth = mutableAuth({ sharingKeyHex: SHARING_KEY_HEX });
    const manager = createStreamSdkManager({
      connectSharedSdk,
      getAuth: auth.get,
    });

    await manager.getStreamSdk({ objectKey: OBJECT_KEY, shared: true });
    expect(connectSharedSdk).toHaveBeenCalledTimes(1);

    auth.state.sharingKeyHex = null;
    await expect(
      manager.getStreamSdk({ objectKey: OBJECT_KEY, shared: true }),
    ).rejects.toThrow("no sharing key");
    expect(free).toHaveBeenCalledTimes(1);
    expect(connectSharedSdk).toHaveBeenCalledTimes(1);
  });

  it("frees and reconnects when the indexer URL changes with the same key", async () => {
    const { free, sdk } = fakeSdk();
    const connectAppSdk = vi.fn(() => Promise.resolve(sdk));
    const auth = mutableAuth();
    const manager = createStreamSdkManager({
      connectAppSdk,
      getAuth: auth.get,
    });

    await manager.getStreamSdk({ objectKey: OBJECT_KEY, shared: false });
    expect(free).not.toHaveBeenCalled();

    auth.state.indexerUrl = "https://other-indexer.example";
    await manager.getStreamSdk({ objectKey: OBJECT_KEY, shared: false });

    expect(free).toHaveBeenCalledTimes(1);
    expect(connectAppSdk).toHaveBeenCalledTimes(2);
    expect(connectAppSdk).toHaveBeenLastCalledWith(
      "https://other-indexer.example",
      USER_KEY_HEX,
    );
  });

  it("free() is a no-op when nothing is cached", () => {
    const manager = createStreamSdkManager({
      connectAppSdk: vi.fn(),
      getAuth: () => ({
        indexerUrl: INDEXER,
        sharingKeyHex: null,
        userKeyHex: USER_KEY_HEX,
      }),
    });
    expect(() => manager.free()).not.toThrow();
  });
});

describe("createStreamSdkManager concurrency (single-flight)", () => {
  /** A promise whose resolution the test controls. */
  function deferred<T>() {
    let resolveFn!: (value: T) => void;
    let rejectFn!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
      resolveFn = res;
      rejectFn = rej;
    });
    return {
      promise,
      reject: (reason?: unknown) => rejectFn(reason),
      resolve: (value: T) => resolveFn(value),
    };
  }

  it("deduplicates concurrent same-identity requests into a single connect", async () => {
    const { sdk } = fakeSdk();
    const d = deferred<Sdk>();
    const connectAppSdk = vi.fn(() => d.promise);
    const manager = createStreamSdkManager({
      connectAppSdk,
      getAuth: fakeAuth(),
    });

    // Two requests land while no SDK is cached: only one connect may start.
    const firstP = manager.getStreamSdk({
      objectKey: OBJECT_KEY,
      shared: false,
    });
    const secondP = manager.getStreamSdk({
      objectKey: OBJECT_KEY,
      shared: false,
    });
    d.resolve(sdk);
    const [first, second] = await Promise.all([firstP, secondP]);
    expect(connectAppSdk).toHaveBeenCalledTimes(1);
    expect(first).toBe(second);
    expect(first.sdk).toBe(sdk);

    // The shared handle is cached: a later request does not reconnect.
    const third = await manager.getStreamSdk({
      objectKey: OBJECT_KEY,
      shared: false,
    });
    expect(third).toBe(first);
    expect(connectAppSdk).toHaveBeenCalledTimes(1);
  });

  it("clears pending state on connect rejection so the request can be retried", async () => {
    const { sdk } = fakeSdk();
    const d = deferred<Sdk>();
    const connectAppSdk = vi
      .fn()
      .mockImplementationOnce(() => d.promise)
      .mockResolvedValue(sdk);
    const manager = createStreamSdkManager({
      connectAppSdk,
      getAuth: fakeAuth(),
    });

    const firstP = manager.getStreamSdk({
      objectKey: OBJECT_KEY,
      shared: false,
    });
    const secondP = manager.getStreamSdk({
      objectKey: OBJECT_KEY,
      shared: false,
    });
    d.reject(new Error("connect failed"));
    await expect(firstP).rejects.toThrow("connect failed");
    await expect(secondP).rejects.toThrow("connect failed");

    // A failed connect must not pin a rejected promise for this identity.
    const retry = await manager.getStreamSdk({
      objectKey: OBJECT_KEY,
      shared: false,
    });
    expect(retry.sdk).toBe(sdk);
    expect(connectAppSdk).toHaveBeenCalledTimes(2);
  });

  it("does not let a pending connect become current after free()", async () => {
    const obsoleteFree = vi.fn();
    const obsolete = { free: obsoleteFree } as unknown as Sdk;
    const freshFree = vi.fn();
    const fresh = { free: freshFree } as unknown as Sdk;
    const d = deferred<Sdk>();
    const connectAppSdk = vi
      .fn()
      .mockImplementationOnce(() => d.promise)
      .mockResolvedValue(fresh);
    const manager = createStreamSdkManager({
      connectAppSdk,
      getAuth: fakeAuth(),
    });

    const pending = manager.getStreamSdk({
      objectKey: OBJECT_KEY,
      shared: false,
    });
    // free() while the connect is in flight: the in-flight result is obsolete.
    manager.free();
    d.resolve(obsolete);
    // The obsolete connect must reject, not resolve with a freed SDK.
    await expect(pending).rejects.toThrow();

    // The obsolete SDK is freed, never installed as the cached handle.
    expect(obsoleteFree).toHaveBeenCalledTimes(1);
    const next = await manager.getStreamSdk({
      objectKey: OBJECT_KEY,
      shared: false,
    });
    expect(next.sdk).toBe(fresh);
    expect(connectAppSdk).toHaveBeenCalledTimes(2);
    expect(freshFree).not.toHaveBeenCalled();
  });

  it("frees a pending connect whose credentials rotated while it was in flight", async () => {
    const obsoleteFree = vi.fn();
    const obsolete = { free: obsoleteFree } as unknown as Sdk;
    const freshFree = vi.fn();
    const fresh = { free: freshFree } as unknown as Sdk;
    const d = deferred<Sdk>();
    const connectAppSdk = vi
      .fn()
      .mockImplementationOnce(() => d.promise)
      .mockResolvedValue(fresh);
    const auth = mutableAuth();
    const manager = createStreamSdkManager({
      connectAppSdk,
      getAuth: auth.get,
    });

    const pending = manager.getStreamSdk({
      objectKey: OBJECT_KEY,
      shared: false,
    });
    // Key rotation while the connect is in flight: it built stale credentials.
    auth.state.userKeyHex = "cc".repeat(32);
    d.resolve(obsolete);
    // The obsolete connect must reject, not resolve with a freed SDK.
    await expect(pending).rejects.toThrow();

    expect(obsoleteFree).toHaveBeenCalledTimes(1);
    const next = await manager.getStreamSdk({
      objectKey: OBJECT_KEY,
      shared: false,
    });
    expect(next.sdk).toBe(fresh);
    expect(connectAppSdk).toHaveBeenCalledTimes(2);
    expect(freshFree).not.toHaveBeenCalled();
  });

  it("cross-mode concurrent connects never clobber current or leak the obsolete handle", async () => {
    const appFree = vi.fn();
    const appSdk = { free: appFree } as unknown as Sdk;
    const sharedFree = vi.fn();
    const sharedSdk = { free: sharedFree } as unknown as SharedSdk;
    const appD = deferred<Sdk>();
    const sharedD = deferred<SharedSdk>();
    const connectAppSdk = vi.fn(() => appD.promise);
    const connectSharedSdk = vi.fn(() => sharedD.promise);
    const manager = createStreamSdkManager({
      connectAppSdk,
      connectSharedSdk,
      getAuth: fakeAuth({ sharingKeyHex: SHARING_KEY_HEX }),
    });

    // App connect starts first; shared connect starts while app is in flight.
    const appP = manager.getStreamSdk({
      objectKey: OBJECT_KEY,
      shared: false,
    });
    const sharedP = manager.getStreamSdk({
      objectKey: OBJECT_KEY,
      shared: true,
    });

    // Both are in flight concurrently. Resolve shared first: it becomes
    // current (no prior current to free).
    sharedD.resolve(sharedSdk);
    const sharedHandle = await sharedP;
    expect(sharedHandle.sdk).toBe(sharedSdk);
    expect(sharedFree).not.toHaveBeenCalled();

    // Resolve app second: it must free the shared SDK (mode switch) and
    // become current. The shared SDK is free()ed exactly once — no leak.
    appD.resolve(appSdk);
    const appHandle = await appP;
    expect(appHandle.sdk).toBe(appSdk);
    expect(sharedFree).toHaveBeenCalledTimes(1);
    expect(appFree).not.toHaveBeenCalled();

    // Both connects happened, no extra frees.
    expect(connectAppSdk).toHaveBeenCalledTimes(1);
    expect(connectSharedSdk).toHaveBeenCalledTimes(1);

    // The current handle is the app one (last settled).
    const current = await manager.getStreamSdk({
      objectKey: OBJECT_KEY,
      shared: false,
    });
    expect(current.sdk).toBe(appSdk);
    // No additional free calls.
    expect(sharedFree).toHaveBeenCalledTimes(1);
    expect(appFree).not.toHaveBeenCalled();
  });

  it("same-mode credential rotation with a second pending request does not double free", async () => {
    const obsoleteFree = vi.fn();
    const obsolete = { free: obsoleteFree } as unknown as Sdk;
    const freshFree = vi.fn();
    const fresh = { free: freshFree } as unknown as Sdk;
    const d1 = deferred<Sdk>();
    const d2 = deferred<Sdk>();
    const connectAppSdk = vi
      .fn()
      .mockImplementationOnce(() => d1.promise)
      .mockImplementationOnce(() => d2.promise);
    const auth = mutableAuth();
    const manager = createStreamSdkManager({
      connectAppSdk,
      getAuth: auth.get,
    });

    // First request starts a connect with the original identity.
    const firstP = manager.getStreamSdk({
      objectKey: OBJECT_KEY,
      shared: false,
    });

    // Credential rotation while the first connect is in flight.
    auth.state.userKeyHex = "cc".repeat(32);

    // Second request with the new identity: it must NOT share the first's
    // promise (different identity) and must NOT double-free the first's SDK.
    const secondP = manager.getStreamSdk({
      objectKey: OBJECT_KEY,
      shared: false,
    });

    // Two separate connects were started.
    expect(connectAppSdk).toHaveBeenCalledTimes(2);

    // Resolve the first (obsolete) connect: its SDK is freed exactly once.
    d1.resolve(obsolete);
    await expect(firstP).rejects.toThrow();
    expect(obsoleteFree).toHaveBeenCalledTimes(1);

    // Resolve the second (fresh) connect: it becomes current.
    d2.resolve(fresh);
    const second = await secondP;
    expect(second.sdk).toBe(fresh);
    expect(freshFree).not.toHaveBeenCalled();

    // The obsolete SDK was freed exactly once (not twice).
    expect(obsoleteFree).toHaveBeenCalledTimes(1);
  });
});

describe("watchAuthIdentity", () => {
  /** A minimal zustand-style store: fires listeners on emit like zustand. */
  function fakeAuthStore(initial: {
    indexerUrl: string;
    sharingKeyHex: null | string;
    userKeyHex: string;
  }) {
    let state = initial;
    const listeners = new Set<
      (state: {
        indexerUrl: string;
        sharingKeyHex: null | string;
        userKeyHex: string;
      }) => void
    >();
    return {
      emit: (next: typeof state) => {
        state = next;
        for (const listener of listeners) listener(state);
      },
      getState: () => state,
      subscribe: (listener: (state: typeof initial) => void) => {
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
        };
      },
    };
  }

  const INITIAL = {
    indexerUrl: INDEXER,
    sharingKeyHex: null as null | string,
    userKeyHex: USER_KEY_HEX,
  };

  it("frees the manager when the auth identity changes", async () => {
    const { free, sdk } = fakeSdk();
    const connectAppSdk = vi.fn(() => Promise.resolve(sdk));
    const manager = createStreamSdkManager({
      connectAppSdk,
      getAuth: () => ({ ...INITIAL }),
    });
    const store = fakeAuthStore(INITIAL);
    void watchAuthIdentity(manager, store);
    await manager.getStreamSdk({ objectKey: OBJECT_KEY, shared: false });
    expect(free).not.toHaveBeenCalled();

    // Logout: the identity changes and the cached SDK is freed immediately.
    store.emit({ ...INITIAL, userKeyHex: "" });
    expect(free).toHaveBeenCalledTimes(1);
  });

  it("does not free on the initial subscription observation", async () => {
    const { free, sdk } = fakeSdk();
    const manager = createStreamSdkManager({
      connectAppSdk: vi.fn(() => Promise.resolve(sdk)),
      getAuth: () => ({ ...INITIAL }),
    });
    const store = fakeAuthStore(INITIAL);
    void watchAuthIdentity(manager, store);
    await manager.getStreamSdk({ objectKey: OBJECT_KEY, shared: false });

    expect(free).not.toHaveBeenCalled();
  });

  it("does not free when the auth state is unchanged", () => {
    const { free } = fakeSdk();
    const manager = createStreamSdkManager({
      connectAppSdk: vi.fn(),
      getAuth: () => ({ ...INITIAL }),
    });
    const store = fakeAuthStore(INITIAL);
    void watchAuthIdentity(manager, store);

    store.emit({ ...INITIAL });
    expect(free).not.toHaveBeenCalled();
  });

  it("stops freeing after unsubscribe", () => {
    const { free } = fakeSdk();
    const manager = createStreamSdkManager({
      connectAppSdk: vi.fn(),
      getAuth: () => ({ ...INITIAL }),
    });
    const store = fakeAuthStore(INITIAL);
    const unsubscribe = watchAuthIdentity(manager, store);
    unsubscribe();

    store.emit({ ...INITIAL, userKeyHex: "" });
    expect(free).not.toHaveBeenCalled();
  });
});
