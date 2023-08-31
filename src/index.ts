import { S5Node } from "#node.js";
import type { SignedRegistryEntry } from "#service/registry.js";
import { ed25519 } from "@noble/curves/ed25519";
import KeyPairEd25519 from "#ed25519.js";
import { S5NodeConfig } from "./types.js";
import NodeId from "#nodeId.js";

export * from "./types.js";
export {
  createTransportSocket,
  isTransport,
  createTransportPeer,
  BasePeer,
} from "./transports/index.js";
export type { SignedRegistryEntry };
export { NodeId };

export function createNode(config: S5NodeConfig) {
  return new S5Node(config);
}

export function createKeyPair(privateKey?: Uint8Array) {
  return new KeyPairEd25519(privateKey ?? ed25519.utils.randomPrivateKey());
}
