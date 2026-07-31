import { http, HttpResponse, ws } from "msw";
import {
  MOCK_UTXOS,
  MOCK_ADDRESS_TXS,
  MOCK_FEES,
  MOCK_BLOCK_HEIGHT,
  MOCK_BLOCK_HASH,
} from "./fixtures";

/** Mempool WebSocket mock endpoint */
export const mempoolWs = ws.link("wss://mempool.lbry.org/api/v1/ws");

/** WebSocket connection handler — sends initial data on connect */
export const wsHandler = mempoolWs.addEventListener("connection", ({ client }) => {
  // Push initial stats on connect — use "message" wildcard type
  client.send(
    JSON.stringify({
      type: "mempool-stats",
      block: { height: MOCK_BLOCK_HEIGHT },
      fees: MOCK_FEES,
    })
  );
});

/** Static REST handlers — immutable mempool data */
export const staticHandlers = [
  // Blocks
  http.get("*/api/blocks/tip/height", () =>
    HttpResponse.json(MOCK_BLOCK_HEIGHT)
  ),
  http.get("*/api/blocks/tip/hash", () =>
    HttpResponse.text(MOCK_BLOCK_HASH)
  ),
  http.get("*/api/block-height/:height", () =>
    HttpResponse.json(MOCK_BLOCK_HASH)
  ),
  http.get("*/api/block/:hash", () =>
    HttpResponse.json({
      id: MOCK_BLOCK_HASH,
      height: MOCK_BLOCK_HEIGHT,
      version: 1,
      timestamp: 1700000000,
      tx_count: 1,
      size: 1000,
      weight: 4000,
      merkle_root: MOCK_BLOCK_HASH,
      previousblockhash: "0".repeat(64),
      mediantime: 1700000000,
      nonce: 0,
      bits: 0,
      difficulty: 1,
    })
  ),
  http.get("*/api/block/:hash/txs", () =>
    HttpResponse.json([
      {
        txid: "a".repeat(64),
        vin: [],
        vout: [],
        fee: 1000,
        status: { confirmed: true, block_height: MOCK_BLOCK_HEIGHT },
        size: 250,
        weight: 1000,
      },
    ])
  ),
  http.get("*/api/blocks/:height", () =>
    HttpResponse.json([
      {
        id: MOCK_BLOCK_HASH,
        height: MOCK_BLOCK_HEIGHT,
        version: 1,
        timestamp: 1700000000,
        tx_count: 1,
        size: 1000,
        weight: 4000,
        merkle_root: MOCK_BLOCK_HASH,
        previousblockhash: "0".repeat(64),
        mediantime: 1700000000,
        nonce: 0,
        bits: 0,
        difficulty: 1,
      },
    ])
  ),

  // Fees
  http.get("*/api/v1/fees/recommended", () =>
    HttpResponse.json(MOCK_FEES)
  ),
  http.get("*/api/v1/fees/mempool-blocks", () =>
    HttpResponse.json([
      {
        blockSize: 26922,
        blockVSize: 26922,
        nTx: 24,
        totalFees: 1054855,
        medianFee: 0,
        feeRange: [1.3, 6.5, 11.2, 47.8, 78.4, 191.5, 368.6],
      },
    ])
  ),

  // Address validation
  http.get("*/api/v1/validate-address/:address", ({ params }) =>
    HttpResponse.json({
      isvalid: true,
      address: params.address as string,
      isscript: false,
      iswitness: false,
    })
  ),

  // Transaction details
  http.get("*/api/tx/:txid", ({ params }) =>
    HttpResponse.json({
      txid: params.txid as string,
      vin: [],
      vout: [],
      fee: 1000,
      status: { confirmed: true, block_height: MOCK_BLOCK_HEIGHT },
    })
  ),
];

/** Stateful handlers — mutable wallet data (UTXOs, broadcast) */
let mockUtxoSet = [...MOCK_UTXOS];
let broadcastTxs: string[] = [];

export function resetMockState() {
  mockUtxoSet = [...MOCK_UTXOS];
  broadcastTxs = [];
}

export function getMockUtxos() {
  return mockUtxoSet;
}

export function setMockUtxos(utxos: typeof MOCK_UTXOS) {
  mockUtxoSet = [...utxos];
}

export function getBroadcastTxs() {
  return broadcastTxs;
}

/** Stateful broadcast — records broadcast tx, returns deterministic txid */
export const statefulBroadcastHandler = http.post(
  "*/api/tx",
  async ({ request }) => {
    const txHex = await request.text();
    // Simple deterministic 64-char hex txid (not crypto-accurate, just for tests)
    let hash = 0;
    for (let i = 0; i < txHex.length; i++) {
      hash = ((hash << 5) - hash + txHex.charCodeAt(i)) | 0;
    }
    const txid = (hash >>> 0).toString(16).padStart(8, "0").repeat(8).slice(0, 64);
    broadcastTxs.push(txid);
    return new HttpResponse(txid, { headers: { "Content-Type": "text/plain" } });
  }
);

/** Stateful UTXO handler */
export const statefulUtxoHandler = http.get(
  "*/api/address/:address/utxo",
  () => HttpResponse.json(mockUtxoSet)
);

/** Stateful address txs handler */
export const statefulAddressTxsHandler = http.get(
  "*/api/address/:address/txs",
  () => HttpResponse.json([...MOCK_ADDRESS_TXS])
);

export const statefulHandlers = [
  statefulBroadcastHandler,
  statefulUtxoHandler,
  statefulAddressTxsHandler,
];
