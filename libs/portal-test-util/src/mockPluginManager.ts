import {
  Framework,
  Plugin,
  PluginManager,
} from "@lumeweb/portal-framework-core";
import { vi } from "vitest";

export const createMockPluginManager = () => {
  const mockInstance = {
    // Private fields (simulated)
    "#enabledPlugins": new Set<string>(),
    "#features": new Map<string, any>(),
    "#featureStates": new Map<string, any>(),
    "#loadedPlugins": new Map<string, Plugin>(),
    "#pluginFactories": new Map<string, Plugin>(),
    "#pluginStates": new Map<string, any>(),

    "#remoteModules": new Map<string, any>(),
    "_framework": null as any,
    "enableAndActivatePlugin": vi.fn((id: string) => {
      mockInstance.enabledPlugins.add(id);
    }),
    "enabledPlugins": new Set<string>(),
    "featureStates": new Map<string, any>(),
    "getEnabledPlugins": vi.fn(() => Array.from(mockInstance.enabledPlugins)),
    "getFeatureWithFallback": vi.fn(),
    "getOrActivatePlugin": vi.fn() as unknown as PluginManager["getOrActivatePlugin"],

    "getPlugins": vi.fn(() => {
      const plugins = [];
      for (const [id, plugin] of mockInstance.registeredFactories) {
        plugins.push({
          ...plugin,
          id // Ensure the plugin has the correct ID
        });
      }
      return plugins;
    }),
    "getPluginState": vi.fn(),
    "getRemoteModule": vi.fn().mockImplementation((pluginId: string) => {
      return Array.from(mockInstance.remoteModules.values()).find(
        (m) => m.pluginId === pluginId,
      );
    }),
    // Capability management
    "hasCapability": vi.fn(),
    // Initialization lifecycle
    "initializePlugins": vi.fn().mockResolvedValue(new Map()),

    "isPluginEnabled": vi.fn((id: string) =>
      mockInstance.enabledPlugins.has(id),
    ),
    "loadedPlugins": new Map<string, Plugin>(),

    // Feature management
    "loadFeature": vi.fn(),
    "pluginStates": new Map<string, any>(),

    // Public fields
    "registeredFactories": new Map<string, Plugin>(),
    // Core plugin management methods
    "registerFactory": vi.fn((id: string, plugin: Plugin) => {
      mockInstance.registeredFactories.set(id, plugin);
      mockInstance["#pluginFactories"].set(id, plugin);
      return plugin;
    }) as unknown as PluginManager["registerFactory"],

    // Remote module handling
    "registerRemoteModule": vi.fn(),
    "remoteModules": new Map<string, any>(),
    "retryFailedPlugins": vi.fn(),
  };

  // Mock implementation for getOrActivatePlugin (needed by Framework.initialize)
  mockInstance.getOrActivatePlugin.mockImplementation((id: string) => {
    if (!mockInstance.isPluginEnabled(id)) return undefined;
    if (mockInstance.loadedPlugins.has(id))
      return mockInstance.loadedPlugins.get(id);

    // Simulate activation: get plugin instance from registered factories
    const plugin = mockInstance.registeredFactories.get(id);
    if (!plugin) return undefined; // Plugin not registered

    try {
      mockInstance.loadedPlugins.set(id, plugin);
      return plugin;
    } catch (error) {
      console.error(`Error activating mock plugin ${id}:`, error);
      // In a real scenario, this would update state to 'failed'
      return undefined; // Activation failed
    }
  });

  // Add framework getter/setter
  Object.defineProperty(mockInstance, "framework", {
    enumerable: true,
    get: () => mockInstance._framework,
    set: (value) => {
      mockInstance._framework = value;
    },
  });

  return mockInstance as unknown as PluginManager & {
    // Expose private fields for testing
    "#enabledPlugins": Set<string>;
    "#features": Map<string, any>;
    "#featureStates": Map<string, any>;
    "#loadedPlugins": Map<string, Plugin>;
    "#pluginFactories": Map<string, () => Plugin>;
    "#pluginStates": Map<string, any>;
    "#remoteModules": Map<string, any>;
    "_framework": Framework | null;
  };
};
