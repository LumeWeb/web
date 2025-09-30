import type { FieldValues } from "react-hook-form";

import { BaseRecord } from "@refinedev/core";
import React, { useCallback, useMemo } from "react";

import type { FormConfig, StepFormFooterRenderer } from "./types";
import { AdapterType, type StepFormConfig } from "./types";

import { useDialog } from "@/components";
import { isFormDialog, isWizardDialogConfig } from "@/components";
import { Environment, isWizardForm, UnifiedFooter } from "@/components";
import { FormProvider } from "./context";
import { getStepOnSuccessHandler, handleStepSubmission } from "./handlers/step";
import { SchemaForm } from "./SchemaForm";
import {
  StepControlProvider,
  useOptionalStepControlContext,
  useStepControl,
} from "./StepControlContext";
import { createStepRetryHandler } from "./utils/stepRetry";
import { WizardStepContent } from "./WizardStepContent";

const defaultStepFormFooter: StepFormFooterRenderer = (
  stepMethods,
  formMethods,
  currentDialog,
) => {
  const footerEnvironment = Environment.footer()
    .standalone()
    .stepForm({
      isSubmitting: formMethods?.formState?.isSubmitting || false,
      methods: formMethods,
    })
    .step({
      current: stepMethods.currentStep,
      isFirst: stepMethods.isFirstStep,
      isLast: stepMethods.isLastStep,
      jumpTo: stepMethods.jumpTo,
      onNext: stepMethods.handleSubmit || stepMethods.handleNext,
      onPrevious: stepMethods.handlePrevious,
      onRetry: stepMethods.handleRetry,
      total: stepMethods.totalSteps,
    })
    .build();

  return (
    <UnifiedFooter
      config={
        isFormDialog(currentDialog) || isWizardDialogConfig(currentDialog)
          ? currentDialog.formConfig
          : currentDialog
      }
      environment={footerEnvironment}
    />
  );
};

interface StepSchemaFormContentProps<
  TRequest extends FieldValues = FieldValues,
  TResponse extends BaseRecord = any,
> {
  closeDialog: () => void;
  config: StepFormConfig<TRequest, TResponse>;
  currentDialog: any;
  formMethods: any;
  onNavigationStart?: (fromStep: number, toStep: number, type: 'goTo' | 'jumpTo' | 'next' | 'previous' | 'retry') => void;
  onNavigationEnd?: (fromStep: number, toStep: number, type: 'goTo' | 'jumpTo' | 'next' | 'previous' | 'retry') => void;
  onNavigationError?: (fromStep: number, toStep: number, type: 'goTo' | 'jumpTo' | 'next' | 'previous' | 'retry', error: any) => void;
}

interface StepSchemaFormProps<
  TRequest extends FieldValues = FieldValues,
  TResponse extends BaseRecord = any,
> {
  closeDialog: () => void;
  config: StepFormConfig<TRequest, TResponse>;
  onNavigationStart?: (fromStep: number, toStep: number, type: 'goTo' | 'jumpTo' | 'next' | 'previous' | 'retry') => void;
  onNavigationEnd?: (fromStep: number, toStep: number, type: 'goTo' | 'jumpTo' | 'next' | 'previous' | 'retry') => void;
  onNavigationError?: (fromStep: number, toStep: number, type: 'goTo' | 'jumpTo' | 'next' | 'previous' | 'retry', error: any) => void;
}

export function StepSchemaForm<
  TRequest extends FieldValues = FieldValues,
  TResponse extends BaseRecord = any,
>({ closeDialog, config, onNavigationStart, onNavigationEnd, onNavigationError }: StepSchemaFormProps<TRequest, TResponse>) {
  const { currentDialog, formMethods } = useDialog();
  const existingStepControl = useOptionalStepControlContext();

  // If we're already in a step control context, render content directly
  if (existingStepControl && existingStepControl.totalSteps > 0) {
    return (
      <StepSchemaFormContent
        closeDialog={closeDialog}
        config={config}
        currentDialog={currentDialog}
        formMethods={formMethods}
        onNavigationStart={onNavigationStart}
        onNavigationEnd={onNavigationEnd}
        onNavigationError={onNavigationError}
      />
    );
  }

  // Otherwise, create a new step control context
  return (
    <StepControlProvider
      defaultStep={config.stepBehavior?.defaultStep}
      isBackValidate={config.stepBehavior?.isBackValidate}
      onStepRetry={createStepRetryHandler(config.steps)}
      totalSteps={config.steps.length}
      onNavigationStart={onNavigationStart}
      onNavigationEnd={onNavigationEnd}
      onNavigationError={onNavigationError}>
      <StepSchemaFormContent
        closeDialog={closeDialog}
        config={config}
        currentDialog={currentDialog}
        formMethods={formMethods}
        onNavigationStart={onNavigationStart}
        onNavigationEnd={onNavigationEnd}
        onNavigationError={onNavigationError}
      />
    </StepControlProvider>
  );
}

function getStepFooterConfig<
  TRequest extends FieldValues,
  TResponse extends BaseRecord,
>(
  isActive: boolean,
  footerConfig: StepFormConfig<TRequest, TResponse>["footer"],
  stepMethods: any,
  triggerSubmit: () => void,
): false | React.ComponentType<any> {
  if (!isActive) {
    return false;
  }
  if (footerConfig === false) {
    return false;
  }

  // Return a Higher-Order Component that receives props and calls the original footer function
  return function StepFooterComponent(props: any) {
    const { closeDialog, currentDialog, formMethods } = props;
    const footerFn = footerConfig ?? defaultStepFormFooter;
    return footerFn(
      { ...stepMethods, handleSubmit: triggerSubmit },
      formMethods?.current,
      closeDialog,
      currentDialog,
    );
  };
}

function StepSchemaFormContent<
  TRequest extends FieldValues = FieldValues,
  TResponse extends BaseRecord = any,
>({
  closeDialog,
  config,
  formMethods,
  onNavigationStart,
  onNavigationEnd,
  onNavigationError,
}: StepSchemaFormContentProps<TRequest, TResponse>) {
  const stepControl = useStepControl();
  const {
    currentStep,
    goToStep, // Use context's goToStep which now has transitions
    jumpTo,
    handleNext,
    handlePrevious,
    handleRetry,
    isFirstStep,
    isLastStep,
    totalSteps,
    transitionState, // Get transition state from context
  } = stepControl;

  const triggerSubmit = useCallback(() => {
    if (!formMethods?.current?.handleSubmit) return;

    handleStepSubmission({
      closeDialog,
      config: {
        ...config,
        onSuccess: getStepOnSuccessHandler(
          config,
          formMethods?.current,
          isLastStep,
          closeDialog,
        ),
      },
      currentStep, // Keep 1-based for external APIs
      formMethods: formMethods?.current,
      goToNextStep: handleNext, // Add the missing goToNextStep parameter
      isLastStep,
      stepConfig: config.steps[currentStep - 1], // Convert to 0-based index for array access
    });
  }, [formMethods?.current, config, currentStep, isLastStep, closeDialog, handleNext]);

  const schemaForms = useMemo(() => {
    const stepMethods = {
      currentStep, // Keep 1-based for external APIs
      goToStep, // Use context's goToStep directly
      jumpTo,
      handleNext,
      handlePrevious,
      handleRetry,
      isFirstStep,
      isLastStep,
      totalSteps,
    };

    return config.steps.map((step, index) => {
      const isActive = currentStep === index + 1; // Compare 1-based currentStep with 0-based index
      const isExiting = transitionState.exitingStep === index + 1;
      const isEntering = transitionState.enteringStep === index + 1;

      const formConfig: FormConfig<TRequest, TResponse> = {
        ...config,
        fields: step.fields,
        footer: getStepFooterConfig(
          isActive,
          config.footer,
          stepMethods,
          triggerSubmit,
        ),
        validationSchema: step.validationSchema,
      };

      const schemaForm = (
        <SchemaForm<TRequest>
          active={isActive}
          closeDialog={closeDialog}
          config={formConfig}
        />
      );

      const formContent = isWizardForm(config) ? (
        <WizardStepContent
          className="space-y-6"
          description={step.description}
          icon={step.icon}
          isActive={isActive}
          isEntering={isEntering}
          isExiting={isExiting}
          title={step.title}>
          {schemaForm}
        </WizardStepContent>
      ) : (
        schemaForm
      );

      return (
        <FormProvider
          adapter={config.adapter ?? AdapterType.RHF}
          config={{ ...formConfig, steps: config.steps }}
          formInstance={formMethods}
          key={`step-${index}`}>
          {formContent}
        </FormProvider>
      );
    });
  }, [
    config,
    currentStep,
    goToStep,
    jumpTo,
    handleNext,
    handlePrevious,
    handleRetry,
    isFirstStep,
    isLastStep,
    totalSteps,
    triggerSubmit,
    closeDialog,
    formMethods,
    transitionState,
    onNavigationStart,
    onNavigationEnd,
    onNavigationError,
  ]);

  return <div className="grid grid-cols-1 grid-rows-1">{schemaForms}</div>;
}
