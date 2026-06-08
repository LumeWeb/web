import { useList } from "@refinedev/core";

interface WebsiteItem {
  id: number;
  domain: string;
  status: string;
}

interface UseHasWebsitesReturn {
  hasWebsites: boolean;
  isBusy: boolean;
  hasError: boolean;
}

export function useHasWebsites(enabled = true): UseHasWebsitesReturn {
  const { query, result } = useList<WebsiteItem>({
    resource: "ipfs/websites",
    dataProviderName: "ipfs",
    pagination: { pageSize: 1 },
    queryOptions: { enabled },
  });

  const total = result?.total ?? 0;
  const hasWebsites = total > 0;

  return {
    hasWebsites,
    isBusy: query.isLoading,
    hasError: query.isError,
  };
}
