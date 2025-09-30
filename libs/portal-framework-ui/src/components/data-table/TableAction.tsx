import { Button } from "@lumeweb/portal-framework-ui-core";
import React from "react";

export interface TableActionItem<TData> {
  disabled?: boolean | ((row: TData) => boolean);
  icon: React.ReactNode;
  label?: string;
  onClick: (row: TData) => void;
  tooltip?: string;
}

interface TableActionProps<TData> {
  items: TableActionItem<TData>[];
  row: TData;
}

function TableAction<TData>({ items, row }: TableActionProps<TData>) {
  return (
    <div className="flex items-center gap-1">
      {items.map((item, index) => (
        <Button
          aria-label={item.tooltip || item.label}
          className="h-8 w-8 p-0"
          disabled={typeof item.disabled === 'function' ? item.disabled(row) : item.disabled}
          key={`action-${index}`}
          onClick={(e) => {
            e.stopPropagation();
            item.onClick(row);
          }}
          title={item.tooltip || item.label}
          variant="ghost">
          {item.icon}
        </Button>
      ))}
    </div>
  );
}

export { TableAction };
