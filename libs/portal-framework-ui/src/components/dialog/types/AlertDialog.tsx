import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { ForceRerenderCallback } from "@/components";
import {
  AlertDialogConfig,
  useForceRerender,
} from "@/components";

interface AlertDialogProps extends AlertDialogConfig {
  description?: React.FC | React.ReactNode | string;
  onClose?: (source?: "programmatic" | "user") => void;
  forceRerender?: ForceRerenderCallback;
}

export function AlertDialog({
  classNames,
  description,
  forceRerender,
  title,
}: AlertDialogProps) {
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

  return (
    <>
      <DialogHeader className={classNames?.header}>
        <DialogTitle className={classNames?.title}>{title}</DialogTitle>
        {renderDescription()}
      </DialogHeader>
    </>
  );
}
