/**
 * Transaction builder — builds and signs LBRY transactions via WASM.
 *
 * JS passes UTXOs + outputs to WASM; WASM handles key access, signing,
 * and serialization. Private keys never leave WASM memory.
 *
 * @module @lumeweb/lbry-sdk/tx/builder
 */

import { WasmBase } from "@/wasm/base";
import { unwrap } from "@/wasm/unwrap";
import type { WalletHandle } from "@/wallet/types";
import type { TxInput, TxOutput, SignedTx, BuildTxOptions } from "@/tx/types";
import { FeeEstimator } from "@/tx/fees";
import { validateFeeRate } from "@/guardrails/validate";
import { feeFromTotals, amtToStr } from "@/tx/amount";

/**
 * Builds and signs LBRY transactions via WASM.
 *
 * JS passes UTXOs + outputs to WASM; WASM handles key access, signing,
 * and serialization. Private keys never leave WASM memory.
 *
 * The fee reported in the returned {@link SignedTx} is computed from actual
 * input/output amounts (inputs - outputs), reflecting the true economic fee.
 * The size is approximated from the signed hex length.
 *
 * @example
 * ```ts
 * const wasm = await WasmLoader.load();
 * const builder = new TransactionBuilder(wasm);
 * const signed = builder.build(handle, inputs, outputs, { feePerByte: 5 });
 * console.log(signed.txid, signed.fee);
 * ```
 */
export class TransactionBuilder extends WasmBase {
  private readonly estimator = new FeeEstimator();

  /**
   * Build and sign a transaction.
   *
   * The fee is computed from actual input/output amounts (inputs - outputs),
   * NOT estimated from hex length. The size is derived from the signed hex
   * (txhex.length / 2) as an approximation of the virtual size.
   *
   * @param handle - Wallet handle to sign with
   * @param inputs - UTXOs to spend (pre-selected by selectCoins)
   * @param outputs - Destination addresses + values
   * @param opts - Fee rate options (used for validation only)
   * @returns The signed transaction with hex, txid, size, and economic fee
   * @throws {Error} If the fee rate is invalid
   * @throws {Error} If the WASM buildTx call fails
   * @throws {Error} If the returned hex has odd length (invalid hex encoding)
   * @throws {Error} If inputs don't cover outputs (negative fee)
   */
  build(
    handle: WalletHandle,
    inputs: TxInput[],
    outputs: TxOutput[],
    opts: BuildTxOptions
  ): SignedTx {
    if (!validateFeeRate(opts.feePerByte)) {
      throw new Error(`Invalid fee rate: ${opts.feePerByte}`);
    }
    // Validate claim outputs: isClaim requires a non-zero claimType
    for (const o of outputs) {
      if (o.isClaim && !o.claimType) {
        throw new Error(
          `Claim output to ${o.address} is missing claimType (1=name, 2=update, 3=support)`
        );
      }
    }
    // Convert bigint amounts to string for WASM JSON serialization
    const wasmInputs = inputs.map(i => ({ ...i, amount: amtToStr(i.amount) }));
    const wasmOutputs = outputs.map(o => ({ ...o, amount: amtToStr(o.amount) }));
    const { txhex, txid } = unwrap(
      this.wasm.buildTx(handle, JSON.stringify(wasmInputs), JSON.stringify(wasmOutputs)),
      "buildTx"
    );
    // Validate hex is well-formed (even length).
    if (txhex.length % 2 !== 0) {
      throw new Error(`buildTx returned odd-length hex (${txhex.length} chars)`);
    }
    const size = txhex.length / 2;
    // Compute fee from actual economics: inputs - outputs.
    // This reflects the true fee paid by the transaction, not an estimate.
    const fee = feeFromTotals(
      inputs.reduce((s, i) => s + i.amount, 0n),
      outputs.reduce((s, o) => s + o.amount, 0n),
    );
    return { hex: txhex, txid, size, fee };
  }

  /**
   * Estimate total transaction size in bytes for given input/output counts.
   *
   * @param numInputs - Number of inputs
   * @param numOutputs - Number of outputs
   * @returns Estimated size in bytes
   */
  estimateSize(numInputs: number, numOutputs: number): number {
    return this.estimator.estimateSize(numInputs, numOutputs);
  }

  /**
   * Estimate fee for a given size and fee rate.
   *
   * @param size - Transaction size in bytes
   * @param feePerByte - Fee rate in satoshis per byte
   * @returns Estimated fee in satoshis
   */
  estimateFee(size: number, feePerByte: number): number {
    return this.estimator.estimateFee(size, feePerByte);
  }

  /**
   * Compute the claim ID from a transaction output.
   *
   * @param txid - The transaction ID
   * @param vout - The output index
   * @returns The claim ID as a hex string
   * @throws {Error} If the WASM claimIDFromTxVout call fails
   */
  claimIDFromTxVout(txid: string, vout: number): string {
    const { claimIDHex } = unwrap(this.wasm.claimIDFromTxVout(txid, vout), "claimIDFromTxVout");
    if (!claimIDHex) throw new Error("claimIDFromTxVout failed");
    return claimIDHex;
  }
}
