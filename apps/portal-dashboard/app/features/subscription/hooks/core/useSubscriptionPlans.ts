import { useCallback } from 'react';
import { useList } from '@refinedev/core';
import { SubscriptionPlan } from '../../types/subscription.types';

interface UseSubscriptionPlansResult {
  plansData: { data: { plans: SubscriptionPlan[] } } | undefined;
  plansAreLoading: boolean;
  refetchPlans: () => void;
}

export function useSubscriptionPlans(): UseSubscriptionPlansResult {
  const {
    data: plansData,
    isLoading: plansAreLoading,
    refetch: refetchPlans
  } = useList<SubscriptionPlan>({
    resource: 'account/subscription/plans'
  });

  return {
    plansData,
    plansAreLoading,
    refetchPlans
  };
}
