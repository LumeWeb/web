import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BillingInfo, billingInfoSchema, EntityCode } from "../../types/billing.types";
import { useBillingMutations } from "../mutations/useBillingMutations";

export function useSubscriptionForm() {
  const [formError, setFormError] = useState<Error | null>(null);
  const [supportedEntities, setSupportedEntities] = useState<EntityCode[]>(['S', 'C']);
  const { updateBillingInfo, isLoading: isSubmitting } = useBillingMutations();

  const form = useForm<BillingInfo>({
    resolver: zodResolver(billingInfoSchema),
    defaultValues: {
      name: "",
      organization: "",
      address: {
        line1: "",
        line2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "",
        dependent_locality: "",
        sorting_code: "",
      },
    },
  });

  const handleSubmit = useCallback(
    (options: { onSuccess?: () => void; onError?: (error: Error) => void }) =>
      async (data: BillingInfo) => {
        try {
          setFormError(null);
          await updateBillingInfo(data);
          options.onSuccess?.();
        } catch (err) {
          const error = err instanceof Error ? err : new Error("Submission failed");
          setFormError(error);
          options.onError?.(error);
        }
      },
    [updateBillingInfo]
  );

  const resetForm = useCallback(() => {
    form.reset();
    setFormError(null);
  }, [form]);

  return {
    form,
    isSubmitting,
    formError,
    handleSubmit,
    resetForm,
    supportedEntities,
    setSupportedEntities,
  };
}
