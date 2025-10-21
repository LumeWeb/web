import { useCustom } from "@refinedev/core";
import type { SubscriptionStatusResponse } from "@/types/subscription";
import type { UseCustomProps } from "@refinedev/core";
import { DATA_PROVIDER_NAME } from "@lumeweb/portal-framework-auth";

interface UseSubscriptionConfig {
  queryOptions?: UseCustomProps<
    SubscriptionStatusResponse,
    unknown,
    unknown,
    unknown,
    SubscriptionStatusResponse
  >["queryOptions"];
}

export function useSubscription(config: UseSubscriptionConfig = {}) {
  const { queryOptions } = config;

  return useCustom<SubscriptionStatusResponse>({
    url: "/account/billing/subscription",
    method: "get",
    dataProviderName: DATA_PROVIDER_NAME,
    queryOptions: {
      // Apply user-provided query options last to allow overrides
      ...queryOptions,
    },
  });
}
