/** Optional unstorage adapter keeps encrypted credentials in application-owned storage. */
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils.js";
import type { CredentialScope, CredentialStore } from "./credentials.ts";

// Unstorage parses JSON-looking strings on getItem; the prefix keeps ciphertext a string.
const recordPrefix = "sia-access:v1:";

export interface CredentialCodec {
  decrypt(record: string): Promise<Uint8Array> | Uint8Array;
  encrypt(appKey: Uint8Array): Promise<string> | string;
}

export interface UnstorageCredentialStorage {
  getItem(key: string): Promise<unknown>;
  removeItem(key: string): Promise<void>;
  setItem(key: string, value: string): Promise<void>;
}

export function createUnstorageCredentialStore(
  storage: UnstorageCredentialStorage,
  codec: CredentialCodec,
): CredentialStore {
  if (
    !codec ||
    typeof codec.encrypt !== "function" ||
    typeof codec.decrypt !== "function"
  )
    throw new TypeError("A credential encryption codec is required");

  const key = (scope: CredentialScope): string => {
    const identity = new TextEncoder().encode(
      JSON.stringify([scope.appId, scope.indexerUrl]),
    );
    return `sia-access:credential:${bytesToHex(sha256(identity))}`;
  };

  return {
    async read(scope) {
      const record = await storage.getItem(key(scope));
      if (record === null) return null;
      if (typeof record !== "string" || !record.startsWith(recordPrefix))
        throw new TypeError("Invalid encrypted credential record");
      const bytes = await codec.decrypt(record.slice(recordPrefix.length));
      try {
        return new Uint8Array(bytes);
      } finally {
        bytes.fill(0);
      }
    },
    async remove(scope) {
      await storage.removeItem(key(scope));
    },
    async write(scope, appKey) {
      // The controller may clear appKey while the codec waits for its own key material.
      const bytes = new Uint8Array(appKey);
      try {
        const record = await codec.encrypt(bytes);
        if (typeof record !== "string" || record.length === 0)
          throw new TypeError("Invalid encrypted credential record");
        await storage.setItem(key(scope), recordPrefix + record);
      } finally {
        bytes.fill(0);
      }
    },
  };
}
