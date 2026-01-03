/**
 * Integration tests for network clients
 * These tests use MSW to mock HTTP responses and are agnostic to the network driver
 * They can run in both browser (with XHR) and Node.js (with ky) environments
 */

import { test as it } from "@/__tests__/int-test";
import { describe, expect, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { getNetworkClient } from "../";
import type { NetworkCallbacks, NetworkRequestOptions } from "../types";

describe("Network Client Integration Tests (Agnostic)", () => {
  describe("basic requests", () => {
    it("should make a successful GET request", async ({ worker }) => {
      worker.use(
        http.get("https://api.test.com/data", () => {
          return HttpResponse.json(
            { success: true, data: "test" },
            {
              status: 200,
              headers: {
                "access-control-allow-origin": "*",
              },
            },
          );
        }),
      );

      const client = getNetworkClient();
      const options: NetworkRequestOptions = {
        method: "GET",
      };

      const result = await client.request("https://api.test.com/data", options);

      expect(result.status).toBe(200);
      expect(result.statusText).toBe("OK");
      expect(result.response).toEqual({ success: true, data: "test" });
    });

    it("should make a successful POST request", async ({ worker }) => {
      worker.use(
        http.post("https://api.test.com/upload", () => {
          return HttpResponse.json(
            { url: "https://api.test.com/files/123" },
            {
              status: 201,
              headers: {
                "access-control-allow-origin": "*",
              },
            },
          );
        }),
      );

      const client = getNetworkClient();
      const options: NetworkRequestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: "data" }),
      };

      const result = await client.request(
        "https://api.test.com/upload",
        options,
      );

      expect(result.status).toBe(201);
      expect(result.statusText).toBe("Created");
      expect(result.response).toEqual({
        url: "https://api.test.com/files/123",
      });
    });

    it("should handle JSON responses", async ({ worker }) => {
      worker.use(
        http.get("https://api.test.com/json", () => {
          return HttpResponse.json(
            { message: "Hello" },
            {
              status: 200,
              headers: {
                "content-type": "application/json",
                "access-control-allow-origin": "*",
              },
            },
          );
        }),
      );

      const client = getNetworkClient();
      const options: NetworkRequestOptions = {
        method: "GET",
      };

      const result = await client.request("https://api.test.com/json", options);

      expect(result.responseType).toBe("json");
      expect(result.response).toEqual({ message: "Hello" });
    });

    it("should handle text responses", async ({ worker }) => {
      worker.use(
        http.get("https://api.test.com/text", () => {
          return HttpResponse.text("plain text response", {
            status: 200,
            headers: {
              "content-type": "text/plain",
              "access-control-allow-origin": "*",
            },
          });
        }),
      );

      const client = getNetworkClient();
      const options: NetworkRequestOptions = {
        method: "GET",
      };

      const result = await client.request("https://api.test.com/text", options);

      expect(result.responseType).toBe("text");
      expect(result.response).toBe("plain text response");
      expect(result.responseText).toBe("plain text response");
    });
  });

  describe("error handling", () => {
    it("should handle 404 errors", async ({ worker }) => {
      worker.use(
        http.get("https://api.test.com/notfound", () => {
          return HttpResponse.json(
            { error: "Not found" },
            {
              status: 404,
              headers: {
                "access-control-allow-origin": "*",
              },
            },
          );
        }),
      );

      const client = getNetworkClient();
      const options: NetworkRequestOptions = {
        method: "GET",
      };

      await expect(
        client.request("https://api.test.com/notfound", options),
      ).rejects.toThrow();
    });

    it("should handle 500 errors", async ({ worker }) => {
      worker.use(
        http.get("https://api.test.com/error", () => {
          return HttpResponse.json(
            { error: "Internal server error" },
            {
              status: 500,
              headers: {
                "access-control-allow-origin": "*",
              },
            },
          );
        }),
      );

      const client = getNetworkClient();
      const options: NetworkRequestOptions = {
        method: "GET",
      };

      await expect(
        client.request("https://api.test.com/error", options),
      ).rejects.toThrow();
    });

    it("should handle network errors", async ({ worker }) => {
      worker.use(
        http.get("https://api.test.com/network-error", () => {
          return HttpResponse.error();
        }),
      );

      const client = getNetworkClient();
      const options: NetworkRequestOptions = {
        method: "GET",
      };

      await expect(
        client.request("https://api.test.com/network-error", options),
      ).rejects.toThrow();
    });
  });

  describe("request options", () => {
    it("should send custom headers", async ({ worker }) => {
      const headerSpy = vi.fn();

      worker.use(
        http.post("https://api.test.com/headers", ({ request }) => {
          headerSpy(request.headers.get("X-Custom-Header"));
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

      const client = getNetworkClient();
      const options: NetworkRequestOptions = {
        method: "POST",
        headers: { "X-Custom-Header": "custom-value" },
      };

      await client.request("https://api.test.com/headers", options);

      expect(headerSpy).toHaveBeenCalledWith("custom-value");
    });

    it("should handle timeout", async ({ worker }) => {
      const timeoutSpy = vi.fn();

      worker.use(
        http.post("https://api.test.com/timeout", () => {
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

      const client = getNetworkClient();
      const options: NetworkRequestOptions = {
        method: "POST",
        timeout: 5000,
      };
      const callbacks: NetworkCallbacks = {
        onTimeout: timeoutSpy,
      };

      await client.request("https://api.test.com/timeout", options, callbacks);

      // Note: timeout behavior differs between browser and Node.js
      // Browser: timeout callback is called when no progress occurs
      // Node.js: ky handles timeout differently (as a request timeout)
      // This test verifies the interface is accepted
    });
  });

  describe("hooks", () => {
    it("should call onBeforeRequest hook", async ({ worker }) => {
      worker.use(
        http.get("https://api.test.com/hook-test", () => {
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

      const client = getNetworkClient();
      const onBeforeRequest = vi.fn();
      client.setHooks?.({ onBeforeRequest });

      const options: NetworkRequestOptions = {
        method: "GET",
      };

      await client.request("https://api.test.com/hook-test", options);

      expect(onBeforeRequest).toHaveBeenCalled();
    });

    it("should call onAfterResponse hook", async ({ worker }) => {
      worker.use(
        http.get("https://api.test.com/hook-test", () => {
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

      const client = getNetworkClient();
      const onAfterResponse = vi.fn();
      client.setHooks?.({ onAfterResponse });

      const options: NetworkRequestOptions = {
        method: "GET",
      };

      await client.request("https://api.test.com/hook-test", options);

      expect(onAfterResponse).toHaveBeenCalled();
    });

    it("should call shouldRetry hook on error", async ({ worker }) => {
      worker.use(
        http.get("https://api.test.com/retry-test", () => {
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

      const client = getNetworkClient();
      const shouldRetry = vi.fn(() => false);
      client.setHooks?.({ shouldRetry });

      const options: NetworkRequestOptions = {
        method: "GET",
        retries: 0, // Disable automatic retries for this test
      };

      await expect(
        client.request("https://api.test.com/retry-test", options),
      ).rejects.toThrow();

      expect(shouldRetry).toHaveBeenCalled();
    });
  });

  describe("responseType option", () => {
    it("should force JSON parsing when responseType is json", async ({
      worker,
    }) => {
      worker.use(
        http.post("https://api.test.com/force-json", () => {
          return HttpResponse.json(
            { url: "https://example.com" },
            {
              status: 200,
              headers: {
                "content-type": "text/plain",
                "access-control-allow-origin": "*",
              },
            },
          );
        }),
      );

      const client = getNetworkClient();
      const options: NetworkRequestOptions = {
        method: "POST",
        responseType: "json",
        body: "test data",
      };

      const result = await client.request(
        "https://api.test.com/force-json",
        options,
      );

      expect(result.responseType).toBe("json");
      expect(result.response).toEqual({ url: "https://example.com" });
    });
  });
});
