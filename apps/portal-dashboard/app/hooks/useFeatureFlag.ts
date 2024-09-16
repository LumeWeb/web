import usePortalMeta from "./usePortalMeta";

export default function useFeatureFlag(featureName: string): boolean {
  const portalMeta = usePortalMeta();
  return portalMeta?.feature_flags?.[featureName.toUpperCase()] ?? false;
}
