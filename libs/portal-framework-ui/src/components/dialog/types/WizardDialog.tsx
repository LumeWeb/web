"use client";

import { DialogHeader } from "@lumeweb/portal-framework-ui-core";
import { DialogTitle } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import type { WizardDialogConfig } from "../Dialog.types";

import { WizardForm } from "../../form/WizardForm";

interface WizardDialogProps<TRequest, TResponse>
  extends WizardDialogConfig<TRequest, TResponse> {
  onClose?: () => void;
}

export function WizardDialog<
  TRequest extends Record<string, any>,
  TResponse extends Record<string, any>,
>({
  formConfig,
  onClose,
  onSubmit,
  onSuccess,
  title,
  ...props
}: WizardDialogProps<TRequest, TResponse>) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <WizardForm
        closeDialog={onClose}
        config={formConfig}
        onSubmit={onSubmit}
        onSuccess={onSuccess}
        {...props}
      />
    </>
  );
}
