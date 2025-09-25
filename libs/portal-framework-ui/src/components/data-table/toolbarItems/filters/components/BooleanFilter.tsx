import React from "react";
import { Switch } from "@lumeweb/portal-framework-ui-core";
import { BaseFilter } from "../BaseFilter";
import type { BaseFilterComponentProps } from "@/components/data-table/toolbarItems/filters/types";
import { BaseRecord } from "@refinedev/core";

function BooleanFilter<TData extends BaseRecord>({
  value,
  onChange,
  config,
}: BaseFilterComponentProps<TData>) {
  const handleChange = (checked: boolean) => {
    if (onChange) {
      onChange(checked);
    }
  };

  return (
    <BaseFilter config={config}>
      <div className="flex items-center space-x-2">
        <Switch
          checked={value === true}
          onCheckedChange={handleChange}
          disabled={config.disabled || false}
        />
        <span className="text-sm font-medium">{config.label}</span>
      </div>
    </BaseFilter>
  );
}

export { BooleanFilter };
