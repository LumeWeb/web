import { useCustom } from "@refinedev/core";
import type { HttpError, UseCustomProps } from "@refinedev/core";
import type { GatewayListResponse, GatewayPublicInfo } from "../types/subscription";
import { DATA_PROVIDER_NAME } from "@lumeweb/portal-framework-auth";

interface UseGatewaysConfig {
  queryOptions?: UseCustomProps<
    GatewayListResponse,
    HttpError,
    unknown,
    unknown,
    GatewayListResponse
  >["queryOptions"];
}

interface UseGatewaysReturn {
  data: GatewayListResponse | undefined;
  gateways: GatewayPublicInfo[];
  activeGateways: GatewayPublicInfo[];
  isReady: boolean;
  isBusy: boolean;
  hasError: boolean;
  error: HttpError | null;
  result: ReturnType<typeof useCustom<GatewayListResponse>>;
  refetch: () => void;
}

export function useGateways(config: UseGatewaysConfig = {}): UseGatewaysReturn {
  const { queryOptions } = config;

  const customResult = useCustom<GatewayListResponse>({
    url: "/billing/gateways",
    method: "get",
    dataProviderName: DATA_PROVIDER_NAME,
    queryOptions,
  });

  const responseData = customResult.result.data;
  // Handle both raw array and { data: [...] } wrapped response
  const allGateways = Array.isArray(responseData) 
    ? responseData 
    : ((responseData as any)?.data ?? []);

  return {
    data: responseData,
    gateways: allGateways,
    activeGateways: allGateways.filter((g: GatewayPublicInfo) => g.is_active),
    isReady: customResult.query.isSuccess && !!responseData,
    isBusy: customResult.query.isLoading || customResult.query.isFetching,
    hasError: customResult.query.isError,
    error: customResult.query.error ?? null,
    result: customResult,
    refetch: customResult.query.refetch,
  };
}
