import { createMockCapabilityManager } from "@lumeweb/portal-test-util";
import { createMockPluginManager } from "@lumeweb/portal-test-util";
import { createMockSdkCapability } from "@lumeweb/portal-test-util";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CORE_NS, createNamespacedId } from "../util/namespace";
import { Framework } from "./framework";
import { ERROR_CATEGORIES } from "../types/api";

describe("Framework", () => {
  const mockSdkCapability = createMockSdkCapability();
  let framework: Framework;
  let mockPluginManager: ReturnType<typeof createMockPluginManager>;
  let mockCapabilityManager: ReturnType<typeof createMockCapabilityManager>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>; // Declare spy variable

  beforeEach(() => {
    vi.resetAllMocks();
    vi.clearAllMocks();
    mockPluginManager = createMockPluginManager();
    mockCapabilityManager = createMockCapabilityManager();
    framework = new Framework(
      mockCapabilityManager,
      mockPluginManager,
      "test-app",
    );
    // Spy on console.warn for all tests in this suite
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    consoleWarnSpy.mockRestore(); // Restore the spy after each test
  });

  it("should get capabilities by type", async () => {
    mockCapabilityManager.getAllOfType = vi
      .fn()
      .mockResolvedValue([mockSdkCapability]);
    const result = await framework.getCapabilitiesByType("core:sdk");
    expect(result).toEqual([mockSdkCapability]);
    expect(mockCapabilityManager.getAllOfType).toHaveBeenCalledWith("core:sdk");
  });

  it("should get individual capability", async () => {
    mockCapabilityManager.get = vi.fn().mockResolvedValue(mockSdkCapability);
    const result = await framework.getCapability("core:sdk");
    expect(result).toEqual(mockSdkCapability);
    expect(mockCapabilityManager.get).toHaveBeenCalledWith("core:sdk");
  });

  it("should get plugin manager", () => {
    expect(framework.getPluginManager()).toBe(mockPluginManager);
  });

  it("should auto-register widgets from plugins during initialization", async () => {
    const mockWidget = {
      areaId: "dashboard",
      componentName: "TestWidget",
      id: "test-widget",
      pluginId: "test:plugin",
      position: {
        location: {
          column: 1,
        },
        size: {
          height: 1,
          width: 2,
        },
      },
    };

    mockPluginManager.getPlugins = vi.fn().mockReturnValue([
      {
        features: [],
        id: "test:plugin",
        widgets: {
          areas: [{ grid: { columns: 12 }, id: "dashboard" }],
          widgets: [mockWidget],
        },
      },
    ]);

    mockPluginManager.initializePlugins = vi.fn().mockResolvedValue(new Map());
    mockCapabilityManager.initializeAll = vi.fn().mockResolvedValue(new Map());

    await framework.initialize();

    // Verify widget area was registered
    expect(framework.getWidgetArea("dashboard")).toEqual({
      grid: { columns: 12 },
      id: "dashboard",
    });

    // Verify widget was registered
    const widgets = framework.getWidgetsForArea("dashboard");
    expect(widgets).toHaveLength(1);
    expect(widgets[0].id).toBe("test-widget");
  });

  it("should check capability existence", () => {
    mockPluginManager.hasCapability = vi.fn().mockReturnValue(true);
    expect(framework.hasCapability("core:sdk")).toBe(true);
    expect(mockPluginManager.hasCapability).toHaveBeenCalledWith("core:sdk");
  });

  describe("initialize", () => {
    it("should initialize plugins and capabilities", async () => {
      mockPluginManager.initializePlugins = vi
        .fn()
        .mockResolvedValue(new Map());
      mockCapabilityManager.initializeAll = vi
        .fn()
        .mockResolvedValue(new Map());

      const result = await framework.initialize();
      expect(result.success).toBe(true);
      expect(mockPluginManager.initializePlugins).toHaveBeenCalled();
      expect(mockCapabilityManager.initializeAll).toHaveBeenCalled();
    });

    it("should aggregate initialization errors", async () => {
      const pluginError = new Error("Plugin error");
      const capabilityError = new Error("Capability error");

      mockPluginManager.initializePlugins = vi
        .fn()
        .mockResolvedValue(new Map([["plugin:error", pluginError]]));
      mockCapabilityManager.initializeAll = vi
        .fn()
        .mockResolvedValue(new Map([["cap:error", capabilityError]]));

      const result = await framework.initialize();
      expect(result.success).toBe(false);
      expect(result.failures).toEqual([
        expect.objectContaining({ category: ERROR_CATEGORIES.PLUGIN, error: pluginError }),
        expect.objectContaining({
          category: ERROR_CATEGORIES.CAPABILITY,
          error: capabilityError,
        }),
      ]);
    });
  });

  it("should only initialize plugins and capabilities once", async () => {
    const mockPluginInitialize = vi.fn().mockResolvedValue(undefined);
    const mockCapabilityInitialize = vi.fn().mockResolvedValue(undefined);

    mockPluginManager.initializePlugins = vi.fn().mockResolvedValue(new Map());
    mockCapabilityManager.initializeAll = vi.fn().mockResolvedValue(new Map());

    // Mock getPlugins to return a plugin with initialize method
    mockPluginManager.getPlugins = vi.fn().mockReturnValue([
      {
        features: [], // Add features array to avoid errors in Framework.initialize loop
        id: "test:plugin",
        initialize: mockPluginInitialize,
      },
    ]);
    // Mock getEnabledPlugins to include the test plugin
    mockPluginManager.getEnabledPlugins = vi
      .fn()
      .mockReturnValue(["test:plugin"]);
    // Mock getOrActivatePlugin to return the test plugin
    mockPluginManager.getOrActivatePlugin = vi.fn().mockReturnValue({
      features: [],
      id: "test:plugin",
      initialize: mockPluginInitialize,
    });

    // First initialization
    const result1 = await framework.initialize();
    expect(result1.success).toBe(true);
    expect(mockPluginManager.initializePlugins).toHaveBeenCalledTimes(1);
    expect(mockCapabilityManager.initializeAll).toHaveBeenCalledTimes(1);
    // The plugin's initialize method should be called as part of pluginManager.initializePlugins
    // We don't directly assert mockPluginInitialize here as it's called internally by PluginManager

    // Second initialization attempt
    const result2 = await framework.initialize();
    expect(result2.success).toBe(true);
    // Verify that initializePlugins and initializeAll were NOT called again
    expect(mockPluginManager.initializePlugins).toHaveBeenCalledTimes(1);
    expect(mockCapabilityManager.initializeAll).toHaveBeenCalledTimes(1);
    // Verify the plugin's initialize method was NOT called again
    expect(mockPluginInitialize).toHaveBeenCalledTimes(0); // PluginManager.initializePlugins calls this

    // Check console warning for re-initialization using the global spy
    await framework.initialize(); // Third attempt
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Framework for test-app already initialized."),
    );
    // Also verify the public getter works as expected
    expect(framework.isInitialized()).toBe(true);
  });

  it("should resolve plugin modules", () => {
    const mockModule: any = {
      entry: "http://example.com/remote.js",
      moduleId: "remote-1",
      pluginId: createNamespacedId(CORE_NS, "plugin"),
    };
    mockPluginManager.getRemoteModule = vi.fn().mockReturnValue(mockModule);

    const result = framework.resolvePluginModule(createNamespacedId(CORE_NS, "plugin"), "ComponentA");
    expect(result).toBe("remote-1/ComponentA");
    expect(mockPluginManager.getRemoteModule).toHaveBeenCalledWith(
      createNamespacedId(CORE_NS, "plugin"),
    );
  });

  it("should load features", async () => {
    const mockFeature = {
      destroy: vi.fn(),
      id: createNamespacedId(CORE_NS, "feature"),
      initialize: vi.fn(),
    };
    mockPluginManager.loadFeature = vi.fn().mockResolvedValue(mockFeature);

    const result = await framework.loadFeature(createNamespacedId(CORE_NS, "feature"));
    expect(result).toBe(mockFeature);
    expect(mockPluginManager.loadFeature).toHaveBeenCalledWith(createNamespacedId(CORE_NS, "feature"));
  });

  it("should register capabilities", () => {
    framework.registerCapability(mockSdkCapability, createNamespacedId(CORE_NS, "plugin"));
    expect(mockCapabilityManager.register).toHaveBeenCalledWith(
      mockSdkCapability,
      createNamespacedId(CORE_NS, "plugin"),
    );
  });
});
