import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Pinner } from "@/pinner";
import { pinataAdapter } from "@/adapters/pinata/v2";
import type { UploadResponse, PinByCIDResponse } from "@/adapters/pinata/v2/types";
import { CID } from "multiformats/cid";
import { createMockCID } from "@/__tests__/setup";

describe("PinataV2UploadBuilder", () => {
  let mockPinner: Pinner;

  beforeEach(() => {
    mockPinner = {
      uploadAndWait: vi.fn(),
      uploadDirectory: vi.fn(),
      pinByHash: vi.fn(),
      listPins: vi.fn(),
      getPinStatus: vi.fn(),
      setPinMetadata: vi.fn(),
      unpin: vi.fn(),
    } as unknown as Pinner;
  });

  describe("file upload builder", () => {
    it("should create builder from file", () => {
      const adapter = pinataAdapter(mockPinner);
      const file = new File(["content"], "test.txt");
      const builder = adapter.upload.public.file(file);

      expect(builder).toBeDefined();
      expect(builder.name).toBeInstanceOf(Function);
      expect(builder.keyvalues).toBeInstanceOf(Function);
      expect(builder.execute).toBeInstanceOf(Function);
    });

    it("should chain name and keyvalues methods", () => {
      const adapter = pinataAdapter(mockPinner);
      const file = new File(["content"], "test.txt");
      const builder = adapter.upload.public.file(file);

      expect(builder.name("custom-name")).toBe(builder);
      expect(builder.keyvalues({ type: "test" })).toBe(builder);
    });

    it("should upload file without options", async () => {
      const file = new File(["content"], "test.txt");
      const mockResult = {
        cid: await createMockCID(0),
        size: 7,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        id: "op-123",
        name: "test.txt",
        mimeType: "text/plain",
        numberOfFiles: 1,
      };

      vi.mocked(mockPinner.uploadAndWait).mockResolvedValue(mockResult);

      const adapter = pinataAdapter(mockPinner);
      const builder = adapter.upload.public.file(file);
      const result = await builder.execute();

      expect(result).toMatchObject<UploadResponse>({
        id: mockResult.cid,
        name: "test.txt",
        cid: mockResult.cid,
        size: 7,
        created_at: mockResult.createdAt.toISOString(),
        number_of_files: 1,
        mime_type: "application/octet-stream",
        group_id: null,
        keyvalues: {},
        vectorized: false,
        network: "public",
      });

      expect(mockPinner.uploadAndWait).toHaveBeenCalledWith(file, {
        name: undefined,
        keyvalues: undefined,
      });
    });

    it("should upload file with options", async () => {
      const file = new File(["content"], "test.txt");
      const mockResult = {
        cid: await createMockCID(0),
        size: 7,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        id: "op-123",
        name: "test.txt",
        mimeType: "text/plain",
        numberOfFiles: 1,
      };

      vi.mocked(mockPinner.uploadAndWait).mockResolvedValue(mockResult);

      const adapter = pinataAdapter(mockPinner);
      const builder = adapter.upload.public.file(file, {
        metadata: {
          name: "custom-name",
          keyvalues: { type: "test", category: "docs" },
        },
        groupId: "group-123",
      });

      const result = await builder.execute();

      expect(mockPinner.uploadAndWait).toHaveBeenCalledWith(file, {
        name: "custom-name",
        keyvalues: { type: "test", category: "docs" },
      });

      expect(result.keyvalues).toEqual({ type: "test", category: "docs" });
      expect(result.mime_type).toBe("application/octet-stream");
    });

    it("should upload file with chained methods", async () => {
      const file = new File(["content"], "test.txt");
      const mockResult = {
        cid: await createMockCID(0),
        size: 7,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        id: "op-123",
        name: "test.txt",
        mimeType: "text/plain",
        numberOfFiles: 1,
      };

      vi.mocked(mockPinner.uploadAndWait).mockResolvedValue(mockResult);

      const adapter = pinataAdapter(mockPinner);
      const result = await adapter.upload.public
        .file(file)
        .name("chained-name")
        .keyvalues({ source: "builder" })
        .execute();

      expect(mockPinner.uploadAndWait).toHaveBeenCalledWith(file, {
        name: "chained-name",
        keyvalues: { source: "builder" },
      });

      expect(result.name).toBe("test.txt"); // File name is preserved
    });
  });

  describe("fileArray upload builder", () => {
    it("should create builder from file array", () => {
      const adapter = pinataAdapter(mockPinner);
      const files = [
        new File(["content1"], "test1.txt"),
        new File(["content2"], "test2.txt"),
      ];
      const builder = adapter.upload.public.fileArray(files);

      expect(builder).toBeDefined();
      expect(builder.name).toBeInstanceOf(Function);
      expect(builder.keyvalues).toBeInstanceOf(Function);
    });

    it("should upload file array", async () => {
      const files = [
        new File(["content1"], "test1.txt"),
        new File(["content2"], "test2.txt"),
      ];
      const mockResult = {
        cid: await createMockCID(0),
        size: 16,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        id: "op-123",
        name: "test.txt",
        mimeType: "text/plain",
        numberOfFiles: 1,
      };

      const mockOperation = {
        result: Promise.resolve(mockResult),
      };

      vi.mocked(mockPinner.uploadDirectory).mockResolvedValue(mockOperation as any);

      const adapter = pinataAdapter(mockPinner);
      const builder = adapter.upload.public.fileArray(files);
      const result = await builder.execute();

      expect(result).toMatchObject<UploadResponse>({
        id: mockResult.cid,
        name: "directory",
        cid: mockResult.cid,
        size: 16,
        created_at: mockResult.createdAt.toISOString(),
        number_of_files: 2,
        mime_type: "application/octet-stream",
        group_id: null,
        keyvalues: {},
        vectorized: false,
        network: "public",
      });

      expect(mockPinner.uploadDirectory).toHaveBeenCalledWith(files, {
        name: undefined,
        keyvalues: undefined,
      });
    });

    it("should upload file array with options", async () => {
      const files = [new File(["content"], "test.txt")];
      const mockResult = {
        cid: await createMockCID(0),
        size: 7,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        id: "op-123",
        name: "test.txt",
        mimeType: "text/plain",
        numberOfFiles: 1,
      };

      const mockOperation = {
        result: Promise.resolve(mockResult),
      };

      vi.mocked(mockPinner.uploadDirectory).mockResolvedValue(mockOperation as any);

      const adapter = pinataAdapter(mockPinner);
      const result = await adapter.upload.public
        .fileArray(files, {
          metadata: { name: "my-dir", keyvalues: { type: "directory" } },
        })
        .execute();

      expect(result.name).toBe("my-dir");
      expect(mockPinner.uploadDirectory).toHaveBeenCalledWith(files, {
        name: "my-dir",
        keyvalues: { type: "directory" },
      });
    });
  });

  describe("json upload builder", () => {
    it("should create builder from json object", () => {
      const adapter = pinataAdapter(mockPinner);
      const data = { foo: "bar" };
      const builder = adapter.upload.public.json(data);

      expect(builder).toBeDefined();
    });

    it("should upload json object", async () => {
      const data = { foo: "bar", baz: 123 };
      const mockResult = {
        cid: await createMockCID(0),
        size: JSON.stringify(data).length,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        id: "op-123",
        name: "test.txt",
        mimeType: "text/plain",
        numberOfFiles: 1,
      };

      vi.mocked(mockPinner.uploadAndWait).mockResolvedValue(mockResult);

      const adapter = pinataAdapter(mockPinner);
      const builder = adapter.upload.public.json(data);
      const result = await builder.execute();

      expect(result.mime_type).toBe("application/json");
      expect(result.name).toBe("data.json");

      expect(mockPinner.uploadAndWait).toHaveBeenCalledWith(expect.any(File), {
        name: undefined,
        keyvalues: undefined,
      });
    });

    it("should upload json with custom name", async () => {
      const data = { config: true };
      const mockResult = {
        cid: await createMockCID(0),
        size: JSON.stringify(data).length,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        id: "op-123",
        name: "test.txt",
        mimeType: "text/plain",
        numberOfFiles: 1,
      };

      vi.mocked(mockPinner.uploadAndWait).mockResolvedValue(mockResult);

      const adapter = pinataAdapter(mockPinner);
      const result = await adapter.upload.public.json(data).name("config.json").execute();

      expect(result.name).toBe("config.json"); // Builder name now overrides default
    });
  });

  describe("base64 upload builder", () => {
    it("should create builder from base64 string", () => {
      const adapter = pinataAdapter(mockPinner);
      const base64 = "SGVsbG8gV29ybGQ=";
      const builder = adapter.upload.public.base64(base64);

      expect(builder).toBeDefined();
    });

    it("should upload base64 string", async () => {
      const base64 = "SGVsbG8gV29ybGQ="; // "Hello World"
      const mockResult = {
        cid: await createMockCID(0),
        size: 11,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        id: "op-123",
        name: "test.txt",
        mimeType: "text/plain",
        numberOfFiles: 1,
      };

      vi.mocked(mockPinner.uploadAndWait).mockResolvedValue(mockResult);

      const adapter = pinataAdapter(mockPinner);
      const builder = adapter.upload.public.base64(base64);
      const result = await builder.execute();

      expect(result.mime_type).toBe("application/octet-stream");
      expect(result.name).toBe("file.bin");

      expect(mockPinner.uploadAndWait).toHaveBeenCalledWith(expect.any(File), {
        name: undefined,
        keyvalues: undefined,
      });
    });

    it("should upload base64 with custom name", async () => {
      const base64 = "SGVsbG8=";
      const mockResult = {
        cid: await createMockCID(0),
        size: 5,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        id: "op-123",
        name: "test.txt",
        mimeType: "text/plain",
        numberOfFiles: 1,
      };

      vi.mocked(mockPinner.uploadAndWait).mockResolvedValue(mockResult);

      const adapter = pinataAdapter(mockPinner);
      const result = await adapter.upload.public.base64(base64, {
        metadata: { name: "custom.bin" },
      }).execute();

      expect(result.name).toBe("custom.bin");
    });
  });

  describe("url upload builder", () => {
    it("should create builder from url", () => {
      const adapter = pinataAdapter(mockPinner);
      const url = "https://example.com/file.txt";
      const builder = adapter.upload.public.url(url);

      expect(builder).toBeDefined();
    });

    it("should throw error on execute", async () => {
      const adapter = pinataAdapter(mockPinner);
      const url = "https://example.com/file.txt";
      const builder = adapter.upload.public.url(url);

      await expect(builder.execute()).rejects.toThrow("URL upload are not supported by Pinner");
    });
  });

  describe("cid upload builder", () => {
    it("should create builder from cid string", () => {
      const adapter = pinataAdapter(mockPinner);
      const cid = "QmHash";
      const builder = adapter.upload.public.cid(cid);

      expect(builder).toBeDefined();
    });

    it("should pin by cid", async () => {
      const cidString = await createMockCID(0);
      const mockCid = CID.parse(cidString);
      const mockGenerator = (async function* () {
        yield mockCid;
      })();

      vi.mocked(mockPinner.pinByHash).mockResolvedValue(mockGenerator as any);

      const adapter = pinataAdapter(mockPinner);
      const builder = adapter.upload.public.cid(cidString);
      const result = await builder.execute();

      expect(result).toMatchObject<PinByCIDResponse>({
        id: cidString,
        cid: cidString,
        date_queued: expect.any(String),
        name: "",
        status: "pinned",
        keyvalues: null,
        host_nodes: null,
        group_id: null,
      });

      expect(mockPinner.pinByHash).toHaveBeenCalledWith(mockCid, {
        name: undefined,
        metadata: undefined,
      });
    });

    it("should pin by cid with options", async () => {
      const cidString = await createMockCID(0);
      const mockCid = CID.parse(cidString);
      const mockGenerator = (async function* () {
        yield mockCid;
      })();

      vi.mocked(mockPinner.pinByHash).mockResolvedValue(mockGenerator as any);

      const adapter = pinataAdapter(mockPinner);
      const result = await adapter.upload.public
        .cid(cidString, {
          metadata: { name: "test-file", keyvalues: { type: "test" } },
          groupId: "group-123",
        })
        .execute();

      expect(result.name).toBe("test-file");
      expect(result.group_id).toBe("group-123");
      expect(result.keyvalues).toEqual({ type: "test" });

      expect(mockPinner.pinByHash).toHaveBeenCalledWith(mockCid, {
        name: "test-file",
        metadata: { type: "test" },
      });
    });
  });

  describe("multiple method chaining", () => {
    it("should support complex chaining", async () => {
      const file = new File(["content"], "test.txt");
      const mockResult = {
        cid: await createMockCID(0),
        size: 7,
        createdAt: new Date("2024-01-01T00:00:00.000Z"),
        id: "op-123",
        name: "test.txt",
        mimeType: "text/plain",
        numberOfFiles: 1,
      };

      vi.mocked(mockPinner.uploadAndWait).mockResolvedValue(mockResult);

      const adapter = pinataAdapter(mockPinner);
      const result = await adapter.upload.public
        .file(file)
        .name("chain-test")
        .keyvalues({ level: "1" })
        .name("override-name")
        .keyvalues({ extra: "data", another: "value" })
        .execute();

      expect(mockPinner.uploadAndWait).toHaveBeenCalledWith(file, {
        name: "override-name",
        keyvalues: { extra: "data", another: "value" },
      });
    });
  });

  describe("private upload builders", () => {
    it("should create private file builder", () => {
      const adapter = pinataAdapter(mockPinner);
      const file = new File(["content"], "test.txt");
      const builder = adapter.upload.private.file(file);

      expect(builder).toBeDefined();
    });

    it("should throw error on private file execute", async () => {
      const adapter = pinataAdapter(mockPinner);
      const file = new File(["content"], "test.txt");
      const builder = adapter.upload.private.file(file);

      await expect(builder.execute()).rejects.toThrow("Private upload are not supported by Pinner");
    });

    it("should throw error on private json execute", async () => {
      const adapter = pinataAdapter(mockPinner);
      const builder = adapter.upload.private.json({ test: true });

      await expect(builder.execute()).rejects.toThrow("Private upload are not supported by Pinner");
    });
  });
});
