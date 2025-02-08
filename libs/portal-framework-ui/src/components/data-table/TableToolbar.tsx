import React from "react";

import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@lumeweb/portal-framework-ui-core";
import {
  FileDown,
  FileText,
  Keyboard,
  Monitor,
  RefreshCw,
  X,
} from "lucide-react";

import type { BulkAction } from "./types";
import type { FilterChip } from "./types/table/toolbar";

import { useScreenReaderAnnouncement } from "../screen-reader/hooks/useScreenReaderAnnouncement";
import { ShortcutHelp } from "./ShortcutHelp";

interface TableToolbarProps<TData> {
  bulkActions?: BulkAction<TData>[];
  children?: React.ReactNode;
  density: "comfortable" | "compact" | "default";
  enableExport: boolean;
  enableKeyboardShortcuts: boolean;
  exportFormats?: ("csv" | "excel" | "pdf")[];
  /** Active filters displayed as removable chips */
  filterChips?: FilterChip[];
  isExporting: boolean;
  isLoading: boolean;
  onClearSelection: () => void;
  onDensityChange: (density: "comfortable" | "compact" | "default") => void;
  onExport: (format: "csv" | "excel" | "pdf") => void;
  selectedRows: TData[];
  showDensityToggle: boolean;
  showKeyboardShortcutCheatSheet: boolean;
  showShortcutHelp: boolean;
  toggleShortcutHelp: () => void;
}

export function TableToolbar<TData>({
  bulkActions = [],
  children,
  density,
  enableExport,
  enableKeyboardShortcuts,
  exportFormats = ["csv"],
  isExporting,
  isLoading,
  onClearSelection,
  onDensityChange,
  onExport,
  selectedRows,
  showDensityToggle,
  showKeyboardShortcutCheatSheet,
  showShortcutHelp,
  toggleShortcutHelp,
}: TableToolbarProps<TData>) {
  const { announce } = useScreenReaderAnnouncement();

  // Handle density change
  const handleDensityChange = React.useCallback(
    (newDensity: "comfortable" | "compact" | "default") => {
      onDensityChange(newDensity);
      announce(`Table density set to ${newDensity}`, "polite");
    },
    [onDensityChange, announce],
  );

  // Render density toggle dropdown
  const renderDensityToggle = React.useCallback(() => {
    if (!showDensityToggle) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="ml-2" size="sm" variant="outline">
            <Monitor className="h-4 w-4 mr-2" />
            Density
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Table Density</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            onValueChange={(value) =>
              handleDensityChange(
                value as "comfortable" | "compact" | "default",
              )
            }
            value={density}>
            <DropdownMenuRadioItem value="default">
              Default
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="comfortable">
              Comfortable
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="compact">
              Compact
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }, [showDensityToggle, density, handleDensityChange]);

  // Render shortcut help button
  const renderShortcutHelpButton = React.useCallback(() => {
    if (!showShortcutHelp || !enableKeyboardShortcuts) return null;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="ml-2"
              onClick={toggleShortcutHelp}
              size="sm"
              variant="outline">
              <Keyboard className="h-4 w-4 mr-2" />
              {showKeyboardShortcutCheatSheet
                ? "Hide Shortcuts"
                : "Show Shortcuts"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Press ? to toggle keyboard shortcuts</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }, [showShortcutHelp, enableKeyboardShortcuts, toggleShortcutHelp, showKeyboardShortcutCheatSheet]);

  // Render export button
  const renderExportButton = React.useCallback(() => {
    if (!enableExport) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            disabled={isExporting || isLoading}
            size="sm"
            variant="outline">
            {isExporting || isLoading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="mr-2 h-4 w-4" />
            )}
            Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {(exportFormats || ["csv"]).map((format) => (
            <DropdownMenuItem key={format} onClick={() => onExport?.(format)}>
              <FileText className="mr-2 h-4 w-4" />
              Export as {format.toUpperCase()}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }, [enableExport, isExporting, isLoading, exportFormats, onExport]);

  // Render bulk actions toolbar
  const renderBulkActionsToolbar = React.useCallback(() => {
    if (
      !selectedRows ||
      selectedRows.length === 0 ||
      bulkActions.length === 0
    ) {
      return null;
    }

    return (
      <div className="bg-primary/10 p-2 mb-2 rounded-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {selectedRows.length} {selectedRows.length === 1 ? "row" : "rows"}{" "}
            selected
          </span>
        </div>
        <div className="flex items-center gap-2">
          {bulkActions.map((action, index) => (
            <Button
              className={cn("flex items-center gap-1", action.className)}
              key={index}
              onClick={() => action.onClick(selectedRows)}
              size="sm"
              variant="outline">
              {action.icon && <span className="h-4 w-4">{action.icon}</span>}
              {action.label}
            </Button>
          ))}
          {onClearSelection && (
            <Button
              className="ml-2"
              onClick={onClearSelection}
              size="sm"
              variant="ghost">
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>
    );
  }, [selectedRows, bulkActions, onClearSelection]);

  return (
    <>
      {renderBulkActionsToolbar()}

      <div className="flex justify-end mb-2 gap-2">
        {children}
        {renderDensityToggle()}
        {renderShortcutHelpButton()}
        {renderExportButton()}
      </div>

      {showKeyboardShortcutCheatSheet && showShortcutHelp && (
        <ShortcutHelp className="mb-4" group="table" />
      )}
    </>
  );
}
