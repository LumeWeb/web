import {
  createBridgeComponent as baseCreateBridgeComponent,
  type ProviderParams,
  type RenderParams,
} from "@module-federation/bridge-react/v18";
import React, {
  ComponentType,
  forwardRef,
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
} from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";

import type { Framework } from "../api/framework";
import type { NamespacedId } from "../types/plugin";

import { RemoteContextBridge, store } from "./context-bridge";

export interface BridgeResult<T> {
  destroy(info: { dom: HTMLElement; moduleName: string }): void; // Change Promise<void> to void
  render(info: Record<string, unknown> & RenderParams): Promise<void>;
}

export interface RemoteComponentConfig {
  componentPath: string;
  pluginId: NamespacedId;
  strategy?: "bridge" | "no-bridge";
}

export interface RemoteComponentOptions {
  ErrorComponent: React.ComponentType<{
    error: Error;
    resetErrorBoundary: () => void;
  }>;
  LoadingComponent: React.ComponentType;
}

type BridgeableComponent<T> =
  | ComponentType<T>
  | ForwardRefExoticComponent<PropsWithoutRef<T> & RefAttributes<any>>;

export function createRemoteComponentLoader(
  config: RemoteComponentConfig,
  framework: Framework,
  options: RemoteComponentOptions,
):
  | (() => Promise<BridgeResult<any>>)
  | React.ComponentType<RemoteComponentProps> {
  const { componentPath, pluginId, strategy = "no-bridge" } = config;

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

  if (strategy === "bridge") {
    return async () => {
      const module = await loadRemoteModule();
      const Component = module.default || module;
      if (typeof Component !== "function" && typeof Component !== "object") {
        throw new Error(
          `Remote module ${pluginId}:${componentPath} did not export a valid React component.`,
        );
      }
      const bridgeFactory = createBridgeComponent(Component);
      return bridgeFactory();
    };
  } else {
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

export interface RenderFnParams extends ProviderParams {
  dom: HTMLElement;
}

type LazyRemoteComponentInfo<T, E extends keyof T> = RemoteComponentParams<T>;

interface RemoteModule {
  [key: string]: any; // Allow indexing with any string key
  [key: symbol]: any; // Allow indexing with any symbol key
  provider?: () => {
    destroy: (info: { dom: any }) => void;
    // Make provider optional if not always present
    render: (info: RenderFnParams) => void;
  };
}

export function createBridgeComponent<T>(
  Component: ComponentType<T>,
): () => BridgeResult<T> {
  type ComponentRef = React.ElementRef<typeof Component>;

  const WrappedComponent: BridgeableComponent<T> = forwardRef<ComponentRef, T>(
    (props, ref) => {
      return store
        .getRegisteredContextIds()
        .reduce(
          (children, contextId) => (
            <RemoteContextBridge contextId={contextId}>
              {children}
            </RemoteContextBridge>
          ),
          <Component {...props} ref={ref} />,
        );
    },
  );

  WrappedComponent.displayName = `Bridge(${
    (Component.displayName ?? Component.name) || "Component"
  })`;

  const bridge = baseCreateBridgeComponent<T>({
    rootComponent: WrappedComponent as ComponentType<T>,
  });

  return () => bridge();
}

export function createRemoteComponent<
  T extends { default: React.ComponentType<any> },
  E extends keyof T = keyof T,
>(info: LazyRemoteComponentInfo<T, E>) {
  const LazyComponent = createLazyRemoteComponent(info);
  return forwardRef<HTMLDivElement, RemoteComponentProps>((props, ref) => {
    // Destructure to separate wrapper props from component props
    const { props: componentProps } = props;

    return (
      <ErrorBoundary FallbackComponent={info.fallback}>
        <React.Suspense fallback={info.loading}>
          {componentProps !== undefined ? (
            //@ts-ignore
            <LazyComponent {...componentProps} />
          ) : (
            //@ts-ignore
            <LazyComponent />
          )}
        </React.Suspense>
      </ErrorBoundary>
    );
  });
}

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
