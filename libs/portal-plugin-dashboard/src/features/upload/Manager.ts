import type { BundleMetadata, UppyPlugin } from "@lib/types";

import { LARGE_PLUGIN_SUFFIX, SMALL_PLUGIN_SUFFIX } from "@lib/util";
import { isDirectoryFile, isFolderBundle } from "@lib/util/file";
import { Sdk } from "@lumeweb/portal-sdk";
import Uppy, {
  BasePlugin,
  Body,
  Meta,
  UnknownPlugin,
  UppyEventMap,
  type UppyFile,
} from "@uppy/core";
import DropTarget from "@uppy/drop-target";
import { Mutex } from "async-mutex";

import type { IUploadManager, ServiceConfig, UploadType } from "@/types/upload";

import {
  UPLOAD_TYPE_AVATAR,
  UPLOAD_TYPE_MAIN,
  UploadStatus,
  type UploadStatusType,
} from "@/types/upload";

import { validateServiceConfig } from "./validation";

export interface UploadManagerConfig {
  allowedFileTypes?: string[];
  autoProceed?: boolean;
  maxFileSize?: number;
  maxNumberOfFiles?: number;
  sdk?: Sdk;
  type: UploadType;
}

export type UppyFileDefault = UppyFile<Meta, Body>;

interface StorageInfo {
  available: number;
  total: number;
  used: number;
  usedPercentage: number;
}

interface StorageInfo {
  available: number;
  total: number;
  used: number;
  usedPercentage: number;
}

export const DEFAULT_MAIN_CONFIG: Partial<UploadManagerConfig> = {
  autoProceed: false,
  maxNumberOfFiles: undefined,
  type: UPLOAD_TYPE_MAIN,
};

export const DEFAULT_AVATAR_CONFIG: Partial<UploadManagerConfig> = {
  allowedFileTypes: ["image/*"],
  autoProceed: true,
  maxNumberOfFiles: 1,
  type: UPLOAD_TYPE_AVATAR,
};

export class Manager implements IUploadManager {
  #additionalPlugins: UppyPlugin[] = [];
  #config: UploadManagerConfig;
  #dropTargetServiceId?: string;
  #folderMutex = new Mutex();
  #sdk?: Sdk;
  #services = new Map<string, ServiceConfig>();
  #storageInfo: null | StorageInfo = null;
  #uploadErrors: Error[] = [];
  #uploadLimit: null | number = null;
  #uppy: Uppy<Meta, Body>;

  constructor(config: UploadManagerConfig) {
    this.#config = {
      ...(config.type === UPLOAD_TYPE_MAIN
        ? DEFAULT_MAIN_CONFIG
        : DEFAULT_AVATAR_CONFIG),
      ...config,
    };
    this.#sdk = this.#config.sdk;

    // Initialize Uppy with restrictions based on config
    this.#uppy = new Uppy<Meta, Body>({
      autoProceed: this.#config.autoProceed,
      restrictions: {
        allowedFileTypes: this.#config.allowedFileTypes,
        maxFileSize: this.#config.maxFileSize,
        maxNumberOfFiles: this.#config.maxNumberOfFiles,
      },
    });

    this.#setupEventHooks();
  }

  public addEvent<K extends keyof UppyEventMap<Meta, Body>>(
    event: K,
    callback: UppyEventMap<Meta, Body>[K],
  ) {
    return this.#uppy.on(event, callback);
  }

  async addFile(file: File, serviceId?: string) {
    // Handle all folder cases first
    const isFolderFile = this.#isFolder(file);
    const hasRelativePath =
      "webkitRelativePath" in file && file.webkitRelativePath;
    const isInFolder = hasRelativePath && file.webkitRelativePath.includes("/");

    if (isFolderFile || isInFolder) {
      if (isInFolder) {
        await this.#handleFolderFile(file, serviceId);
        // Continue to add the individual file as well
      } else {
        // Handle as virtual bundle
        let pluginId: string | undefined;
        if (serviceId) {
          pluginId = await this.getFilePluginId(file, serviceId);
        }

        this.#uppy.addFile({
          data: file,
          meta: {
            bundleName: file.name,
            displayAsFolder: true,
            isVirtualBundle: true,
            originalFiles: [],
          },
          name: file.name,
          plugins: pluginId ? [pluginId] : undefined,
          type: "application/x-folder-bundle",
        });
        return;
      }
    }

    // For avatar uploads, serviceId is optional
    let pluginId: string | undefined;

    if (serviceId) {
      pluginId = await this.getFilePluginId(file, serviceId);
    }

    this.#uppy.addFile({
      data: file,
      name: file.name,
      plugins: pluginId ? [pluginId] : undefined,
      type: file.type,
    });
  }

  public cancelAll() {
    this.#uppy.cancelAll();
    this.#uploadErrors = [];
  }

  public clearErrors() {
    this.#uploadErrors = [];
  }

  public clearFiles() {
    this.cancelAll();
  }

  public clearUIDropTarget() {
    this.#uppy.iteratePlugins(
      (plugin) => plugin.id === "DropTarget" && this.#uppy.removePlugin(plugin),
    );
  }

  public getConfig(): UploadManagerConfig {
    return this.#config;
  }

  public async getFilePluginId(file: File, serviceId: string) {
    const service = this.#services.get(serviceId);

    if (!service) {
      throw new Error(`Service ${serviceId} not registered`);
    }

    // If upload limit isn't available, try to fetch it first
    if (this.#uploadLimit === null) {
      await this.#fetchUploadLimit();

      // If still null after fetching, default to small file handling
      if (this.#uploadLimit === null) {
        return `${serviceId}${SMALL_PLUGIN_SUFFIX}`;
      }
    }

    return file.size >= this.#uploadLimit
      ? `${serviceId}${LARGE_PLUGIN_SUFFIX}`
      : `${serviceId}${SMALL_PLUGIN_SUFFIX}`;
  }

  public getFiles() {
    const files = this.#uppy.getFiles();

    // Filter out individual files that are part of folders, but keep folder bundles and regular files
    return files.filter((file) => !this.#isFolderFile(file));
  }

  public getServices(): ServiceConfig[] {
    return Array.from(this.#services.values());
  }

  public serviceSupportsFolderUpload(serviceId: string): boolean {
    const service = this.#services.get(serviceId);
    return !!service?.folderBundlerPlugin;
  }

  public getStorageInfo(): null | StorageInfo {
    return this.#storageInfo;
  }

  public getUploadedFiles(): UppyFileDefault[] {
    const files = this.getFiles();

    // Filter for files that have completed uploading
    const uploadedFiles = files.filter((file) => file.progress.uploadComplete);

    // Map the files to include bundle information and CID
    return uploadedFiles.map((file) => this.#enhanceFileData(file));
  }

  public getUploadErrors(): Error[] {
    return this.#uploadErrors;
  }

  public getUploadLimit(): number | null {
    return this.#uploadLimit;
  }

  public getUploadProgress(): number {
    const files = this.#uppy.getFiles();

    // Calculate total bytes and uploaded bytes for all files
    let totalBytes = 0;
    let uploadedBytes = 0;

    files.forEach((file) => {
      // For folder bundles, use the size field
      const meta = file.meta as BundleMetadata;
      if (meta?.isVirtualBundle && meta?.displayAsFolder) {
        const bundleTotal = file.progress.bytesTotal || file.size;
        if (bundleTotal) {
          totalBytes += bundleTotal;
        }
        if (file.progress.bytesUploaded) {
          uploadedBytes += file.progress.bytesUploaded;
        }
      } else {
        // For regular files, use the standard progress properties
        if (file.progress.bytesTotal) {
          totalBytes += file.progress.bytesTotal;
        }
        if (file.progress.bytesUploaded) {
          uploadedBytes += file.progress.bytesUploaded;
        }
      }
    });

    if (totalBytes > 0) {
      return Math.round((uploadedBytes / totalBytes) * 100);
    }

    return this.#uppy.getState().totalProgress;
  }

  public getUploadStatus(): UploadStatusType {
    const { totalProgress } = this.#uppy.getState();

    // Check if there are any files with errors
    const hasErrors = this.#uppy.getFiles().some((file) => file.error);

    if (hasErrors) {
      return UploadStatus.ERROR;
    }

    if (totalProgress === 0) {
      return UploadStatus.PENDING;
    }

    if (totalProgress === 100) {
      return UploadStatus.COMPLETED;
    }

    return UploadStatus.UPLOADING;
  }

  public getUppy(): Uppy<Meta, Body> {
    return this.#uppy;
  }

  public async init(): Promise<void> {
    if (!this.#sdk) {
      this.#uploadLimit = null;
      return;
    }
    await this.#fetchStorageInfo();
    await this.#fetchUploadLimit();
  }

  public iteratePlugins(method: (plugin: UnknownPlugin<Meta, Body>) => void) {
    this.#uppy.iteratePlugins(method);
  }

  public off(event: string, callback: (...args: any[]) => void): void {
    this.#uppy.off(event as keyof UppyEventMap<Meta, Body>, callback);
  }

  // Expose Uppy's event system directly
  public on(event: string, callback: (...args: any[]) => void): () => void {
    this.#uppy.on(event as keyof UppyEventMap<Meta, Body>, callback);
    // Return cleanup function
    return () => {
      this.off(event, callback);
    };
  }

  public patchFilesState(
    filesWithNewState: Record<string, Partial<UppyFileDefault>>,
  ) {
    this.#uppy.patchFilesState(filesWithNewState);
  }

  registerAdditionalPlugin(plugin: UppyPlugin) {
    this.#additionalPlugins.push(plugin);
    this.#uppy.use<any>(plugin.module as any, {
      ...plugin.options,
      id: plugin.name,
      uploadManager: this, // Pass upload manager instance
    });
  }

  registerService(config: ServiceConfig) {
    // Validate the service config before registering
    validateServiceConfig(config);

    this.#services.set(config.id, config);

    // Register plugins directly with Uppy
    if (config.smallFilePlugin) {
      this.#uppy.use<any>(config.smallFilePlugin.module as any, {
        id: `${config.id}${SMALL_PLUGIN_SUFFIX}`,
        ...config.smallFilePlugin.options,
      });
    }

    if (config.largeFilePlugin) {
      this.#uppy.use<any>(config.largeFilePlugin.module as any, {
        id: `${config.id}${LARGE_PLUGIN_SUFFIX}`,
        ...config.largeFilePlugin.options,
      });
    }
  }

  removeAdditionalPlugin(plugin: string | UppyPlugin): boolean {
    // Find the plugin in the array
    const index = this.#additionalPlugins.findIndex((p) =>
      typeof plugin === "string" ? p.name === plugin : p === plugin,
    );

    // If not found, return false
    if (index === -1) {
      return false;
    }

    // Get the plugin to remove
    const pluginToRemove = this.#additionalPlugins[index];

    // Remove from the array
    this.#additionalPlugins.splice(index, 1);

    // Find and remove the plugin from Uppy instance
    let removedFromUppy = false;
    this.#uppy.iteratePlugins((uppyPlugin) => {
      if (uppyPlugin.id === pluginToRemove.name) {
        this.#uppy.removePlugin(uppyPlugin);
        removedFromUppy = true;
      }
    });

    return removedFromUppy;
  }

  public removeCompletedUploads() {
    this.#uppy.getFiles().forEach((file) => {
      if (file.progress.uploadComplete) {
        this.#uppy.removeFile(file.id);
      }
    });
  }

  public removeEvent<K extends keyof UppyEventMap<Meta, Body>>(
    event: K,
    callback: UppyEventMap<Meta, Body>[K],
  ) {
    return this.#uppy.off(event, callback);
  }

  public removeFile(id: string) {
    this.#uppy.removeFile(id);
  }

  public removePlugin(plugin: BasePlugin<any, Meta, Body>) {
    this.#uppy.removePlugin(plugin);
  }

  public reset() {
    this.#uppy.cancelAll();
    this.#services = new Map();
    this.#additionalPlugins = [];
    this.#uppy.iteratePlugins((plugin) => {
      this.#uppy.removePlugin(plugin);
    });
    this.#uploadErrors = [];
  }

  public retryFile(file: UppyFileDefault) {
    this.#uppy.retryUpload(file.id);
    this.#uploadErrors = [];
  }

  public setUIDropTarget(
    target: HTMLElement | null | string,
    serviceId?: string,
  ) {
    this.clearUIDropTarget();

    // Store the serviceId for use in the file-added event handler
    this.#dropTargetServiceId = serviceId;

    // Let the uppy DropTarget plugin handle all drag-and-drop events automatically
    const dropTargetOptions = {
      target,
    };

    this.#uppy.use(DropTarget, dropTargetOptions);
  }

  public start() {
    this.#uploadErrors = [];

    // Upload all files
    return this.#uppy.upload();
  }

  public usePlugin(plugin: any, opts?: any) {
    this.#uppy.use(plugin, opts);
  }

  // Helper function to enhance file data with bundle information and CID
  #enhanceFileData(file: UppyFileDefault): UppyFileDefault {
    const meta = file.meta as Record<string, any>;
    const isBundle = meta?.isVirtualBundle && meta?.displayAsFolder;

    const newMeta = {
      ...meta,
      bundleId: isBundle ? file.id : undefined,
      isBundle: isBundle,
    };

    // Check for CID in response first, then fall back to meta
    const cidProps = ["CID", "cid"];
    let cid: string | undefined;
    for (const prop of cidProps) {
      cid = file.response?.body?.[prop] || file.response?.[prop];
      if (cid) {
        newMeta.cid = cid;
        break;
      }
    }

    // If CID wasn't found in response, check meta
    if (!cid) {
      cid = file.meta?.cid;
      if (cid) {
        newMeta.cid = cid;
      }
    }

    return {
      ...file,
      id: file.response?.body?.id || file.id,
      meta: newMeta,
      name: file.name,
      size: file.size,
      type: isBundle ? "folder" : file.type,
    };
  }

  async #fetchStorageInfo() {
    if (!this.#sdk) {
      return;
    }

    try {
      // Check if the account method exists before calling it
      if (typeof this.#sdk.account === "function") {
        const accountInfo = await this.#sdk.account().info();
        const storage = accountInfo.storage;

        if (storage) {
          this.#storageInfo = {
            available: storage.available,
            total: storage.total,
            used: storage.used,
            usedPercentage: storage.usedPercentage,
          };
        }
      }
    } catch (error) {
      console.error("Failed to fetch storage info:", error);
      // Keep using default values if fetch fails
    }
  }

  async #fetchUploadLimit() {
    try {
      const uploadLimitResponse = await this.#sdk!.account().uploadLimit();
      this.#uploadLimit = uploadLimitResponse?.data?.limit;
    } catch (error) {
      console.warn(
        "Failed to fetch upload limit, defaulting to small file handling:",
        error,
      );
      this.#uploadLimit = null;
    }
  }

  async #handleFolderFile(file: File, serviceId?: string) {
    const relativePath = (file as any).webkitRelativePath;
    const pathParts = relativePath.split("/");

    // Get the folder name (first part of the path)
    const folderName = pathParts[0];

    // Use mutex to prevent race conditions when multiple files try to create the same folder bundle
    await this.#folderMutex.runExclusive(async () => {
      // Check if we already have a folder bundle for this path
      const existingFolderBundle = this.#uppy
        .getFiles()
        .find(
          (f) =>
            (f.meta as BundleMetadata)?.isVirtualBundle &&
            (f.meta as BundleMetadata)?.bundleName === folderName,
        );

      if (!existingFolderBundle) {
        // Create new folder bundle
        let pluginId: string | undefined;
        if (serviceId) {
          pluginId = await this.getFilePluginId(file, serviceId);
        }

        // Calculate total size of all files belonging to this folder
        const allFiles = this.#uppy.getFiles();
        const folderFiles = allFiles.filter(f => {
          const webkitRelativePath = (f.data as any).webkitRelativePath || '';
          return webkitRelativePath.startsWith(`${folderName}/`);
        });
        const totalSize = folderFiles.reduce((sum, f) => sum + (f.size ?? 0), 0) + (file.size ?? 0);

        const bundleMeta: BundleMetadata = {
          bundleName: folderName,
          displayAsFolder: true,
          isVirtualBundle: true,
          originalFiles: [file],
        };

        // Add the virtual folder bundle with the calculated total size
        this.#uppy.addFile({
          data: new File([], folderName, { type: "" }),
          meta: bundleMeta,
          name: folderName,
          plugins: pluginId ? [pluginId] : undefined,
          size: totalSize, // Use the calculated total size
          type: "application/x-folder-bundle",
        });
      } else {
        // Add file to existing bundle
        const updatedOriginalFiles = [
          ...((existingFolderBundle.meta as BundleMetadata).originalFiles ||
            []),
          file,
        ];

        const currentTotalSize = existingFolderBundle.size || 0;

        this.#uppy.setFileState(existingFolderBundle.id, {
          meta: {
            ...existingFolderBundle.meta,
            originalFiles: updatedOriginalFiles,
          },
          size: currentTotalSize + file.size,
        });
      }
    });
  }

  #isFolder(file: File): boolean {
    // Use webkitRelativePath as the primary indicator
    const webkitRelativePath = (file as any).webkitRelativePath;
    return (
      webkitRelativePath?.endsWith("/") || (file.type === "" && file.size === 0)
    );
  }

  #isFolderFile(file: UppyFileDefault): boolean {
    return isDirectoryFile(file) && !isFolderBundle(file);
  }

  #isVirtualBundle(file: UppyFileDefault): boolean {
    return isFolderBundle(file);
  }

  #setupEventHooks(): void {
    this.addEvent("file-added", (file: UppyFileDefault) => {
      // If no plugins are associated with the file yet, associate it with the drop target service
      if (!file?.plugins?.length && this.#dropTargetServiceId) {
        this.patchFilesState({
          [file.id]: {
            plugins: [this.#dropTargetServiceId],
          },
        });
      }
    });

    this.addEvent("complete", (result) => {
      // No need to store uploaded files locally anymore
      // Patch file state with CID if present in response
      result.successful.forEach((file) => {
        const cid = file.response?.body?.cid;
        if (cid) {
          this.patchFilesState({
            [file.id]: {
              meta: {
                ...file.meta,
                cid: cid,
              },
            },
          });
        }
      });
    });

    this.addEvent("error", (error) => {
      this.#uploadErrors.push(error);
    });

    this.addEvent("upload-error", (file, error) => {
      this.#uploadErrors.push(error);

      // Handle bundle-specific errors
      const meta = file.meta as Record<string, any>;
      if (meta?.isVirtualBundle && meta?.displayAsFolder) {
        // Create a more descriptive error message for bundle errors
        const bundleError = new Error(
          `Failed to upload folder "${meta.bundleName}": ${error.message || "Unknown error occurred"}`,
        );
        this.#uploadErrors.push(bundleError);
      }
    });

    this.addEvent("modify-upload-error", function (file, error) {
      if (error.request) {
        const xhr = error.request;
        if (xhr.status === 507) {
          error.details = "Upload quota exceeded";
        } else if (xhr.responseText.toLowerCase().includes("is not verified")) {
          error.details = "Please verify your email to upload files";
        }
      }
    });
  }
}
