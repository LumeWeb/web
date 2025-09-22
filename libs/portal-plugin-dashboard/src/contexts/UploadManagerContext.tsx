"use client";

import React, { createContext, useContext, useRef, useState } from "react";
import { Manager, UploadManagerConfig } from "src/features/upload/Manager";

interface UploadManagerContextType {
  getUploadManager: (config?: UploadManagerConfig) => Manager;
  resetUploadManager: () => void;
}

const UploadManagerContext = createContext<null | UploadManagerContextType>(
  null,
);

interface UploadManagerProviderProps {
  children: React.ReactNode;
  defaultConfig?: UploadManagerConfig;
}

export function UploadManagerProvider({
  children,
  defaultConfig,
}: UploadManagerProviderProps) {
  const uploadManagerRef = useRef<Manager | null>(null);
  const config = defaultConfig;

  const getUploadManager = (newConfig?: UploadManagerConfig) => {
    if (!uploadManagerRef.current) {
      uploadManagerRef.current = new Manager(
        config || newConfig || { type: "main" },
      );
    }
    return uploadManagerRef.current;
  };

  const resetUploadManager = () => {
    if (uploadManagerRef.current) {
      uploadManagerRef.current.reset();
      uploadManagerRef.current = null;
    }
  };

  const contextValue: UploadManagerContextType = {
    getUploadManager,
    resetUploadManager,
  };

  return (
    <UploadManagerContext.Provider value={contextValue}>
      {children}
    </UploadManagerContext.Provider>
  );
}

export function useUploadManagerContext() {
  const context = useContext(UploadManagerContext);
  if (!context) {
    throw new Error(
      "useUploadManagerContext must be used within an UploadManagerProvider",
    );
  }
  return context;
}
