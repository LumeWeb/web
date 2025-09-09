import type { BaseRecord } from "@refinedev/core";

import { DialogFooter } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { FormFooter } from "../../form/FormFooter";
import { FooterComponentProps } from "./DialogFooter.registry";

export function FormDialogFooter<T extends BaseRecord = any>({
  className,
  closeDialog,
  currentDialog,
  formMethods,
}: FooterComponentProps<T>): React.JSX.Element {
  if (!currentDialog.formConfig) return null;

  // Render regular FormFooter for non-wizard form dialogs
  return (
    <DialogFooter className={className}>
      <FormFooter
        closeDialog={closeDialog}
        config={currentDialog.formConfig}
        formMethods={formMethods}
      />
    </DialogFooter>
  );
}
