import { DialogHeader, DialogTitle } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { CustomDialogConfig } from "../Dialog.types";

interface CustomDialogProps extends CustomDialogConfig {
  onClose: () => void;
}

export function CustomDialog({
  classNames,
  content,
  title,
}: CustomDialogProps) {
  return (
    <>
      <DialogHeader className={classNames?.header}>
        <DialogTitle className={classNames?.title}>{title}</DialogTitle>
      </DialogHeader>
      <div className={classNames?.content}>{content}</div>
    </>
  );
}
