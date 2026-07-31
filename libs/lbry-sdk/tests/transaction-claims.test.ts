import { describe, test, expect, beforeAll } from "vitest";
import { setupWasmExports } from "./setup";
import { unwrap } from "@/wasm/unwrap";
import { TEST_MNEMONIC, TEST_SDHASH, TEST_PUBKEY_HEX } from "./fixtures";

let wasm: Awaited<ReturnType<typeof setupWasmExports>>;
let handle: number;

beforeAll(async () => {
  wasm = await setupWasmExports();
  const result = unwrap(wasm.walletFromMnemonic(TEST_MNEMONIC), "walletFromMnemonic");
  handle = result.handle;
}, 30000);

describe("WASM transaction operations", () => {
  test("estimateTxSize returns reasonable size for 1-in 1-out", () => {
    const { size } = unwrap(wasm.estimateTxSize(1, 1), "estimateTxSize");
    expect(size).toBeGreaterThan(100);
    expect(size).toBeLessThan(400);
  });

  test("estimateTxSize scales with inputs", () => {
    const { size: small } = unwrap(wasm.estimateTxSize(1, 2), "estimateTxSize");
    const { size: large } = unwrap(wasm.estimateTxSize(5, 2), "estimateTxSize");
    expect(large).toBeGreaterThan(small);
  });

  test("estimateFee calculates fee from size and rate", () => {
    const { fee } = unwrap(wasm.estimateFee(250, "10"), "estimateFee");
    expect(fee).toBe("2500");
  });

  test("buildTx builds and signs a simple transaction", () => {
    const inputs = JSON.stringify([
      {
        txid: "a".repeat(64),
        vout: 0,
        amount: "100000000",
        scriptPubKey: "76a914" + "00".repeat(20) + "88ac",
        chain: 0,
        index: 0,
      },
    ]);
    const addrResult = unwrap(wasm.walletAddressAt(handle, 0, 1), "walletAddressAt");
    const outputs = JSON.stringify([
      {
        address: addrResult.address,
        amount: "99000000",
      },
    ]);

    const { txhex, txid } = unwrap(wasm.buildTx(handle, inputs, outputs), "buildTx");
    expect(txhex).toBeDefined();
    expect(txid).toBeDefined();
    expect(txhex.length).toBeGreaterThan(50);
    expect(txid.length).toBe(64);
  });

  test("claimIDFromTxVout computes claim ID", () => {
    const txid = "a".repeat(64);
    const { claimIDHex } = unwrap(wasm.claimIDFromTxVout(txid, 0), "claimIDFromTxVout");
    expect(claimIDHex).toBeDefined();
    expect(claimIDHex.length).toBeGreaterThan(0);
  });
});

describe("WASM claim operations", () => {
  test("createChannelClaim produces valid protobuf hex", () => {
    const { valueHex } = unwrap(wasm.createChannelClaim("@testchannel", TEST_PUBKEY_HEX), "createChannelClaim");
    expect(valueHex).toBeDefined();
    expect(valueHex.length).toBeGreaterThan(20);
  });

  test("createStreamClaim with valid sdHash", () => {
    const { valueHex } = unwrap(
      wasm.createStreamClaim(
        "Test Stream",
        "A description",
        TEST_SDHASH,
        "video/mp4",
        "",
      ),
      "createStreamClaim",
    );
    expect(valueHex).toBeDefined();
    expect(valueHex.length).toBeGreaterThan(20);
  });

  test("createStreamClaim rejects short sdHash", () => {
    const result = wasm.createStreamClaim(
      "Test",
      "",
      "a1b2c3", // too short
      "video/mp4",
      "",
    );
    expect("error" in result).toBe(true);
  });

  test("parseClaimValue round-trips a channel claim", () => {
    const { valueHex } = unwrap(wasm.createChannelClaim("@testchannel", TEST_PUBKEY_HEX), "createChannelClaim");
    const result = unwrap(wasm.parseClaimValue(valueHex), "parseClaimValue");
    expect(result.claimType).toBeDefined();
    expect(result.claimType).toBe("channel");
  });

  test("compileClaimValue serializes a claim", () => {
    const { valueHex } = unwrap(wasm.createChannelClaim("@testchannel", TEST_PUBKEY_HEX), "createChannelClaim");
    const { valueHex: compiled } = unwrap(wasm.compileClaimValue(valueHex), "compileClaimValue");
    expect(compiled).toBeDefined();
  });

  test("createCollectionClaim", () => {
    const { valueHex } = unwrap(
      wasm.createCollectionClaim("My Collection", [
        "a".repeat(40),
        "b".repeat(40),
      ]),
      "createCollectionClaim",
    );
    expect(valueHex).toBeDefined();
  });

  test("createRepostClaim", () => {
    const { valueHex } = unwrap(
      wasm.createRepostClaim(
        "Repost Title",
        "c".repeat(40),
      ),
      "createRepostClaim",
    );
    expect(valueHex).toBeDefined();
  });
});
