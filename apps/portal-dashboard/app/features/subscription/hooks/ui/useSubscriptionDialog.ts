import { useState, useCallback } from "react";
import { SubscriptionPlan } from "../../types/subscription.types";

interface DialogState {
  type: "plan-change" | "cancel" | "payment" | null;
  plan?: SubscriptionPlan;
}

export function useSubscriptionDialog() {
  const [dialog, setDialog] = useState<DialogState>({ type: null });

  const openPlanChangeDialog = useCallback((plan: SubscriptionPlan) => {
    setDialog({ type: "plan-change", plan });
  }, []);

  const openCancelDialog = useCallback(() => {
    setDialog({ type: "cancel" });
  }, []);

  const openPaymentDialog = useCallback(() => {
    setDialog({ type: "payment" });
  }, []);

  const closeDialog = useCallback(() => {
    setDialog({ type: null });
  }, []);

  return {
    dialog,
    openPlanChangeDialog,
    openCancelDialog,
    openPaymentDialog,
    closeDialog,
  };
}
