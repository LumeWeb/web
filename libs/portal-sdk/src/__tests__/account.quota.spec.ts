import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { AccountApi } from "@/account";
import { expectSuccess, expectFailure } from "./test-helpers";

function createMockFetchResponse(
  body: any,
  status: number,
  headers: Record<string, string> = {}
): Response {
  const response = new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json", ...headers },
  });
  Object.defineProperty(response, "status", { value: status, writable: false });
  Object.defineProperty(response, "ok", { value: status >= 200 && status < 300 });
  return response;
}

describe("AccountApi - quota", () => {
  let accountApi: AccountApi;
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    accountApi = new AccountApi("https://test.com");
    mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("quota", () => {
    it("should return QuotaStatusResponse on success", async () => {
      const mockData = {
        download: { used: 1073741824, limit: 10737418240, remaining: 9663676416, percentage: 10 },
        storage: { used: 2147483648, limit: 10737418240, remaining: 8589934592, percentage: 20 },
        upload: { used: 536870912, limit: 5368709120, remaining: 4831838208, percentage: 10 },
      };
      mockFetch.mockResolvedValue(createMockFetchResponse(mockData, 200));

      const result = await accountApi.quota();

      expectSuccess(result);
      expect(result.data.storage.used).toBe(2147483648);
      expect(result.data.storage.limit).toBe(10737418240);
      expect(result.data.storage.remaining).toBe(8589934592);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("https://account.test.com/api/account/quota"),
        expect.objectContaining({
          method: "GET",
        })
      );
    });

    it("should return error on failure", async () => {
      mockFetch.mockResolvedValue(
        createMockFetchResponse({ error: "Unauthorized" }, 401)
      );

      const result = await accountApi.quota();

      expectFailure(result);
      expect(result.error).toBeDefined();
    });
  });

  describe("quotaHistory", () => {
    it("should return QuotaHistoryResponse on success without params", async () => {
      const mockData = {
        points: [
          { bytes: 1073741824, date: "2024-01-01" },
          { bytes: 2147483648, date: "2024-01-02" },
        ],
        user_id: 1,
      };
      mockFetch.mockResolvedValue(createMockFetchResponse(mockData, 200));

      const result = await accountApi.quotaHistory();

      expectSuccess(result);
      expect(result.data.points).toHaveLength(2);
      expect(result.data.user_id).toBe(1);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("https://account.test.com/api/account/quota/history"),
        expect.objectContaining({
          method: "GET",
        })
      );
    });

    it("should return QuotaHistoryResponse with query params", async () => {
      const mockData = {
        points: [
          { bytes: 1073741824, date: "2024-06-01" },
        ],
        user_id: 1,
      };
      mockFetch.mockResolvedValue(createMockFetchResponse(mockData, 200));

      const result = await accountApi.quotaHistory({
        start_date: "2024-01-01",
        end_date: "2024-12-31",
        type: "storage",
      });

      expectSuccess(result);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/account/quota/history"),
        expect.objectContaining({
          method: "GET",
        })
      );

      const callArgs = mockFetch.mock.calls[0];
      const url = callArgs[0] as string;
      const urlObj = new URL(url);

      expect(urlObj.searchParams.get("start_date")).toBe("2024-01-01");
      expect(urlObj.searchParams.get("end_date")).toBe("2024-12-31");
      expect(urlObj.searchParams.get("type")).toBe("storage");
    });

    it("should return error on failure", async () => {
      mockFetch.mockResolvedValue(
        createMockFetchResponse({ error: "Bad Request" }, 400)
      );

      const result = await accountApi.quotaHistory();

      expectFailure(result);
      expect(result.error).toBeDefined();
    });
  });
});
