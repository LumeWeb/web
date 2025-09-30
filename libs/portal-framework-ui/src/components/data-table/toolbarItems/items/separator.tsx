import React from "react";
import {
  registerAction,
  ToolbarItemComponentProps,
  ToolbarItemType,
  ToolbarSeparatorItem,
} from "@/components/data-table";
import { BaseRecord } from "@refinedev/core";

interface ToolbarSeparatorItemComponentProps<TData extends BaseRecord>
  extends ToolbarItemComponentProps<TData> {
  item: ToolbarSeparatorItem;
}

function ToolbarSeparatorItemComponent<TData extends BaseRecord>({
  item,
}: ToolbarSeparatorItemComponentProps<TData>) {
  return <div className="h-6 w-px bg-gray-300" />;
}

function registerSeparatorToolbarItem<TData extends BaseRecord>(
  id: string,
  item: Omit<ToolbarSeparatorItem, "type"> & {
    type?: ToolbarItemType.SEPARATOR;
  },
) {
  const separatorItem = {
    ...item,
    type: ToolbarItemType.SEPARATOR,
    component: ToolbarSeparatorItemComponent,
  } as any;

  registerAction(id, separatorItem);
}

export { ToolbarSeparatorItemComponent, registerSeparatorToolbarItem };
