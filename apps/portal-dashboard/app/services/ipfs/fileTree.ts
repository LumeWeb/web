// Enum for UnixFS data types
import { IDBDatastore } from "datastore-idb";
import PQueue from "p-queue";
import { CreateResponse, DataProvider } from "@refinedev/core";
import { CID } from "multiformats/cid";
import { Key } from "interface-datastore";
import { SERVICE_ID } from "@/services/ipfs/index.js";
import { PinStatus as BasePinStatus } from "@ipfs-shipyard/pinning-service-client";

export enum DataType {
  Raw = 0,
  Directory = 1,
  File = 2,
  Metadata = 3,
  Symlink = 4,
  HAMTShard = 5,
}

// File tree node structure
export interface FileTreeNode {
  cid: string;
  name: string;
  type: DataType;
  size: number;
  children?: FileTreeNode[];
  pinStatus: PinStatus;
}

export interface PinStatus extends Omit<BasePinStatus, "info"> {
  info: {
    folder: boolean;
    contentType: string;
    [key: string]: string | boolean;
  };
}

export interface BlockMetaResponse {
  name: string;
  type: number;
  block_size: number;
  child_cid: string[];
}

export interface GetBlockMetaBatchRequest {
  cid: string[];
}

export interface GetBlockMetaBatchResponse {
  [cid: string]: BlockMetaResponse;
}

export class FileTree {
  private datastore: IDBDatastore;
  private queue: PQueue;
  private restProvider: DataProvider;
  private authHeaders: Record<string, string>;
  private batchSize: number;
  private pendingBatchFetches: Map<string, Promise<BlockMetaResponse>>;

  constructor(
    restProvider: DataProvider,
    authHeaders: Record<string, string>,
    concurrency = 100,
    batchSize = 50,
  ) {
    this.datastore = new IDBDatastore(`${SERVICE_ID}-meta-cache`);
    this.queue = new PQueue({ concurrency });
    this.restProvider = restProvider;
    this.authHeaders = authHeaders;
    this.batchSize = batchSize;
    this.pendingBatchFetches = new Map();
  }

  async initialize(): Promise<void> {
    await this.datastore.open();
  }

  async getNodesForPins(
    pins: PinStatus[],
    parentCid: string | null,
    offset?: number,
    limit?: number,
  ): Promise<FileTreeNode[]> {
    const cidsToFetch = parentCid
      ? [parentCid]
      : pins.map((pin) => pin.pin.cid);

    // Fetch metadata for all CIDs in batches
    for (let i = 0; i < cidsToFetch.length; i += this.batchSize) {
      const batch = cidsToFetch.slice(i, i + this.batchSize);
      await this.batchFetchBlockMeta(batch);
    }

    if (parentCid === null) {
      return this.getTopLevelNodes(pins, offset, limit);
    } else {
      return this.getChildNodes(parentCid, pins, offset, limit);
    }
  }

  private async getTopLevelNodes(
    pins: PinStatus[],
    offset?: number,
    limit?: number,
  ): Promise<FileTreeNode[]> {
    const topLevelPins = await this.identifyTopLevelPins(pins);
    const sortedNodes = await this.sortNodesFoldersFirst(topLevelPins);
    return this.paginateNodes(sortedNodes, offset, limit);
  }

  private async identifyTopLevelPins(pins: PinStatus[]): Promise<PinStatus[]> {
    const cidSet = new Set(pins.map((pin) => pin.pin.cid));
    const topLevelPins: PinStatus[] = [];
    const childrenSet = new Set<string>();

    // First pass: identify all children
    for (const pin of pins) {
      const blockMeta = await this.getBlockMeta(pin.pin.cid);
      for (const childCid of blockMeta.child_cid) {
        if (cidSet.has(childCid)) {
          childrenSet.add(childCid);
        }
      }
    }

    // Second pass: identify top-level pins
    for (const pin of pins) {
      if (!childrenSet.has(pin.pin.cid)) {
        topLevelPins.push(pin);
      }
    }

    return topLevelPins;
  }

  private async getChildNodes(
    parentCid: string,
    pins: PinStatus[],
    offset?: number,
    limit?: number,
  ): Promise<FileTreeNode[]> {
    const parentMeta = await this.getBlockMeta(parentCid);
    const childCids = parentMeta.child_cid.filter((cid) =>
      pins.some((pin) =>
        CID.parse(pin.pin.cid).toV1().equals(CID.parse(cid).toV1()),
      ),
    );

    const childNodes = await Promise.all(
      childCids.map((cid) => {
        const matchingPin = pins.find((pin) =>
          CID.parse(pin.pin.cid).toV1().equals(CID.parse(cid).toV1()),
        );
        return matchingPin ? this.constructNode(cid, matchingPin) : null;
      }),
    );

    const validChildNodes = childNodes.filter(
      (node): node is FileTreeNode => node !== null,
    );
    const sortedNodes = await this.sortNodesFoldersFirst(validChildNodes);
    return this.paginateNodes(sortedNodes, offset, limit);
  }

  private async sortNodesFoldersFirst(
    nodes: FileTreeNode[] | PinStatus[],
  ): Promise<FileTreeNode[]> {
    const constructedNodes = await Promise.all(
      nodes.map(async (node) => {
        if ("type" in node) {
          return node as FileTreeNode;
        } else {
          return await this.constructNode(node.pin.cid, node);
        }
      }),
    );

    return constructedNodes.sort((a, b) => {
      if (a.type === DataType.Directory && b.type !== DataType.Directory) {
        return -1;
      }
      if (a.type !== DataType.Directory && b.type === DataType.Directory) {
        return 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  private paginateNodes(
    nodes: FileTreeNode[],
    offset?: number,
    limit?: number,
  ): FileTreeNode[] {
    if (offset === undefined || limit === undefined) {
      return nodes;
    }

    return nodes.slice(offset, offset + limit);
  }

  private async constructNode(
    cid: string,
    pinStatus: PinStatus,
  ): Promise<FileTreeNode> {
    const blockMeta = await this.getBlockMeta(cid);
    cid = CID.parse(cid).toV1().toString();
    return {
      cid,
      name: blockMeta.name || cid,
      type: blockMeta.type as DataType,
      size: blockMeta.block_size,
      children: this.isDirectory(blockMeta.type) ? [] : undefined,
      pinStatus: pinStatus,
    };
  }

  private isDirectory(type: number): boolean {
    return type === DataType.Directory || type === DataType.HAMTShard;
  }

  public async getBlockMeta(cid: string): Promise<BlockMetaResponse> {
    const cachedMeta = await this.getCachedBlockMeta(cid);
    if (cachedMeta) {
      return cachedMeta;
    }

    const pendingFetch = this.pendingBatchFetches.get(cid);
    if (pendingFetch) {
      return pendingFetch;
    }

    return this.queue.add(async () => {
      try {
        const response = await this.restProvider.getOne<BlockMetaResponse>({
          resource: "api/block/meta",
          id: cid,
          meta: {
            headers: this.authHeaders,
          },
        });

        if (!response.data) {
          throw new Error(`No metadata found for CID ${cid}`);
        }

        const blockMeta = response.data;
        await this.cacheBlockMeta(cid, blockMeta);
        return blockMeta;
      } catch (error) {
        console.error(`Error fetching block meta for CID ${cid}:`, error);
        throw error;
      }
    }) as Promise<BlockMetaResponse>;
  }

  private async batchFetchBlockMeta(cids: string[]): Promise<void> {
    const uncachedCids = await this.filterUncachedCids(cids);

    if (uncachedCids.length === 0) {
      return;
    }

    const batchPromise = this.queue.add(async () => {
      try {
        const response = await this.restProvider.create<
          CreateResponse<GetBlockMetaBatchResponse>
        >({
          resource: "api/block/meta/batch",
          variables: { cid: uncachedCids } as GetBlockMetaBatchRequest,
          meta: {
            headers: this.authHeaders,
          },
        });

        if (!response.data) {
          throw new Error("No data returned from batch fetch");
        }

        return response.data;
      } catch (error) {
        console.error(`Error fetching batch block meta:`, error);
        throw error;
      }
    });

    try {
      const batchResults = await batchPromise;

      if (!batchResults || typeof batchResults !== "object") {
        throw new Error("Invalid batch results format");
      }

      for (const cid of uncachedCids) {
        if (batchResults.hasOwnProperty(cid)) {
          const blockMeta = batchResults[cid as keyof typeof batchResults];
          if (this.isValidBlockMetaResponse(blockMeta)) {
            await this.cacheBlockMeta(cid, blockMeta);
            this.pendingBatchFetches.set(cid, Promise.resolve(blockMeta));
          } else {
            console.warn(`Invalid metadata format for CID ${cid}`);
            this.pendingBatchFetches.delete(cid);
          }
        } else {
          console.warn(`No metadata found for CID ${cid} in batch response`);
          this.pendingBatchFetches.delete(cid);
        }
      }
    } catch (error) {
      console.error("Error processing batch results:", error);
      for (const cid of uncachedCids) {
        this.pendingBatchFetches.delete(cid);
      }
    }
  }

  private isValidBlockMetaResponse(data: any): data is BlockMetaResponse {
    return (
      typeof data === "object" &&
      data !== null &&
      typeof data.type === "number" &&
      typeof data.block_size === "number" &&
      Array.isArray(data.child_cid)
    );
  }

  private async filterUncachedCids(cids: string[]): Promise<string[]> {
    const uncachedCids: string[] = [];
    for (const cid of cids) {
      const cachedMeta = await this.getCachedBlockMeta(cid);
      if (!cachedMeta) {
        uncachedCids.push(cid);
      }
    }
    return uncachedCids;
  }

  private async getCachedBlockMeta(
    cid: string,
  ): Promise<BlockMetaResponse | null> {
    const key = new Key(`block-meta:${cid}`);
    try {
      const cachedData = await this.datastore.get(key);
      return JSON.parse(new TextDecoder().decode(cachedData));
    } catch (error) {
      return null;
    }
  }

  private async cacheBlockMeta(
    cid: string,
    meta: BlockMetaResponse,
  ): Promise<void> {
    const key = new Key(`block-meta:${cid}`);
    await this.datastore.put(
      key,
      new TextEncoder().encode(JSON.stringify(meta)),
    );
  }

  async searchNodes(query: string, pins: PinStatus[]): Promise<FileTreeNode[]> {
    const matchingPins = pins.filter(
      (pin) =>
        pin.pin.name?.toLowerCase().includes(query.toLowerCase()) ||
        pin.pin.cid.includes(query),
    );
    return Promise.all(
      matchingPins.map((pin) => this.constructNode(pin.pin.cid, pin)),
    );
  }

  async close(): Promise<void> {
    await this.datastore.close();
  }
}
