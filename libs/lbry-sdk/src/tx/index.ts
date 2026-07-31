/**
 * Transaction module — building, signing, fee estimation, and broadcasting.
 *
 * TransactionBuilder uses WASM for serialization and signing.
 * FeeEstimator provides pure TypeScript arithmetic for quick estimates.
 * TransactionBroadcaster sends signed transactions to the mempool.
 *
 * @module @lumeweb/lbry-sdk/tx
 */

export { TransactionBuilder } from "@/tx/builder";
export type { TxInput, TxOutput, SignedTx, BuildTxOptions } from "@/tx/types";
export { TransactionBroadcaster } from "@/tx/broadcaster";
export type { BroadcastResult, BroadcasterOptions } from "@/tx/broadcaster";
export { FeeEstimator } from "@/tx/fees";
export type { FeeEstimate, FeeRateType } from "@/tx/types";
