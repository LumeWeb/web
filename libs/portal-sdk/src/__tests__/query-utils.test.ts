import { describe, expect, it } from "vitest";
import type { OperationsQueryParams } from "@/query-utils";
import { buildOperationsQueryParams } from "@/query-utils";
import { createEqFilter, createInFilter, createDescSort, calculatePagination } from "@lumeweb/query-builder";

describe("buildOperationsQueryParams", () => {
  describe("search parameter", () => {
    it("should include search parameter in URLSearchParams", () => {
      const params: OperationsQueryParams = {
        search: "myfile",
      };
      const result = buildOperationsQueryParams(params);
      expect(result.get("search")).toBe("myfile");
      expect(result.toString()).toBe("search=myfile");
    });

    it("should combine search with filters", () => {
      const params: OperationsQueryParams = {
        filters: [createEqFilter("status", "completed")],
        search: "test",
      };
      const result = buildOperationsQueryParams(params);
      expect(result.get("search")).toBe("test");
      expect(result.get("filters[status]")).toBe("completed");
    });

    it("should combine search with sorters", () => {
      const params: OperationsQueryParams = {
        sorters: [createDescSort("id")],
        search: "test",
      };
      const result = buildOperationsQueryParams(params);
      expect(result.get("search")).toBe("test");
      expect(result.get("_sort")).toBe("id");
      expect(result.get("_order")).toBe("desc");
    });

    it("should combine search with pagination", () => {
      const params: OperationsQueryParams = {
        pagination: { start: 0, end: 20 },
        search: "test",
      };
      const result = buildOperationsQueryParams(params);
      expect(result.get("search")).toBe("test");
      expect(result.get("_start")).toBe("0");
      expect(result.get("_end")).toBe("20");
    });

    it("should handle search with special characters", () => {
      const params: OperationsQueryParams = {
        search: "test@example.com",
      };
      const result = buildOperationsQueryParams(params);
      expect(result.get("search")).toBe("test@example.com");
    });

    it("should handle unicode in search", () => {
      const params: OperationsQueryParams = {
        search: "hello 世界",
      };
      const result = buildOperationsQueryParams(params);
      expect(result.get("search")).toBe("hello 世界");
    });
  });

  describe("parameter combination", () => {
    it("should combine filters, sorters, pagination, and search", () => {
      const params: OperationsQueryParams = {
        filters: [
          createEqFilter("status", "completed"),
          createInFilter("operation", ["upload", "download"]),
        ],
        sorters: [createDescSort("id")],
        pagination: { start: 0, end: 20 },
        search: "myfile",
      };
      const result = buildOperationsQueryParams(params);

      expect(result.get("filters[status]")).toBe("completed");
      expect(result.get("filters[operation][in][0]")).toBe("upload");
      expect(result.get("filters[operation][in][1]")).toBe("download");
      expect(result.get("_sort")).toBe("id");
      expect(result.get("_order")).toBe("desc");
      expect(result.get("_start")).toBe("0");
      expect(result.get("_end")).toBe("20");
      expect(result.get("search")).toBe("myfile");
    });

    it("should work with calculatePagination utility", () => {
      const pagination = calculatePagination(2, 10);
      const params: OperationsQueryParams = {
        pagination,
        search: "test",
      };
      const result = buildOperationsQueryParams(params);

      expect(result.get("_start")).toBe("10");
      expect(result.get("_end")).toBe("20");
      expect(result.get("search")).toBe("test");
    });
  });

  describe("URLSearchParams behavior", () => {
    it("should return URLSearchParams object", () => {
      const params: OperationsQueryParams = { search: "test" };
      const result = buildOperationsQueryParams(params);
      expect(result).toBeInstanceOf(URLSearchParams);
    });

    it("should allow iteration over entries", () => {
      const params: OperationsQueryParams = {
        filters: [createEqFilter("status", "completed")],
        search: "test",
      };
      const result = buildOperationsQueryParams(params);
      const entries = Array.from(result.entries());
      
      expect(entries.length).toBeGreaterThan(0);
      expect(entries.some(([key, value]) => key === "search" && value === "test")).toBe(true);
    });

    it("should allow checking if key exists", () => {
      const params: OperationsQueryParams = { search: "test" };
      const result = buildOperationsQueryParams(params);
      
      expect(result.has("search")).toBe(true);
      expect(result.has("filters[status]")).toBe(false);
    });

    it("should produce valid URL string", () => {
      const params: OperationsQueryParams = {
        filters: [createEqFilter("status", "completed")],
        search: "myfile",
      };
      const result = buildOperationsQueryParams(params);
      const url = result.toString();
      
      expect(url).toContain("filters");
      expect(url).toContain("status");
      expect(url).toContain("completed");
      expect(url).toContain("search=myfile");
    });
  });

  describe("edge cases", () => {
    it("should handle empty params", () => {
      const params: OperationsQueryParams = {};
      const result = buildOperationsQueryParams(params);
      expect(result.toString()).toBe("");
    });

    it("should handle undefined filters, sorters, pagination", () => {
      const params: OperationsQueryParams = {
        filters: undefined,
        sorters: undefined,
        pagination: undefined,
        search: "test",
      };
      const result = buildOperationsQueryParams(params);
      expect(result.get("search")).toBe("test");
      expect(result.get("_sort")).toBeNull();
      expect(result.get("_order")).toBeNull();
      expect(result.get("_start")).toBeNull();
      expect(result.get("_end")).toBeNull();
    });

    it("should handle very long search terms", () => {
      const longSearch = "a".repeat(1000);
      const params: OperationsQueryParams = { search: longSearch };
      const result = buildOperationsQueryParams(params);
      expect(result.get("search")).toBe(longSearch);
    });
  });
});
