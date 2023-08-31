import { Logger, Peer } from "../types.js";
import NodeId from "../nodeId.js";
import { URL } from "url";
import { WebSocket } from "ws";
import { BasePeer } from "#transports/base.js";

export class WebSocketPeer extends BasePeer implements Peer {
  sendMessage(message: Uint8Array): void {
    this._socket.send(message);
  }

  renderLocationUri(): string {
    return "WebSocket client";
  }

  listenForMessages(
    callback: (event: any) => Promise<void>,
    {
      onDone,
      onError,
      logger,
    }: { onDone?: any; onError?: (...args: any[]) => void; logger: Logger },
  ): void {
    this._socket.addEventListener(
      "message",
      async (event: MessageEvent<any>) => {
        await callback(event.data);
      },
    );

    if (onDone) {
      this._socket.addEventListener("close", onDone);
    }

    if (onError) {
      this._socket.addEventListener("error", onError);
    }
  }

  public static async connect(uri: URL): Promise<WebSocket> {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(uri);
      socket.addEventListener("open", () => {
        resolve(socket);
      });
      socket.addEventListener("error", (err) => {
        reject(err);
      });
    });
  }
}
