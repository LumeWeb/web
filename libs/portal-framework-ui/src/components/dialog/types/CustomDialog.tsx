import React from "react";

import type { ForceRerenderCallback } from "../../shared/types/form";

import { CustomDialogConfig } from "../Dialog.types";
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
  // Implement forceRerender mechanism
  useForceRerender(forceRerender);

  return (
    <>
      <div className={classNames?.content}>{content}</div>
    </>
  );
}
