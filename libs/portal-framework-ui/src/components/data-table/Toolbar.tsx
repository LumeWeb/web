import React, { useCallback } from "react";
import { cn } from "@lumeweb/portal-framework-ui-core";
import { Table } from "@tanstack/react-table";
import { ComponentSize } from "@/components";

import type {
  TableContext,
  ToolbarItem,
  ToolbarItemComponentProps,
} from "./DataTable.types";
import { ToolbarItemAlignment, ToolbarItemType } from "./DataTable.types";
import { BaseRecord } from "@refinedev/core";
import { ToolbarRenderer } from "./ToolbarRenderer";
import { useFilterHelpers, useRefineTable, useTableConfig } from "./contexts";
import { createFilterOnChangeHandler, FilterOperator } from "./toolbarItems";
import { useMobileDetection } from "./useMobileDetection";

interface ToolbarProps<TData extends BaseRecord> {
  /** The table instance */
  table: Table<TData>;
  /** Additional class name for the toolbar container */
  className?: string;
}

function MobileToolbarLayout<TData extends BaseRecord>({
  table,
  className,
  config,
  refineContext,
  sortedItems,
  createCommonProps,
}: {
  table: Table<TData>;
  className?: string;
  config: any;
  refineContext: any;
  sortedItems: ToolbarItem<TData>[];
  createCommonProps: (
    item: ToolbarItem<TData>,
  ) => ToolbarItemComponentProps<TData>;
}) {
  const containerClassName = cn(
    "flex flex-col gap-3 p-3 border-b bg-background",
    config.sticky && "sticky top-0 z-10",
    className,
  );

  // Helper functions to determine item alignment (defined at component level, not inside hooks)
  const getItemAlignment = (item: ToolbarItem<TData>): ToolbarItemAlignment => {
    // If item has explicit alignment, use it
    if (item.alignment) {
      return item.alignment;
    }

    // Otherwise use the default alignment from config
    return config.defaultAlignment || ToolbarItemAlignment.LEFT;
  };

  const isLeftAligned = (item: ToolbarItem<TData>): boolean => {
    return getItemAlignment(item) === ToolbarItemAlignment.LEFT;
  };

  const isRightAligned = (item: ToolbarItem<TData>): boolean => {
    return getItemAlignment(item) === ToolbarItemAlignment.RIGHT;
  };

  const isCenterAligned = (item: ToolbarItem<TData>): boolean => {
    return getItemAlignment(item) === ToolbarItemAlignment.CENTER;
  };

  // Group items by alignment for mobile
  const leftItems = sortedItems.filter(isLeftAligned);
  const centerItems = sortedItems.filter(isCenterAligned);
  const rightItems = sortedItems.filter(isRightAligned);

  return (
    <div className={containerClassName}>
      {leftItems.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {leftItems.map((item) => {
            const commonProps = createCommonProps(item);
            return (
              <ToolbarRenderer
                key={item.id}
                item={item}
                commonProps={commonProps}
              />
            );
          })}
        </div>
      )}

      {centerItems.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2">
          {centerItems.map((item) => {
            const commonProps = createCommonProps(item);
            return (
              <ToolbarRenderer
                key={item.id}
                item={item}
                commonProps={commonProps}
              />
            );
          })}
        </div>
      )}

      {rightItems.length > 0 && (
        <div className="flex flex-wrap justify-end gap-2">
          {rightItems.map((item) => {
            const commonProps = createCommonProps(item);
            return (
              <ToolbarRenderer
                key={item.id}
                item={item}
                commonProps={commonProps}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function DesktopToolbarLayout<TData extends BaseRecord>({
  table,
  className,
  config,
  refineContext,
  sortedItems,
  createCommonProps,
}: {
  table: Table<TData>;
  className?: string;
  config: any;
  refineContext: any;
  sortedItems: ToolbarItem<TData>[];
  createCommonProps: (
    item: ToolbarItem<TData>,
  ) => ToolbarItemComponentProps<TData>;
}) {
  // Helper functions to determine item alignment (defined at component level, not inside hooks)
  const getItemAlignment = (item: ToolbarItem<TData>): ToolbarItemAlignment => {
    // If item has explicit alignment, use it
    if (item.alignment) {
      return item.alignment;
    }

    // Otherwise use the default alignment from config
    return config.defaultAlignment || ToolbarItemAlignment.LEFT;
  };

  const isRightAligned = (item: ToolbarItem<TData>): boolean => {
    return getItemAlignment(item) === ToolbarItemAlignment.RIGHT;
  };

  const isCenterAligned = (item: ToolbarItem<TData>): boolean => {
    return getItemAlignment(item) === ToolbarItemAlignment.CENTER;
  };

  const containerClassName = cn(
    "flex flex-wrap items-center gap-2 p-4 border-b bg-background",
    config.justifyBetween ? "justify-between" : undefined,
    config.sticky && "sticky top-0 z-10",
    className,
  );

  return (
    <div className={containerClassName}>
      {sortedItems.map((item) => {
        const commonProps = createCommonProps(item);

        // Add appropriate positioning classes based on alignment
        const itemClassName = cn(
          isRightAligned(item) && "ml-auto",
          isCenterAligned(item) && "mx-auto",
        );

        return (
          <ToolbarRenderer
            key={item.id}
            item={item}
            commonProps={commonProps}
            className={itemClassName}
          />
        );
      })}
    </div>
  );
}

function Toolbar<TData extends BaseRecord>({
  table,
  className,
}: ToolbarProps<TData>) {
  const { setFilters, setSorters, tableQuery, filters, sorters } = useRefineTable<TData>();
  const { toolbarConfig: config, refineContext } = useTableConfig<TData>();
  const { getDefaultFilter, getDefaultOperator } = useFilterHelpers<TData>();

  // Validate mobileBreakpoint value
  const mobileBreakpoint = React.useMemo(() => {
    const breakpoint = config?.mobileBreakpoint;
    const validTokens = ["xs", "sm", "md", "lg", "xl", "2xl"];

    // If it's a valid Tailwind token, use it as-is
    if (typeof breakpoint === "string" && validTokens.includes(breakpoint)) {
      return breakpoint;
    }

    // If it's a numeric string or number, parse it and use the numeric value
    if (typeof breakpoint === "string" && /^\d+$/.test(breakpoint)) {
      const parsed = parseInt(breakpoint, 10);
      if (parsed > 0) {
        return parsed;
      }
    }

    if (typeof breakpoint === "number" && breakpoint > 0) {
      return breakpoint;
    }

    // For any other value, fall back to ComponentSize.SM
    return ComponentSize.SM;
  }, [config?.mobileBreakpoint]);

  // Mobile detection with proper breakpoint
  const { isMobile } = useMobileDetection({
    mobileBreakpoint: mobileBreakpoint,
  });



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

        // Only use initialValue for item types that support it
        const initialValue =
          "initialValue" in item ? item.initialValue : undefined;
        baseProps.value = existingValue ?? initialValue;
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

  // For mobile, we want a more vertical layout with appropriate spacing
  if (isMobile) {
    return (
      <MobileToolbarLayout
        table={table}
        className={className}
        config={config}
        refineContext={refineContext}
        sortedItems={sortedItems}
        createCommonProps={createCommonProps}
      />
    );
  }

  // Desktop layout
  return (
    <DesktopToolbarLayout
      table={table}
      className={className}
      config={config}
      refineContext={refineContext}
      sortedItems={sortedItems}
      createCommonProps={createCommonProps}
    />
  );
}

export { Toolbar };
