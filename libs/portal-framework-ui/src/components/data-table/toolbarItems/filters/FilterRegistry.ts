import React from "react";
import { BaseRecord } from "@refinedev/core";

interface FilterComponentProps<TData extends BaseRecord = BaseRecord> {
  value: any;
  onChange?: (value: any) => void;
  context?: any;
}

interface RegisteredFilter<TData extends BaseRecord> {
  id: string;
  component: React.ComponentType<FilterComponentProps<TData>>;
}

// Module-level private state
const filters: Map<
  string,
  React.ComponentType<FilterComponentProps<any>>
> = new Map();

/**
 * Register a filter component
 * @template TData - The type of record data
 * @param id - Unique identifier for the filter
 * @param component - The React component for the filter
 */
function registerFilter<TData extends BaseRecord = BaseRecord>(
  id: string,
  component: React.ComponentType<FilterComponentProps<TData>>,
): void {
  filters.set(id, component as React.ComponentType<FilterComponentProps<any>>);
}

/**
 * Get a registered filter component by ID
 * @template TData - The type of record data
 * @param id - The filter ID
 * @returns The registered filter component or undefined
 */
function getFilter<TData extends BaseRecord = BaseRecord>(
  id: string,
): React.ComponentType<FilterComponentProps<TData>> | undefined {
  return filters.get(id) as
    | React.ComponentType<FilterComponentProps<TData>>
    | undefined;
}

/**
 * Check if a filter component exists
 * @param id - The filter ID
 * @returns True if the filter exists, false otherwise
 */
function hasFilter(id: string): boolean {
  return filters.has(id);
}

/**
 * Get all registered filter components
 * @template TData - The type of record data
 * @returns Array of registered filters with their IDs and components
 */
function listFilters<
  TData extends BaseRecord = BaseRecord,
>(): RegisteredFilter<TData>[] {
  return Array.from(filters.entries()).map(([id, component]) => ({
    id,
    component: component as React.ComponentType<FilterComponentProps<TData>>,
  }));
}

/**
 * Remove a specific filter component
 * @param id - The filter ID to remove
 * @returns True if the filter was removed, false if it didn't exist
 */
function removeFilter(id: string): boolean {
  return filters.delete(id);
}

/**
 * Clear all registered filter components
 */
function clearFilters(): void {
  filters.clear();
}

export {
  registerFilter,
  getFilter,
  hasFilter,
  listFilters,
  removeFilter,
  clearFilters,
};

export type { RegisteredFilter, FilterComponentProps };
