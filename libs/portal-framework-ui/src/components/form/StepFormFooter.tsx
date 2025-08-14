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
  return (
    <div className="flex justify-between items-center">
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
            (submitLabel ?? "Submit")
          )}
        </Button>
      ) : (
        <Button
          disabled={formMethods.formState?.isSubmitting}
          onClick={handleNext}
          type="button">
          Next
        </Button>
      )}
    </div>
  );
}
