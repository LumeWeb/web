import {
  ComponentSize,
  ConfirmDialogConfig,
  DialogTypes,
} from "@lumeweb/portal-framework-ui";

export function createUnpinDialogConfig(
  sdHash: string,
  streamName: string,
  onUnpin: (sdHash: string) => Promise<void>,
  open?: (options: any) => void,
): ConfirmDialogConfig {
  const displayName = streamName || sdHash;

  return {
    type: DialogTypes.CONFIRM,
    title: "Unpin Stream",
    description: `Are you sure you want to unpin "${displayName}"? This action cannot be undone.`,
    confirmText: "Unpin",
    cancelText: "Cancel",
    onConfirm: async () => {
      try {
        await onUnpin(sdHash);
      } catch (error) {
        open?.({
          type: "error",
          message: "Failed to Unpin Stream",
          description: "An error occurred while unpinning the stream",
        });
        throw error;
      }
    },
    variant: "destructive",
    size: ComponentSize.MD,
  };
}
