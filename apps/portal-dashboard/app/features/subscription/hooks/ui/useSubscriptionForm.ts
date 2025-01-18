import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BillingInfo, billingInfoSchema, EntityCode } from "../../types/billing.types";
import { useBillingMutations } from "../mutations/useBillingMutations";
import { useSubscriptionContext } from "../../contexts/SubscriptionContext";
import { validateBillingInfo } from "../../services/billing";

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

  const { state, send } = useSubscriptionContext();
  
  const handleSubmit = useCallback(
    (options: { onSuccess?: () => void; onError?: (error: Error) => void }) =>
      async (data: BillingInfo) => {
        try {
          setFormError(null);
          
          // Validate first
          const errors = await validateBillingInfo(data);
          if (errors) {
            send({ type: "INVALID", errors });
            const error = new Error("Validation failed");
            setFormError(error);
            options.onError?.(error);
            return;
          }

          send({ type: "VALIDATED" });
          send({ type: "SAVE" });
          
          await updateBillingInfo(data);
          send({ type: "SAVED" });
          options.onSuccess?.();
        } catch (err) {
          const error = err instanceof Error ? err : new Error("Submission failed");
          send({ type: "FAILED", error });
          setFormError(error);
          options.onError?.(error);
        }
      },
    [updateBillingInfo, send]
  );

  const resetForm = useCallback(() => {
    form.reset();
    setFormError(null);
  }, [form]);

  const updateFormSchema = useCallback((entities: EntityCode[], requiredFields: string[]) => {
    // Reset validation state for optional fields
    const optionalFields = ['organization', 'address.line2', 'address.dependent_locality', 'address.sorting_code'];
    optionalFields.forEach(field => {
      form.unregister(field);
    });

    // Apply required field validations
    requiredFields.forEach(field => {
      const fieldPath = `address.${field.toLowerCase()}`;
      form.register(fieldPath, {
        required: `${field} is required for this country`
      });
    });

    // Update supported entities validation
    entities.forEach(entity => {
      const fieldPath = `address.${entity.toLowerCase()}`;
      if (!form.getValues(fieldPath)) {
        form.setValue(fieldPath, '', { shouldValidate: true });
      }
    });

    form.clearErrors();
  }, [form]);

  return {
    form,
    isSubmitting,
    formError,
    handleSubmit,
    resetForm,
    supportedEntities,
    setSupportedEntities,
    updateFormSchema,
  };
}
