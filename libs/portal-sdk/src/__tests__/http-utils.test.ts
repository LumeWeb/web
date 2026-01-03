import { describe, expect, it, vi, afterEach } from "vitest";
import { isEmptyResponse, parseResponse, fetchWithHandling, delay, poll } from "@/http-utils";

// Helper function to create mock Response objects with various status codes
function createMockResponse(
  body: BodyInit | null,
  status: number,
  headers?: HeadersInit
): Response {
  const response = new Response(body, { status: 200, headers });
  Object.defineProperty(response, "status", { value: status });
  return response;
}

// Clean up global stubs after each test
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("isEmptyResponse", () => {
  it("should return true for 204 No Content status", () => {
    const response = createMockResponse("", 204);
    expect(isEmptyResponse(response)).toBe(true);
  });

  it("should return true for 205 Reset Content status", () => {
    const response = createMockResponse("", 205);
    expect(isEmptyResponse(response)).toBe(true);
  });

  it("should return true for 304 Not Modified status", () => {
    const response = createMockResponse("", 304);
    expect(isEmptyResponse(response)).toBe(true);
  });

  it("should return true for content-length header of '0'", () => {
    const response = new Response("", {
      status: 200,
      headers: { "content-length": "0" },
    });
    expect(isEmptyResponse(response)).toBe(true);
  });

  it("should return false for content-length header with positive value", () => {
    const response = new Response('{"data": "test"}', {
      status: 200,
      headers: { "content-length": "15" },
    });
    expect(isEmptyResponse(response)).toBe(false);
  });

  it("should return false when content-length header is missing and status is not empty", () => {
    const response = new Response('{"data": "test"}', { status: 200 });
    expect(isEmptyResponse(response)).toBe(false);
  });

  it("should return false for 200 OK with content", () => {
    const response = new Response('{"data": "test"}', { status: 200 });
    expect(isEmptyResponse(response)).toBe(false);
  });
});

describe("parseResponse", () => {
  it("should parse valid JSON response", async () => {
    const mockData = { id: 1, name: "test" };
    const response = new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { "content-type": "application/json" },
    });

    const result = await parseResponse<typeof mockData>(response);
    expect(result).toEqual(mockData);
  });

  it("should return undefined for 204 No Content", async () => {
    const response = createMockResponse("", 204);
    const result = await parseResponse<any>(response);
    expect(result).toBeUndefined();
  });

  it("should return undefined for 205 Reset Content", async () => {
    const response = createMockResponse("", 205);
    const result = await parseResponse<any>(response);
    expect(result).toBeUndefined();
  });

  it("should return undefined for 304 Not Modified", async () => {
    const response = createMockResponse("", 304);
    const result = await parseResponse<any>(response);
    expect(result).toBeUndefined();
  });

  it("should return undefined for empty content-length", async () => {
    const response = new Response("", {
      status: 200,
      headers: { "content-length": "0" },
    });
    const result = await parseResponse<any>(response);
    expect(result).toBeUndefined();
  });

  it("should throw for invalid JSON when not empty", async () => {
    const response = new Response("invalid json", {
      status: 200,
      headers: { "content-length": "11" },
    });
    await expect(parseResponse<any>(response)).rejects.toThrow();
  });

  it("should parse array responses", async () => {
    const mockData = [1, 2, 3];
    const response = new Response(JSON.stringify(mockData), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
    const result = await parseResponse<number[]>(response);
    expect(result).toEqual(mockData);
  });

  it("should parse null JSON values", async () => {
    const response = new Response("null", {
      status: 200,
      headers: { "content-type": "application/json" },
    });
    const result = await parseResponse<any>(response);
    expect(result).toBeNull();
  });

  it("should parse string JSON values", async () => {
    const response = new Response('"test"', {
      status: 200,
      headers: { "content-type": "application/json" },
    });
    const result = await parseResponse<string>(response);
    expect(result).toBe("test");
  });
});

describe("delay", () => {
  it("should resolve after specified milliseconds", async () => {
    const start = Date.now();
    await delay(100);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeGreaterThanOrEqual(90);
    expect(elapsed).toBeLessThan(150);
  });

  it("should resolve immediately for 0ms delay", async () => {
    const start = Date.now();
    await delay(0);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(20);
  });
});

describe("poll", () => {
  it("should stop when condition is met", async () => {
    let counter = 0;
    const mockFetch = vi.fn().mockImplementation(async () => {
      counter++;
      return { success: true, data: counter };
    });

    const result = await poll(mockFetch, (data) => data >= 3, { interval: 10 });
    expect(result.data).toBe(3);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it("should timeout after specified time", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      success: true,
      data: { status: "pending" },
    });

    const result = await poll(mockFetch, () => false, { interval: 10, timeout: 50 });
    expect(result.success).toBe(false);
    expect(result.error).toBeInstanceOf(Error);
    expect(result.error?.message).toContain("Polling timed out");
  });

  it("should return error result if fetch fails", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      success: false,
      error: new Error("Fetch failed"),
    });

    const result = await poll(mockFetch, () => true);
    expect(result.success).toBe(false);
    expect(result.error?.message).toBe("Fetch failed");
  });

  it("should use default interval and timeout", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      success: true,
      data: { status: "completed" },
    });

    const result = await poll(mockFetch, (data) => data.status === "completed");
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ status: "completed" });
  });

  it("should account for network latency when calculating timeout", async () => {
    const startTime = Date.now();
    let callCount = 0;
    
    // Simulate a fetch that takes 30ms to complete
    const mockFetch = vi.fn().mockImplementation(async () => {
      await delay(30);
      callCount++;
      return { success: true, data: { status: "pending" } };
    });

    // With a 50ms timeout and 30ms network latency per call,
    // only 1 fetch should complete before timeout
    const result = await poll(mockFetch, () => false, { interval: 10, timeout: 50 });
    const elapsed = Date.now() - startTime;

    expect(result.success).toBe(false);
    expect(result.error?.message).toContain("Polling timed out");
    expect(callCount).toBeLessThanOrEqual(2); // Should only fit 1-2 calls due to latency
    // Total time should be close to timeout, not significantly longer
    expect(elapsed).toBeLessThan(80); // Allow some margin for test execution
  });
});

describe("fetchWithHandling", () => {
  it("should successfully fetch and parse JSON response", async () => {
    const mockData = { id: 1, name: "test" };
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(mockData), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", mockFetch);

    const result = await fetchWithHandling<typeof mockData>("http://test.com");
    expect(result.data).toEqual(mockData);
    expect(result.status).toBe(200);
    expect(result.headers).toBeInstanceOf(Headers);
  });

  it("should handle empty responses correctly", async () => {
    const mockFetch = vi.fn().mockResolvedValue(createMockResponse("", 204));
    vi.stubGlobal("fetch", mockFetch);

    const result = await fetchWithHandling<any>("http://test.com");
    expect(result.data).toBeUndefined();
    expect(result.status).toBe(204);
    expect(result.headers).toBeInstanceOf(Headers);
  });

  it("should pass through fetch options", async () => {
    const mockData = { success: true };
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(mockData), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    );
    vi.stubGlobal("fetch", mockFetch);

    const options = {
      method: "POST",
      headers: { Authorization: "Bearer token" },
    };
    await fetchWithHandling<typeof mockData>("http://test.com", options);

    expect(mockFetch).toHaveBeenCalledWith("http://test.com", options);
  });

  it("should propagate fetch errors", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
    vi.stubGlobal("fetch", mockFetch);

    await expect(fetchWithHandling<any>("http://test.com")).rejects.toThrow(
      "Network error"
    );
  });
});
