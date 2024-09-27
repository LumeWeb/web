import useFeatureFlag from "@/hooks/useFeatureFlag.js";

export default function useIsSupportEnabled() {
  return useFeatureFlag("support");
}
