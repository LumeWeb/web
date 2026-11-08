/** Scoped credentials keep application and indexer records apart. */
export interface CredentialScope {
  readonly appId: string;
  readonly indexerUrl: string;
}
export interface CredentialStore {
  /** Transfers an owned buffer that the receiver may clear after use. */
  read(scope: CredentialScope): Promise<null | Uint8Array>;
  remove(scope: CredentialScope): Promise<void>;
  /** Any retained bytes must be copied before settlement, including rejection. */
  write(scope: CredentialScope, appKey: Uint8Array): Promise<void>;
}
export interface MemoryCredentialStore extends CredentialStore {
  clear(): Promise<void>;
}
export function createMemoryCredentialStore(): MemoryCredentialStore {
  const records = new Map<string, Uint8Array>();
  const key = (scope: CredentialScope) =>
    JSON.stringify([scope.appId, scope.indexerUrl]);
  return {
    async clear() {
      records.clear();
    },
    async read(scope) {
      return records.get(key(scope))?.slice() ?? null;
    },
    async remove(scope) {
      records.delete(key(scope));
    },
    async write(scope, bytes) {
      records.set(key(scope), bytes.slice());
    },
  };
}
export function normalizeScope(
  appId: string,
  indexerUrl: string,
): CredentialScope {
  if (!/^[a-f0-9]{64}$/i.test(appId))
    throw new TypeError("Invalid application ID");
  const url = new URL(indexerUrl);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    indexerUrl.includes("?") ||
    indexerUrl.includes("#")
  )
    throw new TypeError("Invalid indexer URL");
  return Object.freeze({ appId: appId.toLowerCase(), indexerUrl: url.href });
}
