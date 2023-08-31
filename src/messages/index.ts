import { P2PMessageHandler } from "#types.js";
import handshakeOpen from "#messages/handshakeOpen.js";

const messages = new Map<number, P2PMessageHandler>(
  Object.entries({
    protocolMethodHandshakeOpen: handshakeOpen,
  }).map(([key, value]) => [Number(key), value]),
);

Object.freeze(messages);

export default messages;
