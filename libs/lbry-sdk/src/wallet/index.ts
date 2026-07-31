/**
 * Wallet module — wallet creation, import, and address derivation.
 *
 * The wallet manager wraps WASM wallet exports. Private keys stay in WASM
 * memory — JS only sees opaque handles and derived addresses.
 *
 * @module @lumeweb/lbry-sdk/wallet
 */

export { LbryWalletManager } from "@/wallet/manager";
export type {
  WalletHandle,
  AddressInfo,
  AddressManagerOptions,
  CreatedWallet,
  ImportedWallet,
} from "@/wallet/types";
