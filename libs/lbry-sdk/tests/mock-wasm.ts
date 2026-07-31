/**
 * Mock WASM exports for browser tests.
 *
 * The real Go unit tests (wasm/go/exports/) validate the actual crypto logic.
 * Browser tests use these mocks to test the TS wrapper layer without loading
 * the real 2.8MB WASM binary.
 */
import type { WasmExports } from "@/wasm/types";
import { TEST_MNEMONIC, TEST_SDHASH, TEST_PUBKEY_HEX } from "./fixtures";
let handleCounter = 0;
const handles = new Map<number, string>();

export function createMockWasm(): WasmExports {
  return {
    ready: true,

    makeSeed: () => ({ mnemonic: TEST_MNEMONIC }),

    walletFromMnemonic: (mnemonic: string) => {
      if (mnemonic.split(" ").length !== 12) return { error: "invalid mnemonic" };
      const handle = handleCounter++;
      handles.set(handle, mnemonic);
      return { handle, address: "bMockAddr".padEnd(28, "0") };
    },

    walletFromSeed: (seed: string) => {
      if (!seed || seed.length < 64 || !/^[0-9a-fA-F]+$/.test(seed)) return { error: "invalid seed" };
      const handle = handleCounter++;
      handles.set(handle, seed);
      return { handle, address: "bSeedAddr".padEnd(28, "0") };
    },

    walletPublicKeyHex: (handle: number) => {
      if (!handles.has(handle)) return { error: "invalid handle" };
      return { publicKey: TEST_PUBKEY_HEX };
    },

    walletPrivateKeyHex: (handle: number) => {
      if (!handles.has(handle)) return { error: "invalid handle" };
      return { privateKey: "0".repeat(64) };
    },

    walletAddress: (handle: number) => {
      if (!handles.has(handle)) return { error: "invalid handle" };
      return { address: "bCutT81yTa7mHo6JUsZLvN8mVFjkCXGvkg" };
    },

    walletAddressAt: (handle: number, _chain: number, index: number) => {
      if (!handles.has(handle)) return { error: "invalid handle" };
      return { address: `bAddr${index}`.padEnd(28, "x") };
    },

    walletMnemonic: (handle: number) => {
      const mnemonic = handles.get(handle);
      if (!mnemonic) return { error: "invalid handle" };
      return { mnemonic };
    },

    walletPubKeyScriptAt: (_h: number, _c: number, index: number) => ({
      scriptPubKey: "76a914" + index.toString(16).padStart(40, "0") + "88ac",
    }),

    buildTx: (_handle: number, _inputs: string, _outputs: string) => ({
      txhex: "0100000001" + "0".repeat(120),
      txid: "f".repeat(64),
    }),

    estimateTxSize: (inputs: number, outputs: number) => ({
      size: 148 * inputs + 34 * outputs + 10,
    }),

    estimateFee: (size: number, feePerByte: string) => ({
      fee: String(size * Number(feePerByte)),
    }),

    walletClose: (_handle: number) => ({ closed: true }),

    claimIDFromTxVout: (txid: string, vout: number) => ({
      claimIDHex: (txid.slice(0, 40) + vout.toString(16).padStart(40, "0")).slice(0, 40),
    }),

    createChannelClaim: (_title: string, _pubKey: string) => ({
      valueHex: "0a14" + "0".repeat(40),
    }),

    createStreamClaim: (
      _title: string,
      _desc: string,
      sdHash: string,
      _mediaType: string,
      _channelID?: string
    ) => {
      if (sdHash.length < 96) return { error: "sdHash must be 48 bytes (96 hex chars)" };
      return { valueHex: "0a14" + "0".repeat(40) };
    },

    createCollectionClaim: (_title: string, _ids: string[]) => ({
      valueHex: "0a14" + "0".repeat(40),
    }),

    createRepostClaim: (_title: string, _claimID: string) => ({
      valueHex: "0a14" + "0".repeat(40),
    }),

    signStreamClaim: (_handle: number, valueHex: string, _txid: string, _channelID: string, _channelChain: number, _channelIndex: number) => ({
      valueHex: valueHex + "a1b2c3d4",
    }),

    parseClaimValue: (claimHex: string) => ({
      version: 0,
      hasSignature: false,
      claimType: "channel",
      title: "@testchannel",
      publicKeyHex: "02" + "ab".repeat(32),
      mediaType: "",
      sdHashHex: "",
      claimIDHex: "",
      signatureHex: "",
    }),

    compileClaimValue: (claimHex: string) => ({
      valueHex: claimHex,
    }),

    selectCoins: (utxosJson: string, target: string, feePerByte: string, _costOfChange?: string) => {
      const utxos = JSON.parse(utxosJson) as { txid?: string; vout?: number; amount: string; value?: number; height?: number }[];
      const targetNum = Number(target);
      const feePerByteNum = Number(feePerByte);
      const total = utxos.reduce((sum, u) => sum + Number(u.amount ?? u.value ?? 0), 0);
      const fee = 148 * utxos.length + 44 + 10 * feePerByteNum;
      if (total < targetNum + fee) return { error: "insufficient funds" };
      // Greedy selection
      const sorted = [...utxos].sort((a, b) => {
        const aVal = Number(a.amount ?? a.value ?? 0);
        const bVal = Number(b.amount ?? b.value ?? 0);
        return bVal - aVal;
      });
      const selected: {
        txid: string;
        vout: number;
        amount: string;
        fee: string;
        effectiveAmount: string;
        height: number;
      }[] = [];
      let acc = 0;
      for (const u of sorted) {
        const uVal = Number(u.amount ?? u.value ?? 0);
        selected.push({
          txid: u.txid ?? "mocktxid",
          vout: u.vout ?? 0,
          amount: String(uVal),
          fee: String(fee / sorted.length),
          effectiveAmount: String(uVal - fee / sorted.length),
          height: u.height ?? 500000,
        });
        acc += uVal;
        if (acc >= targetNum + fee) break;
      }
      return { selected, total: String(acc), effective: String(acc - fee), waste: String(0), exactMatch: false };
    },
  };
}
