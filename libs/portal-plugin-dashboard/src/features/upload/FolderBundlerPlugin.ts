import { BasePlugin, Uppy, UppyFile } from "@uppy/core";

import { BundleManager } from "./BundleManager";

export class FolderBundlerPlugin extends BasePlugin {
  #bundleManager: BundleManager;

  constructor(uppy: Uuppy, opts: any) {
    super(uppy, opts);
    this.id = opts.id || "FolderBundler";
    this.type = "preprocessor";

    this.#bundleManager = new BundleManager({ uppy });
  }

  public getBundleManager(): BundleManager {
    return this.#bundleManager;
  }

  install(): void {
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

  async run(files: UppyFile[]): Promise<UppyFile[]> {
    // Create bundles from files with relative paths
    this.#bundleManager.createBundles();

    // Get virtual folder files representation
    const virtualFolderFiles = this.#bundleManager.createVirtualFolderFiles();

    // Remove all files that belong to bundles (but not root level files)
    const bundleFiles = files.filter((file) => {
      const relativePath = (file.meta as Record<string, any>)?.relativePath;
      if (
        !relativePath ||
        (file.meta as Record<string, any>)?.isBundle === true
      ) {
        return false;
      }
      // Only remove files that are in subdirectories (not root level)
      const pathParts = relativePath
        .split("/")
        .filter((part: string) => part.length > 0);
      return pathParts.length > 1;
    });

    bundleFiles.forEach((file) => {
      this.uppy.removeFile(file.id);
    });

    // Add virtual folder files to Uppy
    virtualFolderFiles.forEach((file) => {
      this.uppy.addFile(file);
    });

    return this.uppy.getFiles();
  }

  uninstall(): void {
    this.uppy.removePreProcessor(this.run.bind(this));
  }
}
