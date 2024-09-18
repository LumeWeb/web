import useFeatureFlag from "@/hooks/useFeatureFlag.js";

export default function useIsBillingEnabled() {
  return useFeatureFlag("billing");
}
