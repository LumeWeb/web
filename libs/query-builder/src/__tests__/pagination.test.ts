import type { Pagination } from "./../types.js";
import { describe, expect, test } from "vitest";

import {
  calculatePageFromPagination,
  calculatePagination,
  clearPagination,
  getNextPage,
  getPrevPage,
  getTotalPages,
  hasNextPage,
  hasPrevPage,
  nextPage,
  prevPage,
  setPageInfo,
  setPagination,
} from "../pagination.js";

describe("pagination utilities", () => {
  describe("calculatePagination", () => {
    test("calculates start/end from page and pageSize", () => {
      const result = calculatePagination(1, 10);
      expect(result).toEqual({
        start: 0,
        end: 10,
        page: 1,
        pageSize: 10,
      });
    });

    test("calculates for second page", () => {
      const result = calculatePagination(2, 10);
      expect(result).toEqual({
        start: 10,
        end: 20,
        page: 2,
        pageSize: 10,
      });
    });

    test("calculates for third page", () => {
      const result = calculatePagination(3, 25);
      expect(result).toEqual({
        start: 50,
        end: 75,
        page: 3,
        pageSize: 25,
      });
    });
  });

  describe("calculatePageFromPagination", () => {
    test("calculates page and pageSize from start and end", () => {
      const result = calculatePageFromPagination(0, 10);
      expect(result).toEqual({ page: 1, pageSize: 10 });
    });

    test("calculates for second page", () => {
      const result = calculatePageFromPagination(10, 20);
      expect(result).toEqual({ page: 2, pageSize: 10 });
    });

    test("calculates for offset pagination", () => {
      const result = calculatePageFromPagination(20, 50);
      expect(result).toEqual({ page: 1, pageSize: 30 });
    });
  });

  describe("getNextPage", () => {
    test("returns next page number", () => {
      const pagination = { start: 0, end: 10, page: 1, pageSize: 10 };
      const result = getNextPage(pagination);
      expect(result).toBe(2);
    });

    test("returns null when page is not set", () => {
      const pagination = { start: 0, end: 10 };
      const result = getNextPage(pagination);
      expect(result).toBeNull();
    });

    test("returns null when pageSize is not set", () => {
      const pagination = { start: 0, end: 10, page: 1 };
      const result = getNextPage(pagination);
      expect(result).toBeNull();
    });
  });

  describe("getPrevPage", () => {
    test("returns previous page number", () => {
      const pagination = { start: 10, end: 20, page: 2, pageSize: 10 };
      const result = getPrevPage(pagination);
      expect(result).toBe(1);
    });

    test("returns null when on first page", () => {
      const pagination = { start: 0, end: 10, page: 1, pageSize: 10 };
      const result = getPrevPage(pagination);
      expect(result).toBeNull();
    });

    test("returns null when page is not set", () => {
      const pagination = { start: 0, end: 10 };
      const result = getPrevPage(pagination);
      expect(result).toBeNull();
    });
  });

  describe("hasNextPage", () => {
    test("returns true when there are more items", () => {
      const pagination = { start: 0, end: 10, page: 1, pageSize: 10 };
      const result = hasNextPage(25, pagination);
      expect(result).toBe(true);
    });

    test("returns false when at the end", () => {
      const pagination = { start: 20, end: 30, page: 3, pageSize: 10 };
      const result = hasNextPage(25, pagination);
      expect(result).toBe(false);
    });

    test("returns false when exactly at the end", () => {
      const pagination = { start: 0, end: 10, page: 1, pageSize: 10 };
      const result = hasNextPage(10, pagination);
      expect(result).toBe(false);
    });
  });

  describe("hasPrevPage", () => {
    test("returns true when not on first page", () => {
      const pagination = { start: 10, end: 20, page: 2, pageSize: 10 };
      const result = hasPrevPage(pagination);
      expect(result).toBe(true);
    });

    test("returns false when on first page", () => {
      const pagination = { start: 0, end: 10, page: 1, pageSize: 10 };
      const result = hasPrevPage(pagination);
      expect(result).toBe(false);
    });

    test("returns false when start is 0", () => {
      const pagination = { start: 0, end: 10 };
      const result = hasPrevPage(pagination);
      expect(result).toBe(false);
    });
  });

  describe("getTotalPages", () => {
    test("calculates total pages", () => {
      const result = getTotalPages(25, 10);
      expect(result).toBe(3);
    });

    test("calculates exact pages", () => {
      const result = getTotalPages(30, 10);
      expect(result).toBe(3);
    });

    test("handles single page", () => {
      const result = getTotalPages(5, 10);
      expect(result).toBe(1);
    });

    test("handles large numbers", () => {
      const result = getTotalPages(1000, 25);
      expect(result).toBe(40);
    });
  });

  describe("setPagination", () => {
    test("sets pagination with start and end", () => {
      const result = setPagination(10, 20);
      expect(result).toEqual({
        start: 10,
        end: 20,
      });
    });

    test("sets pagination with page and pageSize", () => {
      const result = setPagination(0, 10, 1, 10);
      expect(result).toEqual({
        start: 0,
        end: 10,
        page: 1,
        pageSize: 10,
      });
    });
  });

  describe("setPageInfo", () => {
    test("adds page info to pagination", () => {
      const pagination: Pagination = { start: 0, end: 10 };
      const result = setPageInfo(pagination, 2, 10);
      expect(result).toEqual({
        start: 10,
        end: 20,
        page: 2,
        pageSize: 10,
      });
    });

    test("does not mutate original pagination", () => {
      const pagination: Pagination = { start: 0, end: 10 };
      setPageInfo(pagination, 2, 10);
      expect(pagination).toEqual({ start: 0, end: 10 });
    });
  });

  describe("nextPage", () => {
    test("moves to next page", () => {
      const pagination: Pagination = {
        start: 0,
        end: 10,
        page: 1,
        pageSize: 10,
      };
      const result = nextPage(pagination, 100);
      expect(result).toEqual({
        start: 10,
        end: 20,
        page: 2,
        pageSize: 10,
      });
    });

    test("returns null when no page info", () => {
      const pagination: Pagination = { start: 0, end: 10 };
      const result = nextPage(pagination, 100);
      expect(result).toBeNull();
    });

    test("returns null when at end", () => {
      const pagination: Pagination = {
        start: 90,
        end: 100,
        page: 10,
        pageSize: 10,
      };
      const result = nextPage(pagination, 100);
      expect(result).toBeNull();
    });

    test("does not mutate original pagination", () => {
      const pagination: Pagination = {
        start: 0,
        end: 10,
        page: 1,
        pageSize: 10,
      };
      nextPage(pagination, 100);
      expect(pagination).toEqual({ start: 0, end: 10, page: 1, pageSize: 10 });
    });
  });

  describe("prevPage", () => {
    test("moves to previous page", () => {
      const pagination: Pagination = {
        start: 10,
        end: 20,
        page: 2,
        pageSize: 10,
      };
      const result = prevPage(pagination);
      expect(result).toEqual({
        start: 0,
        end: 10,
        page: 1,
        pageSize: 10,
      });
    });

    test("returns null when no page info", () => {
      const pagination: Pagination = { start: 10, end: 20 };
      const result = prevPage(pagination);
      expect(result).toBeNull();
    });

    test("returns null when on first page", () => {
      const pagination: Pagination = {
        start: 0,
        end: 10,
        page: 1,
        pageSize: 10,
      };
      const result = prevPage(pagination);
      expect(result).toBeNull();
    });

    test("handles missing pageSize", () => {
      const pagination: Pagination = { start: 10, end: 20, page: 2 };
      const result = prevPage(pagination);
      expect(result).toEqual({
        start: 0,
        end: 10,
        page: 1,
        pageSize: 10,
      });
    });

    test("does not mutate original pagination", () => {
      const pagination: Pagination = {
        start: 10,
        end: 20,
        page: 2,
        pageSize: 10,
      };
      prevPage(pagination);
      expect(pagination).toEqual({ start: 10, end: 20, page: 2, pageSize: 10 });
    });
  });

  describe("clearPagination", () => {
    test("returns undefined", () => {
      const result = clearPagination();
      expect(result).toBeUndefined();
    });
  });
});
