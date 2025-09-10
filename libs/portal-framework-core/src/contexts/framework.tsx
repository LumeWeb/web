import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import type { NamespacedId } from "../types/plugin";
import type { WidgetAreaDefinition, WidgetDefinition } from "../types/widget";

import { Builder } from "../api/builder";
import { Framework } from "../api/framework";
import { registerBridgedContext } from "../plugins/context-bridge";
import { FrameworkFeature } from "../types/api";
import {
  initializeFramework,
  shouldInitialize,
} from "../util/framework-initializer";

export interface InitializationError extends Error {
  errors?: Map<string, Error>;
}

interface FrameworkContextValue {
  error: InitializationError | null;
  framework: Framework | null;
  getAppName: () => string;
  getWidgetArea: (id: string) => WidgetAreaDefinition;
  getWidgetsForArea: (id: string) => WidgetDefinition[];
  isLoading: boolean;
  reinitialize: () => void;
}

export const FrameworkContext = createContext<FrameworkContextValue | null>(
  null,
);

registerBridgedContext(FrameworkContext);

interface FrameworkProviderProps {
  appName: string;
  children: React.ReactNode;
  configure: (builder: Builder) => Builder;
}

const isDev = true;

export function FrameworkProvider({
  appName,
  children,
  configure,
}: FrameworkProviderProps) {
  const builderRef = useRef<Builder>();
  const frameworkRef = useRef<Framework>();
  const [state, setState] = useState<{
    error: InitializationError | null;
    framework: Framework | null;
    isLoading: boolean;
  }>({
    error: null,
    framework: null,
    isLoading: true,
  });

  const initializeFrameworkInstance = useCallback(async () => {
    try {
      // Check if we need to reinitialize
      if (!shouldInitialize(builderRef.current, frameworkRef.current)) {
        setState({
          error: null,
          framework: frameworkRef.current!,
          isLoading: false,
        });
        // Emit boot completion event
        document.dispatchEvent(new CustomEvent('portal:boot:complete', {
          detail: { success: true, error: null }
        }));
        return;
      }

      setState((prev) => ({ ...prev, error: null, isLoading: true }));

      const result = await initializeFramework({
        appName,
        configure,
        existingBuilder: builderRef.current,
      });

      builderRef.current = result.builder;
      frameworkRef.current = result.framework;

      if (result.errors) {
        throw Object.assign(new Error("Framework initialization failed"), {
          errors: result.errors,
        });
      }

      setState({
        error: null,
        framework: result.framework,
        isLoading: false,
      });
      
      // Emit boot completion event on success
      document.dispatchEvent(new CustomEvent('portal:boot:complete', {
        detail: { success: true, error: null }
      }));
    } catch (err) {
      isDev && console.error("[FrameworkProvider] Initialization error:", err);
      
      if (isDev && err && typeof err === 'object' && 'errors' in err) {
        console.error("[FrameworkProvider] Individual errors:");
        for (const [key, error] of Object.entries(err.errors)) {
          console.error(`  ${key}:`, error);
        }
      }

      const error =
        err instanceof Error
          ? err
          : new Error("Failed to initialize framework");
      setState({
        error: error as InitializationError,
        framework: null,
        isLoading: false,
      });
      
      // Emit boot completion event on error
      document.dispatchEvent(new CustomEvent('portal:boot:complete', {
        detail: { success: false, error }
      }));
    }
  }, [appName, configure]);

  useEffect(() => {
    initializeFrameworkInstance();
  }, [appName, configure, initializeFrameworkInstance]);

  const contextValue: FrameworkContextValue = {
    error: state.error,
    framework: state.framework,
    getAppName: () => appName,
    getWidgetArea: (id: string) => {
      if (!state.framework) {
        throw new Error("Framework not initialized");
      }
      return state.framework.getWidgetArea(id);
    },
    getWidgetsForArea: (id: string) => {
      if (!state.framework) {
        throw new Error("Framework not initialized");
      }
      return state.framework.getWidgetsForArea(id);
    },
    isLoading: state.isLoading,
    reinitialize: initializeFrameworkInstance,
  };

  return (
    <FrameworkContext.Provider value={contextValue}>
      {children}
    </FrameworkContext.Provider>
  );
}

export function useFramework() {
  const context = useContext(FrameworkContext);
  if (!context) {
    throw new Error("useFramework must be used within a FrameworkProvider");
  }
  return context as FrameworkContextValue;
}

export function useFrameworkLoading() {
  const context = useContext(FrameworkContext);
  if (!context) {
    throw new Error(
      "useFrameworkLoading must be used within a FrameworkProvider",
    );
  }
  return {
    error: context.error,
    isLoading: context.isLoading,
    reinitialize: context.reinitialize,
  };
}
