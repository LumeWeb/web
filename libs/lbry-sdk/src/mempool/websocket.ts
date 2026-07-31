/**
 * Mempool WebSocket client for real-time updates.
 *
 * Uses `websocket-ts` for auto-reconnect (exponential backoff) and
 * message buffering (ring queue, cap 100).
 *
 * Connects to wss://mempool.lbry.org/api/v1/ws and supports:
 * - `track-address` — incoming payment notifications
 * - `track-addresses` — batch address tracking
 * - `track-tx` — broadcast tx confirmation/mempool position
 * - `want` — request periodic data pushes (stats, tips, mempool-blocks)
 *
 * @module @lumeweb/lbry-sdk/mempool/websocket
 */

import {
  WebsocketBuilder,
  Websocket,
  WebsocketEvent,
  ExponentialBackoff,
  RingQueue,
  type Backoff,
  type WebsocketBuffer,
} from "websocket-ts";
import type {
  MempoolWebSocketOptions,
  WebSocketMessage,
  AddressTxMessage,
  TxStatusMessage,
  MempoolStatsMessage,
} from "@/mempool/types";
import { assertTrustedUrl } from "@/mempool/url-validation";

/** Max reconnect attempts before giving up. */
const MAX_RECONNECT_ATTEMPTS = 10;

/**
 * Mempool WebSocket client for real-time updates.
 *
 * Uses `websocket-ts` for auto-reconnect (exponential backoff) and
 * message buffering (ring queue, cap 100).
 *
 * Connects to wss://mempool.lbry.org/api/v1/ws and supports:
 * - `track-address` — incoming payment notifications
 * - `track-addresses` — batch address tracking
 * - `track-tx` — broadcast tx confirmation/mempool position
 * - `want` — request periodic data pushes (stats, tips, mempool-blocks)
 *
 * @example
 * ```ts
 * const ws = new MempoolWebSocket();
 * await ws.connect();
 * ws.on("address-tx", (msg) => console.log("Incoming tx:", msg.txid));
 * ws.trackAddress("bLBRYaddress...");
 * ```
 */
export class MempoolWebSocket {
  private readonly ws: Websocket;
  private readonly handlers = new Map<string, Set<(msg: WebSocketMessage) => void>>();
  private reconnectAttempts = 0;
  private connected = false;

  constructor(opts: MempoolWebSocketOptions = {}) {
    const url = opts.url ?? "wss://mempool.lbry.org/api/v1/ws";
    assertTrustedUrl(url, "ws");

    // Exponential backoff: 1s, 2s, 4s, 8s, 16s, 30s (capped).
    // We cap retries at 10 via a custom backoff wrapper.
    const backoff = new ExponentialBackoff(1000, 5); // 1s, 2s, 4s, 8s, 16s, 32s

    // Ring buffer caps at 100 messages — drops oldest when full.
    const buffer: WebsocketBuffer<string> = new RingQueue<string>(100);

    this.ws = new WebsocketBuilder(url)
      .withBackoff(this.wrapBackoff(backoff))
      .withBuffer(buffer)
      .onOpen(() => {
        this.reconnectAttempts = 0;
        this.connected = true;
      })
      .onClose(() => {
        this.connected = false;
      })
      .onMessage((_i, ev) => {
        try {
          const msg = JSON.parse(ev.data as string) as WebSocketMessage;
          this.emit(msg);
        } catch {
          // Ignore unparseable messages
        }
      })
      .build();
  }

  /**
   * Wrap the backoff to enforce a max retry count.
   * After MAX_RECONNECT_ATTEMPTS, returns Infinity to stop retrying.
   *
   * @param inner - The underlying exponential backoff instance
   * @returns A wrapped Backoff with max retry enforcement
   */
  private wrapBackoff(inner: Backoff): Backoff {
    const self = this;
    return {
      get retries() { return self.reconnectAttempts; },
      get current() { return inner.current; },
      next(): number {
        if (self.reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          return Infinity; // stops reconnection
        }
        self.reconnectAttempts++;
        return inner.next();
      },
      reset(): void {
        self.reconnectAttempts = 0;
        inner.reset();
      },
    };
  }

  /**
   * Connect to the WebSocket.
   *
   * The WebSocket connects automatically on construction; this method waits
   * for the open event. If already connected, resolves immediately.
   *
   * @returns A promise that resolves when connected, rejects on error/timeout
   */
  connect(): Promise<void> {
    // websocket-ts connects automatically on construction.
    // If already connected, resolve immediately.
    if (this.connected) return Promise.resolve();
    // Wait for the open event.
    // Guard against double-reject: onerror and onclose can both fire.
    return new Promise<void>((resolve, reject) => {
      let settled = false;
      const timeout = setTimeout(() => {
        if (!settled) {
          settled = true;
          reject(new Error("WebSocket connection timeout"));
        }
      }, 30_000);
      this.ws.addEventListener(WebsocketEvent.open, () => {
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          resolve();
        }
      }, { once: true });
      this.ws.addEventListener(WebsocketEvent.error, () => {
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          reject(new Error("WebSocket connection failed"));
        }
      }, { once: true });
      this.ws.addEventListener(WebsocketEvent.close, () => {
        if (!settled) {
          settled = true;
          clearTimeout(timeout);
          reject(new Error("WebSocket connection closed before open"));
        }
      }, { once: true });
    });
  }

  /**
   * Disconnect and stop reconnection attempts.
   *
   * Clears all registered handlers.
   */
  disconnect(): void {
    this.ws.close();
    this.connected = false;
    this.handlers.clear();
  }

  /**
   * Register a handler for a message type.
   *
   * @param type - Message type to listen for (use "*" for all messages)
   * @param handler - Callback invoked when a matching message arrives
   * @returns A cleanup function that removes the handler when called
   */
  on(type: string, handler: (msg: WebSocketMessage) => void): () => void {
    let set = this.handlers.get(type);
    if (!set) {
      set = new Set();
      this.handlers.set(type, set);
    }
    set.add(handler);
    return () => set!.delete(handler);
  }

  /**
   * Track a single address for incoming transactions.
   *
   * @param address - The LBRY address to monitor
   */
  trackAddress(address: string): void {
    this.send({ action: "track", address });
  }

  /**
   * Track multiple addresses for incoming transactions.
   *
   * @param addresses - Array of LBRY addresses to monitor
   */
  trackAddresses(addresses: string[]): void {
    this.send({ action: "track", addresses });
  }

  /**
   * Track a transaction for confirmation/mempool position updates.
   *
   * @param txid - The transaction ID to monitor
   */
  trackTx(txid: string): void {
    this.send({ action: "track-tx", tx: txid });
  }

  /**
   * Request periodic data pushes from the server.
   *
   * @param data - Array of data types to request (e.g., ["stats", "mempool-blocks"])
   */
  want(data: string[]): void {
    this.send({ action: "want", data });
  }

  /**
   * Send a JSON message over the WebSocket.
   * websocket-ts handles buffering when disconnected (via RingQueue).
   *
   * @param msg - The message object to serialize and send
   */
  private send(msg: unknown): void {
    // websocket-ts handles buffering when disconnected (via RingQueue).
    this.ws.send(JSON.stringify(msg));
  }

  /**
   * Emit a received message to all registered handlers.
   *
   * Dispatches to type-specific handlers first, then to wildcard ("*") handlers.
   *
   * @param msg - The parsed WebSocket message
   */
  private emit(msg: WebSocketMessage): void {
    const set = this.handlers.get(msg.type);
    if (set) {
      for (const handler of set) handler(msg);
    }
    // Wildcard handlers
    const wildcard = this.handlers.get("*");
    if (wildcard) {
      for (const handler of wildcard) handler(msg);
    }
  }
}

export type {
  MempoolWebSocketOptions,
  WebSocketMessage,
  AddressTxMessage,
  TxStatusMessage,
  MempoolStatsMessage,
};
