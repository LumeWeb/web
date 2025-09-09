import { BaseRecord } from "@refinedev/core";
import { ReactNode } from "react";

import type { FormConfig, StepFormConfig, WizardFormConfig } from "../form";

import { ActionItemConfig, ActionListLayout } from "../actions";
import { COMPONENT_SIZE_CLASSES, ComponentSize } from "../sizing";

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
 *   type: DialogType.ALERT,
 *   title: 'Notification',
 *   description: 'Update successful',
 *   variant: 'success'
 * });
 *
 * // Confirmation dialog
 * openDialog({
 *   type: DialogType.CONFIRM,
 *   title: 'Confirm Action',
 *   cancelText: 'Cancel',
 *   confirmText: 'Proceed',
 *   onConfirm: handleDelete
 * });
 *
 * // Form dialog
 * openDialog({
 *   type: DialogType.FORM,
 *   title: 'Create Item',
 *   formSchema: z.object({ name: z.string() }),
 *   onSubmit: handleSubmit
 * });
 *
 * // Wizard form dialog
 * openDialog({
 *   type: DialogType.WIZARD_FORM,
 *   title: 'Multi-step Form',
 *   formConfig: wizardConfig,
 *   onSubmit: handleSubmit
 * });
 *
 * // Custom dialog
 * openDialog({
 *   type: DialogType.CUSTOM,
 *   title: 'Custom Content',
 *   content: <MyComponent />,
 *   footer: <CustomFooter />
 * });
 */

export enum DialogType {
  ALERT = "alert",
  CONFIRM = "confirm",
  CUSTOM = "custom",
  FORM = "form",
  WIZARD_FORM = "wizard_form",
}

export interface AlertDialogConfig extends DialogBaseConfig {
  cancelText?: string;
  confirmText?: string;
  description?: React.FC | React.ReactNode | string;
  onCancel?: (source: "programmatic" | "user") => void;
  onConfirm?: () => Promise<void> | void;
  type: DialogType.ALERT;
}

export interface ConfirmDialogConfig extends DialogBaseConfig {
  cancelText: string;
  confirmText: string;
  onCancel?: (source: "programmatic" | "user") => void;
  onConfirm: () => Promise<void> | void;
  type: DialogType.CONFIRM;
}

export interface CustomDialogConfig extends DialogBaseConfig {
  onCancel?: (source: "programmatic" | "user") => void;
  type: DialogType.CUSTOM;
}

export interface DialogActionsConfig {
  /** Dropdown menu content */
  content: ReactNode;
  /** Trigger button label */
  triggerLabel: string;
}

export interface DialogBaseConfig<T extends BaseRecord = any> {
  /** Action buttons configuration */
  actionButtons?: ActionItemConfig[];
  /** Layout for action buttons */
  actionButtonsLayout?: ActionListLayout;
  /** Actions dropdown configuration */
  actions?: DialogActionsConfig;
  /** CSS class names for dialog parts */
  classNames?: DialogClassNames;
  /** Custom dialog content */
  content?: ReactNode;
  /** Description text */
  description?: string;
  /** Whether dialog can be dismissed */
  dismissable?: boolean;
  /** Footer content or configuration */
  footer?: DialogFooterConfig<T> | ReactNode;
  /** Icon to display */
  icon?: ReactNode;
  /** Icon layout relative to title */
  iconLayout?: DialogIconLayout;
  /** Unique identifier */
  id?: string;
  /** Dialog position on screen */
  position?: DialogPosition;
  /** Prevent closing when clicking outside */
  preventCloseOnOutsideClick?: "dirty" | boolean;
  /** Show loading spinner */
  showSpinner?: boolean;
  /** Dialog size */
  size?: DialogSize;
  /** Status indicator */
  status?: DialogStatus;
  /** Dialog title */
  title: string;
  /** Visual variant */
  variant?: DialogVariant;
}
export interface DialogClassNames {
  /** Close button class */
  close?: string;
  /** Content container class */
  content?: string;
  /** Description text class */
  description?: string;
  /** Footer container class */
  footer?: string;
  /** Header container class */
  header?: string;
  /** Title text class */
  title?: string;
}

export type DialogConfig<
  TRequest extends BaseRecord = any,
  TResponse extends BaseRecord = any,
> =
  | AlertDialogConfig
  | ConfirmDialogConfig
  | CustomDialogConfig
  | FormDialogConfig<TRequest, TResponse>
  | WizardDialogConfig<TRequest, TResponse>;

export type DialogFooterConfig<T extends BaseRecord = any> =
  | ((
      methods: any,
      closeDialog: () => void,
      currentDialog?: DialogConfig<T>,
    ) => ReactNode)
  | ActionItemConfig[]
  | false
  | ReactNode;

export type DialogIconLayout = "center" | "left" | "right";

// Removed DialogContextType since we split into separate contexts
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

export const DIALOG_SIZE_CLASSES = COMPONENT_SIZE_CLASSES;

export const DIALOG_POSITION_CLASSES = {
  "bottom": "bottom-4 inset-x-0 mx-auto",
  "bottom-left": "bottom-4 left-4",
  "bottom-right": "bottom-4 right-4",
  "center": "",
  "left": "left-4 top-1/2 -translate-y-1/2",
  "right": "right-4 top-1/2 -translate-y-1/2",
  "top": "top-4 inset-x-0 mx-auto",
  "top-left": "top-4 left-4",
  "top-right": "top-4 right-4",
} as const;

export type DialogSize = ComponentSize;

export type DialogStatus = "error" | "success" | null;

export type DialogVariant =
  | "default"
  | "destructive"
  | "info"
  | "success"
  | "warning";

export interface FormDialogConfig<
  TRequest extends BaseRecord = any,
  TResponse extends BaseRecord = any,
> extends DialogBaseConfig<TRequest> {
  /**
   * Whether to automatically close the dialog on successful form submission
   * @default true
   */
  closeOnSubmit?: boolean;
  footer?: DialogFooterConfig<TRequest>;
  formConfig:
    | FormConfig<TRequest, TResponse>
    | StepFormConfig<TRequest, TResponse>;
  onCancel?: (source: "programmatic" | "user") => void;
  onSubmit: (values: TRequest) => Promise<TResponse>;
  /** Callback when form submission succeeds - required for form dialogs */
  onSuccess: (response: TResponse, values: TRequest) => void;
  type: DialogType.FORM;
}

export interface WizardDialogConfig<
  TRequest extends BaseRecord = any,
  TResponse extends BaseRecord = any,
> extends DialogBaseConfig<TRequest> {
  /**
   * Whether to automatically close the dialog on successful form submission
   * @default true
   */
  closeOnSubmit?: boolean;
  footer?: DialogFooterConfig<TRequest>;
  formConfig: WizardFormConfig<TRequest, TResponse>;
  onCancel?: (source: "programmatic" | "user") => void;
  onSubmit?: (values: TRequest) => Promise<TResponse>;
  /** Callback when form submission succeeds */
  onSuccess?: (response: TResponse, values: TRequest) => void;
  type: DialogType.WIZARD_FORM;
}

export function isAlertDialog(
  config: DialogConfig,
): config is AlertDialogConfig {
  return config.type === DialogType.ALERT;
}
export function isConfirmDialog(
  config: DialogConfig,
): config is ConfirmDialogConfig {
  return config.type === DialogType.CONFIRM;
}

export function isCustomDialog(
  config: DialogConfig,
): config is CustomDialogConfig {
  return config.type === DialogType.CUSTOM;
}

export function isFormDialog<
  T extends BaseRecord = any,
  R extends BaseRecord = any,
>(config: DialogConfig<T, R>): config is FormDialogConfig<T, R> {
  return config.type === DialogType.FORM;
}

export function isWizardDialogConfig<
  TRequest extends BaseRecord = any,
  TResponse extends BaseRecord = any,
>(
  config: DialogConfig<TRequest, TResponse>,
): config is WizardDialogConfig<TRequest, TResponse> {
  return config.type === DialogType.WIZARD_FORM;
}
