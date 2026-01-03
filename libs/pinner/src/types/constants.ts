/**
 * Default API endpoint URL for the pinning service.
 */
export const DEFAULT_ENDPOINT = "https://api.lumeweb.com";

/**
 * Default IPFS gateway URL for content retrieval.
 */
export const DEFAULT_GATEWAY = "https://gateway.lumeweb.com";

/**
 * Default TUS upload size threshold (100MB).
 * Files larger than this will use TUS protocol for resumable uploads.
 */
export const TUS_SIZE_THRESHOLD = 100 * 1024 * 1024;

/**
 * Default base path for Helia datastore storage.
 */
export const DEFAULT_DATASTORE_BASE = "pinner-helia-data";

/**
 * Default key prefix for blockstore keys.
 * This is prepended to CID strings in storage keys.
 */
export const DEFAULT_BLOCKSTORE_PREFIX = "pinner-helia-blocks";

/**
 * Default base path for blockstore storage driver.
 * For IndexedDB: "pinner:" - the database name prefix
 * For filesystem: "./.pinner-blocks" - the directory path
 */
export const DEFAULT_BLOCKSTORE_BASE = "pinner:";

/**
 * Default base path for blockstore filesystem storage driver (Node.js).
 */
export const DEFAULT_BLOCKSTORE_FS_BASE = "./.pinner-blocks";

/**
 * Default base path for datastore filesystem storage driver (Node.js).
 */
export const DEFAULT_DATASTORE_FS_BASE = "./.pinner-data";
