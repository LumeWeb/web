import { describe, test, expect, beforeAll } from "vitest";
import { MempoolClient } from "@/mempool/client";
import { MempoolWebSocket } from "@/mempool/websocket";
import {
  MOCK_BLOCK_HEIGHT,
  MOCK_BLOCK_HASH,
  MOCK_FEES,
  MOCK_UTXOS,
} from "./fixtures";
import { setMockUtxos, getBroadcastTxs, resetMockState } from "./msw-handlers";

let client: MempoolClient;

beforeAll(() => {
  client = new MempoolClient({ baseUrl: "https://mempool.lbry.org" });
});

describe("Mempool REST client (MSW)", () => {
  test("get block tip height", async () => {
    const height = await client.getTipHeight();
    expect(height).toBe(MOCK_BLOCK_HEIGHT);
  });

  test("get block tip hash", async () => {
    const hash = await client.getTipHash();
    expect(hash).toBe(MOCK_BLOCK_HASH);
  });

  test("get recommended fees", async () => {
    const fees = await client.getFees();
    expect(fees.fastestFee).toBe(MOCK_FEES.fastestFee);
    expect(fees.halfHourFee).toBe(MOCK_FEES.halfHourFee);
  });

  test("get address UTXOs", async () => {
    const utxos = await client.getAddressUtxos("bCpaaBBEQTFcuKULHGSDa1dpVZpTuK91jQ");
    expect(utxos.length).toBe(MOCK_UTXOS.length);
    expect(utxos[0].value).toBe(BigInt(MOCK_UTXOS[0].value));
  });

  test("broadcast transaction", async () => {
    const txid = await client.broadcastTx("deadbeef");
    expect(txid).toBeDefined();
    expect(txid.length).toBe(64);
    expect(getBroadcastTxs()).toContain(txid);
  });

  test("stateful UTXO set changes after update", async () => {
    setMockUtxos([
      {
        txid: "c".repeat(64),
        vout: 0,
        status: { confirmed: true, block_height: 2100002 },
        value: 25000000,
      },
    ]);
    const utxos = await client.getAddressUtxos("bCpaaBBEQTFcuKULHGSDa1dpVZpTuK91jQ");
    expect(utxos.length).toBe(1);
    expect(utxos[0].value).toBe(25000000n);
    resetMockState();
  });
});

describe("Mempool WebSocket (via websocket-ts)", () => {
  test("constructs with default URL and provides event interface", () => {
    const ws = new MempoolWebSocket();
    // Verify the public API exists
    expect(typeof ws.connect).toBe("function");
    expect(typeof ws.disconnect).toBe("function");
    expect(typeof ws.on).toBe("function");
    expect(typeof ws.trackAddress).toBe("function");
    expect(typeof ws.trackTx).toBe("function");
    expect(typeof ws.want).toBe("function");
    ws.disconnect();
  });

  test("on() returns an unsubscribe function", () => {
    const ws = new MempoolWebSocket();
    const unsub = ws.on("test", () => {});
    expect(typeof unsub).toBe("function");
    unsub();
    ws.disconnect();
  });
});
