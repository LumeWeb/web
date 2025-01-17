import { useCallback, useEffect, useState } from "react";
import { SubscriptionStateManager } from "../states/SubscriptionStateManager";
import {
  BillingInfo,
  DEFAULT_SUBSCRIPTION,
  Subscription,
  SubscriptionEvent,
  SubscriptionPlan,
  SubscriptionState,
} from "../types/subscription.types";

export function useSubscriptionState() {
  const stateManager = SubscriptionStateManager.getInstance();
  const [state, setState] = useState<SubscriptionState>(
    stateManager.getState(),
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const unsubscribe = stateManager.subscribe(setState);
    return () => unsubscribe();
  }, [stateManager]);

  const dispatch = useCallback(async (event: SubscriptionEvent) => {
    setIsTransitioning(true);
    try {
      return stateManager.transition(event);
    } catch (error) {
      if (error instanceof Error) {
        handleError(error);
      } else {
        handleError(
          new Error("Unknown error occurred during state transition"),
        );
      }
      throw error;
    } finally {
      setIsTransitioning(false);
    }
  }, []);

  const loadSubscription = useCallback(
    (subscription: Subscription | null) => {
      dispatch({
        type: "SUBSCRIPTION_LOADED",
        subscription: subscription || DEFAULT_SUBSCRIPTION,
      });
    },
    [dispatch],
  );

  const createSubscription = useCallback(
    async (plan: SubscriptionPlan) => {
      await dispatch({ type: "CREATE_SUBSCRIPTION", plan });
    },
    [dispatch],
  );

  const updateBilling = useCallback(
    async (billing: BillingInfo) => {
      await dispatch({ type: "UPDATE_BILLING", billing });
    },
    [dispatch],
  );

  const completePayment = useCallback(
    async (paymentMethodId: string) => {
      await dispatch({ type: "COMPLETE_PAYMENT", paymentMethodId });
    },
    [dispatch],
  );

  const cancelSubscription = useCallback(async () => {
    await dispatch({ type: "CANCEL_SUBSCRIPTION" });
  }, [dispatch]);

  const handleError = useCallback(
    (error: Error) => {
      dispatch({ type: "ERROR_OCCURRED", error });
    },
    [dispatch],
  );

  return {
    state,
    loadSubscription,
    createSubscription,
    updateBilling,
    completePayment,
    cancelSubscription,
    handleError,
    isTransitioning,
  };
}

export default useSubscriptionState;
