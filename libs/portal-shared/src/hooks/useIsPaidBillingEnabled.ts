import useFeatureFlag from "@/hooks/useFeatureFlag";

export default function useIsPaidBillingEnabled() {
  return useFeatureFlag("paid_billing");
}
