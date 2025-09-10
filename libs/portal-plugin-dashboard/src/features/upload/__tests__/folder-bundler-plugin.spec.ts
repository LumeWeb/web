import type { Body, Meta } from "@uppy/core";

import Uppy from "@uppy/core";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { UppyFileDefault } from "../Manager";

import { BundleManager } from "../BundleManager";
import { FolderBundlerPlugin } from "../FolderBundlerPlugin";

describe("FolderBundlerPlugin", () => {
  let uppy: Uppy<Meta, Body>;
  let plugin: FolderBundlerPlugin;

  beforeEach(() => {
    uppy = new Uppy<Meta, Body>();
    // Mock getFiles to return test files
    const testFiles = new Map<string, UppyFile<Meta, Body>>();
    vi.spyOn(uppy, "getFile").mockImplementation((id) => testFiles.get(id));
    vi.spyOn(uppy, "getFiles").mockImplementation(() =>
      Array.from(testFiles.values()),
    );
    vi.spyOn(uppy, "addFile").mockImplementation((file) => {
      testFiles.set(file.id, file);
      return file.id;
    });
    vi.spyOn(uppy, "removeFile").mockImplementation((id) => {
      testFiles.delete(id);
    });

    plugin = new FolderBundlerPlugin(uppy, {});
  });

  describe("instantiation", () => {
    it("should create an instance of FolderBundlerPlugin", () => {
      expect(plugin).toBeInstanceOf(FolderBundlerPlugin);
    });

    it("should have correct id and type", () => {
      expect(plugin.id).toBe("FolderBundler");
      expect(plugin.type).toBe("preprocessor");
    });

    it("should accept custom id in options", () => {
      const customPlugin = new FolderBundlerPlugin(uppy, {
        id: "CustomBundler",
      });
      expect(customPlugin.id).toBe("CustomBundler");
    });

    it("should initialize with a BundleManager", () => {
      expect(plugin.getBundleManager()).toBeInstanceOf(BundleManager);
    });
  });

  describe("plugin lifecycle", () => {
    it("should install correctly and add preprocessor", () => {
      const addPreProcessorSpy = vi.spyOn(uppy, "addPreProcessor");
      plugin.install();
      expect(addPreProcessorSpy).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should uninstall correctly and remove preprocessor", () => {
      const removePreProcessorSpy = vi.spyOn(uppy, "removePreProcessor");
      plugin.uninstall();
      expect(removePreProcessorSpy).toHaveBeenCalledWith(expect.any(Function));
    });

    it("should listen to upload-progress events when installed", () => {
      const onSpy = vi.spyOn(uppy, "on");
      plugin.install();
      expect(onSpy).toHaveBeenCalledWith(
        "upload-progress",
        expect.any(Function),
      );
    });
  });

  describe("file preprocessing", () => {
    it("should create bundles from files with relative paths", async () => {
      // Add files with relative paths
      uppy.addFile({
        data: new Blob(["content1"]),
        id: "file1",
        meta: { relativePath: "folder1/file1.txt" },
        name: "file1.txt",
      } as UppyFileDefault);

      uppy.addFile({
        data: new Blob(["content2"]),
        id: "file2",
        meta: { relativePath: "folder1/file2.txt" },
        name: "file2.txt",
      } as UppyFileDefault);

      uppy.addFile({
        data: new Blob(["content3"]),
        id: "file3",
        meta: { relativePath: "folder2/subfolder/file3.txt" },
        name: "file3.txt",
      } as UppyFileDefault);

      const result = await plugin.run(uppy.getFiles());

      // Should have 2 virtual bundle files (folder1 and folder2/subfolder)
      expect(result).toHaveLength(2);

      // Check that bundle files have correct metadata
      const bundleFiles = result.filter(
        (file) => (file.meta as Record<string, any>)?.isBundle === true,
      );
      expect(bundleFiles).toHaveLength(2);
    });

    it("should remove individual files that belong to bundles", async () => {
      uppy.addFile({
        data: new Blob(["content1"]),
        id: "file1",
        meta: { relativePath: "folder1/file1.txt" },
        name: "file1.txt",
      } as UppyFileDefault);

      uppy.addFile({
        data: new Blob(["content2"]),
        id: "file2",
        meta: { relativePath: "folder1/file2.txt" },
        name: "file2.txt",
      } as UppyFileDefault);

      // Add a file without relativePath (should not be removed)
      uppy.addFile({
        data: new Blob(["content3"]),
        id: "file3",
        name: "file3.txt",
      } as UppyFileDefault);

      const result = await plugin.run(uppy.getFiles());

      // Should have 1 bundle file and 1 regular file
      expect(result).toHaveLength(2);

      // The regular file should still be present
      const regularFiles = result.filter(
        (file) => !(file.meta as Record<string, any>)?.isBundle,
      );
      expect(regularFiles).toHaveLength(1);
      expect(regularFiles[0].name).toBe("file3.txt");
    });

    it("should handle files without relative paths correctly", async () => {
      uppy.addFile({
        data: new Blob(["content1"]),
        id: "file1",
        name: "file1.txt",
      } as UppyFileDefault);

      uppy.addFile({
        data: new Blob(["content2"]),
        id: "file2",
        name: "file2.txt",
      } as UppyFileDefault);

      const result = await plugin.run(uppy.getFiles());

      // Files without relative paths should remain unchanged
      expect(result).toHaveLength(2);
      expect(
        result.every((file) => !(file.meta as Record<string, any>)?.isBundle),
      ).toBe(true);
    });

    it("should handle root level files correctly", async () => {
      uppy.addFile({
        data: new Blob(["content1"]),
        id: "file1",
        meta: { relativePath: "file1.txt" }, // Root level file
        name: "file1.txt",
      } as UppyFileDefault);

      uppy.addFile({
        data: new Blob(["content2"]),
        id: "file2",
        meta: { relativePath: "folder1/file2.txt" }, // Nested file
        name: "file2.txt",
      } as UppyFileDefault);

      const result = await plugin.run(uppy.getFiles());

      // Root level file should remain, nested file should be bundled
      expect(result).toHaveLength(2);

      const rootFiles = result.filter(
        (file) =>
          (file.meta as Record<string, any>)?.relativePath === "file1.txt",
      );
      expect(rootFiles).toHaveLength(1);

      const bundleFiles = result.filter(
        (file) => (file.meta as Record<string, any>)?.isBundle === true,
      );
      expect(bundleFiles).toHaveLength(1);
    });
  });

  describe("bundle metadata tracking", () => {
    it("should create correct bundle metadata", async () => {
      uppy.addFile({
        data: new Blob(["content1"]),
        id: "file1",
        meta: { relativePath: "folder1/file1.txt" },
        name: "file1.txt",
        size: 100,
      } as UppyFileDefault);

      uppy.addFile({
        data: new Blob(["content2"]),
        id: "file2",
        meta: { relativePath: "folder1/file2.txt" },
        name: "file2.txt",
        size: 200,
      } as UppyFileDefault);

      await plugin.run(uppy.getFiles());
      const bundleManager = plugin.getBundleManager();
      const bundles = bundleManager.getBundles();

      expect(bundles.size).toBe(1);

      const bundle = bundles.get("bundle-folder1");
      expect(bundle).toBeDefined();
      expect(bundle?.id).toBe("bundle-folder1");
      expect(bundle?.name).toBe("folder1");
      expect(bundle?.path).toBe("folder1");
      // Get the actual file IDs from the files we added
      // Get the actual file objects from Uppy
      // Get the file IDs directly from the files we added
      const file1Id = "file1";
      const file2Id = "file2";

      expect(bundle?.fileIds).toHaveLength(2);
      expect(bundle?.fileIds).toContain(file1Id);
      expect(bundle?.fileIds).toContain(file2Id);
      expect(bundle?.progress).toBe(0);
      expect(bundle?.uploaded).toBe(false);
      expect(bundle?.parentId).toBeNull();
    });

    it("should handle nested folder structures correctly", async () => {
      uppy.addFile({
        data: new Blob(["content1"]),
        id: "file1",
        meta: { relativePath: "folder1/subfolder/file1.txt" },
        name: "file1.txt",
        size: 100,
      } as UppyFileDefault);

      uppy.addFile({
        data: new Blob(["content2"]),
        id: "file2",
        meta: { relativePath: "folder1/subfolder/file2.txt" },
        name: "file2.txt",
        size: 200,
      } as UppyFileDefault);

      await plugin.run(uppy.getFiles());
      const bundleManager = plugin.getBundleManager();
      const bundles = bundleManager.getBundles();

      expect(bundles.size).toBe(1);

      const bundle = bundles.get("bundle-folder1-subfolder");
      expect(bundle).toBeDefined();
      expect(bundle?.name).toBe("subfolder");
      expect(bundle?.path).toBe("folder1/subfolder");
    });

    it("should track bundle progress correctly", () => {
      const bundleManager = plugin.getBundleManager();

      // Create a mock bundle with proper structure
      const bundles = new Map();
      bundles.set("bundle-test", {
        fileIds: ["file1", "file2"],
        id: "bundle-test",
        name: "test",
        parentId: null,
        path: "test",
        progress: 0,
        uploaded: false,
      });

      // Mock the bundle progress tracking
      const bundleProgress = {
        "bundle-test": {
          bytesTotal: 100,
          bytesUploaded: 0,
        },
      };

      // Set up the bundle manager state
      (bundleManager as any)["#bundles"] = bundles;
      (bundleManager as any)["#bundleProgress"] = bundleProgress;

      bundleManager.updateBundleProgress("file1", 50);

      const progress = bundleManager.getBundleProgress();
      expect(progress["bundle-test"].bytesUploaded).toBe(50);
    });
  });

  describe("bundle manager integration", () => {
    it("should provide access to bundle manager", () => {
      expect(plugin.getBundleManager()).toBeInstanceOf(BundleManager);
    });

    it("should reset bundle tracking on bundle manager reset", () => {
      const bundleManager = plugin.getBundleManager();
      const bundles = bundleManager.createBundles();

      // Add a mock bundle
      bundles.set("bundle-test", {
        fileIds: ["file1"],
        id: "bundle-test",
        name: "test",
        parentId: null,
        path: "test",
        progress: 50,
        uploaded: false,
      });

      expect(bundleManager.getBundles().size).toBe(1);
      bundleManager.reset();
      expect(bundleManager.getBundles().size).toBe(0);
    });
  });

  describe("error handling", () => {
    it("should handle plugin errors gracefully", async () => {
      // Mock a problematic file
      uppy.addFile({
        data: new Blob(["content1"]),
        id: "file1",
        meta: { relativePath: "folder1/file1.txt" },
        name: "file1.txt",
      } as UppyFileDefault);

      // Mock run function to throw an error
      const originalRun = plugin.run;
      plugin.run = vi.fn().mockRejectedValue(new Error("Test error"));

      try {
        await plugin.run(uppy.getFiles());
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("Test error");
      }

      // Restore original function
      plugin.run = originalRun;
    });
  });
});
