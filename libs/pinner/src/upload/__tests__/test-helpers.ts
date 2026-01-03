import { CarReader, CarWriter } from "@ipld/car";
import { CID } from "multiformats/cid";
import { sha256 } from "multiformats/hashes/sha2";
import { collectAsyncIterable } from "@/utils/stream";

/**
 * Set webkitRelativePath on a File object.
 * This is needed because webkitRelativePath is read-only in browser environments.
 */
export function setWebkitRelativePath(file: File, path: string): void {
  Object.defineProperty(file, "webkitRelativePath", {
    value: path,
    writable: false,
    configurable: true,
  });
}

export interface TestCarFile {
  file: File;
  rootCid: string;
  blocks: number;
}

/**
 * Create a valid CAR file for testing.
 * This uses the @ipld/car library to generate a proper CAR file structure.
 */
export async function createTestCarFile(
  content: string | Uint8Array = "test content",
  filename: string = "test.car",
): Promise<TestCarFile> {
  const data =
    typeof content === "string" ? new TextEncoder().encode(content) : content;

  // Create a CID for the data
  const hash = await sha256.digest(data);
  const cid = CID.create(1, 0x55, hash);

  // Create a CAR writer with the root CID
  const { writer, out } = CarWriter.create([cid]);

  // Collect all bytes from the async iterable
  const collectPromise = collectAsyncIterable(out);

  // Add the block to the CAR
  await writer.put({ cid, bytes: data });

  // Finish the CAR and get the bytes
  await writer.close();

  // Wait for all bytes to be collected
  const carBytes = await collectPromise;

  // Create a File object
  const file = new File([carBytes.buffer as ArrayBuffer], filename, {
    type: "application/vnd.ipld.car",
  });

  // Verify the CAR file is valid
  const reader = await CarReader.fromBytes(carBytes);
  const roots = await reader.getRoots();

  return {
    file,
    rootCid: cid.toString(),
    blocks: roots.length,
  };
}

/**
 * Create a CAR file with multiple blocks.
 */
export async function createMultiBlockCarFile(
  contents: Array<string | Uint8Array>,
  filename: string = "test-multi.car",
): Promise<TestCarFile> {
  const cids: CID[] = [];
  const blocks: Array<{ cid: CID; bytes: Uint8Array }> = [];

  for (const content of contents) {
    const data =
      typeof content === "string" ? new TextEncoder().encode(content) : content;

    const hash = await sha256.digest(data);
    const cid = CID.create(1, 0x55, hash);

    cids.push(cid);
    blocks.push({ cid, bytes: data });
  }

  // Create a CAR writer with all root CIDs
  const { writer, out } = CarWriter.create(cids);

  // Collect all bytes from the async iterable
  const collectPromise = collectAsyncIterable(out);

  // Add all blocks to the CAR
  for (const block of blocks) {
    await writer.put(block);
  }

  // Finish the CAR and get the bytes
  await writer.close();

  // Wait for all bytes to be collected
  const carBytes = await collectPromise;

  // Create a File object
  const file = new File([carBytes.buffer as ArrayBuffer], filename, {
    type: "application/vnd.ipld.car",
  });

  // Verify the CAR file is valid
  const reader = await CarReader.fromBytes(carBytes);
  const roots = await reader.getRoots();

  return {
    file,
    rootCid: cids[0].toString(),
    blocks: roots.length,
  };
}

/**
 * Create an invalid CAR file (not a valid CAR format).
 */
export function createInvalidCarFile(filename: string = "invalid.car"): File {
  const invalidData = new TextEncoder().encode("This is not a CAR file");
  return new File([invalidData], filename, {
    type: "application/vnd.ipld.car",
  });
}

/**
 * Create a CAR file with no roots (empty header).
 */
export async function createEmptyCarFile(
  filename: string = "empty.car",
): Promise<File> {
  // Create a CAR writer with no roots
  const { writer, out } = CarWriter.create([]);

  // Collect all bytes from the async iterable
  const collectPromise = collectAsyncIterable(out);

  // Finish the CAR and get the bytes
  await writer.close();

  // Wait for all bytes to be collected
  const carBytes = await collectPromise;

  return new File([carBytes.buffer as ArrayBuffer], filename, {
    type: "application/vnd.ipld.car",
  });
}

/**
 * Create a regular file (not a CAR file).
 */
export function createRegularFile(
  content: string,
  filename: string = "regular.txt",
): File {
  const data = new TextEncoder().encode(content);
  return new File([data], filename, {
    type: "text/plain",
  });
}

/**
 * Create a file with .car extension but invalid content.
 */
export function createFakeCarFile(filename: string = "fake.car"): File {
  const fakeData = new TextEncoder().encode("Fake CAR content");
  return new File([fakeData], filename, {
    type: "application/octet-stream",
  });
}

export const TEST_DATA = {
  simple: "Hello, World!",
  binary: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]),
  json: JSON.stringify({ foo: "bar", num: 42 }),
  empty: "",
  large: "x".repeat(1024),
};

export interface DirectoryFile {
  name: string;
  content: string | Uint8Array;
  path: string;
}

/**
 * Create files with directory structure using webkitRelativePath.
 */
export function createDirectoryFiles(files: DirectoryFile[]): File[] {
  return files.map(({ name, content, path }) => {
    const file = new File(
      [
        content instanceof Uint8Array
          ? (content.buffer as ArrayBuffer)
          : new TextEncoder().encode(content),
      ],
      name,
    );
    setWebkitRelativePath(file, path);
    return file;
  });
}

export interface DirectoryStructureOptions {
  maxDepth?: number;
  filesPerDir?: number;
  dirNames?: string[];
  fileNames?: string[];
}

/**
 * Dynamically generate a complex directory structure.
 */
export function generateDirectoryStructure(
  options: DirectoryStructureOptions = {},
): File[] {
  const {
    maxDepth = 3,
    filesPerDir = 2,
    dirNames = ["dir1", "dir2", "dir3", "subdir", "data", "nested"],
    fileNames = [
      "file1.txt",
      "file2.txt",
      "file3.txt",
      "data.json",
      "readme.md",
    ],
  } = options;

  const files: DirectoryFile[] = [];
  let fileCounter = 0;

  function generateLevel(basePath: string, depth: number) {
    if (depth > maxDepth) return;

    // Add files at this level
    for (let i = 0; i < filesPerDir; i++) {
      const fileName = fileNames[fileCounter % fileNames.length];
      const content = `Content for ${basePath}/${fileName} at depth ${depth}`;
      files.push({
        name: fileName,
        content,
        path: basePath ? `${basePath}/${fileName}` : fileName,
      });
      fileCounter++;
    }

    // Add subdirectories
    if (depth < maxDepth) {
      const numDirs = Math.floor(Math.random() * 2) + 1; // 1-2 subdirs
      for (let i = 0; i < numDirs; i++) {
        const dirName = dirNames[Math.floor(Math.random() * dirNames.length)];
        const newPath = basePath ? `${basePath}/${dirName}` : dirName;
        generateLevel(newPath, depth + 1);
      }
    }
  }

  generateLevel("", 0);
  return createDirectoryFiles(files);
}

/**
 * Extract metadata from CAR file blocks.
 */
export async function extractCarMetadata(carBytes: Uint8Array): Promise<{
  rootCid: string;
  blockCount: number;
  cids: string[];
}> {
  const reader = await CarReader.fromBytes(carBytes);
  const roots = await reader.getRoots();
  const cids: string[] = [];

  for await (const block of reader.blocks()) {
    cids.push(block.cid.toString());
  }

  return {
    rootCid: roots[0]?.toString() || "",
    blockCount: cids.length,
    cids,
  };
}

/**
 * Create a ReadableStream from string or Uint8Array data.
 */
export function createReadableStream(
  data: string | Uint8Array,
): ReadableStream {
  const encoded =
    typeof data === "string" ? new TextEncoder().encode(data) : data;
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoded);
      controller.close();
    },
  });
}

/**
 * Create a ReadableStream with a specific size in bytes.
 * The stream will generate repeated 'x' characters to fill the size.
 */
export function createReadableStreamOfSize(size: number): ReadableStream {
  const chunkSize = 1024 * 1024; // 1MB chunks
  const chunk = new Uint8Array(chunkSize).fill(120); // ASCII 'x'
  let bytesRemaining = size;

  return new ReadableStream({
    pull(controller) {
      if (bytesRemaining <= 0) {
        controller.close();
        return;
      }

      const bytesToSend = Math.min(chunkSize, bytesRemaining);
      const slice = chunk.subarray(0, bytesToSend);
      controller.enqueue(slice);
      bytesRemaining -= bytesToSend;
    },
  });
}

export async function streamToFile(
  stream: ReadableStream,
  name: string,
  type: string = "application/vnd.ipld.car",
): Promise<File> {
  const blob = await new Response(stream).blob();
  return new File([blob], name, { type });
}

export async function streamToString(stream: ReadableStream): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let result = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value, { stream: true });
  }

  return result;
}

export async function captureStreamData(
  stream: ReadableStream,
): Promise<Uint8Array> {
  const chunks: Uint8Array[] = [];
  const reader = stream.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

/**
 * Read all chunks from a CAR stream.
 */
export async function readCarStream(
  stream: ReadableStream,
): Promise<Uint8Array[]> {
  const chunks: Uint8Array[] = [];
  const reader = stream.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  return chunks;
}

/**
 * Assert that a CAR result is valid.
 * Note: This function expects the vitest `expect` function to be passed in.
 */
export function expectValidCarResult(result: any, expectFn: any) {
  expectFn(result).toBeDefined();
  expectFn(result.carStream).toBeInstanceOf(ReadableStream);
  expectFn(result.rootCid).toBeDefined();
  expectFn(typeof result.rootCid).toBe("string");
  expectFn(result.size).toBeGreaterThan(0n);
}

// Helper function to create mock CID synchronously
// Generates deterministic CID-like strings for test purposes
export function getMockCID(index: number = 0): string {
  // Generate a deterministic base32 string that looks like a CID
  const base32Chars = "abcdefghijklmnopqrstuvwxyz234567";
  let result = "";
  const seed = index + 1000; // Start from a reasonable offset

  for (let i = 0; i < 59; i++) {
    result += base32Chars[(seed * (i + 1)) % 32];
  }

  return `b${result}`; // Prefix with 'b' to indicate base32 encoding
}
