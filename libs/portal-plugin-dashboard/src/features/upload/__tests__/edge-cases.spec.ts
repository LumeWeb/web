import Uppy from "@uppy/core";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ServiceConfig, UploadManagerConfig } from "@/types/upload";

import type { UppyFileDefault } from "../Manager";

import { BundleManager, FolderBundlerPlugin, Manager } from "../Manager";

// Mock the SDK
const mockSdk = {
  account: () => ({
    info: vi.fn().mockResolvedValue({
      storage: {
        available: 5000000,
        total: 10000000,
        used: 5000000,
        usedPercentage: 50,
      },
    }),
    uploadLimit: vi.fn().mockResolvedValue(1000000),
  }),
};

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

const createMockServiceConfig = (id: string): ServiceConfig => ({
  folderBundlerPlugin: {
    options: {},
    plugin: FolderBundlerPlugin,
  },
  id,
  largeFilePlugin: {
    options: {},
    plugin: mockLargePlugin,
  },
  name: `${id} Service`,
  smallFilePlugin: {
    options: {},
    plugin: mockSmallPlugin,
  },
});

describe("Upload Manager - Edge Cases and Mixed Scenarios", () => {
  let uploadManager: Manager;
  let config: UploadManagerConfig;

  beforeEach(() => {
    config = {
      sdk: mockSdk as any,
      type: "main",
    };
    uploadManager = new Manager(config);
  });

  describe("Mixed folder/file uploads scenarios", () => {
    it("should handle mixed uploads with both folder structures and individual files", async () => {
      // Register a service with folder bundling support
      const serviceConfig = createMockServiceConfig("test-service");
      uploadManager.registerService(serviceConfig);

      // Create files with and without relative paths
      const file1 = new File(["content1"], "file1.txt", { type: "text/plain" });
      Object.defineProperty(file1, "webkitRelativePath", {
        value: "folder1/file1.txt",
        writable: false,
      });

      const file2 = new File(["content2"], "file2.txt", { type: "text/plain" });
      Object.defineProperty(file2, "webkitRelativePath", {
        value: "folder1/subfolder/file2.txt",
        writable: false,
      });

      const file3 = new File(["content3"], "file3.txt", { type: "text/plain" });
      // file3 has no webkitRelativePath

      // Add files to upload manager
      await uploadManager.addFile(file1, "test-service");
      await uploadManager.addFile(file2, "test-service");
      await uploadManager.addFile(file3, "test-service");

      // Get files and verify structure
      const files = uploadManager.getFiles();

      // Should have 2 bundles and 1 individual file
      expect(files).toHaveLength(3);

      // Check that we have bundle files
      const bundleFiles = files.filter(
        (file: UppyFileDefault) => (file.meta as Record<string, any>)?.isBundle,
      );
      expect(bundleFiles).toHaveLength(2);

      // Check that we have individual files
      const individualFiles = files.filter(
        (file: UppyFileDefault) =>
          !(file.meta as Record<string, any>)?.isBundle,
      );
      expect(individualFiles).toHaveLength(1);
      expect(individualFiles[0].name).toBe("file3.txt");
    });

    it("should properly group files when mixing different folder depths", async () => {
      const serviceConfig = createMockServiceConfig("test-service");
      uploadManager.registerService(serviceConfig);

      // Create files at different folder depths
      const file1 = new File(["content"], "root-file.txt", {
        type: "text/plain",
      });
      Object.defineProperty(file1, "webkitRelativePath", {
        value: "root-file.txt",
        writable: false,
      });

      const file2 = new File(["content"], "level1-file.txt", {
        type: "text/plain",
      });
      Object.defineProperty(file2, "webkitRelativePath", {
        value: "folder1/level1-file.txt",
        writable: false,
      });

      const file3 = new File(["content"], "level2-file.txt", {
        type: "text/plain",
      });
      Object.defineProperty(file3, "webkitRelativePath", {
        value: "folder1/subfolder/level2-file.txt",
        writable: false,
      });

      const file4 = new File(["content"], "another-root.txt", {
        type: "text/plain",
      });
      Object.defineProperty(file4, "webkitRelativePath", {
        value: "another-root.txt",
        writable: false,
      });

      await uploadManager.addFile(file1, "test-service");
      await uploadManager.addFile(file2, "test-service");
      await uploadManager.addFile(file3, "test-service");
      await uploadManager.addFile(file4, "test-service");

      const groupedFiles = (uploadManager as any).groupFilesByFolder();

      // Should have root files and folder structures
      expect(groupedFiles.root).toHaveLength(2);
      expect(groupedFiles.folder1).toHaveLength(1);
      expect(groupedFiles["folder1/subfolder"]).toHaveLength(1);
    });
  });

  describe("Empty folders edge case handling", () => {
    it("should not create bundles for files without relative paths", async () => {
      const serviceConfig = createMockServiceConfig("test-service");
      uploadManager.registerService(serviceConfig);

      // Create a file without webkitRelativePath
      const file = new File(["content"], "standalone.txt", {
        type: "text/plain",
      });
      // Note: not setting webkitRelativePath

      await uploadManager.addFile(file, "test-service");

      const files = uploadManager.getFiles();
      expect(files).toHaveLength(1);

      // File should not be marked as bundle
      expect((files[0].meta as Record<string, any>)?.isBundle).toBeUndefined();
    });

    it("should handle files with empty relative paths", async () => {
      const serviceConfig = createMockServiceConfig("test-service");
      uploadManager.registerService(serviceConfig);

      const file = new File(["content"], "file.txt", { type: "text/plain" });
      Object.defineProperty(file, "webkitRelativePath", {
        value: "",
        writable: false,
      });

      await uploadManager.addFile(file, "test-service");

      const files = uploadManager.getFiles();
      expect(files).toHaveLength(1);

      // File should not be marked as bundle
      expect((files[0].meta as Record<string, any>)?.isBundle).toBeUndefined();
    });
  });

  describe("Bundle size calculations validation", () => {
    it("should correctly calculate total size for bundles", async () => {
      const serviceConfig = createMockServiceConfig("test-service");
      uploadManager.registerService(serviceConfig);

      // Create files with known sizes
      const file1 = new File(["a".repeat(100)], "file1.txt", {
        type: "text/plain",
      });
      Object.defineProperty(file1, "webkitRelativePath", {
        value: "folder1/file1.txt",
        writable: false,
      });

      const file2 = new File(["b".repeat(200)], "file2.txt", {
        type: "text/plain",
      });
      Object.defineProperty(file2, "webkitRelativePath", {
        value: "folder1/file2.txt",
        writable: false,
      });

      const file3 = new File(["c".repeat(300)], "file3.txt", {
        type: "text/plain",
      });
      Object.defineProperty(file3, "webkitRelativePath", {
        value: "folder1/subfolder/file3.txt",
        writable: false,
      });

      await uploadManager.addFile(file1, "test-service");
      await uploadManager.addFile(file2, "test-service");
      await uploadManager.addFile(file3, "test-service");

      const bundleManager = uploadManager.getBundleManager();
      expect(bundleManager).not.toBeNull();

      const bundles = bundleManager!.getBundles();
      expect(bundles.size).toBe(2);

      // Check bundle sizes
      const folder1Bundle = bundles.get("bundle-folder1");
      const subfolderBundle = bundles.get("bundle-folder1-subfolder");

      expect(folder1Bundle).toBeDefined();
      expect(subfolderBundle).toBeDefined();

      // folder1 should contain file1 and file2 (total 300 bytes)
      expect(
        bundleManager!.getBundleProgress()["bundle-folder1"]?.bytesTotal,
      ).toBe(300);

      // subfolder should contain file3 (total 300 bytes)
      expect(
        bundleManager!.getBundleProgress()["bundle-folder1-subfolder"]
          ?.bytesTotal,
      ).toBe(300);
    });

    it("should handle zero-sized files in bundle calculations", async () => {
      const serviceConfig = createMockServiceConfig("test-service");
      uploadManager.registerService(serviceConfig);

      // Create a zero-sized file
      const emptyFile = new File([], "empty.txt", { type: "text/plain" });
      Object.defineProperty(emptyFile, "webkitRelativePath", {
        value: "folder/empty.txt",
        writable: false,
      });

      const normalFile = new File(["content"], "normal.txt", {
        type: "text/plain",
      });
      Object.defineProperty(normalFile, "webkitRelativePath", {
        value: "folder/normal.txt",
        writable: false,
      });

      await uploadManager.addFile(emptyFile, "test-service");
      await uploadManager.addFile(normalFile, "test-service");

      const bundleManager = uploadManager.getBundleManager();
      const bundles = bundleManager!.getBundles();

      const bundle = bundles.get("bundle-folder");
      expect(bundle).toBeDefined();

      // Total should be size of normal file only (7 bytes)
      expect(
        bundleManager!.getBundleProgress()["bundle-folder"]?.bytesTotal,
      ).toBe(7);
    });
  });

  describe("Progress reporting accuracy in complex scenarios", () => {
    it("should accurately track progress for mixed individual and bundle files", async () => {
      const serviceConfig = createMockServiceConfig("test-service");
      uploadManager.registerService(serviceConfig);

      // Create files
      const file1 = new File(["content1"], "file1.txt", { type: "text/plain" });
      Object.defineProperty(file1, "webkitRelativePath", {
        value: "folder1/file1.txt",
        writable: false,
      });

      const file2 = new File(["content2"], "file2.txt", { type: "text/plain" });
      // file2 is not in a folder

      await uploadManager.addFile(file1, "test-service");
      await uploadManager.addFile(file2, "test-service");

      // Simulate progress updates
      const files = uploadManager.getFiles();
      const bundleFile = files.find(
        (file: UppyFileDefault) =>
          (file.meta as Record<string, any>)?.isBundle &&
          file.name === "folder1",
      );
      const individualFile = files.find(
        (file: UppyFileDefault) =>
          !(file.meta as Record<string, any>)?.isBundle &&
          file.name === "file2.txt",
      );

      expect(bundleFile).toBeDefined();
      expect(individualFile).toBeDefined();

      // Update progress for bundle file
      uploadManager.patchFilesState({
        [bundleFile.id]: {
          progress: {
            ...bundleFile.progress,
            bytesTotal: 100,
            bytesUploaded: 50,
          },
        },
      });

      // Update progress for individual file
      uploadManager.patchFilesState({
        [individualFile.id]: {
          progress: {
            ...individualFile.progress,
            bytesTotal: 50,
            bytesUploaded: 30,
          },
        },
      });

      // Check overall progress calculation
      const progress = uploadManager.getUploadProgress();
      // (50 + 30) / (100 + 50) = 80 / 150 = 53.33% ≈ 53%
      expect(progress).toBe(53);
    });

    it("should handle progress updates for nested folder structures", async () => {
      const serviceConfig = createMockServiceConfig("test-service");
      uploadManager.registerService(serviceConfig);

      // Create nested folder structure
      const file1 = new File(["content1"], "file1.txt", { type: "text/plain" });
      Object.defineProperty(file1, "webkitRelativePath", {
        value: "parent/child/file1.txt",
        writable: false,
      });

      const file2 = new File(["content2"], "file2.txt", { type: "text/plain" });
      Object.defineProperty(file2, "webkitRelativePath", {
        value: "parent/file2.txt",
        writable: false,
      });

      await uploadManager.addFile(file1, "test-service");
      await uploadManager.addFile(file2, "test-service");

      const bundleManager = uploadManager.getBundleManager();

      // Simulate uploading progress for child bundle
      bundleManager!.updateBundleProgress("bundle-parent-child", 50);

      // Simulate uploading progress for parent bundle
      bundleManager!.updateBundleProgress("bundle-parent", 30);

      const progress = uploadManager.getUploadProgress();
      expect(progress).toBeGreaterThan(0);
    });
  });

  describe("Integration testing of multiple components together", () => {
    it("should work end-to-end with folder bundling plugin", async () => {
      const serviceConfig = createMockServiceConfig("test-service");
      uploadManager.registerService(serviceConfig);

      // Create multiple files in folder structure
      const files = [
        new File(["content1"], "doc1.txt", { type: "text/plain" }),
        new File(["content2"], "doc2.txt", { type: "text/plain" }),
        new File(["content3"], "image1.png", { type: "image/png" }),
      ];

      // Set relative paths
      Object.defineProperty(files[0], "webkitRelativePath", {
        value: "documents/doc1.txt",
        writable: false,
      });

      Object.defineProperty(files[1], "webkitRelativePath", {
        value: "documents/doc2.txt",
        writable: false,
      });

      Object.defineProperty(files[2], "webkitRelativePath", {
        value: "images/image1.png",
        writable: false,
      });

      // Add files
      for (const file of files) {
        await uploadManager.addFile(file, "test-service");
      }

      // Verify bundle creation
      const bundles = uploadManager.getBundles();
      expect(bundles.size).toBe(2);

      const documentsBundle = bundles.get("bundle-documents");
      const imagesBundle = bundles.get("bundle-images");

      expect(documentsBundle).toBeDefined();
      expect(imagesBundle).toBeDefined();

      expect(documentsBundle!.fileIds).toHaveLength(2);
      expect(imagesBundle!.fileIds).toHaveLength(1);
    });

    it("should properly reset state when canceling all uploads", async () => {
      const serviceConfig = createMockServiceConfig("test-service");
      uploadManager.registerService(serviceConfig);

      // Add files
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      Object.defineProperty(file, "webkitRelativePath", {
        value: "folder/test.txt",
        writable: false,
      });

      await uploadManager.addFile(file, "test-service");

      // Verify files exist
      expect(uploadManager.getFiles()).toHaveLength(1);

      // Cancel all
      uploadManager.cancelAll();

      // Verify files are cleared
      expect(uploadManager.getFiles()).toHaveLength(0);
      expect(uploadManager.getUploadProgress()).toBe(0);
      expect(uploadManager.getUploadStatus()).toBe("pending");
    });
  });

  describe("Stress testing with large numbers of files and folders", () => {
    it("should handle many files in a single folder", async () => {
      const serviceConfig = createMockServiceConfig("test-service");
      uploadManager.registerService(serviceConfig);

      // Create many files
      const files = [];
      for (let i = 0; i < 100; i++) {
        const file = new File([`content${i}`], `file${i}.txt`, {
          type: "text/plain",
        });
        Object.defineProperty(file, "webkitRelativePath", {
          value: `large-folder/file${i}.txt`,
          writable: false,
        });
        files.push(file);
      }

      // Add all files
      for (const file of files) {
        await uploadManager.addFile(file, "test-service");
      }

      // Should have one bundle for the folder
      const bundles = uploadManager.getBundles();
      expect(bundles.size).toBe(1);

      const bundle = bundles.get("bundle-large-folder");
      expect(bundle).toBeDefined();
      expect(bundle!.fileIds).toHaveLength(100);
    });

    it("should handle deeply nested folder structures", async () => {
      const serviceConfig = createMockServiceConfig("test-service");
      uploadManager.registerService(serviceConfig);

      // Create files in deeply nested structure
      const file = new File(["content"], "deep-file.txt", {
        type: "text/plain",
      });
      Object.defineProperty(file, "webkitRelativePath", {
        value: "level1/level2/level3/level4/level5/deep-file.txt",
        writable: false,
      });

      await uploadManager.addFile(file, "test-service");

      // Should create bundles for each level
      const bundles = uploadManager.getBundles();
      expect(bundles.size).toBe(5);

      // Check that parent relationships are correct
      const bundle5 = bundles.get("bundle-level1-level2-level3-level4-level5");
      const bundle4 = bundles.get("bundle-level1-level2-level3-level4");
      const bundle3 = bundles.get("bundle-level1-level2-level3");
      const bundle2 = bundles.get("bundle-level1-level2");
      const bundle1 = bundles.get("bundle-level1");

      expect(bundle5).toBeDefined();
      expect(bundle4).toBeDefined();
      expect(bundle3).toBeDefined();
      expect(bundle2).toBeDefined();
      expect(bundle1).toBeDefined();

      expect(bundle5!.parentId).toBe("bundle-level1-level2-level3-level4");
      expect(bundle4!.parentId).toBe("bundle-level1-level2-level3");
      expect(bundle3!.parentId).toBe("bundle-level1-level2");
      expect(bundle2!.parentId).toBe("bundle-level1");
      expect(bundle1!.parentId).toBeNull();
    });
  });

  describe("Memory and performance edge cases", () => {
    it("should handle very large file names", async () => {
      const serviceConfig = createMockServiceConfig("test-service");
      uploadManager.registerService(serviceConfig);

      // Create file with very long name
      const longName = "a".repeat(1000) + ".txt";
      const file = new File(["content"], longName, { type: "text/plain" });
      Object.defineProperty(file, "webkitRelativePath", {
        value: `folder/${longName}`,
        writable: false,
      });

      await uploadManager.addFile(file, "test-service");

      const files = uploadManager.getFiles();
      expect(files).toHaveLength(1);

      const bundleFile = files[0];
      expect(bundleFile.name).toBe("folder");
    });

    it("should handle files with special characters in names", async () => {
      const serviceConfig = createMockServiceConfig("test-service");
      uploadManager.registerService(serviceConfig);

      // Create files with special characters
      const file1 = new File(["content"], "file with spaces.txt", {
        type: "text/plain",
      });
      Object.defineProperty(file1, "webkitRelativePath", {
        value: "folder with spaces/file with spaces.txt",
        writable: false,
      });

      const file2 = new File(["content"], "file-with-unicode-测试.txt", {
        type: "text/plain",
      });
      Object.defineProperty(file2, "webkitRelativePath", {
        value: "测试文件夹/file-with-unicode-测试.txt",
        writable: false,
      });

      await uploadManager.addFile(file1, "test-service");
      await uploadManager.addFile(file2, "test-service");

      const bundles = uploadManager.getBundles();
      expect(bundles.size).toBe(2);

      // Should handle special characters properly
      const bundle1 = bundles.get("bundle-folder with spaces");
      const bundle2 = bundles.get("bundle-测试文件夹");

      expect(bundle1).toBeDefined();
      expect(bundle2).toBeDefined();
    });

    it("should properly clean up when reset is called", () => {
      const serviceConfig = createMockServiceConfig("test-service");
      uploadManager.registerService(serviceConfig);

      // Add some files
      const file = new File(["content"], "test.txt", { type: "text/plain" });
      Object.defineProperty(file, "webkitRelativePath", {
        value: "folder/test.txt",
        writable: false,
      });

      uploadManager.addFile(file as any, "test-service");

      // Verify initial state
      expect(uploadManager.getServices()).toHaveLength(1);
      expect(uploadManager.getFiles()).toHaveLength(1);

      // Reset
      uploadManager.reset();

      // Verify clean state
      expect(uploadManager.getServices()).toHaveLength(0);
      expect(uploadManager.getFiles()).toHaveLength(0);
      expect(uploadManager.getUploadProgress()).toBe(0);
      expect(uploadManager.getUploadStatus()).toBe("pending");
    });
  });
});
