/**
 * Mempool module — REST and WebSocket clients for mempool.lbry.org.
 *
 * Provides typed access to LBRY blockchain data: blocks, transactions,
 * UTXOs, address history, fee rates, and real-time mempool updates.
 *
 * @module @lumeweb/lbry-sdk/mempool
 */

export { MempoolClient } from "@/mempool/client";
export type {
  MempoolClientOptions,
  Block,
  Transaction,
  UTXO,
  AddressTxs,
  FeeRates,
  MempoolState,
} from "@/mempool/types";
export { MempoolWebSocket } from "@/mempool/websocket";
export type {
  MempoolWebSocketOptions,
  WebSocketMessage,
  AddressTxMessage,
  TxStatusMessage,
  MempoolStatsMessage,
} from "@/mempool/types";
