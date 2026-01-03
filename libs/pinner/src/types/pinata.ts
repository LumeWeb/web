export interface PinataUploadResult {
  /**
   * IPFS CID.
   */
  IpfsHash: string;

  /**
   * Pin size in bytes.
   */
  PinSize: number;

  /**
   * Timestamp of upload.
   */
  Timestamp: string;

  /**
   * Whether content was pinned.
   */
  isDuplicate: boolean;
}

/**
 * Base metadata options - shared across upload and pin operations.
 */
export interface PinataMetadataOptions {
  name?: string;
  keyvalues?: Record<string, string>;
}

/**
 * Generic upload builder interface.
 * All upload methods return this builder with different result types.
 */
export interface PinataUploadBuilder<T = PinataUploadResult> {
  name(name: string): this;
  keyvalues(kv: Record<string, string>): this;
  execute(): Promise<T>;
}

/**
 * Options for URL upload builder.
 */
export interface UrlUploadBuilderOptions {
  fetch?: typeof fetch;
}

/**
 * Options for pinning content by CID.
 */
export interface PinByHashOptions extends PinataMetadataOptions {}

/**
 * Pin information (Pinata SDK format).
 * Note: This differs from RemotePin (@ipfs-shipyard/pinning-service-client format).
 */
export interface PinataPin {
  id: string;
  ipfsPinHash: string;
  size: number;
  userId: string;
  datePinned: string;
  dateUnpinned?: string;
  metadata?: PinataMetadata;
}

/**
 * File information (Pinata SDK format).
 */
export interface PinataFile {
  id: string;
  ipfsPinHash: string;
  size: number;
  name: string;
  cid: string;
  createdAt: string;
}

/**
 * List builder interface for listing pins.
 * Uses cursor-based pagination compatible with Pinata SDK.
 */
export interface PinataListBuilder<T = PinataFile[]> {
  limit(limit: number): this;
  pageToken(pageToken: string): this;
  execute(): Promise<T>;
}

/**
 * Pin metadata.
 */
export interface PinataMetadata extends PinataMetadataOptions {}

/**
 * File information.
 */
export interface PinataFile {
  id: string;
  ipfsPinHash: string;
  size: number;
  name: string;
  mimeType?: string;
  cid: string;
  createdAt: string;
}

/**
 * Options for listing pins.
 */
export interface PinListOptions {
  limit?: number;
  offset?: number;
}

/**
 * Generic list builder interface.
 */
export interface PinataListBuilder<T> {
  limit(limit: number): this;
  offset(offset: number): this;
  execute(): Promise<T>;
}

export interface PinataUploadOptions {
  /**
   * File to upload.
   */
  file: File;

  /**
   * Pinata-specific options.
   */
  pinataMetadata?: {
    name?: string;
    keyvalues?: Record<string, string>;
  };

  /**
   * Pinata-specific options for response format.
   */
  pinataOptions?: {
    cidVersion?: 0 | 1;
    wrapWithDirectory?: boolean;
  };
}

export interface PinataAdapterConfig {
  /**
   * JWT token for authentication.
   */
  jwt: string;

  /**
   * API gateway base URL.
   * @default "https://api.pinata.cloud"
   */
  baseUrl?: string;
}
