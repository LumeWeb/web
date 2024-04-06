import { S5Node } from "#node.js";
import { Peer } from "#types.js";
import Unpacker from "#serialization/unpack.js";

export default async function (
  node: S5Node,
  peer: Peer,
  data: Unpacker,
  rawData: Uint8Array,
) {
  const pk = data.unpackBinary();
  const sre = await node.services.registry.getFromDB(pk);
  if (sre !== null) {
    peer.sendMessage(node.services.registry.serializeRegistryEntry(sre));
  }
}
