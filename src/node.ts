import { Multihash } from "./multihash.js";
import NodeId from "./nodeId.js";
import { Logger, S5Config, S5NodeConfig, S5Services } from "./types.js";
import Unpacker from "./serialization/unpack.js";
import Packer from "./serialization/pack.js";
import StorageLocation from "./storage.js";
import KeyPairEd25519 from "#ed25519.js";
import { AbstractLevel } from "abstract-level";
import { P2PService } from "#service/p2p.js";
import { RegistryService } from "#service/registry.js";
import { hash } from "@noble/hashes/_assert";
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

export class S5Node {
  private _nodeConfig: S5NodeConfig;

  constructor(config: S5NodeConfig) {
    this._nodeConfig = config;
  }

  private _started = false;

  get started(): boolean {
    return this._started;
  }

  private _config?: S5Config;

  get config() {
    return this._config as S5Config;
  }

  get services() {
    return this._config?.services as S5Services;
  }

  get db() {
    return this._config?.db as AbstractLevel<Uint8Array, string, Uint8Array>;
  }

  get logger() {
    return this._config?.logger as Logger;
  }

  public async start() {
    this._config = {
      keyPair: this._nodeConfig.keyPair,
      db: this._nodeConfig.db,
      logger: this._nodeConfig.logger ?? DEFAULT_LOGGER,
      cacheDb: this._nodeConfig.db.sublevel("s5-object-cache", {
        valueEncoding: "buffer",
      }),
      services: {} as any,
      p2p: this._nodeConfig.p2p,
    };

    this._started = true;

    const p2p = new P2PService(this);
    const registry = new RegistryService(this);

    await p2p.init();
    await registry.init();
    await p2p.start();
  }

  public async stop() {
    this._started = false;
    await this.services.p2p.stop();
  }

  async getCachedStorageLocations(
    hash: Multihash,
    types: number[],
  ): Promise<Map<NodeId, StorageLocation>> {
    const locations = new Map<NodeId, StorageLocation>();

    const map = await this.readStorageLocationsFromDB(hash); // Assuming this method exists and returns a Map or similar structure
    if (map.size === 0) {
      return new Map();
    }

    const ts = Math.floor(Date.now() / 1000);

    types.forEach((type) => {
      if (!map.has(type)) return;

      map.get(type)!.forEach((value, key) => {
        if (value[3] >= ts) {
          const storageLocation = new StorageLocation(
            type,
            value[1].map((v: string) => v), // Assuming value[1] is an array of strings
            value[3],
          );

          // Assuming providerMessage is a property of StorageLocation
          storageLocation.providerMessage = value[4];
          locations.set(key, storageLocation);
        }
      });
    });

    return locations;
  }

  async readStorageLocationsFromDB(
    hash: Multihash,
  ): Promise<Map<number, Map<NodeId, Map<number, any>>>> {
    const map = new Map<number, Map<NodeId, Map<number, any>>>();
    const bytes = await this.db.get(stringifyHash(hash));
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

  async addStorageLocation({
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
    const map = await this.readStorageLocationsFromDB(hash);
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
