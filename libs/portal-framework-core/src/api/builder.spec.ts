// Import mock helpers first since they're used in hoisted vi.mock calls
import { createMockCapabilityManager } from "@lumeweb/portal-test-util";
import { createMockPluginManager } from "@lumeweb/portal-test-util";
import { MOCK_PLUGINS } from "@lumeweb/portal-test-util";
import { loadRemote } from "@module-federation/enhanced/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createNamespacedId } from "../util/namespace";
import { getPluginInfo } from "../util/getPluginInfo";
import { Builder } from "./builder";
import { Framework } from "./framework";

// Mock dependencies
vi.mock("@module-federation/enhanced/runtime", () => ({
  loadRemote: vi.fn().mockResolvedValue({ default: () => ({}) }),
}));
vi.mock("../plugins/manager", () => ({
  PluginManager: vi.fn(createMockPluginManager),
}));
vi.mock("../capabilities/manager", () => ({
  CapabilityManager: vi.fn(createMockCapabilityManager),
}));
vi.mock("../util/getPluginInfo", () => ({
  getPluginInfo: vi.fn(),
}));

describe("Builder", () => {
  const mockPlugin = MOCK_PLUGINS.basic;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with app name", () => {
    const builder = new Builder("test-app");
    expect(builder).toBeInstanceOf(Builder);
  });

  describe("framework getter", () => {
    it("should build framework once", async () => {
      const builder = new Builder("test-app");
      const framework1 = await builder.framework;
      const framework2 = await builder.framework;
      expect(framework1).toBe(framework2);
    });
  });

  describe("registerPluginFactory", () => {
    it("should queue plugin factory registration", async () => {
      const builder = new Builder("test-app");
      const factory = () => mockPlugin;

      builder.registerPluginFactory(createNamespacedId("test", "plugin"), factory);

      // Trigger build to process the queued operation
      const framework = await builder.build();
      const mockPluginManager = framework.getPluginManager();
      expect(mockPluginManager.registerFactory).toHaveBeenCalledWith(
        createNamespacedId("test", "plugin"),
        factory,
      );
    });
  });

  describe("registerRemoteModule", () => {
    it("should load and register remote module", async () => {
      const mockModule = {
        default: () => ({ ...mockPlugin, id: createNamespacedId("test", "plugin") }),
      }; // Ensure the mock plugin has the correct ID
      vi.mocked(loadRemote).mockResolvedValue(mockModule);
      vi.mocked(getPluginInfo).mockReturnValue({ id: createNamespacedId("test", "plugin") });

      const builder = new Builder("test-app");
      await builder.registerRemoteModule(
        "http://example.com/remote.js",
        "remote-1",
      );
      // Trigger build to process the queued operation
      const framework = await builder.build();
      const mockPluginManager = framework.getPluginManager(); // Get the mock manager instance created during build

      expect(loadRemote).toHaveBeenCalledWith("remote-1");
      expect(mockPluginManager.registerRemoteModule).toHaveBeenCalledWith(
        "remote-1",
        "http://example.com/remote.js",
        createNamespacedId("test", "plugin"),
      );
      expect(mockPluginManager.registerFactory).toHaveBeenCalledWith(
        createNamespacedId("test", "plugin"),
        expect.any(Function),
      ); // Factory is the mod.default
      expect(mockPluginManager.enableAndActivatePlugin).toHaveBeenCalledWith(
        createNamespacedId("test", "plugin"),
      );
      // Wait for plugin to be loaded
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockPluginManager.registerFactory).toHaveBeenCalledWith(
        createNamespacedId("test", "plugin"),
        expect.any(Function)
      );
      expect(mockPluginManager.enableAndActivatePlugin).toHaveBeenCalledWith(
        createNamespacedId("test", "plugin")
      );
    });

    it("should handle failed remote module load", async () => {
      vi.mocked(loadRemote).mockRejectedValue(new Error("Load failed"));

      const builder = new Builder("test-app");
      builder.registerRemoteModule("bad-url", "remote-1");
      await expect(builder.build()).rejects.toThrow("Load failed");
    });
  });

  describe("build", () => {
    it("should create new manager instances", async () => {
      const builder = new Builder("test-app");
      const framework = await builder.build();

      expect(framework).toBeInstanceOf(Framework);
      expect(framework.getPluginManager()).toBeDefined();
    });

    it("should execute queued operations in order", async () => {
      const builder = new Builder("test-app");
      builder.registerPluginFactory(createNamespacedId("test", "plugin1"), () => ({
        ...mockPlugin,
        id: createNamespacedId("test", "plugin1"),
      }));
      builder.registerPluginFactory(createNamespacedId("test", "plugin2"), () => ({
        ...mockPlugin,
        id: createNamespacedId("test", "plugin2"),
      }));

      const framework = await builder.build();
      const pluginManager = framework.getPluginManager(); // Get the mock manager instance created during build

      // Verify registration calls were made in order
      const registerCalls = vi.mocked(pluginManager.registerFactory).mock.calls;
      expect(registerCalls).toHaveLength(2);
      expect(registerCalls[0][0]).toBe(createNamespacedId("test", "plugin1"));
      expect(registerCalls[1][0]).toBe(createNamespacedId("test", "plugin2"));
    });
  });
});
