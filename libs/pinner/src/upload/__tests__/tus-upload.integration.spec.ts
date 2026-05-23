import { test as it } from "./int-test";
import { describe, expect, vi } from "vitest";
import { http, HttpResponse } from "msw";
import {
  createMockConfig,
  createTestUploadFile,
  importTUSUploadHandler,
} from "./test-fixtures";
import {
  assertCallbackCalled,
  assertUploadOperationStructure,
} from "./test-assertions";
import { testConfig } from "@/__tests__/setup";

describe("TUSUploadHandler Integration", () => {
  describe("upload method integration", () => {
    it("should successfully upload a file via TUS protocol", async ({
      worker,
    }) => {
      const mockConfig = createMockConfig();
      const TUSUploadHandler = await importTUSUploadHandler();
      const handler = new TUSUploadHandler(mockConfig);
      const mockFile = createTestUploadFile();

      const operation = await handler.upload(mockFile);
      const result = await operation.result;

      expect(result).toBeDefined();
      assertUploadOperationStructure(operation);

      handler.destroy();
    }, 30000);

    it("should handle TUS upload error", async ({ worker }) => {
      worker.use(
        http.post(`${testConfig.apiUrl}/upload/tus`, () => {
          return new HttpResponse(null, { status: 500 });
        }),
      );

      const mockConfig = createMockConfig();
      const TUSUploadHandler = await importTUSUploadHandler();
      const handler = new TUSUploadHandler(mockConfig);
      const mockFile = createTestUploadFile();

      const onError = vi.fn();
      const operation = await handler.upload(mockFile, { onError });

      await expect(operation.result).rejects.toThrow();
      assertCallbackCalled(onError);

      handler.destroy();
    }, 30000);

    it("should call onProgress callback during TUS upload", async ({
      worker,
    }) => {
      const mockConfig = createMockConfig();
      const TUSUploadHandler = await importTUSUploadHandler();
      const handler = new TUSUploadHandler(mockConfig);
      const mockFile = createTestUploadFile();

      const onProgress = vi.fn();
      const operation = await handler.upload(mockFile, { onProgress });

      await operation.result;

      assertCallbackCalled(onProgress);

      handler.destroy();
    });

    it("should call onComplete callback on successful TUS upload", async ({
      worker,
    }) => {
      const mockConfig = createMockConfig();
      const TUSUploadHandler = await importTUSUploadHandler();
      const handler = new TUSUploadHandler(mockConfig);
      const mockFile = createTestUploadFile();

      const onComplete = vi.fn();
      const operation = await handler.upload(mockFile, { onComplete });

      await operation.result;

      assertCallbackCalled(onComplete);

      handler.destroy();
    });
  });

  describe("configuration validation", () => {
    it("should work with minimal config", async ({ worker }) => {
      const minimalConfig = {
        jwt: "test-jwt",
        endpoint: "https://test.com",
        gateway: "https://gateway.com",
      };

      const TUSUploadHandler = await importTUSUploadHandler();
      const minimalHandler = new TUSUploadHandler(minimalConfig);
      expect(minimalHandler).toBeInstanceOf(TUSUploadHandler);
      minimalHandler.destroy();
    });

    it("should use config values in plugin configuration", async ({
      worker,
    }) => {
      const customConfig = {
        jwt: "custom-jwt",
        endpoint: "https://custom.api.com",
        gateway: "https://custom.gateway.com",
      };

      const TUSUploadHandler = await importTUSUploadHandler();
      const customHandler = new TUSUploadHandler(customConfig);
      const mockUppy = { use: vi.fn() };

      (customHandler as any).configurePlugin(mockUppy);

      expect(mockUppy.use).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          endpoint: "https://custom.api.com/api/upload/tus",
          headers: {
            Authorization: "Bearer custom-jwt",
          },
        }),
      );

      customHandler.destroy();
    });
  });
});
