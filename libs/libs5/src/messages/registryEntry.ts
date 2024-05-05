import { S5Node } from "../node.js";
import { Peer } from "../types.js";
import Unpacker from "../serialization/unpack.js";

export default async function (
  node: S5Node,
  peer: Peer,
  data: Unpacker,
  rawData: Uint8Array,
) {
  const sre = node.services.registry.deserializeRegistryEntry(rawData);
  await node.services.registry.set(sre, false, peer);
}
