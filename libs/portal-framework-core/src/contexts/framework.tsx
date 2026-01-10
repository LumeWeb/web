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
import type { BaseCapability } from "../types/capabilities";

import { Builder } from "../api/builder";
import { Framework } from "../api/framework";
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

export function useFrameworkData<T>(
  fetchData: () => Promise<T>,
  deps: React.DependencyList = [],
) {
  const { framework, isLoading: frameworkLoading, error: frameworkError } = useFramework();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    if (frameworkError) {
      if (mounted) {
        setError(frameworkError);
        setIsLoading(false);
      }
      return;
    } else if (frameworkLoading) {
      if (mounted) {
        setIsLoading(true);
      }
      return;
    }

    // If we get here, framework is ready
    setIsLoading(true);
    setError(null);

    fetchData()
      .then((result) => {
        if (mounted) {
          setData(result);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err);
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [framework, frameworkLoading, frameworkError, fetchData, ...deps]);

  return {
    data,
    error,
    isLoading,
  };
}



export function useCapability<T extends BaseCapability>(id: string) {
  const { framework } = useFramework();
  const fetchCapability = useCallback(() => {
    if (!framework) {
      throw new Error("Framework not initialized");
    }
    return framework.getCapability<T>(id);
  }, [framework, id]);

  return useFrameworkData<T>(fetchCapability);
}

export function useFeature<T extends FrameworkFeature>(id: NamespacedId) {
  const { framework } = useFramework();
  const fetchFeature = useCallback(() => {
    if (!framework) {
      throw new Error("Framework not initialized");
    }
    return framework.getFeature<T>(id);
  }, [framework, id]);

  return useFrameworkData<T>(fetchFeature);
}

export function useCapabilitiesByType<T extends BaseCapability>(typeId: string) {
  const { framework } = useFramework();
  const fetchByType = useCallback(() => {
    if (!framework) {
      throw new Error("Framework not initialized");
    }
    return framework.getCapabilitiesByType<T>(typeId);
  }, [framework, typeId]);

  return useFrameworkData<T[]>(fetchByType);
}
