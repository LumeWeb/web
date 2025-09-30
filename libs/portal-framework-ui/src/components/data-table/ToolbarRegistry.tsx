import type {
  ToolbarActionItem,
  ToolbarFilterItem,
} from "./";
import { BaseRecord } from "@refinedev/core";

interface RegisteredActionItem<TData extends BaseRecord> {
  id: string;
  item: ToolbarActionItem<TData>;
}

interface RegisteredFilterItem<TData extends BaseRecord> {
  id: string;
  item: ToolbarFilterItem<TData>;
}

// Module-level private state
const actions: Map<string, ToolbarActionItem<any>> = new Map();
const filters: Map<string, ToolbarFilterItem<any>> = new Map();

/**
 * Register a toolbar action item
 */
function registerAction<TData extends BaseRecord>(
  id: string,
  item: ToolbarActionItem<TData>,
): void {
  actions.set(id, item);
}

/**
 * Register a toolbar filter item
 */
function registerFilter<TData extends BaseRecord>(
  id: string,
  item: ToolbarFilterItem<TData>,
): void {
  filters.set(id, item as ToolbarFilterItem<any>);
}

/**
 * Get a registered action item by ID
 */
function getAction<TData extends BaseRecord>(
  id: string,
): ToolbarActionItem<TData> | undefined {
  return actions.get(id);
}

/**
 * Get a registered filter item by ID
 */
function getFilter<TData extends BaseRecord>(
  id: string,
): ToolbarFilterItem<TData> | undefined {
  return filters.get(id) as ToolbarFilterItem<TData> | undefined;
}

/**
 * Check if an action item exists
 */
function hasAction(id: string): boolean {
  return actions.has(id);
}

/**
 * Check if a filter item exists
 */
function hasFilter(id: string): boolean {
  return filters.has(id);
}

/**
 * Get all registered action items
 */
function listActions<
  TData extends BaseRecord,
>(): RegisteredActionItem<TData>[] {
  return Array.from(actions.entries()).map(([id, item]) => ({
    id,
    item: item as ToolbarActionItem<TData>,
  }));
}

/**
 * Get all registered filter items
 */
function listFilters<
  TData extends BaseRecord,
>(): RegisteredFilterItem<TData>[] {
  return Array.from(filters.entries()).map(([id, item]) => ({
    id,
    item: item as ToolbarFilterItem<TData>,
  }));
}

/**
 * Get all registered items
 */
function listAll<TData extends BaseRecord>() {
  return {
    actions: listActions<TData>(),
    filters: listFilters<TData>(),
  };
}

/**
 * Clear all registered items
 */
function clear(): void {
  actions.clear();
  filters.clear();
}

/**
 * Remove a specific action item
 */
function removeAction(id: string): boolean {
  return actions.delete(id);
}

/**
 * Remove a specific filter item
 */
function removeFilter(id: string): boolean {
  return filters.delete(id);
}

export {
  registerAction,
  getAction,
  registerFilter,
  getFilter,
  hasAction,
  hasFilter,
  listActions,
  listFilters,
  listAll,
  clear,
  removeAction,
  removeFilter,
};

export type {
  RegisteredActionItem,
  RegisteredFilterItem,
};
