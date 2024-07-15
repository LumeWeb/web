import useFeatureFlag from "@/hooks/useFeatureFlag";

export default function useIsSupportEnabled() {
  return useFeatureFlag("support");
}
