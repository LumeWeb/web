import usePortalMeta from "libs/portal-shared/src/hooks/usePortalMeta";

export default function useFeatureFlag(featureName: string): boolean {
  const portalMeta = usePortalMeta();
  return portalMeta?.feature_flags?.[featureName.toUpperCase()] ?? false;
}
