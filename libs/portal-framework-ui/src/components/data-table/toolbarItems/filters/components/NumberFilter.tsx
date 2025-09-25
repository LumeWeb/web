import React from "react";
import { Input } from "@lumeweb/portal-framework-ui-core";
import { BaseFilter } from "../BaseFilter";
import type { BaseFilterComponentProps } from "@/components/data-table/toolbarItems/filters/types";
import { BaseRecord } from "@refinedev/core";

function NumberFilter<TData extends BaseRecord>({
  value,
  onChange,
  config,
}: BaseFilterComponentProps<TData>) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = e.target.value === "" ? undefined : Number(e.target.value);
    if (onChange) {
      onChange(numValue);
    }
  };

  return (
    <BaseFilter config={config}>
      <Input
        type="number"
        placeholder={config.placeholder || "Enter number..."}
        value={value || ""}
        onChange={handleChange}
        disabled={config.disabled || false}
        min={config.min}
        max={config.max}
        step={config.step}
      />
    </BaseFilter>
  );
}

export { NumberFilter };
