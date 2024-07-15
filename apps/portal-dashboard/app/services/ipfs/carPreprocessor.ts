import { BasePlugin, Body, Meta, Uppy, UppyFile } from "@uppy/core";
import { GetBlockProgressEvents } from "helia";
import { unixfs } from "@helia/unixfs";
import { car } from "@helia/car";
import { CarWriter } from "@ipld/car";
import type {
  DefinePluginOpts,
  PluginOpts,
} from "@uppy/core/lib/BasePlugin.js";
import { UppyFileDefault } from "@/features/uploadManager/lib/uploadManager.js";
// @ts-ignore
import type { CID } from "multiformats/cid";
import type { AbortOptions } from "@libp2p/interfaces";
import type { ProgressOptions } from "progress-events";
import { dashboardStore } from "@/stores/app";
import { IPFS, SERVICE_ID } from "@/services/ipfs/index.js";
import { asyncIterableReader, createDecoder } from "@ipld/car/decoder";
// @ts-ignore
import type { CarHeader, CarV2Header } from "@ipld/car/src/coding";

interface CarPreprocessorOpts<M extends Meta, B extends Body>
  extends PluginOpts {}

const defaultOptions = {} satisfies Partial<CarPreprocessorOpts<any, any>>;

type Opts<M extends Meta, B extends Body> = DefinePluginOpts<
  CarPreprocessorOpts<M, B>,
  keyof typeof defaultOptions
>;

class CarPreprocessorPlugin<M extends Meta, B extends Body> extends BasePlugin<
  Opts<M, B>,
  M,
  B
> {
  constructor(uppy: Uppy<M, B>, opts: CarPreprocessorOpts<M, B>) {
    super(uppy, { ...defaultOptions, ...opts });
    this.id = this.opts.id || "CarPreprocessor";
    this.type = "preprocessor";
  }

  install(): void {
    this.uppy.addPreProcessor(this.#processor.bind(this));
  }

  // @ts-ignore
  async #createCarStreamMemory(
    file: UppyFileDefault,
    onProgress: (progress: number) => void,
  ): Promise<[ReadableStream, CID]> {
    const helia = await this.#createHelia();
    const fs = unixfs(helia);
    const c = car(helia);

    const tracker = new ProgressTracker(BigInt(file.size || 0));

    let blocksCount = 0n;
    // Add the file to UnixFS and get the CID
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

    // Create CAR writer
    const { writer, out } = await CarWriter.create(cid);

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

    // Export to CAR with progress tracking
    c.export(cid, writer, options);

    return [
      new ReadableStream({
        async start(controller) {
          for await (const chunk of out) {
            controller.enqueue(chunk);
          }
          controller.close();
        },
      }),
      cid,
    ];
  }

  async #processor(fileIDs: string[], uploadID: string): Promise<void> {
    for (const fileID of fileIDs) {
      const file = this.uppy.getFile(fileID);

      if (this.#isIPFSFile(file)) {
        const isCarFile = await this.#isCarFile(file);
        if (isCarFile) {
          console.log(
            `File ${file.name} is a valid CAR file, skipping processing.`,
          );
          this.uppy.emit("preprocess-complete", asUppyFile(file));
        } else {
          await this.processFile(file);
        }
      }
    }

    console.log(`Processed files for upload ${uploadID}`);
  }

  async processFile(file: UppyFileDefault) {
    try {
      const [carStream, cid] = await this.#createCarStreamMemory(
        file,
        (progress) => {
          this.uppy.emit("preprocess-progress", asUppyFile(file), {
            mode: "determinate",
            message: "Processing file...",
            value: progress,
          });
        },
      );

      this.uppy.emit("preprocess-complete", asUppyFile(file), {
        mode: "determinate",
        message: "Processing file...",
        value: 100,
      });

      const carBlob = (await streamToBlob(
        carStream,
        "application/vnd.ipld.car",
      )) as BlobPart;

      file.data = new File([carBlob], cid.toString());

      // Update the file in Uppy's state
      this.uppy.setFileState(file.id, {
        data: file.data,
        // @ts-ignore
        car: true,
      });
    } catch (error) {
      console.error("Error processing file:", error);
      throw error;
    }
  }
  /*
  #isLargeFile(file: UppyFileDefault) {
    return (
      file.plugins &&
      file.plugins.filter((plugin) => PLUGIN_LARGE_SUFFIX_REGEX.test(plugin))
        .length > 0
    );
  }
*/

  #isIPFSFile(file: UppyFileDefault) {
    return (
      file.plugins &&
      file.plugins.filter((plugin) => /ipfs/.test(plugin)).length > 0
    );
  }

  async #createHelia() {
    return dashboardStore
      .getState()
      .getServiceById<IPFS>(SERVICE_ID)
      ?.getHelia()!;
  }

  async #isCarFile(file: UppyFileDefault): Promise<boolean> {
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
      let header: CarHeader | CarV2Header;
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
}

export default CarPreprocessorPlugin;

async function streamToBlob(
  readableStream: ReadableStream<any>,
  mimeType: string,
) {
  const reader = readableStream.getReader();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const concatenated = new Uint8Array(
    chunks.reduce((acc, chunk) => acc + chunk.length, 0),
  );
  let offset = 0;
  for (const chunk of chunks) {
    concatenated.set(chunk, offset);
    offset += chunk.length;
  }

  return new Blob([concatenated], { type: mimeType });
}

function asUppyFile<M extends Meta, B extends Body>(
  file: UppyFileDefault,
): UppyFile<M, B> {
  return file as UppyFile<M, B>;
}

type ProgressStage = "fileRead" | "unixfsImport";

interface ProgressState {
  fileRead: number;
  unixfsImport: number;
  carExport: number;
}

class ProgressTracker {
  private state: ProgressState = {
    fileRead: 0,
    unixfsImport: 0,
    carExport: 0,
  };
  private fileSize: bigint;

  constructor(fileSize: bigint) {
    this.fileSize = fileSize;
  }

  updateDataProgress(stage: ProgressStage, value: bigint) {
    this.state[stage] = Number((value * 100n) / this.fileSize);
  }
  updateBlockProgress(value: bigint) {
    this.state["carExport"] = Number(value);
  }
  getOverallProgress(): number {
    const { fileRead, unixfsImport, carExport } = this.state;
    return fileRead * 0.3 + unixfsImport * 0.4 + carExport * 0.3;
  }
}
