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

  const switchId = `boolean-filter-${config.name || config.id}`;
  const label = config.itemLabel ?? config.label;

  return (
    <BaseFilter config={config}>
      <div className="flex items-center space-x-2">
        <Switch
          id={switchId}
          checked={value === true}
          onCheckedChange={handleChange}
          disabled={config.disabled || false}
          aria-label={label}
        />
        <label htmlFor={switchId} className="text-sm font-medium">{label}</label>
      </div>
    </BaseFilter>
  );
}

export { BooleanFilter };
