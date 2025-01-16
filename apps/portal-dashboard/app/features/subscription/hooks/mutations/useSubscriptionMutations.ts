import { useCallback } from 'react';
import { useCustomMutation, HttpError } from '@refinedev/core';
import { SubscriptionPlan, Subscription } from '../../types/subscription.types';
import useApiUrl from 'portal-shared/hooks/useApiUrl';

interface SubscriptionResponse {
  data: {
    subscription: Subscription;
  };
}

interface SubscriptionError extends HttpError {
  errors?: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}

export interface UseSubscriptionMutationsResult {
  createSubscription: (plan: SubscriptionPlan) => Promise<SubscriptionResponse>;
  updateSubscription: (planId: string) => Promise<SubscriptionResponse>;
  cancelSubscription: () => Promise<void>;
  isLoading: boolean;
  error: SubscriptionError | null;
}

export function useSubscriptionMutations(): UseSubscriptionMutationsResult {
  const apiUrl = useApiUrl();
  const { mutate: createMutation, isLoading: isCreateLoading } = useCustomMutation<SubscriptionResponse>();
  const { mutate: updateMutation, isLoading: isUpdateLoading } = useCustomMutation<SubscriptionResponse>();
  const { mutate: cancelMutation, isLoading: isCancelLoading } = useCustomMutation();
  const [error, setError] = useState<SubscriptionError | null>(null);

  const createSubscription = useCallback(
    async (plan: SubscriptionPlan) => {
      setError(null);
      try {
        return await createMutation({
          url: `${apiUrl}/api/account/subscription`,
          method: 'post',
          values: { plan_id: plan.id }
        });
      } catch (err) {
        const error = err as SubscriptionError;
        setError(error);
        throw error;
      }
    },
    [createMutation, apiUrl]
  );

  const updateSubscription = useCallback(
    async (planId: string) => {
      setError(null);
      try {
        return await updateMutation({
          url: `${apiUrl}/api/account/subscription/plan`,
          method: 'put',
          values: { plan_id: planId }
        });
      } catch (err) {
        const error = err as SubscriptionError;
        setError(error);
        throw error;
      }
    },
    [updateMutation, apiUrl]
  );

  const cancelSubscription = useCallback(
    async () => {
      setError(null);
      try {
        await cancelMutation({
          url: `${apiUrl}/api/account/subscription/cancel`,
          method: 'post'
        });
      } catch (err) {
        const error = err as SubscriptionError;
        setError(error);
        throw error;
      }
    },
    [cancelMutation, apiUrl]
  );

  return {
    createSubscription,
    updateSubscription,
    cancelSubscription,
    isLoading: isCreateLoading || isUpdateLoading || isCancelLoading,
    error
  };
}
