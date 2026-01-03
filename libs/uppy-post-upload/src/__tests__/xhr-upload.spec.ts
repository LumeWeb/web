/**
 * Unit tests for XHRUpload plugin
 * These tests use mocks and don't make real HTTP requests
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import Core from "@uppy/core";
import XHRUpload from "../index";
import type { NetworkClient } from "@/network/types";
import { getNetworkClient, resetNetworkClient } from "@/network";
import { mock } from "@/__tests__/test-utils";
import type { LocalUppyFile } from "@uppy/utils";

// Type alias for testing purposes
type XHRUploadTest = XHRUpload<any, any>;

// Mock the network client module
vi.mock("../network/index", () => ({
  getNetworkClient: vi.fn(),
  resetNetworkClient: vi.fn(),
}));

// Helper to create a mock network client for testing
function createMockNetworkClient(): NetworkClient & {
  request: ReturnType<typeof vi.fn>;
  setHooks: ReturnType<typeof vi.fn>;
} {
  const mockedRequest = vi.fn();
  const mockedSetHooks = vi.fn();
  return {
    isAvailable: () => true,
    request: mockedRequest,
    getDriverName: () => "mock",
    setHooks: mockedSetHooks,
  };
}

describe("XHRUpload (Unit Tests)", () => {
  let uppy: Core;
  let mockNetworkClient: NetworkClient & {
    request: ReturnType<typeof vi.fn>;
    setHooks: ReturnType<typeof vi.fn>;
  };
  const mockedGetNetworkClient = mock(getNetworkClient);
  const mockedResetNetworkClient = mock(resetNetworkClient);

  beforeEach(() => {
    // Reset network client to clear any state from previous tests
    mockedResetNetworkClient.mockImplementation(() => {});

    // Clear mock calls from previous tests
    mockedGetNetworkClient.mockClear();

    uppy = new Core();

    // Create a mock network client using helper
    mockNetworkClient = createMockNetworkClient();

    mockedGetNetworkClient.mockReturnValue(mockNetworkClient);
  });

  describe("setTypeInBlob", () => {
    it("should handle Buffer in Node.js environment", () => {
      // In Node.js, file.data can be a Buffer
      const mockBuffer = Buffer.from("test content");

      const file = {
        data: mockBuffer,
        meta: { type: "application/json", name: "test.json" },
      } as unknown as LocalUppyFile<any, any>;

      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com",
      });

      const plugin = uppy.getPlugin("XHRUpload") as unknown as XHRUploadTest;
      const formData = plugin.createFormDataUpload(file, plugin.getOptions(file));

      expect(formData).toBeInstanceOf(FormData);
      // Buffer doesn't have slice method, so it should be passed as-is to FormData
      // FormData.get() will convert it to string, but the important thing is
      // that no error is thrown during createFormDataUpload
      expect(formData.get("file")).toBe("test content");
    });
  });

  describe("plugin initialization", () => {
    it("should create plugin instance with default options", () => {
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com",
      });

      const plugin = uppy.getPlugin("XHRUpload") as unknown as XHRUploadTest;
      expect(plugin).toBeInstanceOf(XHRUpload);
    });

    it("should use default locale", () => {
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com",
      });

      const plugin = uppy.getPlugin("XHRUpload") as unknown as XHRUploadTest;
      expect(plugin.i18n("uploadStalled", { seconds: 30 })).toContain("30");
    });

    it("should throw when bundle is true but formData is false", () => {
      expect(() => {
        uppy.use(XHRUpload, {
          id: "XHRUpload",
          endpoint: "https://api.test.com",
          bundle: true,
          formData: false,
        });
      }).toThrow("`opts.formData` must be true when `opts.bundle` is enabled.");
    });

    it("should throw when bundle is true and headers is a function", () => {
      expect(() => {
        uppy.use(XHRUpload, {
          id: "XHRUpload",
          endpoint: "https://api.test.com",
          bundle: true,
          headers: () => ({ "X-Custom": "value" }),
        });
      }).toThrow(
        "`opts.headers` can not be a function when the `bundle: true` option is set.",
      );
    });

    it("should throw when metaFields option is used instead of allowedMetaFields", () => {
      expect(() => {
        uppy.use(XHRUpload, {
          id: "XHRUpload",
          endpoint: "https://api.test.com",
          // @ts-ignore - testing deprecated option
          metaFields: ["name"],
        });
      }).toThrow(
        "The `metaFields` option has been renamed to `allowedMetaFields`.",
      );
    });

    it("should set hooks on network client", () => {
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com",
        shouldRetry: vi.fn(() => true),
        onAfterResponse: vi.fn(),
        onBeforeRequest: vi.fn(),
      });

      expect(mockNetworkClient.setHooks).toHaveBeenCalledWith(
        expect.objectContaining({
          shouldRetry: expect.any(Function),
          onAfterResponse: expect.any(Function),
          onBeforeRequest: expect.any(Function),
        }),
      );
    });
  });

  describe("getOptions", () => {
    it("should merge plugin options with file options", () => {
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com",
        timeout: 5000,
        headers: { "X-Default": "value" },
      });
      const plugin = uppy.getPlugin("XHRUpload") as unknown as XHRUploadTest;

      const fileId = uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });
      const file = uppy.getFile(fileId);

      const options = plugin.getOptions(file);
      expect(options.timeout).toBe(5000);
      expect(options.headers["X-Default"]).toBe("value");
    });

    it("should support headers as a function", () => {
      const headerFn = vi.fn((file: any) => ({
        "X-File-Name": file.name,
      }));

      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com",
        headers: headerFn,
      });
      const plugin = uppy.getPlugin("XHRUpload") as unknown as XHRUploadTest;

      const fileId = uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });
      const file = uppy.getFile(fileId);

      const options = plugin.getOptions(file);
      expect(headerFn).toHaveBeenCalledWith(file);
      expect(options.headers["X-File-Name"]).toBe("test.jpg");
    });

    it("should merge state xhrUpload options", () => {
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com",
      });

      uppy.setState({
        xhrUpload: {
          headers: { "X-State": "value" },
          endpoint: "https://api.test.com",
        },
      });

      const fileId = uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });
      const file = uppy.getFile(fileId);

      const plugin = uppy.getPlugin("XHRUpload") as unknown as XHRUploadTest;
      const options = plugin.getOptions(file);
      expect(options.headers["X-State"]).toBe("value");
    });

    it("should merge file xhrUpload options", () => {
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com",
      });

      const fileId = uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      uppy.setFileState(fileId, {
        xhrUpload: {
          headers: { "X-File": "value" },
          endpoint: "https://api.test.com",
        },
      });

      const file = uppy.getFile(fileId);

      const plugin = uppy.getPlugin("XHRUpload") as unknown as XHRUploadTest;
      const options = plugin.getOptions(file);
      expect(options.headers["X-File"]).toBe("value");
    });

    it("should prioritize options in correct order", () => {
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com",
        headers: { "X-Plugin": "plugin" },
      });

      uppy.setState({
        xhrUpload: {
          headers: { "X-State": "state" },
          endpoint: "https://api.test.com",
        },
      });

      const fileId = uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      uppy.setFileState(fileId, {
        xhrUpload: {
          headers: { "X-File": "file" },
          endpoint: "https://api.test.com",
        },
      });

      const file = uppy.getFile(fileId);

      const plugin = uppy.getPlugin("XHRUpload") as unknown as XHRUploadTest;
      const options = plugin.getOptions(file);
      expect(options.headers["X-Plugin"]).toBe("plugin");
      expect(options.headers["X-State"]).toBe("state");
      expect(options.headers["X-File"]).toBe("file");
    });
  });

  describe("createFormDataUpload", () => {
    it("should create form data with file", () => {
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com",
        formData: true,
        fieldName: "file",
      });

      const fileId = uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
        meta: {
          custom: "value",
        },
      });
      const file = uppy.getFile(fileId);

      const plugin = uppy.getPlugin("XHRUpload") as unknown as XHRUploadTest;
      const formData = plugin.createFormDataUpload(
        file as any,
        plugin.getOptions(file),
      );

      expect(formData).toBeInstanceOf(FormData);
      expect(formData.get("file")).toBeInstanceOf(Blob);
      expect(formData.get("custom")).toBe("value");
    });

    it("should handle file without name", () => {
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com",
        formData: true,
        fieldName: "file",
      });

      const fileId = uppy.addFile({
        type: "image/png",
        source: "test",
        name: "",
        data: new Blob([new Uint8Array(8192)]),
      });
      const file = uppy.getFile(fileId);

      const plugin = uppy.getPlugin("XHRUpload") as unknown as XHRUploadTest;
      const formData = plugin.createFormDataUpload(
        file as any,
        plugin.getOptions(file),
      );

      expect(formData).toBeInstanceOf(FormData);
      expect(formData.get("file")).toBeInstanceOf(Blob);
    });

    it("should filter metadata based on allowedMetaFields", () => {
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com",
        formData: true,
        allowedMetaFields: ["allowed1", "allowed2"],
      });

      const fileId = uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
        meta: {
          allowed1: "value1",
          allowed2: "value2",
          disallowed: "value3",
        },
      });
      const file = uppy.getFile(fileId);

      const plugin = uppy.getPlugin("XHRUpload") as unknown as XHRUploadTest;
      const formData = plugin.createFormDataUpload(
        file as any,
        plugin.getOptions(file),
      );

      expect(formData.get("allowed1")).toBe("value1");
      expect(formData.get("allowed2")).toBe("value2");
      expect(formData.get("disallowed")).toBeNull();
    });

    it("should include all metadata when allowedMetaFields is true", () => {
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com",
        formData: true,
        allowedMetaFields: true,
      });

      const fileId = uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
        meta: {
          field1: "value1",
          field2: "value2",
        },
      });
      const file = uppy.getFile(fileId);

      const plugin = uppy.getPlugin("XHRUpload") as unknown as XHRUploadTest;
      const formData = plugin.createFormDataUpload(
        file as any,
        plugin.getOptions(file),
      );

      expect(formData.get("field1")).toBe("value1");
      expect(formData.get("field2")).toBe("value2");
    });

    it("should exclude all metadata when allowedMetaFields is false", () => {
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com",
        formData: true,
        allowedMetaFields: false,
      });

      const fileId = uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
        meta: {
          field1: "value1",
          field2: "value2",
        },
      });
      const file = uppy.getFile(fileId);

      const plugin = uppy.getPlugin("XHRUpload") as unknown as XHRUploadTest;
      const formData = plugin.createFormDataUpload(
        file as any,
        plugin.getOptions(file),
      );

      expect(formData.get("field1")).toBeNull();
      expect(formData.get("field2")).toBeNull();
    });
  });

  describe("createBundledUpload", () => {
    it("should create form data with multiple files", () => {
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com",
        bundle: true,
      });

      const file1Id = uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test1.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });
      const file1 = uppy.getFile(file1Id);

      const file2Id = uppy.addFile({
        type: "image/jpeg",
        source: "test",
        name: "test2.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });
      const file2 = uppy.getFile(file2Id);

      const plugin = uppy.getPlugin("XHRUpload") as unknown as XHRUploadTest;
      const formData = plugin.createBundledUpload(
        [file1, file2] as any,
        plugin.getOptions(file1),
      );

      expect(formData).toBeInstanceOf(FormData);
      expect(formData.getAll("files[]")).toHaveLength(2);
    });

    it("should use custom fieldName", () => {
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com",
        bundle: true,
        fieldName: "customField",
      });

      const file1Id = uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test1.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });
      const file1 = uppy.getFile(file1Id);

      const file2Id = uppy.addFile({
        type: "image/jpeg",
        source: "test",
        name: "test2.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });
      const file2 = uppy.getFile(file2Id);

      uppy.setFileState(file2Id, {
        xhrUpload: {
          fieldName: "customField",
          endpoint: "https://api.test.com",
        },
      });

      const plugin = uppy.getPlugin("XHRUpload") as unknown as XHRUploadTest;
      const formData = plugin.createBundledUpload(
        [file1, file2] as any,
        plugin.getOptions(file1),
      );

      expect(formData.getAll("customField")).toHaveLength(2);
    });
  });

  describe("upload", () => {
    it("should upload a single file", async () => {
      const endpointFn = vi.fn(
        (file: any) => `https://api.test.com/${file.name}`,
      );

      const plugin = uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: endpointFn,
      });

      const fileId = uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      mock(mockNetworkClient.request).mockResolvedValue({
        status: 200,
        statusText: "OK",
        responseText: '{"url":"https://example.com/file"}',
        response: { url: "https://example.com/file" },
      });

      await uppy.upload();

      expect(mockNetworkClient.request).toHaveBeenCalledWith(
        "https://api.test.com/test.jpg",
        expect.any(Object),
        expect.any(Object),
      );
    });

    it("should support endpoint as a function for bundle", async () => {
      const endpointFn = vi.fn((files: any[]) => {
        const names = files.map((f) => f.name).join(",");
        return `https://api.test.com/bundle/${names}`;
      });

      const plugin = uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: endpointFn,
        bundle: true,
      });

      const file1Id = uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test1.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      const file2Id = uppy.addFile({
        type: "image/jpeg",
        source: "test",
        name: "test2.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      mockNetworkClient.request.mockResolvedValue({
        status: 200,
        statusText: "OK",
        responseText: '{"url":"https://example.com/bundle"}',
        response: { url: "https://example.com/bundle" },
      });

      await uppy.upload();

      expect(mockNetworkClient.request).toHaveBeenCalledWith(
        "https://api.test.com/bundle/test1.jpg,test2.jpg",
        expect.any(Object),
        expect.any(Object),
      );
    });
  });

  describe("plugin lifecycle", () => {
    it("should be registered via uppy.use", () => {
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com",
      });

      const plugin = uppy.getPlugin("XHRUpload") as unknown as XHRUploadTest;
      expect(plugin).toBeInstanceOf(XHRUpload);
      expect(plugin.id).toBe("XHRUpload");
    });

    it("should set individualCancellation to false when bundle is true", () => {
      uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com",
        bundle: true,
      });

      const { capabilities } = uppy.getState();
      expect(capabilities.individualCancellation).toBe(false);
    });
  });

  describe("upload progress", () => {
    it("should emit upload-progress events", async () => {
      const plugin = uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com",
      });

      const fileId = uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });
      const file = uppy.getFile(fileId);

      mock(mockNetworkClient.request).mockImplementation(
        async (_url: string, options: any, callbacks: any) => {
          // Simulate upload progress
          if (callbacks?.onUploadProgress) {
            callbacks.onUploadProgress({
              loaded: 4096,
              total: 8192,
              lengthComputable: true,
            });
          }

          return {
            status: 200,
            statusText: "OK",
            responseText: '{"url":"https://example.com/file"}',
            response: { url: "https://example.com/file" },
          };
        },
      );

      const progressSpy = vi.fn();
      uppy.on("upload-progress", progressSpy);

      await uppy.upload();

      expect(progressSpy).toHaveBeenCalled();
      const [uploadedFile, progress] = progressSpy.mock.calls[0];
      expect(progress).toEqual(
        expect.objectContaining({
          bytesUploaded: 4096,
          bytesTotal: 8192,
        }),
      );
      expect(uploadedFile.id).toBe(file.id);
    });

    it("should emit upload-stalled event on timeout", async () => {
      const plugin = uppy.use(XHRUpload, {
        id: "XHRUpload",
        endpoint: "https://api.test.com",
        timeout: 1000,
      });

      const fileId = uppy.addFile({
        type: "image/png",
        source: "test",
        name: "test.jpg",
        data: new Blob([new Uint8Array(8192)]),
      });

      mockNetworkClient.request.mockImplementation(
        async (_url: string, options: any, callbacks: any) => {
          // Simulate timeout
          if (callbacks?.onTimeout) {
            callbacks.onTimeout(options.timeout);
          }

          return {
            status: 200,
            statusText: "OK",
            responseText: '{"url":"https://example.com/file"}',
            response: { url: "https://example.com/file" },
          };
        },
      );

      const stalledSpy = vi.fn();
      uppy.on("upload-stalled", stalledSpy);

      await uppy.upload();

      expect(stalledSpy).toHaveBeenCalled();
      const error = stalledSpy.mock.calls[0][0];
      expect(error.message).toContain("1");
    });
  });
});
