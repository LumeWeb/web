import { DialogConfig, DialogTypes } from "@lumeweb/portal-framework-ui";

export function deleteDeviceDialogConfig(
  deviceName: string,
  onConfirm: () => void,
): DialogConfig {
  return {
    confirmText: "Delete",
    description: `Are you sure you want to remove "${deviceName}" from your device list? This action cannot be undone.`,
    onConfirm,
    title: "Delete Device",
    type: DialogTypes.CONFIRM,
    variant: "destructive",
  };
}
