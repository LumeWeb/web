import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@lumeweb/portal-framework-ui-core";
import { MoreHorizontal } from "lucide-react";
import React from "react";

export function TableActionsDropdown({
  actions,
  children,
}: {
  actions: {
    destructive?: boolean;
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
  }[];
  children?: React.ReactNode;
}): React.JSX.Element {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {children ?? (
          <Button className="h-8 w-8" size="icon" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {actions.map((action, index) => (
          <DropdownMenuItem
            className={cn(
              "focus:bg-accent transition-colors",
              action.destructive
                ? "text-destructive hover:bg-destructive/10"
                : "hover:bg-accent",
            )}
            key={index}
            onClick={action.onClick}>
            {action.icon}
            <span className="ml-1.5">{action.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
