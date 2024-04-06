import { P2PSignedMessageHandler } from "#types.js";
import handshakeDone from "#messages/signedMessages/handshakeDone.js";
import {
  protocolMethodAnnouncePeers,
  protocolMethodHandshakeDone,
} from "#constants.js";
import announcePeers from "#messages/signedMessages/announcePeers.js";

const messages = new Map<number, P2PSignedMessageHandler>(
  Object.entries({
    [protocolMethodHandshakeDone]: handshakeDone,
    [protocolMethodAnnouncePeers]: announcePeers,
  }).map(([key, value]) => [Number(key), value]),
);

Object.freeze(messages);

export default messages;
