import { DialogDescription, DialogHeader, DialogTitle } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { DialogBaseConfig } from "../Dialog.types";

interface AlertDialogProps extends DialogBaseConfig {
  onClose: () => void;
}

export function AlertDialog({
  classNames,
  description,
  title,
}: AlertDialogProps) {
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
