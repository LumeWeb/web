import type { BasePlugin } from "@uppy/core";

import TusUpload from "@uppy/tus";
import XHRUpload from "@uppy/xhr-upload";

import type { UploadConfig, UppyPlugin } from "../types";

// Plugin suffix constants
export const SMALL_PLUGIN_SUFFIX = "-small";
export const LARGE_PLUGIN_SUFFIX = "-large";
export const FOLDER_BUNDLER_PLUGIN_SUFFIX = "-folder-bundler";

// Default plugin options
const DEFAULT_PLUGIN_OPTIONS = {
  withCredentials: true,
  chunkSize: 10 * 1024 * 1024,
  removeFingerprintOnSuccess: true,
};

/**
 * Creates a large file upload plugin configuration using Tus upload
 * @param config Upload configuration
 * @param serviceId Service ID to create protocol-prefixed plugin name
 * @param module Optional Uppy plugin module constructor (defaults to TusUpload)
 * @returns Uppy plugin configuration
 */
export function createLargeFilePlugin(
  config: UploadConfig,
  serviceId: string,
  module?: typeof BasePlugin<any, any, any>,
): UppyPlugin {
  if (!serviceId) {
    throw new Error("Service ID is required for createLargeFilePlugin");
  }

  return {
    module: (module ?? TusUpload) as unknown as typeof BasePlugin<
      any,
      any,
      any
    >,
    name: `${serviceId}${LARGE_PLUGIN_SUFFIX}`,
    options: { ...DEFAULT_PLUGIN_OPTIONS, ...config },
  };
}

/**
 * Creates a generic Uppy plugin configuration for standalone usage
 * @param module - The Uppy plugin module constructor
 * @param name - The unique plugin name identifier
 * @param options - Optional plugin configuration options
 * @returns Uppy plugin configuration object
 * @throws Error if required parameters (module or name) are missing
 */
export function createPlugin(
  module: typeof BasePlugin<any, any, any>,
  name: string,
  options?: UploadConfig,
): UppyPlugin {
  if (!module) {
    throw new Error("Plugin module is required for createPlugin");
  }

  if (!name) {
    throw new Error("Plugin name is required for createPlugin");
  }

  return {
    module,
    name,
    options: { ...DEFAULT_PLUGIN_OPTIONS, ...options },
  };
}

/**
 * Creates a small file upload plugin configuration using XHR upload
 * @param config Upload configuration
 * @param serviceId Service ID to create protocol-prefixed plugin name
 * @param module Optional Uppy plugin module constructor (defaults to XHRUpload)
 * @returns Uppy plugin configuration
 */
export function createSmallFilePlugin(
  config: UploadConfig,
  serviceId: string,
  module?: typeof BasePlugin<any, any, any>,
): UppyPlugin {
  if (!serviceId) {
    throw new Error("Service ID is required for createSmallFilePlugin");
  }

  return {
    module: (module ?? XHRUpload) as unknown as typeof BasePlugin<
      any,
      any,
      any
    >,
    name: `${serviceId}${SMALL_PLUGIN_SUFFIX}`,
    options: { ...DEFAULT_PLUGIN_OPTIONS, ...config },
  };
}
