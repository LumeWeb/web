import { useCallback } from 'react';
import { useCustomMutation } from '@refinedev/core';
import { SubscriptionPlan } from '../../types/subscription.types';
import useApiUrl from 'portal-shared/hooks/useApiUrl';

export function useSubscriptionMutations() {
  const apiUrl = useApiUrl();
  const { mutate: createMutation } = useCustomMutation();
  const { mutate: updateMutation } = useCustomMutation();
  const { mutate: cancelMutation } = useCustomMutation();

  const createSubscription = useCallback(
    async (plan: SubscriptionPlan) => {
      return createMutation({
        url: `${apiUrl}/api/account/subscription`,
        method: 'post',
        values: { plan_id: plan.id }
      });
    },
    [createMutation, apiUrl]
  );

  const updateSubscription = useCallback(
    async (planId: string) => {
      return updateMutation({
        url: `${apiUrl}/api/account/subscription/plan`,
        method: 'put',
        values: { plan_id: planId }
      });
    },
    [updateMutation, apiUrl]
  );

  const cancelSubscription = useCallback(
    async () => {
      return cancelMutation({
        url: `${apiUrl}/api/account/subscription/cancel`,
        method: 'post'
      });
    },
    [cancelMutation, apiUrl]
  );

  return {
    createSubscription,
    updateSubscription,
    cancelSubscription
  };
}
