"use client";

import React from "react";
import { Pin } from "lucide-react";
import type { BaseRecord } from "@refinedev/core";
import {
  ToolbarCustomItem,
  useDialog,
  ToolbarItemType,
} from "@lumeweb/portal-framework-ui";
import { Button } from "@lumeweb/portal-framework-ui-core";
import { createPinDialogConfig } from "@/ui/dialogs/pinDialog";
import { useFileManagerFeature } from "@/ui/hooks/useFileManagerFeature";
import { useNotification } from "@refinedev/core";

export function PinItem<
  TData extends BaseRecord = any,
>(): ToolbarCustomItem<TData> {
  const { openDialog } = useDialog();
  const { open } = useNotification();

  return {
    id: "add-pin",
    type: ToolbarItemType.CUSTOM,
    component: () => {
      const { getHeliaService } = useFileManagerFeature();

      const handleClick = () => {
        // Open pin dialog for adding new pins
        const dialogConfig = createPinDialogConfig(async (cids: string[]) => {
          try {
            const heliaService = getHeliaService();

            // Pin each CID using Helia
            for (const cid of cids) {
              await heliaService.pinCid(cid);
            }

            // Show success feedback
            console.log(`Successfully pinned ${cids.length} CID(s)`);
          } catch (error) {
            console.error("Failed to pin CIDs:", error);
            throw error;
          }
        }, open);

        openDialog(dialogConfig);
      };

      return (
        <Button
          onClick={handleClick}
          title="Add new pins to IPFS"
          size="sm"
          variant="outline">
          <Pin className="mr-2 h-4 w-4" />
          Add Pin
        </Button>
      );
    },
  };
}
