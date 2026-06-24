import { createMockPluginManager } from "@lumeweb/portal-test-util";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Framework } from "../api/framework";
import type { NamespacedId } from "../types/namespace";
import type { BaseCapability } from "../types/capabilities";

import { CapabilityManager } from "./manager";

describe("CapabilityManager", () => {
  let manager: CapabilityManager;
  let mockFramework: Framework;
  // @ts-ignore
  let mockPluginManager: ReturnType<typeof createMockPluginManager>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetAllMocks();
    vi.clearAllMocks();
    // @ts-ignore
    mockPluginManager = createMockPluginManager();
    manager = new CapabilityManager();
    mockFramework = createMockFramework();
    manager.framework = mockFramework;
    consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createMockCapability = (
    id: NamespacedId,
    type: string,
    deps?: NamespacedId[],
  ): BaseCapability => ({
    dependencies: deps,
    destroy: vi.fn().mockResolvedValue(undefined),
    id,
    initialize: vi.fn().mockResolvedValue(undefined),
    status: "inactive",
    type,
  });

  const createMockFramework = (): Framework => {
    const mockInstance = {
      _appName: "mock-app",
      _createRemoteComponent: vi.fn(),
      _loadRemote: vi.fn(),
      appName: "mock-app",
      enablePlugin: vi.fn(),
      framework: {} as any,
      getCapabilitiesByType: vi.fn(),
      getCapability: vi.fn(),
      getFeature: vi.fn(),
      getPluginManager: vi.fn().mockReturnValue({
        getInitializationOrder: vi.fn().mockReturnValue([]),
        getPlugins: vi.fn().mockReturnValue([]),
        getRemoteModule: vi.fn(),
        isPluginEnabled: vi.fn().mockReturnValue(true),
      }) as any,
      getPlugins: vi.fn(),
      getWidgetRegistrations: vi.fn(),
      hasCapability: vi.fn(),
      initialize: vi.fn(),
      isFeatureAvailable: vi.fn(),
      isPluginEnabled: vi.fn(),
      loadFeature: vi.fn(),
      registerCapability: vi.fn(),
      resolvePluginModule: vi.fn(),
    };

    // Add private fields
    Object.defineProperties(mockInstance, {
      "#_framework": { value: null, writable: true },
      "#capabilities": { value: {} },
      "#plugins": { value: {} },
    });

    return mockInstance as unknown as Framework;
  };

  it("should register and retrieve capabilities", async () => {
    const cap1 = createMockCapability("cap1" as NamespacedId, "typeA");
    const cap2 = createMockCapability("cap2" as NamespacedId, "typeB", ["cap1" as NamespacedId]);

    manager.register(cap1, "plugin1");
    manager.register(cap2, "plugin2");

    // Initialize capabilities after registration
    await manager.initializeAll();

    expect(await manager.get("cap1" as NamespacedId)).toBe(cap1);
    expect(await manager.getAllOfType("typeB")).toEqual([
      expect.objectContaining({ id: "cap2" as NamespacedId }),
    ]);
  });

  it("should warn when registering a capability that is already registered", () => {
    const cap1 = createMockCapability("cap1" as NamespacedId, "typeA");
    const cap1_duplicate = createMockCapability("cap1" as NamespacedId, "typeA"); // Same ID

    manager.register(cap1, "plugin1");
    manager.register(cap1_duplicate, "plugin2"); // Attempt to re-register

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "Capability cap1 already registered by plugin plugin1. Plugin plugin2 attempted to re-register it.",
    );
    // Ensure the original capability is still the one registered — use manager.get() instead of private field access
    expect(manager.get("cap1" as NamespacedId)).resolves.toBe(cap1);
  });

  it("should initialize in dependency order", async () => {
    const cap1 = createMockCapability("cap1" as NamespacedId, "typeA");
    const cap2 = createMockCapability("cap2" as NamespacedId, "typeB", ["cap1" as NamespacedId]);

    manager.register(cap1, "plugin1");
    manager.register(cap2, "plugin2");

    const failures = await manager.initializeAll();
    expect(failures.size).toBe(0);
    expect(cap1.initialize).toHaveBeenCalled();
    expect(cap2.initialize).toHaveBeenCalledWith(mockFramework);
    expect(vi.mocked(cap1.initialize).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(cap2.initialize).mock.invocationCallOrder[0],
    );
  });

  it("should handle initialization errors", async () => {
    const error = new Error("Init failed");
    const cap1 = createMockCapability("cap1" as NamespacedId, "typeA");
    const cap2 = createMockCapability("cap2" as NamespacedId, "typeB", ["cap1" as NamespacedId]);
    vi.mocked(cap2.initialize).mockRejectedValue(error);

    // Mock console.error to suppress expected error output
    const originalError = console.error;
    console.error = vi.fn();

    try {
      manager.register(cap1, "plugin1");
      manager.register(cap2, "plugin2");

      const failures = await manager.initializeAll();
      expect(failures.get("cap2" as NamespacedId)).toBe(error);
      // Explicitly try to get the failed capability to consume the rejected promise
      // and assert that it rejects as expected.
      await expect(manager.get("cap2" as NamespacedId)).rejects.toThrow("Init failed");
    } finally {
      // Restore console.error
      console.error = originalError;
    }
  });

  it("should destroy in reverse order", async () => {
    const cap1 = createMockCapability("cap1" as NamespacedId, "typeA");
    const cap2 = createMockCapability("cap2" as NamespacedId, "typeB", ["cap1" as NamespacedId]);

    manager.register(cap1, "plugin1");
    manager.register(cap2, "plugin2");
    await manager.initializeAll();

    const failures = await manager.destroyAll();
    expect(failures.size).toBe(0);

    expect(cap2.destroy).toHaveBeenCalled();
    expect(cap1.destroy).toHaveBeenCalledWith(mockFramework);
    expect(vi.mocked(cap2.destroy).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(cap1.destroy).mock.invocationCallOrder[0],
    );
  });

  it("should handle dependency sorting with multiple types", async () => {
    const pluginOrder = ["plugin3", "plugin2", "plugin1"];
    const mockGetInitializationOrder = vi.fn().mockReturnValue(pluginOrder);
    mockFramework.getPluginManager = vi.fn().mockReturnValue({
      getInitializationOrder: mockGetInitializationOrder,
    });

    const caps = [
      createMockCapability("cap1" as NamespacedId, "typeA"),
      createMockCapability("cap2" as NamespacedId, "typeA"),
      createMockCapability("cap3" as NamespacedId, "typeB"),
    ];

    manager.register(caps[0], "plugin1");
    manager.register(caps[1], "plugin2");
    manager.register(caps[2], "plugin3");

    // Initialize capabilities to ensure they are ready for get/getAllOfType
    await manager.initializeAll();

    const results = await manager.getAllOfType("typeA");
    expect(results.map((c) => c.id)).toEqual(["cap2" as NamespacedId, "cap1" as NamespacedId]);
  });

  it("should handle capability dependencies across plugins", async () => {
    const cap1 = createMockCapability("cap1" as NamespacedId, "typeA");
    const cap2 = createMockCapability("cap2" as NamespacedId, "typeB", ["cap1" as NamespacedId]);
    const cap3 = createMockCapability("cap3" as NamespacedId, "typeC", ["cap2" as NamespacedId]);

    manager.register(cap1, "plugin1");
    manager.register(cap2, "plugin2");
    manager.register(cap3, "plugin3");

    // Initialize capabilities
    await manager.initializeAll();

    const sorted = await manager.getAllOfType("typeC");
    expect(sorted[0].id).toBe("cap3" as NamespacedId);
    expect(sorted[0].dependencies).toEqual(["cap2" as NamespacedId]);
  });
});
