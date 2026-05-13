import { useSubscriptionStatus, SUBSCRIPTION_QUERY_KEY } from "./useSubscriptionStatus";
import { useSubscriptionEventFeed } from "./useSubscriptionEventFeed";
import type { SubscriptionEventEmitter } from "./useSubscriptionEventFeed";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";
import { useManagementCapabilities } from "./useManagementCapabilities";
import { usePricingPlans } from "./usePricingPlans";
import { useCredits } from "./useCredits";
import { BillingSSEEventType } from "@/types/subscription";
import { useBillingContext } from "@/ui/context/BillingContext";
import type { SubscriptionStatusResponse, PublicPricingPlansListResponse, BalanceResponse, UserCreditItem, ManagementCapabilitiesResponse } from "../types/subscription";

export interface BillingSubscriptionState {
  data: SubscriptionStatusResponse | undefined;
  isLoading: boolean;
  isError: boolean;
}

export interface BillingCapabilitiesState {
  data: ManagementCapabilitiesResponse | undefined;
  isLoading: boolean;
  isError: boolean;
  canCancel: boolean;
  canChangePlan: boolean;
  canPause: boolean;
  canResume: boolean;
}

export interface BillingPlansState {
  data: PublicPricingPlansListResponse | undefined;
  isLoading: boolean;
  isError: boolean;
}

export interface BillingCreditsBalanceState {
  data: BalanceResponse | undefined;
  isLoading: boolean;
  isError: boolean;
}

export interface BillingCreditsHistoryState {
  data: UserCreditItem[];
  total: number | undefined;
  isLoading: boolean;
  isError: boolean;
}

export interface BillingCreditsState {
  balance: BillingCreditsBalanceState;
  history: BillingCreditsHistoryState;
}

export interface UseBillingResult {
  subscription: BillingSubscriptionState;
  capabilities: BillingCapabilitiesState;
  plans: BillingPlansState;
  credits: BillingCreditsState;
  isLoading: boolean;
  isError: boolean;
}

export function useBilling(): UseBillingResult {
  const subscription = useSubscriptionStatus();
  const queryClient = useQueryClient();

  // Prefer the shared emitter from BillingContext to avoid duplicate SSE connections.
  // Fall back to creating our own when used outside the provider.
  let eventFeed: SubscriptionEventEmitter;
  try {
    eventFeed = useBillingContext().eventFeed;
  } catch {
    eventFeed = useSubscriptionEventFeed();
  }

  const invalidateOnEvent = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: SUBSCRIPTION_QUERY_KEY });
  }, [queryClient]);

  useEffect(() => {
    const unbinds = [
      eventFeed.on(BillingSSEEventType.PaymentCompleted, invalidateOnEvent),
      eventFeed.on(BillingSSEEventType.SubscriptionActive, invalidateOnEvent),
      eventFeed.on(BillingSSEEventType.SubscriptionCreated, invalidateOnEvent),
      eventFeed.on(BillingSSEEventType.SubscriptionUpdated, invalidateOnEvent),
      eventFeed.on(BillingSSEEventType.SubscriptionCancelled, invalidateOnEvent),
      eventFeed.on(BillingSSEEventType.PlanChanged, invalidateOnEvent),
      eventFeed.on(BillingSSEEventType.PlanChangedCreditOnly, invalidateOnEvent),
      eventFeed.on(BillingSSEEventType.PlanChangedZeroAmount, invalidateOnEvent),
    ];
    return () => unbinds.forEach((unbind) => unbind());
  }, [eventFeed, invalidateOnEvent]);
  const capabilities = useManagementCapabilities(
    {},
    { isSubscribed: subscription.data?.is_subscribed },
  );
  const plans = usePricingPlans();
  const credits = useCredits();

  const isLoading =
    subscription.isBusy ||
    capabilities.isLoading ||
    plans.isBusy ||
    credits.balance.isLoading ||
    credits.history.isLoading;

  const isError =
    subscription.hasError ||
    capabilities.isError ||
    plans.hasError ||
    credits.balance.isError ||
    credits.history.isError;

  return {
    subscription: {
      data: subscription.data,
      isLoading: subscription.isBusy,
      isError: subscription.hasError,
    },
    capabilities: {
      data: capabilities.data,
      isLoading: capabilities.isLoading,
      isError: capabilities.isError,
      canCancel: capabilities.canCancel,
      canChangePlan: capabilities.canChangePlan,
      canPause: capabilities.canPause,
      canResume: capabilities.canResume,
    },
    plans: {
      data: plans.data,
      isLoading: plans.isBusy,
      isError: plans.hasError,
    },
    credits: {
      balance: {
        data: credits.balance.data as unknown as BalanceResponse | undefined,
        isLoading: credits.balance.isLoading,
        isError: credits.balance.isError,
      },
      history: credits.history,
    },
    isLoading,
    isError,
  };
}
