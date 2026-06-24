import { loadRemote } from "@module-federation/enhanced/runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Plugin, PluginDependency, PluginModule } from "../types/plugin";

import { Framework } from "../api/framework";
import { FeatureLoadError } from "../errors";
import { BaseCapability } from "../types/capabilities";
import { NamespacedId } from "../types/plugin";
import { createNamespacedId, validateNamespacedId } from "../util/namespace";
import { PluginManager } from "./manager";

// Mock dependencies
vi.mock("@module-federation/enhanced/runtime", () => ({
  loadRemote: vi.fn(),
}));

const mockFramework = {} as Framework;

describe("PluginManager", () => {
  let manager: PluginManager;
  const mockPluginFactory = vi.fn(() => createMockPlugin("test:factory" as NamespacedId));
  const mockCapability: BaseCapability = {
    destroy: vi.fn().mockResolvedValue(undefined),
    id: "test:capability" as NamespacedId,
    initialize: vi.fn().mockResolvedValue(undefined),
    status: "inactive",
    type: "framework:test" as any,
  };

  beforeEach(() => {
    vi.resetAllMocks();
    vi.clearAllMocks();
    manager = new PluginManager();
    manager.framework = mockFramework;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -- Test Data Helpers --
  const createMockPlugin = (
    id: NamespacedId,
    deps?: PluginDependency[],
  ): Plugin => ({
    capabilities: [mockCapability],
    dependencies: deps,
    destroy: vi.fn().mockResolvedValue(undefined),
    features: [
      {
        destroy: vi.fn().mockResolvedValue(undefined),
        id: createNamespacedId("test", "feature"),
        initialize: vi.fn().mockResolvedValue(undefined),
        status: "enabled" as const,
      },
    ],
    id: id,
    initialize: vi.fn().mockResolvedValue(undefined),
  });

  const mockPluginModule = (plugin: Plugin): PluginModule =>
    ({
      default: () => plugin,
    }) as unknown as PluginModule;

  // -- Core Functionality Tests --
  it("should register and activate plugins", () => {
    const plugin = createMockPlugin("test:plugin" as NamespacedId);
    manager.register(plugin);

    const loadedPlugin = manager.getPlugin("test:plugin" as NamespacedId);
    expect(loadedPlugin).toBeDefined();
    expect(loadedPlugin?.id).toEqual(plugin.id);
    expect(manager.isPluginEnabled("test:plugin" as NamespacedId)).toBe(true);
  });

  it("should register plugin factories", () => {
    const factory = () => createMockPlugin("test:factory" as NamespacedId);
    manager.registerFactory("test:factory" as NamespacedId, factory);

    // Need to enable the plugin first
    manager.enablePlugin("test:factory" as NamespacedId);
    const plugin = manager.getOrActivatePlugin("test:factory" as NamespacedId);
    expect(plugin).toBeDefined();
    expect(plugin?.id).toBe("test:factory" as NamespacedId);
  });

  it("should handle failed plugin activation", () => {
    const error = new Error("Factory failed");
    const failingFactory = () => {
      throw error;
    };
    manager.registerFactory("test:failed" as NamespacedId, failingFactory);
    manager.enablePlugin("test:failed" as NamespacedId);

    expect(manager.getOrActivatePlugin("test:failed" as NamespacedId)).toBeUndefined();

    const failedPlugins = manager.getFailedPlugins();
    expect(failedPlugins).toContainEqual(
      expect.objectContaining({
        error: expect.any(Error),
        id: "test:failed",
      }),
    );
  });

  // -- Dependency Handling Tests --
  it("should enforce plugin dependencies", async () => {
    const depPlugin = createMockPlugin("test:dep" as NamespacedId);
    const mainPlugin = createMockPlugin("other:main" as NamespacedId, [{ id: "test:dep" as NamespacedId }]);

    manager.register(depPlugin);
    manager.register(mainPlugin);

    manager.enablePlugin("test:dep" as NamespacedId);
    manager.enablePlugin("other:main" as NamespacedId);
    const failures = await manager.initializePlugins();
    expect(manager.isPluginReady("other:main" as NamespacedId)).toBe(true);
    expect(failures.has("other:main")).toBe(false);
    expect(manager.getRegistry().has("test")).toBe(true);
    expect(manager.getRegistry().has("other")).toBe(true);
  });

  it("should detect missing dependencies", async () => {
    const mainPlugin = createMockPlugin("test:main" as NamespacedId, [{ id: "test:missing" as NamespacedId }]);

    expect(() => manager.register(mainPlugin)).toThrowError(
      "Plugin test:main: Missing required plugin dependency: test:missing",
    );
  });

  it("should detect plugin already registered", () => {
    const plugin1 = createMockPlugin("test:plugin" as NamespacedId);
    const plugin2 = createMockPlugin("test:plugin" as NamespacedId); // Same ID

    manager.register(plugin1);

    expect(() => manager.register(plugin2)).toThrowError(
      "Plugin test:plugin already registered",
    );
  });

  it("should detect missing feature dependencies", () => {
    const pluginWithFeatureDep = createMockPlugin(
      "test:plugin-with-feature-dep" as NamespacedId,
    );
    pluginWithFeatureDep.features = [
      {
        dependencies: [{ id: "test:missing-feature" as NamespacedId }],
        destroy: vi.fn(),
        id: "test:my-feature" as NamespacedId,
        initialize: vi.fn(),
        status: "enabled" as const,
      },
    ];

    expect(() => manager.register(pluginWithFeatureDep)).toThrowError(
      "Plugin test:plugin-with-feature-dep: Missing required feature dependency: test:missing-feature",
    );
  });

  // -- Feature Loading Tests --
  it("should load and track feature states", async () => {
    const plugin = createMockPlugin("test:plugin" as NamespacedId);
    manager.register(plugin);
    manager.enablePlugin(plugin.id);
    manager.getOrActivatePlugin(plugin.id); // Explicitly activate the plugin first

    // Use the ID from the mock feature
    const featureId = "test:feature" as NamespacedId;
    validateNamespacedId(featureId); // Ensure the ID is valid

    await expect(manager.loadFeature(featureId)).resolves.toBeDefined();
    await expect(
      manager.getFeatureWithFallback(featureId),
    ).resolves.toBeDefined();
  });

  it("should handle feature loading errors", async () => {
    const plugin = createMockPlugin("test:bad-feature" as NamespacedId);
    const featureId = "test:feature" as NamespacedId;
    plugin.features![0].id = featureId;

    // Mock the feature to throw during initialize
    const originalError = new Error("Feature failed during initialization");
    plugin.features![0] = {
      ...plugin.features![0],
      initialize: vi.fn().mockRejectedValue(originalError),
    };

    manager.register(plugin);
    manager.enablePlugin(plugin.id);

    // Activate plugin and load feature
    manager.getOrActivatePlugin(plugin.id);

    // The loadFeature promise should reject with FeatureLoadError
    await expect(manager.loadFeature(featureId)).rejects.toBeInstanceOf(
      FeatureLoadError,
    );

    // Verify feature state is marked as failed with the wrapper error
    const featureState = manager.getFeatureState(featureId);
    expect(featureState?.state).toBe("failed");
    expect(featureState?.error).toBeInstanceOf(FeatureLoadError);
    expect(featureState?.error?.message).toBe(
      `Failed to load feature: ${featureId}`,
    );
    expect((featureState?.error as any).cause).toBe(originalError);

    // Verify feature was removed from the features map
    await expect(manager.getFeature(featureId)).resolves.toBeUndefined();

    // Verify getFeatureWithFallback returns undefined for failed feature
    await expect(
      manager.getFeatureWithFallback(featureId),
    ).resolves.toBeUndefined();

    // Verify initialize was called
    expect(plugin.features![0].initialize).toHaveBeenCalledTimes(1);
  });

  // -- Remote Module Tests --
  it("should register remote modules", async () => {
    const plugin = createMockPlugin("test:remote" as NamespacedId);
    const mockEntry = "http://example.com/remote.js";
    const mockModule = { default: () => plugin };

    const loadRemoteMock = vi.mocked(loadRemote);
    loadRemoteMock.mockResolvedValue(mockModule);

    manager.registerRemoteModule("test-module", mockEntry, "test:remote" as NamespacedId);

    const module = manager.remoteModules.get("test-module");
    expect(module).toEqual({
      entry: mockEntry,
      moduleId: "test-module",
      pluginId: "test:remote" as NamespacedId,
    });
  });

  // -- Route Validation Tests --
  describe("route validation", () => {
    it("should reject routes with non-namespaced IDs", () => {
      const plugin = createMockPlugin("test:routes-validation" as NamespacedId);
      plugin.routes = [
        {
          component: "HomePage",
          id: "home", // Invalid - not namespaced
          path: "/",
        },
      ] as any;

      expect(() => manager.register(plugin)).toThrowError(
        'Route ID "home" in plugin test:routes-validation must be a namespaced ID',
      );
    });

    it("should accept routes with valid namespaced IDs", () => {
      const plugin = createMockPlugin("test:routes-validation" as NamespacedId);
      plugin.routes = [
        {
          component: "HomePage",
          id: "test:home" as NamespacedId, // Valid namespaced ID
          path: "/",
        },
      ];
      expect(() => manager.register(plugin)).not.toThrow();
    });

    it("should reject routes without an ID", () => {
      const plugin = createMockPlugin("test:routes-validation" as NamespacedId);
      plugin.routes = [
        {
          component: "HomePage",
          path: "/",
        },
      ] as any;
      expect(() => manager.register(plugin)).toThrowError(
        "missing a route ID",
      );
    });
  });

  // -- Lifecycle Tests --
  it("should handle plugin destruction", async () => {
    const plugin = createMockPlugin("test:destruction" as NamespacedId);
    manager.register(plugin);
    await manager.initializePlugins();

    await manager.destroyPlugin("test:destruction" as NamespacedId);
    expect(plugin.destroy).toHaveBeenCalled();
    expect(manager.getPlugin("test:destruction" as NamespacedId)).toBeUndefined();
  });

  // -- Error Handling Tests --
  it("should track failed plugins", async () => {
    const plugin = createMockPlugin("test:failed-init" as NamespacedId);
    plugin.initialize.mockRejectedValue(new Error("Init failed"));
    manager.register(plugin);
    manager.enablePlugin(plugin.id);

    const failures = await manager.initializePlugins();
    expect(failures.has("test:failed-init")).toBe(true);
    expect(manager.getPluginState("test:failed-init" as NamespacedId)?.initState).toBe(
      "failed",
    );
  });

  // -- Capability Tests --
  it("should expose plugin capabilities", () => {
    const plugin = createMockPlugin("test:caps" as NamespacedId);
    manager.register(plugin);

    expect(manager.hasCapability("framework:test")).toBe(true);
    expect(manager.hasCapability("missing")).toBe(false);
  });

  // -- Initialization Order Tests --
  it("should sort plugins topologically", () => {
    const a = createMockPlugin("alpha:a" as NamespacedId);
    const b = createMockPlugin("beta:b" as NamespacedId, [{ id: "alpha:a" as NamespacedId }]);
    manager.register(a);
    manager.register(b);

    const order = manager.getInitializationOrder();
    expect(order).toEqual(["alpha:a", "beta:b",]); // a should come first since b depends on it
    expect(manager.getRegistry().getPluginId("alpha")).toBe("alpha:a");
    expect(manager.getRegistry().getPluginId("beta")).toBe("beta:b");
  });
});
