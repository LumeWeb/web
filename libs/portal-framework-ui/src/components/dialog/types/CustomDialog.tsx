import React from "react";

import type { ForceRerenderCallback } from "../../shared/types/form";

import { ActionListRenderer } from "../../actions";
import { createDialogActions } from "../../actions/actionHelpers";
import { renderHeader } from "../../shared";
import { CustomDialogConfig, DialogType } from "../Dialog.types";
import { useDialogType } from "../utils/dialogDetection";
import { useForceRerender } from "../../shared/hooks/useForceRerender";

interface CustomDialogProps extends CustomDialogConfig {
  /**
   * Optional callback function that receives a forceRerender method
   * The framework calls this callback with a method that can be stored locally
   * and used to force a rerender when something outside the render loop needs it
   */
  forceRerender?: ForceRerenderCallback;
  onClose?: () => void;
  onConfirm?: () => void;
}

export function CustomDialog({
  actions,
  classNames,
  content,
  description,
  forceRerender,
  header,
  onClose,
  onConfirm,
  title,
}: CustomDialogProps) {
  const dialogType = useDialogType();

  // Generate default actions for custom dialogs if actions are provided
  const defaultActions = createDialogActions({
    confirmLabel: "Continue",
    onConfirm,
    type: dialogType || DialogType.CONFIRM,
  });

  const finalActions = actions || defaultActions;

  // Implement forceRerender mechanism
  useForceRerender(forceRerender);

  return (
    <>
      {renderHeader({
        actions: finalActions,
        className: classNames?.header,
        description,
        dialogConfig: {
          actions: finalActions,
          description,
          header,
          title,
        } as CustomDialogConfig,
        header,
        isDialog: true,
        title,
        unifiedHeaderConfig: {
          actions: finalActions,
          description,
          header,
          title,
        } as CustomDialogConfig,
      })}
      <div className={classNames?.content}>{content}</div>
      <ActionListRenderer
        actions={finalActions}
        closeDialog={onClose}
        layout="horizontal"
      />
    </>
  );
}
