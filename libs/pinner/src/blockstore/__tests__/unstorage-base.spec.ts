import { beforeEach, describe, expect, it, vi } from "vitest";
import { createUnstorageBlockstore, setDriverFactory } from "../unstorage-base";
import { runCommonBlockstoreTests } from "./shared-blockstore-tests";

describe("createUnstorageBlockstore", () => {
  const mockDriver = vi.fn() as any;
  const mockStorage = {
    hasItem: vi.fn(),
    setItem: vi.fn(),
    getItem: vi.fn(),
    removeItem: vi.fn(),
    getKeys: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setDriverFactory(null);
  });

  describe("factory function", () => {
    it("should create a blockstore class", () => {
      const BlockstoreClass = createUnstorageBlockstore(() => mockDriver);
      expect(typeof BlockstoreClass).toBe("function");
    });

    it("should create a blockstore instance with custom storage", async () => {
      const BlockstoreClass = createUnstorageBlockstore(() => mockDriver);
      const blockstore = new BlockstoreClass({ storage: mockStorage as any });

      expect(blockstore).toBeDefined();
    });

    it("should create a blockstore instance with custom driver", async () => {
      const BlockstoreClass = createUnstorageBlockstore(() => mockDriver);
      const blockstore = new BlockstoreClass({ driver: mockDriver as any });

      expect(blockstore).toBeDefined();
    });

    it("should use custom prefix", async () => {
      const BlockstoreClass = createUnstorageBlockstore(() => mockDriver);
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

      const BlockstoreClass = createUnstorageBlockstore(() => mockDriver);
      const blockstore = new BlockstoreClass({ storage: mockStorage as any });

      expect(blockstore).toBeDefined();
    });
  });

  runCommonBlockstoreTests("createUnstorageBlockstore", (options) => {
    const BlockstoreClass = createUnstorageBlockstore(() => mockDriver);
    return new BlockstoreClass(options);
  });
});
