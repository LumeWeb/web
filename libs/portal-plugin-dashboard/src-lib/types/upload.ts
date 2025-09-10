import type { BasePlugin, PluginOpts } from "@uppy/core";

export interface BundleMetadata {
  bundleName: string;
  displayAsFolder: true;
  isVirtualBundle: true;
  originalFiles?: File[];
}

export interface UploadConfig extends PluginOpts {
  /**
   * Upload endpoint URL
   */
  endpoint?: string;

  /**
   * Whether to include credentials in the upload request
   */
  withCredentials?: boolean;
}

export interface UppyPlugin {
  /**
   * Plugin module
   */
  module: typeof BasePlugin<any, any, any>;

  /**
   * Plugin name
   */
  name: string;

  /**
   * Plugin options
   */
  options?: UploadConfig;
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
