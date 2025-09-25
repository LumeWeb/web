import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { DialogTypes, ForceRerenderCallback } from "@/components";
import {
  ActionListRenderer,
  AlertDialogConfig,
  createDialogActions,
  useForceRerender,
} from "@/components";
import { useDialogType } from "../utils/dialogDetection";

interface AlertDialogProps extends AlertDialogConfig {
  description?: React.FC | React.ReactNode | string;
  onClose?: (source?: "programmatic" | "user") => void;
  forceRerender?: ForceRerenderCallback;
}

export function AlertDialog({
  actions,
  classNames,
  description,
  forceRerender,
  onClose,
  onConfirm,
  title,
}: AlertDialogProps) {
  const dialogType = useDialogType();

  // Implement forceRerender mechanism
  useForceRerender(forceRerender);

  const renderDescription = () => {
    if (!description) return null;

    const content =
      typeof description === "function"
        ? React.createElement(description)
        : description;

    return (
      <DialogDescription className={classNames?.description}>
        {content}
      </DialogDescription>
    );
  };

  // Generate default actions for alert dialogs
  const defaultActions = createDialogActions({
    confirmLabel: "Continue",
    onConfirm,
    type: dialogType || DialogTypes.ALERT,
  });

  const finalActions = actions || defaultActions;

  return (
    <>
      <DialogHeader className={classNames?.header}>
        <DialogTitle className={classNames?.title}>{title}</DialogTitle>
        {renderDescription()}
      </DialogHeader>
      <ActionListRenderer
        actions={finalActions}
        closeDialog={onClose}
        layout="horizontal"
      />
    </>
  );
}
