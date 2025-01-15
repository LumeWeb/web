import React from "react";
import type { UseFormReturn } from "react-hook-form";
import type { BillingInfoFields, EntityCode, FieldName } from "./BillingInformation.schema";
import { BillingAddressComboBox } from "./BillingAddressComboBox";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "portal-shared/components/ui/form";
import { Input } from "portal-shared/components/ui/input";

interface BillingFormFieldProps {
  fieldName: FieldName;
  form: UseFormReturn<BillingInfoFields>;
  entityCode: EntityCode;
  supportedEntities: EntityCode[];
  useStateList?: () => any;
  useCityList?: () => any;
  handleStateChange?: () => void;
}

export function BillingFormField({
  fieldName,
  form,
  entityCode,
  supportedEntities,
  useStateList,
  useCityList,
  handleStateChange,
}: BillingFormFieldProps) {
  if (!supportedEntities.includes(entityCode)) {
    return null;
  }

  switch (fieldName) {
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
}
