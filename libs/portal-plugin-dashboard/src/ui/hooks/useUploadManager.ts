import { useFramework } from "@lumeweb/portal-framework-core";
import { useNotification } from "@refinedev/core";
import { useCallback, useEffect, useState } from "react";

import type { ProtocolCapability } from "@lib/types/capabilities/protocol";
import type { Feature } from "@/features/upload";
import type { UIServiceConfig, UploadStatusType } from "@/types/upload";

export interface UseUploadManagerReturn {
  addFile: (file: File, serviceId: string) => Promise<void>;
  cancelAll: () => Promise<void> | void;
  getFiles: () => Promise<any[]>;
  getManager: () => Feature | null;
  getUploadErrors: () => Error[];
  getUploadProgress: () => number;
  getUploadStatus: () => Promise<UploadStatusType> | UploadStatusType;
  off: (event: string, callback: (...args: any[]) => void) => void;
  // Expose Uppy's event system directly
  on: (event: string, callback: (...args: any[]) => void) => () => void;
  removeFile: (id: string) => Promise<void>;
  services: UIServiceConfig[];

  start: () => Promise<any>;
  uploadManager: Feature | null;
}

export function useUploadManager(): UseUploadManagerReturn {
  const framework = useFramework();
  const { open } = useNotification();
  const [services, setServices] = useState<UIServiceConfig[]>([]);
  const [uploadManager, setUploadManager] = useState<Feature | null>(null);

  const getUploadFeature = useCallback(async () => {
    if (!framework) {
      throw new Error("Framework not available");
    }

    const feature =
      await framework.framework.getFeature<Feature>("dashboard:upload");
    if (!feature) {
      throw new Error("Upload feature not found");
    }
    return feature;
  }, [framework]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const feature = await getUploadFeature();
        setUploadManager(feature);

        // Set up error handling for Uppy events
        const handleError = (file: any, error: Error) => {
          open?.({
            description: error.message,
            message: "Upload Error",
            type: "error",
          });
        };

        const handleRestrictionFailed = (file: any, error: Error) => {
          open?.({
            description: error.message,
            message: "Invalid File",
            type: "error",
          });
        };

        // Add event listeners for error events
        const cleanupError = feature.on("error", handleError);
        const cleanupRestrictionFailed = feature.on(
          "restriction-failed",
          handleRestrictionFailed,
        );

        // Get the service configs from the upload manager
        const serviceConfigs = feature.getServices();

        // Transform service configs into UI service objects by calling protocol capability methods
        const uiServices: UIServiceConfig[] = await Promise.all(
          serviceConfigs.map(async (serviceConfig) => {
            // Get the protocol capability for this service
            const protocolCapability =
              await framework?.framework.getCapability<ProtocolCapability>(
                serviceConfig.id,
              );

            if (!protocolCapability) {
              throw new Error(
                `Protocol capability not found for service ${serviceConfig.id}`,
              );
            }

            return {
              description: protocolCapability.getDescription(),
              icon: protocolCapability.getIcon(),
              id: serviceConfig.id,
              name: protocolCapability.getName(),
            };
          }),
        );

        setServices(uiServices);

        // Cleanup function to remove event listeners
        return () => {
          cleanupError();
          cleanupRestrictionFailed();
        };
      } catch (error) {
        // Framework or feature might not be available yet
        setServices([]);
        setUploadManager(null);
      }
    };

    fetchServices();
  }, [getUploadFeature, framework]);

  const addFile = useCallback(
    async (file: File, serviceId: string) => {
      if (!uploadManager) {
        throw new Error("Upload manager not available");
      }
      return uploadManager.addFile(file, serviceId);
    },
    [uploadManager],
  );

  const start = useCallback(async () => {
    if (!uploadManager) {
      throw new Error("Upload manager not available");
    }
    return uploadManager.start();
  }, [uploadManager]);

  const getFiles = useCallback(async () => {
    if (!uploadManager) {
      throw new Error("Upload manager not available");
    }
    return uploadManager.getFiles();
  }, [uploadManager]);

  const removeFile = useCallback(
    async (id: string) => {
      if (!uploadManager) {
        throw new Error("Upload manager not available");
      }
      return uploadManager.removeFile(id);
    },
    [uploadManager],
  );

  const cancelAll = useCallback(async () => {
    if (!uploadManager) {
      throw new Error("Upload manager not available");
    }
    return uploadManager.cancelAll();
  }, [uploadManager]);

  const getUploadProgress = useCallback(() => {
    if (!uploadManager) {
      throw new Error("Upload manager not available");
    }
    return uploadManager.getUploadProgress();
  }, [uploadManager]);

  const getUploadStatus = useCallback(() => {
    if (!uploadManager) {
      throw new Error("Upload manager not available");
    }
    return uploadManager.getUploadStatus();
  }, [uploadManager]);

  const on = useCallback(
    (event: string, callback: (...args: any[]) => void) => {
      if (!uploadManager) {
        throw new Error("Upload manager not available");
      }
      return uploadManager.on(event, callback);
    },
    [uploadManager],
  );

  const off = useCallback(
    (event: string, callback: (...args: any[]) => void) => {
      if (!uploadManager) {
        throw new Error("Upload manager not available");
      }
      return uploadManager.off(event, callback);
    },
    [uploadManager],
  );

  const getManager = useCallback(() => {
    return uploadManager?.getManager();
  }, [uploadManager]);

  const getUploadErrors = useCallback(() => {
    if (!uploadManager) {
      throw new Error("Upload manager not available");
    }
    return uploadManager.getUploadErrors();
  }, [uploadManager]);

  return {
    addFile,
    cancelAll,
    getFiles,
    getManager,
    getUploadErrors,
    getUploadProgress,
    getUploadStatus,
    off,
    on,
    removeFile,
    services,
    start,
    uploadManager,
  };
}
