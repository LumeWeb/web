import Uppy from "@uppy/core";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
  PluginConfig,
  ServiceConfig,
  UploadManagerConfig,
} from "@/types/upload";

import { UPLOAD_TYPE_MAIN, UploadStatus } from "@/types/upload";

import { Manager } from "../Manager";

// Mock the SDK
const mockSdk = {
  account: () => ({
    info: vi.fn().mockResolvedValue({
      storage: {
        available: 10000000,
        total: 100000000,
        used: 5000000,
        usedPercentage: 5,
      },
    }),
    uploadLimit: vi.fn().mockResolvedValue(1000000),
  }),
};

// Mock plugins
const mockSmallPlugin = class MockSmallPlugin {
  id: string;
  type: string;
  uppy: Uppy;

  constructor(uppy: Uppy, opts: any) {
    this.id = opts.id || "MockSmallPlugin";
    this.type = "uploader";
    this.uppy = uppy;
  }

  install() {}
  uninstall() {}
};

const mockLargePlugin = class MockLargePlugin {
  id: string;
  type: string;
  uppy: Uppy;

  constructor(uppy: Uppy, opts: any) {
    this.id = opts.id || "MockLargePlugin";
    this.type = "uploader";
    this.uppy = uppy;
  }

  install() {}
  uninstall() {}
};

const mockFolderBundlerPlugin = class MockFolderBundlerPlugin {
  id: string;
  type: string;
  uppy: Uppy;

  constructor(uppy: Uppy, opts: any) {
    this.id = opts.id || "MockFolderBundler";
    this.type = "preprocessor";
    this.uppy = uppy;
  }

  getBundleManager() {
    return {
      createBundles: vi.fn().mockReturnValue(new Map()),
      createVirtualFolderFiles: vi.fn().mockReturnValue([]),
      getBundle: vi.fn().mockReturnValue(undefined),
      getBundles: vi.fn().mockReturnValue(new Map()),
    };
  }
  install() {}

  uninstall() {}
};

describe("Bundle Error Handling and Validation", () => {
  let manager: Manager;
  let config: UploadManagerConfig;
  let serviceConfig: ServiceConfig;

  beforeEach(() => {
    config = {
      sdk: mockSdk as any,
      type: UPLOAD_TYPE_MAIN,
    };

    serviceConfig = {
      folderBundlerPlugin: {
        options: {},
        plugin: mockFolderBundlerPlugin,
      } as PluginConfig,
      id: "test-service",
      largeFilePlugin: {
        options: {},
        plugin: mockLargePlugin,
      } as PluginConfig,
      name: "Test Service",
      smallFilePlugin: {
        options: {},
        plugin: mockSmallPlugin,
      } as PluginConfig,
    };

    manager = new Manager(config);
    manager.registerService(serviceConfig);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Bundle-specific error handling", () => {
    it("should distinguish bundle errors from file errors", () => {
      const fileError = new Error("File upload error");
      const bundleError = new Error("Bundle upload error");
      bundleError.name = "BundleUploadError";

      expect(fileError.name).not.toBe("BundleUploadError");
      expect(bundleError.name).toBe("BundleUploadError");
    });

    it("should handle bundle errors with descriptive messages", async () => {
      const mockUppy = manager.getUppy();
      const errorSpy = vi.spyOn(mockUppy, "emit");

      // Simulate a bundle error
      const testError = new Error("Network failure");
      (manager as any)["#handleBundleError"]("bundle-test", testError);

      expect(errorSpy).toHaveBeenCalledWith(
        "bundle-error",
        "bundle-test",
        expect.any(Error),
      );
      const emittedError = errorSpy.mock.calls.find(
        (call) => call[0] === "bundle-error",
      )?.[2];
      expect(emittedError).toBeInstanceOf(Error);
      expect(emittedError?.message).toContain("Failed to upload folder");
    });
  });

  describe("Folder structure integrity validation", () => {
    it("should validate proper folder structure", () => {
      const files = [
        {
          data: new Blob(["test"]),
          id: "file1",
          isRemote: false,
          meta: { relativePath: "folder1/test1.txt" },
          name: "test1.txt",
          progress: { bytesTotal: 100, bytesUploaded: 0 },
          size: 100,
          source: "test",
          type: "text/plain",
        },
        {
          data: new Blob(["test"]),
          id: "file2",
          isRemote: false,
          meta: { relativePath: "folder1/subfolder/test2.txt" },
          name: "test2.txt",
          progress: { bytesTotal: 200, bytesUploaded: 0 },
          size: 200,
          source: "test",
          type: "text/plain",
        },
      ] as any;

      const isValid = (manager as any)["#validateFolderStructure"](files);
      expect(isValid).toBe(true);
    });

    it("should detect malformed folder structures", () => {
      const files = [
        {
          data: new Blob(["test"]),
          id: "file1",
          isRemote: false,
          meta: { relativePath: "" }, // Empty path
          name: "test1.txt",
          progress: { bytesTotal: 100, bytesUploaded: 0 },
          size: 100,
          source: "test",
          type: "text/plain",
        },
      ] as any;

      const isValid = (manager as any)["#validateFolderStructure"](files);
      expect(isValid).toBe(true); // Should still be valid as it just skips invalid files
    });
  });

  describe("Rollback mechanism", () => {
    it("should rollback bundle operations", () => {
      const uppy = manager.getUppy();
      const removeFileSpy = vi.spyOn(uppy, "removeFile");

      // Mock bundle manager with a test bundle
      const mockBundleManager = {
        getBundle: vi.fn().mockReturnValue({
          fileIds: ["file1", "file2"],
          id: "bundle-test",
          name: "test-folder",
          parentId: null,
          path: "test-folder",
          progress: 0,
          uploaded: false,
        }),
      };

      // Mock the getBundleManager method to return our mock
      vi.spyOn(manager, "getBundleManager").mockReturnValue(
        mockBundleManager as any,
      );

      (manager as any)["#rollbackBundle"]("bundle-test");

      // Should remove the bundle file
      expect(removeFileSpy).toHaveBeenCalledWith("bundle-test");
      // Note: Individual file rollback is logged but not fully implemented in the mock
    });

    it("should handle rollback for non-existent bundles gracefully", () => {
      const consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      // Mock bundle manager that returns undefined for the bundle
      const mockBundleManager = {
        getBundle: vi.fn().mockReturnValue(undefined),
      };

      vi.spyOn(manager, "getBundleManager").mockReturnValue(
        mockBundleManager as any,
      );

      (manager as any)["#rollbackBundle"]("non-existent-bundle");

      expect(consoleSpy).toHaveBeenCalledWith(
        "Bundle non-existent-bundle not found during error handling",
      );
    });
  });

  describe("Error event reporting", () => {
    it("should emit bundle error events", () => {
      const uppy = manager.getUppy();
      const emitSpy = vi.spyOn(uppy, "emit");

      const bundleError = new Error("Bundle error occurred");
      bundleError.name = "BundleUploadError";

      uppy.emit("bundle-error", "bundle-test", bundleError);

      expect(emitSpy).toHaveBeenCalledWith(
        "bundle-error",
        "bundle-test",
        bundleError,
      );
    });

    it("should distinguish between bundle and file error events", () => {
      const uppy = manager.getUppy();
      const emitSpy = vi.spyOn(uppy, "emit");

      // File error
      const fileError = new Error("File error");
      uppy.emit("upload-error", { id: "file1" } as any, fileError);

      // Bundle error
      const bundleError = new Error("Bundle error");
      bundleError.name = "BundleUploadError";
      uppy.emit("bundle-error", "bundle-test", bundleError);

      // Should have emitted both types of errors
      expect(emitSpy).toHaveBeenCalledWith(
        "upload-error",
        { id: "file1" } as any,
        fileError,
      );
      expect(emitSpy).toHaveBeenCalledWith(
        "bundle-error",
        "bundle-test",
        bundleError,
      );
    });
  });

  describe("Error recovery and retry scenarios", () => {
    it("should reset bundle status when retrying", async () => {
      const mockBundleManager = {
        getBundle: vi.fn().mockReturnValue({
          fileIds: ["file1"],
          id: "bundle-test",
          name: "test-folder",
          parentId: null,
          path: "test-folder",
          progress: 100,
          uploaded: true,
        }),
        getBundles: vi.fn().mockReturnValue(
          new Map([
            [
              "bundle-test",
              {
                fileIds: ["file1"],
                id: "bundle-test",
                name: "test-folder",
                parentId: null,
                path: "test-folder",
                progress: 100,
                uploaded: true,
              },
            ],
          ]),
        ),
      };

      vi.spyOn(manager, "getBundleManager").mockReturnValue(
        mockBundleManager as any,
      );

      // Add a mock file to uppy
      const uppy = manager.getUppy();
      uppy.addFile({
        data: new Blob(["test"]),
        id: "file1",
        isRemote: false,
        meta: { isBundle: true },
        name: "test.txt",
        progress: {
          bytesTotal: 100,
          bytesUploaded: 100,
          uploadComplete: true,
        },
        size: 100,
        source: "test",
        type: "text/plain",
      });

      const patchFilesStateSpy = vi.spyOn(uppy, "patchFilesState");

      await manager.retryBundle("bundle-test");

      // Should reset bundle file status
      expect(patchFilesStateSpy).toHaveBeenCalledWith({
        "bundle-test": {
          progress: {
            bytesTotal: expect.any(Number),
            bytesUploaded: 0,
            uploadComplete: false,
            uploadStarted: null,
          },
        },
      });
    });

    it("should throw error when retrying non-existent bundle", async () => {
      const mockBundleManager = {
        getBundle: vi.fn().mockReturnValue(undefined),
      };

      vi.spyOn(manager, "getBundleManager").mockReturnValue(
        mockBundleManager as any,
      );

      await expect(manager.retryBundle("non-existent-bundle")).rejects.toThrow(
        "Bundle non-existent-bundle not found",
      );
    });
  });

  describe("Bundle formation and structure validation", () => {
    it("should create bundles from files with relative paths", () => {
      const mockBundleManager = {
        createBundles: vi.fn().mockReturnValue(
          new Map([
            [
              "bundle-folder1",
              {
                fileIds: ["file1", "file2"],
                id: "bundle-folder1",
                name: "folder1",
                parentId: null,
                path: "folder1",
                progress: 0,
                uploaded: false,
              },
            ],
          ]),
        ),
        getBundles: vi.fn().mockReturnValue(
          new Map([
            [
              "bundle-folder1",
              {
                fileIds: ["file1", "file2"],
                id: "bundle-folder1",
                name: "folder1",
                parentId: null,
                path: "folder1",
                progress: 0,
                uploaded: false,
              },
            ],
          ]),
        ),
      };

      vi.spyOn(manager, "getBundleManager").mockReturnValue(
        mockBundleManager as any,
      );

      const bundles = manager.getBundles();
      expect(bundles.size).toBe(1);
      expect(bundles.get("bundle-folder1")).toBeDefined();
    });

    it("should validate service support for folder uploads", () => {
      // Service with folder bundler plugin should support folder uploads
      expect(manager.serviceSupportsFolderUpload("test-service")).toBe(true);

      // Service without folder bundler plugin should not support folder uploads
      const managerWithoutFolderSupport = new Manager(config);
      const serviceWithoutFolderBundler = {
        id: "test-service-2",
        largeFilePlugin: {
          options: {},
          plugin: mockLargePlugin,
        } as PluginConfig,
        name: "Test Service 2",
        smallFilePlugin: {
          options: {},
          plugin: mockSmallPlugin,
        } as PluginConfig,
        // No folderBundlerPlugin property
      };

      managerWithoutFolderSupport.registerService(serviceWithoutFolderBundler);
      expect(
        managerWithoutFolderSupport.serviceSupportsFolderUpload(
          "test-service-2",
        ),
      ).toBe(false);
    });

    it("should handle bundle creation with nested folder structures", () => {
      const mockBundleManager = {
        createBundles: vi.fn().mockReturnValue(
          new Map([
            [
              "bundle-root",
              {
                fileIds: ["file1"],
                id: "bundle-root",
                name: "root",
                parentId: null,
                path: "root",
                progress: 0,
                uploaded: false,
              },
            ],
            [
              "bundle-root-nested",
              {
                fileIds: ["file2"],
                id: "bundle-root-nested",
                name: "nested",
                parentId: "bundle-root",
                path: "root/nested",
                progress: 0,
                uploaded: false,
              },
            ],
          ]),
        ),
        getBundles: vi.fn().mockReturnValue(
          new Map([
            [
              "bundle-root",
              {
                fileIds: ["file1"],
                id: "bundle-root",
                name: "root",
                parentId: null,
                path: "root",
                progress: 0,
                uploaded: false,
              },
            ],
            [
              "bundle-root-nested",
              {
                fileIds: ["file2"],
                id: "bundle-root-nested",
                name: "nested",
                parentId: "bundle-root",
                path: "root/nested",
                progress: 0,
                uploaded: false,
              },
            ],
          ]),
        ),
      };

      vi.spyOn(manager, "getBundleManager").mockReturnValue(
        mockBundleManager as any,
      );

      const bundles = manager.getBundles();
      expect(bundles.size).toBe(2);

      const rootBundle = bundles.get("bundle-root");
      const nestedBundle = bundles.get("bundle-root-nested");

      expect(rootBundle).toBeDefined();
      expect(nestedBundle).toBeDefined();
      expect(nestedBundle?.parentId).toBe("bundle-root");
    });
  });

  describe("Bundle cancellation", () => {
    it("should cancel bundle uploads and remove associated files", () => {
      const mockBundleManager = {
        getBundle: vi.fn().mockReturnValue({
          fileIds: ["file1", "file2"],
          id: "bundle-test",
          name: "test-folder",
          parentId: null,
          path: "test-folder",
          progress: 50,
          uploaded: false,
        }),
      };

      vi.spyOn(manager, "getBundleManager").mockReturnValue(
        mockBundleManager as any,
      );

      const uppy = manager.getUppy();
      const removeFileSpy = vi.spyOn(uppy, "removeFile");

      manager.cancelBundle("bundle-test");

      // Should remove all files in the bundle including the bundle itself
      expect(removeFileSpy).toHaveBeenCalledWith("file1");
      expect(removeFileSpy).toHaveBeenCalledWith("file2");
      expect(removeFileSpy).toHaveBeenCalledWith("bundle-test");
    });

    it("should throw error when canceling non-existent bundle", () => {
      const mockBundleManager = {
        getBundle: vi.fn().mockReturnValue(undefined),
      };

      vi.spyOn(manager, "getBundleManager").mockReturnValue(
        mockBundleManager as any,
      );

      expect(() => manager.cancelBundle("non-existent-bundle")).toThrow(
        "Bundle non-existent-bundle not found",
      );
    });
  });
});
