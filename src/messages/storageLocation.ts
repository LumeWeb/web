import { S5Node } from "#node.js";
import { Peer } from "#types.js";
import Unpacker from "#serialization/unpack.js";
import { Multihash } from "#multihash.js";
import { decodeEndian } from "#util.js";
import { mkeyEd25519 } from "#constants.js";
import { ed25519 } from "@noble/curves/ed25519";
import NodeId from "#nodeId.js";
import StorageLocation from "#storage.js";

export default async function (
  node: S5Node,
  peer: Peer,
  data: Unpacker,
  rawData: Uint8Array,
) {
  const p2p = node.services.p2p;
  const hash = new Multihash(rawData.subarray(1, 34));
  const type = rawData[34];
  const expiry = decodeEndian(rawData.subarray(35, 39));
  const partCount = rawData[39];
  const parts: string[] = [];
  let cursor = 40;
  for (let i = 0; i < partCount; i++) {
    const length = decodeEndian(rawData.subarray(cursor, cursor + 2));
    cursor += 2;
    parts.push(
      new TextDecoder().decode(rawData.subarray(cursor, cursor + length)),
    );
    cursor += length;
  }
  cursor++;

  const publicKey = rawData.subarray(cursor, cursor + 33);
  const signature = rawData.subarray(cursor + 33);

  if (publicKey[0] !== mkeyEd25519) {
    throw `Unsupported public key type ${mkeyEd25519}`;
  }

  if (
    !ed25519.verify(
      signature,
      rawData.subarray(0, cursor),
      publicKey.subarray(1),
    )
  ) {
    return;
  }

  const nodeId = new NodeId(publicKey);
  await node.addStorageLocation({
    hash,
    nodeId,
    location: new StorageLocation(type, parts, expiry),
    message: rawData,
    config: node.config,
  });

  const list = p2p.hashQueryRoutingTable.get(hash) || new Set<NodeId>();
  for (const peerId of list) {
    if (peerId.equals(nodeId)) {
      continue;
    }
    if (peerId.equals(peer.id)) {
      continue;
    }

    if (p2p.peers.has(peerId.toString())) {
      try {
        p2p.peers.get(peerId.toString())?.sendMessage(rawData);
      } catch (e) {
        node.logger.catched(e);
      }
    }
  }
  this.hashQueryRoutingTable.delete(hash);
}
