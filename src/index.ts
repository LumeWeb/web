import { S5Node } from "#node.js";
import type { S5NodeConfig } from "#node.js";

export * from "./types.js";
export type { S5NodeConfig };

export function createNode(config: S5NodeConfig) {
  return new S5Node(config);
}
