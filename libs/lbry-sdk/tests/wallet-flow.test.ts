import { describe, test, expect, beforeAll } from "vitest";
import { toUTXOInputs } from "@/mempool/types";
import { validateAddress, validateAmount, validateFeeRate, buildReview, DUST_THRESHOLD } from "@/guardrails/validate";
import { TEST_MNEMONIC, TEST_SDHASH, TEST_PUBKEY_HEX, MOCK_UTXOS, createSdkFixtures } from "./fixtures";
import type { SdkFixtures } from "./fixtures";
import type { TxOutput } from "@/tx/types";

let fixtures: SdkFixtures;

beforeAll(async () => {
  fixtures = await createSdkFixtures();
}, 30000);

describe("Wallet flow integration", () => {
  test("create wallet → derive address → validate on mempool", async () => {
    const { wallet, mempool } = fixtures;
    const { handle, mnemonic, address } = wallet.fromMnemonic(TEST_MNEMONIC);
    expect(handle).toBeTypeOf("number");
    expect(mnemonic).toBe(TEST_MNEMONIC);
    expect(address.startsWith("b")).toBe(true);
    expect(validateAddress(address)).toBe(true);
  });

  test("get fees → estimate tx size → calculate fee", async () => {
    const { mempool, txBuilder } = fixtures;
    const fees = await mempool.getFees();
    expect(fees.fastestFee).toBeGreaterThan(0);

    const size = txBuilder.estimateSize(1, 2);
    expect(size).toBeGreaterThan(100);

    const fee = txBuilder.estimateFee(size, fees.fastestFee);
    expect(fee).toBe(size * fees.fastestFee);
  });

  test("get UTXOs → build tx → guardrail review", async () => {
    const { wasm, wallet, txBuilder, mempool } = fixtures;
    const { handle } = wallet.fromMnemonic(TEST_MNEMONIC);
    const address = wallet.address(handle);

    const utxos = await mempool.getAddressUtxos(address);
    expect(utxos.length).toBeGreaterThan(0);

    // All mock UTXOs belong to the primary address (chain 0, index 0).
    // In production, each UTXO's chain/index must be resolved by matching
    // the UTXO's scriptpubkey_address against derived wallet addresses.
    const inputs = utxos.map((u) => {
      const scriptResult = wasm.exports.walletPubKeyScriptAt(handle, 0, 0);
      if ("error" in scriptResult) throw new Error(scriptResult.error);
      return {
        txid: u.txid,
        vout: u.vout,
        amount: BigInt(u.value),
        scriptPubKey: scriptResult.scriptPubKey,
        chain: 0,
        index: 0,
      };
    });

    const destAddress = wallet.addressAt(handle, 0, 1);
    // Output = inputs - realistic fee (~132 bytes × 10 sat/vB = 1320 sats)
    const inputTotal = utxos.reduce((s, u) => s + BigInt(u.value), 0n);
    const outputs: TxOutput[] = [{ address: destAddress, amount: inputTotal - 1320n }];

    const signed = txBuilder.build(handle, inputs, outputs, { feePerByte: 10 });
    expect(signed.hex).toBeDefined();
    expect(signed.txid.length).toBe(64);

    const review = buildReview(signed);
    expect(review.valid).toBe(true);
  });

  test("create channel claim → parse → verify", () => {
    const { claims } = fixtures;
    const result = claims.newChannel({
      title: "@testchannel",
      publicKeyHex: TEST_PUBKEY_HEX,
    });
    expect(result.valueHex).toBeDefined();

    const parsed = claims.parse(result.valueHex);
    expect(parsed).toBeDefined();
  });

  test("create stream claim → sign with channel", () => {
    const { wasm, wallet, claims } = fixtures;
    const { handle } = wallet.fromMnemonic(TEST_MNEMONIC);

    const streamResult = claims.newStream({
      title: "Test Video",
      description: "A test stream",
      sdHash: TEST_SDHASH,
      mediaType: "video/mp4",
    });
    expect(streamResult.valueHex).toBeDefined();

    // Sign the stream claim with the wallet's channel key
    const signedHex = claims.sign(
      streamResult.valueHex,
      handle,
      "a".repeat(64), // first input txid
      "b".repeat(40) // channel claim ID
    );
    // Verify the return is a hex string (not an object with signedValueHex)
    expect(signedHex).toBeDefined();
    expect(typeof signedHex).toBe("string");
    expect(signedHex.length).toBeGreaterThan(streamResult.valueHex.length);
  });

  test("end-to-end: wallet → UTXOs → coinselect → build tx → broadcast", async () => {
    const { wasm, wallet, txBuilder, mempool } = fixtures;
    const { handle } = wallet.fromMnemonic(TEST_MNEMONIC);
    const address = wallet.address(handle);

    // 1. Fetch UTXOs from mempool
    const utxos = await mempool.getAddressUtxos(address);
    expect(utxos.length).toBeGreaterThan(0);

    // 2. Select coins via WASM — must convert mempool UTXOs to WASM format
    const coinResult = wasm.exports.selectCoins(
      JSON.stringify(toUTXOInputs(utxos)),
      (99000000).toString(),
      (10).toString(),
    );
    if ("error" in coinResult) throw new Error(coinResult.error);
    const { selected } = coinResult;
    expect(selected).toBeDefined();
    expect(selected.length).toBeGreaterThan(0);

    // 3. Build inputs with real scriptPubKey from the wallet.
    // All mock UTXOs belong to the primary address (chain 0, index 0).
    // In production, resolve each UTXO's real chain/index by matching
    // scriptpubkey_address against derived wallet addresses.
    const inputs = selected.map((u) => {
      const scriptResult = wasm.exports.walletPubKeyScriptAt(handle, 0, 0);
      if ("error" in scriptResult) throw new Error(scriptResult.error);
      return {
        txid: u.txid,
        vout: u.vout,
        amount: BigInt(u.amount),
        scriptPubKey: scriptResult.scriptPubKey,
        chain: 0,
        index: 0,
      };
    });
    const inputTotal2 = selected.reduce((s, u) => s + BigInt(u.amount), 0n);
    const target = 50000000n; // 0.5 LBC — must leave room for fee + dust change
    const destAddress = wallet.addressAt(handle, 0, 1);
    const changeAddress = wallet.addressAt(handle, 1, 0);

    // 4. Estimate fee for dest + change output, then compute change
    const estimatedSize = txBuilder.estimateSize(inputs.length, 2);
    const estimatedFee = estimatedSize * 10;
    const change = inputTotal2 - target - BigInt(estimatedFee);
    if (change < BigInt(DUST_THRESHOLD)) {
      throw new Error(`Change ${change} sats is below dust threshold (${DUST_THRESHOLD})`);
    }

    // 5. Build with dest + change — actual fee = inputs - outputs
    const outputs: TxOutput[] = [
      { address: destAddress, amount: target },
      { address: changeAddress, amount: change },
    ];
    const signed = txBuilder.build(handle, inputs, outputs, { feePerByte: 10 });

    // 4. Guardrail check
    const review = buildReview(signed);
    expect(review.valid).toBe(true);

    // 5. Broadcast
    const txid = await mempool.broadcastTx(signed.hex);
    expect(txid).toBeDefined();
    expect(txid.length).toBe(64);
  });

  test("validateAmount rejects dust", () => {
    expect(validateAmount(545)).toBe(false);
    expect(validateAmount(546)).toBe(true);
    expect(validateAmount(0)).toBe(false);
    expect(validateAmount(-1)).toBe(false);
  });

  test("validateAmount handles bigint without precision loss", () => {
    // Above MAX_SAFE_INTEGER — must stay in BigInt domain
    expect(validateAmount(BigInt(Number.MAX_SAFE_INTEGER) + 1n)).toBe(true);
    expect(validateAmount(BigInt(Number.MAX_SAFE_INTEGER) + 1n)).toBe(true);
    // String above MAX_SAFE_INTEGER
    expect(validateAmount("9007199254740993")).toBe(true);
    // Non-numeric string returns false, doesn't throw
    expect(validateAmount("abc")).toBe(false);
    // Fractional string returns false (not a valid integer satoshi)
    expect(validateAmount("1234.00")).toBe(false);
  });

  test("toUTXOInputs converts bigint values to string for WASM boundary", () => {
    // UTXO.value is now bigint (parsed via parseJsonBigInt reviver).
    // toUTXOInputs converts to string for the WASM boundary.
    const largeUtxos = [
      {
        txid: "a".repeat(64),
        vout: 0,
        value: 100000000000n, // 1000 LBC — bigint, no precision loss
        status: { confirmed: true, block_height: 100 },
      },
    ];
    const inputs = toUTXOInputs(largeUtxos);
    // Returns string (WASM boundary type). BigInt() converts safely.
    expect(inputs[0].amount).toBe("100000000000");
    expect(BigInt(inputs[0].amount)).toBe(100000000000n);
  });

  test("validateFeeRate clamps to floor/ceiling", () => {
    expect(validateFeeRate(0)).toBe(false);
    expect(validateFeeRate(1)).toBe(true);
    expect(validateFeeRate(1000)).toBe(true);
    expect(validateFeeRate(1001)).toBe(false);
  });
});
