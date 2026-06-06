import {
  Builder,
  createNamespacedId,
  createRemoteComponentLoader,
  defaultRemoteOptions,
  ErrorDisplay,
  Framework,
  FrameworkProvider,
  getDefaultRefineOptions,
  NamespacedId,
  NavigationFeature,
  NavigationItem,
  parseNamespacedId,
  RefineConfigCapability,
  type RouteDefinition,
  RouteErrorBoundary,
  RouteErrorBoundaryFallback,
  useFramework,
} from "@lumeweb/portal-framework-core";
import { Toaster } from "@lumeweb/portal-framework-ui-core";
import { Refine, RefineProps } from "@refinedev/core";
import routerProvider from "@refinedev/react-router";
import React, { type ComponentType, useCallback, useEffect } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router";

import { useIdentifyUser } from "@lumeweb/portal-analytics";
import { registerAllActionItems } from "@/components/actions";
import { registerAllFormComponents } from "@/components/form";
import { Loading } from "@/components/Loading";
import { useAppStore } from "@/store/appStore";
import { useFrameworkSync } from "@/store/portalStore";

import { DialogProvider, DialogRenderer } from "@/components";

// Register all form components at module load time
registerAllFormComponents();
registerAllActionItems();

export interface AppComponentProps {
  /** Whether to load navigation structure (default: true) */
  loadNavigation?: boolean;
  /** Whether to load route configurations (default: true) */
  loadRoutes?: boolean;
  /** Application name that will be used in the framework (default: "app") */
  name?: string;
}

type AppContentProps = AppComponentProps;

function AppComponent({
  loadNavigation = true,
  loadRoutes = true,
  name = "app",
}: AppComponentProps) {
  // Memoize the configure function to prevent unnecessary re-renders
  const configureBuilder = useCallback((builder: Builder) => {
    return builder;
  }, []);

  return (
    <FrameworkProvider appName={name} configure={configureBuilder}>
      <AppContent loadNavigation={loadNavigation} loadRoutes={loadRoutes} />
    </FrameworkProvider>
  );
}

function AppContent({
  loadNavigation = true,
  loadRoutes = true,
}: AppContentProps) {
  const {
    error: frameworkError,
    framework,
    isLoading: isFrameworkLoading,
  } = useFramework();
  const addMenuItems = useAppStore((state) => state.addMenuItems);
  const error = useAppStore((state) => state.error);
  const isLoading = useAppStore((state) => state.isLoading);
  const pluginConfigs = useAppStore((state) => state.pluginConfigs);
  const routes = useAppStore((state) => state.routes);
  const setError = useAppStore((state) => state.setError);
  const setIsLoading = useAppStore((state) => state.setIsLoading);
  const setPluginConfigs = useAppStore((state) => state.setPluginConfigs);
  const setRoutes = useAppStore((state) => state.setRoutes);
  useFrameworkSync();
  // Load navigation data and plugin configs when framework is ready
  useEffect(() => {
    if (!framework || isFrameworkLoading) {
      return;
    }

    let mounted = true;

    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
        // Load navigation feature and capabilities in parallel
        let navigationFeature: NavigationFeature | undefined;
        let capabilities: RefineConfigCapability[] = [];
        let routes: RouteDefinition[] = [];
        let navigation: NavigationItem[] = [];

        if (loadNavigation) {
          navigationFeature = await framework!.getFeature<NavigationFeature>(
            createNamespacedId("core", "navigation"),
          );
        }

        if (loadRoutes) {
          capabilities =
            await framework!.getCapabilitiesByType<RefineConfigCapability>(
              "core:refine-config",
            );
        }

        // Load routes and navigation if feature is enabled
        if (navigationFeature) {
          [routes, navigation] = await Promise.all([
            navigationFeature.getRoutes(),
            navigationFeature.getNavigation(),
          ]);
        }

        // Get configs from capabilities if routes are enabled
        const configs = loadRoutes
          ? (() => {
              let lastConfig: Partial<RefineProps> = [] as Partial<RefineProps>;
              return capabilities.map((cap) => {
                const latestConfig = cap.getConfig(lastConfig);

                lastConfig = Object.assign({}, lastConfig, latestConfig);

                return lastConfig;
              });
            })()
          : [];

        if (mounted) {
          setRoutes(routes);
          addMenuItems(navigation);
          setPluginConfigs(configs);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error
              ? err
              : new Error("Failed to load navigation data"),
          );
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [
    framework,
    isFrameworkLoading,
    loadNavigation,
    loadRoutes,
    setError,
    setIsLoading,
    setRoutes,
    setPluginConfigs,
    addMenuItems,
  ]);

  const combinedPluginConfig = Object.assign({}, ...pluginConfigs);

  const options = {
    ...combinedPluginConfig,
    options: getDefaultRefineOptions(),
    routerProvider,
  } satisfies Partial<RefineProps>;

  return (
    <Refine {...options}>
      <AppContentInner
        error={error}
        framework={framework}
        frameworkError={frameworkError}
        isFrameworkLoading={isFrameworkLoading}
        isLoading={isLoading}
        loadNavigation={loadNavigation}
        loadRoutes={loadRoutes}
        routes={routes}
      />
    </Refine>
  );
}

function AppContentInner({
  error,
  framework,
  frameworkError,
  isFrameworkLoading,
  isLoading,
  loadNavigation,
  loadRoutes,
  routes,
}: {
  error: Error | null;
  framework: Framework | null;
  frameworkError: Error | null;
  isFrameworkLoading: boolean;
  isLoading: boolean;
  loadNavigation: boolean;
  loadRoutes: boolean;
  routes: null | RouteDefinition[];
}) {
  useIdentifyUser();

  // Show loading state while framework is loading or we're loading navigation
  if (isFrameworkLoading || isLoading) {
    return <LoadingSpinner />;
  }

  // Show framework errors first
  if (frameworkError) {
    return (
      <ErrorDisplay
        error={frameworkError}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Show errors only if features are enabled
  if (error && (loadNavigation || loadRoutes)) {
    return (
      <ErrorDisplay error={error} onRetry={() => window.location.reload()} />
    );
  }

  // Wait for navigation data before rendering routes
  if (!routes) {
    return null;
  }

  const routerRoutes = createRoutesFromElements(
    Array.isArray(routes)
      ? routes.map((route: RouteDefinition) =>
          createRouteElement(route, framework!),
        )
      : [],
  );

  function createRouteElement(
    route: RouteDefinition,
    framework: Framework,
    child = false,
  ): React.ReactNode {
    const LazyComponent = getLazyComponent(
      route.component ?? "",
      route.pluginId ?? createNamespacedId("core", "fallback"),
      framework,
      route.id!,
    );

    const jsxElement = LazyComponent ? <LazyComponent /> : null;
    const finalElement = jsxElement ? (
      withRouteContainer(jsxElement, !child)()
    ) : (
      // Use RouteErrorBoundaryFallback directly when component loading fails
      <RouteErrorBoundaryFallback
        error={new Error(`Failed to load element for route ${route.id}`)}
      />
    );

    const childRoutes = route.children?.map((childRoute: RouteDefinition) =>
      createRouteElement(childRoute, framework, true),
    );

    return (
      <Route
        element={finalElement}
        errorElement={<RouteErrorBoundary />}
        index={route.index}
        path={route.path}>
        {childRoutes}
      </Route>
    );
  }

  let router;

  if (routerRoutes.length > 0) {
    router = createBrowserRouter(routerRoutes);
  }

  return (
    <>
      <DialogProvider>
        {router && <RouterProvider router={router} />}
        {!router && <DialogRenderer />}
      </DialogProvider>
      <Toaster />
    </>
  );
}

function getLazyComponent(
  componentString: string | undefined,
  pluginId: NamespacedId | undefined,
  framework: Framework, // Pass framework instance
  routeId: NamespacedId | string, // For logging
): ComponentType<unknown> | null {
  if (!componentString || !pluginId) {
    console.error(
      `Route Error: Missing component string or pluginId for route id ${routeId}`,
    );
    return () => (
      <RouteErrorBoundaryFallback
        error={new Error(`Missing component/pluginId for route ${routeId}`)}
      />
    );
  }

  let componentName: string;
  try {
    if (componentString.includes(":")) {
      componentName = parseNamespacedId(componentString as NamespacedId).name;
    } else {
      componentName = componentString;
    }
  } catch (e) {
    console.error(
      `Route Error: Failed to parse component string "${componentString}" for route id ${routeId}`,
      e,
    );
    return () => (
      <RouteErrorBoundaryFallback
        error={new Error(`Invalid component string format: ${componentString}`)}
      />
    );
  }

  if (!componentName) {
    console.error(
      `Route Error: Could not extract componentName from "${componentString}" for route id ${routeId}`,
    );
    return () => (
      <RouteErrorBoundaryFallback
        error={new Error(`Invalid component name from: ${componentString}`)}
      />
    );
  }

  try {
    //@ts-expect-error -- createRemoteComponentLoader return type mismatch
    return createRemoteComponentLoader(
      { componentPath: componentName, pluginId: pluginId },
      framework,
      {
        ...defaultRemoteOptions,
        LoadingComponent: Loading,
      }, // Assuming defaultRemoteOptions is accessible or passed
    );
  } catch (e) {
    console.error(
      `Route Error: Failed createRemoteComponentLoader for ${pluginId}:${componentName}`,
      e,
    );
    return () => (
      <RouteErrorBoundaryFallback
        error={
          new Error(`Failed to create loader for ${pluginId}:${componentName}`)
        }
      />
    );
  }
}

function LoadingSpinner() {
  return (
    <div>
      <div className="animate-pulse">
        <div className="h-4 w-3/4 rounded bg-gray-200"></div>
        <div className="mt-4 space-y-3">
          <div className="h-4 rounded bg-gray-200"></div>
          <div className="h-4 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
}

function withRouteContainer(element: React.ReactNode, renderDialog: boolean) {
  return function RouteContainerHOC() {
    return (
      <>
        {renderDialog && <DialogRenderer />}
        {element}
      </>
    );
  };
}
export { AppComponent };
