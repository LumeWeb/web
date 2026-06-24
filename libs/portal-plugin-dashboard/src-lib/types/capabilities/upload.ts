import {
  FRAMEWORK_NS,
  createNamespacedId,
  type BaseCapability,
} from "@lumeweb/portal-framework-core";
import type { BasePlugin } from "@uppy/core";

import type { UploadConfig, UppyPlugin } from "../upload";

export const UPLOAD_CAPABILITY_TYPE = createNamespacedId(
  FRAMEWORK_NS,
  "upload",
);

export interface UploadCapability
  extends BaseCapability {
  /**
   * Gets the Uppy plugin for large files
   * @returns Uppy plugin class
   */
  getLargeFilePlugin?(): typeof BasePlugin<any, any, any>;

  /**
   * Gets the Uppy plugin for small files
   * @returns Uppy plugin class
   */
  getSmallFilePlugin?(): typeof BasePlugin<any, any, any>;

  /**
   * Gets the large file upload configuration
   * @returns Upload configuration
   */
  getLargeFileUploadConfig(): UploadConfig;

  /**
   * Gets the small file upload configuration
   * @returns Upload configuration
   */
  getSmallFileUploadConfig(): UploadConfig;

  /**
   * Gets additional Uppy plugins to register
   */
  getAdditionalPlugins(): UppyPlugin[];
}
