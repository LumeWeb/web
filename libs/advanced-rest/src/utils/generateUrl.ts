interface UrlParams {
  apiBase?: string;
  id?: BaseKey;
  meta?: MetaQuery;
  operation?: string;
  resource?: string;
}

import { BaseKey, MetaQuery } from "@refinedev/core";
import pupa from "pupa";

export class NestedParamError extends Error {
  constructor(missingParam: string) {
    super(`Missing required "${missingParam}" in meta.params`);
    this.name = "NestedParamError";
  }
}

export class TemplateResolutionError extends Error {
  constructor(template: string, originalError?: Error) {
    super(
      `Failed to resolve template '${template}': ${originalError?.message || "Invalid template syntax"}`,
    );
    this.name = "TemplateResolutionError";
  }
}

export function generateNestedUrl({
  apiBase = "",
  id,
  meta = {},
  operation,
  resource = meta.resource as string,
}: UrlParams): string {
  // Get template from meta or convert resource dot notation to path segments
  const template =
    meta?.template ||
    (resource
      ? resource
          .split(".")
          .map((part, index, arr) =>
            index < arr.length - 1 ? `${part}/{${part}}` : part,
          )
          .join("/")
      : "");
  // Handle paramsMap deprecation
  const params = meta?.params || meta?.paramsMap || {};
  if (meta?.paramsMap) {
    console.warn("paramsMap is deprecated - use params instead");
  }

  // Let Pupa handle template resolution first
  let resolvedPath: string;
  try {
    const encodedParams = Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, encodeURIComponent(v as any)]),
    );
    resolvedPath = pupa(template, encodedParams);
  } catch (error) {
    // Detect missing parameter errors and rethrow with correct type
    if (error instanceof Error && error.message.startsWith("Missing a value")) {
      const paramMatch = /placeholder: (\w+)/.exec(error.message);
      if (paramMatch) throw new NestedParamError(paramMatch[1]);
    }
    throw new TemplateResolutionError(template, error as Error);
  }

  // Check for any remaining template markers or invalid braces
  const invalidMarkers = resolvedPath.match(/[{}]/g) || [];
  if (invalidMarkers.length > 0) {
    throw new TemplateResolutionError(template);
  }

  // Add ID if present
  if (id) {
    resolvedPath += `/${id}`;
  }

  // Add operation if specified after template resolution
  if (operation) {
    resolvedPath = `${resolvedPath}/${operation}`.replace(/\/\/+/g, "/");
  }

  // Return relative path without leading slash for ky's prefixUrl
  return `${resolvedPath.replace(/^\/+/, "")}`;
}
