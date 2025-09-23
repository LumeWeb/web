import type { BaseRecord } from "@refinedev/core";

import React, { useMemo } from "react";

import { FooterType } from "./registry/types";

import { isActionButtonsFunction } from "../../components/form/types";
import {
  ActionItemConfig,
  ActionItemType,
  createActionHelpers,
  createDialogActions,
  createFormActions,
  createStepActions,
  createWizardActions,
  evaluateSubmitLabel,
  type SubmitLabelEvaluationContext,
} from "../actions";
import {
  FooterContextProvider,
  useOptionalFooterContext,
} from "./context/FooterContext";
import { footerRegistry } from "./registry/FooterRegistry";
import {
  BaseFooterProps,
  FooterEnvironment,
  isDialogContainer,
  isWizardForm,
  isStepForm,
  isSimpleForm,
} from "./types";
import { useEnvironmentSync } from "./hooks/useEnvironmentSync";

// Action generator registry pattern
interface ActionGenerator<T extends BaseRecord = any> {
  checker: (environment: Partial<FooterEnvironment<T>>) => boolean;
  generator: (
    environment: Partial<FooterEnvironment<T>>,
    submitLabel: string,
  ) => ActionItemConfig[];
  priority: number;
}

class ActionGeneratorRegistry<T extends BaseRecord = any> {
  private generators: ActionGenerator<T>[] = [];

  generateActions(
    environment: Partial<FooterEnvironment<T>>,
    submitLabel: string,
  ): ActionItemConfig[] {
    for (const generator of this.generators) {
      if (generator.checker(environment)) {
        // Return actions from first matching generator only
        return generator.generator(environment, submitLabel);
      }
    }

    return [];
  }

  register(generator: ActionGenerator<T>): void {
    this.generators.push(generator);
    // Sort by priority (higher priority first)
    this.generators.sort((a, b) => b.priority - a.priority);
  }
}

// Create registry instance
const actionGeneratorRegistry = new ActionGeneratorRegistry();

// Register wizard form navigation action generator (most specific)
actionGeneratorRegistry.register({
  checker: (environment) =>
    isWizardForm(environment?.form) && !!environment?.step,
  generator: (environment, submitLabel) => {
    const step = environment?.step;

    return createWizardActions({
      isFirst: step?.isFirst,
      isLast: step?.isLast,
      isSubmitting: environment?.form?.isSubmitting,
      onClose: environment?.container?.onClose,
      onNext: environment?.form?.methods?.handleSubmit,
      onPrevious: step?.onPrevious,
      onSubmit: environment?.form?.methods?.handleSubmit,
      submitLabel: submitLabel,
    });
  },
  priority: 500,
});

// Register step form navigation action generator
actionGeneratorRegistry.register({
  checker: (environment) =>
    isStepForm(environment?.form) && !!environment?.step,
  generator: (environment, submitLabel) => {
    const step = environment?.step;

    return createStepActions({
      isFirst: step?.isFirst,
      isLast: step?.isLast,
      isSubmitting: environment?.form?.isSubmitting,
      onClose: environment?.container?.onClose,
      onNext: step?.onNext,
      onPrevious: step?.onPrevious,
      submitLabel: submitLabel,
    });
  },
  priority: 400,
});

// Register dialog cancel action generator
actionGeneratorRegistry.register({
  checker: (environment) =>
    isDialogContainer(environment?.container) &&
    !isSimpleForm(environment?.form),
  generator: (environment, submitLabel) => {
    return createDialogActions({
      cancelLabel: submitLabel || "Done",
      onCancel: environment?.container?.onClose,
      type: "confirm",
    });
  },
  priority: 300,
});

// Register form footer action generator
actionGeneratorRegistry.register({
  checker: (environment) =>
    !!environment?.form &&
    !isWizardForm(environment?.form) &&
    !isStepForm(environment?.form),
  generator: (environment, submitLabel) => {
    return createFormActions({
      isSubmitting: environment?.form?.isSubmitting,
      onCancel: isDialogContainer(environment?.container)
        ? environment?.container?.onClose
        : undefined,
      onSubmit: environment?.form?.methods?.handleSubmit,
      showCancel:
        isDialogContainer(environment?.container) &&
        !!environment?.container?.onClose,
      submitLabel,
    });
  },
  priority: 200,
});

// Register simple form submit action generator (most broad)
actionGeneratorRegistry.register({
  checker: (environment) => !!environment?.form,
  generator: (environment, submitLabel) => {
    const { submit } = createActionHelpers();
    return [
      submit(
        environment?.form?.methods?.handleSubmit,
        submitLabel,
        environment?.form?.isSubmitting,
      ),
    ];
  },
  priority: 100,
});

interface UnifiedFooterProps<T extends BaseRecord = any> {
  className?: string;
  config: any;
  environment: Partial<FooterEnvironment<T>>;
}

export function UnifiedFooter<T extends BaseRecord = any>({
  className,
  config,
  environment,
}: UnifiedFooterProps<T>) {
  // Implement environment sync mechanism
  config && useEnvironmentSync(environment, config.environmentSync);

  return (
    <FooterContextProvider value={environment}>
      <UnifiedFooterInner className={className} config={config} />
    </FooterContextProvider>
  );
}

function generateDefaultActions<T extends BaseRecord = any>(
  environment: Partial<FooterEnvironment<T>>,
  submitLabel: string,
): ActionItemConfig[] {
  return actionGeneratorRegistry.generateActions(environment, submitLabel);
}

function UnifiedFooterInner<T extends BaseRecord = any>({
  className,
  config,
}: Omit<UnifiedFooterProps<T>, "environment">) {
  const environment = useOptionalFooterContext<T>();

  // Implement environment sync mechanism
  config && useEnvironmentSync(environment, config.environmentSync);

  const footerType = footerRegistry.resolveType(config, environment);
  const FooterComponent = footerRegistry.get(footerType);

  // Smart submit label evaluation
  const submitLabel = useMemo(() => {
    // Check if we're in a step context and if the current step has a submitLabel
    if (
      environment.form &&
      isWizardForm(environment?.form) &&
      environment.step
    ) {
      const currentStepIndex = environment.step.current - 1;
      const currentStep = config.steps?.[currentStepIndex];

      if (currentStep?.submitLabel) {
        // Create typed evaluation context for step-specific submit label
        const evaluationContext: SubmitLabelEvaluationContext = {
          formMethods: environment.form?.methods,
          stepContext: {
            currentStep: currentStepIndex,
            isLastStep: environment.step.isLast,
          },
          wizardConfig: config,
        };

        // Evaluate step-specific submit label and ensure it's a string
        const evaluatedLabel = evaluateSubmitLabel(
          currentStep.submitLabel,
          evaluationContext,
        );
        if (evaluatedLabel !== undefined) {
          return String(evaluatedLabel);
        }
      }
    }

    // Fallback to form-level submit label
    const label =
      config && "submitLabel" in config ? config.submitLabel : undefined;

    // Create typed evaluation context
    const evaluationContext: SubmitLabelEvaluationContext = {
      formMethods: environment.form?.methods,
      stepContext: environment.step
        ? {
            currentStep: environment.step.current - 1, // Convert to 0-based index for steps array
            isLastStep: environment.step.isLast,
          }
        : undefined,
      wizardConfig:
        environment.form && isWizardForm(environment.form) && environment.step
          ? config
          : undefined,
    };

    // Use enhanced evaluateSubmitLabel helper with typed context
    const evaluatedLabel = evaluateSubmitLabel(label, evaluationContext);

    // Ensure submitLabel is always a string with a safe default
    return String(evaluatedLabel || "Submit");
  }, [config, environment]);

  // Smart action mapping
  const actions = useMemo(() => {
    let baseActions: any = undefined;

    // Check if we're in a step context and if the current step has actionButtons
    if (
      environment.form &&
      isWizardForm(environment.form) &&
      environment.step
    ) {
      const currentStepIndex = environment.step.current - 1;
      const currentStep = config.steps?.[currentStepIndex];

      if (currentStep?.actionButtons !== undefined) {
        baseActions = currentStep.actionButtons;
      }
    }

    // Fallback to form-level actionButtons if step doesn't have them
    if (baseActions === undefined) {
      baseActions =
        config && "actionButtons" in config ? config.actionButtons : undefined;
    }

    // Check if the footer config has an actions array
    if (config && Array.isArray(config.footer)) {
      baseActions = config.footer;
    }

    // Check if baseActions is a function and evaluate it
    if (isActionButtonsFunction(baseActions)) {
      const evaluatedActions = baseActions({
        environment,
      });

      // If function returns false, disable actions
      if (evaluatedActions === false) {
        return [];
      }

      // If function returns undefined, fallback to default actions
      if (evaluatedActions === undefined) {
        return generateDefaultActions(environment, submitLabel);
      }

      // If function returns action array, use those actions
      return evaluatedActions.map((action) => ({
        ...action,
        loading:
          action.type === ActionItemType.SUBMIT &&
          environment.form?.isSubmitting,
        onClick:
          action.type === ActionItemType.SUBMIT
            ? environment.form?.methods?.handleSubmit
            : action.onClick,
      }));
    }

    // Check if the footer config has an actions array
    if (config && Array.isArray(config.footer)) {
      baseActions = config.footer;
    }

    // If baseActions false, disable actions
    if (baseActions === false) {
      return [];
    }

    if (!baseActions) {
      return generateDefaultActions(environment, submitLabel);
    }

    return baseActions.map((action) => ({
      ...action,
      loading:
        action.type === ActionItemType.SUBMIT && environment.form?.isSubmitting,
      onClick:
        action.type === ActionItemType.SUBMIT
          ? environment.form?.methods?.handleSubmit
          : action.onClick,
    }));
  }, [config, environment, submitLabel]);

  // Determine if footer type needs form-specific props
  const needsFormProps = [FooterType.FORM, FooterType.STEP_FORM].includes(footerType);

  const baseProps: BaseFooterProps<T> = {
    actionButtons: actions,
    className,
    environment,
    isSubmitting: environment.form?.isSubmitting ?? false,
    onClose:
      environment.container && isDialogContainer(environment.container)
        ? environment.container.onClose
        : undefined,
  };

  // Explicitly handle props based on footer type
  const props = needsFormProps 
    ? {
        ...baseProps,
        onConfirm: environment.form?.methods?.handleSubmit,
        submitLabel,
      }
    : baseProps;

  return <FooterComponent {...props} />;
}
