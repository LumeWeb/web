import { DialogConfig } from "./Dialog.types";
import { AlertDialog } from "./types/AlertDialog";
import { ConfirmDialog } from "./types/ConfirmDialog";
import { CustomDialog } from "./types/CustomDialog";
import { FormDialog } from "./types/FormDialog";

export const dialogComponents = {
  alert: AlertDialog,
  confirm: ConfirmDialog,
  custom: CustomDialog,
  form: FormDialog,
} as const;

export type DialogType = keyof typeof dialogComponents;

export function getDialogComponent(type: DialogType) {
  return dialogComponents[type];
}

export function isRegisteredDialogType(
  config?: DialogConfig,
): config is DialogConfig & { type: DialogType } {
  return !!config && config.type in dialogComponents;
}
