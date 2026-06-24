import { createNamespacedId, useFeature } from "@lumeweb/portal-framework-core";
import { useCallback } from "react";
import { FileManagerFeature } from "@/features/fileManager/Feature";
import type { HeliaService } from "@/helia";

export interface UseFileManagerFeatureReturn {
  getHeliaService: () => HeliaService;
  getApiUrl: () => string;
  isInitialized: boolean;
  error: Error | null;
  isLoading: boolean;
}

export function useFileManagerFeature(): UseFileManagerFeatureReturn {
  const {
    data: feature,
    error,
    isLoading,
  } = useFeature<FileManagerFeature>(createNamespacedId("ipfs", "file-manager"));

  const getHeliaService = useCallback(() => {
    if (!feature) {
      throw new Error("File manager feature not available");
    }
    return feature.getHeliaService();
  }, [feature]);

  const getApiUrl = useCallback(() => {
    if (!feature) {
      throw new Error("File manager feature not available");
    }
    return feature.getApiUrl();
  }, [feature]);

  return {
    getHeliaService,
    getApiUrl,
    isInitialized: !!feature,
    error,
    isLoading,
  };
}
