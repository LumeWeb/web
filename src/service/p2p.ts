import { Multihash } from "../multihash.js";
import NodeId from "../nodeId.js";
import { equalBytes } from "@noble/curves/abstract/utils";
import { Logger, Peer, S5Config, SignedMessage } from "../types.js";
import KeyPairEd25519 from "../ed25519.js";
import * as crypto from "crypto";
import {
  mkeyEd25519,
  protocolMethodAnnouncePeers,
  protocolMethodHandshakeDone,
  protocolMethodHandshakeOpen,
  protocolMethodHashQuery,
  protocolMethodSignedMessage,
  recordTypeRegistryEntry,
  recordTypeStorageLocation,
  storageLocationTypeFull,
} from "../constants.js";
import defer from "p-defer";
import { calculateScore, decodeEndian, encodeEndian } from "#util.js";
import Packer from "#serialization/pack.js";
import Unpacker from "#serialization/unpack.js";
import { ed25519 } from "@noble/curves/ed25519";
import { AbstractLevel, AbstractSublevel } from "abstract-level";
import StorageLocation from "#storage.js";
import { addStorageLocation, stringifyNode } from "#node.js";
import { URL } from "url";
import { Buffer } from "buffer";
import { connect as tcpConnect, TcpPeer } from "../peer/tcp.js";
import { connect as wsConnect, WebSocketPeer } from "../peer/webSocket.js";

export class P2PService {
  get peers(): Map<string, Peer> {
    return this._peers;
  }

  private config: S5Config;
  private logger: Logger;
  private nodeKeyPair: KeyPairEd25519;
  private localNodeId?: NodeId;
  private networkId?: string;
  private _peers: Map<string, Peer> = new Map();
  private reconnectDelay: Map<string, number> = new Map();
  private selfConnectionUris: Array<URL> = [];
  private nodesDb?: AbstractSublevel<
    AbstractLevel<Uint8Array, string, Uint8Array>,
    Uint8Array,
    string,
    Uint8Array
  >;

  private hashQueryRoutingTable: Map<Multihash, Set<NodeId>> = new Map();

  constructor(config: S5Config) {
    this.config = config;
    this.networkId = config?.p2p?.network;
    this.nodeKeyPair = config.keyPair;
    this.logger = config.logger;

    config.services.p2p = this;
  }

  async init(): Promise<void> {
    this.localNodeId = new NodeId(this.nodeKeyPair.publicKey); // Define the NodeId constructor
    this.nodesDb = this.config.db.sublevel<string, Uint8Array>("s5-nodes", {});
  }

  async start(): Promise<void> {
    const initialPeers = this.config?.p2p?.peers?.initial || [];

    for (const p of initialPeers) {
      this.connectToNode([new URL(p)]);
    }
  }

  async onNewPeer(peer: Peer, verifyId: boolean): Promise<void> {
    peer.challenge = crypto.randomBytes(32);

    const initialAuthPayloadPacker = new Packer();
    initialAuthPayloadPacker.packInt(protocolMethodHandshakeOpen);
    initialAuthPayloadPacker.packBinary(Buffer.from(peer.challenge));
    if (this.networkId) {
      initialAuthPayloadPacker.packString(this.networkId);
    }

    const completer = defer<void>();

    const supportedFeatures = 3; // 0b00000011

    peer.listenForMessages(
      async (event: Uint8Array) => {
        let u = Unpacker.fromPacked(event);
        const method = u.unpackInt();
        if (method === protocolMethodHandshakeOpen) {
          const p = new Packer();
          p.packInt(protocolMethodHandshakeDone);
          p.packBinary(u.unpackBinary());
          let peerNetworkId: string | null = null;
          try {
            peerNetworkId = u.unpackString();
          } catch {}

          if (this.networkId && peerNetworkId !== this.networkId) {
            throw `Peer is in different network: ${peerNetworkId}`;
          }

          p.packInt(supportedFeatures);
          p.packInt(this.selfConnectionUris.length);
          for (const uri of this.selfConnectionUris) {
            p.packString(uri.toString());
          }
          // TODO Protocol version
          // p.packInt(protocolVersion);
          peer.sendMessage(await this.signMessageSimple(p.takeBytes()));
          return;
        } else if (method === recordTypeRegistryEntry) {
          const sre =
            this.config.services.registry.deserializeRegistryEntry(event);
          await this.config.services.registry.set(sre, false, peer);
          return;
        } else if (method === recordTypeStorageLocation) {
          const hash = new Multihash(event.subarray(1, 34));
          const type = event[34];
          const expiry = decodeEndian(event.subarray(35, 39));
          const partCount = event[39];
          const parts: string[] = [];
          let cursor = 40;
          for (let i = 0; i < partCount; i++) {
            const length = decodeEndian(event.subarray(cursor, cursor + 2));
            cursor += 2;
            parts.push(
              new TextDecoder().decode(event.subarray(cursor, cursor + length)),
            );
            cursor += length;
          }
          cursor++;

          const publicKey = event.subarray(cursor, cursor + 33);
          const signature = event.subarray(cursor + 33);

          if (publicKey[0] !== mkeyEd25519) {
            throw `Unsupported public key type ${mkeyEd25519}`;
          }

          if (
            !ed25519.verify(
              signature,
              event.subarray(0, cursor),
              publicKey.subarray(1),
            )
          ) {
            return;
          }

          const nodeId = new NodeId(publicKey);
          await addStorageLocation({
            hash,
            nodeId,
            location: new StorageLocation(type, parts, expiry),
            message: event,
            config: this.config,
          });

          const list =
            this.hashQueryRoutingTable.get(hash) || new Set<NodeId>();
          for (const peerId of list) {
            if (peerId.equals(nodeId)) {
              continue;
            }
            if (peerId.equals(peer.id)) {
              continue;
            }

            if (this._peers.has(peerId.toString())) {
              try {
                this._peers.get(peerId.toString())?.sendMessage(event);
              } catch (e) {
                this.logger.catched(e);
              }
            }
          }
          this.hashQueryRoutingTable.delete(hash);
        }

        if (method === protocolMethodSignedMessage) {
          const sm = await this.unpackAndVerifySignature(u);
          u = Unpacker.fromPacked(sm.message);
          const method2 = u.unpackInt();

          if (method2 === protocolMethodHandshakeDone) {
            const challenge = u.unpackBinary();

            if (!equalBytes(peer.challenge, challenge)) {
              throw "Invalid challenge";
            }

            const pId = sm.nodeId;

            if (!verifyId) {
              peer.id = pId;
            } else {
              if (!peer.id.equals(pId)) {
                throw "Invalid peer id on initial list";
              }
            }

            peer.isConnected = true;

            const supportedFeatures = u.unpackInt();

            if (supportedFeatures !== 3) {
              throw "Remote node does not support required features";
            }

            this._peers.set(peer.id.toString(), peer);
            this.reconnectDelay.set(peer.id.toString(), 1);

            const connectionUrisCount = u.unpackInt() as number;

            peer.connectionUris = [];
            for (let i = 0; i < connectionUrisCount; i++) {
              peer.connectionUris.push(new URL(u.unpackString() as string));
            }

            this.logger.info(
              `[+] ${peer.id.toString()} (${peer
                .renderLocationUri()
                .toString()})`,
            );

            this.sendPublicPeersToPeer(peer, Array.from(this._peers.values()));
            for (const p of this._peers.values()) {
              if (p.id.equals(peer.id)) continue;

              if (p.isConnected) {
                this.sendPublicPeersToPeer(p, [peer]);
              }
            }

            return;
          } else if (method2 === protocolMethodAnnouncePeers) {
            const length = u.unpackInt() as number;
            for (let i = 0; i < length; i++) {
              const peerIdBinary = u.unpackBinary();
              const id = new NodeId(peerIdBinary);

              const isConnected = u.unpackBool() as boolean;

              const connectionUrisCount = u.unpackInt() as number;

              const connectionUris: URL[] = [];

              for (let i = 0; i < connectionUrisCount; i++) {
                connectionUris.push(new URL(u.unpackString() as string));
              }

              if (connectionUris.length > 0) {
                // TODO Fully support multiple connection uris
                const uri = new URL(connectionUris[0].toString());
                uri.username = id.toBase58();
                if (
                  !this.reconnectDelay.has(
                    NodeId.decode(uri.username).toString(),
                  )
                ) {
                  this.connectToNode([uri]);
                }
              }
            }
          }
        } /* else if (method === protocolMethodRegistryQuery) {
          const pk = u.unpackBinary();
          const sre = node.registry.getFromDB(pk);
          if (sre !== null) {
            peer.sendMessage(node.registry.serializeRegistryEntry(sre));
          }
        }*/
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

    const signature = ed25519.sign(this.nodeKeyPair.extractBytes(), message);

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

  async connectToNode(connectionUris: URL[]): Promise<void> {
    const unsupported = new URL("");
    unsupported.protocol = "unsupported";

    const connectionUri =
      connectionUris.find((uri) => ["ws", "wss"].includes(uri.protocol)) ||
      connectionUris.find((uri) => uri.protocol === "tcp") ||
      unsupported;

    if (connectionUri.protocol === "unsupported") {
      throw new Error(
        `None of the available connection URIs are supported (${connectionUris})`,
      );
    }

    const protocol = connectionUri.protocol;

    if (!connectionUri.username) {
      throw new Error("Connection URI does not contain node id");
    }

    const id = NodeId.decode(connectionUri.username);

    this.reconnectDelay.set(
      id.toString(),
      this.reconnectDelay.get(id.toString()) || 1,
    );

    if (id.equals(this.localNodeId)) {
      return;
    }

    let retried = false;

    try {
      this.logger.verbose(`[connect] ${connectionUri}`);
      if (protocol === "tcp") {
        const ip = connectionUri.host;
        const port = parseInt(connectionUri.port);
        const socket = await tcpConnect(port, ip);

        const peer = new TcpPeer(socket, [connectionUri]);
        peer.id = id;

        await this.onNewPeer(peer, true);
      } else {
        const locationUri = new URL(connectionUri.toString());
        locationUri.username = "";

        const channel = await wsConnect(locationUri.toString());
        const peer = new WebSocketPeer(channel, [connectionUri]);
        peer.id = id;
        await this.onNewPeer(peer, true);
      }
    } catch (e) {
      if (retried) return;
      retried = true;

      this.logger.catched(e);

      /*      if (e instanceof SocketException) {
              if (e.message === "Connection refused") {
                this.logger.warn(`[!] ${id}: ${e}`);
              } else {
                this.logger.catched(e);
              }
            } else {
              this.logger.catched(e);
            }*/

      const delay = this.reconnectDelay.get(id)!;
      this.reconnectDelay.set(id, delay * 2);
      await new Promise((resolve) => setTimeout(resolve, delay * 1000));

      await this.connectToNode(connectionUris);
    }
  }
}
