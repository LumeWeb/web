import Packer from "@/serialization/pack.js";
import { protocolMethodHandshakeDone, supportedFeatures } from "@/constants.js";
import { S5Node } from "@/node.js";
import { Peer } from "@/types.js";
import Unpacker from "@/serialization/unpack.js";

export default async function (
  node: S5Node,
  peer: Peer,
  data: Unpacker,
  rawData: Uint8Array,
) {
  const p2p = node.services.p2p;
  const p = new Packer();
  p.packInt(protocolMethodHandshakeDone);
  p.packBinary(data.unpackBinary());
  let peerNetworkId: string | null = null;
  try {
    peerNetworkId = data.unpackString();
  } catch {}

  if (node.services.p2p.networkId && peerNetworkId !== p2p.networkId) {
    throw `Peer is in different network: ${peerNetworkId}`;
  }

  p.packInt(supportedFeatures);
  p.packInt(p2p.selfConnectionUris.length);
  for (const uri of p2p.selfConnectionUris) {
    p.packString(uri.toString());
  }
  // TODO Protocol version
  // p.packInt(protocolVersion);
  peer.sendMessage(await p2p.signMessageSimple(p.takeBytes()));
}
