import { S5Node } from "#node.js";
import type { SignedRegistryEntry } from "#types.js";
import { ed25519 } from "@noble/curves/ed25519";
import KeyPairEd25519 from "#ed25519.js";
import { S5NodeConfig } from "./types.js";
import NodeId from "#nodeId.js";
import CID from "#cid.js";

export * from "./types.js";
export * from "./constants.js";
export * from "./util.js";
export type { S5Node } from "./node.js";
export {
  createTransportSocket,
  isTransport,
  createTransportPeer,
  BasePeer,
} from "./transports/index.js";
export type { SignedRegistryEntry, KeyPairEd25519 };

import Packer from "./serialization/pack.js";
import Unpacker from "./serialization/unpack.js";

export { Packer, Unpacker, CID };

export function createNode(config: S5NodeConfig) {
  return new S5Node(config);
}

export function createKeyPair(privateKey?: Uint8Array) {
  return new KeyPairEd25519(privateKey ?? ed25519.utils.randomPrivateKey());
}
