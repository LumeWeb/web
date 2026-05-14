import { Search } from "lucide-react";
import React, { useEffect } from "react";
import { useDebounce } from "use-debounce";
import type {
  ToolbarFilterComponentProps,
  ToolbarFilterItem,
} from "@/components/data-table/DataTable.types";
import { registerFilter } from "@/components/data-table/ToolbarRegistry";
import { ToolbarItemType } from "@/components/data-table/DataTable.types";
import {
  FilterOperator,
  FilterType,
  LogicalFilterOperator,
  useRefineTable,
} from "@/components";

function SearchToolbarItem({
  value,
  onChange,
  config,
}: Omit<ToolbarFilterComponentProps<any>, "context">) {
  const [debouncedValue] = useDebounce(value, 300);
  const { setFilters } = useRefineTable<any>();
  const placeholder = config?.placeholder || "Search...";

  // Handle refine contexts search
  useEffect(() => {
    if (setFilters && debouncedValue !== undefined) {
      const filters = debouncedValue
        ? [
            {
              field: String(config?.field || "q"),
              operator: (config?.operator ||
                "contains") as LogicalFilterOperator,
              value: debouncedValue,
            },
          ]
        : [];
      setFilters(filters);
    }
  }, [debouncedValue, setFilters, config?.field, config?.operator]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  return (
    <div className="relative">
      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
      <input
        type="text"
        placeholder={placeholder}
        value={value || ""}
        onChange={handleChange}
        className="rounded border px-2 py-1 pl-8"
      />
    </div>
  );
}

function registerSearchToolbarItem() {
  const item: ToolbarFilterItem<any> = {
    type: ToolbarItemType.FILTER,
    id: "search",
    label: "Search",
    component: ({
      value,
      onChange,
      config,
    }: ToolbarFilterComponentProps<any>) => (
      <SearchToolbarItem
        value={value}
        onChange={onChange}
        config={config}
      />
    ),
    initialValue: "",
    config: {
      id: "search",
      type: FilterType.TEXT,
      label: "Search",
      field: "q",
      operator: FilterOperator.CONTAINS,
      placeholder: "Search...",
    },
  };

  registerFilter("search", item);
}

export { registerSearchToolbarItem };
export type { ToolbarFilterComponentProps as SearchToolbarItemProps };
