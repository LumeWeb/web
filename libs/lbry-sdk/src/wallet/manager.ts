/**
 * Wallet manager — high-level wallet operations wrapping WASM exports.
 *
 * Private keys stay in WASM memory — JS only sees handles and addresses.
 * All WASM functions are synchronous (TinyGo asyncify yields to event loop).
 *
 * @module @lumeweb/lbry-sdk/wallet/manager
 */

import { WasmBase } from "@/wasm/base";
import { unwrap } from "@/wasm/unwrap";
import type {
  WalletHandle,
  CreatedWallet,
  ImportedWallet,
} from "@/wallet/types";

const DEFAULT_GAP_LIMIT = 20;

/**
 * High-level wallet manager wrapping the WASM wallet exports.
 *
 * Provides create, import, address derivation, key export, and handle cleanup.
 * Private keys stay in WASM memory — JS only sees handles and addresses.
 * All WASM functions are synchronous (TinyGo asyncify yields to event loop).
 *
 * @example
 * ```ts
 * const wasm = await WasmLoader.load();
 * const manager = new LbryWalletManager(wasm);
 * const wallet = manager.create();
 * console.log(wallet.address); // "b" + base58 string
 * ```
 */
export class LbryWalletManager extends WasmBase {

  /**
   * Create a new wallet with a random Electrum mnemonic.
   *
   * @returns The created wallet with handle, mnemonic, and primary address
   * @throws {Error} If key generation fails (makeSeed, walletFromMnemonic, or walletAddress failed)
   */
  create(): CreatedWallet {
    const { mnemonic } = unwrap(this.wasm.makeSeed(), "makeSeed");
    if (!mnemonic) throw new Error("makeSeed failed");
    const { handle } = unwrap(this.wasm.walletFromMnemonic(mnemonic), "walletFromMnemonic");
    if (handle === undefined) throw new Error("walletFromMnemonic failed");
    const unshared = this.wasm.walletAddress(handle);
    // If address derivation fails, close the wallet to prevent handle/key leak.
    if ("error" in unshared) {
      this.wasm.walletClose(handle);
      throw new Error(`walletAddress failed: ${unshared.error}`);
    }
    const { address } = unshared;
    if (!address) {
      this.wasm.walletClose(handle);
      throw new Error("walletAddress failed");
    }
    return { handle, mnemonic, address };
  }

  /**
   * Import a wallet from an existing Electrum mnemonic.
   *
   * @param mnemonic - The Electrum mnemonic (seed phrase) to import
   * @returns The imported wallet with handle, mnemonic, and primary address
   * @throws {Error} If wallet creation from mnemonic or address derivation fails
   */
  fromMnemonic(mnemonic: string): ImportedWallet {
    const { handle } = unwrap(this.wasm.walletFromMnemonic(mnemonic), "walletFromMnemonic");
    if (handle === undefined) throw new Error("walletFromMnemonic failed");
    const unshared = this.wasm.walletAddress(handle);
    // If address derivation fails, close the wallet to prevent handle/key leak.
    if ("error" in unshared) {
      this.wasm.walletClose(handle);
      throw new Error(`walletAddress failed: ${unshared.error}`);
    }
    const { address } = unshared;
    if (!address) {
      this.wasm.walletClose(handle);
      throw new Error("walletAddress failed");
    }
    return { handle, mnemonic, address };
  }

  /**
   * Get the public key hex for a wallet handle.
   *
   * @param handle - The wallet handle to query
   * @returns The public key as a hex string
   * @throws {Error} If the wallet handle is invalid
   */
  publicKeyHex(handle: WalletHandle): string {
    const { publicKey } = unwrap(this.wasm.walletPublicKeyHex(handle), "walletPublicKeyHex");
    if (!publicKey) throw new Error("walletPublicKeyHex failed");
    return publicKey;
  }

  /**
   * Get the private key hex for a wallet handle (use with caution).
   *
   * **Warning:** Exposing the private key compromises the wallet. Only use
   * for backup/export purposes.
   *
   * @param handle - The wallet handle to query
   * @returns The private key as a hex string
   * @throws {Error} If the wallet handle is invalid
   */
  privateKeyHex(handle: WalletHandle): string {
    const { privateKey } = unwrap(this.wasm.walletPrivateKeyHex(handle), "walletPrivateKeyHex");
    if (!privateKey) throw new Error("walletPrivateKeyHex failed");
    return privateKey;
  }

  /**
   * Derive an address at a specific chain/index path.
   *
   * @param handle - The wallet handle
   * @param chain - HD chain (0 = external/receiving, 1 = internal/change)
   * @param index - Address index within the chain
   * @returns The derived LBRY address (base58check encoded)
   * @throws {Error} If derivation fails
   */
  addressAt(handle: WalletHandle, chain: number, index: number): string {
    const { address } = unwrap(this.wasm.walletAddressAt(handle, chain, index), "walletAddressAt");
    if (!address) throw new Error("walletAddressAt failed");
    return address;
  }

  /**
   * Get the primary address (chain 0, index 0).
   *
   * @param handle - The wallet handle
   * @returns The primary LBRY address
   * @throws {Error} If address derivation fails
   */
  address(handle: WalletHandle): string {
    const { address } = unwrap(this.wasm.walletAddress(handle), "walletAddress");
    if (!address) throw new Error("walletAddress failed");
    return address;
  }

  /**
   * Get the mnemonic for a wallet handle.
   *
   * @param handle - The wallet handle
   * @returns The Electrum mnemonic (seed phrase)
   * @throws {Error} If the handle is invalid
   */
  mnemonic(handle: WalletHandle): string {
    const { mnemonic } = unwrap(this.wasm.walletMnemonic(handle), "walletMnemonic");
    if (!mnemonic) throw new Error("walletMnemonic failed");
    return mnemonic;
  }

  /**
   * Release a wallet handle, clearing private key material from WASM memory.
   *
   * After calling close(), the handle is no longer valid for any operation.
   *
   * @param handle - The wallet handle to release
   * @returns `true` if the wallet was successfully closed
   * @throws {Error} If closing the wallet fails
   */
  close(handle: WalletHandle): boolean {
    const { closed } = unwrap(this.wasm.walletClose(handle), "walletClose");
    if (!closed) throw new Error(`walletClose failed for handle ${handle}`);
    return closed;
  }

  /** Default gap limit for address scanning (maximum unused addresses to check). */
  static readonly DEFAULT_GAP_LIMIT = DEFAULT_GAP_LIMIT;
}
