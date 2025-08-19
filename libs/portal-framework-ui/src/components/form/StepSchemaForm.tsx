import type { FieldValues } from "react-hook-form";

import { BaseRecord } from "@refinedev/core";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { FormConfig, StepFormFooterRenderer } from "./types";

import { useDialog } from "../dialog/Dialog.context";
import { getStepOnSuccessHandler, handleStepSubmission } from "./handlers/step";
import { SchemaForm } from "./SchemaForm";
import { StepFormFooter } from "./StepFormFooter";
import { type StepFormConfig } from "./types";

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

  const formInstances = useRef<Record<number, any>>({});

  // Clean up form instances when steps change or component unmounts
  useEffect(() => {
    const currentSteps = config.steps;
    return () => {
      // On unmount or steps change, clear any instances that are no longer valid
      const validStepIndices = new Set(currentSteps.map((_, index) => index));
      Object.keys(formInstances.current).forEach((key) => {
        const index = Number(key);
        if (!validStepIndices.has(index)) {
          delete formInstances.current[index];
        }
      });
    };
  }, [config.steps]);

  const getFormInstance = useCallback(
    (stepIndex: number) => {
      if (!formInstances.current[stepIndex]) {
        formInstances.current[stepIndex] = {
          fields: config.steps[stepIndex]?.fields || [],
          getFields: () =>
            config.steps[stepIndex]?.fields.map((f) => f.name as string) || [],
        };
      }
      return formInstances.current[stepIndex];
    },
    [config.steps],
  );

  const currentStepConfig = useMemo(() => {
    return getFormInstance(currentStep);
  }, [currentStep, getFormInstance]);

  const go = (step: number) => {
    const targetStep = Math.max(0, Math.min(step, totalSteps - 1));
    setCurrentStep(targetStep);
  };

  const handleNext = useCallback(async () => {
    if (!formMethods?.handleSubmit) return;

    await handleStepSubmission({
      closeDialog,
      config: {
        ...config,
        onSuccess: getStepOnSuccessHandler(
          config,
          formMethods,
          isLastStep,
          closeDialog,
        ),
      },
      currentStep,
      formMethods,
      goToNextStep: isLastStep ? undefined : () => go(currentStep + 1),
      isLastStep,
      stepConfig: config.steps[currentStep],
    });
  }, [formMethods, currentStep, isLastStep, go, closeDialog, config]);

  const handlePrevious = useCallback(async () => {
    if (isFirstStep) return;

    if (isBackValidate && formMethods?.trigger) {
      const currentForm = getFormInstance(currentStep);
      const isValid = await formMethods.trigger(currentForm.getFields());
      if (!isValid) return;
    }

    // Call onStepSubmit for previous step if going back
    const prevStepConfig = config.steps[currentStep - 1];
    if (prevStepConfig.onStepSubmit) {
      const prevForm = getFormInstance(currentStep - 1);
      const prevStepValues = prevForm.getFields().reduce((acc, field) => {
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
    getFormInstance,
    config.steps,
  ]);

  const triggerSubmit = useCallback(() => {
    if (!formMethods?.handleSubmit) return;

    handleStepSubmission({
      closeDialog,
      config: {
        ...config,
        onSuccess: getStepOnSuccessHandler(
          config,
          formMethods,
          isLastStep,
          closeDialog,
        ),
      },
      currentStep,
      formMethods,
      isLastStep,
      stepConfig: config.steps[currentStep],
    });
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

  const schemaForms = useMemo(() => {
    return config.steps.map((step, index) => {
      const formConfig: FormConfig<TRequest, TResponse> = {
        ...config,
        fields: getFormInstance(index).fields,
        footer: config.footer === false ? false : getStepFooter,
        validationSchema: step.validationSchema,
      };
      return (
        <SchemaForm<TRequest>
          active={currentStep === index}
          closeDialog={closeDialog}
          config={formConfig}
          key={`step-${index}`}
        />
      );
    });
  }, [config, currentStep, getFormInstance, getStepFooter, closeDialog]);

  return <>{schemaForms}</>;
}
