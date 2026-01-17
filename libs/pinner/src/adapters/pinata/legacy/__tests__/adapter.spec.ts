import { beforeEach, describe, expect, it, vi } from "vitest";
import { pinataLegacyAdapter, type PinataLegacyAdapter } from "../adapter";
import type { Pinner } from "@/pinner";
import { createMockCID, createMockUUID } from "@/__tests__/setup";

describe("PinataLegacyAdapter", () => {
  let mockPinner: Pinner;
  let adapter: PinataLegacyAdapter;

  beforeEach(() => {
    mockPinner = {
      uploadAndWait: vi.fn(),
      uploadDirectory: vi.fn(),
      pinByHash: vi.fn(),
      listPins: vi.fn(),
      getPinStatus: vi.fn(),
      setPinMetadata: vi.fn(),
      unpin: vi.fn(),
      unpinByRequestId: vi.fn(),
    } as unknown as Pinner;

    adapter = pinataLegacyAdapter(mockPinner);
  });

  describe("adapter structure", () => {
    it("should have all required methods", () => {
      expect(adapter.pinFileToIPFS).toBeDefined();
      expect(adapter.pinJSONToIPFS).toBeDefined();
      expect(adapter.pinByHash).toBeDefined();
      expect(adapter.pinList).toBeDefined();
      expect(adapter.unpin).toBeDefined();
      expect(adapter.hashMetadata).toBeDefined();
      expect(adapter.createSignedURL).toBeDefined();
      expect(adapter.pinJobs).toBeDefined();
      expect(adapter.topUsageAnalytics).toBeDefined();
      expect(adapter.dateIntervalAnalytics).toBeDefined();
      expect(adapter.swapCid).toBeDefined();
      expect(adapter.swapHistory).toBeDefined();
    });
  });

  describe("pinFileToIPFS", () => {
    it("should pin a file successfully", async () => {
      const file = new File(["content"], "test.txt");
      const cid = await createMockCID(0);
      const mockResult = {
        id: "op-123",
        cid,
        name: "test.txt",
        size: 7,
        mimeType: "text/plain",
        numberOfFiles: 1,
        createdAt: new Date(),
      };
      vi.mocked(mockPinner.uploadAndWait).mockResolvedValue(mockResult);

      const result = await adapter.pinFileToIPFS(file);

      expect(result).toEqual({
        id: cid,
        name: "test.txt",
        cid: cid,
        size: 7,
        created_at: mockResult.createdAt.toISOString(),
        number_of_files: 1,
        mime_type: "application/octet-stream",
        user_id: "",
        group_id: null,
        is_duplicate: null,
        vectorized: null,
      });
      expect(mockPinner.uploadAndWait).toHaveBeenCalledWith(file, {
        name: undefined,
        keyvalues: undefined,
      });
    });

    it("should pin a file with metadata", async () => {
      const file = new File(["content"], "test.txt");
      const cid = await createMockCID(0);
      const mockResult = {
        id: "op-123",
        cid,
        name: "test.txt",
        size: 7,
        mimeType: "text/plain",
        numberOfFiles: 1,
        createdAt: new Date(),
      };
      vi.mocked(mockPinner.uploadAndWait).mockResolvedValue(mockResult);

      const result = await adapter.pinFileToIPFS(file, {
        metadata: {
          name: "custom-name",
          keyvalues: { type: "test", category: "docs" },
        },
      });

      expect(mockPinner.uploadAndWait).toHaveBeenCalledWith(file, {
        name: "custom-name",
        keyvalues: { type: "test", category: "docs" },
      });
      expect(result.id).toBe(cid);
    });
  });

  describe("pinJSONToIPFS", () => {
    it("should pin JSON data successfully", async () => {
      const data = { foo: "bar", nested: { value: 123 } };
      const cid = await createMockCID(0);
      const mockResult = {
        id: "op-123",
        cid,
        name: "data.json",
        size: 31,
        mimeType: "application/json",
        numberOfFiles: 1,
        createdAt: new Date(),
      };
      vi.mocked(mockPinner.uploadAndWait).mockResolvedValue(mockResult);

      const result = await adapter.pinJSONToIPFS(data);

      expect(result).toEqual({
        id: cid,
        name: "data.json",
        cid: cid,
        size: 31,
        created_at: mockResult.createdAt.toISOString(),
        number_of_files: 1,
        mime_type: "application/octet-stream",
        user_id: "",
        group_id: null,
        is_duplicate: null,
        vectorized: null,
      });
    });

    it("should pin JSON with custom name", async () => {
      const data = { foo: "bar" };
      const cid = await createMockCID(0);
      const mockResult = {
        id: "op-123",
        cid,
        name: "custom.json",
        size: 13,
        mimeType: "application/json",
        numberOfFiles: 1,
        createdAt: new Date(),
      };
      vi.mocked(mockPinner.uploadAndWait).mockResolvedValue(mockResult);

      const result = await adapter.pinJSONToIPFS(data, {
        metadata: { name: "custom.json" },
      });

      expect(result.name).toBe("custom.json");
    });

    it("should pin JSON with keyvalues", async () => {
      const data = { foo: "bar" };
      const cid = await createMockCID(0);
      const mockResult = {
        id: "op-123",
        cid,
        name: "data.json",
        size: 13,
        mimeType: "application/json",
        numberOfFiles: 1,
        createdAt: new Date(),
      };
      vi.mocked(mockPinner.uploadAndWait).mockResolvedValue(mockResult);

      const result = await adapter.pinJSONToIPFS(data, {
        metadata: { keyvalues: { type: "config" } },
      });

      expect(mockPinner.uploadAndWait).toHaveBeenCalledWith(
        expect.any(File),
        {
          name: undefined,
          keyvalues: { type: "config" },
        },
      );
    });
  });

  describe("pinByHash", () => {
    it("should pin by CID successfully", async () => {
      const cidString = await createMockCID(0);
      const cidObj = await import("multiformats/cid").then((mod) =>
        mod.CID.parse(cidString),
      );
      const mockPin = {
        cid: cidObj,
        name: "test.txt",
        size: 100,
        created: new Date(),
        status: "pinned" as const,
        metadata: { type: "test" },
      };
      const mockGenerator = (async function* () {
        yield cidObj;
      })();

      vi.mocked(mockPinner.pinByHash).mockResolvedValue(
        mockGenerator as any,
      );
      vi.mocked(mockPinner.getPinStatus).mockResolvedValue(mockPin);

      const result = await adapter.pinByHash(cidString);

      expect(result).toEqual({
        id: cidString,
        name: "test.txt",
        cid: cidString,
        size: 100,
        created_at: mockPin.created.toISOString(),
        number_of_files: 1,
        mime_type: "application/octet-stream",
        user_id: "",
        group_id: null,
        is_duplicate: null,
        vectorized: null,
      });
    });

    it("should pin by CID with options", async () => {
      const cidString = await createMockCID(0);
      const cidObj = await import("multiformats/cid").then((mod) =>
        mod.CID.parse(cidString),
      );
      const mockPin = {
        cid: cidObj,
        name: "custom-name",
        size: 100,
        created: new Date(),
        status: "pinned" as const,
        metadata: { type: "test" },
      };
      const mockGenerator = (async function* () {
        yield cidObj;
      })();

      vi.mocked(mockPinner.pinByHash).mockResolvedValue(
        mockGenerator as any,
      );
      vi.mocked(mockPinner.getPinStatus).mockResolvedValue(mockPin);

      const result = await adapter.pinByHash(cidString, {
        metadata: { name: "custom-name", keyvalues: { type: "test" } },
      });

      expect(mockPinner.pinByHash).toHaveBeenCalledWith(cidObj, {
        name: "custom-name",
        metadata: { type: "test" },
      });
      expect(result.name).toBe("custom-name");
    });
  });

  describe("pinList", () => {
    it("should list pins successfully", async () => {
      const cid1 = await createMockCID(0);
      const cid2 = await createMockCID(1);
      const mockPins = [
        {
          cid: await import("multiformats/cid").then((mod) =>
            mod.CID.parse(cid1),
          ),
          name: "test1.txt",
          size: 100,
          created: new Date(),
          status: "pinned" as const,
          metadata: { type: "test" },
        },
        {
          cid: await import("multiformats/cid").then((mod) =>
            mod.CID.parse(cid2),
          ),
          name: "test2.txt",
          size: 200,
          created: new Date(),
          status: "pinned" as const,
          metadata: { type: "test" },
        },
      ];
      vi.mocked(mockPinner.listPins).mockResolvedValue(mockPins);

      const result = await adapter.pinList();

      expect(result).toEqual({
        files: [
          {
            id: cid1,
            name: "test1.txt",
            cid: cid1,
            size: 100,
            number_of_files: 1,
            mime_type: "application/octet-stream",
            keyvalues: { type: "test" },
            group_id: null,
            created_at: mockPins[0].created.toISOString(),
          },
          {
            id: cid2,
            name: "test2.txt",
            cid: cid2,
            size: 200,
            number_of_files: 1,
            mime_type: "application/octet-stream",
            keyvalues: { type: "test" },
            group_id: null,
            created_at: mockPins[1].created.toISOString(),
          },
        ],
        next_page_token: "",
      });
    });

    it("should list pins with limit", async () => {
      const mockPins = [];
      vi.mocked(mockPinner.listPins).mockResolvedValue(mockPins);

      const result = await adapter.pinList({ limit: 10 });

      expect(mockPinner.listPins).toHaveBeenCalledWith({ limit: 10 });
      expect(result.files).toEqual([]);
    });

    it("should handle empty pin list", async () => {
      vi.mocked(mockPinner.listPins).mockResolvedValue([]);

      const result = await adapter.pinList();

      expect(result).toEqual({
        files: [],
        next_page_token: "",
      });
    });
  });

  describe("unpin", () => {
    it("should unpin successfully", async () => {
      vi.mocked(mockPinner.unpin).mockResolvedValue(undefined);

      const result = await adapter.unpin("QmHash");

      expect(result).toEqual({ message: "Unpinned QmHash" });
      expect(mockPinner.unpin).toHaveBeenCalledWith("QmHash");
    });
  });

  describe("hashMetadata", () => {
    it("should update metadata successfully", async () => {
      vi.mocked(mockPinner.setPinMetadata).mockResolvedValue(undefined);

      const result = await adapter.hashMetadata("QmHash", {
        type: "test",
        category: "docs",
      });

      expect(result).toEqual({
        message: "Updated metadata for QmHash",
      });
      expect(mockPinner.setPinMetadata).toHaveBeenCalledWith("QmHash", {
        type: "test",
        category: "docs",
      });
    });
  });

  describe("createSignedURL", () => {
    it("should create signed URL with default gateway", async () => {
      const result = await adapter.createSignedURL({
        cid: "QmHash",
        expires: 3600,
      });

      expect(result).toBe("https://gateway.lumeweb.com/ipfs/QmHash");
    });

    it("should create signed URL with config gateway", async () => {
      const adapterWithConfig = pinataLegacyAdapter(mockPinner, {
        pinataGateway: "https://config.gateway.com",
      });

      const result = await adapterWithConfig.createSignedURL({
        cid: "QmHash",
        expires: 3600,
      });

      expect(result).toBe("https://config.gateway.com/ipfs/QmHash");
    });
  });

  describe("pinJobs", () => {
    it("should get pin jobs successfully", async () => {
      const cid1 = await createMockCID(0);
      const cid2 = await createMockCID(1);
      const mockPins = [
        {
          cid: await import("multiformats/cid").then((mod) =>
            mod.CID.parse(cid1),
          ),
          name: "test1.txt",
          size: 100,
          created: new Date(),
          status: "pinned" as const,
          metadata: { type: "test" },
        },
        {
          cid: await import("multiformats/cid").then((mod) =>
            mod.CID.parse(cid2),
          ),
          name: "test2.txt",
          size: 200,
          created: new Date(),
          status: "pinned" as const,
          metadata: { type: "test" },
        },
      ];
      vi.mocked(mockPinner.listPins).mockResolvedValue(mockPins);

      const result = await adapter.pinJobs();

      expect(result).toEqual({
        rows: [
          {
            id: cid1,
            ipfs_pin_hash: cid1,
            date_queued: mockPins[0].created.toISOString(),
            name: "test1.txt",
            status: "pinned",
            keyvalues: { type: "test" },
            host_nodes: [],
            pin_policy: {
              regions: [],
              version: 1,
            },
          },
          {
            id: cid2,
            ipfs_pin_hash: cid2,
            date_queued: mockPins[1].created.toISOString(),
            name: "test2.txt",
            status: "pinned",
            keyvalues: { type: "test" },
            host_nodes: [],
            pin_policy: {
              regions: [],
              version: 1,
            },
          },
        ],
      });
    });

    it("should get pin jobs with limit", async () => {
      const mockPins = [];
      vi.mocked(mockPinner.listPins).mockResolvedValue(mockPins);

      const result = await adapter.pinJobs({ limit: 10 });

      expect(mockPinner.listPins).toHaveBeenCalledWith({ limit: 10 });
      expect(result.rows).toEqual([]);
    });
  });

  describe("topUsageAnalytics", () => {
    it("should return empty analytics data", async () => {
      const result = await adapter.topUsageAnalytics({
        gateway_domain: "gateway.lumeweb.com",
        start_date: "2024-01-01",
        end_date: "2024-01-31",
        sort_by: "requests",
        attribute: "cid",
      });

      expect(result).toEqual({
        data: [],
      });
    });
  });

  describe("dateIntervalAnalytics", () => {
    it("should return empty analytics data", async () => {
      const result = await adapter.dateIntervalAnalytics({
        gateway_domain: "gateway.lumeweb.com",
        start_date: "2024-01-01",
        end_date: "2024-01-31",
        date_interval: "day",
      });

      expect(result).toEqual({
        total_requests: 0,
        total_bandwidth: 0,
        time_periods: [],
      });
    });
  });

  describe("swapCid", () => {
    it("should throw error for swap CID", async () => {
      await expect(
        adapter.swapCid({
          cid: "QmHash1",
          swapCid: "QmHash2",
        }),
      ).rejects.toThrow("Swap CID are not supported by Pinner");
    });
  });

  describe("swapHistory", () => {
    it("should return empty swap history", async () => {
      const result = await adapter.swapHistory({
        cid: "QmHash",
        domain: "gateway.lumeweb.com",
      });

      expect(result).toEqual([]);
    });
  });
});
