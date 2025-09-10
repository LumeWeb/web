import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { ActionListRenderer } from "../../actions";
import { createDialogActions } from "../../actions/actionHelpers";
import { ConfirmDialogConfig, DialogType } from "../Dialog.types";
import { useDialogType } from "../utils/dialogDetection";
import { useForceRerender } from "../../shared/hooks/useForceRerender";
import type { ForceRerenderCallback } from "../../shared/types/form";

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
    type: dialogType || DialogType.CONFIRM,
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
