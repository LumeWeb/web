import type { FieldValues } from "react-hook-form";

import { BaseRecord } from "@refinedev/core";
import React, { useMemo } from "react";

import type { WizardFormConfig } from "./types";

import { useDialog } from "@/components";
import { useIsInDialog } from "@/components";
import { Environment, UnifiedFooter, UnifiedHeader } from "@/components";
import { ProgressStyleType } from "@/components";
import { resolveAllowStepNavigation } from "@/components";
import { StepControlProvider, useStepControl } from "./StepControlContext";
import { StepSchemaForm } from "./StepSchemaForm";
import { createStepRetryHandler } from "./utils/stepRetry";

interface WizardFormContentProps<
  TRequest extends FieldValues = FieldValues,
  TResponse extends BaseRecord = any,
> {
  closeDialog: () => void;
  config: WizardFormConfig<TRequest, TResponse>;
  formMethods: any;
  isInDialog: boolean;
}

interface WizardFormProps<
  TRequest extends FieldValues = FieldValues,
  TResponse extends BaseRecord = any,
> {
  closeDialog?: () => void;
  config: WizardFormConfig<TRequest, TResponse>;
}

export function WizardForm<
  TRequest extends FieldValues = FieldValues,
  TResponse extends BaseRecord = any,
>({
  closeDialog = () => void 0,
  config,
}: WizardFormProps<TRequest, TResponse>) {
  const { formMethods } = useDialog();
  const existingStepControl = useStepControl();
  const isInDialog = useIsInDialog();

  // If we're already in a step control context, render content directly
  if (existingStepControl && existingStepControl.totalSteps > 0) {
    return (
      <WizardFormContent
        closeDialog={closeDialog}
        config={config}
        formMethods={formMethods}
        isInDialog={isInDialog}
      />
    );
  }

  return (
    <StepControlProvider
      defaultStep={config.stepBehavior?.defaultStep}
      isBackValidate={config.stepBehavior?.isBackValidate}
      onStepRetry={createStepRetryHandler(config.steps)}
      totalSteps={config.steps.length}
      onNavigationStart={config.onNavigationStart}
      onNavigationEnd={config.onNavigationEnd}
      onNavigationError={config.onNavigationError}>
      <WizardFormContent
        closeDialog={closeDialog}
        config={config}
        formMethods={formMethods}
        isInDialog={isInDialog}
      />
    </StepControlProvider>
  );
}

function WizardFormContent<
  TRequest extends FieldValues = FieldValues,
  TResponse extends BaseRecord = any,
>({
  closeDialog,
  config,
  formMethods,
  isInDialog,
}: WizardFormContentProps<TRequest, TResponse>) {
  const { currentDialog } = useDialog();
  const stepControl = useStepControl();
  const { currentStep, goToStep, isFirstStep, isLastStep, totalSteps } =
    stepControl;
  const isSubmitting = formMethods?.current?.formState?.isSubmitting || false;

  // Helper function to evaluate allowStepNavigation (step-level takes precedence over wizard-level)
  const isStepNavigationAllowed = useMemo(() => {
    return resolveAllowStepNavigation(
      config.allowStepNavigation,
      config.steps,
      currentStep,
    );
  }, [config.allowStepNavigation, config.steps, currentStep]);

  // Create header environment
  const currentStepConfig = config.steps[currentStep - 1];
  const headerEnvironmentBuilder = Environment.header();

  // Use dialog container if we're in a dialog, otherwise use standalone
  if (isInDialog) {
    headerEnvironmentBuilder.dialog({
      dialogConfig: currentDialog || {},
      onClose: closeDialog,
    });
  } else {
    headerEnvironmentBuilder.standalone();
  }

  const headerEnvironment = headerEnvironmentBuilder
    .content({
      actions: undefined,
      description: currentStepConfig?.description,
      title: currentStepConfig?.title,
    })
    .wizardNavigation({
      allowNavigation: isStepNavigationAllowed,
      current: currentStep,
      disabledSteps: config.stepNavigationDisabled,
      onStepClick: goToStep,
      progressStyle: ProgressStyleType.TIMELINE,
      steps: config.steps,
      total: totalSteps,
    })
    .build();

  return (
    <div className={config.wizardClassName || "space-y-6"}>
      {!isInDialog && (
        <UnifiedHeader config={config} environment={headerEnvironment} />
      )}
      <div className="space-y-4">
        <div className="space-y-4">
          <StepSchemaForm
            closeDialog={closeDialog}
            config={{
              ...config,
              footer: (
                stepMethods,
                formMethods,
                closeDialog,
                currentDialog,
              ) => {
                const footerEnvironmentBuilder = Environment.footer();

                // Use dialog container if we're in a dialog, otherwise use standalone
                if (isInDialog) {
                  footerEnvironmentBuilder.dialog({
                    dialogConfig: currentDialog || {},
                    onClose: closeDialog,
                  });
                } else {
                  footerEnvironmentBuilder.standalone();
                }

                const footerEnvironment = footerEnvironmentBuilder
                  .wizardForm({
                    isSubmitting,
                    methods: {
                      ...formMethods?.current,
                      handleSubmit: stepMethods.handleSubmit, // Override with step-specific handler
                    },
                  })
                  .step({
                    current: currentStep,
                    isFirst: isFirstStep,
                    isLast: isLastStep,
                    jumpTo: stepControl.jumpTo,
                    onNext: stepMethods.handleNext,
                    onPrevious: stepMethods.handlePrevious,
                    onRetry: stepMethods.handleRetry,
                    retryCount: stepControl.retryCount,
                    total: totalSteps,
                  })
                  .build();

                // Pass the config with actionButtons to UnifiedFooter
                // This allows UnifiedFooter to properly evaluate dynamic actionButtons callbacks
                return (
                  <UnifiedFooter
                    config={config}
                    environment={footerEnvironment}
                  />
                );
              },
              header: false, // Never render step headers in wizards
              stepBehavior: config.stepBehavior,
            }}
          />
        </div>
      </div>
    </div>
  );
}
