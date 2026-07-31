/**
 * Storage types — wallet data, store options, and encrypted payload structures.
 *
 * @module @lumeweb/lbry-sdk/storage/types
 */

/**
 * Stored wallet data saved to IndexedDB.
 *
 * @property mnemonic - The Electrum mnemonic (seed phrase)
 * @property address - The primary wallet address (also used as the key in IndexedDB)
 * @property createdAt - Unix timestamp (ms) when the wallet was created/stored
 */
export interface StoredWallet {
  mnemonic: string;
  address: string;
  createdAt: number;
}

/** Wallet store options */
export interface WalletStoreOptions {
  /** IndexedDB database name */
  dbName?: string;
  /** Object store name */
  storeName?: string;
}

/**
 * Encrypted payload structure returned by {@link encryptData}.
 *
 * @property ciphertext - AES-256-GCM encrypted ciphertext
 * @property iv - Initialization vector (12 bytes)
 * @property salt - PBKDF2 salt (16 bytes)
 */
export interface EncryptedPayload {
  ciphertext: ArrayBuffer;
  iv: Uint8Array;
  salt: Uint8Array;
}
