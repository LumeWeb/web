import React from "react";
import { Input } from "@lumeweb/portal-framework-ui-core";
import { BaseFilter } from "../BaseFilter";
import type { BaseFilterComponentProps } from "@/components/data-table/toolbarItems/filters/types";
import { BaseRecord } from "@refinedev/core";

interface RangeValue {
  min?: number;
  max?: number;
}

function RangeFilter<TData extends BaseRecord>({
  value = {},
  onChange,
  config,
}: BaseFilterComponentProps<TData>) {
  const rangeValue = value as RangeValue;

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const min = e.target.value === "" ? undefined : Number(e.target.value);
    if (onChange) {
      onChange({ ...rangeValue, min });
    }
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const max = e.target.value === "" ? undefined : Number(e.target.value);
    if (onChange) {
      onChange({ ...rangeValue, max });
    }
  };

  return (
    <BaseFilter config={config}>
      <div className="flex items-center space-x-2">
        <Input
          type="number"
          placeholder={config.minPlaceholder || "Min"}
          value={rangeValue.min ?? ""}
          onChange={handleMinChange}
          disabled={config.disabled || false}
          className="w-full"
          min={config.min}
          max={config.max}
        />
        <span className="text-sm font-medium">to</span>
        <Input
          type="number"
          placeholder={config.maxPlaceholder || "Max"}
          value={rangeValue.max ?? ""}
          onChange={handleMaxChange}
          disabled={config.disabled || false}
          className="w-full"
          min={config.min}
          max={config.max}
        />
      </div>
    </BaseFilter>
  );
}

export { RangeFilter };
export type { RangeValue };
