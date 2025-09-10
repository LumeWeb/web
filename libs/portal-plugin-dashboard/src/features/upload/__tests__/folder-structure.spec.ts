import { beforeEach, describe, expect, it, vi } from "vitest";

import type { UploadManagerConfig } from "@/types/upload";

import type { UppyFileDefault } from "../Manager";

import { BundleManager } from "../BundleManager";
import { Manager } from "../Manager";

// Mock Uppy core
vi.mock("@uppy/core", async () => {
  const actual = await vi.importActual("@uppy/core");
  return {
    ...actual,
    default: vi.fn().mockImplementation(() => {
      let files: any[] = [];
      return {
        addFile: vi.fn((file) => {
          files.push(file);
        }),
        cancelAll: vi.fn(() => {
          files = [];
        }),
        emit: vi.fn(),
        getFiles: vi.fn(() => files),
        iteratePlugins: vi.fn(),
        off: vi.fn(),
        on: vi.fn(),
        patchFilesState: vi.fn(),
        removeFile: vi.fn((id) => {
          files = files.filter((file) => file.id !== id);
        }),
        upload: vi.fn(() => Promise.resolve({ failed: [], successful: files })),
        use: vi.fn(),
      };
    }),
  };
});

// Mock other dependencies
vi.mock("@lib/helpers", () => ({
  LARGE_PLUGIN_SUFFIX: "-large",
  SMALL_PLUGIN_SUFFIX: "-small",
  UppyPlugin: vi.fn(),
}));

vi.mock("@lumeweb/portal-sdk", () => ({
  Sdk: vi.fn(),
}));

describe("Folder Structure Analysis Utilities", () => {
  let uploadManager: Manager;
  let bundleManager: BundleManager;
  const mockConfig: UploadManagerConfig = {
    type: "main",
  };

  beforeEach(() => {
    uploadManager = new Manager(mockConfig);
    bundleManager = new BundleManager({ uppy: uploadManager.getUppy() });
    vi.clearAllMocks();
  });

  describe("getFolderStructure()", () => {
    it("should return empty object when no files have relative paths", () => {
      // Mock files without relative paths
      const mockFiles = [
        { id: "1", meta: {}, name: "file1.txt" },
        { id: "2", meta: {}, name: "file2.jpg" },
      ];

      vi.spyOn(bundleManager, "getFiles").mockReturnValue(
        mockFiles as UppyFileDefault[],
      );

      const structure = bundleManager.getFolderStructure();
      expect(structure).toEqual({});
    });

    it("should build correct folder hierarchy for nested folders", () => {
      const mockFiles = [
        {
          id: "1",
          meta: { relativePath: "folder1/file1.txt" },
          name: "file1.txt",
        },
        {
          id: "2",
          meta: { relativePath: "folder1/subfolder1/file2.txt" },
          name: "file2.txt",
        },
        {
          id: "3",
          meta: { relativePath: "folder1/subfolder1/subfolder2/file3.txt" },
          name: "file3.txt",
        },
        {
          id: "4",
          meta: { relativePath: "folder2/file4.txt" },
          name: "file4.txt",
        },
      ];

      vi.spyOn(bundleManager, "getFiles").mockReturnValue(
        mockFiles as UppyFileDefault[],
      );

      const structure = bundleManager.getFolderStructure();
      expect(structure).toEqual({
        folder1: {
          subfolder1: {
            subfolder2: {},
          },
        },
        folder2: {},
      });
    });

    it("should handle files in root directory correctly", () => {
      const mockFiles = [
        { id: "1", meta: { relativePath: "file1.txt" }, name: "file1.txt" },
        {
          id: "2",
          meta: { relativePath: "folder1/file2.txt" },
          name: "file2.txt",
        },
      ];

      vi.spyOn(bundleManager, "getFiles").mockReturnValue(
        mockFiles as UppyFileDefault[],
      );

      const structure = bundleManager.getFolderStructure();
      expect(structure).toEqual({
        folder1: {},
      });
    });

    it("should handle empty folder names gracefully", () => {
      const mockFiles = [
        { id: "1", meta: { relativePath: "/file1.txt" }, name: "file1.txt" },
        {
          id: "2",
          meta: { relativePath: "folder1//file2.txt" },
          name: "file2.txt",
        },
      ];

      vi.spyOn(bundleManager, "getFiles").mockReturnValue(
        mockFiles as UppyFileDefault[],
      );

      const structure = bundleManager.getFolderStructure();
      expect(structure).toEqual({
        folder1: {},
      });
    });

    it("should handle deeply nested folder structures", () => {
      const mockFiles = [
        {
          id: "1",
          meta: { relativePath: "a/b/c/d/e/file.txt" },
          name: "file.txt",
        },
      ];

      vi.spyOn(bundleManager, "getFiles").mockReturnValue(
        mockFiles as UppyFileDefault[],
      );

      const structure = bundleManager.getFolderStructure();
      expect(structure).toEqual({
        a: {
          b: {
            c: {
              d: {
                e: {},
              },
            },
          },
        },
      });
    });
  });

  describe("getParentFolderName()", () => {
    it("should return null for files without relative paths", () => {
      const mockFile = {
        id: "1",
        meta: {},
        name: "file1.txt",
      } as UppyFileDefault;
      const parentFolder = bundleManager.getParentFolderName(mockFile);
      expect(parentFolder).toBeNull();
    });

    it("should return null for files in root directory", () => {
      const mockFile = {
        id: "1",
        meta: { relativePath: "file1.txt" },
        name: "file1.txt",
      } as UppyFileDefault;
      const parentFolder = bundleManager.getParentFolderName(mockFile);
      expect(parentFolder).toBeNull();
    });

    it("should return correct parent folder name for files in subfolders", () => {
      const mockFile = {
        id: "1",
        meta: { relativePath: "folder1/subfolder1/file1.txt" },
        name: "file1.txt",
      } as UppyFileDefault;
      const parentFolder = bundleManager.getParentFolderName(mockFile);
      expect(parentFolder).toBe("subfolder1");
    });

    it("should return correct parent folder name for deeply nested files", () => {
      const mockFile = {
        id: "1",
        meta: { relativePath: "a/b/c/d/file.txt" },
        name: "file.txt",
      } as UppyFileDefault;
      const parentFolder = bundleManager.getParentFolderName(mockFile);
      expect(parentFolder).toBe("d");
    });

    it("should handle folder names with special characters", () => {
      const mockFile = {
        id: "1",
        meta: { relativePath: "folder with spaces/sub-folder_1/file.txt" },
        name: "file.txt",
      } as UppyFileDefault;
      const parentFolder = bundleManager.getParentFolderName(mockFile);
      expect(parentFolder).toBe("sub-folder_1");
    });
  });

  describe("getRootFolders()", () => {
    it("should return empty array when no files have relative paths", () => {
      const mockFiles = [
        { id: "1", meta: {}, name: "file1.txt" },
        { id: "2", meta: {}, name: "file2.jpg" },
      ];

      vi.spyOn(bundleManager, "getFiles").mockReturnValue(
        mockFiles as UppyFileDefault[],
      );

      const rootFolders = bundleManager.getRootFolders();
      expect(rootFolders).toEqual([]);
    });

    it("should identify root folders correctly", () => {
      const mockFiles = [
        {
          id: "1",
          meta: { relativePath: "documents/file1.txt" },
          name: "file1.txt",
        },
        {
          id: "2",
          meta: { relativePath: "images/photo.jpg" },
          name: "file2.txt",
        },
        {
          id: "3",
          meta: { relativePath: "documents/subfolder/file3.txt" },
          name: "file3.txt",
        },
        {
          id: "4",
          meta: { relativePath: "videos/movie.mp4" },
          name: "file4.txt",
        },
      ];

      vi.spyOn(bundleManager, "getFiles").mockReturnValue(
        mockFiles as UppyFileDefault[],
      );

      const rootFolders = bundleManager.getRootFolders();
      expect(rootFolders).toEqual(
        expect.arrayContaining(["documents", "images", "videos"]),
      );
      expect(rootFolders).toHaveLength(3);
    });

    it("should return unique root folder names only", () => {
      const mockFiles = [
        {
          id: "1",
          meta: { relativePath: "documents/file1.txt" },
          name: "file1.txt",
        },
        {
          id: "2",
          meta: { relativePath: "documents/file2.txt" },
          name: "file2.txt",
        },
        {
          id: "3",
          meta: { relativePath: "images/photo.jpg" },
          name: "file3.txt",
        },
      ];

      vi.spyOn(bundleManager, "getFiles").mockReturnValue(
        mockFiles as UppyFileDefault[],
      );

      const rootFolders = bundleManager.getRootFolders();
      expect(rootFolders).toEqual(
        expect.arrayContaining(["documents", "images"]),
      );
      expect(rootFolders).toHaveLength(2);
    });

    it("should handle files in root directory correctly", () => {
      const mockFiles = [
        { id: "1", meta: { relativePath: "file1.txt" }, name: "file1.txt" },
        {
          id: "2",
          meta: { relativePath: "folder1/file2.txt" },
          name: "file2.txt",
        },
      ];

      vi.spyOn(bundleManager, "getFiles").mockReturnValue(
        mockFiles as UppyFileDefault[],
      );

      const rootFolders = bundleManager.getRootFolders();
      expect(rootFolders).toEqual(["folder1"]);
    });
  });

  describe("groupFilesByFolder()", () => {
    it("should group files without relative paths under 'root' key", () => {
      const mockFiles = [
        { id: "1", meta: {}, name: "file1.txt" },
        { id: "2", meta: {}, name: "file2.jpg" },
      ];

      vi.spyOn(bundleManager, "getFiles").mockReturnValue(
        mockFiles as UppyFileDefault[],
      );

      const groupedFiles = bundleManager.groupFilesByFolder();
      expect(groupedFiles).toHaveProperty("root");
      expect(groupedFiles.root).toHaveLength(2);
      expect(groupedFiles.root[0].id).toBe("1");
      expect(groupedFiles.root[1].id).toBe("2");
    });

    it("should group root files under 'root' key", () => {
      const mockFiles = [
        { id: "1", meta: { relativePath: "file1.txt" }, name: "file1.txt" },
        { id: "2", meta: { relativePath: "file2.jpg" }, name: "file2.jpg" },
      ];

      vi.spyOn(bundleManager, "getFiles").mockReturnValue(
        mockFiles as UppyFileDefault[],
      );

      const groupedFiles = bundleManager.groupFilesByFolder();
      expect(groupedFiles).toHaveProperty("root");
      expect(groupedFiles.root).toHaveLength(2);
    });

    it("should correctly group files by their folder paths", () => {
      const mockFiles = [
        {
          id: "1",
          meta: { relativePath: "documents/file1.txt" },
          name: "file1.txt",
        },
        {
          id: "2",
          meta: { relativePath: "documents/file2.txt" },
          name: "file2.txt",
        },
        {
          id: "3",
          meta: { relativePath: "images/photo.jpg" },
          name: "file3.txt",
        },
        {
          id: "4",
          meta: { relativePath: "documents/subfolder/file3.txt" },
          name: "file4.txt",
        },
      ];

      vi.spyOn(bundleManager, "getFiles").mockReturnValue(
        mockFiles as UppyFileDefault[],
      );

      const groupedFiles = bundleManager.groupFilesByFolder();
      expect(groupedFiles).toHaveProperty("root");
      expect(groupedFiles).toHaveProperty("documents");
      expect(groupedFiles).toHaveProperty("documents/subfolder");

      expect(groupedFiles.documents).toHaveLength(2);
      expect(groupedFiles["documents/subfolder"]).toHaveLength(1);

      // Root files (none in this case)
      expect(groupedFiles.root).toHaveLength(0);
    });

    it("should handle mixed scenarios with root and nested files", () => {
      const mockFiles = [
        {
          id: "1",
          meta: { relativePath: "rootFile.txt" },
          name: "rootFile.txt",
        },
        {
          id: "2",
          meta: { relativePath: "folder1/file1.txt" },
          name: "file1.txt",
        },
        {
          id: "3",
          meta: { relativePath: "folder1/subfolder/file2.txt" },
          name: "file2.txt",
        },
        { id: "4", meta: {}, name: "file3.txt" }, // No relative path
      ];

      vi.spyOn(bundleManager, "getFiles").mockReturnValue(
        mockFiles as UppyFileDefault[],
      );

      const groupedFiles = bundleManager.groupFilesByFolder();
      expect(groupedFiles.root).toHaveLength(2); // rootFile.txt and file with no relativePath
      expect(groupedFiles.folder1).toHaveLength(1);
      expect(groupedFiles["folder1/subfolder"]).toHaveLength(1);
    });

    it("should handle empty folder names in paths", () => {
      const mockFiles = [
        {
          id: "1",
          meta: { relativePath: "folder1//file1.txt" },
          name: "file1.txt",
        },
        { id: "2", meta: { relativePath: "/file2.txt" }, name: "file2.txt" },
      ];

      vi.spyOn(bundleManager, "getFiles").mockReturnValue(
        mockFiles as UppyFileDefault[],
      );

      const groupedFiles = bundleManager.groupFilesByFolder();
      expect(groupedFiles).toHaveProperty("root");
      expect(groupedFiles.root).toHaveLength(1); // file2.txt in root
      expect(groupedFiles.folder1).toHaveLength(1); // file1.txt in folder1
    });
  });
});
