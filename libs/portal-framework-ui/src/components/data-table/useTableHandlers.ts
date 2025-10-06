import { Cell, Row } from "@tanstack/react-table";
import { cn } from "@lumeweb/portal-framework-ui-core";
import { BaseRecord } from "@refinedev/core";
import React from "react";

interface UseTableRowHandlersProps<TData extends BaseRecord> {
  onRowClick?: (row: Row<TData>) => void;
  getRowProps?: (row: Row<TData>) => React.HTMLAttributes<HTMLTableRowElement>;
}

interface UseTableCellHandlersProps<TData extends BaseRecord> {
  getCellProps?: (cell: Cell<TData, unknown>) => React.HTMLAttributes<HTMLTableCellElement>;
}

interface UseMobileColumnHidingProps {
  responsive?: boolean;
  hideColumnsOnMobile?: string[];
  columnId: string;
}

/**
 * Type for the header cell handler function
 */
type HeaderCellHandler = (header: { column: { columnDef: { meta?: { headerClassName?: string } } } }) => React.HTMLAttributes<HTMLTableCellElement>;

/**
 * Hook to generate row props with click handling and accessibility
 */
export function useTableRowHandlers<TData extends BaseRecord>({
  onRowClick,
  getRowProps,
}: UseTableRowHandlersProps<TData>): (row: Row<TData>) => React.HTMLAttributes<HTMLTableRowElement> {
  return React.useCallback((row: Row<TData>) => {
    const baseProps = getRowProps?.(row) || {};
    
    if (!onRowClick) {
      return baseProps;
    }

    return {
      ...baseProps,
      onClick: () => onRowClick(row),
      tabIndex: 0,
      role: "button" as const,
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          if (e.key === " ") {
            e.preventDefault();
          }
          onRowClick(row);
        }
      },
      className: cn(
        "cursor-pointer hover:bg-muted",
        baseProps.className,
      ),
    };
  }, [onRowClick, getRowProps]);
}

/**
 * Hook to generate cell props with meta class names
 */
export function useTableCellHandlers<TData extends BaseRecord>({
  getCellProps,
}: UseTableCellHandlersProps<TData>): (cell: Cell<TData, unknown>) => React.HTMLAttributes<HTMLTableCellElement> {
  return (cell: Cell<TData, unknown>) => {
    const baseProps = getCellProps?.(cell) || {};
    
    return {
      ...baseProps,
      className: cn(
        cell.column.columnDef.meta?.cellClassName as string,
        baseProps.className,
      ),
    };
  };
}

/**
 * Hook to determine if a column should be hidden on mobile
 */
export function useMobileColumnHiding({
  responsive = false,
  hideColumnsOnMobile = [],
  columnId,
}: UseMobileColumnHidingProps) {
  return responsive && hideColumnsOnMobile.includes(columnId);
}

/**
 * Hook to generate header cell props with meta class names
 */
export function useTableHeaderCellHandlers(): HeaderCellHandler {
  return (header) => {
    return {
      className: cn(
        header.column.columnDef.meta?.headerClassName as string,
      ),
    };
  };
}
