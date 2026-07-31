/**
 * Test mnemonic and expected addresses.
 *
 * This mnemonic is deterministic — same seed every run.
 * Addresses verified against LBRY's BIP32 path m/chain/index (m/0/N receiving).
 */
export const TEST_MNEMONIC =
  "will bus cluster trumpet jump venue truly habit decrease stuff renew horse";

/** LBRY coin type (140) helpers */
export const LBRY_COIN_TYPE = 140;

/** A valid 48-byte sdHash (SHA-384 of "test") */
export const TEST_SDHASH =
  "768412320f7b0aa5812fce428dc4706b3cae50e02a64caa16a782249bfe8efc4b7ef1ccb126255d196047dfedf17a0a9";

/** A valid compressed public key (33 bytes, hex = 66 chars) */
export const TEST_PUBKEY_HEX =
  "030e736c3bc36d9712d73643a47d3ad1e2011281b62da1c0e13dfbc4c44b9db17d";

/** Simple mock UTXOs for tests */
export const MOCK_UTXOS = [
  {
    txid: "a".repeat(64),
    vout: 0,
    status: { confirmed: true, block_height: 2100000 },
    value: 100000000, // 1 LBC
  },
  {
    txid: "b".repeat(64),
    vout: 1,
    status: { confirmed: true, block_height: 2100001 },
    value: 50000000, // 0.5 LBC
  },
];

/** Mock address transactions */
export const MOCK_ADDRESS_TXS = [
  {
    txid: "a".repeat(64),
    vin: [{ prevout: { value: 100000000, scriptpubkey_address: "bCpaaBBEQTFcuKULHGSDa1dpVZpTuK91jQ" } }],
    vout: [{ value: 100000000, scriptpubkey_address: "bCpaaBBEQTFcuKULHGSDa1dpVZpTuK91jQ" }],
    fee: 1000,
    status: { confirmed: true, block_height: 2100000 },
  },
];

/** Mock fee rates */
export const MOCK_FEES = {
  fastestFee: 10,
  halfHourFee: 5,
  hourFee: 2,
  economyFee: 1,
  minimumFee: 1,
};

/** Mock block tip */
export const MOCK_BLOCK_HEIGHT = 2100000;
export const MOCK_BLOCK_HASH = "0".repeat(64);

/**
 * Helper: create SDK fixtures (WasmLoader instance, LbryWalletManager,
 * TransactionBuilder, MempoolClient, ClaimsAPI).
 * Shared by wallet-flow.test.ts and live-self-send.test.ts.
 */
import { WasmLoader } from "@/wasm/loader";
import { LbryWalletManager } from "@/wallet/manager";
import { TransactionBuilder } from "@/tx/builder";
import { ClaimsAPI } from "@/claims/api";
import { MempoolClient } from "@/mempool/client";
import type { TxInput, TxOutput, TxPaymentOutput } from "@/tx/types";

export interface SdkFixtures {
  wasm: Awaited<ReturnType<typeof WasmLoader.load>>;
  wallet: LbryWalletManager;
  txBuilder: TransactionBuilder;
  claims: ClaimsAPI;
  mempool: MempoolClient;
}

export async function createSdkFixtures(): Promise<SdkFixtures> {
  const wasm = await WasmLoader.load();
  const wallet = new LbryWalletManager(wasm);
  const txBuilder = new TransactionBuilder(wasm);
  const claims = new ClaimsAPI(wasm);
  const mempool = new MempoolClient({ baseUrl: "https://mempool.lbry.org" });
  return { wasm, wallet, txBuilder, claims, mempool };
}

/**
 * Create a dummy P2PKH scriptPubKey (76a914 + 20-byte pubkey hash + 88ac).
 */
export function makeDummyScriptPubKey(): string {
  return "76a914" + "00".repeat(20) + "88ac";
}

/**
 * Factory: create a TxInput with a dummy scriptPubKey.
 * Useful for tests that don't care about the actual script.
 */
export function makeTxInput(
  overrides: Pick<TxInput, "txid" | "vout"> & { amount: bigint } & Partial<Omit<TxInput, "txid" | "vout" | "amount">>,
): TxInput {
  return {
    scriptPubKey: makeDummyScriptPubKey(),
    chain: 0,
    index: 0,
    ...overrides,
  };
}

/**
 * Factory: create a TxOutput for testing.
 * Defaults to a payment output (no claim fields).
 */
export function makeTxOutput(
  overrides: { address: string; amount: bigint } & Partial<Omit<TxPaymentOutput, "address" | "amount">>,
): TxOutput {
  return { ...overrides };
}
