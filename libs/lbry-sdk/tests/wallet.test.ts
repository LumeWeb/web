import { describe, test, expect, beforeAll } from "vitest";
import { setupWasmExports } from "./setup";
import { unwrap } from "@/wasm/unwrap";
import { TEST_MNEMONIC } from "./fixtures";

let wasm: Awaited<ReturnType<typeof setupWasmExports>>;

beforeAll(async () => {
  wasm = await setupWasmExports();
}, 30000);

describe("WASM wallet operations", () => {
  test("makeSeed produces 12-word mnemonic", () => {
    const { mnemonic } = unwrap(wasm.makeSeed(), "makeSeed");
    expect(mnemonic).toBeDefined();
    const words = mnemonic.split(" ");
    expect(words.length).toBe(12);
  });

  test("walletFromMnemonic returns handle", () => {
    const { handle } = unwrap(wasm.walletFromMnemonic(TEST_MNEMONIC), "walletFromMnemonic");
    expect(handle).toBeTypeOf("number");
    expect(handle).toBeGreaterThanOrEqual(0);
  });

  test("walletAddress produces b-prefixed LBRY address", () => {
    const { handle } = unwrap(wasm.walletFromMnemonic(TEST_MNEMONIC), "walletFromMnemonic");
    const { address } = unwrap(wasm.walletAddress(handle), "walletAddress");
    expect(address).toBeDefined();
    expect(address.startsWith("b")).toBe(true);
    expect(address.length).toBeGreaterThan(25);
  });

  test("same mnemonic + same index → same address (determinism)", () => {
    const { handle: h1 } = unwrap(wasm.walletFromMnemonic(TEST_MNEMONIC), "walletFromMnemonic");
    const { handle: h2 } = unwrap(wasm.walletFromMnemonic(TEST_MNEMONIC), "walletFromMnemonic");

    const { address: a1 } = unwrap(wasm.walletAddress(h1), "walletAddress");
    const { address: a2 } = unwrap(wasm.walletAddress(h2), "walletAddress");

    expect(a1).toBe(a2);
  });

  test("walletAddressAt derives different addresses for different indices", () => {
    const { handle } = unwrap(wasm.walletFromMnemonic(TEST_MNEMONIC), "walletFromMnemonic");

    const { address: addr0 } = unwrap(wasm.walletAddressAt(handle, 0, 0), "walletAddressAt");
    const { address: addr1 } = unwrap(wasm.walletAddressAt(handle, 0, 1), "walletAddressAt");

    expect(addr0).not.toBe(addr1);
    expect(addr0.startsWith("b")).toBe(true);
    expect(addr1.startsWith("b")).toBe(true);
  });

  test("walletPublicKeyHex returns 33-byte compressed pubkey (66 hex chars)", () => {
    const { handle } = unwrap(wasm.walletFromMnemonic(TEST_MNEMONIC), "walletFromMnemonic");
    const { publicKey } = unwrap(wasm.walletPublicKeyHex(handle), "walletPublicKeyHex");

    expect(publicKey).toBeDefined();
    expect(publicKey.length).toBe(66);
    // Compressed pubkey starts with 02 or 03
    expect(publicKey.match(/^02|03/)).not.toBeNull();
  });

  test("walletPrivateKeyHex returns 32-byte private key (64 hex chars)", () => {
    const { handle } = unwrap(wasm.walletFromMnemonic(TEST_MNEMONIC), "walletFromMnemonic");
    const { privateKey } = unwrap(wasm.walletPrivateKeyHex(handle), "walletPrivateKeyHex");

    expect(privateKey).toBeDefined();
    expect(privateKey.length).toBe(64);
  });

  test("walletMnemonic returns the original mnemonic", () => {
    const { handle } = unwrap(wasm.walletFromMnemonic(TEST_MNEMONIC), "walletFromMnemonic");
    const { mnemonic } = unwrap(wasm.walletMnemonic(handle), "walletMnemonic");

    expect(mnemonic).toBe(TEST_MNEMONIC);
  });

  test("walletFromMnemonic rejects invalid mnemonic", () => {
    const result = wasm.walletFromMnemonic("invalid mnemonic words foo bar baz");
    expect("error" in result).toBe(true);
  });

  test("walletFromSeed returns handle + address from hex seed", () => {
    const seedHex = "01".repeat(32); // 64-char hex seed
    const { handle, address } = unwrap(wasm.walletFromSeed(seedHex), "walletFromSeed");
    expect(handle).toBeTypeOf("number");
    expect(handle).toBeGreaterThanOrEqual(0);
    expect(address).toBeDefined();
    expect(address.startsWith("b")).toBe(true);
  });

  test("walletFromSeed rejects short seed", () => {
    const result = wasm.walletFromSeed("short");
    expect("error" in result).toBe(true);
  });

  test("walletFromSeed same seed → same address (determinism)", () => {
    const seedHex = "02".repeat(32);
    const { address: a1 } = unwrap(wasm.walletFromSeed(seedHex), "walletFromSeed");
    const { address: a2 } = unwrap(wasm.walletFromSeed(seedHex), "walletFromSeed");
    expect(a1).toBe(a2);
  });

  test("walletPubKeyScriptAt returns 25-byte P2PKH script hex", () => {
    const { handle } = unwrap(wasm.walletFromMnemonic(TEST_MNEMONIC), "walletFromMnemonic");
    const { scriptPubKey } = unwrap(wasm.walletPubKeyScriptAt(handle, 0, 0), "walletPubKeyScriptAt");
    expect(scriptPubKey).toBeDefined();
    // P2PKH script: OP_DUP OP_HASH160 <20> OP_EQUALVERIFY OP_CHECKSIG = 25 bytes = 50 hex chars
    expect(scriptPubKey.length).toBe(50);
    expect(scriptPubKey.startsWith("76a914")).toBe(true);
    expect(scriptPubKey.endsWith("88ac")).toBe(true);
  });

  test("walletPubKeyScriptAt returns different scripts for different indices", () => {
    const { handle } = unwrap(wasm.walletFromMnemonic(TEST_MNEMONIC), "walletFromMnemonic");
    const { scriptPubKey: s0 } = unwrap(wasm.walletPubKeyScriptAt(handle, 0, 0), "walletPubKeyScriptAt");
    const { scriptPubKey: s1 } = unwrap(wasm.walletPubKeyScriptAt(handle, 0, 1), "walletPubKeyScriptAt");
    expect(s0).not.toBe(s1);
  });
});
