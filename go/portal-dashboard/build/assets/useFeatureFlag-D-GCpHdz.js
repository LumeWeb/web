import { u as usePortalMeta } from "./usePortalMeta-B1ITfk6e.js";
function useFeatureFlag(featureName) {
  var _a;
  const portalMeta = usePortalMeta();
  return ((_a = portalMeta == null ? void 0 : portalMeta.feature_flags) == null ? void 0 : _a[featureName.toUpperCase()]) ?? false;
}
export {
  useFeatureFlag as u
};
