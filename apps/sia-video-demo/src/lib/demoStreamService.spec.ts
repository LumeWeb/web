// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("./streamService", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./streamService")>();
  return {
    ...actual,
    createDemoNativeStreamService: vi.fn(
      (auth: Parameters<typeof actual.createDemoNativeStreamService>[0]) => ({
        auth,
      }),
    ),
  };
});

import { createDemoNativeStreamService } from "./streamService";

describe("demo video service setup", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("constructs one service from live account and sharing state without startup configuration", async () => {
    const records = new Map<string, string>();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => records.get(key) ?? null,
      removeItem: (key: string) => void records.delete(key),
      setItem: (key: string, value: string) => void records.set(key, value),
    });
    const { getDemoNativeStreamService } = await import("./demoStreamService");
    const { demoSettingsStore } = await import("../stores/authSettings");
    const first = getDemoNativeStreamService();
    expect(getDemoNativeStreamService()).toBe(first);
    expect(createDemoNativeStreamService).toHaveBeenCalledTimes(1);
    const auth = vi.mocked(createDemoNativeStreamService).mock.calls[0]?.[0];
    expect(auth?.get?.().userKeyHex).toBe("");
    const original = demoSettingsStore.getState();
    const observed: (null | string)[] = [];
    const stop = auth?.subscribe?.((state) =>
      observed.push(state.sharingKeyHex),
    );
    try {
      demoSettingsStore.setState({ sharingKeyHex: "aa".repeat(32) });
      expect(auth?.get?.().sharingKeyHex).toBe("aa".repeat(32));
      expect(observed).toEqual(["aa".repeat(32)]);
    } finally {
      stop?.();
      demoSettingsStore.setState(original, true);
    }
  });
});
