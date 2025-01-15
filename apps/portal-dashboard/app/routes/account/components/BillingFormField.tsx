import React from "react";
import type { UseFormReturn } from "react-hook-form";
import type { BillingInfoFields, EntityCode, FieldName } from "./BillingInformation.schema";
import type { Entry } from "./BillingAddressComboBox";
import { BillingAddressComboBox } from "./BillingAddressComboBox";
import { BillingFormInput } from "./BillingFormInput";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "portal-shared/components/ui/form";
import { Input } from "portal-shared/components/ui/input";

type ListHook = () => { data?: { data: Entry[] } };

interface BillingFormFieldProps {
  fieldName: FieldName;
  form: UseFormReturn<BillingInfoFields>;
  entityCode: EntityCode;
  supportedEntities: EntityCode[];
  useStateList?: ListHook;
  useCityList?: ListHook;
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
        <BillingFormInput
          name={fieldName}
          label={fieldName === "dependent_locality" ? "District/Ward" : "Sorting Code"}
          form={form}
        />
      );
    default:
      return null;
  }
}
