import usePortalMeta from "libs/portal-shared/src/hooks/usePortalMeta";

export default function usePortalPluginList(): string[] {
  const portalMeta = usePortalMeta();
  const plugins = portalMeta?.plugins;

  if (!plugins) {
    return [];
  }
  return Object.keys(plugins);
}
