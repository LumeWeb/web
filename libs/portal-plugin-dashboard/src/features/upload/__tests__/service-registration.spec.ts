import { beforeEach, describe, expect, it, vi } from "vitest";

import type { PluginConfig, ServiceConfig } from "@/types/upload";

import { Manager } from "../Manager";
import { validateServiceConfig } from "../validation";

// Mock the validation module
vi.mock("../validation", async (importOriginal) => {
  const actual = (await importOriginal()) as any;
  return {
    ...actual,
    ServiceConfigValidationError: actual.ServiceConfigValidationError,
    validateServiceConfig: vi.fn(),
  };
});

// Mock Uppy constructor and methods
const mockUppy = {
  cancelAll: vi.fn(),
  emit: vi.fn(),
  getFiles: vi.fn().mockReturnValue([]),
  iteratePlugins: vi.fn(),
  off: vi.fn(),
  on: vi.fn(),
  patchFilesState: vi.fn(),
  removePlugin: vi.fn(),
  retryUpload: vi.fn(),
  use: vi.fn(),
};

vi.mock("@uppy/core", () => ({
  default: vi.fn().mockImplementation(() => mockUppy),
}));

describe("Service Registration and Capability Detection", () => {
  let uploadManager: Manager;
  const mockSmallPlugin = vi.fn();
  const mockLargePlugin = vi.fn();
  const mockFolderBundlerPlugin = vi.fn();

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create new upload manager instance
    uploadManager = new Manager({
      type: "main",
    });
  });

  describe("registerService", () => {
    const validServiceConfig: ServiceConfig = {
      id: "test-service",
      largeFilePlugin: {
        options: { endpoint: "/upload/large" },
        plugin: mockLargePlugin,
      },
      name: "Test Service",
      smallFilePlugin: {
        options: { endpoint: "/upload/small" },
        plugin: mockSmallPlugin,
      },
    };

    it("should register a service without folder bundler plugin", () => {
      const config = { ...validServiceConfig };

      uploadManager.registerService(config);

      expect(validateServiceConfig).toHaveBeenCalledWith(config);
      expect(mockUppy.use).toHaveBeenCalledTimes(2);
      expect(mockUppy.use).toHaveBeenCalledWith(mockSmallPlugin, {
        ...config.smallFilePlugin.options,
        id: "test-service-small",
      });
      expect(mockUppy.use).toHaveBeenCalledWith(mockLargePlugin, {
        ...config.largeFilePlugin.options,
        id: "test-service-large",
      });
    });

    it("should register a service with folder bundler plugin", () => {
      const config: ServiceConfig = {
        ...validServiceConfig,
        folderBundlerPlugin: {
          options: { bundle: true },
          plugin: mockFolderBundlerPlugin,
        },
      };

      uploadManager.registerService(config);

      expect(validateServiceConfig).toHaveBeenCalledWith(config);
      expect(mockUppy.use).toHaveBeenCalledTimes(3);
      expect(mockUppy.use).toHaveBeenCalledWith(mockSmallPlugin, {
        ...config.smallFilePlugin.options,
        id: "test-service-small",
      });
      expect(mockUppy.use).toHaveBeenCalledWith(mockLargePlugin, {
        ...config.largeFilePlugin.options,
        id: "test-service-large",
      });
      expect(mockUppy.use).toHaveBeenCalledWith(mockFolderBundlerPlugin, {
        ...config.folderBundlerPlugin.options,
        id: "test-service-folder-bundler",
      });
    });

    it("should store service configuration", () => {
      const config = { ...validServiceConfig };

      uploadManager.registerService(config);

      const services = uploadManager.getServices();
      expect(services.length).toBe(1);
      expect(services[0]).toEqual(config);
    });

    it("should handle multiple service registrations", () => {
      const config1 = { ...validServiceConfig, id: "service-1" };
      const config2 = { ...validServiceConfig, id: "service-2" };

      uploadManager.registerService(config1);
      uploadManager.registerService(config2);

      const services = uploadManager.getServices();
      expect(services.length).toBe(2);
      expect(services.find((s) => s.id === "service-1")).toBeDefined();
      expect(services.find((s) => s.id === "service-2")).toBeDefined();
    });
  });

  describe("serviceSupportsFolderUpload", () => {
    it("should return false for non-existent service", () => {
      const supportsFolderUpload =
        uploadManager.serviceSupportsFolderUpload("non-existent");
      expect(supportsFolderUpload).toBe(false);
    });

    it("should return false for service without folder bundler plugin", () => {
      const config: ServiceConfig = {
        id: "test-service",
        largeFilePlugin: {
          options: {},
          plugin: mockLargePlugin,
        },
        name: "Test Service",
        smallFilePlugin: {
          options: {},
          plugin: mockSmallPlugin,
        },
      };

      uploadManager.registerService(config);

      const supportsFolderUpload =
        uploadManager.serviceSupportsFolderUpload("test-service");
      expect(supportsFolderUpload).toBe(false);
    });

    it("should return true for service with folder bundler plugin", () => {
      const config: ServiceConfig = {
        folderBundlerPlugin: {
          options: {},
          plugin: mockFolderBundlerPlugin,
        },
        id: "test-service",
        largeFilePlugin: {
          options: {},
          plugin: mockLargePlugin,
        },
        name: "Test Service",
        smallFilePlugin: {
          options: {},
          plugin: mockSmallPlugin,
        },
      };

      uploadManager.registerService(config);

      const supportsFolderUpload =
        uploadManager.serviceSupportsFolderUpload("test-service");
      expect(supportsFolderUpload).toBe(true);
    });
  });

  describe("Plugin Management", () => {
    it("should handle service registration properly", () => {
      const config: ServiceConfig = {
        id: "test-service",
        largeFilePlugin: {
          options: {},
          plugin: mockLargePlugin,
        },
        name: "Test Service",
        smallFilePlugin: {
          options: {},
          plugin: mockSmallPlugin,
        },
      };

      uploadManager.registerService(config);

      const services = uploadManager.getServices();
      expect(services.length).toBe(1);
      expect(services[0].id).toBe("test-service");
    });

    it("should handle service registration with folder bundler plugin", () => {
      const config: ServiceConfig = {
        folderBundlerPlugin: {
          options: {},
          plugin: mockFolderBundlerPlugin,
        },
        id: "test-service",
        largeFilePlugin: {
          options: {},
          plugin: mockLargePlugin,
        },
        name: "Test Service",
        smallFilePlugin: {
          options: {},
          plugin: mockSmallPlugin,
        },
      };

      uploadManager.registerService(config);

      const services = uploadManager.getServices();
      expect(services.length).toBe(1);
      expect(services[0].id).toBe("test-service");
    });
  });

  describe("Error Handling", () => {
    it("should throw error for invalid service configuration", () => {
      const invalidConfig = {
        id: "test-service",
        // Missing required fields
      } as unknown as ServiceConfig;

      (validateServiceConfig as any).mockImplementation(() => {
        throw new Error("Invalid service config");
      });

      expect(() => {
        uploadManager.registerService(invalidConfig);
      }).toThrow("Service config must have a valid id");
    });

    it("should handle service registration when validation fails", () => {
      const config = {
        id: "test-service",
        largeFilePlugin: {
          options: {},
          plugin: mockLargePlugin,
        },
        name: "Test Service",
        smallFilePlugin: {
          options: {},
          plugin: mockSmallPlugin,
        },
      };

      (validateServiceConfig as any).mockImplementation(() => {
        throw new Error("Validation failed");
      });

      expect(() => {
        uploadManager.registerService(config);
      }).toThrow("Service config must have a valid id");

      // Service should not be registered
      expect(uploadManager.getServices().length).toBe(0);
    });
  });

  describe("Plugin Management", () => {
    it("should register small and large file plugins with correct IDs", () => {
      const config: ServiceConfig = {
        id: "storage-service",
        largeFilePlugin: {
          options: { maxFileSize: 1000000 },
          plugin: mockLargePlugin,
        },
        name: "Storage Service",
        smallFilePlugin: {
          options: { maxFileSize: 1000 },
          plugin: mockSmallPlugin,
        },
      };

      uploadManager.registerService(config);

      expect(mockUppy.use).toHaveBeenCalledWith(mockSmallPlugin, {
        id: "storage-service-small",
        maxFileSize: 1000,
      });

      expect(mockUppy.use).toHaveBeenCalledWith(mockLargePlugin, {
        id: "storage-service-large",
        maxFileSize: 1000000,
      });
    });

    it("should register folder bundler plugin when provided", () => {
      const config: ServiceConfig = {
        folderBundlerPlugin: {
          options: { bundleSize: 100 },
          plugin: mockFolderBundlerPlugin,
        },
        id: "cloud-service",
        largeFilePlugin: {
          options: {},
          plugin: mockLargePlugin,
        },
        name: "Cloud Service",
        smallFilePlugin: {
          options: {},
          plugin: mockSmallPlugin,
        },
      };

      uploadManager.registerService(config);

      expect(mockUppy.use).toHaveBeenCalledWith(mockFolderBundlerPlugin, {
        bundleSize: 100,
        id: "cloud-service-folder-bundler",
      });
    });

    it("should not register folder bundler plugin when not provided", () => {
      const config: ServiceConfig = {
        id: "simple-service",
        largeFilePlugin: {
          options: {},
          plugin: mockLargePlugin,
        },
        name: "Simple Service",
        smallFilePlugin: {
          options: {},
          plugin: mockSmallPlugin,
        },
        // folderBundlerPlugin is not provided
      };

      uploadManager.registerService(config);

      // Should only register small and large plugins, not folder bundler
      expect(mockUppy.use).toHaveBeenCalledTimes(2);
    });
  });
});
