import type { CrudFilters } from "@refinedev/core";
import { describe, expect, test } from "vitest";

import {
  addFilter,
  addFilters,
  clearFilters,
  createBetweenFilter,
  createContainsFilter,
  createEqFilter,
  createInFilter,
  findFiltersByField,
  hasOperator,
  isLogicalFilter,
  mergeFilters,
  removeFiltersByField,
  setFiltersByField,
  updateFilterValue,
} from "../filter.js";

describe("filter utilities", () => {
  const sampleFilters: CrudFilters = [
    { field: "name", operator: "eq", value: "john" },
    { field: "age", operator: "gt", value: 25 },
    { field: "status", operator: "eq", value: "active" },
    { operator: "or", value: [{ field: "type", operator: "eq", value: "a" }] },
  ];

  describe("isLogicalFilter", () => {
    test("returns true for logical filters", () => {
      expect(isLogicalFilter({ operator: "and", value: sampleFilters })).toBe(
        true,
      );
      expect(isLogicalFilter({ operator: "or", value: sampleFilters })).toBe(
        true,
      );
    });

    test("returns false for field filters", () => {
      expect(
        isLogicalFilter({ field: "name", operator: "eq", value: "test" }),
      ).toBe(false);
    });
  });

  describe("hasOperator", () => {
    test("returns true when operator matches", () => {
      expect(
        hasOperator({ field: "name", operator: "eq", value: "test" }, "eq"),
      ).toBe(true);
    });

    test("returns false when operator does not match", () => {
      expect(
        hasOperator({ field: "name", operator: "eq", value: "test" }, "ne"),
      ).toBe(false);
    });
  });

  describe("findFiltersByField", () => {
    test("finds all filters for a field", () => {
      const result = findFiltersByField(sampleFilters, "name");
      expect(result).toEqual([
        { field: "name", operator: "eq", value: "john" },
      ]);
    });

    test("returns empty array when field not found", () => {
      const result = findFiltersByField(sampleFilters, "nonexistent");
      expect(result).toEqual([]);
    });
  });

  describe("removeFiltersByField", () => {
    test("removes all filters for a field", () => {
      const result = removeFiltersByField(sampleFilters, "name");
      expect(result).toHaveLength(3);
      expect(result.some((f) => "field" in f && f.field === "name")).toBe(
        false,
      );
    });

    test("keeps logical filters intact", () => {
      const result = removeFiltersByField(sampleFilters, "name");
      const logicalFilter = result.find((f) => isLogicalFilter(f));
      expect(logicalFilter).toBeDefined();
    });
  });

  describe("updateFilterValue", () => {
    test("updates filter value for matching field and operator", () => {
      const result = updateFilterValue(sampleFilters, "name", "eq", "jane");
      const updated = result.find(
        (f) => "field" in f && f.field === "name" && f.operator === "eq",
      );
      expect(updated?.value).toBe("jane");
    });

    test("does not update non-matching filters", () => {
      const result = updateFilterValue(sampleFilters, "name", "eq", "jane");
      const unchanged = result.find(
        (f) => "field" in f && f.field === "age" && f.operator === "gt",
      );
      expect(unchanged?.value).toBe(25);
    });
  });

  describe("createEqFilter", () => {
    test("creates equality filter", () => {
      const result = createEqFilter("name", "john");
      expect(result).toEqual({
        field: "name",
        operator: "eq",
        value: "john",
      });
    });
  });

  describe("createContainsFilter", () => {
    test("creates contains filter", () => {
      const result = createContainsFilter("name", "john");
      expect(result).toEqual({
        field: "name",
        operator: "contains",
        value: "john",
      });
    });
  });

  describe("createInFilter", () => {
    test("creates IN filter", () => {
      const result = createInFilter("id", [1, 2, 3]);
      expect(result).toEqual({
        field: "id",
        operator: "in",
        value: [1, 2, 3],
      });
    });
  });

  describe("createBetweenFilter", () => {
    test("creates between filter", () => {
      const result = createBetweenFilter("price", 10, 20);
      expect(result).toEqual({
        field: "price",
        operator: "between",
        value: [10, 20],
      });
    });
  });

  describe("addFilter", () => {
    test("adds a filter to empty array", () => {
      const result = addFilter([], createEqFilter("name", "john"));
      expect(result).toEqual([
        { field: "name", operator: "eq", value: "john" },
      ]);
    });

    test("adds a filter to existing array", () => {
      const result = addFilter(
        sampleFilters,
        createEqFilter("email", "test@example.com"),
      );
      expect(result).toHaveLength(5);
      expect(result[result.length - 1]).toEqual({
        field: "email",
        operator: "eq",
        value: "test@example.com",
      });
    });

    test("does not mutate original array", () => {
      const original = [...sampleFilters];
      addFilter(sampleFilters, createEqFilter("new", "value"));
      expect(sampleFilters).toEqual(original);
    });
  });

  describe("addFilters", () => {
    test("adds multiple filters to empty array", () => {
      const newFilters = [
        createEqFilter("name", "jane"),
        createEqFilter("age", 30),
      ];
      const result = addFilters([], newFilters);
      expect(result).toHaveLength(2);
      expect(result).toEqual(newFilters);
    });

    test("adds multiple filters to existing array", () => {
      const newFilters = [
        createEqFilter("email", "test@example.com"),
        createEqFilter("phone", "123-456-7890"),
      ];
      const result = addFilters(sampleFilters, newFilters);
      expect(result).toHaveLength(6);
      expect(result.slice(-2)).toEqual(newFilters);
    });

    test("does not mutate original array", () => {
      const original = [...sampleFilters];
      const newFilters = [createEqFilter("new", "value")];
      addFilters(sampleFilters, newFilters);
      expect(sampleFilters).toEqual(original);
    });
  });

  describe("setFiltersByField", () => {
    test("replaces all filters for a field", () => {
      const filtersWithDuplicates: CrudFilters = [
        { field: "name", operator: "eq", value: "john" },
        { field: "name", operator: "contains", value: "j" },
        { field: "age", operator: "gt", value: 25 },
      ];
      const newFilters: CrudFilters = [
        { field: "name", operator: "eq", value: "jane" },
        { field: "name", operator: "ne", value: "bob" },
      ];
      const result = setFiltersByField(
        filtersWithDuplicates,
        "name",
        newFilters,
      );
      expect(
        result.find(
          (f) => "field" in f && f.field === "name" && f.value === "john",
        ),
      ).toBeUndefined();
      expect(
        result.find(
          (f) => "field" in f && f.field === "name" && f.value === "jane",
        ),
      ).toBeDefined();
      expect(
        result.find(
          (f) => "field" in f && f.field === "name" && f.value === "bob",
        ),
      ).toBeDefined();
      expect(
        result.find((f) => "field" in f && f.field === "age"),
      ).toBeDefined();
    });

    test("adds filters when field does not exist", () => {
      const newFilters: CrudFilters = [
        { field: "email", operator: "eq", value: "test@example.com" },
      ];
      const result = setFiltersByField(sampleFilters, "email", newFilters);
      expect(
        result.find((f) => "field" in f && f.field === "email"),
      ).toBeDefined();
      expect(result).toHaveLength(5);
    });

    test("does not mutate original array", () => {
      const original = [...sampleFilters];
      const newFilters = [createEqFilter("name", "new")];
      setFiltersByField(sampleFilters, "name", newFilters);
      expect(sampleFilters).toEqual(original);
    });
  });

  describe("mergeFilters", () => {
    test("merges two filter arrays", () => {
      const filters1: CrudFilters = [
        { field: "name", operator: "eq", value: "john" },
      ];
      const filters2: CrudFilters = [
        { field: "age", operator: "gt", value: 25 },
      ];
      const result = mergeFilters(filters1, filters2);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(filters1[0]);
      expect(result[1]).toEqual(filters2[0]);
    });

    test("handles empty arrays", () => {
      const result = mergeFilters([], []);
      expect(result).toEqual([]);
    });

    test("merges with empty first array", () => {
      const filters: CrudFilters = [
        { field: "name", operator: "eq", value: "john" },
      ];
      const result = mergeFilters([], filters);
      expect(result).toEqual(filters);
    });

    test("does not mutate original arrays", () => {
      const filters1: CrudFilters = [
        { field: "name", operator: "eq", value: "john" },
      ];
      const filters2: CrudFilters = [
        { field: "age", operator: "gt", value: 25 },
      ];
      const original1 = [...filters1];
      const original2 = [...filters2];
      mergeFilters(filters1, filters2);
      expect(filters1).toEqual(original1);
      expect(filters2).toEqual(original2);
    });
  });

  describe("clearFilters", () => {
    test("clears all filters", () => {
      const result = clearFilters(sampleFilters);
      expect(result).toEqual([]);
    });

    test("returns empty array for empty input", () => {
      const result = clearFilters([]);
      expect(result).toEqual([]);
    });

    test("does not mutate original array", () => {
      const original = [...sampleFilters];
      clearFilters(sampleFilters);
      expect(sampleFilters).toEqual(original);
    });
  });
});
