/**
 * Node.js integration tests for network client
 * These tests use MSW server to mock HTTP responses in Node.js environment
 * They test Node.js-specific features of the ky-based network client
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { NodeNetworkClient } from "../node";
import type { NetworkRequestOptions } from "../types";
import { server } from "../../__tests__/setup.node";

describe("Network Client Integration Tests (Node.js Specific)", () => {
  let client: NodeNetworkClient;

  beforeEach(() => {
    client = new NodeNetworkClient();
  });

  describe("abort", () => {
    it("should handle AbortError", async () => {
      server.use(
        http.get("https://api.test.com/abort", () => {
          return HttpResponse.json(
            { success: true },
            {
              status: 200,
              headers: {
                "access-control-allow-origin": "*",
              },
            },
          );
        }),
      );

      const controller = new AbortController();
      const options: NetworkRequestOptions = {
        method: "GET",
        signal: controller.signal,
      };

      // Abort immediately
      controller.abort();

      await expect(
        client.request("https://api.test.com/abort", options),
      ).rejects.toThrow("Aborted");
    });
  });

  describe("request options", () => {
    it("should handle withCredentials", async () => {
      server.use(
        http.post("https://api.test.com/credentials", () => {
          return HttpResponse.json(
            { success: true },
            {
              status: 200,
              headers: {
                "access-control-allow-origin": "*",
              },
            },
          );
        }),
      );

      const options: NetworkRequestOptions = {
        method: "POST",
        withCredentials: true,
      };

      const result = await client.request(
        "https://api.test.com/credentials",
        options,
      );

      expect(result.status).toBe(200);
    });

    it("should handle retries", async () => {
      let requestCount = 0;

      server.use(
        http.get("https://api.test.com/retry", () => {
          requestCount++;
          if (requestCount < 3) {
            return HttpResponse.json(
              { error: "Server error" },
              {
                status: 500,
                headers: {
                  "access-control-allow-origin": "*",
                },
              },
            );
          }
          return HttpResponse.json(
            { success: true },
            {
              status: 200,
              headers: {
                "access-control-allow-origin": "*",
              },
            },
          );
        }),
      );

      const options: NetworkRequestOptions = {
        method: "GET",
        retries: 3,
      };

      const result = await client.request(
        "https://api.test.com/retry",
        options,
      );

      expect(result.status).toBe(200);
      expect(requestCount).toBe(3);
    });
  });

  describe("hooks", () => {
    it("should respect shouldRetry hook return value", async () => {
      let requestCount = 0;

      server.use(
        http.get("https://api.test.com/custom-retry", () => {
          requestCount++;
          return HttpResponse.json(
            { error: "Server error" },
            {
              status: 500,
              headers: {
                "access-control-allow-origin": "*",
              },
            },
          );
        }),
      );

      const shouldRetry = vi.fn(() => true);
      client.setHooks({ shouldRetry });

      const options: NetworkRequestOptions = {
        method: "GET",
        retries: 5,
      };

      try {
        await client.request("https://api.test.com/custom-retry", options);
      } catch (error) {
        // Expected to fail after retries
      }

      // shouldRetry should have been called multiple times
      expect(shouldRetry.mock.calls.length).toBeGreaterThan(1);
    }, 30000);
  });
});
