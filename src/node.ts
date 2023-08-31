import { Multihash } from "./multihash.js";
import NodeId from "./nodeId.js";
import { Logger, S5Config, S5Services } from "./types.js";
import Unpacker from "./serialization/unpack.js";
import Packer from "./serialization/pack.js";
import StorageLocation from "./storage.js";
import KeyPairEd25519 from "#ed25519.js";
import { AbstractLevel } from "abstract-level";
import { P2PService } from "#service/p2p.js";
import { RegistryService } from "#service/registry.js";
const DEFAULT_LOGGER = {
  info(s: any) {
    console.info(s);
  },
  verbose(s: any) {
    console.log(s);
  },
  warn(s: any) {
    console.warn(s);
  },
  error(s: any) {
    console.error(s);
  },
  catched(e: any, context?: string | null) {
    console.error(e, context);
  },
};

export interface S5NodeConfig {
  p2p?: {
    network: string;
    peers?: {
      initial?: string[];
    };
  };
  keyPair: KeyPairEd25519;
  db: AbstractLevel<Uint8Array, string, Uint8Array>;
  logger?: Logger;
}

export class S5Node {
  private _nodeConfig: S5NodeConfig;
  private _config?: S5Config;
  constructor(config: S5NodeConfig) {
    this._nodeConfig = config;
  }

  public async start() {
    this._config = {
      keyPair: this._nodeConfig.keyPair,
      db: this._nodeConfig.db,
      logger: this._nodeConfig.logger ?? DEFAULT_LOGGER,
      cacheDb: this._nodeConfig.db.sublevel("s5-object-cache", {}),
      services: {} as any,
    };

    const p2p = new P2PService(this);
    const registry = new RegistryService(this);

    await p2p.init();
    await registry.init();
    await p2p.start();
  }

  get services() {
    return this._config?.services as S5Services;
  }
  get config() {
    return this._config as S5Config;
  }
  get db() {
    return this._config?.db as AbstractLevel<Uint8Array, string, Uint8Array>;
  }
  get logger() {
    return this._config?.logger as Logger;
  }
}

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
