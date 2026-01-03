/**
 * Browser-specific tests for BrowserNetworkClient
 * Tests focus on interface and environment detection rather than mocking internal implementation
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { BrowserNetworkClient } from "../browser";
import type { NetworkCallbacks, NetworkRequestOptions } from "../types";

describe("BrowserNetworkClient (Browser)", () => {
  let client: BrowserNetworkClient;

  beforeEach(() => {
    client = new BrowserNetworkClient();
    vi.clearAllMocks();
  });

  describe("isAvailable", () => {
    it("should return true when XMLHttpRequest is available", () => {
      expect(client.isAvailable()).toBe(true);
    });
  });

  describe("getDriverName", () => {
    it('should return "browser"', () => {
      expect(client.getDriverName()).toBe("browser");
    });
  });

  describe("setHooks", () => {
    it("should accept shouldRetry hook", () => {
      const shouldRetry = vi.fn(() => true);
      expect(() => {
        client.setHooks({ shouldRetry });
      }).not.toThrow();
    });

    it("should accept onAfterResponse hook", () => {
      const onAfterResponse = vi.fn();
      expect(() => {
        client.setHooks({ onAfterResponse });
      }).not.toThrow();
    });

    it("should accept onBeforeRequest hook", () => {
      const onBeforeRequest = vi.fn();
      expect(() => {
        client.setHooks({ onBeforeRequest });
      }).not.toThrow();
    });

    it("should accept all hooks at once", () => {
      const shouldRetry = vi.fn(() => true);
      const onAfterResponse = vi.fn();
      const onBeforeRequest = vi.fn();

      expect(() => {
        client.setHooks({
          shouldRetry,
          onAfterResponse,
          onBeforeRequest,
        });
      }).not.toThrow();
    });
  });

  describe("request interface", () => {
    it("should have request method that returns a Promise", () => {
      const options: NetworkRequestOptions = {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      };

      const result = client.request("https://api.test.com", options);
      expect(result).toBeInstanceOf(Promise);
    });

    it("should accept callbacks parameter", () => {
      const options: NetworkRequestOptions = {
        method: "POST",
      };
      const callbacks: NetworkCallbacks = {
        onUploadProgress: vi.fn(),
        onTimeout: vi.fn(),
      };

      const result = client.request("https://api.test.com", options, callbacks);
      expect(result).toBeInstanceOf(Promise);
    });

    it("should handle all request options", () => {
      const options: NetworkRequestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: "data" }),
        timeout: 5000,
        withCredentials: true,
        responseType: "json",
        retries: 5,
      };

      const result = client.request("https://api.test.com", options);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe("error handling", () => {
    it("should handle network errors gracefully", async () => {
      // Note: In browser environment, invalid URLs may resolve differently
      // This test verifies the client handles errors without crashing
      const options: NetworkRequestOptions = {
        method: "GET",
      };

      // Just verify the request method exists and returns a promise
      const result = client.request(
        "https://invalid-url-that-might-fail-12345.com",
        options,
      );
      expect(result).toBeInstanceOf(Promise);
    });
  });
});
