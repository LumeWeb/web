import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "portal-shared/components/ui/textarea";
import { Button } from "portal-shared/components/ui/button";
import { Skeleton } from "portal-shared/components/ui/skeleton";
import useBillingInfo from "@/routes/account/hooks/useBillingInfo";
import useSubmitBillingInfo from "@/routes/account/hooks/useSubmitBillingInfo";
import {
  createBillingInfoSchema,
  EntityCode,
  FieldName,
  fieldMapping,
  BillingInfoFields,
} from "./BillingInformation.schema";
import { useList } from "@refinedev/core";
import { BillingAddressComboBox, Entry } from "./BillingAddressComboBox";

type FormFields = {
  [K in keyof BillingInfoFields]: string;
};

export default function BillingInformation() {
  const { billingInfo, isLoading: isBillingInfoLoading } = useBillingInfo();
  const { submitBillingInfo, isSubmitting } = useSubmitBillingInfo();
  const [isInitialized, setIsInitialized] = useState(false);
  const [supportedEntities, setSupportedEntities] = useState<EntityCode[]>([]);

  const useCountryList = () =>
    useList<Entry>({ resource: "account/subscription/billing/countries" });
  const { data: countryData } = useCountryList();

  const form = useForm<FormFields>({
    resolver: zodResolver(createBillingInfoSchema(supportedEntities)),
    defaultValues: {
      name: "",
      country: "",
    },
    mode: "onBlur",
  });

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
      console.log("Billing info loaded:", billingInfo);
      form.reset(billingInfo as FormFields);
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
    form.reset(form.getValues(), { keepValues: true });
  }, [form.watch("country"), countryData]);

  const onSubmit = async (data: FormFields) => {
    try {
      await submitBillingInfo(data);
      // Show success message
    } catch (error) {
      if (typeof error === "object" && error !== null) {
        // Apply errors to form fields
        Object.entries(error).forEach(([field, message]) => {
          form.setError(field as keyof FormFields, {
            type: "manual",
            message: message as string,
          });
        });
      } else {
        // Handle unexpected error format
        console.error("Error submitting billing info:", error);
      }
    }
  };

  const handleCountryChange = () => {
    form.setValue("state", undefined);
    form.setValue("city", undefined);
  };

  const handleStateChange = () => {
    form.setValue("city", undefined);
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
      case "address":
        return (
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
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
      default:
        return (
          <FormField
            control={form.control}
            name={fieldName as keyof BillingInfoFields}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
    }
  };

  return (
    <Card>
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
            <BillingAddressComboBox
              name="country"
              control={form.control}
              label="Country"
              placeholder="Select Country"
              useList={useCountryList}
              onSelectionChange={handleCountryChange}
            />
            {Object.keys(fieldMapping).map((key) =>
              renderField(fieldMapping[key as EntityCode]),
            )}
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
