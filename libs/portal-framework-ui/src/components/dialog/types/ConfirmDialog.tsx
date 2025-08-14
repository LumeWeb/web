import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { ConfirmDialogConfig } from "../Dialog.types";

interface ConfirmDialogProps extends ConfirmDialogConfig {
  onClose: () => void;
}

export function ConfirmDialog({
  classNames,
  description,
  title,
}: ConfirmDialogProps) {
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
    </>
  );
}
