import type { AbortOptions } from "@libp2p/interfaces";
import type {
  Body,
  DefinePluginOpts,
  Meta,
  PluginOpts,
  Uppy,
  UppyFile,
} from "@uppy/core";
import { BasePlugin } from "@uppy/core";
import type { CID } from "multiformats/cid";
import type { ProgressOptions } from "progress-events";

import { car } from "@helia/car";
import { CarReader } from "@ipld/car";
import { createHeliaHTTP, GetBlockProgressEvents } from "@helia/http";
import { unixfs } from "@helia/unixfs";
import { asyncIterableReader, createDecoder } from "@ipld/car/decoder";
import {
  BundleMetadata,
  isDirectoryFile,
  isFolderBundle,
} from "@lumeweb/portal-plugin-dashboard";
import { streamToBlob, readableStreamToAsyncIterable } from "../utils/stream";

type CarPreprocessorOpts<M extends Meta, B extends Body> = PluginOpts;

const defaultOptions = {} satisfies Partial<CarPreprocessorOpts<any, any>>;

type Opts<M extends Meta, B extends Body> = DefinePluginOpts<
  CarPreprocessorOpts<M, B>,
  keyof typeof defaultOptions
>;

type ProgressStage = "fileRead" | "unixfsImport";

interface ProgressState {
  carExport: number;
  fileRead: number;
  unixfsImport: number;
}

class CarPreprocessorPlugin<M extends Meta, B extends Body> extends BasePlugin<
  Opts<M, B>,
  M,
  B
> {
  #helia: any;

  constructor(uppy: Uppy<M, B>, opts: CarPreprocessorOpts<M, B>) {
    super(uppy, { ...defaultOptions, ...opts });
    this.id = this.opts.id || "CarPreprocessor";
    this.type = "preprocessor";
    this.#helia = null;
  }

  install(): void {
    this.uppy.addPreProcessor(this.#processor.bind(this));
  }

  async processFile(file: UppyFile<M, B>) {
    try {
      const [carStream, rootCid] = await this.#createCarStream(
        file,
        (progress) => {
          this.uppy.emit("preprocess-progress", file, {
            message: "Processing file...",
            mode: "determinate",
            value: progress,
          });
        },
      );

      this.uppy.emit("preprocess-complete", file, {
        message: "Processing file...",
        mode: "determinate",
        value: 100,
      });

      // Create a new File from the CAR stream
      const carBlob = await streamToBlob(carStream, "application/vnd.ipld.car");

      // Preserve the original filename - don't replace it with cid.toString()
      file.data = new File([carBlob], file.name, {
        type: "application/vnd.ipld.car",
      });

      // Update the file in Uppy's state with the CID in meta
      this.uppy.setFileState(file.id, {
        car: true,
        data: file.data,
        meta: {
          ...file.meta,
          cid: rootCid.toString(),
        },
      });
    } catch (error) {
      console.error("Error processing file:", error);
      throw error;
    }
  }

  #collectDirectoryFiles(
    rootDir: string,
    fileID: string,
  ): { childFileIDs: string[]; dirFiles: UppyFile<M, B>[] } {
    const dirFiles = Object.values(this.uppy.getFiles()).filter((f) => {
      if (!f) return false;
      if (isDirectoryFile(f)) {
        return (f.data as any).webkitRelativePath?.startsWith(rootDir + "/");
      }
      if (isFolderBundle(f)) {
        return (f.meta as BundleMetadata).bundleName === rootDir;
      }
      return false;
    });

    const childFileIDs = dirFiles
      .filter((f) => f.id !== fileID)
      .map((f) => f.id);

    return { childFileIDs, dirFiles };
  }

  async #createCarStream(
    file: UuppyFile<M, B>,
    onProgress: (progress: number) => void,
  ): Promise<[ReadableStream, CID]> {
    const helia = await this.#createHelia();
    const fs = unixfs(helia);
    const c = car(helia);

    const tracker = new ProgressTracker(BigInt(file.size || 0));

    let blocksCount = 0n;

    // Determine files array and wrapWithDirectory option based on file type
    let files: File[] = [];
    const wrapWithDirectory = isDirectoryFile(file) || isFolderBundle(file);

    if (isFolderBundle(file)) {
      // Bundle directory upload
      const meta = file.meta as BundleMetadata;
      files = meta.originalFiles || [];
    } else if (isDirectoryFile(file)) {
      // Regular directory upload with webkitRelativePath
      // First check if this file has originalFiles in its metadata (from folder bundles)
      const meta = file.meta as BundleMetadata;
      if (meta.originalFiles && meta.originalFiles.length > 0) {
        files = meta.originalFiles;
      } else {
        // Fall back to filtering uppy.getFiles() for regular directory uploads
        files = Object.values(this.uppy.getFiles())
          .filter(isDirectoryFile)
          .map((f) => f.data as File);
      }
    } else {
      // Single file upload
      files = [file.data as File];
    }

    const src = fileSource(files, (progress) => {
      tracker.updateDataProgress("fileRead", BigInt(progress));
      onProgress(tracker.getOverallProgress());
    });

    const addOptions = {
      // Use protobuf format for all nodes to preserve metadata
      cidVersion: 1,
      rawLeaves: false,
      onProgress(event) {
        if (event.type === "unixfs:importer:progress:file:read") {
          tracker.updateDataProgress("fileRead", event.detail.bytesRead);
        } else if (event.type === "unixfs:importer:progress:file:write") {
          tracker.updateDataProgress("unixfsImport", event.detail.bytesWritten);
        } else if (event.type === "blocks:put:blockstore:put") {
          blocksCount++;
        }
        onProgress(tracker.getOverallProgress());
      },
    };

    // Add all files to UnixFS and get the root CID
    let cid: CID;

    for await (const result of fs.addAll(src, addOptions)) {
      // Store the last result which should be the root directory
      cid = result.cid;
    }

    if (!cid) {
      throw new Error("Failed to import files to UnixFS");
    }

    let carBlocksWritten = 0n;
    const options: AbortOptions & ProgressOptions<GetBlockProgressEvents> = {
      onProgress(event: GetBlockProgressEvents) {
        if (event.type === "blocks:get:blockstore:get") {
          carBlocksWritten++;

          if (blocksCount === 0n) {
            return;
          }

          tracker.updateBlockProgress((carBlocksWritten * 100n) / blocksCount);

          onProgress(tracker.getOverallProgress());
        }
      },
    };

    // Stream to CAR with progress tracking
    const carStream = c.stream(cid, options);
    return [asyncGeneratorToReadableStream(carStream), cid];
  }

  async #createHelia() {
    if (this.#helia) {
      return this.#helia;
    }

    try {
      // Create Helia HTTP instance without specifying servers
      // This will use the default remote Helia server configuration
      this.#helia = await createHeliaHTTP();
      return this.#helia;
    } catch (error) {
      console.error("Error creating Helia HTTP instance:", error);
      throw error;
    }
  }

  #handleCarFile(file: UppyFile<M, B>): void {
    console.log(`File ${file.name} is a valid CAR file, skipping processing.`);
    this.uppy.emit("preprocess-complete", file);
  }

  async #isCarFile(file: UppyFile<M, B>): Promise<boolean> {
    if (
      file.type !== "application/vnd.ipld.car" &&
      !file.name?.endsWith(".car")
    ) {
      return false;
    }

    try {
      // Create an async iterable from the file
      const fileIterable = readableStreamToAsyncIterable(file.data.stream());

      const reader = asyncIterableReader(fileIterable);
      // Attempt to decode the CAR file
      const decoder = createDecoder(reader);
      let header: any;
      try {
        header = await decoder.header();
      } catch {
        return false;
      }

      // If we can get the roots, it's likely a valid CAR file
      return header.roots.length > 0;
    } catch (error) {
      console.error("Error verifying CAR file:", error);
      return false;
    }
  }

  #isIPFSFile(file: UppyFile<M, B>) {
    return (
      file.plugins &&
      file.plugins.filter((plugin) => /ipfs/.test(plugin)).length > 0
    );
  }

  #logProcessingStats(
    processedCount: number,
    directoryCount: number,
    uploadID: string,
  ): void {
    console.log(
      `Processed ${directoryCount} directories and ${processedCount} files for upload ${uploadID}`,
    );
  }

  async #processFiles(
    fileIDs: string[],
  ): Promise<{ directoryCount: number; processedCount: number }> {
    const files = fileIDs.map((id) => this.uppy.getFile(id)).filter(Boolean);

    // First process all root directory bundles
    const directoryFiles = files.filter(isFolderBundle);

    const processedDirs = new Set<string>();
    let directoryCount = 0;

    for (const file of directoryFiles) {
      if (!this.#shouldProcessFile(file)) {
        continue;
      }

      if (await this.#isCarFile(file)) {
        this.#handleCarFile(file);
        continue;
      }

      const rootDir = (file.meta as BundleMetadata).bundleName;

      if (processedDirs.has(rootDir)) {
        continue;
      }
      processedDirs.add(rootDir);

      const { childFileIDs } = this.#collectDirectoryFiles(rootDir, file.id);
      this.#removeChildFiles(childFileIDs);
      directoryCount++;

      await this.processFile(file);
    }

    // Then process remaining non-directory files
    let processedCount = directoryCount;
    const remainingFiles = files.filter(
      (file) =>
        !isFolderBundle(file) &&
        !isDirectoryFile(file) &&
        this.#shouldProcessFile(file) &&
        !processedDirs.has(
          (file.data as any)?.webkitRelativePath?.split("/")[0],
        ),
    );

    for (const file of remainingFiles) {
      if (await this.#isCarFile(file)) {
        this.#handleCarFile(file);
      } else {
        await this.processFile(file);
      }
      processedCount++;
    }

    return { directoryCount, processedCount };
  }

  async #processor(fileIDs: string[], uploadID: string): Promise<void> {
    const { directoryCount, processedCount } =
      await this.#processFiles(fileIDs);
    this.#logProcessingStats(processedCount, directoryCount, uploadID);
  }

  #removeChildFiles(childFileIDs: string[]): void {
    const { currentUploads } = this.uppy.getState();
    const updatedUploads = { ...currentUploads };

    // First remove all child files
    childFileIDs.forEach((id) => {
      try {
        this.uppy.removeFile(id);
      } catch (error) {
        console.debug(`Could not remove file ${id}:`, error);
      }
    });

    // Then update all uploads to remove the child file IDs
    Object.keys(updatedUploads).forEach((uploadID) => {
      const upload = updatedUploads[uploadID];
      updatedUploads[uploadID] = {
        ...upload,
        fileIDs: upload.fileIDs.filter(
          (fileID) => !childFileIDs.includes(fileID),
        ),
      };
    });

    // Finally update state once with all changes
    this.uppy.setState({
      currentUploads: updatedUploads,
    });
  }

  #shouldProcessFile(file: UppyFile<M, B>): boolean {
    return this.#isIPFSFile(file);
  }
}

class ProgressTracker {
  private fileSize: bigint;
  private state: ProgressState = {
    carExport: 0,
    fileRead: 0,
    unixfsImport: 0,
  };

  constructor(fileSize: bigint) {
    this.fileSize = fileSize;
  }

  getOverallProgress(): number {
    const { carExport, fileRead, unixfsImport } = this.state;
    return fileRead * 0.3 + unixfsImport * 0.4 + carExport * 0.3;
  }

  updateBlockProgress(value: bigint) {
    this.state.carExport = Number(value);
  }

  updateDataProgress(stage: ProgressStage, value: bigint) {
    this.state[stage] = Number((value * 100n) / this.fileSize);
  }
}

function asyncGeneratorToReadableStream<T>(
  asyncGenerator: AsyncGenerator<T>,
): ReadableStream<T> {
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of asyncGenerator) {
          controller.enqueue(chunk);
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}

// File source for handling File objects with webkitRelativePath
async function* fileSource(
  files: File[],
  onProgress?: (progress: number) => void,
): AsyncGenerator<{ content: AsyncIterable<Uint8Array>; path: string }> {
  const seenDirs = new Set<string>();
  let totalBytes = 0n;
  let processedBytes = 0n;

  console.log("[fileSource] Starting to process files:", files.length);

  // Calculate total bytes for progress tracking
  files.forEach((file) => {
    totalBytes += BigInt(file.size);
    console.log("[fileSource] File details:", {
      name: file.name,
      size: file.size,
      webkitRelativePath: (file as any).webkitRelativePath,
      type: file.type,
    });
  });

  console.log("[fileSource] Total bytes to process:", totalBytes);

  for (const file of files) {
    const fullPath = (file as any).webkitRelativePath ?? file.name;
    console.log("[fileSource] Processing file with fullPath:", fullPath);

    // Skip hidden files if they're not explicitly allowed
    if (fullPath.includes("/.")) {
      console.log("[fileSource] Skipping hidden file:", fullPath);
      continue;
    }

    // Yield intermediate directories
    const parts = fullPath.split("/").filter((part: string) => part.length > 0);
    console.log("[fileSource] Path parts:", parts);

    for (let i = 1; i < parts.length; i++) {
      const dirPath = parts.slice(0, i).join("/");
      console.log("[fileSource] Checking directory path:", dirPath);

      if (!seenDirs.has(dirPath)) {
        console.log("[fileSource] Yielding intermediate directory:", dirPath);
        seenDirs.add(dirPath);
        yield {
          content: undefined,
          path: dirPath,
        };
      } else {
        console.log("[fileSource] Directory already seen, skipping:", dirPath);
      }
    }

    // Yield the file with its content stream
    console.log("[fileSource] Yielding file with path:", fullPath);
    yield {
      content: file.stream(),
      path: fullPath,
    };

    // Update progress if callback provided
    if (onProgress && totalBytes > 0n) {
      processedBytes += BigInt(file.size);
      const progressPercent = Number((processedBytes * 100n) / totalBytes);
      console.log("[fileSource] Progress tracking:", {
        processedBytes: processedBytes,
        totalBytes: totalBytes,
        progressPercent: progressPercent,
      });
      onProgress(progressPercent);
    } else if (onProgress) {
      // Fallback progress if totalBytes is 0 (shouldn't happen but just in case)
      console.log("[fileSource] Fallback progress (100%)");
      onProgress(100);
    }
  }

  console.log("[fileSource] Finished processing all files");
}

export default CarPreprocessorPlugin;
