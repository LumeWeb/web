/**
 * Transaction broadcaster — sends signed transactions to the mempool.
 *
 * Includes a confirmation checkpoint: if `confirm` is provided, the caller
 * must approve before broadcast proceeds. This is a security guardrail
 * preventing accidental broadcasts.
 *
 * @module @lumeweb/lbry-sdk/tx/broadcaster
 */

import type { MempoolClient } from "@/mempool/client";
import type { SignedTx } from "@/tx/types";

/**
 * Broadcast result containing the transaction ID.
 *
 * @property txid - The transaction ID of the broadcasted transaction
 */
export interface BroadcastResult {
  txid: string;
}

/** Broadcaster options */
export interface BroadcasterOptions {
  /** Optional confirm callback — if provided, broadcast waits for confirmation before proceeding. */
  confirm?: (tx: SignedTx) => Promise<boolean> | boolean;
}

/**
 * Broadcasts signed transactions to the mempool.
 *
 * Includes a confirmation checkpoint: if `confirm` is provided, the caller
 * must approve before broadcast proceeds. This is a security guardrail
 * preventing accidental broadcasts.
 *
 * @example
 * ```ts
 * const client = new MempoolClient();
 * const broadcaster = new TransactionBroadcaster(client, {
 *   confirm: (tx) => window.confirm(`Broadcast ${tx.txid}?`)
 * });
 * const result = await broadcaster.broadcast(signedTx);
 * console.log(result.txid);
 * ```
 */
export class TransactionBroadcaster {
  private readonly client: MempoolClient;
  private readonly opts: BroadcasterOptions;

  constructor(client: MempoolClient, opts: BroadcasterOptions = {}) {
    this.client = client;
    this.opts = opts;
  }

  /**
   * Broadcast a signed transaction to the mempool.
   *
   * If a `confirm` callback was provided in the constructor, it is called
   * first. The broadcast only proceeds if the callback returns `true`.
   *
   * @param tx - The signed transaction to broadcast
   * @returns An object containing the transaction ID
   * @throws {Error} If broadcast is cancelled by the confirm callback
   * @throws {Error} If the mempool API request fails
   */
  async broadcast(tx: SignedTx): Promise<BroadcastResult> {
    if (this.opts.confirm) {
      const approved = await this.opts.confirm(tx);
      if (!approved) {
        throw new Error("Broadcast cancelled by user");
      }
    }

    const txid = await this.client.broadcastTx(tx.hex);
    return { txid };
  }
}
