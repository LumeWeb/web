import { S5Node } from "#node.js";
import type { S5NodeConfig } from "#node.js";
import type { SignedRegistryEntry } from "#service/registry.js";
import { ed25519 } from "@noble/curves/ed25519";
import KeyPairEd25519 from "#ed25519.js";

export * from "./types.js";
export {
  createTransportSocket,
  isTransport,
  createTransportPeer,
} from "./transports/index.js";
export type { S5NodeConfig, SignedRegistryEntry };

export function createNode(config: S5NodeConfig) {
  return new S5Node(config);
}

export function createKeyPair(privateKey?: Uint8Array) {
  return new KeyPairEd25519(privateKey ?? ed25519.utils.randomPrivateKey());
}
