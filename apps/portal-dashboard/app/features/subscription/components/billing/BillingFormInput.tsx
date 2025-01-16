import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { BillingInfo } from '../../types/billing.types';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from 'portal-shared/components/ui/form';
import { Input } from 'portal-shared/components/ui/input';

interface BillingFormInputProps {
  name: string;
  label: string;
  form: UseFormReturn<BillingInfo>;
  optional?: boolean;
}

export function BillingFormInput({
  name,
  label,
  form,
  optional = false
}: BillingFormInputProps) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {!optional && <span className="text-destructive"> *</span>}
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
