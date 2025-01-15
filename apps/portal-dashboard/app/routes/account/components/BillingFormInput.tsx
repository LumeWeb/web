import React from "react";
import type { UseFormReturn } from "react-hook-form";
import type { BillingInfoFields } from "./BillingInformation.schema";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "portal-shared/components/ui/form";
import { Input } from "portal-shared/components/ui/input";

interface BillingFormInputProps {
  name: keyof BillingInfoFields;
  label: string;
  form: UseFormReturn<BillingInfoFields>;
  optional?: boolean;
}

export function BillingFormInput({
  name,
  label,
  form,
  optional = false,
}: BillingFormInputProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}{optional && " (Optional)"}</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
