import { car } from "@helia/car";
import { createHelia, createHeliaLight } from "helia";
import { withLibp2p } from "@helia/libp2p";
import { withBitswap } from "@helia/bitswap";
import { withHTTP } from "@helia/http";
import { unixfs } from "@helia/unixfs";
import * as dagCbor from "@ipld/dag-cbor";
import * as dagJson from "@ipld/dag-json";
import * as json from "multiformats/codecs/json";
import { sha512 } from "multiformats/hashes/sha2";
import {
  createBlockstore,
  createDatastore as createUnstorageDatastore,
} from "@/blockstore";
import type { CID } from "multiformats/cid";
import { CarReader } from "@ipld/car";
import type { Datastore } from "interface-datastore";
import type { Libp2p } from "@libp2p/interface";

import {
  asyncGeneratorToReadableStream,
  calculateStreamSize,
  readableStreamToAsyncIterable,
  streamToBlob,
} from "@/utils/stream";
import { FILE_EXTENSION_CAR, MIME_TYPE_CAR } from "@/types/mime-types";

export interface CarPreprocessOptions {
  /**
   * Name for the pin or filter
   */
  name?: string;
  /**
   * Progress callback for preprocessing
   */
  onProgress?: (percentage: number) => void;
  /**
   * AbortSignal to cancel the operation
   */
  signal?: AbortSignal;
}

export interface CarPreprocessResult {
  /**
   * Preprocessed CAR data as a readable stream
   */
  carStream: ReadableStream<Uint8Array>;
  /**
   * Root CID of the CAR file
   */
  rootCid: string;
  /**
   * Size in bytes
   */
  size: bigint;
}

export interface CarConfig {
  /**
   * Custom datastore instance for Helia.
   * If provided, this datastore will be used directly without creating one from storage.
   * Highest priority - takes precedence over storage and datastoreName.
   */
  datastore?: Datastore;

  /**
   * Custom base name for Helia storage.
   * Passed as the `base` option to both blockstore and datastore storage instances.
   * Only used when datastore is not provided.
   * @default "pinner-helia-data"
   */
  datastoreName?: string;

  /**
   * Pre-created Libp2p instance for Helia.
   * When provided, Helia skips its internal createLibp2p() / libp2pDefaults()
   * entirely, avoiding unnecessary transports (WebRTC, UPnP, etc.).
   */
  libp2p?: Libp2p;
}

let helia: any = null;
let blockstore: any = null;
let datastore: any = null;
let config: CarConfig = {};

export function configureCar(carConfig: CarConfig) {
  config = carConfig;
}

async function getHelia() {
  if (helia) return helia;

  const BlockstoreClass = createBlockstore();
  const DatastoreClass = createUnstorageDatastore();

  blockstore = new BlockstoreClass({
    prefix: "pinner-helia-blocks",
    base: config.datastoreName,
  });
  datastore =
    config.datastore ||
    new DatastoreClass({
      prefix: "pinner-helia-data",
      base: config.datastoreName,
    });

  if (config.libp2p) {
    // When a pre-created Libp2p instance is provided, bypass createHelia()
    // which calls withLibp2p() without passing the libp2p instance through.
    // Manually compose the same pipeline: createHeliaLight → withHTTP →
    // withLibp2p(helia, libp2p) → withBitswap. This skips createLibp2p() /
    // libp2pDefaults() entirely, so WebRTC and UPnP transports never load.
    helia = withBitswap(
      withLibp2p(
        withHTTP(
          createHeliaLight({
            blockstore,
            datastore,
            codecs: [dagCbor, dagJson, json],
            hashers: [sha512],
          }),
        ),
        config.libp2p,
      ),
    );
  } else {
    helia = await createHelia({
      blockstore,
      datastore,
    });
  }

  return helia;
}

async function cleanupHelia() {
  if (datastore?.close) {
    await datastore.close();
  }
  helia = null;
  blockstore = null;
  datastore = null;
}

async function* fileSource(
  files: File[],
  onProgress?: (percentage: number) => void,
  signal?: AbortSignal,
): AsyncGenerator<{
  content: AsyncIterable<Uint8Array> | undefined;
  /**
   * File path within the pin
   */
  path: string;
}> {
  const seenDirs = new Set<string>();
  let totalBytes = 0n;
  let processedBytes = 0n;

  for (const file of files) {
    totalBytes += BigInt(file.size);
  }

  for (const file of files) {
    if (signal?.aborted) {
      throw new Error("Aborted");
    }

    const fullPath = (file as any).webkitRelativePath ?? file.name;

    if (fullPath.includes("/.")) {
      continue;
    }

    const parts = fullPath.split("/").filter((part: string) => part.length > 0);

    for (let i = 1; i < parts.length; i++) {
      if (signal?.aborted) {
        throw new Error("Aborted");
      }

      const dirPath = parts.slice(0, i).join("/");

      if (!seenDirs.has(dirPath)) {
        seenDirs.add(dirPath);
        yield {
          content: (async function* () {})(),
          path: dirPath,
        };
      }
    }

    yield {
      content: readableStreamToAsyncIterable(file.stream()),
      path: fullPath,
    };

    if (onProgress && totalBytes > 0n) {
      processedBytes += BigInt(file.size);
      const progressPercent = Number((processedBytes * 100n) / totalBytes);
      onProgress(progressPercent);
    }
  }
}

export async function preprocessToCar(
  input: File | ReadableStream<Uint8Array> | File[],
  options?: CarPreprocessOptions,
): Promise<CarPreprocessResult> {
  let files: File[];

  if (input instanceof ReadableStream) {
    const [streamForSize, streamForFile] = input.tee();
    const size = await calculateStreamSize(streamForSize, options?.signal);
    const streamBlob = await streamToBlob(
      streamForFile,
      "application/octet-stream",
    );
    files = [
      new File([streamBlob], options?.name || "upload", {
        type: streamBlob.type,
      }),
    ];
  } else if (Array.isArray(input)) {
    files = input;
  } else {
    files = [input];
  }

  // wrapWithDirectory must be true for directory uploads (File[] input) so the
  // last addAll yield is the root directory CID, not a child file/subdirectory.
  // Single files don't need wrapping. Matches Go SDK wrapInDir behavior.
  const wrapWithDirectory = Array.isArray(input);

  const heliaInstance = await getHelia();
  const fs = unixfs(heliaInstance);
  const c = car(heliaInstance);

  let rootCid: CID | undefined;
  let blocksCount = 0n;

  const src = fileSource(files, options?.onProgress, options?.signal);

  let hasFiles = false;
  for await (const result of fs.addAll(src, {
    cidVersion: 1,
    rawLeaves: false,
    wrapWithDirectory,
    signal: options?.signal,
    onProgress(event) {
      if (event.type === "blocks:put:blockstore:put") {
        blocksCount++;
      }
    },
  })) {
    if (options?.signal?.aborted) {
      throw new Error("Aborted");
    }
    rootCid = result.cid;
    hasFiles = true;
  }

  if (!hasFiles || !rootCid) {
    throw new Error("No files to process");
  }

  // c.export() now returns an async generator directly (was renamed from 'stream')
  const carAsyncGenerator = c.export(rootCid!, { signal: options?.signal });
  const carStream = asyncGeneratorToReadableStream(carAsyncGenerator);

  // Use stream tee to create two identical streams - one for size calculation, one for processing
  const [streamForSize, streamForProcessing] = carStream.tee();

  const size = await calculateStreamSize(streamForSize, options?.signal);

  return {
    carStream: streamForProcessing,
    rootCid: rootCid!.toString(),
    size,
  };
}

export async function isCarFile(file: File): Promise<boolean> {
  if (file.type !== MIME_TYPE_CAR && !file.name.endsWith(FILE_EXTENSION_CAR)) {
    return false;
  }

  try {
    const iterable = readableStreamToAsyncIterable(file.stream());
    const reader = await CarReader.fromIterable(iterable);
    const roots = await reader.getRoots();
    return roots.length > 0;
  } catch {
    return false;
  }
}

export async function destroyCarPreprocessor() {
  await cleanupHelia();
}
