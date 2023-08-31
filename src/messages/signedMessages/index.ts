import { P2PSignedMessageHandler } from "#types.js";
import handshakeDone from "#messages/signedMessages/handshakeDone.js";

const messages = new Map<number, P2PSignedMessageHandler>(
  Object.entries({
    protocolMethodHandshakeOpen: handshakeDone,
  }).map(([key, value]) => [Number(key), value]),
);

Object.freeze(messages);

export default messages;
