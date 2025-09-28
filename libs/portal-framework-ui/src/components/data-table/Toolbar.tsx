import React, { useCallback } from "react";
import { cn } from "@lumeweb/portal-framework-ui-core";
import { Table } from "@tanstack/react-table";

import type {
  TableContext,
  ToolbarItem,
  ToolbarItemComponentProps,
} from "./DataTable.types";
import { ToolbarItemType } from "./DataTable.types";
import { BaseRecord } from "@refinedev/core";
import { ToolbarRenderer } from "./ToolbarRenderer";
import { useFilterHelpers, useRefineTable, useTableConfig } from "./contexts";
import { createFilterOnChangeHandler, FilterOperator } from "./toolbarItems";

interface ToolbarProps<TData extends BaseRecord> {
  /** The table instance */
  table: Table<TData>;
  /** Additional class name for the toolbar container */
  className?: string;
}

function Toolbar<TData extends BaseRecord>({
  table,
  className,
}: ToolbarProps<TData>) {
  const { refineTable } = useRefineTable<TData>();
  const { toolbarConfig: config, refineContext } = useTableConfig<TData>();
  const { getDefaultFilter, getDefaultOperator } = useFilterHelpers<TData>();

  // Access the rest of the properties from refineTable
  const { setFilters, setSorters, tableQuery, filters, sorters } =
    refineTable || {};

  // Sort items by order if specified (compute regardless of config presence)
  const sortedItems = React.useMemo(() => {
    if (!config) {
      return [];
    }
    return [...config.items].sort((a, b) => {
      const orderA = a.order ?? 0;
      const orderB = b.order ?? 0;
      return orderA - orderB;
    });
  }, [config?.items]);

  // Create stable onChange handler using refs (compute regardless of config presence)
  const onChangeHandler = useCallback(
    (item: ToolbarItem<TData>) => {
      return createFilterOnChangeHandler(
        item,
        (filters) => {
          if (setFilters) {
            setFilters(filters);
          }
        },
        getDefaultOperator,
        { itemId: item.id },
      );
    },
    [setFilters, getDefaultOperator],
  );

  // Create common props for all toolbar items (compute regardless of config presence)
  const createCommonProps = useCallback(
    (item: ToolbarItem<TData>): ToolbarItemComponentProps<TData> => {
      const context: TableContext<TData> = {
        setFilters,
        setSorters,
        tableQuery,
        filters,
        sorters,
      } as TableContext<TData>;

      const baseProps: ToolbarItemComponentProps<TData> = {
        table,
        refineContext,
        context,
      };

      // Add filter-specific props
      if (
        [ToolbarItemType.FILTER, ToolbarItemType.FILTER_GROUP].includes(
          item.type,
        )
      ) {
        // Get the operator to use - either from config or default based on field type
        const operator =
          (item as any).config?.operator ||
          ((item as any).config?.type
            ? getDefaultOperator?.((item as any).config.type)
            : FilterOperator.EQ);

        // Use the table contexts's getDefaultFilter function to get existing filter value
        const existingValue = getDefaultFilter?.(
          (item as any).config?.field as string,
          operator,
        );

        baseProps.value = existingValue ?? item.initialValue;
        baseProps.onChange = onChangeHandler(item);
      }

      return baseProps;
    },
    [
      table,
      refineContext,
      setFilters,
      getDefaultFilter,
      getDefaultOperator,
      setSorters,
      tableQuery,
      filters,
      sorters,
      onChangeHandler,
    ],
  );

  // If no toolbar config is provided through contexts, don't render anything
  if (!config) {
    return null;
  }

  const containerClassName = cn(
    "flex flex-wrap items-center gap-2 p-4 border-b bg-background",
    config.sticky && "sticky top-0 z-10",
    className,
  );

  return (
    <div className={containerClassName}>
      {sortedItems.map((item) => {
        const commonProps = createCommonProps(item);

        return (
          <ToolbarRenderer
            key={item.id}
            item={item}
            commonProps={commonProps}
            className={
              item.type === ToolbarItemType.SEPARATOR ? "mx-1" : undefined
            }
          />
        );
      })}
    </div>
  );
}

export { Toolbar };
