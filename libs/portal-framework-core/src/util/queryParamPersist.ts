import { createStorage, type Storage } from "unstorage";
import localStorageDriver from "unstorage/drivers/localstorage";

export interface QueryParamPersistConfig {
  param: string;
  as?: string;
  validate?: (value: string) => boolean;
}

let _storage: Storage | null = null;
let _base = "portal:qp:";

export function setQueryParamStorageBase(base: string): void {
  if (_storage) {
    throw new Error("setQueryParamStorageBase must be called before first read/write");
  }
  _base = base;
}

async function getStorage(): Promise<Storage> {
  if (!_storage) {
    _storage = createStorage({
      driver: localStorageDriver({ base: _base }),
    });
  }
  return _storage;
}

export async function persistQueryParams(
  params: QueryParamPersistConfig[],
): Promise<void> {
  if (typeof window === "undefined") return;
  if (params.length === 0) return;

  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.toString() === "") return;

  const storage = await getStorage();

  for (const config of params) {
    const value = urlParams.get(config.param);
    if (value !== null && (!config.validate || config.validate(value))) {
      await storage.setItem(config.as ?? config.param, value);
    }
  }
}

export async function readPersistedParam(key: string): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const storage = await getStorage();
  const value = await storage.getItem(key);
  return typeof value === "string" ? value : null;
}

export async function clearPersistedParams(
  keys: string[],
): Promise<void> {
  if (typeof window === "undefined") return;

  const storage = await getStorage();
  await Promise.all(keys.map((key) => storage.removeItem(key)));
}
