import React, { useEffect, useRef, useState } from "react";
import { BaseRecord } from "@refinedev/core";
import { getFilter } from "@/components/data-table/ToolbarRegistry";
import type {
  ToolbarFilterComponentProps,
  ToolbarFilterItem,
  ToolbarItemComponentProps,
} from "@/components/data-table/DataTable.types";
import { useFilterHelpers } from "@/components";

interface FilterResolverProps<TData extends BaseRecord> {
  filterItem: ToolbarFilterItem<TData>;
  commonProps: ToolbarItemComponentProps<TData>;
}

/**
 * FilterResolver handles dynamic filter component resolution
 * It supports:
 * 1. Direct component references
 * 2. Registered filter components by ID
 * 3. Inferred components based on config.type
 */
function FilterResolver<TData extends BaseRecord>({
  filterItem,
  commonProps,
}: FilterResolverProps<TData>) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const filterComponentRef = useRef<React.ComponentType<any> | null>(null);
  const filterItemRef = useRef(filterItem);
  const { getAvailableOperators } = useFilterHelpers();

  // Update ref when filterItem changes
  useEffect(() => {
    filterItemRef.current = filterItem;
  }, [filterItem]);

  useEffect(() => {
    const resolveFilterComponent = async () => {
      const currentFilterItem = filterItemRef.current;
      setIsLoading(true);
      setNotFound(false);
      let Component: React.ComponentType<any> | null = null;

      // Case 1: Direct component reference
      if (typeof currentFilterItem.component === "function") {
        Component = currentFilterItem.component;
      }
      // Case 2: String ID reference - check registry
      else if (typeof currentFilterItem.component === "string") {
        const registeredFilter = getFilter(currentFilterItem.component);
        if (registeredFilter) {
          Component = registeredFilter.component;
        }
      }
      // Case 3: No component property - infer from config.type using FilterRegistry
      else if (!currentFilterItem.component && currentFilterItem.config?.type) {
        const registeredFilter = getFilter(currentFilterItem.config.type);
        if (registeredFilter) {
          Component = registeredFilter.component;
        }
      }

      filterComponentRef.current = Component;
      setIsLoading(false);

      // Set not found state if no component was resolved
      if (!Component) {
        setNotFound(true);
      }
    };

    resolveFilterComponent();
  }, [filterItem.component, filterItem.config?.type, filterItem.id]);

  // Show loading state while resolving component
  if (isLoading) {
    return (
      <div className="text-sm text-gray-500">Loading filter component...</div>
    );
  }

  // Show error only after resolution is complete and no component was found
  if (notFound) {
    return (
      <div className="text-sm text-red-500">
        Filter component not found for: {filterItem.id}
      </div>
    );
  }

  // Prepare props for the filter component using the new unified configuration system
  // Auto-set field from item if not provided in config
  const configWithField = {
    ...filterItem.config,
    field: filterItem.config?.field || filterItem.field || filterItem.id,
  };

  const filterProps: ToolbarFilterComponentProps<TData> = {
    ...commonProps,
    value: commonProps.value ?? filterItem.initialValue,
    onChange: commonProps.onChange,
    config: configWithField,
    itemLabel: filterItem.label,
    getAvailableOperators: getAvailableOperators,
  };

  const FilterComponent = filterComponentRef.current;
  return <FilterComponent {...filterProps} />;
}

export { FilterResolver };
