import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@lumeweb/portal-framework-ui-core";
import { MoreHorizontal } from "lucide-react";
import React from "react";

export interface TableActionMenuItem<TData> {
  disabled?: boolean | ((row: TData) => boolean);
  icon?: React.ReactNode;
  label: string;
  onClick: (row: TData) => void;
}

interface TableActionMenuProps<TData> {
  items: TableActionMenuItem<TData>[];
  row: TData;
}

function TableActionMenu<TData>({ items, row }: TableActionMenuProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Open actions menu"
          className="h-8 w-8 p-0"
          variant="ghost">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items?.map((item, index) => (
          <DropdownMenuItem
            disabled={typeof item.disabled === 'function' ? item.disabled(row) : item.disabled}
            key={index}
            onClick={() => item.onClick(row)}>
            {item.icon && <span className="mr-2">{item.icon}</span>}
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { TableActionMenu };
