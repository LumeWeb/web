import type { CrudSort } from "@refinedev/core";
import { describe, expect, test } from "vitest";

import {
  addSorter,
  addSorters,
  clearSorters,
  createAscSort,
  createDescSort,
  createSort,
  findSorter,
  getSortFields,
  hasSorter,
  removeSorter,
  reverseSorters,
  setSorter,
  toggleSort,
  toggleSorter,
  updateSorterOrder,
} from "../sort.js";

describe("sort utilities", () => {
  const sampleSorters: CrudSort[] = [
    { field: "name", order: "asc" },
    { field: "age", order: "desc" },
    { field: "created_at", order: "asc" },
  ];

  describe("createSort", () => {
    test("creates sort with specified order", () => {
      const result = createSort("name", "asc");
      expect(result).toEqual({ field: "name", order: "asc" });
    });

    test("creates descending sort", () => {
      const result = createSort("age", "desc");
      expect(result).toEqual({ field: "age", order: "desc" });
    });
  });

  describe("createAscSort", () => {
    test("creates ascending sort", () => {
      const result = createAscSort("name");
      expect(result).toEqual({ field: "name", order: "asc" });
    });
  });

  describe("createDescSort", () => {
    test("creates descending sort", () => {
      const result = createDescSort("age");
      expect(result).toEqual({ field: "age", order: "desc" });
    });
  });

  describe("toggleSort", () => {
    test("toggles asc to desc", () => {
      const result = toggleSort({ field: "name", order: "asc" });
      expect(result).toEqual({ field: "name", order: "desc" });
    });

    test("toggles desc to asc", () => {
      const result = toggleSort({ field: "name", order: "desc" });
      expect(result).toEqual({ field: "name", order: "asc" });
    });
  });

  describe("hasSorter", () => {
    test("returns true when field exists", () => {
      expect(hasSorter(sampleSorters, "name")).toBe(true);
    });

    test("returns false when field does not exist", () => {
      expect(hasSorter(sampleSorters, "nonexistent")).toBe(false);
    });
  });

  describe("findSorter", () => {
    test("finds sorter for field", () => {
      const result = findSorter(sampleSorters, "age");
      expect(result).toEqual({ field: "age", order: "desc" });
    });

    test("returns undefined when field not found", () => {
      const result = findSorter(sampleSorters, "nonexistent");
      expect(result).toBeUndefined();
    });
  });

  describe("removeSorter", () => {
    test("removes sorter for field", () => {
      const result = removeSorter(sampleSorters, "age");
      expect(result).toHaveLength(2);
      expect(result.some((s) => s.field === "age")).toBe(false);
    });

    test("does not modify when field not found", () => {
      const result = removeSorter(sampleSorters, "nonexistent");
      expect(result).toHaveLength(3);
    });
  });

  describe("updateSorterOrder", () => {
    test("updates order for matching field", () => {
      const result = updateSorterOrder(sampleSorters, "name", "desc");
      const updated = result.find((s) => s.field === "name");
      expect(updated?.order).toBe("desc");
    });

    test("does not update non-matching fields", () => {
      const result = updateSorterOrder(sampleSorters, "name", "desc");
      const unchanged = result.find((s) => s.field === "age");
      expect(unchanged?.order).toBe("desc");
    });
  });

  describe("reverseSorters", () => {
    test("reverses all sorters", () => {
      const result = reverseSorters(sampleSorters);
      expect(result).toEqual([
        { field: "name", order: "desc" },
        { field: "age", order: "asc" },
        { field: "created_at", order: "desc" },
      ]);
    });

    test("handles empty array", () => {
      const result = reverseSorters([]);
      expect(result).toEqual([]);
    });
  });

  describe("addSorter", () => {
    test("adds a sorter to empty array", () => {
      const result = addSorter([], createSort("name", "asc"));
      expect(result).toEqual([{ field: "name", order: "asc" }]);
    });

    test("adds a sorter to existing array", () => {
      const result = addSorter(sampleSorters, createSort("email", "desc"));
      expect(result).toHaveLength(4);
      expect(result[result.length - 1]).toEqual({
        field: "email",
        order: "desc",
      });
    });

    test("does not mutate original array", () => {
      const original = [...sampleSorters];
      addSorter(sampleSorters, createSort("new", "asc"));
      expect(sampleSorters).toEqual(original);
    });
  });

  describe("addSorters", () => {
    test("adds multiple sorters to empty array", () => {
      const newSorters = [createSort("name", "asc"), createSort("age", "desc")];
      const result = addSorters([], newSorters);
      expect(result).toHaveLength(2);
      expect(result).toEqual(newSorters);
    });

    test("adds multiple sorters to existing array", () => {
      const newSorters = [
        createSort("email", "asc"),
        createSort("phone", "desc"),
      ];
      const result = addSorters(sampleSorters, newSorters);
      expect(result).toHaveLength(5);
      expect(result.slice(-2)).toEqual(newSorters);
    });

    test("does not mutate original array", () => {
      const original = [...sampleSorters];
      const newSorters = [createSort("new", "asc")];
      addSorters(sampleSorters, newSorters);
      expect(sampleSorters).toEqual(original);
    });
  });

  describe("setSorter", () => {
    test("replaces existing sorter for field", () => {
      const result = setSorter(sampleSorters, "name", "desc");
      expect(result.find((s) => s.field === "name")?.order).toBe("desc");
      expect(result).toHaveLength(3);
    });

    test("adds new sorter when field does not exist", () => {
      const result = setSorter(sampleSorters, "email", "asc");
      expect(result.find((s) => s.field === "email")).toBeDefined();
      expect(result).toHaveLength(4);
    });

    test("does not mutate original array", () => {
      const original = [...sampleSorters];
      setSorter(sampleSorters, "name", "desc");
      expect(sampleSorters).toEqual(original);
    });
  });

  describe("toggleSorter", () => {
    test("toggles existing sorter from asc to desc", () => {
      const result = toggleSorter(sampleSorters, "name");
      expect(result.find((s) => s.field === "name")?.order).toBe("desc");
      expect(result).toHaveLength(3);
    });

    test("toggles existing sorter from desc to asc", () => {
      const result = toggleSorter(sampleSorters, "age");
      expect(result.find((s) => s.field === "age")?.order).toBe("asc");
      expect(result).toHaveLength(3);
    });

    test("adds new asc sorter when field does not exist", () => {
      const result = toggleSorter(sampleSorters, "email");
      const newSorter = result.find((s) => s.field === "email");
      expect(newSorter).toBeDefined();
      expect(newSorter?.order).toBe("asc");
      expect(result).toHaveLength(4);
    });

    test("does not mutate original array", () => {
      const original = [...sampleSorters];
      toggleSorter(sampleSorters, "name");
      expect(sampleSorters).toEqual(original);
    });
  });

  describe("clearSorters", () => {
    test("clears all sorters", () => {
      const result = clearSorters(sampleSorters);
      expect(result).toEqual([]);
    });

    test("returns empty array for empty input", () => {
      const result = clearSorters([]);
      expect(result).toEqual([]);
    });

    test("does not mutate original array", () => {
      const original = [...sampleSorters];
      clearSorters(sampleSorters);
      expect(sampleSorters).toEqual(original);
    });
  });

  describe("getSortFields", () => {
    test("gets all sort field names", () => {
      const result = getSortFields(sampleSorters);
      expect(result).toEqual(["name", "age", "created_at"]);
    });

    test("returns empty array for empty input", () => {
      const result = getSortFields([]);
      expect(result).toEqual([]);
    });
  });
});
