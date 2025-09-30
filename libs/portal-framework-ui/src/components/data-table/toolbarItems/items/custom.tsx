import React from "react";
import {
  ToolbarCustomItem,
  ToolbarItemComponentProps,
} from "@/components/data-table";
import { BaseRecord } from "@refinedev/core";
import { registerAction } from "@/components/data-table/ToolbarRegistry";

interface ToolbarCustomItemComponentProps<TData extends BaseRecord>
  extends ToolbarItemComponentProps<TData> {
  item: ToolbarCustomItem<TData>;
}

function ToolbarCustomItemComponent<TData extends BaseRecord>({
  item,
  ...wrapperProps
}: ToolbarCustomItemComponentProps<TData>) {
  if (!item.component) {
    return null;
  }
  
  return <item.component {...wrapperProps} {...item.props} />;
}

function registerCustomToolbarItem<TData extends BaseRecord>(
  id: string,
  item: ToolbarCustomItem<TData>,
) {
  registerAction(id, item);
}

export { ToolbarCustomItemComponent, registerCustomToolbarItem };
