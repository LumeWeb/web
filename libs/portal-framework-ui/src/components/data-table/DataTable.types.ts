import {
  type BaseRecord,
  type useTableProps as useTablePropsCore,
} from "@refinedev/core";

import type { BaseTableProps } from "./BaseTable";

import { TableActionItem } from "./TableAction";
import { TableActionMenuItem } from "./TableActionMenu";

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
}
