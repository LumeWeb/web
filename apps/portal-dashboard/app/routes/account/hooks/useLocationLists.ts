import { useList } from "@refinedev/core";
import type { Entry } from "../components/BillingAddressComboBox";

export function useLocationLists(country: string, state: string) {
  const useStateList = () =>
    useList<Entry>({
      resource: "account/subscription/billing/states",
      filters: [
        { field: "country", operator: "eq", value: country },
      ],
    });

  const useCityList = () =>
    useList<Entry>({
      resource: "account/subscription/billing/cities",
      filters: [
        { field: "country", operator: "eq", value: country },
        { field: "state", operator: "eq", value: state },
      ],
    });

  return {
    useStateList,
    useCityList
  };
}
