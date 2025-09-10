import { renderHeader } from "../shared";
import { DialogConfig, isFormDialog, isWizardDialogConfig } from "./Dialog.types";

interface DialogHeaderContentProps<T = any> {
  currentDialog: DialogConfig<T>;
}

export function DialogHeaderContent<T = any>({
  currentDialog,
}: DialogHeaderContentProps<T>) {
  // Type guard to safely access formConfig
  const hasFormConfig = isFormDialog(currentDialog) || isWizardDialogConfig(currentDialog);
  const formConfig = hasFormConfig ? currentDialog.formConfig : undefined;

  // Skip rendering for form dialogs and wizard dialogs since they handle their own headers
  if (hasFormConfig) {
    return null;
  }
  
  return renderHeader({
    actions: currentDialog.actions,
    className: currentDialog.classNames?.header,
    description: currentDialog.description,
    dialogConfig: currentDialog,
    header: currentDialog.header,
    isDialog: true,
    title: currentDialog.title,
    unifiedHeaderConfig: currentDialog,
  });
}
