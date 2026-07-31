/**
 * Transaction types — input, output, signed transaction, and fee types.
 *
 * Input and output field names match the Go exports.TxInput/TxOutput
 * JSON struct tags for serialization to/from WASM.
 *
 * @module @lumeweb/lbry-sdk/tx/types
 */

/**
 * Transaction input (UTXO to spend).
 *
 * Field names match Go exports.TxInput json tags.
 *
 * @property txid - The transaction ID of the UTXO
 * @property vout - Output index in the referenced transaction
 * @property amount - Value of the UTXO in satoshis
 * @property scriptPubKey - The locking script (scriptPubKey) hex
 * @property chain - HD chain index (0=external/receiving, 1=internal/change)
 * @property index - HD address index within the chain
 */
export interface TxInput {
  txid: string;
  vout: number;
  amount: bigint;
  scriptPubKey: string;
  chain: number;  // HD chain (0=external/receiving, 1=internal/change)
  index: number;  // HD address index within the chain
}

/**
 * Transaction output — destination address + amount, optionally a claim.
 *
 * There are two forms:
 * - **Payment** (`isClaim` omitted/false): sends LBC to an address.
 * - **Claim** (`isClaim: true`): creates/updates/supports a claim.
 *   Claim outputs must specify `claimType` (1=name, 2=update, 3=support).
 *
 * @property address - LBRY base58 address
 * @property amount - Amount in satoshis (as bigint)
 * @property isClaim - Whether this output contains a claim
 * @property claimName - Name of the claim (claim outputs only)
 * @property claimValueHex - Hex-encoded claim value (claim outputs only)
 * @property claimIDHex - Claim ID hex (claim outputs only)
 * @property claimType - Required for claim outputs: 1=name, 2=update, 3=support
 */
export type TxOutput = TxPaymentOutput | TxClaimOutput;

/** Payment output — sends LBC to an address without a claim. */
export interface TxPaymentOutput {
  address: string;
  amount: bigint;
  isClaim?: false;
  claimName?: never;
  claimValueHex?: never;
  claimIDHex?: never;
  claimType?: never;
}

/** Claim output — creates, updates, or supports a claim. */
export interface TxClaimOutput {
  address: string;
  amount: bigint;
  isClaim: true;
  claimName?: string;
  claimValueHex?: string;
  claimIDHex?: string;
  /** 1=name, 2=update, 3=support */
  claimType: number;
}

/**
 * Signed transaction result.
 *
 * @property hex - The raw transaction hex
 * @property txid - The transaction ID (double SHA-256 of the raw tx)
 * @property size - Transaction size in bytes
 * @property fee - Estimated fee in satoshis (bigint)
 */
export interface SignedTx {
  hex: string;
  txid: string;
  size: number;
  fee: bigint;
}

/** Options for building a transaction */
export interface BuildTxOptions {
  /** Fee rate in satoshis per byte */
  feePerByte: number;
}

/**
 * Fee estimate result.
 *
 * @property size - Estimated transaction size in bytes
 * @property fee - Estimated fee in satoshis (bigint)
 * @property feePerByte - Fee rate used for the estimate (sat/vB)
 */
export interface FeeEstimate {
  size: number;
  fee: bigint;
  feePerByte: number;
}

/** Fee rate type label for recommended fee tiers */
export type FeeRateType = "fastest" | "halfHour" | "hour" | "economy";
