import type { ComponentType, ReactNode } from "react";

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
import { Path } from "react-hook-form";
import { z } from "zod";

import type { DialogConfig } from "../dialog/Dialog.types";

import { ActionItemConfig, ActionListLayout } from "../actions";
import { ComponentSize } from "../sizing";
import { FormFieldType } from "./fields/types";
import { UnifiedEnvironment } from "../shared/types/environment";
import type {
  ForceRerenderCallback,
  EnvironmentSyncCallback,
} from "../shared/types/form";

/**
 * Enum defining the adapter types for form handling
 */
export enum AdapterType {
  /** Refine adapter */
  REFINE = "refine",
  /** React Hook Form adapter */
  RHF = "rhf",
}

/**
 * Callback function type for generating action buttons based on environment
 */
export type ActionButtonsCallback<TRequest extends BaseRecord = any> = (props: {
  /** The environment context for the form */
  environment?: UnifiedEnvironment;
}) => ActionItemConfig[] | undefined | false;

/**
 * Enum defining the order in which grouped and ungrouped fields are rendered
 */
export enum GroupOrder {
  /** Render groups first, then ungrouped fields */
  GROUPS_FIRST = "groups-first",
  /** Render ungrouped fields first, then groups */
  UNGROUPED_FIRST = "ungrouped-first",
}

/**
 * Enum defining the layout types for forms
 */
export enum LayoutType {
  /** Grid layout */
  GRID = "grid",
  /** Horizontal layout */
  HORIZONTAL = "horizontal",
  /** Vertical layout */
  VERTICAL = "vertical",
}

/**
 * Type for HTML autocomplete attribute values
 */
export type AutocompleteToken =
  | "current-password"
  | "email"
  | "family-name"
  | "given-name"
  | "new-password"
  | "off"
  | "on"
  | "one-time-code"
  | "username";

/**
 * Configuration type for form autosave functionality
 */
export type FormAutosaveConfig<T> = AutoSaveProps<T>["autoSave"];

/**
 * Configuration interface for a form
 */
export interface FormConfig<
  TRequest extends BaseRecord = any,
  TResponse extends BaseRecord = any,
> {
  /** The form action type (create, edit, etc.) */
  action?: FormAction;
  /**
   * Action buttons configuration for the form footer
   */
  actionButtons?: ActionItemConfig[] | false | ActionButtonsCallback;
  /**
   * Layout for action buttons in footer
   * @default "horizontal"
   */
  actionButtonsLayout?: ActionListLayout;
  /** The adapter type to use for form handling */
  adapter?: AdapterType;
  /** Whether to enable autosave functionality */
  autoSave?: boolean | FormAutosaveConfig<TRequest>;
  /** Custom elements for different autosave states */
  autoSaveStates?: AutoSaveIndicatorElements;
  /** Whether to close the dialog after successful submission */
  closeOnSubmit?: boolean;
  /** Default values for the form fields */
  defaultValues?: TRequest;
  /** Alias for refineCoreProps.errorNotification */
  errorNotification?:
    | ((error: any) => OpenNotificationParams)
    | OpenNotificationParams;
  /** Array of form field configurations */
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
      ) => ActionItemConfig[] | ReactNode)
    | ActionItemConfig[]
    | false
    | ReactNode;
  /**
   * Class name for the footer wrapper
   * Set to false to disable default padding/border styles
   * @default "pt-4 mt-4 border-t"
   */
  footerClassName?: false | string;
  /** CSS class name for the form container */
  formClassName?: string;
  /**
   * Unique identifier for the form configuration.
   * This is separate from the record ID and is used to identify the form itself.
   */
  formId?: string;
  /**
   * Controls whether grouped or ungrouped fields are rendered first
   * @default GroupOrder.UNGROUPED_FIRST
   */
  groupOrder?: GroupOrder;
  /**
   * Groups configuration for organizing fields
   */
  groups?: FormGroupType[];
  /**
   * Custom header content to render at the top of the form
   * Can be:
   * - React node for static content
   * - Function that receives environment context and returns React node
   * - false to hide header
   */
  header?: ((environment: any) => ReactNode) | false | ReactNode;
  /** The ID of the record being edited (for edit forms) */
  id?: BaseKey;
  /** The layout type for the form */
  layout?: LayoutType;
  /** Error handler for form submission */
  onError?: (error: Error) => void;
  /** Submit handler for the form */
  onSubmit?: (values: TRequest) => Promise<TResponse> | void;
  /** Alias for refineCoreProps.onMutationSuccess */
  onSuccess?: (response: TResponse, values: TRequest) => void;
  /** Whether to use refine framework */
  refine?: boolean;
  /** Refine-specific form properties */
  refineCoreProps?: RefineUseFormProps<
    TRequest,
    HttpError,
    TRequest
  >["refineCoreProps"] & {
    /** Error notification configuration */
    errorNotification?: (error: any) => OpenNotificationParams;
    /** Metadata for the form */
    meta?: Record<string, unknown>;
    /** Success notification configuration */
    successNotification?: (data: any, values: any) => OpenNotificationParams;
  };
  /** The resource name for the form */
  resource?: string;
  /** Label for the submit button */
  submitLabel?: ((values: Partial<TRequest>) => string) | string;
  /** Alias for refineCoreProps.successNotification */
  successNotification?: (data: any, values: any) => OpenNotificationParams;
  /** Zod schema for form validation */
  validationSchema?: z.ZodSchema<TRequest>;
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
  /**
   * Callback when navigation starts
   */
  onNavigationStart?: (fromStep: number, toStep: number, type: 'goTo' | 'jumpTo' | 'next' | 'previous' | 'retry') => void;
  /**
   * Callback when navigation ends successfully
   */
  onNavigationEnd?: (fromStep: number, toStep: number, type: 'goTo' | 'jumpTo' | 'next' | 'previous' | 'retry') => void;
  /**
   * Callback when navigation fails
   */
  onNavigationError?: (fromStep: number, toStep: number, type: 'goTo' | 'jumpTo' | 'next' | 'previous' | 'retry', error: any) => void;
}

/**
 * Configuration interface for a form field
 */
export interface FormFieldConfig<TRequest extends BaseRecord = any> {
  /**
   * The HTML autocomplete attribute value for the field.
   * If provided, it will be passed to the underlying input component.
   */
  autocomplete?: AutocompleteToken;
  /** CSS class name for the field container */
  className?: string;
  /** Custom component to render for this field */
  component?: ComponentType<any>;
  /**
   * Optimize performance by specifying which field names (paths using dot notation)
   * influence the 'show' function or 'requires' conditions for this field.
   * If omitted, conditional checks might rely on less performant full form watches.
   */
  dependencies?: string[];
  /** Description text for the field */
  description?: string;
  /**
   * Group ID this field belongs to
   */
  group?: string;
  /** CSS class name for the input element */
  inputClassName?: string;
  /**
   * Additional props to pass to the underlying input element
   */
  inputProps?: Record<string, any>;
  /**
   * Class name applied to the FormItem wrapper component
   */
  itemClassName?: string;
  /** Label text for the field */
  label?: string;
  /** CSS class name for the label element */
  labelClassName?: string;
  /** Field name/path (using dot notation for nested fields) */
  name: Path<TRequest> | (string & {});
  /** Options for select-type fields */
  options?: FormFieldOption[];
  /** Placeholder text for the field */
  placeholder?: string;
  /** Whether the field is required */
  required?: boolean;
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
  /** The type of form field */
  type: FormFieldType | string;
  /** Zod schema for field validation */
  validation?: z.ZodTypeAny;
}

/**
 * Type for form field options
 */
export type FormFieldOption = string | { label: string; value: string };

/**
 * Configuration interface for form field groups
 */
export interface FormGroupType {
  /** CSS class name for the group container */
  className?: string;
  /** Description for the group */
  description?: string;
  /** Unique ID for the group */
  id: string;
  /** Title for the group */
  title?: string;
}

/**
 * Defines the structure for a single step in a multi-step form.
 */
export interface StepDefinition<TRequest extends BaseRecord = any> {
  /**
   * Whether to allow navigation to this step by clicking on progress indicator
   * Takes precedence over the wizard-level allowStepNavigation config
   */
  allowStepNavigation?: boolean | (() => boolean);
  /**
   * Description for the step
   */
  description?: string;
  /** Fields in this step */
  fields: FormFieldConfig<TRequest>[];
  /**
   * Icon for the step (used in wizard navigation)
   */
  icon?: React.ReactNode;
  /** Metadata for the step */
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
  /**
   * Callback when this step needs to be retried
   */
  onRetryStep?: () => Promise<void> | void;
  /**
   * Short title for the step (used in wizard navigation)
   */
  shortTitle?: string;
  /**
   * Dynamic submit label for this step
   * Receives form values and returns a string label
   */
  submitLabel?: (values: Partial<TRequest>) => string;
  /** Title for the step */
  title: string;
  /**
   * Zod schema for validating this step's fields
   */
  validationSchema?: z.ZodSchema<Partial<TRequest>>;
}

/**
 * Configuration interface for a step form
 */
export interface StepFormConfig<
  TRequest extends BaseRecord = any,
  TResponse extends BaseRecord = any,
> extends Omit<FormConfig<TRequest, TResponse>, "fields" | "footer"> {
  /**
   * Whether to allow navigation to steps by clicking on progress indicator
   * @default true
   */
  allowStepNavigation?: boolean | (() => boolean);
  /** Custom footer renderer for step forms */
  footer?: StepFormFooterRenderer<TRequest, TResponse>;
  /**
   * Callback when all steps are completed successfully
   */
  onFinish?: (finalValues: TRequest) => Promise<void> | void;
  /** Behavior configuration for steps */
  stepBehavior?: {
    /** Default step to start on */
    defaultStep?: number;
    /** Whether to validate when going back */
    isBackValidate?: boolean;
  };
  /** Array of step definitions */
  steps: StepDefinition<TRequest>[];
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

/**
 * Type for step form footer renderer function
 */
export type StepFormFooterRenderer<
  TRequest extends BaseRecord = any,
  TResponse extends BaseRecord = any,
> = (
  /** Step control methods */
  stepMethods: StepFormMethods,
  /** Form methods */
  formMethods: any,
  /** Function to close the dialog */
  closeDialog: () => void,
  /** Current dialog configuration */
  currentDialog?: DialogConfig<TRequest, TResponse>,
) => React.ReactNode;

/**
 * Configuration object specifically for a multi-step form process.
 */
export interface StepFormMethods {
  /** Current step index */
  currentStep: number;
  /** Function to navigate to a specific step */
  gotoStep: (step: number) => void;
  /** Function to go to the next step */
  handleNext: () => Promise<void>;
  /** Function to go to the previous step */
  handlePrevious: () => Promise<void>;
  /** Function to retry the current step */
  handleRetry: () => Promise<void>;
  /** Function to submit the current step */
  handleSubmit: () => Promise<void>;
  /** Whether the current step is the first step */
  isFirstStep: boolean;
  /** Whether the current step is the last step */
  isLastStep: boolean;
  /** Function to jump to a specific step number */
  jumpTo: (step: number) => void;
  /** Total number of steps */
  totalSteps: number;
}

/**
 * Configuration for a wizard form that extends StepFormConfig with wizard-specific options
 */
export interface WizardFormConfig<
  TRequest extends BaseRecord = any,
  TResponse extends BaseRecord = any,
> extends StepFormConfig<TRequest, TResponse> {
  /**
   * Action buttons configuration for the form footer
   * Can be:
   * - Array of action button configs
   * - Function that receives form methods and step control props and returns array of action button configs
   * - false to hide action buttons
   */
  actionButtons?: ActionItemConfig[] | false | ActionButtonsCallback<TRequest>;
  /**
   * Whether to allow navigation to steps by clicking on progress indicator
   * @default true
   */
  allowStepNavigation?: boolean | (() => boolean);
  /**
   * Maximum width for step descriptions in the wizard header
   * Uses standard component size classes (e.g., 'xs', 'sm', 'md', 'lg', 'xl', '2xl', etc.)
   * @default 'xs'
   */
  descriptionMaxWidth?: ComponentSize;
  /**
   * Custom className for wizard footer
   */
  footerClassName?: string;
  /**
   * Custom className for wizard header
   */
  headerClassName?: string;
  /**
   * Style of progress indicator to use
   * @default 'timeline'
   */
  progressStyle?: "dots" | "stepper" | "timeline";
  /**
   * Whether to show step descriptions in the progress indicator
   * @default true
   */
  showStepDescriptions?: boolean;
  /**
   * Whether to show step progress indicator
   * @default true
   */
  showStepProgress?: boolean;
  /**
   * Whether to show step titles in the progress indicator
   * @default true
   */
  showStepTitles?: boolean;
  /**
   * Array of step indices that cannot be navigated to
   * @default []
   */
  stepNavigationDisabled?:
    | ((currentStep: number, data: any) => boolean[])
    | boolean[];
  /**
   * Custom className for wizard wrapper
   */
  wizardClassName?: string;
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

/**
 * Wizard-specific step definition that extends StepDefinition
 * Wizard steps require UI properties (icon, shortTitle, description) that are optional in regular step forms
 */
export interface WizardStepDefinition<TRequest extends BaseRecord = any>
  extends Omit<
    StepDefinition<TRequest>,
    "description" | "icon" | "shortTitle"
  > {
  /**
   * Whether to allow navigation to this step by clicking on progress indicator
   * Takes precedence over the wizard-level allowStepNavigation config
   */
  allowStepNavigation?: boolean | (() => boolean);
  /**
   * Description for the step
   * Required for wizard steps
   */
  description: string;
  /**
   * Icon for the step (used in wizard navigation)
   * Required for wizard steps
   */
  icon: React.ReactNode;
  /**
   * Short title for the step (used in wizard navigation)
   * Required for wizard steps
   */
  shortTitle: string;
}

/**
 * Type guard to check if footer is a function with the proper signature
 */
export function isFooterFunction<
  TRequest extends BaseRecord,
  TResponse extends BaseRecord,
>(
  footer:
    | ((
        methods: any,
        closeDialog: () => void,
        currentDialog?: DialogConfig<TRequest, TResponse>,
      ) => ActionItemConfig[] | ReactNode)
    | ActionItemConfig[]
    | false
    | ReactNode
    | undefined,
): footer is (
  methods: any,
  closeDialog: () => void,
  currentDialog?: DialogConfig<TRequest, TResponse>,
) => ActionItemConfig[] | ReactNode {
  if (typeof footer !== "function") return false;

  // We can't fully validate function signatures at runtime, but we can check the length
  // Footer functions should have 2 or 3 parameters (methods, closeDialog, currentDialog?)
  const fn = footer as Function;
  return fn.length >= 2 && fn.length <= 3;
}

/**
 * Type guard to check if actionButtons is a function with the proper signature
 */
export function isActionButtonsFunction<TRequest extends BaseRecord>(
  actionButtons:
    | ActionItemConfig[]
    | false
    | ((props: {
        environment?: UnifiedEnvironment;
      }) => ActionItemConfig[] | undefined | false)
    | undefined,
): actionButtons is (props: {
  environment?: UnifiedEnvironment;
}) => ActionItemConfig[] | undefined | false {
  return typeof actionButtons === "function";
}

/**
 * Type guard to check if header is a function
 */
export function isHeaderFunction<TRequest extends BaseRecord>(
  header: ((environment: any) => ReactNode) | false | ReactNode | undefined,
): header is (environment: any) => ReactNode {
  return typeof header === "function";
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

/**
 * Type guard to check if submitLabel is a function
 */
export function isSubmitLabelFunction<TRequest extends BaseRecord>(
  submitLabel: ((values: Partial<TRequest>) => string) | string | undefined,
): submitLabel is (values: Partial<TRequest>) => string {
  return typeof submitLabel === "function";
}
