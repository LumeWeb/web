import { Multihash } from "./multihash.js";
import NodeId from "./nodeId.js";
import { Logger, S5Config, S5NodeConfig, S5Services } from "./types.js";
import Unpacker from "./serialization/unpack.js";
import Packer from "./serialization/pack.js";
import StorageLocation, { StorageLocationProvider } from "./storage.js";
import { AbstractLevel } from "abstract-level";
import { P2PService } from "@/service/p2p.js";
import { RegistryService } from "@/service/registry.js";
import {
  CID_TYPES,
  storageLocationTypeFile,
  storageLocationTypeFull,
} from "@/constants.js";
import axios from "axios";
import { equalBytes } from "@noble/curves/abstract/utils";
import { blake3 } from "@noble/hashes/blake3";
import CID from "@/cid.js";
import type Metadata from "@/serialization/metadata/base.js";
import { deserialize as deserializeMediaMetadata } from "@/serialization/metadata/media.js";
import { deserialize as deserializeWebAppMetadata } from "@/serialization/metadata/webapp.js";
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
  private metadataCache: Map<Multihash, Metadata> = new Map<
    Multihash,
    Metadata
  >();

  constructor(config: S5NodeConfig) {
    this._nodeConfig = config;
  }

  private _started = false;

  private _hashQueryRoutingTable: Map<number, Set<NodeId>> = new Map();

  get hashQueryRoutingTable(): Map<number, Set<NodeId>> {
    return this._hashQueryRoutingTable;
  }

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
        if (value.get(3) >= ts) {
          const storageLocation = new StorageLocation(
            type,
            value.get(1).map((v: string) => v), // Assuming value[1] is an array of strings
            value.get(3),
          );

          // Assuming providerMessage is a property of StorageLocation
          storageLocation.providerMessage = value.get(4);
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
    let bytes;
    try {
      bytes = await this.config.cacheDb.get(stringifyHash(hash));
    } catch {
      return map;
    }
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
        innerMap.set(
          nodeId,
          new Map(
            Object.entries(unpacker.unpackMap()).map(([key, value]) => [
              Number(key),
              value,
            ]),
          ),
        );
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

  async downloadBytesByHash(hash: Multihash): Promise<Uint8Array> {
    const dlUriProvider = new StorageLocationProvider(this, hash, [
      storageLocationTypeFull,
      storageLocationTypeFile,
    ]);

    dlUriProvider.start();

    let retryCount = 0;
    while (true) {
      const dlUri = await dlUriProvider.next();

      this.logger.verbose(`[try] ${dlUri.location.bytesUrl}`);

      try {
        const res = await axios.get(dlUri.location.bytesUrl, {
          timeout: 30000, // Adjust timeout as needed
          responseType: "arraybuffer",
        });

        // Assuming rust.hashBlake3 and areBytesEqual are available functions
        const resHash = blake3(Buffer.from(res.data));

        if (!equalBytes(hash.hashBytes, resHash)) {
          throw new Error("Integrity verification failed");
        }

        dlUriProvider.upvote(dlUri);
        return res.data;
      } catch (error) {
        this.logger.catched(error);

        dlUriProvider.downvote(dlUri);
      }

      retryCount++;
      if (retryCount > 32) {
        throw new Error("Too many retries");
      }
    }
  }
  async getMetadataByCID(cid: CID): Promise<Metadata> {
    const hash = cid.hash;

    let metadata: Metadata;

    if (this.metadataCache.has(hash)) {
      metadata = this.metadataCache.get(hash)!;
    } else {
      const bytes = await this.downloadBytesByHash(hash);

      switch (cid.type) {
        case CID_TYPES.METADATA_MEDIA:
          metadata = await deserializeMediaMetadata(bytes);
          break;
        case CID_TYPES.METADATA_WEBAPP:
          metadata = await deserializeWebAppMetadata(bytes);
          break;
        case CID_TYPES.BRIDGE:
          metadata = await deserializeMediaMetadata(bytes);
          break;
        default:
          throw new Error("Unsupported metadata format");
      }

      this.metadataCache.set(hash, metadata);
    }
    return metadata;
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
