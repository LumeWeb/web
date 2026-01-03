import { beforeEach, describe, expect, it, vi } from "vitest";
import { CID } from "multiformats/cid";
import {
  createMultipleTestData,
  createTestData,
  TEST_DATA,
} from "./test-helpers";
import { DEFAULT_BLOCKSTORE_PREFIX } from "@/types/constants";

export interface BlockstoreTestClass {
  new (options?: any): any;
}

type MockStorageMethods = {
  hasItem?: ReturnType<typeof vi.fn>;
  setItemRaw?: ReturnType<typeof vi.fn>;
  getItemRaw?: ReturnType<typeof vi.fn>;
  removeItem?: ReturnType<typeof vi.fn>;
  getKeys?: ReturnType<typeof vi.fn>;
};

function createMockStorage(methods: MockStorageMethods = {}) {
  return {
    hasItem: methods.hasItem ?? vi.fn(),
    setItemRaw: methods.setItemRaw ?? vi.fn(),
    getItemRaw: methods.getItemRaw ?? vi.fn(),
    removeItem: methods.removeItem ?? vi.fn(),
    getKeys: methods.getKeys ?? vi.fn(),
  };
}

export function runCommonBlockstoreTests(
  className: string,
  createBlockstore: (options?: any) => any,
) {
  describe(`${className} - common blockstore operations`, () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    describe("has", () => {
      it("should check if a key exists", async () => {
        const mockStorage = createMockStorage({
          hasItem: vi.fn().mockResolvedValue(true),
        });
        const blockstore = createBlockstore({ storage: mockStorage as any });

        const { cid } = await createTestData(TEST_DATA.simple);

        const result = await blockstore.has(cid);

        expect(result).toBe(true);
        expect(mockStorage.hasItem).toHaveBeenCalledWith(
          `${DEFAULT_BLOCKSTORE_PREFIX}:${cid.toString()}`,
        );
      });

      it("should return false when key does not exist", async () => {
        const mockStorage = createMockStorage({
          hasItem: vi.fn().mockResolvedValue(false),
        });
        const blockstore = createBlockstore({ storage: mockStorage as any });

        const { cid } = await createTestData(TEST_DATA.simple);

        const result = await blockstore.has(cid);

        expect(result).toBe(false);
      });
    });

    describe("put", () => {
      it("should store a block using setItemRaw", async () => {
        const mockStorage = createMockStorage({
          setItemRaw: vi.fn().mockResolvedValue(undefined),
        });
        const { cid, block } = await createTestData(TEST_DATA.binary);

        const blockstore = createBlockstore({ storage: mockStorage as any });

        const result = await blockstore.put(cid, block);

        expect(result).toEqual(cid);
        expect(mockStorage.setItemRaw).toHaveBeenCalledWith(
          `${DEFAULT_BLOCKSTORE_PREFIX}:${cid.toString()}`,
          block,
        );
      });
    });

    describe("get", () => {
      it("should retrieve a block using getItemRaw", async () => {
        const { cid, block } = await createTestData(TEST_DATA.json);
        const mockStorage = createMockStorage({
          getItemRaw: vi.fn().mockResolvedValue(block),
        });

        const blockstore = createBlockstore({ storage: mockStorage as any });

        const result: Uint8Array[] = [];
        for await (const chunk of blockstore.get(cid)) {
          result.push(chunk);
        }

        expect(result[0]).toEqual(block);
        expect(mockStorage.getItemRaw).toHaveBeenCalledWith(
          `${DEFAULT_BLOCKSTORE_PREFIX}:${cid.toString()}`,
        );
      });

      it("should throw error when block not found", async () => {
        const { cid } = await createTestData(TEST_DATA.simple);
        const mockStorage = createMockStorage({
          getItemRaw: vi.fn().mockRejectedValue(new Error("Item not found")),
        });

        const blockstore = createBlockstore({ storage: mockStorage as any });

        const generator = blockstore.get(cid);

        // Error should be thrown when iterating the generator
        await expect(async () => {
          for await (const _ of generator) {
            // Should not reach here
          }
        }).rejects.toThrow();
      });
    });

    describe("delete", () => {
      it("should delete a block", async () => {
        const mockStorage = createMockStorage({
          removeItem: vi.fn().mockResolvedValue(undefined),
        });
        const blockstore = createBlockstore({ storage: mockStorage as any });

        const { cid } = await createTestData(TEST_DATA.simple);

        await blockstore.delete(cid);

        expect(mockStorage.removeItem).toHaveBeenCalledWith(
          `${DEFAULT_BLOCKSTORE_PREFIX}:${cid.toString()}`,
        );
      });
    });

    describe("getAll", () => {
      it("should retrieve all blocks", async () => {
        const testData = await createMultipleTestData([
          TEST_DATA.simple,
          TEST_DATA.json,
        ]);
        const [data1, data2] = testData;
        const mockStorage = createMockStorage({
          getKeys: vi
            .fn()
            .mockResolvedValue([
              `${DEFAULT_BLOCKSTORE_PREFIX}:${data1.cid.toString()}`,
              `${DEFAULT_BLOCKSTORE_PREFIX}:${data2.cid.toString()}`,
            ]),
          getItemRaw: vi
            .fn()
            .mockResolvedValueOnce(data1.block)
            .mockResolvedValueOnce(data2.block),
        });
        const blockstore = createBlockstore({ storage: mockStorage as any });

        // Consume all pairs and their bytes
        const consumedResults: Array<{ cid: CID; bytes: Uint8Array }> = [];
        for await (const pair of blockstore.getAll()) {
          const chunks: Uint8Array[] = [];
          for await (const chunk of pair.bytes) {
            chunks.push(chunk);
          }
          consumedResults.push({ cid: pair.cid, bytes: chunks[0] });
        }

        expect(consumedResults).toHaveLength(2);
        expect(consumedResults[0].cid).toEqual(data1.cid);
        expect(consumedResults[0].bytes).toEqual(data1.block);
        expect(consumedResults[1].cid).toEqual(data2.cid);
        expect(consumedResults[1].bytes).toEqual(data2.block);
      });

      it("should skip invalid keys", async () => {
        const { cid, block } = await createTestData(TEST_DATA.simple);
        const mockStorage = createMockStorage({
          getKeys: vi
            .fn()
            .mockResolvedValue([
              `${DEFAULT_BLOCKSTORE_PREFIX}:${cid.toString()}`,
              `${DEFAULT_BLOCKSTORE_PREFIX}:invalid-cid`,
            ]),
          getItemRaw: vi.fn().mockResolvedValue(block),
        });
        const blockstore = createBlockstore({ storage: mockStorage as any });

        const consumedResults: Array<{ cid: CID; bytes: Uint8Array }> = [];
        for await (const pair of blockstore.getAll()) {
          const chunks: Uint8Array[] = [];
          for await (const chunk of pair.bytes) {
            chunks.push(chunk);
          }
          consumedResults.push({ cid: pair.cid, bytes: chunks[0] });
        }

        expect(consumedResults).toHaveLength(1);
        expect(consumedResults[0].cid).toEqual(cid);
      });
    });

    describe("putMany", () => {
      it("should store multiple blocks", async () => {
        const mockStorage = createMockStorage({
          setItemRaw: vi.fn().mockResolvedValue(undefined),
        });
        const testData = await createMultipleTestData([
          TEST_DATA.simple,
          TEST_DATA.json,
        ]);
        const blockstore = createBlockstore({ storage: mockStorage as any });

        // Transform testData to InputPair format (cid, bytes)
        const inputPairs = testData.map(({ cid, block }) => ({
          cid,
          bytes: block,
        }));

        const results: CID[] = [];
        for await (const result of blockstore.putMany(inputPairs)) {
          results.push(result);
        }

        expect(results).toHaveLength(2);
        expect(results[0]).toEqual(testData[0].cid);
        expect(results[1]).toEqual(testData[1].cid);
      });
    });

    describe("getMany", () => {
      it("should retrieve multiple blocks", async () => {
        const testData = await createMultipleTestData([
          TEST_DATA.simple,
          TEST_DATA.json,
        ]);
        const mockStorage = createMockStorage({
          getItemRaw: vi
            .fn()
            .mockResolvedValueOnce(testData[0].block)
            .mockResolvedValueOnce(testData[1].block),
        });
        const blockstore = createBlockstore({ storage: mockStorage as any });

        const consumedResults: Array<{ cid: CID; bytes: Uint8Array }> = [];
        for await (const pair of blockstore.getMany([
          testData[0].cid,
          testData[1].cid,
        ])) {
          const chunks: Uint8Array[] = [];
          for await (const chunk of pair.bytes) {
            chunks.push(chunk);
          }
          consumedResults.push({ cid: pair.cid, bytes: chunks[0] });
        }

        expect(consumedResults).toHaveLength(2);
        expect(consumedResults[0].cid).toEqual(testData[0].cid);
        expect(consumedResults[0].bytes).toEqual(testData[0].block);
        expect(consumedResults[1].cid).toEqual(testData[1].cid);
        expect(consumedResults[1].bytes).toEqual(testData[1].block);
      });
    });

    describe("deleteMany", () => {
      it("should delete multiple blocks", async () => {
        const mockStorage = createMockStorage({
          removeItem: vi.fn().mockResolvedValue(undefined),
        });
        const testData = await createMultipleTestData([
          TEST_DATA.simple,
          TEST_DATA.json,
        ]);
        const blockstore = createBlockstore({ storage: mockStorage as any });

        const results: CID[] = [];
        for await (const result of blockstore.deleteMany([
          testData[0].cid,
          testData[1].cid,
        ])) {
          results.push(result);
        }

        expect(results).toHaveLength(2);
        expect(results[0]).toEqual(testData[0].cid);
        expect(results[1]).toEqual(testData[1].cid);
      });
    });
  });
}
