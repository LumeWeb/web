import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Pinner } from "@/pinner";
import { pinataAdapter, type PinataAdapter } from "@/adapters/pinata/v2";
import { CID } from "multiformats/cid";
import { createMockCID, createMockUUID } from "@/__tests__/setup";

describe("PinataAdapter", () => {
  let mockPinner: Pinner;
  let adapter: PinataAdapter;

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

    adapter = pinataAdapter(mockPinner);
  });

  describe("adapter structure", () => {
    it("should have config property", () => {
      expect(adapter.config).toBeDefined();
      expect(adapter.updateConfig).toBeDefined();
    });

    it("should have upload namespace with public and private", () => {
      expect(adapter.upload).toBeDefined();
      expect(adapter.upload.public).toBeDefined();
      expect(adapter.upload.private).toBeDefined();
    });

    it("should have files namespace with public and private", () => {
      expect(adapter.files).toBeDefined();
      expect(adapter.files.public).toBeDefined();
      expect(adapter.files.private).toBeDefined();
    });

    it("should have gateways namespace with public and private", () => {
      expect(adapter.gateways).toBeDefined();
      expect(adapter.gateways.public).toBeDefined();
      expect(adapter.gateways.private).toBeDefined();
    });

    it("should have groups namespace with public and private", () => {
      expect(adapter.groups).toBeDefined();
      expect(adapter.groups.public).toBeDefined();
      expect(adapter.groups.private).toBeDefined();
    });

    it("should have analytics namespace", () => {
      expect(adapter.analytics).toBeDefined();
    });
  });

  describe("upload.public methods", () => {
    it("should have file upload method", () => {
      expect(adapter.upload.public.file).toBeDefined();
      const file = new File(["content"], "test.txt");
      const builder = adapter.upload.public.file(file);
      expect(builder).toBeDefined();
      expect(builder.name).toBeDefined();
      expect(builder.keyvalues).toBeDefined();
      expect(builder.execute).toBeDefined();
    });

    it("should have fileArray upload method", () => {
      expect(adapter.upload.public.fileArray).toBeDefined();
      const files = [
        new File(["content1"], "test1.txt"),
        new File(["content2"], "test2.txt"),
      ];
      const builder = adapter.upload.public.fileArray(files);
      expect(builder).toBeDefined();
    });

    it("should have json upload method", () => {
      expect(adapter.upload.public.json).toBeDefined();
      const builder = adapter.upload.public.json({ foo: "bar" });
      expect(builder).toBeDefined();
    });

    it("should have base64 upload method", () => {
      expect(adapter.upload.public.base64).toBeDefined();
      const builder = adapter.upload.public.base64("SGVsbG8gV29ybGQ=");
      expect(builder).toBeDefined();
    });

    it("should have url upload method", () => {
      expect(adapter.upload.public.url).toBeDefined();
      const builder = adapter.upload.public.url("https://example.com/file.txt");
      expect(builder).toBeDefined();
    });

    it("should have cid upload method", () => {
      expect(adapter.upload.public.cid).toBeDefined();
      const builder = adapter.upload.public.cid("QmHash");
      expect(builder).toBeDefined();
    });

    it("should have createSignedURL method", () => {
      expect(adapter.upload.public.createSignedURL).toBeDefined();
      expect(typeof adapter.upload.public.createSignedURL).toBe("function");
    });

    it("should upload file successfully", async () => {
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

      const builder = adapter.upload.public.file(file);
      const result = await builder.execute();

      expect(result).toEqual({
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
    });

    it("should upload file with name and keyvalues", async () => {
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

      const builder = adapter.upload.public.file(file, {
        metadata: { name: "custom-name", keyvalues: { type: "test" } },
      });
      const result = await builder.execute();

      expect(mockPinner.uploadAndWait).toHaveBeenCalledWith(file, {
        name: "custom-name",
        keyvalues: { type: "test" },
      });
      expect(result.name).toBe("test.txt");
    });

    it("should upload json successfully", async () => {
      const data = { foo: "bar" };
      const mockResult = {
        cid: await createMockCID(0),
        size: 13,
        createdAt: new Date(),
        id: "op-123",
        name: "test.txt",
        mimeType: "text/plain",
        numberOfFiles: 1,
      };
      vi.mocked(mockPinner.uploadAndWait).mockResolvedValue(mockResult);

      const builder = adapter.upload.public.json(data);
      const result = await builder.execute();

      expect(result.mime_type).toBe("application/json");
      expect(result.name).toBe("data.json");
    });

    it("should upload base64 successfully", async () => {
      const base64 = "SGVsbG8gV29ybGQ=";
      const mockResult = {
        cid: await createMockCID(0),
        size: 11,
        createdAt: new Date(),
        id: "op-123",
        name: "test.txt",
        mimeType: "text/plain",
        numberOfFiles: 1,
      };
      vi.mocked(mockPinner.uploadAndWait).mockResolvedValue(mockResult);

      const builder = adapter.upload.public.base64(base64);
      const result = await builder.execute();

      expect(result.name).toBe("file.bin");
      expect(result.mime_type).toBe("application/octet-stream");
    });

    it("should pin by cid successfully", async () => {
      const cidString = await createMockCID(0);
      const mockCid = CID.parse(cidString);
      const mockGenerator = (async function* () {
        yield mockCid;
      })();

      vi.mocked(mockPinner.pinByHash).mockResolvedValue(mockGenerator as any);

      const builder = adapter.upload.public.cid(cidString, {
        metadata: { name: "test", keyvalues: { type: "test" } },
      });
      const result = await builder.execute();

      expect(result).toEqual({
        id: cidString,
        cid: cidString,
        date_queued: expect.any(String),
        name: "test",
        status: "pinned" as any,
        keyvalues: { type: "test" },
        host_nodes: null,
        group_id: null,
      });
    });

    it("should throw error for url upload", async () => {
      const builder = adapter.upload.public.url("https://example.com/file.txt");
      await expect(builder.execute()).rejects.toThrow("URL upload are not supported by Pinner");
    });

    it("should throw error for signed upload URL", async () => {
      await expect(
        adapter.upload.public.createSignedURL({
          expires: 3600,
        })
      ).rejects.toThrow("Signed upload URLs are not supported by Pinner");
    });
  });

  describe("upload.private methods", () => {
    it("should have all upload methods", () => {
      expect(adapter.upload.private.file).toBeDefined();
      expect(adapter.upload.private.fileArray).toBeDefined();
      expect(adapter.upload.private.json).toBeDefined();
      expect(adapter.upload.private.base64).toBeDefined();
      expect(adapter.upload.private.url).toBeDefined();
      expect(adapter.upload.private.cid).toBeDefined();
      expect(adapter.upload.private.createSignedURL).toBeDefined();
    });

    it("should throw error for private file upload", async () => {
      const file = new File(["content"], "test.txt");
      const builder = adapter.upload.private.file(file);
      await expect(builder.execute()).rejects.toThrow("Private upload are not supported by Pinner");
    });

    it("should throw error for private json upload", async () => {
      const builder = adapter.upload.private.json({ foo: "bar" });
      await expect(builder.execute()).rejects.toThrow("Private upload are not supported by Pinner");
    });

    it("should throw error for private signed URL", async () => {
      await expect(
        adapter.upload.private.createSignedURL({ expires: 3600 })
      ).rejects.toThrow("Private upload are not supported by Pinner");
    });
  });

  describe("files.public methods", () => {
    it("should have list method", () => {
      expect(adapter.files.public.list).toBeDefined();
      const filter = adapter.files.public.list();
      expect(filter).toBeDefined();
      expect(filter.name).toBeDefined();
      expect(filter.group).toBeDefined();
      expect(filter.cid).toBeDefined();
      expect(filter.mimeType).toBeDefined();
      expect(filter.order).toBeDefined();
      expect(filter.limit).toBeDefined();
      expect(filter.cidPending).toBeDefined();
      expect(filter.keyvalues).toBeDefined();
      expect(filter.noGroup).toBeDefined();
      expect(filter.pageToken).toBeDefined();
      expect(filter.then).toBeDefined();
      expect(filter.all).toBeDefined();
    });

    it("should have get method", async () => {
      const cidString = await createMockCID(0);
      const mockPin = {
        cid: CID.parse(cidString),
        name: "test.txt",
        size: 100,
        created: new Date(),
        status: "pinned" as any,
        metadata: { type: "test" },
      };
      vi.mocked(mockPinner.getPinStatus).mockResolvedValue(mockPin);

      const result = await adapter.files.public.get(cidString);

      expect(result).toEqual({
        id: cidString,
        name: "test.txt",
        cid: cidString,
        size: 100,
        number_of_files: 1,
        mime_type: "application/octet-stream",
        keyvalues: { type: "test" },
        group_id: null,
        created_at: mockPin.created.toISOString(),
      });
    });

    it("should have delete method", async () => {
      const cidString = await createMockCID(0);
      vi.mocked(mockPinner.unpin).mockResolvedValue(undefined);

      const result = await adapter.files.public.delete([cidString]);

      expect(result).toEqual([{ id: cidString, status: "deleted" }]);
      expect(mockPinner.unpin).toHaveBeenCalledWith(cidString);
    });

    it("should have update method", async () => {
      const cidString = await createMockCID(0);
      const mockPin = {
        cid: CID.parse(cidString),
        name: "test.txt",
        size: 100,
        created: new Date(),
        status: "pinned" as any,
        metadata: { type: "updated" },
      };
      vi.mocked(mockPinner.setPinMetadata).mockResolvedValue(undefined);
      vi.mocked(mockPinner.getPinStatus).mockResolvedValue(mockPin);

      const result = await adapter.files.public.update({
        id: cidString,
        keyvalues: { type: "updated" },
      });

      expect(mockPinner.setPinMetadata).toHaveBeenCalledWith(cidString, { type: "updated" });
      expect(result.keyvalues).toEqual({ type: "updated" });
    });

    it("should have addSwap method", async () => {
      await expect(
        adapter.files.public.addSwap({ cid: "QmOld", swapCid: "QmNew" })
      ).rejects.toThrow("Swap CID are not supported by Pinner");
    });

    it("should have getSwapHistory method", async () => {
      const result = await adapter.files.public.getSwapHistory({ cid: "QmHash", domain: "test" });
      expect(result).toEqual([]);
    });

    it("should have deleteSwap method", async () => {
      await expect(adapter.files.public.deleteSwap("QmHash")).rejects.toThrow(
        "Swap CID are not supported by Pinner"
      );
    });

    it("should have queue method", () => {
      expect(adapter.files.public.queue).toBeDefined();
      const queue = adapter.files.public.queue();
      expect(queue).toBeDefined();
      expect(queue.cid).toBeDefined();
      expect(queue.status).toBeDefined();
      expect(queue.pageLimit).toBeDefined();
      expect(queue.pageToken).toBeDefined();
      expect(queue.sort).toBeDefined();
    });

    it("should have deletePinRequest method", async () => {
      await adapter.files.public.deletePinRequest("QmHash");
      expect(mockPinner.unpinByRequestId).toHaveBeenCalledWith("QmHash");
    });

    it("should list files with filter", async () => {
      const mockPins = [
        {
          cid: CID.parse(await createMockCID(0)),
          name: "test1.txt",
          size: 100,
          created: new Date(),
          metadata: { type: "test" },
        },
        {
          cid: CID.parse(await createMockCID(0)),
          name: "test2.txt",
          size: 200,
          created: new Date(),
          metadata: { type: "test" },
        },
      ];
      vi.mocked(mockPinner.listPins).mockResolvedValue(mockPins as any);

      const filter = adapter.files.public.list();
      const result = await filter.all();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe("test1.txt");
      expect(result[1].name).toBe("test2.txt");
    });
  });

  describe("files.private methods", () => {
    it("should have all file methods", () => {
      expect(adapter.files.private.list).toBeDefined();
      expect(adapter.files.private.get).toBeDefined();
      expect(adapter.files.private.delete).toBeDefined();
      expect(adapter.files.private.update).toBeDefined();
      expect(adapter.files.private.addSwap).toBeDefined();
      expect(adapter.files.private.getSwapHistory).toBeDefined();
      expect(adapter.files.private.deleteSwap).toBeDefined();
      expect(adapter.files.private.queue).toBeDefined();
      expect(adapter.files.private.deletePinRequest).toBeDefined();
    });

    it("should throw error for private list", () => {
      expect(() => adapter.files.private.list()).toThrow("Private files are not supported by Pinner");
    });

    it("should throw error for private get", async () => {
      await expect(adapter.files.private.get("QmHash")).rejects.toThrow(
        "Private files are not supported by Pinner"
      );
    });

    it("should throw error for private delete", async () => {
      await expect(adapter.files.private.delete(["QmHash"])).rejects.toThrow(
        "Private files are not supported by Pinner"
      );
    });

    it("should throw error for private update", async () => {
      await expect(
        adapter.files.private.update({ id: "QmHash", keyvalues: { type: "test" } })
      ).rejects.toThrow("Private files are not supported by Pinner");
    });
  });

  describe("gateways.public methods", () => {
    it("should have get method", () => {
      const result = adapter.gateways.public.get("QmHash");
      expect(result).toBeDefined();
      expect(result.cid).toBe("QmHash");
      expect(result.url).toContain("QmHash");
    });

    it("should have convert method", async () => {
      const result = await adapter.gateways.public.convert("ipfs://QmHash");
      expect(result).toContain("QmHash");
      expect(result).not.toContain("ipfs://");
    });

    it("should use custom gateway", () => {
      const customAdapter = pinataAdapter(mockPinner, {
        pinataGateway: "https://custom.gateway.com",
      });
      const result = customAdapter.gateways.public.get("QmHash");
      expect(result.gateway).toBe("https://custom.gateway.com");
      expect(result.url).toBe("https://custom.gateway.com/ipfs/QmHash");
    });
  });

  describe("gateways.private methods", () => {
    it("should have get method", () => {
      expect(() => adapter.gateways.private.get("QmHash")).toThrow(
        "Private gateways are not supported by Pinner"
      );
    });

    it("should have createAccessLink method", () => {
      expect(() =>
        adapter.gateways.private.createAccessLink({ cid: "QmHash", expires: 3600 })
      ).toThrow("Private gateways are not supported by Pinner");
    });
  });

  describe("groups.public methods", () => {
    it("should have all group methods", () => {
      expect(adapter.groups.public.create).toBeDefined();
      expect(adapter.groups.public.list).toBeDefined();
      expect(adapter.groups.public.get).toBeDefined();
      expect(adapter.groups.public.addFiles).toBeDefined();
      expect(adapter.groups.public.removeFiles).toBeDefined();
      expect(adapter.groups.public.update).toBeDefined();
      expect(adapter.groups.public.delete).toBeDefined();
    });

    it("should throw error for create", async () => {
      await expect(adapter.groups.public.create({ name: "test" })).rejects.toThrow(
        "Groups are not supported by Pinner"
      );
    });

    it("should return empty list", async () => {
      const filter = adapter.groups.public.list();
      const result = await filter.all();
      expect(result).toEqual([]);
    });

    it("should throw error for get", async () => {
      await expect(adapter.groups.public.get({ groupId: "group-id" })).rejects.toThrow(
        "Groups are not supported by Pinner"
      );
    });

    it("should throw error for addFiles", async () => {
      await expect(
        adapter.groups.public.addFiles({ groupId: "group-id", files: ["QmHash"] })
      ).rejects.toThrow("Groups are not supported by Pinner");
    });

    it("should throw error for removeFiles", async () => {
      await expect(
        adapter.groups.public.removeFiles({ groupId: "group-id", files: ["QmHash"] })
      ).rejects.toThrow("Groups are not supported by Pinner");
    });

    it("should throw error for update", async () => {
      await expect(adapter.groups.public.update({ groupId: "group-id", name: "new-name" })).rejects.toThrow(
        "Groups are not supported by Pinner"
      );
    });

    it("should throw error for delete", async () => {
      await expect(adapter.groups.public.delete({ groupId: "group-id" })).rejects.toThrow(
        "Groups are not supported by Pinner"
      );
    });
  });

  describe("groups.private methods", () => {
    it("should have all group methods", () => {
      expect(adapter.groups.private.create).toBeDefined();
      expect(adapter.groups.private.list).toBeDefined();
      expect(adapter.groups.private.get).toBeDefined();
      expect(adapter.groups.private.addFiles).toBeDefined();
      expect(adapter.groups.private.removeFiles).toBeDefined();
      expect(adapter.groups.private.update).toBeDefined();
      expect(adapter.groups.private.delete).toBeDefined();
    });

    it("should throw error for create", async () => {
      await expect(adapter.groups.private.create({ name: "test" })).rejects.toThrow(
        "Private groups are not supported by Pinner"
      );
    });

    it("should throw error for list", () => {
      expect(() => adapter.groups.private.list()).toThrow(
        "Private groups are not supported by Pinner"
      );
    });
  });

  describe("analytics methods", () => {
    it("should have requests method", async () => {
      const result = await adapter.analytics.requests({
        gateway_domain: "gateway.pinata.cloud",
        start_date: "2024-01-01",
        end_date: "2024-01-31",
        sort_by: "requests",
        attribute: "cid",
      });

      expect(result).toEqual({ data: [] });
    });

    it("should have bandwidth method", async () => {
      const result = await adapter.analytics.bandwidth({
        gateway_domain: "gateway.pinata.cloud",
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

  describe("config management", () => {
    it("should update config", () => {
      adapter.updateConfig({
        pinataGateway: "https://updated.gateway.com",
      });

      expect(adapter.config.pinataGateway).toBe("https://updated.gateway.com");
    });

    it("should accept initial config", () => {
      const customAdapter = pinataAdapter(mockPinner, {
        pinataGateway: "https://custom.gateway.com",
        pinataJwt: "test-jwt",
      });

      expect(customAdapter.config.pinataGateway).toBe("https://custom.gateway.com");
      expect(customAdapter.config.pinataJwt).toBe("test-jwt");
    });
  });
});
