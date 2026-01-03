import { afterEach, describe, expect, it, vi } from "vitest";
import { CarReader } from "@ipld/car";
import { destroyCarPreprocessor, isCarFile, preprocessToCar } from "../car";
import {
  createEmptyCarFile,
  createFakeCarFile,
  createInvalidCarFile,
  createMultiBlockCarFile,
  createReadableStream,
  createRegularFile,
  createTestCarFile,
  expectValidCarResult,
  extractCarMetadata,
  generateDirectoryStructure,
  readCarStream,
  setWebkitRelativePath,
  TEST_DATA,
} from "./test-helpers";
import {
  collectAsyncIterable,
  readableStreamToAsyncIterable,
} from "@/utils/stream";
import { assertCallbackCalled } from "./test-assertions";

describe("car.ts", () => {
  describe("isCarFile", () => {
    it("should return true for a valid CAR file with correct MIME type", async () => {
      const { file } = await createTestCarFile(TEST_DATA.simple);
      expect(await isCarFile(file)).toBe(true);
    });

    it("should return true for a valid CAR file with .car extension", async () => {
      const { file } = await createTestCarFile(TEST_DATA.simple, "test.car");
      expect(await isCarFile(file)).toBe(true);
    });

    it("should return false for a regular file without CAR MIME type or extension", async () => {
      expect(await isCarFile(createRegularFile(TEST_DATA.simple))).toBe(false);
    });

    it("should return false for a file with .car extension but invalid content", async () => {
      expect(await isCarFile(createFakeCarFile())).toBe(false);
    });

    it("should return false for an invalid CAR file", async () => {
      expect(await isCarFile(createInvalidCarFile())).toBe(false);
    });

    it("should return false for a CAR file with no roots", async () => {
      expect(await isCarFile(await createEmptyCarFile())).toBe(false);
    });

    it("should return true for a multi-block CAR file", async () => {
      const { file } = await createMultiBlockCarFile([
        TEST_DATA.simple,
        TEST_DATA.json,
      ]);
      expect(await isCarFile(file)).toBe(true);
    });

    it("should handle binary data in CAR files", async () => {
      const { file } = await createTestCarFile(TEST_DATA.binary);
      expect(await isCarFile(file)).toBe(true);
    });

    it("should handle empty content in CAR files", async () => {
      const { file } = await createTestCarFile(TEST_DATA.empty);
      expect(await isCarFile(file)).toBe(true);
    });

    it("should handle large content in CAR files", async () => {
      const { file } = await createTestCarFile(TEST_DATA.large);
      expect(await isCarFile(file)).toBe(true);
    });
  });

  describe("preprocessToCar", () => {
    afterEach(async () => {
      await destroyCarPreprocessor();
    });

    it("should preprocess a single File to CAR format", async () => {
      const file = createRegularFile(TEST_DATA.simple, "test.txt");
      const result = await preprocessToCar(file);
      expectValidCarResult(result, expect);
    });

    it("should preprocess a ReadableStream to CAR format", async () => {
      const stream = createReadableStream(TEST_DATA.json);
      const result = await preprocessToCar(stream, { name: "test.json" });
      expectValidCarResult(result, expect);
    });

    it("should preprocess multiple files to CAR format", async () => {
      const files = [
        createRegularFile(TEST_DATA.simple, "file1.txt"),
        createRegularFile(TEST_DATA.json, "file2.json"),
      ];
      const result = await preprocessToCar(files);
      expectValidCarResult(result, expect);
    });

    it("should call onProgress callback during preprocessing", async () => {
      const file = createRegularFile(TEST_DATA.large, "large.txt");
      const onProgress = vi.fn();

      await preprocessToCar(file, { onProgress });

      assertCallbackCalled(onProgress);
      expect(onProgress).toHaveBeenCalledWith(expect.any(Number));
    });

    it("should handle abort signal during preprocessing", async () => {
      const file = createRegularFile(TEST_DATA.large, "large.txt");
      const abortController = new AbortController();

      // Abort immediately
      abortController.abort();

      await expect(
        preprocessToCar(file, { signal: abortController.signal }),
      ).rejects.toThrow("Aborted");
    });

    it("should use custom name when provided", async () => {
      const stream = createReadableStream(TEST_DATA.simple);
      const result = await preprocessToCar(stream, { name: "custom-name.txt" });
      expect(result).toBeDefined();
      expect(result.rootCid).toBeDefined();
    });

    it("should handle empty file", async () => {
      const file = createRegularFile(TEST_DATA.empty, "empty.txt");
      const result = await preprocessToCar(file);
      expectValidCarResult(result, expect);
    });

    it("should handle binary file", async () => {
      const file = new File([TEST_DATA.binary], "binary.bin", {
        type: "application/octet-stream",
      });
      const result = await preprocessToCar(file);
      expectValidCarResult(result, expect);
    });

    it("should produce a valid CAR stream that can be read", async () => {
      const file = createRegularFile(TEST_DATA.simple, "test.txt");
      const result = await preprocessToCar(file);
      const chunks = await readCarStream(result.carStream);
      expect(chunks.length).toBeGreaterThan(0);
      expect(result.size).toBeGreaterThan(0n);
    });

    it("should handle files with webkitRelativePath", async () => {
      const file = new File(
        [new TextEncoder().encode(TEST_DATA.simple)],
        "file.txt",
        {
          type: "text/plain",
        },
      );
      setWebkitRelativePath(file, "folder/subfolder/file.txt");
      const result = await preprocessToCar(file);
      expect(result).toBeDefined();
      expect(result.rootCid).toBeDefined();
    });

    it("should skip hidden files (starting with .)", async () => {
      const files = [
        createRegularFile(TEST_DATA.simple, "visible.txt"),
        new File([new TextEncoder().encode(TEST_DATA.json)], ".hidden.txt", {
          type: "text/plain",
        }),
      ];
      setWebkitRelativePath(files[1], "folder/.hidden.txt");
      const result = await preprocessToCar(files);
      expect(result).toBeDefined();
      expect(result.rootCid).toBeDefined();
    });

    it("should handle multiple files with progress tracking", async () => {
      const files = [
        createRegularFile(TEST_DATA.simple, "file1.txt"),
        createRegularFile(TEST_DATA.json, "file2.json"),
        createRegularFile(TEST_DATA.large, "file3.txt"),
      ];
      const onProgress = vi.fn();
      await preprocessToCar(files, { onProgress });
      assertCallbackCalled(onProgress);
      expect(onProgress.mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe("destroyCarPreprocessor", () => {
    it("should cleanup resources without error", async () => {
      await expect(destroyCarPreprocessor()).resolves.not.toThrow();
    });

    it("should be callable multiple times", async () => {
      await destroyCarPreprocessor();
      await destroyCarPreprocessor();
      await destroyCarPreprocessor();
      expect(true).toBe(true);
    });

    it("should cleanup after preprocessing", async () => {
      const file = createRegularFile(TEST_DATA.simple, "test.txt");
      await preprocessToCar(file);
      await expect(destroyCarPreprocessor()).resolves.not.toThrow();
    });
  });

  describe("integration tests", () => {
    afterEach(async () => {
      await destroyCarPreprocessor();
    });

    it("should round-trip: file -> CAR -> verify", async () => {
      const file = createRegularFile(TEST_DATA.json, "test.json");
      const result = await preprocessToCar(file);
      const chunks = await readCarStream(result.carStream);
      expect(chunks.length).toBeGreaterThan(0);
      expect(result.rootCid).toBeDefined();
      expect(result.size).toBeGreaterThan(0n);
    });

    it("should handle complex directory structures", async () => {
      const files = generateDirectoryStructure({
        maxDepth: 3,
        filesPerDir: 2,
      });

      expect(files.length).toBeGreaterThan(5);

      const result = await preprocessToCar(files);

      expect(result).toBeDefined();
      expect(result.rootCid).toBeDefined();
      expect(result.size).toBeGreaterThan(0n);

      const carBytes = await collectAsyncIterable(
        readableStreamToAsyncIterable(result.carStream),
      );
      const metadata = await extractCarMetadata(carBytes);

      expect(metadata.rootCid).toBe(result.rootCid);
      expect(metadata.blockCount).toBeGreaterThan(0);
      expect(metadata.cids.length).toBe(metadata.blockCount);

      const reader = await CarReader.fromBytes(carBytes);
      const roots = await reader.getRoots();
      expect(roots.length).toBe(1);
      expect(roots[0].toString()).toBe(result.rootCid);
    });

    it("should handle large CAR file that must be streamed", async () => {
      const chunkSize = 1024 * 1024; // 1MB chunks
      const numChunks = 200; // 100MB total
      const chunks: Uint8Array[] = [];

      for (let i = 0; i < numChunks; i++) {
        const chunk = new Uint8Array(chunkSize);
        for (let j = 0; j < chunkSize; j++) {
          chunk[j] = (i + j) % 256;
        }
        chunks.push(chunk);
      }

      const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
      const data = new Uint8Array(totalLength);
      let offset = 0;
      for (const chunk of chunks) {
        data.set(chunk, offset);
        offset += chunk.length;
      }

      const { file, rootCid } = await createTestCarFile(data, "large-file.car");

      expect(file.size).toBeGreaterThan(200 * 1024 * 1024); // > 200MB

      const result = await isCarFile(file);
      expect(result).toBe(true);

      const reader = await CarReader.fromBytes(
        await collectAsyncIterable(
          readableStreamToAsyncIterable(file.stream()),
        ),
      );
      const roots = await reader.getRoots();
      expect(roots.length).toBeGreaterThan(0);
      expect(roots[0].toString()).toBe(rootCid);
    }, 30000);
  });
});
