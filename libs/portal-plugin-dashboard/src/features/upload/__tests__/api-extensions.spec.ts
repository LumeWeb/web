import Uppy from "@uppy/core";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ServiceConfig, UploadManagerConfig } from "@/types/upload";

import { UPLOAD_TYPE_AVATAR, UPLOAD_TYPE_MAIN } from "@/types/upload";

import { Manager } from "../Manager";

// Mock Uppy plugins
const mockSmallPlugin = class MockSmallPlugin {
  id: string;
  type: string;
  uppy: Uppy;

  constructor(uppy: Uppy, opts: any) {
    this.uppy = uppy;
    this.id = opts.id || "MockSmallPlugin";
    this.type = "uploader";
  }

  install() {}
  uninstall() {}
};

const mockLargePlugin = class MockLargePlugin {
  id: string;
  type: string;
  uppy: Uppy;

  constructor(uppy: Uppy, opts: any) {
    this.uppy = uppy;
    this.id = opts.id || "MockLargePlugin";
    this.type = "uploader";
  }

  install() {}
  uninstall() {}
};

const mockFolderBundlerPlugin = class MockFolderBundlerPlugin {
  id: string;
  type: string;
  uppy: Uppy;

  constructor(uppy: Uppy, opts: any) {
    this.uppy = uppy;
    this.id = opts.id || "MockFolderBundlerPlugin";
    this.type = "preprocessor";
  }

  getBundleManager() {
    return {
      getBundle: () => undefined,
      getBundles: () => new Map(),
    };
  }
  install() {}
  uninstall() {}
};

describe("Upload Manager API Extensions", () => {
  let manager: Manager;
  let mockConfig: UploadManagerConfig;
  let mockServiceConfig: ServiceConfig;

  beforeEach(() => {
    mockConfig = {
      type: UPLOAD_TYPE_MAIN,
    };

    mockServiceConfig = {
      folderBundlerPlugin: {
        options: {},
        plugin: mockFolderBundlerPlugin,
      },
      id: "test-service",
      largeFilePlugin: {
        options: {},
        plugin: mockLargePlugin,
      },
      name: "Test Service",
      smallFilePlugin: {
        options: {},
        plugin: mockSmallPlugin,
      },
    };

    manager = new Manager(mockConfig);
  });

  describe("uploadFolder", () => {
    it("should throw error when service does not support folder uploads", async () => {
      const files = [new File(["content"], "test.txt", { type: "text/plain" })];
      const serviceId = "unsupported-service";

      await expect(manager.uploadFolder(files, serviceId)).rejects.toThrow(
        `Service ${serviceId} does not support folder uploads`,
      );
    });

    it("should successfully upload folder when service supports it", async () => {
      manager.registerService(mockServiceConfig);

      const files = [
        new File(["content1"], "file1.txt", { type: "text/plain" }),
        new File(["content2"], "file2.txt", { type: "text/plain" }),
      ];

      const serviceId = "test-service";

      // Mock the start method to avoid actual upload
      const startSpy = vi.spyOn(manager, "start").mockResolvedValue(undefined);

      await expect(
        manager.uploadFolder(files, serviceId),
      ).resolves.toBeUndefined();
      expect(startSpy).toHaveBeenCalled();
    });

    it("should handle empty files array", async () => {
      manager.registerService(mockServiceConfig);

      const files: File[] = [];
      const serviceId = "test-service";

      const startSpy = vi.spyOn(manager, "start").mockResolvedValue(undefined);

      await manager.uploadFolder(files, serviceId);
      expect(startSpy).toHaveBeenCalled();
    });
  });

  describe("getBundles", () => {
    it("should return empty map when no bundle manager exists", () => {
      const bundles = manager.getBundles();
      expect(bundles).toBeInstanceOf(Map);
      expect(bundles.size).toBe(0);
    });

    it("should return bundles when bundle manager exists", () => {
      manager.registerService(mockServiceConfig);

      // Mock bundle manager to return test data
      const testBundles = new Map([
        ["bundle-1", { id: "bundle-1", name: "test-folder" }],
      ]);

      const getBundleManagerSpy = vi
        .spyOn(manager, "getBundleManager")
        .mockReturnValue({
          getBundles: () => testBundles,
        } as any);

      const bundles = manager.getBundles();
      expect(bundles).toBe(testBundles);
    });
  });

  describe("cancelBundle", () => {
    it("should throw error when bundle manager is not available", () => {
      expect(() => manager.cancelBundle("bundle-1")).toThrow(
        "Bundle manager not available",
      );
    });

    it("should throw error when bundle is not found", () => {
      manager.registerService(mockServiceConfig);

      expect(() => manager.cancelBundle("non-existent-bundle")).toThrow(
        "Bundle non-existent-bundle not found",
      );
    });

    it("should cancel bundle when bundle exists", () => {
      manager.registerService(mockServiceConfig);

      // Mock bundle manager and uppy methods
      const mockBundle = {
        fileIds: ["file-1", "file-2"],
        id: "bundle-1",
      };

      const getBundleManagerSpy = vi
        .spyOn(manager, "getBundleManager")
        .mockReturnValue({
          getBundle: () => mockBundle,
        } as any);

      const removeFileSpy = vi.spyOn(manager.getUppy(), "removeFile");

      expect(() => manager.cancelBundle("bundle-1")).not.toThrow();
      expect(removeFileSpy).toHaveBeenCalledTimes(3); // 2 files + 1 bundle
    });
  });

  describe("retryBundle", () => {
    it("should throw error when bundle manager is not available", async () => {
      await expect(manager.retryBundle("bundle-1")).rejects.toThrow(
        "Bundle manager not available",
      );
    });

    it("should throw error when bundle is not found", async () => {
      manager.registerService(mockServiceConfig);

      await expect(manager.retryBundle("non-existent-bundle")).rejects.toThrow(
        "Bundle non-existent-bundle not found",
      );
    });

    it("should retry bundle when bundle exists", async () => {
      manager.registerService(mockServiceConfig);

      // Mock bundle manager and uppy methods
      const mockBundle = {
        fileIds: ["file-1", "file-2"],
        id: "bundle-1",
      };

      const mockBundleManager = {
        getBundle: vi.fn(() => mockBundle),
        getBundleProgress: vi.fn(() => ({
          "bundle-1": { bytesTotal: 1000 },
        })),
        markBundleAsUploaded: vi.fn(),
      };

      vi.spyOn(manager, "getBundleManager").mockReturnValue(
        mockBundleManager as any,
      );

      const patchFilesStateSpy = vi.spyOn(manager, "patchFilesState");
      const startSpy = vi.spyOn(manager, "start").mockResolvedValue(undefined);

      await expect(manager.retryBundle("bundle-1")).resolves.toBeUndefined();

      expect(mockBundleManager.getBundle).toHaveBeenCalledWith("bundle-1");
      expect(patchFilesStateSpy).toHaveBeenCalledTimes(3); // 2 files + 1 bundle
      expect(startSpy).toHaveBeenCalled();
    });
  });

  describe("serviceSupportsFolderUpload", () => {
    it("should return false for unregistered service", () => {
      expect(manager.serviceSupportsFolderUpload("unknown-service")).toBe(
        false,
      );
    });

    it("should return false for service without folderBundlerPlugin", () => {
      const serviceWithoutFolder = {
        ...mockServiceConfig,
        folderBundlerPlugin: undefined,
      };

      manager.registerService(serviceWithoutFolder);
      expect(manager.serviceSupportsFolderUpload("test-service")).toBe(false);
    });

    it("should return true for service with folderBundlerPlugin", () => {
      manager.registerService(mockServiceConfig);
      expect(manager.serviceSupportsFolderUpload("test-service")).toBe(true);
    });
  });

  describe("getUploadAdapter", () => {
    it("should return null when no adapter is registered", () => {
      expect(manager.getUploadAdapter("test-service")).toBeNull();
    });

    it("should return adapter when registered", () => {
      const mockAdapter = {
        getServiceId: () => "test-service",
        uploadFiles: vi.fn(),
      };

      manager.registerAdapter(mockAdapter);
      expect(manager.getUploadAdapter("test-service")).toBe(mockAdapter);
    });
  });
});
