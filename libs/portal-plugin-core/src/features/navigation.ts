import {
  CORE_NS,
  createNamespacedId,
  Framework,
  isNamespacedId,
  NamespacedId,
  NavigationFeature,
  NavigationItem,
  parseNamespacedId,
  Plugin,
  RouteDefinition,
} from "@lumeweb/portal-framework-core";

// Define symbols for inclusion criteria
const CHECK_TYPES = {
  DEFINED: Symbol('defined'),
  UNDEFINED_CHECK: Symbol('undefinedCheck')
} as const;

export function normalizeNameForId(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2") // Convert camelCase/PascalCase to kebab
    .replace(/[^a-zA-Z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

export function resolveFullPath(parentPath: string, childPath: string): string {
  if (childPath.startsWith("/")) {
    return childPath;
  }

  const base = parentPath.replace(/\/$/, "");
  if (!childPath) return base;
  if (!base) return childPath;
  return `${base}/${childPath}`;
}

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
        sanitizedPath,
      );
    }
    return createNamespacedId(
      "generated",
      sanitizedPath,
    );
  }

  // 3. Try to use component name if available
  if (route.component) {
    let componentName: string;
    if (route.component.includes(":")) {
      componentName = parseNamespacedId(
        route.component as NamespacedId,
      ).name;
    } else {
      componentName = route.component;
    }
    componentName = normalizeNameForId(componentName);
    if (pluginId) {
      return createNamespacedId(
        parseNamespacedId(pluginId).namespace,
        componentName,
      );
    }
    return createNamespacedId(
      "generated",
      componentName,
    );
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
        label,
      );
    }
    return createNamespacedId(
      "generated",
      label,
    );
  }

  // 5. Final fallback - hash the route object
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
  id: NamespacedId = createNamespacedId(CORE_NS, "navigation");
  status = "enabled" as const;
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
    parentPath = "",
  ): NavigationItem | null {
    if (!route.navigation) return null;

    const id = generateIdFromRoute(route, pluginId);

    const item: NavigationItem = {
      id,
      label: route.navigation.label,
      path: resolveFullPath(parentPath, route.path ?? ""),
    };

    // Define properties and their inclusion criteria
    const propMap = {
      badge: CHECK_TYPES.DEFINED,
      children: CHECK_TYPES.DEFINED,
      disabled: CHECK_TYPES.UNDEFINED_CHECK,
      hidden: CHECK_TYPES.UNDEFINED_CHECK,
      icon: CHECK_TYPES.DEFINED,
      order: CHECK_TYPES.UNDEFINED_CHECK,
      linkable: CHECK_TYPES.UNDEFINED_CHECK,
      show: CHECK_TYPES.DEFINED
    } as const;

    // Copy properties based on their inclusion criteria
    Object.entries(propMap).forEach(([prop, checkType]) => {
      const value = (route.navigation as any)[prop];
      if (checkType === CHECK_TYPES.UNDEFINED_CHECK && value !== undefined) {
        (item as any)[prop] = value;
      } else if (checkType === CHECK_TYPES.DEFINED && value !== undefined) {
        (item as any)[prop] = value;
      }
    });

    return item;
  }

  private shouldIncludeRouteInNavigation(route: RouteDefinition): boolean {
    return !!route.navigation && (!(route.index ?? false) || !!route.navigation.forceShowInNavigation);
  }

  /**
   * A route is eligible for navigation processing if it either has navigation
   * itself OR has children that might (e.g. a layout route with no navigation
   * but nested children that do have navigation).
   */
  private isEligibleForNavProcessing(route: RouteDefinition): boolean {
    if (this.shouldIncludeRouteInNavigation(route)) return true;
    if (route.children && route.children.length > 0) return true;
    return false;
  }

  private processRouteForNavigation(route: RouteDefinition, pluginId: NamespacedId, parentPath = "", parentId?: NamespacedId): NavigationItem[] {
    const item = this.createNavigationItem(route, pluginId, parentPath, parentId);

    // Route has no navigation itself — but it may have children that do
    // (e.g. a layout route). Process children without creating a nav item
    // for this route.
    if (!item) {
      const childPath = resolveFullPath(parentPath, route.path ?? "");
      return route.children
        ?.filter((child) => this.isEligibleForNavProcessing(child))
        .flatMap((child) =>
          this.processRouteForNavigation(child, pluginId, childPath, parentId),
        ) ?? [];
    }

    const childItems =
      route.children
        ?.filter((child) => this.isEligibleForNavProcessing(child))
        .flatMap((child) =>
          this.processRouteForNavigation(child, pluginId, item.path, item.id),
        ) ?? [];

    return [item, ...childItems];
  }

  buildNavigation(plugins: Plugin[]): NavigationItem[] {
    return plugins
      .flatMap(
        (plugin) =>
          plugin.routes
            ?.filter((route) => this.isEligibleForNavProcessing(route))
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
      // Routes are required to define their own namespaced IDs at definition time.
      // Per the namespace refactor design (Rule 6), we no longer normalize bare IDs here.
      if (!route.id) {
        throw new Error(
          `Route from plugin "${plugin.id}" is missing an id. All route IDs must be valid NamespacedId values defined at registration time.`,
        );
      }

      const routeId = route.id;

      // Components are bare export names resolved against the plugin's module loader,
      // not namespaced identifiers.
      const componentName = route.component;

      const componentData = {
        component: componentName,
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
        component: componentName,
        id: routeId,
        index: route.index ?? false,
        pluginId: plugin.id,
      };
    };

    // Detect duplicate route IDs and paths across plugins
    const seenIds = new Map<string, string>();
    const seenPaths = new Map<string, string>();
    for (const plugin of plugins) {
      for (const route of plugin.routes ?? []) {
        const routeId = route.id ?? generateIdFromRoute(route, plugin.id);
        if (seenIds.has(routeId)) {
          console.warn(
            `[Navigation] Duplicate route ID "${routeId}" — already registered by plugin "${seenIds.get(routeId)}", also declared by plugin "${plugin.id}". Last registration wins.`,
          );
        } else {
          seenIds.set(routeId, plugin.id);
        }
        const routePath = route.path ?? "";
        if (routePath && seenPaths.has(routePath)) {
          console.warn(
            `[Navigation] Duplicate route path "${routePath}" — already registered by plugin "${seenPaths.get(routePath)}", also declared by plugin "${plugin.id}". Last registration wins.`,
          );
        } else if (routePath) {
          seenPaths.set(routePath, plugin.id);
        }
      }
    }

    // Process all plugin routes
    const routePromises = plugins.flatMap(
      (plugin) =>
        plugin.routes?.map((route) => processRoute(route, plugin)) ?? [],
    );

    // Wait for all routes to be processed
    const routes = await Promise.all(routePromises);

    // Add the 404 route
    const notFoundRoute = {
      component: "NotFound",
      id: createNamespacedId(CORE_NS, "not-found"),
      index: false,
      path: "*",
      pluginId: createNamespacedId(CORE_NS, "core"),
    };

    routes.push(notFoundRoute);

    // Build and return the route tree
    return this.buildRouteTree(routes);
  }

  async initialize(framework: Framework): Promise<void> {
    this.#framework = framework;
  }

  private buildRouteTree(routes: RouteDefinition[]): RouteDefinition[] {
    // Validate and sort routes
    const validRoutes = routes.filter(route => this.validateRoute(route));

    // Sort routes based on path specificity
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
