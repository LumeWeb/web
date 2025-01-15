import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createBillingInfoSchema, BillingInfoFields } from "../components/BillingInformation.schema";
import { useState, useEffect, useCallback } from "react";
import type { Billing } from "portal-shared/dataProviders/accountProvider";
import type { EntityCode } from "../components/BillingInformation.schema";

const defaultBillingInfo: BillingInfoFields = {
  name: "",
  organization: undefined,
  country: "",
  address_line1: "",
  address_line2: undefined,
  city: "",
  state: "",
  postal_code: "",
  dependent_locality: undefined,
  sorting_code: undefined,
};

export function useBillingForm() {
  const [supportedEntities, setSupportedEntities] = useState<EntityCode[]>(["C", "S"]);
  const [initialValues, setInitialValues] = useState<BillingInfoFields | null>(null);

  const form = useForm<BillingInfoFields>({
    resolver: zodResolver(createBillingInfoSchema(["C", "S"], [])),
    defaultValues: defaultBillingInfo,
    mode: "onBlur",
  });

  const hasFormChanges = () => {
    if (!initialValues) return false;
    const currentValues = form.getValues();
    return Object.keys(currentValues).some(key => {
      const k = key as keyof BillingInfoFields;
      return currentValues[k] !== initialValues[k];
    });
  };

  const updateFormSchema = useCallback((entities: EntityCode[], requiredFields: EntityCode[] = []) => {
    const currentValues = form.getValues();
    form.clearErrors();
    
    form.reset(currentValues, {
      resolver: zodResolver(createBillingInfoSchema(entities, requiredFields))
    });
  }, [form]);

  const initializeForm = useCallback((billingInfo: Billing | undefined) => {
    if (!billingInfo) return;

    const values: BillingInfoFields = {
      name: billingInfo.name,
      organization: billingInfo.organization,
      country: billingInfo.address.country,
      address_line1: billingInfo.address.line1,
      address_line2: billingInfo.address.line2,
      city: billingInfo.address.city,
      state: billingInfo.address.state,
      postal_code: billingInfo.address.postal_code,
      dependent_locality: undefined,
      sorting_code: undefined,
    };

    setInitialValues(values);
    form.reset(values);
  }, [form]);

  return {
    form,
    supportedEntities,
    setSupportedEntities,
    initialValues,
    setInitialValues,
    hasFormChanges,
    updateFormSchema,
    initializeForm
  };
}
