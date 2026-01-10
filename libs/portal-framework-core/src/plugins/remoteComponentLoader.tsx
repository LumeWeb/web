import React, { ComponentType } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";

import type { Framework } from "../api/framework";
import type { NamespacedId } from "../types/plugin";

export interface RemoteComponentConfig {
  componentPath: string;
  pluginId: NamespacedId;
}

export interface RemoteComponentOptions {
  ErrorComponent: React.ComponentType<{
    error: Error;
    resetErrorBoundary: () => void;
  }>;
  LoadingComponent: React.ComponentType;
}

export function createRemoteComponentLoader(
  config: RemoteComponentConfig,
  framework: Framework,
  options: RemoteComponentOptions,
): React.ComponentType<RemoteComponentProps> {
  const { componentPath, pluginId } = config;

  const LoadingElement = <options.LoadingComponent />;
  const ErrorFallback = (props: FallbackProps) => (
    <options.ErrorComponent {...props} />
  );

  const loadRemoteModule = async () => {
    const modulePath = await framework.resolvePluginModule(
      pluginId,
      componentPath,
    );
    return framework._loadRemote(modulePath);
  };

  return createRemoteComponent({
    fallback: ErrorFallback,
    loader: async (): Promise<{ default: React.ComponentType<any> }> => {
      const module = await loadRemoteModule();
      const Component = module?.default ?? module;
      if (typeof Component !== "function" && typeof Component !== "object") {
        throw new Error(
          `Remote module ${pluginId}:${componentPath} did not export a default React component.`,
        );
      }
      return { default: Component as React.ComponentType<any> };
    },
    loading: LoadingElement,
  });
}

export const DefaultErrorComponent: React.FC<{
  error: Error;
  resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => (
  <div>
    <h3>Error loading component</h3>
    <pre>{error.message}</pre>
    <button onClick={resetErrorBoundary}>Retry</button>
  </div>
);

export const DefaultLoadingComponent: React.FC = () => <div>Loading...</div>;

export const defaultRemoteOptions: RemoteComponentOptions = {
  ErrorComponent: DefaultErrorComponent,
  LoadingComponent: DefaultLoadingComponent,
};

export interface RemoteComponentParams<
  T = Record<string, unknown>,
  E extends keyof T = keyof T,
> {
  export?: E;
  fallback: React.ComponentType<FallbackProps>;
  loader: () => Promise<T>;
  loading: React.ReactNode;
  props?: T;
}

export interface RemoteComponentProps<T = Record<string, unknown>> {
  [key: string]: unknown;
  fallback?: React.ComponentType<FallbackProps>;
  loading?: React.ReactNode;
  props?: T;
}

export function createRemoteComponent<
  T extends { default: React.ComponentType<any> },
  E extends keyof T = keyof T,
>(info: LazyRemoteComponentInfo<T, E>) {
  const LazyComponent = createLazyRemoteComponent(info);
  return (
    {
      ref,
      ...props
    }: RemoteComponentProps & {
      ref: React.RefObject<HTMLDivElement>;
    }
  ) => {
    // Destructure to separate wrapper props from component props
    const { props: componentProps } = props;

    return (
      (<ErrorBoundary FallbackComponent={info.fallback}>
        <React.Suspense fallback={info.loading}>
          {componentProps !== undefined ? (
            //@ts-ignore
            (<LazyComponent {...componentProps} />)
          ) : (
            //@ts-ignore
            (<LazyComponent />)
          )}
        </React.Suspense>
      </ErrorBoundary>)
    );
  };
}

type LazyRemoteComponentInfo<T, E extends keyof T> = RemoteComponentParams<T>;

function createLazyRemoteComponent<
  T extends { default: React.ComponentType<any> },
  E extends keyof T = keyof T,
>(info: LazyRemoteComponentInfo<T, E>) {
  const exportName = (info?.export || "default") as E;
  return React.lazy(async () => {
    const m = await info.loader();
    const moduleName = (m as any)?.[Symbol.for("mf_module_id")];
    const exportFn = m[exportName];

    if (typeof exportFn === "function" || typeof exportFn === "object") {
      return {
        default: exportFn as T["default"],
      };
    }
    throw new Error(
      `Remote module ${moduleName || "unknown"} did not export a valid React component for export "${String(exportName)}"`,
    );
  });
}
