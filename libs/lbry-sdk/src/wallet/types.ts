/**
 * Wallet types — handle, address info, and wallet creation/import results.
 *
 * The wallet handle is an opaque integer referencing a Wallet struct in Go-WASM
 * memory. Private keys never leave WASM — JS only sees handles and addresses.
 *
 * @module @lumeweb/lbry-sdk/wallet/types
 */

/** Opaque wallet handle — integer referencing a Wallet in Go-WASM memory */
export type WalletHandle = number;

/**
 * Derived address info including chain position and usage status.
 *
 * @property address - The LBRY address (base58check encoded)
 * @property chain - HD chain index (0 = external/receiving, 1 = internal/change)
 * @property index - HD address index within the chain
 * @property used - Whether the address has been used in any transaction
 */
export interface AddressInfo {
  address: string;
  chain: number;
  index: number;
  used: boolean;
}

/** AddressManager options */
export interface AddressManagerOptions {
  /** Gap limit for address discovery (maximum unused addresses scanned) */
  gapLimit?: number;
}

/**
 * Result of creating a new wallet.
 *
 * @property handle - Opaque wallet handle for subsequent operations
 * @property mnemonic - The generated Electrum mnemonic (seed phrase)
 * @property address - The primary wallet address (chain 0, index 0)
 */
export interface CreatedWallet {
  handle: WalletHandle;
  mnemonic: string;
  address: string;
}

/**
 * Result of importing a wallet from an existing mnemonic.
 *
 * @property handle - Opaque wallet handle for subsequent operations
 * @property mnemonic - The imported Electrum mnemonic
 * @property address - The primary wallet address (chain 0, index 0)
 */
export interface ImportedWallet {
  handle: WalletHandle;
  mnemonic: string;
  address: string;
}
