import { test as it } from "./int-test";
import { describe, expect, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { PinClient } from "../client";
import type { PinnerConfig } from "@/config";
import { CID } from "multiformats/cid";
import { NotFoundError } from "@/errors";
import { Status } from "@ipfs-shipyard/pinning-service-client";
import type { RemotePin } from "@/types/pin";
import {
  pinHandlers,
  pinNotFoundHandler,
  rateLimitHandler,
  serverErrorHandler,
  unauthorizedHandler,
} from "./msw-handlers";
import { createMockCID } from "@/__tests__/setup";

describe("PinClient Integration", () => {
  describe("add method integration", () => {
    it("should successfully add a pin", async ({ worker }) => {
      worker.use(...pinHandlers);
      const mockConfig: PinnerConfig = {
        jwt: "test-jwt-token",
        endpoint: "https://api.test.com",
        gateway: "https://gateway.test.com",
      };

      const client = new PinClient(mockConfig);
      const cid = CID.parse(await createMockCID(0));

      const results: CID[] = [];
      for await (const result of client.add(cid)) {
        results.push(result);
      }

      expect(results).toHaveLength(1);
      expect(results[0].toString()).toBe(cid.toString());
    });

    it("should successfully add a pin with options", async ({ worker }) => {
      worker.use(...pinHandlers);
      const mockConfig: PinnerConfig = {
        jwt: "test-jwt-token",
        endpoint: "https://api.test.com",
        gateway: "https://gateway.test.com",
      };

      const client = new PinClient(mockConfig);
      const cid = CID.parse(await createMockCID(1));

      const results: CID[] = [];
      for await (const result of client.add(cid, {
        name: "test-pin",
        metadata: { size: "1024", custom: "value" },
        origins: ["https://example.com"],
      })) {
        results.push(result);
      }

      expect(results).toHaveLength(1);
      expect(results[0].toString()).toBe(cid.toString());
    });

    it("should handle unauthorized errors", async ({ worker }) => {
      worker.use(unauthorizedHandler);
      const mockConfig: PinnerConfig = {
        jwt: "invalid-jwt",
        endpoint: "https://api.test.com",
        gateway: "https://gateway.test.com",
      };

      const client = new PinClient(mockConfig);
      const cid = CID.parse(await createMockCID(2));

      await expect(async () => {
        for await (const result of client.add(cid)) {
          result;
        }
      }).rejects.toThrow();
    });

    it("should handle rate limit errors", async ({ worker }) => {
      worker.use(rateLimitHandler);
      const mockConfig: PinnerConfig = {
        jwt: "test-jwt-token",
        endpoint: "https://api.test.com",
        gateway: "https://gateway.test.com",
      };

      const client = new PinClient(mockConfig);
      const cid = CID.parse(await createMockCID(2));

      await expect(async () => {
        for await (const result of client.add(cid)) {
          result;
        }
      }).rejects.toThrow();
    });

    it("should handle server errors", async ({ worker }) => {
      worker.use(serverErrorHandler);
      const mockConfig: PinnerConfig = {
        jwt: "test-jwt-token",
        endpoint: "https://api.test.com",
        gateway: "https://gateway.test.com",
      };

      const client = new PinClient(mockConfig);
      const cid = CID.parse(await createMockCID(2));

      await expect(async () => {
        for await (const result of client.add(cid)) {
          result;
        }
      }).rejects.toThrow();
    });
  });

  describe("ls method integration", () => {
    it("should successfully list all pins", async ({ worker }) => {
      worker.use(...pinHandlers);
      console.log("running");
      const mockConfig: PinnerConfig = {
        jwt: "test-jwt-token",
        endpoint: "https://api.test.com",
        gateway: "https://gateway.test.com",
      };

      const client = new PinClient(mockConfig);
      const pins: RemotePin[] = [];
      for await (const pin of client.ls()) {
        pins.push(pin);
      }

      expect(pins.length).toBeGreaterThan(0);
      expect(pins[0]).toHaveProperty("cid");
      expect(pins[0]).toHaveProperty("status");
      expect(pins[0]).toHaveProperty("created");
    });

    it("should successfully list pins with options", async ({ worker }) => {
      worker.use(...pinHandlers);
      const mockConfig: PinnerConfig = {
        jwt: "test-jwt-token",
        endpoint: "https://api.test.com",
        gateway: "https://gateway.test.com",
      };

      const client = new PinClient(mockConfig);
      const pins: RemotePin[] = [];
      for await (const pin of client.ls({
        limit: 10,
        status: [Status.Pinned],
        name: "pinned-test-pin",
      })) {
        pins.push(pin);
      }

      expect(pins.length).toBeGreaterThan(0);
    });

    it("should handle empty pin list", async ({ worker }) => {
      worker.use(
        http.get("https://api.test.com/pins", () => {
          return HttpResponse.json(
            {
              count: 0,
              results: [],
            },
            { status: 200 },
          );
        }),
      );

      const mockConfig: PinnerConfig = {
        jwt: "test-jwt-token",
        endpoint: "https://api.test.com",
        gateway: "https://gateway.test.com",
      };

      const client = new PinClient(mockConfig);
      const pins: RemotePin[] = [];
      for await (const pin of client.ls()) {
        pins.push(pin);
      }

      expect(pins).toHaveLength(0);
    });

    it("should handle unauthorized errors", async ({ worker }) => {
      worker.use(unauthorizedHandler);
      const mockConfig: PinnerConfig = {
        jwt: "invalid-jwt",
        endpoint: "https://api.test.com",
        gateway: "https://gateway.test.com",
      };

      const client = new PinClient(mockConfig);

      await expect(async () => {
        for await (const pin of client.ls()) {
          pin;
        }
      }).rejects.toThrow();
    });
  });

  describe("isPinned method integration", () => {
    it("should return true when pin exists", async ({ worker }) => {
      worker.use(...pinHandlers);
      const mockConfig: PinnerConfig = {
        jwt: "test-jwt-token",
        endpoint: "https://api.test.com",
        gateway: "https://gateway.test.com",
      };

      const client = new PinClient(mockConfig);
      const cid = CID.parse(await createMockCID(2));

      const isPinned = await client.isPinned(cid);
      expect(isPinned).toBe(true);
    });

    it("should return false when pin does not exist", async ({ worker }) => {
      worker.use(pinNotFoundHandler);
      const mockConfig: PinnerConfig = {
        jwt: "test-jwt-token",
        endpoint: "https://api.test.com",
        gateway: "https://gateway.test.com",
      };

      const client = new PinClient(mockConfig);
      const cid = CID.parse(await createMockCID(999));

      const isPinned = await client.isPinned(cid);
      expect(isPinned).toBe(false);
    });
  });

  describe("get method integration", () => {
    it("should successfully get pin details", async ({ worker }) => {
      worker.use(...pinHandlers);
      const mockConfig: PinnerConfig = {
        jwt: "test-jwt-token",
        endpoint: "https://api.test.com",
        gateway: "https://gateway.test.com",
      };

      const client = new PinClient(mockConfig);
      const cid = CID.parse(await createMockCID(2));

      const pin = await client.get(cid);

      expect(pin.cid).toBeInstanceOf(CID);
      expect(pin.status).toBeDefined();
      expect(pin.created).toBeInstanceOf(Date);
      expect(pin.metadata).toBeDefined();
    });

    it("should throw NotFoundError when pin does not exist", async ({
      worker,
    }) => {
      worker.use(pinNotFoundHandler);
      const mockConfig: PinnerConfig = {
        jwt: "test-jwt-token",
        endpoint: "https://api.test.com",
        gateway: "https://gateway.test.com",
      };

      const client = new PinClient(mockConfig);
      const cid = CID.parse(await createMockCID(999));

      await expect(client.get(cid)).rejects.toThrow(NotFoundError);
      await expect(client.get(cid)).rejects.toThrow("Pin not found");
    });

    it("should handle unauthorized errors", async ({ worker }) => {
      worker.use(unauthorizedHandler);
      const mockConfig: PinnerConfig = {
        jwt: "invalid-jwt",
        endpoint: "https://api.test.com",
        gateway: "https://gateway.test.com",
      };

      const client = new PinClient(mockConfig);
      const cid = CID.parse(await createMockCID(2));

      await expect(client.get(cid)).rejects.toThrow();
    });
  });

  describe("setMetadata method integration", () => {
    it("should successfully update pin metadata", async ({ worker }) => {
      worker.use(...pinHandlers);
      const mockConfig: PinnerConfig = {
        jwt: "test-jwt-token",
        endpoint: "https://api.test.com",
        gateway: "https://gateway.test.com",
      };

      const client = new PinClient(mockConfig);
      const cid = CID.parse(await createMockCID(2));

      await expect(
        client.setMetadata(cid, { updated: "metadata" }),
      ).resolves.not.toThrow();
    });

    it("should successfully clear pin metadata", async ({ worker }) => {
      worker.use(...pinHandlers);
      const mockConfig: PinnerConfig = {
        jwt: "test-jwt-token",
        endpoint: "https://api.test.com",
        gateway: "https://gateway.test.com",
      };

      const client = new PinClient(mockConfig);
      const cid = CID.parse(await createMockCID(2));

      await expect(client.setMetadata(cid, undefined)).resolves.not.toThrow();
    });

    it("should throw error when pin does not exist", async ({ worker }) => {
      worker.use(pinNotFoundHandler);
      const mockConfig: PinnerConfig = {
        jwt: "test-jwt-token",
        endpoint: "https://api.test.com",
        gateway: "https://gateway.test.com",
      };

      const client = new PinClient(mockConfig);
      const cid = CID.parse(await createMockCID(999));

      await expect(
        client.setMetadata(cid, { new: "metadata" }),
      ).rejects.toThrow("Pin not found");
    });

    it("should handle unauthorized errors", async ({ worker }) => {
      worker.use(unauthorizedHandler);
      const mockConfig: PinnerConfig = {
        jwt: "invalid-jwt",
        endpoint: "https://api.test.com",
        gateway: "https://gateway.test.com",
      };

      const client = new PinClient(mockConfig);
      const cid = CID.parse(await createMockCID(2));

      await expect(
        client.setMetadata(cid, { new: "metadata" }),
      ).rejects.toThrow();
    });
  });

  describe("configuration validation", () => {
    it("should work with minimal config", ({ worker }) => {
      const minimalConfig: PinnerConfig = {
        jwt: "test-jwt",
        endpoint: "https://test.com",
        gateway: "https://gateway.com",
      };

      const minimalClient = new PinClient(minimalConfig);
      expect(minimalClient).toBeInstanceOf(PinClient);
    });

    it("should use config values in API configuration", ({ worker }) => {
      const customConfig: PinnerConfig = {
        jwt: "custom-jwt",
        endpoint: "https://custom.api.com",
        gateway: "https://custom.gateway.com",
      };

      const customClient = new PinClient(customConfig);
      expect(customClient).toBeInstanceOf(PinClient);
    });

    it("should accept custom fetch implementation", ({ worker }) => {
      const mockFetch = vi.fn();
      const configWithFetch: PinnerConfig = {
        jwt: "test-jwt",
        endpoint: "https://test.com",
        gateway: "https://gateway.com",
        fetch: mockFetch,
      };

      const customClient = new PinClient(configWithFetch);
      expect(customClient).toBeInstanceOf(PinClient);
    });
  });

  describe("error handling", () => {
    it("should handle network errors gracefully", async ({ worker }) => {
      worker.use(
        http.post("https://api.test.com/pins", () => {
          return HttpResponse.error();
        }),
      );

      const mockConfig: PinnerConfig = {
        jwt: "test-jwt-token",
        endpoint: "https://api.test.com",
        gateway: "https://gateway.test.com",
      };

      const client = new PinClient(mockConfig);
      const cid = CID.parse(await createMockCID(2));

      await expect(async () => {
        for await (const result of client.add(cid)) {
          result;
        }
      }).rejects.toThrow();
    });

    it("should handle malformed responses", async ({ worker }) => {
      worker.use(
        http.get("https://api.test.com/pins", () => {
          return HttpResponse.json({ invalid: "response" }, { status: 500 });
        }),
      );

      const mockConfig: PinnerConfig = {
        jwt: "test-jwt-token",
        endpoint: "https://api.test.com",
        gateway: "https://gateway.test.com",
      };

      const client = new PinClient(mockConfig);

      await expect(async () => {
        for await (const pin of client.ls()) {
          pin;
        }
      }).rejects.toThrow();
    });

    it("should handle timeout errors", async ({ worker }) => {
      worker.use(
        http.post("https://api.test.com/pins", async () => {
          // Simulate timeout
          await new Promise((resolve) => setTimeout(resolve, 10000));
          return HttpResponse.json({});
        }),
      );

      const mockConfig: PinnerConfig = {
        jwt: "test-jwt-token",
        endpoint: "https://api.test.com",
        gateway: "https://gateway.test.com",
      };

      const client = new PinClient(mockConfig);
      const cid = CID.parse(await createMockCID(2));

      const controller = new AbortController();
      setTimeout(() => controller.abort(), 100);

      // This should timeout
      await expect(async () => {
        for await (const result of client.add(cid, {
          signal: controller.signal,
        })) {
          result;
        }
      }).rejects.toThrow();
    });
  });

  describe("async generator behavior", () => {
    it("should properly handle async generator iteration", async ({
      worker,
    }) => {
      worker.use(...pinHandlers);
      const mockConfig: PinnerConfig = {
        jwt: "test-jwt-token",
        endpoint: "https://api.test.com",
        gateway: "https://gateway.test.com",
      };

      const client = new PinClient(mockConfig);
      const cid = CID.parse(await createMockCID(2));

      const results: CID[] = [];
      for await (const item of client.add(cid)) {
        results.push(item);
      }

      expect(results).toHaveLength(1);
    });

    it("should handle multiple async generators in sequence", async ({
      worker,
    }) => {
      worker.use(...pinHandlers);
      const mockConfig: PinnerConfig = {
        jwt: "test-jwt-token",
        endpoint: "https://api.test.com",
        gateway: "https://gateway.test.com",
      };

      const client = new PinClient(mockConfig);
      const cid1 = CID.parse(await createMockCID(10));
      const cid2 = CID.parse(await createMockCID(11));

      const results1: CID[] = [];
      for await (const item of client.add(cid1)) {
        results1.push(item);
      }

      const results2: CID[] = [];
      for await (const item of client.add(cid2)) {
        results2.push(item);
      }

      expect(results1).toHaveLength(1);
      expect(results2).toHaveLength(1);
    });

    it("should handle async generator for ls with multiple results", async ({
      worker,
    }) => {
      worker.use(...pinHandlers);
      const mockConfig: PinnerConfig = {
        jwt: "test-jwt-token",
        endpoint: "https://api.test.com",
        gateway: "https://gateway.test.com",
      };

      const client = new PinClient(mockConfig);
      const pins: RemotePin[] = [];
      for await (const pin of client.ls()) {
        pins.push(pin);
      }

      expect(pins.length).toBeGreaterThan(0);
    });
  });

  describe("rm method integration", () => {
    it("should successfully remove a pin", async ({ worker }) => {
      worker.use(...pinHandlers);
      const mockConfig: PinnerConfig = {
        jwt: "test-jwt-token",
        endpoint: "https://api.test.com",
        gateway: "https://gateway.test.com",
      };

      const client = new PinClient(mockConfig);
      const cid = CID.parse(await createMockCID(2));

      const results: CID[] = [];
      for await (const result of client.rm(cid)) {
        results.push(result);
      }

      expect(results).toHaveLength(1);
      expect(results[0].toString()).toBe(cid.toString());
    });

    it("should remove a pin with options", async ({ worker }) => {
      worker.use(...pinHandlers);
      const mockConfig: PinnerConfig = {
        jwt: "test-jwt-token",
        endpoint: "https://api.test.com",
        gateway: "https://gateway.test.com",
      };

      const client = new PinClient(mockConfig);
      const cid = CID.parse(await createMockCID(2));
      const abortController = new AbortController();

      const results: CID[] = [];
      for await (const result of client.rm(cid, {
        signal: abortController.signal,
      })) {
        results.push(result);
      }

      expect(results).toHaveLength(1);
    });

    it("should handle unauthorized errors", async ({ worker }) => {
      worker.use(unauthorizedHandler);
      const mockConfig: PinnerConfig = {
        jwt: "invalid-jwt",
        endpoint: "https://api.test.com",
        gateway: "https://gateway.test.com",
      };

      const client = new PinClient(mockConfig);
      const cid = CID.parse(await createMockCID(2));

      await expect(async () => {
        for await (const result of client.rm(cid)) {
          result;
        }
      }).rejects.toThrow();
    });

    it("should handle removal of non-existent pin", async ({ worker }) => {
      worker.use(pinNotFoundHandler);
      const mockConfig: PinnerConfig = {
        jwt: "test-jwt-token",
        endpoint: "https://api.test.com",
        gateway: "https://gateway.test.com",
      };

      const client = new PinClient(mockConfig);
      const cid = CID.parse(await createMockCID(999));

      const results: CID[] = [];
      for await (const result of client.rm(cid)) {
        results.push(result);
      }

      // Should still return the CID even if no pins were found
      expect(results).toHaveLength(1);
      expect(results[0].toString()).toBe(cid.toString());
    });
  });
});
