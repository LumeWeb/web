import { Logger, Peer } from "#types.js";
import { URL } from "url";
import NodeId from "#nodeId.js";

export abstract class BasePeer implements Peer {
  connectionUris: Array<URL>;
  isConnected: boolean = false;
  challenge: Uint8Array;
  protected _socket: any;

  constructor(_socket: any, connectionUris: URL[]) {
    this.connectionUris = connectionUris.map((uri) => new URL(uri.toString()));
    this.challenge = new Uint8Array();
    this._socket = _socket;
  }

  private _id?: NodeId;

  get id(): NodeId {
    return this._id as NodeId;
  }

  set id(value: NodeId) {
    this._id = value;
  }

  abstract sendMessage(message: Uint8Array);

  abstract renderLocationUri(): string;

  abstract listenForMessages(
    callback: (event: any) => Promise<void>,
    {
      onDone,
      onError,
      logger,
    }: { onDone?: any; onError?: (...args: any[]) => void; logger: Logger },
  ): void;
}
