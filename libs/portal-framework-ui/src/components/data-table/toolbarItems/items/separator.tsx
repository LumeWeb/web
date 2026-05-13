import React from "react";
import { registerAction } from "@/components/data-table/ToolbarRegistry";
import type { ToolbarItemComponentProps } from "@/components/data-table/DataTable.types";
import { ToolbarItemType } from "@/components/data-table/DataTable.types";
import type { ToolbarSeparatorItem } from "@/components/data-table/DataTable.types";
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
