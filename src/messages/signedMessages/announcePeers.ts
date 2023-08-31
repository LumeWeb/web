import { S5Node } from "#node.js";
import { Peer, SignedMessage } from "#types.js";
import Unpacker from "#serialization/unpack.js";
import { equalBytes } from "@noble/curves/abstract/utils";
import { URL } from "url";
import NodeId from "#nodeId.js";

export default async function (
  node: S5Node,
  peer: Peer,
  data: Unpacker,
  message: SignedMessage,
  verifyId: boolean,
) {
  const length = data.unpackInt() as number;
  for (let i = 0; i < length; i++) {
    const peerIdBinary = data.unpackBinary();
    const id = new NodeId(peerIdBinary);

    const isConnected = data.unpackBool() as boolean;

    const connectionUrisCount = data.unpackInt() as number;

    const connectionUris: URL[] = [];

    for (let i = 0; i < connectionUrisCount; i++) {
      connectionUris.push(new URL(data.unpackString() as string));
    }

    if (connectionUris.length > 0) {
      // TODO Fully support multiple connection uris
      const uri = new URL(connectionUris[0].toString());
      uri.username = id.toBase58();
      if (!this.reconnectDelay.has(NodeId.decode(uri.username).toString())) {
        node.services.p2p.connectToNode([uri]);
      }
    }
  }
}
