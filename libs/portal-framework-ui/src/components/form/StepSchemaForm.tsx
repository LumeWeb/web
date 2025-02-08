import type { FieldValues } from "react-hook-form";

import { Button, Spinner } from "@lumeweb/portal-framework-ui-core";
import { BaseRecord } from "@refinedev/core";
import React, { useCallback, useMemo, useState } from "react";

import type { FormConfig } from "./types";

import { useDialog } from "../dialog/Dialog.context";
import { SchemaForm } from "./SchemaForm";
import { type StepFormConfig } from "./types";

interface StepSchemaFormProps<
  TRequest extends FieldValues = FieldValues,
  TResponse extends BaseRecord = any,
> {
  closeDialog: () => void;
  config: StepFormConfig<TRequest, TResponse>;
}

export function StepSchemaForm<
  TRequest extends FieldValues = FieldValues,
  TResponse extends BaseRecord = any,
>({ closeDialog, config }: StepSchemaFormProps<TRequest, TResponse>) {
  const { formMethods } = useDialog();
  const { defaultStep = 0, isBackValidate = false } = config.stepBehavior ?? {};
  const [currentStep, setCurrentStep] = useState(defaultStep);
  const totalSteps = config.steps.length;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  const currentStepFields = useMemo(
    () => config.steps[currentStep]?.fields || [],
    [config.steps, currentStep],
  );

  const getFieldsForStep = useCallback(
    (stepIndex: number): string[] => {
      return config.steps[stepIndex]?.fields.map((f) => f.name as string) || [];
    },
    [config.steps],
  );

  const go = (step: number) => {
    const targetStep = Math.max(0, Math.min(step, totalSteps - 1));
    setCurrentStep(targetStep);
  };

  const handleNext = useCallback(async () => {
    if (isLastStep || !formMethods?.trigger) return;

    const fieldsToValidate = getFieldsForStep(currentStep);
    if (fieldsToValidate.length === 0) {
      go(currentStep + 1);
      return;
    }

    const isValid = await formMethods.trigger(fieldsToValidate);
    if (isValid) {
      go(currentStep + 1);
    }
  }, [formMethods, currentStep, isLastStep, go, getFieldsForStep]);

  const handlePrevious = useCallback(async () => {
    if (isFirstStep) return;

    if (isBackValidate && formMethods?.trigger) {
      const fieldsToValidate = getFieldsForStep(currentStep);
      const isValid = await formMethods.trigger(fieldsToValidate);
      if (!isValid) return;
    }
    go(currentStep - 1);
  }, [
    formMethods,
    currentStep,
    isFirstStep,
    isBackValidate,
    go,
    getFieldsForStep,
  ]);

  const triggerSubmit = useCallback(() => {
    if (!formMethods?.handleSubmit) return;

    formMethods.handleSubmit(
      async (data: TRequest) => {
        console.log("Step form submitted", data);
      },
      (errors: any) => {
        console.error("Validation errors:", errors);
      },
    )();
  }, [formMethods]);

  const schemaFormConfigForCurrentStep: FormConfig<TRequest, TResponse> =
    useMemo(
      () => ({
        ...config,
        fields: currentStepFields,
        footer: null,
      }),
      [config, currentStepFields],
    );

  return (
    <>
      <SchemaForm<TRequest>
        closeDialog={closeDialog}
        config={schemaFormConfigForCurrentStep}
      />

      {config.footer && formMethods && typeof config.footer === "function" ? (
        config.footer(
          {
            currentStep,
            gotoStep: go,
            handleNext,
            handlePrevious,
            isFirstStep,
            isLastStep,
            totalSteps,
          },
          formMethods,
          closeDialog,
        )
      ) : formMethods ? (
        <div className="flex justify-between items-center pt-4 mt-4 border-t">
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
              onClick={triggerSubmit}
              type="button">
              {formMethods.formState?.isSubmitting ? (
                <>
                  <Spinner className="mr-2" size="small" /> Submitting...
                </>
              ) : (
                config.submitLabel || "Submit"
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
      ) : null}
    </>
  );
}
