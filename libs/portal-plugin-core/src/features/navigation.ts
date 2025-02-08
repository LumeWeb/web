import {
  createNamespacedId,
  createRemoteComponentLoader,
  defaultRemoteOptions,
  Framework,
  isNamespacedId,
  NamespacedId,
  NavigationFeature,
  NavigationItem,
  normalizeId,
  parseNamespacedId,
  Plugin,
  RouteDefinition,
  RouteErrorBoundary,
} from "@lumeweb/portal-framework-core";
import { createElement, ReactNode } from "react";

export function generateIdFromRoute(
  route: RouteDefinition,
  pluginId: NamespacedId | undefined,
): NamespacedId {
  // 1. Use existing ID if available and valid
  if (route.id && isNamespacedId(route.id)) {
    return route.id;
  }

  // 2. Try to use path if available
  const path = route.path || (route.index ? "index" : null);
  if (path) {
    // Remove leading/trailing slashes and spaces, replace invalid chars with hyphens,
    // then collapse multiple hyphens and remove leading/trailing hyphens
    const sanitizedPath = path
      .replace(/^\/|\/$/g, '') // Remove leading/trailing slashes
      .replace(/[^a-zA-Z0-9-]/g, "-") // Replace invalid chars with hyphens
      .replace(/-+/g, "-") // Collapse multiple hyphens
      .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
    if (pluginId) {
      return createNamespacedId(
        parseNamespacedId(pluginId).namespace,
        sanitizedPath
      );
    }
    return createNamespacedId("generated", sanitizedPath);
  }

  // 3. Try to use component name if available
  if (route.component) {
    let componentName = route.component;
    if (isNamespacedId(route.component)) {
      componentName = parseNamespacedId(route.component).name;
    }
    if (pluginId) {
      return createNamespacedId(
        parseNamespacedId(pluginId).namespace,
        componentName
      );
    }
    return createNamespacedId("generated", componentName);
  }

  // 4. Try to use navigation label if available
  if (route.navigation?.label) {
    const label = route.navigation.label
      .replace(/[^a-zA-Z0-9]/g, "-") // Replace invalid chars with hyphens
      .replace(/-+/g, "-") // Collapse multiple hyphens
      .replace(/^-|-$/g, "") // Remove leading/trailing hyphens
      .toLowerCase();
    if (pluginId) {
      return createNamespacedId(
        parseNamespacedId(pluginId).namespace,
        label
      );
    }
    return createNamespacedId("generated", label);
  }

  // 5. Use parent reference if available
  if (route.parentId) {
    return createNamespacedId(
      parseNamespacedId(route.parentId).namespace,
      "child",
    );
  }

  // 6. Final fallback - hash the route object
  const routeString = JSON.stringify(route);
  let hash = 0;
  for (let i = 0; i < routeString.length; i++) {
    hash = (hash << 5) - hash + routeString.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return createNamespacedId(
    "generated",
    `route-${Math.abs(hash).toString(36)}`,
  );
}

export class Navigation implements NavigationFeature {
  id: NamespacedId = createNamespacedId("core", "navigation");
  version = "0.1.0";

  #framework?: Framework;

  async destroy(): Promise<void> {
    this.#framework = undefined;
  }

  getNavigation(): NavigationItem[] {
    if (!this.#framework) {
      throw new Error("Navigation feature not initialized");
    }

    return this.buildNavigation(Array.from(this.#framework.getPlugins()));
  }

  private createNavigationItem(
    route: RouteDefinition,
    pluginId: NamespacedId,
  ): NavigationItem | null {
    if (!route.navigation) return null;

    const id = generateIdFromRoute(route, pluginId);

    const item: NavigationItem = {
      id,
      label: route.navigation.label,
      path: route.path ?? "",
    };

    if (route.navigation.badge) item.badge = route.navigation.badge;
    if (route.navigation.children) item.children = route.navigation.children;
    if (route.navigation.disabled !== undefined)
      item.disabled = route.navigation.disabled;
    if (route.navigation.hidden !== undefined)
      item.hidden = route.navigation.hidden;
    if (route.navigation.icon) item.icon = route.navigation.icon;
    if (route.navigation.order !== undefined)
      item.order = route.navigation.order;
    if (route.navigation.show) item.show = route.navigation.show;

    return item;
  }

  private shouldIncludeRouteInNavigation(route: RouteDefinition): boolean {
    return !!route.navigation && !route.index;
  }

  private processRouteForNavigation(route: RouteDefinition, pluginId: NamespacedId): NavigationItem[] {
    const item = this.createNavigationItem(route, pluginId);
    if (!item) {
      return [];
    }

    const childItems =
      route.children
        ?.filter((child) => this.shouldIncludeRouteInNavigation(child))
        .map((child) => {
          const childItem = this.createNavigationItem(child, pluginId);
          if (childItem) {
            childItem.parentId = item.id; // Set parentId for navigation hierarchy
          }
          return childItem;
        })
        .filter((item): item is NavigationItem => item !== null) ?? [];

    return [item, ...childItems];
  }

  buildNavigation(plugins: Plugin[]): NavigationItem[] {
    return plugins
      .flatMap(
        (plugin) =>
          plugin.routes
            ?.filter((route) => this.shouldIncludeRouteInNavigation(route))
            .flatMap((route) =>
              this.processRouteForNavigation(route, plugin.id),
            ) ?? [],
      )
      .sort((a, b) => {
        // First sort by whether order is defined (undefined orders come last)
        if (a.order === undefined && b.order !== undefined) return 1;
        if (a.order !== undefined && b.order === undefined) return -1;

        // Then sort by order value ascending
        const orderCompare = (a.order ?? 0) - (b.order ?? 0);
        if (orderCompare !== 0) return orderCompare;

        // Then preserve original plugin registration order
        return 0;
      });
  }

  async getRoutes(): Promise<RouteDefinition[]> {
    if (!this.#framework) {
      throw new Error("Navigation feature not initialized");
    }

    return this.buildRoutes(Array.from(this.#framework?.getPlugins()));
  }

  async buildRoutes(plugins: Plugin[]): Promise<RouteDefinition[]> {
    // Process a single route and its children
    const processRoute = async (
      route: RouteDefinition,
      plugin: Plugin,
    ): Promise<RouteDefinition> => {
      const routeId = route.id
        ? normalizeId(plugin.id, route.id)
        : createNamespacedId(
            plugin.id,
            route.path || (route.index ? "index" : "unnamed-route"),
          );

      const normalizedComponent = route.component
        ? normalizeId(plugin.id, route.component)
        : undefined;

      const componentData = {
        component: normalizedComponent,
        id: routeId,
        pluginId: plugin.id,
      };

      // Process children recursively if they exist
      const processedChildren = route.children
        ? await Promise.all(
            route.children.map((child) => processRoute(child, plugin)),
          )
        : undefined;

      return {
        ...route,
        ...componentData,
        caseSensitive: route.caseSensitive ?? false,
        children: processedChildren,
        component: normalizedComponent!,
        id: routeId,
        index: route.index ?? false,
        pluginId: plugin.id,
      };
    };

    // Process all plugin routes (no parentId passing)
    const routePromises = plugins.flatMap(
      (plugin) =>
        plugin.routes?.map((route) => processRoute(route, plugin)) ?? [],
    );

    // Wait for all routes to be processed
    const routes = await Promise.all(routePromises);

    // Add the 404 route
    const notFoundRoute = {
      component: normalizeId(createNamespacedId("core", "core"), "NotFound"),
      id: createNamespacedId("core", "not-found"),
      index: false,
      path: "*",
      pluginId: createNamespacedId("core", "core"),
    };

    /*    const notFoundComponentData = await this.loadRouteComponent({
      ...notFoundRoute,
      pluginId: createNamespacedId("core", "core"),
    });*/

    routes.push({
      ...notFoundRoute,
      //   ...notFoundComponentData,
    });

    // Build and return the route tree
    return this.buildRouteTree(routes);
  }

  async initialize(framework: Framework): Promise<void> {
    this.#framework = framework;
  }
  private buildRouteTree(routes: RouteDefinition[]): RouteDefinition[] {
    // Just validate and sort routes - no parentId handling needed
    const validRoutes = routes.filter(route => this.validateRoute(route));

    // Sort routes based on React Router's path ranking logic
    return validRoutes.sort((a, b) => {
      // Root paths come first
      if (a.path === "/" && b.path !== "/") return -1;
      if (b.path === "/" && a.path !== "/") return 1;

      // More specific paths come first
      const aSegments = a.path!.split("/").filter(Boolean);
      const bSegments = b.path!.split("/").filter(Boolean);
      return bSegments.length - aSegments.length;
    });
  }

  private async loadRouteComponent(
    route: RouteDefinition & { pluginId: NamespacedId },
  ): Promise<Partial<RouteDefinition>> {
    if (!this.#framework) {
      throw new Error("Navigation feature not initialized");
    }

    if (route.component) {
      try {
        // First normalize the component path if it's not already done
        const normalizedComponent = isNamespacedId(route.component)
          ? route.component
          : normalizeId(route.pluginId, route.component);

        const componentPath = parseNamespacedId(normalizedComponent).name;

        const Component = await createRemoteComponentLoader(
          {
            componentPath,
            pluginId: route.pluginId,
          },
          this.#framework,
          defaultRemoteOptions,
        );

        return {
          element: createElement(Component) as ReactNode,
          index: route.index ?? false,
        };
      } catch (error) {
        console.error(
          `Failed to load component for route ${route.path}:`,
          error,
        );
        return {
          element: createElement(RouteErrorBoundary),
        };
      }
    }
    return {};
  }

  private routeExists(path: string): boolean {
    return Array.from(this.#framework!.getPlugins()).some((plugin) =>
      plugin.routes?.some((route) => route.path === path),
    );
  }

  private validateRoute(route: RouteDefinition): boolean {
    if (!route.path) {
      console.warn(`Route from plugin is missing a path`);
      return false;
    }

    if (!route.component && !route.element) {
      console.warn(`Route from plugin has no component or element`);
      return false;
    }

    if (!route.id) {
      console.warn(`Route from plugin is missing an id`);
      return false;
    }

    return true;
  }
}

export function createNavigationFeature(): NavigationFeature {
  return new Navigation();
}
