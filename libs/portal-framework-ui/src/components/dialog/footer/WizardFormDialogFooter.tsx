import type { BaseRecord } from "@refinedev/core";

import { DialogFooter } from "@lumeweb/portal-framework-ui-core";
import React from "react";

import { useStepControl } from "../../form/StepControlContext";
import { WizardFooter } from "../../form/WizardFooter";
import { FooterComponentProps } from "./DialogFooter.registry";

export function WizardFormDialogFooter<T extends BaseRecord = any>({
  className,
  closeDialog,
  currentDialog,
  formMethods,
}: FooterComponentProps<T>): React.JSX.Element {
  const stepControl = useStepControl();

  if (!currentDialog.formConfig || !stepControl) return null;

  const {
    currentStep,
    handleNext,
    handlePrevious,
    isFirstStep,
    isLastStep,
    totalSteps,
  } = stepControl;

  return (
    <DialogFooter className={className}>
      <WizardFooter
        currentStep={currentStep}
        formMethods={formMethods}
        isFirstStep={isFirstStep}
        isLastStep={isLastStep}
        isSubmitting={formMethods.formState?.isSubmitting || false}
        onBack={handlePrevious}
        onNext={handleNext}
        onSubmit={formMethods.handleSubmit}
        submitLabel={currentDialog.formConfig.submitLabel}
        totalSteps={totalSteps}
      />
    </DialogFooter>
  );
}
