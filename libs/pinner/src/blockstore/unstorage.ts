import {
  createUnstorageBlockstore,
  createUnstorageDatastore,
  driverFactory,
  setDriverFactory,
  type UnstorageBlockstoreOptions,
} from "./unstorage-base";
import {
  DEFAULT_BLOCKSTORE_BASE,
  DEFAULT_BLOCKSTORE_FS_BASE,
} from "@/types/constants";
import type { AbortOptions, AwaitGenerator } from "interface-store";

function isBrowser(): boolean {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  );
}

async function getDefaultDriver(base?: string) {
  // Use driverFactory override if set (typically by tests to inject in-memory driver)
  if (driverFactory) {
    return await driverFactory();
  }

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

export function createBlockstore(
  options?: UnstorageBlockstoreOptions,
): new (options?: UnstorageBlockstoreOptions) => InstanceType<
  ReturnType<typeof createUnstorageBlockstore>
> {
  const BlockstoreClass = createUnstorageBlockstore(getDefaultDriver);
  return class extends BlockstoreClass {
    constructor(instanceOptions?: UnstorageBlockstoreOptions) {
      super({ ...options, ...instanceOptions });
    }
  };
}

export function createDatastore(
  options?: UnstorageBlockstoreOptions,
): new (options?: UnstorageBlockstoreOptions) => InstanceType<
  ReturnType<typeof createUnstorageDatastore>
> {
  const DatastoreClass = createUnstorageDatastore(getDefaultDriver);
  return class extends DatastoreClass {
    constructor(instanceOptions?: UnstorageBlockstoreOptions) {
      super({ ...options, ...instanceOptions });
    }
  };
}

export { setDriverFactory };
export type { UnstorageBlockstoreOptions } from "./unstorage-base";
