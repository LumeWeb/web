import React from "react";
import { Input } from "@lumeweb/portal-framework-ui-core";
import { BaseFilter } from "../BaseFilter";
import type { BaseFilterComponentProps } from "@/components/data-table/toolbarItems/filters/types";
import { BaseRecord } from "@refinedev/core";

function TextFilter<TData extends BaseRecord>({
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
        type="text"
        placeholder={config.placeholder || "Enter text..."}
        value={value || ""}
        onChange={handleChange}
        disabled={config.disabled || false}
      />
    </BaseFilter>
  );
}

export { TextFilter };
