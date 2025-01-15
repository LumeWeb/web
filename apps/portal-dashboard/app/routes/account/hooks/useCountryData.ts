import { useList } from "@refinedev/core";
import type { Entry } from "../components/BillingAddressComboBox";
import type { UseFormReturn } from "react-hook-form";
import type { BillingInfoFields } from "../components/BillingInformation.schema";

export const useCountryList = () =>
  useList<Entry>({ resource: "account/subscription/billing/countries" });

export function useCountryData(form: UseFormReturn<BillingInfoFields>) {
  const { data: countryData } = useCountryList();

  const selectedCountry = form.watch("country");
  const selectedCountryData = countryData?.data.find(
    (country) => country.code === selectedCountry
  );

  const handleCountryChange = () => {
    form.setValue("state", "");
    form.setValue("city", "");
    form.setValue("dependent_locality", undefined);
    form.setValue("sorting_code", undefined);
  };

  return {
    countryData,
    selectedCountry,
    selectedCountryData,
    handleCountryChange
  };
}
