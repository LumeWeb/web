import type { StepDefinition } from "../types";

/**
 * Creates an onStepRetry callback that properly connects to the step configuration
 * @param steps Array of step definitions
 * @returns A function that handles step retry by calling the appropriate onRetryStep callback
 */
export function createStepRetryHandler<TRequest = any>(
  steps: StepDefinition<TRequest>[],
) {
  return (step: number) => {
    const stepConfig = steps[step - 1];
    if (stepConfig?.onRetryStep) {
      stepConfig.onRetryStep();
    }
  };
}