import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { ActionListRenderer } from "../../actions";
import { DialogBaseConfig } from "../Dialog.types";
import { getDefaultDialogActions } from "../utils/dialogActions";

interface AlertDialogProps extends DialogBaseConfig {
  description?: React.FC | React.ReactNode | string;
  onClose: (source?: "programmatic" | "user") => void;
}

export function AlertDialog({
  classNames,
  description,
  title,
}: AlertDialogProps) {
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
