import React, { useCallback, useState } from "react";

import { Button, cn, lazyIcon } from "@lumeweb/portal-framework-ui-core";
import { BaseRecord } from "@refinedev/core";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import type {
  ToolbarFilterGroupItem,
  ToolbarItemComponentProps,
} from "@/components/data-table/DataTable.types";
import { FilterResolver } from "./FilterResolver";
import { ComponentSize, getSizeClass } from "@/components/sizing";
import { FilterOperator } from "./filters/types";
import { createFilterOnChangeHandler } from "./filters";
const ChevronDown = lazyIcon("ChevronDown");
const Filter = lazyIcon("Filter");


interface FilterGroupProps<TData extends BaseRecord> {
  item: ToolbarFilterGroupItem<TData>;
  commonProps: ToolbarItemComponentProps<TData>;
  size?: ComponentSize;
}

const dropdownContentClasses = "bg-background rounded-lg border shadow-lg p-3";

function FilterGroup<TData extends BaseRecord>({
  item,
  commonProps,
  size,
}: FilterGroupProps<TData>) {
  const [isExpanded, setIsExpanded] = useState(item.initiallyExpanded ?? false);
  const layout = item.layout ?? "horizontal";

  // Create specialized onChange handler for child filters
  const createChildOnChangeHandler = useCallback(
    (childItem: any) => {
      return createFilterOnChangeHandler(
        childItem,
        (filters) => {
          if (commonProps.context?.setFilters) {
            commonProps.context.setFilters(filters);
          }
        },
        commonProps.context?.getDefaultOperator,
        {
          itemId: item.id,
          childItemId: childItem.id,
        },
      );
    },
    [commonProps.context, item.id],
  );

  // Create specialized common props for child filters
  const createChildCommonProps = useCallback(
    (childItem: any): ToolbarItemComponentProps<TData> => {
      return {
        ...commonProps,
        value:
          commonProps.context?.getDefaultFilter?.(
            (childItem as any).config?.field as string,
            (childItem as any).config?.operator ||
              (commonProps.context?.getDefaultOperator
                ? commonProps.context.getDefaultOperator(
                    (childItem as any).config?.type,
                  )
                : FilterOperator.EQ),
          ) ?? childItem.initialValue,
        onChange: createChildOnChangeHandler(childItem),
      };
    },
    [commonProps, createChildOnChangeHandler],
  );

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const renderFilterIcon = () => {
    if (!item.icon) {
      return <Filter className="mr-2 h-4 w-4" />;
    }

    // Check if icon is a React element (JSX)
    if (React.isValidElement(item.icon)) {
      return item.icon;
    }

    // Otherwise treat it as a component type
    const IconComponent = item.icon as React.ComponentType<{
      className?: string;
    }>;
    return <IconComponent className="mr-4 h-4 w-4" />;
  };

  // If dropdownStyle is enabled, render as a dropdown menu
  if (item.dropdownStyle) {
    return (
      <DropdownMenu.Root open={isExpanded} onOpenChange={setIsExpanded}>
        <DropdownMenu.Trigger asChild>
          <Button
            variant="ghost"
            className="hover:bg-muted h-auto justify-start p-3">
            {renderFilterIcon()}
            <span className="flex-1 text-left font-medium">{item.label}</span>
            <ChevronDown
              className={cn(
                "ml-2 h-4 w-4 transition-transform duration-200 ease-in-out",
                isExpanded ? "rotate-180" : "rotate-0",
              )}
            />
          </Button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className={cn(
              dropdownContentClasses,
              layout === "vertical"
                ? "space-y-3"
                : "grid grid-cols-2 gap-3 md:grid-cols-3",
              size ? getSizeClass({ size }) : undefined,
              "animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200",
            )}
            side="bottom"
            align="start"
            sideOffset={5}>
            {item.items.map((filterItem) => {
              const childCommonProps = createChildCommonProps(filterItem);
              return (
                <div key={filterItem.id} className="flex flex-col">
                  <FilterResolver
                    filterItem={filterItem}
                    commonProps={childCommonProps}
                  />
                </div>
              );
            })}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    );
  }

  // Default inline expansion behavior
  return (
    <div className={cn("bg-background rounded-lg border", item.className)}>
      {/* Group header */}
      <Button
        variant="ghost"
        className="hover:bg-muted h-auto w-full justify-start p-3"
        onClick={toggleExpanded}>
        {renderFilterIcon()}
        <span className="flex-1 text-left font-medium">{item.label}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200 ease-in-out",
            isExpanded ? "rotate-0" : "-rotate-90",
          )}
        />
      </Button>

      {/* Group content */}
      <div
        className={cn(
          "overflow-hidden border-t transition-all duration-300 ease-in-out",
          isExpanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0",
          layout === "vertical"
            ? "space-y-3"
            : "grid grid-cols-2 gap-3 md:grid-cols-3",
          "p-3",
          size ? getSizeClass({ size }) : undefined,
        )}>
        {item.items.map((filterItem) => {
          const childCommonProps = createChildCommonProps(filterItem);
          return (
            <div key={filterItem.id} className="flex flex-col">
              <FilterResolver
                filterItem={filterItem}
                commonProps={childCommonProps}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { FilterGroup };
