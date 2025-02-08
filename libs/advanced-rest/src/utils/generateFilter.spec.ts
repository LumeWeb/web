import type { CrudFilters } from "@refinedev/core";

import { generateFilter } from "./generateFilter";
import { describe, expect, test } from "vitest";

describe("generateFilter", () => {
  test("basic equality", () => {
    const filters: CrudFilters = [
      {
        field: "name",
        operator: "eq",
        value: "john",
      },
    ];

    const result = generateFilter(filters);
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

    const result = generateFilter(filters);
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

    const result = generateFilter(filters);
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
    ];

    const result = generateFilter(filters);
    expect(result).toEqual({
      "filters[or][0][name]": "john",
      "filters[or][1][age][gte]": "30",
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

    const result = generateFilter(filters);
    expect(result).toEqual({
      q: "searchterm",
    });
  });

  test("numeric value types", () => {
    const filters: CrudFilters = [
      { field: "age", operator: "eq", value: 25 },
      { field: "price", operator: "gte", value: 19.99 },
    ];

    const result = generateFilter(filters);
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

    const result = generateFilter(filters);
    expect(result).toEqual({
      "filters[price][between]": "10%2C20",
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

    const result = generateFilter(filters);
    expect(result).toEqual({
      "filters[id][in]": "1%2C2%2C3",
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

    const result = generateFilter(filters);
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

    const result = generateFilter(filters);
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

    expect(() => generateFilter(filters)).toThrow(
      "Unsupported operator: approx",
    );
  });

  test("mixed type array values", () => {
    const filters: CrudFilters = [
      {
        field: "tags",
        operator: "in",
        value: [123, "abc"],
      },
    ];

    const result = generateFilter(filters);
    expect(result).toEqual({
      "filters[tags][in]": "123%2Cabc",
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

    const result = generateFilter(filters);
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

    const result = generateFilter(filters);
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

    const result = generateFilter(filters);
    expect(result).toEqual({
      "filters[or][0][and][0][status]": "active",
      "filters[or][0][and][1][price][lt]": "100",
      "filters[or][1][name][contains]": "special",
    });
  });
});
