import { Button, cn } from "@lumeweb/portal-framework-ui-core";
import { LogicalFilter, useExport } from "@refinedev/core";
import { useTable } from "@refinedev/react-table";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  TableOptions,
} from "@tanstack/react-table";
import React from "react";

import type {
  AnimationConfig,
  BulkAction,
  KeyboardShortcutConfig,
  RowAction,
  RowHighlightRule,
} from "./data-table/types";
import {
  DEFAULT_ANIMATION_CONFIG,
  DEFAULT_KEYBOARD_SHORTCUTS,
} from "./data-table/types";

import {
  FilterProvider,
  useFilterState,
} from "./data-table/context/FilterContext";
import { EmptyState } from "./data-table/EmptyState";
import { FilterPanel } from "./data-table/FilterPanel";
import { useCellEditing } from "./data-table/hooks/useCellEditing";
import { useKeyboardNavigation } from "./data-table/hooks/useKeyboardNavigation";
import { useProgressiveLoading } from "./data-table/hooks/useProgressiveLoading";
import { useTableState } from "./data-table/hooks/useTableState";
import { KeyboardShortcutCheatSheet } from "./data-table/KeyboardShortcutCheatsheet";
import { TableCardView } from "./data-table/TableCardView";
import { TableCell } from "./data-table/TableCell";
import { TablePagination } from "./data-table/TablePagination";
import { TableRegularView } from "./data-table/TableRegularView";
import { TableToolbar } from "./data-table/TableToolbar";
import { TableVirtualView } from "./data-table/TableVirtualView";
import { KeyboardShortcutDialog } from "./KeyboardShortcutDialog";
import { useScreenReaderAnnouncement } from "./screen-reader/hooks/useScreenReaderAnnouncement";

/**
 * Props for the CoreTable component
 * @template TData - Type of data handled by the table
 * @template TError - Type of error handled by the table
 */
export interface CoreTableProps<TData, TError>
  extends Omit<TableOptions<TData>, "columns" | "data"> {
  /** Configuration for row/cell animations */
  animationConfig?: AnimationConfig;
  /** Bulk actions available when rows are selected */
  bulkActions?: BulkAction<TData>[];
  /** Primary column to display in card view */
  cardViewPrimaryColumn?: string;
  /** Secondary columns to display in card view */
  cardViewSecondaryColumns?: string[];
  /** Custom child elements to display in toolbar */
  children?: React.ReactNode;
  /** Column definitions for the table */
  columns: ColumnDef<TData, any>[];
  /**
   * Full dataset for table rendering
   */
  data: TData[] | undefined;
  /** Custom empty state component */
  emptyState?: React.ReactNode;
  /** Enable advanced filtering capabilities */
  enableAdvancedFilters?: boolean;
  /** Enable row/cell animations */
  enableAnimations?: boolean;
  /** Enable column-based filtering */
  enableColumnFilters?: boolean;
  /** Enable column reordering via drag-and-drop */
  enableColumnReordering?: boolean;
  /** Enable direct cell editing */
  enableDirectCellEdit?: boolean;
  /** Enable expandable row functionality */
  enableExpandableRows?: boolean;
  /** Enable data export functionality */
  enableExport?: boolean;
  /** Enable hover actions for rows */
  enableHoverActions?: boolean;
  /** Enable inline cell editing */
  enableInlineEdit?: boolean;
  /** Enable keyboard navigation */
  enableKeyboardNavigation?: boolean;
  /** Enable keyboard shortcuts */
  enableKeyboardShortcuts?: boolean;
  /** Enable mobile-responsive card view */
  enableMobileCardView?: boolean;
  /** Enable progressive loading for large datasets */
  enableProgressiveLoading?: boolean;
  /** Enable quick filter controls */
  enableQuickFilters?: boolean;
  /** Enable row highlighting based on rules */
  enableRowHighlighting?: boolean;
  /** Enable row selection */
  enableRowSelection?: boolean;
  /** Enable saved filters functionality */
  enableSavedFilters?: boolean;
  /** Enable virtual scrolling */
  enableVirtualScroll?: boolean;
  /** Current error state */
  error?: TError;
  /** Custom error state component */
  errorState?: React.ReactNode;
  /** Configuration for data export */
  exportOptions?: {
    /** Base filename for exports */
    fileName?: string;
    /** Supported export formats */
    formats?: ["csv"];
    /** Transform function for exported data */
    mapData?: (item: TData) => any;
  };
  /** Position for hover actions (start/end) */
  hoverActionsPosition?: "end" | "start";
  /** Initial column order */
  initialColumnOrder?: string[];
  /** Initial density setting */
  initialDensity?: "comfortable" | "compact" | "default";
  /** Whether the table is in error state */
  isError?: boolean;
  /** Whether the table is loading data */
  isLoading?: boolean;
  /** Custom keyboard shortcuts configuration */
  keyboardShortcuts?: Partial<KeyboardShortcutConfig>;
  /** Breakpoint width for mobile card view (in pixels) */
  mobileBreakpoint?: number;
  /** Callback for saving edited cells */
  onSaveEdit?: (
    rowId: string,
    data: Record<string, any>,
    originalData: TData,
  ) => Promise<void>;
  /**
   * Pagination layout style
   */
  paginationLayout?: "combined" | "separated";
  /** Batch size for progressive loading */
  progressiveLoadingBatchSize?: number;
  /** Scroll threshold for progressive loading */
  progressiveLoadingThreshold?: number;
  /** Query options for data fetching */
  queryOptions?: {
    /** Refetch interval in milliseconds */
    refetchInterval?:
      | ((data: any, query: any) => false | number)
      | false
      | number;
    /** Refetch in background */
    refetchIntervalInBackground?: boolean;
    /** Refetch on mount */
    refetchOnMount?: "always" | ((query: any) => "always" | boolean) | boolean;
    /** Refetch on reconnect */
    refetchOnReconnect?:
      | "always"
      | ((query: any) => "always" | boolean)
      | boolean;
    /** Refetch on window focus */
    refetchOnWindowFocus?:
      | "always"
      | ((query: any) => "always" | boolean)
      | boolean;
  };
  /** Refetch function for data updates */
  refetch?: () => Promise<any>;
  /** Render function for expanded rows */
  renderExpandedRow?: (row: TData) => React.ReactNode;
  /** Resource name for filter persistence */
  resource?: string;
  /** Row action definitions */
  rowActions?: RowAction<TData>[];
  /** Rules for row highlighting */
  rowHighlightRules?: RowHighlightRule<TData>[];
  /**
   * Sample record(s) for field type detection in filters
   * Can be a single representative object or array of objects from the dataset
   */
  sampleRecord?: TData | TData[];
  /** Show density toggle control */
  showDensityToggle?: boolean;
  /** Show keyboard shortcut cheat sheet */
  showKeyboardShortcutCheatSheet?: boolean;
  /** Show keyboard shortcut help */
  showShortcutHelp?: boolean;
  /** Total number of items for server-side pagination */
  total?: number;
  /** Estimated row size for virtual scroll */
  virtualScrollEstimateSize?: number;
  /** Height of virtual scroll container */
  virtualScrollHeight?: number;
  /** Overscan count for virtual scroll */
  virtualScrollOverscan?: number;
}

const CoreTableInner = <TData extends object, TError extends Error>(
  props: CoreTableProps<TData, TError>,
) => {
  // All the CoreTable logic goes here, including useFilterState
  const { dispatch } = useFilterState();
  const {
    animationConfig,
    bulkActions = [],
    cardViewPrimaryColumn,
    cardViewSecondaryColumns,
    children,
    columns,
    data,
    emptyState,
    enableAdvancedFilters = false,
    enableAnimations = false,
    enableColumnFilters = false,
    enableColumnReordering = false,
    enableDirectCellEdit = false,
    enableExpandableRows = false,
    enableExport = false,
    enableHoverActions = false,
    enableInlineEdit = false,
    enableKeyboardNavigation = false,
    enableKeyboardShortcuts = false,
    enableMobileCardView = false,
    enableProgressiveLoading = false,
    enableQuickFilters = false,
    enableRowHighlighting = false,
    enableRowSelection = false,
    enableSavedFilters = false,
    enableVirtualScroll = false,
    errorState,
    exportOptions,
    hoverActionsPosition = "end",
    initialColumnOrder,
    initialDensity = "default",
    isError = false,
    isLoading = false,
    keyboardShortcuts = DEFAULT_KEYBOARD_SHORTCUTS,
    mobileBreakpoint = 640,
    onSaveEdit,
    progressiveLoadingBatchSize = 100,
    progressiveLoadingThreshold = 0.8,
    queryOptions,
    refetch,
    renderExpandedRow,
    resource = "items",
    rowActions = [],
    rowHighlightRules = [],
    showDensityToggle = false,
    showKeyboardShortcutCheatSheet = false,
    showShortcutHelp = false,
    total,
    virtualScrollEstimateSize = 48,
    virtualScrollHeight = 500,
    virtualScrollOverscan = 10,
    ...rest
  } = props;

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [toolbarSelectedRows, setToolbarSelectedRows] = React.useState<TData[]>(
    [] as TData[],
  );
  const [
    showKeyboardShortcutCheatSheetState,
    setShowKeyboardShortcutCheatSheetState,
  ] = React.useState(showKeyboardShortcutCheatSheet);

  const { announce } = useScreenReaderAnnouncement();

  // Initialize export functionality
  const { isLoading: isExporting, triggerExport } = useExport({
    mapData: exportOptions?.mapData,
    maxItemCount: -1,
    meta: {
      ...exportOptions,
      fileName: `${exportOptions?.fileName || resource}-export-${new Date().toISOString().slice(0, 10)}`,
    },
    onError: (error) => {
      announce("Export failed - please try again", "assertive");
      console.error("Export error:", error);
    },
    pageSize: 20,
    resource,
  });

  // Initialize table state management
  const tableState = useTableState<any>({
    animationConfig,
    enableAnimations,
    enableKeyboardNavigation,
    enableRowHighlighting,
    initialColumnOrder,
    initialDensity,
    keyboardShortcuts,
    resource,
    rowHighlightRules,
  });

  // Create refetch wrapper with Promise interface
  const refetchWithPromise = React.useCallback(
    async (options?: any) => {
      if (!refetch) return { data: { data, total } };

      try {
        // If refetch accepts options, pass them, otherwise call without args
        if (options && typeof refetch === "function") {
          // @ts-ignore - We're handling the potential type mismatch here
          return refetch(options);
        } else {
          // Call without args
          return refetch();
        }
      } catch (error) {
        return Promise.reject(error);
      }
    },
    [refetch, data, total],
  );

  // Initialize cell editing functionality
  const cellEditing = useCellEditing<any>({
    editedValues: tableState.editedValues,
    editingCell: tableState.editingCell,
    enableDirectCellEdit,
    enableInlineEdit,
    getRowModel: () => table.getRowModel(),
    onSaveEdit,
    refetch: refetchWithPromise,
    setEditedValues: tableState.setEditedValues,
    setEditingCell: tableState.setEditingCell,
  });

  // Set up keyboard navigation handlers
  const keyboardNavigation = useKeyboardNavigation({
    cellRefs: tableState.cellRefs,
    colCount: columns.length,
    enableExpandableRows,
    enableKeyboardNavigation,
    enableRowSelection,
    enableVirtualScroll,
    expanded: tableState.expanded,
    focusedCell: tableState.focusedCell,
    getHeaderGroups: () => table.getHeaderGroups(),
    getRowModel: () => table.getRowModel(),
    rowCount: data?.length || 0,
    setExpanded: tableState.setExpanded,
    setFocusedCell: tableState.setFocusedCell,
    setVirtualScrollIndex: tableState.setVirtualScrollIndex,
    shortcuts: {
      ...DEFAULT_KEYBOARD_SHORTCUTS,
      ...keyboardShortcuts,
    },
  });

  // Configure progressive loading for large datasets
  const progressiveLoading = useProgressiveLoading<any>({
    enableProgressiveLoading,
    enableVirtualScroll,
    progressiveLoadingBatchSize,
    progressiveLoadingThreshold,
    tableQueryResult: {
      data: {
        data: data,
        total: total,
      },
      refetch: refetchWithPromise,
    },
  });

  const table = useTable({
    columns,
    refineCoreProps: {
      resource,
      filters: {
        mode: "server",
        defaultBehavior: "replace",
      },
      sorters: {
        mode: "server",
      },
      queryOptions: {
        ...queryOptions,
        enabled: !enableProgressiveLoading,
      },
    },
    getRowId: (row) => {
      if (typeof row === "object" && row !== null && "id" in row) {
        return (row as { id: string }).id;
      }
      throw new Error("Row must have an id property");
    },
  });

  React.useEffect(() => {
    if (!table.refineCore.tableQuery.isLoading) {
      setToolbarSelectedRows(
        table.getSelectedRowModel().rows.map((row) => row.original) as TData[],
      );
    }
  }, [table.refineCore.tableQuery.isLoading]);

  /**
   * Handle column filter changes and update state
   * @param {string} columnId - ID of the column being filtered
   * @param {object|null} filter - Filter configuration or null to clear
   */
  const handleApplyColumnFilter = React.useCallback(
    (
      columnId: string,
      filter: null | { field: string; operator: string; value: any },
    ) => {
      tableState.setActiveColumnFilters((prev) => {
        const newFilters = { ...prev };
        if (filter) {
          newFilters[columnId] = filter;
        } else {
          delete newFilters[columnId];
        }
        return newFilters;
      });
    },
    [tableState.setActiveColumnFilters],
  );

  /**
   * Render empty state when no data is available
   * @returns {JSX.Element} Empty state component
   */
  const renderEmptyState = React.useCallback(
    () =>
      emptyState || (
        <EmptyState
          className="py-12"
          description="Try adjusting your filters or search terms"
          title="No results found"
        />
      ),
    [emptyState],
  );

  /**
   * Get CSS classes for table cells
   * @param {any} cell - Table cell object
   * @returns {string} CSS class names
   */
  const getCellStyle = React.useCallback((cell: any) => {
    return cn(
      "p-4 align-middle [&:has([role=checkbox])]:pr-0",
      cell.column.columnDef?.meta?.className,
    );
  }, []);

  /**
   * Render cell content with proper styling and interactions
   * @param {any} cell - Table cell object
   * @param {number} rowIndex - Row index
   * @param {number} colIndex - Column index
   * @returns {JSX.Element} Cell content component
   */
  const renderCellContent = React.useCallback(
    (cell: any, rowIndex: number, colIndex: number) => {
      const rowId = cell.row.original.id;
      const columnId = cell.column.id;

      const isFocused =
        enableKeyboardNavigation &&
        tableState.focusedCell?.rowIndex === rowIndex &&
        tableState.focusedCell?.colIndex === colIndex;

      const isEditable = cell.column.columnDef.meta?.editable === true;
      const isEditing =
        enableInlineEdit &&
        enableDirectCellEdit &&
        tableState.editingCell &&
        tableState.editingCell.rowId === rowId &&
        tableState.editingCell.columnId === columnId;

      const editingValue = isEditing ? tableState.editingCell?.value : null;

      const displayValue =
        tableState.editedValues[rowId]?.[columnId] ?? cell.getValue();

      const hoverActions = enableHoverActions && rowActions.length > 0 && (
        <div className="flex items-center gap-2">
          {rowActions.map((action, index) => (
            <Button
              className={cn("h-7 w-7", action.className)}
              key={index}
              onClick={() => action.onClick(cell.row.original)}
              size="icon"
              variant="ghost">
              {action.icon}
              <span className="sr-only">{action.label}</span>
            </Button>
          ))}
        </div>
      );

      return (
        <TableCell
          cell={cell}
          cellRef={(el) => {
            if (enableKeyboardNavigation && tableState.cellRefs.current) {
              tableState.cellRefs.current[`${rowIndex}-${colIndex}`] = el;
            }
          }}
          colIndex={colIndex}
          displayValue={displayValue}
          editingValue={editingValue}
          enableHoverActions={enableHoverActions}
          enableKeyboardNavigation={enableKeyboardNavigation}
          hoverActions={hoverActions}
          hoverActionsPosition={hoverActionsPosition}
          isEditable={isEditable}
          isEditing={!!isEditing}
          isFocused={isFocused}
          onCancelEdit={cellEditing.cancelEdit}
          onDoubleClick={() =>
            cellEditing.startEditing(rowId, columnId, cell.getValue())
          }
          onEditValueChange={cellEditing.updateEditValue}
          onFocus={() => keyboardNavigation.focusCell(rowIndex, colIndex)}
          onSaveEdit={cellEditing.saveEdit}
          rowIndex={rowIndex}
        />
      );
    },
    [
      enableKeyboardNavigation,
      tableState.focusedCell,
      tableState.editingCell,
      tableState.editedValues,
      enableInlineEdit,
      enableDirectCellEdit,
      enableHoverActions,
      rowActions,
      hoverActionsPosition,
      cellEditing.cancelEdit,
      cellEditing.startEditing,
      cellEditing.updateEditValue,
      cellEditing.saveEdit,
      keyboardNavigation.focusCell,
    ],
  );

  /**
   * Handle data export in various formats
   * @param {"csv" | "excel" | "pdf"} format - Export file format
   * @returns {Promise<void>} Promise representing export operation
   */
  const handleExport = React.useCallback(
    async (format: "csv") => {
      if (!isExporting) {
        try {
          await triggerExport();
          announce(
            `Successfully exported data as ${format.toUpperCase()}`,
            "polite",
          );
        } catch (error) {
          console.error("Export error:", error);
        }
      }
    },
    [isExporting, triggerExport, announce],
  );

  const columnFiltersStateLength = React.useMemo(
    () => table.getState().columnFilters.length,
    [table],
  );

  React.useEffect(() => {
    if (columnFiltersStateLength) {
      announce("Filters applied, updating results...", "polite");
    } else {
      announce("Filters cleared, updating results...", "polite");
    }
  }, [columnFiltersStateLength, announce]);

  return (
    <div className="w-full">
      <KeyboardShortcutDialog
        onOpenChange={setShowKeyboardShortcutCheatSheetState}
        open={showKeyboardShortcutCheatSheetState}
        shortcuts={
          {
            ...DEFAULT_KEYBOARD_SHORTCUTS,
            ...keyboardShortcuts,
          } as any
        }
      />
      {(enableQuickFilters || enableAdvancedFilters || enableSavedFilters) && (
        <FilterPanel
          className="mb-4"
          enableAdvancedFilters={enableAdvancedFilters}
          enableQuickFilters={enableQuickFilters}
          enableSavedFilters={enableSavedFilters ?? false}
          isLoading={isLoading || table.refineCore.tableQuery.isLoading}
          onApplyFilters={(filters) => {
            const logicalFilters = filters.filter(
              (f): f is LogicalFilter => "field" in f,
            );
            logicalFilters.forEach((filter) => {
              dispatch({ filter, type: "ADD_FILTER" });
            });
            announce(`Applied ${logicalFilters.length} filters`, "polite");
          }}
          onClearFilters={() => {
            setColumnFilters([]);
            announce("All filters cleared", "polite");
          }}
          resource={resource}
          sampleRecord={data?.[0]}
        />
      )}

      <TableToolbar
        bulkActions={bulkActions}
        density={tableState.density}
        enableExport={enableExport}
        enableKeyboardShortcuts={enableKeyboardShortcuts}
        exportFormats={exportOptions?.formats}
        isExporting={isExporting}
        isLoading={isLoading || table.refineCore.tableQuery.isLoading}
        onClearSelection={() => {
          table.toggleAllRowsSelected(false);
          tableState.clearRowSelection();
        }}
        onDensityChange={tableState.handleDensityChange}
        onExport={handleExport}
        selectedRows={toolbarSelectedRows}
        showDensityToggle={showDensityToggle}
        showKeyboardShortcutCheatSheet={showKeyboardShortcutCheatSheetState}
        showShortcutHelp={showShortcutHelp}
        toggleShortcutHelp={() =>
          setShowKeyboardShortcutCheatSheetState(
            !showKeyboardShortcutCheatSheetState,
          )
        }>
        {children}
      </TableToolbar>

      {enableMobileCardView && window.innerWidth < mobileBreakpoint ? (
        <TableCardView
          columns={columns}
          table={table}
          enableExpandableRows={enableExpandableRows}
          enableRowSelection={enableRowSelection}
          expandedRows={tableState.expanded}
          getRowId={(row) => {
            if (typeof row === "object" && row !== null && "id" in row) {
              return (row as { id: string }).id;
            }
            throw new Error("Row must have an id property");
          }}
          getRowStyles={tableState.getRowHighlightClass}
          onRowExpansionChange={tableState.handleRowExpansionChange}
          onRowSelectionChange={tableState.handleRowSelectionChange}
          primaryColumn={cardViewPrimaryColumn}
          renderExpandedRow={renderExpandedRow}
          rowActions={rowActions}
          secondaryColumns={cardViewSecondaryColumns}
          selectedRows={tableState.rowSelection}
          isDataLoading={isLoading || table.refineCore.tableQuery.isLoading}
        />
      ) : enableVirtualScroll ? (
        <TableVirtualView
          cellRefs={tableState.cellRefs}
          emptyState={emptyState}
          enableExpandableRows={enableExpandableRows}
          enableKeyboardNavigation={enableKeyboardNavigation}
          enableRowSelection={enableRowSelection}
          errorState={errorState}
          estimateSize={virtualScrollEstimateSize}
          expanded={tableState.expanded}
          focusedCell={tableState.focusedCell}
          getCellStyle={getCellStyle}
          getHeaderGroups={() => table.getHeaderGroups()}
          getRowAnimationClass={tableState.getRowAnimationClass}
          getRowAnimationStyle={tableState.getRowAnimationStyle}
          getRowHighlightClass={tableState.getRowHighlightClass}
          getRowModel={() => table.getRowModel()}
          isDataError={isError || table.refineCore.tableQuery.isError}
          isDataLoading={isLoading || table.refineCore.tableQuery.isLoading}
          isLoadingMore={progressiveLoading.isLoadingMore}
          onScroll={progressiveLoading.handleVirtualScroll}
          overscan={virtualScrollOverscan}
          renderCellContent={renderCellContent}
          renderEmptyState={renderEmptyState}
          renderExpandedRow={renderExpandedRow}
          scrollToIndex={tableState.virtualScrollIndex}
          setFocusedCell={tableState.setFocusedCell}
          tableHeight={virtualScrollHeight}
          virtualData={progressiveLoading.progressiveData}
        />
      ) : (
        <TableRegularView
          activeColumnFilters={tableState.activeColumnFilters}
          densityStyles={tableState.getDensityStyles()}
          emptyState={emptyState}
          enableColumnFilters={enableColumnFilters}
          enableColumnReordering={enableColumnReordering}
          enableExpandableRows={enableExpandableRows}
          enableHoverActions={enableHoverActions}
          enableKeyboardNavigation={enableKeyboardNavigation}
          errorState={errorState}
          expanded={tableState.expanded}
          getCellStyle={getCellStyle}
          getRowAnimationClass={tableState.getRowAnimationClass}
          getRowAnimationStyle={tableState.getRowAnimationStyle}
          getRowHighlightClass={tableState.getRowHighlightClass}
          table={table}
          handleApplyColumnFilter={handleApplyColumnFilter}
          hoverActionsPosition={hoverActionsPosition}
          isDataError={isError || table.refineCore.tableQuery.isError}
          isDataLoading={isLoading || table.refineCore.tableQuery.isLoading}
          onColumnReorder={(draggedColumnId, targetColumnId) => {
            // Get the current column order
            const currentOrder = [...tableState.columnOrder];

            // Find the indices of the dragged and target columns
            const draggedIndex = currentOrder.indexOf(draggedColumnId);
            const targetIndex = currentOrder.indexOf(targetColumnId);

            if (draggedIndex !== -1 && targetIndex !== -1) {
              // Remove the dragged column from its current position
              const [removed] = currentOrder.splice(draggedIndex, 1);

              // Insert it at the target position
              currentOrder.splice(targetIndex, 0, removed);

              // Update the column order
              tableState.handleColumnOrderChange(currentOrder);

              // Announce the change for accessibility
              announce(
                `Column ${draggedColumnId} moved to position ${targetIndex + 1}`,
                "polite",
              );
            }
          }}
          renderCellContent={renderCellContent}
          renderEmptyState={renderEmptyState}
          renderExpandedRow={renderExpandedRow}
          renderHoverActions={({ row }) => {
            return (
              <div className="flex items-center gap-2">
                {rowActions.map((action, index) => (
                  <Button
                    className={cn("h-7 w-7", action.className)}
                    key={index}
                    onClick={() => action.onClick(row.original)}
                    size="icon"
                    variant="ghost">
                    {action.icon}
                    <span className="sr-only">{action.label}</span>
                  </Button>
                ))}
              </div>
            );
          }}
          tableColumns={columns}
        />
      )}

      <TablePagination
        enableKeyboardNavigation={enableKeyboardNavigation}
        layout={props.paginationLayout || "separated"}
        table={table}
      />

      {showKeyboardShortcutCheatSheetState && enableKeyboardShortcuts && (
        <KeyboardShortcutCheatSheet
          shortcuts={
            {
              ...DEFAULT_KEYBOARD_SHORTCUTS,
              ...keyboardShortcuts,
            } as any
          }
        />
      )}
    </div>
  );
};

/**
 * A powerful, feature-rich data table component with virtualization, filtering, sorting,
 * and accessibility support. Handles both client-side and server-side data operations.
 *
 * @template TData - Type of data handled by the table
 * @template TError - Type of error handled by the table
 *
 * @example
 * <CoreTable
 *   data={users}
 *   columns={userColumns}
 *   enableRowSelection
 *   enableSorting
 *   enableColumnFilters
 * />
 *
 * @param animationConfig
 * @param bulkActions
 * @param cardViewPrimaryColumn
 * @param cardViewSecondaryColumns
 * @param children
 * @param columns
 * @param data
 * @param emptyState
 * @param enableAdvancedFilters
 * @param enableAnimations
 * @param enableColumnFilters
 * @param enableColumnReordering
 * @param enableDirectCellEdit
 * @param enableExpandableRows
 * @param enableExport
 * @param enableHoverActions
 * @param enableInlineEdit
 * @param enableKeyboardNavigation
 * @param enableKeyboardShortcuts
 * @param enableMobileCardView
 * @param enableProgressiveLoading
 * @param enableQuickFilters
 * @param enableRowHighlighting
 * @param enableRowSelection
 * @param enableSavedFilters
 * @param enableVirtualScroll
 * @param errorState
 * @param exportOptions
 * @param hoverActionsPosition
 * @param initialColumnOrder
 * @param initialDensity
 * @param isError
 * @param isLoading
 * @param keyboardShortcuts
 * @param mobileBreakpoint
 * @param onSaveEdit
 * @param progressiveLoadingBatchSize
 * @param progressiveLoadingThreshold
 * @param refetch
 * @param renderExpandedRow
 * @param resource
 * @param rowActions
 * @param rowHighlightRules
 * @param showDensityToggle
 * @param showKeyboardShortcutCheatSheet
 * @param showShortcutHelp
 * @param total
 * @param virtualScrollEstimateSize
 * @param virtualScrollHeight
 * @param virtualScrollOverscan
 * @param {CoreTableProps<TData, TError>} props - Component configuration properties
 * @returns {JSX.Element} The rendered data table component
 */
export const CoreTable = <TData extends object, TError extends Error>(
  props: CoreTableProps<TData, TError>,
) => {
  return (
    <FilterProvider>
      <CoreTableInner {...props} />
    </FilterProvider>
  );
};

export {
  type AnimationConfig,
  type BulkAction,
  type DEFAULT_ANIMATION_CONFIG,
  type KeyboardShortcutConfig,
  type RowAction,
  type RowHighlightRule,
};
