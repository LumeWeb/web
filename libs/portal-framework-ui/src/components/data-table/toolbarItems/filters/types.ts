import { BaseRecord, type CrudOperators } from "@refinedev/core";

/**
 * Interface for select options used in filters
 */
export interface SelectOption {
  /** Display label for the option */
  label: string;
  /** Value of the option */
  value: string;
  /** Optional description for the option */
  description?: string;
}

/**
 * Enum defining CRUD operators for filter components
 */
export enum FilterOperator {
  CONTAINS = "contains",
  EQ = "eq",
  NE = "ne",
  LT = "lt",
  GT = "gt",
  LTE = "lte",
  GTE = "gte",
  IN = "in",
  NIN = "nin",
  STARTS_WITH = "startswith",
  ENDS_WITH = "endswith",
  BETWEEN = "between",
  NOT_CONTAINS = "notcontains",
  NULL = "null",
  NOT_NULL = "notnull",
}

/**
 * Type for logical operators that can be used in LogicalFilter
 * Excludes "or" and "and" operators which are used for LogicalFilter composition
 */
export type LogicalFilterOperator = Exclude<CrudOperators, "or" | "and">;

/**
 * Enum defining common filter types used in data tables
 */
export enum FilterType {
  /** Text input filter */
  TEXT = "text",
  /** Single select dropdown filter */
  SELECT = "select",
  /** Multi-select dropdown filter */
  MULTI_SELECT = "multi-select",
  /** Number input filter */
  NUMBER = "number",
  /** Date picker filter */
  DATE = "date",
  /** Date range picker filter */
  DATE_RANGE = "date-range",
  /** Boolean toggle filter */
  BOOLEAN = "boolean",
  /** Numeric range slider filter */
  RANGE = "range",
  /** Search input filter */
  SEARCH = "search",
}

/**
 * Configuration interface for defining filter behavior
 */
export interface FilterConfig<TData extends BaseRecord = BaseRecord> {
  /** Unique identifier for the filter */
  id: string;
  /** Type of filter to render */
  type: FilterType;
  /** Label for the filter */
  label: string;
  /** Field name in the data model to filter on */
  field: keyof TData;
  /** CRUD operator to use for this filter */
  operator: LogicalFilterOperator;
  /** Initial value for the filter */
  initialValue?: any;
  /** Placeholder text for input filters */
  placeholder?: string;
  /** Options for select filters */
  options?: SelectOption[];
  /** Minimum value for number/range filters */
  min?: number;
  /** Maximum value for number/range filters */
  max?: number;
  /** Step value for number inputs */
  step?: number;
  /** Whether the filter is disabled */
  disabled?: boolean;
  /** Custom class name for the filter component */
  className?: string;
  /** Placeholder for min value in range filters */
  minPlaceholder?: string;
  /** Placeholder for max value in range filters */
  maxPlaceholder?: string;
  /** Whether to use dropdown style expansion instead of inline */
  dropdownStyle?: boolean;
  /** Custom props for the filter component */
  customProps?: Record<string, any>;
  /** Whether to include an "all" option that clears the filter */
  includeAllOption?: boolean;
}

/**
 * Props interface for filter components
 */
export interface FilterComponentProps<TData extends BaseRecord = BaseRecord> {
  /** Current value of the filter */
  value: any;
  /** Handler to update the filter value */
  onChange: (value: any) => void;
  /** Filter configuration */
  config: FilterConfig<TData>;
  /** Table contexts with filter management helpers */
  context?: {
    /** Set table filters */
    setFilters?: (filters: any[]) => void;
    /** Set table sorters */
    setSorters?: (sorters: any[]) => void;
    /** Current filters state */
    filters?: any[];
    /** Current sorters state */
    sorters?: any[];
  };
}

/**
 * Base props interface for filter components that consolidates configuration
 */
export interface BaseFilterComponentProps<TData extends BaseRecord = BaseRecord>
  extends Omit<FilterComponentProps<TData>, "config"> {
  /** Filter configuration - required for unified configuration system */
  config: FilterConfig<TData>;
  /** Label from the filter item (not config) */
  itemLabel?: string;
}

export enum ActionType {
  REFRESH = "refresh",
  EXPORT = "export",
  CREATE = "create",
  DELETE = "delete",
  CUSTOM = "custom",
}
