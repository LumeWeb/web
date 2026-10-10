import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Node unit checks for the player screen's user-facing copy. These unit tests
 * run in the node environment (no jsdom), so the component is never
 * server-rendered; the copy is pinned instead via the screen's exported
 * plaintext constants. The module itself is imported lazily (after stubbing
 * the app globals the auth/event stores touch at load) only to read those
 * exported constants.
 */

const ORIGIN = "https://demo.test";

function stubStorage(): Storage {
  const data = new Map<string, string>();
  return {
    clear: () => void data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    get length() {
      return data.size;
    },
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, value),
  };
}

let storage: Storage;

/** Mirrors the app's top-level `window`/`history` so the store module loads. */
function stubGlobals(): void {
  storage = stubStorage();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: storage,
  });
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      history: { replaceState: vi.fn() },
      localStorage: storage,
      location: { hash: "", origin: ORIGIN },
    },
  });
}

beforeEach(() => {
  stubGlobals();
});

afterEach(() => {
  vi.restoreAllMocks();
});

/** Caches one evaluation of the player screen module (same registry as the picks). */
let playerPromise: null | Promise<typeof import("./PlayerScreen")> = null;
function loadPlayer(): Promise<typeof import("./PlayerScreen")> {
  playerPromise ??= import("./PlayerScreen");
  return playerPromise;
}

describe("PlayerScreen copy", () => {
  it("pins the plain selected-source caption copy", async () => {
    const { NO_SOURCE_SELECTED_CAPTION, SOURCE_SELECTED_CAPTION } =
      await loadPlayer();
    expect(SOURCE_SELECTED_CAPTION).toBe("Source selected.");
    expect(NO_SOURCE_SELECTED_CAPTION).toBe("No source selected yet.");
  });
});

describe("PlayerScreen session top-bar action", () => {
  const SHARING_SEED = "a".repeat(64);
  const APP_KEY = "b".repeat(64);

  it("labels the sharing-only session action 'Close share' (no Log out)", async () => {
    const { CLOSE_SHARE_LABEL, topBarActionLabel } = await loadPlayer();
    expect(CLOSE_SHARE_LABEL).toBe("Close share");
    expect(topBarActionLabel(SHARING_SEED, "")).toBe("Close share");
  });

  it("keeps 'Log out' for an authenticated account session", async () => {
    const { LOGOUT_LABEL, topBarActionLabel } = await loadPlayer();
    expect(LOGOUT_LABEL).toBe("Log out");
    expect(topBarActionLabel(null, APP_KEY)).toBe("Log out");
  });

  it("never offers both actions: a shared session prefers 'Close share'", async () => {
    const { topBarActionLabel } = await loadPlayer();
    // With both credentials present the user can Close share to reveal the
    // account session, which then offers Log out alone.
    expect(topBarActionLabel(SHARING_SEED, APP_KEY)).toBe("Close share");
  });
});
