/**
 * Mempool types — REST API client options, block/tx/UTXO/address types, fee rates,
 * mempool state, and WebSocket message types.
 *
 * All types map to mempool.lbry.org API responses.
 *
 * @module @lumeweb/lbry-sdk/mempool/types
 */

/** Mempool REST API client options */
export interface MempoolClientOptions {
  /** Base URL for mempool REST API. Defaults to https://mempool.lbry.org */
  baseUrl?: string;
  /** Optional fetch implementation (for testing). Defaults to global fetch. */
  fetch?: typeof fetch;
}

/** Block summary from /api/blocks/:height */
export interface Block {
  id: string;
  height: number;
  version: number;
  timestamp: number;
  tx_count: number;
  size: number;
  weight: number;
  merkle_root: string;
  previousblockhash: string;
  mediantime: number;
  nonce: number;
  bits: number;
  difficulty: number;
}

/**
 * Transaction from /api/tx/:txid.
 *
 * @property vin - Array of transaction inputs
 * @property vout - Array of transaction outputs
 * @property status - Confirmation status info
 */
export interface Transaction {
  txid: string;
  version: number;
  locktime: number;
  vin: Array<{
    txid?: string;
    vout?: number;
    scriptsig?: string;
    txinwitness?: string[];
    sequence: number;
    is_coinbase?: boolean;
    prevout?: {
      scriptpubkey: string;
      scriptpubkey_address: string;
      value: bigint;
    };
  }>;
  vout: Array<{
    scriptpubkey: string;
    scriptpubkey_address: string;
    value: bigint;
  }>;
  size: number;
  weight: number;
  fee: bigint;
  status: AddressTxStatus;
}

/** UTXO from /api/address/:addr/utxo */
export interface UTXO {
  txid: string;
  vout: number;
  status: {
    confirmed: boolean;
    block_height?: number;
  };
  value: bigint;
}

/**
 * Convert mempool UTXOs to the format `selectCoins` expects.
 *
 * Mempool API uses `value` (sats as bigint) + `status.block_height`;
 * WASM `UTXOInput` expects `amount` (string) + `height`.
 *
 * @param utxos - UTXOs from the mempool API (value already bigint via parseJsonBigInt)
 * @returns Array of UTXO inputs with `amount` (string for WASM boundary) and `height` fields
 */
export function toUTXOInputs(utxos: UTXO[]): Array<{
  txid: string;
  vout: number;
  amount: string;
  height: number;
}> {
  return utxos.map((u) => ({
    txid: u.txid,
    vout: u.vout,
    amount: u.value.toString(),
    height: u.status.block_height ?? 0,
  }));
}

/** Address transaction history from /api/address/:addr/txs */
export interface AddressTxs {
  txid: string;
  version: number;
  locktime: number;
  vin: Array<{
    txid?: string;
    vout?: number;
    scriptsig?: string;
    sequence: number;
    is_coinbase?: boolean;
    prevout?: {
      scriptpubkey: string;
      scriptpubkey_address: string;
      value: bigint;
    };
  }>;
  vout: Array<{
    scriptpubkey: string;
    scriptpubkey_address: string;
    value: bigint;
  }>;
  size: number;
  weight: number;
  fee: bigint;
  status: AddressTxStatus;
}

/** Fee rates from /api/v1/fees/recommended */
export interface FeeRates {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
}

/** Mempool block info from /api/v1/fees/mempool-blocks */
export interface MempoolState {
  blockSize: number;
  blockVSize: number;
  nTx: number;
  totalFees: bigint;
  medianFee: number;
  feeRange: number[];
}

/**
 * Transaction status from mempool API responses.
 *
 * Shared by Transaction, AddressTxs, AddressTxMessage, and TxStatusMessage.
 */
export interface AddressTxStatus {
  confirmed: boolean;
  block_height?: number;
  block_hash?: string;
  block_time?: number;
}

// ── WebSocket types ──

/** Mempool WebSocket client options */
export interface MempoolWebSocketOptions {
  /** WebSocket URL. Defaults to wss://mempool.lbry.org/api/v1/ws */
  url?: string;
}

/** Base WebSocket message from mempool server */
export interface WebSocketMessage {
  type: string;
  [key: string]: unknown;
}

/** Address transaction notification (type: \"address-tx\") */
export interface AddressTxMessage extends WebSocketMessage {
  type: "address-tx";
  address: string;
  txid: string;
  status: AddressTxStatus;
}

/** Transaction status update (type: "tx-status") */
export interface TxStatusMessage extends WebSocketMessage {
  type: "tx-status";
  txid: string;
  status: AddressTxStatus;
  position?: {
    block: number;
    position: number;
  };
}

/** Mempool stats push (type: "stats") */
export interface MempoolStatsMessage extends WebSocketMessage {
  type: "stats";
  count: number;
  vsize: number;
  total_fee: bigint;
  fee_histogram: Array<[number, number]>;
}
