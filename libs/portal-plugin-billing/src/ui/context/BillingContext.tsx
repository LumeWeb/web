import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { usePricingPlans } from "@/hooks/usePricingPlans";
import { useCheckout } from "@/hooks/useCheckout";
import { useCheckoutSessionStatus } from "@/hooks/useCheckoutSessionStatus";
import { useSubscriptionEventFeed } from "@/hooks/useSubscriptionEventFeed";
import type { SubscriptionEventEmitter } from "@/hooks/useSubscriptionEventFeed";
import { BillingSSEEventType } from "@/types/subscription";
import type { CheckoutUIResponse, PublicPricingPlanPeriodDTO, PublicPricingPlanResponse, SubscriptionStatusResponse, PublicPricingPlansListResponse, GatewayPublicInfo, PlanChangeCheckoutData } from "@/types/subscription";
import { SessionStatus } from "@/types/subscription";
import type { HttpError } from "@refinedev/core";

import { createContext, useContext, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router";

export enum CheckoutPhase {
  Idle = "idle",
  GatewaySelection = "gateway_selection",
  Checkout = "checkout",
  Polling = "polling",
  Complete = "complete",
  Error = "error",
}

export interface BillingContextValue {
  subscription: {
    data: SubscriptionStatusResponse | undefined;
    isReady: boolean;
    isBusy: boolean;
    hasError: boolean;
    error: Error | HttpError | null;
    refetch: () => void;
    silentRefetch: () => void;
  };
  plans: {
    data: PublicPricingPlansListResponse | undefined;
    isReady: boolean;
    isBusy: boolean;
    hasError: boolean;
    error: Error | HttpError | null;
    all: PublicPricingPlanResponse[];
  };
  checkout: {
    phase: CheckoutPhase;
    data: CheckoutUIResponse | undefined;
    isReady: boolean;
    isBusy: boolean;
    hasError: boolean;
    error: Error | HttpError | null;
    /** Session ID from the checkout API response (while in Checkout phase) */
    checkoutSessionId: string | null;
    /** Session ID being polled (set after completeCheckout is called) */
    sessionId: string | null;
    sessionStatus: string | null;
    selectedGatewayId: string | null;
  };
  payment: {
    selectedGateway: GatewayPublicInfo | null;
  };
  selection: {
    plan: PublicPricingPlanResponse | null;
    period: PublicPricingPlanPeriodDTO | null;
  };
  cadence: string;
  setCadence: (cadence: string) => void;
  selectPlan: (plan: PublicPricingPlanResponse, period: PublicPricingPlanPeriodDTO) => void;
  selectGateway: (gateway: GatewayPublicInfo) => void;
  completeCheckout: (sessionId: string) => void;
  resetCheckout: () => void;
  eventFeed: SubscriptionEventEmitter;
  isCurrentPlan: (periodId: number | undefined) => boolean;
  findCurrentPlan: () => { plan: PublicPricingPlanResponse; period: PublicPricingPlanPeriodDTO } | null;
  // For plan change checkout flow
  startPlanChangeCheckout: (data: PlanChangeCheckoutData) => void;
  planChangeCheckout: {
    fragments: CheckoutUIResponse["fragments"];
    sessionId: string;
  } | null;
}

const BillingContext = createContext<BillingContextValue | null>(null);

export interface BillingProviderProps {
  children: ReactNode;
  initialCadence?: string;
}

export function BillingProvider({ children, initialCadence = "monthly" }: BillingProviderProps) {
  const [searchParams] = useSearchParams();
  const [cadence, setCadence] = useState<string>(initialCadence);
  const [selectedPlan, setSelectedPlan] = useState<PublicPricingPlanResponse | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PublicPricingPlanPeriodDTO | null>(null);
  const [checkoutPhase, setCheckoutPhase] = useState<CheckoutPhase>(CheckoutPhase.Idle);
  const [completedSessionId, setCompletedSessionId] = useState<string | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<GatewayPublicInfo | null>(null);
  // Plan change checkout data (when checkout_required is returned from change-plan API)
  const [planChangeCheckout, setPlanChangeCheckout] = useState<{
    fragments: CheckoutUIResponse["fragments"];
    sessionId: string;
  } | null>(null);

  // Detect checkout return from 3DS/fallback redirects (e.g., from/billing/subscription?checkout_return=1&session_id=xxx)
  useEffect(() => {
    const isCheckoutReturn = searchParams.get("checkout_return") === "1";
    const sessionId = searchParams.get("session_id");
    if (isCheckoutReturn && sessionId && checkoutPhase === CheckoutPhase.Idle) {
      // User returned from external redirect (3DS, etc.) — SSE event may have already fired
      skipInitialPollDelayRef.current = true;
      setCompletedSessionId(sessionId);
      setCheckoutPhase(CheckoutPhase.Polling);
    }
  }, [searchParams, checkoutPhase]);

  const subscriptionHook = useSubscriptionStatus();
  const plansHook = usePricingPlans();
  const eventFeed = useSubscriptionEventFeed();

  const planId = selectedPlan ? String(selectedPlan.id) : "";
  const periodId = selectedPeriod?.id;
  const checkoutQueryOptions = { enabled: !!selectedPlan && checkoutPhase === CheckoutPhase.Checkout };
  const sessionQueryOptions = { enabled: !!completedSessionId };

  const checkoutHook = useCheckout({
    planId,
    periodId,
    gateway: selectedGateway?.id,
    queryOptions: checkoutQueryOptions,
  });

  const gatewaySupportsSessionStatus = selectedGateway?.abilities?.session_status ?? false;

  const sessionStatusHook = useCheckoutSessionStatus({
    sessionId: completedSessionId ?? "",
    gateway: selectedGateway?.id,
    queryOptions: {
      ...sessionQueryOptions,
      enabled: !!completedSessionId && gatewaySupportsSessionStatus,
    },
  });

  // Progressive polling fallback: give SSE 10s head start, then refetch every 5s, hard timeout at 30s
  // When entering Polling from a checkout return (SSE event may have already fired),
  // skip the initial delay and start polling immediately.
  const skipInitialPollDelayRef = useRef(false);

  const fallbackRef = useRef<{
    interval: ReturnType<typeof setInterval> | null;
    timeout: ReturnType<typeof setTimeout> | null;
  }>({ interval: null, timeout: null });

  useEffect(() => {
    if (checkoutPhase !== CheckoutPhase.Polling) {
      if (fallbackRef.current.interval) {
        clearInterval(fallbackRef.current.interval);
        fallbackRef.current.interval = null;
      }
      if (fallbackRef.current.timeout) {
        clearTimeout(fallbackRef.current.timeout);
        fallbackRef.current.timeout = null;
      }
      return;
    }

    const startPolling = () => {
      if (checkoutPhase === CheckoutPhase.Polling) {
        subscriptionHook.silentRefetch();
      }

      const poll = setInterval(() => {
        if (checkoutPhase === CheckoutPhase.Polling) {
          subscriptionHook.silentRefetch();
        }
      }, 5_000);

      fallbackRef.current.interval = poll;
    };

    if (skipInitialPollDelayRef.current) {
      // SSE event may have already started — poll immediately
      skipInitialPollDelayRef.current = false;
      startPolling();
    } else {
      const initialDelay = setTimeout(startPolling, 10_000);
      fallbackRef.current.timeout = initialDelay;
    }

    const hardTimeout = setTimeout(() => {
      if (checkoutPhase === CheckoutPhase.Polling) {
        setCheckoutPhase(CheckoutPhase.Error);
      }
    }, 30_000);

    return () => {
      if (fallbackRef.current.interval) {
        clearInterval(fallbackRef.current.interval);
        fallbackRef.current.interval = null;
      }
      if (fallbackRef.current.timeout) {
        clearTimeout(fallbackRef.current.timeout);
        fallbackRef.current.timeout = null;
      }
      clearTimeout(hardTimeout);
    };
  }, [checkoutPhase]);

  function selectPlan(plan: PublicPricingPlanResponse, period: PublicPricingPlanPeriodDTO) {
    setSelectedPlan(plan);
    setSelectedPeriod(period);
    setCheckoutPhase(CheckoutPhase.GatewaySelection);
  }

  function selectGateway(gateway: GatewayPublicInfo) {
    setSelectedGateway(gateway);
    setCheckoutPhase(CheckoutPhase.Checkout);
  }

  function completeCheckout(sessionId: string) {
    setCompletedSessionId(sessionId);
    // Don't downgrade if SSE already transitioned us to Complete
    if (checkoutPhase !== CheckoutPhase.Complete) {
      // SSE event may have already fired — skip the 10s delay and poll immediately
      skipInitialPollDelayRef.current = true;
      setCheckoutPhase(CheckoutPhase.Polling);
    }
  }

  function resetCheckout() {
    setSelectedPlan(null);
    setSelectedPeriod(null);
    setSelectedGateway(null);
    setCompletedSessionId(null);
    setPlanChangeCheckout(null);
    setCheckoutPhase(CheckoutPhase.Idle);
  }

  function isCurrentPlan(periodId: number | undefined): boolean {
    return subscriptionHook.data?.pricing_plan_period_id === periodId;
  }

  function findCurrentPlan(): {
    plan: PublicPricingPlanResponse;
    period: PublicPricingPlanPeriodDTO;
  } | null {
    const periodId = subscriptionHook.data?.pricing_plan_period_id;
    if (!periodId) return null;

    const plans = plansHook.data?.data ?? [];
    for (const plan of plans) {
      const period = plan.pricing_periods?.find((p) => p.id === periodId);
      if (period) return { plan, period };
    }
    return null;
  }

  // Start plan change checkout directly with pre-fetched fragments (checkout_required flow)
  function startPlanChangeCheckout(data: {
    fragments: CheckoutUIResponse["fragments"];
    sessionId: string;
    gateway: GatewayPublicInfo;
  }) {
    setPlanChangeCheckout({
      fragments: data.fragments,
      sessionId: data.sessionId,
    });
    setSelectedGateway(data.gateway);
    setCheckoutPhase(CheckoutPhase.Checkout);
  }

  // SSE-driven checkout phase transitions
  useEffect(() => {
    const unbinds = [
      eventFeed.on(BillingSSEEventType.PaymentCompleted, () => {
        if (checkoutPhase === CheckoutPhase.Polling) {
          setCheckoutPhase(CheckoutPhase.Complete);
        }
      }),
      eventFeed.on(BillingSSEEventType.SubscriptionActive, () => {
        if (checkoutPhase === CheckoutPhase.Polling || checkoutPhase === CheckoutPhase.Checkout) {
          setCheckoutPhase(CheckoutPhase.Complete);
        }
      }),
      eventFeed.on(BillingSSEEventType.SubscriptionCancelled, () => {
        if (checkoutPhase === CheckoutPhase.Polling || checkoutPhase === CheckoutPhase.Checkout) {
          setCheckoutPhase(CheckoutPhase.Error);
        }
      }),
    ];
    return () => unbinds.forEach((unbind) => unbind());
  }, [eventFeed, checkoutPhase]);

  let derivedPhase: CheckoutPhase = checkoutPhase;
  if (checkoutPhase === CheckoutPhase.Polling) {
    // Subscription status confirms backend activation (is_subscribed = isActive on subscriber)
    if (subscriptionHook.data?.is_subscribed) {
      derivedPhase = CheckoutPhase.Complete;
    }
    // Session status used only for expired detection (3DS redirect / abandoned payment)
    // Only check when the gateway supports session_status — otherwise rely on SSE + subscription polling
    else if (gatewaySupportsSessionStatus && sessionStatusHook.isReady) {
      const status = sessionStatusHook.data?.status;
      if (status === SessionStatus.Expired || status === "expired") derivedPhase = CheckoutPhase.Error;
    }
  } else if (checkoutPhase === CheckoutPhase.Checkout && checkoutHook.hasError) {
    // Checkout API failed
    derivedPhase = CheckoutPhase.Error;
  }

  const value: BillingContextValue = {
    subscription: {
      data: subscriptionHook.data,
      isReady: subscriptionHook.isReady,
      isBusy: subscriptionHook.isBusy,
      hasError: subscriptionHook.hasError,
      error: subscriptionHook.error ?? null,
      refetch: subscriptionHook.refetch,
      silentRefetch: subscriptionHook.silentRefetch,
    },
    plans: {
      data: plansHook.data,
      isReady: plansHook.isReady,
      isBusy: plansHook.isBusy,
      hasError: plansHook.hasError,
      error: plansHook.error ?? null,
      all: plansHook.data?.data ?? [],
    },
    checkout: {
      phase: derivedPhase,
      data: checkoutHook.data,
      isReady: checkoutHook.isReady,
      isBusy: checkoutHook.isBusy,
      hasError: checkoutHook.hasError,
      error: checkoutHook.error ?? null,
      checkoutSessionId: checkoutHook.data?.session_id ?? null,
      sessionId: completedSessionId,
      sessionStatus: sessionStatusHook.data?.status ?? null,
      selectedGatewayId: selectedGateway?.id ?? null,
    },
    payment: {
      selectedGateway,
    },
    selection: {
      plan: selectedPlan,
      period: selectedPeriod,
    },
    cadence,
    setCadence,
    selectPlan,
    selectGateway,
    completeCheckout,
    resetCheckout,
    isCurrentPlan,
    findCurrentPlan,
    eventFeed,
    startPlanChangeCheckout,
    planChangeCheckout,
  };

  return <BillingContext.Provider value={value}>{children}</BillingContext.Provider>;
}

export function useBillingContext(): BillingContextValue {
  const ctx = useContext(BillingContext);
  if (!ctx) {
    throw new Error("useBillingContext must be used within a BillingProvider");
  }
  return ctx;
}
