import { BaseBlockstore } from "blockstore-core";
import type { InputPair, Pair as BlockstorePair } from "interface-blockstore";
import type {
  AbortOptions,
  Await,
  AwaitGenerator,
  AwaitIterable,
} from "interface-store";
import { CID } from "multiformats/cid";
import { createStorage, type Driver, type Storage } from "unstorage";
import { DEFAULT_BLOCKSTORE_PREFIX } from "@/types/constants";
import type { Batch, Datastore, KeyQuery, Query } from "interface-datastore";
import { Key, Pair } from "interface-datastore";
import { collectAsyncIterable } from "@/utils/stream";



export interface UnstorageBlockstoreOptions {
  storage?: Storage;
  prefix?: string;
  driver?: Driver;
  base?: string;
  datastorePrefix?: string;
}

/**
 * prefix: Key prefix for blockstore keys (e.g., "blockstore" or "pinner-helia-blocks").
 *         This is prepended to CID strings in storage keys.
 *
 * base: Base path for the storage driver (e.g., "pinner:" for IndexedDB, "./.pinner-blocks" for filesystem).
 *       This determines where the storage driver stores data.
 */

type DriverFactory = () => Driver | Promise<Driver>;

export let driverFactory: DriverFactory | null = null;

export function setDriverFactory(factory: DriverFactory | null): void {
  driverFactory = factory;
}

function createStorageWithOptions(
  options: UnstorageBlockstoreOptions,
): Storage {
  return options.storage
    ? options.storage
    : createStorage({ driver: options.driver });
}

async function initializeStorage(
  storage: Storage,
  options: UnstorageBlockstoreOptions,
  getDefaultDriver: (base?: string) => Driver | Promise<Driver>,
): Promise<void> {
  if (options.storage || options.driver) {
    return;
  }

  const driver = await getDefaultDriver(options.base);
  Object.assign(storage, createStorage({ driver }));
}

function createUnstorageBase(
  options: UnstorageBlockstoreOptions,
  getDefaultDriver: (base?: string) => Driver | Promise<Driver>,
) {
  const storage = createStorageWithOptions(options);
  const initialized = initializeStorage(storage, options, getDefaultDriver);

  async function ensureInitialized(): Promise<void> {
    await initialized;
  }

  async function hasItem(key: string): Promise<boolean> {
    await ensureInitialized();
    return await storage.hasItem(key);
  }

  async function getItem(key: string): Promise<Uint8Array> {
    await ensureInitialized();
    const value = await storage.getItemRaw<Uint8Array>(key);

    if (value === null) {
      throw new Error(`Item not found: ${key}`);
    }

    return value;
  }

  async function putItem(key: string, value: Uint8Array): Promise<void> {
    await ensureInitialized();
    await storage.setItemRaw(key, value);
  }

  async function deleteItem(key: string): Promise<void> {
    await ensureInitialized();
    await storage.removeItem(key);
  }

  async function getAllKeys(): Promise<string[]> {
    await ensureInitialized();
    return await storage.getKeys();
  }

  return {
    storage,
    hasItem,
    getItem,
    putItem,
    deleteItem,
    getAllKeys,
  };
}

export function createUnstorageBlockstore(
  getDefaultDriver: (base?: string) => Driver | Promise<Driver>,
): new (
  options?: UnstorageBlockstoreOptions,
) => InstanceType<typeof BaseBlockstore> {
  return class UnstorageBlockstore extends BaseBlockstore {
    private prefix: string;
    private base: ReturnType<typeof createUnstorageBase>;

    constructor(options: UnstorageBlockstoreOptions = {}) {
      super();
      this.prefix = options.prefix ?? DEFAULT_BLOCKSTORE_PREFIX;
      this.base = createUnstorageBase(options, getDefaultDriver);
    }

    private keyToStorageKey(key: CID): string {
      return `${this.prefix}:${key.toString()}`;
    }

    async has(key: CID, _?: AbortOptions): Promise<boolean> {
      return await this.base.hasItem(this.keyToStorageKey(key));
    }

    async put(
      key: CID,
      val: Uint8Array | AwaitIterable<Uint8Array>,
      _?: AbortOptions,
    ): Promise<CID> {
      const storageKey = this.keyToStorageKey(key);
      const bytes =
        val instanceof Uint8Array ? val : await collectAsyncIterable(val);
      await this.base.putItem(storageKey, bytes);
      return key;
    }

    async *putMany(
      source: AwaitIterable<InputPair>,
      options?: AbortOptions,
    ): AwaitGenerator<CID> {
      for await (const { cid, bytes } of source) {
        yield await this.put(cid, bytes, options);
      }
    }

    async *get(key: CID, _?: AbortOptions): AsyncGenerator<Uint8Array> {
      const storageKey = this.keyToStorageKey(key);
      const value = await this.base.getItem(storageKey);
      yield value;
    }

    async *getMany(
      source: AwaitIterable<CID>,
      options?: AbortOptions,
    ): AwaitGenerator<BlockstorePair> {
      for await (const cid of source) {
        yield {
          cid,
          bytes: (async function* () {
            yield* await this.get(cid, options);
          }.call(this)),
        };
      }
    }

    async delete(key: CID, _?: AbortOptions): Promise<void> {
      await this.base.deleteItem(this.keyToStorageKey(key));
    }

    async *deleteMany(
      source: AwaitIterable<CID>,
      options?: AbortOptions,
    ): AwaitGenerator<CID> {
      for await (const cid of source) {
        await this.delete(cid, options);
        yield cid;
      }
    }

    async *getAll(_?: AbortOptions): AwaitGenerator<BlockstorePair> {
      const keys = await this.base.getAllKeys();

      for (const key of keys) {
        if (key.startsWith(this.prefix + ":")) {
          const cidString = key.slice(this.prefix.length + 1);
          try {
            const cid = CID.parse(cidString);
            const value = await this.base.getItem(key);

            yield {
              cid,
              bytes: (async function* () {
                yield value;
              })(),
            };
          } catch {
            // Skip invalid keys
          }
        }
      }
    }
  };
}

export function createUnstorageDatastore(
  getDefaultDriver: (base?: string) => Driver | Promise<Driver>,
): new (options?: UnstorageBlockstoreOptions) => Datastore {
  return class UnstorageDatastore implements Datastore {
    private prefix: string;
    private base: ReturnType<typeof createUnstorageBase>;

    constructor(options: UnstorageBlockstoreOptions = {}) {
      this.prefix =
        options.datastorePrefix ?? options.prefix ?? DEFAULT_BLOCKSTORE_PREFIX;
      this.base = createUnstorageBase(options, getDefaultDriver);
    }

    private keyToStorageKey(key: Key): string {
      return `${this.prefix}:${key.toString()}`;
    }

    private storageKeyToKey(storageKey: string): Key {
      return new Key(storageKey.slice(this.prefix.length + 1));
    }

    async has(key: Key, _?: AbortOptions): Promise<boolean> {
      return await this.base.hasItem(this.keyToStorageKey(key));
    }

    async put(key: Key, val: Uint8Array, _?: AbortOptions): Promise<Key> {
      await this.base.putItem(this.keyToStorageKey(key), val);
      return key;
    }

    async *putMany(
      source: AwaitIterable<Pair>,
      options?: AbortOptions,
    ): AsyncGenerator<Key> {
      for await (const { key, value } of source) {
        yield await this.put(key, value, options);
      }
    }

    async get(key: Key, _?: AbortOptions): Promise<Uint8Array> {
      const storageKey = this.keyToStorageKey(key);
      try {
        return await this.base.getItem(storageKey);
      } catch (error) {
        throw new Error(`Datastore item not found: ${key.toString()}`);
      }
    }

    async *getMany(
      source: AwaitIterable<Key>,
      options?: AbortOptions,
    ): AsyncGenerator<Pair> {
      for await (const key of source) {
        yield {
          key,
          value: await this.get(key, options),
        };
      }
    }

    async delete(key: Key, _?: AbortOptions): Promise<void> {
      await this.base.deleteItem(this.keyToStorageKey(key));
    }

    async *deleteMany(
      source: AwaitIterable<Key>,
      options?: AbortOptions,
    ): AsyncGenerator<Key> {
      for await (const key of source) {
        await this.delete(key, options);
        yield key;
      }
    }

    batch(): Batch {
      const operations: Array<{
        type: "put" | "delete";
        key: Key;
        value?: Uint8Array;
      }> = [];
      const base = this.base;
      const keyToStorageKey = this.keyToStorageKey.bind(this);

      return {
        put(key: Key, value: Uint8Array): void {
          operations.push({ type: "put", key, value });
        },
        delete(key: Key): void {
          operations.push({ type: "delete", key });
        },
        async commit(): Promise<void> {
          for (const op of operations) {
            if (op.type === "put" && op.value !== undefined) {
              await base.putItem(keyToStorageKey(op.key), op.value);
            } else if (op.type === "delete") {
              await base.deleteItem(keyToStorageKey(op.key));
            }
          }
          operations.length = 0;
        },
      };
    }

    async *query(query: Query, _?: AbortOptions): AsyncGenerator<Pair> {
      const keys = await this.base.getAllKeys();

      for (const key of keys) {
        if (!key.startsWith(this.prefix + ":")) {
          continue;
        }

        const datastoreKey = this.storageKeyToKey(key);

        if (
          query.prefix &&
          !datastoreKey.toString().startsWith(query.prefix.toString())
        ) {
          continue;
        }

        const value = await this.base.getItem(key);

        if (query.filters) {
          let match = true;
          for (const filter of query.filters) {
            if (!filter({ key: datastoreKey, value })) {
              match = false;
              break;
            }
          }
          if (!match) continue;
        }

        yield {
          key: datastoreKey,
          value,
        };
      }
    }

    async *queryKeys(query: KeyQuery, _?: AbortOptions): AsyncGenerator<Key> {
      const keys = await this.base.getAllKeys();

      for (const key of keys) {
        if (!key.startsWith(this.prefix + ":")) {
          continue;
        }

        const datastoreKey = this.storageKeyToKey(key);

        if (
          query.prefix &&
          !datastoreKey.toString().startsWith(query.prefix.toString())
        ) {
          continue;
        }

        yield datastoreKey;
      }
    }
  };
}
