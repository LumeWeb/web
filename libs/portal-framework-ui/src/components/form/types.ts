import {
  type AutoSaveIndicatorElements,
  type AutoSaveProps,
  type BaseKey,
  BaseRecord,
  type FormAction,
  HttpError,
  OpenNotificationParams,
} from "@refinedev/core";
import { UseFormProps as RefineUseFormProps } from "@refinedev/react-hook-form";
import type { ComponentType, ReactNode } from "react";
import { Path } from "react-hook-form";
import { z } from "zod";

import { ActionItemConfig, ActionListLayout } from "../actions";
import type { DialogConfig } from "../dialog/Dialog.types";
import { FormFieldType } from "./fields/types";

export type FormAutosaveConfig<T> = AutoSaveProps<T>["autoSave"];

export interface FormConfig<
  TRequest extends BaseRecord = any,
  TResponse extends BaseRecord = any,
> {
  action?: FormAction;
  /**
   * Action buttons configuration for the form footer
   */
  actionButtons?: ActionItemConfig[] | false;
  /**
   * Layout for action buttons in footer
   * @default "horizontal"
   */
  actionButtonsLayout?: ActionListLayout;
  adapter?: "refine" | "rhf";
  autoSave?: boolean | FormAutosaveConfig<TRequest>;
  autoSaveStates?: AutoSaveIndicatorElements;
  closeOnSubmit?: boolean;
  defaultValues?: TRequest;
  /** Alias for refineCoreProps.errorNotification */
  errorNotification?: (error: any) => OpenNotificationParams;
  fields: FormFieldConfig<TRequest>[];
  /**
   * Custom footer content or configuration
   * Can be:
   * - React node
   * - Array of action button configs
   * - Function that receives form methods and returns React node
   */
  footer?:
    | ((
        methods: any,
        closeDialog: () => void,
        currentDialog?: DialogConfig<TRequest, TResponse>,
      ) => ReactNode)
    | ActionItemConfig[]
    | false
    | ReactNode;
  /**
   * Class name for the footer wrapper
   * Set to false to disable default padding/border styles
   * @default "pt-4 mt-4 border-t"
   */
  footerClassName?: false | string;
  formClassName?: string;
  id?: BaseKey;
  layout?: "grid" | "horizontal" | "vertical";
  onError?: (error: Error) => void;
  onSubmit?: (values: TRequest) => Promise<TResponse> | void;
  /** Alias for refineCoreProps.onMutationSuccess */
  onSuccess?: (response: TResponse, values: TRequest) => void;
  refine?: boolean;
  refineCoreProps?: RefineUseFormProps<
    TRequest,
    HttpError,
    TRequest
  >["refineCoreProps"] & {
    errorNotification?: (error: any) => OpenNotificationParams;
    meta?: Record<string, unknown>;
    successNotification?: (data: any, values: any) => OpenNotificationParams;
  };
  resource?: string;
  submitLabel?: string;

  /** Alias for refineCoreProps.successNotification */
  successNotification?: (data: any, values: any) => OpenNotificationParams;
  validationSchema?: z.ZodSchema<TRequest>;
}

export interface FormFieldConfig<TRequest extends BaseRecord = any> {
  className?: string;
  component?: ComponentType<any>;
  /**
   * Optimize performance by specifying which field names (paths using dot notation)
   * influence the 'show' function or 'requires' conditions for this field.
   * If omitted, conditional checks might rely on less performant full form watches.
   */
  dependencies?: string[];
  description?: string;
  inputClassName?: string;
  /**
   * Class name applied to the FormItem wrapper component
   */
  itemClassName?: string;
  label?: string;
  /** Field name/path (using dot notation for nested fields) */
  name: Path<TRequest> | (string & {});
  options?: FormFieldOption[];
  placeholder?: string;
  required?: boolean;
  /**
   * Additional props to pass to the underlying input element
   */
  inputProps?: Record<string, any>;
  /**
   * Declaratively define dependencies for field visibility.
   * The field will only be shown if *all* conditions in this object are met.
   * Keys are paths to other fields (using dot notation for nested fields).
   * Values are the required value for that field, or a function predicate.
   * Example: { 'user.role': 'admin', 'settings.enabled': true, 'profile.age': (age) => age >= 18 }
   * If used with 'show', both must allow visibility (requires passes AND show returns true).
   */
  requires?: Record<string, ((fieldValue: any) => boolean) | any>;
  /**
   * Programmatically control field visibility based on form values.
   * Return true to show the field, false to hide it.
   * Can be an async function, but this introduces complexity (loading states, error handling)
   * often better handled within a custom field component.
   * If used with 'requires', both must allow visibility (requires passes AND show returns true).
   */
  show?: (values: TRequest) => boolean | Promise<boolean>;
  type: FormFieldType | string;
  validation?: z.ZodTypeAny;
}

export type FormFieldOption = string | { label: string; value: string };

/**
 * Defines the structure for a single step in a multi-step form.
 */
export interface StepDefinition<TRequest extends BaseRecord = any> {
  fields: FormFieldConfig<TRequest>[];
  meta?: Record<string, unknown>;
  /**
   * Callback when this step's submission fails
   */
  onStepError?: (error: Error) => Promise<void> | void;
  /**
   * Callback when this step's form is successfully submitted
   */
  onStepSubmit?: (values: Partial<TRequest>) => Promise<void> | void;
  /**
   * Callback when this step's submission succeeds
   */
  onStepSuccess?: (
    response: any,
    values: Partial<TRequest>,
  ) => Promise<void> | void;
  title: string;
  /**
   * Zod schema for validating this step's fields
   */
  validationSchema?: z.ZodSchema<Partial<TRequest>>;
}

export interface StepFormConfig<
  TRequest extends BaseRecord = any,
  TResponse extends BaseRecord = any,
> extends Omit<FormConfig<TRequest, TResponse>, "fields" | "footer"> {
  footer?: StepFormFooterRenderer<TRequest, TResponse>;
  /**
   * Callback when all steps are completed successfully
   */
  onFinish?: (finalValues: TRequest) => Promise<void> | void;
  stepBehavior?: {
    defaultStep?: number;
    isBackValidate?: boolean;
  };
  steps: StepDefinition<TRequest>[];
}

export type StepFormFooterRenderer<
  TRequest extends BaseRecord = any,
  TResponse extends BaseRecord = any,
> = (
  stepMethods: StepFormMethods,
  formMethods: any,
  closeDialog: () => void,
  currentDialog?: DialogConfig<TRequest, TResponse>,
) => React.ReactNode;

/**
 * Configuration object specifically for a multi-step form process.
 */
export interface StepFormMethods {
  currentStep: number;
  gotoStep: (step: number) => void;
  handleNext: () => Promise<void>;
  handlePrevious: () => Promise<void>;
  handleSubmit: () => Promise<void>;
  isFirstStep: boolean;
  isLastStep: boolean;
  totalSteps: number;
}
/**
 * Type guard to differentiate between single-step and multi-step form configs.
 */
export function isStepFormConfig<
  TRequest extends BaseRecord,
  TResponse extends BaseRecord = any,
>(
  config: FormConfig<TRequest, TResponse> | StepFormConfig<TRequest, TResponse>,
): config is StepFormConfig<TRequest, TResponse> {
  return (config as StepFormConfig<TRequest>)?.steps !== undefined;
}
