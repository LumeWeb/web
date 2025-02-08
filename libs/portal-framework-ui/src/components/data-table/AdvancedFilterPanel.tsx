import type { CrudFilters, LogicalFilter } from "@refinedev/core";

import { Button } from "@lumeweb/portal-framework-ui-core";
import { Input } from "@lumeweb/portal-framework-ui-core";
import { DatePicker } from "@lumeweb/portal-framework-ui-core";
import { Card, CardContent } from "@lumeweb/portal-framework-ui-core";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lumeweb/portal-framework-ui-core";
import { Checkbox } from "@lumeweb/portal-framework-ui-core";
import { Label } from "@lumeweb/portal-framework-ui-core";
import { cn } from "@lumeweb/portal-framework-ui-core";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@lumeweb/portal-framework-ui-core";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Filter,
  Hash,
  Info,
  RefreshCw,
  Search,
  Tag,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { z } from "zod";

// Import types from filter-types.ts
import type {
  FieldType,
  FilterField,
  FilterOption,
  FilterValue,
  LogicalOperator,
  OperatorOption,
} from "./types";

import { convertZodSchemaToFilters } from "./types/zod-filter";

export interface AdvancedFilterPanelProps {
  className?: string;
  // Either provide fields explicitly or provide a sample data object for auto-detection
  fields?: FilterField[];
  // Optional callback to get field metadata (like labels) from field names
  getFieldMetadata?: (fieldName: string) => {
    isSearchable?: boolean;
    label?: string;
    operators?: LogicalOperator[];
    options?: FilterOption[];
    type?: FieldType;
  };
  initialFilters?: CrudFilters;
  isLoading?: boolean;
  onApplyFilters: (filters: CrudFilters) => void;
  onClearFilters: () => void;
  /**
   * Configuration options (choose one):
   * - fields: Explicit field definitions
   * - sampleRecord: Single record + getFieldMetadata
   * - schema: Zod schema for type inference
   */
  sampleRecord?: Record<string, any>[];
  schema?:
    | Record<string, { options?: FilterOption[]; type: FieldType }>
    | z.ZodObject<any>;
}

// Helper function to infer field type from value
const inferFieldType = (value: any): FieldType => {
  if (value === null || value === undefined) return "unknown";

  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "number";
  if (typeof value === "string") {
    // Check if it's a date string
    const datePattern = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
    if (datePattern.test(value) && !isNaN(Date.parse(value))) {
      return "date";
    }
    return "string";
  }

  if (value instanceof Date) return "date";

  return "unknown";
};

// Helper function to detect if a field has a limited set of values (for select fields)
const detectSelectField = (
  data: Record<string, any>[],
  fieldName: string,
  maxOptions = 10,
): { isSelect: boolean; options: FilterOption[] } => {
  const uniqueValues = new Set<any>();

  for (const item of data) {
    if (item[fieldName] !== undefined && item[fieldName] !== null) {
      uniqueValues.add(item[fieldName]);
    }

    // If we have too many unique values, it's probably not a select field
    if (uniqueValues.size > maxOptions) {
      return { isSelect: false, options: [] };
    }
  }

  // Convert unique values to options
  const options = Array.from(uniqueValues).map((value) => ({
    label: String(value),
    value,
  }));

  return {
    isSelect: options.length > 1 && options.length <= maxOptions,
    options,
  };
};

// Helper function to get default operators for a field type
const getDefaultOperators = (type: FieldType): LogicalOperator[] => {
  switch (type) {
    case "boolean":
      return ["eq"];
    case "date":
      return ["eq", "ne", "gt", "lt", "gte", "lte"];
    case "number":
      return ["eq", "ne", "gt", "lt", "gte", "lte"];
    case "select":
      return ["eq", "ne"];
    case "string":
      return ["contains", "eq", "ne", "startswith", "endswith"];
    default:
      return ["eq", "ne"];
  }
};

// Helper function to get operator options based on field type
const getOperatorOptions = (type: FieldType): OperatorOption[] => {
  switch (type) {
    case "boolean":
      return [{ label: "Is", value: "eq" }];
    case "date":
      return [
        { label: "On", value: "eq" },
        { label: "Not On", value: "ne" },
        { label: "After", value: "gt" },
        { label: "Before", value: "lt" },
        { label: "On or After", value: "gte" },
        { label: "On or Before", value: "lte" },
      ];
    case "number":
      return [
        { label: "Equals", value: "eq" },
        { label: "Not Equals", value: "ne" },
        { label: "Greater Than", value: "gt" },
        { label: "Less Than", value: "lt" },
        { label: "Greater Than or Equal", value: "gte" },
        { label: "Less Than or Equal", value: "lte" },
      ];
    case "select":
      return [
        { label: "Is", value: "eq" },
        { label: "Is Not", value: "ne" },
      ];
    case "string":
      return [
        { label: "Contains", value: "contains" },
        { label: "Equals", value: "eq" },
        { label: "Not Equals", value: "ne" },
        { label: "Starts With", value: "startswith" },
        { label: "Ends With", value: "endswith" },
      ];
    default:
      return [
        { label: "Equals", value: "eq" },
        { label: "Not Equals", value: "ne" },
      ];
  }
};

// Helper function to check if a filter is a LogicalFilter
const isLogicalFilter = (filter: any): filter is LogicalFilter => {
  return (
    typeof filter === "object" &&
    filter !== null &&
    "field" in filter &&
    "operator" in filter &&
    "value" in filter
  );
};

export function AdvancedFilterPanel({
  className,
  fields,
  getFieldMetadata,
  initialFilters,
  isLoading = false,
  onApplyFilters,
  onClearFilters,
  sampleRecord,
  schema,
}: AdvancedFilterPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterValue[]>([]);
  const [searchFields, setSearchFields] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<{
    endDate: Date | undefined;
    field: string;
    startDate: Date | undefined;
  }>({ endDate: undefined, field: "", startDate: undefined });
  const [numericFilter, setNumericFilter] = useState<{
    field: string;
    operator: LogicalOperator;
    value: "" | number;
    value2: "" | number;
  }>({ field: "", operator: "eq", value: "", value2: "" });

  // Auto-detect fields if not provided explicitly
  const detectedFields = useMemo(() => {
    if (fields) return fields;

    const result: FilterField[] = [];

    // If Zod schema is provided, convert it to filter fields
    if (schema && typeof schema === "object" && "_def" in schema) {
      return convertZodSchemaToFilters(schema as z.ZodObject<any>);
    }

    // If JSON schema is provided, use it to define fields
    if (typeof schema === "object" && !("_def" in schema)) {
      Object.entries(schema).forEach(
        ([field, def]: [
          string,
          { options?: FilterOption[]; type: FieldType },
        ]) => {
          const metadata = getFieldMetadata ? getFieldMetadata(field) : {};

          result.push({
            field,
            isSearchable:
              metadata.isSearchable !== undefined
                ? metadata.isSearchable
                : def.type === "string",
            label:
              metadata.label ||
              field.charAt(0).toUpperCase() +
                field.slice(1).replace(/([A-Z])/g, " $1"),
            operators: metadata.operators || getDefaultOperators(def.type),
            options: def.options || metadata.options,
            type: def.type,
          });
        },
      );

      return result;
    }

    // If sample data is provided, use it to infer fields
    if (sampleRecord && sampleRecord.length > 0) {
      // Get all possible fields from all objects
      const allFields = new Set<string>();
      sampleRecord.forEach((item) => {
        Object.keys(item).forEach((key) => allFields.add(key));
      });

      // Process each field
      allFields.forEach((field) => {
        const metadata = getFieldMetadata ? getFieldMetadata(field) : {};

        // Find the first non-null value to determine type
        let fieldType: FieldType = "unknown";
        let foundValue = false;

        for (const item of sampleRecord) {
          if (item[field] !== undefined && item[field] !== null) {
            fieldType = metadata.type || inferFieldType(item[field]);
            foundValue = true;
            break;
          }
        }

        if (!foundValue) return; // Skip fields with no values

        // Check if this might be a select field
        const { isSelect, options } = detectSelectField(sampleRecord, field);
        if (isSelect && !metadata.type) {
          fieldType = "select";
        }

        result.push({
          field,
          isSearchable:
            metadata.isSearchable !== undefined
              ? metadata.isSearchable
              : fieldType === "string",
          label:
            metadata.label ||
            field.charAt(0).toUpperCase() +
              field.slice(1).replace(/([A-Z])/g, " $1"),
          operators: metadata.operators || getDefaultOperators(fieldType),
          options:
            metadata.options || (fieldType === "select" ? options : undefined),
          type: fieldType,
        });
      });

      return result;
    }

    return [];
  }, [fields, sampleRecord, schema, getFieldMetadata]);

  // Group fields by type for easier access
  const fieldsByType = useMemo(() => {
    const result = {
      boolean: detectedFields.filter((f) => f.type === "boolean"),
      date: detectedFields.filter((f) => f.type === "date"),
      number: detectedFields.filter((f) => f.type === "number"),
      searchable: detectedFields.filter((f) => f.isSearchable),
      select: detectedFields.filter((f) => f.type === "select"),
      string: detectedFields.filter((f) => f.type === "string"),
    };
    return result;
  }, [detectedFields]);

  // Initialize from initialFilters if provided
  useEffect(() => {
    if (initialFilters && initialFilters.length > 0) {
      const parsedFilters: FilterValue[] = [];
      const searchTerms: string[] = [];
      let foundSearchTerm = "";

      initialFilters.forEach((filter) => {
        // Check if it's a LogicalFilter
        if (isLogicalFilter(filter)) {
          if (
            filter.operator === "contains" &&
            typeof filter.value === "string"
          ) {
            // This is likely a search filter
            searchTerms.push(filter.field);
            foundSearchTerm = filter.value;
          } else if (
            (filter.operator === "gte" || filter.operator === "lte") &&
            detectedFields.find((f) => f.field === filter.field)?.type ===
              "date"
          ) {
            // This is likely a date filter
            if (filter.operator === "gte") {
              setDateRange((prev) => ({
                ...prev,
                field: filter.field,
                startDate: new Date(filter.value as string),
              }));
            } else {
              setDateRange((prev) => ({
                ...prev,
                endDate: new Date(filter.value as string),
                field: filter.field,
              }));
            }
          } else {
            // This is a regular filter
            parsedFilters.push({
              field: filter.field,
              operator: filter.operator as LogicalOperator,
              value: filter.value,
            });
          }
        }
      });

      if (searchTerms.length > 0) {
        setSearchFields(searchTerms);
        setSearchTerm(foundSearchTerm);
      }

      if (parsedFilters.length > 0) {
        setActiveFilters(parsedFilters);
      }

      // If we have any filters, expand the panel
      if (
        parsedFilters.length > 0 ||
        searchTerms.length > 0 ||
        dateRange.startDate ||
        dateRange.endDate
      ) {
        setIsExpanded(true);
      }
    }
  }, [initialFilters, detectedFields]);

  // Add a new filter
  const addFilter = () => {
    if (detectedFields.length > 0) {
      const firstField = detectedFields[0];
      const operators =
        firstField.operators || getDefaultOperators(firstField.type);

      setActiveFilters([
        ...activeFilters,
        {
          field: firstField.field,
          operator: operators[0],
          value: firstField.type === "boolean" ? false : "",
        },
      ]);
    }
  };

  // Remove a filter
  const removeFilter = (index: number) => {
    const newFilters = [...activeFilters];
    newFilters.splice(index, 1);
    setActiveFilters(newFilters);
  };

  // Update a filter field
  const updateFilterField = (index: number, field: string) => {
    const newFilters = [...activeFilters];
    const fieldDef = detectedFields.find((f) => f.field === field);

    if (fieldDef) {
      const operators =
        fieldDef.operators || getDefaultOperators(fieldDef.type);

      newFilters[index] = {
        ...newFilters[index],
        field,
        operator: operators[0],
        value:
          fieldDef.type === "boolean"
            ? false
            : fieldDef.type === "select" && fieldDef.options
              ? fieldDef.options[0].value
              : "",
      };

      setActiveFilters(newFilters);
    }
  };

  // Update a filter operator
  const updateFilterOperator = (index: number, operator: string) => {
    const newFilters = [...activeFilters];
    newFilters[index] = {
      ...newFilters[index],
      operator: operator as LogicalOperator,
      value: newFilters[index].value,
    };
    setActiveFilters(newFilters);
  };

  // Update a filter value
  const updateFilterValue = (index: number, value: any) => {
    const newFilters = [...activeFilters];
    newFilters[index] = {
      ...newFilters[index],
      value,
    };
    setActiveFilters(newFilters);
  };

  // Update a filter's second value (for "between" operator)
  const updateFilterValue2 = (index: number, value: any) => {
    const newFilters = [...activeFilters];
    newFilters[index] = {
      ...newFilters[index],
      value2: value,
    };
    setActiveFilters(newFilters);
  };

  // Toggle a search field
  const toggleSearchField = (field: string) => {
    setSearchFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
    );
  };

  // Apply all filters
  const applyFilters = () => {
    const filters: LogicalFilter[] = [];

    // Add active filters
    activeFilters.forEach((filter) => {
      if (filter.value !== "" && filter.value !== undefined) {
        if (
          filter.operator === "between" &&
          filter.value2 !== undefined &&
          filter.value2 !== ""
        ) {
          // For "between" operator, add two filters
          filters.push({
            field: filter.field,
            operator: "gte",
            value: filter.value,
          });
          filters.push({
            field: filter.field,
            operator: "lte",
            value: filter.value2,
          });
        } else {
          filters.push({
            field: filter.field,
            operator: filter.operator,
            value: filter.value,
          });
        }
      }
    });

    // Add search filters
    if (searchTerm && searchFields.length > 0) {
      searchFields.forEach((field) => {
        filters.push({
          field,
          operator: "contains",
          value: searchTerm,
        });
      });
    }

    // Add date range filter
    if (dateRange.field && (dateRange.startDate || dateRange.endDate)) {
      if (dateRange.startDate) {
        filters.push({
          field: dateRange.field,
          operator: "gte",
          value: dateRange.startDate.toISOString().split("T")[0],
        });
      }

      if (dateRange.endDate) {
        filters.push({
          field: dateRange.field,
          operator: "lte",
          value: dateRange.endDate.toISOString().split("T")[0],
        });
      }
    }

    // Add numeric filter
    if (numericFilter.field && numericFilter.value !== "") {
      if (numericFilter.operator === "between" && numericFilter.value2 !== "") {
        filters.push({
          field: numericFilter.field,
          operator: "gte",
          value: numericFilter.value,
        });
        filters.push({
          field: numericFilter.field,
          operator: "lte",
          value: numericFilter.value2,
        });
      } else {
        filters.push({
          field: numericFilter.field,
          operator: numericFilter.operator,
          value: numericFilter.value,
        });
      }
    }

    onApplyFilters(filters);
  };

  // Clear all filters
  const clearFilters = () => {
    setActiveFilters([]);
    setSearchFields([]);
    setSearchTerm("");
    setDateRange({ endDate: undefined, field: "", startDate: undefined });
    setNumericFilter({ field: "", operator: "eq", value: "", value2: "" });
    onClearFilters();
  };

  // Get the field definition for a given field name
  const getFieldDef = (fieldName: string) => {
    return detectedFields.find((f) => f.field === fieldName);
  };

  // Count active filters
  const countActiveFilters = () => {
    let count = 0;

    // Count standard filters
    count += activeFilters.length;

    // Count search filters
    if (searchTerm && searchFields.length > 0) {
      count += 1;
    }

    // Count date range filter
    if (dateRange.field && (dateRange.startDate || dateRange.endDate)) {
      count += 1;
    }

    // Count numeric filter
    if (numericFilter.field && numericFilter.value !== "") {
      count += 1;
    }

    return count;
  };

  // Get string fields for multi-field search
  const searchableFields = fieldsByType.searchable;

  // Get date fields for date range filter
  const dateFields = fieldsByType.date;

  // Get numeric fields for numeric filter
  const numericFields = fieldsByType.number;

  return (
    <div className={cn("space-y-2", className)}>
      {/* Filter toggle button */}
      <div className="flex items-center justify-between">
        <Button
          className="flex items-center gap-2"
          onClick={() => setIsExpanded(!isExpanded)}
          variant="outline">
          <Filter className="h-4 w-4" />
          Advanced Filters
          {countActiveFilters() > 0 && (
            <span className="ml-1 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs">
              {countActiveFilters()}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 ml-1" />
          ) : (
            <ChevronDown className="h-4 w-4 ml-1" />
          )}
        </Button>

        {countActiveFilters() > 0 && (
          <Button
            className="text-muted-foreground"
            onClick={clearFilters}
            size="sm"
            variant="ghost">
            Clear all
          </Button>
        )}
      </div>

      {/* Filter panel */}
      {isExpanded && (
        <Card className="border rounded-md">
          <CardContent className="p-4 space-y-4">
            {/* Multi-field search */}
            {searchableFields.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Multi-Field Search</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      className="w-full"
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search term..."
                      value={searchTerm}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">
                        Search in fields:
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            className="h-6 w-6 p-0"
                            size="sm"
                            variant="ghost">
                            <Info className="h-3.5 w-3.5" />
                            <span className="sr-only">Info</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="text-sm">
                            <p className="font-medium">Multi-Field Search</p>
                            <p className="text-muted-foreground mt-1">
                              Select which fields to include in your search. The
                              search term will be matched against all selected
                              fields.
                            </p>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {searchableFields.map((field) => (
                        <div
                          className="flex items-center space-x-2"
                          key={field.field}>
                          <Checkbox
                            checked={searchFields.includes(field.field)}
                            id={`search-${field.field}`}
                            onCheckedChange={() =>
                              toggleSearchField(field.field)
                            }
                          />
                          <Label
                            className="text-sm font-normal cursor-pointer"
                            htmlFor={`search-${field.field}`}>
                            {field.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Date range filter */}
            {dateFields.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Date Range Filter</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      Field
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        setDateRange((prev) => ({ ...prev, field: value }))
                      }
                      value={dateRange.field}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {dateFields.map((field) => (
                          <SelectItem key={field.field} value={field.field}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      Start Date
                    </Label>
                    <DatePicker
                      date={dateRange.startDate}
                      disabled={!dateRange.field}
                      placeholder="From"
                      setDate={(date) =>
                        setDateRange((prev) => ({ ...prev, startDate: date }))
                      }
                    />
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      End Date
                    </Label>
                    <DatePicker
                      date={dateRange.endDate}
                      disabled={!dateRange.field}
                      placeholder="To"
                      setDate={(date) =>
                        setDateRange((prev) => ({ ...prev, endDate: date }))
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Numeric filter */}
            {numericFields.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Numeric Filter</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      Field
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        setNumericFilter((prev) => ({ ...prev, field: value }))
                      }
                      value={numericFilter.field}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {numericFields.map((field) => (
                          <SelectItem key={field.field} value={field.field}>
                            {field.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      Operator
                    </Label>
                    <Select
                      disabled={!numericFilter.field}
                      onValueChange={(value) =>
                        setNumericFilter((prev) => ({
                          ...prev,
                          operator: value as LogicalOperator,
                        }))
                      }
                      value={numericFilter.operator}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {getOperatorOptions("number").map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      {numericFilter.operator === "between"
                        ? "Min Value"
                        : "Value"}
                    </Label>
                    <Input
                      disabled={!numericFilter.field}
                      onChange={(e) =>
                        setNumericFilter((prev) => ({
                          ...prev,
                          value:
                            e.target.value === "" ? "" : Number(e.target.value),
                        }))
                      }
                      placeholder="Enter value"
                      type="number"
                      value={
                        numericFilter.value === "" ? "" : numericFilter.value
                      }
                    />
                  </div>

                  {numericFilter.operator === "between" && (
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        Max Value
                      </Label>
                      <Input
                        disabled={!numericFilter.field}
                        onChange={(e) =>
                          setNumericFilter((prev) => ({
                            ...prev,
                            value2:
                              e.target.value === ""
                                ? ""
                                : Number(e.target.value),
                          }))
                        }
                        placeholder="Enter max value"
                        type="number"
                        value={
                          numericFilter.value2 === ""
                            ? ""
                            : numericFilter.value2
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Custom filters */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Custom Filters</h3>
                </div>

                <Button
                  className="h-7 text-xs"
                  onClick={addFilter}
                  size="sm"
                  variant="outline">
                  Add Filter
                </Button>
              </div>

              {activeFilters.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-2">
                  No custom filters added yet
                </div>
              ) : (
                <div className="space-y-3">
                  {activeFilters.map((filter, index) => {
                    const fieldDef = getFieldDef(filter.field);
                    const isSelectField = fieldDef?.type === "select";
                    const isBooleanField = fieldDef?.type === "boolean";
                    const isDateField = fieldDef?.type === "date";
                    const isBetweenOperator = filter.operator === "between";

                    return (
                      <div
                        className="grid grid-cols-12 gap-2 items-start"
                        key={index}>
                        <div className="col-span-3">
                          <Select
                            onValueChange={(value) =>
                              updateFilterField(index, value)
                            }
                            value={filter.field}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select field" />
                            </SelectTrigger>
                            <SelectContent>
                              {detectedFields.map((field) => (
                                <SelectItem
                                  key={field.field}
                                  value={field.field}>
                                  {field.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="col-span-3">
                          <Select
                            onValueChange={(value) =>
                              updateFilterOperator(index, value)
                            }
                            value={filter.operator}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select operator" />
                            </SelectTrigger>
                            <SelectContent>
                              {fieldDef &&
                                getOperatorOptions(fieldDef.type).map((op) => (
                                  <SelectItem key={op.value} value={op.value}>
                                    {op.label}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div
                          className={cn(
                            "col-span-5",
                            isBetweenOperator ? "col-span-2" : "",
                          )}>
                          {isSelectField ? (
                            <Select
                              onValueChange={(value) =>
                                updateFilterValue(index, value)
                              }
                              value={filter.value}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select value" />
                              </SelectTrigger>
                              <SelectContent>
                                {fieldDef?.options?.map((option) => (
                                  <SelectItem
                                    key={String(option.value)}
                                    value={String(option.value)}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : isBooleanField ? (
                            <Select
                              onValueChange={(value) =>
                                updateFilterValue(index, value === "true")
                              }
                              value={filter.value.toString()}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select value" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">True</SelectItem>
                                <SelectItem value="false">False</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : isDateField ? (
                            <DatePicker
                              date={
                                filter.value
                                  ? new Date(filter.value)
                                  : undefined
                              }
                              placeholder="Select date"
                              setDate={(date) =>
                                updateFilterValue(
                                  index,
                                  date?.toISOString().split("T")[0],
                                )
                              }
                            />
                          ) : fieldDef?.type === "number" ? (
                            <Input
                              onChange={(e) =>
                                updateFilterValue(
                                  index,
                                  e.target.valueAsNumber || "",
                                )
                              }
                              placeholder="Enter value"
                              type="number"
                              value={filter.value}
                            />
                          ) : (
                            <Input
                              onChange={(e) =>
                                updateFilterValue(index, e.target.value)
                              }
                              placeholder="Enter value"
                              value={filter.value}
                            />
                          )}
                        </div>

                        {isBetweenOperator && (
                          <div className="col-span-3">
                            {isDateField ? (
                              <DatePicker
                                date={
                                  filter.value2
                                    ? new Date(filter.value2)
                                    : undefined
                                }
                                placeholder="End date"
                                setDate={(date) =>
                                  updateFilterValue2(
                                    index,
                                    date?.toISOString().split("T")[0],
                                  )
                                }
                              />
                            ) : (
                              <Input
                                onChange={(e) =>
                                  updateFilterValue2(
                                    index,
                                    fieldDef?.type === "number"
                                      ? e.target.valueAsNumber || ""
                                      : e.target.value,
                                  )
                                }
                                placeholder="End value"
                                type={
                                  fieldDef?.type === "number"
                                    ? "number"
                                    : "text"
                                }
                                value={filter.value2}
                              />
                            )}
                          </div>
                        )}

                        <div className="col-span-1">
                          <Button
                            className="h-10 w-10"
                            onClick={() => removeFilter(index)}
                            size="icon"
                            variant="ghost">
                            <X className="h-4 w-4" />
                            <span className="sr-only">Remove filter</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex justify-end space-x-2 pt-2">
              <Button onClick={clearFilters} variant="outline">
                Clear All
              </Button>
              <Button
                className="min-w-[100px]"
                disabled={isLoading}
                onClick={applyFilters}>
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>Apply Filters</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
