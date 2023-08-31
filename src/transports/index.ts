import { URL } from "url";
import { TcpPeer } from "#transports/tcp.js";
import { WebSocketPeer } from "#transports/webSocket.js";
import { PeerConstructorOptions, PeerStatic } from "#types.js";
import isNode from "detect-node";
import { BasePeer } from "#transports/base.js";
const transports = new Map<string, PeerStatic>();

export function registerTransport(type: string, transport: PeerStatic) {
  transports.set(type, transport);
}

export function isTransport(type: string) {
  return transports.has(type);
}

export function createTransportSocket(type: string, uri: URL) {
  if (!isTransport(type)) {
    throw new Error(`transport ${type} does not exist`);
  }

  const transport = transports.get(type) as PeerStatic;

  return transport.connect(uri);
}

export function createTransportPeer(
  type: string,
  params: PeerConstructorOptions,
) {
  if (!isTransport(type)) {
    throw new Error(`transport ${type} does not exist`);
  }

  const transport = transports.get(type) as PeerStatic;

  return new transport(params);
}

export { BasePeer };

if (isNode) {
  registerTransport("tcp", TcpPeer);
}
registerTransport("ws", WebSocketPeer);
registerTransport("wss", WebSocketPeer);
