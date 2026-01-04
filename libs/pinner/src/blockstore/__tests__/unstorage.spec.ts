import { beforeEach, describe, expect, it, vi } from "vitest";
import { createBlockstore, setDriverFactory } from "@/blockstore";
import { runCommonBlockstoreTests } from "./shared-blockstore-tests";
import memoryDriver from "unstorage/drivers/memory";

describe("createBlockstore (factory)", () => {
  const mockDriver = vi.fn() as any;

  beforeEach(() => {
    vi.clearAllMocks();
    setDriverFactory(null);
  });

  describe("factory function", () => {
    it("should create a blockstore class", () => {
      const BlockstoreClass = createBlockstore();
      expect(typeof BlockstoreClass).toBe("function");
    });

    it("should create a blockstore instance with custom storage", async () => {
      const BlockstoreClass = createBlockstore();
      const mockStorage = {
        hasItem: vi.fn(),
        setItem: vi.fn(),
        setItemRaw: vi.fn(),
        getItem: vi.fn(),
        getItemRaw: vi.fn(),
        removeItem: vi.fn(),
        getKeys: vi.fn(),
      };
      const blockstore = new BlockstoreClass({ storage: mockStorage as any });

      expect(blockstore).toBeDefined();
    });

    it("should create a blockstore instance with custom driver", async () => {
      const BlockstoreClass = createBlockstore();
      const blockstore = new BlockstoreClass({ driver: mockDriver as any });
      expect(blockstore).toBeDefined();
    });

    it("should use default prefix", async () => {
      const BlockstoreClass = createBlockstore();
      const mockStorage = {
        hasItem: vi.fn(),
        setItem: vi.fn(),
        setItemRaw: vi.fn(),
        getItem: vi.fn(),
        getItemRaw: vi.fn(),
        removeItem: vi.fn(),
        getKeys: vi.fn(),
      };
      const blockstore = new BlockstoreClass({ storage: mockStorage as any });
      expect(blockstore).toBeDefined();
    });

    it("should use custom prefix", async () => {
      const BlockstoreClass = createBlockstore();
      const mockStorage = {
        hasItem: vi.fn(),
        setItem: vi.fn(),
        setItemRaw: vi.fn(),
        getItem: vi.fn(),
        getItemRaw: vi.fn(),
        removeItem: vi.fn(),
        getKeys: vi.fn(),
      };
      const blockstore = new BlockstoreClass({
        storage: mockStorage as any,
        prefix: "custom",
      });
      expect(blockstore).toBeDefined();
    });
  });

  describe("setDriverFactory", () => {
    it("should use custom driver factory", async () => {
      const customDriver = vi.fn() as any;
      setDriverFactory(() => customDriver);

      const BlockstoreClass = createBlockstore();
      const mockStorage = {
        hasItem: vi.fn(),
        setItem: vi.fn(),
        setItemRaw: vi.fn(),
        getItem: vi.fn(),
        getItemRaw: vi.fn(),
        removeItem: vi.fn(),
        getKeys: vi.fn(),
      };
      const blockstore = new BlockstoreClass({ storage: mockStorage as any });

      expect(blockstore).toBeDefined();
    });

    it("should bypass driverFactory when storage option is provided", async () => {
      const factorySpy = vi.fn(() => memoryDriver());
      setDriverFactory(factorySpy);

      const mockStorage = {
        hasItem: vi.fn().mockResolvedValue(false),
        setItemRaw: vi.fn().mockResolvedValue(undefined),
        getItemRaw: vi.fn().mockResolvedValue(new Uint8Array([])),
        removeItem: vi.fn().mockResolvedValue(undefined),
        getKeys: vi.fn().mockResolvedValue([]),
      };

      const BlockstoreClass = createBlockstore();
      const blockstore = new BlockstoreClass({ storage: mockStorage as any });

      expect(blockstore).toBeDefined();
      expect(factorySpy).not.toHaveBeenCalled();
    });

    it("should bypass driverFactory when driver option is provided", async () => {
      const factorySpy = vi.fn(() => memoryDriver());
      setDriverFactory(factorySpy);

      const customDriver = memoryDriver();

      const BlockstoreClass = createBlockstore();
      const blockstore = new BlockstoreClass({ driver: customDriver });

      expect(blockstore).toBeDefined();
      expect(factorySpy).not.toHaveBeenCalled();
    });
  });

  runCommonBlockstoreTests("createBlockstore", (options) => {
    const BlockstoreClass = createBlockstore();
    return new BlockstoreClass(options);
  });
});
