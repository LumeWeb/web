/**
 * Fee estimation — pure TypeScript arithmetic for transaction fee calculation.
 *
 * These are simple arithmetic formulas ported from liblbry/chain/tx.go:
 * - EstimateTxSize: 10 + numInputs*250 + numOutputs*40
 * - EstimateFee: size * feePerByte
 *
 * Must stay in sync with Go chain.EstimateTxSize and chain.EstimateFee.
 * LBRY input/output sizes are larger than standard Bitcoin P2PKH (148/34)
 * because LBRY claim scripts include extra opcode overhead.
 *
 * @module @lumeweb/lbry-sdk/tx/fees
 */

import type { FeeEstimate, FeeRateType } from "@/tx/types";
import { amt } from "@/tx/amount";

/** Estimated size per LBRY P2PKH input in bytes (scriptSig + signature) */
const INPUT_SIZE = 250;
/** Estimated size per P2PKH output in bytes (script + value) */
const OUTPUT_SIZE = 40;
/** Overhead bytes (version, locktime, input/output counts) */
const TX_OVERHEAD = 10;

/**
 * Pure TypeScript fee estimator — no WASM call needed.
 *
 * Provides size estimation (based on input/output counts) and fee calculation
 * (size × fee rate). LBRY transactions have larger inputs/outputs than standard
 * Bitcoin due to claim script overhead.
 *
 * @example
 * ```ts
 * const estimator = new FeeEstimator();
 * const estimate = estimator.estimate(2, 2, 5); // 2 inputs, 2 outputs, 5 sat/vB
 * console.log(estimate.size, estimate.fee);
 * ```
 */
export class FeeEstimator {
  /**
   * Estimate transaction size in bytes for given input/output counts.
   *
   * @param numInputs - Number of transaction inputs (UTXOs)
   * @param numOutputs - Number of transaction outputs
   * @returns Estimated size in bytes
   */
  estimateSize(numInputs: number, numOutputs: number): number {
    return numInputs * INPUT_SIZE + numOutputs * OUTPUT_SIZE + TX_OVERHEAD;
  }

  /**
   * Estimate fee in satoshis for a given tx size + fee rate.
   *
   * @param size - Transaction size in bytes
   * @param feePerByte - Fee rate in satoshis per byte
   * @returns Estimated fee in satoshis
   */
  estimateFee(size: number, feePerByte: number): number {
    return size * feePerByte;
  }

  /**
   * Compute a full fee estimate for a transaction with given inputs/outputs.
   *
   * @param numInputs - Number of transaction inputs
   * @param numOutputs - Number of transaction outputs
   * @param feePerByte - Fee rate in satoshis per byte
   * @returns A {@link FeeEstimate} object with size, fee, and feePerByte
   */
  estimate(
    numInputs: number,
    numOutputs: number,
    feePerByte: number
  ): FeeEstimate {
    const size = this.estimateSize(numInputs, numOutputs);
    const fee = amt(this.estimateFee(size, feePerByte));
    return { size, fee, feePerByte };
  }
}
