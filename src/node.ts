import { Multihash } from "./multihash.js";
import NodeId from "./nodeId.js";
import { S5Config } from "./types.js";
import Unpacker from "./serialization/unpack.js";
import Packer from "./serialization/pack.js";
import StorageLocation from "./storage.js";

export async function readStorageLocationsFromDB({
  hash,
  config,
}: {
  hash: Multihash;
  config: S5Config;
}): Promise<Map<number, Map<NodeId, Map<number, any>>>> {
  const map = new Map<number, Map<NodeId, Map<number, any>>>();
  const bytes = await config.db.get(stringifyHash(hash));
  if (bytes === null) {
    return map;
  }
  const unpacker = Unpacker.fromPacked(bytes);
  const mapLength = unpacker.unpackMapLength();
  for (let i = 0; i < mapLength; i++) {
    const type = unpacker.unpackInt() as number;
    const innerMap = new Map<NodeId, Map<number, any>>();
    map.set(type, innerMap);
    const innerMapLength = unpacker.unpackMapLength();
    for (let j = 0; j < innerMapLength; j++) {
      const nodeId = new NodeId(unpacker.unpackBinary());
      innerMap.set(nodeId, new Map(unpacker.unpackMap() as [number, any][]));
    }
  }
  return map;
}

export async function addStorageLocation({
  hash,
  nodeId,
  location,
  message,
  config,
}: {
  hash: Multihash;
  nodeId: NodeId;
  location: StorageLocation;
  message?: Uint8Array;
  config: S5Config;
}) {
  const map = this.readStorageLocationsFromDB(hash);
  const innerMap =
    map.get(location.type) || new Map<NodeId, Map<number, any>>();
  map.set(location.type, innerMap);

  const locationMap = new Map<number, any>([
    [1, location.parts],
    // [2, location.binaryParts],
    [3, location.expiry],
    [4, message],
  ]);

  innerMap.set(nodeId, locationMap);
  await config.cacheDb.put(
    stringifyHash(hash),
    new Packer().pack(map).takeBytes(),
  );
}

export function stringifyBytes(data: Uint8Array) {
  return String.fromCharCode(...data);
}

function stringifyHash(hash: Multihash) {
  return stringifyBytes(hash.fullBytes);
}
export function stringifyNode(node: NodeId) {
  return stringifyBytes(node.bytes);
}
