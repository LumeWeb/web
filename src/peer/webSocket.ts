import { Logger, Peer } from "../types.js";
import NodeId from "../nodeId.js";
import { URL } from "url";

export class WebSocketPeer implements Peer {
  connectionUris: Array<URL>;
  isConnected: boolean = false;
  challenge: Uint8Array;
  private _socket: WebSocket;

  constructor(_socket: WebSocket, connectionUris: URL[]) {
    this.connectionUris = connectionUris.map((uri) => new URL(uri.toString()));
    this.challenge = new Uint8Array(); // Initialize as needed
    this._socket = _socket;
  }

  private _id?: NodeId;

  get id(): NodeId {
    return this._id as NodeId;
  }

  set id(value: NodeId) {
    this._id = value;
  }

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
        await callback(event);
      },
    );

    if (onDone) {
      this._socket.addEventListener("close", onDone);
    }

    if (onError) {
      this._socket.addEventListener("error", onError);
    }
  }
}
export async function connect(uri: string): Promise<WebSocket> {
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
