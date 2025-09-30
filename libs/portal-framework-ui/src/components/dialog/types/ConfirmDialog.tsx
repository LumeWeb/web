import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
  cn,
} from "@lumeweb/portal-framework-ui-core";
import React from "react";

import type { ForceRerenderCallback } from "@/components";
import { useForceRerender } from "@/components";
import { ConfirmDialogConfig } from "../Dialog.types";

interface ConfirmDialogProps extends ConfirmDialogConfig {
  onClose?: () => void;
  forceRerender?: ForceRerenderCallback;
}

export function ConfirmDialog({
  classNames,
  description,
  forceRerender,
  title,
}: ConfirmDialogProps) {
  // Implement forceRerender mechanism
  useForceRerender(forceRerender);

  return (
    <>
      <DialogHeader className={classNames?.header}>
        <DialogTitle className={classNames?.title}>{title}</DialogTitle>
        {description && (
          <DialogDescription
            className={cn("[word-break:break-word]", classNames?.description)}>
            {description}
          </DialogDescription>
        )}
      </DialogHeader>
    </>
  );
}
