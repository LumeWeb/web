import { Button, cn } from "@lumeweb/portal-framework-ui-core";
import React from "react";
import { FilterGroup } from "./toolbarItems/FilterGroup";
import { FilterResolver } from "./toolbarItems/FilterResolver";

import type { 
  ToolbarItem, 
  ToolbarItemComponentProps, 
  ToolbarFilterItem,
  ToolbarFilterGroupItem,
  FilterConfig 
} from "./DataTable.types";
import { ToolbarItemType } from "./DataTable.types";
import { BaseRecord } from "@refinedev/core";
import { Filter } from "lucide-react";
import {
  getAction,
  getFilter,
  getCustom,
} from "./ToolbarRegistry";

// Registry for toolbar item renderers
type ToolbarItemRenderer<TData extends BaseRecord> = (
  item: ToolbarItem<TData>,
  commonProps: ToolbarItemComponentProps<TData>
) => React.ReactNode;

const toolbarItemRenderers = new Map<string, ToolbarItemRenderer<any>>();

// Internal renderer components
function ActionItemRenderer<TData extends BaseRecord>(
  item: ToolbarItem<TData>,
  commonProps: ToolbarItemComponentProps<TData>
) {
  const actionItem = getAction<TData>(item.id);
  if (!actionItem) return null;

  return (
    <Button
      className={actionItem.className}
      disabled={actionItem.disabled}
      onClick={() => actionItem.onClick(commonProps)}
      size={actionItem.size}
      title={actionItem.tooltip}
      variant={actionItem.variant}>
      {actionItem.icon && <span className="mr-2">{actionItem.icon}</span>}
      {actionItem.label}
    </Button>
  );
}

function FilterItemRenderer<TData extends BaseRecord>(
  item: ToolbarItem<TData>,
  commonProps: ToolbarItemComponentProps<TData>
) {
  const filterItem = item as ToolbarFilterItem<TData>;
  
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium">{filterItem.label}</label>
      <FilterResolver filterItem={filterItem} commonProps={commonProps} />
    </div>
  );
}

function FilterGroupItemRenderer<TData extends BaseRecord>(
  item: ToolbarItem<TData>,
  commonProps: ToolbarItemComponentProps<TData>
) {
  const filterGroupItem = item as ToolbarFilterGroupItem<TData>;
  
  return (
    <FilterGroup 
      item={filterGroupItem} 
      commonProps={commonProps} 
    />
  );
}

function CustomItemRenderer<TData extends BaseRecord>(
  item: ToolbarItem<TData>,
  commonProps: ToolbarItemComponentProps<TData>
) {
  const customItem = getCustom<TData>(item.id);
  if (!customItem) return null;
  return <customItem.component {...commonProps} />;
}

function SeparatorItemRenderer<TData extends BaseRecord>(
  item: ToolbarItem<TData>,
  commonProps: ToolbarItemComponentProps<TData>
) {
  return <div className="h-6 w-px bg-gray-300" />;
}

// Register default renderers
function registerDefaultRenderers() {
  // Action item renderer
  toolbarItemRenderers.set(ToolbarItemType.ACTION, ActionItemRenderer);
  toolbarItemRenderers.set(ToolbarItemType.FILTER, FilterItemRenderer);
  toolbarItemRenderers.set(ToolbarItemType.FILTER_GROUP, FilterGroupItemRenderer);
  toolbarItemRenderers.set(ToolbarItemType.CUSTOM, CustomItemRenderer);

  // Separator item renderer
  toolbarItemRenderers.set(ToolbarItemType.SEPARATOR, SeparatorItemRenderer);
}

// Initialize default renderers
registerDefaultRenderers();

// Registry API
export const ToolbarRendererRegistry = {
  /**
   * Register a custom renderer for a toolbar item type
   */
  register<TData extends BaseRecord>(
    type: string,
    renderer: ToolbarItemRenderer<TData>
  ) {
    toolbarItemRenderers.set(type, renderer);
  },

  /**
   * Get a registered renderer for a toolbar item type
   */
  get<TData extends BaseRecord>(type: string): ToolbarItemRenderer<TData> | undefined {
    return toolbarItemRenderers.get(type);
  },

  /**
   * Check if a renderer is registered for a type
   */
  has(type: string): boolean {
    return toolbarItemRenderers.has(type);
  },

  /**
   * Remove a registered renderer
   */
  remove(type: string): boolean {
    return toolbarItemRenderers.delete(type);
  },

  /**
   * Clear all registered renderers
   */
  clear() {
    toolbarItemRenderers.clear();
    registerDefaultRenderers(); // Re-register defaults
  },

  list(): string[] {
    return Array.from(toolbarItemRenderers.keys());
  },
};

interface ToolbarRendererProps<TData extends BaseRecord> {
  /** The toolbar item to render */
  item: ToolbarItem<TData>;
  /** Common props passed to all toolbar item components */
  commonProps: ToolbarItemComponentProps<TData>;
  /** Additional class name for the item container */
  className?: string;
}

function ToolbarRenderer<TData extends BaseRecord>({
  item,
  commonProps,
  className
}: ToolbarRendererProps<TData>) {
  const containerClassName = cn(
    "flex items-center",
    item.type === "separator" && "mx-2",
    className
  );

  const renderer = ToolbarRendererRegistry.get<TData>(item.type);

  if (!renderer) {
    console.warn(`No renderer registered for toolbar item type: ${item.type}`);
    return null;
  }

  const renderedItem = renderer(item, commonProps);

  return (
    <div className={containerClassName}>
      {renderedItem}
    </div>
  );
}

export { ToolbarRenderer };
