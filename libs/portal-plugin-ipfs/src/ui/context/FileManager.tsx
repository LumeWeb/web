"use client";

import React, { createContext, useContext, useState, useRef } from "react";
import type { FileManagerItem } from "@/client";
import { useLocation, useNavigate } from "react-router";
import { useCallback } from "react";
import type { HeliaService } from "@/helia";
import { useFileManagerFeature } from "@/ui/hooks/useFileManagerFeature";

interface FileManagerContextType {
  currentPath: string;
  navigateToPath: (path: string) => void;
  selectedFiles?: FileManagerItem[];
  setSelectedFiles?: (files: FileManagerItem[]) => void;
  refreshData?: () => void;
  setRefreshData?: (refresh: () => void) => void;
  handlePin?: (cid: string) => void;
  handleUnpin?: (cid: string) => void;
  handleDownload?: (cid: string) => void;
  isInitialized?: boolean;
  featureError?: Error | null;
  getHeliaService?: () => HeliaService | null;
}

const FileManagerContext = createContext<FileManagerContextType | undefined>(
  undefined,
);

export const FileManagerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { currentPath, navigateToPath } = useFileManagerNavigation();
  const [selectedFiles, setSelectedFiles] = useState<FileManagerItem[]>([]);
  const { getHeliaService, isInitialized, error: featureError } = useFileManagerFeature();
  const refreshDataRef = useRef<(() => void) | undefined>(undefined);

  const handleDownload = useCallback((cid: string) => {
    try {
      const heliaService = getHeliaService?.();
      if (!heliaService) {
        throw new Error("Helia service not available");
      }

      // Get the API URL from the HeliaService config
      const apiUrl = heliaService.getConfig().apiUrl;
      
      // Construct the trustless gateway endpoint URL
      const gatewayUrl = `${apiUrl}/ipfs/${cid}`;
      
      // Open the URL in a new tab
      window.open(gatewayUrl, "_blank");
    } catch (error) {
      console.error("Failed to download file:", error);
      // Handle error appropriately - you might want to show a notification or alert
    }
  }, [getHeliaService]);

  const handleUnpin = useCallback(async (cid: string) => {
    try {
      const heliaService = getHeliaService?.();
      if (!heliaService) {
        throw new Error("Helia service not available");
      }

      await heliaService.unpinCid(cid);
      console.log(`Successfully unpinned CID: ${cid}`);
      // Trigger refresh if available
      if (refreshDataRef.current) {
        refreshDataRef.current();
      }
    } catch (error) {
      console.error("Failed to unpin CID:", error);
      // Handle error appropriately - you might want to show a notification or alert
    }
  }, [getHeliaService]);

  return (
    <FileManagerContext.Provider
      value={{
        currentPath,
        navigateToPath,
        selectedFiles,
        setSelectedFiles,
        isInitialized,
        featureError,
        getHeliaService,
        handleDownload,
        handleUnpin,
        refreshData: refreshDataRef.current,
        setRefreshData: (refresh) => {
          refreshDataRef.current = refresh;
        },
      }}>
      {children}
    </FileManagerContext.Provider>
  );
};

export const useFileManagerContext = () => {
  const context = useContext(FileManagerContext);
  if (context === undefined) {
    throw new Error(
      "useFileManagerContext must be used within a FileManagerProvider",
    );
  }
  return context;
};

const useFileManagerNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Normalize path by trimming whitespace and ensuring proper format
  const normalizePath = (path: string): string => {
    // Trim leading and trailing whitespace
    let normalized = path.trim();
    
    // Ensure path starts with "/"
    if (!normalized.startsWith("/")) {
      normalized = "/" + normalized;
    }
    
    // Remove trailing slash except for root path
    if (normalized.length > 1 && normalized.endsWith("/")) {
      normalized = normalized.slice(0, -1);
    }
    
    return normalized;
  };

  // Extract path from URL search params or default to "/"
  const currentPath = normalizePath(new URLSearchParams(location.search).get("path") || "/");

  const navigateToPath = useCallback(
    (path: string) => {
      // Normalize the path to remove any trailing spaces
      const normalizedPath = normalizePath(path);
      
      // Update URL search params without triggering full route re-render
      const searchParams = new URLSearchParams(location.search);
      if (normalizedPath === "/") {
        searchParams.delete("path");
      } else {
        searchParams.set("path", normalizedPath);
      }
      navigate({ search: searchParams.toString() });
    },
    [location.search, navigate],
  );

  return {
    currentPath,
    navigateToPath,
  };
};
