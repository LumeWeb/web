import type { FileManagerItem } from "@/client";
import { useList } from "@refinedev/core";

interface UseBreadcrumbsProps {
  path?: string;
}

export const useBreadcrumbs = ({ path = "/" }: UseBreadcrumbsProps) => {
  const { data, isLoading, error } = useList<FileManagerItem>({
    resource: "ipfs/files/breadcrumbs",
    filters: path ? [{ field: "path", operator: "eq", value: path }] : [],
    queryOptions: {
      enabled: !!path,
    },
  });

  return {
    breadcrumbs: data?.data || [],
    isLoading,
    error,
  };
};
