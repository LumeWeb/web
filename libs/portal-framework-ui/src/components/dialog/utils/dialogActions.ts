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

  // For alerts, we only want the cancel action (which uses confirmText)
  if (dialog.type === "alert") {
    const cancelAction = createCancelAction(dialog);
    if (cancelAction) {
      actions.push(cancelAction);
    }
    return actions;
  }

  // For confirm dialogs, always include both cancel and confirm actions
  if (dialog.type === "confirm") {
    actions.push(createCancelAction(dialog)!); // Confirm dialogs always have cancel
    actions.push(createSubmitAction(dialog, isSubmitting));
    return actions;
  }

  // For other dialog types (like form), include both cancel and submit actions
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
  if (dialog.type === "alert") {
    // For alerts, we use confirmText but treat it as CANCEL type
    return {
      label: dialog.confirmText ?? "OK",
      onClick: dialog.onConfirm,
      type: ActionItemType.CANCEL,
    };
  }

  // Confirm dialogs always have a cancel action
  if (dialog.type === "confirm") {
    return {
      label: dialog.cancelText ?? "Cancel",
      onClick: dialog.onConfirm,
      type: ActionItemType.CANCEL,
    };
  }

  const hasCancelText = "cancelText" in dialog && dialog.cancelText;
  const isForm = dialog.type === "form";

  if (!hasCancelText && !isForm) {
    return null;
  }

  const actionConfig: ActionItemConfig = {
    label: getCancelLabel(dialog),
    type: ActionItemType.CANCEL,
  };

  if (isForm && dialog.onCancel) {
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
    case "alert":
      return dialog.confirmText ?? "OK";
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
    case "confirm":
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
