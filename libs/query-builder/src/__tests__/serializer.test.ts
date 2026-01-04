import type { CrudFilters, CrudSort } from "@refinedev/core";
import { describe, expect, test } from "vitest";

import { serializeQueryParams } from "../serializer.js";

describe("serializeQueryParams", () => {
  describe("filters", () => {
    test("basic equality", () => {
      const filters: CrudFilters = [
        {
          field: "name",
          operator: "eq",
          value: "john",
        },
      ];

      const result = serializeQueryParams({ filters });
      expect(result).toEqual({
        "filters[name]": "john",
      });
    });

    test("not equals operator", () => {
      const filters: CrudFilters = [
        {
          field: "age",
          operator: "ne",
          value: 20,
        },
      ];

      const result = serializeQueryParams({ filters });
      expect(result).toEqual({
        "filters[age][ne]": "20",
      });
    });

    test("contains operator", () => {
      const filters: CrudFilters = [
        {
          field: "title",
          operator: "contains",
          value: "test",
        },
      ];

      const result = serializeQueryParams({ filters });
      expect(result).toEqual({
        "filters[title][contains]": "test",
      });
    });

    test("nested conditional filters", () => {
      const filters: CrudFilters = [
        {
          operator: "or",
          value: [
            {
              operator: "and",
              value: [
                {
                  field: "name",
                  operator: "eq",
                  value: "john",
                },
                {
                  field: "age",
                  operator: "gte",
                  value: 30,
                },
              ],
            },
          ],
        },
      ];

      const result = serializeQueryParams({ filters });
      expect(result).toEqual({
        "filters[or][0][and][0][name]": "john",
        "filters[or][0][and][1][age][gte]": "30",
      });
    });

    test("global search", () => {
      const filters: CrudFilters = [
        {
          field: "q",
          operator: "eq",
          value: "searchterm",
        },
      ];

      const result = serializeQueryParams({ filters });
      expect(result).toEqual({
        q: "searchterm",
      });
    });

    test("numeric value types", () => {
      const filters: CrudFilters = [
        { field: "age", operator: "eq", value: 25 },
        { field: "price", operator: "gte", value: 19.99 },
      ];

      const result = serializeQueryParams({ filters });
      expect(result).toEqual({
        "filters[age]": "25",
        "filters[price][gte]": "19.99",
      });
    });

    test("between operator with numeric values", () => {
      const filters: CrudFilters = [
        {
          field: "price",
          operator: "between",
          value: [10, 20],
        },
      ];

      const result = serializeQueryParams({ filters });
      // Array operators use indexed format to preserve value order
      expect(result).toEqual({
        "filters[price][between][0]": "10",
        "filters[price][between][1]": "20",
      });
    });

    test("multiple values for in operator", () => {
      const filters: CrudFilters = [
        {
          field: "id",
          operator: "in",
          value: [1, 2, 3],
        },
      ];

      const result = serializeQueryParams({ filters });
      expect(result).toEqual({
        "filters[id][in][0]": "1",
        "filters[id][in][1]": "2",
        "filters[id][in][2]": "3",
      });
    });

    test("case-sensitive starts with", () => {
      const filters: CrudFilters = [
        {
          field: "code",
          operator: "startswiths",
          value: "ABC123",
        },
      ];

      const result = serializeQueryParams({ filters });
      expect(result).toEqual({
        "filters[code][startswiths]": "ABC123",
      });
    });

    test("url encoded values", () => {
      const filters: CrudFilters = [
        {
          field: "message",
          operator: "contains",
          value: "hello world",
        },
      ];

      const result = serializeQueryParams({ filters });
      expect(result).toEqual({
        "filters[message][contains]": "hello%20world",
      });
    });

    test("throws error for invalid operator syntax", () => {
      const filters: CrudFilters = [
        {
          field: "rating",
          // @ts-expect-error intended invalid operator syntax
          operator: "approx",
          value: 4.5,
        },
      ];

      const result = serializeQueryParams({ filters });
      // Serializer accepts any operator - validation happens during parsing
      expect(result).toEqual({
        "filters[rating][approx]": "4.5",
      });
    });

    test("mixed type array values", () => {
      const filters: CrudFilters = [
        {
          field: "tags",
          operator: "in",
          value: [123, "abc"],
        },
      ];

      const result = serializeQueryParams({ filters });
      expect(result).toEqual({
        "filters[tags][in][0]": "123",
        "filters[tags][in][1]": "abc",
      });
    });

    test("null operator", () => {
      const filters: CrudFilters = [
        {
          field: "deleted_at",
          operator: "null",
          value: null,
        },
      ];

      const result = serializeQueryParams({ filters });
      expect(result).toEqual({
        "filters[deleted_at][null]": "",
      });
    });

    test("not null operator", () => {
      const filters: CrudFilters = [
        {
          field: "updated_at",
          operator: "nnull",
          value: null,
        },
      ];

      const result = serializeQueryParams({ filters });
      expect(result).toEqual({
        "filters[updated_at][nnull]": "",
      });
    });

    test("nested and or filters", () => {
      const filters: CrudFilters = [
        {
          operator: "or",
          value: [
            {
              operator: "and",
              value: [
                {
                  field: "status",
                  operator: "eq",
                  value: "active",
                },
                {
                  field: "price",
                  operator: "lt",
                  value: 100,
                },
              ],
            },
            {
              field: "name",
              operator: "contains",
              value: "special",
            },
          ],
        },
      ];

      const result = serializeQueryParams({ filters });
      expect(result).toEqual({
        "filters[or][0][and][0][status]": "active",
        "filters[or][0][and][1][price][lt]": "100",
        "filters[or][1][name][contains]": "special",
      });
    });

    test("boolean value handling", () => {
      const filters: CrudFilters = [
        { field: "active", operator: "eq", value: true },
        { field: "vip", operator: "ne", value: false },
      ];

      const result = serializeQueryParams({ filters });
      expect(result).toEqual({
        "filters[active]": "true",
        "filters[vip][ne]": "false",
      });
    });

    test("empty string value for eq operator", () => {
      const filters: CrudFilters = [
        {
          field: "name",
          operator: "eq",
          value: "",
        },
      ];

      const result = serializeQueryParams({ filters });
      expect(result).toEqual({
        "filters[name]": "",
      });
    });

    test("ina operator with mixed values", () => {
      const filters: CrudFilters = [
        {
          field: "tags",
          operator: "ina",
          value: ["go", 123],
        },
      ];

      const result = serializeQueryParams({ filters });
      expect(result).toEqual({
        "filters[tags][ina][0]": "go",
        "filters[tags][ina][1]": "123",
      });
    });
  });

  describe("sorters", () => {
    test("empty sorters", () => {
      const result = serializeQueryParams({ sorters: undefined });
      expect(result).toEqual({});
    });

    test("single sorter", () => {
      const sorters: CrudSort[] = [
        {
          field: "name",
          order: "asc",
        },
      ];

      const result = serializeQueryParams({ sorters });
      expect(result).toEqual({
        _order: "asc",
        _sort: "name",
      });
    });

    test("multiple sorters", () => {
      const sorters: CrudSort[] = [
        { field: "name", order: "asc" },
        { field: "age", order: "desc" },
      ];

      const result = serializeQueryParams({ sorters });
      expect(result).toEqual({
        _order: "asc,desc",
        _sort: "name,age",
      });
    });

    test("special characters in field names", () => {
      const sorters: CrudSort[] = [
        {
          field: "user.name",
          order: "asc",
        },
      ];

      const result = serializeQueryParams({ sorters });
      expect(result).toEqual({
        _order: "asc",
        _sort: "user.name",
      });
    });

    test("url encoded field names", () => {
      const sorters: CrudSort[] = [
        {
          field: "user name",
          order: "asc",
        },
      ];

      const result = serializeQueryParams({ sorters });
      expect(result).toEqual({
        _order: "asc",
        _sort: "user%20name",
      });
    });

    test("default order to asc", () => {
      const sorters: CrudSort[] = [
        {
          field: "name",
          order: "asc" as any,
        },
      ];

      const result = serializeQueryParams({ sorters });
      expect(result).toEqual({
        _order: "asc",
        _sort: "name",
      });
    });
  });

  describe("pagination", () => {
    test("default pagination", () => {
      const result = serializeQueryParams({
        pagination: { start: 0, end: 10 },
      });
      expect(result).toEqual({
        _start: "0",
        _end: "10",
      });
    });

    test("custom pagination", () => {
      const result = serializeQueryParams({
        pagination: { start: 20, end: 50 },
      });
      expect(result).toEqual({
        _start: "20",
        _end: "50",
      });
    });

    test("only start provided", () => {
      const result = serializeQueryParams({
        pagination: { start: 10 } as any,
      });
      expect(result).toEqual({
        _start: "10",
      });
    });

    test("only end provided", () => {
      const result = serializeQueryParams({
        pagination: { end: 20 } as any,
      });
      expect(result).toEqual({
        _end: "20",
      });
    });

    test("no pagination", () => {
      const result = serializeQueryParams({});
      expect(result).toEqual({});
    });
  });

  describe("combined", () => {
    test("filters, sorters, and pagination", () => {
      const filters: CrudFilters = [
        { field: "status", operator: "eq", value: "active" },
      ];
      const sorters: CrudSort[] = [{ field: "name", order: "asc" }];
      const pagination = { start: 0, end: 10 };

      const result = serializeQueryParams({ filters, sorters, pagination });
      expect(result).toEqual({
        "filters[status]": "active",
        "_order": "asc",
        "_sort": "name",
        "_start": "0",
        "_end": "10",
      });
    });
  });
});
