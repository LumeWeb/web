import React, { useState, useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@lumeweb/portal-framework-ui-core";
import { BaseFilter } from "../BaseFilter";
import type { BaseFilterComponentProps, SelectOption } from "@/components/data-table/toolbarItems/filters/types";
import { BaseRecord } from "@refinedev/core";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Button } from "@lumeweb/portal-framework-ui-core";
import { cn } from "@lumeweb/portal-framework-ui-core";
// TODO: Reimplement tooltip functionality
// import { useFilterTooltip } from "../hooks/useFilterTooltip";

function SelectFilter<TData extends BaseRecord>({
  value,
  onChange,
  config,
  itemLabel,
}: BaseFilterComponentProps<TData>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const selectContentRef = useRef<HTMLDivElement>(null);
  const selectTriggerRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // TODO: Reimplement tooltip functionality
  // const { activeTooltip, handleItemHover, handleItemLeave } = useFilterTooltip();

  // Prepare options - add "all" option if includeAllOption is true
  const options = config.includeAllOption
    ? [
        {
          label: `All ${itemLabel || "Items"}`,
          value: "all",
        } as SelectOption,
        ...(config.options || []),
      ]
    : config.options || [];

  // Map undefined value to "all" for controlled component only when includeAllOption is true
  const controlledValue = value === undefined && config.includeAllOption ? "all" : value;

  const handleChange = (val: string) => {
    if (onChange) {
      // If "all" option is selected, pass undefined to indicate no filter
      if (config.includeAllOption && val === "all") {
        onChange(undefined);
      } else {
        onChange(val);
      }
    }
    
    // Close dropdown menu after selection when dropdownStyle is used
    if (config.dropdownStyle) {
      setIsExpanded(false);
    }
  };

  // Get the selected option to show its description in the trigger
  // When "all" is selected, we want to show the special "all" option label
  const selectedOption = options.find((option) => option.value === controlledValue);

  // TODO: Reimplement tooltip functionality
  // const handleMouseEnter = (e: React.MouseEvent, optionValue: string) => {
  //   const option = options.find((opt) => opt.value === optionValue);
  //   if (option?.description) {
  //     handleItemHover(option.description, e, containerRef);
  //   }
  // };

  // TODO: Reimplement tooltip functionality
  // const handleMouseLeave = () => {
  //   handleItemLeave();
  // };

  // Compute proper trigger label that displays "All …" when value is "all" or undefined
  const triggerLabel = selectedOption?.label || itemLabel || config.placeholder || "Select option...";

  // If dropdownStyle is enabled, render as a dropdown menu
  if (config.dropdownStyle) {
    return (
      <TooltipProvider>
        <BaseFilter config={config} label={itemLabel}>
          <div ref={containerRef} className="relative">
            <DropdownMenu.Root open={isExpanded} onOpenChange={setIsExpanded}>
              <DropdownMenu.Trigger asChild>
                <Button
                  ref={selectTriggerRef}
                  variant="ghost"
                  className="hover:bg-muted h-auto w-full justify-start p-3">
                  <span className="flex-1 text-left font-medium">
                    {triggerLabel}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200 ease-in-out",
                      isExpanded ? "rotate-180" : "rotate-0",
                    )}
                  />
                </Button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  ref={selectContentRef}
                  className="bg-background rounded-lg border p-3 shadow-lg"
                  side="bottom"
                  align="start"
                  sideOffset={5}>
                  <Select
                    value={controlledValue}
                    onValueChange={handleChange}
                    disabled={config.disabled || false}>
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={config.placeholder || "Select option..."}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {options.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          // TODO: Reimplement tooltip functionality
                          // onMouseEnter={(e) => handleMouseEnter(e, option.value)}
                          // onMouseLeave={handleMouseLeave}
                          >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </BaseFilter>
      </TooltipProvider>
    );
  }

  // Default inline behavior
  return (
    <TooltipProvider>
      <BaseFilter config={config} label={itemLabel}>
        <div ref={containerRef} className="relative">
          <Select
            value={controlledValue}
            onValueChange={handleChange}
            disabled={config.disabled || false}>
            <SelectTrigger
              ref={selectTriggerRef}
              className="w-full">
              <SelectValue placeholder={config.placeholder || "Select option..."} />
            </SelectTrigger>
            <SelectContent ref={selectContentRef}>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  // TODO: Reimplement tooltip functionality
                  // onMouseEnter={(e) => handleMouseEnter(e, option.value)}
                  // onMouseLeave={handleMouseLeave}
                  >
                  {option.label}
                </SelectItem>
              ))}
              {/* TODO: Reimplement tooltip functionality */}
              {/* {activeTooltip && (
                <Tooltip open>
                  <TooltipTrigger asChild>
                    <div className="absolute" style={{ left: activeTooltip.x, top: activeTooltip.y }} />
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    align="start"
                    sideOffset={5}
                    className="max-w-none">
                    {activeTooltip.content}
                  </TooltipContent>
                </Tooltip>
              )} */}
            </SelectContent>
          </Select>
        </div>
      </BaseFilter>
    </TooltipProvider>
  );
}

export { SelectFilter };
