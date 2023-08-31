import { Logger, Peer, PeerConstructorOptions } from "#types.js";
import { URL } from "url";
import NodeId from "#nodeId.js";

export abstract class BasePeer implements Peer {
  connectionUris: URL[];
  isConnected: boolean = false;
  challenge: Uint8Array;
  protected _socket: any;

  constructor({ socket, uris }: PeerConstructorOptions) {
    this.connectionUris = uris.map((uri) => new URL(uri.toString()));
    this.challenge = new Uint8Array();
    this._socket = socket;
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
