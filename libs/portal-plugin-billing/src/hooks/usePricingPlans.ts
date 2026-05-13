import { useCustom } from "@refinedev/core";
import type { HttpError, UseCustomProps } from "@refinedev/core";
import type { PublicPricingPlansListResponse } from "../types/subscription";
import { DATA_PROVIDER_NAME } from "@lumeweb/portal-framework-auth";

interface UsePricingPlansConfig {
  queryOptions?: UseCustomProps<
    PublicPricingPlansListResponse,
    HttpError,
    unknown,
    unknown,
    PublicPricingPlansListResponse
  >["queryOptions"];
}

interface UsePricingPlansReturn {
  /** The plans data - only available when isReady is true */
  data: PublicPricingPlansListResponse | undefined;
  /** True when data is available and request succeeded */
  isReady: boolean;
  /** True when loading (initial or refetching) */
  isBusy: boolean;
  /** True when there's an error */
  hasError: boolean;
  /** The error object if hasError is true */
  error: HttpError | null;
  /** Raw useCustom result for advanced use cases */
  result: ReturnType<typeof useCustom<PublicPricingPlansListResponse>>;
}

export function usePricingPlans(config: UsePricingPlansConfig = {}): UsePricingPlansReturn {
  const { queryOptions } = config;

  const customResult = useCustom<PublicPricingPlansListResponse>({
    url: "/billing/plans",
    method: "get",
    dataProviderName: DATA_PROVIDER_NAME,
    queryOptions,
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
