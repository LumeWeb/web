import useBillingInfo from "@/routes/account/hooks/useBillingInfo";
import useSubmitBillingInfo from "@/routes/account/hooks/useSubmitBillingInfo";
import { zodResolver } from "@hookform/resolvers/zod";
import { useList } from "@refinedev/core";
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

export default function BillingInformation() {
  const { billingInfo, isLoading: isBillingInfoLoading } = useBillingInfo();
  const { submitBillingInfo, isSubmitting } = useSubmitBillingInfo();
  const [isInitialized, setIsInitialized] = useState(false);
  const [supportedEntities, setSupportedEntities] = useState<EntityCode[]>([]);

  const useCountryList = () =>
    useList<Entry>({ resource: "account/subscription/billing/countries" });
  const { data: countryData } = useCountryList();

  const form = useForm<BillingInfoFields>({
    resolver: zodResolver(createBillingInfoSchema(supportedEntities, [])),
    defaultValues: defaultBillingInfo,
    mode: "onBlur",
  });

  const selectedCountry = form.watch("country");
  const selectedCountryData = countryData?.data.find(
    (country) => country.code === selectedCountry,
  );

  useEffect(() => {
    const selectedCountry = form.watch("country");
    const selectedCountryData = countryData?.data.find(
      (country) => country.code === selectedCountry,
    );
    
    // Update form with new validation rules while preserving current values
    const currentValues = form.getValues();
    form.clearErrors();
    
    // Re-initialize form with new schema but keep current values
    form.reset(currentValues, {
      resolver: zodResolver(createBillingInfoSchema(
        supportedEntities,
        selectedCountryData?.required_fields || []
      ))
    });
  }, [form.watch("country"), countryData, supportedEntities]);

  const useStateList = () =>
    useList<Entry>({
      resource: "account/subscription/billing/states",
      filters: [
        { field: "country", operator: "eq", value: form.watch("country") },
      ],
    });

  const useCityList = () =>
    useList<Entry>({
      resource: "account/subscription/billing/cities",
      filters: [
        { field: "country", operator: "eq", value: form.watch("country") },
        { field: "state", operator: "eq", value: form.watch("state") },
      ],
    });

  useEffect(() => {
    if (billingInfo && !isInitialized) {
      const initialValues: BillingInfoFields = {
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
      form.reset(initialValues);
      setIsInitialized(true);
    }
  }, [billingInfo, form, isInitialized]);

  useEffect(() => {
    const selectedCountry = form.watch("country");
    const selectedCountryData = countryData?.data.find(
      (country) => country.code === selectedCountry,
    );
    const entities = (selectedCountryData?.supported_entities ||
      []) as EntityCode[];
    
    setSupportedEntities(entities);
    form.clearErrors();
  }, [form.watch("country"), countryData]);

  const onSubmit = async (data: BillingInfoFields) => {
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
    }
  };

  const handleCountryChange = () => {
    form.setValue("state", "");
    form.setValue("city", "");
    form.setValue("dependent_locality", undefined);
    form.setValue("sorting_code", undefined);
  };

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

  const renderField = (fieldName: FieldName) => {
    const entityCode = Object.keys(fieldMapping).find(
      (key) => fieldMapping[key as EntityCode] === fieldName,
    ) as EntityCode;

    if (!supportedEntities.includes(entityCode)) {
      return null;
    }

    switch (fieldName) {
      case "city":
        return (
          <BillingAddressComboBox
            name="city"
            control={form.control}
            label="City"
            placeholder="Select City"
            useList={useCityList}
            disabled={!form.watch("state")}
          />
        );
      case "state":
        return (
          <BillingAddressComboBox
            name="state"
            control={form.control}
            label="State"
            placeholder="Select State"
            useList={useStateList}
            onSelectionChange={handleStateChange}
            disabled={!form.watch("country")}
          />
        );
      case "dependent_locality":
      case "sorting_code":
        return (
          <FormField
            control={form.control}
            name={fieldName}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {fieldName === "dependent_locality"
                    ? "District/Ward"
                    : "Sorting Code"}
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Card className="bg-secondary/20">
      <CardHeader>
        <CardTitle>Billing Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            {Object.keys(fieldMapping).map((key) =>
              renderField(fieldMapping[key as EntityCode]),
            )}

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
                disabled={isSubmitting || !form.formState.isValid}>
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
