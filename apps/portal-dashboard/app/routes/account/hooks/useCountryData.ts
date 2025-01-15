import { useList } from "@refinedev/core";
import type { Entry } from "../components/BillingAddressComboBox";
import type { UseFormReturn } from "react-hook-form";
import type { BillingInfoFields } from "../components/BillingInformation.schema";

const useCountryList = () =>
  useList<Entry>({ resource: "account/subscription/billing/countries" });

export function useCountryData(form: UseFormReturn<BillingInfoFields>) {
  const { data: countryData } = useCountryList();

  const selectedCountry = form.watch("country");
  const selectedCountryData = countryData?.data.find(
    (country) => country.code === selectedCountry
  );

  const handleCountryChange = useCallback(() => {
    form.setValue("state", "", { shouldDirty: true });
    form.setValue("city", "", { shouldDirty: true });
    form.setValue("dependent_locality", undefined, { shouldDirty: true });
    form.setValue("sorting_code", undefined, { shouldDirty: true });
  }, [form]);

  return {
    countryData,
    selectedCountry,
    selectedCountryData,
    handleCountryChange,
    useCountryList
  };
}
