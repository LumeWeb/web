import { BaseRecord } from "@refinedev/core";
import React from "react";

import { useDialogActions, useDialogState } from "./Dialog.context";
import { getDialogComponent, isRegisteredDialogType } from "./Dialog.registry";
import {
  contextProviders,
  DialogConfig,
  dialogContextRequirements,
  getFormTypeFromDialog,
  isFormDialog,
  isWizardDialogConfig,
} from "./Dialog.types";
import { DialogContainer } from "./DialogContainer";
import { DialogContent as DialogContentComponent } from "./DialogContent";
import { DialogFooterContent } from "./DialogFooterContent";
import { DialogHeaderContent } from "./DialogHeaderContent";

export function DialogComponent<T extends BaseRecord = BaseRecord>(
  props: DialogConfig<T>,
) {
  const DialogComp = getDialogComponent(props.type);
  if (!DialogComp) {
    console.warn(`No component registered for dialog type: ${props.type}`);
    return null;
  }
  return <DialogComp {...props} />;
}

export function DialogRenderer() {
  const { currentDialog, formMethods } = useDialogState();
  const { closeDialog } = useDialogActions();

  if (!currentDialog) return null;

  // Compute form type for form dialogs and include it in formConfig
  let dialogWithFormType = currentDialog;
  if (
    isRegisteredDialogType(currentDialog) &&
    (isFormDialog(currentDialog) || isWizardDialogConfig(currentDialog))
  ) {
    const formType = getFormTypeFromDialog(currentDialog);
    dialogWithFormType = {
      ...currentDialog,
      formConfig: {
        ...currentDialog.formConfig,
        type: formType,
      },
    };
  }

  // Determine what contexts this dialog type needs
  const requiredContexts =
    dialogContextRequirements[dialogWithFormType.type] || [];

  // Build the base dialog content
  let dialogContent = (
    <>
      <DialogHeaderContent currentDialog={currentDialog} />
      <DialogContentComponent
        currentDialog={currentDialog}
        dialogWithFormType={dialogWithFormType}
      />
      <DialogFooterContent
        currentDialog={currentDialog}
        onCancel={closeDialog}
      />
    </>
  );

  // Dynamically wrap with required context providers
  // Process in reverse order to maintain proper nesting
  requiredContexts.forEach((contextName) => {
    const ProviderComponent = contextProviders[contextName];
    if (ProviderComponent) {
      dialogContent = (
        <ProviderComponent
          dialog={dialogWithFormType}
          formMethods={formMethods}>
          {dialogContent}
        </ProviderComponent>
      );
    }
  });

  return (
    <DialogContainer currentDialog={currentDialog}>
      {dialogContent}
    </DialogContainer>
  );
}
