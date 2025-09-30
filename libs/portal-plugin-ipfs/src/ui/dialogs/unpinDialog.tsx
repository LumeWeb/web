import {
  ComponentSize,
  DialogTypes,
  ConfirmDialogConfig,
} from "@lumeweb/portal-framework-ui";
import { PinOff } from "lucide-react";
import {
  Button,
  cn,
  ScrollArea,
} from "@lumeweb/portal-framework-ui-core";


export function createUnpinDialogConfig(
  cid: string,
  onUnpin: (cid: string) => Promise<void>,
  open?: (options: any) => void,
): ConfirmDialogConfig {
  return {
    type: DialogTypes.CONFIRM,
    title: "Unpin from Account",
    description: `Are you sure you want to unpin CID: ${cid}? This may make the content unavailable if not stored elsewhere.`,
    confirmText: "Unpin from Account",
    cancelText: "Cancel",
    onConfirm: async () => {
      try {
        await onUnpin(cid);
        open?.({
          type: "success",
          message: "Content unpinned",
          description: "The content has been removed from your account",
        });
      } catch (error) {
        open?.({
          type: "error",
          message: "Failed to unpin content",
          description: "An error occurred while unpinning the content",
        });
        throw error;
      }
    },
    size: ComponentSize.DEFAULT,
  };
}
