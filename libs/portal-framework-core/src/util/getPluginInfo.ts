import type { PluginModule } from "../types/plugin";

export function getPluginInfo(mod: PluginModule) {
  const tempPlugin = mod.default();

  if (!tempPlugin.id) {
    throw new Error("Plugin module must provide id");
  }

  return {
    id: tempPlugin.id,
  };
}
