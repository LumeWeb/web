import { DialogHeader, DialogTitle } from "@lumeweb/portal-framework-ui-core";
import { BaseRecord } from "@refinedev/core";
import React from "react";

import { isStepFormConfig, SchemaForm, StepSchemaForm } from "../../form";
import { FormDialogConfig } from "../Dialog.types";

interface FormDialogProps<
  T extends BaseRecord = any,
  R extends BaseRecord = any,
> extends FormDialogConfig<T, R> {
  onClose: () => void;
}

export function FormDialog<
  T extends BaseRecord = any,
  R extends BaseRecord = any,
>({ formConfig, onClose, onSubmit, onSuccess, title }: FormDialogProps<T, R>) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      {isStepFormConfig(formConfig) ? (
        <StepSchemaForm
          closeDialog={onClose}
          config={{
            ...formConfig,
            onSubmit: onSubmit,
            onSuccess: onSuccess,
          }}
        />
      ) : (
        <SchemaForm
          closeDialog={onClose}
          config={{
            ...formConfig,
            onSubmit: onSubmit,
            onSuccess: onSuccess,
          }}
        />
      )}
    </>
  );
}
