import { S5Node } from "#node.js";
import { Peer } from "#types.js";
import Unpacker from "#serialization/unpack.js";
import { Multihash } from "#multihash.js";

export default async function (
  node: S5Node,
  peer: Peer,
  data: Unpacker,
  rawData: Uint8Array,
) {
  const hash = new Multihash(data.unpackBinary());
  const types = data.unpackList().map((item) => Number(item));

  try {
    const map = await node.getCachedStorageLocations(hash, types);

    if (Object.keys(map).length > 0) {
      const availableNodes = [...map.keys()];
      node.services.p2p.sortNodesByScore(availableNodes);

      const entry = map.get(availableNodes[0]);

      peer.sendMessage(entry?.providerMessage as Uint8Array);
      return;
    }
  } catch (e) {
    node.logger.catched(e);
  }

  const hashCode = hash.hashCode;

  if (node.hashQueryRoutingTable.has(hashCode)) {
    if (!node.hashQueryRoutingTable[hashCode].includes(peer.id)) {
      node.hashQueryRoutingTable[hashCode].push(peer.id);
    }
    return;
  }

  node.hashQueryRoutingTable.set(hashCode, new Set([peer.id]));
  for (const p of node.services.p2p.peers.values()) {
    if (p.id !== peer.id) {
      p.sendMessage(rawData);
    }
  }

  return;
}
