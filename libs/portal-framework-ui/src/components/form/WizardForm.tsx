import type { FieldValues } from "react-hook-form";

import { BaseRecord } from "@refinedev/core";
import React from "react";

import type { WizardFormConfig } from "./types";

import { useDialog } from "../dialog/Dialog.context";
import { useStepControl } from "./StepControlContext";
import { StepControlProvider } from "./StepControlContext";
import { StepSchemaForm } from "./StepSchemaForm";
import { WizardFooter } from "./WizardFooter";
import { WizardHeader } from "./WizardHeader";
import { WizardStepContent } from "./WizardStepContent";

interface WizardFormContentProps<
  TRequest extends FieldValues = FieldValues,
  TResponse extends BaseRecord = any,
> {
  closeDialog: () => void;
  config: WizardFormConfig<TRequest, TResponse>;
  formMethods: any;
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
  const stepControl = useStepControl({
    defaultStep: config.stepBehavior?.defaultStep,
    isBackValidate: config.stepBehavior?.isBackValidate,
    steps: config.steps,
  });

  return (
    <StepControlProvider value={stepControl}>
      <WizardFormContent
        closeDialog={closeDialog}
        config={config}
        formMethods={formMethods}
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
}: WizardFormContentProps<TRequest, TResponse>) {
  const stepControl = useStepControl();
  const {
    currentStep,
    goToStep,
    handleNext,
    handlePrevious,
    isFirstStep,
    isLastStep,
    totalSteps,
  } = stepControl;
  const isSubmitting = formMethods?.formState?.isSubmitting || false;

  return (
    <div className={config.wizardClassName || "space-y-6"}>
      <WizardHeader
        currentStep={currentStep}
        descriptionMaxWidth={config.descriptionMaxWidth}
        disabledSteps={config.stepNavigationDisabled}
        onStepClick={
          config.allowStepNavigation !== false ? goToStep : undefined
        }
        showDescriptions={config.showStepDescriptions !== false}
        showTitles={config.showStepTitles !== false}
        steps={config.steps}
      />
      <div className="space-y-4">
        <WizardStepContent
          description={config.steps[currentStep].description}
          icon={config.steps[currentStep].icon}
          isActive={true}
          title={config.steps[currentStep].title}>
          <StepSchemaForm
            closeDialog={closeDialog}
            config={{
              ...config,
              footer: (
                stepMethods,
                formMethods,
                closeDialog,
                currentDialog,
              ) => (
                <WizardFooter
                  currentStep={currentStep}
                  formMethods={formMethods}
                  isFirstStep={isFirstStep}
                  isLastStep={isLastStep}
                  isSubmitting={isSubmitting}
                  onBack={handlePrevious}
                  onNext={handleNext}
                  onSubmit={stepMethods.handleSubmit}
                  submitLabel={
                    config.steps[currentStep].submitLabel || config.submitLabel
                  }
                  totalSteps={totalSteps}
                />
              ),
              stepBehavior: config.stepBehavior,
            }}
          />
        </WizardStepContent>
      </div>
    </div>
  );
}
