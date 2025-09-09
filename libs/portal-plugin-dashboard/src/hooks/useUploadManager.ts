import { useFramework } from "@lumeweb/portal-framework-core";
import { useCallback, useEffect, useState } from "react";

import type { ProtocolCapability } from "@/capabilities/protocol";
import type { UploadFeature } from "@/features/upload";
import type { ServiceConfig } from "@/ui/components/form/FileUploadZone";

import { UploadStatus } from "@/types/upload";

export function useUploadManager() {
  const framework = useFramework();
  const [services, setServices] = useState<ServiceConfig[]>([]);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<Error | null>(null);

  const getUploadFeature = useCallback(() => {
    if (!framework) {
      throw new Error("Framework not available");
    }

    const feature = framework.getFeature<UploadFeature>(
      "dashboard:upload",
    );
    if (!feature) {
      throw new Error("Upload feature not found");
    }
    return feature;
  }, [framework]);

  useEffect(() => {
    try {
      const feature = getUploadFeature();
      const protocolCapabilities =
        feature.getServices() as ProtocolCapability[];

      // Transform protocol capabilities into UI service objects
      const uiServices: ServiceConfig[] = protocolCapabilities.map(
        (protocol) => ({
          description: protocol.getDescription(),
          icon: protocol.getIcon(),
          id: protocol.id,
          name: protocol.getName(),
        }),
      );

      setServices(uiServices);
    } catch (error) {
      // Framework or feature might not be available yet
      setServices([]);
    }
  }, [getUploadFeature]);

  const addFile = useCallback(
    async (file: File, serviceId: string) => {
      const feature = getUploadFeature();
      return feature.addFile(file, serviceId);
    },
    [getUploadFeature],
  );

  const start = useCallback(async () => {
    setUploadStatus("uploading");
    setUploadProgress(0);
    setUploadError(null);

    try {
      const feature = getUploadFeature();
      const result = await feature.start();

      // Simulate progress updates
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setUploadStatus("completed");
            return 100;
          }
          return prev + 10;
        });
      }, 500);

      return result;
    } catch (error) {
      setUploadStatus("error");
      setUploadError(error as Error);
      throw error;
    }
  }, [getUploadFeature]);

  const getFiles = useCallback(() => {
    const feature = getUploadFeature();
    return feature.getFiles();
  }, [getUploadFeature]);

  const removeFile = useCallback(
    (id: string) => {
      const feature = getUploadFeature();
      return feature.removeFile(id);
    },
    [getUploadFeature],
  );

  return {
    addFile,
    getFiles,
    removeFile,
    services,
    start,
    uploadError,
    uploadProgress,
    uploadStatus,
  };
}
