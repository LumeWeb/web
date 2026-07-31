/**
 * Contract test: verifies the mock WASM exports return the same field names
 * as the Go adapter (adapters.go toJSMap).
 *
 * This test is DRIVEN BY contract.generated.json — produced by
 * `go run ./tools/gencontract` from the actual Go AST. If the Go side
 * changes a field name, regenerate the contract and this test breaks,
 * forcing you to update the mock and TS types.
 *
 * To regenerate after Go changes:
 *   cd wasm/go && go run ./tools/gencontract \
 *     -exports ./exports -main ./main.go -adapters ./adapters.go \
 *     -outdir ../../src/wasm
 */
import { describe, test, expect } from "vitest";
import { createMockWasm } from "./mock-wasm";
import { TEST_MNEMONIC, TEST_PUBKEY_HEX, TEST_SDHASH } from "./fixtures";
import contractData from "@/wasm/contract.generated.json";

const wasm = createMockWasm();
const entries = contractData.entries.filter(
  (e: { funcName: string }) => e.funcName !== "__lbrySDK__",
);

describe("Mock-Go adapter contract (generated)", () => {
  test("loaded contract has all 23 SDK functions", () => {
    expect(entries.length).toBe(23);
  });

  for (const entry of entries) {
    if (entry.isProperty) {
      test(`${entry.funcName} is a boolean property`, () => {
        const val = (wasm as unknown as Record<string, unknown>)[entry.funcName];
        expect(typeof val).toBe("boolean");
      });
      continue;
    }

    test(`${entry.funcName} returns { ${entry.fields.map((f: { name: string }) => f.name).join(", ")} }`, () => {
      const result = callMockWasm(wasm, entry.funcName);
      expect(result).toBeDefined();

      // Every field in the Go contract must be present (possibly undefined,
      // but the key must exist in the returned object)
      for (const field of entry.fields) {
        expect(result).toHaveProperty(field.name);
      }
    });

    // Negative rules: fields that must NOT be present
    if (entry.notFields && entry.notFields.length > 0) {
      test(`${entry.funcName} does NOT return { ${entry.notFields.join(", ")} }`, () => {
        const result = callMockWasm(wasm, entry.funcName);
        for (const badField of entry.notFields) {
          expect(result).not.toHaveProperty(badField);
        }
      });
    }
  }
});

/**
 * Call a mock WASM function with valid dummy args based on the function name.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function callMockWasm(wasm: any, funcName: string): Record<string, unknown> {
  const MNEMONIC = TEST_MNEMONIC;
  const PUBKEY = TEST_PUBKEY_HEX;
  const SDHASH = TEST_SDHASH;
  const SEED = "01".repeat(32);

  // For handle-dependent functions, create a wallet first
  const needsHandle = ["walletPublicKeyHex", "walletPrivateKeyHex", "walletPubKeyScriptAt",
    "walletAddress", "walletAddressAt", "walletMnemonic", "buildTx"];
  if (needsHandle.includes(funcName)) {
    const { handle } = wasm.walletFromMnemonic(MNEMONIC);
    switch (funcName) {
      case "walletPublicKeyHex": return wasm.walletPublicKeyHex(handle);
      case "walletPrivateKeyHex": return wasm.walletPrivateKeyHex(handle);
      case "walletPubKeyScriptAt": return wasm.walletPubKeyScriptAt(handle, 0, 0);
      case "walletAddress": return wasm.walletAddress(handle);
      case "walletAddressAt": return wasm.walletAddressAt(handle, 0, 0);
      case "walletMnemonic": return wasm.walletMnemonic(handle);
      case "buildTx": return wasm.buildTx(handle, "[]", "[]");
    }
  }

  switch (funcName) {
    case "makeSeed":
      return wasm.makeSeed();
    case "walletFromMnemonic":
      return wasm.walletFromMnemonic(MNEMONIC);
    case "walletFromSeed":
      return wasm.walletFromSeed(SEED);
    case "estimateTxSize":
      return wasm.estimateTxSize(1, 2);
    case "estimateFee":
      return wasm.estimateFee(200, "10");
    case "claimIDFromTxVout":
      return wasm.claimIDFromTxVout("a".repeat(64), 0);
    case "createChannelClaim":
      return wasm.createChannelClaim("@test", PUBKEY);
    case "createStreamClaim":
      return wasm.createStreamClaim("title", "desc", SDHASH, "video/mp4");
    case "createCollectionClaim":
      return wasm.createCollectionClaim("title", ["ab".repeat(20)]);
    case "createRepostClaim":
      return wasm.createRepostClaim("title", "ab".repeat(20));
    case "signStreamClaim":
      return wasm.signStreamClaim(0, "deadbeef", "a".repeat(64), "b".repeat(20), 2, 0);
    case "parseClaimValue":
      return wasm.parseClaimValue("deadbeef");
    case "compileClaimValue":
      return wasm.compileClaimValue("deadbeef");
    case "selectCoins":
      return wasm.selectCoins(
        JSON.stringify([{ txid: "a", vout: 0, amount: "100000", height: 500000 }]),
        (50000).toString(),
        (10).toString(),
      );
    case "walletClose":
      return wasm.walletClose(0);
    default:
      throw new Error(`don't know how to call ${funcName}`);
  }
}
