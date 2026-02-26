import { test as it } from "../../__tests__/int-test";
import { describe, expect, beforeEach, vi } from "vitest";
import { WebsitesClient } from "../websites";
import type { PinnerConfig } from "@/config";
import type { SSLStatusInfo } from "../generated/schemas/index";
import { SSLStatus } from "../websites";
import {
  websitesHandlers,
  resetWebsitesIPNSState,
  setSSLStatus,
  resetSSLStatuses,
} from "@/__tests__/msw-websites-ipns-handlers";

describe("WebsitesClient SSL Integration Tests", () => {
  const mockConfig: PinnerConfig = {
    jwt: "test-jwt-token",
    endpoint: "https://test.pinner.xyz",
  };

  beforeEach(() => {
    resetWebsitesIPNSState();
    resetSSLStatuses();
  });

  describe("SSL Status Monitoring Integration", () => {
    it("should monitor SSL status from pending to ready", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      // Start with pending status
      setSSLStatus("example.com", SSLStatus.PENDING);

      const watcher = client.watchSSL("example.com", { interval: 100, timeout: 2000 });

      const statuses: SSLStatusInfo[] = [];

      const readyPromise = new Promise<SSLStatusInfo>((resolve) => {
        watcher.start({
          onStatus: (status) => {
            statuses.push(status);
          },
          onReady: (status) => {
            statuses.push(status);
            resolve(status);
          },
        });
      });

      // Simulate SSL becoming ready after some checks
      setTimeout(() => {
        setSSLStatus("example.com", SSLStatus.VALID);
      }, 300);

      const finalStatus = await readyPromise;

      expect(finalStatus.status).toBe("valid");
      expect(statuses.some((s) => s.status === "pending")).toBe(true);
      expect(statuses.some((s) => s.status === "valid")).toBe(true);
    });

    it("should handle SSL provisioning failure", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      setSSLStatus("example.com", SSLStatus.PENDING);

      const watcher = client.watchSSL("example.com", { interval: 100, timeout: 2000 });

      let finalError: Error | null = null;

      const errorPromise = new Promise<Error>((resolve) => {
        watcher.start({
          onError: (error) => {
            finalError = error;
            resolve(error);
          },
        });
      });

      // Simulate SSL failure
      setTimeout(() => {
        setSSLStatus("example.com", SSLStatus.FAILED, "DNS validation failed");
      }, 300);

      const error = await errorPromise;

      expect(error).toBeDefined();
      expect(error.message).toContain("DNS validation failed");
      expect((error as { type: string }).type).toBe("error");
    });

    it("should timeout if SSL never becomes ready", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      setSSLStatus("example.com", SSLStatus.PENDING);

      const watcher = client.watchSSL("example.com", { interval: 100, timeout: 500 });

      let finalError: Error | null = null;

      const errorPromise = new Promise<Error>((resolve) => {
        watcher.start({
          onError: (error) => {
            finalError = error;
            resolve(error);
          },
        });
      });

      const error = await errorPromise;

      expect(error).toBeDefined();
      expect(error.message).toBe("SSL provisioning timeout");
      expect((error as { type: string }).type).toBe("timeout");
    });

    it("should handle multiple status transitions", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      setSSLStatus("example.com", SSLStatus.PENDING);

      const watcher = client.watchSSL("example.com", { interval: 100, timeout: 5000 });

      const statuses: SSLStatusInfo[] = [];

      watcher.start({
        onStatus: (status) => {
          statuses.push(status);
        },
      });

      // Simulate status transitions
      setTimeout(() => {
        setSSLStatus("example.com", SSLStatus.VALIDATING);
      }, 150);

      setTimeout(() => {
        setSSLStatus("example.com", SSLStatus.VALID);
      }, 350);

      // Wait for transitions
      await new Promise((resolve) => setTimeout(resolve, 600));

      expect(statuses.length).toBeGreaterThan(0);
      expect(statuses.some((s) => s.status === "pending")).toBe(true);
      expect(statuses.some((s) => s.status === "validating") || statuses.some((s) => s.status === "valid")).toBe(true);

      watcher.stop();
    });

    it("should allow stopping and restarting the watcher", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      setSSLStatus("example.com", SSLStatus.PENDING);

      const watcher1 = client.watchSSL("example.com", { interval: 100, timeout: 5000 });

      let statusCount1 = 0;
      watcher1.start({
        onStatus: () => {
          statusCount1++;
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 350));

      watcher1.stop();

      const initialCount = statusCount1;

      // Restart watching
      const watcher2 = client.watchSSL("example.com", { interval: 100, timeout: 5000 });

      let statusCount2 = 0;
      watcher2.start({
        onStatus: () => {
          statusCount2++;
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 350));

      watcher2.stop();

      // Both watchers should have received status updates
      expect(statusCount1).toBeGreaterThan(0);
      expect(statusCount2).toBeGreaterThan(0);
    });

    it("should handle concurrent watchers", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      setSSLStatus("example.com", SSLStatus.PENDING);

      const watcher1 = client.watchSSL("example.com", { interval: 100, timeout: 5000 });
      const watcher2 = client.watchSSL("example.com", { interval: 100, timeout: 5000 });

      let statusCount1 = 0;
      let statusCount2 = 0;

      watcher1.start({
        onStatus: () => {
          statusCount1++;
        },
      });

      watcher2.start({
        onStatus: () => {
          statusCount2++;
        },
      });

      await new Promise((resolve) => setTimeout(resolve, 350));

      watcher1.stop();
      watcher2.stop();

      expect(statusCount1).toBeGreaterThan(0);
      expect(statusCount2).toBeGreaterThan(0);
    });

    it("should support abort signal for SSL status check", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      setSSLStatus("example.com", SSLStatus.VALID);

      const controller = new AbortController();
      controller.abort();

      await expect(
        client.getSSLStatus("example.com", { signal: controller.signal }),
      ).rejects.toThrow();
    });

    it("should handle rapid status updates", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      setSSLStatus("example.com", SSLStatus.PENDING);

      const watcher = client.watchSSL("example.com", { interval: 50, timeout: 5000 });

      const statuses: SSLStatusInfo[] = [];

      watcher.start({
        onStatus: (status) => {
          statuses.push(status);
        },
      });

      // Rapidly change status
      let i = 0;
      const interval = setInterval(() => {
        setSSLStatus("example.com", i % 2 === 0 ? SSLStatus.PENDING : SSLStatus.VALIDATING);
        i++;
        if (i > 5) {
          clearInterval(interval);
          setSSLStatus("example.com", SSLStatus.VALID);
        }
      }, 25);

      await new Promise((resolve) => setTimeout(resolve, 400));

      watcher.stop();

      expect(statuses.length).toBeGreaterThan(0);
    });

    it("should handle error responses from API", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      // Test with a domain that might not exist
      const watcher = client.watchSSL("nonexistent.example.com", { interval: 100 });
      const errorPromise = new Promise<boolean>((resolve) => {
        watcher.start({
          onError: () => {
            resolve(true);
          },
        });
      });

      const errorReceived = await errorPromise;

      // The test verifies error handling is in place
      // Note: watcher.stop() is called automatically when error is emitted
      expect(errorReceived).toBe(true);
    });
  });

  describe("SSL Status Fetch", () => {
    it("should fetch current SSL status", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      setSSLStatus("example.com", "valid", undefined);

      const status = await client.getSSLStatus("example.com");

      expect(status.status).toBe("valid");
      expect(status.last_updated_at).toBeDefined();
    });

    it("should fetch SSL status with error detail", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      setSSLStatus("example.com", "failed", "DNS record not found");

      const status = await client.getSSLStatus("example.com");

      expect(status.status).toBe("failed");
      expect(status.error).toBe("DNS record not found");
    });

    it("should handle different SSL states", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      const states = [
        SSLStatus.PENDING,
        SSLStatus.VALIDATING,
        SSLStatus.VALID,
        SSLStatus.FAILED,
        SSLStatus.ERROR,
      ];

      for (const state of states) {
        setSSLStatus("example.com", state);
        const status = await client.getSSLStatus("example.com");
        expect(status.status).toBe(state);
      }
    });
  });

  describe("SSL Watcher Lifecycle", () => {
    it("should allow multiple start/stop cycles", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      setSSLStatus("example.com", SSLStatus.PENDING);

      const watcher = client.watchSSL("example.com", { interval: 100, timeout: 5000 });

      // First cycle
      await watcher.start();
      await new Promise((resolve) => setTimeout(resolve, 150));
      watcher.stop();

      // Second cycle
      await watcher.start();
      await new Promise((resolve) => setTimeout(resolve, 150));
      watcher.stop();

      // Third cycle
      await watcher.start();
      await new Promise((resolve) => setTimeout(resolve, 150));
      watcher.stop();

      expect(true).toBe(true);
    });

    it("should handle stop before start", ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      const watcher = client.watchSSL("example.com");

      expect(() => {
        watcher.stop();
      }).not.toThrow();
    });

    it("should handle multiple stop calls", async ({ worker }) => {
      worker.use(...websitesHandlers);
      const client = new WebsitesClient(mockConfig);

      setSSLStatus("example.com", SSLStatus.PENDING);

      const watcher = client.watchSSL("example.com", { interval: 100 });

      await watcher.start();

      watcher.stop();
      watcher.stop();
      watcher.stop();

      expect(true).toBe(true);
    });
  });
});
