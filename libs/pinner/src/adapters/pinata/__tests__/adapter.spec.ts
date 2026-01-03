import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Pinner } from "@/pinner";
import { pinataAdapter, type PinataAdapter } from "../adapter";
import { CID } from "multiformats/cid";
import { createMockCID, createMockUUID } from "@/__tests__/setup";

describe("PinataAdapter", () => {
  let mockPinner: Pinner;
  let adapter: PinataAdapter;

  beforeEach(() => {
    // Mock Pinner instance
    mockPinner = {
      upload: vi.fn(),
      uploadAndWait: vi.fn(),
      uploadDirectory: vi.fn(),
      pinByHash: vi.fn(),
      listPins: vi.fn(),
      getPinStatus: vi.fn(),
      isPinned: vi.fn(),
      setPinMetadata: vi.fn(),
      unpin: vi.fn(),
      pins: {
        add: vi.fn(),
        ls: vi.fn(),
        get: vi.fn(),
        isPinned: vi.fn(),
        setMetadata: vi.fn(),
        rm: vi.fn(),
      },
    } as unknown as Pinner;

    adapter = pinataAdapter(mockPinner);
  });

  describe("upload methods", () => {
    it("should have file upload method", () => {
      expect(adapter.upload.file).toBeDefined();
      const file = new File(["content"], "test.txt");
      const builder = adapter.upload.file(file);
      expect(builder).toBeDefined();
    });

    it("should have fileArray upload method", () => {
      expect(adapter.upload.fileArray).toBeDefined();
      const files = [
        new File(["content1"], "test1.txt"),
        new File(["content2"], "test2.txt"),
      ];
      const builder = adapter.upload.fileArray(files);
      expect(builder).toBeDefined();
    });

    it("should have json upload method", () => {
      expect(adapter.upload.json).toBeDefined();
      const builder = adapter.upload.json({ foo: "bar" });
      expect(builder).toBeDefined();
    });

    it("should have base64 upload method", () => {
      expect(adapter.upload.base64).toBeDefined();
      const builder = adapter.upload.base64("SGVsbG8gV29ybGQ=");
      expect(builder).toBeDefined();
    });

    it("should have url upload method", () => {
      expect(adapter.upload.url).toBeDefined();
      const builder = adapter.upload.url("https://example.com/file.txt");
      expect(builder).toBeDefined();
    });

    it("should have cid upload method", () => {
      expect(adapter.upload.cid).toBeDefined();
      const builder = adapter.upload.cid("QmHash");
      expect(builder).toBeDefined();
    });
  });

  describe("pinByHash", () => {
    it("should pin content by CID", async () => {
      const mockCidString = await createMockCID(0);
      const mockCid = CID.parse(mockCidString);
      const mockGenerator = (async function* () {
        yield mockCid;
      })();

      vi.mocked(mockPinner.pinByHash).mockResolvedValue(mockGenerator as any);

      await adapter.pinByHash(mockCidString, {
        name: "test",
        keyvalues: { type: "test" },
      });

      expect(mockPinner.pinByHash).toHaveBeenCalledWith(mockCid, {
        name: "test",
        metadata: { type: "test" },
      });
    });

    it("should pin content by CID without options", async () => {
      const mockCidString = await createMockCID(1);
      const mockCid = CID.parse(mockCidString);
      const mockGenerator = (async function* () {
        yield mockCid;
      })();

      vi.mocked(mockPinner.pinByHash).mockResolvedValue(mockGenerator as any);

      await adapter.pinByHash(mockCidString);

      expect(mockPinner.pinByHash).toHaveBeenCalledWith(mockCid, {});
    });
  });

  describe("unpin", () => {
    it("should unpin content by CID", async () => {
      const mockCidString = await createMockCID(2);

      await adapter.unpin(mockCidString);

      expect(mockPinner.unpin).toHaveBeenCalledWith(mockCidString);
    });
  });

  describe("getPinStatus", () => {
    it("should get pin status", async () => {
      const mockCidString = await createMockCID(3);
      const mockCid = CID.parse(mockCidString);
      const mockRemotePin = {
        cid: mockCid,
        name: "test",
        status: "pinned" as const,
        created: new Date("2024-01-01"),
        size: 100,
        metadata: { type: "test" },
      };

      vi.mocked(mockPinner.getPinStatus).mockResolvedValue(
        mockRemotePin as any,
      );

      const result = await adapter.getPinStatus(mockCidString);

      expect(result).toEqual({
        id: mockCidString,
        ipfsPinHash: mockCidString,
        size: 100,
        userId: "",
        datePinned: "2024-01-01T00:00:00.000Z",
        metadata: {
          name: "test",
          keyvalues: { type: "test" },
        },
      });
    });
  });

  describe("isPinned", () => {
    it("should check if content is pinned", async () => {
      const mockCidString = await createMockCID(4);
      vi.mocked(mockPinner.isPinned).mockResolvedValue(true);

      const result = await adapter.isPinned(mockCidString);

      expect(result).toBe(true);
      expect(mockPinner.isPinned).toHaveBeenCalledWith(
        CID.parse(mockCidString),
      );
    });

    it("should return false if content is not pinned", async () => {
      const mockCidString = await createMockCID(5);
      vi.mocked(mockPinner.isPinned).mockResolvedValue(false);

      const result = await adapter.isPinned(mockCidString);

      expect(result).toBe(false);
    });
  });

  describe("setPinMetadata", () => {
    it("should set pin metadata", async () => {
      const mockCidString = await createMockCID(6);
      await adapter.setPinMetadata(mockCidString, {
        type: "test",
        version: "1",
      });

      expect(mockPinner.setPinMetadata).toHaveBeenCalledWith(
        CID.parse(mockCidString),
        { type: "test", version: "1" },
      );
    });
  });

  describe("files.list", () => {
    it("should list pins", async () => {
      const mockCidString = await createMockCID(7);
      const mockCid = CID.parse(mockCidString);
      const mockRemotePins = [
        {
          cid: mockCid,
          name: "test",
          status: "pinned" as const,
          created: new Date("2024-01-01"),
          size: 100,
          metadata: { type: "test" },
        },
      ];

      vi.mocked(mockPinner.listPins).mockResolvedValue(mockRemotePins as any);

      const builder = adapter.files.list();
      const result = await builder.execute();

      expect(result).toEqual([
        {
          id: mockCidString,
          ipfsPinHash: mockCidString,
          size: 100,
          name: "test",
          cid: mockCidString,
          createdAt: "2024-01-01T00:00:00.000Z",
        },
      ]);
    });

    it("should list pins with limit", async () => {
      const mockCidString = await createMockCID(8);
      const mockCid = CID.parse(mockCidString);
      const mockRemotePins = [
        {
          cid: mockCid,
          name: "test",
          status: "pinned" as const,
          created: new Date("2024-01-01"),
          size: 100,
          metadata: { type: "test" },
        },
      ];

      vi.mocked(mockPinner.listPins).mockResolvedValue(mockRemotePins as any);

      const builder = adapter.files.list();
      const result = await builder.limit(10).execute();

      expect(result).toHaveLength(1);
    });

    it("should list pins with offset", async () => {
      const mockCidString = await createMockCID(9);
      const mockCid = CID.parse(mockCidString);
      const mockRemotePins = [
        {
          cid: mockCid,
          name: "test",
          status: "pinned" as const,
          created: new Date("2024-01-01"),
          size: 100,
          metadata: { type: "test" },
        },
      ];

      vi.mocked(mockPinner.listPins).mockResolvedValue(mockRemotePins as any);

      const builder = adapter.files.list();
      const result = await builder.pageToken("test-token").execute();

      expect(result).toHaveLength(1);
    });
  });

  describe("files.get", () => {
    it("should get specific pin by id", async () => {
      const mockCidString = await createMockCID(10);
      const mockCid = CID.parse(mockCidString);
      const mockRemotePins = [
        {
          cid: mockCid,
          name: "test",
          status: "pinned" as const,
          created: new Date("2024-01-01"),
          size: 100,
          metadata: { type: "test" },
        },
      ];

      vi.mocked(mockPinner.listPins).mockResolvedValue(mockRemotePins as any);

      const result = await adapter.files.get(mockCidString);

      expect(result).toEqual({
        id: mockCidString,
        ipfsPinHash: mockCidString,
        size: 100,
        name: "test",
        cid: mockCidString,
        createdAt: "2024-01-01T00:00:00.000Z",
      });
    });

    it("should throw error if pin not found", async () => {
      vi.mocked(mockPinner.listPins).mockResolvedValue([]);

      await expect(adapter.files.get(createMockUUID(99))).rejects.toThrow(
        "Pin not found",
      );
    });
  });
});
