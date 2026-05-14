import type { RefineProps } from "@refinedev/core";
import dataProvider from "@lumeweb/advanced-rest-provider";
import {
  type AuthProviderWithEmitter,
  DATA_PROVIDER_NAME,
} from "@lumeweb/portal-framework-auth";
import { mergeRefineConfig } from "@lumeweb/portal-framework-core";

/**
 * Resource configuration for refine data provider
 */
export type RefineResource = {
  name: string;
  meta?: any;
};

/**
 * Creates and configures a data provider with the given API URL and auth configuration
 */
export function createDataProvider(
  apiUrl: string,
  existing?: Partial<RefineProps>,
) {
  const token = localStorage.getItem("jwt");
  const acctProvider = dataProvider(apiUrl, true);

  if (token) {
    acctProvider.setAuthToken(token);
  }

  const authProvider = existing?.authProvider as
    | AuthProviderWithEmitter
    | undefined;
  if (authProvider) {
    authProvider.on("authCheckSuccess", (params) => {
      acctProvider.setAuthToken(params.token);
    });
  }

  return acctProvider;
}

/**
 * Sets up a data provider with the given API URL and merges it into the refine config
 * @param apiUrl - The API URL to use for the data provider
 * @param existing - Existing refine config to merge with
 * @param resources - Array of resource configurations to include
 */
export function setupDataProvider(
  apiUrl: string,
  existing?: Partial<RefineProps>,
  resources: RefineResource[] = [],
) {
  const acctProvider = createDataProvider(apiUrl, existing);

  return mergeRefineConfig(
    existing,
    { [DATA_PROVIDER_NAME]: acctProvider },
    resources,
  );
}
