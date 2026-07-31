/**
 * Base class for WASM-bound modules.
 *
 * Provides a shared `wasm` property and constructor pattern for all
 * classes that wrap WASM exports (LbryWalletManager, ClaimsAPI, TransactionBuilder).
 *
 * @module @lumeweb/lbry-sdk/wasm/base
 */

import type { WasmExports } from "@/wasm/types";

/**
 * Base class for any module that wraps WASM exports.
 *
 * Subclasses receive a `WasmInstance`-shaped object (with `.exports`)
 * and store a typed reference to the exports.
 */
export class WasmBase {
  /** Typed WASM function exports — synchronous crypto operations. */
  protected readonly wasm: WasmExports;

  constructor(wasm: { exports: WasmExports }) {
    this.wasm = wasm.exports;
  }
}
