import { test as it } from "./int-test";
import { beforeEach, describe, expect, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { XHRUploadHandler } from "../xhr-upload";
import { createMockConfig, createTestUploadFile } from "./test-fixtures";
import { assertCallbackCalled } from "./test-assertions";
import { testConfig } from "@/__tests__/setup";

describe("XHRUploadHandler Integration", () => {
  beforeEach(() => {
  });

  describe("upload method integration", () => {
    it("should successfully upload a file and return a result", async ({
      worker,
    }) => {
      const mockConfig = createMockConfig();
      const handler = new XHRUploadHandler(mockConfig);
      const mockFile = createTestUploadFile();

      const operation = await handler.upload(mockFile);
      const result = await operation.result;

      expect(result).toBeDefined();
      expect(result.id).toMatch(/^test-upload-id(-\d+)?$/);

      const { CID } = await import("multiformats/cid");
      expect(() => CID.parse(result.cid)).not.toThrow();

      expect(result.name).toBe("test.car");
      expect(result.mimeType).toBe("application/vnd.ipld.car");

      handler.destroy();
    });

    it("should handle upload error with custom handler", async ({ worker }) => {
      worker.use(
        http.post(`${testConfig.apiUrl}/upload`, () => {
          return HttpResponse.json(
            { success: false, error: "Upload failed" },
            { status: 500 },
          );
        }),
      );

      const mockConfig = createMockConfig();
      const handler = new XHRUploadHandler(mockConfig);
      const mockFile = createTestUploadFile();

      const onError = vi.fn();
      const operation = await handler.upload(mockFile, { onError });

      await expect(operation.result).rejects.toThrow();
      assertCallbackCalled(onError);

      handler.destroy();
    });

    it("should call onProgress callback during upload", async ({ worker }) => {
      const mockConfig = createMockConfig();
      const handler = new XHRUploadHandler(mockConfig);
      const mockFile = createTestUploadFile();

      const onProgress = vi.fn();
      const operation = await handler.upload(mockFile, { onProgress });

      await operation.result;

      assertCallbackCalled(onProgress);

      handler.destroy();
    });

    it("should call onComplete callback on successful upload", async ({
      worker,
    }) => {
      const mockConfig = createMockConfig();
      const handler = new XHRUploadHandler(mockConfig);
      const mockFile = createTestUploadFile();

      const onComplete = vi.fn();
      const operation = await handler.upload(mockFile, { onComplete });

      await operation.result;

      assertCallbackCalled(onComplete);
      expect(onComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "test-upload-id",
          cid: expect.any(String),
          name: "test.car",
          size: 12,
          mimeType: "application/vnd.ipld.car",
        }),
      );

      handler.destroy();
    });
  });

  describe("configuration validation", () => {
    it("should work with minimal config", ({ worker }) => {
      const minimalConfig = {
        jwt: "test-jwt",
        endpoint: "https://test.com",
        gateway: "https://gateway.com",
      };

      const minimalHandler = new XHRUploadHandler(minimalConfig);
      expect(minimalHandler).toBeInstanceOf(XHRUploadHandler);
      minimalHandler.destroy();
    });

    it("should use config values in plugin configuration", ({ worker }) => {
      const customConfig = {
        jwt: "custom-jwt",
        endpoint: "https://custom.api.com",
        gateway: "https://custom.gateway.com",
      };

      const customHandler = new XHRUploadHandler(customConfig);
      const mockUppy = { use: vi.fn() };

      (customHandler as any).configurePlugin(mockUppy);

      expect(mockUppy.use).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          endpoint: "https://custom.api.com/api/upload",
          headers: {
            Authorization: "Bearer custom-jwt",
          },
        }),
      );

      customHandler.destroy();
    });
  });
});
