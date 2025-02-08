import React, { useCallback, useEffect, useRef, useState } from "react";

import type {
  AnimationConfig,
  KeyboardShortcutConfig,
  RowHighlightRule,
} from "../types";

import { DEFAULT_ANIMATION_CONFIG, DEFAULT_KEYBOARD_SHORTCUTS } from "../types";

export interface TableStateOptions<TData> {
  animationConfig?: AnimationConfig;
  colCount?: number;
  enableAnimations?: boolean;
  enableKeyboardNavigation?: boolean;
  enableRowHighlighting?: boolean;
  initialColumnOrder?: string[];
  initialDensity?: "comfortable" | "compact" | "default";
  keyboardShortcuts?: Partial<KeyboardShortcutConfig>;
  resource?: string;
  rowCount?: number;
  rowHighlightRules?: RowHighlightRule<TData>[];
}

export function useTableState<TData>({
  animationConfig,
  colCount = 0,
  enableAnimations = false,
  enableKeyboardNavigation = false,
  enableRowHighlighting = false,
  initialColumnOrder,
  initialDensity = "default",
  keyboardShortcuts = {},
  resource = "items",
  rowCount = 0,
  rowHighlightRules = [],
}: TableStateOptions<TData>) {
  // Density state
  const [density, setDensity] = useState(initialDensity);

  // Row expansion state
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Column order state
  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    // First priority: use initialColumnOrder if provided
    if (initialColumnOrder && initialColumnOrder.length > 0) {
      return initialColumnOrder;
    }

    // Second priority: use saved order from localStorage if available
    const savedOrder =
      typeof window !== "undefined"
        ? localStorage.getItem(`tableColumnOrder-${resource}`)
        : null;

    if (savedOrder) {
      try {
        return JSON.parse(savedOrder);
      } catch (e) {
        console.error("Error parsing saved column order:", e);
        return [];
      }
    }

    return [];
  });

  // Animation states
  const [rowAnimationClasses, setRowAnimationClasses] = useState<Record<string, string>>({});

  const [rowAnimationStyles, setRowAnimationStyles] = useState<Record<string, React.CSSProperties>>({});

  // Column filters state
  const [activeColumnFilters, setActiveColumnFilters] = useState<Record<string, { field: string; operator: string; value: any }>>({});

  // Virtual scroll state
  const [virtualScrollIndex, setVirtualScrollIndex] = useState<
    number | undefined
  >(undefined);

  // Row selection state
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // Progressive loading state
  const [progressiveData, setProgressiveData] = useState<TData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Keyboard navigation state
  const [focusedCell, setFocusedCell] = useState<null | {
    colIndex: number;
    rowIndex: number;
  }>(enableKeyboardNavigation ? { colIndex: 0, rowIndex: 0 } : null);
  const cellRefs = useRef<Record<string, HTMLTableCellElement | null>>({});

  // Keyboard shortcuts state
  const mergedKeyboardShortcuts = useRef<KeyboardShortcutConfig>({
    ...DEFAULT_KEYBOARD_SHORTCUTS,
    ...keyboardShortcuts,
  });

  // Editing state
  const [editingCell, setEditingCell] = useState<null | {
    columnId: string;
    rowId: string;
    value: any;
  }>(null);

  const [editedValues, setEditedValues] = useState<
    Record<string, Record<string, any>>
  >({});

  // Previous data reference for animation
  const previousDataRef = useRef<TData[]>([]);

  // Function to detect changes and apply animations
  const applyAnimations = useCallback(
    (newData: TData[]) => {
      if (!enableAnimations || !animationConfig) return;

      const prevData = previousDataRef.current;
      const config = { ...DEFAULT_ANIMATION_CONFIG, ...animationConfig };

      // Skip if this is the first data load
      if (prevData.length === 0) {
        previousDataRef.current = [...newData];
        return;
      }

      // Create a map of previous data by ID for quick lookup
      const prevDataMap = new Map<string, TData>();
      prevData.forEach((item) => {
        const id = (item as any).id || JSON.stringify(item);
        prevDataMap.set(id, item);
      });

      // Track new and updated rows
      const newRowIds: string[] = [];
      const updatedRowIds: string[] = [];
      const updatedCellsMap: Record<string, string[]> = {};

      // Detect new and updated rows
      newData.forEach((item) => {
        const id = (item as any).id || JSON.stringify(item);

        if (!prevDataMap.has(id)) {
          // New row
          if (config.newRow) {
            newRowIds.push(id);
          }
        } else {
          // Existing row - check for updates
          const prevItem = prevDataMap.get(id);
          const hasChanged = JSON.stringify(item) !== JSON.stringify(prevItem);

          if (hasChanged && config.updatedRow) {
            updatedRowIds.push(id);

            // If cell-level animations are enabled, detect which cells changed
            if (config.updatedCell) {
              const changedCells: string[] = [];

              // Compare each property
              Object.keys(item as object).forEach((key) => {
                if ((item as any)[key] !== (prevItem as any)[key]) {
                  changedCells.push(key);
                }
              });

              if (changedCells.length > 0) {
                updatedCellsMap[id] = changedCells;
              }
            }
          }
        }
      });

      // Apply animation classes and styles
      const newRowAnimations: Record<string, string> = {};
      const updatedRowAnimations: Record<string, string> = {};

      // New row animations
      newRowIds.forEach((id) => {
        newRowAnimations[id] = "animate-fade-in";
      });

      // Updated row animations
      updatedRowIds.forEach((id) => {
        updatedRowAnimations[id] = "animate-highlight";
      });

      // Apply animations
      setRowAnimationClasses({
        ...newRowAnimations,
        ...updatedRowAnimations,
      });

      // Apply styles with the highlight color
      const highlightStyles: Record<string, React.CSSProperties> = {};
      updatedRowIds.forEach((id) => {
        highlightStyles[id] = {
          backgroundColor: config.highlightColor,
          transition: `background-color ${config.duration}ms ease-out`,
        };
      });

      setRowAnimationStyles(highlightStyles);

      // Clear animations after duration
      setTimeout(() => {
        setRowAnimationClasses({});
        setRowAnimationStyles({});
      }, config.duration);

      // Update the reference
      previousDataRef.current = [...newData];
    },
    [enableAnimations, animationConfig],
  );

  // Helper functions for row styling
  const getRowHighlightClass = useCallback(
    (row: any) => {
      if (!enableRowHighlighting) return "";

      // Sort rules by priority descending and find the first match
      const matchingRule = rowHighlightRules
        .sort((a, b) => b.priority - a.priority)
        .find((rule) => rule.condition(row.original));

      // Return the class name of the highest priority matching rule, or empty string if none
      return matchingRule ? matchingRule.className : "";
    },
    [enableRowHighlighting, rowHighlightRules],
  );

  const getRowAnimationClass = useCallback(
    (rowId: string) => {
      return rowAnimationClasses[rowId] || "";
    },
    [rowAnimationClasses],
  );

  const getRowAnimationStyle = useCallback(
    (rowId: string) => {
      return rowAnimationStyles[rowId] || {};
    },
    [rowAnimationStyles],
  );

  // Handle column order change
  const handleColumnOrderChange = useCallback(
    (newOrder: string[]) => {
      setColumnOrder(newOrder);

      // Save to localStorage with resource-specific key
      if (typeof window !== "undefined") {
        localStorage.setItem(
          `tableColumnOrder-${resource}`,
          JSON.stringify(newOrder),
        );
      }
    },
    [resource],
  );

  // Handle row selection change
  const handleRowSelectionChange = useCallback(
    (rowId: string, selected: boolean) => {
      setRowSelection((prev) => ({
        ...prev,
        [rowId]: selected,
      }));
    },
    [],
  );

  // Handle row expansion change
  const handleRowExpansionChange = useCallback(
    (rowId: string, expanded: boolean) => {
      setExpanded((prev) => ({
        ...prev,
        [rowId]: expanded,
      }));
    },
    [],
  );

  // Clear row selection
  const clearRowSelection = useCallback(() => {
    setRowSelection({});
  }, []);

  // Handle density change
  const handleDensityChange = useCallback(
    (newDensity: "comfortable" | "compact" | "default") => {
      setDensity(newDensity);
    },
    [],
  );

  // Get density styles
  const getDensityStyles = useCallback(() => {
    return {
      row:
        density === "comfortable"
          ? "py-3"
          : density === "compact"
            ? "py-2"
            : "py-4",
    };
  }, [density]);

  // Initialize keyboard navigation focused cell state
  useEffect(() => {
    if (!enableKeyboardNavigation) {
      setFocusedCell(null);
    } else if (focusedCell === null) {
      // Set initial focus to first cell when keyboard navigation is enabled
      setFocusedCell({ colIndex: 0, rowIndex: 0 });
    }
  }, [enableKeyboardNavigation, focusedCell, setFocusedCell]);


  return {
    activeColumnFilters,
    // Helper functions
    applyAnimations,
    cellRefs,
    clearRowSelection,
    columnOrder,
    currentPage,
    // States
    density,
    editedValues,
    editingCell,
    expanded,
    focusedCell,
    getDensityStyles,
    getRowAnimationClass,
    getRowAnimationStyle,
    getRowHighlightClass,
    handleColumnOrderChange,
    handleDensityChange,

    handleRowExpansionChange,
    handleRowSelectionChange,
    hasMoreData,
    isLoadingMore,
    keyboardShortcuts: mergedKeyboardShortcuts.current,
    progressiveData,
    rowAnimationClasses,
    rowAnimationStyles,
    rowSelection,
    setActiveColumnFilters,
    setColumnOrder,
    setCurrentPage,

    // Setters
    setDensity,
    setEditedValues,
    setEditingCell,
    setExpanded,
    setFocusedCell,
    setHasMoreData,
    setIsLoadingMore,
    setProgressiveData,
    setRowSelection,
    setVirtualScrollIndex,
    virtualScrollIndex,
  };
}
