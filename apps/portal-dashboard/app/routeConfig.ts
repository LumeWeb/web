import { ResourceProps } from "@refinedev/core";
import path from "path";
import {
  CircleLockIcon,
  ClockIcon,
  CloudUploadSolidIcon,
} from "./components/icons.js";
import slugify from "slugify";
// @ts-ignore
import { TreeMenuItem } from "@refinedev/core/src/hooks/menu/useMenu";
import { ServiceItem } from "./dataProviders/serviceProvider";
import { IPFS_SERVICE_ID } from "./config";

export interface RouteConfig {
  id?: string;
  icon?: React.FC;
  path?: string;
  show?: string;
  component: string;
  name?: string;
  parent?: string;
  index?: boolean;
  skipMenu?: boolean;
  hide?: boolean;
  children?: RouteConfig[];
  layoutComponent?: string;
  dynamic?: boolean;
  dynamicToItem?: (item: ServiceItem) => TreeMenuItem;
  meta?: Record<string, any>;
}

export const SERVICE_ROUTE = "service";
export const IPFS_SUBFOLDER_ROUTE = "service_ipfs_subfolder";

function convertToJsonRoute(route: RouteConfig, parentPath: string = ""): any {
  const fullPath = path.join(parentPath, route.path || "");
  const jsonRoute: any = {
    path: route.path,
    file: route.layoutComponent || route.component,
    id: route.id || fullPath || route.name,
    index: route.index,
  };

  if (route.dynamic) {
    jsonRoute.path += "/:id";
  }

  if (route.layoutComponent) {
    // Inject a virtual index route
    jsonRoute.children = [
      {
        index: true,
        file: route.component, // Use the main component for the index route
      },
      ...(route.children?.map((child) => convertToJsonRoute(child, fullPath)) ||
        []),
    ];
  } else if (route.children && route.children.length > 0) {
    jsonRoute.children = route.children.map((child) =>
      convertToJsonRoute(child, fullPath),
    );
  }

  return jsonRoute;
}

export function createRemixRoutes(routeConfig: RouteConfig[]): any[] {
  return routeConfig.map((route) => convertToJsonRoute(route));
}

export function generateMenuResources(routes: RouteConfig[]): ResourceProps[] {
  const processRouteForMenu = (
    route: RouteConfig,
    parent?: RouteConfig,
  ): ResourceProps => {
    const parentPath = parent?.path || "/";
    const routePath = path.join(parentPath, route.path || "");
    const name = route.id || slugify(routePath, { lower: true });
    const parentName = parent?.id || slugify(parentPath, { lower: true });
    return {
      name,
      list: routePath,
      show: (route.dynamic && routePath + "/:id") || route.show || undefined,
      meta: {
        ...((parent && { parent: parentName }) || { parent: route.parent }),
        label: route.name,
        //@ts-ignore
        icon: route?.icon,
        dynamic: route.dynamic && route.dynamicToItem,
        dataProviderName: route.dynamic && route.meta?.dataProviderName,
        dynamicToItem: route.dynamic && route.dynamicToItem,
        hide: route.hide,
      },
    };
  };

  const processRoutesForMenu = (
    routes: RouteConfig[],
    parent?: RouteConfig,
  ): ResourceProps[] => {
    return routes.reduce<ResourceProps[]>((acc, route) => {
      if (route.skipMenu) {
        return acc; // Skip hidden routes
      }

      const resource = processRouteForMenu(route, parent);
      acc.push(resource);

      if (route.children) {
        acc.push(...processRoutesForMenu(route.children, route));
      }

      return acc;
    }, []);
  };

  return processRoutesForMenu(routes);
}

export function getAllRoutes() {
  return [
    ...routeConfig,
    ...hiddenRoutes.map((route) => {
      route.hide = true;
      return route;
    }),
  ];
}

const routeConfig: RouteConfig[] = [
  {
    icon: ClockIcon,
    id: "main",
    path: "/",
    component: "routes/index.tsx",
    name: "Dashboard",
  },
  {
    icon: ClockIcon,
    id: SERVICE_ROUTE,
    path: "service",
    component: "routes/service/index.tsx",
    name: "Services",
    dynamic: true,
    meta: {
      dataProviderName: SERVICE_ROUTE,
    },
    dynamicToItem: (item: ServiceItem) => ({
      key: item.id,
      label: item.name,
      meta: {
        id: item.id,
      },
    }),
  },
  {
    icon: CircleLockIcon,
    name: "My Account",
    id: "account",
    layoutComponent: "routes/account/index.tsx",

    path: "account",
    component: "routes/account/account.tsx",
    children: [
      {
        id: "subscription",
        path: "subscription",
        component: "routes/account/subscription.tsx",
        name: "Subscription",
      },
      {
        path: "verify",
        component: "routes/account/verify.tsx",
        name: "Verify",
        skipMenu: true,
      },
    ],
  },
  {
    id: "login",
    path: "login",
    component: "routes/login/index.tsx",
    name: "Login",
    skipMenu: true,
  },
  {
    id: "register",
    path: "register",
    component: "routes/register/index.tsx",
    name: "Register",
    skipMenu: true,
  },
  {
    id: "reset-password",
    path: "reset-password",
    component: "routes/reset_password/index.tsx",
    name: "Reset Password",
    skipMenu: true,
  },
  {
    id: "uploads",
    path: "uploads",
    icon: CloudUploadSolidIcon,
    component: "routes/uploads/index.tsx",
    name: "Uploads",
  },
];

const hiddenRoutes: RouteConfig[] = [
  {
    id: IPFS_SUBFOLDER_ROUTE,
    path: "service/ipfs/folder/:id",
    show: "service/ipfs/folder/:id",
    component: "routes/service/index.tsx",
    parent: IPFS_SERVICE_ID,
  },
];

export { routeConfig, hiddenRoutes };
