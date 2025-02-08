import { act, cleanup, render, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FilterProvider, useFilterState } from "./FilterContext";
import type { LogicalFilter } from "@refinedev/core";

describe("FilterContext", () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  describe("useFilterState", () => {
    it("should throw an error if used outside FilterProvider", () => {
      // Suppress console.error for this specific test
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => renderHook(() => useFilterState())).toThrow(
        "useFilterState must be used within a FilterProvider",
      );

      consoleErrorSpy.mockRestore();
    });

    it("should return context state and dispatch function when used within FilterProvider", () => {
      const { result } = renderHook(() => useFilterState(), {
        wrapper: FilterProvider,
      });

      expect(result.current).toHaveProperty("state");
      expect(result.current).toHaveProperty("dispatch");
      expect(result.current).toHaveProperty("formatFilterValue");
      expect(result.current.state).toEqual({
        columnFilters: [],
        filterChips: [],
        logicalFilters: [],
      });
      expect(typeof result.current.dispatch).toBe("function");
      expect(typeof result.current.formatFilterValue).toBe("function");
    });
  });

  describe("FilterProvider and Reducer", () => {
    it("should initialize with empty state", () => {
      render(
        <FilterProvider>
          <div>Test</div>
        </FilterProvider>,
      );
      const { result } = renderHook(() => useFilterState(), {
        wrapper: FilterProvider,
      });

      expect(result.current.state).toEqual({
        columnFilters: [],
        filterChips: [],
        logicalFilters: [],
      });
    });

    it("should handle ADD_FILTER action", () => {
      const { result } = renderHook(() => useFilterState(), {
        wrapper: FilterProvider,
      });

      const filter1: LogicalFilter = {
        field: "name",
        operator: "contains",
        value: "test",
      };
      const filter2: LogicalFilter = {
        field: "age",
        operator: "gt",
        value: 18,
      };

      act(() => {
        result.current.dispatch({ type: "ADD_FILTER", filter: filter1 });
      });

      expect(result.current.state.logicalFilters).toEqual([filter1]);
      expect(result.current.state.columnFilters).toEqual([
        { id: "name", value: { operator: "contains", value: "test" } },
      ]);
      // filterChips are not updated by the reducer, they are derived elsewhere

      act(() => {
        result.current.dispatch({ type: "ADD_FILTER", filter: filter2 });
      });

      expect(result.current.state.logicalFilters).toEqual([filter1, filter2]);
      expect(result.current.state.columnFilters).toEqual([
        { id: "name", value: { operator: "contains", value: "test" } },
        { id: "age", value: { operator: "gt", value: 18 } },
      ]);
    });

    it("should handle REMOVE_FILTER action", () => {
      const { result } = renderHook(() => useFilterState(), {
        wrapper: FilterProvider,
      });

      const filter1: LogicalFilter = {
        field: "name",
        operator: "contains",
        value: "test",
      };
      const filter2: LogicalFilter = {
        field: "age",
        operator: "gt",
        value: 18,
      };

      // Add filters first
      act(() => {
        result.current.dispatch({ type: "ADD_FILTER", filter: filter1 });
        result.current.dispatch({ type: "ADD_FILTER", filter: filter2 });
      });

      expect(result.current.state.logicalFilters).toEqual([filter1, filter2]);
      expect(result.current.state.columnFilters).toEqual([
        { id: "name", value: { operator: "contains", value: "test" } },
        { id: "age", value: { operator: "gt", value: 18 } },
      ]);

      // Remove filter1
      act(() => {
        result.current.dispatch({ type: "REMOVE_FILTER", field: "name" });
      });

      expect(result.current.state.logicalFilters).toEqual([filter2]);
      expect(result.current.state.columnFilters).toEqual([
        { id: "age", value: { operator: "gt", value: 18 } },
      ]);

      // Remove filter2
      act(() => {
        result.current.dispatch({ type: "REMOVE_FILTER", field: "age" });
      });

      expect(result.current.state.logicalFilters).toEqual([]);
      expect(result.current.state.columnFilters).toEqual([]);
    });

    it("should handle CLEAR_FILTERS action", () => {
      const { result } = renderHook(() => useFilterState(), {
        wrapper: FilterProvider,
      });

      const filter1: LogicalFilter = {
        field: "name",
        operator: "contains",
        value: "test",
      };
      const filter2: LogicalFilter = {
        field: "age",
        operator: "gt",
        value: 18,
      };

      // Add filters first
      act(() => {
        result.current.dispatch({ type: "ADD_FILTER", filter: filter1 });
        result.current.dispatch({ type: "ADD_FILTER", filter: filter2 });
      });

      expect(result.current.state.logicalFilters.length).toBe(2);
      expect(result.current.state.columnFilters.length).toBe(2);

      // Clear filters
      act(() => {
        result.current.dispatch({ type: "CLEAR_FILTERS" });
      });

      expect(result.current.state).toEqual({
        columnFilters: [],
        filterChips: [],
        logicalFilters: [],
      });
    });

    it("should return current state for unknown action types", () => {
      const { result } = renderHook(() => useFilterState(), {
        wrapper: FilterProvider,
      });

      const filter1: LogicalFilter = {
        field: "name",
        operator: "contains",
        value: "test",
      };

      act(() => {
        result.current.dispatch({ type: "ADD_FILTER", filter: filter1 });
      });

      const currentState = result.current.state;

      act(() => {
        // @ts-expect-error Testing unknown action type
        result.current.dispatch({ type: "UNKNOWN_ACTION" });
      });

      expect(result.current.state).toBe(currentState); // State should not change
    });
  });

  describe("formatFilterValue", () => {
    it("should format date values", () => {
      const { result } = renderHook(() => useFilterState(), {
        wrapper: FilterProvider,
      });
      const dateFilter: LogicalFilter = {
        field: "date",
        operator: "eq",
        value: "2023-10-27T10:00:00.000Z",
      };

      // Mock Date.toLocaleDateString to ensure consistent output regardless of locale/timezone
      const toLocaleDateStringSpy = vi
        .spyOn(Date.prototype, "toLocaleDateString")
        .mockReturnValue("10/27/2023");

      const formattedValue = result.current.formatFilterValue(
        dateFilter,
        "date",
      );
      expect(formattedValue).toBe("10/27/2023");
      expect(toLocaleDateStringSpy).toHaveBeenCalled();

      toLocaleDateStringSpy.mockRestore();
    });

    it("should format boolean values", () => {
      const { result } = renderHook(() => useFilterState(), {
        wrapper: FilterProvider,
      });
      const trueFilter: LogicalFilter = {
        field: "active",
        operator: "eq",
        value: true,
      };
      const falseFilter: LogicalFilter = {
        field: "active",
        operator: "eq",
        value: false,
      };

      expect(result.current.formatFilterValue(trueFilter, "boolean")).toBe(
        "Yes",
      );
      expect(result.current.formatFilterValue(falseFilter, "boolean")).toBe(
        "No",
      );
    });

    it("should format other values as strings", () => {
      const { result } = renderHook(() => useFilterState(), {
        wrapper: FilterProvider,
      });
      const stringFilter: LogicalFilter = {
        field: "text",
        operator: "eq",
        value: "some text",
      };
      const numberFilter: LogicalFilter = {
        field: "count",
        operator: "eq",
        value: 123,
      };
      const nullFilter: LogicalFilter = {
        field: "nullable",
        operator: "eq",
        value: null,
      };
      const undefinedFilter: LogicalFilter = {
        field: "undef",
        operator: "eq",
        value: undefined,
      };
      const objectFilter: LogicalFilter = {
        field: "obj",
        operator: "eq",
        value: { a: 1 },
      };

      expect(result.current.formatFilterValue(stringFilter, "string")).toBe(
        "some text",
      );
      expect(result.current.formatFilterValue(numberFilter, "number")).toBe(
        "123",
      );
      expect(result.current.formatFilterValue(nullFilter, "string")).toBe(
        "null",
      );
      expect(result.current.formatFilterValue(undefinedFilter, "string")).toBe(
        "undefined",
      );
      // Note: Objects will be formatted as "[object Object]" by String()
      expect(result.current.formatFilterValue(objectFilter, "string")).toBe(
        "[object Object]",
      );
    });

    it("should handle filter with null/undefined value for date/boolean types gracefully", () => {
      const { result } = renderHook(() => useFilterState(), {
        wrapper: FilterProvider,
      });
      const nullDateFilter: LogicalFilter = {
        field: "date",
        operator: "eq",
        value: null,
      };
      const undefinedDateFilter: LogicalFilter = {
        field: "date",
        operator: "eq",
        value: undefined,
      };
      const nullBooleanFilter: LogicalFilter = {
        field: "active",
        operator: "eq",
        value: null,
      };
      const undefinedBooleanFilter: LogicalFilter = {
        field: "active",
        operator: "eq",
        value: undefined,
      };

      expect(result.current.formatFilterValue(nullDateFilter, "date")).toBe(
        "null",
      );
      expect(
        result.current.formatFilterValue(undefinedDateFilter, "date"),
      ).toBe("undefined");
      expect(
        result.current.formatFilterValue(nullBooleanFilter, "boolean"),
      ).toBe("null");
      expect(
        result.current.formatFilterValue(undefinedBooleanFilter, "boolean"),
      ).toBe("undefined");
    });
  });
});
