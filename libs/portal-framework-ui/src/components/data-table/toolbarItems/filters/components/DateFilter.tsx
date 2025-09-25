import React from "react";
import { Input } from "@lumeweb/portal-framework-ui-core";
import { BaseFilter } from "../BaseFilter";
import type { BaseFilterComponentProps } from "@/components/data-table/toolbarItems/filters/types";
import { BaseRecord } from "@refinedev/core";

function DateFilter<TData extends BaseRecord>({
  value,
  onChange,
  config,
}: BaseFilterComponentProps<TData>) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <BaseFilter config={config}>
      <Input
        type="date"
        placeholder={config.placeholder || "Select date..."}
        value={value || ""}
        onChange={handleChange}
        disabled={config.disabled || false}
      />
    </BaseFilter>
  );
}

export { DateFilter };
