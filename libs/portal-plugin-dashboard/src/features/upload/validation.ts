import type { ServiceConfig } from "@/types/upload";

export class ServiceConfigValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ServiceConfigValidationError";
  }
}

export function validateServiceConfig(config: ServiceConfig): void {
  if (!config) {
    throw new ServiceConfigValidationError("Service config is required");
  }

  if (!config.id || typeof config.id !== "string") {
    throw new ServiceConfigValidationError("Service config must have a valid id");
  }

  if (!config.name || typeof config.name !== "string") {
    throw new ServiceConfigValidationError("Service config must have a valid name");
  }

  if (!config.smallFilePlugin) {
    throw new ServiceConfigValidationError("Service config must have a smallFilePlugin");
  }

  if (!config.largeFilePlugin) {
    throw new ServiceConfigValidationError("Service config must have a largeFilePlugin");
  }

  if (!config.smallFilePlugin.module) {
    throw new ServiceConfigValidationError("Small file plugin must have a valid plugin module");
  }

  if (!config.largeFilePlugin.module) {
    throw new ServiceConfigValidationError("Large file plugin must have a valid plugin module");
  }

  if (!config.smallFilePlugin.options || typeof config.smallFilePlugin.options !== "object") {
    throw new ServiceConfigValidationError("Small file plugin must have valid options");
  }

  if (!config.largeFilePlugin.options || typeof config.largeFilePlugin.options !== "object") {
    throw new ServiceConfigValidationError("Large file plugin must have valid options");
  }
}

export function validateServiceConfigs(configs: ServiceConfig[]): void {
  if (!Array.isArray(configs)) {
    throw new ServiceConfigValidationError("Service configs must be an array");
  }

  configs.forEach((config, index) => {
    try {
      validateServiceConfig(config);
    } catch (error) {
      if (error instanceof ServiceConfigValidationError) {
        throw new ServiceConfigValidationError(`Service config at index ${index}: ${error.message}`);
      }
      throw error;
    }
  });
}
