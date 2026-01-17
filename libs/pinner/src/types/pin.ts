import type { CID } from "multiformats/cid";
import type { Status } from "@ipfs-shipyard/pinning-service-client";

/**
 * Options that can be passed to abort async operations
 */
export interface AbortOptions {
  signal?: AbortSignal;
}

/**
 * Allows passing extra options accepted by the remote pinning service
 */
export interface RemoteAddOptions extends AbortOptions {
  name?: string;
  metadata?: Record<string, string>;
  origins?: string[];
}

/**
 * Allows passing extra options accepted by the remote pinning service
 */
export interface RemoteLsOptions extends AbortOptions {
  name?: string;
  status?: Status[];
  limit?: number;
  cursor?: string;
}

/**
 * Includes extra metadata supported by the remote pinning service
 */
export interface RemotePin {
  cid: CID;
  name?: string;
  status: Status;
  created: Date;
  size?: number;
  metadata?: Record<string, string>;
}

/**
 * Extends the Pins interface with remote pinning-specific arguments and return
 * types (e.g. metadata as `Record<string, string>` and pins with an added
 * `.status` property)
 */
export interface RemotePins {
  /**
   * Pin a block in the blockstore. It will not be deleted
   * when garbage collection is run.
   */
  add(
    cid: CID,
    options?: RemoteAddOptions,
  ): AsyncGenerator<CID, void, undefined>;

  /**
   * List all blocks that have been pinned.
   */
  ls(options?: RemoteLsOptions): AsyncGenerator<RemotePin, void, undefined>;

  /**
   * Return true if the passed CID is pinned
   */
  isPinned(cid: CID, options?: AbortOptions): Promise<boolean>;

  /**
   * Return pin details
   */
  get(cid: CID, options?: AbortOptions): Promise<RemotePin>;

  /**
   * Update pin metadata
   */
  setMetadata(
    cid: CID,
    metadata: Record<string, string> | undefined,
    options?: AbortOptions,
  ): Promise<void>;

  /**
   * Remove a pin. The block may be deleted when garbage collection is run.
   */
  rm(cid: CID, options?: AbortOptions): AsyncGenerator<CID, void, undefined>;

  /**
   * Remove a pin by request ID. The block may be deleted when garbage collection is run.
   */
  rmByRequestId(requestId: string, options?: AbortOptions): Promise<void>;
}
