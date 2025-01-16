import { useCallback } from 'react';
import { SubscriptionService } from '../../services/SubscriptionService';
import { SubscriptionState, Subscription, SubscriptionPlan } from '../../types/subscription.types';
import useSubscriptionState from '../useSubscriptionState';

export function useSubscription() {
  const subscriptionService = new SubscriptionService();
  const {
    state,
    loadSubscription,
    createSubscription,
    cancelSubscription,
    handleError,
    isTransitioning
  } = useSubscriptionState();

  const validatePlanChange = useCallback(
    async (currentPlan: SubscriptionPlan, newPlan: SubscriptionPlan) => {
      return subscriptionService.validatePlanChange(currentPlan, newPlan);
    },
    [subscriptionService]
  );

  const validateSubscriptionStatus = useCallback(
    async (subscription: Subscription) => {
      return subscriptionService.validateSubscriptionStatus(subscription);
    },
    [subscriptionService]
  );

  const getSubscriptionPeriod = useCallback(
    (plan: SubscriptionPlan, startDate?: Date) => {
      return subscriptionService.getSubscriptionPeriodDates(plan, startDate);
    },
    [subscriptionService]
  );

  return {
    state,
    loadSubscription,
    createSubscription,
    cancelSubscription,
    validatePlanChange,
    validateSubscriptionStatus,
    getSubscriptionPeriod,
    handleError,
    isTransitioning
  };
}
