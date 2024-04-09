import { Multihash } from "../multihash.js";
import NodeId from "../nodeId.js";
import { Logger, Peer, SignedMessage } from "../types.js";
import KeyPairEd25519 from "../ed25519.js";
import * as crypto from "crypto";
import {
  protocolMethodAnnouncePeers,
  protocolMethodHandshakeOpen,
  protocolMethodHashQuery,
  protocolMethodSignedMessage,
  recordTypeStorageLocation,
  storageLocationTypeFull,
} from "../constants.js";
import defer from "p-defer";
import { calculateScore, encodeEndian } from "../util.js";
import Packer from "../serialization/pack.js";
import Unpacker from "../serialization/unpack.js";
import { ed25519 } from "@noble/curves/ed25519";
import { AbstractLevel, AbstractSublevel } from "abstract-level";
import StorageLocation from "../storage.js";
import { S5Node, stringifyNode } from "../node.js";
import { URL } from "url";
import { Buffer } from "buffer";
import {
  createTransportPeer,
  createTransportSocket,
} from "../transports/index.js";
import messages from "../messages/index.js";
import EventEmitter from "events";

export class P2PService extends EventEmitter {
  private logger: Logger;
  private nodeKeyPair: KeyPairEd25519;
  private localNodeId?: NodeId;
  private nodesDb?: AbstractSublevel<
    AbstractLevel<Uint8Array, string, Uint8Array>,
    Uint8Array,
    string,
    Uint8Array
  >;

  constructor(node: S5Node) {
    super();
    this._node = node;
    this._networkId = node.config.p2p?.network;
    this.nodeKeyPair = node.config.keyPair;
    this.logger = node.logger;

    node.services.p2p = this;
  }
  private _networkId?: string;

  get networkId(): string {
    return this._networkId as string;
  }

  private _node: S5Node;

  get node(): S5Node {
    return this._node;
  }

  private _reconnectDelay: Map<string, number> = new Map();

  get reconnectDelay(): Map<string, number> {
    return this._reconnectDelay;
  }

  private _selfConnectionUris: Array<URL> = [];

  get selfConnectionUris(): Array<URL> {
    return this._selfConnectionUris;
  }

  private _peers: Map<string, Peer> = new Map();

  get peers(): Map<string, Peer> {
    return this._peers;
  }

  async init(): Promise<void> {
    this.localNodeId = new NodeId(this.nodeKeyPair.publicKey); // Define the NodeId constructor
    this.nodesDb = this._node.db.sublevel<string, Uint8Array>("s5-nodes", {
      valueEncoding: "buffer",
    });
  }

  async start(): Promise<void> {
    const initialPeers = this._node.config?.p2p?.peers?.initial || [];

    for (const p of initialPeers) {
      this.connectToNode([new URL(p)]);
    }
  }
  async stop() {
    [...this.node.services.p2p.peers.values()].forEach((peer) => peer.end());
  }

  async onNewPeer(peer: Peer, verifyId: boolean): Promise<void> {
    peer.challenge = crypto.randomBytes(32);

    const initialAuthPayloadPacker = new Packer();
    initialAuthPayloadPacker.packInt(protocolMethodHandshakeOpen);
    initialAuthPayloadPacker.packBinary(Buffer.from(peer.challenge));
    if (this._networkId) {
      initialAuthPayloadPacker.packString(this._networkId);
    }

    const completer = defer<void>();

    peer.listenForMessages(
      async (event: Uint8Array) => {
        let u = Unpacker.fromPacked(event);
        const method = u.unpackInt();

        if (method !== null && messages.has(method)) {
          await messages.get(method)?.(this.node, peer, u, event, verifyId);
        }
      },
      {
        onDone: async () => {
          try {
            if (this._peers.has(peer.id.toString())) {
              this._peers.delete(peer.id.toString());
              this.logger.info(
                `[-] ${peer.id.toString()} (${peer
                  .renderLocationUri()
                  .toString()})`,
              );
            }
          } catch (_) {
            this.logger.info(`[-] ${peer.renderLocationUri()}`);
          }
          completer.reject("onDone");
        },
        onError: (e) => {
          this.logger.warn(`${peer.id}: ${e}`);
        },
        logger: this.logger,
      },
    );
    peer.sendMessage(initialAuthPayloadPacker.takeBytes());

    return completer.promise;
  }

  async prepareProvideMessage(
    hash: Multihash,
    location: StorageLocation,
  ): Promise<Uint8Array> {
    const list: number[] = [
      recordTypeStorageLocation,
      ...hash.fullBytes,
      location.type,
      ...encodeEndian(location.expiry, 4),
      location.parts.length,
    ];

    for (const part of location.parts) {
      const bytes = new TextEncoder().encode(part);
      list.push(...encodeEndian(bytes.length, 2));
      list.push(...Array.from(bytes));
    }
    list.push(0);

    const signature = ed25519.sign(
      new Uint8Array(list),
      this.nodeKeyPair.extractBytes(),
    );

    return new Uint8Array([
      ...list,
      ...Array.from(this.nodeKeyPair.publicKey),
      ...Array.from(signature),
    ]);
  }

  async sendPublicPeersToPeer(peer: Peer, peersToSend: Peer[]): Promise<void> {
    const p = new Packer();
    p.packInt(protocolMethodAnnouncePeers);

    p.packInt(peersToSend.length);
    for (const pts of peersToSend) {
      p.packBinary(Buffer.from(pts.id.bytes));
      p.packBool(pts.isConnected);
      p.packInt(pts.connectionUris.length);
      for (const uri of pts.connectionUris) {
        p.packString(uri.toString());
      }
    }
    peer.sendMessage(await this.signMessageSimple(p.takeBytes()));
  }

  async getNodeScore(nodeId: NodeId): Promise<number> {
    if (nodeId.equals(this.localNodeId)) {
      return 1;
    }
    const node = await this.nodesDb?.get(stringifyNode(nodeId));
    if (!node) {
      return 0.5;
    }
    const map = Unpacker.fromPacked(node).unpackMap();
    return calculateScore(map.get(1), map.get(2));
  }

  async upvote(nodeId: NodeId): Promise<void> {
    await this._vote(nodeId, true);
  }

  async downvote(nodeId: NodeId): Promise<void> {
    await this._vote(nodeId, false);
  }

  // TODO add a bit of randomness with multiple options
  async sortNodesByScore(nodes: NodeId[]): Promise<NodeId[]> {
    const nodePromises = nodes.map(
      (item): [NodeId, Promise<number> | number] => [
        item,
        this.getNodeScore(item),
      ],
    );

    await Promise.all(nodePromises.map((item) => item[1]));

    for (let i = 0; i < nodePromises.length; i++) {
      nodePromises[i][1] = await nodePromises[i][1];
    }

    return nodePromises
      .sort((a: [NodeId, any], b: [NodeId, any]) => b[1] - a[1])
      .map((item) => item[0]);
  }

  async signMessageSimple(message: Uint8Array): Promise<Uint8Array> {
    const packer = new Packer();

    const signature = ed25519.sign(message, this.nodeKeyPair.extractBytes());

    packer.packInt(protocolMethodSignedMessage);
    packer.packBinary(Buffer.from(this.localNodeId!.bytes));

    packer.packBinary(Buffer.from(signature));
    packer.packBinary(Buffer.from(message));

    return packer.takeBytes();
  }

  async unpackAndVerifySignature(u: Unpacker): Promise<SignedMessage> {
    const nodeId = new NodeId(u.unpackBinary());
    const signature = u.unpackBinary();
    const message = u.unpackBinary();

    const isValid = ed25519.verify(
      signature,
      message,
      nodeId.bytes.subarray(1),
    );

    if (!isValid) {
      throw new Error("Invalid signature found");
    }
    return {
      nodeId: nodeId,
      message: message,
    };
  }

  sendHashRequest(
    hash: Multihash,
    types: number[] = [storageLocationTypeFull],
  ): void {
    const p = new Packer();

    p.packInt(protocolMethodHashQuery);
    p.packBinary(Buffer.from(hash.fullBytes));
    p.pack(types);
    // TODO Maybe add int for hop count (or not because privacy concerns)

    const req = p.takeBytes();

    for (const peer of this._peers.values()) {
      peer.sendMessage(req);
    }
  }

  async connectToNode(connectionUris: URL[], retried = false): Promise<void> {
    if (!this.node.started) {
      return;
    }

    const unsupported = new URL("http://0.0.0.0");
    unsupported.protocol = "unsupported";

    const connectionUri =
      connectionUris.find((uri) => ["ws:", "wss:"].includes(uri.protocol)) ||
      connectionUris.find((uri) => uri.protocol === "tcp:") ||
      unsupported;

    if (connectionUri.protocol === "unsupported") {
      throw new Error(
        `None of the available connection URIs are supported (${connectionUris})`,
      );
    }

    const protocol = connectionUri.protocol.replace(":", "");

    if (!connectionUri.username) {
      throw new Error("Connection URI does not contain node id");
    }

    const id = NodeId.decode(connectionUri.username);

    this._reconnectDelay.set(
      id.toString(),
      this._reconnectDelay.get(id.toString()) || 1,
    );

    if (id.equals(this.localNodeId)) {
      return;
    }

    try {
      this.logger.verbose(`[connect] ${connectionUri}`);

      const socket = await createTransportSocket(protocol, connectionUri);
      const peer = createTransportPeer(protocol, {
        socket,
        uris: [connectionUri],
      });

      peer.id = id;
      await this.onNewPeer(peer, true);
    } catch (e) {
      if (retried) {
        return;
      }
      retried = true;

      this.logger.catched(e);

      const delay = this._reconnectDelay.get(id.toString())!;
      this._reconnectDelay.set(id.toString(), delay * 2);
      await new Promise((resolve) => setTimeout(resolve, delay * 1000));

      await this.connectToNode(connectionUris, retried);
    }
  }

  private async _vote(nodeId: NodeId, upvote: boolean): Promise<void> {
    const node = await this.nodesDb?.get(stringifyNode(nodeId));
    const map = node
      ? Unpacker.fromPacked(node).unpackMap()
      : new Map<number, number>(
          Object.entries({ 1: 0, 2: 0 }).map(([k, v]) => [+k, v]),
        );

    if (upvote) {
      map.set(1, (map.get(1) ?? 0) + 1);
    } else {
      map.set(2, (map.get(2) ?? 0) + 1);
    }

    await this.nodesDb?.put(
      stringifyNode(nodeId),
      new Packer().pack(map).takeBytes(),
    );
  }
}
