import React from "react";
import {
  registerCustom,
  ToolbarCustomItem,
  ToolbarItemComponentProps,
} from "@/components/data-table";
import { BaseRecord } from "@refinedev/core";

interface ToolbarCustomItemComponentProps<TData extends BaseRecord>
  extends ToolbarItemComponentProps<TData> {
  item: ToolbarCustomItem<TData>;
}

function ToolbarCustomItemComponent<TData extends BaseRecord>({
  item,
}: ToolbarCustomItemComponentProps<TData>) {
  if (!item.component) {
    return null;
  }
  
  return <item.component {...item.props} />;
}

function registerCustomToolbarItem<TData extends BaseRecord>(
  id: string,
  item: ToolbarCustomItem<TData>,
) {
  registerCustom(id, item);
}

export { ToolbarCustomItemComponent, registerCustomToolbarItem };
