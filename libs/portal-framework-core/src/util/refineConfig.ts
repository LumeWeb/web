import type { RefineProps, DataProviders } from "@refinedev/core";

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
