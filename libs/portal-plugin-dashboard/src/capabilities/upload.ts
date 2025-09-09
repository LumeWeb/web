import type { BaseCapability } from "@lumeweb/portal-framework-core";

export interface UploadCapability extends BaseCapability<"core:upload"> {
  /**
   * Creates an Uppy plugin for large files
   * @param config Upload configuration
   * @returns Uppy plugin instance
   */
  createLargeFilePlugin(config: UploadConfig): UppyPlugin;

  /**
   * Creates an Uppy plugin for small files
   * @param config Upload configuration
   * @returns Uppy plugin instance
   */
  createSmallFilePlugin(config: UploadConfig): UppyPlugin;

  /**
   * Gets the upload configuration
   * @returns Upload configuration
   */
  getUploadConfig(): UploadConfig;

  /**
   * Uploads a file
   * @param file File to upload
   * @param config Optional upload configuration override
   * @returns Promise that resolves when upload is complete
   */
  uploadFile(file: File, config?: UploadConfig): Promise<void>;

  /**
   * Uploads multiple files
   * @param files Files to upload
   * @param config Optional upload configuration override
   * @returns Promise that resolves when all uploads are complete
   */
  uploadFiles(files: File[], config?: UploadConfig): Promise<void>;

  /**
   * Validates a file against the upload configuration
   * @param file File to validate
   * @returns Validation result
   */
  validateFile(file: File): ValidationResult;
}

export interface UploadConfig {
  /**
   * Allowed file types for upload
   */
  allowedFileTypes?: string[];

  /**
   * Additional headers to include in upload requests
   */
  headers?: Record<string, string>;

  /**
   * Maximum number of files that can be uploaded simultaneously
   */
  maxConcurrentUploads?: number;

  /**
   * Maximum file size allowed for upload in bytes
   */
  maxFileSize?: number;

  /**
   * Timeout for upload requests in milliseconds
   */
  timeout?: number;

  /**
   * Upload endpoint URL
   */
  uploadEndpoint?: string;
}

export interface UppyPlugin {
  /**
   * Plugin module
   */
  module: any;

  /**
   * Plugin name
   */
  name: string;

  /**
   * Plugin options
   */
  options?: Record<string, any>;
}

export interface ValidationResult {
  /**
   * Error message if validation failed
   */
  error?: string;

  /**
   * Whether the file is valid for upload
   */
  valid: boolean;
}
