/** The optional store keeps codec records separate from caller-owned key buffers. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";
import { createUnstorageCredentialStore } from "@/unstorage";
import type { UnstorageCredentialStorage } from "@/unstorage";

const { createStorage } = createRequire(import.meta.url)("unstorage") as {
  createStorage(): UnstorageCredentialStorage & {
    getKeys(): Promise<string[]>;
  };
};

const scope = { appId: "a".repeat(64), indexerUrl: "https://one/" };
const second = { ...scope, indexerUrl: "https://two/" };
const third = { ...scope, appId: "b".repeat(64) };
const codec = {
  decrypt(record: string): Uint8Array {
    if (!/^(?:[a-f0-9]{2})*$/.test(record)) throw new Error("Invalid record");
    return Uint8Array.from(
      { length: record.length / 2 },
      (_, index) =>
        Number.parseInt(record.slice(index * 2, index * 2 + 2), 16) ^ 0xa5,
    );
  },
  encrypt(bytes: Uint8Array): string {
    return Array.from(bytes, (byte) =>
      (byte ^ 0xa5).toString(16).padStart(2, "0"),
    ).join("");
  },
};

void test("unstorage requires a codec before accessing storage", () => {
  const storage = createStorage();
  assert.throws(
    () => createUnstorageCredentialStore(storage, undefined as never),
    TypeError,
  );
});

void test("unstorage stores codec output by scope and returns owned reads", async () => {
  const storage = createStorage();
  const first = createUnstorageCredentialStore(storage, codec);
  const other = createUnstorageCredentialStore(storage, codec);
  const bytes = new Uint8Array([1, 2, 3]);
  assert.equal(await first.read(scope), null);
  await first.write(scope, bytes);
  bytes.fill(0);
  await first.write(second, new Uint8Array([4]));
  await first.write(third, new Uint8Array([5]));
  const keys = await storage.getKeys();
  assert.equal(keys.length, 3);
  const record = await storage.getItem(keys[0]!);
  assert.equal(typeof record, "string");
  assert.notEqual(record, "010203");
  const read = await other.read(scope);
  assert.deepEqual(read, new Uint8Array([1, 2, 3]));
  read?.fill(0);
  assert.deepEqual(await other.read(scope), new Uint8Array([1, 2, 3]));
  await other.remove(scope);
  assert.equal(await first.read(scope), null);
  assert.deepEqual(await first.read(second), new Uint8Array([4]));
  assert.deepEqual(await first.read(third), new Uint8Array([5]));
});

void test("unstorage reads codec strings that resemble JSON values", async () => {
  for (const record of ["1234", "null", "true", '{"cipher":"value"}']) {
    const storage = createStorage();
    const store = createUnstorageCredentialStore(storage, {
      decrypt(saved) {
        assert.equal(saved, record);
        return new Uint8Array([9]);
      },
      encrypt() {
        return record;
      },
    });
    await store.write(scope, new Uint8Array([9]));
    const [key] = await storage.getKeys();
    assert.equal(await storage.getItem(key!), `sia-access:v1:${record}`);
    assert.deepEqual(await store.read(scope), new Uint8Array([9]));
  }
});

void test("unstorage copies writes before an asynchronous codec can retain them", async () => {
  const storage = createStorage();
  let resume!: () => void;
  const pending = new Promise<void>((resolve) => {
    resume = resolve;
  });
  const store = createUnstorageCredentialStore(storage, {
    decrypt: codec.decrypt,
    async encrypt(bytes) {
      await pending;
      return codec.encrypt(bytes);
    },
  });
  const bytes = new Uint8Array([7]);
  const writing = store.write(scope, bytes);
  bytes.fill(0);
  resume();
  await writing;
  assert.deepEqual(await store.read(scope), new Uint8Array([7]));
});

void test("unstorage clears its write copy after a storage failure", async () => {
  const storage = createStorage();
  let received: Uint8Array | undefined;
  const store = createUnstorageCredentialStore(
    {
      getItem: (key) => storage.getItem(key),
      removeItem: (key) => storage.removeItem(key),
      setItem: async () => {
        throw new Error("Storage failed");
      },
    },
    {
      decrypt: codec.decrypt,
      encrypt(bytes) {
        received = bytes;
        return codec.encrypt(bytes);
      },
    },
  );
  const original = new Uint8Array([8]);
  await assert.rejects(store.write(scope, original), /Storage failed/);
  assert.deepEqual(original, new Uint8Array([8]));
  assert.deepEqual(received, new Uint8Array([0]));
});

void test("unstorage rejects unreadable records without returning a key", async () => {
  const storage = createStorage();
  const store = createUnstorageCredentialStore(storage, codec);
  await store.write(scope, new Uint8Array([1]));
  const [key] = await storage.getKeys();
  await (
    storage as unknown as {
      setItem(key: string, value: unknown): Promise<void>;
    }
  ).setItem(key!, { exposed: true });
  await assert.rejects(store.read(scope), TypeError);
  await storage.setItem(key!, "sia-access:v1:bad record");
  await assert.rejects(store.read(scope), /Invalid record/);
});
