import { useState, useCallback } from "react";
import { BillingInfo, SubscriptionPlan } from "../../types/subscription.types";
import { useBilling } from "../core/useBilling";

export function useSubscriptionConfirmation() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [billingError, setBillingError] = useState<string | null>(null);
  const { validateBillingInfo } = useBilling();

  const validatePlanChange = useCallback(
    async (
      currentPlan: SubscriptionPlan | undefined,
      newPlan: SubscriptionPlan,
      billing: BillingInfo | null
    ): Promise<boolean> => {
      setValidationError(null);
      setBillingError(null);

      // Don't need validation for free plans
      if (newPlan.is_free) {
        return true;
      }

      // Validate billing info exists for paid plans
      if (!billing) {
        setBillingError("Billing information is required for paid plans");
        return false;
      }

      // Validate billing info is complete
      const billingErrors = await validateBillingInfo(billing);
      if (billingErrors) {
        setBillingError("Please complete all required billing information");
        return false;
      }

      return true;
    },
    []
  );

  return {
    showConfirmDialog,
    setShowConfirmDialog,
    validationError,
    setValidationError,
    billingError,
    setBillingError,
    validatePlanChange,
  };
}
