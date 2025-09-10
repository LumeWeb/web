/**
 * Interface representing the environment for a step component
 */
export interface StepEnvironment {
  /**
   * The current step number (1-indexed)
   */
  current: number;
  
  /**
   * Whether the current step is the first step
   */
  isFirst: boolean;
  
  /**
   * Whether the current step is the last step
   */
  isLast: boolean;
  
  /**
   * Callback function to move to the next step
   * @returns Promise that resolves when the next step operation is complete
   */
  onNext?: () => Promise<void>;
  
  /**
   * Callback function to move to the previous step
   * @returns Promise that resolves when the previous step operation is complete
   */
  onPrevious?: () => Promise<void>;
  
  /**
   * Callback function to retry the current step
   * @returns Promise that resolves when the retry operation is complete
   */
  onRetry?: () => Promise<void>;
  
  /**
   * Jump to a specific step by step number
   * @param step - The step number to jump to (1-indexed)
   */
  jumpTo?: (step: number) => void;
  
  /**
   * The total number of steps
   */
  total: number;
  
  /**
   * Number of times the current step has been retried
   */
  retryCount: number;
}



/**
 * Creates a StepEnvironment object with the provided options
 * @param options - Configuration options for the step environment
 * @param options.current - The current step number (1-indexed)
 * @param options.isFirst - Whether the current step is the first step
 * @param options.isLast - Whether the current step is the last step
 * @param options.onNext - Callback function to move to the next step
 * @param options.onPrevious - Callback function to move to the previous step
 * @param options.onRetry - Callback function to retry the current step
 * @param options.jumpTo - Function to jump to a specific step number
 * @param options.total - The total number of steps
 * @returns A StepEnvironment object with the specified configuration
 */
export function createStepEnvironment(options: {
  /**
   * The current step number (1-indexed)
   */
  current: number;
  
  /**
   * Whether the current step is the first step
   */
  isFirst: boolean;
  
  /**
   * Whether the current step is the last step
   */
  isLast: boolean;
  
  /**
   * Callback function to move to the next step
   * @returns Promise that resolves when the next step operation is complete
   */
  onNext?: () => Promise<void>;
  
  /**
   * Callback function to move to the previous step
   * @returns Promise that resolves when the previous step operation is complete
   */
  onPrevious?: () => Promise<void>;
  
  /**
   * Callback function to retry the current step
   * @returns Promise that resolves when the retry operation is complete
   */
  onRetry?: () => Promise<void>;
  
  /**
   * Jump to a specific step by step number
   * @param step - The step number to jump to (1-indexed)
   */
  jumpTo?: (step: number) => void;
  
  /**
   * The total number of steps
   */
  total: number;
  
  /**
   * Number of times the current step has been retried
   */
  retryCount: number;
}): StepEnvironment {
  return {
    current: options.current,
    isFirst: options.isFirst,
    isLast: options.isLast,
    onNext: options.onNext,
    onPrevious: options.onPrevious,
    onRetry: options.onRetry,
    jumpTo: options.jumpTo,
    total: options.total,
    retryCount: options.retryCount,
  };
}
