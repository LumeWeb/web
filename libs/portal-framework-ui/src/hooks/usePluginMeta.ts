import { getPluginMeta } from "@lumeweb/portal-framework-core";
import { usePortalStore } from "../store/portalStore";

import { shallow } from "zustand/shallow";

export function usePluginMeta<T = Record<string, unknown>>(
  pluginName: string,
  key?: string,
): T | undefined {
  const meta = usePortalStore((state) => state.meta);
  return getPluginMeta<T>(meta, pluginName, key);
}
