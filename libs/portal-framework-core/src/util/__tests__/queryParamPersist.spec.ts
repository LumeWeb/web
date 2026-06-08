import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

vi.mock("unstorage", () => ({
  createStorage: vi.fn(() => mockStorage),
}));

vi.mock("unstorage/drivers/localstorage", () => ({
  default: vi.fn(() => ({})),
}));

describe("queryParamPersist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("window", {
      location: { search: "" },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("setQueryParamStorageBase", () => {
    it("sets the base prefix before storage is initialized", async () => {
      vi.resetModules();
      const { setQueryParamStorageBase, readPersistedParam } = await import(
        "../queryParamPersist"
      );

      setQueryParamStorageBase("custom:base:");

      mockStorage.getItem.mockResolvedValue("test-value");
      const result = await readPersistedParam("someKey");
      expect(result).toBe("test-value");
    });

    it("throws if called after first read/write (storage already initialized)", async () => {
      vi.resetModules();
      const { setQueryParamStorageBase, readPersistedParam } = await import(
        "../queryParamPersist"
      );

      mockStorage.getItem.mockResolvedValue(null);
      await readPersistedParam("anyKey");

      expect(() => setQueryParamStorageBase("new:base:")).toThrow(
        "setQueryParamStorageBase must be called before first read/write"
      );
    });
  });

  describe("persistQueryParams", () => {
    it("reads URL search params and writes matching ones to storage", async () => {
      vi.resetModules();
      const { persistQueryParams } = await import("../queryParamPersist");

      vi.stubGlobal("window", {
        location: { search: "?ref=abc123&track=email" },
      });

      await persistQueryParams([
        { param: "ref" },
        { param: "track" },
      ]);

      expect(mockStorage.setItem).toHaveBeenCalledWith("ref", "abc123");
      expect(mockStorage.setItem).toHaveBeenCalledWith("track", "email");
    });

    it("skips if window is undefined (SSR)", async () => {
      vi.resetModules();
      const { persistQueryParams } = await import("../queryParamPersist");

      vi.stubGlobal("window", undefined);

      await persistQueryParams([{ param: "ref" }]);

      expect(mockStorage.setItem).not.toHaveBeenCalled();
    });

    it("skips if URL has no search params", async () => {
      vi.resetModules();
      const { persistQueryParams } = await import("../queryParamPersist");

      vi.stubGlobal("window", {
        location: { search: "" },
      });

      await persistQueryParams([{ param: "ref" }]);

      expect(mockStorage.setItem).not.toHaveBeenCalled();
    });

    it("supports as field for aliasing param names", async () => {
      vi.resetModules();
      const { persistQueryParams } = await import("../queryParamPersist");

      vi.stubGlobal("window", {
        location: { search: "?ref=abc123" },
      });

      await persistQueryParams([{ param: "ref", as: "referralCode" }]);

      expect(mockStorage.setItem).toHaveBeenCalledWith("referralCode", "abc123");
      expect(mockStorage.setItem).not.toHaveBeenCalledWith("ref", expect.anything());
    });

    it("only persists params that exist in the URL", async () => {
      vi.resetModules();
      const { persistQueryParams } = await import("../queryParamPersist");

      vi.stubGlobal("window", {
        location: { search: "?ref=abc123" },
      });

      await persistQueryParams([
        { param: "ref" },
        { param: "missing" },
      ]);

      expect(mockStorage.setItem).toHaveBeenCalledTimes(1);
      expect(mockStorage.setItem).toHaveBeenCalledWith("ref", "abc123");
    });

    it("rejects values that fail validate", async () => {
      vi.resetModules();
      const { persistQueryParams } = await import("../queryParamPersist");

      vi.stubGlobal("window", {
        location: { search: "?intent=malicious" },
      });

      await persistQueryParams([{
        param: "intent",
        validate: (v) => v === "pinning" || v === "hosting",
      }]);

      expect(mockStorage.setItem).not.toHaveBeenCalled();
    });

    it("accepts values that pass validate", async () => {
      vi.resetModules();
      const { persistQueryParams } = await import("../queryParamPersist");

      vi.stubGlobal("window", {
        location: { search: "?intent=hosting" },
      });

      await persistQueryParams([{
        param: "intent",
        validate: (v) => v === "pinning" || v === "hosting",
      }]);

      expect(mockStorage.setItem).toHaveBeenCalledWith("intent", "hosting");
    });
  });

  describe("readPersistedParam", () => {
    it("returns stored value for a key", async () => {
      vi.resetModules();
      const { readPersistedParam } = await import("../queryParamPersist");

      mockStorage.getItem.mockResolvedValue("stored-value");
      const result = await readPersistedParam("myKey");

      expect(result).toBe("stored-value");
      expect(mockStorage.getItem).toHaveBeenCalledWith("myKey");
    });

    it("returns null if key not found", async () => {
      vi.resetModules();
      const { readPersistedParam } = await import("../queryParamPersist");

      mockStorage.getItem.mockResolvedValue(null);
      const result = await readPersistedParam("missingKey");

      expect(result).toBeNull();
    });

    it("returns null if window is undefined (SSR)", async () => {
      vi.resetModules();
      const { readPersistedParam } = await import("../queryParamPersist");

      vi.stubGlobal("window", undefined);

      const result = await readPersistedParam("myKey");

      expect(result).toBeNull();
      expect(mockStorage.getItem).not.toHaveBeenCalled();
    });

    it("returns null if stored value is not a string", async () => {
      vi.resetModules();
      const { readPersistedParam } = await import("../queryParamPersist");

      mockStorage.getItem.mockResolvedValue(123);
      const result = await readPersistedParam("myKey");

      expect(result).toBeNull();
    });
  });

  describe("clearPersistedParams", () => {
    it("removes specified keys from storage", async () => {
      vi.resetModules();
      const { clearPersistedParams } = await import("../queryParamPersist");

      await clearPersistedParams(["key1", "key2"]);

      expect(mockStorage.removeItem).toHaveBeenCalledWith("key1");
      expect(mockStorage.removeItem).toHaveBeenCalledWith("key2");
    });

    it("no-ops if window is undefined (SSR)", async () => {
      vi.resetModules();
      const { clearPersistedParams } = await import("../queryParamPersist");

      vi.stubGlobal("window", undefined);

      await clearPersistedParams(["key1"]);

      expect(mockStorage.removeItem).not.toHaveBeenCalled();
    });
  });
});
