import type { RefineProps, DataProviders } from "@refinedev/core";
import type { AuthProviderWithEmitter } from "@lumeweb/portal-framework-auth";

export interface AuthTokenDataProvider {
  setAuthToken: (token: string | null) => void;
}

export interface SyncAuthProviderOptions {
  onTokenChange?: (token: string) => void;
}

export function syncAuthProviderWithDataProvider(
  dataProvider: AuthTokenDataProvider,
  authProvider?: AuthProviderWithEmitter | undefined,
  options?: SyncAuthProviderOptions,
): () => void {
  if (!authProvider) {
    return () => {};
  }

  const currentToken =
    typeof authProvider.getToken === "function"
      ? authProvider.getToken()
      : (authProvider as any).token || (authProvider as any).currentToken || null;

  if (currentToken) {
    dataProvider.setAuthToken(currentToken);
    options?.onTokenChange?.(currentToken);
  }

  if (typeof authProvider.on === "function") {
    const unbind = authProvider.on("authCheckSuccess", (params: { token: string }) => {
      dataProvider.setAuthToken(params.token);
      options?.onTokenChange?.(params.token);
    });
    return unbind;
  }

  return () => {};
}

export function ensureResource(
  resources: RefineProps["resources"] = [],
  resourceName: string,
  meta: Record<string, any> = {},
) {
  const hasResource = resources.some((r) => r.name === resourceName);
  return hasResource
    ? resources
    : [
        ...resources,
        {
          meta: {
            dataProviderName: resourceName,
            ...meta,
          },
          name: resourceName,
        },
      ];
}

export function getDefaultRefineOptions(): RefineProps["options"] {
  return {
    disableTelemetry: true,
    disableRouteChangeHandler: true,
    mutationMode: "pessimistic",
    syncWithLocation: true,
    warnWhenUnsavedChanges: true,
  };
}

export function mergeRefineConfig(
  existing: Partial<RefineProps> = {},
  customDataProviders: Record<string, any> = {},
  requiredResources: {
    meta?: Record<string, any>;
    name: string;
  }[] = [],
): Partial<RefineProps> {
  const dataProvider = {
    ...normalizeDataProvider(existing.dataProvider),
    ...(customDataProviders as DataProviders),
  };

  let resources = existing.resources || [];
  for (const resource of requiredResources) {
    resources = ensureResource(resources, resource.name, resource.meta);
  }

  return {
    ...existing,
    dataProvider,
    options: {
      ...getDefaultRefineOptions(),
      ...existing.options,
    },
    resources,
  };
}

export function normalizeDataProvider(
  dataProvider?: RefineProps["dataProvider"],
): Record<string, any> {
  if (!dataProvider) return {};
  if (typeof dataProvider === "function" || typeof dataProvider === "string") {
    return { default: dataProvider };
  }
  return dataProvider;
}
