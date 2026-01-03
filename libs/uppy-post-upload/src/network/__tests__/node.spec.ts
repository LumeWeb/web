/**
 * Unit tests for NodeNetworkClient
 */

import { beforeEach, describe, expect, it, vi } from "vitest";
import { NodeNetworkClient } from "../node";
import type { NetworkCallbacks, NetworkRequestOptions } from "../types";
import ky from "ky";
import { mock } from "@/__tests__/test-utils";

// Mock ky library
vi.mock("ky", () => ({
  default: vi.fn(),
}));

describe("NodeNetworkClient", () => {
  let client: NodeNetworkClient;
  const mockedKy = mock(ky);

  beforeEach(() => {
    client = new NodeNetworkClient();
    vi.clearAllMocks();
  });

  describe("isAvailable", () => {
    it("should return true in Node.js environment with fetch", () => {
      // In test environment, we should have process.versions.node
      // and fetch should be available (Node.js 18+)
      const result = client.isAvailable();
      expect(typeof result).toBe("boolean");
    });
  });

  describe("getDriverName", () => {
    it('should return "node"', () => {
      expect(client.getDriverName()).toBe("node");
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

  describe("request", () => {
    it("should make a GET request", async () => {
      const mockResponse = {
        status: 200,
        statusText: "OK",
        json: vi.fn().mockResolvedValue({ success: true }),
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
      };

      mockedKy.mockResolvedValue(mockResponse as never);

      const options: NetworkRequestOptions = {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      };

      const result = await client.request("https://api.test.com", options);

      expect(result.status).toBe(200);
      expect(result.statusText).toBe("OK");
      expect(result.response).toEqual({ success: true });
      expect(ky).toHaveBeenCalledWith(
        "https://api.test.com",
        expect.any(Object),
      );
    });

    it("should handle POST request with body", async () => {
      const mockResponse = {
        status: 201,
        statusText: "Created",
        json: vi.fn().mockResolvedValue({ id: "123" }),
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
      };

      mockedKy.mockResolvedValue(mockResponse as never);

      const options: NetworkRequestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test: "data" }),
      };

      const result = await client.request("https://api.test.com", options);

      expect(result.status).toBe(201);
      expect(result.response).toEqual({ id: "123" });
    });

    it('should set responseType to "json" when content-type is application/json', async () => {
      const mockResponse = {
        status: 200,
        statusText: "OK",
        json: vi.fn().mockResolvedValue({ data: "test" }),
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
      };

      mockedKy.mockResolvedValue(mockResponse as never);

      const options: NetworkRequestOptions = {
        method: "GET",
      };

      const result = await client.request("https://api.test.com", options);

      expect(result.responseType).toBe("json");
      expect(result.response).toEqual({ data: "test" });
    });

    it('should set responseType to "json" when explicitly requested via responseType option (footgun test)', async () => {
      const mockResponse = {
        status: 200,
        statusText: "OK",
        json: vi.fn().mockResolvedValue({ url: "https://example.com" }),
        text: vi.fn().mockResolvedValue('{"url":"https://example.com"}'),
        headers: {
          get: vi.fn().mockReturnValue("text/plain"),
        },
      };

      mockedKy.mockResolvedValue(mockResponse as never);

      const options: NetworkRequestOptions = {
        method: "POST",
        responseType: "json",
        body: "test data",
      };

      const result = await client.request("https://api.test.com", options);

      // Even with text/plain content-type, responseType='json' should force JSON parsing
      expect(result.responseType).toBe("json");
      expect(result.response).toEqual({ url: "https://example.com" });
      expect(mockResponse.json).toHaveBeenCalled();
      expect(mockResponse.text).not.toHaveBeenCalled();
    });

    it("should parse as text when responseType is not json and content-type is not json", async () => {
      const mockResponse = {
        status: 200,
        statusText: "OK",
        text: vi.fn().mockResolvedValue("plain text response"),
        headers: {
          get: vi.fn().mockReturnValue("text/plain"),
        },
      };

      mockedKy.mockResolvedValue(mockResponse as never);

      const options: NetworkRequestOptions = {
        method: "GET",
      };

      const result = await client.request("https://api.test.com", options);

      expect(result.responseType).toBe("text");
      expect(result.response).toBe("plain text response");
      expect(result.responseText).toBe("plain text response");
    });

    it("should handle text responses", async () => {
      const mockResponse = {
        status: 200,
        statusText: "OK",
        text: vi.fn().mockResolvedValue("plain text response"),
        headers: {
          get: vi.fn().mockReturnValue("text/plain"),
        },
      };

      mockedKy.mockResolvedValue(mockResponse as never);

      const options: NetworkRequestOptions = {
        method: "GET",
      };

      const result = await client.request("https://api.test.com", options);

      expect(result.responseText).toBe("plain text response");
      expect(result.response).toBe("plain text response");
    });

    it("should handle upload progress callbacks", async () => {
      const mockResponse = {
        status: 200,
        statusText: "OK",
        json: vi.fn().mockResolvedValue({ success: true }),
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
      };

      mockedKy.mockResolvedValue(mockResponse as never);

      const onUploadProgress = vi.fn();
      const options: NetworkRequestOptions = {
        method: "POST",
      };
      const callbacks: NetworkCallbacks = {
        onUploadProgress,
      };

      await client.request("https://api.test.com", options, callbacks);

      // Verify ky was called with onUploadProgress
      expect(ky).toHaveBeenCalledWith(
        "https://api.test.com",
        expect.objectContaining({
          onUploadProgress: expect.any(Function),
        }),
      );
    });

    it("should handle timeout callbacks", async () => {
      const mockResponse = {
        status: 200,
        statusText: "OK",
        json: vi.fn().mockResolvedValue({ success: true }),
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
      };

      mockedKy.mockResolvedValue(mockResponse as never);

      const onTimeout = vi.fn();
      const options: NetworkRequestOptions = {
        method: "POST",
        timeout: 5000,
      };
      const callbacks: NetworkCallbacks = {
        onTimeout,
      };

      await client.request("https://api.test.com", options, callbacks);

      // Verify ky was called with onTimeout
      expect(ky).toHaveBeenCalledWith(
        "https://api.test.com",
        expect.objectContaining({
          onTimeout: expect.any(Function),
        }),
      );
    });

    it("should call onBeforeRequest hook", async () => {
      const mockResponse = {
        status: 200,
        statusText: "OK",
        json: vi.fn().mockResolvedValue({ success: true }),
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
      };

      mockedKy.mockResolvedValue(mockResponse as never);

      const onBeforeRequest = vi.fn();
      client.setHooks({ onBeforeRequest });

      const options: NetworkRequestOptions = {
        method: "GET",
      };

      await client.request("https://api.test.com", options);

      expect(onBeforeRequest).toHaveBeenCalledWith(undefined, 0);
    });

    it("should call onAfterResponse hook", async () => {
      const mockResponse = {
        status: 200,
        statusText: "OK",
        json: vi.fn().mockResolvedValue({ success: true }),
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
      };

      mockedKy.mockResolvedValue(mockResponse as never);

      const onAfterResponse = vi.fn();
      client.setHooks({ onAfterResponse });

      const options: NetworkRequestOptions = {
        method: "GET",
      };

      await client.request("https://api.test.com", options);

      expect(onAfterResponse).toHaveBeenCalledWith(
        { status: 200, statusText: "OK" },
        0,
      );
    });

    it("should handle AbortError", async () => {
      const abortError = new Error("Aborted");
      abortError.name = "AbortError";

      mockedKy.mockRejectedValue(abortError);

      const options: NetworkRequestOptions = {
        method: "GET",
      };

      await expect(
        client.request("https://api.test.com", options),
      ).rejects.toThrow("Aborted");
    });

    it("should disable ky's built-in retry (manual retry handling)", async () => {
      const mockResponse = {
        status: 200,
        statusText: "OK",
        json: vi.fn().mockResolvedValue({ success: true }),
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
      };

      mockedKy.mockResolvedValue(mockResponse as never);

      const shouldRetry = vi.fn(() => true);
      client.setHooks({ shouldRetry });

      const options: NetworkRequestOptions = {
        method: "POST",
      };

      await client.request("https://api.test.com", options);

      // Verify ky was called with retry: 0 (disabled)
      expect(ky).toHaveBeenCalledWith(
        "https://api.test.com",
        expect.objectContaining({
          retry: 0,
        }),
      );
    });

    it("should call shouldRetry hook during manual retry handling", async () => {
      // Mock a 500 error response
      const errorResponse = {
        status: 500,
        statusText: "Internal Server Error",
        json: vi.fn().mockResolvedValue({ error: "Server error" }),
        text: vi.fn().mockResolvedValue('{"error":"Server error"}'),
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
      };

      const httpError = new Error("Request failed") as any;
      httpError.response = errorResponse;

      // First call fails with 500, second call succeeds
      const mockSuccessResponse = {
        status: 200,
        statusText: "OK",
        json: vi.fn().mockResolvedValue({ success: true }),
        headers: {
          get: vi.fn().mockReturnValue("application/json"),
        },
      };

      mockedKy
        .mockRejectedValueOnce(httpError)
        .mockResolvedValueOnce(mockSuccessResponse as never);

      const shouldRetry = vi.fn(() => true);
      client.setHooks({ shouldRetry });

      const options: NetworkRequestOptions = {
        method: "POST",
        retries: 1, // Allow 1 retry
      };

      await client.request("https://api.test.com", options);

      // Verify the user's shouldRetry hook was called with the error
      expect(shouldRetry).toHaveBeenCalledWith(httpError);
    });
  });
});
