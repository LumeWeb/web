import {
  createUnstorageBlockstore,
  createUnstorageDatastore,
  setDriverFactory,
  type UnstorageBlockstoreOptions,
} from "./unstorage-base";
import fsLiteDriver from "unstorage/drivers/fs-lite";
import {
  DEFAULT_BLOCKSTORE_FS_BASE,
  DEFAULT_DATASTORE_FS_BASE,
} from "@/types/constants";

export function createBlockstore(options?: UnstorageBlockstoreOptions) {
  const BlockstoreClass = createUnstorageBlockstore(() =>
    fsLiteDriver({ base: options?.base ?? DEFAULT_BLOCKSTORE_FS_BASE }),
  );
  return class extends BlockstoreClass {
    constructor(instanceOptions?: UnstorageBlockstoreOptions) {
      super({ ...options, ...instanceOptions });
    }
  };
}

export function createDatastore(options?: UnstorageBlockstoreOptions) {
  const DatastoreClass = createUnstorageDatastore(() =>
    fsLiteDriver({ base: options?.base ?? DEFAULT_DATASTORE_FS_BASE }),
  );
  return class extends DatastoreClass {
    constructor(instanceOptions?: UnstorageBlockstoreOptions) {
      super({ ...options, ...instanceOptions });
    }
  };
}

export { setDriverFactory };
export type { UnstorageBlockstoreOptions } from "./unstorage-base";
