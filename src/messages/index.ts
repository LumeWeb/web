import { P2PMessageHandler } from "#types.js";
import handshakeOpen from "#messages/handshakeOpen.js";
import {
  protocolMethodHandshakeOpen,
  protocolMethodHashQuery,
  protocolMethodRegistryQuery,
  protocolMethodSignedMessage,
  recordTypeRegistryEntry,
  recordTypeStorageLocation,
} from "#constants.js";
import registryQuery from "#messages/registryQuery.js";
import registryEntry from "#messages/registryEntry.js";
import storageLocation from "#messages/storageLocation.js";
import signedMessage from "#messages/signedMessage.js";
import hashQuery from "#messages/hashQuery.js";

const messages = new Map<number, P2PMessageHandler>(
  Object.entries({
    [protocolMethodHandshakeOpen]: handshakeOpen,
    [protocolMethodRegistryQuery]: registryQuery,
    [recordTypeRegistryEntry]: registryEntry,
    [recordTypeStorageLocation]: storageLocation,
    [protocolMethodSignedMessage]: signedMessage,
    [protocolMethodHashQuery]: hashQuery,
  }).map(([key, value]) => [Number(key), value]),
);

Object.freeze(messages);

export default messages;
