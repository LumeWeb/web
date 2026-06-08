import { useState } from "react";
import { useCustom } from "@refinedev/core";
import type { HttpError, UseCustomProps } from "@refinedev/core";
import type { SubscriptionStatusResponse } from "@lib/types";
import { DATA_PROVIDER_NAME } from "@lumeweb/portal-framework-auth";

interface UseSubscriptionStatusConfig {
  queryOptions?: UseCustomProps<
    SubscriptionStatusResponse,
    HttpError,
    unknown,
    unknown,
    SubscriptionStatusResponse
  >["queryOptions"];
}

export function getAuthHeaders(token: string | null): Record<string, string> {
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

export const SUBSCRIPTION_QUERY_KEY = [
  ...(DATA_PROVIDER_NAME ? [DATA_PROVIDER_NAME] : []),
  "/account/billing/subscription",
];

interface UseSubscriptionStatusReturn {
  /** The subscription data - only available when isReady is true */
  data: SubscriptionStatusResponse | undefined;
  /** True when data is available and request succeeded */
  isReady: boolean;
  /** True when loading (initial or refetching) */
  isBusy: boolean;
  /** True when there's an error */
  hasError: boolean;
  /** The error object if hasError is true */
  error: HttpError | null;
  /** Manually refetch subscription status (shows loading state) */
  refetch: () => void;
  /** Background refresh without affecting loading state */
  silentRefetch: () => void;
  /** Raw useCustom result for advanced use cases */
  result: ReturnType<typeof useCustom<SubscriptionStatusResponse>>;
}

export function useSubscriptionStatus(config: UseSubscriptionStatusConfig = {}): UseSubscriptionStatusReturn {
  const { queryOptions } = config;
  const [silentRefetching, setSilentRefetching] = useState(false);

  const customResult = useCustom<SubscriptionStatusResponse>({
    url: "/account/billing/subscription",
    method: "get",
    dataProviderName: DATA_PROVIDER_NAME,
    queryOptions,
  });

  const isBusy = customResult.query.isLoading || (customResult.query.isFetching && !silentRefetching);

  return {
    data: customResult.result.data,
    isReady: customResult.query.isSuccess && !!customResult.result.data,
    isBusy,
    hasError: customResult.query.isError,
    error: customResult.query.error ?? null,
    refetch: () => { customResult.query.refetch(); },
    silentRefetch: () => {
      setSilentRefetching(true);
      customResult.query.refetch().finally(() => {
        setSilentRefetching(false);
      });
    },
    result: customResult,
  };
}

export type { UseSubscriptionStatusReturn };
