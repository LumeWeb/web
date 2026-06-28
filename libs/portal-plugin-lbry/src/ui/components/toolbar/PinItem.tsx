"use client";

import React from "react";

import type { BaseRecord } from "@refinedev/core";
import { useNotification } from "@refinedev/core";
import {
  ToolbarCustomItem,
  ToolbarItemType,
  useDialog,
} from "@lumeweb/portal-framework-ui";
import { Button, lazyIcon } from "@lumeweb/portal-framework-ui-core";
import { createPinDialogConfig } from "@/ui/dialogs/pinDialog";
import { useLbryPinning } from "@/ui/hooks";
const Pin = lazyIcon("Pin");


export function PinItem<
  TData extends BaseRecord = any,
>(): ToolbarCustomItem<TData> {
  return {
    id: "add-pin",
    type: ToolbarItemType.CUSTOM,
    component: () => {
      const { openDialog } = useDialog();
      const { open } = useNotification();
      const { pinStreams, isMutating } = useLbryPinning();

      const handleClick = () => {
        const dialogConfig = createPinDialogConfig(
          async (sdHashes: string[]) => {
            await pinStreams(sdHashes);
          },
          open,
        );

        openDialog(dialogConfig);
      };

      return (
        <Button
          onClick={handleClick}
          title="Add new stream pins to LBRY"
          size="sm"
          variant="outline"
          disabled={isMutating}>
          <Pin className="mr-2 h-4 w-4" />
          Add Pin
        </Button>
      );
    },
  };
}
