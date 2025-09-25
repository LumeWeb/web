import { DialogConfig, DialogType, DialogTypes } from "./Dialog.types";
import { AlertDialog } from "./types/AlertDialog";
import { ConfirmDialog } from "./types/ConfirmDialog";
import { CustomDialog } from "./types/CustomDialog";
import { FormDialog } from "./types/FormDialog";
import { WizardDialog } from "./types/WizardDialog";

// TODO: use DialogTypes enum after solving bundler ordering problem
export const dialogComponents = {
  alert: AlertDialog,
  confirm: ConfirmDialog,
  custom: CustomDialog,
  form: FormDialog,
  wizard_form: WizardDialog,
} as const;

export function getDialogComponent(type: DialogType) {
  return dialogComponents[type];
}

export function isRegisteredDialogType(
  config?: DialogConfig,
): config is DialogConfig & { type: DialogType } {
  return !!config && config.type in dialogComponents;
}
