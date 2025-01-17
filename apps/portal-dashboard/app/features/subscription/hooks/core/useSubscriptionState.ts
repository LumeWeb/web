import { useCallback, useState } from 'react';
import { SubscriptionStateManager } from '../../states/SubscriptionStateManager';
import { SubscriptionState, Subscription, SubscriptionPlan } from '../../types/subscription.types';

export interface UseSubscriptionResult {
  state: SubscriptionState;
  error: Error | null;
  isLoading: boolean;
  isTransitioning: boolean;
  loadSubscription: (subscription: Subscription | null) => Promise<void>;
  createSubscription: (plan: SubscriptionPlan) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  validatePlanChange: (currentPlan: SubscriptionPlan, newPlan: SubscriptionPlan) => Promise<boolean>;
  getSubscriptionPeriod: (plan: SubscriptionPlan, startDate?: Date) => { start: Date; end: Date };
  handleError: (error: Error) => void;
}

export function useSubscriptionState(): UseSubscriptionResult {
  const stateManager = SubscriptionStateManager.getInstance();
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const loadSubscription = useCallback(async (subscription: Subscription | null) => {
    setIsLoading(true);
    setError(null);
    try {
      await stateManager.transition({
        type: "SUBSCRIPTION_LOADED",
        subscription: subscription || DEFAULT_SUBSCRIPTION
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load subscription');
      setError(error);
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, [stateManager]);

  const createSubscription = useCallback(async (plan: SubscriptionPlan) => {
    setIsTransitioning(true);
    setError(null);
    try {
      await stateManager.transition({
        type: "CREATE_SUBSCRIPTION",
        plan
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create subscription');
      setError(error);
      handleError(error);
      throw error;
    } finally {
      setIsTransitioning(false);
    }
  }, [stateManager]);

  const cancelSubscription = useCallback(async () => {
    setIsTransitioning(true);
    setError(null);
    try {
      await stateManager.transition({
        type: "CANCEL_SUBSCRIPTION"
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to cancel subscription');
      setError(error);
      handleError(error);
      throw error;
    } finally {
      setIsTransitioning(false);
    }
  }, [stateManager]);

  const validatePlanChange = useCallback(
    async (currentPlan: SubscriptionPlan, newPlan: SubscriptionPlan) => {
      try {
        // Implement validation logic here
        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to validate plan change');
        setError(error);
        handleError(error);
        return false;
      }
    },
    []
  );

  const getSubscriptionPeriod = useCallback(
    (plan: SubscriptionPlan, startDate: Date = new Date()) => {
      const start = new Date(startDate);
      const end = new Date(startDate);

      if (plan.period === "MONTHLY") {
        end.setMonth(end.getMonth() + 1);
      } else if (plan.period === "YEARLY") {
        end.setFullYear(end.getFullYear() + 1);
      }

      return { start, end };
    },
    []
  );

  const handleError = useCallback((error: Error) => {
    stateManager.transition({
      type: "ERROR_OCCURRED",
      error
    });
  }, [stateManager]);

  return {
    state: stateManager.getState(),
    error,
    isLoading,
    isTransitioning,
    loadSubscription,
    createSubscription,
    cancelSubscription,
    validatePlanChange,
    getSubscriptionPeriod,
    handleError
  };
}
