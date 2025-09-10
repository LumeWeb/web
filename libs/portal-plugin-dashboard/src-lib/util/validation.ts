import type { ValidationErrorResult } from "@lumeweb/portal-framework-core";

import type { ServiceConfig } from "@/types/upload";

// Service config validation functions
export function validateServiceConfig(config: ServiceConfig): boolean {
  try {
    if (!config) {
      return false;
    }

    if (!config.id || typeof config.id !== "string") {
      return false;
    }

    if (!config.name || typeof config.name !== "string") {
      return false;
    }

    if (!config.smallFilePlugin) {
      return false;
    }

    if (!config.largeFilePlugin) {
      return false;
    }

    if (!config.smallFilePlugin.module) {
      return false;
    }

    if (!config.largeFilePlugin.module) {
      return false;
    }

    if (
      !config.smallFilePlugin.options ||
      typeof config.smallFilePlugin.options !== "object"
    ) {
      return false;
    }

    if (
      !config.largeFilePlugin.options ||
      typeof config.largeFilePlugin.options !== "object"
    ) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

export function validateServiceConfigDetailed(
  config: ServiceConfig,
): ValidationErrorResult {
  const missingProperties: string[] = [];

  if (!config) {
    missingProperties.push("config");
    return {
      isValid: false,
      missingProperties,
    };
  }

  if (!config.id || typeof config.id !== "string") {
    missingProperties.push("id");
  }

  if (!config.name || typeof config.name !== "string") {
    missingProperties.push("name");
  }

  if (!config.smallFilePlugin) {
    missingProperties.push("smallFilePlugin");
  } else {
    if (!config.smallFilePlugin.module) {
      missingProperties.push("smallFilePlugin.module");
    }
    if (
      !config.smallFilePlugin.options ||
      typeof config.smallFilePlugin.options !== "object"
    ) {
      missingProperties.push("smallFilePlugin.options");
    }
  }

  if (!config.largeFilePlugin) {
    missingProperties.push("largeFilePlugin");
  } else {
    if (!config.largeFilePlugin.module) {
      missingProperties.push("largeFilePlugin.module");
    }
    if (
      !config.largeFilePlugin.options ||
      typeof config.largeFilePlugin.options !== "object"
    ) {
      missingProperties.push("largeFilePlugin.options");
    }
  }

  return {
    isValid: missingProperties.length === 0,
    missingProperties,
  };
}

export function validateServiceConfigs(configs: ServiceConfig[]): boolean {
  if (!Array.isArray(configs)) {
    return false;
  }

  return configs.every((config) => validateServiceConfig(config));
}

export function validateServiceConfigsDetailed(
  configs: ServiceConfig[],
): ValidationErrorResult {
  const missingProperties: string[] = [];

  if (!Array.isArray(configs)) {
    missingProperties.push("configs (must be an array)");
    return {
      isValid: false,
      missingProperties,
    };
  }

  configs.forEach((config, index) => {
    const result = validateServiceConfigDetailed(config);
    if (!result.isValid) {
      missingProperties.push(
        `config[${index}]: ${result.missingProperties.join(", ")}`,
      );
    }
  });

  return {
    isValid: missingProperties.length === 0,
    missingProperties,
  };
}
