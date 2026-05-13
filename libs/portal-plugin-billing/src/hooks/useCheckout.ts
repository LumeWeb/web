import { useCustom } from "@refinedev/core";
import type { HttpError, UseCustomProps } from "@refinedev/core";
import type { CheckoutUIResponse } from "../types/subscription";
import { DATA_PROVIDER_NAME } from "@lumeweb/portal-framework-auth";


interface UseCheckoutConfig {
  planId: string;
  periodId?: number;
  gateway?: string;
  queryOptions?: UseCustomProps<
    CheckoutUIResponse,
    HttpError,
    unknown,
    unknown,
    CheckoutUIResponse
  >["queryOptions"];
}

interface UseCheckoutReturn {
  /** The checkout data - only available when isReady is true */
  data: CheckoutUIResponse | undefined;
  /** True when data is available and request succeeded */
  isReady: boolean;
  /** True when loading (initial or refetching) */
  isBusy: boolean;
  /** True when there's an error */
  hasError: boolean;
  /** The error object if hasError is true */
  error: HttpError | null;
  /** Raw useCustom result for advanced use cases */
  result: ReturnType<typeof useCustom<CheckoutUIResponse>>;
}

export function useCheckout(config: UseCheckoutConfig): UseCheckoutReturn {
  const { planId, periodId, gateway, queryOptions } = config;

  const u = new URL(`/account/billing/checkout/ui/${planId}`, window.location.origin);
  if (periodId !== undefined) {
    u.searchParams.set("period_id", String(periodId));
  }
  if (gateway) {
    u.searchParams.set("gateway", gateway);
  }
  const url = u.pathname + u.search;
  const parentEnabled = queryOptions?.enabled ?? true;
  const finalEnabled = !!planId && parentEnabled;
  const mergedQueryOptions = {
    ...queryOptions,
    enabled: finalEnabled,
  };

  const customResult = useCustom<CheckoutUIResponse>({
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
