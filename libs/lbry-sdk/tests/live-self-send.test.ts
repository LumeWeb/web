/**
 * Live self-send minimum test for LBRY SDK.
 *
 * Sends the minimum valid amount (dust threshold = 546 sats) from one UTXO
 * back to the same wallet, with change returning to the sender address.
 * Does NOT drain the wallet — leaves the balance minus a small fee.
 *
 * Uses the real mempool.lbry.org API and real WASM for signing.
 *
 * Skip conditions:
 *   - LBRY_TEST_MNEMONIC env var not set
 *
 * Usage:
 *   LBRY_TEST_MNEMONIC="feed hole spray turtle tiger weapon napkin pudding sad settle walk already" \
 *     npx vitest run --config vitest.live.config.ts
 */

import { describe, test, expect, beforeAll, afterAll } from "vitest";
import { unwrap } from "@/wasm/unwrap";
import { validateAddress, validateFeeRate, validateAmount } from "@/guardrails/validate";
import type { TxInput, TxOutput } from "@/tx/types";
import type { UTXO } from "@/mempool/types";
import { createSdkFixtures } from "./fixtures";
import type { SdkFixtures } from "./fixtures";

// Minimum output amount (Bitcoin/LBRY dust threshold)
const DUST_THRESHOLD = 546;

// Mnemonic is passed via vitest test.env (runtime) and accessible
// via import.meta.env in the browser — never baked into the bundle.
function getMnemonic(): string | undefined {
  if (typeof import.meta !== "undefined") {
    const env = (import.meta as unknown as Record<string, unknown>).env as Record<string, string | undefined> | undefined;
    if (env?.LBRY_TEST_MNEMONIC) {
      return env.LBRY_TEST_MNEMONIC;
    }
  }
  return undefined;
}

const MNEMONIC = getMnemonic();

const TEST_SKIP_REASON = "LBRY_TEST_MNEMONIC not set — skipping live self-send test";

// Wallet fixed addresses (derived from the test mnemonic).
const ADDRESSES_TO_SCAN = [
  { chain: 0, index: 0, label: "m/0/0" },
  { chain: 0, index: 1, label: "m/0/1" },
  { chain: 0, index: 2, label: "m/0/2" },
];

let fixtures: SdkFixtures;

beforeAll(async () => {
  if (!MNEMONIC) return;

  fixtures = await createSdkFixtures();
}, 600000);

describe("Live self-send minimum", () => {
  test.skipIf(!MNEMONIC)(
    "should send minimum amount (546 sats) back to self with change",
    async () => {
      const { wasm, wallet, txBuilder, mempool } = fixtures;
      expect(MNEMONIC).toBeDefined();

      // 1. Create wallet from mnemonic
      const { handle } = wallet.fromMnemonic(MNEMONIC!);
      expect(handle).toBeTypeOf("number");

      try {
        // Verify the wallet address matches expected
        const primaryAddress = wallet.address(handle);
        expect(validateAddress(primaryAddress)).toBe(true);

        // 2. Fetch UTXOs across known addresses — pick ONE with enough balance
        const availableUtxos: { utxo: UTXO; chain: number; index: number }[] = [];

        for (const addrInfo of ADDRESSES_TO_SCAN) {
          const addr = wallet.addressAt(handle, addrInfo.chain, addrInfo.index);
          const utxos = await mempool.getAddressUtxos(addr);
          for (const utxo of utxos) {
            availableUtxos.push({ utxo, chain: addrInfo.chain, index: addrInfo.index });
          }
        }

        expect(availableUtxos.length).toBeGreaterThan(0);

        // Pick the smallest UTXO that can cover: DUST_THRESHOLD + fee (2 outputs)
        // We need: input.value >= DUST_THRESHOLD + fee + DUST_THRESHOLD (change)
        // Fee for 1 input, 2 outputs ≈ ~200 sats at 2 sat/vB
        const minNeeded = BigInt(DUST_THRESHOLD * 2 + 300); // generous estimate
        const inputUtxo = availableUtxos
          .filter((u) => u.utxo.value >= minNeeded)
          .sort((a, b) => Number(a.utxo.value - b.utxo.value))[0];

        expect(inputUtxo).toBeDefined();
        expect(inputUtxo.utxo.value).toBeGreaterThan(DUST_THRESHOLD);

        const totalValue = BigInt(inputUtxo.utxo.value);

        // 3. Get fee rate from mempool API
        let feeRate: number;
        try {
          const fees = await mempool.getFees();
          feeRate = fees.economyFee;
        } catch {
          feeRate = 2; // Fallback
        }
        expect(validateFeeRate(feeRate)).toBe(true);

        // 4. Build input from the single UTXO
        const scriptResult = unwrap(
          wasm.exports.walletPubKeyScriptAt(
            handle,
            inputUtxo.chain,
            inputUtxo.index,
          ),
          "walletPubKeyScriptAt",
        );

        const inputs: TxInput[] = [
          {
            txid: inputUtxo.utxo.txid,
            vout: inputUtxo.utxo.vout,
            amount: totalValue,
            scriptPubKey: scriptResult.scriptPubKey,
            chain: inputUtxo.chain,
            index: inputUtxo.index,
          },
        ];

        // 5. Build transaction: send DUST_THRESHOLD to self, change back to self
        const senderAddr = wallet.addressAt(handle, inputUtxo.chain, inputUtxo.index);
        const dustAmount = BigInt(DUST_THRESHOLD);
        const outputs: TxOutput[] = [
          {
            address: senderAddr, // send to self
            amount: dustAmount,
          },
          {
            address: senderAddr, // change back to self
            amount: totalValue - dustAmount, // will be adjusted after fee calc
          },
        ];

        // 6. Build and sign
        const signed = txBuilder.build(handle, inputs, outputs, { feePerByte: feeRate });
        expect(signed.hex).toBeDefined();
        expect(signed.txid.length).toBe(64);
        expect(signed.fee).toBeGreaterThan(0n);

        // Reconcile: adjust change output to match actual fee
        const changeAmount = totalValue - dustAmount - BigInt(signed.fee);
        expect(validateAmount(Number(changeAmount).toString())).toBe(true);
        outputs[1].amount = changeAmount;

        // Rebuild with corrected change
        const finalSigned = txBuilder.build(handle, inputs, outputs, { feePerByte: feeRate });
        expect(finalSigned.hex).toBeDefined();
        expect(finalSigned.txid.length).toBe(64);

        // 7. Broadcast
        const txid = await mempool.broadcastTx(finalSigned.hex);
        expect(txid).toBeDefined();
        expect(txid.length).toBe(64);
        expect(txid).toBe(finalSigned.txid);

        console.log(`Broadcast txid: ${txid}`);
        console.log(`Sent: ${DUST_THRESHOLD} sats, Fee: ${signed.fee} sats, Change: ${changeAmount} sats`);

        // 8. Poll for confirmation (every 30s, timeout 10 min)
        const maxWaitMs = 10 * 60 * 1000;
        const pollIntervalMs = 30_000;
        const startTime = Date.now();
        let confirmed = false;

        while (Date.now() - startTime < maxWaitMs) {
          await new Promise((r) => setTimeout(r, pollIntervalMs));
          try {
            const tx = await mempool.getTx(txid);
            if (tx.status.confirmed) {
              confirmed = true;
              console.log(`Confirmed at block ${tx.status.block_height}`);
              break;
            }
          } catch {
            // TX not found yet in mempool — keep polling
          }
        }

        expect(confirmed).toBe(true);

        // 9. Verify the tx has 2 outputs (dust + change) back to the same address
        const tx = await mempool.getTx(txid);
        expect(tx.vout.length).toBe(2);

        // Both outputs should go to the sender address
        const senderUtxos = await mempool.getAddressUtxos(senderAddr);
        const newUtxo = senderUtxos.find(
          (u) => u.txid === txid && Math.abs(Number(u.value) - DUST_THRESHOLD) <= 1,
        );
        expect(newUtxo).toBeDefined();
        console.log("Self-send minimum successful! New UTXO:", newUtxo!.txid);
      } finally {
        // Cleanup: always release wallet keys even if an assertion fails
        wallet.close(handle);
      }
    },
    11 * 60 * 1000 // 11 minute timeout
  );
});

/**
 * After all tests: sweep all UTXOs back into a single UTXO at m/0/0
 * to avoid leaving dust fragments across the wallet.
 */
afterAll(async () => {
  if (!MNEMONIC || !fixtures) return;
  const { wasm, wallet, txBuilder, mempool } = fixtures;

  const { handle } = wallet.fromMnemonic(MNEMONIC!);
  try {
    // Collect all UTXOs across known addresses
    const allUtxos: { utxo: UTXO; chain: number; index: number }[] = [];
    for (const addrInfo of ADDRESSES_TO_SCAN) {
      const addr = wallet.addressAt(handle, addrInfo.chain, addrInfo.index);
      const utxos = await mempool.getAddressUtxos(addr);
      for (const utxo of utxos) {
        allUtxos.push({ utxo, chain: addrInfo.chain, index: addrInfo.index });
      }
    }

    // Only sweep if there's more than 1 UTXO
    if (allUtxos.length <= 1) {
      console.log(`Sweep: only ${allUtxos.length} UTXO(s), skipping consolidation`);
      return;
    }

    const totalValue = allUtxos.reduce((s, u) => s + u.utxo.value, 0n);

    // Get fee rate
    let feeRate: number;
    try {
      const fees = await mempool.getFees();
      feeRate = fees.economyFee;
    } catch {
      feeRate = 2;
    }

    // Build inputs
    const inputs: TxInput[] = allUtxos.map(({ utxo, chain, index }) => {
      const scriptResult = unwrap(
        wasm.exports.walletPubKeyScriptAt(handle, chain, index),
        "walletPubKeyScriptAt",
      );
      return {
        txid: utxo.txid,
        vout: utxo.vout,
        amount: BigInt(utxo.value),
        scriptPubKey: scriptResult.scriptPubKey,
        chain,
        index,
      };
    });

    // Build single output (all value minus fee)
    const estSize = txBuilder.estimateSize(inputs.length, 1);
    const estimatedFee = txBuilder.estimateFee(estSize, feeRate);
    let outputAmount = totalValue - BigInt(estimatedFee);

    const outputs: TxOutput[] = [
      {
        address: wallet.addressAt(handle, 0, 0),
        amount: outputAmount,
      },
    ];

    const signed = txBuilder.build(handle, inputs, outputs, { feePerByte: feeRate });
    // Reconcile fee
    outputAmount = totalValue - BigInt(signed.fee);
    outputs[0].amount = outputAmount;

    const finalSigned = txBuilder.build(handle, inputs, outputs, { feePerByte: feeRate });
    const txid = await mempool.broadcastTx(finalSigned.hex);
    console.log(`Sweep complete: consolidated ${allUtxos.length} UTXOs into ${txid} (${outputAmount} sats)`);
  } catch (err) {
    console.error("Sweep failed (non-fatal):", err);
  } finally {
    wallet.close(handle);
  }
}, 600000);
