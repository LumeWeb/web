import type { CrudFilters, CrudSort } from "@refinedev/core";
import { describe, expect, test } from "vitest";

import { parseQueryParams, serializeQueryParams } from "../index.js";

describe("round-trip serialization", () => {
  describe("filters round-trip", () => {
    test("basic equality filter", () => {
      const original: CrudFilters = [
        { field: "name", operator: "eq", value: "john" },
      ];

      const serialized = serializeQueryParams({ filters: original });
      const parsed = parseQueryParams(serialized);

      expect(parsed.filters).toEqual(original);
    });

    test("not equals operator", () => {
      const original: CrudFilters = [
        { field: "age", operator: "ne", value: 20 },
      ];

      const serialized = serializeQueryParams({ filters: original });
      const parsed = parseQueryParams(serialized);

      expect(parsed.filters).toEqual(original);
    });

    test("contains operator", () => {
      const original: CrudFilters = [
        { field: "title", operator: "contains", value: "test" },
      ];

      const serialized = serializeQueryParams({ filters: original });
      const parsed = parseQueryParams(serialized);

      expect(parsed.filters).toEqual(original);
    });

    test("nested conditional filters", () => {
      const original: CrudFilters = [
        {
          operator: "or",
          value: [
            {
              operator: "and",
              value: [
                { field: "name", operator: "eq", value: "john" },
                { field: "age", operator: "gte", value: 30 },
              ],
            },
          ],
        },
      ];

      const serialized = serializeQueryParams({ filters: original });
      const parsed = parseQueryParams(serialized);

      expect(parsed.filters).toEqual(original);
    });

    test("global search", () => {
      const original: CrudFilters = [
        { field: "q", operator: "eq", value: "searchterm" },
      ];

      const serialized = serializeQueryParams({ filters: original });
      const parsed = parseQueryParams(serialized);

      expect(parsed.filters).toEqual(original);
    });

    test("numeric value types", () => {
      const original: CrudFilters = [
        { field: "age", operator: "eq", value: 25 },
        { field: "price", operator: "gte", value: 19.99 },
      ];

      const serialized = serializeQueryParams({ filters: original });
      const parsed = parseQueryParams(serialized);

      expect(parsed.filters).toEqual(original);
    });

    test("boolean value handling", () => {
      const original: CrudFilters = [
        { field: "active", operator: "eq", value: true },
        { field: "vip", operator: "ne", value: false },
      ];

      const serialized = serializeQueryParams({ filters: original });
      const parsed = parseQueryParams(serialized);

      expect(parsed.filters).toEqual(original);
    });

    test("complex nested filters", () => {
      const original: CrudFilters = [
        {
          operator: "or",
          value: [
            {
              operator: "and",
              value: [
                { field: "status", operator: "eq", value: "active" },
                { field: "age", operator: "gte", value: 18 },
              ],
            },
            {
              operator: "not" as any,
              value: [{ field: "name", operator: "contains", value: "test" }],
            },
          ],
        },
      ];

      const serialized = serializeQueryParams({ filters: original });
      const parsed = parseQueryParams(serialized);

      expect(parsed.filters).toEqual(original);
    });

    test("deeply nested conditional filters", () => {
      const original: CrudFilters = [
        {
          operator: "and",
          value: [
            {
              operator: "or",
              value: [
                { field: "category", operator: "eq", value: "books" },
                { field: "category", operator: "eq", value: "movies" },
              ],
            },
            { field: "price", operator: "between", value: [10, 50] },
            {
              operator: "or",
              value: [
                {
                  operator: "and",
                  value: [
                    { field: "type", operator: "eq", value: "digital" },
                    { field: "stock", operator: "gte", value: 5 },
                  ],
                },
                {
                  operator: "and",
                  value: [
                    { field: "type", operator: "eq", value: "physical" },
                    { field: "stock", operator: "gte", value: 10 },
                  ],
                },
              ],
            },
          ],
        },
      ];

      const serialized = serializeQueryParams({ filters: original });
      const parsed = parseQueryParams(serialized);

      expect(parsed.filters).toEqual(original);
    });

    test("empty string value for eq operator", () => {
      const original: CrudFilters = [
        { field: "name", operator: "eq", value: "" },
      ];

      const serialized = serializeQueryParams({ filters: original });
      const parsed = parseQueryParams(serialized);

      expect(parsed.filters).toEqual(original);
    });

    test("null operator", () => {
      const original: CrudFilters = [
        { field: "deleted_at", operator: "null", value: null },
      ];

      const serialized = serializeQueryParams({ filters: original });
      const parsed = parseQueryParams(serialized);

      expect(parsed.filters).toEqual(original);
    });

    test("not null operator", () => {
      const original: CrudFilters = [
        { field: "updated_at", operator: "nnull", value: null },
      ];

      const serialized = serializeQueryParams({ filters: original });
      const parsed = parseQueryParams(serialized);

      expect(parsed.filters).toEqual(original);
    });

    test("between operator with numeric values", () => {
      const original: CrudFilters = [
        { field: "price", operator: "between", value: [10, 20] },
      ];

      const serialized = serializeQueryParams({ filters: original });
      const parsed = parseQueryParams(serialized);

      expect(parsed.filters).toEqual([
        { field: "price", operator: "between", value: [10, 20] },
      ]);
    });

    test("multiple values for in operator", () => {
      const original: CrudFilters = [
        { field: "id", operator: "in", value: [1, 2, 3] },
      ];

      const serialized = serializeQueryParams({ filters: original });
      const parsed = parseQueryParams(serialized);

      expect(parsed.filters).toEqual([
        { field: "id", operator: "in", value: [1, 2, 3] },
      ]);
    });

    test("ina operator with mixed values", () => {
      const original: CrudFilters = [
        { field: "tags", operator: "ina", value: ["go", 123] },
      ];

      const serialized = serializeQueryParams({ filters: original });
      const parsed = parseQueryParams(serialized);

      expect(parsed.filters).toEqual([
        { field: "tags", operator: "ina", value: ["go", 123] },
      ]);
    });

    test("url encoded values", () => {
      const original: CrudFilters = [
        { field: "message", operator: "contains", value: "hello world" },
      ];

      const serialized = serializeQueryParams({ filters: original });
      const parsed = parseQueryParams(serialized);

      expect(parsed.filters).toEqual(original);
    });
  });

  describe("sorters round-trip", () => {
    test("single sort ascending", () => {
      const original: CrudSort[] = [{ field: "name", order: "asc" }];

      const serialized = serializeQueryParams({ sorters: original });
      const parsed = parseQueryParams(serialized);

      expect(parsed.sorters).toEqual(original);
    });

    test("single sort descending", () => {
      const original: CrudSort[] = [{ field: "age", order: "desc" }];

      const serialized = serializeQueryParams({ sorters: original });
      const parsed = parseQueryParams(serialized);

      expect(parsed.sorters).toEqual(original);
    });

    test("multiple sorts", () => {
      const original: CrudSort[] = [
        { field: "name", order: "asc" },
        { field: "age", order: "desc" },
        { field: "created_at", order: "asc" },
      ];

      const serialized = serializeQueryParams({ sorters: original });
      const parsed = parseQueryParams(serialized);

      expect(parsed.sorters).toEqual(original);
    });

    test("empty sorts", () => {
      const original: CrudSort[] = [];

      const serialized = serializeQueryParams({ sorters: original });
      const parsed = parseQueryParams(serialized);

      expect(parsed.sorters).toBeUndefined();
    });

    test("url encoded field names", () => {
      const original: CrudSort[] = [{ field: "user name", order: "asc" }];

      const serialized = serializeQueryParams({ sorters: original });
      const parsed = parseQueryParams(serialized);

      expect(parsed.sorters).toEqual(original);
    });
  });

  describe("pagination round-trip", () => {
    test("default pagination", () => {
      const original = { start: 0, end: 10 };

      const serialized = serializeQueryParams({ pagination: original });
      const parsed = parseQueryParams(serialized);

      expect(parsed.pagination).toEqual(original);
    });

    test("custom pagination", () => {
      const original = { start: 20, end: 50 };

      const serialized = serializeQueryParams({ pagination: original });
      const parsed = parseQueryParams(serialized);

      expect(parsed.pagination).toEqual(original);
    });

    test("zero start", () => {
      const original = { start: 0, end: 100 };

      const serialized = serializeQueryParams({ pagination: original });
      const parsed = parseQueryParams(serialized);

      expect(parsed.pagination).toEqual(original);
    });
  });

  describe("combined round-trip", () => {
    test("filters, sorters, and pagination", () => {
      const filters: CrudFilters = [
        { field: "status", operator: "eq", value: "active" },
      ];
      const sorters: CrudSort[] = [{ field: "name", order: "asc" }];
      const pagination = { start: 0, end: 10 };

      const serialized = serializeQueryParams({ filters, sorters, pagination });
      const parsed = parseQueryParams(serialized);

      expect(parsed.filters).toEqual(filters);
      expect(parsed.sorters).toEqual(sorters);
      expect(parsed.pagination).toEqual(pagination);
    });

    test("complex query round-trip", () => {
      const filters: CrudFilters = [
        {
          operator: "or",
          value: [
            { field: "name", operator: "contains", value: "john" },
            { field: "age", operator: "gte", value: 25 },
          ],
        },
      ];
      const sorters: CrudSort[] = [
        { field: "name", order: "asc" },
        { field: "created_at", order: "desc" },
      ];
      const pagination = { start: 10, end: 20 };

      const serialized = serializeQueryParams({ filters, sorters, pagination });
      const parsed = parseQueryParams(serialized);

      expect(parsed.filters).toEqual(filters);
      expect(parsed.sorters).toEqual(sorters);
      expect(parsed.pagination).toEqual(pagination);
    });
  });
});
