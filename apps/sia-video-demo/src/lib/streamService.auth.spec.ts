import { describe, expect, it, vi } from "vitest";
import { createDemoStreamAuthSource } from "./streamService";

function sources() {
  let state = {
    indexerUrl: "https://indexer.example",
    savedUserKeyHex: "cc".repeat(32),
    sharingKeyHex: null as null | string,
  };
  let active: null | string = "aa".repeat(32);
  const storeListeners = new Set<() => void>();
  const accountListeners = new Set<() => void>();
  const store = {
    getState: () => state,
    subscribe: (listener: () => void) => {
      storeListeners.add(listener);
      return () => void storeListeners.delete(listener);
    },
  };
  const account = {
    activeAppKeyHex: () => active,
    subscribe: (listener: () => void) => {
      accountListeners.add(listener);
      return () => void accountListeners.delete(listener);
    },
  };
  return {
    account,
    listenerCounts: () => [storeListeners.size, accountListeners.size],
    setActive(value: null | string) {
      active = value;
      accountListeners.forEach((listener) => listener());
    },
    setSharing(value: null | string) {
      state = { ...state, sharingKeyHex: value };
      storeListeners.forEach((listener) => listener());
    },
    store,
  };
}

describe("demo stream auth source", () => {
  it("uses the active account key, not the persisted key", () => {
    const inputs = sources();
    const source = createDemoStreamAuthSource(inputs.store, inputs.account);
    expect(source.get?.()).toEqual({
      indexerUrl: "https://indexer.example",
      sharingKeyHex: null,
      userKeyHex: "aa".repeat(32),
    });
    inputs.setActive(null);
    expect(source.get?.().userKeyHex).toBe("");
  });

  it("publishes account and sharing changes, then releases both subscriptions", () => {
    const inputs = sources();
    const source = createDemoStreamAuthSource(inputs.store, inputs.account);
    const listener = vi.fn();
    const unsubscribe = source.subscribe?.(listener);
    expect(inputs.listenerCounts()).toEqual([1, 1]);

    inputs.setActive(null);
    inputs.setSharing("bb".repeat(32));
    inputs.setSharing("bb".repeat(32));
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener.mock.calls[0]?.[0]).toEqual({
      indexerUrl: "https://indexer.example",
      sharingKeyHex: null,
      userKeyHex: "",
    });
    expect(listener.mock.calls[1]?.[0]).toEqual({
      indexerUrl: "https://indexer.example",
      sharingKeyHex: "bb".repeat(32),
      userKeyHex: "",
    });

    unsubscribe?.();
    expect(inputs.listenerCounts()).toEqual([0, 0]);
    inputs.setActive("dd".repeat(32));
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
