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
    pagination: { pageSize: 100 },
    queryOptions: { enabled },
  });

  const keys = result?.data;
  const isInstalled = keys?.some((key) => key.name.startsWith("cli-")) ?? false;

  return {
    isInstalled,
    isBusy: query.isLoading,
    hasError: query.isError,
  };
}
