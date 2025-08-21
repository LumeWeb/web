import { loadRemote } from "@module-federation/enhanced/runtime";

import type { NamespacedId, PluginModule } from "../types/plugin";

import { CapabilityManager } from "../capabilities/manager";
import { PluginManager } from "../plugins/manager";
import { Plugin } from "../types/plugin";
import { getPluginInfo } from "../util/getPluginInfo";
import { Framework } from "./framework";

export class Builder {
  get framework(): Promise<Framework> {
    if (!this.#framework) {
      console.log("[Builder] Building new framework instance");
      this.#framework = this.build();
    }
    return this.#framework;
  }

  #capabilities?: CapabilityManager;
  #framework: null | Promise<Framework> = null;
  #operations: (() => Promise<void>)[] = [];
  #plugins?: PluginManager;
  private readonly _appName: string;

  constructor(appName: string) {
    this._appName = appName;
  }

  async build(): Promise<Framework> {
    // Create fresh instances for this build
    this.#plugins = new PluginManager();
    this.#capabilities = new CapabilityManager();

    // Execute all queued operations
    for (const op of this.#operations) {
      await op();
    }

    return new Framework(this.#capabilities, this.#plugins, this._appName);
  }

  getPlugins(): Plugin[] {
    return Array.from(this.#plugins?.getPlugins() ?? []);
  }

  registerPluginFactory(id: NamespacedId, factory: () => Plugin) {
    this.#operations.push(async () => {
      if (!this.#plugins) throw new Error("Builder not initialized");
      this.#plugins.registerFactory(id, factory);
    });
    return this;
  }

  async registerRemoteModule(remoteEntry: string, moduleId: string) {
    this.#operations.push(async () => {
      if (!this.#plugins) throw new Error("Builder not initialized");

      try {
        const mod = (await loadRemote(moduleId))!;
        const { id: pluginId } = getPluginInfo(mod);

        this.#plugins.registerRemoteModule(moduleId, remoteEntry, pluginId);
        this.#plugins.registerFactory(pluginId, mod.default);
        this.#plugins.enableAndActivatePlugin(pluginId);
      } catch (error) {
        console.error(`Failed to register remote module ${moduleId}:`, error);
        throw error;
      }
    });
    return this;
  }
}
