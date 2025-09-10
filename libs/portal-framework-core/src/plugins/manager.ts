import type { RouteDefinition } from "../types/navigation";
import type {
  FeatureState,
  NamespacedId,
  Plugin,
  PluginState,
} from "../types/plugin";

import { Framework } from "../api/framework";
import { FeatureLoadError, PluginInitError, PluginLoadError } from "../errors";
import { FrameworkFeature } from "../types/api";
import { DependencyGraph } from "../util/dependencyGraph";
import { isNamespacedId, validateNamespacedId } from "../util/namespace";
import {
  validateFeatureDetailed,
  validatePluginDetailed,
} from "../util/validation";

export interface RemoteModule {
  entry: string;
  moduleId: string;
  pluginId: NamespacedId;
}

export class PluginManager {
  set framework(value: Framework) {
    this._framework = value;
  }

  get framework(): Framework {
    if (!this._framework) {
      throw new Error("Framework not set");
    }
    return this._framework;
  }

  get remoteModules(): Map<string, RemoteModule> {
    return this.#remoteModules;
  }

  readonly #enabledPlugins = new Set<NamespacedId>();

  readonly #features = new Map<NamespacedId, Promise<FrameworkFeature>>();
  readonly #featureStates = new Map<NamespacedId, FeatureState>();

  readonly #loadedPlugins = new Map<NamespacedId, Plugin>();
  readonly #pluginFactories = new Map<NamespacedId, () => Plugin>();
  readonly #pluginStates = new Map<NamespacedId, PluginState>();
  readonly #remoteModules = new Map<string, RemoteModule>();
  private _framework: Framework | null = null;
  async destroyPlugin(id: NamespacedId) {
    const plugin = this.#loadedPlugins.get(id);
    if (!plugin) return;

    // Destroy features first
    if (plugin.features) {
      for (const feature of plugin.features) {
        await this.#destroyFeature(feature.id);
      }
    }

    // Cleanup plugin state
    if (plugin.destroy) {
      try {
        await plugin.destroy(this.framework);
      } catch (error) {
        console.error(`Error destroying plugin ${id}:`, error);
      }
    }

    this.#loadedPlugins.delete(id);
    this.#pluginStates.delete(id);
  }
  async destroyPlugins() {
    const order = this.getInitializationOrder().reverse();
    for (const pluginId of order) {
      await this.destroyPlugin(pluginId);
    }
  }

  enableAndActivatePlugin(pluginId: NamespacedId) {
    this.enablePlugin(pluginId);
    this.getOrActivatePlugin(pluginId);
  }

  enablePlugin(id: NamespacedId): void {
    validateNamespacedId(id);
    this.#enabledPlugins.add(id);
  }

  getEnabledPlugins(): NamespacedId[] {
    return Array.from(this.#enabledPlugins);
  }

  getFailedPlugins(): { error: Error; id: string }[] {
    return Array.from(this.#pluginStates.entries())
      .filter(
        ([_, state]) =>
          state.loadState === "failed" || state.initState === "failed",
      )
      .map(([id, state]) => ({
        error: state.error!,
        id,
      }));
  }

  async getFeature<T extends FrameworkFeature>(
    id: NamespacedId,
  ): Promise<T | undefined> {
    return this.#features.get(id) as Promise<T>;
  }

  getFeatureState(id: NamespacedId): FeatureState | undefined {
    return this.#featureStates.get(id);
  }

  async getFeatureWithFallback<T extends FrameworkFeature>(
    id: NamespacedId,
  ): Promise<T | undefined> {
    try {
      return await this.getFeature<T>(id);
    } catch (error) {
      console.warn(`Failed to get feature ${id}:`, error);
      return undefined;
    }
  }

  getInitializationOrder(): NamespacedId[] {
    const graph = new DependencyGraph<NamespacedId>();

    // Add all enabled plugins to the graph
    for (const pluginId of this.#enabledPlugins) {
      graph.addNode(pluginId);
    }

    // Add dependencies between enabled plugins
    for (const pluginId of this.#enabledPlugins) {
      const plugin = this.#loadedPlugins.get(pluginId);
      if (plugin?.dependencies) {
        for (const dep of plugin.dependencies) {
          // Only add dependency if the dependent plugin is enabled
          if (this.#enabledPlugins.has(dep.id)) {
            graph.addDependency(pluginId, dep.id);
          }
        }
      }
    }

    try {
      return graph.topologicalSort();
    } catch (error) {
      console.error("Failed to sort plugins topologically:", error);
      // Fallback to original registration order if sorting fails
      return Array.from(this.#enabledPlugins);
    }
  }

  getOrActivatePlugin(id: NamespacedId): Plugin | undefined {
    // Check if plugin is enabled first
    if (!this.isPluginEnabled(id)) {
      return undefined;
    }

    // Track that we're attempting to load this plugin
    this.#trackPluginLoad(id);

    if (this.#loadedPlugins.has(id)) {
      return this.#loadedPlugins.get(id);
    }

    try {
      const factory = this.#pluginFactories.get(id);
      if (factory) {
        const plugin = factory();
        this.#loadedPlugins.set(id, plugin);
        this.#markPluginLoaded(id);
        return plugin;
      }
    } catch (error) {
      this.#markPluginFailed(
        id,
        error instanceof Error ? error : new Error(String(error)),
      );
    }

    return undefined;
  }

  getPlugin(id: NamespacedId): Plugin | undefined {
    return this.#loadedPlugins.get(id);
  }

  getPlugins(): Plugin[] {
    return Array.from(this.#loadedPlugins.values());
  }

  getPluginState(id: NamespacedId): PluginState | undefined {
    return this.#pluginStates.get(id);
  }

  getRemoteModule(pluginId: NamespacedId): RemoteModule | undefined {
    return Array.from(this.#remoteModules.values()).find(
      (m) => m.pluginId === pluginId,
    );
  }

  hasCapability(type: string): boolean {
    return Array.from(this.#loadedPlugins.values()).some((plugin) =>
      plugin.capabilities?.some((cap) => cap.type === type),
    );
  }

  hasDependencies(plugin: Plugin): boolean {
    if (!plugin.dependencies) return true;

    return plugin.dependencies.every((dep) => this.#loadedPlugins.has(dep.id));
  }

  hasFeature(id: NamespacedId): boolean {
    return Array.from(this.#loadedPlugins.values()).some((plugin) =>
      plugin.features?.some((f) => f.id === id),
    );
  }

  async initializePlugins() {
    const failures = new Map<string, Error>();
    const order = this.getInitializationOrder();

    if (!order || !Array.isArray(order)) {
      return failures;
    }

    for (const pluginId of order) {
      // Skip disabled plugins
      if (!this.isPluginEnabled(pluginId)) {
        continue;
      }

      const plugin = this.#loadedPlugins.get(pluginId);
      if (!plugin?.initialize) continue;

      // Defensive check for plugin interface compliance
      const pluginValidationResult = validatePluginDetailed(plugin);
      if (!pluginValidationResult.isValid) {
        const error = new PluginLoadError(
          pluginId,
          new Error(
            `Plugin ${pluginId} does not comply with Plugin interface. Missing: ${pluginValidationResult.missingProperties.join(", ")}`,
          ),
        );
        failures.set(pluginId, error);
        this.#markPluginFailed(pluginId, error);
        continue;
      }

      // Check if dependencies are initialized
      const deps = plugin.dependencies ?? [];
      const unreadyDeps = deps.filter((dep) => {
        // Only check deps that are enabled
        if (!this.isPluginEnabled(dep.id)) {
          return false;
        }
        const state = this.#pluginStates.get(dep.id);
        return state?.initState !== "initialized";
      });

      if (unreadyDeps.length > 0) {
        const error = new PluginLoadError(
          pluginId,
          new Error(
            `Dependencies not ready: ${unreadyDeps
              .map((d) => d.id)
              .join(", ")}`,
          ),
        );
        failures.set(pluginId, error);
        this.#markPluginFailed(pluginId, error);
        continue;
      }

      try {
        this.#markPluginInitializing(pluginId);

        // Initialize the plugin and ensure state is updated
        await plugin.initialize(this.framework);
        this.#markPluginInitialized(pluginId);
      } catch (error) {
        const pluginError = new PluginInitError(
          pluginId,
          error instanceof Error ? error : new Error(String(error)),
        );
        failures.set(pluginId, pluginError);
        this.#markPluginFailed(pluginId, pluginError, true);
      }
    }

    return failures;
  }

  isPluginEnabled(id: NamespacedId): boolean {
    return this.#enabledPlugins.has(id);
  }

  isPluginReady(id: NamespacedId): boolean {
    const state = this.#pluginStates.get(id);
    return state?.loadState === "loaded" && state?.initState === "initialized";
  }

  async loadFeature(id: NamespacedId): Promise<FrameworkFeature> {
    validateNamespacedId(id);
    this.#trackFeatureLoad(id);

    if (this.#features.has(id)) {
      try {
        const existingFeature = await this.#features.get(id)!;
        this.#markFeatureLoaded(id);
        return existingFeature;
      } catch (error) {
        const cause = error instanceof Error ? error : new Error(String(error));
        const featureError = new FeatureLoadError(id, cause);
        this.#markFeatureFailed(id, featureError);
        this.#features.delete(id);
        throw featureError;
      }
    }

    try {
      const plugin = this.findPluginForFeature(id);
      if (!plugin) {
        throw new Error("No plugin provides this feature");
      }

      const feature = plugin.features?.find((f) => f.id === id);
      if (!feature) {
        throw new Error(`Plugin ${plugin.id} does not provide feature ${id}`);
      }

      // Defensive check for feature interface compliance
      const validationResult = validateFeatureDetailed(feature);
      if (!validationResult.isValid) {
        throw new Error(
          `Feature ${id} does not comply with FrameworkFeature interface. Missing: ${validationResult.missingProperties.join(", ")}`,
        );
      }

      const initializationPromise = feature
        .initialize(this.framework)
        .then(() => feature);
      this.#features.set(id, initializationPromise);

      const initializedFeature = await initializationPromise;
      this.#markFeatureLoaded(id);
      return initializedFeature;
    } catch (error) {
      const cause = error instanceof Error ? error : new Error(String(error));
      const featureError = new FeatureLoadError(id, cause);
      this.#markFeatureFailed(id, featureError);
      this.#features.delete(id);
      throw featureError;
    }
  }

  register(plugin: Plugin) {
    if (!validPlugin(plugin)) {
      throw new Error("Invalid plugin configuration");
    }

    // Validate routes if present
    if (plugin.routes) {
      this.ensureValidRoutes(plugin);
    }

    const pluginId = plugin.id;

    // Check if already registered as either factory or loaded plugin
    if (
      this.#pluginFactories.has(pluginId) ||
      this.#loadedPlugins.has(pluginId)
    ) {
      throw new Error(`Plugin ${pluginId} already registered`);
    }

    // Check plugin dependencies exist as either loaded plugins or registered factories
    if (plugin.dependencies?.length) {
      for (const dep of plugin.dependencies) {
        if (
          !this.#loadedPlugins.has(dep.id) &&
          !this.#pluginFactories.has(dep.id)
        ) {
          throw new Error(
            `Plugin ${pluginId}: Missing required plugin dependency: ${dep.id}`,
          );
        }
      }
    }

    // Check feature dependencies
    if (plugin.features) {
      for (const feature of plugin.features) {
        if (feature.dependencies) {
          for (const dep of feature.dependencies) {
            const depId = dep.id;
            // Check if any registered factory provides this feature
            const hasFeature = Array.from(this.#pluginFactories.values()).some(
              (factory) => {
                const plugin = factory();
                return plugin.features?.some((f) => f.id === depId);
              },
            );
            if (!hasFeature) {
              throw new Error(
                `Plugin ${pluginId}: Missing required feature dependency: ${depId}`,
              );
            }
          }
        }
      }
    }

    // Store as factory that returns this plugin instance
    this.#pluginFactories.set(pluginId, () => plugin);

    // Enable and activate the plugin
    this.enableAndActivatePlugin(pluginId);
  }
  registerFactory(id: NamespacedId, factory: () => Plugin) {
    this.#pluginFactories.set(id, factory);
  }

  registerRemoteModule(
    moduleId: string,
    entry: string,
    pluginId: NamespacedId,
  ) {
    this.#remoteModules.set(moduleId, { entry, moduleId, pluginId });
  }
  async retryFailedPlugins() {
    const failedPlugins = Array.from(this.#pluginStates.entries())
      .filter(
        ([_, state]) =>
          state.loadState === "failed" || state.initState === "failed",
      )
      .map(([id]) => id);

    for (const pluginId of failedPlugins) {
      try {
        await this.loadFeature(pluginId);
      } catch (error) {
        console.error(`Retry failed for plugin ${pluginId}:`, error);
      }
    }
  }

  async unregister(id: NamespacedId) {
    const plugin = this.#loadedPlugins.get(id);
    if (!plugin) return;

    // Cleanup features
    if (plugin.features) {
      for (const feature of plugin.features) {
        await this.#destroyFeature(feature.id);
      }
    }

    // Destroy plugin
    if (plugin.destroy) {
      await plugin.destroy(this.framework);
    }

    this.#loadedPlugins.delete(id);
    this.#pluginStates.delete(id);
  }

  async #destroyFeature(id: NamespacedId) {
    const feature = await this.#features.get(id);
    if (feature) {
      try {
        await feature.destroy(this.framework);
      } catch (error) {
        console.error(`Error destroying feature ${id}:`, error);
      } finally {
        this.#features.delete(id);
      }
    }
  }

  #markFeatureFailed(id: NamespacedId, error: Error): void {
    this.#featureStates.set(id, {
      error,
      state: "failed",
    });
  }

  #markFeatureLoaded(id: NamespacedId): void {
    this.#featureStates.set(id, {
      error: undefined,
      state: "loaded",
    });
  }

  #markPluginFailed(
    id: NamespacedId,
    error: Error,
    isInitFailure = false,
  ): void {
    const state = this.#pluginStates.get(id);
    this.#pluginStates.set(id, {
      ...state,
      error,
      initState: isInitFailure ? "failed" : state?.initState || "failed",
      loadState: "failed",
      retryCount: (state?.retryCount ?? 0) + 1,
    });
  }

  #markPluginInitialized(id: NamespacedId): void {
    const state = this.#pluginStates.get(id);
    if (state) {
      this.#pluginStates.set(id, {
        ...state,
        initState: "initialized",
      });
    }
  }

  #markPluginInitializing(id: NamespacedId): void {
    const state = this.#pluginStates.get(id);
    if (state) {
      this.#pluginStates.set(id, {
        ...state,
        initState: "initializing",
      });
    }
  }

  #markPluginLoaded(id: NamespacedId): void {
    const state = this.#pluginStates.get(id);
    this.#pluginStates.set(id, {
      ...state,
      initState: state?.initState || "pending",
      loadState: "loaded",
      retryCount: 0,
    });
  }

  #trackFeatureLoad(id: NamespacedId): void {
    this.#featureStates.set(id, {
      error: undefined,
      state: "loading",
    });
  }

  #trackPluginLoad(id: NamespacedId): void {
    this.#pluginStates.set(id, {
      initState: "pending",
      loadState: "loading",
      retryCount: 0,
    });
  }

  private ensureValidRoutes(plugin: Plugin) {
    if (!plugin.routes) return;

    const validateRoute = (route: RouteDefinition) => {
      if (!route.component) {
        throw new Error(
          `Route in plugin ${plugin.id} must specify a component export name`,
        );
      }

      if (typeof route.component !== "string") {
        throw new Error(
          `Route component in plugin ${plugin.id} must be a string (export name)`,
        );
      }

      if (route.id && typeof route.id === "string") {
        if (!isNamespacedId(route.id)) {
          throw new Error(
            `Route ID "${route.id}" in plugin ${plugin.id} must be a namespaced ID (format: "namespace:name")`,
          );
        }
      } else {
        // Auto-generate ID if not provided
        route.id = `${plugin.id}:${route.path || "index"}`;
      }

      if (route.children) {
        route.children.forEach(validateRoute);
      }
    };

    plugin.routes.forEach(validateRoute);
  }

  private findPluginForFeature(id: NamespacedId): Plugin | undefined {
    return Array.from(this.#loadedPlugins.values()).find((p) =>
      p.features?.some((f) => f.id === id),
    );
  }
  private validateFeatureModule(module: unknown): module is FrameworkFeature {
    return (
      module !== null &&
      typeof module === "object" &&
      "initialize" in module &&
      typeof (module as any).initialize === "function" &&
      "destroy" in module &&
      typeof (module as any).destroy === "function"
    );
  }
}

export function validPlugin(plugin: Plugin): boolean {
  try {
    validateNamespacedId(plugin.id);
    return true;
  } catch {
    return false;
  }
}
