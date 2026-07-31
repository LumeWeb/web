# LBRY Wallet SDK for TypeScript

An SDK for building LBRY wallets and transaction primitives in the browser. Crypto operations happen in a TinyGo WebAssembly binary — private keys never leave WASM memory.

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                  JS Layer (TypeScript)            │
│                                                   │
│  LbryWalletManager   TransactionBuilder          │
│  MempoolClient       MempoolWebSocket            │
│  Guardrails (validateAddress, buildReview)       │
│  Claims API          WalletStore (IndexedDB)     │
│                                                   │
├──────────────────┬──────────────────────────────┤
│  fetch() / WS    │  WASM Bridge (sync calls)    │
│  (mempool.lbry.org) │  globalThis.__lbrySDK__     │
└──────────────────┴──────────────────────────────┘
         │                      │
         ▼                      ▼
  mempool.lbry.org        TinyGo WASM (lbry-sdk.wasm)
  REST + WebSocket        ┌─────────────────────────┐
                          │ BIP39 Mnemonic → BIP32   │
                          │ HD Key Derivation        │
                          │ ECDSA Signing (secp256k1)│
                          │ Bitcoin P2PKH Tx Building │
                          │ LBRY Claim Serialization  │
                          └─────────────────────────┘
```

### Three Layers

1. **WASM Crypto Layer** — TinyGo-compiled Go code exposing all cryptographic functions via `globalThis.__lbrySDK__`. Synchronous API (TinyGo asyncify handles yielding). Covers BIP39/BIP32/BIP44 key derivation, ECDSA signing, transaction building, claim serialization.

2. **JS I/O Layer** — TypeScript classes that wrap WASM exports and add network I/O via `fetch()` and WebSocket. `LbryWalletManager` manages wallet handles, `TransactionBuilder` builds and signs txs, `MempoolClient` fetches blockchain data.

3. **Blockchain Data Layer** — REST API at `mempool.lbry.org` (Electrum-like JSON-RPC + esplora-style endpoints) for blocks, transactions, UTXOs, fees, and broadcasting. WebSocket support for real-time address/tx tracking.

## Quick Start

### Setup

```sh
npm install @lumeweb/lbry-sdk
```

In your app, serve `lbry-sdk.wasm` and `wasm_exec.js` alongside your bundle. The SDK resolves them relative to the module URL.

### 1. Create a New Wallet

```typescript
import { WasmLoader, LbryWalletManager } from "@lumeweb/lbry-sdk";

// Load WASM (singleton, cached after first call)
const wasm = await WasmLoader.load();

// Create a wallet manager
const wallet = new LbryWalletManager(wasm);

// Generate a new wallet (12-word Electrum mnemonic + LBRY address)
const { handle, mnemonic, address } = wallet.create();
console.log("Mnemonic:", mnemonic);   // "will bus cluster trumpet jump venue truly habit decrease stuff renew horse"
console.log("Address:", address);      // "bN4cN5a6oK..."

// IMPORTANT: Always release wallet handles when done
wallet.close(handle);
```

### 2. Import an Existing Wallet from Mnemonic

```typescript
import { WasmLoader, LbryWalletManager } from "@lumeweb/lbry-sdk";

const wasm = await WasmLoader.load();
const wallet = new LbryWalletManager(wasm);

const mnemonic = "will bus cluster trumpet jump venue truly habit decrease stuff renew horse";
const { handle, address } = wallet.fromMnemonic(mnemonic);
console.log("Imported address:", address); // "bN4cN5a6oK..."

// Close when done
wallet.close(handle);
```

### 3. Derive Addresses at Different Indices

```typescript
const { handle } = wallet.fromMnemonic(mnemonic);

// BIP44 paths: m/44'/140'/0'/chain/index
// chain=0 = external (receiving), chain=1 = internal (change)

// Primary address (chain 0, index 0)
const addr0 = wallet.address(handle);             // same as addressAt(handle, 0, 0)

// Second receiving address (chain 0, index 1)
const addr1 = wallet.addressAt(handle, 0, 1);

// First change address (chain 1, index 0)
const changeAddr = wallet.addressAt(handle, 1, 0);

console.log("Receiving #0:", addr0);
console.log("Receiving #1:", addr1);
console.log("Change #0:", changeAddr);
```

### 4. Check Balance via Mempool API

```typescript
import { MempoolClient } from "@lumeweb/lbry-sdk";

const mempool = new MempoolClient({ baseUrl: "https://mempool.lbry.org" });

// Get balance for a single address
const utxos = await mempool.getAddressUtxos("bN4cN5a6oK...");
const balance = utxos.reduce((sum, u) => sum + u.value, 0);
console.log(`Balance: ${balance} sats (${balance / 1e8} LBC)`);

// Get current fee rates
const fees = await mempool.getFees();
console.log("Economy fee:", fees.economyFee, "sat/vB");
console.log("Fastest fee:", fees.fastestFee, "sat/vB");

// Get current block height
const height = await mempool.getTipHeight();
```

### 5. Fetch UTXOs and Build a Transaction

```typescript
import {
  WasmLoader, LbryWalletManager, TransactionBuilder, MempoolClient,
  validateAddress, validateFeeRate, validateAmount
} from "@lumeweb/lbry-sdk";
import type { TxInput, TxOutput, UTXO } from "@lumeweb/lbry-sdk";

const wasm = await WasmLoader.load();
const wallet = new LbryWalletManager(wasm);
const txBuilder = new TransactionBuilder(wasm);
const mempool = new MempoolClient();

const { handle } = wallet.fromMnemonic(mnemonic);
const senderAddr = wallet.address(handle);

// Fetch UTXOs for the sender address
const rawUtxos = await mempool.getAddressUtxos(senderAddr);
// Pick the largest UTXO (or implement coin selection)
const selected = rawUtxos.sort((a, b) => b.value - a.value)[0];

// Get the scriptPubKey for the address that holds this UTXO
// (You need the chain/index that corresponds to each UTXO's address)
const { scriptPubKey } = wasm.exports.walletPubKeyScriptAt(handle, 0, 0);

// Create a TxInput matching the selected UTXO
const inputs: TxInput[] = [{
  txid: selected.txid,
  vout: selected.vout,
  amount: selected.value,
  scriptPubKey,
  chain: 0,          // HD chain (0=external)
  index: 0,          // HD address index
}];

// Create an output sending to a destination
const outputs: TxOutput[] = [{
  address: "bN4cN5a6oK...",  // destination address
  amount: selected.value - 500, // amount minus fee (rough estimate)
}];

// Estimate fee and build the transaction
const fees = await mempool.getFees();
const signed = txBuilder.build(handle, inputs, outputs, { feePerByte: fees.economyFee });

console.log("Signed TX hex:", signed.hex);
console.log("TXID:", signed.txid);
console.log("Fee:", signed.fee, "sats");
```

### 6. Broadcast a Transaction

```typescript
const txid = await mempool.broadcastTx(signed.hex);
console.log("Broadcast:", txid);

// Poll for confirmation (every 30s, check up to 10 minutes)
const maxWait = 10 * 60 * 1000;
const start = Date.now();
let confirmed = false;

while (Date.now() - start < maxWait) {
  await new Promise(r => setTimeout(r, 30_000));
  const tx = await mempool.getTx(txid);
  if (tx.status.confirmed) {
    confirmed = true;
    console.log(`Confirmed at block ${tx.status.block_height}`);
    break;
  }
}

if (!confirmed) console.log("Transaction not yet confirmed");
```

### Complete Self-Send Example

See the full live test at `tests/live-self-send.test.ts` for a complete self-send workflow:
1. Import wallet from mnemonic
2. Scan known addresses for UTXOs
3. Pick UTXO large enough to cover dust (546 sats) + fee + change
4. Fetch fee rate from mempool API
5. Build/sign transaction with `TransactionBuilder.build()`
6. Reconcile change output amount after fee calculation
7. Broadcast via `mempool.broadcastTx()`
8. Poll for confirmation

## API Reference

### WasmLoader

Loads and manages the TinyGo WASM module. Singleton — one instance per page load.

```typescript
class WasmLoader {
  static async load(opts?: WasmLoaderOptions): Promise<WasmInstance>;
  static unload(): void;
}

interface WasmLoaderOptions {
  wasmUrl?: string;       // URL for lbry-sdk.wasm (default: auto-resolved relative to module)
  wasmExecUrl?: string;   // URL for wasm_exec.js (default: auto-resolved relative to module)
  integrity?: {
    wasmExec?: string;    // SRI hash for wasm_exec.js
    wasm?: string;        // SRI hash for WASM binary
  };
}

interface WasmInstance {
  exports: WasmExports;   // All Go functions registered as globalThis.__lbrySDK__
  go: unknown;            // Go runtime instance (internal)
}
```

**Important:** Only URLs that are same-origin, relative, or `localhost:8080` are accepted. Attacker-controlled origins are refused.

#### WASM Exports (globalThis.__lbrySDK__)

All functions return an object with either data fields or an `error` string.

| Function | Parameters | Returns | Description |
|---|---|---|---|
| `makeSeed()` | none | `{ mnemonic, error }` | Generate 12-word BIP39 mnemonic |
| `walletFromMnemonic(mnemonic)` | `string` | `{ handle, error }` | Create wallet handle from mnemonic |
| `walletFromSeed(seedHex)` | `string` | `{ handle, address, error }` | Create wallet handle from raw hex seed (64 chars) |
| `walletAddress(handle)` | `number` | `{ address, error }` | Get primary address (m/0/0) |
| `walletAddressAt(handle, chain, index)` | `number, number, number` | `{ address, error }` | Get address at BIP44 path |
| `walletPublicKeyHex(handle)` | `number` | `{ publicKey, error }` | 33-byte compressed public key (66 hex chars) |
| `walletPrivateKeyHex(handle)` | `number` | `{ privateKey, error }` | 32-byte private key (64 hex chars) — use with caution |
| `walletMnemonic(handle)` | `number` | `{ mnemonic, error }` | Get mnemonic from handle |
| `walletPubKeyScriptAt(handle, chain, index)` | `number, number, number` | `{ scriptPubKey, error }` | P2PKH scriptPubKey hex (50 hex chars) |
| `walletClose(handle)` | `number` | `{ closed, error }` | Release wallet handle, clear keys from WASM memory |
| `buildTx(handle, inputs, outputs)` | `number, string, string` | `{ txhex, txid, error }` | Build + sign transaction. inputs/outputs are JSON strings |
| `estimateTxSize(numInputs, numOutputs)` | `number, number` | `{ size, error }` | Estimate transaction size in bytes |
| `estimateFee(size, feePerByte)` | `number, number` | `{ fee, error }` | Estimate fee = size * feePerByte |
| `claimIDFromTxVout(txid, vout)` | `string, number` | `{ claimIDHex, error }` | Compute claim ID from txid + vout |
| `createChannelClaim(name, pubkeyHex)` | `string, string` | `{ valueHex, error }` | Create channel claim protobuf |
| `createStreamClaim(title, description, sdHash, contentType, thumbnailUrl)` | `string, string, string, string, string` | `{ valueHex, error }` | Create stream claim protobuf |
| `createCollectionClaim(title, memberClaimIds)` | `string, string[]` | `{ valueHex, error }` | Create collection claim protobuf |
| `createRepostClaim(title, claimId)` | `string, string` | `{ valueHex, error }` | Create repost claim protobuf |
| `parseClaimValue(valueHex)` | `string` | `{ claimType, error }` | Parse a serialized claim value |
| `compileClaimValue(valueHex)` | `string` | `{ valueHex, error }` | Compile/serialize a claim value |
| `signTxWithHandle(handle, txJson)` | `number, string` | `{ signedHex, error }` | Sign arbitrary hex tx (low-level) |

### LbryWalletManager

High-level wallet management. Wraps WASM exports for convenience.

```typescript
class LbryWalletManager {
  constructor(wasm: { exports: WasmExports });

  create(): CreatedWallet;
  fromMnemonic(mnemonic: string): ImportedWallet;
  address(handle: WalletHandle): string;
  addressAt(handle: WalletHandle, chain: number, index: number): string;
  publicKeyHex(handle: WalletHandle): string;
  privateKeyHex(handle: WalletHandle): string; // use with caution
  mnemonic(handle: WalletHandle): string;
  close(handle: WalletHandle): boolean;

  static readonly DEFAULT_GAP_LIMIT = 20;
}
```

#### Types

```typescript
type WalletHandle = number;  // Opaque integer referencing a Go-WASM wallet

interface CreatedWallet {
  handle: WalletHandle;
  mnemonic: string;
  address: string;   // Derived primary address (chain 0, index 0)
}

interface ImportedWallet {
  handle: WalletHandle;
  mnemonic: string;
  address: string;
}
```

### TransactionBuilder

Builds and signs LBRY transactions. Private keys stay in WASM — JS only provides UTXOs and outputs.

```typescript
class TransactionBuilder {
  constructor(wasm: { exports: WasmExports });

  build(handle: WalletHandle, inputs: TxInput[], outputs: TxOutput[], opts: BuildTxOptions): SignedTx;
  estimateSize(numInputs: number, numOutputs: number): number;
  estimateFee(size: number, feePerByte: number): number;
  claimIDFromTxVout(txid: string, vout: number): string;
}
```

#### Types

```typescript
interface TxInput {
  txid: string;         // Transaction ID (64 hex chars)
  vout: number;          // Output index
  amount: number;        // Amount in satoshis
  scriptPubKey: string;  // P2PKH scriptPubKey hex (from walletPubKeyScriptAt)
  chain: number;         // HD chain (0=external, 1=internal/change)
  index: number;         // HD address index within chain
}

interface TxOutput {
  address: string;       // Destination LBRY address
  amount: number;        // Amount in satoshis
  isClaim?: boolean;     // Whether this output creates a claim
  claimName?: string;    // Claim name (required if isClaim)
  claimValueHex?: string; // Serialized claim value hex (required if isClaim)
  claimIDHex?: string;   // Claim ID for update/support (optional)
  claimType?: number;    // Claim type enum (optional)
}

interface SignedTx {
  hex: string;    // Signed raw transaction hex
  txid: string;   // Transaction ID (64 hex chars)
  size: number;   // Transaction size in bytes
  fee: number;    // Calculated fee in satoshis
}

interface BuildTxOptions {
  feePerByte: number;   // Fee rate in sat/vB (validated against FEE_FLOOR..FEE_CEILING)
}
```

**Important:** `TransactionBuilder.build()` does NOT perform coin selection or change calculation — it signs the exact inputs/outputs provided. You must pre-select UTXOs and compute outputs (including change) in JS.

### MempoolClient

REST API client for `mempool.lbry.org`. All network I/O via `fetch()`.

```typescript
class MempoolClient {
  constructor(opts?: MempoolClientOptions);

  // Blockchain info
  getTipHeight(): Promise<number>;
  getTipHash(): Promise<string>;
  getBlock(hash: string): Promise<Block>;
  getBlocks(startHeight: number): Promise<Block[]>;  // Returns up to 15 blocks

  // Transactions
  getTx(txid: string): Promise<Transaction>;
  broadcastTx(rawHex: string): Promise<string>;  // Returns txid

  // Address data
  getAddressUtxos(addr: string): Promise<UTXO[]>;
  getAddressTxs(addr: string): Promise<AddressTxs[]>;

  // Fee estimation
  getFees(): Promise<FeeRates>;
  getMempoolState(): Promise<MempoolState>;
}

interface MempoolClientOptions {
  baseUrl?: string;       // Default: "https://mempool.lbry.org"
  fetch?: typeof fetch;   // Optional custom fetch (for testing)
}
```

#### UTXO Type (Mempool API)

```typescript
interface UTXO {
  txid: string;
  vout: number;
  status: {
    confirmed: boolean;
    block_height?: number;
  };
  value: number;  // Amount in satoshis
}
```

#### Helper: Convert Mempool UTXOs to WASM Input Format

```typescript
import { toUTXOInputs } from "@lumeweb/lbry-sdk";

// Not directly usable as TxInput — needs scriptPubKey, chain, index filled in
const utxoInputs = toUTXOInputs(mempoolUtxos);
```

#### FeeRates Type

```typescript
interface FeeRates {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
}
```

### MempoolWebSocket

Real-time WebSocket client for mempool.lbry.org events. Uses `websocket-ts` for auto-reconnect with exponential backoff and message buffering.

```typescript
class MempoolWebSocket {
  constructor(opts?: MempoolWebSocketOptions);

  connect(): Promise<void>;
  disconnect(): void;
  on(type: string, handler: (msg: WebSocketMessage) => void): () => void;
  trackAddress(address: string): void;
  trackAddresses(addresses: string[]): void;
  trackTx(txid: string): void;
  want(data: string[]): void;
}
```

Event types: `"address-tx"`, `"tx-status"`, `"stats"`, `"*"` (wildcard). Returns an unsubscribe function from `on()`.

### Guardrails / Validation

Synchronous validation functions for addresses, amounts, fee rates, and transaction review.

```typescript
import { validateAddress, validateAmount, validateFeeRate, buildReview } from "@lumeweb/lbry-sdk";

// Check LBRY address format (b-prefixed, base58check, version byte 0x55)
validateAddress("bN4cN5a6oK...");  // true | false

// Check amount ≥ dust threshold (546 sats)
validateAmount(1000);              // true
validateAmount(100);               // false (below dust)

// Check fee rate in valid range (1-1000 sat/vB)
validateFeeRate(5);                // true
validateFeeRate(0);                // false
validateFeeRate(2000);             // false

// Review a signed transaction for issues
const review = buildReview(signedTx);
console.log(review.valid);         // boolean
console.log(review.warnings);      // Array<{ field, message, severity }>
```

#### Constants

| Constant | Value | Description |
|---|---|---|
| `DUST_THRESHOLD` | 546 | Minimum output amount in satoshis |
| `FEE_FLOOR` | 1 | Minimum fee rate in sat/vB |
| `FEE_CEILING` | 1000 | Maximum fee rate in sat/vB |

#### ReviewResult

```typescript
interface ReviewWarning {
  field: string;
  message: string;
  severity: "error" | "warning";
}

interface ReviewResult {
  warnings: ReviewWarning[];
  valid: boolean;  // true if no errors (warnings OK)
}
```

## Security Model

### Private Keys Stay in WASM

- Mnemonic and derived private keys are stored **only in WASM memory** (Go heap).
- JS receives **opaque integer handles** (not keys). Handles reference internal Go wallet objects.
- The `privateKeyHex()` method exists for migration/export scenarios but should not be used in normal operation.
- Calling `walletClose(handle)` clears the key material from WASM memory.
- WASM binary URL and wasm_exec.js URL are validated against an allowlist (same-origin or localhost:8080) to prevent loading attacker-controlled binaries.

### Mempool API Security

- The mempool base URL is validated against an allowlist (`https://mempool.lbry.org` or `http://localhost:8999`).
- WebSocket origins are similarly restricted (`wss://mempool.lbry.org`, `ws://localhost:8999`).

## Common Patterns

### Self-Send (Minimum Amount)

Send dust (546 sats) back to the same wallet with change:

```typescript
const senderAddr = wallet.addressAt(handle, chain, index);
const totalValue = selectedUtxo.value;

// Goal: send DUST_THRESHOLD to self, change back to self, pay fee
const outputs: TxOutput[] = [
  { address: senderAddr, amount: DUST_THRESHOLD },
  { address: senderAddr, amount: totalValue - DUST_THRESHOLD }, // placeholder
];

// Build to get actual fee
const signed = txBuilder.build(handle, inputs, outputs, { feePerByte: feeRate });

// Reconcile change amount
const changeAmount = totalValue - DUST_THRESHOLD - signed.fee;
outputs[1].amount = changeAmount;

// Rebuild with corrected change
const finalSigned = txBuilder.build(handle, inputs, outputs, { feePerByte: feeRate });
const txid = await mempool.broadcastTx(finalSigned.hex);
```

### Consolidation (Sweep Multiple UTXOs into One)

Collect all UTXOs into a single output:

```typescript
const allUtxos: { utxo: UTXO; chain: number; index: number }[] = [];

for (const addrInfo of ADDRESSES_TO_SCAN) {
  const addr = wallet.addressAt(handle, addrInfo.chain, addrInfo.index);
  const utxos = await mempool.getAddressUtxos(addr);
  for (const utxo of utxos) {
    allUtxos.push({ utxo, chain: addrInfo.chain, index: addrInfo.index });
  }
}

const totalValue = allUtxos.reduce((s, u) => s + u.utxo.value, 0);

const inputs: TxInput[] = allUtxos.map(({ utxo, chain, index }) => {
  const { scriptPubKey } = wasm.exports.walletPubKeyScriptAt(handle, chain, index);
  return {
    txid: utxo.txid, vout: utxo.vout, amount: utxo.value,
    scriptPubKey, chain, index,
  };
});

// Estimate fee first
const estSize = txBuilder.estimateSize(inputs.length, 1);
const estimatedFee = txBuilder.estimateFee(estSize, feeRate);
let outputAmount = totalValue - estimatedFee;

// Build and reconcile
const outputs: TxOutput[] = [{ address: wallet.addressAt(handle, 0, 0), amount: outputAmount }];
const signed = txBuilder.build(handle, inputs, outputs, { feePerByte: feeRate });
outputAmount = totalValue - signed.fee;
outputs[0].amount = outputAmount;

const finalSigned = txBuilder.build(handle, inputs, outputs, { feePerByte: feeRate });
const txid = await mempool.broadcastTx(finalSigned.hex);
```

### Multi-Input Transaction

Just add multiple entries to the `inputs` array. Each needs its own `scriptPubKey`, `chain`, and `index` matching the address that holds that UTXO.

```typescript
const inputs: TxInput[] = [
  {
    txid: "txid1...", vout: 0, amount: 100000000,
    scriptPubKey: "76a914...88ac", chain: 0, index: 0,
  },
  {
    txid: "txid2...", vout: 1, amount: 50000000,
    scriptPubKey: "76a914...88ac", chain: 0, index: 1,
  },
];
```

### Estimating Fee Before Building

```typescript
const estSize = txBuilder.estimateSize(inputs.length, outputs.length);
const estFee = txBuilder.estimateFee(estSize, feePerByte);
```

## Important Constraints

### TinyGo wasm_exec.js Loading

- `wasm_exec.js` from the Go standard library **must** be served alongside `lbry-sdk.wasm`. It defines the global `Go` class used to instantiate the WASM module.
- The SDK auto-resolves URLs relative to the module's location. Override with `wasmUrl` / `wasmExecUrl` options.
- In non-DOM environments (Web Workers, Node.js), it falls back to `fetch` + `eval` to load wasm_exec.js.
- The WASM module uses TinyGo's asyncify scheduler — all exported functions are **synchronous** (they yield internally to the JS event loop during blocking operations).

### Browser-Only Constraints

- The SDK is designed for browser environments. While it works in Web Workers and Node.js, the primary target is browsers with WebAssembly support.
- `fetch()` for mempool API calls uses the browser's global `fetch` bound to `globalThis` to avoid "Illegal invocation" errors.
- IndexedDB storage (`WalletStore`) is browser-only.

### Address Validation Rules

| Rule | Detail |
|---|---|
| Prefix | Must start with `b` (LBRY mainnet) |
| Alphabet | Base58: `1-9A-HJ-NP-Za-km-z` (no 0/O/I/l) |
| Length | 26-40 characters (regex: `/^b[1-9A-HJ-NP-Za-km-z]{25,39}$/`) |
| Version byte | `0x55` (LBRY P2PKH) |
| Checksum | Double-SHA256, last 4 bytes |
| Payload | Version byte + 20-byte hash = 21 bytes after decode |

### Fee Policy

- Fee floor: **1 sat/vB** (transactions below this are invalid)
- Fee ceiling: **1000 sat/vB** (protects against fee spikes)
- Dust threshold: **546 satoshis** (outputs below this are uneconomical)

### Handle Lifecycle

- Wallet handles **must be closed** with `wallet.close(handle)` when no longer needed. Failure to close leaks keys in WASM memory.
- Handles are integers referencing internal Go wallet objects. They are only valid until `walletClose` is called.
- Always use `try/finally` to ensure cleanup:

```typescript
const { handle } = wallet.fromMnemonic(mnemonic);
try {
  // ... use wallet ...
} finally {
  wallet.close(handle);
}
```

### WASM Instance Lifecycle

- `WasmLoader.load()` returns a singleton — subsequent calls return the same cached instance.
- Call `WasmLoader.unload()` to tear down the WASM module (clears `globalThis.__lbrySDK__`).
- The `globalThis.__lbrySDK__` object has a `ready` property that is set to `true` once initialization is complete.

### Cross-Origin Restrictions

- WASM and wasm_exec.js URLs must be same-origin, relative, or `localhost:8080`.
- Mempool API base URL must be `https://mempool.lbry.org` or `http://localhost:8999`.
- WebSocket URL must be `wss://mempool.lbry.org` or `ws://localhost:8999`.
- These restrictions prevent SSRF and loading attacker-controlled binaries.

### Claim Operations

Claim operations (`createChannelClaim`, `createStreamClaim`, `createCollectionClaim`, `createRepostClaim`) produce serialized protobuf value hex that gets included in a transaction output with `isClaim: true`. They do NOT create or sign the transaction itself — you must still call `TransactionBuilder.build()` with the output.

### Testing

Tests use a mock WASM module (`tests/mock-wasm.ts`) injected via `globalThis.__lbrySDK__` and MSW for mocking mempool API calls. The test fixture mnemonic is deterministic:

```
will bus cluster trumpet jump venue truly habit decrease stuff renew horse
```

Live tests (`tests/live-self-send.test.ts`) require `LBRY_TEST_MNEMONIC` env var and connect to the real mempool.lbry.org.

## Exports (index.ts)

```
src/wasm/          → WasmLoader, WasmInstance, WasmExports
src/wallet/        → LbryWalletManager, WalletHandle, CreatedWallet, ImportedWallet
src/tx/            → TransactionBuilder, TxInput, TxOutput, SignedTx, BuildTxOptions, FeeEstimator
src/mempool/       → MempoolClient, MempoolWebSocket, MempoolClientOptions, UTXO, Block, Transaction, FeeRates, MempoolState
src/guardrails/    → validateAddress, validateAmount, validateFeeRate, buildReview, ReviewResult, ReviewWarning, DUST_THRESHOLD, FEE_FLOOR, FEE_CEILING
src/claims/        → ClaimsAPI, ChannelClaim, StreamClaim, CollectionClaim, RepostClaim, SupportClaim
src/storage/       → WalletStore, StoredWallet, encryptData, decryptData
```

## Source Map

| File | Description |
|---|---|
| `src/wasm/loader.ts` | WASM lifecycle (load, cache, unload), URL validation |
| `src/wasm/types.ts` | WasmInstance interface, re-exports generated types |
| `src/wallet/manager.ts` | LbryWalletManager class |
| `src/wallet/types.ts` | WalletHandle, CreatedWallet, ImportedWallet |
| `src/tx/builder.ts` | TransactionBuilder class |
| `src/tx/types.ts` | TxInput, TxOutput, SignedTx, BuildTxOptions |
| `src/tx/fees.ts` | FeeEstimator (pure TS, no WASM needed) |
| `src/mempool/client.ts` | MempoolClient REST API |
| `src/mempool/types.ts` | Block, Transaction, UTXO, FeeRates, WebSocket types |
| `src/mempool/websocket.ts` | MempoolWebSocket real-time client |
| `src/guardrails/validate.ts` | Address/amount/fee validation, transaction review |
| `src/claims/api.ts` | Claims API client |
| `src/claims/types.ts` | Claim type definitions |
| `src/storage/store.ts` | IndexedDB wallet store |
| `src/storage/crypto.ts` | Encryption/decryption for stored wallets |
| `tests/wallet.test.ts` | WASM wallet tests (mnemonic, derivation, determinism) |
| `tests/transaction-claims.test.ts` | Tx building and claim serialization tests |
| `tests/mempool.test.ts` | Mempool REST + WebSocket tests |
| `tests/live-self-send.test.ts` | End-to-end live self-send + consolidation |
