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
  responsive?: boolean | { hideOnMobile?: boolean };
  hideColumnsOnMobile?: string[];
  columnIds: string[];
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
 * Hook to determine which columns should be hidden on mobile
 */
export function useMobileColumnHiding({
  responsive = false,
  hideColumnsOnMobile = [],
  columnIds,
}: Omit<UseMobileColumnHidingProps, 'columnId'> & { columnIds: string[] }): Set<string> {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    if (!responsive) return;
    
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    setIsMobile(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, [responsive]);

  if (!responsive) {
    return new Set();
  }

  const hiddenColumns = new Set<string>();
  
  if (isMobile) {
    if (typeof responsive === 'boolean') {
      // If responsive is true, hide all columns in hideColumnsOnMobile
      hideColumnsOnMobile.forEach(id => hiddenColumns.add(id));
    } else {
      // If responsive is an object with hideOnMobile property
      if (responsive.hideOnMobile) {
        hideColumnsOnMobile.forEach(id => hiddenColumns.add(id));
      }
    }
  }

  return hiddenColumns;
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
