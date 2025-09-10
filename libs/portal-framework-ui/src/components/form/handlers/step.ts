import type { BaseRecord } from "@refinedev/core";
import type { UseFormReturn } from "react-hook-form";

import type { FormConfig, StepDefinition, StepFormConfig } from "../types";

import { handleFormSubmission } from "./core";

export interface StepSubmissionHandlerOptions<TRequest, TResponse> {
  closeDialog?: () => void;
  config: FormConfig<TRequest, TResponse>;
  currentStep: number;
  formMethods: UseFormReturn<TRequest>;
  goToNextStep?: () => void;
  isLastStep?: boolean;
  stepConfig: StepDefinition<TRequest>;
}

export function getStepOnSuccessHandler<
  TRequest extends BaseRecord,
  TResponse extends BaseRecord,
>(
  config: StepFormConfig<TRequest, TResponse>,
  formMethods: UseFormReturn<TRequest>,
  isLastStep: boolean,
  closeDialog: () => void,
) {
  return async (response: TResponse, data: TRequest) => {
    if (isLastStep) {
      const allValues = formMethods.getValues();
      if (config.closeOnSubmit ?? true) {
        await closeDialog();
      }
      if (config.onFinish) {
        await config.onFinish(allValues);
      }
      if (config.onSuccess) {
        await config.onSuccess(response, allValues);
      }
    }
  };
}

export async function handleStepSubmission<
  TRequest extends BaseRecord,
  TResponse extends BaseRecord,
>(options: StepSubmissionHandlerOptions<TRequest, TResponse>): Promise<void> {
  const { currentStep, goToNextStep, stepConfig, ...baseOptions } = options;

  return handleFormSubmission({
    ...baseOptions,
    closeOnSubmit: false, // Never close dialog during step transitions
    isStep: true,
    onError: async (error) => {
      if (stepConfig.onStepError) {
        await stepConfig.onStepError(error);
      }
    },
    onSubmit: async (data) => {
      const { isLastStep } = options;

      if (stepConfig.onStepSubmit) {
        return stepConfig.onStepSubmit(data);
      }

      if (isLastStep && options.config.onSubmit) {
        return options.config.onSubmit(data);
      }

      // Default return when no submit handlers are defined
      return Promise.resolve(data);
    },
    onSuccess: async (response, data) => {
      const { isLastStep } = options;

      // First call step-specific success handler if defined
      if (stepConfig.onStepSuccess) {
        await stepConfig.onStepSuccess(response, data);
      }

      // Then call any parent success handler (for final form submission)
      if (options.config.onSuccess) {
        await options.config.onSuccess(response, data);
      }

      // Finally proceed to next step if not last step
      if (!isLastStep && options.goToNextStep) {
        await options.goToNextStep();
      }
    },
  });
}
