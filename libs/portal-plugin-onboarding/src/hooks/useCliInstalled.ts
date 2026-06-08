import { useList } from "@refinedev/core";

interface ApiKey {
  name: string;
  uuid: string;
  created_at: string;
}

interface UseCliInstalledReturn {
  isInstalled: boolean;
  isBusy: boolean;
  hasError: boolean;
}

export function useCliInstalled(enabled = true): UseCliInstalledReturn {
  const { query, result } = useList<ApiKey>({
    resource: "api-keys",
    filters: [{ field: "name", operator: "startswith", value: "cli-" }],
    pagination: { pageSize: 1 },
    queryOptions: { enabled },
  });

  const isInstalled = (result?.total ?? 0) > 0;

  return {
    isInstalled,
    isBusy: query.isLoading,
    hasError: query.isError,
  };
}
