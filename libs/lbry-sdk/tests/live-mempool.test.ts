import { describe, test, expect } from "vitest";
import { MempoolClient } from "@/mempool/client";

/**
 * Live API tests against mempool.lbry.org.
 *
 * These tests hit the real API — no MSW, no mocks.
 * Only read-only endpoints are tested. No wallet or coins required.
 *
 * Run: npx vitest run --config vitest.live.config.ts
 *
 * If the API is down, these tests will fail with network errors —
 * that's expected. They are companion tests, not part of the default suite.
 */

const client = new MempoolClient({ baseUrl: "https://mempool.lbry.org" });

describe("Live mempool.lbry.org REST API", () => {
  test("getTipHeight returns a positive integer", async () => {
    const height = await client.getTipHeight();
    expect(typeof height).toBe("number");
    expect(height).toBeGreaterThan(0);
  });

  test("getTipHash returns a 64-char hex string", async () => {
    const hash = await client.getTipHash();
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  test("getBlocks returns recent blocks from tip", async () => {
    const tip = await client.getTipHeight();
    const blocks = await client.getBlocks(tip);
    expect(blocks.length).toBeGreaterThan(0);
    expect(blocks.length).toBeLessThanOrEqual(15);
    // First block should be at or near the tip
    expect(blocks[0].height).toBeLessThanOrEqual(tip);
  });

  test("getBlock by tip hash returns valid block", async () => {
    const hash = await client.getTipHash();
    const block = await client.getBlock(hash);
    expect(block.id).toBe(hash);
    expect(block.height).toBeGreaterThan(0);
    expect(block.tx_count).toBeGreaterThan(0);
  });

  test("getBlockTxs returns transactions from tip block", async () => {
    const hash = await client.getTipHash();
    const txs = await client.getBlockTxs(hash);
    expect(txs.length).toBeGreaterThan(0);
    expect(txs[0].txid).toMatch(/^[0-9a-f]{64}$/);
  });

  test("getFees returns recommended fee rates", async () => {
    const fees = await client.getFees();
    expect(fees).toBeDefined();
    expect(typeof fees.fastestFee).toBe("number");
    expect(fees.fastestFee).toBeGreaterThanOrEqual(1);
  });

  test("getMempoolState returns mempool data", async () => {
    const state = await client.getMempoolState();
    expect(state).toBeDefined();
    // mempool-blocks endpoint returns an array
    expect(Array.isArray(state)).toBe(true);
  });

  test("getTx returns a known transaction from block", async () => {
    // Fetch tip block txs to get a real txid
    const hash = await client.getTipHash();
    const txs = await client.getBlockTxs(hash);
    expect(txs.length).toBeGreaterThan(0);

    const txid = txs[0].txid;
    const tx = await client.getTx(txid);
    expect(tx.txid).toBe(txid);
  });

  test("full chain: tip height -> tip hash -> block -> block txs -> tx", async () => {
    const height = await client.getTipHeight();
    expect(height).toBeGreaterThan(0);

    const hash = await client.getTipHash();
    expect(hash).toMatch(/^[0-9a-f]{64}$/);

    const block = await client.getBlock(hash);
    expect(block.height).toBe(height);

    const blockTxs = await client.getBlockTxs(hash);
    // Block txs endpoint may paginate — just verify we got some
    expect(blockTxs.length).toBeGreaterThan(0);
    expect(blockTxs.length).toBeLessThanOrEqual(block.tx_count);

    const tx = await client.getTx(blockTxs[0].txid);
    expect(tx.txid).toBe(blockTxs[0].txid);
  });
});

describe("Live mempool.lbry.org — address endpoints", () => {
  // Address endpoints were previously returning HTTP 500 due to backend
  // misconfiguration. These tests verify they are operational.
  // Address bCpaaBBEQTFcuKULHGSDa1dpVZpTuK91jQ is a known address with
  // no UTXOs (empty result) — safe to query without needing coins.
  const knownAddress = "bCpaaBBEQTFcuKULHGSDa1dpVZpTuK91jQ";

  test("getAddressUtxos returns 200 (endpoint operational)", async () => {
    const utxos = await client.getAddressUtxos(knownAddress);
    expect(Array.isArray(utxos)).toBe(true);
    // Endpoint is operational — we don't assert on count since
    // the address may or may not have UTXOs at any given time.
  });

  test("getAddressTxs returns 200 (endpoint operational)", async () => {
    const txs = await client.getAddressTxs(knownAddress);
    expect(Array.isArray(txs)).toBe(true);
  });
});
