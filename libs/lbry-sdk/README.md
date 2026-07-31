# @lumeweb/lbry-sdk

**Browser-native LBRY wallet SDK** — cryptographic wallet operations, transaction building, LBRY claims, and blockchain data access, all in the browser via TinyGo WebAssembly.

Private keys never leave WASM memory. Blockchain data flows through `mempool.lbry.org` (REST + WebSocket). All crypto operations (BIP39/BIP32/BIP44 key derivation, ECDSA signing, transaction construction, LBRY claim serialization) happen in a TinyGo-compiled WASM module.

> **Browser-only.** This SDK is designed for the browser environment where WebAssembly, `fetch()`, and `IndexedDB` are available. It is not intended for Node.js backend use.

---

## Features

- **🔐 Key management** — BIP39 mnemonic generation, BIP32/BIP44 HD wallet derivation, LBRY addresses (version byte `0x55`, base58check)
- **💰 Transaction building & signing** — Build P2PKH transactions with ECDSA signing inside WASM. Fee estimation, multi-input support.
- **📡 Blockchain data** — Query blocks, transactions, UTXOs, and fee rates via the mempool.lbry.org REST API
- **⚡ Real-time updates** — WebSocket client for address/tx tracking with auto-reconnect (exponential backoff, 10-retry cap)
- **📦 LBRY claims** — Create and sign channel, stream, collection, and repost claims (protobuf serialization via WASM)
- **💾 Encrypted storage** — Persist wallet mnemonics in IndexedDB, encrypted with AES-256-GCM + PBKDF2 via WebCrypto
- **🛡️ Guardrails** — Built-in address validation (base58check, version byte), amount dust check (546 sats), fee rate bounds (1–1000 sat/vB), and transaction review before broadcast
- **🧪 Testability** — Mock WASM module and MSW handlers for deterministic browser tests; live test suite against real mempool.lbry.org

---

## Installation

```sh
pnpm add @lumeweb/lbry-sdk
```

Or as a workspace dependency in the LumeWeb monorepo:

```json
// package.json (in your app or package)
{
  "dependencies": {
    "@lumeweb/lbry-sdk": "workspace:*"
  }
}
```

---

## Quick Start

### 0. Serve WASM Assets

The SDK loads two assets at runtime — `lbry-sdk.wasm` (~2.8 MB) and `wasm_exec.js` — that must be served alongside your bundle. The SDK resolves them relative to the module URL by default; you can override with `wasmUrl` / `wasmExecUrl` options.

### 1. Load WASM & Create a Wallet

```typescript
import { WasmLoader, LbryWalletManager } from "@lumeweb/lbry-sdk";

// Load the WASM module (singleton — subsequent calls return cached instance)
const wasm = await WasmLoader.load();

// Create a wallet manager
const wallet = new LbryWalletManager(wasm);

// Generate a new wallet (12-word BIP39 mnemonic + LBRY address)
const { handle, mnemonic, address } = wallet.create();
console.log("Mnemonic:", mnemonic);
// e.g. "will bus cluster trumpet jump venue truly habit decrease stuff renew horse"
console.log("Address:", address);
// e.g. "bN4cN5a6oK..."

// Always release wallet handles when done
wallet.close(handle);
```

### 2. Import an Existing Wallet from Mnemonic

```typescript
const wasm = await WasmLoader.load();
const wallet = new LbryWalletManager(wasm);

const mnemonic = "will bus cluster trumpet jump venue truly habit decrease stuff renew horse";
const { handle, address } = wallet.fromMnemonic(mnemonic);
console.log("Imported address:", address);

wallet.close(handle);
```

### 3. Derive Addresses at Different Indices

```typescript
const { handle } = wallet.fromMnemonic(mnemonic);

// BIP44 paths: m/44'/140'/0'/chain/index
// chain=0 = external (receiving), chain=1 = internal (change)

// Primary address (chain 0, index 0)
const addr0 = wallet.address(handle);

// Second receiving address (chain 0, index 1)
const addr1 = wallet.addressAt(handle, 0, 1);

// First change address (chain 1, index 0)
const changeAddr = wallet.addressAt(handle, 1, 0);

console.log("Receiving #0:", addr0);
console.log("Receiving #1:", addr1);
console.log("Change #0:", changeAddr);
```

### 4. Fetch UTXOs & Build a Transaction

```typescript
import {
  WasmLoader, LbryWalletManager, TransactionBuilder, MempoolClient,
  validateAddress, validateFeeRate, buildReview,
} from "@lumeweb/lbry-sdk";
import type { TxInput, TxOutput } from "@lumeweb/lbry-sdk";

const wasm = await WasmLoader.load();
const wallet = new LbryWalletManager(wasm);
const txBuilder = new TransactionBuilder(wasm);
const mempool = new MempoolClient();

const { handle } = wallet.fromMnemonic(mnemonic);
const senderAddr = wallet.address(handle);

// 1. Fetch UTXOs for the sender address
const rawUtxos = await mempool.getAddressUtxos(senderAddr);
const selected = rawUtxos.sort((a, b) => b.value - a.value)[0];

// 2. Get the scriptPubKey for the address that holds this UTXO
const { scriptPubKey } = wasm.exports.walletPubKeyScriptAt(handle, 0, 0);

// 3. Define inputs (the UTXO being spent) and outputs (where to send)
const inputs: TxInput[] = [{
  txid: selected.txid,
  vout: selected.vout,
  amount: selected.value,
  scriptPubKey,
  chain: 0,
  index: 0,
}];

const outputs: TxOutput[] = [{
  address: "bN4cN5a6oK...", // destination
  amount: selected.value - 500, // rough estimate minus fee
}];

// 4. Get fee rate and build the transaction
const fees = await mempool.getFees();
const signed = txBuilder.build(handle, inputs, outputs, { feePerByte: fees.economyFee });
console.log("Signed TX hex:", signed.hex);
console.log("TXID:", signed.txid);
console.log("Fee:", signed.fee, "sats");
```

### 5. Broadcast

```typescript
const txid = await mempool.broadcastTx(signed.hex);
console.log("Broadcast:", txid);

// Poll for confirmation (every 30s, timeout 10 minutes)
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
```

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  JS Layer (TypeScript)               │
│                                                      │
│  LbryWalletManager   TransactionBuilder              │
│  MempoolClient       MempoolWebSocket                │
│  Guardrails (validate*, buildReview)                │
│  ClaimsAPI           WalletStore (IndexedDB)         │
│                                                      │
├─────────────────┬───────────────────────────────────┤
│  fetch() / WS   │  WASM Bridge (sync calls via       │
│  (network I/O)  │  globalThis.__lbrySDK__)           │
└─────────────────┴───────────────────────────────────┘
        │                        │
        ▼                        ▼
 mempool.lbry.org          TinyGo WASM (lbry-sdk.wasm)
 REST + WebSocket          ┌──────────────────────────┐
                           │ BIP39 → BIP32/BIP44      │
                           │ HD Key Derivation        │
                           │ ECDSA (secp256k1) Signing │
                           │ P2PKH Tx Building        │
                           │ LBRY Claim Serialization │
                           │ Coin Selection           │
                           └──────────────────────────┘
```

### Three Layers

1. **WASM Crypto Layer** — TinyGo-compiled Go (`wasm/go/`) that exposes all cryptographic operations via `globalThis.__lbrySDK__`. All exported functions appear synchronous (TinyGo's asyncify scheduler handles yielding internally). Covers BIP39 mnemonic generation, BIP32/BIP44 hierarchical deterministic key derivation (slip-44 coin type `140` for LBRY), ECDSA signing over secp256k1, transaction serialization/deserialization, and LBRY claim protobuf encoding.

2. **JS I/O Layer** — TypeScript classes that wrap WASM exports and add network I/O via `fetch()` and WebSocket:
   - `LbryWalletManager` manages wallet handles (create, import, derive addresses, close)
   - `TransactionBuilder` builds and signs transactions (passes UTXOs + outputs to WASM, gets signed hex back)
   - `MempoolClient` / `MempoolWebSocket` communicate with the blockchain data API
   - `WalletStore` persists encrypted mnemonics to IndexedDB
   - `Guardrails` validate addresses, amounts, fee rates, and review pending transactions

3. **Blockchain Data Layer** — REST API at `mempool.lbry.org` (Electrum-like JSON-RPC + esplora-style endpoints) for blocks, transactions, UTXOs, fee rates, and transaction broadcasting. WebSocket support for real-time address/tx tracking and mempool stats.

---

## API Reference

### Package Exports (`@lumeweb/lbry-sdk`)

The package exposes several entrypoints via [package.json exports](https://nodejs.org/api/packages.html#exports):

| Import path           | Exports                                                           |
|-----------------------|-------------------------------------------------------------------|
| `@lumeweb/lbry-sdk`           | All public types and classes from every module           |
| `@lumeweb/lbry-sdk/wasm`      | `WasmLoader`, `WasmInstance`, `WasmExports`, `WasmLoaderOptions` |
| `@lumeweb/lbry-sdk/wallet`    | `LbryWalletManager`, `WalletHandle`, `CreatedWallet`, `ImportedWallet`, `AddressInfo`, `AddressManagerOptions` |
| `@lumeweb/lbry-sdk/tx`        | `TransactionBuilder`, `TransactionBroadcaster`, `FeeEstimator`, `TxInput`, `TxOutput`, `SignedTx`, `BuildTxOptions`, `FeeEstimate`, `FeeRateType`, `BroadcastResult`, `BroadcasterOptions` |
| `@lumeweb/lbry-sdk/mempool`   | `MempoolClient`, `MempoolWebSocket`, `MempoolClientOptions`, `MempoolWebSocketOptions`, `Block`, `Transaction`, `UTXO`, `AddressTxs`, `FeeRates`, `MempoolState`, `WebSocketMessage*`, `toUTXOInputs` |
| `@lumeweb/lbry-sdk/claims`    | `ClaimsAPI`, `ChannelClaim`, `StreamClaim`, `CollectionClaim`, `RepostClaim`, `SupportClaim`, `ClaimResult`, `ParsedClaim` |
| `@lumeweb/lbry-sdk/storage`   | `WalletStore`, `StoredWallet`, `WalletStoreOptions`, `EncryptedPayload`, `encryptData`, `decryptData` |
| `@lumeweb/lbry-sdk/guardrails`| `validateAddress`, `validateAmount`, `validateFeeRate`, `buildReview`, `ReviewResult`, `ReviewWarning`, `DUST_THRESHOLD`, `FEE_FLOOR`, `FEE_CEILING` |

### WasmLoader

Loads and manages the TinyGo WASM module. Singleton — one instance per page load.

```typescript
class WasmLoader {
  static async load(opts?: WasmLoaderOptions): Promise<WasmInstance>;
  static unload(): void;
}

interface WasmLoaderOptions {
  wasmUrl?: string;       // URL for lbry-sdk.wasm (default: auto-resolved)
  wasmExecUrl?: string;   // URL for wasm_exec.js (default: auto-resolved)
  integrity?: {
    wasmExec?: string;    // SRI hash for wasm_exec.js
    wasm?: string;        // SRI hash for WASM binary
  };
}

interface WasmInstance {
  exports: WasmExports;
  go: unknown;            // Go runtime instance (internal)
}
```

**URL Security:** Only same-origin, relative, or `localhost:8080` URLs are accepted for both the WASM binary and `wasm_exec.js`. Attacker-controlled origins are refused.

### LbryWalletManager

High-level wallet management. Wraps WASM exports with error handling and auto-cleanup on failure.

```typescript
class LbryWalletManager {
  constructor(wasm: { exports: WasmExports });

  create(): CreatedWallet;                    // Generate new wallet
  fromMnemonic(mnemonic: string): ImportedWallet;  // Import existing
  address(handle: WalletHandle): string;      // Primary address (m/0/0)
  addressAt(handle: WalletHandle, chain: number, index: number): string;
  publicKeyHex(handle: WalletHandle): string;  // 33-byte compressed (66 hex chars)
  privateKeyHex(handle: WalletHandle): string; // 32-byte (64 hex chars) — use sparingly
  mnemonic(handle: WalletHandle): string;
  close(handle: WalletHandle): boolean;

  static readonly DEFAULT_GAP_LIMIT = 20;
}

type WalletHandle = number;  // Opaque integer → Go-WASM wallet in memory

interface CreatedWallet {
  handle: WalletHandle;
  mnemonic: string;   // 12-word BIP39 mnemonic
  address: string;    // Derived primary LBRY address
}

interface ImportedWallet {
  handle: WalletHandle;
  mnemonic: string;
  address: string;
}
```

### TransactionBuilder

Builds and signs LBRY P2PKH transactions. Private keys stay in WASM — JS only provides UTXOs and outputs.

```typescript
class TransactionBuilder {
  constructor(wasm: { exports: WasmExports });

  build(handle: WalletHandle, inputs: TxInput[], outputs: TxOutput[], opts: BuildTxOptions): SignedTx;
  estimateSize(numInputs: number, numOutputs: number): number;
  estimateFee(size: number, feePerByte: number): number;
  claimIDFromTxVout(txid: string, vout: number): string;
}

interface TxInput {
  txid: string;          // Transaction ID (64 hex chars)
  vout: number;          // Output index
  amount: number;        // Amount in satoshis
  scriptPubKey: string;  // P2PKH scriptPubKey (50 hex chars, from walletPubKeyScriptAt)
  chain: number;         // HD chain (0=external, 1=internal/change)
  index: number;         // HD address index
}

interface TxOutput {
  address: string;       // Destination LBRY address
  amount: number;        // Amount in satoshis
  isClaim?: boolean;     // Whether this output creates a LBRY claim
  claimName?: string;
  claimValueHex?: string; // Serialized claim protobuf hex
  claimIDHex?: string;
  claimType?: number;
}

interface SignedTx {
  hex: string;    // Signed raw transaction hex
  txid: string;   // Transaction ID (64 hex chars)
  size: number;   // Actual serialized size in bytes
  fee: number;    // Calculated fee in satoshis
}

interface BuildTxOptions {
  feePerByte: number;   // Fee rate in sat/vB (1–1000, validated)
}
```

> **Important:** `TransactionBuilder.build()` does **not** perform coin selection or change computation. You must pre-select UTXOs and calculate outputs (including change) in JS. Use `selectCoins` from `wasm.exports` for basic greedy coin selection, or implement your own.

### TransactionBroadcaster

Adds a confirmation checkpoint before broadcasting a signed transaction to the mempool.

```typescript
class TransactionBroadcaster {
  constructor(client: MempoolClient, opts?: BroadcasterOptions);
  async broadcast(tx: SignedTx): Promise<BroadcastResult>;
}

interface BroadcastResult {
  txid: string;
}

interface BroadcasterOptions {
  confirm?: (tx: SignedTx) => Promise<boolean> | boolean;
}
```

### MempoolClient

REST API client for `mempool.lbry.org`. All network I/O via `fetch()`.

```typescript
class MempoolClient {
  constructor(opts?: MempoolClientOptions);

  // Blockchain info
  getTipHeight(): Promise<number>;
  getTipHash(): Promise<string>;
  getBlock(hash: string): Promise<Block>;
  getBlockTxs(hash: string): Promise<Transaction[]>;
  getBlocks(startHeight: number): Promise<Block[]>;  // Up to 15 blocks

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
  fetch?: typeof fetch;   // Custom fetch implementation (for testing)
}
```

**Helper:** `toUTXOInputs(mempoolUtxos)` converts mempool API UTXOs to the format expected by `selectCoins` (maps `value` → `amount`, `status.block_height` → `height`).

#### Key Types

```typescript
interface UTXO {
  txid: string;
  vout: number;
  status: { confirmed: boolean; block_height?: number };
  value: number;
}

interface FeeRates {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
}

interface Block {
  id: string;
  height: number;
  timestamp: number;
  tx_count: number;
  // ... additional fields
}

interface Transaction {
  txid: string;
  size: number;
  fee: number;
  status: { confirmed: boolean; block_height?: number };
  vin: Array<{...}>;
  vout: Array<{ scriptpubkey: string; scriptpubkey_address: string; value: number }>;
}
```

### MempoolWebSocket

Real-time WebSocket client for `wss://mempool.lbry.org/api/v1/ws`. Uses `websocket-ts` for auto-reconnect with exponential backoff (capped at 10 retries) and message buffering via ring queue (cap 100).

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

Event types: `"address-tx"`, `"tx-status"`, `"stats"`, `"*"` (wildcard). `on()` returns an unsubscribe function.

### ClaimsAPI

Create, sign, and parse LBRY claims. All protobuf serialization + ECDSA signing happens in WASM.

```typescript
class ClaimsAPI {
  constructor(wasm: { exports: WasmExports });

  newChannel(params: ChannelClaim): ClaimResult;
  newStream(params: StreamClaim): ClaimResult;
  newCollection(params: CollectionClaim): ClaimResult;
  newRepost(params: RepostClaim): ClaimResult;
  sign(valueHex: string, handle: WalletHandle, firstInputTxID: string, channelClaimIDHex: string, channelChain?: number, channelIndex?: number): string;
  parse(claimHex: string): ParsedClaim;
  compile(claimHex: string): string;
}
```

### Guardrails / Validation

Synchronous validation functions and transaction review.

```typescript
const DUST_THRESHOLD = 546;  // Minimum output amount (satoshis)
const FEE_FLOOR = 1;        // Minimum fee rate (sat/vB)
const FEE_CEILING = 1000;   // Maximum fee rate (sat/vB)

validateAddress("bCutT81yTa7mHo6JUsZLvN8mVFjkCXGvkg");  // true | false
validateAmount(1000);          // true (≥ 546)
validateFeeRate(5);            // true (1–1000)
buildReview(signedTx);
// { valid: boolean, warnings: Array<{ field, message, severity: "error" | "warning" }> }
```

**Address validation rules:**

| Rule        | Detail                                                      |
|-------------|-------------------------------------------------------------|
| Prefix      | Must start with `b` (LBRY mainnet)                          |
| Alphabet    | Base58: `1-9A-HJ-NP-Za-km-z` (no 0/O/I/l)                  |
| Version byte | `0x55` (LBRY P2PKH)                                       |
| Checksum    | Double-SHA256, last 4 bytes                                  |
| Payload     | Version byte + 20-byte pubkey hash = exactly 21 bytes       |

### WalletStore

Persist wallet mnemonics in IndexedDB, encrypted with AES-256-GCM + PBKDF2 (600k iterations).

```typescript
class WalletStore {
  constructor(opts?: WalletStoreOptions);
  store(wallet: StoredWallet, password: string): Promise<void>;
  load(address: string, password: string): Promise<StoredWallet>;
  listAddresses(): Promise<string[]>;
  delete(address: string): Promise<void>;
}
```

### FeeEstimator

Pure TypeScript fee estimation (no WASM call needed). Uses formulas from `liblbry/chain/tx.go`.

```typescript
class FeeEstimator {
  estimateSize(numInputs: number, numOutputs: number): number;
  estimateFee(size: number, feePerByte: number): number;
  estimate(numInputs: number, numOutputs: number, feePerByte: number): FeeEstimate;
}
```

Estimated sizes: 250 bytes per input, 40 bytes per output, 10 bytes overhead. These are larger than standard Bitcoin P2PKH because LBRY claim scripts include extra opcode overhead.

---

## Security Model

### Keys Stay in WASM

- Mnemonics and derived private keys are stored **only in WASM memory** (Go heap).
- JavaScript receives **opaque integer handles** (not key material). Handles reference internal Go `Wallet` objects.
- The `privateKeyHex()` method exists for emergency migration/export but should not be used in normal operation.
- Calling `walletClose(handle)` clears the key material from WASM memory.
- The WASM binary and `wasm_exec.js` URLs are validated against an allowlist (same-origin, relative, or `localhost:8080`) to prevent loading attacker-controlled binaries.
- `WasmLoader.unload()` clears `globalThis.__lbrySDK__`, removing all WASM state.

### Network Security

- Mempool REST base URL is validated against: `https://mempool.lbry.org` or `http://localhost:8999`.
- WebSocket origins restricted to: `wss://mempool.lbry.org` or `ws://localhost:8999`.
- Address validation prevents path traversal in API calls (e.g., `getAddressUtxos("../../admin")` is rejected).

### Storage Security

- Mnemonics stored in IndexedDB are encrypted with AES-256-GCM.
- Key derivation uses PBKDF2 with 600,000 iterations and a random 16-byte salt.
- Plaintext mnemonics only exist in memory during active wallet sessions.

### Transaction Guardrails

- Fee rate clamped to 1–1000 sat/vB.
- Output amounts must be ≥ 546 satoshis (dust threshold).
- `buildReview()` checks for zero/NaN/negative size, zero fees, and unusually large transactions (>100 KB).
- `TransactionBroadcaster` supports a `confirm` callback that must approve before broadcast.

---

## Important Constraints

### Browser-Only

- The SDK is designed for **browser environments** with WebAssembly support.
- `fetch()` uses the browser's global `fetch` bound to `globalThis` to avoid "Illegal invocation" errors.
- `WalletStore` (IndexedDB) is browser-only.
- WASM loading works in Web Workers and Node.js via `fetch` + `eval`, but these are not the primary targets.
- Live tests run via `@vitest/browser-playwright` in a headless Chromium instance.

### WASM Lifecycle

- `WasmLoader.load()` returns a **singleton**. Subsequent calls return the cached instance.
- Call `WasmLoader.unload()` to tear down (clears `globalThis.__lbrySDK__`).
- The WASM binary and `wasm_exec.js` from the Go standard library must be served alongside your bundle. The SDK resolves them relative to the module's URL.
- In non-DOM environments (Web Workers, Node.js), `wasm_exec.js` is loaded via `fetch` + `eval`.
- All WASM functions are **synchronous** (TinyGo's asyncify scheduler yields internally to the JS event loop).

### Wallet Handle Lifecycle

- Wallet handles **must be closed** with `wallet.close(handle)` when no longer needed. Failure to close leaks keys in WASM memory.
- Handles are integers referencing internal Go wallet objects — valid only until `walletClose` is called.
- Always use `try/finally`:

```typescript
const { handle } = wallet.fromMnemonic(mnemonic);
try {
  // ... use wallet, build transactions ...
} finally {
  wallet.close(handle);
}
```

### Coin Selection & Change

- `TransactionBuilder.build()` signs the **exact inputs/outputs** provided. It does not do coin selection or change calculation.
- You must calculate change outputs and fee amounts in JS.
- Use `wasm.exports.selectCoins()` for basic greedy coin selection, or implement your own algorithm.
- After building, reconcile the change output amount: `change = totalInputs - sumOtherOutputs - signed.fee`.

### Claim Operations

- Claim methods (`newChannel`, `newStream`, etc.) produce serialized protobuf value hex. They do not create or sign a transaction.
- Include the claim value hex in a `TxOutput` with `isClaim: true`, then build the transaction with `TransactionBuilder.build()`.

---

## Testing

The test suite uses **Vitest** with two modes: mocked (default) and live.

### Mocked Tests (default)

Run: `pnpm test` or `pnpm test:browser`

- **Browser mode** (default): Runs tests in a headless Chromium via Playwright. MSW intercepts all `fetch()` and WebSocket calls to `mempool.lbry.org`, returning deterministic mock data.
- **Node mode**: Set `LBRY_TEST_ENV=node` to run in Node.js (no browser, no MSW).
- A mock WASM module (`tests/mock-wasm.ts`) is injected via `globalThis.__lbrySDK__`, so no real WASM binary is loaded.
- The deterministic test fixture mnemonic is: `will bus cluster trumpet jump venue truly habit decrease stuff renew horse`

Test files:

| File | Covers |
|------|--------|
| `tests/wallet.test.ts` | WASM wallet operations (seed, mnemonic, derivation, determinism, error cases) |
| `tests/transaction-claims.test.ts` | WASM tx building, signing, claim creation & parsing |
| `tests/mempool.test.ts` | Mempool REST + WebSocket client API |
| `tests/wallet-flow.test.ts` | Integration: wallet → fees → UTXOs → build → guardrails → broadcast |
| `tests/security-regression.test.ts` | URL validation, address validation, fee bounds, handle lifecycle, TS↔Go serialization alignment |

### Live Tests

Run: `LBRY_TEST_MNEMONIC="your 12-word mnemonic with funds" pnpm test:live`

- Connects to the **real** `mempool.lbry.org` API.
- Loads the **real** WASM binary.
- Requires a mnemonic with actual LBC funds.
- Tested operations: self-send minimum (dust), UTXO consolidation/sweep.
- Read-only API tests (no wallet needed): block, tx, fee, and address endpoint verification.
- Uses a separate vitest config (`vitest.live.config.ts`) with extended timeouts (11 minutes for confirmation polling).

---

## Project Structure

```
src/
├── index.ts                      # Barrel export — re-exports all modules
├── rollup-plugin-go-wasm.ts      # Build-time plugin: embeds WASM build into tsdown
├── wasm/
│   ├── index.ts                  # WasmLoader re-export
│   ├── loader.ts                 # WASM lifecycle (load, cache, unload, URL validation)
│   ├── types.ts                  # WasmInstance, WasmResult types
│   ├── types.generated.ts        # Auto-generated from Go exports (pnpm generate)
│   ├── lbry-sdk.wasm             # Built TinyGo WASM binary
│   └── wasm_exec.js              # Go's WASM support library
├── wallet/
│   ├── index.ts                  # LbryWalletManager re-export
│   ├── manager.ts                # LbryWalletManager class
│   └── types.ts                  # WalletHandle, CreatedWallet, etc.
├── tx/
│   ├── index.ts                  # TransactionBuilder, FeeEstimator re-exports
│   ├── builder.ts                # TransactionBuilder class
│   ├── broadcaster.ts            # TransactionBroadcaster class
│   ├── fees.ts                   # FeeEstimator (pure TS)
│   └── types.ts                  # TxInput, TxOutput, SignedTx, etc.
├── mempool/
│   ├── index.ts                  # MempoolClient, MempoolWebSocket re-exports
│   ├── client.ts                 # MempoolClient REST API
│   ├── websocket.ts              # MempoolWebSocket (websocket-ts)
│   └── types.ts                  # Block, Transaction, UTXO, FeeRates, WS types
├── claims/
│   ├── index.ts                  # ClaimsAPI re-export
│   ├── api.ts                    # ClaimsAPI class
│   └── types.ts                  # ChannelClaim, StreamClaim, etc.
├── storage/
│   ├── index.ts                  # WalletStore re-export
│   ├── store.ts                  # WalletStore (IndexedDB)
│   ├── crypto.ts                 # AES-256-GCM encryption helpers
│   └── types.ts                  # StoredWallet, EncryptedPayload
└── guardrails/
    ├── index.ts                  # Validation re-exports
    └── validate.ts               # Address validation, fee bounds, tx review

wasm/go/                          # Go source compiled to WASM
├── exports/                      # Go exports registered via syscall/js
├── tools/gencontract/            # TypeScript type generator from Go AST
└── main.go                       # TinyGo entrypoint

tests/
├── setup.ts                      # MSW browser setup + mock WASM injection
├── setup.node.ts                 # Node setup (mock WASM only)
├── setup.live.ts                 # Live test setup (no MSW)
├── mock-wasm.ts                  # Mock WASM exports for unit tests
├── msw-handlers.ts               # MSW request handlers for mempool API
├── wallet.test.ts                # WASM wallet unit tests
├── transaction-claims.test.ts    # WASM tx + claim tests
├── mempool.test.ts               # Mempool client tests
├── wallet-flow.test.ts           # Integration tests
├── security-regression.test.ts   # Security regression tests
├── rollup-plugin.test.ts         # Build plugin tests
├── live-mempool.test.ts          # Live read-only API tests
└── live-self-send.test.ts        # Live send + consolidation tests
```

---

## License

MIT License. See [LICENSE](../../../LICENSE) in the repository root.

Copyright (c) 2024-2026 Hammer Technologies LLC
