import { Button, Spinner } from "@lumeweb/portal-framework-ui-core";
import React from "react";

interface StepFormFooterProps {
  closeDialog?: () => void;
  currentStep: number;
  formMethods: any;
  handleNext: () => Promise<void>;
  handlePrevious: () => Promise<void>;
  handleSubmit: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  submitLabel?: string;
  totalSteps: number;
}

export function StepFormFooter({
  closeDialog,
  currentStep,
  formMethods,
  handleNext,
  handlePrevious,
  handleSubmit,
  isFirstStep,
  isLastStep,
  submitLabel,
  totalSteps,
}: StepFormFooterProps) {
  // Get the current step's dynamic submit label if available
  const stepSubmitLabel =
    formMethods.getValues &&
    typeof formMethods.getValues === "function" &&
    typeof submitLabel === "function"
      ? submitLabel(formMethods.getValues())
      : submitLabel;

  return (
    <div className="flex items-center justify-between">
      <Button
        disabled={isFirstStep || formMethods.formState?.isSubmitting}
        onClick={handlePrevious}
        type="button"
        variant="outline">
        Previous
      </Button>
      {isLastStep ? (
        <Button
          disabled={formMethods.formState?.isSubmitting}
          onClick={handleSubmit}
          type="button">
          {formMethods.formState?.isSubmitting ? (
            <>
              <Spinner className="mr-2" size="small" /> Submitting...
            </>
          ) : (
            (stepSubmitLabel ?? "Submit")
          )}
        </Button>
      ) : (
        <Button
          disabled={formMethods.formState?.isSubmitting}
          onClick={handleNext}
          type="button">
          {stepSubmitLabel ?? "Next"}
        </Button>
      )}
    </div>
  );
}
