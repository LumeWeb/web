import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Pinner } from "@/pinner";
import { createListBuilder } from "../list-builder";
import { CID } from "multiformats/cid";
import { createMockCID } from "@/__tests__/setup";

describe("PinataListBuilder", () => {
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

  describe("createListBuilder", () => {
    it("should create a list builder", () => {
      const builder = createListBuilder(mockPinner);
      expect(builder).toBeDefined();
    });

    it("should list pins", async () => {
      const mockCidString1 = await createMockCID(0);
      const mockCidString2 = await createMockCID(1);
      const mockCid1 = CID.parse(mockCidString1);
      const mockCid2 = CID.parse(mockCidString2);
      const mockRemotePins = [
        {
          cid: mockCid1,
          name: "test1",
          status: "pinned" as const,
          created: new Date("2024-01-01"),
          size: 100,
          metadata: { type: "test" },
        },
        {
          cid: mockCid2,
          name: "test2",
          status: "pinned" as const,
          created: new Date("2024-01-02"),
          size: 200,
          metadata: { type: "test" },
        },
      ];

      vi.mocked(mockPinner.listPins).mockResolvedValue(mockRemotePins as any);

      const builder = createListBuilder(mockPinner);
      const result = await builder.execute();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: mockCidString1,
        ipfsPinHash: mockCidString1,
        size: 100,
        name: "test1",
        cid: mockCidString1,
        createdAt: "2024-01-01T00:00:00.000Z",
      });
      expect(result[1]).toEqual({
        id: mockCidString2,
        ipfsPinHash: mockCidString2,
        size: 200,
        name: "test2",
        cid: mockCidString2,
        createdAt: "2024-01-02T00:00:00.000Z",
      });

      expect(mockPinner.listPins).toHaveBeenCalledWith({});
    });

    it("should list pins with limit", async () => {
      const mockCidString = await createMockCID(2);
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

      const builder = createListBuilder(mockPinner);
      const result = await builder.limit(10).execute();

      expect(result).toHaveLength(1);
      expect(mockPinner.listPins).toHaveBeenCalledWith({ limit: 10 });
    });

    it("should list pins with pageToken", async () => {
      const mockCidString = await createMockCID(3);
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

      const builder = createListBuilder(mockPinner);
      const result = await builder
        .pageToken("MDE5MTk0NTctYzJjNi03NzBlLTkzOTEtOGM3MmM0ZjQxZjY0")
        .execute();

      expect(result).toHaveLength(1);
      expect(mockPinner.listPins).toHaveBeenCalledWith({
        cursor: "MDE5MTk0NTctYzJjNi03NzBlLTkzOTEtOGM3MmM0ZjQxZjY0",
      });
    });

    it("should list pins with both limit and pageToken", async () => {
      const mockCidString = await createMockCID(4);
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

      const builder = createListBuilder(mockPinner);
      const result = await builder
        .limit(10)
        .pageToken("MDE5MTk0NTctYzJjNi03NzBlLTkzOTEtOGM3MmM0ZjQxZjY0")
        .execute();

      expect(result).toHaveLength(1);
      expect(mockPinner.listPins).toHaveBeenCalledWith({
        limit: 10,
        cursor: "MDE5MTk0NTctYzJjNi03NzBlLTkzOTEtOGM3MmM0ZjQxZjY0",
      });
    });

    it("should handle empty pin list", async () => {
      vi.mocked(mockPinner.listPins).mockResolvedValue([]);

      const builder = createListBuilder(mockPinner);
      const result = await builder.execute();

      expect(result).toHaveLength(0);
      expect(result).toEqual([]);
    });

    it("should handle pins without name", async () => {
      const mockCidString = await createMockCID(5);
      const mockCid = CID.parse(mockCidString);
      const mockRemotePins = [
        {
          cid: mockCid,
          name: undefined,
          status: "pinned" as const,
          created: new Date("2024-01-01"),
          size: 100,
          metadata: undefined,
        },
      ];

      vi.mocked(mockPinner.listPins).mockResolvedValue(mockRemotePins as any);

      const builder = createListBuilder(mockPinner);
      const result = await builder.execute();

      expect(result[0].name).toBe("");
      expect(result[0].createdAt).toBe("2024-01-01T00:00:00.000Z");
    });

    it("should handle pins with size 0", async () => {
      const mockCidString = await createMockCID(6);
      const mockCid = CID.parse(mockCidString);
      const mockRemotePins = [
        {
          cid: mockCid,
          name: "test",
          status: "pinned" as const,
          created: new Date("2024-01-01"),
          size: undefined,
          metadata: { type: "test" },
        },
      ];

      vi.mocked(mockPinner.listPins).mockResolvedValue(mockRemotePins as any);

      const builder = createListBuilder(mockPinner);
      const result = await builder.execute();

      expect(result[0].size).toBe(0);
    });

    it("should support method chaining", async () => {
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

      const builder = createListBuilder(mockPinner);
      const result = await builder.limit(10).pageToken("some-token").execute();

      expect(result).toHaveLength(1);
    });
  });
});
