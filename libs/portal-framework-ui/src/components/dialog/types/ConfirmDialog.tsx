import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@lumeweb/portal-framework-ui-core";
import React from "react";

import type { ForceRerenderCallback } from "@/components";
import {
  ActionListRenderer,
  createDialogActions,
  useForceRerender,
} from "@/components";
import { ConfirmDialogConfig, DialogTypes } from "../Dialog.types";
import { useDialogType } from "../utils/dialogDetection";

interface ConfirmDialogProps extends ConfirmDialogConfig {
  onClose?: () => void;
  forceRerender?: ForceRerenderCallback;
}

export function ConfirmDialog({
  actions,
  cancelText,
  classNames,
  confirmText,
  description,
  forceRerender,
  onCancel,
  onClose,
  onConfirm,
  title,
}: ConfirmDialogProps) {
  const dialogType = useDialogType();

  // Implement forceRerender mechanism
  useForceRerender(forceRerender);

  // Generate default actions for confirm dialogs
  const defaultActions = createDialogActions({
    cancelLabel: cancelText || "Cancel",
    confirmLabel: confirmText || "Continue",
    onCancel: onCancel || onClose,
    onConfirm,
    type: dialogType || DialogTypes.CONFIRM,
  });

  const finalActions = actions || defaultActions;

  return (
    <>
      <DialogHeader className={classNames?.header}>
        <DialogTitle className={classNames?.title}>{title}</DialogTitle>
        {description && (
          <DialogDescription className={classNames?.description}>
            {description}
          </DialogDescription>
        )}
      </DialogHeader>
      <ActionListRenderer
        actions={finalActions}
        closeDialog={onClose}
        layout="horizontal"
      />
    </>
  );
}
