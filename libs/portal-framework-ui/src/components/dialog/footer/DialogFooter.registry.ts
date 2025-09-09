import { BaseRecord } from "@refinedev/core";
import React from "react";

import type { DialogBaseConfig, DialogConfig } from "../Dialog.types";

import { isWizardDialogConfig } from "../Dialog.types";
import { ActionsDropdownFooter } from "./ActionsDropdownFooter";
import { DefaultDialogFooter } from "./DefaultDialogFooter";
import { FormDialogFooter } from "./FormDialogFooter";
import { WizardFormDialogFooter } from "./WizardFormDialogFooter";

export interface FooterComponentProps<T extends BaseRecord = any> {
  /** Additional class name for the footer component */
  className?: string;
  /** Function to close the dialog */
  closeDialog: (source?: "programmatic" | "user") => void;
  /** Current dialog configuration */
  currentDialog: DialogBaseConfig<T>;
  /** Form methods from react-hook-form */
  formMethods?: any;
  /** Confirm button click handler */
  onConfirm?: () => void;
}

export const footerComponents = {
  actions: ActionsDropdownFooter,
  default: DefaultDialogFooter,
  form: FormDialogFooter,
  wizard_form: WizardFormDialogFooter,
} as const;

export type FooterType = keyof typeof footerComponents;

export function getFooterComponent<T extends BaseRecord = any>(
  type: FooterType,
): React.ComponentType<FooterComponentProps<T>> {
  return footerComponents[type];
}

/**
 * Registry of type checkers for determining footer type
 * Each checker takes a dialog and returns true if it matches that footer type
 */
const footerTypeCheckers: Record<
  FooterType,
  (dialog: DialogConfig<any>) => boolean
> = {
  actions: (dialog) => Boolean(dialog.actions),
  default: () => true, // Fallback - always matches
  form: (dialog) => dialog.type === "form" && !isWizardDialogConfig(dialog),
  wizard_form: (dialog) => isWizardDialogConfig(dialog),
};

export function getFooterTypeForDialog<T extends BaseRecord = any>(
  dialog: DialogConfig<T>,
): FooterType {
  // Find the first matching footer type by checking each type checker
  for (const [footerType, checker] of Object.entries(footerTypeCheckers)) {
    if (checker(dialog)) {
      return footerType as FooterType;
    }
  }

  // This should never happen since 'default' always matches
  return "default";
}
