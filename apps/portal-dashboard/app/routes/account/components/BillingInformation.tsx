import React, { useEffect } from "react";
import { getFormProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useBillingInfo from "@/routes/account/hooks/useBillingInfo";
import useSubmitBillingInfo from "@/routes/account/hooks/useSubmitBillingInfo";
import billingInfoSchema from "./BillingInformation.schema";
import { Field } from "@/components/Forms";

export default function BillingInformation() {
  const { billingInfo, isLoading } = useBillingInfo();
  const { submitBillingInfo, isSubmitting } = useSubmitBillingInfo();

  const [form, fields] = useForm({
    id: "billing-info",
    constraint: getZodConstraint(billingInfoSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: billingInfoSchema });
    },
    shouldValidate: "onBlur",
    defaultValue: billingInfo,
    onSubmit(event) {
      event.preventDefault();
      const parsedSubmission = parseWithZod(new FormData(event.currentTarget), {
        schema: billingInfoSchema,
      });
      if (parsedSubmission.status === "success") {
        submitBillingInfo(parsedSubmission.value);
      }
    },
  });

  useEffect(() => {
    if (billingInfo) {
      console.log("Billing info loaded:", billingInfo);
      form.reset(billingInfo);
    }
  }, [billingInfo, form]);

  if (isLoading) {
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
    <Card>
      <CardHeader>
        <CardTitle>Billing Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form {...getFormProps(form)}>
          <div className="grid gap-4">
            <Field
              labelProps={{ children: "Name" }}
              inputProps={{ name: fields.name.name }}
              errors={fields.name.errors}
            />
            <Field
              labelProps={{ children: "Address" }}
              inputProps={{
                name: fields.address.name,
                as: "textarea",
                rows: 3,
              }}
              errors={fields.address.errors}
            />
            <div className="grid grid-cols-2 gap-4">
              <Field
                labelProps={{ children: "City" }}
                inputProps={{ name: fields.city.name }}
                errors={fields.city.errors}
              />
              <Field
                labelProps={{ children: "State" }}
                inputProps={{ name: fields.state.name }}
                errors={fields.state.errors}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field
                labelProps={{ children: "ZIP" }}
                inputProps={{ name: fields.zip.name }}
                errors={fields.zip.errors}
              />
              <Field
                labelProps={{ children: "Country" }}
                inputProps={{ name: fields.country.name }}
                errors={fields.country.errors}
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" className="ml-auto" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </CardFooter>
    </Card>
  );
}
