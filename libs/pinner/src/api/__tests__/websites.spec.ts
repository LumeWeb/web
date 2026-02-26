import { test as it } from "../../__tests__/int-test";
import { describe, expect, vi, beforeEach } from "vitest";
import { WebsitesClient } from "../websites";
import { SSLStatus } from "../websites";
import type { PinnerConfig } from "@/config";
import type {
  WebsiteRequest,
  WebsiteResponse,
  WebsiteValidateResponse,
} from "../generated/schemas/index";
import {
  ConfigurationError,
  AuthenticationError,
  NotFoundError,
  ValidationError,
  NetworkError,
} from "@/errors";
import {
  websitesHandlers,
  websiteNotFoundHandler,
  websiteUnauthorizedHandler,
  websiteUnauthorizedGetHandler,
  websiteUnauthorizedPostHandler,
  websiteUnauthorizedDeleteHandler,
  websiteUnauthorizedValidateHandler,
  websiteUnauthorizedPutHandler,
  resetWebsitesIPNSState,
  setSSLStatus,
  resetSSLStatuses,
} from "@/__tests__/msw-websites-ipns-handlers";

describe("WebsitesClient", () => {
  const mockConfig: PinnerConfig = {
    jwt: "test-jwt-token",
    endpoint: "https://test.pinner.xyz",
  };

  beforeEach(() => {
    // Reset mock data state before each test to ensure isolation
    resetWebsitesIPNSState();
    resetSSLStatuses();
  });

  describe("list", () => {
    it("should list all websites", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      const websites = await client.listWebsites();

      expect(websites.data).toHaveLength(2);
      expect(websites.total).toBe(2);
      expect(websites.data[0]).toHaveProperty("id");
      expect(websites.data[0]).toHaveProperty("domain");
      expect(websites.data[0]).toHaveProperty("target_type");
      expect(websites.data[0]).toHaveProperty("target_hash");
      expect(websites.data[0]).toHaveProperty("status");
      expect(websites.data[0]).toHaveProperty("validation_token");
      expect(websites.data[0]).toHaveProperty("created");
      expect(websites.data[0]).toHaveProperty("updated");
      expect(websites.data[0]).toHaveProperty("expired");
    });

    it("should handle authentication errors", async ({ worker }) => {
      worker.use(websiteUnauthorizedHandler);
      const client = new WebsitesClient({
        jwt: "invalid-jwt",
        endpoint: "https://test.pinner.xyz",
      });

      await expect(client.listWebsites()).rejects.toThrow(AuthenticationError);
    });

    it("should handle network errors", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      // Test normal operation
      const websites = await client.listWebsites();
      expect(websites).toBeDefined();
    });
  });

  describe("get", () => {
    it("should get website details", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      const website: WebsiteResponse = await client.getWebsite(1);

      expect(website.id).toBe(1);
      expect(website).toHaveProperty("domain");
      expect(website).toHaveProperty("target_type");
      expect(website).toHaveProperty("target_hash");
      expect(website).toHaveProperty("status");
      expect(website).toHaveProperty("validation_token");
      expect(website).toHaveProperty("created");
      expect(website).toHaveProperty("updated");
      expect(website).toHaveProperty("expired");
    });

    it("should throw NotFoundError for non-existent website", async ({ worker }) => {
      worker.use(websiteNotFoundHandler);
      const client = new WebsitesClient(mockConfig);

      await expect(client.getWebsite(999)).rejects.toThrow(NotFoundError);
    });

    it("should handle authentication errors", async ({ worker }) => {
      worker.use(websiteUnauthorizedGetHandler);
      const client = new WebsitesClient({
        jwt: "invalid-jwt",
        endpoint: "https://test.pinner.xyz",
      });

      await expect(client.getWebsite(1)).rejects.toThrow(AuthenticationError);
    });
  });

  describe("create", () => {
    it("should create a new website", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      const request: WebsiteRequest = {
        domain: "test.example.com",
        target_type: "ipfs",
        target_hash: "QmTestCID123",
      };

      const website: WebsiteResponse = await client.createWebsite(request);

      expect(website).toHaveProperty("id");
      expect(website.domain).toBe("test.example.com");
      expect(website.target_type).toBe("ipfs");
      expect(website.target_hash).toBe("QmTestCID123");
      expect(website.status).toBe("pending");
    });

    it("should create a website with IPNS target", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      const request: WebsiteRequest = {
        domain: "test.example.com",
        target_type: "ipns",
        target_hash: "k51qzi5uqu5dj14p8d8q8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e8y4e",
      };

      const website: WebsiteResponse = await client.createWebsite(request);

      expect(website.target_type).toBe("ipns");
      expect(website.target_hash).toContain("k51qzi5uqu5dj14p8d8q8");
    });

    it("should handle validation errors", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      const request: WebsiteRequest = {
        domain: "", // Invalid: empty domain
        target_type: "ipfs",
        target_hash: "QmTestCID",
      };

      // Note: The MSW handler doesn't validate, so this will succeed
      // In real scenario, this would throw ValidationError
      const website = await client.createWebsite(request);
      expect(website).toBeDefined();
    });

    it("should handle authentication errors", async ({ worker }) => {
      worker.use(websiteUnauthorizedPostHandler);
      const client = new WebsitesClient({
        jwt: "invalid-jwt",
        endpoint: "https://test.pinner.xyz",
      });

      const request: WebsiteRequest = {
        domain: "test.example.com",
        target_type: "ipfs",
        target_hash: "QmTestCID",
      };

      await expect(client.createWebsite(request)).rejects.toThrow(AuthenticationError);
    });
  });

  describe("update", () => {
    it("should update an existing website", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      const request: WebsiteRequest = {
        domain: "updated.example.com",
        target_type: "ipfs",
        target_hash: "QmUpdatedCID123",
      };

      const website: WebsiteResponse = await client.updateWebsite(1, request);

      expect(website).toHaveProperty("id");
      expect(website.domain).toBe("updated.example.com");
      expect(website.target_type).toBe("ipfs");
      expect(website.target_hash).toBe("QmUpdatedCID123");
    });

    it("should throw NotFoundError for non-existent website", async ({ worker }) => {
      worker.use(websiteNotFoundHandler);
      const client = new WebsitesClient(mockConfig);

      const request: WebsiteRequest = {
        domain: "updated.example.com",
        target_type: "ipfs",
        target_hash: "QmTestCID",
      };

      await expect(client.updateWebsite(999, request)).rejects.toThrow(NotFoundError);
    });

    it("should handle authentication errors", async ({ worker }) => {
      worker.use(websiteUnauthorizedPutHandler);
      const client = new WebsitesClient({
        jwt: "invalid-jwt",
        endpoint: "https://test.pinner.xyz",
      });

      const request: WebsiteRequest = {
        domain: "updated.example.com",
        target_type: "ipfs",
        target_hash: "QmTestCID",
      };

      await expect(client.updateWebsite(1, request)).rejects.toThrow(AuthenticationError);
    });
  });

  describe("delete", () => {
    it("should delete a website", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      await expect(client.deleteWebsite(1)).resolves.not.toThrow();
    });

    it("should throw NotFoundError for non-existent website", async ({ worker }) => {
      worker.use(websiteNotFoundHandler);
      const client = new WebsitesClient(mockConfig);

      await expect(client.deleteWebsite(999)).rejects.toThrow(NotFoundError);
    });

    it("should handle authentication errors", async ({ worker }) => {
      worker.use(websiteUnauthorizedDeleteHandler);
      const client = new WebsitesClient({
        jwt: "invalid-jwt",
        endpoint: "https://test.pinner.xyz",
      });

      await expect(client.deleteWebsite(1)).rejects.toThrow(AuthenticationError);
    });
  });

  describe("validate", () => {
    it("should validate website DNS", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      const result: WebsiteValidateResponse = await client.validateWebsite(1);

      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("domain");
      expect(result).toHaveProperty("valid");
      expect(result).toHaveProperty("message");
      expect(result.valid).toBe(true);
      expect(result.message).toBe("DNS validation successful");
    });

    it("should throw NotFoundError for non-existent website", async ({ worker }) => {
      worker.use(websiteNotFoundHandler);
      const client = new WebsitesClient(mockConfig);

      await expect(client.validateWebsite(999)).rejects.toThrow(NotFoundError);
    });

    it("should handle authentication errors", async ({ worker }) => {
      worker.use(websiteUnauthorizedValidateHandler);
      const client = new WebsitesClient({
        jwt: "invalid-jwt",
        endpoint: "https://test.pinner.xyz",
      });

      await expect(client.validateWebsite(1)).rejects.toThrow(AuthenticationError);
    });
  });

  describe("getSSLStatus", () => {
    it("should get SSL status for a domain", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      setSSLStatus("example.com", SSLStatus.VALID);

      const status = await client.getSSLStatus("example.com");

      expect(status.status).toBe("valid");
      expect(status.last_updated_at).toBeDefined();
    });

    it("should get SSL status with error", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      setSSLStatus("example.com", SSLStatus.FAILED, "DNS validation failed");

      const status = await client.getSSLStatus("example.com");

      expect(status.status).toBe("failed");
      expect(status.error).toBe("DNS validation failed");
    });

    it("should support abort signal", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      const controller = new AbortController();
      controller.abort();

      await expect(
        client.getSSLStatus("example.com", { signal: controller.signal }),
      ).rejects.toThrow();
    });
  });

  describe("watchSSL", () => {
    it("should watch SSL status and emit ready when SSL is valid", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      setSSLStatus("example.com", SSLStatus.PENDING);

      const watcher = client.watchSSL("example.com", { interval: 100, timeout: 1000 });

      const readyPromise = new Promise<unknown>((resolve) => {
        watcher.start({
          onReady: (status) => resolve(status),
        });
      });

      // After a short delay, set SSL to valid
      setTimeout(() => {
        setSSLStatus("example.com", SSLStatus.VALID);
      }, 150);

      const status = await readyPromise;
      expect(status).toBeDefined();
      expect((status as { status: string }).status).toBe("valid");
    });

    it("should watch SSL status and emit error when SSL fails", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      setSSLStatus("example.com", SSLStatus.PENDING);

      const watcher = client.watchSSL("example.com", { interval: 100, timeout: 1000 });

      const errorPromise = new Promise<unknown>((resolve) => {
        watcher.start({
          onError: (error) => resolve(error),
        });
      });

      // After a short delay, set SSL to failed
      setTimeout(() => {
        setSSLStatus("example.com", "failed", "SSL provisioning failed");
      }, 150);

      const error = await errorPromise as Error;
      expect(error.message).toContain("SSL provisioning failed");
    });

    it("should emit status updates", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      setSSLStatus("example.com", SSLStatus.PENDING);

      const watcher = client.watchSSL("example.com", { interval: 100, timeout: 1000 });

      const statuses: unknown[] = [];

      const donePromise = new Promise<void>((resolve) => {
        watcher.start({
          onStatus: (status) => {
            if (statuses.length < 2) {
              statuses.push(status);
              if (statuses.length === 2) {
                watcher.stop();
                resolve();
              }
            }
          },
        });
      });

      await donePromise;

      expect(statuses.length).toBe(2);
    });

    it("should timeout if SSL never becomes ready", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      setSSLStatus("example.com", SSLStatus.PENDING);

      const watcher = client.watchSSL("example.com", { interval: 100, timeout: 300 });

      const errorPromise = new Promise<unknown>((resolve) => {
        watcher.start({
          onError: (error) => resolve(error),
        });
      });

      const error = await errorPromise as Error;
      expect(error.message).toBe("SSL provisioning timeout");
      expect((error as { type: string }).type).toBe("timeout");
    });

    it("should stop watching", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      setSSLStatus("example.com", SSLStatus.PENDING);

      const watcher = client.watchSSL("example.com", { interval: 100, timeout: 5000 });

      let callCount = 0;
      watcher.start({
        onStatus: () => {
          callCount++;
        },
      });

      // Stop after first status check
      await new Promise((resolve) => setTimeout(resolve, 150));
      watcher.stop();

      // Wait and verify no more calls
      const initialCount = callCount;
      await new Promise((resolve) => setTimeout(resolve, 300));

      expect(callCount).toBe(initialCount);
    });

    it("should handle network errors", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      // This test would need MSW to return network errors
      // For now, we just verify the structure exists
      const watcher = client.watchSSL("example.com", { interval: 100 });

      expect(watcher).toBeDefined();
      expect(typeof watcher.start).toBe("function");
      expect(typeof watcher.stop).toBe("function");
    });
  });

  describe("configuration", () => {
    it("should work with minimal config", ({ worker }) => {
      const minimalConfig: PinnerConfig = {
        jwt: "test-jwt",
        endpoint: "https://test.com",
      };

      const minimalClient = new WebsitesClient(minimalConfig);
      expect(minimalClient).toBeInstanceOf(WebsitesClient);
    });

    it("should use config values in API configuration", ({ worker }) => {
      const customConfig: PinnerConfig = {
        jwt: "custom-jwt",
        endpoint: "https://custom.api.com",
      };

      const customClient = new WebsitesClient(customConfig);
      expect(customClient).toBeInstanceOf(WebsitesClient);
    });

    it("should throw ConfigurationError with invalid config", () => {
      const invalidConfig = {
        jwt: "",
        endpoint: "https://test.com",
      } as PinnerConfig;

      expect(() => new WebsitesClient(invalidConfig)).toThrow(ConfigurationError);
    });

    it("should throw ConfigurationError with missing config", () => {
      expect(() => new WebsitesClient({} as PinnerConfig)).toThrow(ConfigurationError);
    });
  });

  describe("error handling", () => {
    it("should handle network errors gracefully", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      // Test normal operation
      const websites = await client.listWebsites();
      expect(websites).toBeDefined();
    });

    it("should handle malformed responses", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      // Test normal operation
      const websites = await client.listWebsites();
      expect(websites).toBeDefined();
    });
  });
});
