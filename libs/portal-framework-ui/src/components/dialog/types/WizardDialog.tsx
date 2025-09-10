"use client";

import React from "react";

import type { WizardDialogConfig } from "../Dialog.types";

import { createWizardActions } from "../../actions/actionHelpers";
import { useStepControl } from "../../form/StepControlContext";
import { WizardForm } from "../../form/WizardForm";
import { Environment, UnifiedHeader } from "../../shared";
import { ProgressStyleType } from "../../shared/types/header";
import { resolveAllowStepNavigation } from "../../shared/utils/stepState";

interface WizardDialogProps<TRequest, TResponse>
  extends WizardDialogConfig<TRequest, TResponse> {
  isFirst?: boolean;
  isLast?: boolean;
  isSubmitting?: boolean;
  onClose?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function WizardDialog<
  TRequest extends Record<string, any>,
  TResponse extends Record<string, any>,
>({
  actions,
  formConfig,
  isFirst = false,
  isLast = false,
  isSubmitting,
  onClose,
  onNext,
  onPrevious,
  onSubmit,
  onSuccess,
  title,
  ...props
}: WizardDialogProps<TRequest, TResponse>) {
  const stepControl = useStepControl();
  const { currentStep, goToStep, totalSteps } = stepControl;

  // Create header environment with wizard navigation
  const currentStepConfig = formConfig.steps[currentStep - 1];
  const isStepNavigationAllowed = resolveAllowStepNavigation(
    formConfig.allowStepNavigation,
    formConfig.steps,
    currentStep
  );
  
  const headerEnvironment = Environment.header()
    .standalone()
    .content({
      description: currentStepConfig?.description,
      title: currentStepConfig?.title,
    })
    .wizardNavigation({
      allowNavigation: isStepNavigationAllowed,
      current: currentStep,
      disabledSteps: formConfig.stepNavigationDisabled,
      onStepClick: isStepNavigationAllowed ? goToStep : undefined,
      progressStyle: ProgressStyleType.TIMELINE,
      steps: formConfig.steps,
      total: totalSteps,
    })
    .build();

  return (
    <>
      <UnifiedHeader config={formConfig} environment={headerEnvironment} />
      <WizardForm
        closeDialog={onClose}
        config={{
          ...formConfig,
          onSubmit: onSubmit,
          onSuccess: onSuccess,
        }}
        {...props}
      />
    </>
  );
}
