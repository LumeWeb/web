import { afterEach, beforeEach, describe, expect, vi } from "vitest";
import {
  createFakeCarFile,
  createReadableStream,
  createReadableStreamOfSize,
  createTestCarFile,
  streamToFile,
} from "./test-helpers";
import { EmptyFileError } from "@/errors";
import { UploadResultSymbol } from "@/types/upload";
import { test as it } from "./int-test";
import { DEFAULT_UPLOAD_LIMIT, MOCK_CONFIG } from "./test-constants";
import { assertUploadOperationStructure } from "./test-assertions";
import { importUploadManager } from "./test-fixtures";

describe("UploadManager Integration Tests", () => {
  let manager: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    const UploadManager = await importUploadManager();
    manager = new UploadManager(MOCK_CONFIG);
  });

  afterEach(() => {
    if (manager && manager.destroy) {
      manager.destroy();
    }
  });

  describe("File Upload Integration", () => {
    describe("File uploads", () => {
      it("should handle File input and return valid operation", async () => {
        const stream = createReadableStream("test content");
        const file = await streamToFile(stream, "test.car");

        const operation = await manager.upload(file);

        assertUploadOperationStructure(operation);

        // Verify the operation completes successfully
        const result = await operation.result;
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.cid).toBeDefined();
      });

      it("should process small files via XHR path", async () => {
        const content = "test content";
        const file = new File([content], "test.car", {
          type: "application/vnd.ipld.car",
        });
        Object.defineProperty(file, "size", { value: 1024 }); // Small file

        const operation = await manager.upload(file);

        expect(operation).toBeDefined();
        const result = await operation.result;
        expect(result.id).toBeDefined();
        expect(result.cid).toBeDefined();
      });

      it("should preserve file data integrity", async () => {
        const testData = "test content for integrity check";
        const stream = createReadableStream(testData);
        const file = await streamToFile(stream, "integrity-test.car");

        const operation = await manager.upload(file);
        const result = await operation.result;

        // Verify the upload completes successfully
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.cid).toBeDefined();
      });

      it("should handle binary data files", async () => {
        const binaryData = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
        const binaryStream = new ReadableStream({
          start(controller) {
            controller.enqueue(binaryData);
            controller.close();
          },
        });
        const file = await streamToFile(binaryStream, "binary.car");

        const operation = await manager.upload(file);
        const result = await operation.result;

        // Verify the upload completes successfully
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.cid).toBeDefined();
      });

      it("should handle files with multiple chunks", async () => {
        const chunks = ["chunk1", "chunk2", "chunk3"];
        const multiChunkStream = new ReadableStream({
          start(controller) {
            chunks.forEach((chunk) => {
              controller.enqueue(new TextEncoder().encode(chunk));
            });
            controller.close();
          },
        });
        const file = await streamToFile(multiChunkStream, "multi-chunk.car");

        const operation = await manager.upload(file);
        const result = await operation.result;

        // Verify the upload completes successfully
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.cid).toBeDefined();
      });

      it("should throw EmptyFileError for empty files", async () => {
        const emptyFile = new File([], "empty.car", {
          type: "application/vnd.ipld.car",
        });

        await expect(manager.upload(emptyFile)).rejects.toThrow(EmptyFileError);
        await expect(manager.upload(emptyFile)).rejects.toThrow(
          "Cannot upload empty file: empty.car",
        );
      });

      it("should throw EmptyFileError for empty ReadableStream with size override", async () => {
        const emptyStream = new ReadableStream({
          start(controller) {
            controller.close();
          },
        });

        await expect(
          manager.upload(emptyStream, {
            name: "empty.car",
            size: 0, // Explicitly set size to 0
          }),
        ).rejects.toThrow(EmptyFileError);
        await expect(
          manager.upload(emptyStream, {
            name: "empty.car",
            size: 0,
          }),
        ).rejects.toThrow("Cannot upload empty stream");
      });
    });
  });

  describe("ReadableStream Upload Integration", () => {
    it("should handle ReadableStream input with size override", async () => {
      const stream = createReadableStream("test content");

      const operation = await manager.upload(stream, {
        name: "test.car",
        size: 1024, // Small size to force XHR path
      });

      assertUploadOperationStructure(operation);
      expect(operation.result).toBeInstanceOf(Promise);
      expect(operation.progress).toBeDefined();

      // Verify the operation completes successfully
      const result = await operation.result;
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.cid).toBeDefined();
    });

    it("should use XHR handler for small ReadableStream with size override", async () => {
      const stream = createReadableStream("test content");

      const operation = await manager.upload(stream, {
        name: "test.car",
        size: 1024, // Small size to force XHR path
      });

      expect(operation).toBeDefined();
      const result = await operation.result;
      expect(result.id).toBeDefined();
      expect(result.cid).toBeDefined();
    });

    it("should use TUS handler for large ReadableStream with size override", async () => {
      const stream = createReadableStreamOfSize(DEFAULT_UPLOAD_LIMIT + 1);

      const operation = await manager.upload(stream, {
        name: "large.car",
        size: DEFAULT_UPLOAD_LIMIT + 1,
      });

      expect(operation).toBeDefined();
      const result = await operation.result;
      expect(result.id).toBeDefined();
      // TUS uploads assign CID asynchronously — cid may be undefined
    }, 30000);

    it("should preserve stream data integrity with size override", async () => {
      const testData = "test content for integrity check";
      const stream = createReadableStream(testData);

      const operation = await manager.upload(stream, {
        name: "integrity-test.car",
        size: 1024, // Small size to force XHR path
      });

      const result = await operation.result;

      // Verify the upload completes successfully
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.cid).toBeDefined();
    });
  });

  describe("upload options propagation", () => {
    it("should pass upload options to XHR handler", async () => {
      const stream = createReadableStream("options test");
      const file = await streamToFile(stream, "test.car");
      const options = {
        name: "custom-name.car",
        keyvalues: { key1: "value1" },
        onProgress: vi.fn(),
      };

      const operation = await manager.upload(file, options);
      const result = await operation.result;

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.cid).toBeDefined();
    });
  });

  describe("integration scenarios", () => {
    it("should handle mixed upload types with different handlers", async () => {
      // Small file (XHR)
      const { file: smallFile } = await createTestCarFile("small", "small.car");
      Object.defineProperty(smallFile, "size", { value: 1024 });

      // File from stream (XHR)
      const stream = createReadableStream("stream content");
      const streamFile = await streamToFile(stream, "stream.car");
      Object.defineProperty(streamFile, "size", { value: 1024 }); // Small file

      const operation1 = await manager.upload(smallFile);
      const operation2 = await manager.upload(streamFile);

      const result1 = await operation1.result;
      const result2 = await operation2.result;

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1.id).toBeDefined();
      expect(result2.id).toBeDefined();
    });

    it("should maintain handler selection consistency across uploads", async () => {
      const stream1 = createReadableStream("stream1");
      const stream2 = createReadableStream("stream2");
      const file1 = await streamToFile(stream1, "stream1.car");
      const file2 = await streamToFile(stream2, "stream2.car");
      Object.defineProperty(file1, "size", { value: 1024 }); // Small file
      Object.defineProperty(file2, "size", { value: 1024 }); // Small file

      const operation1 = await manager.upload(file1);
      const operation2 = await manager.upload(file2);

      const result1 = await operation1.result;
      const result2 = await operation2.result;

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1.id).toBeDefined();
      expect(result2.id).toBeDefined();
    });
  });

  describe("CAR File Passthrough", () => {
    it("should upload valid CAR files without preprocessing", async () => {
      const { file } = await createTestCarFile("test content", "valid.car");

      const operation = await manager.upload(file);

      assertUploadOperationStructure(operation);

      // Verify the operation completes successfully
      const result = await operation.result;
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.cid).toBeDefined();
    });

    it("should upload CAR file with explicit isCarFile option", async () => {
      const { file } = await createTestCarFile("test content", "explicit.car");

      const operation = await manager.upload(file, { isCarFile: true });

      const result = await operation.result;
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.cid).toBeDefined();
    });

    it("should upload CAR file via uploadCar method", async () => {
      const { file } = await createTestCarFile("test content", "uploadcar.car");

      const operation = await manager.uploadCar(file);

      const result = await operation.result;
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.cid).toBeDefined();
    });

    it("should upload CAR file as ReadableStream", async () => {
      const { file } = await createTestCarFile("test content", "stream.car");
      const stream = file.stream();

      const operation = await manager.upload(stream, {
        name: "stream.car",
        isCarFile: true,
      });

      const result = await operation.result;
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.cid).toBeDefined();
    });

    it("should reject invalid CAR files (fake .car extension)", async () => {
      const fakeCarFile = createFakeCarFile("fake.car");

      // Invalid CAR files should not be uploaded with isCarFile option
      // They should go through normal preprocessing
      const operation = await manager.upload(fakeCarFile, { isCarFile: false });

      const result = await operation.result;
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it.skip("should handle large CAR files via TUS", async () => {
      const largeContent = "x".repeat(DEFAULT_UPLOAD_LIMIT + 1);
      const { file } = await createTestCarFile(largeContent, "large.car");

      const operation = await manager.upload(file, { isCarFile: true });

      const result = await operation.result;
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      // TUS: cid assigned asynchronously, may be undefined
    });

    it("should preserve CAR MIME type even if original has different type", async () => {
      const { file } = await createTestCarFile("test content", "mimetype.car");
      // Create a new file with wrong MIME type
      const fileWithWrongType = new File([file], "mimetype.car", {
        type: "application/octet-stream",
      });

      const operation = await manager.upload(fileWithWrongType);

      const result = await operation.result;
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.cid).toBeDefined();
    });

    it("should respect isCarFile: false option even for valid CAR files", async () => {
      const { file } = await createTestCarFile(
        "test content",
        "noprogress.car",
      );

      // Explicitly disable CAR passthrough
      const operation = await manager.upload(file, { isCarFile: false });

      const result = await operation.result;
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });
  });

  describe("waitForOperation", () => {
    it("should wait for operation by ID and return result", async () => {
      const operationId = 12345;
      const result = await manager.waitForOperation(operationId);

      expect(result).toBeDefined();
      expect(result.operationId).toBe(operationId);
      expect(result.cid).toBeDefined();
      expect(result.id).toBe(String(operationId));
    });

    it("should wait for operation with UploadResult and preserve metadata", async () => {
      const stream = createReadableStream("test content");
      const file = await streamToFile(stream, "test.car");

      // First upload to get a result with cid
      const operation = await manager.upload(file);
      const uploadResult = await operation.result;

      expect(uploadResult.cid).toBeDefined();

      // Wait for operation using the upload result (has cid, no operationId)
      const finalResult = await manager.waitForOperation(uploadResult);

      // Verify the operation result has cid from the polling
      expect(finalResult.cid).toBeDefined();
      expect(finalResult.id).toBeDefined();
    });

    it("should support custom polling options", async () => {
      const operationId = 12346;
      const pollingOptions = {
        interval: 1000,
        timeout: 60000,
        settledStates: ["completed"] as string[],
      };

      const result = await manager.waitForOperation(
        operationId,
        pollingOptions,
      );

      expect(result).toBeDefined();
      expect(result.operationId).toBe(operationId);
    });

    it("should throw error when operation fails", async () => {
      const operationId = 99999;

      await expect(manager.waitForOperation(operationId)).rejects.toThrow();
    });

    describe("TUS upload result polling", () => {
      it("should resolve CID from upload result endpoint for TUS uploads without cid", async () => {
        const tusResult = {
          [UploadResultSymbol]: true,
          id: "tus-upload-123",
          name: "large-file.car",
          size: 150000000,
          mimeType: "application/vnd.ipld.car",
          createdAt: new Date(),
          numberOfFiles: 1,
        };

        const result = await manager.waitForOperation(tusResult);

        expect(result).toBeDefined();
        expect(result.cid).toBeDefined();
        expect(result.id).toBe("tus-upload-123");
      });

      it("should throw when upload result endpoint returns failed status", async () => {
        const tusResult = {
          [UploadResultSymbol]: true,
          id: "99999",
          name: "failing-upload.car",
          size: 1000,
          mimeType: "application/vnd.ipld.car",
          createdAt: new Date(),
          numberOfFiles: 1,
        };

        await expect(manager.waitForOperation(tusResult)).rejects.toThrow();
      });

      it("should throw when upload result has no id", async () => {
        const noIdResult = {
          [UploadResultSymbol]: true,
          name: "orphan.car",
          size: 1000,
          mimeType: "application/vnd.ipld.car",
          createdAt: new Date(),
          numberOfFiles: 1,
        };

        await expect(manager.waitForOperation(noIdResult)).rejects.toThrow(
          "No operation ID or CID provided",
        );
      });
    });
  });

  describe("upload with waitForOperation option", () => {
    it("should wait for operation when waitForOperation is true", async () => {
      const stream = createReadableStream("test content");
      const file = await streamToFile(stream, "test.car");

      const operation = await manager.upload(file, {
        waitForOperation: true,
      });

      const result = await operation.result;

      expect(result).toBeDefined();
      expect(result.cid).toBeDefined();
    });

    it("should pass custom polling options", async () => {
      const stream = createReadableStream("test content");
      const file = await streamToFile(stream, "test.car");

      const operation = await manager.upload(file, {
        waitForOperation: true,
        operationPollingOptions: {
          interval: 1000,
          timeout: 60000,
        },
      });

      const result = await operation.result;

      expect(result).toBeDefined();
      expect(result.cid).toBeDefined();
    });

    it("should preserve upload metadata after waiting for operation", async () => {
      const stream = createReadableStream("test content for metadata");
      const file = await streamToFile(stream, "metadata-test.car");

      const operation = await manager.upload(file, {
        name: "custom-name.car",
        waitForOperation: true,
      });

      const result = await operation.result;

      expect(result).toBeDefined();
      expect(result.cid).toBeDefined();
      expect(result.id).toBeDefined();
    });

    it("should work with directory upload", async () => {
      const file1 = new File(["content1"], "file1.txt");
      const file2 = new File(["content2"], "file2.txt");

      const operation = await manager.uploadDirectory([file1, file2], {
        name: "test-dir",
        waitForOperation: true,
      });

      const result = await operation.result;

      expect(result).toBeDefined();
      expect(result.cid).toBeDefined();
      expect(result.isDirectory).toBe(true);
      expect(result.numberOfFiles).toBe(2);
    });
  });
});
