import { describe, it, expect, vi } from "vitest";
import {
  createNavigationFeature,
  Navigation,
  generateIdFromRoute,
} from "./navigation";
import type { Plugin, RouteDefinition } from "@lumeweb/portal-framework-core";
import { createElement } from "react";

describe("generateIdFromRoute", () => {
  it("should use existing ID when available", () => {
    const route = { id: "plugin1:existing-id" } as RouteDefinition;
    const result = generateIdFromRoute(route, "plugin1:test");
    expect(result).toBe("plugin1:existing-id");
  });

  it("should generate ID from path when no ID exists", () => {
    const route = { path: "/test-path" } as RouteDefinition;
    const result = generateIdFromRoute(route, "plugin1:test");
    expect(result).toBe("plugin1:test-path");
  });

  it("should sanitize path for ID generation", () => {
    const route = {
      path: "/test/path with spaces & symbols!",
    } as RouteDefinition;
    const result = generateIdFromRoute(route, "plugin1:test");
    expect(result).toBe("plugin1:test-path-with-spaces-symbols");
  });

  it("should use 'index' for index routes without path", () => {
    const route = { index: true } as RouteDefinition;
    const result = generateIdFromRoute(route, "plugin1:test");
    expect(result).toBe("plugin1:index");
  });

  it("should generate ID from component name when no path exists", () => {
    const route = { component: "TestComponent" } as RouteDefinition;
    const result = generateIdFromRoute(route, "plugin1:test");
    expect(result).toBe("plugin1:TestComponent");
  });

  it("should extract name from namespaced component ID", () => {
    const route = { component: "plugin2:TestComponent" } as RouteDefinition;
    const result = generateIdFromRoute(route, "plugin1:test");
    expect(result).toBe("plugin1:TestComponent");
  });

  it("should generate ID from navigation label when no component exists", () => {
    const route = { navigation: { label: "Test Label" } } as RouteDefinition;
    const result = generateIdFromRoute(route, "plugin1:test");
    expect(result).toBe("plugin1:test-label");
  });

  it("should sanitize navigation label for ID generation", () => {
    const route = {
      navigation: { label: "Test Label & More!" },
    } as RouteDefinition;
    const result = generateIdFromRoute(route, "plugin1:test");
    expect(result).toBe("plugin1:test-label-more");
  });

  it("should use parent reference when parentId exists", () => {
    const route = { parentId: "plugin1:parent" } as RouteDefinition;
    const result = generateIdFromRoute(route, "plugin1:test");
    expect(result).toBe("plugin1:child");
  });

  it("should generate hash-based ID as fallback", () => {
    const route = {} as RouteDefinition;
    const result = generateIdFromRoute(route, "plugin1:test");
    expect(result).toMatch(/^generated:route-[a-z0-9]+$/);
  });

  it("should use 'generated' namespace when no pluginId provided", () => {
    const route = { component: "TestComponent" } as RouteDefinition;
    const result = generateIdFromRoute(route, undefined);
    expect(result).toBe("generated:TestComponent");
  });
});

describe("Navigation Feature", () => {
  const navigationFeature = createNavigationFeature() as unknown as Navigation;
  it("should build navigation items from plugins with routes and navigation properties", async () => {
    const mockPlugins: Plugin[] = [
      {
        id: "plugin1:core",
        routes: [
          {
            id: "plugin1:route1",
            path: "/route1",
            component: "Component1",
            navigation: { label: "Route 1" },
          },
        ],
        destroy: vi.fn(),
        initialize: vi.fn(),
        features: [], // Added features
        capabilities: [], // Added capabilities
      },
      {
        id: "plugin2:admin",
        routes: [
          {
            id: "plugin2:route2",
            path: "/route2",
            component: "Component2",
            navigation: { label: "Route 2" },
          },
        ],
        destroy: vi.fn(),
        initialize: vi.fn(),
        features: [], // Added features
        capabilities: [], // Added capabilities
      },
    ];

    const navigationItems = navigationFeature.buildNavigation(mockPlugins);

    expect(navigationItems).toEqual([
      { id: "plugin1:route1", label: "Route 1", path: "/route1" },
      { id: "plugin2:route2", label: "Route 2", path: "/route2" },
    ]);
  });

  it("should handle routes with nested paths and construct the correct full path", async () => {
    const mockPlugins: Plugin[] = [
      {
        id: "plugin1:core",
        routes: [
          {
            id: "plugin1:parent",
            path: "/parent",
            component: "ParentComponent",
            navigation: { label: "Parent" },
            children: [
              {
                id: "plugin1:child",
                path: "child",
                component: "ChildComponent",
              },
            ],
          },
        ],
        destroy: vi.fn(),
        initialize: vi.fn(),
        features: [],
        capabilities: [],
      },
    ];

    const navigationItems = navigationFeature.buildNavigation(mockPlugins);

    expect(navigationItems).toEqual([
      { id: "plugin1:parent", label: "Parent", path: "/parent" },
    ]);
  });

  it("should handle routes with parentId and construct the correct full path", async () => {
    const mockPlugins: Plugin[] = [
      {
        id: "plugin1:core",
        routes: [
          {
            id: "plugin1:parent",
            path: "/parent",
            component: "ParentComponent",
            navigation: { label: "Parent" },
          },
          {
            id: "plugin1:child",
            path: "child",
            component: "ChildComponent",
            parentId: "plugin1:parent",
            navigation: { label: "Child" },
          },
        ],
        destroy: vi.fn(),
        initialize: vi.fn(),
        features: [],
        capabilities: [],
      },
    ];

    const navigationItems = navigationFeature.buildNavigation(mockPlugins);

    expect(navigationItems).toEqual([
      { id: "plugin1:parent", label: "Parent", path: "/parent" },
      { id: "plugin1:child", label: "Child", path: "child" },
    ]);
  });

  it("should handle routes with index routes and not include them in navigation", async () => {
    const mockPlugins: Plugin[] = [
      {
        id: "plugin1:core",
        routes: [
          {
            id: "plugin1:index",
            index: true,
            component: "IndexComponent",
            navigation: { label: "Index" },
          },
          {
            id: "plugin1:route1",
            path: "/route1",
            component: "Component1",
            navigation: { label: "Route 1" },
          },
        ],
        destroy: vi.fn(),
        initialize: vi.fn(),
        features: [], // Added features
        capabilities: [], // Added capabilities
      },
    ];

    const navigationItems = navigationFeature.buildNavigation(mockPlugins);

    expect(navigationItems).toEqual([
      { id: "plugin1:route1", label: "Route 1", path: "/route1" },
    ]);
  });

  it("should handle routes with navigation properties: badge, children, disabled, hidden, icon, order, show", async () => {
    const mockPlugins: Plugin[] = [
      {
        id: "plugin1:core",
        routes: [
          {
            id: "plugin1:route1",
            path: "/route1",
            component: "Component1",
            navigation: {
              label: "Route 1",
              badge: { content: "new", variant: "secondary" },
              children: [],
              disabled: true,
              hidden: true,
              icon: createElement("svg"),
              order: 1,
              show: () => true,
            },
          },
        ],
        destroy: vi.fn(),
        initialize: vi.fn(),
        features: [],
        capabilities: [],
      },
    ];

    const navigationItems = navigationFeature.buildNavigation(mockPlugins);

    expect(navigationItems).toEqual([
      expect.objectContaining({
        id: "plugin1:route1",
        label: "Route 1",
        path: "/route1",
        badge: { content: "new", variant: "secondary" },
        children: [],
        disabled: true,
        hidden: true,
        icon: expect.anything(), // Expect any React component
        order: 1,
        show: expect.any(Function),
      }),
    ]);
  });

  it("should sort navigation items by order and then by original plugin registration order", async () => {
    const mockPlugins: Plugin[] = [
      {
        id: "plugin1:core",
        routes: [
          {
            id: "plugin1:route2",
            path: "/route2",
            component: "Component2",
            navigation: { label: "Route 2", order: 2 },
          },
        ],
        destroy: vi.fn(),
        initialize: vi.fn(),
        features: [], // Added features
        capabilities: [], // Added capabilities
      },
      {
        id: "plugin2:admin",
        routes: [
          {
            id: "plugin2:route1",
            path: "/route1",
            component: "Component1",
            navigation: { label: "Route 1", order: 1 },
          },
        ],
        destroy: vi.fn(),
        initialize: vi.fn(),
        features: [], // Added features
        capabilities: [], // Added capabilities
      },
      {
        id: "plugin3:settings",
        routes: [
          {
            id: "plugin3:route3",
            path: "/route3",
            component: "Component3",
            navigation: { label: "Route 3" },
          },
        ],
        destroy: vi.fn(),
        initialize: vi.fn(),
        features: [], // Added features
        capabilities: [], // Added capabilities
      },
    ];

    const navigationItems = navigationFeature.buildNavigation(mockPlugins);

    expect(navigationItems).toEqual([
      { id: "plugin2:route1", label: "Route 1", path: "/route1", order: 1 },
      { id: "plugin1:route2", label: "Route 2", path: "/route2", order: 2 },
      { id: "plugin3:route3", label: "Route 3", path: "/route3" },
    ]);
  });

  it("should handle complex menu setups with nested routes, parentIds and index routes", async () => {
    const mockPlugins: Plugin[] = [
      {
        id: "plugin1:core",
        routes: [
          {
            id: "plugin1:dashboard",
            path: "/dashboard",
            component: "DashboardComponent",
            navigation: { label: "Dashboard" },
            children: [
              {
                id: "plugin1:dashboard-index",
                index: true,
                component: "DashboardIndex",
              },
              {
                id: "plugin1:dashboard-analytics",
                path: "analytics",
                component: "DashboardAnalytics",
                navigation: { label: "Analytics" },
              },
            ],
          },
          {
            id: "plugin1:settings",
            path: "/settings",
            component: "SettingsComponent",
            navigation: { label: "Settings" },
            children: [
              {
                id: "plugin1:settings-index",
                index: true,
                component: "SettingsIndex",
              },
              {
                id: "plugin1:profile",
                path: "profile",
                component: "ProfileComponent",
                navigation: { label: "Profile" },
              },
              {
                id: "plugin1:security",
                path: "security",
                component: "SecurityComponent",
                navigation: { label: "Security" },
              },
            ],
          },
        ],
        destroy: vi.fn(),
        initialize: vi.fn(),
        features: [],
        capabilities: [],
      },
      {
        id: "plugin2:admin",
        routes: [
          {
            id: "plugin2:admin-root",
            path: "/admin",
            component: "AdminRootComponent",
            navigation: { label: "Admin" },
            children: [
              {
                id: "plugin2:admin-index",
                index: true,
                component: "AdminIndex",
              },
              {
                id: "plugin2:users",
                path: "users",
                component: "UsersComponent",
                navigation: { label: "Users" },
              },
              {
                id: "plugin2:user-roles",
                path: "roles",
                component: "UserRolesComponent",
                navigation: { label: "Roles" },
              },
            ],
          },
        ],
        destroy: vi.fn(),
        initialize: vi.fn(),
        features: [],
        capabilities: [],
      },
    ];

    const navigationItems = navigationFeature.buildNavigation(mockPlugins);

    expect(navigationItems).toEqual([
      { id: "plugin1:dashboard", label: "Dashboard", path: "/dashboard" },
      {
        id: "plugin1:dashboard-analytics",
        label: "Analytics",
        parentId: "plugin1:dashboard",
        path: "analytics",
      },
      { id: "plugin1:settings", label: "Settings", path: "/settings" },
      {
        id: "plugin1:profile",
        label: "Profile",
        parentId: "plugin1:settings",
        path: "profile",
      },
      {
        id: "plugin1:security",
        label: "Security",
        parentId: "plugin1:settings",
        path: "security",
      },
      { id: "plugin2:admin-root", label: "Admin", path: "/admin" },
      {
        id: "plugin2:users",
        label: "Users",
        parentId: "plugin2:admin-root",
        path: "users",
      },
      {
        id: "plugin2:user-roles",
        label: "Roles",
        parentId: "plugin2:admin-root",
        path: "roles",
      },
    ]);
  });

  it("should build routes from plugins", async () => {
    const mockPlugins: Plugin[] = [
      {
        id: "plugin1:core",
        routes: [
          {
            id: "plugin1:route1",
            path: "/route1",
            component: "Component1",
          },
        ],
        destroy: vi.fn(),
        initialize: vi.fn(),
        features: [], // Added features
        capabilities: [], // Added capabilities
      },
    ];

    const routes = await navigationFeature.buildRoutes(mockPlugins);

    expect(routes).toEqual([
      {
        id: "plugin1:route1",
        path: "/route1",
        component: "plugin1:Component1",
        caseSensitive: false,
        index: false,
        pluginId: "plugin1:core",
      },
      {
        component: "core:NotFound",
        id: "core:not-found",
        index: false,
        path: "*",
        pluginId: "core:core",
      },
    ]);
  });

  it("should build route tree from routes with parent IDs", async () => {
    const routes: RouteDefinition[] = [
      {
        id: "plugin1:route1",
        path: "/route1",
        component: "Component1",
      },
      {
        id: "plugin1:route2",
        path: "/route2",
        component: "Component2",
        parentId: "plugin1:route1",
      },
      {
        id: "plugin1:route3",
        path: "/route3",
        component: "Component3",
        parentId: "plugin1:route1",
      },
      {
        id: "plugin1:route4",
        path: "/route4",
        component: "Component4",
        parentId: "plugin1:route2",
      },
    ];

    // Mock validateRoute to always return true for simplicity
    vi.spyOn(navigationFeature as any, "validateRoute").mockReturnValue(true);

    const routeTree = (navigationFeature as any).buildRouteTree(routes);

    expect(routeTree).toEqual([
      {
        id: "plugin1:route1",
        path: "/route1",
        component: "Component1",
      },
      {
        id: "plugin1:route2",
        path: "/route2",
        component: "Component2",
        parentId: "plugin1:route1",
      },
      {
        id: "plugin1:route3",
        path: "/route3",
        component: "Component3",
        parentId: "plugin1:route1",
      },
      {
        id: "plugin1:route4",
        path: "/route4",
        component: "Component4",
        parentId: "plugin1:route2",
      },
    ]);
  });

  it("should handle duplicate route entries gracefully", async () => {
    const routes: RouteDefinition[] = [
      {
        id: "plugin1:route1",
        path: "/route1",
        component: "Component1",
      },
      {
        id: "plugin1:route1", // Duplicate ID
        path: "/route1",
        component: "Component1",
      },
      {
        id: "plugin1:route2",
        path: "/route2",
        component: "Component2",
        parentId: "plugin1:route1",
      },
    ];

    vi.spyOn(navigationFeature as any, "validateRoute").mockReturnValue(true);

    const routeTree = (navigationFeature as any).buildRouteTree(routes);

    expect(routeTree).toEqual([
      {
        id: "plugin1:route1",
        path: "/route1",
        component: "Component1",
      },
      {
        id: "plugin1:route1",
        path: "/route1",
        component: "Component1",
      },
      {
        id: "plugin1:route2",
        path: "/route2",
        component: "Component2",
        parentId: "plugin1:route1",
      },
    ]);
  });
});
