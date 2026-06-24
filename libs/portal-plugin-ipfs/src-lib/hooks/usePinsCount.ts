import { useQuery } from "@tanstack/react-query";
import {
  createNamespacedId,
  useFeature,
} from "@lumeweb/portal-framework-core";
import type { FrameworkFeature } from "@lumeweb/portal-framework-core";

interface FileManagerLike extends FrameworkFeature {
  getHeliaService(): { listPinned(): Promise<string[]> };
}

export const PINS_COUNT_QUERY_KEY = ["ipfs", "pins", "count"];

interface UsePinsCountReturn {
  count: number;
  hasPins: boolean;
  isReady: boolean;
  isBusy: boolean;
  hasError: boolean;
  error: Error | null;
  refetch: () => void;
}

export function usePinsCount(enabled = true): UsePinsCountReturn {
  const {
    data: feature,
    error: featureError,
    isLoading: featureLoading,
  } = useFeature<FileManagerLike>(createNamespacedId("ipfs", "file-manager"));

  const {
    data: pins,
    error: queryError,
    isLoading: queryLoading,
    isError,
    isSuccess,
    refetch,
  } = useQuery({
    queryKey: PINS_COUNT_QUERY_KEY,
    queryFn: () => {
      if (!feature) {
        throw new Error("File manager feature not available");
      }
      return feature.getHeliaService().listPinned();
    },
    enabled: enabled && !!feature,
  });

  const count = pins?.length ?? 0;
  const error = featureError ?? queryError ?? null;
  const isBusy = featureLoading || queryLoading;

  return {
    count,
    hasPins: count > 0,
    isReady: isSuccess && !!pins,
    isBusy,
    hasError: !!featureError || isError,
    error,
    refetch: () => {
      refetch();
    },
  };
}
