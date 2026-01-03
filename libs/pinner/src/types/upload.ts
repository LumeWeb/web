import type { OperationPollingOptions } from "@lumeweb/portal-sdk";

/**
 * Symbol used to brand UploadResult for type checking
 */
export const UploadResultSymbol = Symbol("UploadResult");

export interface UploadResult {
  /**
   * Unique identifier for this upload operation.
   */
  id: string;

  /**
   * IPFS Content Identifier for the uploaded content.
   */
  cid: string;

  /**
   * User-provided or auto-generated name for the content.
   */
  name: string;

  /**
   * Total size in bytes.
   */
  size: number;

  /**
   * MIME type of the content.
   */
  mimeType: string;

  /**
   * ISO timestamp when content was created.
   */
  createdAt: Date;

  /**
   * Number of files (1 for single file, N for directory).
   */
  numberOfFiles: number;

  /**
   * Custom key-value metadata.
   */
  keyvalues?: Record<string, string>;

  /**
   * Whether this upload is a directory.
   */
  isDirectory?: boolean;

  /**
   * Whether this upload is already a valid CAR file.
   * If true, the upload system will skip CAR preprocessing and upload the file as-is.
   * Useful for passthrough of pre-generated CAR files.
   */
  isCarFile?: boolean;

  /**
   * Portal operation ID for tracking the pinning operation.
   * Can be used with waitForOperation() to wait for the operation to complete.
   */
  operationId?: number;

  /**
   * Symbol brand for type checking - used to identify UploadResult objects
   */
  [UploadResultSymbol]?: true;
}

export type UploadInput = File | ReadableStream<Uint8Array>;

/**
 * Type guard to check if a value is an UploadResult
 * Uses the UploadResultSymbol for reliable type checking
 */
export function isUploadResult(value: unknown): value is UploadResult {
  return (
    typeof value === "object" &&
    value !== null &&
    UploadResultSymbol in value &&
    value[UploadResultSymbol] === true
  );
}

export interface UploadOptions {
  /**
   * Name for the uploaded content.
   */
  name?: string;

  /**
   * Custom key-value metadata.
   */
  keyvalues?: Record<string, string>;

  /**
   * Progress callback invoked during upload.
   */
  onProgress?: (progress: UploadProgress) => void;

  /**
   * Callback invoked when upload completes successfully.
   */
  onComplete?: (result: UploadResult) => void;

  /**
   * Callback invoked when upload fails.
   */
  onError?: (error: Error) => void;

  /**
   * AbortSignal for cancellation.
   */
  signal?: AbortSignal;

  /**
   * Optional size override for the upload input.
   * Useful for ReadableStream inputs where size detection is difficult.
   */
  size?: number;

  /**
   * Whether this upload is a directory.
   */
  isDirectory?: boolean;

  /**
   * Whether this upload is already a valid CAR file.
   * If true, the upload system will skip CAR preprocessing and upload the file as-is.
   * Useful for passthrough of pre-generated CAR files.
   */
  isCarFile?: boolean;

  /**
   * Whether to wait for the pinning operation to complete/fail.
   * When true, the upload will block until the operation reaches a settled state
   * (completed, failed, or error). Default is false (upload only).
   */
  waitForOperation?: boolean;

  /**
   * Polling options for waiting on operation completion.
   * Only used when waitForOperation is true.
   */
  operationPollingOptions?: OperationPollingOptions;
}

export interface UploadProgress {
  /**
   * Percentage complete (0-100).
   */
  percentage: number;

  /**
   * Number of bytes uploaded.
   */
  bytesUploaded: number;

  /**
   * Total bytes to upload.
   */
  bytesTotal: number;

  /**
   * Upload speed in bytes per second.
   */
  speed?: number;

  /**
   * Estimated time remaining in seconds.
   */
  eta?: number;
}

export interface UploadOperation {
  /**
   * Cancel the ongoing upload.
   */
  cancel(): void;

  /**
   * Pause the upload (TUS only).
   */
  pause(): void;

  /**
   * Resume a paused upload (TUS only).
   */
  resume(): void;

  /**
   * Promise that resolves when upload completes.
   */
  result: Promise<UploadResult>;

  /**
   * Current progress.
   */
  progress: Readonly<UploadProgress>;
}

/**
 * Builder interface for Pinner upload API.
 * Supports chaining name/keyvalues and returns UploadOperation with controls.
 */
export interface PinnerUploadBuilder {
  /**
   * Set the name for the upload.
   */
  name(name: string): this;

  /**
   * Set custom key-value metadata.
   */
  keyvalues(kv: Record<string, string>): this;

  /**
   * Whether to wait for the pinning operation to complete/fail.
   * When true, the upload will block until the operation reaches a settled state.
   */
  waitForOperation(wait: boolean): this;

  /**
   * Set polling options for waiting on operation completion.
   * Only used when waitForOperation is true.
   */
  operationPollingOptions(options: OperationPollingOptions): this;

  /**
   * Start the upload and return UploadOperation with controls.
   */
  pin(): Promise<UploadOperation>;
}
