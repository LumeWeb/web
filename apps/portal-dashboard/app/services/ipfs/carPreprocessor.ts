import { BasePlugin, Body, Meta, Uppy, UppyFile } from "@uppy/core";
import { GetBlockProgressEvents, Helia } from "helia";
import { createHeliaHTTP } from "@helia/http";
import { unixfs } from "@helia/unixfs";
import { car } from "@helia/car";
import { CarWriter } from "@ipld/car";
import type {
  DefinePluginOpts,
  PluginOpts,
} from "@uppy/core/lib/BasePlugin.js";
import {
  PLUGIN_LARGE_SUFFIX_REGEX,
  UppyFileDefault,
} from "~/features/uploadManager/lib/uploadManager.js";
// @ts-ignore
import type { CID } from "multiformats/cid";
import type { AbortOptions } from "@libp2p/interfaces";
import type { ProgressOptions } from "progress-events";
import { IDBBlockstore } from "blockstore-idb";
import { IDBDatastore } from "datastore-idb";
import fetchPortalMeta from "~/util/fetchPortalMeta.js";
import getPortalUrl from "~/stores/getPortalUrl.js";

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
  #helia?: Helia;

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

      // @ts-ignore
      if (!file.car && this.#isIPFSFile(file)) {
        await this.processFile(file);
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
      file.name = `${cid.toString()}.car`;
      file.type = "application/vnd.ipld.car";

      // Flag
      // @ts-ignore
      file.car = true;

      // Update the file in Uppy's state
      this.uppy.setFileState(file.id, {
        [file.id]: file,
      });

      return file;
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
    if (!this.#helia) {
      const meta = await fetchPortalMeta(getPortalUrl());

      const blockstore = new IDBBlockstore(meta.domain);
      const datastore = new IDBDatastore(meta.domain);

      await blockstore.open();
      await datastore.open();

      this.#helia = await createHeliaHTTP({
        blockstore,
        datastore,
      });
    }

    return this.#helia;
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
