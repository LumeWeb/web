import {
  useTableReturnType,
  type BaseRecord,
  type CrudFilter,
  type CrudSorting,
  type useTableProps as useTablePropsCore,
} from "@refinedev/core";
import { Table } from "@tanstack/react-table";
import { UseTableReturnType } from "@refinedev/react-table";

import type { BaseTableProps } from "./BaseTable";

import { TableActionItem } from "./TableAction";
import { TableActionMenuItem } from "./TableActionMenu";
import { FilterConfig, LogicalFilterOperator } from "./toolbarItems/filters/types";

// Base toolbar item interface
export interface BaseToolbarItem {
  /** Unique identifier for the toolbar item */
  id: string;
  /** Type of the toolbar item */
  type: ToolbarItemType;
  /** Optional order for positioning items in toolbar */
  order?: number;
}

// Toolbar item types
export enum ToolbarItemType {
  ACTION = "action",
  FILTER = "filter",
  SEPARATOR = "separator",
  CUSTOM = "custom",
  FILTER_GROUP = "filter-group",
}

// Refine contexts for toolbar items
export interface ToolbarRefineContext<TData extends BaseRecord> {
  /** The Refine table instance */
  tableInstance: useTableReturnType<TData, any>;
  /** Function to refetch data */
  refetch: () => void;
  /** Whether data is currently being fetched */
  isLoading: boolean;
  /** Any errors from data fetching */
  error?: any;
}

// Table contexts for enhanced functionality
export interface TableContext<TData> {
  /** Set table filters */
  setFilters?: (filters: CrudFilter[]) => void;
  /** Set table sorters */
  setSorters?: (sorters: CrudSorting) => void;
  /** Refine table query object */
  tableQuery?: any;
  /** Current filters state */
  filters?: CrudFilter[];
  /** Current sorters state */
  sorters?: CrudSorting;
}

// Base props for all toolbar item components
export interface ToolbarItemComponentProps<TData extends BaseRecord> {
  /** The table instance */
  table: Table<TData>;
  /** Current value of the item (for filters) */
  value?: any;
  /** Handler to update the item value (for filters) */
  onChange?: (value: any) => void;
  /** Optional Refine table contexts - only available when using DataTable with Refine */
  refineContext?: ToolbarRefineContext<TData>;
  /** Enhanced table contexts with filter management helpers */
  context?: TableContext<TData>;
}

// Action item types for toolbar buttons
export interface ToolbarActionItem<TData extends BaseRecord = any>
  extends BaseToolbarItem {
  type: ToolbarItemType.ACTION;
  /** Label for the action button */
  label: string;
  /** Icon for the action button */
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode;
  /** Click handler for the action */
  onClick: (props: ToolbarItemComponentProps<TData>) => void;
  /** Whether the action is disabled */
  disabled?: boolean;
  /** Tooltip text for the action */
  tooltip?: string;
  /** Variant style for the button */
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  /** Size of the button */
  size?: "default" | "sm" | "lg" | "icon";
  /** Class name for the button */
  className?: string;
}

// Filter item types
export interface ToolbarFilterItem<TData extends BaseRecord>
  extends BaseToolbarItem {
  type: ToolbarItemType.FILTER;
  /** Label for the filter */
  label: string;
  /** Field name in the data model to filter on - defaults to id if not provided */
  field?: keyof TData;
  /** The filter component to render - either direct component or registered type string */
  component?: React.ComponentType<ToolbarItemComponentProps<TData>> | string;
  /** Initial value for the filter */
  initialValue?: any;
  /** Filter-specific configuration - now required and contains all necessary properties */
  config: FilterConfig<TData>;
}

// Separator item type
export interface ToolbarSeparatorItem extends BaseToolbarItem {
  type: ToolbarItemType.SEPARATOR;
}

// Custom item type
export interface ToolbarCustomItem<TData extends BaseRecord = any>
  extends BaseToolbarItem {
  type: ToolbarItemType.CUSTOM;
  /** The custom component to render */
  component: React.ComponentType<ToolbarItemComponentProps<TData>>;
}

// Filter group item type
export interface ToolbarFilterGroupItem<TData extends BaseRecord = any>
  extends BaseToolbarItem {
  type: ToolbarItemType.FILTER_GROUP;
  /** Label for the filter group */
  label: string;
  /** Icon for the filter group (defaults to Filter icon) */
  icon?: React.ReactNode;
  /** Filter items contained within this group */
  items: ToolbarFilterItem<TData>[];
  /** Whether the group is initially expanded */
  initiallyExpanded?: boolean;
  /** Layout direction for filter items */
  layout?: "horizontal" | "vertical";
  /** Optional custom class name for the group container */
  className?: string;
  /** Whether to use dropdown style expansion instead of inline */
  dropdownStyle?: boolean;
}

// Union type for all toolbar items
export type ToolbarItem<TData extends BaseRecord> =
  | ToolbarActionItem<TData>
  | ToolbarFilterItem<TData>
  | ToolbarSeparatorItem
  | ToolbarCustomItem<TData>
  | ToolbarFilterGroupItem<TData>;

// Props for filter components (extends base interface)
export interface ToolbarFilterComponentProps<TData extends BaseRecord>
  extends ToolbarItemComponentProps<TData> {
  /** Column information if the filter is tied to a specific column */
  column?: keyof TData;
  /** Filter configuration */
  config?: FilterConfig<TData>;
  /** Label from the filter item (not config) */
  itemLabel?: string;
  /** Function to get available operators for a field */
  getAvailableOperators?: (field?: string) => LogicalFilterOperator[];
}

// Toolbar configuration types
export interface ToolbarConfig<TData extends BaseRecord> {
  /** Items to display in the toolbar */
  items: ToolbarItem<TData>[];
  /** Whether the toolbar should be sticky */
  sticky?: boolean;
  /** Custom class name for the toolbar container */
  className?: string;
}

export interface DataTableActionMenuProps<TData> {
  actionItems?: TableActionItem<TData>[];
  items: TableActionMenuItem<TData>[];
  label?: string;
}

export interface DataTableProps<
  TData extends BaseRecord = BaseRecord,
  TError = unknown,
  TSearchVariables = unknown,
> extends Omit<
    BaseTableProps<TData>,
    "actionColumn" | "data" | "tableOptions"
  > {
  /**
   * Configuration for action menu items
   */
  actionMenu?: DataTableActionMenuProps<TData>;
  /**
   * Configuration for toolbar items
   */
  toolbar?: ToolbarConfig<TData>;
  /**
   * The dataProvider name if not using the default one
   * @default "default"
   */
  dataProviderName?: string;
  /**
   * Configuration options for refine's useTable hook
   */
  refineCoreProps?: Omit<
    useTablePropsCore<TData, TError, TSearchVariables>,
    "columns" | "dataProviderName" | "resource"
  >;
  /**
   * The resource name for API data interactions
   * @example "posts", "users", "products"
   */
  resource: string;
  /**
   * Interval (in milliseconds) for automatic data refetching
   * This value gets passed to React Query through refineCoreProps
   */
  refetchInterval?: number;
}
