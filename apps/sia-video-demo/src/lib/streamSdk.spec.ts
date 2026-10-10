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
