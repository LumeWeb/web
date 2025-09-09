import type { FieldValues } from "react-hook-form";

import { BaseRecord } from "@refinedev/core";
import React, { useCallback, useMemo } from "react";

import type { FormConfig, StepFormFooterRenderer } from "./types";

import { useDialog } from "../dialog/Dialog.context";
import { FormProvider } from "./context";
import { getStepOnSuccessHandler, handleStepSubmission } from "./handlers/step";
import { SchemaForm } from "./SchemaForm";
import { StepControlProvider, useStepControl } from "./StepControlContext";
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

interface StepSchemaFormContentProps<
  TRequest extends FieldValues = FieldValues,
  TResponse extends BaseRecord = any,
> {
  closeDialog: () => void;
  config: StepFormConfig<TRequest, TResponse>;
  currentDialog: any;
  formMethods: any;
}

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
  const stepControl = useStepControl({
    defaultStep: config.stepBehavior?.defaultStep,
    isBackValidate: config.stepBehavior?.isBackValidate,
    steps: config.steps,
  });

  return (
    <StepControlProvider value={stepControl}>
      <StepSchemaFormContent
        closeDialog={closeDialog}
        config={config}
        currentDialog={currentDialog}
        formMethods={formMethods}
      />
    </StepControlProvider>
  );
}

function StepSchemaFormContent<
  TRequest extends FieldValues = FieldValues,
  TResponse extends BaseRecord = any,
>({
  closeDialog,
  config,
  currentDialog,
  formMethods,
}: StepSchemaFormContentProps<TRequest, TResponse>) {
  const stepControl = useStepControl();
  const {
    currentStep,
    handleNext,
    handlePrevious,
    isFirstStep,
    isLastStep,
    totalSteps,
  } = stepControl;

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
        gotoStep: stepControl.goToStep,
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
      stepControl.goToStep,
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
        fields: step.fields,
        footer: config.footer === false ? false : getStepFooter,
        validationSchema: step.validationSchema,
      };
      return (
        <FormProvider
          adapter={config.adapter ?? "rhf"}
          config={{ ...formConfig, steps: config.steps }}
          formInstance={formMethods}
          key={`step-${index}`}
          stepControl={stepControl}>
          <SchemaForm<TRequest>
            active={currentStep === index}
            closeDialog={closeDialog}
            config={formConfig}
          />
        </FormProvider>
      );
    });
  }, [
    config,
    currentStep,
    getStepFooter,
    closeDialog,
    formMethods,
    stepControl,
  ]);

  return <>{schemaForms}</>;
}
