import { usePortalMeta } from "@/hooks/usePortalMeta";

export function useFeatureFlag(featureName: string): boolean {
  const portalMeta = usePortalMeta();
  const flagValue = portalMeta?.feature_flags?.[featureName.toUpperCase()];
  // Convert the value to a boolean: truthy values become true, falsy values become false
  return !!flagValue;
}
