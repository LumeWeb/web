import { DEFAULT_ENDPOINT, DEFAULT_GATEWAY } from "./types/constants";
import type { Storage } from "unstorage";
import type { Datastore } from "interface-datastore";
import type { Libp2p } from "@libp2p/interface";

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
   * Passed as the base option to both blockstore and datastore storage instances.
   * Only used when neither datastore nor storage are provided.
   * @default "pinner-helia-data"
   */
  datastoreName?: string;

  /**
   * Upload request timeout in milliseconds.
   * Applied to XHR uploads. TUS does not expose a timeout option.
   * @default 120_000
   */
  timeout?: number;

  /**
   * Number of retry attempts for failed uploads.
   * Applied to XHR uploads (TUS uses retryDelays instead).
   * @default 3
   */
  retries?: number;

  /**
   * Pre-created Libp2p instance for Helia.
   * When provided, Helia skips its internal createLibp2p() / libp2pDefaults()
   * entirely, avoiding unnecessary transports (WebRTC, UPnP, etc.).
   */
  libp2p?: Libp2p;
}

export const DEFAULT_CONFIG: Partial<PinnerConfig> = {
  endpoint: DEFAULT_ENDPOINT,
  gateway: DEFAULT_GATEWAY,
  timeout: 120_000,
  retries: 3,
};

/**
 * Derive the account API endpoint from a pinner endpoint.
 *
 * The portal-sdk AccountApi constructor prepends "account." to the hostname.
 * We strip the first subdomain (e.g. ipfs.pinner.xyz → pinner.xyz) so
 * AccountApi produces account.pinner.xyz, not account.ipfs.pinner.xyz.
 * Port and path are preserved.
 */
export function deriveAccountEndpoint(endpoint: string): string {
  const url = new URL(endpoint);
  const parts = url.hostname.split(".");
  if (parts.length > 2) parts.shift();
  url.hostname = parts.join(".");
  return url.toString();
}
