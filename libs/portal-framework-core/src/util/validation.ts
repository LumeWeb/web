import { BaseCapability } from "../types/capabilities";
import type { FrameworkFeature } from "../types/api";
import type { Plugin } from "../types/plugin";

export interface ValidationErrorResult {
  isValid: boolean;
  missingProperties: string[];
}

export function validateCapability(cap: BaseCapability): boolean {
  return (
    !!cap.id &&
    !!cap.type &&
    typeof cap.initialize === "function" &&
    typeof cap.destroy === "function"
  );
}

export function validateCapabilityDetailed(
  cap: BaseCapability,
): ValidationErrorResult {
  const missingProperties: string[] = [];

  if (!cap.id) {
    missingProperties.push("id");
  }
  if (!cap.type) {
    missingProperties.push("type");
  }
  if (typeof cap.initialize !== "function") {
    missingProperties.push("initialize()");
  }
  if (typeof cap.destroy !== "function") {
    missingProperties.push("destroy()");
  }
  if (!cap.status) {
    missingProperties.push("status");
  }

  return {
    isValid: missingProperties.length === 0,
    missingProperties,
  };
}

export function validateFeature(feature: FrameworkFeature): boolean {
  if (
    !!feature.id &&
    typeof feature.initialize === "function" &&
    typeof feature.destroy === "function"
  ) {
    return true;
  }
  return false;
}

export function validateFeatureDetailed(
  feature: FrameworkFeature,
): ValidationErrorResult {
  const missingProperties: string[] = [];

  if (!feature.id) {
    missingProperties.push("id");
  }
  if (typeof feature.initialize !== "function") {
    missingProperties.push("initialize()");
  }
  if (typeof feature.destroy !== "function") {
    missingProperties.push("destroy()");
  }

  return {
    isValid: missingProperties.length === 0,
    missingProperties,
  };
}

export function validatePlugin(plugin: Plugin): boolean {
  if (
    !!plugin.id &&
    typeof plugin.initialize === "function" &&
    typeof plugin.destroy === "function"
  ) {
    return true;
  }
  return false;
}

export function validatePluginDetailed(plugin: Plugin): ValidationErrorResult {
  const missingProperties: string[] = [];

  if (!plugin.id) {
    missingProperties.push("id");
  }
  if (typeof plugin.initialize !== "function") {
    missingProperties.push("initialize()");
  }
  if (typeof plugin.destroy !== "function") {
    missingProperties.push("destroy()");
  }

  return {
    isValid: missingProperties.length === 0,
    missingProperties,
  };
}
