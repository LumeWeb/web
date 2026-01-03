import { DEFAULT_ENDPOINT, DEFAULT_GATEWAY } from "./types/constants";
import type { Storage } from "unstorage";
import type { Datastore } from "interface-datastore";

export interface PinnerConfig {
  /**
   * JWT authentication token. Required for all API operations.
   */
  jwt: string;

  /**
   * API endpoint URL. Defaults to the official pinning service.
   * @default "https://ipfs.pinner.xyz"
   */
  endpoint?: string;

  /**
   * IPFS gateway URL for content retrieval.
   * @default "https://dweb.link"
   */
  gateway?: string;

  /**
   * Allowed MIME types for upload. If undefined, all types allowed.
   */
  allowedFileTypes?: string[];

  /**
   * Custom fetch implementation.
   */
  fetch?: typeof fetch;

  /**
   * Custom datastore instance for Helia.
   * If provided, this datastore will be used directly without creating one from storage.
   * Highest priority - takes precedence over storage and datastoreName.
   */
  datastore?: Datastore;

  /**
   * Custom storage instance for both Helia blockstore and datastore.
   * If provided, this storage will be used instead of creating default storage.
   * The storage instance must implement the unstorage Storage interface.
   * Used when datastore is not provided.
   */
  storage?: Storage;

  /**
   * Custom base name for Helia storage.
   * Passed as the `base` option to both blockstore and datastore storage instances.
   * Only used when neither datastore nor storage are provided.
   * @default "pinner-helia-data"
   */
  datastoreName?: string;
}

export const DEFAULT_CONFIG: Partial<PinnerConfig> = {
  endpoint: DEFAULT_ENDPOINT,
  gateway: DEFAULT_GATEWAY,
};
