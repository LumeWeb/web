import { DialogConfig, DialogTypes } from "@lumeweb/portal-framework-ui";

export function pruneDialogConfig(onConfirm: () => Promise<void> | void): DialogConfig {
  return {
    confirmText: "Clean Up",
    description:
      "This will scan your storage for orphaned data (chunks no longer referenced by any file) and remove them to reclaim space. This does not affect any of your active files or pinned data. This process may take a moment.",
    onConfirm,
    title: "Clean Up Storage",
    type: DialogTypes.CONFIRM,
  };
}
