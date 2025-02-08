import React from "react";

import type { Framework } from "../api/framework";
import type { FrameworkFeature } from "../types/api";
import type { NamespacedId, WidgetRegistrationInfo } from "../types/plugin";

import {
  FrameworkContext,
  type InitializationError,
} from "../contexts/framework";

// Define the shape of the context value we will provide
interface MockFrameworkContextValue {
  error: InitializationError | null;
  framework: Framework | null;
  getAppName: () => string;
  getFeature: <T extends FrameworkFeature>(
    id: NamespacedId,
  ) => Promise<T> | undefined;
  getWidgetRegistrations: (areaId: string) => WidgetRegistrationInfo[];
  isLoading: boolean;
  reinitialize: () => void; // Mock reinitialize
}

interface MockFrameworkProviderProps {
  appName: string; // Still need appName for getAppName
  children: React.ReactNode;
  framework: Framework; // The mock framework instance to provide
}

export function MockFrameworkProvider({
  appName,
  children,
  framework,
}: MockFrameworkProviderProps) {
  // Create a context value that matches FrameworkContextValue
  const contextValue: MockFrameworkContextValue = {
    error: null, // Mock provider assumes no initialization errors
    framework: framework,
    getAppName: () => appName,
    getFeature: <T extends FrameworkFeature>(id: NamespacedId) => {
      // Provide a basic mock implementation for getFeature
      console.warn(
        `MockFrameworkProvider: getFeature(${id}) called. Returning undefined.`,
      );
      return undefined;
    },
    getWidgetRegistrations: () => {
      console.warn(
        "MockFrameworkProvider: getWidgetRegistrations() called. Returning empty array.",
      );
      return [];
    },
    isLoading: false, // Mock provider is always "loaded"
    reinitialize: () => {
      console.warn(
        "MockFrameworkProvider: reinitialize() called. No action taken.",
      );
    },
  };

  // Provide the mock value to the real FrameworkContext
  return (
    <FrameworkContext.Provider value={contextValue}>
      {children}
    </FrameworkContext.Provider>
  );
}
