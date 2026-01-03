import {
  createUnstorageBlockstore,
  createUnstorageDatastore,
  setDriverFactory,
  type UnstorageBlockstoreOptions,
} from "./unstorage-base";
import indexedDbDriver from "unstorage/drivers/indexedb";
import { DEFAULT_BLOCKSTORE_BASE } from "@/types/constants";

export function createBlockstore(options?: UnstorageBlockstoreOptions) {
  const BlockstoreClass = createUnstorageBlockstore((base) =>
    indexedDbDriver({ base: base ?? DEFAULT_BLOCKSTORE_BASE }),
  );
  return class extends BlockstoreClass {
    constructor(instanceOptions?: UnstorageBlockstoreOptions) {
      super({ ...options, ...instanceOptions });
    }
  };
}

export function createDatastore(options?: UnstorageBlockstoreOptions) {
  const DatastoreClass = createUnstorageDatastore((base) =>
    indexedDbDriver({ base: base ?? DEFAULT_BLOCKSTORE_BASE }),
  );
  return class extends DatastoreClass {
    constructor(instanceOptions?: UnstorageBlockstoreOptions) {
      super({ ...options, ...instanceOptions });
    }
  };
}

export { setDriverFactory };
export type { UnstorageBlockstoreOptions } from "./unstorage-base";
