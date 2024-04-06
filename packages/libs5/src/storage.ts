import { S5Node } from "#node.js";
import { Multihash } from "#multihash.js";
import NodeId from "#nodeId.js";

export default class StorageLocation {
  type: number;
  parts: string[];
  binaryParts: Uint8Array[] = [];
  expiry: number; // Unix timestamp in seconds
  providerMessage?: Uint8Array; // Made optional, similar to `late` in Dart

  constructor(type: number, parts: string[], expiry: number) {
    this.type = type;
    this.parts = parts;
    this.expiry = expiry;
  }

  get bytesUrl(): string {
    return this.parts[0];
  }

  get outboardBytesUrl(): string {
    if (this.parts.length === 1) {
      return `${this.parts[0]}.obao`;
    }
    return this.parts[1];
  }

  toString(): string {
    const expiryDate = new Date(this.expiry * 1000);
    return `StorageLocation(${this.type}, ${
      this.parts
    }, expiry: ${expiryDate.toISOString()})`;
  }
}

export class StorageLocationProvider {
  private node: S5Node;
  private hash: Multihash;
  private types: number[];

  private static readonly storageLocationTypeFull: number = 0; // Example value, adjust as necessary
  private readonly timeoutDuration: number = 60000; // Duration in milliseconds

  private availableNodes: NodeId[] = [];
  private uris: Map<NodeId, StorageLocation> = new Map<
    NodeId,
    StorageLocation
  >();

  private timeout?: Date;
  private isTimedOut: boolean = false;

  constructor(
    node: S5Node,
    hash: Multihash,
    types: number[] = [StorageLocationProvider.storageLocationTypeFull],
  ) {
    this.node = node;
    this.hash = hash;
    this.types = types;
  }

  async start(): Promise<void> {
    this.uris = new Map(
      await this.node.getCachedStorageLocations(this.hash, this.types),
    );

    this.availableNodes = Array.from(this.uris.keys());
    this.node.services.p2p.sortNodesByScore(this.availableNodes);

    this.timeout = new Date(Date.now() + this.timeoutDuration);

    let requestSent = false;

    while (true) {
      const newUris = new Map(
        await this.node.getCachedStorageLocations(this.hash, this.types),
      );

      if (
        this.availableNodes.length === 0 &&
        newUris.size < 2 &&
        !requestSent
      ) {
        this.node.services.p2p.sendHashRequest(this.hash, this.types);
        requestSent = true;
      }

      let hasNewNode = false;

      for (const [key, value] of newUris) {
        if (!this.uris.has(key) || this.uris.get(key) !== value) {
          this.uris.set(key, value);
          if (!this.availableNodes.includes(key)) {
            this.availableNodes.push(key);
            hasNewNode = true;
          }
        }
      }

      if (hasNewNode) {
        this.node.services.p2p.sortNodesByScore(this.availableNodes);
      }

      await new Promise((resolve) => setTimeout(resolve, 10));

      if (new Date() > this.timeout) {
        this.isTimedOut = true;
        return;
      }

      while (this.availableNodes.length > 0 || !this.isWaitingForUri) {
        await new Promise((resolve) => setTimeout(resolve, 10));
        if (new Date() > this.timeout) {
          this.isTimedOut = true;
          return;
        }
      }
    }
  }

  private isWaitingForUri: boolean = false;

  async next(): Promise<SignedStorageLocation> {
    this.timeout = new Date(Date.now() + this.timeoutDuration);

    while (true) {
      if (this.availableNodes.length > 0) {
        this.isWaitingForUri = false;
        const nodeId = this.availableNodes.shift()!;

        return new SignedStorageLocation(nodeId, this.uris.get(nodeId)!);
      }

      this.isWaitingForUri = true;

      if (this.isTimedOut) {
        throw new Error(
          `Could not download raw file: Timed out after ${this.timeoutDuration}ms ${this.hash}`,
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  upvote(uri: SignedStorageLocation): void {
    this.node.services.p2p.upvote(uri.nodeId);
  }

  downvote(uri: SignedStorageLocation): void {
    this.node.services.p2p.downvote(uri.nodeId);
  }
}

class SignedStorageLocation {
  nodeId: NodeId;
  location: StorageLocation;

  constructor(nodeId: NodeId, location: StorageLocation) {
    this.nodeId = nodeId;
    this.location = location;
  }

  toString(): string {
    return `SignedStorageLocation(${this.location}, ${this.nodeId})`;
  }
}
