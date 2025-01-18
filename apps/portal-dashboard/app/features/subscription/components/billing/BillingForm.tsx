import React, { useEffect } from "react";
import { useNotification } from "@refinedev/core";
import { useBilling } from "../../hooks/core/useBilling";
import { useSubscriptionForm } from "@/features/subscription/hooks/ui/useSubscriptionForm";
import { useSubscriptionContext } from "../../contexts/SubscriptionContext";
import { useBillingMutations } from "../../hooks/mutations/useBillingMutations";
import { validateBillingInfo } from "../../services/billing";
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
import { useBillingMachine } from "@/features/subscription/hooks/domain/useBillingMachine";

export function BillingForm() {
  const { open } = useNotification();
  const { form, setSupportedEntities, supportedEntities, updateFormSchema } =
    useBillingForm();

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

  const { state, send, actions, context } = useBillingMachine();

  const onSubmit = async (data: BillingInfo) => {
    try {
      // First send validate event with the data
      send({ type: "VALIDATE", billing: data });

      // Then validate the data
      const errors = await validateBillingInfo(data);
      if (errors) {
        send({ type: "INVALID", errors });
        open?.({
          type: "error", 
          message: "Please correct the billing information errors"
        });
        return;
      }

      // If validation passes, proceed with saving
      send({ type: "VALIDATED" });
      send({ type: "SAVE" });

      // Call the billing mutation
      const { updateBillingInfo } = useBillingMutations();
      try {
        await updateBillingInfo(data);
        send({ type: "SAVED" });
        open?.({
          type: "success",
          message: "Billing information updated successfully"
        });
      } catch (saveError) {
        throw new Error("Failed to save billing information");
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to submit form");
      send({ type: "FAILED", error });
      console.error("Form submission error:", error);
      open?.({
        type: "error",
        message: error.message,
      });
    }
  };

  useEffect(() => {
    if (!countryData || !selectedCountry || !selectedCountryData) return;

    const entities = (selectedCountryData.supported_entities || [
      "C",
      "S",
    ]) as EntityCode[];
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
              errors={context.errors}
            />

            <BillingFormInput name="name" label="Full Name" form={form} />

            <BillingFormInput
              name="organization"
              label="Organization Name"
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
              name="address.line1"
              label="Address Line 1"
              form={form}
            />

            <BillingFormInput
              name="address.line2"
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
              name="address.postal_code"
              label="Postal Code"
              form={form}
            />

            <CardFooter className="px-0">
              <Button
                type="submit"
                className="ml-auto"
                disabled={state === "saving" || state === "validating"}>
                {state === "saving"
                  ? "Saving..."
                  : state === "validating"
                    ? "Validating..."
                    : "Save"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
