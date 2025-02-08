import { ThemedBadge } from "@/components/ThemedBadge";
import { BADGE_THEME } from "@/types";
import {
  cn,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lumeweb/portal-framework-ui-core";
import { flexRender } from "@tanstack/react-table";
import React from "react";

export interface TableCellProps {
  cell: any;
  cellRef: React.Ref<HTMLTableCellElement>;
  colIndex: number;
  displayValue: any;
  editingValue: any;
  enableHoverActions?: boolean;
  enableKeyboardNavigation: boolean;
  hoverActions?: React.ReactNode;
  hoverActionsPosition?: "end" | "start";
  isEditable: boolean;
  isEditing: boolean;
  isFocused: boolean;
  onCancelEdit: () => void;
  onDoubleClick: () => void;
  onEditValueChange: (value: any) => void;
  onFocus: () => void;
  onSaveEdit: () => void;
  rowIndex: number;
}

export function TableCell({
  cell,
  cellRef,
  colIndex,
  displayValue,
  editingValue,
  enableHoverActions = false,
  enableKeyboardNavigation,
  hoverActions,
  hoverActionsPosition = "end",
  isEditable,
  isEditing,
  isFocused,
  onCancelEdit,
  onDoubleClick,
  onEditValueChange,
  onFocus,
  onSaveEdit,
  rowIndex,
}: TableCellProps) {
  // Render edit mode
  if (isEditing) {
    const editType = cell.column.columnDef.meta?.editType || "text";
    const editOptions = cell.column.columnDef.meta?.editOptions || [];

    switch (editType) {
      case "number":
        return (
          <Input
            autoFocus
            onBlur={onSaveEdit}
            onChange={(e) => onEditValueChange(e.target.valueAsNumber)} // Use valueAsNumber for number input
            onKeyDown={(e) => {
              if (e.key === "Enter") onSaveEdit();
              if (e.key === "Escape") onCancelEdit();
            }}
            type="number"
            value={editingValue?.toString() || ""}
          />
        );
      case "select":
        return (
          <Select onValueChange={onEditValueChange} value={editingValue || ""}>
            <SelectTrigger
              className="w-full"
              onBlur={onSaveEdit}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSaveEdit();
                if (e.key === "Escape") onCancelEdit();
              }}
              ref={(el) => el && setTimeout(() => el.focus(), 0)}>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {editOptions.map((opt: any) => (
                <SelectItem key={String(opt.value)} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case "text":
      default:
        return (
          <Input
            autoFocus
            onBlur={onSaveEdit}
            onChange={(e) => onEditValueChange(e.target.value)} // Use value for text input
            onKeyDown={(e) => {
              if (e.key === "Enter") onSaveEdit();
              if (e.key === "Escape") onCancelEdit();
            }}
            type="text"
            value={editingValue?.toString() || ""}
          />
        );
    }
  }

  const meta = cell.column.columnDef.meta as {
    font?: "medium" | "mono" | "normal";
    maxWidth?: number;
    truncate?: boolean;
    variant?: string;
  };

  return (
    <div
      aria-colindex={colIndex + 1}
      aria-rowindex={rowIndex + 1}
      className={cn(
        "outline-none relative group transition-colors",
        isFocused &&
          enableKeyboardNavigation &&
          "ring-2 ring-primary ring-inset ring-offset-2",
        isEditable && "cursor-pointer hover:bg-secondary/20 transition-colors",
        enableHoverActions && "pr-8", // Add padding for hover actions
        meta?.truncate && "truncate",
        meta?.font === "medium" && "font-medium",
        meta?.font === "mono" && "font-mono text-xs",
      )}
      onDoubleClick={onDoubleClick}
      onFocus={onFocus}
      ref={cellRef as React.RefCallback<HTMLDivElement>}
      role="gridcell"
      style={{ maxWidth: meta?.maxWidth }}
      tabIndex={enableKeyboardNavigation ? 0 : undefined}>
      {meta?.variant ? (
        <ThemedBadge
          className="capitalize"
          config={BADGE_THEME}
          value={meta.variant as keyof typeof BADGE_THEME}>
          {flexRender(cell.column.columnDef.cell, {
            ...cell.getContext(),
            getValue: () => displayValue,
          })}
        </ThemedBadge>
      ) : (
        flexRender(cell.column.columnDef.cell, {
          ...cell.getContext(),
          getValue: () => displayValue,
        })
      )}

      {/* Hover actions */}
      {enableHoverActions && hoverActions && (
        <div
          className={cn(
            "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity",
            hoverActionsPosition === "start" ? "left-1" : "right-1",
          )}>
          {hoverActions}
        </div>
      )}
    </div>
  );
}
