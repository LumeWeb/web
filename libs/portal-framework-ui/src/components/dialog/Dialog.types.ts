import { BaseRecord } from "@refinedev/core";
import { ReactNode } from "react";

import type { FormConfig, StepFormConfig } from "../form";

import { ActionItemConfig, ActionListLayout } from "../actions";

/**
 * Dialog Configuration API
 *
 * The dialog system provides a type-safe way to display various dialog types through the useDialog hook.
 *
 * Basic usage:
 *
 * const { openDialog } = useDialog();
 *
 * // Simple alert
 * openDialog({
 *   type: 'alert',
 *   title: 'Notification',
 *   description: 'Update successful',
 *   variant: 'success'
 * });
 *
 * // Confirmation dialog
 * openDialog({
 *   type: 'confirm',
 *   title: 'Confirm Action',
 *   cancelText: 'Cancel',
 *   confirmText: 'Proceed',
 *   onConfirm: handleDelete
 * });
 *
 * // Form dialog
 * openDialog({
 *   type: 'form',
 *   title: 'Create Item',
 *   formSchema: z.object({ name: z.string() }),
 *   onSubmit: handleSubmit
 * });
 *
 * // Custom dialog
 * openDialog({
 *   type: 'custom',
 *   title: 'Custom Content',
 *   content: <MyComponent />,
 *   footer: <CustomFooter />
 * });
 */

export type DialogConfig<
  TRequest extends BaseRecord = any,
  TResponse extends BaseRecord = any,
> = {
  actionButtons?: ActionItemConfig[];
  actionButtonsLayout?: ActionListLayout;
  actions?: {
    content: ReactNode;
    triggerLabel: string;
  };
  classNames?: {
    content?: string;
    footer?: string;
    header?: string;
  };
  content?: ReactNode;
  description?: string;
  dismissable?: boolean;
  footer?: ReactNode;
  icon?: ReactNode;
  /** Icon layout relative to title (default: left) */
  iconLayout?: "center" | "left" | "right";
  id?: string;
  position?: DialogPosition;
  preventCloseOnOutsideClick?: "dirty" | boolean;
  showSpinner?: boolean;
  size?: DialogSize;
  status?: "error" | "success" | null;
  title: string;
  variant?: DialogVariant;
} & (
  | {
      actionButtons?: ActionItemConfig[];
      actionButtonsLayout?: ActionListLayout;
      /**
       * Whether to automatically close the dialog on successful form submission
       * @default true
       */
      closeOnSubmit?: boolean;
      footer?:
        | ((methods: any, closeDialog?: () => void) => React.ReactNode)
        | ActionItemConfig[]
        | React.ReactNode;
      footerLayout?: ActionListLayout;
      formConfig: FormConfig<TRequest, TResponse> | StepFormConfig<TRequest, TResponse>; // Allow StepFormConfig here
      onCancel?: (source: "programmatic" | "user") => void;
      onSubmit: (values: TRequest) => Promise<TResponse>;
      /** Callback when form submission succeeds - required for form dialogs */
      onSuccess: (response: TResponse, values: TRequest) => void;
      type: "form";
    }
  | {
      cancelText: string;
      confirmText: string;
      onCancel?: (source: "programmatic" | "user") => void;
      onConfirm: () => Promise<void> | void;
      type: "confirm";
    }
  | {
      confirmText?: string;
      onCancel?: (source: "programmatic" | "user") => void; // Added onCancel here
      onConfirm?: () => Promise<void> | void;
      type: "alert";
    }
  | { onCancel?: (source: "programmatic" | "user") => void; type: "custom" }
);
export interface DialogContextType {
  closeDialog: (source?: "programmatic" | "user") => void;
  currentDialog?: DialogConfig;
  formMethods?: any; // Form methods might not be present in context for all consumers
  openDialog: (config: DialogConfig) => void;
  replaceDialog: (newDialog: DialogConfig) => void;
  setFormMethods: (methods: any) => void;
}
export type DialogPosition =
  | "bottom"
  | "bottom-left"
  | "bottom-right"
  | "center"
  | "left"
  | "right"
  | "top"
  | "top-left"
  | "top-right";

export type DialogSize = "lg" | "md" | "sm";

export type DialogVariant =
  | "default"
  | "destructive"
  | "info"
  | "success"
  | "warning";
