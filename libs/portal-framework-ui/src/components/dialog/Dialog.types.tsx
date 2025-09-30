import { BaseRecord } from "@refinedev/core";
import React, { ReactNode } from "react";

import type {
  EnvironmentSyncCallback,
  ForceRerenderCallback,
  FormConfig,
  StepFormConfig,
  WizardFormConfig
} from "@/components";
import {
  ActionItemConfig,
  ActionListLayout,
  AdapterType,
  COMPONENT_SIZE_CLASSES,
  ComponentSize,
  createStepRetryHandler,
  FormProvider,
  isStepFormConfig,
  StepControlProvider
} from "@/components";

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
 *   type: DialogTypes.ALERT,
 *   title: 'Notification',
 *   description: 'Update successful',
 *   variant: 'success'
 * });
 *
 * // Confirmation dialog
 * openDialog({
 *   type: DialogTypes.CONFIRM,
 *   title: 'Confirm Action',
 *   cancelText: 'Cancel',
 *   confirmText: 'Proceed',
 *   onConfirm: handleDelete
 * });
 *
 * // Form dialog
 * openDialog({
 *   type: DialogTypes.FORM,
 *   title: 'Create Item',
 *   formSchema: z.object({ name: z.string() }),
 *   onSubmit: handleSubmit
 * });
 *
 * // Wizard form dialog
 * openDialog({
 *   type: DialogTypes.WIZARD_FORM,
 *   title: 'Multi-step Form',
 *   formConfig: wizardConfig,
 *   onSubmit: handleSubmit
 * });
 *
 * // Custom dialog
 * openDialog({
 *   type: DialogTypes.CUSTOM,
 *   title: 'Custom Content',
 *   content: <MyComponent />,
 *   footer: <CustomFooter />
 * });
 */

// =============================================================================
// 1. TYPE ENUMS & CONSTANTS
// =============================================================================

export const DialogTypes = {
  ALERT: "alert",
  CONFIRM: "confirm",
  CUSTOM: "custom",
  FORM: "form",
  WIZARD_FORM: "wizard_form",
} as const;

export type DialogType = (typeof DialogTypes)[keyof typeof DialogTypes];

export const DialogIconLayout = {
  CENTER: "center",
  LEFT: "left",
  RIGHT: "right",
} as const;

export type DialogIconLayout =
  (typeof DialogIconLayout)[keyof typeof DialogIconLayout];

export const DialogPosition = {
  BOTTOM: "bottom",
  BOTTOM_LEFT: "bottom-left",
  BOTTOM_RIGHT: "bottom-right",
  CENTER: "center",
  LEFT: "left",
  RIGHT: "right",
  TOP: "top",
  TOP_LEFT: "top-left",
  TOP_RIGHT: "top-right",
} as const;

export type DialogPosition =
  (typeof DialogPosition)[keyof typeof DialogPosition];

export const DialogStatus = {
  ERROR: "error",
  NONE: null,
  SUCCESS: "success",
} as const;

export type DialogStatus = (typeof DialogStatus)[keyof typeof DialogStatus];

export const DialogVariant = {
  DEFAULT: "default",
  DESTRUCTIVE: "destructive",
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
} as const;

export enum FormDialogType {
  SCHEMA = "schema",
  STEP = "step",
  WIZARD = "wizard",
}

export type DialogVariant = (typeof DialogVariant)[keyof typeof DialogVariant];

// =============================================================================
// 2. CSS CLASS MAPPINGS
// =============================================================================

export const DIALOG_SIZE_CLASSES = COMPONENT_SIZE_CLASSES;

export type DialogSize = ComponentSize;

export const DIALOG_POSITION_CLASSES = {
  [DialogPosition.BOTTOM]: "bottom-4 inset-x-0 mx-auto",
  [DialogPosition.BOTTOM_LEFT]: "bottom-4 left-4",
  [DialogPosition.BOTTOM_RIGHT]: "bottom-4 right-4",
  [DialogPosition.CENTER]: "",
  [DialogPosition.LEFT]: "left-4 top-1/2 -translate-y-1/2",
  [DialogPosition.RIGHT]: "right-4 top-1/2 -translate-y-1/2",
  [DialogPosition.TOP]: "top-4 inset-x-0 mx-auto",
  [DialogPosition.TOP_LEFT]: "top-4 left-4",
  [DialogPosition.TOP_RIGHT]: "top-4 right-4",
} as const;

// =============================================================================
// 3. TYPE CHECKER FUNCTIONS
// =============================================================================

export function isAlertDialog(
  config: DialogConfig,
): config is AlertDialogConfig {
  return config.type === DialogTypes.ALERT;
}

export function isConfirmDialog(
  config: DialogConfig,
): config is ConfirmDialogConfig {
  return config.type === DialogTypes.CONFIRM;
}

export function isCustomDialog(
  config: DialogConfig,
): config is CustomDialogConfig {
  return config.type === DialogTypes.CUSTOM;
}

export function isFormDialog<
  T extends BaseRecord = any,
  R extends BaseRecord = any,
>(config: DialogConfig<T, R>): config is FormDialogConfig<T, R> {
  return config.type === DialogTypes.FORM;
}

export function isWizardDialogConfig<
  TRequest extends BaseRecord = any,
  TResponse extends BaseRecord = any,
>(
  config: DialogConfig<TRequest, TResponse>,
): config is WizardDialogConfig<TRequest, TResponse> {
  return config.type === DialogTypes.WIZARD_FORM;
}

// Type checker functions for each dialog type
const dialogTypeCheckers = {
  alert: (config: DialogConfig): boolean => config.type === DialogTypes.ALERT,
  confirm: (config: DialogConfig): boolean =>
    config.type === DialogTypes.CONFIRM,
  custom: (config: DialogConfig): boolean => config.type === DialogTypes.CUSTOM,
  form: (config: DialogConfig): boolean => config.type === DialogTypes.FORM,
  wizard_form: (config: DialogConfig): boolean =>
    config.type === DialogTypes.WIZARD_FORM,
} as const;

// Registry mapping function to determine the dialog type based on config
export function getDialogType(config: DialogConfig): DialogType {
  // Check each dialog type in order using type guards
  for (const [type, checker] of Object.entries(dialogTypeCheckers)) {
    if (checker(config)) {
      return type as DialogType;
    }
  }

  // Fallback to the configured dialog type
  return config.type as DialogType;
}

// Form type checker functions for determining form rendering type from dialog config
const formTypeCheckers = {
  [FormDialogType.SCHEMA]: (config: DialogConfig): boolean =>
    isFormDialog(config) &&
    !isWizardDialogConfig(config) &&
    !isStepFormConfig(config.formConfig),
  [FormDialogType.STEP]: (config: DialogConfig): boolean =>
    isFormDialog(config) &&
    !isWizardDialogConfig(config) &&
    isStepFormConfig(config.formConfig),
  [FormDialogType.WIZARD]: (config: DialogConfig): boolean =>
    isWizardDialogConfig(config),
} as const;

// Registry mapping function to determine the form type based on dialog config
export function getFormTypeFromDialog(config: DialogConfig): FormDialogType {
  // Check each form type in order using type guards
  for (const [type, checker] of Object.entries(formTypeCheckers)) {
    if (checker(config)) {
      return type as FormDialogType;
    }
  }

  // This should never happen as form dialogs always match one of the above
  throw new Error(
    `Unable to determine form type from dialog config: ${config.type}`,
  );
}

/**
 * Type guard to check if footer is a function
 */
export function isDialogFooterFunction(
  footer: ((environment: any) => ReactNode) | false | ReactNode | undefined,
): footer is (environment: any) => ReactNode {
  return typeof footer === "function";
}

/**
 * Type guard to check if header is a function
 */
export function isDialogHeaderFunction(
  header: ((environment: any) => ReactNode) | false | ReactNode | undefined,
): header is (environment: any) => ReactNode {
  return typeof header === "function";
}

export function isWizardFormConfig<
  TRequest extends BaseRecord = any,
  TResponse extends BaseRecord = any,
>(
  formConfig:
    | FormConfig<TRequest, TResponse>
    | StepFormConfig<TRequest, TResponse>,
): formConfig is WizardFormConfig<TRequest, TResponse> {
  // Check if formConfig has wizard-specific properties
  const hasWizardClassName = "wizardClassName" in formConfig;
  const hasAllowStepNavigation =
    "allowStepNavigation" in formConfig &&
    formConfig.allowStepNavigation !== undefined;
  const hasProgressStyle =
    "progressStyle" in formConfig && formConfig.progressStyle !== undefined;
  const hasShowStepProgress =
    "showStepProgress" in formConfig &&
    formConfig.showStepProgress !== undefined;

  return (
    hasWizardClassName ||
    hasAllowStepNavigation ||
    hasProgressStyle ||
    hasShowStepProgress
  );
}

// Context provider mapping - refactored to be functional components
export const contextProviders: Record<
  string,
  React.FC<{
    children: React.ReactNode;
    dialog: DialogConfig;
    formMethods: any;
  }>
> = {
  form: ({ children, dialog, formMethods }) => {
    // Only provide FormProvider for dialog configs that have formConfig
    if (isFormDialog(dialog)) {
      const formDialog = dialog;
      return (
        <FormProvider
          adapter={formDialog.formConfig?.adapter ?? AdapterType.RHF}
          config={formDialog.formConfig}
          formInstance={formMethods}>
          {children}
        </FormProvider>
      );
    }
    if (isWizardDialogConfig(dialog)) {
      const wizardDialog = dialog;
      return (
        <FormProvider
          adapter={wizardDialog.formConfig?.adapter ?? AdapterType.RHF}
          config={wizardDialog.formConfig}
          formInstance={formMethods}>
          {children}
        </FormProvider>
      );
    }
    return <>{children}</>;
  },
  stepControl: ({ children, dialog, formMethods }) => {
    // For wizard forms, extract step control values from formMethods and dialog
    if (isWizardDialogConfig(dialog)) {
      const wizardDialog = dialog;
      return (
        <StepControlProvider
          defaultStep={wizardDialog.formConfig?.stepBehavior?.defaultStep}
          handleStepSubmit={formMethods?.handleStepSubmit}
          isBackValidate={wizardDialog.formConfig?.stepBehavior?.isBackValidate}
          onStepChange={formMethods?.onStepChange}
          onStepRetry={createStepRetryHandler(wizardDialog.formConfig?.steps || [])}
          onNavigationStart={wizardDialog.formConfig?.onNavigationStart}
          onNavigationEnd={wizardDialog.formConfig?.onNavigationEnd}
          onNavigationError={wizardDialog.formConfig?.onNavigationError}
          totalSteps={wizardDialog.formConfig?.steps?.length}
          triggerValidation={formMethods?.triggerValidation}>
          {children}
        </StepControlProvider>
      );
    }

    // For regular step forms, also provide step control context
    if (isFormDialog(dialog)) {
      const formDialog = dialog;
      if (isStepFormConfig(formDialog.formConfig)) {
        return (
          <StepControlProvider
            defaultStep={formDialog.formConfig?.stepBehavior?.defaultStep}
            isBackValidate={formDialog.formConfig?.stepBehavior?.isBackValidate}
            onStepRetry={createStepRetryHandler(formDialog.formConfig?.steps || [])}
            onNavigationStart={formDialog.formConfig?.onNavigationStart}
            onNavigationEnd={formDialog.formConfig?.onNavigationEnd}
            onNavigationError={formDialog.formConfig?.onNavigationError}
            totalSteps={formDialog.formConfig?.steps?.length}>
            {children}
          </StepControlProvider>
        );
      }
    }

    return <>{children}</>;
  },
};

// =============================================================================
// 4. CONFIGURATION INTERFACES
// =============================================================================

export interface AlertDialogConfig extends DialogBaseConfig {
  cancelText?: string;
  confirmText?: string;
  description?: React.FC | React.ReactNode | string;
  onCancel?: (source: "programmatic" | "user") => void;
  onConfirm?: () => Promise<void> | void;
  type: typeof DialogTypes.ALERT;
}

export interface ConfirmDialogConfig extends DialogBaseConfig {
  cancelText: string;
  confirmText: string;
  onCancel?: (source: "programmatic" | "user") => void;
  onConfirm: () => Promise<void> | void;
  type: typeof DialogTypes.CONFIRM;
}

export interface CustomDialogConfig extends DialogBaseConfig {
  onCancel?: (source: "programmatic" | "user") => void;
  type: typeof DialogTypes.CUSTOM;
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
  /** Custom footer content - ReactNode, function, or false to hide */
  footer?: ((environment: any) => ReactNode) | false | ReactNode;
  /** Custom header content - ReactNode, function, or false to hide */
  header?: ((environment: any) => ReactNode) | false | ReactNode;
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
  /**
   * Optional callback for receiving a force rerender method.
   * The framework will call this callback with a method that can be stored
   * locally and used to force a component rerender when something outside
   * the render loop needs to trigger a rerender.
   */
  forceRerender?: ForceRerenderCallback;
  /**
   * Optional callback for receiving an environment sync method.
   * The framework will call this callback with a method that can be stored
   * locally and used to sync environment changes when something outside
   * the normal flow updates the environment.
   */
  environmentSync?: EnvironmentSyncCallback;
}

export interface DialogClassNames {
  /** Close button class */
  close?: string;
  /** Content container class */
  content?: string;
  /** Description text class */
  description?: string;
  /** Header container class */
  header?: string;
  /** Title text class */
  title?: string;
}

export interface FormDialogConfig<
  TRequest extends BaseRecord = any,
  TResponse extends BaseRecord = any,
> extends DialogBaseConfig<TRequest> {
  /**
   * Whether to automatically close the dialog on successful form submission
   * @default true
   */
  closeOnSubmit?: boolean;
  formConfig:
    | FormConfig<TRequest, TResponse>
    | StepFormConfig<TRequest, TResponse>;
  onCancel?: (source: "programmatic" | "user") => void;
  onSubmit: (values: TRequest) => Promise<TResponse>;
  /** Callback when form submission succeeds - required for form dialogs */
  onSuccess: (response: TResponse, values: TRequest) => void;
  type: typeof DialogTypes.FORM;
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
  formConfig: WizardFormConfig<TRequest, TResponse>;
  onCancel?: (source: "programmatic" | "user") => void;
  onSubmit?: (values: TRequest) => Promise<TResponse>;
  /** Callback when form submission succeeds */
  onSuccess?: (response: TResponse, values: TRequest) => void;
  type: typeof DialogTypes.WIZARD_FORM;
}

export const dialogContextRequirements: Record<DialogType, string[]> = {
  [DialogTypes.ALERT]: [],
  [DialogTypes.CONFIRM]: [],
  [DialogTypes.CUSTOM]: [],
  [DialogTypes.FORM]: ["form"],
  [DialogTypes.WIZARD_FORM]: ["form", "stepControl"],
};

export type DialogConfig<
  TRequest extends BaseRecord = any,
  TResponse extends BaseRecord = any,
> =
  | AlertDialogConfig
  | ConfirmDialogConfig
  | CustomDialogConfig
  | FormDialogConfig<TRequest, TResponse>
  | WizardDialogConfig<TRequest, TResponse>;
