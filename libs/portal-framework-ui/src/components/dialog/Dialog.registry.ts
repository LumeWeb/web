import { DialogConfig, DialogType } from "./Dialog.types";
import { AlertDialog } from "./types/AlertDialog";
import { ConfirmDialog } from "./types/ConfirmDialog";
import { CustomDialog } from "./types/CustomDialog";
import { FormDialog } from "./types/FormDialog";
import { WizardDialog } from "./types/WizardDialog";

export const dialogComponents = {
  [DialogType.ALERT]: AlertDialog,
  [DialogType.CONFIRM]: ConfirmDialog,
  [DialogType.CUSTOM]: CustomDialog,
  [DialogType.FORM]: FormDialog,
  [DialogType.WIZARD_FORM]: WizardDialog,
} as const;

export function getDialogComponent(type: DialogType) {
  return dialogComponents[type];
}

export function isRegisteredDialogType(
  config?: DialogConfig,
): config is DialogConfig & { type: DialogType } {
  return !!config && config.type in dialogComponents;
}
