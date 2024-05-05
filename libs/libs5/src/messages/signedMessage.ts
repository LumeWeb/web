import { S5Node } from "../node.js";
import { Peer } from "../types.js";
import Unpacker from "../serialization/unpack.js";
import messages from "../messages/signedMessages/index.js";

export default async function (
  node: S5Node,
  peer: Peer,
  data: Unpacker,
  rawData: Uint8Array,
  verifyId = true,
) {
  const sm = await node.services.p2p.unpackAndVerifySignature(data);
  const u = Unpacker.fromPacked(sm.message);
  const method = u.unpackInt();

  if (method !== null && messages.has(method)) {
    await messages.get(method)?.(node, peer, u, sm, verifyId);
  }
}
