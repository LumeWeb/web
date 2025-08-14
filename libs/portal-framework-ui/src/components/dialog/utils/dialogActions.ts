import { BaseRecord } from "@refinedev/core";

import { ActionItemType, CancelActionItemConfig } from "../../actions";
import { ActionItemConfig } from "../../actions/types";
import { FormConfig } from "../../form/types";
import {
  AlertDialogConfig,
  ConfirmDialogConfig,
  FormDialogConfig,
} from "../Dialog.types";

export function getDefaultDialogActions<T extends BaseRecord = any>(
  dialog: AlertDialogConfig | ConfirmDialogConfig | FormDialogConfig<T>,
  isSubmitting = false,
): ActionItemConfig[] {
  const actions: ActionItemConfig[] = [];
  const cancelAction = createCancelAction(dialog);

  if (cancelAction) {
    actions.push(cancelAction);
  }

  actions.push(createSubmitAction(dialog, isSubmitting));
  return actions;
}

export function getDefaultFormActions<T extends BaseRecord = any>(
  formConfig: FormConfig<T> | FormDialogConfig<T, any>,
  isSubmitting = false,
): ActionItemConfig[] {
  // Return empty array if actionButtons is explicitly false
  if (formConfig.actionButtons === false) {
    return [];
  }

  const actions: ActionItemConfig[] = [];

  // Handle FormDialogConfig case
  if (isFormDialogConfig(formConfig)) {
    const cancelAction = createCancelAction(formConfig);
    if (cancelAction) {
      actions.push(cancelAction);
    }
    actions.push(createSubmitAction(formConfig, isSubmitting));
  }
  // Handle plain FormConfig case
  else {
    actions.push({
      disabled: isSubmitting,
      label: formConfig.submitLabel ?? "Submit",
      type: ActionItemType.SUBMIT,
    });
  }

  return actions;
}

function createCancelAction(
  dialog:
    | AlertDialogConfig
    | ConfirmDialogConfig
    | FormDialogConfig<BaseRecord>,
): ActionItemConfig | null {
  const isConfirmOrForm = dialog.type === "confirm" || dialog.type === "form";
  const hasCancelText = "cancelText" in dialog && dialog.cancelText;

  if (!isConfirmOrForm && !hasCancelText) {
    return null;
  }

  const actionConfig: ActionItemConfig = {
    label: getCancelLabel(dialog),
    type: ActionItemType.CANCEL,
  };

  if (dialog.type === "form" && dialog.onCancel) {
    actionConfig.onClick = () => dialog.onCancel?.("user");
  }

  return actionConfig;
}

function createSubmitAction(
  dialog:
    | AlertDialogConfig
    | ConfirmDialogConfig
    | FormDialogConfig<BaseRecord>,
  isSubmitting: boolean,
): ActionItemConfig {
  return {
    disabled: isSubmitting,
    label: getSubmitLabel(dialog),
    type: getSubmitType(dialog),
    ...(dialog.variant && { props: { variant: dialog.variant } }),
  };
}

function getCancelLabel(
  dialog:
    | AlertDialogConfig
    | ConfirmDialogConfig
    | FormDialogConfig<BaseRecord>,
): string {
  switch (dialog.type) {
    case "confirm":
      return dialog.cancelText;
    default:
      if ("cancelText" in dialog && dialog.cancelText) {
        return dialog.cancelText;
      }
      return "Cancel";
  }
}

function getSubmitLabel(
  dialog:
    | AlertDialogConfig
    | ConfirmDialogConfig
    | FormDialogConfig<BaseRecord>,
): string {
  switch (dialog.type) {
    case "form":
      return "Submit";
    default:
      return dialog.confirmText ?? "Continue";
  }
}

function getSubmitType(
  dialog:
    | AlertDialogConfig
    | ConfirmDialogConfig
    | FormDialogConfig<BaseRecord>,
): ActionItemType.BUTTON | ActionItemType.SUBMIT {
  switch (dialog.type) {
    case "form":
      return ActionItemType.SUBMIT;
    default:
      return ActionItemType.BUTTON;
  }
}

function isFormDialogConfig<T extends BaseRecord = any>(
  config: FormConfig<T> | FormDialogConfig<T, any>,
): config is FormDialogConfig<T, any> {
  return "type" in config && config.type === "form";
}
