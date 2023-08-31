import { URL } from "url";
import { TcpPeer } from "#transports/tcp.js";
import { WebSocketPeer } from "#transports/webSocket.js";
import { PeerStatic } from "#types.js";
import isNode from "detect-node";
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
  socket: any,
  connectionUris: URL[] = [],
) {
  if (!isTransport(type)) {
    throw new Error(`transport ${type} does not exist`);
  }

  const transport = transports.get(type) as PeerStatic;

  return new transport(socket, connectionUris);
}

if (isNode) {
  registerTransport("tcp", TcpPeer);
}
registerTransport("ws", WebSocketPeer);
registerTransport("wss", WebSocketPeer);
