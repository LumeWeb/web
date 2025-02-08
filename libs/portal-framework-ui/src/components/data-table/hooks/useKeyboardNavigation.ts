import type React from "react";

import { useCallback, useEffect, useRef } from "react";

import type { KeyboardShortcutConfig } from "../types";

import { useScreenReaderAnnouncement } from "../../screen-reader/hooks/useScreenReaderAnnouncement";

export interface UseKeyboardNavigationOptions {
  cellRefs: React.RefObject<Record<string, HTMLTableCellElement | null>>;
  colCount: number; // Add colCount
  enableExpandableRows: boolean;
  enableKeyboardNavigation: boolean;
  enableRowSelection: boolean;
  enableVirtualScroll: boolean;
  expanded: Record<string, boolean>;
  focusedCell: null | { colIndex: number; rowIndex: number };
  getHeaderGroups: () => any[];
  getRowModel: () => { rows: any[] };
  rowCount: number; // Add rowCount
  setExpanded: (expanded: Record<string, boolean>) => void;
  setFocusedCell: (cell: null | { colIndex: number; rowIndex: number }) => void;
  setVirtualScrollIndex: (index: number) => void;
  shortcuts: KeyboardShortcutConfig;
}

// Helper function to calculate the next cell index based on direction and boundaries
function calculateNextCell(
  currentCell: { colIndex: number; rowIndex: number },
  direction: "down" | "left" | "right" | "up",
  rowCount: number,
  colCount: number,
): { colIndex: number; rowIndex: number } | null {
  const { colIndex, rowIndex } = currentCell;
  let newRowIndex = rowIndex;
  let newColIndex = colIndex;

  switch (direction) {
    case "down":
      newRowIndex = Math.min(rowCount - 1, rowIndex + 1);
      break;
    case "left":
      newColIndex = Math.max(0, colIndex - 1);
      break;
    case "right":
      newColIndex = Math.min(colCount - 1, colIndex + 1);
      break;
    case "up":
      newRowIndex = Math.max(0, rowIndex - 1);
      break;
  }

  // Only return a new cell if the position actually changed
  if (newRowIndex !== rowIndex || newColIndex !== colIndex) {
    return { colIndex: newColIndex, rowIndex: newRowIndex };
  }

  return null; // No movement occurred
}

export function useKeyboardNavigation({
  cellRefs,
  colCount, // Use colCount from options
  enableExpandableRows,
  enableKeyboardNavigation,
  enableRowSelection,
  enableVirtualScroll,
  expanded,
  focusedCell,
  getHeaderGroups,
  getRowModel,
  rowCount, // Use rowCount from options
  setExpanded,
  setFocusedCell,
  setVirtualScrollIndex,
  shortcuts,
}: UseKeyboardNavigationOptions) {
  const { announce } = useScreenReaderAnnouncement();

  console.log("useKeyboardNavigation hook initialized", {
    enableKeyboardNavigation,
  });

  // Handle keyboard navigation
  useEffect(() => {
    if (!enableKeyboardNavigation) {
      console.log(
        "Keyboard navigation disabled, skipping event listener setup.",
      );
      return;
    }

    console.log("Setting up keydown event listener.");

    const handleKeyDown = (e: KeyboardEvent) => {
      console.log("Keydown event received:", e.key, {
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        metaKey: e.metaKey,
        target: e.target,
      });

      // Ignore key presses when focus is inside input elements
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        console.log("Ignoring keydown event inside input element.");
        return;
      }

      // Ensure focusedCell is not null before proceeding with navigation/actions
      // This check should happen early
      if (!focusedCell) {
        console.log("No cell focused, ignoring keydown.");
        return;
      }

      const { colIndex, rowIndex } = focusedCell;
      const rowsCount = getRowModel().rows.length; // Use latest row count
      const colsCount = getHeaderGroups()[0]?.headers.length || 0; // Use latest col count
      console.log(
        "Current focusedCell:",
        focusedCell,
        "Rows:",
        rowsCount,
        "Cols:",
        colsCount,
      );

      // Helper function to check if a key matches a shortcut
      const matchesShortcut = (
        eventKey: string,
        shortcut: string | string[],
        event: KeyboardEvent, // Pass event to check modifiers
      ): boolean => {
        const shortcuts = Array.isArray(shortcut) ? shortcut : [shortcut];
        return shortcuts.some((s) => {
          if (s.includes("+")) {
            const parts = s.toLowerCase().split("+");
            const shortcutKey = parts.pop() || "";
            const hasCtrl = parts.includes("ctrl") || parts.includes("control");
            const hasShift = parts.includes("shift");
            const hasAlt = parts.includes("alt");
            const hasMeta =
              parts.includes("meta") ||
              parts.includes("cmd") ||
              parts.includes("command");

            // Check key and modifiers
            return (
              (eventKey.toLowerCase() === shortcutKey ||
                event.code.toLowerCase() === shortcutKey) &&
              event.ctrlKey === hasCtrl &&
              event.shiftKey === hasShift &&
              event.altKey === hasAlt &&
              event.metaKey === hasMeta
            );
          }
          // Check only key, ignore modifiers if shortcut string has none
          return (
            eventKey === s &&
            !event.ctrlKey &&
            !event.shiftKey &&
            !event.altKey &&
            !event.metaKey
          );
        });
      };

      // Handle arrow key navigation
      let nextCell: { colIndex: number; rowIndex: number } | null = null;
      let direction: "down" | "left" | "right" | "up" | null = null;

      if (matchesShortcut(e.key, shortcuts.moveUp, e)) {
        direction = "up";
      } else if (matchesShortcut(e.key, shortcuts.moveDown, e)) {
        direction = "down";
      } else if (matchesShortcut(e.key, shortcuts.moveLeft, e)) {
        direction = "left";
      } else if (matchesShortcut(e.key, shortcuts.moveRight, e)) {
        direction = "right";
      }

      if (direction) {
        e.preventDefault(); // Prevent default scrolling
        nextCell = calculateNextCell(
          focusedCell,
          direction,
          rowsCount,
          colsCount,
        );

        if (nextCell) {
          console.log(
            `Moving focus to row ${nextCell.rowIndex}, col ${nextCell.colIndex}`,
          );
          setFocusedCell(nextCell);

          // Announce row change for vertical movement
          if (direction === "up" || direction === "down") {
            announce(`Moved to row ${nextCell.rowIndex + 1}`, "polite"); // Announce new row number (1-based)
          }
          // Announce column change for horizontal movement
          else if (direction === "left" || direction === "right") {
            const colName = getHeaderGroups()[0].headers[nextCell.colIndex]
              .column.columnDef.header as string;
            announce(`Moved to column ${colName}`, "polite");
          }

          // Update virtual scroll position if needed for vertical movement
          if (
            enableVirtualScroll &&
            (direction === "up" || direction === "down")
          ) {
            console.log(`Setting virtual scroll index to ${nextCell.rowIndex}`);
            setVirtualScrollIndex(nextCell.rowIndex);
          }
        } else {
          console.log(`Cannot move ${direction}, already at boundary.`);
        }
      }
      // Handle first/last cell in row navigation
      else if (matchesShortcut(e.key, shortcuts.firstCellInRow, e)) {
        console.log("Matched firstCellInRow shortcut:", e.key);
        e.preventDefault();
        const newColIndex = 0;
        if (newColIndex !== colIndex) {
          console.log(`Moving focus to row ${rowIndex}, col ${newColIndex}`);
          setFocusedCell({ colIndex: newColIndex, rowIndex });
          announce("Moved to first cell in row", "polite");
        } else {
          console.log("Already at the first cell in the row.");
        }
      } else if (matchesShortcut(e.key, shortcuts.lastCellInRow, e)) {
        console.log("Matched lastCellInRow shortcut:", e.key);
        e.preventDefault();
        const newColIndex = colsCount - 1;
        if (newColIndex !== colIndex) {
          console.log(`Moving focus to row ${rowIndex}, col ${newColIndex}`);
          setFocusedCell({ colIndex: newColIndex, rowIndex });
          announce("Moved to last cell in row", "polite");
        } else {
          console.log("Already at the last cell in the row.");
        }
      }
      // Handle first/last cell in table navigation
      else if (matchesShortcut(e.key, shortcuts.firstCell, e)) {
        console.log("Matched firstCell shortcut:", e.key);
        e.preventDefault();
        const newRowIndex = 0;
        const newColIndex = 0;
        if (newRowIndex !== rowIndex || newColIndex !== colIndex) {
          console.log(`Moving focus to row ${newRowIndex}, col ${newColIndex}`);
          setFocusedCell({ colIndex: newColIndex, rowIndex: newRowIndex });
          announce("Moved to first cell in table", "polite");

          // Update virtual scroll position if needed
          if (enableVirtualScroll) {
            console.log(`Setting virtual scroll index to ${newRowIndex}`);
            setVirtualScrollIndex(newRowIndex);
          }
        } else {
          console.log("Already at the first cell in the table.");
        }
      } else if (matchesShortcut(e.key, shortcuts.lastCell, e)) {
        console.log("Matched lastCell shortcut:", e.key);
        e.preventDefault();
        const newRowIndex = rowsCount - 1;
        const newColIndex = colsCount - 1;
        if (newRowIndex !== rowIndex || newColIndex !== colIndex) {
          console.log(`Moving focus to row ${newRowIndex}, col ${newColIndex}`);
          setFocusedCell({ colIndex: newColIndex, rowIndex: newRowIndex });
          announce("Moved to last cell in table", "polite");

          // Update virtual scroll position if needed
          if (enableVirtualScroll) {
            console.log(`Setting virtual scroll index to ${newRowIndex}`);
            setVirtualScrollIndex(newRowIndex);
          }
        } else {
          console.log("Already at the last cell in the table.");
        }
      }
      // Handle row expansion
      else if (matchesShortcut(e.key, shortcuts.expandRow, e)) {
        console.log("Matched expandRow shortcut:", e.key);
        e.preventDefault();
        if (enableExpandableRows) {
          const row = getRowModel().rows[rowIndex];
          console.log("Attempting to toggle row expansion for row:", row);
          if (row) {
            // Ensure row exists
            const rowId = row.id;
            const newExpandedState = !expanded[rowId];
            console.log(
              `Toggling expansion for row ${rowId}. New state: ${newExpandedState}`,
            );

            // Create a new expanded object instead of using a function
            const newExpanded = { ...expanded };
            newExpanded[rowId] = newExpandedState;

            // Pass the new object directly to setExpanded
            setExpanded(newExpanded);

            announce(
              `Row ${newExpandedState ? "expanded" : "collapsed"}`,
              "polite",
            );
          } else {
            console.log(`Row at index ${rowIndex} not found.`);
          }
        } else {
          console.log("Row expansion disabled.");
        }
      }
      // Handle row selection
      else if (matchesShortcut(e.key, shortcuts.selectRow, e)) {
        console.log("Matched selectRow shortcut:", e.key);
        // Only handle space key if the target is the document body to avoid interfering with inputs
        // Check if the target is an HTMLElement and its tag name is BODY
        if (e.target instanceof HTMLElement && e.target.tagName === "BODY") {
          e.preventDefault();
          if (enableRowSelection) {
            const row = getRowModel().rows[rowIndex];
            console.log("Attempting to toggle row selection for row:", row);
            if (row) {
              // Ensure row exists
              const newSelected = !row.getIsSelected();
              row.toggleSelected();
              announce(
                `Row ${newSelected ? "selected" : "deselected"}`,
                "polite",
              );
              console.log(
                `Toggled selection for row ${row.id}. New state: ${newSelected}`,
              );
            } else {
              console.log(`Row at index ${rowIndex} not found.`);
            }
          } else {
            console.log("Row selection disabled.");
          }
        } else {
          console.log("Ignoring selectRow shortcut, event target is not body.");
        }
      }
      // Add more shortcut handlers here as needed...
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      console.log("useKeyboardNavigation hook cleaning up event listener.");
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    focusedCell, // Keep focusedCell as a dependency
    enableKeyboardNavigation,
    getRowModel,
    getHeaderGroups,
    enableExpandableRows,
    expanded,
    setExpanded,
    enableRowSelection,
    shortcuts,
    announce,
    enableVirtualScroll,
    setVirtualScrollIndex,
    setFocusedCell,
    rowCount, // Add rowCount dependency
    colCount, // Add colCount dependency
  ]);

  // Focus the cell when focusedCell changes
  useEffect(() => {
    console.log("focusedCell state changed:", focusedCell);
    if (!enableKeyboardNavigation || !focusedCell || !cellRefs.current) {
      console.log(
        "Skipping cell focus: navigation disabled, no focused cell, or cellRefs not ready.",
      );
      return;
    }

    const cellKey = `${focusedCell.rowIndex}-${focusedCell.colIndex}`;
    const cellElement = cellRefs.current[cellKey];
    console.log(`Attempting to focus cell with key: ${cellKey}`);

    if (cellElement) {
      console.log("Cell element found, queuing focus and scroll.");
      // Use a timeout to ensure the element is rendered and in the DOM before focusing
      // This can help with virtualized lists or elements that appear after state update
      setTimeout(() => {
        console.log(`Executing setTimeout for focusing cell ${cellKey}`);
        const elementToFocus = cellRefs?.current?.[cellKey];
        if (elementToFocus && document.activeElement !== elementToFocus) {
          console.log(`Focusing cell ${cellKey}`);
          elementToFocus.focus();
          // Scroll into view if needed
          console.log(`Scrolling cell ${cellKey} into view.`);
          elementToFocus.scrollIntoView({
            block: "nearest",
            inline: "nearest",
          });
        } else {
          console.log(
            `Cell element for key ${cellKey} not found in DOM or already focused when setTimeout executed.`,
          );
        }
      }, 0);
    } else {
      console.log(
        `Cell element not found in cellRefs.current for key: ${cellKey}`,
      );
      // If the cell element isn't immediately available, it might be due to virtualization.
      // We might need a different strategy here, like waiting for the element to appear
      // or relying solely on virtual scroll index update to bring it into view.
      // For now, log a warning.
      console.warn(
        `Cell element for key ${cellKey} not found in cellRefs.current.`,
      );
    }
  }, [focusedCell, enableKeyboardNavigation, cellRefs]); // Dependencies for focusing effect

  // Helper function to focus a specific cell
  const focusCell = useCallback(
    (rowIndex: number, colIndex: number) => {
      console.log(
        `focusCell called with rowIndex: ${rowIndex}, colIndex: ${colIndex}`,
      );
      // Correct the order of arguments for setFocusedCell
      setFocusedCell({ rowIndex, colIndex });

      // Virtual scroll update is handled by the focusedCell useEffect now
      // if (enableVirtualScroll) {
      //   console.log(`Setting virtual scroll index to ${rowIndex}`);
      //   setVirtualScrollIndex(rowIndex);
      // }
    },
    [setFocusedCell], // Dependencies for focusCell callback
  );

  // Cleanup event listener on unmount
  useEffect(() => {
    return () => {
      console.log("useKeyboardNavigation hook cleaning up.");
    };
  }, []);

  return {
    focusCell,
  };
}
