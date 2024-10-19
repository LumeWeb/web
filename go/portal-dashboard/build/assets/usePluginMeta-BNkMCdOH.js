import { u as usePortalMeta } from "./usePortalMeta-BrKLDHxF.js";
function usePluginMeta(pluginName, key) {
  var _a, _b;
  const portalMeta = usePortalMeta();
  const pluginMeta = (_b = (_a = portalMeta == null ? void 0 : portalMeta.plugins) == null ? void 0 : _a[pluginName]) == null ? void 0 : _b.meta;
  if (!pluginMeta) return void 0;
  if (!key) return pluginMeta;
  return getNestedProperty(pluginMeta, key);
}
function getNestedProperty(obj, path) {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
}
export {
  usePluginMeta as u
};
