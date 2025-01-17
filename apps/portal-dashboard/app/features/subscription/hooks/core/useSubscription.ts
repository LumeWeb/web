import { useCallback, useState } from 'react';
import { SubscriptionService } from '../../services/SubscriptionService';
import { SubscriptionState, Subscription, SubscriptionPlan } from '../../types/subscription.types';
import useSubscriptionState from '../useSubscriptionState';

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

export function useSubscription(): UseSubscriptionResult {
  const subscriptionService = new SubscriptionService();
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    state,
    loadSubscription: loadSubscriptionState,
    createSubscription: createSubscriptionState,
    cancelSubscription: cancelSubscriptionState,
    handleError: handleErrorState,
    isTransitioning
  } = useSubscriptionState();

  const loadSubscription = useCallback(async (subscription: Subscription | null) => {
    setIsLoading(true);
    setError(null);
    try {
      await loadSubscriptionState(subscription);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load subscription');
      setError(error);
      handleErrorState(error);
    } finally {
      setIsLoading(false);
    }
  }, [loadSubscriptionState, handleErrorState]);

  const createSubscription = useCallback(async (plan: SubscriptionPlan) => {
    setError(null);
    try {
      await createSubscriptionState(plan);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to create subscription');
      setError(error);
      handleErrorState(error);
      throw error;
    }
  }, [createSubscriptionState, handleErrorState]);

  const cancelSubscription = useCallback(async () => {
    setError(null);
    try {
      await cancelSubscriptionState();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to cancel subscription');
      setError(error);
      handleErrorState(error);
      throw error;
    }
  }, [cancelSubscriptionState, handleErrorState]);

  const validatePlanChange = useCallback(
    async (currentPlan: SubscriptionPlan, newPlan: SubscriptionPlan) => {
      try {
        return await subscriptionService.validatePlanChange(currentPlan, newPlan);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to validate plan change');
        setError(error);
        handleErrorState(error);
        return false;
      }
    },
    [subscriptionService, handleErrorState]
  );


  const getSubscriptionPeriod = useCallback(
    (plan: SubscriptionPlan, startDate?: Date) => {
      return subscriptionService.getSubscriptionPeriodDates(plan, startDate);
    },
    [subscriptionService]
  );

  return {
    state,
    error,
    isLoading,
    isTransitioning,
    loadSubscription,
    createSubscription,
    cancelSubscription,
    validatePlanChange,
    getSubscriptionPeriod,
    handleError: handleErrorState
  };
}
