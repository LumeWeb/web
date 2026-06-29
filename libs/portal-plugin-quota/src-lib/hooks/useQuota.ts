import { useCustom } from "@refinedev/core";
import type { HttpError, UseCustomProps } from "@refinedev/core";
import type { QuotaStatusResponse } from "@lumeweb/portal-sdk";
import { DATA_PROVIDER_NAME } from "@lumeweb/portal-framework-auth";

export interface UseQuotaConfig {
  queryOptions?: UseCustomProps<
    QuotaStatusResponse,
    HttpError,
    unknown,
    unknown,
    QuotaStatusResponse
  >["queryOptions"];
}

export const QUOTA_QUERY_KEY = [
  ...(DATA_PROVIDER_NAME ? [DATA_PROVIDER_NAME] : []),
  "/account/quota",
];

export interface UseQuotaReturn {
  data: QuotaStatusResponse | undefined;
  isReady: boolean;
  isBusy: boolean;
  hasError: boolean;
  error: HttpError | null;
  refetch: () => void;
  result: ReturnType<typeof useCustom<QuotaStatusResponse>>;
}

export function useQuota(config: UseQuotaConfig = {}): UseQuotaReturn {
  const { queryOptions } = config;

  const customResult = useCustom<QuotaStatusResponse>({
    url: "/account/quota",
    method: "get",
    dataProviderName: DATA_PROVIDER_NAME,
    queryOptions,
  });

  return {
    data: customResult.result.data,
    isReady: customResult.query.isSuccess && !!customResult.result.data,
    isBusy: customResult.query.isLoading,
    hasError: customResult.query.isError,
    error: customResult.query.error ?? null,
    refetch: () => { customResult.query.refetch(); },
    result: customResult,
  };
}
