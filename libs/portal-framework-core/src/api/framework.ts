import { createRemoteComponent } from "@module-federation/bridge-react";
import { loadRemote } from "@module-federation/enhanced/runtime";

import type { BaseCapability } from "../types/capabilities";
import type { NamespacedId, WidgetRegistrationInfo } from "../types/plugin";

import { CapabilityManager } from "../capabilities/manager";
import { PluginManager } from "../plugins/manager";
import { CategoryError, FrameworkFeature } from "../types/api";
import { PortalMeta } from "../types/portal";
import { validateNamespacedId } from "../util/namespace";
import { env } from "../env";
import { getCurrentLocation } from "../util/location";
import { fetchPortalMeta } from "../util/portalMeta";

export class Framework {
  get appName() {
    return this._appName;
  }
  get framework(): Framework {
    if (!this.#_framework) {
      throw new Error("Framework not set");
    }
    return this.#_framework;
  }
  set framework(value: Framework) {
    this.#_framework = value;
  }
  #_framework: Framework | null = null;
  readonly #capabilities: CapabilityManager;

  // Public getter for initialization status
  isInitialized(): boolean {
    return this.#isInitialized;
  }

  readonly #plugins: PluginManager;

  private readonly _appName: string;
  #isInitialized = false;
  #meta: PortalMeta | null = null;
  #portalUrl: string | null = null;

  constructor(
    capabilities: CapabilityManager,
    plugins: PluginManager,
    appName: string,
  ) {
    this.#capabilities = capabilities;
    this.#plugins = plugins;
    this._appName = appName;
    // Use public method instead of direct private field assignment
    plugins.framework = this;
    capabilities.framework = this;
  }

  _createRemoteComponent = (...args: any) =>
    createRemoteComponent.apply(null, args);
  _loadRemote = (...args: any) => loadRemote.apply(null, args);

  enablePlugin(id: NamespacedId): void {
    validateNamespacedId(id);
    this.#plugins.enablePlugin(id);
  }

  async getCapabilitiesByType<T extends BaseCapability>(
    type: string,
  ): Promise<T[]> {
    return await this.#capabilities.getAllOfType(type);
  }

  async getCapability<T extends BaseCapability>(
    id: string,
  ): Promise<T | undefined> {
    return (await this.#capabilities.get(id))!;
  }

  async getFeature<T extends FrameworkFeature>(id: NamespacedId): Promise<T> {
    validateNamespacedId(id);
    const feature = await this.#plugins.getFeatureWithFallback<T>(id);
    if (!feature) {
      throw new Error(`Feature ${id} not found`);
    }
    return feature;
  }

  getPluginManager(): PluginManager {
    return this.#plugins;
  }

  getPlugins() {
    return this.#plugins.getPlugins();
  }

  /**
   * Retrieves widget registrations for a given area from all enabled plugins.
   * @param area The area to retrieve widget registrations for (e.g., "dashboard").
   * @returns An array of objects containing the pluginId and componentName for each registration.
   */
  getWidgetRegistrations(area: string): WidgetRegistrationInfo[] {
    const registrations: WidgetRegistrationInfo[] = [];

    for (const plugin of this.getPlugins()) {
      if (plugin.widgetRegistrations) {
        plugin.widgetRegistrations.forEach((reg) => {
          if (reg.area === area) {
            registrations.push({
              componentName: reg.componentName,
              pluginId: plugin.id,
            });
          }
        });
      }
    }
    return registrations;
  }

  hasCapability(type: string): boolean {
    validateNamespacedId(type);
    return this.#plugins.hasCapability(type);
  }

  async #fetchAndSetPortalMeta(): Promise<void> {
    try {
      const meta = await fetchPortalMeta();
      if (!meta?.domain) {
        throw new Error("Invalid portal meta: missing domain");
      }

      this.#meta = meta;
      this.#portalUrl = meta.domain.startsWith("http")
        ? meta.domain
        : `https://${meta.domain}`;
    } catch (error) {
      console.error("Failed to fetch portal meta:", error);

      // Fallback to env var or current location
      const fallbackUrl = env.VITE_PORTAL_DOMAIN || getCurrentLocation().origin;
      this.#portalUrl = fallbackUrl;
      console.warn(`Using fallback portal URL: ${fallbackUrl}`);
    }
  }

  async initialize(): Promise<{
    failures?: CategoryError[];
    success: boolean;
  }> {
    if (this.#isInitialized) {
      console.warn(`Framework for ${this._appName} already initialized.`);
      return { success: true };
    }

    // Ensure portal URL is set before initializing plugins
    if (!this.#portalUrl) {
      await this.#fetchAndSetPortalMeta();
    }

    const errors: CategoryError[] = [];

    // Initialize plugins in dependency order
    const pluginFailures = await this.#plugins.initializePlugins();
    for (const [id, error] of pluginFailures) {
      errors.push({
        category: "plugin",
        error,
        id,
      });
    }

    // Attempt to retry any failed plugin initializations
    await this.#plugins.retryFailedPlugins();

    // Load and initialize enabled plugins
    for (const pluginId of this.#plugins.getEnabledPlugins()) {
      const plugin = this.#plugins.getOrActivatePlugin(pluginId);
      if (!plugin) {
        errors.push({
          category: "plugin",
          error: new Error(`Failed to load plugin: ${pluginId}`),
          id: pluginId,
        });
      } else {
        // Register capabilities from the plugin with plugin ID
        plugin.capabilities?.forEach((capability) => {
          this.#capabilities.register(capability, plugin.id);
        });
      }
    }

    // Initialize capabilities
    const capabilityFailures = await this.#capabilities.initializeAll();
    for (const [id, error] of capabilityFailures) {
      errors.push({
        category: "capability",
        error,
        id,
      });
    }

    // Load features from all enabled plugins
    for (const plugin of this.getPlugins()) {
      if (plugin.features) {
        for (const feature of plugin.features) {
          try {
            await this.loadFeature(feature.id);
          } catch (error) {
            errors.push({
              category: "feature",
              error: error instanceof Error ? error : new Error(String(error)),
              id: feature.id,
            });
          }
        }
      }
    }

    const success = errors.length === 0;
    if (success) {
      this.#isInitialized = true; // Mark as initialized on success
    }
    // Note: The #isInitialized flag is now checked via the public isInitialized() getter
    // in framework-initializer.ts and tests.

    return {
      failures: errors.length > 0 ? errors : undefined,
      success,
    };
  }

  isFeatureAvailable(id: NamespacedId): boolean {
    const state = this.#plugins.getPluginState(id);
    return state?.loadState === "loaded" && state?.initState === "initialized";
  }

  isPluginEnabled(id: NamespacedId): boolean {
    validateNamespacedId(id);
    return this.#plugins.isPluginEnabled(id);
  }

  get meta(): PortalMeta | null {
    return this.#meta;
  }

  get portalUrl(): string {
    if (!this.#portalUrl) {
      throw new Error("Portal URL not initialized. Call initialize() first.");
    }
    return this.#portalUrl;
  }

  async loadFeature(id: NamespacedId) {
    validateNamespacedId(id);
    const feature = await this.#plugins.loadFeature(id);
    if (feature) {
      await feature.initialize(this);
    }
    return feature;
  }

  registerCapability(capability: BaseCapability, pluginId: string): void {
    this.#capabilities.register(capability, pluginId);
  }

  resolvePluginModule(pluginId: NamespacedId, exportName: string): string {
    // Find the module mapping for this plugin
    const mapping = this.#plugins.getRemoteModule(pluginId);

    if (!mapping) {
      throw new Error(`No module mapping found for plugin: ${pluginId}`);
    }

    // Assume component is exported at root level
    return `${mapping.moduleId}/${exportName}`;
  }
}
