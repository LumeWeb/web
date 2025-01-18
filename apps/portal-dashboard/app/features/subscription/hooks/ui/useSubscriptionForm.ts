import { useCallback } from "react";
import { useSubscriptionContext } from "../../contexts/SubscriptionContext";
import { SubscriptionPlan } from "../../types/subscription.types";

export function useSubscriptionForm() {
  const { state, send } = useSubscriptionContext();

  const handlePlanSelect = useCallback((plan: SubscriptionPlan) => {
    send({ type: "SELECT_PLAN", plan });
  }, [send]);

  const handleCancel = useCallback(() => {
    send({ type: "CANCEL" });
  }, [send]);

  const handleRetry = useCallback(() => {
    send({ type: "RETRY" });
  }, [send]);

  return {
    state,
    handlePlanSelect,
    handleCancel,
    handleRetry,
  };
}
