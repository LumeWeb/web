import React from "react";
import { Search } from "lucide-react";
import { Input } from "@lumeweb/portal-framework-ui-core";
import { BaseFilter } from "../BaseFilter";
import type { BaseFilterComponentProps } from "@/components/data-table/toolbarItems/filters/types";
import { BaseRecord } from "@refinedev/core";

function SearchFilter<TData extends BaseRecord>({
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
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
        <Input
          type="text"
          placeholder={config.placeholder || "Search..."}
          value={value || ""}
          onChange={handleChange}
          disabled={config.disabled || false}
          className="pl-8"
        />
      </div>
    </BaseFilter>
  );
}

export { SearchFilter };
