import { beforeEach, describe, expect, it, vi } from "vitest";
import { PinClient } from "../client";
import type { PinnerConfig } from "@/config";
import { ConfigurationError, NotFoundError } from "@/errors";
import { CID } from "multiformats/cid";
import type { RemotePinningServiceClient } from "@ipfs-shipyard/pinning-service-client";
import { Status } from "@ipfs-shipyard/pinning-service-client";
import type { RemotePin } from "@/types/pin";
import { createMockCID } from "@/__tests__/setup";

// Test helper class to expose protected method for testing
class TestPinClient extends PinClient {
  public override getClient(): RemotePinningServiceClient {
    return super.getClient();
  }
}

describe("PinClient", () => {
  let mockConfig: PinnerConfig;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockConfig = {
      jwt: "test-jwt-token",
      endpoint: "https://api.test.com",
      gateway: "https://gateway.test.com",
    };

    // Mock fetch implementation
    mockFetch = vi.fn();
  });

  describe("constructor", () => {
    it("should create a PinClient instance with valid config", () => {
      const client = new PinClient(mockConfig);
      expect(client).toBeInstanceOf(PinClient);
    });

    it("should accept custom fetch implementation", () => {
      const configWithFetch = {
        ...mockConfig,
        fetch: mockFetch as any,
      };
      const client = new PinClient(configWithFetch);
      expect(client).toBeInstanceOf(PinClient);
    });
  });

  describe("getClient", () => {
    it("should throw ConfigurationError when JWT is missing", () => {
      const invalidConfig = {
        ...mockConfig,
        jwt: undefined as unknown as string,
      };
      const client = new TestPinClient(invalidConfig);

      expect(() => client.getClient()).toThrow(ConfigurationError);
      expect(() => client.getClient()).toThrow("JWT token is required");
    });

    it("should reuse existing client instance", async () => {
      const client = new TestPinClient(mockConfig);
      const client1 = client.getClient();
      const client2 = client.getClient();

      expect(client1).toBe(client2);
    });
  });

  describe("add", () => {
    it("should successfully add a pin with CID only", async () => {
      const mockCid = await createMockCID(0);
      const mockPinningClient = {
        pinsPost: vi.fn().mockResolvedValue({
          requestid: "req-123",
          status: "pinned",
          created: new Date().toISOString(),
          pin: {
            cid: mockCid,
          },
        }),
      };

      const client = new TestPinClient(mockConfig);
      vi.spyOn(client, "getClient").mockReturnValue(mockPinningClient as any);

      const cid = CID.parse(mockCid);
      const result: CID[] = [];

      for await (const item of client.add(cid)) {
        result.push(item);
      }

      expect(mockPinningClient.pinsPost).toHaveBeenCalledWith(
        {
          pin: {
            cid: cid.toString(),
            name: undefined,
            meta: undefined,
            origins: undefined,
          },
        },
        { signal: undefined },
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(cid);
    });

    it("should successfully add a pin with options", async () => {
      const mockCid = await createMockCID(1);
      const mockPinningClient = {
        pinsPost: vi.fn().mockResolvedValue({
          requestid: "req-123",
          status: "pinned",
          created: new Date().toISOString(),
          pin: {
            cid: mockCid,
            name: "test-pin",
            meta: { size: "1024", custom: "value" },
            origins: ["https://example.com"],
          },
        }),
      };

      const client = new TestPinClient(mockConfig);
      vi.spyOn(client, "getClient").mockReturnValue(mockPinningClient as any);

      const cid = CID.parse(mockCid);
      const result: CID[] = [];

      for await (const item of client.add(cid, {
        name: "test-pin",
        metadata: { size: "1024", custom: "value" },
        origins: ["https://example.com"],
      })) {
        result.push(item);
      }

      expect(mockPinningClient.pinsPost).toHaveBeenCalledWith(
        {
          pin: {
            cid: cid.toString(),
            name: "test-pin",
            meta: { size: "1024", custom: "value" },
            origins: ["https://example.com"],
          },
        },
        { signal: undefined },
      );
      expect(result).toHaveLength(1);
    });

    it("should propagate errors from the pinning service", async () => {
      const mockPinningClient = {
        pinsPost: vi.fn().mockRejectedValue(new Error("Failed to pin")),
      };

      const client = new TestPinClient(mockConfig);
      vi.spyOn(client, "getClient").mockReturnValue(mockPinningClient as any);

      const cid = CID.parse(await createMockCID(2));

      await expect(async () => {
        for await (const item of client.add(cid)) {
          item;
        }
      }).rejects.toThrow("Failed to pin");
    });
  });

  describe("ls", () => {
    it("should successfully list all pins", async () => {
      const mockCid1 = await createMockCID(3);
      const mockCid2 = await createMockCID(4);
      const mockPinningClient = {
        pinsGet: vi.fn().mockResolvedValue({
          count: 2,
          results: [
            {
              requestid: "req-1",
              status: "pinned",
              created: new Date().toISOString(),
              pin: {
                cid: mockCid1,
                name: "pin-1",
                meta: { size: "1024" },
              },
            },
            {
              requestid: "req-2",
              status: "pinned",
              created: new Date().toISOString(),
              pin: {
                cid: mockCid2,
                name: "pin-2",
                meta: { size: "2048" },
              },
            },
          ],
        }),
      };

      const client = new TestPinClient(mockConfig);
      vi.spyOn(client, "getClient").mockReturnValue(mockPinningClient as any);

      const pins: RemotePin[] = [];
      for await (const pin of client.ls()) {
        pins.push(pin);
      }

      expect(pins).toHaveLength(2);
      expect(pins[0].cid.toString()).toBe(mockCid1);
      expect(pins[0].name).toBe("pin-1");
      expect(pins[0].size).toBe(1024);
      expect(pins[1].cid.toString()).toBe(mockCid2);
      expect(pins[1].size).toBe(2048);
    });

    it("should successfully list pins with options", async () => {
      const mockCid = await createMockCID(5);
      const mockPinningClient = {
        pinsGet: vi.fn().mockResolvedValue({
          count: 1,
          results: [
            {
              requestid: "req-1",
              status: "pinned",
              created: new Date().toISOString(),
              pin: {
                cid: mockCid,
                name: "test-pin",
              },
            },
          ],
        }),
      };

      const client = new TestPinClient(mockConfig);
      vi.spyOn(client, "getClient").mockReturnValue(mockPinningClient as any);

      const pins: RemotePin[] = [];
      for await (const pin of client.ls({
        limit: 10,
        cursor: "cursor-123",
        status: [Status.Pinned],
        name: "test-pin",
      })) {
        pins.push(pin);
      }

      expect(mockPinningClient.pinsGet).toHaveBeenCalledWith(
        {
          limit: 10,
          after: "cursor-123",
          status: [Status.Pinned],
          name: "test-pin",
        },
        { signal: undefined },
      );
      expect(pins).toHaveLength(1);
    });

    it("should handle empty pin list", async () => {
      const mockPinningClient = {
        pinsGet: vi.fn().mockResolvedValue({
          count: 0,
          results: [],
        }),
      };

      const client = new TestPinClient(mockConfig);
      vi.spyOn(client, "getClient").mockReturnValue(mockPinningClient as any);

      const pins: RemotePin[] = [];
      for await (const pin of client.ls()) {
        pins.push(pin);
      }

      expect(pins).toHaveLength(0);
    });

    it("should handle pins without metadata", async () => {
      const mockCid = await createMockCID(6);
      const mockPinningClient = {
        pinsGet: vi.fn().mockResolvedValue({
          count: 1,
          results: [
            {
              requestid: "req-1",
              status: "pinned",
              created: new Date().toISOString(),
              pin: {
                cid: mockCid,
                name: "pin-no-meta",
              },
            },
          ],
        }),
      };

      const client = new TestPinClient(mockConfig);
      vi.spyOn(client, "getClient").mockReturnValue(mockPinningClient as any);

      const pins: RemotePin[] = [];
      for await (const pin of client.ls()) {
        pins.push(pin);
      }

      expect(pins).toHaveLength(1);
      expect(pins[0].size).toBeUndefined();
      expect(pins[0].metadata).toBeUndefined();
    });
  });

  describe("isPinned", () => {
    it("should return true when pin exists", async () => {
      const mockCid = await createMockCID(7);
      const mockPinningClient = {
        pinsGet: vi.fn().mockResolvedValue({
          count: 1,
          results: [
            {
              requestid: "req-1",
              status: "pinned",
              created: new Date().toISOString(),
              pin: {
                cid: mockCid,
              },
            },
          ],
        }),
      };

      const client = new TestPinClient(mockConfig);
      vi.spyOn(client, "getClient").mockReturnValue(mockPinningClient as any);

      const cid = CID.parse(mockCid);
      const result = await client.isPinned(cid);

      expect(result).toBe(true);
    });

    it("should return false when pin does not exist", async () => {
      const mockCid = await createMockCID(8);
      const mockPinningClient = {
        pinsGet: vi.fn().mockResolvedValue({
          count: 0,
          results: [],
        }),
      };

      const client = new TestPinClient(mockConfig);
      vi.spyOn(client, "getClient").mockReturnValue(mockPinningClient as any);

      const cid = CID.parse(mockCid);
      const result = await client.isPinned(cid);

      expect(result).toBe(false);
    });

    it("should return false when pinning service throws error", async () => {
      const mockCid = await createMockCID(9);
      const mockPinningClient = {
        pinsGet: vi.fn().mockRejectedValue(new Error("Pin not found")),
      };

      const client = new TestPinClient(mockConfig);
      vi.spyOn(client, "getClient").mockReturnValue(mockPinningClient as any);

      const cid = CID.parse(mockCid);
      const result = await client.isPinned(cid);

      expect(result).toBe(false);
    });
  });

  describe("get", () => {
    it("should successfully get pin details", async () => {
      const mockCid = await createMockCID(10);
      const mockPinningClient = {
        pinsGet: vi.fn().mockResolvedValue({
          count: 1,
          results: [
            {
              requestid: "req-1",
              status: "pinned",
              created: new Date("2024-01-01T00:00:00.000Z").toISOString(),
              pin: {
                cid: mockCid,
                name: "test-pin",
                meta: {
                  size: "1024",
                  custom: "value",
                },
                origins: ["https://example.com"],
              },
            },
          ],
        }),
      };

      const client = new TestPinClient(mockConfig);
      vi.spyOn(client, "getClient").mockReturnValue(mockPinningClient as any);

      const cid = CID.parse(mockCid);
      const pin = await client.get(cid);

      expect(pin.cid.toString()).toBe(mockCid);
      expect(pin.name).toBe("test-pin");
      expect(pin.status).toBe("pinned");
      expect(pin.size).toBe(1024);
      expect(pin.metadata).toEqual({
        size: "1024",
        custom: "value",
      });
      expect(pin.created).toEqual(
        new Date("2024-01-01T00:00:00.000Z").toISOString(),
      );
    });

    it("should throw NotFoundError when pin does not exist", async () => {
      const mockCid = await createMockCID(11);
      const mockPinningClient = {
        pinsGet: vi.fn().mockResolvedValue({
          count: 0,
          results: [],
        }),
      };

      const client = new TestPinClient(mockConfig);
      vi.spyOn(client, "getClient").mockReturnValue(mockPinningClient as any);

      const cid = CID.parse(mockCid);

      await expect(client.get(cid)).rejects.toThrow(NotFoundError);
      await expect(client.get(cid)).rejects.toThrow("Pin not found");
    });

    it("should propagate errors from the pinning service", async () => {
      const mockCid = await createMockCID(12);
      const mockPinningClient = {
        pinsGet: vi.fn().mockRejectedValue(new Error("Service error")),
      };

      const client = new TestPinClient(mockConfig);
      vi.spyOn(client, "getClient").mockReturnValue(mockPinningClient as any);

      const cid = CID.parse(mockCid);

      await expect(client.get(cid)).rejects.toThrow("Service error");
    });
  });

  describe("setMetadata", () => {
    it("should successfully update pin metadata", async () => {
      const mockCid = await createMockCID(13);
      const mockPinningClient = {
        pinsGet: vi.fn().mockResolvedValue({
          count: 1,
          results: [
            {
              requestid: "req-1",
              status: "pinned",
              created: new Date().toISOString(),
              pin: {
                cid: mockCid,
                name: "test-pin",
                meta: { old: "value" },
                origins: ["https://example.com"],
              },
            },
          ],
        }),
        pinsRequestidPost: vi.fn().mockResolvedValue({
          requestid: "req-1",
          status: "pinned",
          created: new Date().toISOString(),
          pin: {
            cid: mockCid,
            name: "test-pin",
            meta: { new: "value" },
            origins: ["https://example.com"],
          },
        }),
      };

      const client = new TestPinClient(mockConfig);
      vi.spyOn(client, "getClient").mockReturnValue(mockPinningClient as any);

      const cid = CID.parse(mockCid);

      await client.setMetadata(cid, { new: "value" });

      expect(mockPinningClient.pinsGet).toHaveBeenCalledWith(
        {
          cid: [mockCid],
        },
        { signal: undefined },
      );
      expect(mockPinningClient.pinsRequestidPost).toHaveBeenCalledWith(
        {
          requestid: "req-1",
          pin: {
            cid: mockCid,
            name: "test-pin",
            meta: { new: "value" },
            origins: ["https://example.com"],
          },
        },
        { signal: undefined },
      );
    });

    it("should successfully clear pin metadata", async () => {
      const mockCid = await createMockCID(14);
      const mockPinningClient = {
        pinsGet: vi.fn().mockResolvedValue({
          count: 1,
          results: [
            {
              requestid: "req-1",
              status: "pinned",
              created: new Date().toISOString(),
              pin: {
                cid: mockCid,
                name: "test-pin",
                meta: { old: "value" },
                origins: ["https://example.com"],
              },
            },
          ],
        }),
        pinsRequestidPost: vi.fn().mockResolvedValue({
          requestid: "req-1",
          status: "pinned",
          created: new Date().toISOString(),
          pin: {
            cid: mockCid,
            name: "test-pin",
            meta: undefined,
            origins: ["https://example.com"],
          },
        }),
      };

      const client = new TestPinClient(mockConfig);
      vi.spyOn(client, "getClient").mockReturnValue(mockPinningClient as any);

      const cid = CID.parse(mockCid);

      await client.setMetadata(cid, undefined);

      expect(mockPinningClient.pinsRequestidPost).toHaveBeenCalledWith(
        {
          requestid: "req-1",
          pin: {
            cid: mockCid,
            name: "test-pin",
            meta: undefined,
            origins: ["https://example.com"],
          },
        },
        { signal: undefined },
      );
    });

    it("should throw Error when pin does not exist", async () => {
      const mockCid = await createMockCID(15);
      const mockPinningClient = {
        pinsGet: vi.fn().mockResolvedValue({
          count: 0,
          results: [],
        }),
      };

      const client = new TestPinClient(mockConfig);
      vi.spyOn(client, "getClient").mockReturnValue(mockPinningClient as any);

      const cid = CID.parse(mockCid);

      await expect(client.setMetadata(cid, { new: "value" })).rejects.toThrow(
        "Pin not found",
      );
    });

    it("should propagate errors from the pinning service", async () => {
      const mockCid = await createMockCID(16);
      const mockPinningClient = {
        pinsGet: vi.fn().mockResolvedValue({
          count: 1,
          results: [
            {
              requestid: "req-1",
              status: "pinned",
              created: new Date().toISOString(),
              pin: {
                cid: mockCid,
                name: "test-pin",
                meta: {},
                origins: [],
              },
            },
          ],
        }),
        pinsRequestidPost: vi
          .fn()
          .mockRejectedValue(new Error("Update failed")),
      };

      const client = new TestPinClient(mockConfig);
      vi.spyOn(client, "getClient").mockReturnValue(mockPinningClient as any);

      const cid = CID.parse(mockCid);

      await expect(client.setMetadata(cid, { new: "value" })).rejects.toThrow(
        "Update failed",
      );
    });
  });

  describe("mapResponse", () => {
    it("should correctly map PinStatus to RemotePin", async () => {
      const mockCid = await createMockCID(17);
      const mockPinningClient = {
        pinsGet: vi.fn().mockResolvedValue({
          count: 1,
          results: [
            {
              requestid: "req-1",
              status: "pinned",
              created: new Date("2024-01-01T00:00:00.000Z").toISOString(),
              pin: {
                cid: mockCid,
                name: "test-pin",
                meta: {
                  size: "1024",
                  custom: "value",
                },
              },
            },
          ],
        }),
      };

      const client = new TestPinClient(mockConfig);
      vi.spyOn(client, "getClient").mockReturnValue(mockPinningClient as any);

      const cid = CID.parse(mockCid);
      const pin = await client.get(cid);

      expect(pin.cid).toBeInstanceOf(CID);
      expect(pin.cid.toString()).toBe(mockCid);
      expect(pin.name).toBe("test-pin");
      expect(pin.status).toBe("pinned");
      expect(pin.size).toBe(1024);
      expect(pin.metadata).toEqual({
        size: "1024",
        custom: "value",
      });
    });

    it("should handle missing size in metadata", async () => {
      const mockCid = await createMockCID(18);
      const mockPinningClient = {
        pinsGet: vi.fn().mockResolvedValue({
          count: 1,
          results: [
            {
              requestid: "req-1",
              status: "pinned",
              created: new Date().toISOString(),
              pin: {
                cid: mockCid,
                name: "test-pin",
                meta: {
                  custom: "value",
                },
              },
            },
          ],
        }),
      };

      const client = new TestPinClient(mockConfig);
      vi.spyOn(client, "getClient").mockReturnValue(mockPinningClient as any);

      const cid = CID.parse(mockCid);
      const pin = await client.get(cid);

      expect(pin.size).toBeUndefined();
    });

    it("should handle invalid size in metadata", async () => {
      const mockCid = await createMockCID(19);
      const mockPinningClient = {
        pinsGet: vi.fn().mockResolvedValue({
          count: 1,
          results: [
            {
              requestid: "req-1",
              status: "pinned",
              created: new Date().toISOString(),
              pin: {
                cid: mockCid,
                name: "test-pin",
                meta: {
                  size: "invalid",
                },
              },
            },
          ],
        }),
      };

      const client = new TestPinClient(mockConfig);
      vi.spyOn(client, "getClient").mockReturnValue(mockPinningClient as any);

      const cid = CID.parse(mockCid);
      const pin = await client.get(cid);

      expect(pin.size).toBeNaN();
    });
  });

  describe("normalizeListOptions", () => {
    it("should normalize list options correctly", async () => {
      const mockCid = await createMockCID(20);
      const mockPinningClient = {
        pinsGet: vi.fn().mockResolvedValue({
          count: 1,
          results: [
            {
              requestid: "req-1",
              status: "pinned",
              created: new Date().toISOString(),
              pin: {
                cid: mockCid,
              },
            },
          ],
        }),
      };

      const client = new TestPinClient(mockConfig);
      vi.spyOn(client, "getClient").mockReturnValue(mockPinningClient as any);

      const pins: RemotePin[] = [];
      for await (const pin of client.ls({
        limit: 10,
        cursor: "cursor-123",
        status: [Status.Pinned, Status.Pinning],
        name: "test-pin",
      })) {
        pins.push(pin);
      }

      expect(mockPinningClient.pinsGet).toHaveBeenCalledWith(
        {
          limit: 10,
          after: "cursor-123",
          status: [Status.Pinned, Status.Pinning],
          name: "test-pin",
        },
        { signal: undefined },
      );
    });

    it("should handle undefined options", async () => {
      const mockPinningClient = {
        pinsGet: vi.fn().mockResolvedValue({
          count: 0,
          results: [],
        }),
      };

      const client = new TestPinClient(mockConfig);
      vi.spyOn(client, "getClient").mockReturnValue(mockPinningClient as any);

      const pins: RemotePin[] = [];
      for await (const pin of client.ls()) {
        pins.push(pin);
      }

      expect(mockPinningClient.pinsGet).toHaveBeenCalledWith(
        {},
        { signal: undefined },
      );
    });

    it("should handle partial options", async () => {
      const mockPinningClient = {
        pinsGet: vi.fn().mockResolvedValue({
          count: 0,
          results: [],
        }),
      };

      const client = new TestPinClient(mockConfig);
      vi.spyOn(client, "getClient").mockReturnValue(mockPinningClient as any);

      const pins: RemotePin[] = [];
      for await (const pin of client.ls({
        limit: 5,
      })) {
        pins.push(pin);
      }

      expect(mockPinningClient.pinsGet).toHaveBeenCalledWith(
        {
          limit: 5,
        },
        { signal: undefined },
      );
    });
  });

  describe("rm", () => {
    it("should successfully remove a pin", async () => {
      const mockCid = await createMockCID(21);
      const mockPinningClient = {
        pinsGet: vi.fn().mockResolvedValue({
          count: 1,
          results: [
            {
              requestid: "req-1",
              status: "pinned",
              created: new Date().toISOString(),
              pin: {
                cid: mockCid,
                name: "test-pin",
                meta: {},
                origins: [],
              },
            },
          ],
        }),
        pinsRequestidDelete: vi.fn().mockResolvedValue({
          status: "deleted",
        }),
      };

      const client = new TestPinClient(mockConfig);
      vi.spyOn(client, "getClient").mockReturnValue(mockPinningClient as any);

      const cid = CID.parse(mockCid);
      const result: CID[] = [];

      for await (const item of client.rm(cid)) {
        result.push(item);
      }

      expect(mockPinningClient.pinsGet).toHaveBeenCalledWith(
        {
          cid: [mockCid],
        },
        { signal: undefined },
      );
      expect(mockPinningClient.pinsRequestidDelete).toHaveBeenCalledWith(
        {
          requestid: "req-1",
        },
        { signal: undefined },
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(cid);
    });

    it("should remove a pin with options", async () => {
      const mockCid = await createMockCID(22);
      const mockPinningClient = {
        pinsGet: vi.fn().mockResolvedValue({
          count: 1,
          results: [
            {
              requestid: "req-1",
              status: "pinned",
              created: new Date().toISOString(),
              pin: {
                cid: mockCid,
                name: "test-pin",
                meta: {},
                origins: [],
              },
            },
          ],
        }),
        pinsRequestidDelete: vi.fn().mockResolvedValue({
          status: "deleted",
        }),
      };

      const client = new TestPinClient(mockConfig);
      vi.spyOn(client, "getClient").mockReturnValue(mockPinningClient as any);

      const cid = CID.parse(mockCid);
      const abortController = new AbortController();

      const result: CID[] = [];
      for await (const item of client.rm(cid, {
        signal: abortController.signal,
      })) {
        result.push(item);
      }

      expect(mockPinningClient.pinsGet).toHaveBeenCalledWith(
        {
          cid: [mockCid],
        },
        { signal: abortController.signal },
      );
      expect(mockPinningClient.pinsRequestidDelete).toHaveBeenCalledWith(
        {
          requestid: "req-1",
        },
        { signal: abortController.signal },
      );
    });

    it("should handle removal of pin with multiple requestids", async () => {
      const mockCid = await createMockCID(23);
      const mockPinningClient = {
        pinsGet: vi.fn().mockResolvedValue({
          count: 2,
          results: [
            {
              requestid: "req-1",
              status: "pinned",
              created: new Date().toISOString(),
              pin: {
                cid: mockCid,
                name: "test-pin-1",
                meta: {},
                origins: [],
              },
            },
            {
              requestid: "req-2",
              status: "pinned",
              created: new Date().toISOString(),
              pin: {
                cid: mockCid,
                name: "test-pin-2",
                meta: {},
                origins: [],
              },
            },
          ],
        }),
        pinsRequestidDelete: vi.fn().mockResolvedValue({
          status: "deleted",
        }),
      };

      const client = new TestPinClient(mockConfig);
      vi.spyOn(client, "getClient").mockReturnValue(mockPinningClient as any);

      const cid = CID.parse(mockCid);
      const result: CID[] = [];

      for await (const item of client.rm(cid)) {
        result.push(item);
      }

      expect(mockPinningClient.pinsRequestidDelete).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(cid);
    });

    it("should propagate errors from the pinning service", async () => {
      const mockCid = await createMockCID(24);
      const mockPinningClient = {
        pinsGet: vi.fn().mockResolvedValue({
          count: 1,
          results: [
            {
              requestid: "req-1",
              status: "pinned",
              created: new Date().toISOString(),
              pin: {
                cid: mockCid,
                name: "test-pin",
                meta: {},
                origins: [],
              },
            },
          ],
        }),
        pinsRequestidDelete: vi
          .fn()
          .mockRejectedValue(new Error("Failed to delete pin")),
      };

      const client = new TestPinClient(mockConfig);
      vi.spyOn(client, "getClient").mockReturnValue(mockPinningClient as any);

      const cid = CID.parse(mockCid);

      await expect(async () => {
        for await (const item of client.rm(cid)) {
          item;
        }
      }).rejects.toThrow("Failed to delete pin");
    });

    it("should handle removal of non-existent pin", async () => {
      const mockCid = await createMockCID(25);
      const mockPinningClient = {
        pinsGet: vi.fn().mockResolvedValue({
          count: 0,
          results: [],
        }),
        pinsRequestidDelete: vi.fn(),
      };

      const client = new TestPinClient(mockConfig);
      vi.spyOn(client, "getClient").mockReturnValue(mockPinningClient as any);

      const cid = CID.parse(mockCid);
      const result: CID[] = [];

      for await (const item of client.rm(cid)) {
        result.push(item);
      }

      // Should still return the CID even if no pins were found
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(cid);
      expect(mockPinningClient.pinsRequestidDelete).not.toHaveBeenCalled();
    });
  });
});
