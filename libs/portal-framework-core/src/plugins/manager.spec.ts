import { loadRemote } from "@module-federation/enhanced/runtime";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Plugin, PluginDependency, PluginModule } from "../types/plugin";

import { Framework } from "../api/framework";
import { FeatureLoadError } from "../errors";
import { BaseCapability } from "../types/capabilities";
import { NamespacedId } from "../types/plugin";
import { validateNamespacedId } from "../util/namespace";
import { PluginManager } from "./manager";

// Mock dependencies
vi.mock("@module-federation/enhanced/runtime", () => ({
  loadRemote: vi.fn(),
}));

const mockFramework = {} as Framework;

describe("PluginManager", () => {
  let manager: PluginManager;
  const mockPluginFactory = vi.fn(() => createMockPlugin("test:factory"));
  const mockCapability: BaseCapability = {
    destroy: vi.fn().mockResolvedValue(undefined),
    id: "test:capability",
    initialize: vi.fn().mockResolvedValue(undefined),
    status: "inactive",
    type: "test",
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
        id: "test:feature" as NamespacedId,
        initialize: vi.fn().mockResolvedValue(undefined),
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
    const plugin = createMockPlugin("test:plugin");
    manager.register(plugin);

    const loadedPlugin = manager.getPlugin("test:plugin");
    expect(loadedPlugin).toBeDefined();
    expect(loadedPlugin?.id).toEqual(plugin.id);
    expect(manager.isPluginEnabled("test:plugin")).toBe(true);
  });

  it("should register plugin factories", () => {
    const factory = () => createMockPlugin("test:factory");
    manager.registerFactory("test:factory", factory);

    // Need to enable the plugin first
    manager.enablePlugin("test:factory");
    const plugin = manager.getOrActivatePlugin("test:factory");
    expect(plugin).toBeDefined();
    expect(plugin?.id).toBe("test:factory");
  });

  it("should handle failed plugin activation", () => {
    const error = new Error("Factory failed");
    const failingFactory = () => {
      throw error;
    };
    manager.registerFactory("test:failed", failingFactory);
    manager.enablePlugin("test:failed");

    expect(manager.getOrActivatePlugin("test:failed")).toBeUndefined();

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
    const depPlugin = createMockPlugin("test:dep");
    const mainPlugin = createMockPlugin("test:main", [{ id: "test:dep" }]);

    manager.register(depPlugin);
    manager.register(mainPlugin);

    manager.enablePlugin("test:dep");
    manager.enablePlugin("test:main");
    const failures = await manager.initializePlugins();
    expect(manager.isPluginReady("test:main")).toBe(true);
    expect(failures.has("test:main")).toBe(false);
  });

  it("should detect missing dependencies", async () => {
    const mainPlugin = createMockPlugin("test:main", [{ id: "test:missing" }]);

    expect(() => manager.register(mainPlugin)).toThrowError(
      "Plugin test:main: Missing required plugin dependency: test:missing",
    );
  });

  it("should detect plugin already registered", () => {
    const plugin1 = createMockPlugin("test:plugin");
    const plugin2 = createMockPlugin("test:plugin"); // Same ID

    manager.register(plugin1);

    expect(() => manager.register(plugin2)).toThrowError(
      "Plugin test:plugin already registered",
    );
  });

  it("should detect missing feature dependencies", () => {
    const pluginWithFeatureDep = createMockPlugin("test:plugin-with-feature-dep");
    pluginWithFeatureDep.features = [
      {
        id: "test:my-feature" as NamespacedId,
        dependencies: [{ id: "test:missing-feature" as NamespacedId }],
        initialize: vi.fn(),
        destroy: vi.fn(),
      },
    ];

    expect(() => manager.register(pluginWithFeatureDep)).toThrowError(
      "Plugin test:plugin-with-feature-dep: Missing required feature dependency: test:missing-feature",
    );
  });


  // -- Feature Loading Tests --
  it("should load and track feature states", async () => {
    const plugin = createMockPlugin("test:plugin");
    manager.register(plugin);
    manager.enablePlugin(plugin.id);
    manager.getOrActivatePlugin(plugin.id); // Explicitly activate the plugin first

    // Use the ID from the mock feature
    const featureId = "test:feature";
    validateNamespacedId(featureId); // Ensure the ID is valid

    await expect(manager.loadFeature(featureId)).resolves.toBeDefined();
    await expect(
      manager.getFeatureWithFallback(featureId),
    ).resolves.toBeDefined();
  });

  it("should handle feature loading errors", async () => {
    const plugin = createMockPlugin("test:bad-feature");
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
    const plugin = createMockPlugin("test:remote");
    const mockEntry = "http://example.com/remote.js";
    const mockModule = { default: () => plugin };

    const loadRemoteMock = vi.mocked(loadRemote);
    loadRemoteMock.mockResolvedValue(mockModule);

    manager.registerRemoteModule("test-module", mockEntry, "test:remote");

    const module = manager.remoteModules.get("test-module");
    expect(module).toEqual({
      entry: mockEntry,
      moduleId: "test-module",
      pluginId: "test:remote",
    });
  });

  // -- Route Validation Tests --
  describe("route validation", () => {
    it("should reject routes with non-namespaced IDs", () => {
      const plugin = createMockPlugin("test:routes-validation");
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
      const plugin = createMockPlugin("test:routes-validation");
      plugin.routes = [
        {
          component: "HomePage",
          id: "test:home", // Valid namespaced ID
          path: "/",
        },
      ];
      expect(() => manager.register(plugin)).not.toThrow();
    });

    it("should auto-generate namespaced route IDs when not provided", () => {
      const plugin = createMockPlugin("test:routes-validation");
      plugin.routes = [
        {
          component: "HomePage",
          path: "/",
        },
      ];
      expect(() => manager.register(plugin)).not.toThrow();
      expect(plugin.routes[0].id).toBe("test:routes-validation:/");
    });
  });

  // -- Lifecycle Tests --
  it("should handle plugin destruction", async () => {
    const plugin = createMockPlugin("test:destruction");
    manager.register(plugin);
    await manager.initializePlugins();

    await manager.destroyPlugin("test:destruction");
    expect(plugin.destroy).toHaveBeenCalled();
    expect(manager.getPlugin("test:destruction")).toBeUndefined();
  });

  // -- Error Handling Tests --
  it("should track failed plugins", async () => {
    const plugin = createMockPlugin("test:failed-init");
    plugin.initialize.mockRejectedValue(new Error("Init failed"));
    manager.register(plugin);
    manager.enablePlugin(plugin.id);

    const failures = await manager.initializePlugins();
    expect(failures.has("test:failed-init")).toBe(true);
    expect(manager.getPluginState("test:failed-init")?.initState).toBe(
      "failed",
    );
  });

  // -- Capability Tests --
  it("should expose plugin capabilities", () => {
    const plugin = createMockPlugin("test:caps");
    manager.register(plugin);

    expect(manager.hasCapability("test")).toBe(true);
    expect(manager.hasCapability("missing")).toBe(false);
  });

  // -- Initialization Order Tests --
  it("should sort plugins topologically", () => {
    const a = createMockPlugin("test:a");
    const b = createMockPlugin("test:b", [{ id: "test:a" }]);
    manager.register(a);
    manager.register(b);

    const order = manager.getInitializationOrder();
    expect(order).toEqual(["test:a", "test:b"]); // a should come first since b depends on it
  });
});
