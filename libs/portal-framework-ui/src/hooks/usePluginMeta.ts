import type { PortalMeta } from "@lumeweb/portal-framework-core";
import { getPluginMeta } from "@lumeweb/portal-framework-core";

import { useAppStore } from "@/store/appStore";

export function usePluginMeta<T = Record<string, unknown>>(
  pluginName: string,
  key?: string,
): T | undefined {
  const meta = useAppStore((state) => state.meta);
  return getPluginMeta<T>(meta, pluginName, key);
}
