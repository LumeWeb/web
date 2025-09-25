import { WizardStepDefinition } from "@/components";

/**
 * Shared utility for calculating step state in wizard navigation
 * Reduces code duplication between mobile and desktop renderers
 */
export interface StepState {
  canNavigate: boolean;
  isActive: boolean;
  isCompleted: boolean;
  isDisabled: boolean;
  step: WizardStepDefinition;
}

/**
 * Calculate the state of a step at the given index
 */
export function calculateStepState(
  index: number,
  current: number,
  total: number,
  allowNavigation: boolean,
  disabledSteps: number[],
  steps: WizardStepDefinition[],
): StepState {
  const step = steps[index] || { title: `Step ${index + 1}` };

  const isActive = index === current - 1;
  const isCompleted = index < current - 1;
  const isDisabled = disabledSteps.includes(index + 1) || index + 1 > current;

  const canNavigate = allowNavigation && !isDisabled && index + 1 <= current;

  return {
    canNavigate,
    isActive,
    isCompleted,
    isDisabled,
    step,
  };
}

/**
 * Create a step click handler that validates navigation permissions
 */
export function createStepClickHandler(
  index: number,
  allowNavigation: boolean,
  disabledSteps: number[],
  current: number,
  steps: WizardStepDefinition[],
  onStepClick?: (stepIndex: number) => void,
): () => void {
  return () => {
    if (!allowNavigation) return;

    const isDisabled = disabledSteps.includes(index + 1) || index + 1 > current;
    if (!isDisabled && index + 1 <= current && onStepClick) {
      onStepClick(index + 1);
    }
  };
}

/**
 * Resolves whether step navigation is allowed based on step-level and wizard-level configurations
 * @param wizardLevelConfig - Wizard-level navigation permission (boolean or function)
 * @param steps - Array of wizard step definitions
 * @param currentStep - Current step index (1-indexed)
 * @returns Boolean indicating if step navigation is allowed
 */
export function resolveAllowStepNavigation(
  wizardLevelConfig: boolean | (() => boolean) | undefined,
  steps: WizardStepDefinition[],
  currentStep: number,
): boolean {
  // Check if current step has its own navigation configuration
  const currentStepDefinition = steps[currentStep - 1];
  if (currentStepDefinition?.allowStepNavigation !== undefined) {
    // If step-level config is a function, call it; otherwise use the boolean value
    if (typeof currentStepDefinition.allowStepNavigation === "function") {
      return currentStepDefinition.allowStepNavigation();
    }
    return currentStepDefinition.allowStepNavigation;
  }

  // Fall back to wizard-level configuration
  if (wizardLevelConfig !== undefined) {
    // If wizard-level config is a function, call it; otherwise use the boolean value
    if (typeof wizardLevelConfig === "function") {
      return wizardLevelConfig();
    }
    return wizardLevelConfig;
  }

  // Default to true if neither is configured
  return true;
}

/**
 * Create keyboard event handler for step navigation
 */
export function createStepKeyHandler(
  index: number,
  allowNavigation: boolean,
  disabledSteps: number[],
  current: number,
  steps: WizardStepDefinition[],
  onStepClick?: (stepIndex: number) => void,
): (e: React.KeyboardEvent) => void {
  return (e: React.KeyboardEvent) => {
    if (!allowNavigation) return;

    const isDisabled = disabledSteps.includes(index + 1) || index + 1 > current;
    if (
      !isDisabled &&
      index + 1 <= current &&
      onStepClick &&
      (e.key === "Enter" || e.key === " ")
    ) {
      e.preventDefault();
      onStepClick(index + 1);
    }
  };
}
