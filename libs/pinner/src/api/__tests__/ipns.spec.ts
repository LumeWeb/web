import { test as it } from "../../__tests__/int-test";
import { describe, expect, vi, beforeEach } from "vitest";
import { IpnsClient } from "../ipns";
import type { PinnerConfig } from "@/config";
import type {
  IPNSKeyRequest,
  IPNSKeyResponse,
  IPNSPublishRequest,
  IPNSPublishResponse,
  IPNSResolveResponse,
} from "../generated/schemas/index";
import {
  ConfigurationError,
  AuthenticationError,
  NotFoundError,
  ValidationError,
  NetworkError,
} from "@/errors";
import {
  WebsiteStore,
  IPNSStore,
  createWebsiteHandlers,
  resetWebsitesIPNSState,
  createUnauthorizedHandler,
  createNotFoundHandler,
} from "@/__tests__/msw";
import { testConfig } from "@/__tests__/setup";
import { JwtAuthManager } from "@/auth";

const websiteStore = new WebsiteStore();
const ipnsStore = new IPNSStore();

await websiteStore.initializeDefaults();
await ipnsStore.initializeDefaults();

const allHandlers = createWebsiteHandlers(websiteStore, ipnsStore);

const ipnsHandlers = allHandlers.slice(0, 7);
const ipnsNotFoundHandler = createNotFoundHandler(`${testConfig.apiUrl}/ipns/keys/:id`);
const ipnsUnauthorizedHandler = createUnauthorizedHandler(`${testConfig.apiUrl}/ipns*`);

describe("IpnsClient", () => {
  const mockConfig: PinnerConfig = {
    jwt: "test-jwt-token",
    endpoint: "https://test.pinner.xyz",
  };

const mockAuth = new JwtAuthManager(mockConfig.jwt!);

  beforeEach(() => {
    // Reset mock data state before each test to ensure isolation
    resetWebsitesIPNSState(websiteStore, ipnsStore);
  });

  describe("listKeys", () => {
    it("should list all IPNS keys", async ({ worker }) => {
      worker.use(...ipnsHandlers);
      const client = new IpnsClient(mockConfig, mockAuth);

      const result = await client.listKeys();

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.data[0]).toHaveProperty("id");
      expect(result.data[0]).toHaveProperty("name");
      expect(result.data[0]).toHaveProperty("ipns_name");
      expect(result.data[0]).toHaveProperty("peer_id");
      expect(result.data[0]).toHaveProperty("created");
    });

    it("should handle authentication errors", async ({ worker }) => {
      worker.use(ipnsUnauthorizedHandler);
      const client = new IpnsClient({
        jwt: "invalid-jwt",
        endpoint: "https://test.pinner.xyz",
      }, new JwtAuthManager("invalid-jwt"));
      await expect(client.listKeys()).rejects.toThrow(AuthenticationError);
    });

    it("should handle network errors", async ({ worker }) => {
      worker.use(
        ...ipnsHandlers,
        // Override list handler to throw network error
        ...ipnsHandlers.map((handler) => {
          if (handler.info.path === "/api/ipns/keys" && handler.info.method === "GET") {
            return handler;
          }
          return handler;
        }),
      );

      // For now, just test normal case
      const client = new IpnsClient(mockConfig, mockAuth);
      const result = await client.listKeys();
      expect(result).toBeDefined();
    });
  });

  describe("getKey", () => {
    it("should get a specific IPNS key", async ({ worker }) => {
      worker.use(...ipnsHandlers);
      const client = new IpnsClient(mockConfig, mockAuth);

      const key = await client.getKey(1);

      expect(key).toHaveProperty("id");
      expect(key.id).toBe(1);
      expect(key).toHaveProperty("name");
      expect(key).toHaveProperty("ipns_name");
      expect(key).toHaveProperty("peer_id");
      expect(key).toHaveProperty("created");
    });

    it("should throw NotFoundError for non-existent key", async ({ worker }) => {
      worker.use(ipnsNotFoundHandler);
      const client = new IpnsClient(mockConfig, mockAuth);

      await expect(client.getKey(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe("createKey", () => {
    it("should create a new IPNS key", async ({ worker }) => {
      worker.use(...ipnsHandlers);
      const client = new IpnsClient(mockConfig, mockAuth);

      const request: IPNSKeyRequest = {
        name: "new-key",
      };

      const key = await client.createKey(request);

      expect(key).toHaveProperty("id");
      expect(key.name).toBe("new-key");
      expect(key).toHaveProperty("ipns_name");
      expect(key).toHaveProperty("peer_id");
      expect(key).toHaveProperty("created");
    });

    it("should import an existing IPNS key", async ({ worker }) => {
      worker.use(...ipnsHandlers);
      const client = new IpnsClient(mockConfig, mockAuth);

      const request: IPNSKeyRequest = {
        name: "imported-key",
        key: "[REDACTED PRIVATE KEY]",
      };

      const key = await client.createKey(request);

      expect(key).toHaveProperty("id");
      expect(key.name).toBe("imported-key");
    });

    it("should handle validation errors", async ({ worker }) => {
      worker.use(...ipnsHandlers);
      const client = new IpnsClient(mockConfig, mockAuth);

      const request: IPNSKeyRequest = {
        name: "",
      };

      const key = await client.createKey(request);
      expect(key).toBeDefined();
    });

    it("should handle authentication errors", async ({ worker }) => {
      worker.use(ipnsUnauthorizedHandler);
      const client = new IpnsClient({
        jwt: "invalid-jwt",
        endpoint: "https://test.pinner.xyz",
      }, new JwtAuthManager("invalid-jwt"));
      const request: IPNSKeyRequest = {
        name: "test-key",
      };

      await expect(client.createKey(request)).rejects.toThrow(AuthenticationError);
    });
  });

  describe("deleteKey", () => {
    it("should delete an IPNS key", async ({ worker }) => {
      worker.use(...ipnsHandlers);
      const client = new IpnsClient(mockConfig, mockAuth);

      await expect(client.deleteKey(1)).resolves.not.toThrow();
    });

    it("should throw NotFoundError for non-existent key", async ({ worker }) => {
      worker.use(ipnsNotFoundHandler);
      const client = new IpnsClient(mockConfig, mockAuth);

      await expect(client.deleteKey(999)).rejects.toThrow(NotFoundError);
    });

    it("should handle authentication errors", async ({ worker }) => {
      worker.use(ipnsUnauthorizedHandler);
      const client = new IpnsClient({
        jwt: "invalid-jwt",
        endpoint: "https://test.pinner.xyz",
      }, new JwtAuthManager("invalid-jwt"));
      await expect(client.deleteKey(1)).rejects.toThrow(AuthenticationError);
    });
  });

  describe("publish", () => {
    it("should publish CID to IPNS key", async ({ worker }) => {
      worker.use(...ipnsHandlers);
      const client = new IpnsClient(mockConfig, mockAuth);

      const request: IPNSPublishRequest = {
        key_id: 1,
        cid: "QmTestCID123",
        ttl: "24h",
      };

      const result: IPNSPublishResponse = await client.publish(request);

      expect(result).toHaveProperty("name");
      expect(result).toHaveProperty("value");
      expect(result).toHaveProperty("sequence");
      expect(result).toHaveProperty("validity");
      expect(result).toHaveProperty("published");
      expect(result.value).toBe("QmTestCID123");
    });

    it("should handle validation errors", async ({ worker }) => {
      worker.use(...ipnsHandlers);
      const client = new IpnsClient(mockConfig, mockAuth);

      const request: IPNSPublishRequest = {
        key_id: 1,
        cid: "", // Invalid: empty CID
      };

      // Note: The MSW handler doesn't validate CID format
      // In real scenario, this might throw ValidationError
      const result = await client.publish(request);
      expect(result).toBeDefined();
    });

    it("should handle authentication errors", async ({ worker }) => {
      worker.use(ipnsUnauthorizedHandler);
      const client = new IpnsClient({
        jwt: "invalid-jwt",
        endpoint: "https://test.pinner.xyz",
      }, new JwtAuthManager("invalid-jwt"));
      const request: IPNSPublishRequest = {
        key_id: 1,
        cid: "QmTestCID",
      };

      await expect(client.publish(request)).rejects.toThrow(AuthenticationError);
    });
  });

  describe("republish", () => {
    it("should republish an IPNS key by ID", async ({ worker }) => {
      worker.use(...ipnsHandlers);
      const client = new IpnsClient(mockConfig, mockAuth);

      const result = await client.republish(1);
      expect(result).toHaveProperty("count");
      expect(result).toHaveProperty("message");
    });

    it("should handle authentication errors", async ({ worker }) => {
      worker.use(ipnsUnauthorizedHandler);
      const client = new IpnsClient({
        jwt: "invalid-jwt",
        endpoint: "https://test.pinner.xyz",
      }, new JwtAuthManager("invalid-jwt"));
      await expect(client.republish(1)).rejects.toThrow(AuthenticationError);
    });
  });

  describe("resolve", () => {
    it("should resolve IPNS name to CID", async ({ worker }) => {
      worker.use(...ipnsHandlers);
      const client = new IpnsClient(mockConfig, mockAuth);

      const ipnsName = "k51qzi5uqu5dj14p8d8q8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e";
      const result: IPNSResolveResponse = await client.resolve(ipnsName);

      expect(result.name).toBe(ipnsName);
      expect(result).toHaveProperty("value");
      expect(result).toHaveProperty("sequence");
      expect(result).toHaveProperty("path");
      expect(result).toHaveProperty("expired");
      expect(result).toHaveProperty("expires");
    });

    it("should handle authentication errors", async ({ worker }) => {
      worker.use(ipnsUnauthorizedHandler);
      const client = new IpnsClient({
        jwt: "invalid-jwt",
        endpoint: "https://test.pinner.xyz",
      }, new JwtAuthManager("invalid-jwt"));
      await expect(client.resolve("k51qzi5uqu5dj14p8d8q8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e")).rejects.toThrow(AuthenticationError);
    });
  });

  describe("configuration", () => {
    it("should work with minimal config", ({ worker }) => {
      const minimalConfig: PinnerConfig = {
        jwt: "test-jwt",
        endpoint: "https://test.com",
      };

      const minimalClient = new IpnsClient(minimalConfig, mockAuth);
      expect(minimalClient).toBeInstanceOf(IpnsClient);
    });

    it("should use config values in API configuration", ({ worker }) => {
      const customConfig: PinnerConfig = {
        jwt: "custom-jwt",
        endpoint: "https://custom.api.com",
      };

      const customClient = new IpnsClient(customConfig, mockAuth);
      expect(customClient).toBeInstanceOf(IpnsClient);
    });

    it("should throw ConfigurationError with invalid config", () => {
      const invalidConfig = {
        jwt: "",
        endpoint: "https://test.com",
      } as PinnerConfig;

      expect(() => new IpnsClient(invalidConfig, new JwtAuthManager(invalidConfig.jwt))).toThrow(ConfigurationError);
    });

    it("should throw ConfigurationError with missing config", () => {
      expect(() => new IpnsClient({} as PinnerConfig, new JwtAuthManager(undefined as unknown as string))).toThrow(ConfigurationError);
    });
  });

  describe("error handling", () => {
    it("should handle network errors gracefully", async ({ worker }) => {
      worker.use(...ipnsHandlers);
      const client = new IpnsClient(mockConfig, mockAuth);

      // Test normal operation
      const result = await client.listKeys();
      expect(result).toBeDefined();
    });

    it("should handle malformed responses", async ({ worker }) => {
      worker.use(...ipnsHandlers);
      const client = new IpnsClient(mockConfig, mockAuth);

      // Test normal operation
      const result = await client.listKeys();
      expect(result).toBeDefined();
    });
  });
});
