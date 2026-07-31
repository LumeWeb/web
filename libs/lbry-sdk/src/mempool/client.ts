/**
 * Mempool REST API client for mempool.lbry.org.
 *
 * Provides typed access to blocks, transactions, fees, address data,
 * and transaction broadcasting. All network I/O via fetch().
 *
 * Enforces origin allowlisting to prevent SSRF attacks.
 *
 * @module @lumeweb/lbry-sdk/mempool/client
 */

import { assertTrustedUrl } from "@/mempool/url-validation";
import { parseJsonBigInt } from "@/mempool/parse";
import type {
  MempoolClientOptions,
  Block,
  Transaction,
  UTXO,
  AddressTxs,
  FeeRates,
  MempoolState,
} from "@/mempool/types";
import { validateAddress } from "@/guardrails/validate";

const DEFAULT_BASE_URL = "https://mempool.lbry.org";

/**
 * REST API client for mempool.lbry.org.
 *
 * Provides typed access to blocks, transactions, fees, address data,
 * and transaction broadcasting. All network I/O via fetch().
 *
 * @example
 * ```ts
 * const client = new MempoolClient();
 * const tipHeight = await client.getTipHeight();
 * const utxos = await client.getAddressUtxos(addr);
 * ```
 */
export class MempoolClient {
  private readonly baseUrl: string;
  private readonly fetchFn: typeof fetch;

  constructor(opts: MempoolClientOptions = {}) {
    const baseUrl = (opts.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    assertTrustedUrl(baseUrl, "rest");
    this.baseUrl = baseUrl;
    // Bind fetch to the global context to avoid "Illegal invocation" in browsers
    this.fetchFn = opts.fetch ?? fetch.bind(globalThis);
  }

  /**
   * Internal GET request helper.
   *
   * Uses bigint-aware JSON parsing so monetary fields (value, fee, total_fee)
   * are returned as `bigint` rather than `number`, preserving int64 precision
   * for amounts above Number.MAX_SAFE_INTEGER.
   *
   * @param path - API path (e.g., "/api/blocks/tip/height")
   * @returns Parsed JSON response with monetary fields as bigint
   */
  private async get<T>(path: string): Promise<T> {
    const res = await this.fetchFn(`${this.baseUrl}${path}`);
    if (!res.ok) {
      throw new Error(`mempool GET ${path} failed: ${res.status} ${res.statusText}`);
    }
    const text = await res.text();
    return parseJsonBigInt(text) as T;
  }

  /** GET that returns text/plain (e.g. tip hash). */
  private async getText(path: string): Promise<string> {
    const res = await this.fetchFn(`${this.baseUrl}${path}`);
    if (!res.ok) {
      throw new Error(`mempool GET ${path} failed: ${res.status} ${res.statusText}`);
    }
    return res.text();
  }

  /**
   * Internal POST request helper.
   *
   * @param path - API path (e.g., "/api/tx")
   * @param body - Plain text body (raw transaction hex)
   * @returns Response text (txid)
   */
  private async post<T>(path: string, body: string): Promise<T> {
    const res = await this.fetchFn(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: { "Content-Type": "text/plain" },
      body,
    });
    if (!res.ok) {
      throw new Error(`mempool POST ${path} failed: ${res.status} ${res.statusText}`);
    }
    return res.text() as unknown as T;
  }

  /** GET /api/blocks/tip/height — current chain tip height */
  getTipHeight(): Promise<number> {
    return this.get<number>("/api/blocks/tip/height");
  }

  /** GET /api/blocks/tip/hash — current chain tip hash (text/plain) */
  getTipHash(): Promise<string> {
    return this.getText("/api/blocks/tip/hash");
  }

  /** GET /api/block/:hash — block by hash */
  getBlock(hash: string): Promise<Block> {
    return this.get<Block>(`/api/block/${encodeURIComponent(hash)}`);
  }

  /** GET /api/block/:hash/txs — transactions in a block */
  getBlockTxs(hash: string): Promise<Transaction[]> {
    return this.get<Transaction[]>(`/api/block/${encodeURIComponent(hash)}/txs`);
  }

  /** GET /api/blocks/:height — 15 blocks starting at height */
  getBlocks(startHeight: number): Promise<Block[]> {
    // NOTE: mempool.lbry.org does not support a /:start/:end range endpoint.
    // This returns up to 15 blocks starting from startHeight.
    return this.get<Block[]>(`/api/blocks/${encodeURIComponent(startHeight)}`);
  }

  /** GET /api/tx/:txid — transaction by ID */
  getTx(txid: string): Promise<Transaction> {
    return this.get<Transaction>(`/api/tx/${encodeURIComponent(txid)}`);
  }

  /**
   * GET /api/address/:addr/utxo — UTXOs for an address.
   *
   * @param addr - The LBRY address to query
   * @returns Array of UTXOs
   * @throws {Error} If the address is invalid
   */
  getAddressUtxos(addr: string): Promise<UTXO[]> {
    if (!validateAddress(addr)) throw new Error(`Invalid LBRY address: ${addr}`);
    return this.get<UTXO[]>(`/api/address/${encodeURIComponent(addr)}/utxo`);
  }

  /**
   * GET /api/address/:addr/txs — transaction history for an address.
   *
   * @param addr - The LBRY address to query
   * @returns Array of transactions
   * @throws {Error} If the address is invalid
   */
  getAddressTxs(addr: string): Promise<AddressTxs[]> {
    if (!validateAddress(addr)) throw new Error(`Invalid LBRY address: ${addr}`);
    return this.get<AddressTxs[]>(`/api/address/${encodeURIComponent(addr)}/txs`);
  }

  /** GET /api/v1/fees/recommended — recommended fee rates (sat/vB) */
  getFees(): Promise<FeeRates> {
    return this.get<FeeRates>("/api/v1/fees/recommended");
  }

  /** GET /api/v1/fees/mempool-blocks — current mempool state (array of projected blocks) */
  getMempoolState(): Promise<MempoolState[]> {
    return this.get<MempoolState[]>("/api/v1/fees/mempool-blocks");
  }

  /**
   * POST /api/tx — broadcast a raw transaction hex. Returns txid.
   *
   * @param rawHex - Raw transaction hex string to broadcast
   * @returns The transaction ID of the broadcasted transaction
   */
  broadcastTx(rawHex: string): Promise<string> {
    return this.post<string>("/api/tx", rawHex);
  }
}
