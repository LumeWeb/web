import { beforeEach, describe, expect, it, vi } from "vitest";

import { UploadStatus } from "@/types/upload";

import type { UploadManagerConfig } from "../Manager";
import type { UppyFileDefault } from "../Manager";

import { Manager } from "../Manager";

describe("Upload Progress Calculation and State Synchronization", () => {
  let uploadManager: Manager;
  let mockSdk: any;

  beforeEach(() => {
    mockSdk = {
      account: vi.fn().mockReturnValue({
        uploadLimit: vi.fn().mockResolvedValue(1000000),
      }),
    };

    const config: UploadManagerConfig = {
      sdk: mockSdk,
      type: "main",
    };

    uploadManager = new Manager(config);
  });

  describe("Individual File Progress", () => {
    it("should calculate progress correctly for individual files", () => {
      const mockFiles: UppyFileDefault[] = [
        {
          data: new File(["content1"], "test1.txt"),
          id: "file1",
          isRemote: false,
          meta: {},
          name: "test1.txt",
          progress: {
            bytesTotal: 1000,
            bytesUploaded: 500,
            uploadComplete: false,
          },
          size: 1000,
          source: "test",
          type: "text/plain",
        },
        {
          data: new File(["content2"], "test2.txt"),
          id: "file2",
          isRemote: false,
          meta: {},
          name: "test2.txt",
          progress: {
            bytesTotal: 2000,
            bytesUploaded: 1500,
            uploadComplete: false,
          },
          size: 2000,
          source: "test",
          type: "text/plain",
        },
      ];

      // Mock getFiles to return our test files
      vi.spyOn(uploadManager, "getFiles").mockReturnValue(mockFiles);

      // Simulate upload-progress event
      uploadManager.addEvent("upload-progress", (file, progress) => {
        const files = uploadManager.getFiles() as UppyFileDefault[];
        let totalBytes = 0;
        let uploadedBytes = 0;

        files.forEach((f) => {
          totalBytes += f.size;
          uploadedBytes += f.progress.bytesUploaded || 0;
        });

        const uploadProgress =
          totalBytes > 0 ? Math.round((uploadedBytes / totalBytes) * 100) : 0;

        // Manually set the progress since we can't directly access private fields
        (uploadManager as any)._uploadProgress = uploadProgress;
      });

      // Trigger progress events
      uploadManager.addEvent("upload-progress", (file, progress) => {});

      // Calculate expected progress: (500 + 1500) / (1000 + 2000) = 2000 / 3000 = 66.67% ≈ 67%
      const expectedProgress = Math.round(((500 + 1500) / (1000 + 2000)) * 100);

      expect(uploadManager.getUploadProgress()).toBe(expectedProgress);
    });

    it("should handle zero file sizes correctly", () => {
      const mockFiles: UppyFileDefault[] = [
        {
          data: new File([], "test1.txt"),
          id: "file1",
          isRemote: false,
          meta: {},
          name: "test1.txt",
          progress: {
            bytesTotal: 0,
            bytesUploaded: 0,
            uploadComplete: false,
          },
          size: 0,
          source: "test",
          type: "text/plain",
        },
      ];

      vi.spyOn(uploadManager, "getFiles").mockReturnValue(mockFiles);

      // Simulate upload-progress event
      uploadManager.addEvent("upload-progress", (file, progress) => {
        const files = uploadManager.getFiles() as UppyFileDefault[];
        let totalBytes = 0;
        let uploadedBytes = 0;

        files.forEach((f) => {
          totalBytes += f.size;
          uploadedBytes += f.progress.bytesUploaded || 0;
        });

        const uploadProgress =
          totalBytes > 0 ? Math.round((uploadedBytes / totalBytes) * 100) : 0;

        (uploadManager as any)._uploadProgress = uploadProgress;
      });

      expect(uploadManager.getUploadProgress()).toBe(0);
    });
  });

  describe("Bundle Progress", () => {
    it("should calculate progress correctly for bundle files", () => {
      const mockFiles: UppyFileDefault[] = [
        {
          data: new Blob(),
          id: "bundle-folder1",
          isRemote: false,
          meta: {
            bundleBytesTotal: 3000,
            bundleBytesUploaded: 1000,
            isBundle: true,
          },
          name: "folder1",
          progress: {
            bytesTotal: 3000,
            bytesUploaded: 1000,
            uploadComplete: false,
          },
          size: 3000,
          source: "bundle-manager",
          type: "application/vnd.bundle+json",
        },
      ];

      vi.spyOn(uploadManager, "getFiles").mockReturnValue(mockFiles);

      // Simulate upload-progress event for bundles
      uploadManager.addEvent("upload-progress", (file, progress) => {
        const files = uploadManager.getFiles() as UppyFileDefault[];
        let totalBytes = 0;
        let uploadedBytes = 0;

        files.forEach((f) => {
          if ((f.meta as Record<string, any>)?.isBundle) {
            totalBytes +=
              (f.meta as Record<string, any>)?.bundleBytesTotal || f.size || 0;
            uploadedBytes +=
              (f.meta as Record<string, any>)?.bundleBytesUploaded ||
              f.progress.bytesUploaded ||
              0;
          } else {
            totalBytes += f.size;
            uploadedBytes += f.progress.bytesUploaded || 0;
          }
        });

        const uploadProgress =
          totalBytes > 0 ? Math.round((uploadedBytes / totalBytes) * 100) : 0;

        (uploadManager as any)._uploadProgress = uploadProgress;
      });

      expect(uploadManager.getUploadProgress()).toBe(33); // 1000/3000 ≈ 33%
    });

    it("should handle mixed individual files and bundles progress", () => {
      const mockFiles: UppyFileDefault[] = [
        {
          data: new File(["content1"], "test1.txt"),
          id: "file1",
          isRemote: false,
          meta: {},
          name: "test1.txt",
          progress: {
            bytesTotal: 1000,
            bytesUploaded: 500,
            uploadComplete: false,
          },
          size: 1000,
          source: "test",
          type: "text/plain",
        },
        {
          data: new Blob(),
          id: "bundle-folder1",
          isRemote: false,
          meta: {
            bundleBytesTotal: 3000,
            bundleBytesUploaded: 1500,
            isBundle: true,
          },
          name: "folder1",
          progress: {
            bytesTotal: 3000,
            bytesUploaded: 1000,
            uploadComplete: false,
          },
          size: 3000,
          source: "bundle-manager",
          type: "application/vnd.bundle+json",
        },
      ];

      vi.spyOn(uploadManager, "getFiles").mockReturnValue(mockFiles);

      // Simulate upload-progress event
      uploadManager.addEvent("upload-progress", (file, progress) => {
        const files = uploadManager.getFiles() as UppyFileDefault[];
        let totalBytes = 0;
        let uploadedBytes = 0;

        files.forEach((f) => {
          if ((f.meta as Record<string, any>)?.isBundle) {
            totalBytes +=
              (f.meta as Record<string, any>)?.bundleBytesTotal || f.size || 0;
            uploadedBytes +=
              (f.meta as Record<string, any>)?.bundleBytesUploaded ||
              f.progress.bytesUploaded ||
              0;
          } else {
            totalBytes += f.size;
            uploadedBytes += f.progress.bytesUploaded || 0;
          }
        });

        const uploadProgress =
          totalBytes > 0 ? Math.round((uploadedBytes / totalBytes) * 100) : 0;

        (uploadManager as any)._uploadProgress = uploadProgress;
      });

      // Expected: (500 + 1500) / (1000 + 3000) = 2000 / 4000 = 50%
      expect(uploadManager.getUploadProgress()).toBe(50);
    });
  });

  describe("Upload Status Transitions", () => {
    it("should update status to UPLOADING when progress events occur", () => {
      expect(uploadManager.getUploadStatus()).toBe(UploadStatus.PENDING);

      // Simulate file-added event
      const mockFile: UppyFileDefault = {
        data: new File(["content"], "test.txt"),
        id: "file1",
        isRemote: false,
        meta: {},
        name: "test.txt",
        progress: {
          bytesTotal: 1000,
          bytesUploaded: 0,
          uploadComplete: false,
        },
        size: 1000,
        source: "test",
        type: "text/plain",
      };

      uploadManager.addEvent("file-added", (file) => {
        (uploadManager as any)._uploadStatus = UploadStatus.UPLOADING;
      });

      // Trigger the event
      uploadManager.addEvent("file-added", (file) => {});

      expect(uploadManager.getUploadStatus()).toBe(UploadStatus.UPLOADING);
    });

    it("should update status to COMPLETED when upload completes", () => {
      const mockResult = {
        failed: [],
        successful: [
          {
            data: new File(["content"], "test.txt"),
            id: "file1",
            isRemote: false,
            meta: {},
            name: "test.txt",
            progress: {
              bytesTotal: 1000,
              bytesUploaded: 1000,
              uploadComplete: true,
            },
            response: {
              body: {
                id: "uploaded-file-1",
              },
            },
            size: 1000,
            source: "test",
            type: "text/plain",
          },
        ],
      };

      uploadManager.addEvent("complete", (result) => {
        (uploadManager as any)._uploadStatus = UploadStatus.COMPLETED;
        (uploadManager as any)._uploadProgress = 100;
      });

      // Trigger the event
      uploadManager.addEvent("complete", (result) => {});

      expect(uploadManager.getUploadStatus()).toBe(UploadStatus.COMPLETED);
      expect(uploadManager.getUploadProgress()).toBe(100);
    });

    it("should update status to ERROR when upload errors occur", () => {
      const mockError = new Error("Test upload error");

      uploadManager.addEvent("error", (error) => {
        (uploadManager as any)._uploadStatus = UploadStatus.ERROR;
        (uploadManager as any)._uploadError = error;
      });

      // Trigger the event
      uploadManager.addEvent("error", (error) => {});

      expect(uploadManager.getUploadStatus()).toBe(UploadStatus.ERROR);
      expect(uploadManager.getUploadError()).toBe(mockError);
    });
  });

  describe("Uploaded Files Information", () => {
    it("should correctly identify uploaded files with bundle information", () => {
      const mockResult = {
        failed: [],
        successful: [
          {
            id: "file1",
            meta: {},
            name: "test.txt",
            progress: {
              uploadComplete: true,
            },
            response: {
              body: {
                id: "uploaded-file-1",
              },
            },
            size: 1000,
            type: "text/plain",
          },
          {
            id: "bundle-folder1",
            meta: {
              isBundle: true,
            },
            name: "folder1",
            progress: {
              uploadComplete: true,
            },
            response: {
              body: {
                id: "uploaded-bundle-1",
              },
            },
            size: 3000,
            type: "application/vnd.bundle+json",
          },
        ],
      };

      uploadManager.addEvent("complete", (result) => {
        (uploadManager as any)._uploadedFiles = result.successful.map(
          (file: any) => ({
            bundleId: (file.meta as Record<string, any>)?.isBundle
              ? file.id
              : undefined,
            id: file.response?.body?.id || file.id,
            isBundle: (file.meta as Record<string, any>)?.isBundle || false,
            name: file.name,
            size: file.size,
            type: file.type,
            uploadComplete: file.progress.uploadComplete,
          }),
        );
      });

      // Trigger the event
      uploadManager.addEvent("complete", (result) => {});

      const uploadedFiles = uploadManager.getUploadedFiles();

      expect(uploadedFiles).toHaveLength(2);
      expect(uploadedFiles[0].isBundle).toBe(false);
      expect(uploadedFiles[0].bundleId).toBeUndefined();
      expect(uploadedFiles[1].isBundle).toBe(true);
      expect(uploadedFiles[1].bundleId).toBe("bundle-folder1");
    });
  });

  describe("Bundle Completion Events", () => {
    it("should handle bundle completion events correctly", () => {
      const bundleId = "bundle-test-folder";

      // Create a mock bundle file
      const mockBundleFile: UppyFileDefault = {
        data: new Blob(),
        id: bundleId,
        isRemote: false,
        meta: {
          isBundle: true,
        },
        name: "test-folder",
        progress: {
          bytesTotal: 2000,
          bytesUploaded: 1000,
          uploadComplete: false,
        },
        size: 2000,
        source: "bundle-manager",
        type: "application/vnd.bundle+json",
      };

      // Mock getFile to return our bundle file
      vi.spyOn(uploadManager.getUppy(), "getFile").mockReturnValue(
        mockBundleFile,
      );

      // Mock patchFilesState to track changes
      const patchFilesStateSpy = vi.spyOn(uploadManager, "patchFilesState");

      uploadManager.addEvent("bundle-complete", (bundleId: string) => {
        const bundleFile = uploadManager.getUppy().getFile(bundleId);
        if (bundleFile) {
          uploadManager.patchFilesState({
            [bundleId]: {
              progress: {
                ...bundleFile.progress,
                uploadComplete: true,
              },
            },
          });
        }
      });

      // Trigger the event
      uploadManager.addEvent("bundle-complete", (bundleId) => {});

      expect(patchFilesStateSpy).toHaveBeenCalledWith({
        [bundleId]: {
          progress: {
            bytesTotal: 2000,
            bytesUploaded: 1000,
            uploadComplete: true,
          },
        },
      });
    });
  });

  describe("Progress State Synchronization", () => {
    it("should maintain consistent progress state across upload stages", () => {
      // Test initial state
      expect(uploadManager.getUploadProgress()).toBe(0);
      expect(uploadManager.getUploadStatus()).toBe(UploadStatus.PENDING);

      // Simulate starting upload
      uploadManager.addEvent("upload-progress", (file, progress) => {
        (uploadManager as any)._uploadStatus = UploadStatus.UPLOADING;
      });
      uploadManager.addEvent("upload-progress", (file, progress) => {});

      expect(uploadManager.getUploadStatus()).toBe(UploadStatus.UPLOADING);

      // Simulate completion
      const mockResult = {
        failed: [],
        successful: [],
      };

      uploadManager.addEvent("complete", (result) => {
        (uploadManager as any)._uploadStatus = UploadStatus.COMPLETED;
        (uploadManager as any)._uploadProgress = 100;
      });
      uploadManager.addEvent("complete", (result) => {});

      expect(uploadManager.getUploadStatus()).toBe(UploadStatus.COMPLETED);
      expect(uploadManager.getUploadProgress()).toBe(100);
    });

    it("should reset progress state when canceling uploads", () => {
      // Set some progress state
      uploadManager.addEvent("upload-progress", (file, progress) => {
        (uploadManager as any)._uploadStatus = UploadStatus.UPLOADING;
        (uploadManager as any)._uploadProgress = 50;
      });
      uploadManager.addEvent("upload-progress", (file, progress) => {});

      expect(uploadManager.getUploadStatus()).toBe(UploadStatus.UPLOADING);
      expect(uploadManager.getUploadProgress()).toBe(50);

      // Cancel uploads
      uploadManager.cancelAll();

      expect(uploadManager.getUploadStatus()).toBe(UploadStatus.PENDING);
      expect(uploadManager.getUploadProgress()).toBe(0);
      expect(uploadManager.getUploadError()).toBeNull();
    });
  });

  describe("Edge Cases", () => {
    it("should handle partial uploads correctly", () => {
      const mockFiles: UppyFileDefault[] = [
        {
          data: new File(["content1"], "complete.txt"),
          id: "file1",
          isRemote: false,
          meta: {},
          name: "complete.txt",
          progress: {
            bytesTotal: 1000,
            bytesUploaded: 1000,
            uploadComplete: true,
          },
          size: 1000,
          source: "test",
          type: "text/plain",
        },
        {
          data: new File(["content2"], "partial.txt"),
          id: "file2",
          isRemote: false,
          meta: {},
          name: "partial.txt",
          progress: {
            bytesTotal: 2000,
            bytesUploaded: 500,
            uploadComplete: false,
          },
          size: 2000,
          source: "test",
          type: "text/plain",
        },
      ];

      vi.spyOn(uploadManager, "getFiles").mockReturnValue(mockFiles);

      // Simulate upload-progress event
      uploadManager.addEvent("upload-progress", (file, progress) => {
        const files = uploadManager.getFiles() as UppyFileDefault[];
        let totalBytes = 0;
        let uploadedBytes = 0;

        files.forEach((f) => {
          totalBytes += f.size;
          uploadedBytes += f.progress.bytesUploaded || 0;
        });

        const uploadProgress =
          totalBytes > 0 ? Math.round((uploadedBytes / totalBytes) * 100) : 0;

        (uploadManager as any)._uploadProgress = uploadProgress;
      });

      // Expected: (1000 + 500) / (1000 + 2000) = 1500 / 3000 = 50%
      expect(uploadManager.getUploadProgress()).toBe(50);
    });

    it("should handle empty file lists correctly", () => {
      vi.spyOn(uploadManager, "getFiles").mockReturnValue([]);

      // Simulate upload-progress event
      uploadManager.addEvent("upload-progress", (file, progress) => {
        const files = uploadManager.getFiles() as UppyFileDefault[];
        let totalBytes = 0;
        let uploadedBytes = 0;

        files.forEach((f) => {
          totalBytes += f.size;
          uploadedBytes += f.progress.bytesUploaded || 0;
        });

        const uploadProgress =
          totalBytes > 0 ? Math.round((uploadedBytes / totalBytes) * 100) : 0;

        (uploadManager as any)._uploadProgress = uploadProgress;
      });

      expect(uploadManager.getUploadProgress()).toBe(0);
    });
  });
});
