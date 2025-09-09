import { Button, Spinner } from "@lumeweb/portal-framework-ui-core";
import React from "react";

interface WizardFooterProps {
  currentStep: number;
  formMethods: any;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  submitLabel?: ((values: any) => string) | string;
  totalSteps: number;
}

export function WizardFooter({
  currentStep,
  formMethods,
  isFirstStep,
  isLastStep,
  isSubmitting,
  onBack,
  onNext,
  onSubmit,
  submitLabel,
  totalSteps,
}: WizardFooterProps) {
  // Get the current step's dynamic submit label if available
  const stepSubmitLabel =
    formMethods.getValues &&
    typeof formMethods.getValues === "function" &&
    typeof submitLabel === "function"
      ? submitLabel(formMethods.getValues())
      : submitLabel;

  const progressPercentage = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <div className="mt-4 flex flex-col items-center justify-between gap-4 border-t pt-4 sm:flex-row">
      <div className="text-muted-foreground text-sm">
        Step {currentStep + 1} of {totalSteps}
      </div>

      <div className="flex w-full items-center gap-2 sm:w-auto">
        <Button
          className="flex-1 sm:flex-none"
          disabled={isFirstStep || isSubmitting}
          onClick={onBack}
          type="button"
          variant="outline">
          Back
        </Button>

        {isLastStep ? (
          <Button
            className="flex-1 sm:flex-none"
            disabled={isSubmitting}
            onClick={onSubmit}
            type="button">
            {isSubmitting ? (
              <>
                <Spinner className="mr-2" size="small" /> Submitting...
              </>
            ) : (
              (stepSubmitLabel ?? "Submit")
            )}
          </Button>
        ) : (
          <Button
            className="flex-1 sm:flex-none"
            disabled={isSubmitting}
            onClick={onNext}
            type="button">
            {stepSubmitLabel ?? "Next"}
          </Button>
        )}
      </div>

      <div className="flex w-full items-center gap-2 sm:w-auto">
        <div className="bg-muted h-2 w-full overflow-hidden rounded-full sm:w-24">
          <div
            className="bg-primary h-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <span className="text-muted-foreground whitespace-nowrap text-xs">
          {progressPercentage}% complete
        </span>
      </div>
    </div>
  );
}
