import useBillingInfo from "@/routes/account/hooks/useBillingInfo";
import useSubmitBillingInfo from "@/routes/account/hooks/useSubmitBillingInfo";
import { useBillingForm } from "../hooks/useBillingForm";
import { useCountryData } from "../hooks/useCountryData";
import { useLocationLists } from "../hooks/useLocationLists";
import { useFormSubmission } from "../hooks/useFormSubmission";
import { BillingFormField } from "./BillingFormField";
import { BillingFormInput } from "./BillingFormInput";
import { Button } from "portal-shared/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "portal-shared/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "portal-shared/components/ui/form";
import { Input } from "portal-shared/components/ui/input";
import { Skeleton } from "portal-shared/components/ui/skeleton";
import React, { useEffect } from "react";
import { BillingAddressComboBox, type Entry } from "./BillingAddressComboBox";
import {
  type EntityCode,
  type FieldName,
  createBillingInfoSchema,
  fieldMapping,
  type BillingInfoFields,
} from "./BillingInformation.schema";
import { Billing } from "portal-shared/dataProviders/accountProvider";

export default function BillingInformation() {
  const { billingInfo, isLoading: isBillingInfoLoading } = useBillingInfo();
  const { submitBillingInfo, isSubmitting } = useSubmitBillingInfo();
  const {
    form,
    supportedEntities,
    setSupportedEntities,
    initialValues,
    setInitialValues,
    hasFormChanges,
    updateFormSchema,
    initializeForm
  } = useBillingForm();
  
  const {
    countryData,
    selectedCountry,
    selectedCountryData,
    handleCountryChange,
    useCountryList
  } = useCountryData(form);

  const { useStateList, useCityList } = useLocationLists(
    form.watch("country"),
    form.watch("state")
  );

  useEffect(() => {
    initializeForm(billingInfo);
  }, [billingInfo, initializeForm]);

  useEffect(() => {
    if (!countryData) return;
    
    let entities: EntityCode[] = ["C", "S"];
    
    if (selectedCountry && selectedCountryData?.supported_entities) {
      entities = selectedCountryData.supported_entities as EntityCode[];
    }
    
    setSupportedEntities(entities);
    
    if (selectedCountry) {
      updateFormSchema(entities, selectedCountryData?.required_fields || []);
    }
  }, [selectedCountry, countryData, updateFormSchema]);

  const { handleSubmit } = useFormSubmission(form, submitBillingInfo);
  
  const handleStateChange = () => {
    form.setValue("city", "");
  };

  if (isBillingInfoLoading) {
    return (
      <div className="flex items-start justify-center min-h-screen p-4 pt-60">
        <div className="w-full max-w-md space-y-2">
          <Skeleton className="h-4 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6 mx-auto" />
          <Skeleton className="h-4 w-2/3 mx-auto" />
        </div>
      </div>
    );
  }


  return (
    <Card className="bg-secondary/20">
      <CardHeader>
        <CardTitle>Billing Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <BillingFormInput
              name="name"
              label="Name"
              form={form}
            />

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

            {Object.keys(fieldMapping).map((key) => {
              const fieldName = fieldMapping[key as EntityCode];
              return (
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
              );
            })}

            <BillingFormInput
              name="postal_code"
              label="Postal Code"
              form={form}
            />

            <CardFooter className="px-0">
              <Button
                type="submit"
                className="ml-auto"
                disabled={isSubmitting || !hasFormChanges()}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
