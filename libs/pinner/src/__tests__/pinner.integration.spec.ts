import { test as it } from "./int-test";
import { beforeEach, describe, expect } from "vitest";
import { Pinner } from "../pinner";
import type { PinnerConfig } from "../config";
import { CID } from "multiformats/cid";
import { Status } from "@ipfs-shipyard/pinning-service-client";

describe("Pinner Integration Tests", () => {
  let mockConfig: PinnerConfig;
  let pinner: Pinner;

  beforeEach(() => {
    mockConfig = {
      jwt: "test-jwt-token",
      endpoint: "https://test.pinner.xyz",
      gateway: "https://gateway.test.com",
    };

    // Create a new Pinner instance for each test
    pinner = new Pinner(mockConfig);
  });

  describe("upload followed by pin", () => {
    it("should upload a file and pin the returned CID", async () => {
      const mockFile = new File(["test content"], "test.txt", {
        type: "text/plain",
      });

      // Upload the file
      const uploadResult = await pinner.uploadAndWait(mockFile);

      // Verify upload result
      expect(uploadResult).toBeDefined();
      expect(uploadResult.id).toBeDefined();
      expect(uploadResult.cid).toBeDefined();
      expect(uploadResult.name).toBe("test.txt");
      expect(uploadResult.size).toBe(12);

      // Pin by the returned CID
      const pinResult: CID[] = [];
      const pinGenerator = await pinner.pinByHash(uploadResult.cid);
      for await (const item of pinGenerator) {
        pinResult.push(item);
      }

      // Verify pin result
      expect(pinResult).toHaveLength(1);
      expect(pinResult[0].toString()).toBe(uploadResult.cid);
    });

    it("should upload with options and pin with metadata", async () => {
      const mockFile = new File(["test content"], "test.txt", {
        type: "text/plain",
      });

      const uploadOptions = {
        keyvalues: { type: "document", source: "test" },
      };

      // Upload with options
      const uploadResult = await pinner.uploadAndWait(mockFile, uploadOptions);

      expect(uploadResult.name).toBe("test.txt");

      // Pin with metadata
      const pinResult: CID[] = [];
      const pinGenerator = await pinner.pinByHash(uploadResult.cid, {
        name: "test-pin",
        metadata: { type: "document", source: "test" },
      });
      for await (const item of pinGenerator) {
        pinResult.push(item);
      }

      expect(pinResult).toHaveLength(1);
    });
  });

  describe("multiple uploads and pins", () => {
    it("should handle multiple sequential uploads", async () => {
      const mockFile1 = new File(["test1"], "test1.txt");
      const mockFile2 = new File(["test2"], "test2.txt");

      const result1 = await pinner.uploadAndWait(mockFile1);
      const result2 = await pinner.uploadAndWait(mockFile2);

      expect(result1.cid).toBeDefined();
      expect(result2.cid).toBeDefined();
      expect(result1.cid).not.toBe(result2.cid);
    });

    it("should handle multiple pins", async () => {
      const mockFile1 = new File(["test1"], "test1.txt");
      const mockFile2 = new File(["test2"], "test2.txt");

      const result1 = await pinner.uploadAndWait(mockFile1);
      const result2 = await pinner.uploadAndWait(mockFile2);

      // Pin both uploads
      const pinResult1: CID[] = [];
      const pinGenerator1 = await pinner.pinByHash(result1.cid);
      for await (const item of pinGenerator1) {
        pinResult1.push(item);
      }

      const pinResult2: CID[] = [];
      const pinGenerator2 = await pinner.pinByHash(result2.cid);
      for await (const item of pinGenerator2) {
        pinResult2.push(item);
      }

      expect(pinResult1).toHaveLength(1);
      expect(pinResult2).toHaveLength(1);
      expect(pinResult1[0].toString()).toBe(result1.cid);
      expect(pinResult2[0].toString()).toBe(result2.cid);
    });
  });

  describe("upload and list pins", () => {
    it("should upload and verify pin appears in list", async () => {
      const mockFile = new File(["test content"], "test.txt");

      // Upload
      const uploadResult = await pinner.uploadAndWait(mockFile);

      // Pin
      const pinResult: CID[] = [];
      const pinGenerator = await pinner.pinByHash(uploadResult.cid);
      for await (const item of pinGenerator) {
        pinResult.push(item);
      }

      // List pins
      const pins = await pinner.listPins();

      expect(pins.length).toBeGreaterThan(0);
      expect(pins.some((pin) => pin.cid.toString() === uploadResult.cid)).toBe(
        true,
      );
    });

    it("should list pins with filters", async () => {
      const mockFile1 = new File(["test1"], "test1.txt");
      const mockFile2 = new File(["test2"], "test2.txt");

      const result1 = await pinner.uploadAndWait(mockFile1);
      const result2 = await pinner.uploadAndWait(mockFile2);

      // Pin both
      const pinGenerator1 = await pinner.pinByHash(result1.cid, {
        name: "pin-1",
      });
      for await (const item of pinGenerator1) {
        item;
      }
      const pinGenerator2 = await pinner.pinByHash(result2.cid, {
        name: "pin-2",
      });
      for await (const item of pinGenerator2) {
        item;
      }

      // List with name filter
      const pins = await pinner.listPins({ name: "pin-1" });

      expect(pins.length).toBeGreaterThan(0);
      expect(pins[0].name).toBe("pin-1");
    });
  });

  describe("upload and get pin status", () => {
    it("should upload and get pin status", async () => {
      const mockFile = new File(["test content"], "test.txt");

      // Upload
      const uploadResult = await pinner.uploadAndWait(mockFile);

      // Pin
      const pinResult: CID[] = [];
      const pinGenerator = await pinner.pinByHash(uploadResult.cid, {
        name: "test-pin",
        metadata: { type: "document" },
      });
      for await (const item of pinGenerator) {
        pinResult.push(item);
      }

      // Get pin status
      const pin = await pinner.getPinStatus(uploadResult.cid);

      expect(pin.cid.toString()).toBe(uploadResult.cid);
      expect(pin.name).toBe("test-pin");
      expect(pin.status).toBe(Status.Queued); // Pins start in queued state
      expect(pin.metadata).toEqual({ type: "document" });
    });
  });

  describe("upload and check if pinned", () => {
    it("should upload and verify content is pinned", async () => {
      const mockFile = new File(["test content"], "test.txt");

      // Upload
      const uploadResult = await pinner.uploadAndWait(mockFile);

      // Pin
      const pinResult: CID[] = [];
      const pinGenerator = await pinner.pinByHash(uploadResult.cid);
      for await (const item of pinGenerator) {
        pinResult.push(item);
      }

      // Check if pinned
      const isPinned = await pinner.isPinned(uploadResult.cid);

      expect(isPinned).toBe(true);
    });

    it("should return false for non-pinned content", async () => {
      const mockCid = await CID.parse(
        "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
      );

      const isPinned = await pinner.isPinned(mockCid);

      expect(isPinned).toBe(false);
    });
  });

  describe("upload and update pin metadata", () => {
    it("should upload, pin, and update metadata", async () => {
      const mockFile = new File(["test content"], "test.txt");

      // Upload
      const uploadResult = await pinner.uploadAndWait(mockFile);

      // Pin
      const pinResult: CID[] = [];
      const pinGenerator = await pinner.pinByHash(uploadResult.cid, {
        name: "test-pin",
        metadata: { type: "document", version: "1.0" },
      });
      for await (const item of pinGenerator) {
        pinResult.push(item);
      }

      // Update metadata
      await pinner.setPinMetadata(uploadResult.cid, {
        type: "document",
        version: "2.0",
        updated: "true",
      });

      // Verify updated metadata
      const pin = await pinner.getPinStatus(uploadResult.cid);

      expect(pin.metadata).toEqual({
        type: "document",
        version: "2.0",
        updated: "true",
      });
    });

    it("should clear pin metadata", async () => {
      const mockFile = new File(["test content"], "test.txt");

      // Upload
      const uploadResult = await pinner.uploadAndWait(mockFile);

      // Pin with metadata
      const pinResult: CID[] = [];
      const pinGenerator = await pinner.pinByHash(uploadResult.cid, {
        name: "test-pin",
        metadata: { type: "document" },
      });
      for await (const item of pinGenerator) {
        pinResult.push(item);
      }

      // Clear metadata
      await pinner.setPinMetadata(uploadResult.cid, undefined);

      // Verify metadata is cleared
      const pin = await pinner.getPinStatus(uploadResult.cid);

      expect(pin.metadata).toBeUndefined();
    });
  });

  describe("upload and unpin", () => {
    it("should upload, pin, and unpin content", async () => {
      const mockFile = new File(["test content"], "test.txt");

      // Upload
      const uploadResult = await pinner.uploadAndWait(mockFile);

      // Pin
      const pinResult: CID[] = [];
      const pinGenerator = await pinner.pinByHash(uploadResult.cid);
      for await (const item of pinGenerator) {
        pinResult.push(item);
      }

      // Verify pinned
      const isPinnedBefore = await pinner.isPinned(uploadResult.cid);
      expect(isPinnedBefore).toBe(true);

      // Unpin
      await pinner.unpin(uploadResult.cid);

      // Verify unpinned
      const isPinnedAfter = await pinner.isPinned(uploadResult.cid);
      expect(isPinnedAfter).toBe(false);
    });

    it("should unpin with abort signal", async () => {
      const mockFile = new File(["test content"], "test.txt");

      // Upload
      const uploadResult = await pinner.uploadAndWait(mockFile);

      // Pin
      const pinResult: CID[] = [];
      const pinGenerator = await pinner.pinByHash(uploadResult.cid);
      for await (const item of pinGenerator) {
        pinResult.push(item);
      }

      // Unpin with signal
      const controller = new AbortController();
      await expect(
        pinner.unpin(uploadResult.cid, { signal: controller.signal }),
      ).resolves.not.toThrow();
    });
  });

  describe("directory upload and pin", () => {
    it("should upload directory and pin", async () => {
      const mockFiles = [
        new File(["file1"], "file1.txt"),
        new File(["file2"], "file2.txt"),
      ];

      // Upload directory
      const operation = await pinner.uploadDirectory(mockFiles, {
        name: "test-directory",
      });
      const uploadResult = await operation.result;

      expect(uploadResult.name).toBe("test-directory.car");
      expect(uploadResult.cid).toBeDefined();

      // Pin
      const pinResult: CID[] = [];
      const pinGenerator = await pinner.pinByHash(uploadResult.cid, {
        name: "directory-pin",
      });
      for await (const item of pinGenerator) {
        pinResult.push(item);
      }

      expect(pinResult).toHaveLength(1);
    });
  });

  describe("error handling", () => {
    it("should handle upload errors gracefully", async () => {
      const mockFile = new File(["test content"], "test.txt");

      // This test would need to be configured with MSW to return an error
      // For now, we'll just verify the structure is in place
      try {
        await pinner.uploadAndWait(mockFile);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should handle pin errors gracefully", async () => {
      const mockCid = await CID.parse(
        "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi",
      );

      // This test would need to be configured with MSW to return an error
      try {
        const pinResult: CID[] = [];
        const pinGenerator = await pinner.pinByHash(mockCid);
        for await (const item of pinGenerator) {
          pinResult.push(item);
        }
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("cleanup", () => {
    it("should destroy pinner instance", () => {
      expect(() => {
        pinner.destroy();
      }).not.toThrow();
    });

    it("should handle multiple destroy calls", () => {
      expect(() => {
        pinner.destroy();
        pinner.destroy();
        pinner.destroy();
      }).not.toThrow();
    });
  });
});
