import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthState } from "./auth";

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
