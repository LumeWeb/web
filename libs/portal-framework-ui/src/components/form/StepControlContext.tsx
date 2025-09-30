import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import type { NavigationType } from "@/components";

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
   * Jump to a specific step without transition animation
   * @param step - The step index to jump to
   */
  jumpTo: (step: number) => void;
  /**
   * Navigate to the next step
   */
  handleNext: () => Promise<void>;
  /**
   * Navigate to the previous step
   */
  handlePrevious: () => Promise<void>;
  /**
   * Retry the current step
   */
  handleRetry: () => Promise<void>;
  /**
   * Number of times the current step has been retried
   */
  retryCount: number;
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
  /**
   * Transition state with navigation direction
   */
  transitionState: {
    direction: "backward" | "forward" | null;
    enteringStep: null | number;
    exitingStep: null | number;
  };
}

const StepControlContext = createContext<StepControlContextType | undefined>(
  undefined,
);

export interface StepControlProviderProps {
  children: React.ReactNode;
  /**
   * Default step to start on
   */
  defaultStep?: number;
  /**
   * Function to handle step submission
   */
  handleStepSubmit?: () => Promise<void>;
  /**
   * Whether to validate when going back steps
   */
  isBackValidate?: boolean;
  /**
   * Callback when step changes
   */
  onStepChange?: (step: number) => void;
  /**
   * Callback when step is retried
   */
  onStepRetry?: (step: number) => void;
  /**
   * Callback when navigation starts
   */
  onNavigationStart?: (
    fromStep: number,
    toStep: number,
    type: NavigationType,
  ) => void;
  /**
   * Callback when navigation ends successfully
   */
  onNavigationEnd?: (
    fromStep: number,
    toStep: number,
    type: NavigationType,
  ) => void;
  /**
   * Callback when navigation fails
   */
  onNavigationError?: (
    fromStep: number,
    toStep: number,
    type: NavigationType,
    error: any,
  ) => void;
  /**
   * Total number of steps
   */
  totalSteps?: number;
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
   * @default 1
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
   * Callback when step is retried
   */
  onStepRetry?: (step: number) => void;
  /**
   * Callback when navigation starts
   */
  onNavigationStart?: (
    fromStep: number,
    toStep: number,
    type: NavigationType,
  ) => void;
  /**
   * Callback when navigation ends successfully
   */
  onNavigationEnd?: (
    fromStep: number,
    toStep: number,
    type: NavigationType,
  ) => void;
  /**
   * Callback when navigation fails
   */
  onNavigationError?: (
    fromStep: number,
    toStep: number,
    type: NavigationType,
    error: any,
  ) => void;
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
  defaultStep,
  handleStepSubmit,
  isBackValidate,
  onStepChange,
  onStepRetry,
  onNavigationStart,
  onNavigationEnd,
  onNavigationError,
  totalSteps,
  triggerValidation,
}: StepControlProviderProps) {
  const stepControl = useCreateStepControl({
    defaultStep: defaultStep ?? 1,
    handleStepSubmit,
    isBackValidate: isBackValidate ?? false,
    onStepChange,
    onStepRetry,
    onNavigationStart,
    onNavigationEnd,
    onNavigationError,
    totalSteps: totalSteps ?? 1,
    triggerValidation,
  });

  return (
    <StepControlContext.Provider value={stepControl}>
      {children}
    </StepControlContext.Provider>
  );
}

export function useCreateStepControl({
  defaultStep = 1,
  handleStepSubmit,
  isBackValidate = false,
  onStepChange,
  onStepRetry,
  onNavigationStart,
  onNavigationEnd,
  onNavigationError,
  totalSteps: totalStepsProp,
  triggerValidation,
}: UseCreateStepControlOptions): StepControlContextType {
  const [currentStep, setCurrentStep] = useState(defaultStep);
  const [retryCount, setRetryCount] = useState(0);
  const [transitionState, setTransitionState] = useState<{
    direction: "backward" | "forward" | null;
    enteringStep: null | number;
    exitingStep: null | number;
  }>({
    direction: null,
    enteringStep: null,
    exitingStep: null,
  });

  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalStepsProp;

  const goToStep = useCallback(
    (step: number) => {
      const targetStep = Math.max(1, Math.min(step, totalStepsProp));

      // Call navigation start callback
      try {
        onNavigationStart?.(currentStep, targetStep, "goTo");
      } catch (error) {
        onNavigationError?.(currentStep, targetStep, "goTo", error);
        return;
      }

      if (targetStep === currentStep) {
        onNavigationEnd?.(currentStep, targetStep, "goTo");
        return;
      }

      // Reset retry count when navigating to a different step
      setRetryCount(0);

      // Determine navigation direction
      const direction = targetStep > currentStep ? "forward" : "backward";

      setTransitionState({
        direction,
        enteringStep: targetStep,
        exitingStep: currentStep,
      });

      // After transition duration, update the current step
      setTimeout(() => {
        try {
          setCurrentStep(targetStep);
          setTransitionState({
            direction: null,
            enteringStep: null,
            exitingStep: null,
          });
          onStepChange?.(targetStep);
          onNavigationEnd?.(currentStep, targetStep, "goTo");
        } catch (error) {
          onNavigationError?.(currentStep, targetStep, "goTo", error);
        }
      }, 300);
    },
    [
      totalStepsProp,
      onStepChange,
      currentStep,
      onNavigationStart,
      onNavigationEnd,
      onNavigationError,
    ],
  );

  const jumpTo = useCallback(
    (step: number) => {
      const targetStep = Math.max(1, Math.min(step, totalStepsProp));

      // Call navigation start callback
      try {
        onNavigationStart?.(currentStep, targetStep, "jumpTo");
      } catch (error) {
        onNavigationError?.(currentStep, targetStep, "jumpTo", error);
        return;
      }

      if (targetStep === currentStep) {
        onNavigationEnd?.(currentStep, targetStep, "jumpTo");
        return;
      }

      // Reset retry count when jumping to a different step
      setRetryCount(0);

      // Skip transition animation and directly set the step
      try {
        setCurrentStep(targetStep);
        onStepChange?.(targetStep);
        onNavigationEnd?.(currentStep, targetStep, "jumpTo");
      } catch (error) {
        onNavigationError?.(currentStep, targetStep, "jumpTo", error);
      }
    },
    [
      totalStepsProp,
      onStepChange,
      currentStep,
      onNavigationStart,
      onNavigationEnd,
      onNavigationError,
    ],
  );

  const handleRetry = useCallback(async () => {
    // Call navigation start callback
    try {
      onNavigationStart?.(currentStep, currentStep, "retry");
    } catch (error) {
      onNavigationError?.(currentStep, currentStep, "retry", error);
      return;
    }

    // Increment retry count
    setRetryCount((prev) => prev + 1);

    // Trigger transition animation for retry
    setTransitionState({
      direction: null,
      enteringStep: currentStep,
      exitingStep: currentStep,
    });

    // After transition duration, reset transition state, set current step to force reprocessing, and trigger callback
    setTimeout(() => {
      try {
        setTransitionState({
          direction: null,
          enteringStep: null,
          exitingStep: null,
        });
        setCurrentStep(currentStep);
        onStepRetry?.(currentStep);
        onNavigationEnd?.(currentStep, currentStep, "retry");
      } catch (error) {
        onNavigationError?.(currentStep, currentStep, "retry", error);
      }
    }, 300);
  }, [
    currentStep,
    onStepRetry,
    onNavigationStart,
    onNavigationEnd,
    onNavigationError,
  ]);

  const handleNext = useCallback(async () => {
    if (isLastStep) return;

    const targetStep = currentStep + 1;

    // Call navigation start callback
    try {
      onNavigationStart?.(currentStep, targetStep, "next");
    } catch (error) {
      onNavigationError?.(currentStep, targetStep, "next", error);
      return;
    }

    // Handle step submission if provided
    if (handleStepSubmit) {
      try {
        await handleStepSubmit();
      } catch (error) {
        onNavigationError?.(currentStep, targetStep, "next", error);
        return;
      }
    }

    goToStep(targetStep);
  }, [
    currentStep,
    isLastStep,
    goToStep,
    handleStepSubmit,
    onNavigationStart,
    onNavigationEnd,
    onNavigationError,
  ]);

  const handlePrevious = useCallback(async () => {
    if (isFirstStep) return;

    const targetStep = currentStep - 1;

    // Call navigation start callback
    try {
      onNavigationStart?.(currentStep, targetStep, "previous");
    } catch (error) {
      onNavigationError?.(currentStep, targetStep, "previous", error);
      return;
    }

    if (isBackValidate && triggerValidation) {
      try {
        const isValid = await triggerValidation();
        if (!isValid) {
          onNavigationError?.(
            currentStep,
            targetStep,
            "previous",
            new Error("Validation failed"),
          );
          return;
        }
      } catch (error) {
        onNavigationError?.(currentStep, targetStep, "previous", error);
        return;
      }
    }

    goToStep(targetStep);
  }, [
    currentStep,
    isFirstStep,
    isBackValidate,
    triggerValidation,
    goToStep,
    onNavigationStart,
    onNavigationEnd,
    onNavigationError,
  ]);

  return useMemo(
    () => ({
      currentStep,
      goToStep,
      jumpTo,
      handleNext,
      handlePrevious,
      handleRetry,
      retryCount,
      isFirstStep,
      isLastStep,
      totalSteps: totalStepsProp,
      transitionState,
    }),
    [
      currentStep,
      totalStepsProp,
      isFirstStep,
      isLastStep,
      goToStep,
      jumpTo,
      handleNext,
      handlePrevious,
      handleRetry,
      retryCount,
      transitionState,
    ],
  );
}

/**
 * Hook to optionally consume the step control context
 * @returns StepControlContextType | undefined - Step control methods and state, or undefined if not in context
 */
export function useOptionalStepControlContext() {
  return useContext(StepControlContext);
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
