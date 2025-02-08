import type { Sort } from "libs/advanced-rest/src/utils/filterTypes";

import { generateSort } from "libs/advanced-rest/src/utils/generateSort";
import { describe, expect, test } from "vitest";

describe("generateSort", () => {
  test("empty sorters", () => {
    const result = generateSort();
    expect(result).toEqual({});
  });

  test("single sorter", () => {
    const sorters: Sort[] = [
      {
        field: "name",
        order: "asc",
      },
    ];

    const result = generateSort(sorters);
    expect(result).toEqual({
      _order: "asc",
      _sort: "name",
    });
  });

  test("multiple sorters", () => {
    const sorters: Sort[] = [
      { field: "name", order: "asc" },
      { field: "age", order: "desc" },
    ];

    const result = generateSort(sorters);
    expect(result).toEqual({
      _order: "asc,desc",
      _sort: "name,age",
    });
  });

  test("special characters in field names", () => {
    const sorters: Sort[] = [
      {
        field: "user.name",
        order: "asc",
      },
    ];

    const result = generateSort(sorters);
    expect(result).toEqual({
      _order: "asc",
      _sort: "user.name",
    });
  });
});
