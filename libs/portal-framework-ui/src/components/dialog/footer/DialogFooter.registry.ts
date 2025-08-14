import { BaseRecord } from "@refinedev/core";
import React from "react";

import type { DialogBaseConfig, DialogConfig } from "../types/Dialog.types";
import { ActionsDropdownFooter } from "./ActionsDropdownFooter";
import { DefaultDialogFooter } from "./DefaultDialogFooter";
import { FormDialogFooter } from "./FormDialogFooter";

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
} as const;

export type FooterType = keyof typeof footerComponents;

export function getFooterComponent<T extends BaseRecord = any>(
  type: FooterType,
): React.ComponentType<FooterComponentProps<T>> {
  return footerComponents[type];
}

export function getFooterTypeForDialog<T extends BaseRecord = any>(
  dialog: DialogConfig<T>,
): FooterType {
  if (dialog.type === "form") return "form";
  if (dialog.actions) return "actions";
  return "default";
}
