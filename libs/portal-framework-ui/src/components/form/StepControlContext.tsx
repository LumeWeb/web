import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

/**
 * Interface for step control context values
 */
export interface StepControlContextType {
  /**
   * Current active step index
   */
  currentStep: number;
  /**
   * Navigate to a specific step
   * @param step - The step index to navigate to
   */
  goToStep: (step: number) => void;
  /**
   * Navigate to the next step
   */
  handleNext: () => Promise<void>;
  /**
   * Navigate to the previous step
   */
  handlePrevious: () => Promise<void>;
  /**
   * Whether the current step is the first step
   */
  isFirstStep: boolean;
  /**
   * Whether the current step is the last step
   */
  isLastStep: boolean;
  /**
   * Total number of steps
   */
  totalSteps: number;
}

const StepControlContext = createContext<StepControlContextType | undefined>(
  undefined,
);

export interface StepControlProviderProps {
  children: React.ReactNode;
  /**
   * Default step to start on
   * @default 0
   */
  defaultStep?: number;
  /**
   * Function to handle step submission
   */
  handleStepSubmit?: () => Promise<void>;
  /**
   * Whether to validate when going back steps
   * @default false
   */
  isBackValidate?: boolean;
  /**
   * Callback when step changes
   */
  onStepChange?: (step: number) => void;
  /**
   * Total number of steps
   */
  totalSteps: number;
  /**
   * Function to trigger validation for the current step
   */
  triggerValidation?: () => Promise<boolean>;
}

/**
 * Hook to create step control state independently
 * This hook can be used outside of StepControlProvider
 */
export interface UseCreateStepControlOptions {
  /**
   * Default step to start on
   * @default 0
   */
  defaultStep?: number;
  /**
   * Function to handle step submission
   */
  handleStepSubmit?: () => Promise<void>;
  /**
   * Whether to validate when going back steps
   * @default false
   */
  isBackValidate?: boolean;
  /**
   * Callback when step changes
   */
  onStepChange?: (step: number) => void;
  /**
   * Total number of steps
   */
  totalSteps: number;
  /**
   * Function to trigger validation for the current step
   */
  triggerValidation?: () => Promise<boolean>;
}

/**
 * Provider component for step control functionality
 * Handles step navigation logic and state management
 */
export function StepControlProvider({
  children,
  defaultStep = 0,
  handleStepSubmit,
  isBackValidate = false,
  onStepChange,
  totalSteps: totalStepsProp,
  triggerValidation,
}: StepControlProviderProps) {
  const stepControl = useCreateStepControl({
    defaultStep,
    handleStepSubmit,
    isBackValidate,
    onStepChange,
    totalSteps: totalStepsProp,
    triggerValidation,
  });

  return (
    <StepControlContext.Provider value={stepControl}>
      {children}
    </StepControlContext.Provider>
  );
}

export function useCreateStepControl({
  defaultStep = 0,
  handleStepSubmit,
  isBackValidate = false,
  onStepChange,
  totalSteps: totalStepsProp,
  triggerValidation,
}: UseCreateStepControlOptions): StepControlContextType {
  const [currentStep, setCurrentStep] = useState(defaultStep);

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalStepsProp - 1;

  const goToStep = useCallback(
    (step: number) => {
      const targetStep = Math.max(0, Math.min(step, totalStepsProp - 1));
      setCurrentStep(targetStep);
      onStepChange?.(targetStep);
    },
    [totalStepsProp, onStepChange],
  );

  const handleNext = useCallback(async () => {
    if (isLastStep) return;

    // Handle step submission if provided
    if (handleStepSubmit) {
      await handleStepSubmit();
    }

    goToStep(currentStep + 1);
  }, [currentStep, isLastStep, goToStep, handleStepSubmit]);

  const handlePrevious = useCallback(async () => {
    if (isFirstStep) return;

    if (isBackValidate && triggerValidation) {
      const isValid = await triggerValidation();
      if (!isValid) return;
    }

    goToStep(currentStep - 1);
  }, [currentStep, isFirstStep, isBackValidate, triggerValidation, goToStep]);

  return useMemo(
    () => ({
      currentStep,
      goToStep,
      handleNext,
      handlePrevious,
      isFirstStep,
      isLastStep,
      totalSteps: totalStepsProp,
    }),
    [
      currentStep,
      totalStepsProp,
      isFirstStep,
      isLastStep,
      goToStep,
      handleNext,
      handlePrevious,
    ],
  );
}

/**
 * Backward compatibility hook
 * This maintains the original API where useStepControl could be used as both
 * a context consumer and a creator depending on whether options were passed
 */
export function useStepControl(
  options?: UseCreateStepControlOptions,
): StepControlContextType {
  // If options are provided, create step control state independently
  if (options) {
    return useCreateStepControl(options);
  }

  // Otherwise, consume context (original behavior)
  return useStepControlContext();
}

/**
 * Hook to consume the step control context
 * @returns StepControlContextType - Step control methods and state
 * @throws Error if used outside StepControlProvider
 */
export function useStepControlContext() {
  const context = useContext(StepControlContext);
  if (context === undefined) {
    throw new Error("useStepControl must be used within a StepControlProvider");
  }
  return context;
}
