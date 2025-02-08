import { createMockCapabilityManager } from "@lumeweb/portal-test-util";
import { createMockPluginManager } from "@lumeweb/portal-test-util";
import { createMockSdkCapability } from "@lumeweb/portal-test-util";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { Framework } from "./framework";

describe("Framework", () => {
  const mockSdkCapability = createMockSdkCapability();
  let framework: Framework;
  let mockPluginManager: ReturnType<typeof createMockPluginManager>;
  let mockCapabilityManager: ReturnType<typeof createMockCapabilityManager>;
  let consoleWarnSpy: vi.SpyInstance; // Declare spy variable

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
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
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

  it("should get widget registrations", () => {
    const mockWidgets = [
      { componentName: "WidgetA", pluginId: "core:widgets" },
    ];
    mockPluginManager.getPlugins = vi.fn().mockReturnValue([
      {
        id: "core:widgets",
        widgetRegistrations: [{ area: "dashboard", componentName: "WidgetA" }],
      },
    ]);

    const result = framework.getWidgetRegistrations("dashboard");
    expect(result).toEqual(mockWidgets);
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
        expect.objectContaining({ category: "plugin", error: pluginError }),
        expect.objectContaining({
          category: "capability",
          error: capabilityError,
        }),
      ]);
    });
  });

  it("should only initialize plugins and capabilities once", async () => {
    const mockPluginInitialize = vi.fn().mockResolvedValue(undefined);
    const mockCapabilityInitialize = vi.fn().mockResolvedValue(undefined);

    mockPluginManager.initializePlugins = vi
      .fn()
      .mockResolvedValue(new Map());
    mockCapabilityManager.initializeAll = vi
      .fn()
      .mockResolvedValue(new Map());

    // Mock getPlugins to return a plugin with initialize method
    mockPluginManager.getPlugins = vi.fn().mockReturnValue([
      {
        id: "test:plugin",
        initialize: mockPluginInitialize,
        features: [], // Add features array to avoid errors in Framework.initialize loop
      },
    ]);
    // Mock getEnabledPlugins to include the test plugin
    mockPluginManager.getEnabledPlugins = vi.fn().mockReturnValue(["test:plugin"]);
    // Mock getOrActivatePlugin to return the test plugin
    mockPluginManager.getOrActivatePlugin = vi.fn().mockReturnValue({
       id: "test:plugin",
       initialize: mockPluginInitialize,
       features: [],
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
      expect.stringContaining("Framework for test-app already initialized.")
    );
    // Also verify the public getter works as expected
    expect(framework.isInitialized()).toBe(true);
  });


  it("should resolve plugin modules", () => {
    const mockModule: any = {
      entry: "http://example.com/remote.js",
      moduleId: "remote-1",
      pluginId: "core:plugin",
    };
    mockPluginManager.getRemoteModule = vi.fn().mockReturnValue(mockModule);

    const result = framework.resolvePluginModule("core:plugin", "ComponentA");
    expect(result).toBe("remote-1/ComponentA");
    expect(mockPluginManager.getRemoteModule).toHaveBeenCalledWith(
      "core:plugin",
    );
  });

  it("should load features", async () => {
    const mockFeature = {
      destroy: vi.fn(),
      id: "core:feature",
      initialize: vi.fn(),
    };
    mockPluginManager.loadFeature = vi.fn().mockResolvedValue(mockFeature);

    const result = await framework.loadFeature("core:feature");
    expect(result).toBe(mockFeature);
    expect(mockPluginManager.loadFeature).toHaveBeenCalledWith("core:feature");
  });

  it("should register capabilities", () => {
    framework.registerCapability(mockSdkCapability, "core:plugin");
    expect(mockCapabilityManager.register).toHaveBeenCalledWith(
      mockSdkCapability,
      "core:plugin",
    );
  });
});
