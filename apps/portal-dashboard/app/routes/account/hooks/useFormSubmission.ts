import { useCallback } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { BillingInfoFields } from "../components/BillingInformation.schema";
import type { Billing } from "portal-shared/dataProviders/accountProvider";

export function useFormSubmission(
  form: UseFormReturn<BillingInfoFields>,
  submitBillingInfo: (data: Billing) => Promise<void>
) {
  const handleError = useCallback((error: unknown) => {
    if (typeof error === "object" && error !== null) {
      Object.entries(error).forEach(([field, message]) => {
        form.setError(field as keyof BillingInfoFields, {
          type: "manual",
          message: message as string,
        });
      });
    } else {
      console.error("Error submitting billing info:", error);
    }
  }, [form]);

  const handleSubmit = useCallback(async (data: BillingInfoFields) => {
    try {
      const billingInfo: Billing = {
        name: data.name,
        organization: data.organization,
        address: {
          line1: data.address_line1,
          line2: data.address_line2,
          city: data.city,
          state: data.state,
          postal_code: data.postal_code,
          country: data.country,
        },
      };
      await submitBillingInfo(billingInfo);
    } catch (error) {
      handleError(error);
    }
  }, [form, submitBillingInfo, handleError]);

  return { handleSubmit };
}
