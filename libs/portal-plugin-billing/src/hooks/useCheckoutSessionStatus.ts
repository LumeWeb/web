import { useCustom } from "@refinedev/core";
import type { HttpError, UseCustomProps } from "@refinedev/core";
import type { CheckoutSessionStatusResponse } from "../types/subscription";
import { DATA_PROVIDER_NAME } from "@lumeweb/portal-framework-auth";


interface UseCheckoutSessionStatusConfig {
  sessionId: string;
  gateway?: string;
  queryOptions?: UseCustomProps<
    CheckoutSessionStatusResponse,
    HttpError,
    unknown,
    unknown,
    CheckoutSessionStatusResponse
  >["queryOptions"];
}

interface UseCheckoutSessionStatusReturn {
  /** The session status data - only available when isReady is true */
  data: CheckoutSessionStatusResponse | undefined;
  /** True when data is available and request succeeded */
  isReady: boolean;
  /** True when loading (initial or refetching) */
  isBusy: boolean;
  /** True when there's an error */
  hasError: boolean;
  /** The error object if hasError is true */
  error: HttpError | null;
  /** Raw useCustom result for advanced use cases */
  result: ReturnType<typeof useCustom<CheckoutSessionStatusResponse>>;
}

export function useCheckoutSessionStatus(
  config: UseCheckoutSessionStatusConfig,
): UseCheckoutSessionStatusReturn {
  const { sessionId, gateway, queryOptions } = config;

  const u = new URL(`/account/billing/checkout/session/${sessionId}/status`, window.location.origin);
  if (gateway) {
    u.searchParams.set("gateway", gateway);
  }
  const url = u.pathname + u.search;
  const mergedQueryOptions = {
    enabled: !!sessionId,
    ...queryOptions,
  };

  const customResult = useCustom<CheckoutSessionStatusResponse>({
    url,
    method: "get",
    dataProviderName: DATA_PROVIDER_NAME,
    queryOptions: mergedQueryOptions,
  });

  return {
    data: customResult.result.data,
    isReady: customResult.query.isSuccess && !!customResult.result.data,
    isBusy: customResult.query.isLoading || customResult.query.isFetching,
    hasError: customResult.query.isError,
    error: customResult.query.error ?? null,
    result: customResult,
  };
}
