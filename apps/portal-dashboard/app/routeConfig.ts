import { RouteConfig } from "./types";

export const SERVICE_ROUTE = "service";
export const IPFS_SUBFOLDER_ROUTE = "service_ipfs_subfolder";

export function createRemixRoutes(routes: RouteConfig[]): any[] {
  return routes.map((route) => ({
    path: route.path,
    file: route.file,
    children: route.children ? createRemixRoutes(route.children) : undefined,
  }));
}

export const routeConfig: RouteConfig[] = [
  {
    path: "/",
    file: "routes/index.tsx",
  },
  {
    path: "service/:id",
    file: "routes/service/index.tsx",
  },
  {
    path: "service/ipfs/folder/:id",
    file: "routes/service/index.tsx",
  },
  {
    file: "routes/account/layout.tsx",
    path: "account",
    children: [
      {
        path: "",
        file: "routes/account/account.tsx",
        index: true,
      },
      {
        path: "subscription",
        file: "routes/account/subscription.tsx",
      },
      {
        path: "verify",
        file: "routes/account/verify.tsx",
      },
    ],
  },
  {
    path: "login",
    file: "routes/login/index.tsx",
  },
  {
    path: "register",
    file: "routes/register/index.tsx",
  },
  {
    path: "reset-password",
    file: "routes/reset_password/index.tsx",
  },
  {
    path: "otp",
    file: "routes/login/otp.tsx",
  },
  {
    path: "uploads",
    file: "routes/uploads/index.tsx",
  },
];
