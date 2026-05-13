import { useCustom, useList } from "@refinedev/core";
import type { GetListResponse, HttpError, UseCustomProps, UseListProps } from "@refinedev/core";
import type { BalanceResponse, UserCreditItem } from "../types/subscription";
import { DATA_PROVIDER_NAME } from "@lumeweb/portal-framework-auth";

interface UseCreditsConfig {
  balanceQueryOptions?: UseCustomProps<
    BalanceResponse,
    HttpError,
    unknown,
    unknown,
    BalanceResponse
  >["queryOptions"];
  creditsQueryOptions?: UseListProps<
    UserCreditItem & { id?: string | number },
    HttpError,
    UserCreditItem & { id?: string | number }
  >["queryOptions"];
  page?: number;
  pageSize?: number;
}

export function useCredits(config: UseCreditsConfig = {}) {
  const {
    balanceQueryOptions,
    creditsQueryOptions,
    page = 1,
    pageSize = 20,
  } = config;

  const balance = useCustom<BalanceResponse>({
    url: "/account/billing/balance",
    method: "get",
    dataProviderName: DATA_PROVIDER_NAME,
    queryOptions: balanceQueryOptions,
  });

  const credits = useList<UserCreditItem & { id?: string | number }>({
    resource: "billing-credits",
    pagination: {
      currentPage: page,
      pageSize,
    },
    dataProviderName: DATA_PROVIDER_NAME,
    queryOptions: creditsQueryOptions,
  });

  return {
    balance: {
      data: balance.result.data,
      isLoading: balance.query.isLoading,
      isError: balance.query.isError,
    },
    history: {
      data: credits.result.data as UserCreditItem[],
      total: credits.result.total,
      isLoading: credits.query.isLoading,
      isError: credits.query.isError,
    },
  };
}
