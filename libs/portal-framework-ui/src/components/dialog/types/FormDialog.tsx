import { DialogHeader, DialogTitle } from "@lumeweb/portal-framework-ui-core";
import { BaseRecord } from "@refinedev/core";
import React from "react";

import { createFormActions } from "../../actions/actionHelpers";
import { isStepFormConfig, SchemaForm, StepSchemaForm } from "../../form";
import { FormDialogConfig } from "../Dialog.types";
import { useIsFormDialog } from "../utils/dialogDetection";
import { useForceRerender } from "../../shared/hooks/useForceRerender";
import type { ForceRerenderCallback } from "../../shared/types/form";

interface FormDialogProps<
  T extends BaseRecord = any,
  R extends BaseRecord = any,
> extends FormDialogConfig<T, R> {
  isSubmitting?: boolean;
  onClose?: () => void;
}

export function FormDialog<
  T extends BaseRecord = any,
  R extends BaseRecord = any,
>({
  actions,
  formConfig,
  isSubmitting,
  onClose,
  onSubmit,
  onSuccess,
  showCancel = true,
  submitLabel,
  title,
}: FormDialogProps<T, R>) {
  const isInFormDialog = useIsFormDialog();
  
  // Implement forceRerender mechanism
  useForceRerender(formConfig.forceRerender);

  // Generate default actions for form dialogs
  const defaultActions = createFormActions({
    cancelLabel: "Cancel",
    isSubmitting,
    onCancel: onClose,
    onSubmit,
    showCancel,
    submitLabel,
  });

  const finalActions = actions || defaultActions;

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
            actionButtons: finalActions,
            onSubmit: onSubmit,
            onSuccess: onSuccess,
          }}
        />
      ) : (
        <SchemaForm
          closeDialog={onClose}
          config={{
            ...formConfig,
            actionButtons: finalActions,
            onSubmit: onSubmit,
            onSuccess: onSuccess,
          }}
        />
      )}
    </>
  );
}
