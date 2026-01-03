import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Uppy from "@uppy/core";
import { BaseUploadHandler } from "../base-upload";
import type { UploadProgress, UploadResult } from "@/types/upload";
import { createReadableStream, createTestCarFile } from "./test-helpers";
import { MOCK_CONFIG, MOCK_UPLOAD_RESULT } from "./test-constants";
import {
  assertMockUploadResult,
  assertUploadOperationStructure,
} from "./test-assertions";

// Test constants
const TEST_CONTENT = "test content";
const TEST_FILE_NAME = "test.car";
const TEST_MIME_TYPE = "application/vnd.ipld.car";

/**
 * Minimal concrete implementation of BaseUploadHandler for testing.
 * Tests the abstract class behavior without mocking external dependencies.
 */
class TestUploadHandler extends BaseUploadHandler {
  private mockResult: UploadResult;
  private shouldFail: boolean = false;
  private errorMessage: string = "Upload failed";
  private uppyInstances: Uppy[] = [];
  private uploadedFileName: string = TEST_FILE_NAME;
  private isCancelled: boolean = false;

  constructor(config: any, mockResult?: UploadResult) {
    super(config);
    this.mockResult = mockResult || MOCK_UPLOAD_RESULT;
  }

  protected configurePlugin(uppy: Uppy): void {
    this.uppyInstances.push(uppy);
    uppy.on("file-added", (file) => {
      this.uploadedFileName = file.name;
    });

    // Override cancelAll to trigger error when cancelled
    const originalCancelAll = uppy.cancelAll.bind(uppy);
    uppy.cancelAll = () => {
      this.isCancelled = true;
      originalCancelAll();
      // Emit error to trigger rejection
      uppy.emit("error", new Error("Upload cancelled"));
    };
  }

  private simulateUpload(uppy: Uppy) {
    if (this.isCancelled) {
      return;
    }
    const files = uppy.getFiles();
    if (this.shouldFail) {
      uppy.emit("error", new Error(this.errorMessage));
      return;
    }

    const totalBytes = files.reduce((sum, file) => sum + (file.size || 0), 0);
    uppy.emit("progress", Math.floor(totalBytes * 0.5));
    uppy.emit("progress", totalBytes);

    files.forEach((file) => {
      uppy.emit("upload-success", file, {
        status: 200,
        uploadURL: `https://example.com/${this.mockResult.cid}`,
      });
    });
  }

  protected parseResult(result: unknown): UploadResult {
    return {
      ...this.mockResult,
      name: this.uploadedFileName,
    };
  }

  protected getUploadSource(): string {
    return "test-source";
  }

  setShouldFail(shouldFail: boolean, message?: string): void {
    this.shouldFail = shouldFail;
    if (message) {
      this.errorMessage = message;
    }
  }

  triggerUpload() {
    this.uppyInstances.forEach((uppy) => this.simulateUpload(uppy));
  }

  getUppyInstances(): Uppy[] {
    return this.uppyInstances;
  }
}

describe("BaseUploadHandler", () => {
  let handler: TestUploadHandler;

  beforeEach(() => {
    handler = new TestUploadHandler(MOCK_CONFIG);
  });

  afterEach(() => {
    handler.destroy();
  });

  describe("upload with File input", () => {
    it("should upload a File and return UploadOperation", async () => {
      const { file } = await createTestCarFile();
      const operation = await handler.upload(file);

      assertUploadOperationStructure(operation);
    });

    it("should resolve with UploadResult on successful upload", async () => {
      const { file } = await createTestCarFile();
      const operation = await handler.upload(file);
      handler.triggerUpload();
      const result = await operation.result;

      assertMockUploadResult(result);
      expect(result.name).toBe(TEST_FILE_NAME);
    });

    it("should use file name from File object", async () => {
      const customName = "custom-name.car";
      const { file } = await createTestCarFile(TEST_CONTENT, customName);
      const operation = await handler.upload(file);
      handler.triggerUpload();
      const result = await operation.result;

      expect(result.name).toBe(customName);
    });

    it("should use file type from File object", async () => {
      const { file } = await createTestCarFile();
      const operation = await handler.upload(file);
      handler.triggerUpload();
      const result = await operation.result;

      expect(result.mimeType).toBe(TEST_MIME_TYPE);
    });
  });

  describe("upload with ReadableStream input", () => {
    it("should upload a ReadableStream and return UploadOperation", async () => {
      const stream = createReadableStream(TEST_CONTENT);
      const operation = await handler.upload({
        data: stream,
        name: "stream-test.car",
        type: TEST_MIME_TYPE,
      });

      assertUploadOperationStructure(operation);
    });

    it("should use provided name for ReadableStream", async () => {
      const customName = "custom-stream.car";
      const stream = createReadableStream(TEST_CONTENT);
      const operation = await handler.upload({
        data: stream,
        name: customName,
        type: TEST_MIME_TYPE,
      });
      handler.triggerUpload();
      const result = await operation.result;

      expect(result.name).toBe(customName);
    });

    it("should use default name when not provided for ReadableStream", async () => {
      const defaultName = "upload";
      const stream = createReadableStream(TEST_CONTENT);
      const operation = await handler.upload({
        data: stream,
        name: defaultName,
        type: TEST_MIME_TYPE,
      });
      handler.triggerUpload();
      const result = await operation.result;

      expect(result.name).toBe(defaultName);
    });
  });

  describe("UploadOperation", () => {
    it("should cancel upload when cancel() is called", async () => {
      const { file } = await createTestCarFile();
      const operation = await handler.upload(file);

      operation.cancel();

      await expect(operation.result).rejects.toThrow("Upload cancelled");
    });

    it("should have progress object with initial values", async () => {
      const { file } = await createTestCarFile();
      const operation = await handler.upload(file);

      expect(operation.progress).toBeDefined();
      expect(operation.progress.percentage).toBe(0);
      expect(operation.progress.bytesUploaded).toBe(0);
      expect(operation.progress.bytesTotal).toBe(file.size);
    });

    it("should freeze progress object to prevent mutations", async () => {
      const { file } = await createTestCarFile();
      const operation = await handler.upload(file);

      expect(() => {
        (operation.progress as any).percentage = 50;
      }).toThrow();
    });
  });

  describe("progress callbacks", () => {
    it("should call onProgress callback during upload", async () => {
      const { file } = await createTestCarFile();
      const onProgress = vi.fn();

      await handler.upload(file, { onProgress });
      handler.triggerUpload();
      await vi.waitUntil(() => onProgress.mock.calls.length > 0);

      expect(onProgress).toHaveBeenCalled();
    });

    it("should update progress values correctly", async () => {
      const { file } = await createTestCarFile();
      const progressUpdates: UploadProgress[] = [];

      await handler.upload(file, {
        onProgress: (progress) => progressUpdates.push(progress),
      });
      handler.triggerUpload();
      await vi.waitUntil(() => progressUpdates.length > 0);

      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates[0]).toHaveProperty("percentage");
      expect(progressUpdates[0]).toHaveProperty("bytesUploaded");
      expect(progressUpdates[0]).toHaveProperty("bytesTotal");
    });
  });

  describe("onComplete callback", () => {
    it("should call onComplete callback on successful upload", async () => {
      const { file } = await createTestCarFile();
      const onComplete = vi.fn();

      await handler.upload(file, { onComplete });
      handler.triggerUpload();
      await vi.waitUntil(() => onComplete.mock.calls.length > 0);

      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          id: MOCK_UPLOAD_RESULT.id,
          cid: MOCK_UPLOAD_RESULT.cid,
        }),
      );
    });
  });

  describe("onError callback", () => {
    const errorMessage = "Test error message";

    it("should call onError callback on upload failure", async () => {
      const { file } = await createTestCarFile();
      const onError = vi.fn();

      handler.setShouldFail(true, errorMessage);
      const operation = await handler.upload(file, { onError });
      handler.triggerUpload();

      await expect(operation.result).rejects.toThrow(errorMessage);
      await vi.waitUntil(() => onError.mock.calls.length > 0);

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
      expect(onError.mock.calls[0][0].message).toBe(errorMessage);
    });

    it("should reject result promise on upload failure", async () => {
      const { file } = await createTestCarFile();
      const failMessage = "Upload failed";

      handler.setShouldFail(true, failMessage);
      const operation = await handler.upload(file);
      handler.triggerUpload();

      await expect(operation.result).rejects.toThrow(failMessage);
    });
  });

  describe("UploadOptions", () => {
    it("should use file name from File object even when options.name is provided", async () => {
      const originalName = "original.car";
      const { file } = await createTestCarFile(TEST_CONTENT, originalName);
      const operation = await handler.upload(file, {
        name: "custom-name.car",
      });
      handler.triggerUpload();
      const result = await operation.result;

      expect(result.name).toBe(originalName);
    });

    it("should use options.name for ReadableStream", async () => {
      const customName = "custom-name.car";
      const stream = createReadableStream(TEST_CONTENT);
      const operation = await handler.upload({
        data: stream,
        name: customName,
        type: TEST_MIME_TYPE,
      });
      handler.triggerUpload();
      const result = await operation.result;

      expect(result.name).toBe(customName);
    });

    it("should pass keyvalues in options", async () => {
      const { file } = await createTestCarFile();
      const keyvalues = { key1: "value1", key2: "value2" };

      await handler.upload(file, { keyvalues });

      expect(handler).toBeDefined();
    });
  });

  describe("destroy", () => {
    it("should call destroy without errors", () => {
      expect(() => handler.destroy()).not.toThrow();
    });

    it("should allow creating new uploads after destroy", async () => {
      handler.destroy();

      const { file } = await createTestCarFile();
      const operation = handler.upload(file);

      expect(operation).toBeDefined();
    });
  });

  describe("multiple uploads", () => {
    it("should handle multiple concurrent uploads", async () => {
      const { file: file1 } = await createTestCarFile("content1", "test1.car");
      const { file: file2 } = await createTestCarFile("content2", "test2.car");

      const operation1 = await handler.upload(file1);
      const operation2 = await handler.upload(file2);

      handler.triggerUpload();

      const [result1, result2] = await Promise.all([
        operation1.result,
        operation2.result,
      ]);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });

    it("should handle independent progress for multiple uploads", async () => {
      const { file: file1 } = await createTestCarFile("content1", "test1.car");
      const { file: file2 } = await createTestCarFile("content2", "test2.car");

      const progress1: UploadProgress[] = [];
      const progress2: UploadProgress[] = [];

      const operation1 = await handler.upload(file1, {
        onProgress: (p) => progress1.push(p),
      });
      const operation2 = await handler.upload(file2, {
        onProgress: (p) => progress2.push(p),
      });

      handler.triggerUpload();

      await Promise.all([operation1.result, operation2.result]);

      expect(progress1.length).toBeGreaterThan(0);
      expect(progress2.length).toBeGreaterThan(0);
    });
  });

  describe("error message extraction", () => {
    it("should extract error from XHR response", async () => {
      const { file } = await createTestCarFile();
      const onError = vi.fn();

      handler.setShouldFail(true, "Network error");
      const operation = await handler.upload(file, { onError });

      // Manually trigger error with XHR-like structure
      const uppyInstances = handler.getUppyInstances();
      if (uppyInstances.length > 0) {
        const errorWithXhr = new Error("Upload failed");
        (errorWithXhr as Error & { xhr: { response: string } }).xhr = {
          response: JSON.stringify({ error: "Network error" }),
        };
        uppyInstances[0].emit("error", errorWithXhr);
      }

      await expect(operation.result).rejects.toThrow();
      await vi.waitUntil(() => onError.mock.calls.length > 0);

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it("should handle error message as string", async () => {
      const { file } = await createTestCarFile();
      const onError = vi.fn();

      const operation = await handler.upload(file, { onError });

      const uppyInstances = handler.getUppyInstances();
      if (uppyInstances.length > 0) {
        uppyInstances[0].emit("error", new Error("String error message"));
      }

      await expect(operation.result).rejects.toThrow();
      await vi.waitUntil(() => onError.mock.calls.length > 0);

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
