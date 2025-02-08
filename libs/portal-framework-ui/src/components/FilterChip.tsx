import { ThemedBadge } from "@/components/ThemedBadge";
import { type BadgeConfig } from "@/types";
import { Button, cn } from "@lumeweb/portal-framework-ui-core";
import { X } from "lucide-react";

type FilterChipVariant = "date" | "default" | "numeric" | "text";

const FILTER_CHIP_THEME: BadgeConfig<FilterChipVariant> = {
  date: {
    base: "bg-blue-100 text-blue-800",
    dark: "dark:bg-blue-900/20 dark:text-blue-200",
    hover: "hover:bg-blue-200/80 dark:hover:bg-blue-800/80",
  },
  default: {
    base: "bg-muted/40 text-muted-foreground",
    dark: "dark:bg-gray-700 dark:text-gray-300",
    hover: "hover:bg-muted/60 dark:hover:bg-gray-600",
  },
  numeric: {
    base: "bg-purple-100 text-purple-800",
    dark: "dark:bg-purple-900/20 dark:text-purple-200",
    hover: "hover:bg-purple-200/80 dark:hover:bg-purple-800/80",
  },
  text: {
    base: "bg-green-100 text-green-800",
    dark: "dark:bg-green-900/20 dark:text-green-200",
    hover: "hover:bg-green-200/80 dark:hover:bg-green-800/80",
  },
};
import React from "react";

export function FilterChip({
  className,
  label,
  onRemove,
  variant = "default",
}: {
  className?: string;
  label: string;
  onRemove: () => void;
  variant?: FilterChipVariant;
}) {
  return (
    <ThemedBadge
      className={cn("gap-1 pr-1.5", className)}
      config={FILTER_CHIP_THEME}
      value={variant}>
      <span>{label}</span>
      <Button
        aria-label={`Remove ${label} filter`}
        className="h-5 w-5 p-0 hover:bg-transparent ml-1"
        onClick={onRemove}
        variant="ghost">
        <X className="h-3.5 w-3.5" />
      </Button>
    </ThemedBadge>
  );
}
