import { S5Node } from "#node.js";
import { Peer, SignedMessage } from "#types.js";
import Unpacker from "#serialization/unpack.js";
import { equalBytes } from "@noble/curves/abstract/utils";
import { URL } from "url";

export default async function (
  node: S5Node,
  peer: Peer,
  data: Unpacker,
  message: SignedMessage,
  verifyId: boolean,
) {
  if (!node.started) {
    peer.end();
    return;
  }
  const p2p = node.services.p2p;
  const challenge = data.unpackBinary();

  if (!equalBytes(peer.challenge, challenge)) {
    throw "Invalid challenge";
  }

  const pId = message.nodeId;

  if (!verifyId) {
    peer.id = pId;
  } else {
    if (!peer.id.equals(pId)) {
      throw "Invalid transports id on initial list";
    }
  }

  peer.isConnected = true;

  const supportedFeatures = data.unpackInt();

  if (supportedFeatures !== 3) {
    throw "Remote node does not support required features";
  }

  p2p.peers.set(peer.id.toString(), peer);
  p2p.reconnectDelay.set(peer.id.toString(), 1);

  const connectionUrisCount = data.unpackInt() as number;

  peer.connectionUris = [];
  for (let i = 0; i < connectionUrisCount; i++) {
    peer.connectionUris.push(new URL(data.unpackString() as string));
  }

  node.logger.info(
    `[+] ${peer.id.toString()} (${peer.renderLocationUri().toString()})`,
  );

  p2p.sendPublicPeersToPeer(peer, Array.from(p2p.peers.values()));
  for (const p of p2p.peers.values()) {
    if (p.id.equals(peer.id)) {
      continue;
    }

    if (p.isConnected) {
      p2p.sendPublicPeersToPeer(p, [peer]);
    }
  }
  p2p.emit("peerConnected", peer);
}
