import { UppyFileDefault } from "@/features/upload";

export interface PluginConfig {
  module: any; // The actual Uppy plugin
  options: object;
}

export interface ServiceConfig {
  folderBundlerPlugin?: PluginConfig; // Optional folder bundler plugin
  id: string;
  largeFilePlugin: PluginConfig;
  name: string;
  smallFilePlugin: PluginConfig;
}

// UI Service Config Type for FileUploadZone
export interface UIServiceConfig {
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  id: string;
  name: string;
}

export const UPLOAD_TYPE_MAIN = "main";
export const UPLOAD_TYPE_AVATAR = "avatar";

export enum FileStatus {
  COMPLETE = "complete",
  ERROR = "error",
  PENDING = "pending",
  PREPROCESSING = "preprocessing",
  UPLOADING = "uploading",
}

export enum UploadStatus {
  COMPLETED = "completed",
  ERROR = "error",
  IDLE = "idle",
  PENDING = "pending",
  UPLOADING = "uploading",
}

// Interface that both UploadManager class and useUploadManager hook can satisfy
export interface IUploadManager {
  addFile: (file: File, serviceId?: string) => Promise<void> | void;
  cancelAll: () => void;
  clearErrors: () => void;
  getFiles: () => any[] | Promise<any[]>;
  getServices: () => ServiceConfig[];
  getUploadedFiles: () => UppyFileDefault[];
  getUploadErrors: () => Error[];
  serviceSupportsFolderUpload: (serviceId: string) => boolean;
  getUploadProgress: () => number;
  getUploadStatus: () => UploadStatusType;
  off: (event: string, callback: (...args: any[]) => void) => void;
  // Expose Uppy's event system directly
  on: (event: string, callback: (...args: any[]) => void) => () => void;

  removeFile: (id: string) => Promise<void> | void;
  start: () => any | Promise<any>;
}

export type UploadStatusType = `${UploadStatus}`;

export type UploadType = typeof UPLOAD_TYPE_AVATAR | typeof UPLOAD_TYPE_MAIN;
