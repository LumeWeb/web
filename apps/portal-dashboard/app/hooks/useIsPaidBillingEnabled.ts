import useFeatureFlag from "@/hooks/useFeatureFlag.js";

export default function useIsPaidBillingEnabled() {
  return useFeatureFlag("paid_billing");
}
