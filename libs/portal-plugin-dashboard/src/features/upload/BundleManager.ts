import { LARGE_PLUGIN_SUFFIX, SMALL_PLUGIN_SUFFIX } from "@lib/helpers";
import Uppy, { BasePlugin, Body, Meta, UppyFile } from "@uppy/core";

import { ROOT_FOLDER } from "./constants";

export interface BundleManagerConfig {
  uppy: Uppy<Meta, Body>;
}

// Bundle interfaces
export interface BundleMetadata {
  fileIds: string[];
  id: string;
  name: string;
  parentId: null | string;
  path: string;
  progress: number;
  uploaded: boolean;
}

export type BundleProgress = Record<
  string,
  {
    bytesTotal: number;
    bytesUploaded: number;
  }
>;

type PluginConstructor = new (
  uppy: Uppy<Meta, Body>,
  opts: any,
) => BasePlugin<any, Meta, Body>;

export const PLUGIN_SUFFIX_REGEX = new RegExp(
  `(?:${SMALL_PLUGIN_SUFFIX}|${LARGE_PLUGIN_SUFFIX})$`,
);
export const PLUGIN_SMALL_SUFFIX_REGEX = new RegExp(`${SMALL_PLUGIN_SUFFIX}$`);
export const PLUGIN_LARGE_SUFFIX_REGEX = new RegExp(`${LARGE_PLUGIN_SUFFIX}$`);

// BundleManager class
export class BundleManager {
  #bundleProgress: BundleProgress = {};
  #bundles = new Map<string, BundleMetadata>();
  #uppy: Uppy<Meta, Body>;

  constructor(config: BundleManagerConfig) {
    this.#uppy = config.uppy;
  }

  /**
   * Groups files by their folder structure and creates bundles
   * @returns Map of bundle metadata
   */
  public createBundles(): Map<string, BundleMetadata> {
    const files = this.#uppy.getFiles();
    const bundles = new Map<string, BundleMetadata>();
    const bundleProgress: BundleProgress = {};

    // Group files by folder path
    const groupedFiles: Record<string, UppyFile<Meta, Body>[]> = {};
    files.forEach((file) => {
      const relativePath = (file.meta as Record<string, any>)?.relativePath;
      if (!relativePath) {
        return;
      }

      const pathParts = relativePath
        .split("/")
        .filter((part) => part.length > 0);
      if (pathParts.length <= 1) {
        return;
      }

      // Create folder path key (all parts except the last one which is the file name)
      const folderPath = pathParts.slice(0, -1).join("/");

      if (!groupedFiles[folderPath]) {
        groupedFiles[folderPath] = [];
      }
      groupedFiles[folderPath].push(file);
    });

    // Create bundles for each folder
    Object.keys(groupedFiles).forEach((folderPath) => {
      const pathParts = folderPath.split("/");
      const bundleId = `bundle-${folderPath.replace(/\//g, "-")}`;
      const fileIds = groupedFiles[folderPath].map((file) => file.id);

      // Calculate total bytes for this bundle
      const bytesTotal = groupedFiles[folderPath].reduce(
        (sum, file) => sum + file.size,
        0,
      );

      bundleProgress[bundleId] = {
        bytesTotal,
        bytesUploaded: 0,
      };

      bundles.set(bundleId, {
        fileIds,
        id: bundleId,
        name: pathParts[pathParts.length - 1], // Last part is the folder name
        parentId:
          pathParts.length > 1
            ? `bundle-${pathParts.slice(0, -1).join("-")}`
            : null,
        path: folderPath,
        progress: 0,
        uploaded: false,
      });
    });

    this.#bundles = bundles;
    this.#bundleProgress = bundleProgress;

    return bundles;
  }

  /**
   * Creates virtual folder files representation for Uppy state
   * @returns Array of virtual folder files
   */
  public createVirtualFolderFiles(): UppyFile<Meta, Body>[] {
    const virtualFiles: UppyFile<Meta, Body>[] = [];

    this.#bundles.forEach((bundle) => {
      // Create a virtual file representing the bundle
      const virtualFile: UppyFile<Meta, Body> = {
        data: new Blob([JSON.stringify(bundle)], { type: "application/json" }),
        id: bundle.id,
        isRemote: false,
        meta: {
          fileIds: bundle.fileIds, // Preserve original file IDs
          isBundle: true,
          relativePath: bundle.path,
        },
        name: bundle.name,
        progress: {
          bytesTotal: this.#bundleProgress[bundle.id]?.bytesTotal || 0,
          bytesUploaded: this.#bundleProgress[bundle.id]?.bytesUploaded || 0,
          uploadComplete: bundle.uploaded,
        },
        size: this.#bundleProgress[bundle.id]?.bytesTotal || 0,
        source: "bundle-manager",
        type: "application/vnd.bundle+json",
      } as UppyFile<Meta, Body>;

      virtualFiles.push(virtualFile);
    });

    return virtualFiles;
  }

  /**
   * Gets bundle metadata by bundle ID
   * @param bundleId The bundle ID
   * @returns Bundle metadata or undefined
   */
  public getBundle(bundleId: string): BundleMetadata | undefined {
    return this.#bundles.get(bundleId);
  }

  /**
   * Gets bundle progress information
   * @returns Bundle progress map
   */
  public getBundleProgress(): BundleProgress {
    return this.#bundleProgress;
  }

  /**
   * Gets all bundles
   * @returns Map of all bundles
   */
  public getBundles(): Map<string, BundleMetadata> {
    return this.#bundles;
  }

  /**
   * Gets all files from the Uppy instance
   * @returns Array of Uppy files
   */
  public getFiles(): UppyFile<Meta, Body>[] {
    return this.#uppy.getFiles();
  }

  /**
   * Gets the folder structure hierarchy
   * @returns Object representing the folder structure
   */
  public getFolderStructure(): Record<string, any> {
    const files = this.getFiles();
    const structure: Record<string, any> = {};

    files.forEach((file) => {
      const relativePath = (file.meta as Record<string, any>)?.relativePath;
      if (!relativePath) {
        return;
      }

      const pathParts = relativePath
        .split("/")
        .filter((part) => part.length > 0);
      if (pathParts.length <= 1) {
        // This is a file in the root directory or just a file name
        return;
      }

      // Remove the last part (file name) to get only folder paths
      const folderParts = pathParts.slice(0, -1);

      let currentLevel = structure;
      folderParts.forEach((part) => {
        if (!currentLevel[part]) {
          currentLevel[part] = {};
        }
        currentLevel = currentLevel[part];
      });
    });

    return structure;
  }

  /**
   * Gets the parent folder name for a given file
   * @param file The Uppy file
   * @returns Parent folder name or null
   */
  public getParentFolderName(file: UppyFile<Meta, Body>): null | string {
    const relativePath = (file.meta as Record<string, any>)?.relativePath;
    if (!relativePath) {
      return null;
    }

    const pathParts = relativePath.split("/").filter((part) => part.length > 0);
    if (pathParts.length <= 1) {
      return null;
    }

    return pathParts[pathParts.length - 2]; // Second to last part is the parent folder
  }

  /**
   * Gets all root folder names
   * @returns Array of unique root folder names
   */
  public getRootFolders(): string[] {
    const files = this.getFiles();
    const rootFolders = new Set<string>();

    files.forEach((file) => {
      const relativePath = (file.meta as Record<string, any>)?.relativePath;
      if (!relativePath) {
        return;
      }

      const pathParts = relativePath
        .split("/")
        .filter((part) => part.length > 0);
      if (pathParts.length > 1) {
        // First part is the root folder
        rootFolders.add(pathParts[0]);
      }
    });

    return Array.from(rootFolders);
  }

  /**
   * Groups files by their folder paths
   * @returns Object with folder paths as keys and arrays of files as values
   */
  public groupFilesByFolder(): Record<string, UppyFile<Meta, Body>[]> {
    const groupedFiles: Record<string, UppyFile<Meta, Body>[]> = {};

    // Initialize root folder
    groupedFiles[ROOT_FOLDER] = [];

    // Group regular files by their folder paths
    const files = this.getFiles();
    files.forEach((file) => {
      const relativePath = (file.meta as Record<string, any>)?.relativePath;

      if (!relativePath) {
        // Files without relative paths go to root
        groupedFiles[ROOT_FOLDER].push(file);
        return;
      }

      const pathParts = relativePath
        .split("/")
        .filter((part) => part.length > 0);
      if (pathParts.length <= 1) {
        // Files in root directory
        groupedFiles[ROOT_FOLDER].push(file);
      } else {
        // Files in subdirectories
        const folderPath = pathParts.slice(0, -1).join("/");
        if (!groupedFiles[folderPath]) {
          groupedFiles[folderPath] = [];
        }
        groupedFiles[folderPath].push(file);
      }
    });

    return groupedFiles;
  }

  /**
   * Marks a bundle as uploaded
   * @param bundleId The bundle ID to mark as uploaded
   */
  public markBundleAsUploaded(bundleId: string): void {
    const bundle = this.#bundles.get(bundleId);
    if (bundle) {
      bundle.uploaded = true;
      bundle.progress = 100;
      this.#bundles.set(bundleId, bundle);
    }
  }

  /**
   * Resets bundle tracking state
   */
  public reset(): void {
    this.#bundles.clear();
    this.#bundleProgress = {};
  }

  /**
   * Updates bundle progress based on individual file progress
   * @param fileId The file ID that progressed
   * @param bytesUploaded Bytes uploaded for this file
   */
  public updateBundleProgress(fileId: string, bytesUploaded: number): void {
    this.#bundles.forEach((bundle, bundleId) => {
      if (bundle.fileIds.includes(fileId)) {
        this.#initializeBundleProgressIfNeeded(bundle, bundleId);
        this.#updateBundleBytesUploaded(bundleId, bytesUploaded);
        this.#updateBundleProgressPercentage(bundle, bundleId);
        this.#updateBundleInMap(bundle, bundleId);
      }
    });
  }

  #calculateBundleTotalBytes(bundleFiles: UppyFile<Meta, Body>[]): number {
    return bundleFiles.reduce((sum, file) => sum + (file.size || 0), 0);
  }

  #calculateProgressPercentage(
    bytesUploaded: number,
    bytesTotal: number,
  ): number {
    return bytesTotal > 0 ? Math.round((bytesUploaded / bytesTotal) * 100) : 0;
  }

  #getFilesInBundle(bundle: BundleMetadata): UppyFile<Meta, Body>[] {
    const files = this.getFiles();
    return files.filter((file) => bundle.fileIds.includes(file.id));
  }

  #initializeBundleProgressIfNeeded(
    bundle: BundleMetadata,
    bundleId: string,
  ): void {
    if (!this.#bundleProgress[bundleId]) {
      const bundleFiles = this.#getFilesInBundle(bundle);
      const bytesTotal = this.#calculateBundleTotalBytes(bundleFiles);
      this.#bundleProgress[bundleId] = {
        bytesTotal,
        bytesUploaded: 0,
      };
    }
  }

  #updateBundleBytesUploaded(bundleId: string, bytesUploaded: number): void {
    const currentProgress = this.#bundleProgress[bundleId];
    currentProgress.bytesUploaded = Math.min(
      currentProgress.bytesTotal,
      (currentProgress.bytesUploaded || 0) + bytesUploaded,
    );
  }

  #updateBundleInMap(bundle: BundleMetadata, bundleId: string): void {
    this.#bundles.set(bundleId, bundle);
  }

  #updateBundleProgressPercentage(
    bundle: BundleMetadata,
    bundleId: string,
  ): void {
    const currentProgress = this.#bundleProgress[bundleId];
    bundle.progress = this.#calculateProgressPercentage(
      currentProgress.bytesUploaded,
      currentProgress.bytesTotal,
    );
  }
}

export class FolderBundlerPlugin extends BasePlugin<any, Meta, Body> {
  #bundleManager: BundleManager;

  constructor(uppy: Uppy<Meta, Body>, opts: any) {
    super(uppy, opts);
    this.id = opts.id || "FolderBundler";
    this.type = "preprocessor";

    this.#bundleManager = new BundleManager({ uppy });
  }

  // Add a getter for the bundle manager so it can be accessed externally
  public getBundleManager(): BundleManager {
    return this.#bundleManager;
  }

  install() {
    this.uppy.addPreProcessor(this.run.bind(this));

    // Listen to upload-progress events to update bundle progress
    this.uppy.on("upload-progress", (file, progress) => {
      if ((file.meta as Record<string, any>)?.isBundle === true) {
        // This is a virtual bundle file, update bundle progress
        const bundleId = file.id;
        const bytesUploaded = progress.bytesUploaded;
        this.#bundleManager.updateBundleProgress(bundleId, bytesUploaded);
      }
    });
  }

  async run(files: UppyFile<Meta, Body>[]): Promise<UppyFile<Meta, Body>[]> {
    // Create bundles from files with relative paths
    this.#bundleManager.createBundles();

    // Get virtual folder files representation
    const virtualFolderFiles = this.#bundleManager.createVirtualFolderFiles();

    // Remove all files that belong to bundles
    const bundleFiles = files.filter(
      (file) =>
        (file.meta as Record<string, any>)?.relativePath &&
        (file.meta as Record<string, any>)?.isBundle !== true,
    );

    bundleFiles.forEach((file) => {
      this.uppy.removeFile(file.id);
    });

    // Add virtual folder files to Uppy
    virtualFolderFiles.forEach((file) => {
      this.uppy.addFile(file);
    });

    return this.uppy.getFiles();
  }

  uninstall() {
    this.uppy.removePreProcessor(this.run.bind(this));
  }
}
