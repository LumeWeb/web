import useBillingInfo from "@/routes/account/hooks/useBillingInfo";
import useSubmitBillingInfo from "@/routes/account/hooks/useSubmitBillingInfo";
import { useBillingForm } from "../hooks/useBillingForm";
import { useCountryData } from "../hooks/useCountryData";
import { useLocationLists } from "../hooks/useLocationLists";
import { useFormSubmission } from "../hooks/useFormSubmission";
import { BillingFormField } from "./BillingFormField";
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
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
    updateFormSchema
  } = useBillingForm();
  
  const {
    countryData,
    selectedCountry,
    selectedCountryData,
    handleCountryChange
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
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <BillingAddressComboBox
              name="country"
              control={form.control}
              label="Country"
              placeholder="Select Country"
              useList={useCountryList}
              onSelectionChange={handleCountryChange}
            />

            <FormField
              control={form.control}
              name="address_line1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 1</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address_line2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 2 (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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

            <FormField
              control={form.control}
              name="postal_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal Code</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
