import {
  createUnstorageBlockstore,
  createUnstorageDatastore,
  setDriverFactory,
  type UnstorageBlockstoreOptions,
} from "./unstorage-base";
import {
  DEFAULT_BLOCKSTORE_BASE,
  DEFAULT_BLOCKSTORE_FS_BASE,
} from "@/types/constants";

function isBrowser(): boolean {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

async function getDefaultDriver(base?: string) {
  if (isBrowser()) {
    return (await import("unstorage/drivers/indexedb")).default({
      base: base ?? DEFAULT_BLOCKSTORE_BASE,
    });
  } else {
    return (await import("unstorage/drivers/fs-lite")).default({
      base: base ?? DEFAULT_BLOCKSTORE_FS_BASE,
    });
  }
}

export function createBlockstore(options?: UnstorageBlockstoreOptions) {
  const BlockstoreClass = createUnstorageBlockstore(getDefaultDriver);
  return class extends BlockstoreClass {
    constructor(instanceOptions?: UnstorageBlockstoreOptions) {
      super({ ...options, ...instanceOptions });
    }
  };
}

export function createDatastore(options?: UnstorageBlockstoreOptions) {
  const DatastoreClass = createUnstorageDatastore(getDefaultDriver);
  return class extends DatastoreClass {
    constructor(instanceOptions?: UnstorageBlockstoreOptions) {
      super({ ...options, ...instanceOptions });
    }
  };
}

export { setDriverFactory };
export type { UnstorageBlockstoreOptions } from "./unstorage-base";
