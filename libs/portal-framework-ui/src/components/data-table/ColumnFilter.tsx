import type { LogicalFilter } from "@refinedev/core";

import {
  Button,
  cn,
  DatePicker,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lumeweb/portal-framework-ui-core";
import { Filter } from "lucide-react";
import React, { useEffect, useState } from "react";

import type { FilterOption, LogicalOperator, OperatorOption } from "./types";

export interface ColumnFilterProps {
  columnId: string;
  columnLabel: string;
  columnOptions?: FilterOption[];
  columnType: "boolean" | "date" | "number" | "select" | "string" | string;
  existingFilter?: LogicalFilter;
  hasActiveFilter: boolean;
  onApplyFilter: (filter: LogicalFilter | null) => void;
}

export function ColumnFilter({
  columnId,
  columnLabel,
  columnOptions = [],
  columnType,
  existingFilter,
  hasActiveFilter,
  onApplyFilter,
}: ColumnFilterProps) {
  // Update the filterState type
  const [filterState, setFilterState] = useState<{
    operator: LogicalOperator;
    value: any;
  }>({
    operator: existingFilter?.operator || getDefaultOperator(columnType),
    value: existingFilter?.value || "",
  });

  // Update state when existing filter changes
  useEffect(() => {
    if (existingFilter) {
      setFilterState({
        operator: existingFilter.operator,
        value: existingFilter.value,
      });
    } else {
      setFilterState({
        operator: getDefaultOperator(columnType),
        value: "",
      });
    }
  }, [existingFilter, columnType]);

  // Update filter value
  const updateFilterValue = (value: any) => {
    setFilterState((prev) => ({
      ...prev,
      value,
    }));
  };

  // Update the updateFilterOperator function
  const updateFilterOperator = (operator: string) => {
    setFilterState((prev) => ({
      ...prev,
      operator: operator as LogicalOperator,
    }));
  };

  // Apply the filter
  const applyFilter = () => {
    const { operator, value } = filterState;

    if (!value && value !== 0) {
      // If value is empty, remove the filter
      onApplyFilter(null);
    } else {
      // Create new filter
      onApplyFilter({
        field: columnId,
        operator,
        value,
      });
    }
  };

  // Clear the filter
  const clearFilter = () => {
    // Update state
    setFilterState((prev) => ({
      ...prev,
      value: "",
    }));

    // Remove filter
    onApplyFilter(null);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "h-8 w-8 p-0 ml-1 hover:bg-muted",
            hasActiveFilter ? "text-primary bg-primary/10" : "",
          )}
          size="sm"
          variant="ghost">
          <Filter className="h-4 w-4" />
          {hasActiveFilter && <span className="sr-only">Filter applied</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <div className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Filter {columnLabel}</h4>

            {getOperatorsForType(columnType).length > 1 && (
              <Select
                onValueChange={updateFilterOperator}
                value={filterState.operator}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  {getOperatorsForType(columnType).map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <div className="pt-2">
              {columnType === "select" ? (
                <Select
                  onValueChange={updateFilterValue}
                  value={
                    filterState.value !== undefined
                      ? String(filterState.value)
                      : ""
                  }>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {columnOptions.map((option) => (
                      <SelectItem
                        key={String(option.value)}
                        value={String(option.value)}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : columnType === "number" ? (
                <Input
                  className="w-full"
                  onChange={(e) =>
                    updateFilterValue(e.target.valueAsNumber || "")
                  }
                  placeholder="Enter value..."
                  type="number"
                  value={filterState.value}
                />
              ) : columnType === "date" ? (
                <DatePicker
                  className="w-full"
                  date={
                    filterState.value instanceof Date
                      ? filterState.value
                      : undefined
                  }
                  setDate={updateFilterValue}
                />
              ) : (
                <Input
                  className="w-full"
                  onChange={(e) => updateFilterValue(e.target.value)}
                  placeholder="Enter value..."
                  type="text"
                  value={filterState.value || ""}
                />
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <Button onClick={clearFilter} size="sm" variant="outline">
              Clear
            </Button>
            <Button onClick={applyFilter} size="sm">
              Apply Filter
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Update the getDefaultOperator function
function getDefaultOperator(type: string): LogicalOperator {
  switch (type) {
    case "date":
      return "eq";
    case "number":
      return "eq";
    case "select":
      return "eq";
    case "string":
    default:
      return "contains";
  }
}

// Update the getOperatorsForType function
function getOperatorsForType(type: string): OperatorOption[] {
  switch (type) {
    case "date":
      return [
        { label: "Equals", value: "eq" },
        { label: "Not equals", value: "ne" },
        { label: "After", value: "gt" },
        { label: "After or on", value: "gte" },
        { label: "Before", value: "lt" },
        { label: "Before or on", value: "lte" },
      ];
    case "number":
      return [
        { label: "Equals", value: "eq" },
        { label: "Not equals", value: "ne" },
        { label: "Greater than", value: "gt" },
        { label: "Greater than or equals", value: "gte" },
        { label: "Less than", value: "lt" },
        { label: "Less than or equals", value: "lte" },
      ];
    case "select":
      return [
        { label: "Equals", value: "eq" },
        { label: "Not equals", value: "ne" },
      ];
    case "string":
    default:
      return [
        { label: "Contains", value: "contains" },
        { label: "Equals", value: "eq" },
        { label: "Not equals", value: "ne" },
        { label: "Starts with", value: "startswith" },
        { label: "Ends with", value: "endswith" },
      ];
  }
}
