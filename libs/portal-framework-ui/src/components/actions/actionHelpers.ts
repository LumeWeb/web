import { ActionItemConfig, ActionItemType } from "./types";
import { DialogType, DialogTypes } from "@/components/dialog";

// TypeScript interfaces for better type safety
interface StepContext {
  currentStep?: number;
  isLastStep?: boolean;
}

export interface SubmitLabelEvaluationContext {
  formMethods?: {
    getValues?: () => any;
  };
  stepContext?: StepContext;
  wizardConfig?: WizardConfig;
}

interface WizardConfig {
  steps?: {
    submitLabel?: ((values: any) => string) | string;
  }[];
  submitLabel?: ((values: any) => string) | string;
}

export interface WizardActionsConfig {
  formMethods?: any;
  isFirst: boolean;
  isLast: boolean;
  isSubmitting?: boolean;
  onClose?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onSubmit?: () => void;
  submitLabel?: ((values: any) => string) | string;
}

export interface StepActionsConfig {
  formMethods?: any;
  isFirst: boolean;
  isLast: boolean;
  isSubmitting?: boolean;
  onClose?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  submitLabel?: ((values: any) => string) | string;
}

/**
 * Action creation utilities for common dialog and form patterns.
 *
 * These helpers provide a consistent way to create action configurations
 * while maintaining type safety and reducing boilerplate.
 *
 * @example
 * ```tsx
 * const { cancel, submit, back, next } = createActionHelpers();
 *
 * const actions = [
 *   cancel(handleClose),
 *   submit(handleSubmit, "Save", isSubmitting),
 *   back(handlePrevious),
 *   next(handleNext)
 * ];
 * ```
 */
export function createActionHelpers<T = any>() {
  return {
    /**
     * Creates a back button action for navigation
     */
    back: (
      onClick?: () => void,
      label = "Back",
      disabled = false,
    ): ActionItemConfig => ({
      disabled,
      label,
      onClick,
      type: ActionItemType.BUTTON,
    }),

    /**
     * Creates a custom button action
     */
    button: (
      onClick?: () => void,
      label: string,
      disabled = false,
    ): ActionItemConfig => ({
      disabled,
      label,
      onClick,
      type: ActionItemType.BUTTON,
    }),

    /**
     * Creates a cancel action that closes dialogs or cancels operations
     */
    cancel: (onClick?: () => void, label = "Cancel"): ActionItemConfig => ({
      label,
      onClick,
      type: ActionItemType.CANCEL,
    }),

    /**
     * Creates a custom action with specific type
     */
    custom: (
      type: ActionItemType,
      onClick?: () => void,
      label: string,
      options: Partial<ActionItemConfig> = {},
    ): ActionItemConfig => ({
      label,
      onClick,
      type,
      ...options,
    }),

    /**
     * Creates a next button action for navigation
     */
    next: (onClick?: () => void, label = "Next"): ActionItemConfig => ({
      label,
      onClick,
      type: ActionItemType.SUBMIT,
    }),

    /**
     * Creates a retry action for retrying the current step
     */
    retry: (onClick?: () => void, label = "Retry"): ActionItemConfig => ({
      label,
      onClick,
      type: ActionItemType.RETRY,
    }),

    /**
     * Creates a submit action for form submissions
     */
    submit: (
      onClick?: () => void,
      label = "Submit",
      isSubmitting = false,
    ): ActionItemConfig => ({
      label,
      loading: isSubmitting,
      onClick,
      type: ActionItemType.SUBMIT,
    }),
  };
}

/**
 * Creates standard dialog actions (Cancel + Submit/Continue)
 */
export function createDialogActions(config: {
  cancelLabel?: string;
  confirmLabel?: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
  type?: DialogType;
}): ActionItemConfig[] {
  const { button, cancel, submit } = createActionHelpers();

  const actions: ActionItemConfig[] = [];

  // For alert dialogs, we only want the confirm action (treated as OK/Continue)
  const isAlert = config.type === DialogTypes.ALERT;
  if (isAlert) {
    actions.push(cancel(config.onConfirm, config.confirmLabel || "OK"));
    return actions;
  }

  // For confirm, form, wizard_form and custom dialogs, include cancel action
  const isConfirm = config.type === "confirm";
  const isForm = config.type === "form";
  const isWizardForm = config.type === "wizard_form";
  const isCustom = config.type === "custom";

  if (config.onCancel) {
    actions.push(cancel(config.onCancel, config.cancelLabel));
  }

  if (config.onConfirm) {
    const isFormType = isForm || isWizardForm || isCustom;
    const isFormOrWizardForm = isForm || isWizardForm;
    const defaultLabel = isFormOrWizardForm ? "Submit" : "Continue";
    const label = config.confirmLabel || defaultLabel;

    if (isConfirm) {
      actions.push(cancel(config.onConfirm, label));
    } else if (isFormType) {
      actions.push(submit(config.onConfirm, label, config.isSubmitting));
    } else {
      actions.push(button(config.onConfirm, label));
    }
  }

  return actions;
}

/**
 * Creates form-specific actions with optional cancel button
 */
export function createFormActions(config: {
  cancelLabel?: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
  onSubmit?: () => void;
  showCancel?: boolean;
  submitLabel?: string;
}): ActionItemConfig[] {
  const { cancel, submit } = createActionHelpers();

  const actions: ActionItemConfig[] = [];

  // Cancel button (optional)
  if (config.showCancel && config.onCancel) {
    actions.push(cancel(config.onCancel, config.cancelLabel));
  }

  // Submit button
  if (config.onSubmit) {
    actions.push(
      submit(config.onSubmit, config.submitLabel, config.isSubmitting),
    );
  }

  return actions;
}

/**
 * Creates wizard-specific actions with conditional Back/Next/Submit buttons
 */
export function createWizardActions(
  config: WizardActionsConfig,
): ActionItemConfig[] {
  const { back, cancel, next, submit } = createActionHelpers();

  const actions: ActionItemConfig[] = [];

  // Back button (only if not first step)
  if (!config.isFirst && config.onPrevious) {
    actions.push(back(config.onPrevious));
  }

  // Next/Submit button
  if (config.isLast && config.onSubmit) {
    const evaluationContext: SubmitLabelEvaluationContext = {
      formMethods: config.formMethods,
      stepContext: { isLastStep: config.isLast }, // Pass step context
      wizardConfig: config, // Pass wizard config for step-specific label evaluation
    };

    const evaluatedSubmitLabel = evaluateSubmitLabel(
      config.submitLabel,
      evaluationContext,
    );

    actions.push(
      submit(
        config.onSubmit,
        evaluatedSubmitLabel || "Continue",
        config.isSubmitting,
      ),
    );
  } else if (config.onNext) {
    actions.push(next(config.onNext));
  }

  // Cancel button (optional)
  if (config.onClose) {
    actions.push(cancel(config.onClose));
  }

  return actions;
}

/**
 * Creates step-specific actions with Previous and Next buttons
 */
export function createStepActions(
  config: StepActionsConfig,
): ActionItemConfig[] {
  const { back, cancel, next, submit } = createActionHelpers();

  const actions: ActionItemConfig[] = [];

  // Previous button (disabled on first step)
  actions.push(back(config.onPrevious, "Previous", config.isFirst));

  // Next/Submit button
  if (config.isLast) {
    const evaluationContext: SubmitLabelEvaluationContext = {
      formMethods: config.formMethods,
      stepContext: { isLastStep: config.isLast },
    };

    const evaluatedSubmitLabel = evaluateSubmitLabel(
      config.submitLabel,
      evaluationContext,
    );

    actions.push(
      submit(
        config.onNext,
        evaluatedSubmitLabel || "Submit",
        config.isSubmitting,
      ),
    );
  } else {
    actions.push(next(config.onNext));
  }

  // Cancel button (optional)
  if (config.onClose) {
    actions.push(cancel(config.onClose));
  }

  return actions;
}

/**
 * Evaluates dynamic submit label if it's a function, otherwise returns static label
 * Enhanced to handle wizard step-specific labels
 */
export function evaluateSubmitLabel(
  submitLabel: ((values: any) => string) | string | undefined,
  context: SubmitLabelEvaluationContext = {},
): string | undefined {
  const { formMethods, stepContext, wizardConfig } = context;

  // Handle wizard step-specific submit labels first
  if (wizardConfig && stepContext) {
    // Try to evaluate step-specific label
    const stepLabel = evaluateWizardStepLabel(
      wizardConfig,
      stepContext,
      formMethods,
    );
    if (stepLabel !== undefined) {
      return stepLabel;
    }

    // Try to evaluate wizard form-level label for last step
    const wizardLabel = evaluateWizardFormLabel(
      wizardConfig,
      stepContext,
      formMethods,
    );
    if (wizardLabel !== undefined) {
      return wizardLabel;
    }
  }

  // Fall back to form-level submit label evaluation
  return evaluateFormLabel(submitLabel, formMethods);
}

/**
 * Evaluates simple form submit label
 */
function evaluateFormLabel(
  submitLabel: ((values: any) => string) | string | undefined,
  formMethods?: { getValues?: () => any },
): string | undefined {
  if (!submitLabel) return undefined;

  if (
    typeof submitLabel === "function" &&
    formMethods?.getValues &&
    typeof formMethods.getValues === "function"
  ) {
    return submitLabel(formMethods.getValues());
  }

  if (typeof submitLabel === "string") {
    return submitLabel;
  }

  return undefined;
}

export { evaluateSubmitLabel };

/**
 * Evaluates wizard form-level submit label
 */
function evaluateWizardFormLabel(
  wizardConfig: WizardConfig,
  stepContext: StepContext,
  formMethods?: { getValues?: () => any },
): string | undefined {
  const { isLastStep } = stepContext;

  if (!isLastStep || !wizardConfig.submitLabel) return undefined;

  if (
    typeof wizardConfig.submitLabel === "function" &&
    formMethods?.getValues
  ) {
    return wizardConfig.submitLabel(formMethods.getValues());
  }

  if (typeof wizardConfig.submitLabel === "string") {
    return wizardConfig.submitLabel;
  }

  return undefined;
}

/**
 * Evaluates wizard step-specific submit label
 */
function evaluateWizardStepLabel(
  wizardConfig: WizardConfig,
  stepContext: StepContext,
  formMethods?: { getValues?: () => any },
): string | undefined {
  const { currentStep } = stepContext;

  if (currentStep === undefined) return undefined;

  const stepSubmitLabel = wizardConfig.steps?.[currentStep - 1]?.submitLabel;

  if (!stepSubmitLabel) return undefined;

  if (typeof stepSubmitLabel === "function" && formMethods?.getValues) {
    return stepSubmitLabel(formMethods.getValues());
  }

  if (typeof stepSubmitLabel === "string") {
    return stepSubmitLabel;
  }

  return undefined;
}
