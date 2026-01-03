import { describe, expect, it, vi } from "vitest";
import { HTTPError, TimeoutError } from "ky";
import { UrlEncoder, urlToFile } from "../url";
import { EncoderError } from "../error";

describe("UrlEncoder", () => {
  const createMockFetch = (blob: Blob, ok = true) => {
    return vi.fn().mockResolvedValue({
      ok,
      blob: () => Promise.resolve(blob),
      statusText: ok ? "OK" : "Not Found",
      status: ok ? 200 : 404,
      url: "https://example.com/test.txt",
    } as Response);
  };

  const createMockFetchHTTPError = (status: number, statusText: string) => {
    const mockResponse = {
      ok: false,
      status,
      statusText,
      url: "https://example.com/test.txt",
    } as Response;

    const mockRequest = {
      url: "https://example.com/test.txt",
      method: "GET",
    } as Request;

    return vi
      .fn()
      .mockRejectedValue(new HTTPError(mockResponse, mockRequest, {} as any));
  };

  const createMockFetchTimeoutError = () => {
    return vi.fn().mockRejectedValue(
      new TimeoutError({
        url: "https://example.com/test.txt",
        method: "GET",
      } as Request),
    );
  };

  const createMockFetchError = (message: string) => {
    return vi.fn().mockRejectedValue(new Error(message));
  };

  describe("urlToFile", () => {
    it("should encode URL to file by fetching content", async () => {
      const mockBlob = new Blob(["Hello World"], { type: "text/plain" });
      const mockFetch = createMockFetch(mockBlob);

      const result = await urlToFile("https://example.com/test.txt", {
        fetch: mockFetch,
      });

      expect(result.file).toBeInstanceOf(File);
      expect(result.file.name).toBe("test.txt");
      expect(result.file.type).toBe("text/plain");
      expect(result.file.size).toBe(11);

      const content = await result.file.text();
      expect(content).toBe("Hello World");

      expect(mockFetch).toHaveBeenCalled();
      expect(mockFetch.mock.calls[0][0]).toBeInstanceOf(Request);
      expect(mockFetch.mock.calls[0][0].url).toBe(
        "https://example.com/test.txt",
      );
    });

    it("should use provided name instead of URL filename", async () => {
      const mockBlob = new Blob(["content"], { type: "text/plain" });
      const mockFetch = createMockFetch(mockBlob);

      const result = await urlToFile("https://example.com/path/to/file.txt", {
        name: "custom-name.txt",
        fetch: mockFetch,
      });

      expect(result.file.name).toBe("custom-name.txt");
      expect(result.options.name).toBe("custom-name.txt");
    });

    it("should preserve keyvalues in options", async () => {
      const mockBlob = new Blob(["content"], { type: "text/plain" });
      const mockFetch = createMockFetch(mockBlob);

      const result = await urlToFile("https://example.com/file.txt", {
        keyvalues: { type: "remote" },
        fetch: mockFetch,
      });

      expect(result.options.keyvalues).toEqual({ type: "remote" });
    });

    it("should use default filename when URL has no path", async () => {
      const mockBlob = new Blob(["content"], { type: "text/plain" });
      const mockFetch = createMockFetch(mockBlob);

      const result = await urlToFile("https://example.com", {
        fetch: mockFetch,
      });

      expect(result.file.name).toBe("file");
    });

    it("should handle different content types", async () => {
      const mockBlob = new Blob(["<html></html>"], { type: "text/html" });
      const mockFetch = createMockFetch(mockBlob);

      const result = await urlToFile("https://example.com/index.html", {
        fetch: mockFetch,
      });

      expect(result.file.type).toBe("text/html");
    });

    it("should throw error for failed fetch", async () => {
      const mockFetch = createMockFetch(new Blob([]), false);

      const error = await urlToFile("https://example.com/not-found.txt", {
        fetch: mockFetch,
      }).catch((e) => e);

      expect(error).toBeInstanceOf(EncoderError);
      expect((error as EncoderError).code).toBe("NETWORK_ERROR");
    });

    it("should throw error for timeout errors", async () => {
      const mockFetch = createMockFetchTimeoutError();

      const error = await urlToFile("https://example.com/file.txt", {
        fetch: mockFetch,
      }).catch((e) => e);

      expect(error).toBeInstanceOf(EncoderError);
      expect((error as EncoderError).code).toBe("NETWORK_ERROR");
    });

    it("should throw error for network errors", async () => {
      const mockFetch = createMockFetchError("Network error");

      const error = await urlToFile("https://example.com/file.txt", {
        fetch: mockFetch,
      }).catch((e) => e);

      expect(error).toBeInstanceOf(EncoderError);
      expect((error as EncoderError).code).toBe("NETWORK_ERROR");
    });

    it("should throw error for invalid URL", async () => {
      const mockFetch = createMockFetchError("Invalid URL");

      await expect(
        urlToFile("not-a-url", { fetch: mockFetch }),
      ).rejects.toThrow(EncoderError);
    });
  });

  describe("UrlEncoder class", () => {
    it("should encode URL to file", async () => {
      const encoder = new UrlEncoder();
      const mockBlob = new Blob(["content"], { type: "text/plain" });
      const mockFetch = createMockFetch(mockBlob);

      const result = await encoder.encode("https://example.com/file.txt", {
        fetch: mockFetch,
      });

      expect(result.file).toBeInstanceOf(File);
      expect(result.file.name).toBe("file.txt");
    });
  });
});
