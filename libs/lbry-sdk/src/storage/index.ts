/**
 * Storage module — encrypted wallet persistence via IndexedDB.
 *
 * Uses AES-256-GCM (WebCrypto) for mnemonic encryption and IndexedDB
 * for durable storage. Plaintext never touches disk.
 *
 * @module @lumeweb/lbry-sdk/storage
 */

export { WalletStore } from "@/storage/store";
export type {
  StoredWallet,
  WalletStoreOptions,
  EncryptedPayload,
} from "@/storage/types";
export { encryptData, decryptData } from "@/storage/crypto";
