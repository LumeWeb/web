import { useList } from "@refinedev/core";
import type { Entry } from "../components/BillingAddressComboBox";
import { useMemo } from "react";

export function useLocationLists(country: string, state: string) {
  const useStateList = useMemo(() => 
    () => useList<Entry>({
      resource: "account/subscription/billing/states",
      filters: [
        { field: "country", operator: "eq", value: country },
      ],
    }),
  [country]);

  const useCityList = useMemo(() => 
    () => useList<Entry>({
      resource: "account/subscription/billing/cities",
      filters: [
        { field: "country", operator: "eq", value: country },
        { field: "state", operator: "eq", value: state },
      ],
    }),
  [country, state]);

  return {
    useStateList,
    useCityList
  };
}
