import { Button, cn } from "@lumeweb/portal-framework-ui-core";
import React from "react";
import { FilterGroup } from "./toolbarItems/FilterGroup";
import { FilterResolver } from "./toolbarItems/FilterResolver";

import {
  ExtendedToolbarItem,
  FilterConfig,
  ToolbarCustomItem,
  ToolbarFilterGroupItem,
  ToolbarFilterItem,
  ToolbarItem,
  ToolbarItemComponentProps,
} from "./DataTable.types";
import { ToolbarItemType } from "./DataTable.types";
import { BaseRecord } from "@refinedev/core";
import { getAction } from "./ToolbarRegistry";
import { useMobileDetection } from "./useMobileDetection";
import { ComponentSize } from "@lumeweb/portal-framework-ui-core";

// Registry for toolbar item renderers
type ToolbarItemRenderer<TData extends BaseRecord> = (
  item: ExtendedToolbarItem<TData>,
  commonProps: ToolbarItemComponentProps<TData>,
) => React.ReactNode;

const toolbarItemRenderers = new Map<string, ToolbarItemRenderer<any>>();

// Define core supported breakpoints
const coreSupported = new Set(["xs", "sm", "md", "lg", "xl", "2xl"]);

// Internal renderer components
function ActionItemRenderer<TData extends BaseRecord>(
  item: ExtendedToolbarItem<TData>,
  commonProps: ToolbarItemComponentProps<TData>,
  isMobile: boolean,
) {
  const actionItem = getAction<TData>(item.id);
  if (!actionItem) return null;

  // Use mobile size on small screens for better touch targets
  const buttonSize = isMobile ? "mobile" : actionItem.size;

  return (
    <Button
      className={actionItem.className}
      disabled={actionItem.disabled}
      onClick={() => actionItem.onClick(commonProps)}
      size={buttonSize}
      title={actionItem.tooltip}
      variant={actionItem.variant}>
      {actionItem.icon && <span className="mr-2">{actionItem.icon}</span>}
      {actionItem.label}
    </Button>
  );
}

function FilterItemRenderer<TData extends BaseRecord>(
  item: ExtendedToolbarItem<TData>,
  commonProps: ToolbarItemComponentProps<TData>,
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
  item: ExtendedToolbarItem<TData>,
  commonProps: ToolbarItemComponentProps<TData>,
) {
  const filterGroupItem = item as ToolbarFilterGroupItem<TData>;

  return <FilterGroup item={filterGroupItem} commonProps={commonProps} />;
}

function SeparatorItemRenderer<TData extends BaseRecord>(
  item: ExtendedToolbarItem<TData>,
  commonProps: ToolbarItemComponentProps<TData>,
) {
  return <div className="h-6 w-px bg-gray-300" />;
}

// Register default renderers
function registerDefaultRenderers() {
  // Action item renderer
  toolbarItemRenderers.set(ToolbarItemType.ACTION, ActionItemRenderer);
  toolbarItemRenderers.set(ToolbarItemType.FILTER, FilterItemRenderer);
  toolbarItemRenderers.set(
    ToolbarItemType.FILTER_GROUP,
    FilterGroupItemRenderer,
  );

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
    renderer: ToolbarItemRenderer<TData>,
  ) {
    toolbarItemRenderers.set(type, renderer);
  },

  /**
   * Get a registered renderer for a toolbar item type
   */
  get<TData extends BaseRecord>(
    type: string,
  ): ToolbarItemRenderer<TData> | undefined {
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
  item: ExtendedToolbarItem<TData>;
  /** Common props passed to all toolbar item components */
  commonProps: ToolbarItemComponentProps<TData>;
  /** Additional class name for the item container */
  className?: string;
}

function ToolbarRenderer<TData extends BaseRecord>({
  item,
  commonProps,
  className,
}: ToolbarRendererProps<TData>) {
  // Validate mobileBreakpoint value
  const mobileBreakpoint = commonProps.context?.toolbarConfig?.mobileBreakpoint;
  const candidate = Object.values(ComponentSize).includes(mobileBreakpoint as ComponentSize)
    ? mobileBreakpoint
    : mobileBreakpoint;
  
  const breakpointName =
    typeof candidate === "string" && !coreSupported.has(candidate)
      ? ComponentSize.SM
      : candidate;

  // Check if we're on mobile to adjust button sizing
  const { isMobile } = useMobileDetection({
    breakpoint: breakpointName || ComponentSize.SM,
  });

  const containerClassName = cn(
    "flex items-center",
    item.type === ToolbarItemType.SEPARATOR && "mx-2",
    className,
  );

  // Handle CUSTOM type items directly
  if (item.type === ToolbarItemType.CUSTOM) {
    const customItem = item as ToolbarCustomItem<TData>;
    const CustomComponent = customItem.component;

    if (CustomComponent) {
      return (
        <div className={containerClassName}>
          <CustomComponent {...commonProps} />
        </div>
      );
    }

    return null;
  }

  const renderer = ToolbarRendererRegistry.get<TData>(item.type);

  if (!renderer) {
    console.warn(`No renderer registered for toolbar item type: ${item.type}`);
    return null;
  }

  const renderedItem = renderer(item, commonProps, isMobile);

  return <div className={containerClassName}>{renderedItem}</div>;
}

export { ToolbarRenderer };
