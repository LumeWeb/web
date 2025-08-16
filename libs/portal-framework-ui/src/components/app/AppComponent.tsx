import {
  Builder,
  createNamespacedId,
  createRemoteComponentLoader,
  defaultRemoteOptions,
  ErrorDisplay,
  Framework,
  FrameworkProvider,
  getDefaultRefineOptions,
  HostContextBridge,
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

import { registerAllActionItems } from "@/components/actions";
import { registerAllFormComponents } from "@/components/form";
import { useAppStore } from "@/store/appStore";
import { useFrameworkSync } from "@/store/portalStore";

import { DialogProvider, DialogRenderer } from "../dialog";

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

  // Spread plugin configs into a single object for Refine
  const combinedPluginConfig = Object.assign({}, ...pluginConfigs);

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
      // @ts-ignore
      <Route
        element={finalElement}
        errorElement={<RouteErrorBoundary />}
        index={route.index}
        key={route.id}
        path={route.path}>
        {childRoutes}
      </Route>
    );
  }

  let router;

  if (routerRoutes.length > 0) {
    router = createBrowserRouter(routerRoutes);
  }

  const options = {
    ...combinedPluginConfig,
    options: getDefaultRefineOptions(),
    routerProvider,
  } satisfies Partial<RefineProps>;

  return (
    <Refine {...options}>
      <DialogProvider>
        {router && <RouterProvider router={router} />}
        {!router && <DialogRenderer />}
      </DialogProvider>
      <Toaster />
    </Refine>
  );
}

function getLazyComponent(
  componentString: string | undefined,
  pluginId: NamespacedId | undefined,
  framework: Framework, // Pass framework instance
  routeId: NamespacedId | string, // For logging
): ComponentType<any> | null {
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
    //@ts-ignore
    return createRemoteComponentLoader(
      { componentPath: componentName, pluginId: pluginId },
      framework,
      defaultRemoteOptions, // Assuming defaultRemoteOptions is accessible or passed
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
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-3 mt-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
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
        <HostContextBridge />
        {element}
      </>
    );
  };
}
export { AppComponent };
