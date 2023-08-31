import NodeId from "./nodeId.js";
import KeyPairEd25519 from "#ed25519.js";
import { AbstractLevel } from "abstract-level";
import { P2PService } from "./service/p2p.js";
import { RegistryService } from "./service/registry.js";
import { S5Node } from "#node.js";
import Unpacker from "#serialization/unpack.js";
import type { URL } from "url";

export interface Peer {
  id: NodeId;
  connectionUris: Array<URL>;
  isConnected: boolean;
  challenge: Uint8Array;
  sendMessage(message: Uint8Array): void;

  listenForMessages(
    callback: (event: any) => Promise<void>,
    {
      onDone,
      onError,
      logger,
    }: {
      onDone?: any;
      onError?: (...args: any[]) => void;
      logger: Logger;
    },
  ): void;

  renderLocationUri(): string;
}

// Define the static side of the class
export interface PeerStatic {
  new (_socket: any, uri: URL[]): Peer;
  connect(uri: URL): Promise<any>;
}

export interface Logger {
  info(s: string): void;
  verbose(s: string): void;
  warn(s: string): void;
  error(s: string): void;
  catched(e: any, context?: string | null): void;
}

export interface S5Services {
  p2p: P2PService;
  registry: RegistryService;
}

export interface S5Config {
  p2p?: {
    network?: string;
    peers?: {
      initial?: string[];
    };
  };
  keyPair: KeyPairEd25519;
  logger: Logger;
  db: AbstractLevel<Uint8Array, string, Uint8Array>;
  cacheDb: AbstractLevel<Uint8Array, string, Uint8Array>;
  services: S5Services;
}

export interface S5NodeConfig {
  p2p?: {
    network?: string;
    peers?: {
      initial?: string[];
    };
  };
  keyPair: KeyPairEd25519;
  db: AbstractLevel<Uint8Array, string, Uint8Array>;
  logger?: Logger;
}

export interface SignedMessage {
  nodeId: NodeId;
  message: Uint8Array;
}

export type P2PMessageHandler = (
  node: S5Node,
  peer: Peer,
  data: Unpacker,
  rawData: Uint8Array,
  verifyId: boolean,
) => Promise<void>;

export type P2PSignedMessageHandler = (
  node: S5Node,
  peer: Peer,
  data: Unpacker,
  message: SignedMessage,
  verifyId: boolean,
) => Promise<void>;
