import React, { useState, useRef } from "react";
import { Checkbox, Label, Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@lumeweb/portal-framework-ui-core";
import { BaseFilter } from "../BaseFilter";
import type { BaseFilterComponentProps } from "@/components/data-table/toolbarItems/filters/types";
import { BaseRecord } from "@refinedev/core";
// TODO: Reimplement tooltip functionality
// import { useFilterTooltip } from "../hooks/useFilterTooltip";

interface MultiSelectFilterProps<TData extends BaseRecord>
  extends BaseFilterComponentProps<TData> {}

function MultiSelectFilter<TData extends BaseRecord>({
  value = [],
  onChange,
  config,
}: MultiSelectFilterProps<TData>) {
  const [selectedValues, setSelectedValues] = useState<string[]>(value);
  const containerRef = useRef<HTMLDivElement>(null);
  // TODO: Reimplement tooltip functionality
  // const { activeTooltip, handleItemHover, handleItemLeave } = useFilterTooltip();

  const handleCheckboxChange = (checked: boolean, optionValue: string) => {
    let newValues: string[];

    if (checked) {
      newValues = [...selectedValues, optionValue];
    } else {
      newValues = selectedValues.filter((val) => val !== optionValue);
    }

    setSelectedValues(newValues);
    if (onChange) {
      onChange(newValues);
    }
  };

  // TODO: Reimplement tooltip functionality
  // const handleMouseEnter = (e: React.MouseEvent, optionValue: string) => {
  //   const option = config.options?.find((opt) => opt.value === optionValue);
  //   if (option?.description) {
  //     handleItemHover(option.description, e, containerRef);
  //   }
  // };

  // TODO: Reimplement tooltip functionality
  // const handleMouseLeave = () => {
  //   handleItemLeave();
  // };

  return (
    <TooltipProvider>
      <BaseFilter config={config}>
        <div ref={containerRef} className="space-y-2">
          {config.options?.map((option) => (
            <div
              key={option.value}
              className="flex items-center space-x-2"
              // TODO: Reimplement tooltip functionality
              // onMouseEnter={(e) => handleMouseEnter(e, option.value)}
              // onMouseLeave={handleMouseLeave}
              >
              <Checkbox
                id={`checkbox-${config.id}-${option.value}`}
                checked={selectedValues.includes(option.value)}
                onCheckedChange={(checked) =>
                  handleCheckboxChange(checked as boolean, option.value)
                }
                disabled={config.disabled || false}
              />
              <Label
                htmlFor={`checkbox-${config.id}-${option.value}`}
                className="cursor-help text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {option.label}
              </Label>
            </div>
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
        </div>
      </BaseFilter>
    </TooltipProvider>
  );
}

export { MultiSelectFilter };
export type { MultiSelectFilterProps };
