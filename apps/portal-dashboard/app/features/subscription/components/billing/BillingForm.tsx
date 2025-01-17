import React, { useEffect } from "react";
import { useNotification } from "@refinedev/core";
import { useBilling } from "../../hooks/core/useBilling";
import { useSubscriptionForm } from "../../hooks/ui/useSubscriptionForm";
import { useBillingMutations } from "../../hooks/mutations/useBillingMutations";
import { BillingInfo, EntityCode } from "../../types/billing.types";
import { useBillingForm } from "../../hooks/core/useBillingForm";
import { useCountryData } from "../../hooks/core/useCountryData";
import { useLocationLists } from "../../hooks/core/useLocationLists";
import { BillingValidator } from "./BillingValidator";
import { BillingFormField } from "./BillingFormField";
import { BillingFormInput } from "./BillingFormInput";
import { BillingAddressComboBox } from "./BillingAddressComboBox";
import { Button } from "portal-shared/components/ui/button";
import { Form } from "portal-shared/components/ui/form";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "portal-shared/components/ui/card";

export function BillingForm() {
  const { validateBillingInfo, formatBillingInfo } = useBilling();
  const { updateBillingInfo, isLoading, error } = useBillingMutations();
  const { open } = useNotification();
  const {
    form,
    isSubmitting,
    setIsSubmitting,
    formError,
    setFormError,
    resetForm,
    setFormData
  } = useSubscriptionForm();

  const {
    countryData,
    selectedCountry,
    selectedCountryData,
    handleCountryChange,
    useCountryList,
  } = useCountryData(form);

  const { useStateList, useCityList } = useLocationLists(form);

  const handleStateChange = () => {
    form.setValue("address.city", "", { shouldDirty: true });
  };

  const onSubmit = async (data: BillingInfo) => {
    try {
      // Validate billing info
      const errors = await validateBillingInfo(data);
      if (errors) {
        errors.forEach((error) => {
          form.setError(error.field as any, {
            type: "manual",
            message: error.message,
          });
        });
        return;
      }

      // Format billing info before submission
      const formattedData = formatBillingInfo(data);

      // Update billing info
      await updateBillingInfo(formattedData);
      form.reset(formattedData);

      open?.({
        type: "success",
        message: "Billing information updated successfully",
      });
    } catch (err) {
      console.error("Failed to update billing info:", err);
      open?.({
        type: "error",
        message:
          err instanceof Error
            ? err.message
            : "Failed to update billing information",
      });

      // Handle validation errors from API
      if (err && typeof err === 'object' && 'data' in err) {
        const errorData = err.data?.errors;
        if (errorData && typeof errorData === 'object') {
          Object.entries(errorData).forEach(([field, message]) => {
            if (typeof message === 'string') {
              form.setError(field as any, {
                type: 'manual',
                message
              });
            }
          });
        }
      }
    }
  };

  useEffect(() => {
    if (!countryData || !selectedCountry || !selectedCountryData) return;

    const entities = (selectedCountryData.supported_entities || ["C", "S"]) as EntityCode[];
    const requiredFields = selectedCountryData.required_fields || [];

    setSupportedEntities(entities);
    updateFormSchema(entities, requiredFields);
  }, [
    selectedCountry,
    selectedCountryData,
    countryData,
    updateFormSchema,
    setSupportedEntities,
  ]);

  return (
    <Card className="bg-secondary/20">
      <CardHeader>
        <CardTitle>Billing Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <BillingValidator
              billingInfo={form.getValues()}
              errors={error?.errors}
            />

            <BillingFormInput name="name" label="Name" form={form} />

            <BillingFormInput
              name="organization"
              label="Organization"
              form={form}
              optional
            />

            <BillingAddressComboBox
              name="country"
              control={form.control}
              label="Country"
              placeholder="Select Country"
              useList={useCountryList}
              onSelectionChange={handleCountryChange}
            />

            <BillingFormInput
              name="address_line1"
              label="Address Line 1"
              form={form}
            />

            <BillingFormInput
              name="address_line2"
              label="Address Line 2"
              form={form}
              optional
            />

            {Object.entries({
              S: "state",
              C: "city",
              D: "dependent_locality",
              X: "sorting_code",
            }).map(([key, fieldName]) => (
              <BillingFormField
                key={key}
                fieldName={fieldName}
                form={form}
                entityCode={key as EntityCode}
                supportedEntities={supportedEntities}
                useStateList={useStateList}
                useCityList={useCityList}
                handleStateChange={handleStateChange}
              />
            ))}

            <BillingFormInput
              name="postal_code"
              label="Postal Code"
              form={form}
            />

            <CardFooter className="px-0">
              <Button
                type="submit"
                className="ml-auto"
                disabled={isLoading || !hasFormChanges()}>
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
