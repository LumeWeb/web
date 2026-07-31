/**
 * Encrypted wallet storage using IndexedDB + WebCrypto.
 *
 * Mnemonics are encrypted with AES-256-GCM (PBKDF2 key derivation).
 * Plaintext never touches storage — only in memory during unlock.
 *
 * @module @lumeweb/lbry-sdk/storage/store
 */

import type { StoredWallet, WalletStoreOptions, EncryptedPayload } from "@/storage/types";
import { encryptData, decryptData } from "@/storage/crypto";

const DEFAULT_DB_NAME = "lbry-sdk";
const DEFAULT_STORE_NAME = "wallets";

/**
 * Encrypted wallet storage using IndexedDB + WebCrypto.
 *
 * Mnemonics are encrypted with AES-256-GCM (PBKDF2 key derivation).
 * Plaintext never touches storage — only in memory during unlock.
 *
 * @example
 * ```ts
 * const store = new WalletStore();
 * await store.store({ mnemonic, address, createdAt: Date.now() }, "password");
 * const wallet = await store.load(address, "password");
 * ```
 */
export class WalletStore {
  private readonly dbName: string;
  private readonly storeName: string;

  constructor(opts: WalletStoreOptions = {}) {
    this.dbName = opts.dbName ?? DEFAULT_DB_NAME;
    this.storeName = opts.storeName ?? DEFAULT_STORE_NAME;
  }

  /**
   * Open (and create if needed) the IndexedDB database.
   *
   * Creates the object store on first run with `address` as the key path.
   *
   * @returns A promise resolving to the IndexedDB database handle
   */
  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(this.dbName, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: "address" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Store a wallet encrypted with the given password.
   *
   * The mnemonic is encrypted with AES-256-GCM before being written to IndexedDB.
   *
   * @param wallet - The wallet data to store (mnemonic, address, createdAt)
   * @param password - The password to encrypt the mnemonic with
   * @throws {Error} If IndexedDB write fails
   */
  async store(wallet: StoredWallet, password: string): Promise<void> {
    const payload = await encryptData(wallet.mnemonic, password);
    const db = await this.openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(this.storeName, "readwrite");
      tx.objectStore(this.storeName).put({
        address: wallet.address,
        payload,
        createdAt: wallet.createdAt,
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }

  /**
   * Load and decrypt a wallet by address.
   *
   * @param address - The wallet address (key in IndexedDB)
   * @param password - The password to decrypt the mnemonic with
   * @returns The decrypted wallet data
   * @throws {Error} If no wallet is found for the given address
   * @throws {Error} If decryption fails (wrong password)
   */
  async load(address: string, password: string): Promise<StoredWallet> {
    const db = await this.openDB();
    const record = await new Promise<{
      address: string;
      payload: EncryptedPayload;
      createdAt: number;
    } | null>((resolve, reject) => {
      const tx = db.transaction(this.storeName, "readonly");
      const req = tx.objectStore(this.storeName).get(address);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
    db.close();

    if (!record) throw new Error(`No wallet found for address ${address}`);

    const mnemonic = await decryptData(record.payload, password);
    return {
      mnemonic,
      address: record.address,
      createdAt: record.createdAt,
    };
  }

  /**
   * List all stored wallet addresses.
   *
   * @returns An array of stored wallet addresses
   */
  async listAddresses(): Promise<string[]> {
    const db = await this.openDB();
    const addresses = await new Promise<string[]>((resolve, reject) => {
      const tx = db.transaction(this.storeName, "readonly");
      const req = tx.objectStore(this.storeName).getAllKeys();
      req.onsuccess = () => resolve(req.result as string[]);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return addresses;
  }

  /**
   * Delete a stored wallet by address.
   *
   * @param address - The wallet address to delete
   * @throws {Error} If IndexedDB delete fails
   */
  async delete(address: string): Promise<void> {
    const db = await this.openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(this.storeName, "readwrite");
      tx.objectStore(this.storeName).delete(address);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  }
}
