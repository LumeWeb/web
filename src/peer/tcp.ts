import { Logger, Peer } from "../types.js";
import NodeId from "../nodeId.js";
import * as net from "net";
import { URL } from "url";
import { decodeEndian } from "../util.js";

export class TcpPeer implements Peer {
  connectionUris: Array<URL>;
  isConnected: boolean = false;
  challenge: Uint8Array;
  private _socket: net.Socket;

  constructor(_socket: net.Socket, connectionUris: URL[]) {
    this.connectionUris = connectionUris.map((uri) => new URL(uri.toString()));
    this.challenge = new Uint8Array();
    this._socket = _socket;
  }

  private _id?: NodeId;

  set id(value: NodeId) {
    this._id = value;
  }

  sendMessage(message: Uint8Array): void {
    this._socket.write(message);
  }

  renderLocationUri(): string {
    return this.connectionUris.length === 0
      ? (this._socket.remoteAddress as string)
      : this.connectionUris[0].toString();
  }

  listenForMessages(
    callback: (event: any) => Promise<void>,
    {
      onDone,
      onError,
      logger,
    }: { onDone?: any; onError?: (...args: any[]) => void; logger: Logger },
  ): void {
    const listener = (data: Uint8Array) => {
      let pos = 0;

      while (pos < data.length) {
        const lengthBuffer = data.slice(pos, pos + 4);
        const length = decodeEndian(lengthBuffer);

        if (data.length < pos + 4 + length) {
          console.log(`Ignore message, invalid length (from ${this.id})`);
          return;
        }

        try {
          const message = data.slice(pos + 4, pos + 4 + length);
          callback(message).catch((e) => {
            logger.catched(`Error in callback: ${e}`, this.id.toBase58());
          });
        } catch (e) {
          logger.catched(`Caught an exception: ${e}`, this.id.toBase58());
        }

        pos += length + 4;
      }
    };

    this._socket.on("data", listener);

    if (onDone) {
      this._socket.on("end", onDone);
    }

    if (onError) {
      this._socket.on("error", onError);
    }
  }
}

export async function connect(port: number, host: string): Promise<net.Socket> {
  return new Promise((resolve, reject) => {
    const socket = net.connect(port, host, () => {
      resolve(socket);
    });
    socket.on("error", (err) => {
      reject(err);
    });
  });
}
