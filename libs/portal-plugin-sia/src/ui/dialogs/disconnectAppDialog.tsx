import { DialogConfig, DialogTypes } from "@lumeweb/portal-framework-ui";

export function disconnectAppDialogConfig(
  appName: string,
  onConfirm: () => Promise<void> | void,
): DialogConfig {
  return {
    confirmText: "Disconnect",
    description: `Are you sure you want to disconnect "${appName}"? This will revoke its access to your private storage. The app will no longer be able to pin or retrieve data on your behalf. This action cannot be undone.`,
    onConfirm,
    title: "Disconnect App",
    type: DialogTypes.CONFIRM,
    variant: "destructive",
  };
}
