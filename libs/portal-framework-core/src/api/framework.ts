import { loadRemote } from "@module-federation/enhanced/runtime";

import type { BaseCapability } from "../types/capabilities";
import type { NamespacedId } from "../types/plugin";
import type {
  WidgetAreaDefinition,
  WidgetDefinition,
  WidgetRegistration,
  WidgetRegistrationWithComponent,
} from "../types/widget";

import { CapabilityManager } from "../capabilities/manager";
import { env } from "../env";
import { PluginManager } from "../plugins/manager";
import {
  createRemoteComponentLoader,
  defaultRemoteOptions,
} from "../plugins/remoteComponentLoader";
import {
  CategoryError,
  ERROR_CATEGORIES,
  FrameworkFeature,
} from "../types/api";
import { PortalMeta } from "../types/portal";
import { getCurrentLocation } from "../util/location";
import { validateNamespacedId } from "../util/namespace";
import { fetchPortalMeta } from "../util/portalMeta";
import { persistQueryParams } from "../util/queryParamPersist";
import { validateFeature, validatePlugin } from "../util/validation";
import { sortWidgets } from "../util/widget";

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
  get meta(): null | PortalMeta {
    return this.#meta;
  }
  get portalUrl(): string {
    if (!this.#portalUrl) {
      throw new Error("Portal URL not initialized. Call initialize() first.");
    }
    return this.#portalUrl;
  }

  #_framework: Framework | null = null;

  readonly #capabilities: CapabilityManager;

  #isInitialized = false;
  #meta: null | PortalMeta = null;
  readonly #plugins: PluginManager;
  #portalUrl: null | string = null;

  private readonly _appName: string;

  private widgetAreas = new Map<string, WidgetAreaDefinition>();
  private widgets = new Map<string, WidgetDefinition>();

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

  _loadRemote = (...args: any) => loadRemote.apply(null, args);

  enablePlugin(id: NamespacedId): void {
    validateNamespacedId(id);
    this.#plugins.enablePlugin(id);
  }

  getAssociatedCapabilities(primaryCapabilityId: string): string[] {
    // Iterate through all plugins to find capability associations
    for (const plugin of this.getPlugins()) {
      if (plugin.capabilityAssociations) {
        // Find associations where the primary capability matches
        const associations = plugin.capabilityAssociations.find(
          (assoc) => assoc.primary === primaryCapabilityId,
        );

        if (associations) {
          return associations.associated;
        }
      }
    }

    // Return empty array if no associations found
    return [];
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

  getPrimaryCapability(associatedCapabilityId: string): null | string {
    // Iterate through all plugins to find capability associations
    for (const plugin of this.getPlugins()) {
      if (plugin.capabilityAssociations) {
        // Find associations where the associated capability is in the list
        const associations = plugin.capabilityAssociations.find((assoc) =>
          assoc.associated.includes(associatedCapabilityId),
        );

        if (associations) {
          return associations.primary;
        }
      }
    }

    // Return null if no primary capability found
    return null;
  }

  getWidgetArea(id: string): WidgetAreaDefinition {
    const area = this.widgetAreas.get(id);
    if (!area) {
      throw new Error(`Widget area ${id} not found`);
    }
    return area;
  }

  getWidgetsForArea(id: string): WidgetDefinition[] {
    if (!this.widgetAreas.has(id)) {
      throw new Error(`Widget area ${id} not found`);
    }

    return sortWidgets(
      Array.from(this.widgets.values()).filter((w) => w.areaId === id),
    );
  }

  hasCapability(type: string): boolean {
    validateNamespacedId(type);
    return this.#plugins.hasCapability(type);
  }

  async initialize(): Promise<{
    failures?: CategoryError[];
    success: boolean;
  }> {
    if (this.#isInitialized) {
      console.warn(`Framework for ${this._appName} already initialized.`);
      return { success: true };
    }

    // Auto-register widget areas and widgets from plugins
    for (const plugin of this.getPlugins()) {
      if (plugin.widgets) {
        // Register widget areas first
        plugin.widgets.areas?.forEach((area) => {
          this.registerWidgetArea(area);
        });

        // Register widgets using the dedicated method
        if (plugin.widgets.widgets?.length) {
          this.registerWidgetsFromPlugin(plugin.id, plugin.widgets.widgets);
        }
      }
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
        category: ERROR_CATEGORIES.PLUGIN,
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
          category: ERROR_CATEGORIES.PLUGIN,
          error: new Error(`Failed to load plugin: ${pluginId}`),
          id: pluginId,
        });
      } else {
        // Defensive check for plugin interface compliance
        if (!validatePlugin(plugin)) {
          errors.push({
            category: ERROR_CATEGORIES.PLUGIN,
            error: new Error(
              `Plugin ${plugin.id} does not comply with Plugin interface`,
            ),
            id: plugin.id,
          });
          return;
        }

        // Register capabilities from the plugin with plugin ID
        plugin.capabilities?.forEach((capability) => {
          this.#capabilities.register(capability, plugin.id);
        });
      }
    }

    const allQueryParamConfigs = this.getPlugins()
      .flatMap((p) => p.queryParamConfig ?? []);
    if (allQueryParamConfigs.length > 0) {
      await persistQueryParams(allQueryParamConfigs);
    }

    // Initialize capabilities
    const capabilityFailures = await this.#capabilities.initializeAll();
    for (const [id, error] of capabilityFailures) {
      errors.push({
        category: ERROR_CATEGORIES.CAPABILITY,
        error,
        id,
      });
    }

    // Load features from all enabled plugins
    for (const plugin of this.getPlugins()) {
      if (plugin.features) {
        for (const feature of plugin.features) {
          // Defensive check for feature interface compliance
          if (!validateFeature(feature)) {
            errors.push({
              category: ERROR_CATEGORIES.FEATURE,
              error: new Error(
                `Feature ${feature.id} does not comply with FrameworkFeature interface`,
              ),
              id: feature.id,
            });
            continue;
          }

          try {
            await this.loadFeature(feature.id);
          } catch (error) {
            errors.push({
              category: ERROR_CATEGORIES.FEATURE,
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

  // Public getter for initialization status
  isInitialized(): boolean {
    return this.#isInitialized;
  }

  isPluginEnabled(id: NamespacedId): boolean {
    validateNamespacedId(id);
    return this.#plugins.isPluginEnabled(id);
  }

  async loadFeature(id: NamespacedId) {
    validateNamespacedId(id);
    const feature = await this.#plugins.loadFeature(id);
    return feature;
  }

  registerCapability(capability: BaseCapability, pluginId: string): void {
    this.#capabilities.register(capability, pluginId);
  }

  registerWidget(widget: WidgetRegistrationWithComponent): void {
    if (this.widgets.has(widget.id)) {
      throw new Error(`Widget with id ${widget.id} already registered`);
    }

    if (!this.widgetAreas.has(widget.areaId)) {
      throw new Error(`Widget area ${widget.areaId} not registered`);
    }

    // Construct definition explicitly with only allowed fields
    const definition: WidgetDefinition = {
      ...widget,
      component: createRemoteComponentLoader(
        {
          componentPath: widget.componentName,
          pluginId: widget.pluginId,
        },
        this,
        defaultRemoteOptions,
      ),
    };

    this.widgets.set(widget.id, definition);
  }

  registerWidgetArea(area: WidgetAreaDefinition): void {
    this.widgetAreas.set(area.id, area);
  }

  /**
   * Registers all widgets from a plugin configuration
   */
  registerWidgetsFromPlugin(
    pluginId: NamespacedId,
    widgets: WidgetRegistration[],
  ): void {
    widgets.forEach((widget) => {
      this.registerWidget({
        ...widget,
        componentName: widget.componentName,
        pluginId,
      });
    });
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
}
