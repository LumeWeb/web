import type { UppyFile } from "@uppy/core";
import type { Body, Meta } from "@uppy/core";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { BundleManager, BundleManagerConfig } from "../BundleManager";

// Mock Uppy file type
type UppyFileDefault = UppyFile<Meta, Body>;

describe("BundleManager", () => {
  let bundleManager: BundleManager;
  let mockUppy: any;
  let mockConfig: BundleManagerConfig;

  beforeEach(() => {
    // Create a mock Uppy instance with required methods
    mockUppy = {
      getFiles: vi.fn().mockReturnValue([]),
    };

    mockConfig = {
      uppy: mockUppy,
    };

    bundleManager = new BundleManager(mockConfig);
  });

  describe("instantiation and initialization", () => {
    it("should create a BundleManager instance", () => {
      expect(bundleManager).toBeInstanceOf(BundleManager);
    });

    it("should initialize with empty bundle tracking state", () => {
      expect(bundleManager.getBundles().size).toBe(0);
      expect(Object.keys(bundleManager.getBundleProgress()).length).toBe(0);
    });
  });

  describe("bundle creation", () => {
    it("should create bundles from files with relative paths", () => {
      const mockFiles: UppyFileDefault[] = [
        {
          data: new Blob(["content1"]),
          id: "file1",
          isRemote: false,
          meta: { relativePath: "folder1/document1.txt" },
          name: "document1.txt",
          progress: {
            bytesTotal: 100,
            bytesUploaded: 0,
            uploadComplete: false,
          },
          size: 100,
          source: "test",
          type: "text/plain",
        },
        {
          data: new Blob(["content2"]),
          id: "file2",
          isRemote: false,
          meta: { relativePath: "folder1/document2.txt" },
          name: "document2.txt",
          progress: {
            bytesTotal: 200,
            bytesUploaded: 0,
            uploadComplete: false,
          },
          size: 200,
          source: "test",
          type: "text/plain",
        },
        {
          data: new Blob(["image content"]),
          id: "file3",
          isRemote: false,
          meta: { relativePath: "folder1/subfolder/image.jpg" },
          name: "image.jpg",
          progress: {
            bytesTotal: 500,
            bytesUploaded: 0,
            uploadComplete: false,
          },
          size: 500,
          source: "test",
          type: "image/jpeg",
        },
      ];

      mockUppy.getFiles.mockReturnValue(mockFiles);

      const bundles = bundleManager.createBundles();

      expect(bundles.size).toBe(2);

      const bundle1 = bundles.get("bundle-folder1");
      expect(bundle1).toBeDefined();
      expect(bundle1?.name).toBe("folder1");
      expect(bundle1?.path).toBe("folder1");
      expect(bundle1?.fileIds).toEqual(["file1", "file2"]);
      expect(bundle1?.parentId).toBeNull();

      const bundle2 = bundles.get("bundle-folder1-subfolder");
      expect(bundle2).toBeDefined();
      expect(bundle2?.name).toBe("subfolder");
      expect(bundle2?.path).toBe("folder1/subfolder");
      expect(bundle2?.fileIds).toEqual(["file3"]);
      expect(bundle2?.parentId).toBe("bundle-folder1");
    });

    it("should handle files without relative paths", () => {
      const mockFiles: UppyFileDefault[] = [
        {
          data: new Blob(["content"]),
          id: "file1",
          isRemote: false,
          meta: {},
          name: "document.txt",
          progress: {
            bytesTotal: 100,
            bytesUploaded: 0,
            uploadComplete: false,
          },
          size: 100,
          source: "test",
          type: "text/plain",
        },
      ];

      mockUppy.getFiles.mockReturnValue(mockFiles);

      const bundles = bundleManager.createBundles();

      expect(bundles.size).toBe(0);
    });

    it("should handle files in root directory", () => {
      const mockFiles: UppyFileDefault[] = [
        {
          data: new Blob(["content"]),
          id: "file1",
          isRemote: false,
          meta: { relativePath: "document.txt" },
          name: "document.txt",
          progress: {
            bytesTotal: 100,
            bytesUploaded: 0,
            uploadComplete: false,
          },
          size: 100,
          source: "test",
          type: "text/plain",
        },
      ];

      mockUppy.getFiles.mockReturnValue(mockFiles);

      const bundles = bundleManager.createBundles();

      expect(bundles.size).toBe(0);
    });

    it("should handle empty file list", () => {
      mockUppy.getFiles.mockReturnValue([]);

      const bundles = bundleManager.createBundles();

      expect(bundles.size).toBe(0);
    });
  });

  describe("virtual folder files creation", () => {
    it("should create virtual folder files representation", () => {
      // First create some bundles
      const mockFiles: UppyFileDefault[] = [
        {
          data: new Blob(["content"]),
          id: "file1",
          isRemote: false,
          meta: { relativePath: "folder1/document.txt" },
          name: "document.txt",
          progress: {
            bytesTotal: 100,
            bytesUploaded: 0,
            uploadComplete: false,
          },
          size: 100,
          source: "test",
          type: "text/plain",
        },
      ];

      mockUppy.getFiles.mockReturnValue(mockFiles);
      bundleManager.createBundles();

      const virtualFiles = bundleManager.createVirtualFolderFiles();

      expect(virtualFiles.length).toBe(1);
      expect(virtualFiles[0].id).toBe("bundle-folder1");
      expect(virtualFiles[0].name).toBe("folder1");
      expect(virtualFiles[0].type).toBe("application/vnd.bundle+json");
      expect(virtualFiles[0].size).toBe(100);
      expect(virtualFiles[0].source).toBe("bundle-manager");
      expect(virtualFiles[0].isRemote).toBe(false);
      expect(virtualFiles[0].meta?.relativePath).toBe("folder1");
      expect(virtualFiles[0].meta?.isBundle).toBe(true);
    });

    it("should handle empty bundles", () => {
      bundleManager.createBundles(); // Creates empty bundles map
      const virtualFiles = bundleManager.createVirtualFolderFiles();
      expect(virtualFiles.length).toBe(0);
    });
  });

  describe("bundle progress tracking", () => {
    beforeEach(() => {
      // Setup bundles for testing progress
      const mockFiles: UppyFileDefault[] = [
        {
          data: new Blob(["content"]),
          id: "file1",
          isRemote: false,
          meta: { relativePath: "folder1/document.txt" },
          name: "document.txt",
          progress: {
            bytesTotal: 100,
            bytesUploaded: 0,
            uploadComplete: false,
          },
          size: 100,
          source: "test",
          type: "text/plain",
        },
      ];

      mockUppy.getFiles.mockReturnValue(mockFiles);
      bundleManager.createBundles();
    });

    it("should update bundle progress when file progresses", () => {
      bundleManager.updateBundleProgress("file1", 50);

      const bundle = bundleManager.getBundle("bundle-folder1");
      const progress = bundleManager.getBundleProgress();

      expect(progress["bundle-folder1"].bytesUploaded).toBe(50);
      expect(progress["bundle-folder1"].bytesTotal).toBe(100);
      expect(bundle?.progress).toBe(50);
    });

    it("should not exceed total bytes when updating progress", () => {
      bundleManager.updateBundleProgress("file1", 150);

      const progress = bundleManager.getBundleProgress();

      expect(progress["bundle-folder1"].bytesUploaded).toBe(100);
    });

    it("should mark bundle as uploaded", () => {
      bundleManager.markBundleAsUploaded("bundle-folder1");

      const bundle = bundleManager.getBundle("bundle-folder1");

      expect(bundle?.uploaded).toBe(true);
      expect(bundle?.progress).toBe(100);
    });
  });

  describe("bundle metadata tracking", () => {
    it("should track bundle metadata correctly", () => {
      const mockFiles: UppyFileDefault[] = [
        {
          data: new Blob(["content"]),
          id: "file1",
          isRemote: false,
          meta: { relativePath: "folder1/document.txt" },
          name: "document.txt",
          progress: {
            bytesTotal: 100,
            bytesUploaded: 0,
            uploadComplete: false,
          },
          size: 100,
          source: "test",
          type: "text/plain",
        },
      ];

      mockUppy.getFiles.mockReturnValue(mockFiles);
      const bundles = bundleManager.createBundles();

      expect(bundleManager.getBundle("bundle-folder1")).toEqual(
        bundles.get("bundle-folder1"),
      );
      expect(bundleManager.getBundles()).toEqual(bundles);
      expect(Object.keys(bundleManager.getBundleProgress()).length).toBe(1);
    });

    it("should return undefined for non-existent bundle", () => {
      expect(bundleManager.getBundle("non-existent-bundle")).toBeUndefined();
    });
  });

  describe("bundle lifecycle management", () => {
    it("should reset bundle tracking state", () => {
      const mockFiles: UppyFileDefault[] = [
        {
          data: new Blob(["content"]),
          id: "file1",
          isRemote: false,
          meta: { relativePath: "folder1/document.txt" },
          name: "document.txt",
          progress: {
            bytesTotal: 100,
            bytesUploaded: 0,
            uploadComplete: false,
          },
          size: 100,
          source: "test",
          type: "text/plain",
        },
      ];

      mockUppy.getFiles.mockReturnValue(mockFiles);
      bundleManager.createBundles();

      expect(bundleManager.getBundles().size).toBeGreaterThan(0);

      bundleManager.reset();

      expect(bundleManager.getBundles().size).toBe(0);
      expect(Object.keys(bundleManager.getBundleProgress()).length).toBe(0);
    });

    it("should handle nested folder structures", () => {
      const mockFiles: UppyFileDefault[] = [
        {
          data: new Blob(["content"]),
          id: "file1",
          isRemote: false,
          meta: { relativePath: "root/doc1.txt" },
          name: "doc1.txt",
          progress: {
            bytesTotal: 100,
            bytesUploaded: 0,
            uploadComplete: false,
          },
          size: 100,
          source: "test",
          type: "text/plain",
        },
        {
          data: new Blob(["content"]),
          id: "file2",
          isRemote: false,
          meta: { relativePath: "root/level1/doc2.txt" },
          name: "doc2.txt",
          progress: {
            bytesTotal: 200,
            bytesUploaded: 0,
            uploadComplete: false,
          },
          size: 200,
          source: "test",
          type: "text/plain",
        },
        {
          data: new Blob(["content"]),
          id: "file3",
          isRemote: false,
          meta: { relativePath: "root/level1/level2/doc3.txt" },
          name: "doc3.txt",
          progress: {
            bytesTotal: 300,
            bytesUploaded: 0,
            uploadComplete: false,
          },
          size: 300,
          source: "test",
          type: "text/plain",
        },
      ];

      mockUppy.getFiles.mockReturnValue(mockFiles);
      const bundles = bundleManager.createBundles();

      expect(bundles.size).toBe(3);

      const rootBundle = bundles.get("bundle-root");
      expect(rootBundle).toBeDefined();
      expect(rootBundle?.parentId).toBeNull();

      const level1Bundle = bundles.get("bundle-root-level1");
      expect(level1Bundle).toBeDefined();
      expect(level1Bundle?.parentId).toBe("bundle-root");

      const level2Bundle = bundles.get("bundle-root-level1-level2");
      expect(level2Bundle).toBeDefined();
      expect(level2Bundle?.parentId).toBe("bundle-root-level1");
    });
  });

  describe("edge cases", () => {
    it("should handle mixed file types in the same folder", () => {
      const mockFiles: UppyFileDefault[] = [
        {
          data: new Blob(["content"]),
          id: "file1",
          isRemote: false,
          meta: { relativePath: "mixed/documents/document.txt" },
          name: "document.txt",
          progress: {
            bytesTotal: 100,
            bytesUploaded: 0,
            uploadComplete: false,
          },
          size: 100,
          source: "test",
          type: "text/plain",
        },
        {
          data: new Blob(["image content"]),
          id: "file2",
          isRemote: false,
          meta: { relativePath: "mixed/documents/image.jpg" },
          name: "image.jpg",
          progress: {
            bytesTotal: 500,
            bytesUploaded: 0,
            uploadComplete: false,
          },
          size: 500,
          source: "test",
          type: "image/jpeg",
        },
        {
          data: new Blob(["video content"]),
          id: "file3",
          isRemote: false,
          meta: { relativePath: "mixed/documents/video.mp4" },
          name: "video.mp4",
          progress: {
            bytesTotal: 1000,
            bytesUploaded: 0,
            uploadComplete: false,
          },
          size: 1000,
          source: "test",
          type: "video/mp4",
        },
      ];

      mockUppy.getFiles.mockReturnValue(mockFiles);
      const bundles = bundleManager.createBundles();

      expect(bundles.size).toBe(1);

      const bundle = bundles.get("bundle-mixed-documents");
      expect(bundle).toBeDefined();
      expect(bundle?.fileIds).toEqual(["file1", "file2", "file3"]);

      const progress = bundleManager.getBundleProgress();
      expect(progress["bundle-mixed-documents"].bytesTotal).toBe(1600);
    });

    it("should handle files with similar folder names", () => {
      const mockFiles: UppyFileDefault[] = [
        {
          data: new Blob(["content"]),
          id: "file1",
          isRemote: false,
          meta: { relativePath: "folder/doc.txt" },
          name: "doc.txt",
          progress: {
            bytesTotal: 100,
            bytesUploaded: 0,
            uploadComplete: false,
          },
          size: 100,
          source: "test",
          type: "text/plain",
        },
        {
          data: new Blob(["content"]),
          id: "file2",
          isRemote: false,
          meta: { relativePath: "folder-test/doc.txt" },
          name: "doc.txt",
          progress: {
            bytesTotal: 100,
            bytesUploaded: 0,
            uploadComplete: false,
          },
          size: 100,
          source: "test",
          type: "text/plain",
        },
      ];

      mockUppy.getFiles.mockReturnValue(mockFiles);
      const bundles = bundleManager.createBundles();

      expect(bundles.size).toBe(2);

      const bundle1 = bundles.get("bundle-folder");
      const bundle2 = bundles.get("bundle-folder-test");

      expect(bundle1).toBeDefined();
      expect(bundle2).toBeDefined();
      expect(bundle1?.fileIds).toEqual(["file1"]);
      expect(bundle2?.fileIds).toEqual(["file2"]);
    });

    it("should handle progress updates for non-existent bundles", () => {
      // This should not throw an error
      expect(() => {
        bundleManager.updateBundleProgress("non-existent-file", 100);
      }).not.toThrow();

      // Progress tracking should remain empty
      expect(Object.keys(bundleManager.getBundleProgress()).length).toBe(0);
    });
  });
});
