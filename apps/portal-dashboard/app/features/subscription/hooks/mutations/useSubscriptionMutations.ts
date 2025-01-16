import { useState, useCallback } from 'react';
import { SubscriptionPlan, SubscriptionError } from '../../types/subscription.types';
import { useCreateSubscriptionMutation } from './useCreateSubscriptionMutation';
import { useUpdateSubscriptionMutation } from './useUpdateSubscriptionMutation';
import { useCancelSubscriptionMutation } from './useCancelSubscriptionMutation';

export interface UseSubscriptionMutationsResult {
  createSubscription: (plan: SubscriptionPlan) => Promise<{ subscription: Subscription }>;
  updateSubscription: (plan: SubscriptionPlan) => Promise<{ subscription: Subscription }>;
  cancelSubscription: () => Promise<void>;
  isLoading: boolean;
  error: SubscriptionError | null;
}

export function useSubscriptionMutations(): UseSubscriptionMutationsResult {
  const [error, setError] = useState<SubscriptionError | null>(null);
  
  const createMutation = useCreateSubscriptionMutation();
  const updateMutation = useUpdateSubscriptionMutation();
  const cancelMutation = useCancelSubscriptionMutation();

  const createSubscription = useCallback(
    async (plan: SubscriptionPlan) => {
      setError(null);
      try {
        return await createMutation.mutateAsync(plan);
      } catch (err) {
        const error = err as SubscriptionError;
        setError(error);
        throw error;
      }
    },
    [createMutation]
  );

  const updateSubscription = useCallback(
    async (plan: SubscriptionPlan) => {
      setError(null);
      try {
        return await updateMutation.mutateAsync(plan);
      } catch (err) {
        const error = err as SubscriptionError;
        setError(error);
        throw error;
      }
    },
    [updateMutation]
  );

  const cancelSubscription = useCallback(
    async () => {
      setError(null);
      try {
        await cancelMutation.mutateAsync();
      } catch (err) {
        const error = err as SubscriptionError;
        setError(error);
        throw error;
      }
    },
    [cancelMutation]
  );

  return {
    createSubscription,
    updateSubscription,
    cancelSubscription,
    isLoading: createMutation.isLoading || updateMutation.isLoading || cancelMutation.isLoading,
    error
  };
}
