import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Pinner } from "@/pinner";
import { pinataAdapter } from "@/adapters/pinata/v2";
import type { FileListItem } from "@/adapters/pinata/v2/types";
import { CID } from "multiformats/cid";
import { createMockCID } from "@/__tests__/setup";

describe("PinataV2FilterFiles", () => {
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

  describe("FilterFiles public", () => {
    it("should create filter builder", () => {
      const adapter = pinataAdapter(mockPinner);
      const filter = adapter.files.public.list();

      expect(filter).toBeDefined();
      expect(filter.name).toBeInstanceOf(Function);
      expect(filter.group).toBeInstanceOf(Function);
      expect(filter.cid).toBeInstanceOf(Function);
      expect(filter.mimeType).toBeInstanceOf(Function);
      expect(filter.order).toBeInstanceOf(Function);
      expect(filter.limit).toBeInstanceOf(Function);
      expect(filter.cidPending).toBeInstanceOf(Function);
      expect(filter.keyvalues).toBeInstanceOf(Function);
      expect(filter.noGroup).toBeInstanceOf(Function);
      expect(filter.pageToken).toBeInstanceOf(Function);
      expect(filter.then).toBeInstanceOf(Function);
      expect(filter.all).toBeInstanceOf(Function);
    });

    it("should list files with execute", async () => {
      const mockCidString1 = await createMockCID(0);
      const mockCidString2 = await createMockCID(1);
      const mockRemotePins = [
        {
          cid: CID.parse(mockCidString1),
          name: "test1.txt",
          size: 100,
          created: new Date("2024-01-01"),
          metadata: { type: "test" },
        },
        {
          cid: CID.parse(mockCidString2),
          name: "test2.txt",
          size: 200,
          created: new Date("2024-01-02"),
          metadata: { type: "test" },
        },
      ];

      vi.mocked(mockPinner.listPins).mockResolvedValue(mockRemotePins as any);

      const adapter = pinataAdapter(mockPinner);
      const filter = adapter.files.public.list();
      const result = await filter.then((response) => response);

      expect(result).toEqual({
        files: [
          {
            id: mockCidString1,
            name: "test1.txt",
            cid: mockCidString1,
            size: 100,
            number_of_files: 1,
            mime_type: "application/octet-stream",
            keyvalues: { type: "test" },
            group_id: null,
            created_at: "2024-01-01T00:00:00.000Z",
          },
          {
            id: mockCidString2,
            name: "test2.txt",
            cid: mockCidString2,
            size: 200,
            number_of_files: 1,
            mime_type: "application/octet-stream",
            keyvalues: { type: "test" },
            group_id: null,
            created_at: "2024-01-02T00:00:00.000Z",
          },
        ],
        next_page_token: "",
      });
    });

    it("should list files with all()", async () => {
      const mockCidString = await createMockCID(0);
      const mockRemotePins = [
        {
          cid: CID.parse(mockCidString),
          name: "test.txt",
          size: 100,
          created: new Date("2024-01-01"),
          metadata: { type: "test" },
        },
      ];

      vi.mocked(mockPinner.listPins).mockResolvedValue(mockRemotePins as any);

      const adapter = pinataAdapter(mockPinner);
      const filter = adapter.files.public.list();
      const result = await filter.all();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("test.txt");
    });

    it("should iterate files with async iterator", async () => {
      const mockCidString = await createMockCID(0);
      const mockRemotePins = [
        {
          cid: CID.parse(mockCidString),
          name: "test.txt",
          size: 100,
          created: new Date("2024-01-01"),
          metadata: { type: "test" },
        },
      ];

      vi.mocked(mockPinner.listPins).mockResolvedValue(mockRemotePins as any);

      const adapter = pinataAdapter(mockPinner);
      const filter = adapter.files.public.list();

      const items: FileListItem[] = [];
      for await (const item of filter) {
        items.push(item);
      }

      expect(items).toHaveLength(1);
      expect(items[0].name).toBe("test.txt");
    });

    it("should support method chaining", async () => {
      const mockCidString = await createMockCID(0);
      const mockRemotePins = [
        {
          cid: CID.parse(mockCidString),
          name: "test.txt",
          size: 100,
          created: new Date("2024-01-01"),
          metadata: { type: "test" },
        },
      ];

      vi.mocked(mockPinner.listPins).mockResolvedValue(mockRemotePins as any);

      const adapter = pinataAdapter(mockPinner);
      const filter = adapter.files.public.list();
      const result = await filter.limit(10).all();

      expect(mockPinner.listPins).toHaveBeenCalledWith({ limit: 10 });
      expect(result).toHaveLength(1);
    });

    it("should handle pageToken", async () => {
      const mockCidString = await createMockCID(0);
      const mockRemotePins = [
        {
          cid: CID.parse(mockCidString),
          name: "test.txt",
          size: 100,
          created: new Date("2024-01-01"),
          metadata: { type: "test" },
        },
      ];

      vi.mocked(mockPinner.listPins).mockResolvedValue(mockRemotePins as any);

      const adapter = pinataAdapter(mockPinner);
      const filter = adapter.files.public.list();
      await filter.pageToken("123").all();

      expect(mockPinner.listPins).toHaveBeenCalledWith({ limit: undefined });
    });

    it("should handle empty list", async () => {
      vi.mocked(mockPinner.listPins).mockResolvedValue([]);

      const adapter = pinataAdapter(mockPinner);
      const filter = adapter.files.public.list();
      const result = await filter.all();

      expect(result).toHaveLength(0);
    });

    it("should handle file without name", async () => {
      const mockCidString = await createMockCID(0);
      const mockRemotePins = [
        {
          cid: CID.parse(mockCidString),
          name: null,
          size: 100,
          created: new Date("2024-01-01"),
          metadata: {},
        },
      ];

      vi.mocked(mockPinner.listPins).mockResolvedValue(mockRemotePins as any);

      const adapter = pinataAdapter(mockPinner);
      const filter = adapter.files.public.list();
      const result = await filter.all();

      expect(result[0].name).toBeNull();
    });
  });

  describe("FilterFiles private", () => {
    it("should throw error on list", () => {
      const adapter = pinataAdapter(mockPinner);

      expect(() => adapter.files.private.list()).toThrow(
        "Private files are not supported by Pinner"
      );
    });
  });

  describe("FilterQueue", () => {
    it("should create queue filter builder", () => {
      const adapter = pinataAdapter(mockPinner);
      const queue = adapter.files.public.queue();

      expect(queue).toBeDefined();
      expect(queue.cid).toBeInstanceOf(Function);
      expect(queue.status).toBeInstanceOf(Function);
      expect(queue.pageLimit).toBeInstanceOf(Function);
      expect(queue.pageToken).toBeInstanceOf(Function);
      expect(queue.sort).toBeInstanceOf(Function);
      expect(queue.then).toBeInstanceOf(Function);
      expect(queue.all).toBeInstanceOf(Function);
    });

    it("should list queue items", async () => {
      const mockCidString = await createMockCID(0);
      const mockRemotePins = [
        {
          cid: CID.parse(mockCidString),
          name: "test.txt",
          size: 100,
          created: new Date("2024-01-01"),
          metadata: { type: "test" },
          status: "pinned",
        },
      ];

      vi.mocked(mockPinner.listPins).mockResolvedValue(mockRemotePins as any);

      const adapter = pinataAdapter(mockPinner);
      const queue = adapter.files.public.queue();
      const result = await queue.then((response) => response);

      expect(result).toEqual({
        jobs: [
          {
            id: mockCidString,
            cid: mockCidString,
            date_queued: "2024-01-01T00:00:00.000Z",
            name: "test.txt",
            status: "pinned",
            keyvalues: { type: "test" },
            host_nodes: [],
            pin_policy: {
              regions: [],
              version: 1,
            },
          },
        ],
        next_page_token: "",
      });
    });

    it("should list queue items with all()", async () => {
      const mockCidString = await createMockCID(0);
      const mockRemotePins = [
        {
          cid: CID.parse(mockCidString),
          name: "test.txt",
          size: 100,
          created: new Date("2024-01-01"),
          metadata: { type: "test" },
          status: "pinned",
        },
      ];

      vi.mocked(mockPinner.listPins).mockResolvedValue(mockRemotePins as any);

      const adapter = pinataAdapter(mockPinner);
      const queue = adapter.files.public.queue();
      const result = await queue.all();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe("test.txt");
    });

    it("should iterate queue items with async iterator", async () => {
      const mockCidString = await createMockCID(0);
      const mockRemotePins = [
        {
          cid: CID.parse(mockCidString),
          name: "test.txt",
          size: 100,
          created: new Date("2024-01-01"),
          metadata: { type: "test" },
          status: "pinned",
        },
      ];

      vi.mocked(mockPinner.listPins).mockResolvedValue(mockRemotePins as any);

      const adapter = pinataAdapter(mockPinner);
      const queue = adapter.files.public.queue();

      const items: any[] = [];
      for await (const item of queue) {
        items.push(item);
      }

      expect(items).toHaveLength(1);
      expect(items[0].name).toBe("test.txt");
    });

    it("should support method chaining", async () => {
      const mockCidString = await createMockCID(0);
      const mockRemotePins = [
        {
          cid: CID.parse(mockCidString),
          name: "test.txt",
          size: 100,
          created: new Date("2024-01-01"),
          metadata: { type: "test" },
          status: "pinned",
        },
      ];

      vi.mocked(mockPinner.listPins).mockResolvedValue(mockRemotePins as any);

      const adapter = pinataAdapter(mockPinner);
      const queue = adapter.files.public.queue();
      const result = await queue.cid(mockCidString).pageLimit(10).sort("ASC").all();

      expect(mockPinner.listPins).toHaveBeenCalledWith({ limit: 10 });
      expect(result).toHaveLength(1);
    });

    it("should handle empty queue", async () => {
      vi.mocked(mockPinner.listPins).mockResolvedValue([]);

      const adapter = pinataAdapter(mockPinner);
      const queue = adapter.files.public.queue();
      const result = await queue.all();

      expect(result).toHaveLength(0);
    });

    it("should handle queue without status", async () => {
      const mockCidString = await createMockCID(0);
      const mockRemotePins = [
        {
          cid: CID.parse(mockCidString),
          name: "test.txt",
          size: 100,
          created: new Date("2024-01-01"),
          metadata: {},
          status: undefined,
        },
      ];

      vi.mocked(mockPinner.listPins).mockResolvedValue(mockRemotePins as any);

      const adapter = pinataAdapter(mockPinner);
      const queue = adapter.files.public.queue();
      const result = await queue.all();

      expect(result[0].status).toBe("pinned");
    });
  });

  describe("FilterGroups", () => {
    it("should create groups filter builder", () => {
      const adapter = pinataAdapter(mockPinner);
      const groups = adapter.groups.public.list();

      expect(groups).toBeDefined();
      expect(groups.name).toBeInstanceOf(Function);
      expect(groups.limit).toBeInstanceOf(Function);
      expect(groups.pageToken).toBeInstanceOf(Function);
      expect(groups.isPublic).toBeInstanceOf(Function);
      expect(groups.then).toBeInstanceOf(Function);
      expect(groups.all).toBeInstanceOf(Function);
    });

    it("should return empty groups list", async () => {
      const adapter = pinataAdapter(mockPinner);
      const groups = adapter.groups.public.list();
      const result = await groups.all();

      expect(result).toEqual([]);
    });

    it("should return empty groups response", async () => {
      const adapter = pinataAdapter(mockPinner);
      const groups = adapter.groups.public.list();
      const result = await groups.then((response) => response);

      expect(result).toEqual({
        groups: [],
        next_page_token: "",
      });
    });

    it("should support method chaining", async () => {
      const adapter = pinataAdapter(mockPinner);
      const groups = adapter.groups.public.list();
      const result = await groups.name("test").limit(10).all();

      expect(result).toEqual([]);
    });
  });

  describe("FilterGroups private", () => {
    it("should throw error on list", () => {
      const adapter = pinataAdapter(mockPinner);

      expect(() => adapter.groups.private.list()).toThrow(
        "Private groups are not supported by Pinner"
      );
    });
  });
});
