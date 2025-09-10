import type { AbortOptions } from "@libp2p/interfaces";
import type {
  Body,
  DefinePluginOpts,
  Meta,
  PluginOpts,
  Uppy,
  UppyFile,
} from "@uppy/core";
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
import { BasePlugin } from "@uppy/core";

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
      const [carStream] = await this.#createCarStream(file, (progress) => {
        this.uppy.emit("preprocess-progress", file, {
          message: "Processing file...",
          mode: "determinate",
          value: progress,
        });
      });

      // Tee the stream so we can use it for both CarReader and streamToBlob
      const [carStreamForReader, carStreamForBlob] = carStream.tee();

      this.uppy.emit("preprocess-complete", file, {
        message: "Processing file...",
        mode: "determinate",
        value: 100,
      });

      // Convert ReadableStream to AsyncIterable for CarReader
      const asyncIterableStream = {
        [Symbol.asyncIterator]: async function* () {
          const reader = carStreamForReader.getReader();
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              yield value;
            }
          } finally {
            reader.releaseLock();
          }
        }
      };

      // Extract the root CID from the CAR stream
      const reader = await CarReader.fromIterable(asyncIterableStream);
      const roots = await reader.getRoots();
      const rootCid = roots[0];

      // Create a new File from the second stream
      const carBlob = await streamToBlob(carStreamForBlob, "application/vnd.ipld.car");

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
        }
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
    file: UppyFile<M, B>,
    onProgress: (progress: number) => void,
  ): Promise<[ReadableStream]> {
    const helia = await this.#createHelia();
    const fs = unixfs(helia);
    const c = car(helia);

    const tracker = new ProgressTracker(BigInt(file.size || 0));

    let blocksCount = 0n;

    // Handle directory uploads using helper functions
    if (isDirectoryFile(file) || isFolderBundle(file)) {
      let dirFiles: File[] = [];
      if (isDirectoryFile(file)) {
        // Regular directory upload with webkitRelativePath
        dirFiles = Object.values(this.uppy.getFiles())
          .filter(isDirectoryFile)
          .map((f) => f.data as File);
      } else if (isFolderBundle(file)) {
        // Bundle directory upload
        const meta = file.meta as BundleMetadata;
        dirFiles = meta.originalFiles || [];
      }

      const src = fileSource(dirFiles, (progress) => {
        tracker.updateDataProgress("fileRead", BigInt(progress));
        onProgress(tracker.getOverallProgress());
      });

      const addOptions = {
        onProgress(event) {
          if (event.type === "unixfs:importer:progress:file:read") {
            tracker.updateDataProgress("fileRead", event.detail.bytesRead);
          } else if (event.type === "unixfs:importer:progress:file:write") {
            tracker.updateDataProgress(
              "unixfsImport",
              event.detail.bytesWritten,
            );
          } else if (event.type === "blocks:put:blockstore:put") {
            blocksCount++;
          }
          onProgress(tracker.getOverallProgress());
        },
      };

      // Add all files to UnixFS and get the root CID
      let cid: CID;
      for await (const result of fs.addAll(src, addOptions)) {
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

            tracker.updateBlockProgress(
              (carBlocksWritten * 100n) / blocksCount,
            );

            onProgress(tracker.getOverallProgress());
          }
        },
      };

      // Stream to CAR with progress tracking
      const carStream = c.stream(cid, options);
      return [asyncGeneratorToReadableStream(carStream)];
    }

    // Handle single file upload
    const cid = await fs.addByteStream(file.data.stream() as any, {
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
    });

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
    return [asyncGeneratorToReadableStream(carStream)];
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
      const fileIterable = {
        [Symbol.asyncIterator]: async function* () {
          const reader = file.data.stream().getReader();
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            yield value;
          }
        },
      };

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

  // Calculate total bytes for progress tracking
  files.forEach((file) => {
    totalBytes += BigInt(file.size);
  });

  for (const file of files) {
    const fullPath = (file as any).webkitRelativePath ?? file.name;

    // Skip hidden files if they're not explicitly allowed
    if (fullPath.includes("/.")) {
      continue;
    }

    // Yield intermediate directories
    const parts = fullPath.split("/").filter((part: string) => part.length > 0);
    for (let i = 1; i < parts.length; i++) {
      const dirPath = parts.slice(0, i).join("/");
      if (!seenDirs.has(dirPath)) {
        seenDirs.add(dirPath);
        yield {
          content: undefined,
          path: dirPath,
        };
      }
    }

    // Yield the file with its content stream
    yield {
      content: file.stream(),
      path: fullPath,
    };

    // Update progress if callback provided
    if (onProgress && totalBytes > 0n) {
      processedBytes += BigInt(file.size);
      onProgress(Number((processedBytes * 100n) / totalBytes));
    } else if (onProgress) {
      // Fallback progress if totalBytes is 0 (shouldn't happen but just in case)
      onProgress(100);
    }
  }
}

async function streamToBlob(
  readableStream: ReadableStream<any>,
  mimeType?: string,
): Promise<Blob> {
  const response = new Response(readableStream);
  const blob = await response.blob();
  return mimeType !== undefined ? new Blob([blob], { type: mimeType }) : blob;
}

export default CarPreprocessorPlugin;
