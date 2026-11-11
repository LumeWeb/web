import { AccessFailure, AccessPhase } from "@lumeweb/sia-app-access";
import type { AccessInteractionSnapshot } from "@lumeweb/sia-app-access";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { selectAuthStep } from "../components/auth/authFlow";
import type { DemoSettingsState } from "./authSettings";

const backend = vi.hoisted(() => ({
  connectAppKey: vi.fn(),
  initSia: vi.fn(),
  openAuthRequest: vi.fn(),
}));
vi.mock(
  "@lumeweb/sia-app-access/sia",
  async () => import("../../tests/playback/accessAdapter"),
);
vi.mock("../../tests/playback/backend", () => ({
  connectAppKey: backend.connectAppKey,
  openAuthRequest: backend.openAuthRequest,
}));
vi.mock("@siafoundation/sia-storage", () => ({
  generateRecoveryPhrase: () => "valid phrase",
  initSia: backend.initSia,
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

let accountSnapshot: () => AccessInteractionSnapshot | null = () => null;
let demoAccount: typeof import("./auth").demoAccount;
function accountStep() {
  return selectAuthStep({ sharingKeyHex: null, snapshot: accountSnapshot() });
}

/** Fresh settings import reads the test's URL fragment before the first render. */
async function importStore() {
  vi.resetModules();
  const module = await import("./auth");
  const { demoSettingsStore, ingestSharingFragment } =
    await import("./authSettings");
  accountSnapshot = module.currentDemoAccountSnapshot;
  demoAccount = module.demoAccount;
  return { ...module, demoSettingsStore, ingestSharingFragment };
}

beforeEach(() => {
  backend.connectAppKey.mockReset();
  backend.connectAppKey.mockRejectedValue(new Error("Indexer unavailable"));
  backend.initSia.mockReset().mockResolvedValue(undefined);
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
    const { demoSettingsStore } = await importStore();

    expect(demoSettingsStore.getState().sharingKeyHex).toBe(SEED);
    expect(history.replaceState).toHaveBeenCalledWith(
      null,
      "",
      `#sharing_key=${SEED}`,
    );
    const stored = JSON.parse(storage.getItem(AUTH_STORAGE_KEY)!) as {
      state: Partial<DemoSettingsState>;
    };
    expect(stored.state.sharingKeyHex).toBe(SEED);
  });

  it("stashes a one-shot object key and keeps it transient (not persisted)", async () => {
    stubWindow(`#sharing_key=${SEED}&object=${OBJECT}`);
    const { demoSettingsStore } = await importStore();

    const state = demoSettingsStore.getState();
    expect(state.objectKey).toBe(OBJECT);
    const stored = JSON.parse(storage.getItem(AUTH_STORAGE_KEY)!) as {
      state: Partial<DemoSettingsState>;
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
    const { demoSettingsStore } = await importStore();

    expect(demoSettingsStore.getState().sharingKeyHex).toBeNull();
    expect(history.replaceState).not.toHaveBeenCalled();
  });

  it("re-ingests on a later hashchange via the exported handler", async () => {
    const { location } = stubWindow("");
    const { demoSettingsStore, ingestSharingFragment: ingest } =
      await importStore();
    expect(demoSettingsStore.getState().sharingKeyHex).toBeNull();

    location.hash = `#sharing_key=${SEED}`;
    ingest();
    expect(demoSettingsStore.getState().sharingKeyHex).toBe(SEED);
  });
});

describe("setSharingKeySeed (manual paste)", () => {
  it("validates and persists a raw pasted seed", async () => {
    stubWindow("");
    const { demoSettingsStore } = await importStore();
    demoSettingsStore.getState().setSharingKeySeed(SEED.toUpperCase());

    const state = demoSettingsStore.getState();
    expect(state.sharingKeyHex).toBe(SEED);
    expect(state.sharingError).toBeNull();
  });

  it("reports an inline error for an invalid paste and leaves the seed unset", async () => {
    stubWindow("");
    const { demoSettingsStore } = await importStore();
    demoSettingsStore.getState().setSharingKeySeed("nope");

    const state = demoSettingsStore.getState();
    expect(state.sharingKeyHex).toBeNull();
    expect(state.sharingError).toContain("valid sharing key");
  });

  it("clears the seed (and its object key + error) on clearSharingKeySeed", async () => {
    const { history } = stubWindow("");
    const { demoSettingsStore } = await importStore();
    demoSettingsStore.getState().setSharingKeySeed(SEED);
    demoSettingsStore.getState().setObjectKey(OBJECT);
    demoSettingsStore.getState().clearSharingKeySeed();

    expect(history.replaceState).toHaveBeenLastCalledWith(
      null,
      "",
      "/watch?mode=demo",
    );
    const state = demoSettingsStore.getState();
    expect(state.sharingKeyHex).toBeNull();
    expect(state.objectKey).toBe("");
    expect(state.sharingError).toBeNull();
  });
});

describe("persist migration", () => {
  it("carries a legacy sharingKeySeed payload over to sharingKeyHex", async () => {
    stubWindow("");
    storage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ state: { sharingKeySeed: SEED }, version: 1 }),
    );
    const { demoSettingsStore } = await importStore();
    expect(demoSettingsStore.getState().sharingKeyHex).toBe(SEED);
  });

  it("restores a version 2 saved account key for reconnect", async () => {
    stubWindow("");
    storage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        state: {
          indexerUrl: "https://indexer.test",
          sharingKeyHex: null,
          userKeyHex: SEED,
        },
        version: 2,
      }),
    );
    const { demoSettingsStore } = await importStore();
    expect(demoSettingsStore.getState().savedUserKeyHex).toBe(SEED);
    expect("userKeyHex" in demoSettingsStore.getState()).toBe(false);
  });

  it("restores the saved account key from a current-version payload", async () => {
    stubWindow("");
    storage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({
        state: {
          indexerUrl: "https://indexer.test",
          sharingKeyHex: null,
          userKeyHex: SEED,
        },
        version: 3,
      }),
    );
    const { demoSettingsStore } = await importStore();
    expect(demoSettingsStore.getState().savedUserKeyHex).toBe(SEED);
    expect("userKeyHex" in demoSettingsStore.getState()).toBe(false);
  });

  it("starts disconnected with no sharing key when nothing was persisted", async () => {
    stubWindow("");
    const { demoSettingsStore } = await importStore();
    const state = demoSettingsStore.getState();
    expect(state.sharingKeyHex).toBeNull();
    expect(state.savedUserKeyHex).toBe("");
    expect(accountStep()).toBe("gate");
  });
});

describe("reconnect", () => {
  it("skips a second reconnect once account access is ready", async () => {
    stubWindow("");
    backend.connectAppKey.mockResolvedValue({ free: vi.fn() });
    const { demoSettingsStore } = await importStore();
    demoSettingsStore.setState({ savedUserKeyHex: SEED });

    await demoAccount.reconnect();
    await demoAccount.reconnect();

    expect(backend.connectAppKey).toHaveBeenCalledTimes(1);
    expect(accountStep()).toBe("player");
    expect(demoSettingsStore.getState().savedUserKeyHex).toBe(SEED);
  });

  it("an explicit saved-account reconnect replaces an account-entry error", async () => {
    stubWindow("");
    const { demoSettingsStore } = await importStore();
    demoSettingsStore.setState({
      accountError: "Could not register the account. Start again.",
      savedUserKeyHex: SEED,
    });

    await demoAccount.reconnect();

    expect(backend.connectAppKey).toHaveBeenCalledTimes(1);
    expect(demoSettingsStore.getState().accountError).toBeNull();
    expect(demoSettingsStore.getState().reconnectError).not.toBeNull();
    expect(demoSettingsStore.getState().savedUserKeyHex).toBe(SEED);
  });

  it("an old player's seed supplier cannot read a replacement account", async () => {
    stubWindow("");
    backend.connectAppKey.mockImplementation(() =>
      Promise.resolve({
        appKey: () => ({
          export: () => Uint8Array.from(Buffer.from(SEED, "hex")),
          free: vi.fn(),
        }),
        free: vi.fn(),
      }),
    );
    const { copyDemoActiveAppKeySeed, demoSettingsStore } = await importStore();
    demoSettingsStore.setState({ savedUserKeyHex: SEED });
    await demoAccount.reconnect();
    const oldSessionId = accountSnapshot()?.activeSessionId ?? null;
    expect(oldSessionId).toMatch(/^access:/);
    demoAccount.setIndexerUrl("https://second.test");
    await demoAccount.reconnect();
    const newSessionId = accountSnapshot()?.activeSessionId ?? null;

    expect(newSessionId).toMatch(/^access:/);
    expect(newSessionId).not.toBe(oldSessionId);
    expect(() => copyDemoActiveAppKeySeed(oldSessionId)).toThrow(
      "Session unavailable",
    );
    expect(copyDemoActiveAppKeySeed(newSessionId)).toEqual(
      Uint8Array.from(Buffer.from(SEED, "hex")),
    );
    expect(demoSettingsStore.getState().savedUserKeyHex).toBe(SEED);
  });

  it("a failing account observer cannot block replacement notifications or SDK cleanup", async () => {
    stubWindow("");
    const free = vi.fn();
    backend.connectAppKey.mockResolvedValue({ free });
    const {
      currentDemoAccountSnapshot,
      demoSettingsStore,
      subscribeDemoAccount,
    } = await importStore();
    demoSettingsStore.setState({ savedUserKeyHex: SEED });
    await demoAccount.reconnect();
    const observed: (AccessPhase | null)[] = [];
    const stopFailing = subscribeDemoAccount(() => {
      throw new Error(SEED);
    });
    const stopObserving = subscribeDemoAccount(() => {
      observed.push(currentDemoAccountSnapshot()?.state.phase ?? null);
    });
    try {
      expect(() =>
        demoAccount.setIndexerUrl("https://second.test"),
      ).not.toThrow();
      expect(observed).toEqual([null]);
      await vi.waitFor(() => expect(free).toHaveBeenCalledTimes(1));
      const { useEventLogStore } = await import("./eventLog");
      expect(useEventLogStore.getState().lines.at(-1)?.message).toBe(
        "Account observer failed",
      );
      expect(JSON.stringify(useEventLogStore.getState().lines)).not.toContain(
        SEED,
      );
    } finally {
      stopFailing();
      stopObserving();
    }
  });

  it("notifies account subscribers when settings cannot persist the ready state", async () => {
    stubWindow("");
    let finish!: (sdk: { free: ReturnType<typeof vi.fn> }) => void;
    backend.connectAppKey.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const {
      currentDemoAccountSnapshot,
      demoSettingsStore,
      subscribeDemoAccount,
    } = await importStore();
    demoSettingsStore.setState({ savedUserKeyHex: SEED });
    const observed: (AccessPhase | null)[] = [];
    const unsubscribe = subscribeDemoAccount(() => {
      observed.push(currentDemoAccountSnapshot()?.state.phase ?? null);
    });
    const reconnect = demoAccount.reconnect();
    await vi.waitFor(() =>
      expect(backend.connectAppKey).toHaveBeenCalledTimes(1),
    );
    const save = storage.setItem.bind(storage);
    try {
      storage.setItem = () => {
        throw new Error("Storage full");
      };
      finish({ free: vi.fn() });
      await reconnect;
      expect(accountStep()).toBe("player");
      expect(observed).toContain(AccessPhase.Ready);
    } finally {
      storage.setItem = save;
      unsubscribe();
    }
  });

  it("preserves the confirmed key on a transient reconnect failure", async () => {
    stubWindow("");
    const { demoSettingsStore } = await importStore();
    demoSettingsStore.setState({ savedUserKeyHex: SEED });

    await demoAccount.reconnect();

    expect(demoSettingsStore.getState().savedUserKeyHex).toBe(SEED);
    expect(accountStep()).toBe("gate");
    expect(demoSettingsStore.getState().reconnectError).not.toBeNull();
    expect(backend.connectAppKey).toHaveBeenCalledTimes(1);
  });
});

describe("account authorization", () => {
  it("shows a connection error after the connecting screen closes", async () => {
    stubWindow("");
    backend.openAuthRequest.mockRejectedValue(new Error("Indexer offline"));
    const { demoSettingsStore } = await importStore();

    await expect(
      demoAccount.requestConnection("https://indexer.test"),
    ).rejects.toThrow("Could not connect");
    expect(accountStep()).toBe("gate");
    expect(demoSettingsStore.getState().accountError).toContain("connect");
  });

  it("registration failure returns to an account entry that can retry", async () => {
    stubWindow("");
    backend.openAuthRequest.mockImplementation(() =>
      Promise.resolve({
        free: vi.fn(),
        register: vi
          .fn()
          .mockRejectedValue(new Error("Registration unavailable")),
        responseUrl: () => "https://indexer.test/approve",
        waitForApproval: () => Promise.resolve(),
      }),
    );
    const { demoSettingsStore } = await importStore();
    await demoAccount.requestConnection("https://indexer.test");
    await demoAccount.waitForApproval();

    await expect(demoAccount.register("valid phrase")).rejects.toThrow(
      "register",
    );
    expect(accountStep()).toBe("gate");
    expect(demoSettingsStore.getState().accountError).toContain("register");
    await demoAccount.requestConnection("https://indexer.test");
    expect(backend.openAuthRequest).toHaveBeenCalledTimes(2);
  });

  it("keeps a registration failure when request cleanup also fails", async () => {
    stubWindow("");
    const free = vi.fn(() => {
      throw new Error(SEED);
    });
    backend.openAuthRequest.mockResolvedValue({
      free,
      register: vi
        .fn()
        .mockRejectedValue(new Error("Registration unavailable")),
      responseUrl: () => "https://indexer.test/approve",
      waitForApproval: () => Promise.resolve(),
    });
    await importStore();
    await demoAccount.requestConnection("https://indexer.test");
    await demoAccount.waitForApproval();

    await expect(demoAccount.register("valid phrase")).rejects.toThrow(
      "Could not register the account",
    );
    expect(accountStep()).toBe("gate");
    expect(free).toHaveBeenCalledTimes(1);
    const { useEventLogStore } = await import("./eventLog");
    await vi.waitFor(() =>
      expect(
        useEventLogStore
          .getState()
          .lines.some((line) => line.message === "Account SDK cleanup failed"),
      ).toBe(true),
    );
    expect(JSON.stringify(useEventLogStore.getState().lines)).not.toContain(
      SEED,
    );
  });

  it("reconnects a saved account after another registration fails", async () => {
    stubWindow("");
    backend.openAuthRequest.mockResolvedValue({
      free: vi.fn(),
      register: vi
        .fn()
        .mockRejectedValue(new Error("Registration unavailable")),
      responseUrl: () => "https://indexer.test/approve",
      waitForApproval: () => Promise.resolve(),
    });
    backend.connectAppKey.mockResolvedValue({ free: vi.fn() });
    const { demoSettingsStore } = await importStore();
    demoSettingsStore.setState({ savedUserKeyHex: SEED });
    await demoAccount.requestConnection("https://indexer.test");
    await demoAccount.waitForApproval();
    await expect(demoAccount.register("valid phrase")).rejects.toThrow(
      "register",
    );

    await demoAccount.reconnect();
    expect(backend.connectAppKey).toHaveBeenCalledTimes(1);
    expect(accountStep()).toBe("player");
    expect(demoSettingsStore.getState().accountError).toBeNull();
  });

  it("phrase-check failure returns to account entry for a new approval", async () => {
    stubWindow("");
    backend.openAuthRequest.mockResolvedValue({
      free: vi.fn(),
      register: vi.fn(),
      responseUrl: () => "https://indexer.test/approve",
      waitForApproval: () => Promise.resolve(),
    });
    const { demoSettingsStore } = await importStore();
    await demoAccount.requestConnection("https://indexer.test");
    await demoAccount.waitForApproval();
    backend.initSia.mockRejectedValueOnce(new Error("WASM unavailable"));

    await expect(demoAccount.register("valid phrase")).rejects.toThrow(
      "check the recovery phrase",
    );
    expect(accountStep()).toBe("gate");
    expect(demoSettingsStore.getState().accountError).toContain(
      "check the recovery phrase",
    );
    await demoAccount.requestConnection("https://indexer.test");
    expect(backend.openAuthRequest).toHaveBeenCalledTimes(2);
  });

  it("saves an approved account key and reports cleanup failure without exposing the key", async () => {
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
    const { copyDemoActiveAppKeySeed, demoSettingsStore } = await importStore();
    await demoAccount.requestConnection("https://indexer.test");
    expect(accountSnapshot()?.state).toMatchObject({
      approvalUrl: "https://indexer.test/approve",
      phase: AccessPhase.AwaitingApproval,
    });
    const waiting = demoAccount.waitForApproval();
    approve();
    await waiting;
    await demoAccount.register("valid phrase");

    expect(accountStep()).toBe("player");
    expect(demoSettingsStore.getState().savedUserKeyHex).toBe(SEED);
    expect(accountSnapshot()?.activeSessionId).toMatch(/^access:/);
    expect(() => copyDemoActiveAppKeySeed("access:stale")).toThrow(
      "Session unavailable",
    );
    const first = copyDemoActiveAppKeySeed(
      accountSnapshot()?.activeSessionId ?? null,
    );
    first.fill(0);
    expect(
      copyDemoActiveAppKeySeed(accountSnapshot()?.activeSessionId ?? null),
    ).toEqual(Uint8Array.from(Buffer.from(SEED, "hex")));
    expect("userKeyHex" in demoSettingsStore.getState()).toBe(false);
    expect(freeKey).toHaveBeenCalledTimes(3);
    expect(freeSdk).not.toHaveBeenCalled();
    expect(freeRequest).toHaveBeenCalledTimes(1);
    const { useEventLogStore } = await import("./eventLog");
    freeSdk.mockImplementationOnce(() => {
      throw new Error(SEED);
    });
    demoAccount.logout();
    expect(freeSdk).toHaveBeenCalledTimes(1);
    await vi.waitFor(() => {
      expect(
        useEventLogStore
          .getState()
          .lines.some((line) => line.message === "Account SDK cleanup failed"),
      ).toBe(true);
    });
    expect(JSON.stringify(useEventLogStore.getState().lines)).not.toContain(
      SEED,
    );
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
    await importStore();
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
    await demoAccount.requestConnection("https://indexer.test");
    const waiting = demoAccount.waitForApproval();
    approve();
    await waiting;
    await expect(demoAccount.register("valid phrase")).rejects.toThrow(
      "Could not save",
    );
    expect(accountSnapshot()?.state).toMatchObject({
      failure: AccessFailure.CredentialsWrite,
      phase: AccessPhase.Failed,
    });
    expect(accountStep()).toBe("recovery");
    expect(savedKey(storage.getItem(AUTH_STORAGE_KEY)!)).toBe("");
    await demoAccount.retrySave();
    expect(accountStep()).toBe("player");
    expect(register).toHaveBeenCalledTimes(1);
    expect(savedKey(storage.getItem(AUTH_STORAGE_KEY)!)).toBe(SEED);
  });

  it("continues after a failed key save without persisting the active key", async () => {
    stubWindow("");
    let approve!: () => void;
    backend.openAuthRequest.mockResolvedValue({
      free: vi.fn(),
      register: vi.fn().mockResolvedValue({
        appKey: () => ({
          export: () => Uint8Array.from(Buffer.from(SEED, "hex")),
          free: vi.fn(),
        }),
        free: vi.fn(),
      }),
      responseUrl: () => "https://indexer.test/approve",
      waitForApproval: () =>
        new Promise<void>((resolve) => {
          approve = resolve;
        }),
    });
    const { copyDemoActiveAppKeySeed, demoSettingsStore } = await importStore();
    const save = storage.setItem.bind(storage);
    storage.setItem = (key, value) => {
      if (
        key === AUTH_STORAGE_KEY &&
        (JSON.parse(value) as { state: { userKeyHex: string } }).state
          .userKeyHex === SEED
      )
        throw new Error("Storage full");
      save(key, value);
    };
    await demoAccount.requestConnection("https://indexer.test");
    const waiting = demoAccount.waitForApproval();
    approve();
    await waiting;
    await expect(demoAccount.register("valid phrase")).rejects.toThrow(
      "Could not save",
    );

    demoAccount.continueWithoutSaving();
    demoSettingsStore.getState().setObjectKey(OBJECT);
    expect(accountStep()).toBe("player");
    expect(demoSettingsStore.getState().savedUserKeyHex).toBe("");
    expect(
      copyDemoActiveAppKeySeed(accountSnapshot()?.activeSessionId ?? null),
    ).toEqual(Uint8Array.from(Buffer.from(SEED, "hex")));
    const stored = JSON.parse(storage.getItem(AUTH_STORAGE_KEY)!) as {
      state: { userKeyHex: string };
    };
    expect(stored.state.userKeyHex).toBe("");
    demoAccount.setIndexerUrl("https://another.test");
    await demoAccount.reconnect();
    expect(backend.connectAppKey).not.toHaveBeenCalled();
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
    await importStore();
    await demoAccount.requestConnection("https://indexer.test");
    const waiting = demoAccount.waitForApproval();
    rejectApproval();
    await expect(waiting).rejects.toThrow("Connection approval failed");
    expect(accountStep()).toBe("gate");
    expect(accountSnapshot()?.state).toMatchObject({
      failure: AccessFailure.Approval,
      phase: AccessPhase.Failed,
    });
    await vi.waitFor(() => expect(free).toHaveBeenCalledTimes(1));

    await demoAccount.requestConnection("https://indexer.test");
    expect(accountSnapshot()?.state).toMatchObject({
      approvalUrl: "https://indexer.test/retry",
      phase: AccessPhase.AwaitingApproval,
    });
    expect(backend.openAuthRequest).toHaveBeenCalledTimes(2);
  });

  it("an old approval cannot replace a new indexer's approval link", async () => {
    stubWindow("");
    let finishOld!: () => void;
    backend.openAuthRequest
      .mockResolvedValueOnce({
        free: vi.fn(),
        register: vi.fn(),
        responseUrl: () => "https://first.test/approve",
        waitForApproval: () =>
          new Promise<void>((resolve) => {
            finishOld = resolve;
          }),
      })
      .mockResolvedValueOnce({
        free: vi.fn(),
        register: vi.fn(),
        responseUrl: () => "https://second.test/approve",
        waitForApproval: () => new Promise<void>(() => undefined),
      });
    await importStore();
    await demoAccount.requestConnection("https://first.test");
    const oldApproval = demoAccount.waitForApproval();
    demoAccount.setIndexerUrl("https://second.test");
    await demoAccount.requestConnection("https://second.test");
    finishOld();
    await oldApproval;

    expect(accountSnapshot()?.state).toMatchObject({
      approvalUrl: "https://second.test/approve",
      phase: AccessPhase.AwaitingApproval,
    });
    expect(accountStep()).toBe("approve");
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
    await importStore();
    await demoAccount.requestConnection("https://indexer.test");
    const pending = demoAccount.waitForApproval();
    demoAccount.setIndexerUrl("https://another.test");
    finishApproval();
    await pending;

    expect(accountSnapshot()).toBeNull();
    expect(accountStep()).toBe("gate");
    await vi.waitFor(() => expect(free).toHaveBeenCalledTimes(1));
  });
});

it("reports a rejected account cleanup after replacing the indexer", async () => {
  stubWindow("");
  const free = vi.fn(() => Promise.reject(new Error("cleanup failed")));
  let finishApproval!: () => void;
  backend.openAuthRequest.mockResolvedValue({
    free,
    register: vi.fn(),
    responseUrl: () => "https://indexer.test/approve",
    waitForApproval: () =>
      new Promise<void>((resolve) => {
        finishApproval = resolve;
      }),
  });
  await importStore();
  const { useEventLogStore } = await import("./eventLog");
  useEventLogStore.setState({ lines: [] });

  await demoAccount.requestConnection("https://indexer.test");
  const waiting = demoAccount.waitForApproval();
  demoAccount.setIndexerUrl("https://another.test");
  finishApproval();
  await waiting;

  await vi.waitFor(() => expect(free).toHaveBeenCalledTimes(1));
  const cleanupMessages = useEventLogStore
    .getState()
    .lines.filter((line) => line.message.startsWith("Account "))
    .map((line) => line.message);
  expect(cleanupMessages).toContain("Account controller cleanup failed");
});

describe("logout", () => {
  it("clears the persisted sharing key + object and the share fragment, routing to the gate without a reload", async () => {
    const { history, reload } = stubWindow(
      `#sharing_key=${SEED}&object=${OBJECT}`,
    );
    const { demoSettingsStore } = await importStore();
    expect(demoSettingsStore.getState().sharingKeyHex).toBe(SEED);
    expect(demoSettingsStore.getState().objectKey).toBe(OBJECT);

    demoAccount.logout();

    const state = demoSettingsStore.getState();
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
    const { demoSettingsStore } = await importStore();
    demoSettingsStore.setState({ savedUserKeyHex: SEED });

    demoAccount.logout();

    expect(reload).toHaveBeenCalledTimes(1);
    expect(demoSettingsStore.getState().savedUserKeyHex).toBe("");
  });
});
