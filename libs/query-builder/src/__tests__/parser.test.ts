import { describe, expect, test } from "vitest";

import { parseQueryParams } from "../parser.js";

describe("parseQueryParams", () => {
  describe("filters - basic operators", () => {
    test("basic equality", () => {
      const result = parseQueryParams({ "filters[name]": "john" });
      expect(result.filters).toEqual([
        {
          field: "name",
          operator: "eq",
          value: "john",
        },
      ]);
    });

    test("not equals operator", () => {
      const result = parseQueryParams({ "filters[age][ne]": "20" });
      expect(result.filters).toEqual([
        {
          field: "age",
          operator: "ne",
          value: 20,
        },
      ]);
    });

    test("neq operator with string", () => {
      const result = parseQueryParams({ "filters[status][neq]": "inactive" });
      expect(result.filters).toEqual([
        {
          field: "status",
          operator: "ne",
          value: "inactive",
        },
      ]);
    });

    test("contains operator", () => {
      const result = parseQueryParams({ "filters[title][contains]": "test" });
      expect(result.filters).toEqual([
        {
          field: "title",
          operator: "contains",
          value: "test",
        },
      ]);
    });

    test("case-sensitive starts with", () => {
      const result = parseQueryParams({
        "filters[code][startswiths]": "ABC123",
      });
      expect(result.filters).toEqual([
        {
          field: "code",
          operator: "startswiths",
          value: "ABC123",
        },
      ]);
    });

    test("null operator", () => {
      const result = parseQueryParams({ "filters[deleted_at][null]": "" });
      expect(result.filters).toEqual([
        {
          field: "deleted_at",
          operator: "null",
          value: null,
        },
      ]);
    });

    test("not null operator", () => {
      const result = parseQueryParams({ "filters[updated_at][nnull]": "" });
      expect(result.filters).toEqual([
        {
          field: "updated_at",
          operator: "nnull",
          value: null,
        },
      ]);
    });

    test("unsupported operator throws error", () => {
      expect(() =>
        parseQueryParams({ "filters[status][invalid]": "value" }),
      ).toThrow("Unsupported operator parameter: invalid");
    });

    test("case-sensitive operator name throws error", () => {
      expect(() => parseQueryParams({ "filters[name][EQ]": "john" })).toThrow(
        'operator "EQ" for field "name" must be lowercase',
      );
    });

    test("invalid operator syntax throws error", () => {
      expect(() =>
        parseQueryParams({ "filters[rating][approx]": "4.5" }),
      ).toThrow("Unsupported operator parameter: approx");
    });

    test("invalid array index", () => {
      expect(() =>
        parseQueryParams({ "filters[or][invalid][age][eq]": "30" }),
      ).toThrow();
    });

    test("invalid between array size", () => {
      expect(() =>
        parseQueryParams({ "filters[range][between]": "10" }),
      ).toThrow();
    });

    test("empty filter key", () => {
      expect(() => parseQueryParams({ "filters[][eq]": "value" })).toThrow(
        "invalid filter key",
      );
    });

    test("empty filter key segments", () => {
      expect(() => parseQueryParams({ "filters[][eq]": "value" })).toThrow(
        "invalid filter key",
      );
    });

    test("multiple values for equality operator", () => {
      expect(() =>
        parseQueryParams({ "filters[age][eq]": ["30", "31"] }),
      ).toThrow();
    });

    test("reject object-based query with multiple operators", () => {
      expect(() =>
        parseQueryParams({
          "filters[age][eq]": "25",
          "filters[age][gt]": "20",
        }),
      ).toThrow();
    });

    test("reject nested object structure", () => {
      expect(() =>
        parseQueryParams({
          "filters[user][name][eq]": "john",
          "filters[user][age][gt]": "30",
        }),
      ).toThrow();
    });

    test("empty array for in operator", () => {
      expect(() => parseQueryParams({ "filters[id][in]": [] })).toThrow();
    });

    test("empty array value for in operator", () => {
      expect(() => parseQueryParams({ "filters[id][in]": [] })).toThrow();
    });

    test("duplicate filters rejection", () => {
      expect(() =>
        parseQueryParams({ "filters[status][eq]": ["active", "inactive"] }),
      ).toThrow();
    });

    test("invalid boolean casing", () => {
      expect(() => parseQueryParams({ "filters[flag][eq]": "True" })).toThrow();
    });
  });

  describe("filters - value type parsing", () => {
    test("numeric value types", () => {
      const result = parseQueryParams({
        "filters[age][eq]": "25",
        "filters[price][gte]": "19.99",
      });

      expect(result.filters).toEqual([
        {
          field: "age",
          operator: "eq",
          value: 25,
        },
        {
          field: "price",
          operator: "gte",
          value: 19.99,
        },
      ]);
    });

    test("zero value as number", () => {
      const result = parseQueryParams({ "filters[age][eq]": "0" });
      expect(result.filters).toEqual([
        {
          field: "age",
          operator: "eq",
          value: 0,
        },
      ]);
    });

    test("decimal value as number", () => {
      const result = parseQueryParams({ "filters[rating][eq]": "4.75" });
      expect(result.filters).toEqual([
        {
          field: "rating",
          operator: "eq",
          value: 4.75,
        },
      ]);
    });

    test("negative number values", () => {
      const result = parseQueryParams({ "filters[temperature][gte]": "-10.5" });
      expect(result.filters).toEqual([
        {
          field: "temperature",
          operator: "gte",
          value: -10.5,
        },
      ]);
    });

    test("very large numeric values", () => {
      const result = parseQueryParams({
        "filters[population][gte]": "1000000000",
        "filters[ratio][lte]": "3.141592653589793",
      });
      expect(result.filters).toEqual([
        { field: "population", operator: "gte", value: 1000000000 },
        { field: "ratio", operator: "lte", value: 3.141592653589793 },
      ]);
    });

    test("scientific notation numbers", () => {
      const result = parseQueryParams({ "filters[value][eq]": "1e3" });
      expect(result.filters).toEqual([
        {
          field: "value",
          operator: "eq",
          value: 1000,
        },
      ]);
    });

    test("exponential notation decimals", () => {
      const result = parseQueryParams({ "filters[measurement][eq]": "2.5e3" });
      expect(result.filters).toEqual([
        {
          field: "measurement",
          operator: "eq",
          value: 2500,
        },
      ]);
    });

    test("zero-prefixed numbers", () => {
      const result = parseQueryParams({ "filters[code][eq]": "00123" });
      expect(result.filters).toEqual([
        {
          field: "code",
          operator: "eq",
          value: 123,
        },
      ]);
    });

    test("invalid numeric value as string", () => {
      const result = parseQueryParams({ "filters[age][eq]": "twenty" });
      expect(result.filters).toEqual([
        {
          field: "age",
          operator: "eq",
          value: "twenty",
        },
      ]);
    });

    test("boolean value handling", () => {
      const result = parseQueryParams({
        "filters[active][eq]": "true",
        "filters[vip][ne]": "false",
      });

      expect(result.filters).toEqual([
        {
          field: "active",
          operator: "eq",
          value: true,
        },
        {
          field: "vip",
          operator: "ne",
          value: false,
        },
      ]);
    });

    test("boolean string '1' as number", () => {
      const result = parseQueryParams({ "filters[active][eq]": "1" });
      expect(result.filters).toEqual([
        {
          field: "active",
          operator: "eq",
          value: 1,
        },
      ]);
    });

    test("boolean string '0' as number", () => {
      const result = parseQueryParams({ "filters[vip][eq]": "0" });
      expect(result.filters).toEqual([
        {
          field: "vip",
          operator: "eq",
          value: 0,
        },
      ]);
    });
  });

  describe("filters - array operators", () => {
    test("string with commas for in operator", () => {
      const result = parseQueryParams({ "filters[id][in]": "1,2,3" });
      expect(result.filters).toEqual([
        {
          field: "id",
          operator: "in",
          value: [1, 2, 3],
        },
      ]);
    });

    test("single value in array operator", () => {
      const result = parseQueryParams({ "filters[category][in]": "shoes" });
      expect(result.filters).toEqual([
        {
          field: "category",
          operator: "in",
          value: ["shoes"],
        },
      ]);
    });

    test("mixed type array values", () => {
      const result = parseQueryParams({ "filters[id][in]": "1,abc" });
      expect(result.filters).toEqual([
        {
          field: "id",
          operator: "in",
          value: [1, "abc"],
        },
      ]);
    });

    test("multiple values for in operator (array format)", () => {
      const result = parseQueryParams({ "filters[id][in]": ["1", "2", "3"] });
      expect(result.filters).toEqual([
        {
          field: "id",
          operator: "in",
          value: [1, 2, 3],
        },
      ]);
    });

    test("in-array operator with mixed values", () => {
      const result = parseQueryParams({ "filters[tags][ina]": ["go", "123"] });
      expect(result.filters).toEqual([
        {
          field: "tags",
          operator: "ina",
          value: ["go", 123],
        },
      ]);
    });

    test("between operator with array values", () => {
      const result = parseQueryParams({
        "filters[price][between]": ["10", "20"],
      });
      expect(result.filters).toEqual([
        {
          field: "price",
          operator: "between",
          value: [10, 20],
        },
      ]);
    });

    test("negative numbers in in operator", () => {
      const result = parseQueryParams({ "filters[temps][in]": "-5,-10,0" });
      expect(result.filters).toEqual([
        {
          field: "temps",
          operator: "in",
          value: [-5, -10, 0],
        },
      ]);
    });

    test("ina operator with mixed values", () => {
      const result = parseQueryParams({ "filters[tags][ina]": "go,123" });
      expect(result.filters).toEqual([
        {
          field: "tags",
          operator: "ina",
          value: ["go", 123],
        },
      ]);
    });

    test("nina operator with mixed types", () => {
      const result = parseQueryParams({ "filters[tags][nina]": "123,abc" });
      expect(result.filters).toEqual([
        {
          field: "tags",
          operator: "nina",
          value: [123, "abc"],
        },
      ]);
    });

    test("between with zero and negative", () => {
      const result = parseQueryParams({ "filters[temp][between]": "-10,0" });
      expect(result.filters).toEqual([
        {
          field: "temp",
          operator: "between",
          value: [-10, 0],
        },
      ]);
    });

    test("zero value for between operator", () => {
      const result = parseQueryParams({ "filters[offset][between]": "0,10" });
      expect(result.filters).toEqual([
        {
          field: "offset",
          operator: "between",
          value: [0, 10],
        },
      ]);
    });
  });

  describe("filters - special characters and encoding", () => {
    test("special characters in field name", () => {
      const result = parseQueryParams({ "filters[user_name][eq]": "john_doe" });
      expect(result.filters).toEqual([
        {
          field: "user_name",
          operator: "eq",
          value: "john_doe",
        },
      ]);
    });

    test("hyphen in field name", () => {
      const result = parseQueryParams({ "filters[user-id][eq]": "42" });
      expect(result.filters).toEqual([
        {
          field: "user-id",
          operator: "eq",
          value: 42,
        },
      ]);
    });

    test("special characters in value", () => {
      const result = parseQueryParams({
        "filters[note][contains]": "hello,world",
      });
      expect(result.filters).toEqual([
        {
          field: "note",
          operator: "contains",
          value: "hello,world",
        },
      ]);
    });

    test("url encoded values", () => {
      const result = parseQueryParams({
        "filters[message][contains]": "hello%20world",
      });

      expect(result.filters).toEqual([
        {
          field: "message",
          operator: "contains",
          value: "hello world",
        },
      ]);
    });

    test("case sensitive field names", () => {
      const result = parseQueryParams({ "filters[UserName][eq]": "john" });
      expect(result.filters).toEqual([
        {
          field: "UserName",
          operator: "eq",
          value: "john",
        },
      ]);
    });
  });

  describe("filters - nested conditional filters", () => {
    test("nested conditional filters", () => {
      const result = parseQueryParams({
        "filters[or][0][and][0][name][eq]": "john",
        "filters[or][0][and][1][age][gte]": "30",
      });

      expect(result.filters).toEqual([
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
      ]);
    });

    test("complex nested filters", () => {
      const result = parseQueryParams({
        "filters[or][0][and][0][status][eq]": "active",
        "filters[or][0][and][1][age][gte]": "18",
        "filters[or][1][not][0][name][contains]": "test",
      });

      expect(result.filters).toEqual([
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
                  field: "age",
                  operator: "gte",
                  value: 18,
                },
              ],
            },
            {
              operator: "not",
              value: [
                {
                  field: "name",
                  operator: "contains",
                  value: "test",
                },
              ],
            },
          ],
        },
      ]);
    });

    test("deeply nested conditional filters", () => {
      const result = parseQueryParams({
        "filters[and][0][or][0][category][eq]": "books",
        "filters[and][0][or][1][category][eq]": "movies",
        "filters[and][1][price][between][0]": "10",
        "filters[and][1][price][between][1]": "50",
        "filters[and][2][or][0][and][0][type][eq]": "digital",
        "filters[and][2][or][0][and][1][stock][gte]": "5",
        "filters[and][2][or][1][and][0][type][eq]": "physical",
        "filters[and][2][or][1][and][1][stock][gte]": "10",
      });

      expect(result.filters).toEqual([
        {
          operator: "and",
          value: [
            {
              operator: "or",
              value: [
                {
                  field: "category",
                  operator: "eq",
                  value: "books",
                },
                {
                  field: "category",
                  operator: "eq",
                  value: "movies",
                },
              ],
            },
            {
              field: "price",
              operator: "between",
              value: [10, 50],
            },
            {
              operator: "or",
              value: [
                {
                  operator: "and",
                  value: [
                    {
                      field: "type",
                      operator: "eq",
                      value: "digital",
                    },
                    {
                      field: "stock",
                      operator: "gte",
                      value: 5,
                    },
                  ],
                },
                {
                  operator: "and",
                  value: [
                    {
                      field: "type",
                      operator: "eq",
                      value: "physical",
                    },
                    {
                      field: "stock",
                      operator: "gte",
                      value: 10,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ]);
    });

    test("mixed conditional operators", () => {
      const result = parseQueryParams({
        "filters[or][0][and][0][status][eq]": "active",
        "filters[or][0][and][1][price][lt]": "100",
        "filters[or][1][name][contains]": "special",
      });

      expect(result.filters).toEqual([
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
      ]);
    });
  });

  describe("filters - empty values", () => {
    test("empty string value for eq operator", () => {
      const result = parseQueryParams({ "filters[name][eq]": "" });
      expect(result.filters).toEqual([
        {
          field: "name",
          operator: "eq",
          value: "",
        },
      ]);
    });

    test("empty value for contains operator", () => {
      const result = parseQueryParams({ "filters[search][contains]": "" });
      expect(result.filters).toEqual([
        {
          field: "search",
          operator: "contains",
          value: "",
        },
      ]);
    });

    test("empty string value", () => {
      const result = parseQueryParams({ "filters[comment][eq]": "" });
      expect(result.filters).toEqual([
        {
          field: "comment",
          operator: "eq",
          value: "",
        },
      ]);
    });
  });

  describe("filters - global search", () => {
    test("global search", () => {
      const result = parseQueryParams({ "filters[q]": "searchterm" });
      expect(result.filters).toEqual([
        {
          field: "q",
          operator: "eq",
          value: "searchterm",
        },
      ]);
    });
  });

  describe("filters - multiple top-level filters", () => {
    test("multiple filters at top level", () => {
      const result = parseQueryParams({
        "filters[name][contains]": "test",
        "filters[status][eq]": "active",
      });
      expect(result.filters).toEqual([
        { field: "name", operator: "contains", value: "test" },
        { field: "status", operator: "eq", value: "active" },
      ]);
    });

    test("mixed top-level operators", () => {
      const result = parseQueryParams({
        "filters[name][contains]": "test",
        "filters[age][gte]": "25",
        "filters[active][eq]": "true",
      });
      expect(result.filters).toEqual([
        { field: "name", operator: "contains", value: "test" },
        { field: "age", operator: "gte", value: 25 },
        { field: "active", operator: "eq", value: true },
      ]);
    });
  });

  describe("filters - edge cases", () => {
    test("invalid uuid format as string", () => {
      const result = parseQueryParams({ "filters[id][eq]": "not-a-uuid" });
      expect(result.filters).toEqual([
        {
          field: "id",
          operator: "eq",
          value: "not-a-uuid",
        },
      ]);
    });

    test("non-numeric between values as strings", () => {
      const result = parseQueryParams({
        "filters[price][between]": "ten,twenty",
      });
      expect(result.filters).toEqual([
        {
          field: "price",
          operator: "between",
          value: ["ten", "twenty"],
        },
      ]);
    });

    test("between operator with numeric values", () => {
      const result = parseQueryParams({ "filters[price][between]": "10,20" });
      expect(result.filters).toEqual([
        {
          field: "price",
          operator: "between",
          value: [10, 20],
        },
      ]);
    });

    test("invalid boolean value as string", () => {
      const result = parseQueryParams({ "filters[active][eq]": "notaboolean" });
      expect(result.filters).toEqual([
        {
          field: "active",
          operator: "eq",
          value: "notaboolean",
        },
      ]);
    });

    test("invalid numeric value as string", () => {
      const result = parseQueryParams({ "filters[age][eq]": "twenty" });
      expect(result.filters).toEqual([
        {
          field: "age",
          operator: "eq",
          value: "twenty",
        },
      ]);
    });

    test("zero value handling", () => {
      const result = parseQueryParams({ "filters[age][eq]": "0" });
      expect(result.filters).toEqual([
        {
          field: "age",
          operator: "eq",
          value: 0,
        },
      ]);
    });

    test("mixed string/number representations", () => {
      const result = parseQueryParams({
        "filters[code][eq]": "123",
        "filters[alt_code][eq]": "456",
      });
      expect(result.filters).toEqual([
        { field: "code", operator: "eq", value: 123 },
        { field: "alt_code", operator: "eq", value: 456 },
      ]);
    });

    test("multiple values for between operator", () => {
      const result = parseQueryParams({ "filters[price][between]": "10,20" });
      expect(result.filters).toEqual([
        {
          field: "price",
          operator: "between",
          value: [10, 20],
        },
      ]);
    });

    test("multiple values for in operator", () => {
      const result = parseQueryParams({ "filters[id][in]": "1,2,3" });
      expect(result.filters).toEqual([
        {
          field: "id",
          operator: "in",
          value: [1, 2, 3],
        },
      ]);
    });

    test("mixed types in in array", () => {
      const result = parseQueryParams({ "filters[codes][in]": "123,abc,45.6" });
      expect(result.filters).toEqual([
        {
          field: "codes",
          operator: "in",
          value: [123, "abc", 45.6],
        },
      ]);
    });

    test("multiple nested conditionals with array indices", () => {
      const result = parseQueryParams({
        "filters[and][0][or][0][author][eq]": "john",
        "filters[and][0][or][1][author][eq]": "jane",
        "filters[and][1][or][0][year][gte]": "2020",
        "filters[and][1][or][1][year][lte]": "1990",
        "filters[and][2][and][0][available][eq]": "true",
        "filters[and][2][and][1][rating][gte]": "4.5",
      });

      expect(result.filters).toEqual([
        {
          operator: "and",
          value: [
            {
              operator: "or",
              value: [
                { field: "author", operator: "eq", value: "john" },
                { field: "author", operator: "eq", value: "jane" },
              ],
            },
            {
              operator: "or",
              value: [
                { field: "year", operator: "gte", value: 2020 },
                { field: "year", operator: "lte", value: 1990 },
              ],
            },
            {
              operator: "and",
              value: [
                { field: "available", operator: "eq", value: true },
                { field: "rating", operator: "gte", value: 4.5 },
              ],
            },
          ],
        },
      ]);
    });

    test("nnull operator with value", () => {
      const result = parseQueryParams({ "filters[updated_at][nnull]": "123" });
      expect(result.filters).toEqual([
        {
          field: "updated_at",
          operator: "nnull",
          value: "123",
        },
      ]);
    });

    test("mixed boolean representations", () => {
      const result = parseQueryParams({
        "filters[active][eq]": "1",
        "filters[vip][eq]": "0",
      });
      expect(result.filters).toEqual([
        { field: "active", operator: "eq", value: 1 },
        { field: "vip", operator: "eq", value: 0 },
      ]);
    });
  });

  describe("sorters", () => {
    test("single sort ascending", () => {
      const result = parseQueryParams({ _sort: "name", _order: "asc" });
      expect(result.sorters).toEqual([
        {
          field: "name",
          order: "asc",
        },
      ]);
    });

    test("single sort descending", () => {
      const result = parseQueryParams({ _sort: "age", _order: "desc" });
      expect(result.sorters).toEqual([
        {
          field: "age",
          order: "desc",
        },
      ]);
    });

    test("multiple sorts", () => {
      const result = parseQueryParams({
        _sort: "name,age,created_at",
        _order: "asc,desc,asc",
      });

      expect(result.sorters).toEqual([
        { field: "name", order: "asc" },
        { field: "age", order: "desc" },
        { field: "created_at", order: "asc" },
      ]);
    });

    test("empty sorts", () => {
      const result = parseQueryParams({});
      expect(result.sorters).toBeUndefined();
    });

    test("default order to asc", () => {
      const result = parseQueryParams({ _sort: "name" });
      expect(result.sorters).toEqual([
        {
          field: "name",
          order: "asc",
        },
      ]);
    });

    test("url encoded field names", () => {
      const result = parseQueryParams({
        _sort: "user%20name",
        _order: "asc",
      });

      expect(result.sorters).toEqual([
        {
          field: "user name",
          order: "asc",
        },
      ]);
    });
  });

  describe("pagination", () => {
    test("default pagination", () => {
      const result = parseQueryParams({ _start: "0", _end: "10" });
      expect(result.pagination).toEqual({
        start: 0,
        end: 10,
      });
    });

    test("custom pagination", () => {
      const result = parseQueryParams({ _start: "20", _end: "50" });
      expect(result.pagination).toEqual({
        start: 20,
        end: 50,
      });
    });

    test("zero start", () => {
      const result = parseQueryParams({ _start: "0", _end: "100" });
      expect(result.pagination).toEqual({
        start: 0,
        end: 100,
      });
    });

    test("only start provided", () => {
      const result = parseQueryParams({ _start: "10" });
      expect(result.pagination).toEqual({
        start: 10,
        end: 10,
      });
    });

    test("only end provided", () => {
      const result = parseQueryParams({ _end: "20" });
      expect(result.pagination).toEqual({
        start: 0,
        end: 20,
      });
    });

    test("no pagination", () => {
      const result = parseQueryParams({});
      expect(result.pagination).toBeUndefined();
    });
  });

  describe("combined", () => {
    test("filters, sorters, and pagination", () => {
      const result = parseQueryParams({
        "filters[status]": "active",
        "_sort": "name",
        "_order": "asc",
        "_start": "0",
        "_end": "10",
      });

      expect(result.filters).toEqual([
        {
          field: "status",
          operator: "eq",
          value: "active",
        },
      ]);

      expect(result.sorters).toEqual([
        {
          field: "name",
          order: "asc",
        },
      ]);

      expect(result.pagination).toEqual({
        start: 0,
        end: 10,
      });
    });
  });
});
