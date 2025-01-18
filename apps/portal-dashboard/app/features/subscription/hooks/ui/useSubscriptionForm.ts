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
