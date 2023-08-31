import { S5Node } from "#node.js";
import type { S5NodeConfig } from "#node.js";
import type { SignedRegistryEntry } from "#service/registry.js";

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
