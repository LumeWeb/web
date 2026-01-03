import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Pinner } from "@/pinner";
import {
  createBase64UploadBuilder,
  createCidUploadBuilder,
  createFileArrayUploadBuilder,
  createJsonUploadBuilder,
  createUploadBuilder,
  createUrlUploadBuilder,
  PinataAdapterError,
} from "../builder";
import type { UrlUploadBuilderOptions } from "@/types/pinata";
import { CID } from "multiformats/cid";
import { createMockCID } from "@/__tests__/setup";

describe("PinataUploadBuilder", () => {
  let mockPinner: Pinner;

  beforeEach(() => {
    mockPinner = {
      upload: vi.fn(),
      uploadAndWait: vi.fn(),
      uploadDirectory: vi.fn(),
      pinByHash: vi.fn(),
      listPins: vi.fn(),
      getPinStatus: vi.fn(),
      isPinned: vi.fn(),
      setPinMetadata: vi.fn(),
      pins: {
        add: vi.fn(),
        ls: vi.fn(),
        get: vi.fn(),
        isPinned: vi.fn(),
        setMetadata: vi.fn(),
        rm: vi.fn(),
      },
    } as unknown as Pinner;
  });

  describe("createUploadBuilder", () => {
    it("should create a file upload builder", async () => {
      const file = new File(["content"], "test.txt");
      const mockResult = {
        cid: "QmHash",
        size: 100,
        createdAt: new Date("2024-01-01"),
      };

      vi.mocked(mockPinner.uploadAndWait).mockResolvedValue(mockResult as any);

      const builder = createUploadBuilder(mockPinner, file);
      const result = await builder
        .name("test")
        .keyvalues({ type: "test" })
        .execute();

      expect(result).toEqual({
        IpfsHash: "QmHash",
        PinSize: 100,
        Timestamp: "2024-01-01T00:00:00.000Z",
        isDuplicate: false,
      });

      expect(mockPinner.uploadAndWait).toHaveBeenCalledWith(file, {
        name: "test",
        keyvalues: { type: "test" },
      });
    });
  });

  describe("createFileArrayUploadBuilder", () => {
    it("should create a file array upload builder", async () => {
      const files = [
        new File(["content1"], "test1.txt"),
        new File(["content2"], "test2.txt"),
      ];
      const mockOperation = {
        result: Promise.resolve({
          cid: "QmHash",
          size: 200,
          createdAt: new Date("2024-01-01"),
        } as any),
      };

      vi.mocked(mockPinner.uploadDirectory).mockResolvedValue(
        mockOperation as any,
      );

      const builder = createFileArrayUploadBuilder(mockPinner, files);
      const result = await builder
        .name("test")
        .keyvalues({ type: "test" })
        .execute();

      expect(result).toEqual({
        IpfsHash: "QmHash",
        PinSize: 200,
        Timestamp: "2024-01-01T00:00:00.000Z",
        isDuplicate: false,
      });

      expect(mockPinner.uploadDirectory).toHaveBeenCalledWith(files, {
        name: "test",
        keyvalues: { type: "test" },
      });
    });

    it("should throw error for empty file array", () => {
      expect(() => createFileArrayUploadBuilder(mockPinner, [])).toThrow(
        PinataAdapterError,
      );
    });
  });

  describe("createJsonUploadBuilder", () => {
    it("should create a JSON upload builder", async () => {
      const data = { foo: "bar" };
      const mockResult = {
        cid: "QmHash",
        size: 50,
        createdAt: new Date("2024-01-01"),
      };

      vi.mocked(mockPinner.uploadAndWait).mockResolvedValue(mockResult as any);

      const builder = createJsonUploadBuilder(mockPinner, data);
      const result = await builder
        .name("data.json")
        .keyvalues({ type: "config" })
        .execute();

      expect(result).toEqual({
        IpfsHash: "QmHash",
        PinSize: 50,
        Timestamp: "2024-01-01T00:00:00.000Z",
        isDuplicate: false,
      });

      expect(mockPinner.uploadAndWait).toHaveBeenCalledWith(expect.any(File), {
        name: "data.json",
        keyvalues: { type: "config" },
      });
    });
  });

  describe("createBase64UploadBuilder", () => {
    it("should create a base64 upload builder", async () => {
      const base64String = "SGVsbG8gV29ybGQ="; // "Hello World"
      const mockResult = {
        cid: "QmHash",
        size: 11,
        createdAt: new Date("2024-01-01"),
      };

      vi.mocked(mockPinner.uploadAndWait).mockResolvedValue(mockResult as any);

      const builder = createBase64UploadBuilder(mockPinner, base64String);
      const result = await builder.name("file.bin").execute();

      expect(result).toEqual({
        IpfsHash: "QmHash",
        PinSize: 11,
        Timestamp: "2024-01-01T00:00:00.000Z",
        isDuplicate: false,
      });

      expect(mockPinner.uploadAndWait).toHaveBeenCalledWith(expect.any(File), {
        name: "file.bin",
        keyvalues: undefined,
      });
    });
  });

  describe("createUrlUploadBuilder", () => {
    it("should create a URL upload builder", async () => {
      const urlString = "https://example.com/file.txt";
      const mockBlob = new Blob(["content"], { type: "text/plain" });
      const mockResult = {
        cid: "QmHash",
        size: 7,
        createdAt: new Date("2024-01-01"),
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
        url: urlString,
      } as Response);

      vi.mocked(mockPinner.uploadAndWait).mockResolvedValue(mockResult as any);

      const options: UrlUploadBuilderOptions = { fetch: mockFetch };
      const builder = createUrlUploadBuilder(mockPinner, urlString, options);
      const result = await builder.execute();

      expect(result).toEqual({
        IpfsHash: "QmHash",
        PinSize: 7,
        Timestamp: "2024-01-01T00:00:00.000Z",
        isDuplicate: false,
      });

      expect(mockFetch).toHaveBeenCalled();
      expect(mockFetch.mock.calls[0][0]).toBeInstanceOf(Request);
      expect(mockFetch.mock.calls[0][0].url).toBe(urlString);
      expect(mockPinner.uploadAndWait).toHaveBeenCalledWith(expect.any(File), {
        name: undefined,
        keyvalues: undefined,
      });
    });
  });

  describe("createCidUploadBuilder", () => {
    it("should create a CID upload builder", async () => {
      const cidString = await createMockCID(0);
      const mockCid = CID.parse(cidString);
      const mockGenerator = (async function* () {
        yield mockCid;
      })();

      vi.mocked(mockPinner.pinByHash).mockResolvedValue(mockGenerator as any);

      const builder = createCidUploadBuilder(mockPinner, cidString);
      await builder.name("test").keyvalues({ type: "test" }).execute();

      expect(mockPinner.pinByHash).toHaveBeenCalledWith(mockCid, {
        name: "test",
        metadata: { type: "test" },
      });
    });
  });
});
