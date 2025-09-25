import type {
  ToolbarActionItem,
  ToolbarCustomItem,
  ToolbarFilterItem,
} from "./";
import { BaseRecord } from "@refinedev/core";

interface RegisteredActionItem<TData extends BaseRecord> {
  id: string;
  item: ToolbarActionItem<TData>;
}

interface RegisteredCustomItem<TData extends BaseRecord> {
  id: string;
  item: ToolbarCustomItem<TData>;
}

interface RegisteredFilterItem<TData extends BaseRecord> {
  id: string;
  item: ToolbarFilterItem<TData>;
}

// Module-level private state
const actions: Map<string, ToolbarActionItem<any>> = new Map();
const filters: Map<string, ToolbarFilterItem<any>> = new Map();
const customs: Map<string, ToolbarCustomItem<any>> = new Map();

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
 * Register a toolbar custom item
 */
function registerCustom<TData extends BaseRecord>(
  id: string,
  item: ToolbarCustomItem<TData>,
): void {
  customs.set(id, item);
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
 * Get a registered custom item by ID
 */
function getCustom<TData extends BaseRecord>(
  id: string,
): ToolbarCustomItem<TData> | undefined {
  return customs.get(id);
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
 * Check if a custom item exists
 */
function hasCustom(id: string): boolean {
  return customs.has(id);
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
 * Get all registered custom items
 */
function listCustoms<
  TData extends BaseRecord,
>(): RegisteredCustomItem<TData>[] {
  return Array.from(customs.entries()).map(([id, item]) => ({
    id,
    item: item as ToolbarCustomItem<TData>,
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
    customs: listCustoms<TData>(),
  };
}

/**
 * Clear all registered items
 */
function clear(): void {
  actions.clear();
  filters.clear();
  customs.clear();
}

/**
 * Remove a specific action item
 */
function removeAction(id: string): boolean {
  return actions.delete(id);
}

/**
 * Remove a specific custom item
 */
function removeCustom(id: string): boolean {
  return customs.delete(id);
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
  registerCustom,
  getCustom,
  registerFilter,
  getFilter,
  hasAction,
  hasCustom,
  hasFilter,
  listActions,
  listCustoms,
  listFilters,
  listAll,
  clear,
  removeAction,
  removeCustom,
  removeFilter,
};

export type {
  RegisteredActionItem,
  RegisteredFilterItem,
  RegisteredCustomItem,
};
