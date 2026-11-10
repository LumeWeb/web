import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthState } from "./auth";

const backend = vi.hoisted(() => ({
  connectAppKey: vi.fn(),
  openAuthRequest: vi.fn(),
}));
vi.mock("../lib/storageBackend", () => ({
  connectAppKey: backend.connectAppKey,
  openAuthRequest: backend.openAuthRequest,
}));
vi.mock("@siafoundation/sia-storage", () => ({
  generateRecoveryPhrase: () => "valid phrase",
  initSia: () => Promise.resolve(),
  validateRecoveryPhrase: (value: string) => {
    if (value !== "valid phrase") throw new Error("Invalid phrase");
  },
}));

const SEED = "d778398e336858ddc1a7de0c78ca22bbe9c821e2786d7b5a941c729e1e5ceb1f";
const OBJECT =
  "a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90";
const ORIGIN = "https://demo.test";
/** The store's persisted-key slot, derived from APP_ID (`sia-auth-<8 hex chars>`). */
const AUTH_STORAGE_KEY = "sia-auth-7d3dfceb";

function stubStorage(): Storage {
  const data = new Map<string, string>();
  return {
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    get length() {
      return data.size;
    },
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, value),
  };
}

/** Returns a fresh Store-like stub, mirroring the app's top-level `window`/`history`. */
function stubWindow(hash = ""): {
  history: { replaceState: ReturnType<typeof vi.fn> };
  location: {
    hash: string;
    origin: string;
    pathname: string;
    reload: ReturnType<typeof vi.fn>;
    search: string;
  };
  reload: ReturnType<typeof vi.fn>;
} {
  // `reload` lives on `location` (production calls `window.location.reload()`);
  // it is also returned at the top level so tests can assert on it directly.
  const location = {
    hash,
    origin: ORIGIN,
    pathname: "/watch",
    reload: vi.fn(),
    search: "?mode=demo",
  };
  const history = { replaceState: vi.fn() };
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: { history, localStorage: storage, location },
  });
  return { history, location, reload: location.reload };
}

let storage: Storage;

/** Loads the store module fresh so its boot-time fragment ingest sees current globals. */
async function importStore() {
  vi.resetModules();
  return import("./auth");
}

beforeEach(() => {
  backend.connectAppKey.mockReset();
  backend.connectAppKey.mockRejectedValue(new Error("Indexer unavailable"));
  backend.openAuthRequest.mockReset();
  storage = stubStorage();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: storage,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("boot-time share-fragment ingest", () => {
  it("applies a #sharing_key seed, persists it, and canonicalizes the fragment", async () => {
    const { history } = stubWindow(`#sharing_key=${SEED.toUpperCase()}`);
    const { useAuthStore } = await importStore();

    expect(useAuthStore.getState().sharingKeyHex).toBe(SEED);
    expect(history.replaceState).toHaveBeenCalledWith(
      null,
      "",
      `#sharing_key=${SEED}`,
    );
    const stored = JSON.parse(storage.getItem(AUTH_STORAGE_KEY)!) as {
      state: Partial<AuthState>;
    };
    expect(stored.state.sharingKeyHex).toBe(SEED);
  });

  it("stashes a one-shot object key and keeps it transient (not persisted)", async () => {
    stubWindow(`#sharing_key=${SEED}&object=${OBJECT}`);
    const { useAuthStore } = await importStore();

    const state = useAuthStore.getState();
    expect(state.objectKey).toBe(OBJECT);
    const stored = JSON.parse(storage.getItem(AUTH_STORAGE_KEY)!) as {
      state: Partial<AuthState>;
    };
    expect(stored.state.objectKey).toBeUndefined();
  });

  it("canonicalizes the fragment via replaceState (not pushState)", async () => {
    const { history } = stubWindow(`#sharing_key=${SEED.toUpperCase()}`);
    await importStore();
    expect(history.replaceState).toHaveBeenCalledTimes(1);
    expect(history.replaceState).toHaveBeenCalledWith(
      null,
      "",
      `#sharing_key=${SEED}`,
    );
  });

  it("ignores a malformed seed fragment instead of arming the player", async () => {
    const { history } = stubWindow("#sharing_key=nothex");
    const { useAuthStore } = await importStore();

    expect(useAuthStore.getState().sharingKeyHex).toBeNull();
    expect(history.replaceState).not.toHaveBeenCalled();
  });

  it("re-ingests on a later hashchange via the exported handler", async () => {
    const { location } = stubWindow("");
    const { ingestSharingFragment: ingest, useAuthStore } = await importStore();
    expect(useAuthStore.getState().sharingKeyHex).toBeNull();

    location.hash = `#sharing_key=${SEED}`;
    ingest();
    expect(useAuthStore.getState().sharingKeyHex).toBe(SEED);
  });
});

describe("setSharingKeySeed (manual paste)", () => {
  it("validates and persists a raw pasted seed", async () => {
    stubWindow("");
    const { useAuthStore } = await importStore();
    useAuthStore.getState().setSharingKeySeed(SEED.toUpperCase());

    const state = useAuthStore.getState();
    expect(state.sharingKeyHex).toBe(SEED);
    expect(state.sharingError).toBeNull();
  });

  it("reports an inline error for an invalid paste and leaves the seed unset", async () => {
    stubWindow("");
    const { useAuthStore } = await importStore();
    useAuthStore.getState().setSharingKeySeed("nope");

    const state = useAuthStore.getState();
    expect(state.sharingKeyHex).toBeNull();
    expect(state.sharingError).toContain("valid sharing key");
  });

  it("clears the seed (and its object key + error) on clearSharingKeySeed", async () => {
    const { history } = stubWindow("");
    const { useAuthStore } = await importStore();
    useAuthStore.getState().setSharingKeySeed(SEED);
    useAuthStore.getState().setObjectKey(OBJECT);
    useAuthStore.getState().clearSharingKeySeed();

    expect(history.replaceState).toHaveBeenLastCalledWith(
      null,
      "",
      "/watch?mode=demo",
    );
    const state = useAuthStore.getState();
    expect(state.sharingKeyHex).toBeNull();
    expect(state.objectKey).toBe("");
    expect(state.sharingError).toBeNull();
  });
});

describe("persist migration", () => {
  it("carries a legacy sharingKeySeed payload over to sharingKeyHex (v1 → v2)", async () => {
    stubWindow("");
    storage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ state: { sharingKeySeed: SEED }, version: 1 }),
    );
    const { useAuthStore } = await importStore();
    expect(useAuthStore.getState().sharingKeyHex).toBe(SEED);
  });

  it("starts disconnected with no sharing key when nothing was persisted", async () => {
    stubWindow("");
    const { useAuthStore } = await importStore();
    const state = useAuthStore.getState();
    expect(state.sharingKeyHex).toBeNull();
    expect(state.userKeyHex).toBe("");
    expect(state.status).toBe("disconnected");
  });
});

describe("reconnect", () => {
  it("skips the reconnect when the status is already non-disconnected", async () => {
    stubWindow("");
    const { useAuthStore } = await importStore();
    useAuthStore.setState({ status: "connected", userKeyHex: SEED });

    await useAuthStore.getState().reconnect();

    const state = useAuthStore.getState();
    expect(state.status).toBe("connected");
    expect(state.userKeyHex).toBe(SEED);
  });

  it("preserves userKeyHex on a transient reconnect failure", async () => {
    stubWindow("");
    const { useAuthStore } = await importStore();
    useAuthStore.setState({ status: "disconnected", userKeyHex: SEED });

    await useAuthStore.getState().reconnect();

    expect(useAuthStore.getState().userKeyHex).toBe(SEED);
    expect(useAuthStore.getState().status).toBe("disconnected");
    expect(useAuthStore.getState().reconnectError).not.toBeNull();
    expect(backend.connectAppKey).toHaveBeenCalledTimes(1);
  });
});

describe("account authorization", () => {
  it("saves an approved account key and owns its session until logout", async () => {
    const { reload } = stubWindow("");
    let approve!: () => void;
    const freeRequest = vi.fn();
    const freeSdk = vi.fn();
    const freeKey = vi.fn();
    backend.openAuthRequest.mockResolvedValue({
      free: freeRequest,
      register: vi.fn().mockResolvedValue({
        appKey: () => ({
          export: () => Uint8Array.from(Buffer.from(SEED, "hex")),
          free: freeKey,
        }),
        free: freeSdk,
      }),
      responseUrl: () => "https://indexer.test/approve",
      waitForApproval: () =>
        new Promise<void>((resolve) => {
          approve = resolve;
        }),
    });
    const { useAuthStore } = await importStore();
    await useAuthStore.getState().requestConnection("https://indexer.test");
    expect(useAuthStore.getState().approvalUrl).toBe(
      "https://indexer.test/approve",
    );
    const waiting = useAuthStore.getState().waitForApproval();
    approve();
    await waiting;
    await useAuthStore.getState().register("valid phrase");

    expect(useAuthStore.getState().status).toBe("connected");
    expect(useAuthStore.getState().userKeyHex).toBe(SEED);
    expect(freeKey).toHaveBeenCalledTimes(1);
    expect(freeSdk).not.toHaveBeenCalled();
    expect(freeRequest).toHaveBeenCalledTimes(1);
    useAuthStore.getState().logout();
    expect(freeSdk).toHaveBeenCalledTimes(1);
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it("retries a failed key save without registering again", async () => {
    stubWindow("");
    let approve!: () => void;
    const register = vi.fn().mockResolvedValue({
      appKey: () => ({
        export: () => Uint8Array.from(Buffer.from(SEED, "hex")),
        free: vi.fn(),
      }),
      free: vi.fn(),
    });
    backend.openAuthRequest.mockResolvedValue({
      free: vi.fn(),
      register,
      responseUrl: () => "https://indexer.test/approve",
      waitForApproval: () =>
        new Promise<void>((resolve) => {
          approve = resolve;
        }),
    });
    const { useAuthStore } = await importStore();
    const save = storage.setItem.bind(storage);
    const savedKey = (value: string) =>
      (JSON.parse(value) as { state: { userKeyHex?: string } }).state
        .userKeyHex;
    let fail = true;
    storage.setItem = (key, value) => {
      if (fail && key === AUTH_STORAGE_KEY && savedKey(value) === SEED) {
        fail = false;
        throw new Error("Storage full");
      }
      save(key, value);
    };
    await useAuthStore.getState().requestConnection("https://indexer.test");
    const waiting = useAuthStore.getState().waitForApproval();
    approve();
    await waiting;
    await expect(
      useAuthStore.getState().register("valid phrase"),
    ).rejects.toThrow("Could not save");
    expect(useAuthStore.getState().saveError).not.toBeNull();
    expect(useAuthStore.getState().status).toBe("registering");
    await useAuthStore.getState().retrySave();
    expect(useAuthStore.getState().status).toBe("connected");
    expect(register).toHaveBeenCalledTimes(1);
    expect(savedKey(storage.getItem(AUTH_STORAGE_KEY)!)).toBe(SEED);
  });

  it("a failed approval releases its request and can start a new one", async () => {
    stubWindow("");
    let rejectApproval!: () => void;
    const free = vi.fn();
    backend.openAuthRequest
      .mockResolvedValueOnce({
        free,
        register: vi.fn(),
        responseUrl: () => "https://indexer.test/approve",
        waitForApproval: () =>
          new Promise<void>((_resolve, reject) => {
            rejectApproval = () => reject(new Error("Approval denied"));
          }),
      })
      .mockResolvedValueOnce({
        free: vi.fn(),
        register: vi.fn(),
        responseUrl: () => "https://indexer.test/retry",
        waitForApproval: () => new Promise<void>(() => undefined),
      });
    const { useAuthStore } = await importStore();
    await useAuthStore.getState().requestConnection("https://indexer.test");
    const waiting = useAuthStore.getState().waitForApproval();
    rejectApproval();
    await expect(waiting).rejects.toThrow("Connection approval failed");
    await vi.waitFor(() => expect(free).toHaveBeenCalledTimes(1));

    await useAuthStore.getState().requestConnection("https://indexer.test");
    expect(useAuthStore.getState().approvalUrl).toBe(
      "https://indexer.test/retry",
    );
    expect(backend.openAuthRequest).toHaveBeenCalledTimes(2);
  });

  it("changing the indexer retires an approval and cannot open recovery", async () => {
    stubWindow("");
    let finishApproval!: () => void;
    const free = vi.fn();
    backend.openAuthRequest.mockResolvedValue({
      free,
      register: vi.fn(),
      responseUrl: () => "https://indexer.test/approve",
      waitForApproval: () =>
        new Promise<void>((resolve) => {
          finishApproval = resolve;
        }),
    });
    const { useAuthStore } = await importStore();
    await useAuthStore.getState().requestConnection("https://indexer.test");
    const pending = useAuthStore.getState().waitForApproval();
    useAuthStore.getState().setIndexerUrl("https://another.test");
    finishApproval();
    await pending;

    expect(useAuthStore.getState().status).toBe("disconnected");
    await vi.waitFor(() => expect(free).toHaveBeenCalledTimes(1));
  });
});

describe("logout", () => {
  it("clears the persisted sharing key + object and the share fragment, routing to the gate without a reload", async () => {
    const { history, reload } = stubWindow(
      `#sharing_key=${SEED}&object=${OBJECT}`,
    );
    const { useAuthStore } = await importStore();
    expect(useAuthStore.getState().sharingKeyHex).toBe(SEED);
    expect(useAuthStore.getState().objectKey).toBe(OBJECT);

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.sharingKeyHex).toBeNull();
    expect(state.objectKey).toBe("");
    // Sharing-key logout must NOT reload the window: the store now routes to
    // the gate on its own, so a reload would only cause UI flicker.
    expect(reload).not.toHaveBeenCalled();
    // The fragment-free path/query prevents boot ingest from restoring the
    // session after logout.
    expect(history.replaceState).toHaveBeenLastCalledWith(
      null,
      "",
      "/watch?mode=demo",
    );
    const stored = JSON.parse(storage.getItem(AUTH_STORAGE_KEY)!) as {
      state: { sharingKeyHex?: null | string };
    };
    expect(stored.state.sharingKeyHex).toBeNull();
  });

  it("retains the full window reload for an SSO/app-key logout", async () => {
    const { reload } = stubWindow("");
    const { useAuthStore } = await importStore();
    useAuthStore.setState({ status: "connected", userKeyHex: SEED });

    useAuthStore.getState().logout();

    expect(reload).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().userKeyHex).toBe("");
  });
});
