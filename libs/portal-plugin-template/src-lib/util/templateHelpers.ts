import type { TemplateConfig, TemplateState } from "@lib/types/template";

/**
 * Validates template plugin configuration
 */
export function validateTemplateConfig(
  config: unknown,
): config is TemplateConfig {
  if (!config || typeof config !== "object") {
    return false;
  }

  const cfg = config as Partial<TemplateConfig>;

  if (typeof cfg.enabled !== "boolean") {
    return false;
  }

  if (cfg.settings && typeof cfg.settings !== "object") {
    return false;
  }

  return true;
}

/**
 * Creates a default template configuration
 */
export function createDefaultTemplateConfig(): TemplateConfig {
  return {
    enabled: true,
    settings: {
      customSetting: "default",
      maxItems: 100,
    },
  };
}

/**
 * Formats template data for display
 */
export function formatTemplateData(data: unknown): string {
  if (data === null || data === undefined) {
    return "No data available";
  }

  if (typeof data === "string") {
    return data;
  }

  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

/**
 * Gets a user-friendly error message
 */
export function getTemplateErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unknown error occurred";
}

/**
 * Checks if template state is in loading state
 */
export function isTemplateLoading(state: TemplateState): boolean {
  return state.isLoading;
}

/**
 * Checks if template state has an error
 */
export function hasTemplateError(state: TemplateState): boolean {
  return !!state.error;
}

/**
 * Creates initial template state
 */
export function createInitialTemplateState(): TemplateState {
  return {
    isLoading: false,
  };
}
