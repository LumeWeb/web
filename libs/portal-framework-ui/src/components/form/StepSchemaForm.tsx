import type { FieldValues } from "react-hook-form";

import { BaseRecord } from "@refinedev/core";
import React, { useCallback, useMemo, useState } from "react";

import type { FormConfig, StepFormFooterRenderer } from "./types";
import { type StepFormConfig } from "./types";

import { useDialog } from "../dialog/Dialog.context";
import { SchemaForm } from "./SchemaForm";
import { StepFormFooter } from "./StepFormFooter";

const defaultStepFormFooter: StepFormFooterRenderer = (
  stepMethods,
  formMethods,
  closeDialog,
  currentDialog,
) => (
  <StepFormFooter
    closeDialog={closeDialog}
    currentStep={stepMethods.currentStep}
    formMethods={formMethods}
    handleNext={stepMethods.handleNext}
    handlePrevious={stepMethods.handlePrevious}
    handleSubmit={stepMethods.handleSubmit}
    isFirstStep={stepMethods.isFirstStep}
    isLastStep={stepMethods.isLastStep}
    submitLabel={
      currentDialog?.type === "form"
        ? currentDialog.formConfig?.submitLabel
        : undefined
    }
    totalSteps={stepMethods.totalSteps}
  />
);

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
  const { currentDialog, formMethods } = useDialog();
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
    if (isLastStep || !formMethods?.handleSubmit) return;

    const currentStepConfig = config.steps[currentStep];

    await formMethods.handleSubmit(
      async (data: Partial<TRequest>) => {
        try {
          let submitResult: any;
          if (currentStepConfig.onStepSubmit) {
            submitResult = await currentStepConfig.onStepSubmit(data);
          }

          // Call step success handler with both data and submit result
          if (currentStepConfig.onStepSuccess) {
            await currentStepConfig.onStepSuccess(submitResult, data);
          }

          // Only proceed to next step if submission succeeds
          go(currentStep + 1);
        } catch (error) {
          if (currentStepConfig.onStepError) {
            await currentStepConfig.onStepError(error as Error);
          }
          throw error;
        }
      },
      (errors: any) => {
        console.error("Validation errors:", errors);
      },
    )();
  }, [
    formMethods,
    currentStep,
    isLastStep,
    go,
    getFieldsForStep,
    config.steps,
  ]);

  const handlePrevious = useCallback(async () => {
    if (isFirstStep) return;

    if (isBackValidate && formMethods?.trigger) {
      const fieldsToValidate = getFieldsForStep(currentStep);
      const isValid = await formMethods.trigger(fieldsToValidate);
      if (!isValid) return;
    }

    // Call onStepSubmit for previous step if going back
    const prevStepConfig = config.steps[currentStep - 1];
    if (prevStepConfig.onStepSubmit) {
      const prevFields = getFieldsForStep(currentStep - 1);
      const prevStepValues = prevFields.reduce((acc, field) => {
        acc[field] = formMethods?.getValues(field);
        return acc;
      }, {} as Partial<TRequest>);
      await prevStepConfig.onStepSubmit(prevStepValues);
    }

    go(currentStep - 1);
  }, [
    formMethods,
    currentStep,
    isFirstStep,
    isBackValidate,
    go,
    getFieldsForStep,
    config.steps,
  ]);

  const triggerSubmit = useCallback(() => {
    if (!formMethods?.handleSubmit) return;

    const currentStepConfig = config.steps[currentStep];

    formMethods.handleSubmit(
      async (data: Partial<TRequest>) => {
        try {
          if (currentStepConfig.onStepSubmit) {
            await currentStepConfig.onStepSubmit(data);
          }

          if (isLastStep) {
            const allValues = formMethods.getValues() as TRequest;
            if (config.onFinish) {
              await config.onFinish(allValues);
            }
            if (config.onSuccess) {
              await config.onSuccess(allValues, allValues);
            }
            // Close dialog after successful final step submission if available
            closeDialog?.();
          }
        } catch (error) {
          if (currentStepConfig.onStepError) {
            await currentStepConfig.onStepError(error as Error);
          }
          throw error;
        }
      },
      (errors: any) => {
        console.error("Validation errors:", errors);
      },
    )();
  }, [formMethods, config, currentStep, isLastStep, closeDialog]);

  const getStepFooter = useCallback(
    (methods: any, closeDlg: () => void, dialog: any) => {
      const stepMethods = {
        currentStep,
        gotoStep: go,
        handleNext,
        handlePrevious,
        isFirstStep,
        isLastStep,
        totalSteps,
      };

      const footerFn = config.footer ?? defaultStepFormFooter;
      return footerFn(
        { ...stepMethods, handleSubmit: triggerSubmit },
        methods,
        closeDlg,
        dialog,
      );
    },
    [
      config.footer,
      currentStep,
      go,
      handleNext,
      handlePrevious,
      isFirstStep,
      isLastStep,
      totalSteps,
      triggerSubmit,
    ],
  );

  const schemaFormConfigForCurrentStep: FormConfig<TRequest, TResponse> =
    useMemo(
      () => ({
        ...config,
        fields: currentStepFields,
        footer: config.footer === false ? false : getStepFooter,
        validationSchema: config.steps[currentStep]?.validationSchema,
      }),
      [config, currentStepFields, currentStep, getStepFooter],
    );

  return (
    <>
      <SchemaForm<TRequest>
        closeDialog={closeDialog}
        config={schemaFormConfigForCurrentStep}
      />
    </>
  );
}
