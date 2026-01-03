import { describe, expect, it } from "vitest";
import { createBlockstore, createDatastore } from "../unstorage";
import { Key } from "interface-datastore";
import { collectAsyncIterable } from "@/utils/stream";
import { createTestData } from "./test-helpers";
import "./setup";

describe("Unstorage Factory", () => {
  let testCounter = 0;

  describe("createBlockstore", () => {
    it("should use instance-specific base path", async () => {
      const base1 = `test-blockstore-1-${testCounter++}`;
      const base2 = `test-blockstore-2-${testCounter++}`;

      const Blockstore1 = createBlockstore({ base: base1 });
      const Blockstore2 = createBlockstore({ base: base2 });

      const blockstore1 = new Blockstore1();
      const blockstore2 = new Blockstore2();

      // Store different data in each blockstore with different CIDs
      const testData1 = await createTestData([1, 2, 3]);
      const testData2 = await createTestData([4, 5, 6]);

      await blockstore1.put(testData1.cid, testData1.block);
      await blockstore2.put(testData2.cid, testData2.block);

      // Verify each blockstore has its own data
      const result1 = await collectAsyncIterable(
        blockstore1.get(testData1.cid),
      );
      const result2 = await collectAsyncIterable(
        blockstore2.get(testData2.cid),
      );

      expect(Array.from(result1)).toEqual(Array.from(testData1.block));
      expect(Array.from(result2)).toEqual(Array.from(testData2.block));

      // Verify they don't share data
      let result1From2: Uint8Array | null = null;
      try {
        result1From2 = await collectAsyncIterable(
          blockstore2.get(testData1.cid),
        );
      } catch {}
      expect(result1From2).toBeNull();
    });

    it("should use instance-specific base path when passed in constructor", async () => {
      const BlockstoreClass = createBlockstore();

      const base1 = `test-blockstore-3-${testCounter++}`;
      const base2 = `test-blockstore-4-${testCounter++}`;

      const blockstore1 = new BlockstoreClass({ base: base1 });
      const blockstore2 = new BlockstoreClass({ base: base2 });

      const testData1 = await createTestData([7, 8, 9]);
      const testData2 = await createTestData([10, 11, 12]);

      await blockstore1.put(testData1.cid, testData1.block);
      await blockstore2.put(testData2.cid, testData2.block);

      const result1 = await collectAsyncIterable(
        blockstore1.get(testData1.cid),
      );
      const result2 = await collectAsyncIterable(
        blockstore2.get(testData2.cid),
      );

      expect(Array.from(result1)).toEqual(Array.from(testData1.block));
      expect(Array.from(result2)).toEqual(Array.from(testData2.block));
    });

    it("should merge factory options with constructor options", async () => {
      const base1 = `test-blockstore-5-${testCounter++}`;
      const base2 = `test-blockstore-6-${testCounter++}`;

      const BlockstoreClass = createBlockstore({ base: base1 });
      const blockstore1 = new BlockstoreClass();
      const blockstore2 = new BlockstoreClass({ base: base2 });

      // blockstore1 should use base1 from factory
      // blockstore2 should use base2 from constructor (overriding factory)

      const testData = await createTestData([13, 14, 15]);

      await blockstore1.put(testData.cid, testData.block);

      const result1 = await collectAsyncIterable(blockstore1.get(testData.cid));
      expect(Array.from(result1)).toEqual(Array.from(testData.block));

      // blockstore2 should not have the data since it uses a different base
      let result2: Uint8Array | null = null;
      try {
        result2 = await collectAsyncIterable(blockstore2.get(testData.cid));
      } catch {}
      expect(result2).toBeNull();
    });
  });

  describe("createDatastore", () => {
    it("should use instance-specific base path", async () => {
      const base1 = `test-datastore-1-${testCounter++}`;
      const base2 = `test-datastore-2-${testCounter++}`;

      const Datastore1 = createDatastore({ base: base1 });
      const Datastore2 = createDatastore({ base: base2 });

      const datastore1 = new Datastore1();
      const datastore2 = new Datastore2();

      const key1 = new Key("key1");
      const key2 = new Key("key2");

      const data1 = new Uint8Array([1, 2, 3]);
      const data2 = new Uint8Array([4, 5, 6]);

      await datastore1.put(key1, data1);
      await datastore2.put(key2, data2);

      const result1 = await datastore1.get(key1);
      const result2 = await datastore2.get(key2);

      expect(Array.from(result1)).toEqual(Array.from(data1));
      expect(Array.from(result2)).toEqual(Array.from(data2));

      // Verify they don't share data
      let result1From2: Uint8Array | null = null;
      try {
        result1From2 = await datastore1.get(key2);
      } catch {}
      expect(result1From2).toBeNull();
    });

    it("should use instance-specific base path when passed in constructor", async () => {
      const DatastoreClass = createDatastore();

      const base1 = `test-datastore-3-${testCounter++}`;
      const base2 = `test-datastore-4-${testCounter++}`;

      const datastore1 = new DatastoreClass({ base: base1 });
      const datastore2 = new DatastoreClass({ base: base2 });

      const key = new Key("key");

      const data1 = new Uint8Array([7, 8, 9]);
      const data2 = new Uint8Array([10, 11, 12]);

      await datastore1.put(key, data1);
      await datastore2.put(key, data2);

      const result1 = await datastore1.get(key);
      const result2 = await datastore2.get(key);

      expect(Array.from(result1)).toEqual(Array.from(data1));
      expect(Array.from(result2)).toEqual(Array.from(data2));
    });

    it("should merge factory options with constructor options", async () => {
      const base1 = `test-datastore-5-${testCounter++}`;
      const base2 = `test-datastore-6-${testCounter++}`;

      const DatastoreClass = createDatastore({ base: base1 });
      const datastore1 = new DatastoreClass();
      const datastore2 = new DatastoreClass({ base: base2 });

      const key = new Key("key");

      const data = new Uint8Array([13, 14, 15]);

      await datastore1.put(key, data);

      const result1 = await datastore1.get(key);
      expect(Array.from(result1)).toEqual(Array.from(data));

      // datastore2 should not have the data since it uses a different base
      let result2: Uint8Array | null = null;
      try {
        result2 = await datastore2.get(key);
      } catch {}
      expect(result2).toBeNull();
    });
  });
});
