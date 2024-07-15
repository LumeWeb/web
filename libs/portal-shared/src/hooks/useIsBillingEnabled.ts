import useFeatureFlag from "@/hooks/useFeatureFlag";

export default function useIsBillingEnabled() {
  return useFeatureFlag("billing");
}
