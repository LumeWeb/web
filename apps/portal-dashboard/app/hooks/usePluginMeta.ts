import usePortalMeta from "./usePortalMeta";

export default function usePluginMeta<T = any>(
  pluginName: string,
  key?: string,
): T | undefined {
  const portalMeta = usePortalMeta();
  const pluginMeta = portalMeta?.plugins?.[pluginName]?.meta;

  if (!pluginMeta) return undefined;
  if (!key) return pluginMeta as T;
  return getNestedProperty(pluginMeta, key) as T;
}

function getNestedProperty(obj: any, path: string) {
  return path.split(".").reduce((acc, part) => acc && acc[part], obj);
}
