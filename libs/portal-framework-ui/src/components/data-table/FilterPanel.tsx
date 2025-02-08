import type { CrudFilters, LogicalFilter } from "@refinedev/core";

import {
  Button,
  Checkbox,
  cn,
  DatePicker,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@lumeweb/portal-framework-ui-core";
import {
  Calendar,
  Filter,
  Hash,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { z } from "zod";

import type {
  FieldType,
  FilterField,
  FilterOption,
  FilterValue,
  LogicalOperator,
  OperatorOption,
} from "./types";

import { FilterChip } from "../../components/FilterChip";
import { useScreenReaderAnnouncement } from "../screen-reader/hooks/useScreenReaderAnnouncement";
import { SavedFiltersPanel } from "./SavedFiltersPanel";
import { convertZodSchemaToFilters } from "./types/zod-filter";

export interface FilterPanelProps {
  className?: string;
  enableAdvancedFilters?: boolean;
  enableQuickFilters?: boolean;
  enableSavedFilters?: boolean;
  /**
   * Filter configuration options (choose one):
   * - fields: Explicit field definitions
   * - sampleRecord: Single record + getFieldMetadata
   * - schema: Zod schema for type inference
   */
  fields?: FilterField[];
  /**
   * Optional callback to get field metadata
   */
  getFieldMetadata?: (fieldName: string) => {
    isFilterable?: boolean;
    isSearchable?: boolean;
    label?: string;
    operators?: LogicalOperator[];
    options?: FilterOption[];
    priority?: "high" | "low" | "medium";
    type?: FieldType;
  };
  initialFilters?: CrudFilters;
  isLoading?: boolean;
  onApplyFilters: (filters: CrudFilters) => void;
  onClearFilters: () => void;
  resource?: string;
  /**
   * Sample record(s) for field type inference
   * Can be a single record or array of records
   * Required if not using explicit field definitions
   */
  sampleRecord?: Record<string, any> | Record<string, any>[];
  /**
   * Zod schema for automatic field type inference
   */
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

// Update the getDefaultOperators function to return LogicalOperator[]
const getDefaultOperators = (type: FieldType): LogicalOperator[] => {
  switch (type) {
    case "boolean":
      return ["eq"];
    case "date":
      return ["eq", "ne", "gt", "lt", "gte", "lte", "between"];
    case "number":
      return ["eq", "ne", "gt", "lt", "gte", "lte", "between"];
    case "select":
      return ["eq", "ne"];
    case "string":
      return ["contains", "eq", "ne", "startswith", "endswith"];
    default:
      return ["eq", "ne"];
  }
};

// Update the getOperatorOptions function to return OperatorOption[]
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
        { label: "Between", value: "between" },
      ];
    case "number":
      return [
        { label: "Equals", value: "eq" },
        { label: "Not Equals", value: "ne" },
        { label: "Greater Than", value: "gt" },
        { label: "Less Than", value: "lt" },
        { label: "Greater Than or Equal", value: "gte" },
        { label: "Less Than or Equal", value: "lte" },
        { label: "Between", value: "between" },
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

// Helper function to convert our FilterValue to Refine's LogicalFilter
const convertToLogicalFilter = (filter: FilterValue): LogicalFilter => {
  return {
    field: filter.field,
    operator: filter.operator,
    value: filter.value,
  };
};

// Helper function to ensure operators are LogicalOperator[]
const ensureLogicalOperators = (
  operators: any[] | undefined,
): LogicalOperator[] => {
  if (!operators) return [];

  // Filter out "or" and "and" operators
  return operators.filter(
    (op) => op !== "or" && op !== "and",
  ) as LogicalOperator[];
};

// Add the hook to the FilterPanel component
export function FilterPanel({
  className,
  enableAdvancedFilters = true,
  enableQuickFilters = true,
  enableSavedFilters = true,
  fields,
  getFieldMetadata,
  initialFilters,
  isLoading = false,
  onApplyFilters,
  onClearFilters,
  resource,
  sampleRecord,
  schema,
}: FilterPanelProps) {
  // Add the screen reader announcement hook
  const { announce } = useScreenReaderAnnouncement();

  // Update the FilterPanel component to make quick filters collapsible

  // Add a state for the quick filter panel visibility
  const [isQuickFilterPanelOpen, setIsQuickFilterPanelOpen] = useState(false);

  // State for simple mode
  const [searchTerm, setSearchTerm] = useState("");
  const [simpleFilters, setSimpleFilters] = useState<Record<string, string[]>>(
    {},
  );
  const [simpleDateRange, setSimpleDateRange] = useState<{
    endDate: Date | undefined;
    field: string;
    startDate: Date | undefined;
  }>({ endDate: undefined, field: "", startDate: undefined });

  // State for advanced mode (in modal)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterValue[]>([]);
  const [searchFields, setSearchFields] = useState<string[]>([]);
  const [advancedSearchTerm, setAdvancedSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<{
    endDate: Date | undefined;
    field: string;
    startDate: Date | undefined;
  }>({ endDate: undefined, field: "", startDate: undefined });
  // Then update the numericFilter state to use LogicalOperator instead of CrudOperators
  const [numericFilter, setNumericFilter] = useState<{
    field: string;
    operator: LogicalOperator;
    value: "" | number;
    value2: "" | number;
  }>({ field: "", operator: "eq", value: "", value2: "" });

  // Temporary state for the modal to prevent accidental state loss
  const [tempActiveFilters, setTempActiveFilters] = useState<FilterValue[]>([]);
  const [tempSearchFields, setTempSearchFields] = useState<string[]>([]);
  const [tempAdvancedSearchTerm, setTempAdvancedSearchTerm] = useState("");
  const [tempDateRange, setTempDateRange] = useState<{
    endDate: Date | undefined;
    field: string;
    startDate: Date | undefined;
  }>({ endDate: undefined, field: "", startDate: undefined });
  // And update the tempNumericFilter state similarly
  const [tempNumericFilter, setTempNumericFilter] = useState<{
    field: string;
    operator: LogicalOperator;
    value: "" | number;
    value2: "" | number;
  }>({ field: "", operator: "eq", value: "", value2: "" });

  // Track if we're closing via button to prevent warning tooltip
  const [isClosingViaButton, setIsClosingViaButton] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-detect fields if not provided explicitly
  const detectedFields = useMemo(() => {
    if (fields) return fields;

    const result: FilterField[] = [];

    // If Zod schema is provided, convert it to filter fields
    if (schema && typeof schema === "object" && "_def" in schema) {
      return convertZodSchemaToFilters(schema as z.ZodObject<any>);
    }

    // If JSON schema is provided, use it to define fields
    if (typeof schema === "object" && !(schema instanceof z.ZodObject)) {
      Object.entries(schema).forEach(([field, def]) => {
        const metadata = getFieldMetadata ? getFieldMetadata(field) : {};

        result.push({
          field,
          isFilterable:
            metadata.isFilterable !== undefined ? metadata.isFilterable : true,
          isSearchable:
            metadata.isSearchable !== undefined
              ? metadata.isSearchable
              : def.type === "string",
          label:
            metadata.label ||
            field.charAt(0).toUpperCase() +
              field.slice(1).replace(/([A-Z])/g, " $1"),
          operators:
            ensureLogicalOperators(metadata.operators) ||
            getDefaultOperators(def.type),
          options: metadata.options,
          priority: metadata.priority || "medium",
          type: def.type,
        });
      });

      return result;
    }

    // If sample data is provided, use it to infer fields
    if (sampleRecord) {
      const records = Array.isArray(sampleRecord)
        ? sampleRecord
        : [sampleRecord];
      if (records.length > 0) {
        // Get all possible fields from all objects
        const allFields = new Set<string>();
        for (const record of records) {
          if (record && typeof record === "object") {
            Object.keys(record).forEach((key) => allFields.add(key));
          }
        }

        // Process each field
        allFields.forEach((field) => {
          const metadata = getFieldMetadata ? getFieldMetadata(field) : {};

          // Find the first non-null value to determine type
          let fieldType: FieldType = "unknown";
          let foundValue = false;

          const records = Array.isArray(sampleRecord)
            ? sampleRecord
            : [sampleRecord];
          for (const item of records) {
            if (
              item &&
              typeof item === "object" &&
              field in item &&
              item[field] !== undefined &&
              item[field] !== null
            ) {
              fieldType = metadata.type || inferFieldType(item[field]);
              foundValue = true;
              break;
            }
          }

          if (!foundValue) return; // Skip fields with no values

          // Check if this might be a select field
          const { isSelect, options } = detectSelectField(records, field);
          if (isSelect && !metadata.type) {
            fieldType = "select";
          }

          result.push({
            field,
            isFilterable:
              metadata.isFilterable !== undefined
                ? metadata.isFilterable
                : true,
            isSearchable:
              metadata.isSearchable !== undefined
                ? metadata.isSearchable
                : fieldType === "string",
            label:
              metadata.label ||
              field.charAt(0).toUpperCase() +
                field.slice(1).replace(/([A-Z])/g, " $1"),
            operators:
              ensureLogicalOperators(metadata.operators) ||
              getDefaultOperators(fieldType),
            options:
              metadata.options ||
              (fieldType === "select" ? options : undefined),
            priority: metadata.priority || "medium",
            type: fieldType,
          });
        });

        return result;
      }
    }
    return [];
  }, [fields, sampleRecord, schema, getFieldMetadata]);

  // Group fields by type for easier access
  const fieldsByType = useMemo(() => {
    const result = {
      boolean: detectedFields.filter((f) => f.type === "boolean"),
      date: detectedFields.filter((f) => f.type === "date"),
      filterable: detectedFields.filter((f) => f.isFilterable),
      // Group by priority for simple mode
      highPriority: detectedFields.filter(
        (f) => f.priority === "high" && f.isFilterable,
      ),
      lowPriority: detectedFields.filter(
        (f) => f.priority === "low" && f.isFilterable,
      ),
      mediumPriority: detectedFields.filter(
        (f) => f.priority === "medium" && f.isFilterable,
      ),
      number: detectedFields.filter((f) => f.type === "number"),
      searchable: detectedFields.filter((f) => f.isSearchable),
      select: detectedFields.filter((f) => f.type === "select"),
      string: detectedFields.filter((f) => f.type === "string"),
    };
    return result;
  }, [detectedFields]);

  // Get fields for simple mode (high and medium priority)
  const simpleFilterFields = useMemo(() => {
    return [
      ...fieldsByType.highPriority,
      ...fieldsByType.mediumPriority,
    ].filter((f) => f.type === "select" || f.type === "boolean");
  }, [fieldsByType]);

  // Initialize from initialFilters if provided
  useEffect(() => {
    if (initialFilters && initialFilters.length > 0) {
      const parsedFilters: FilterValue[] = [];
      const searchTerms: string[] = [];
      let foundSearchTerm = "";
      const newSimpleFilters: Record<string, string[]> = {};

      initialFilters.forEach((filter) => {
        // Check if it's a LogicalFilter (not a ConditionalFilter)
        if ("field" in filter && "operator" in filter && "value" in filter) {
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
              setSimpleDateRange((prev) => ({
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
              setSimpleDateRange((prev) => ({
                ...prev,
                endDate: new Date(filter.value as string),
                field: filter.field,
              }));
            }
          } else if (filter.operator === "eq") {
            // This could be a simple filter
            const fieldDef = detectedFields.find(
              (f) => f.field === filter.field,
            );
            if (
              fieldDef &&
              (fieldDef.type === "select" || fieldDef.type === "boolean")
            ) {
              // Add to simple filters
              if (!newSimpleFilters[filter.field]) {
                newSimpleFilters[filter.field] = [];
              }
              newSimpleFilters[filter.field].push(String(filter.value));
            } else {
              // Add to advanced filters
              parsedFilters.push({
                field: filter.field,
                operator: filter.operator as LogicalOperator,
                value: filter.value,
              });
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
        setAdvancedSearchTerm(foundSearchTerm);
      }

      // Set search term for both simple and advanced modes
      setSearchTerm(foundSearchTerm);

      if (parsedFilters.length > 0) {
        setActiveFilters(parsedFilters);
      }

      if (Object.keys(newSimpleFilters).length > 0) {
        setSimpleFilters(newSimpleFilters);
      }
    }
  }, [initialFilters, detectedFields]);

  // Initialize temp state when opening modal
  useEffect(() => {
    if (isModalOpen) {
      setTempActiveFilters([...activeFilters]);
      setTempSearchFields([...searchFields]);
      setTempAdvancedSearchTerm(advancedSearchTerm);
      setTempDateRange({ ...dateRange });
      setTempNumericFilter({ ...numericFilter });
      setIsClosingViaButton(false);
    }
  }, [
    isModalOpen,
    activeFilters,
    searchFields,
    advancedSearchTerm,
    dateRange,
    numericFilter,
  ]);

  // Add a new filter in the modal
  const addFilter = () => {
    if (detectedFields.length > 0) {
      const firstField = detectedFields[0];
      const operators =
        firstField.operators || getDefaultOperators(firstField.type);

      setTempActiveFilters([
        ...tempActiveFilters,
        {
          field: firstField.field,
          operator: operators[0],
          value: firstField.type === "boolean" ? false : "",
        },
      ]);
    }
  };

  // Remove a filter in the modal
  const removeFilter = (index: number) => {
    const newFilters = [...tempActiveFilters];
    newFilters.splice(index, 1);
    setTempActiveFilters(newFilters);
  };

  // Update a filter field in the modal
  const updateFilterField = (index: number, field: string) => {
    const newFilters = [...tempActiveFilters];
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

      setTempActiveFilters(newFilters);
    }
  };

  // Update the updateFilterOperator function
  const updateFilterOperator = (index: number, operator: string) => {
    const newFilters = [...tempActiveFilters];
    newFilters[index] = {
      ...newFilters[index],
      operator: operator as LogicalOperator,
      value: newFilters[index].value,
    };
    setTempActiveFilters(newFilters);
  };

  // Update a filter value in the modal
  const updateFilterValue = (index: number, value: any) => {
    const newFilters = [...tempActiveFilters];
    newFilters[index] = {
      ...newFilters[index],
      value,
    };
    setTempActiveFilters(newFilters);
  };

  // Update a filter's second value (for "between" operator) in the modal
  const updateFilterValue2 = (index: number, value: any) => {
    const newFilters = [...tempActiveFilters];
    newFilters[index] = {
      ...newFilters[index],
      value2: value,
    };
    setTempActiveFilters(newFilters);
  };

  // Toggle a search field in the modal
  const toggleSearchField = (field: string) => {
    setTempSearchFields((prev) =>
      prev.includes(field) ? prev.filter((f) => f !== field) : [...prev, field],
    );
  };

  // Toggle a simple filter value (real-time)
  const toggleSimpleFilter = (field: string, value: string) => {
    setSimpleFilters((prev) => {
      const newFilters = { ...prev };
      if (!newFilters[field]) {
        newFilters[field] = [value];
        // Announce filter addition
        const fieldDef = getFieldDef(field);
        announce(
          `Added filter: ${fieldDef?.label || field} is ${value}`,
          "polite",
        );
      } else if (newFilters[field].includes(value)) {
        newFilters[field] = newFilters[field].filter((v) => v !== value);
        // Announce filter removal
        const fieldDef = getFieldDef(field);
        announce(
          `Removed filter: ${fieldDef?.label || field} is ${value}`,
          "polite",
        );
        if (newFilters[field].length === 0) {
          delete newFilters[field];
        }
      } else {
        newFilters[field] = [...newFilters[field], value];
        // Announce filter addition
        const fieldDef = getFieldDef(field);
        announce(
          `Added filter: ${fieldDef?.label || field} is ${value}`,
          "polite",
        );
      }
      return newFilters;
    });

    // Apply simple filters immediately
    applySimpleFilters();
  };

  // Apply simple filters (real-time)
  const applySimpleFilters = useCallback(() => {
    const filters: LogicalFilter[] = [];

    // Add simple filters
    Object.entries(simpleFilters).forEach(([field, values]) => {
      values.forEach((value) => {
        filters.push({
          field,
          operator: "eq",
          value,
        });
      });
    });

    // Add search term if provided
    if (searchTerm) {
      const searchableFields = fieldsByType.searchable.filter(
        (f) => f.priority === "high",
      );
      searchableFields.forEach((field) => {
        filters.push({
          field: field.field,
          operator: "contains",
          value: searchTerm,
        });
      });
    }

    // Add date range if provided
    if (simpleDateRange.field) {
      if (simpleDateRange.startDate) {
        filters.push({
          field: simpleDateRange.field,
          operator: "gte",
          value: simpleDateRange.startDate.toISOString().split("T")[0],
        });
      }
      if (simpleDateRange.endDate) {
        filters.push({
          field: simpleDateRange.field,
          operator: "lte",
          value: simpleDateRange.endDate.toISOString().split("T")[0],
        });
      }
    }

    // Update parent component and local state
    onApplyFilters(filters);

    // Update active filters state for chips
    setActiveFilters(
      filters.filter((f) => f.operator === "eq" || f.operator === "contains"),
    );

    // Announce filter application to screen readers
    if (filters.length > 0) {
      announce(`Applied ${filters.length} quick filters`, "polite");
    } else {
      announce("All quick filters cleared", "polite");
    }
  }, [
    onApplyFilters,
    simpleFilters,
    searchTerm,
    simpleDateRange,
    fieldsByType.searchable,
    announce,
    setActiveFilters,
  ]);

  // Apply changes from the modal
  const applyAdvancedFilters = () => {
    // Save the temp state to the real state
    setActiveFilters(tempActiveFilters);
    setSearchFields(tempSearchFields);
    setAdvancedSearchTerm(tempAdvancedSearchTerm);
    setDateRange(tempDateRange);
    setNumericFilter(tempNumericFilter);

    // Also update the simple search term to match
    setSearchTerm(tempAdvancedSearchTerm);

    const filters: LogicalFilter[] = [];

    // Add active filters from advanced mode
    tempActiveFilters.forEach((filter) => {
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
    if (tempAdvancedSearchTerm && tempSearchFields.length > 0) {
      tempSearchFields.forEach((field) => {
        filters.push({
          field,
          operator: "contains",
          value: tempAdvancedSearchTerm,
        });
      });
    }

    // Add date range filter
    if (
      tempDateRange.field &&
      (tempDateRange.startDate || tempDateRange.endDate)
    ) {
      if (tempDateRange.startDate) {
        filters.push({
          field: tempDateRange.field,
          operator: "gte",
          value: tempDateRange.startDate.toISOString().split("T")[0],
        });
      }

      if (tempDateRange.endDate) {
        filters.push({
          field: tempDateRange.field,
          operator: "lte",
          value: tempDateRange.endDate.toISOString().split("T")[0],
        });
      }
    }

    // Add numeric filter
    if (tempNumericFilter.field && tempNumericFilter.value !== "") {
      if (
        tempNumericFilter.operator === "between" &&
        tempNumericFilter.value2 !== ""
      ) {
        filters.push({
          field: tempNumericFilter.field,
          operator: "gte",
          value: tempNumericFilter.value,
        });
        filters.push({
          field: tempNumericFilter.field,
          operator: "lte",
          value: tempNumericFilter.value2,
        });
      } else {
        filters.push({
          field: tempNumericFilter.field,
          operator: tempNumericFilter.operator,
          value: tempNumericFilter.value,
        });
      }
    }

    onApplyFilters(filters);
    setIsModalOpen(false);

    // Announce filter application to screen readers
    announce(`Applied ${filters.length} advanced filters`, "polite");
  };

  // Clear all filters
  const clearAllFilters = () => {
    setActiveFilters([]);
    setSearchFields([]);
    setAdvancedSearchTerm("");
    setDateRange({ endDate: undefined, field: "", startDate: undefined });
    setNumericFilter({ field: "", operator: "eq", value: "", value2: "" });
    setSimpleFilters({});
    setSearchTerm("");
    setSimpleDateRange({ endDate: undefined, field: "", startDate: undefined });
    onClearFilters();

    // Announce filter clearing to screen readers
    announce("All filters cleared", "polite");
  };

  // Clear modal filters
  const clearModalFilters = () => {
    setTempActiveFilters([]);
    setTempSearchFields([]);
    setTempAdvancedSearchTerm("");
    setTempDateRange({ endDate: undefined, field: "", startDate: undefined });
    setTempNumericFilter({ field: "", operator: "eq", value: "", value2: "" });

    // Announce filter clearing to screen readers
    announce("Modal filters cleared", "polite");
  };

  // Get the field definition for a given field name
  const getFieldDef = (fieldName: string) => {
    return detectedFields.find((f) => f.field === fieldName);
  };

  // Count active filters
  const countActiveFilters = () => {
    let count = 0;

    // Count advanced filters
    count += activeFilters.length;

    // Count search filters
    if (advancedSearchTerm && searchFields.length > 0) {
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

    // Count simple filters
    count += Object.values(simpleFilters).reduce(
      (acc, values) => acc + values.length,
      0,
    );

    // Count simple search
    if (searchTerm && count === 0) {
      count += 1;
    }

    // Count simple date range
    if (
      simpleDateRange.field &&
      (simpleDateRange.startDate || simpleDateRange.endDate) &&
      !dateRange.field
    ) {
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

  // Handle search input change (real-time)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
  };

  // Debounced search filter application
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== "" || Object.keys(simpleFilters).length > 0) {
        applySimpleFilters();
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, simpleFilters, applySimpleFilters]);

  // Handle simple date range change
  const handleSimpleDateChange = (
    type: "end" | "start",
    date: Date | undefined,
  ) => {
    if (dateFields.length === 0) return;

    setSimpleDateRange((prev) => {
      const newState = {
        endDate: type === "end" ? date : prev.endDate,
        field: prev.field || dateFields[0].field,
        startDate: type === "start" ? date : prev.startDate,
      };

      // Apply filters immediately when date changes
      if (date) {
        applySimpleFilters();
      }
      return newState;
    });
  };

  // Add a state to track if the tooltip is visible
  const [showCloseWarningTooltip, setShowCloseWarningTooltip] = useState(false);

  // Add a function to check if there are unsaved changes in the modal
  const hasUnsavedChanges = () => {
    // Check if any temporary filters have been added or modified
    if (tempActiveFilters.length > 0) return true;
    if (tempSearchFields.length > 0) return true;
    if (tempAdvancedSearchTerm) return true;
    if (tempDateRange.field) return true;
    if (tempNumericFilter.field) return true;

    return false;
  };

  // Add a function to handle attempted outside clicks
  const handleOpenChange = (open: boolean) => {
    // If trying to close and has unsaved changes, show tooltip instead
    if (!open && hasUnsavedChanges() && !isClosingViaButton) {
      setShowCloseWarningTooltip(true);
      // Auto-hide tooltip after 3 seconds
      setTimeout(() => setShowCloseWarningTooltip(false), 3000);
      return;
    }

    // Otherwise, allow the modal to open/close normally
    setIsModalOpen(open);
    // Reset the flag after handling the open change
    setIsClosingViaButton(false);
  };

  // Handle close button click
  const handleCloseButtonClick = () => {
    setIsClosingViaButton(true);
    setIsModalOpen(false);
  };

  // Update the applyFilters function to include announcements
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

    // Announce filter application to screen readers
    announce(`Applied ${filters.length} filters`, "polite");
  };

  // Update the clearFilters function to include announcements
  const clearFilters = () => {
    setActiveFilters([]);
    setSearchFields([]);
    setSearchTerm("");
    setDateRange({ endDate: undefined, field: "", startDate: undefined });
    setNumericFilter({ field: "", operator: "eq", value: "", value2: "" });
    onClearFilters();

    // Announce filter clearing to screen readers
    announce("All filters cleared", "polite");
  };

  return (
    <div className={cn("relative", className)}>
      {/* Replace the search and filter buttons section with this updated version */}
      <div className="flex flex-col sm:flex-row gap-2 mb-2">
        {/* Search input and filter chips */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <div className="flex flex-wrap items-center gap-2 pl-8 pr-2 py-1.5 min-h-[40px]">
            <Input
              className="flex-1 min-w-[200px] border-none shadow-none focus-visible:ring-0"
              onChange={handleSearchChange}
              placeholder="Search..."
              value={searchTerm}
            />
            {/* Display active filter chips */}
            {Object.entries(simpleFilters).map(([field, values]) =>
              values.map((value) => {
                const fieldDef = getFieldDef(field);
                return (
                  <FilterChip
                    key={`${field}-${value}`}
                    label={`${fieldDef?.label || field}: ${value}`}
                    onRemove={() => {
                      toggleSimpleFilter(field, value);
                      announce(`Removed ${field} filter`, "polite");
                    }}
                    variant={
                      fieldDef?.type === "date"
                        ? "date"
                        : fieldDef?.type === "number"
                          ? "numeric"
                          : "text"
                    }
                  />
                );
              }),
            )}
            {simpleDateRange.field && (
              <FilterChip
                label={`${simpleDateRange.field}: ${
                  simpleDateRange.startDate?.toLocaleDateString() || ""
                } - ${
                  simpleDateRange.endDate?.toLocaleDateString() || ""
                }`.trim()}
                onRemove={() => {
                  setSimpleDateRange({
                    endDate: undefined,
                    field: "",
                    startDate: undefined,
                  });
                  announce("Cleared date range", "polite");
                }}
                variant="date"
              />
            )}
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-2">
          {enableQuickFilters && (
            <Button
              className={cn(
                "flex items-center gap-2",
                (Object.keys(simpleFilters).length > 0 ||
                  simpleDateRange.field) &&
                  "bg-primary/10 border-primary/20",
              )}
              onClick={() => setIsQuickFilterPanelOpen(!isQuickFilterPanelOpen)}
              variant="outline">
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Quick Filters</span>
              {(Object.keys(simpleFilters).length > 0 ||
                simpleDateRange.field) && (
                <span className="rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs">
                  {Object.values(simpleFilters).reduce(
                    (acc, values) => acc + values.length,
                    0,
                  ) +
                    (simpleDateRange.field &&
                    (simpleDateRange.startDate || simpleDateRange.endDate)
                      ? 1
                      : 0)}
                </span>
              )}
            </Button>
          )}

          {enableAdvancedFilters && (
            <Button
              className={cn(
                "flex items-center gap-2",
                (activeFilters.length > 0 || searchFields.length > 0) &&
                  "bg-primary/10 border-primary/20",
              )}
              onClick={() => setIsModalOpen(true)}
              variant="outline">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Advanced</span>
              {(activeFilters.length > 0 || searchFields.length > 0) && (
                <span className="rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs">
                  {activeFilters.length + (searchFields.length > 0 ? 1 : 0)}
                </span>
              )}
            </Button>
          )}

          {countActiveFilters() > 0 && (
            <Button
              className="text-muted-foreground hover:text-foreground"
              onClick={clearAllFilters}
              size="icon"
              variant="ghost">
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Clear all filters</span>
            </Button>
          )}
        </div>
      </div>
      {/* Saved Filters Panel - conditionally rendered */}
      {enableSavedFilters && (
        <SavedFiltersPanel
          activeFilters={activeFilters}
          className="mt-2"
          clearAllFilters={clearAllFilters}
          currentFilters={[
            ...Object.entries(simpleFilters || {}).flatMap(([field, values]) =>
              values.map((value) => ({
                field,
                operator: "eq" as const,
                value,
              })),
            ),
            ...(searchTerm && fieldsByType.searchable.length > 0
              ? [
                  {
                    field: fieldsByType.searchable[0].field,
                    operator: "contains" as const,
                    value: searchTerm,
                  },
                ]
              : []),
            ...(simpleDateRange.field && simpleDateRange.startDate
              ? [
                  {
                    field: simpleDateRange.field,
                    operator: "gte" as const,
                    value: simpleDateRange.startDate
                      .toISOString()
                      .split("T")[0],
                  },
                ]
              : []),
            ...(simpleDateRange.field && simpleDateRange.endDate
              ? [
                  {
                    field: simpleDateRange.field,
                    operator: "lte" as const,
                    value: simpleDateRange.endDate.toISOString().split("T")[0],
                  },
                ]
              : []),
            ...activeFilters.map(convertToLogicalFilter),
          ]}
          fieldsByType={fieldsByType}
          onApplyFilter={onApplyFilters}
          onApplyFilters={onApplyFilters}
          onClearFilters={clearAllFilters}
          resource={resource || "default"}
          searchTerm={searchTerm}
          simpleDateRange={simpleDateRange}
          simpleFilters={simpleFilters}
        />
      )}

      {/* Simple filter panel */}
      {isQuickFilterPanelOpen && (
        <div className="space-y-4 mb-4 border rounded-md p-4 animate-in fade-in-50 slide-in-from-top-5 duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Quick Filters</h3>
            <Button
              className="h-7 text-xs"
              onClick={() => setIsQuickFilterPanelOpen(false)}
              size="sm"
              variant="ghost">
              <X className="h-3.5 w-3.5 mr-1" />
              Close
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Quick filters */}
            {simpleFilterFields.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Filter className="h-3.5 w-3.5" />
                  Select Filters
                </h4>
                <div className="space-y-3">
                  {simpleFilterFields.slice(0, 3).map((field) => (
                    <div className="space-y-1" key={field.field}>
                      <Label className="text-xs text-muted-foreground">
                        {field.label}
                      </Label>
                      <div className="flex flex-wrap gap-1">
                        {field.options?.slice(0, 5).map((option) => (
                          <Button
                            className="h-7 text-xs"
                            key={`${field.field}-${option.value}`}
                            onClick={() =>
                              toggleSimpleFilter(
                                field.field,
                                String(option.value),
                              )
                            }
                            size="sm"
                            variant={
                              simpleFilters[field.field]?.includes(
                                String(option.value),
                              )
                                ? "default"
                                : "outline"
                            }>
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Date range in simple mode */}
            {dateFields.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Date Range
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      From
                    </Label>
                    <DatePicker
                      date={simpleDateRange.startDate}
                      placeholder="Start date"
                      setDate={(date) => handleSimpleDateChange("start", date)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      To
                    </Label>
                    <DatePicker
                      date={simpleDateRange.endDate}
                      placeholder="End date"
                      setDate={(date) => handleSimpleDateChange("end", date)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button className="mr-2" onClick={clearFilters} variant="outline">
              Clear Filters
            </Button>
            <Button onClick={applyFilters} size="sm">
              Apply Filters
            </Button>
          </div>
        </div>
      )}

      {/* Advanced Filter Modal */}
      <Dialog onOpenChange={handleOpenChange} open={isModalOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          {/* Warning tooltip */}
          {showCloseWarningTooltip && (
            <div className="absolute right-12 top-4 z-50 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 p-2 rounded-md shadow-md border border-amber-200 dark:border-amber-800 text-xs max-w-[200px] animate-in fade-in slide-in-from-top-2 duration-200">
              <button
                className="absolute right-1 top-1 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
                onClick={() => setShowCloseWarningTooltip(false)}>
                <X className="h-3 w-3" />
                <span className="sr-only">Close</span>
              </button>
              <p className="pr-4">
                Please use the X button or Cancel to close without losing your
                changes
              </p>
            </div>
          )}

          <DialogHeader>
            <DialogTitle>Advanced Filters</DialogTitle>
            <DialogDescription>
              Create complex filters to narrow down your data. All filters will
              be combined with AND logic.
            </DialogDescription>
          </DialogHeader>

          {/* Custom close button with onClick handler */}
          <button
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            onClick={handleCloseButtonClick}
            ref={closeButtonRef}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>

          <div className="space-y-6 py-4">
            {/* Multi-field search */}
            {searchableFields.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  Multi-Field Search
                </h3>

                <div className="space-y-3">
                  <Input
                    className="w-full"
                    onChange={(e) => setTempAdvancedSearchTerm(e.target.value)}
                    placeholder="Search term..."
                    value={tempAdvancedSearchTerm}
                  />

                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">
                      Search in fields:
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {searchableFields.map((field) => (
                        <div
                          className="flex items-center space-x-2"
                          key={field.field}>
                          <Checkbox
                            checked={tempSearchFields.includes(field.field)}
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
              <div className="space-y-3 border-t pt-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Date Range Filter
                </h3>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      Field
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        setTempDateRange((prev) => ({ ...prev, field: value }))
                      }
                      value={tempDateRange.field}>
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

                  {/* Update the DatePicker components in the Date Range Filter section */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        Start Date
                      </Label>
                      <DatePicker
                        className="w-full"
                        date={tempDateRange.startDate}
                        disabled={!tempDateRange.field}
                        placeholder="From"
                        setDate={(date) =>
                          setTempDateRange((prev) => ({
                            ...prev,
                            startDate: date,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        End Date
                      </Label>
                      <DatePicker
                        className="w-full"
                        date={tempDateRange.endDate}
                        disabled={!tempDateRange.field}
                        placeholder="To"
                        setDate={(date) =>
                          setTempDateRange((prev) => ({
                            ...prev,
                            endDate: date,
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Numeric filter */}
            {numericFields.length > 0 && (
              <div className="space-y-3 border-t pt-4">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  Numeric Filter
                </h3>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      Field
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        setTempNumericFilter((prev) => ({
                          ...prev,
                          field: value,
                        }))
                      }
                      value={tempNumericFilter.field}>
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
                    {/* Update the onValueChange handler for the numeric filter operator */}
                    <Select
                      disabled={!tempNumericFilter.field}
                      onValueChange={(value) =>
                        setTempNumericFilter((prev) => ({
                          ...prev,
                          operator: value as LogicalOperator,
                        }))
                      }
                      value={tempNumericFilter.operator}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {getOperatorOptions("number").map((op) => (
                          <SelectItem key={op.value} value={String(op.value)}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">
                      {tempNumericFilter.operator === "between"
                        ? "Min Value"
                        : "Value"}
                    </Label>
                    <Input
                      disabled={!tempNumericFilter.field}
                      onChange={(e) =>
                        setTempNumericFilter((prev) => ({
                          ...prev,
                          value:
                            e.target.value === "" ? "" : Number(e.target.value),
                        }))
                      }
                      placeholder="Enter value"
                      type="number"
                      value={
                        tempNumericFilter.value === ""
                          ? ""
                          : tempNumericFilter.value
                      }
                    />
                  </div>

                  {tempNumericFilter.operator === "between" && (
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        Max Value
                      </Label>
                      <Input
                        disabled={!tempNumericFilter.field}
                        onChange={(e) =>
                          setTempNumericFilter((prev) => ({
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
                          tempNumericFilter.value2 === ""
                            ? ""
                            : tempNumericFilter.value2
                        }
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Custom filters */}
            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  Custom Filters
                </h3>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="h-7 text-xs"
                        onClick={addFilter}
                        size="sm"
                        variant="outline">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Filter
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add a custom filter with any field and operator</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              {tempActiveFilters.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-2 border border-dashed rounded-md">
                  No custom filters added yet
                </div>
              ) : (
                <div className="space-y-3">
                  {tempActiveFilters.map((filter, index) => {
                    const fieldDef = getFieldDef(filter.field);
                    const isSelectField = fieldDef?.type === "select";
                    const isBooleanField = fieldDef?.type === "boolean";
                    const isDateField = fieldDef?.type === "date";
                    const isBetweenOperator = filter.operator === "between";

                    return (
                      <div
                        className="grid grid-cols-12 gap-2 items-start border border-border p-2 rounded-md"
                        key={index}>
                        <div className="col-span-12 sm:col-span-4">
                          <Label className="text-xs text-muted-foreground mb-1 block">
                            Field
                          </Label>
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

                        <div className="col-span-12 sm:col-span-3">
                          <Label className="text-xs text-muted-foreground mb-1 block">
                            Operator
                          </Label>
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
                            "col-span-10 sm:col-span-4",
                            isBetweenOperator ? "col-span-5 sm:col-span-2" : "",
                          )}>
                          <Label className="text-xs text-muted-foreground mb-1 block">
                            Value
                          </Label>
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
                                    key={option.value.toString()}
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
                              className="w-full"
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
                          <div className="col-span-10 sm:col-span-2">
                            <Label className="text-xs text-muted-foreground mb-1 block">
                              End Value
                            </Label>
                            {isDateField ? (
                              <DatePicker
                                className="w-full"
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

                        <div className="col-span-2 sm:col-span-1">
                          <Label className="text-xs text-muted-foreground mb-1 block invisible">
                            Remove
                          </Label>
                          <Button
                            className="h-10 w-10 text-destructive"
                            onClick={() => removeFilter(index)}
                            size="icon"
                            variant="ghost">
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove filter</span>
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button
                onClick={clearModalFilters}
                type="button"
                variant="outline">
                Clear All
              </Button>
              <DialogClose asChild>
                <Button
                  onClick={() => setIsClosingViaButton(true)}
                  variant="ghost">
                  Cancel
                </Button>
              </DialogClose>
            </div>
            <Button disabled={isLoading} onClick={applyAdvancedFilters}>
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                <>Apply Filters</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
