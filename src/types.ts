import NodeId from "./nodeId.js";
import KeyPairEd25519 from "#ed25519.js";
import { AbstractLevel } from "abstract-level";
import { P2PService } from "./service/p2p.js";
import { RegistryService } from "./service/registry.js";

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
    network: string;
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
export interface SignedMessage {
  nodeId: NodeId;
  message: Uint8Array;
}
