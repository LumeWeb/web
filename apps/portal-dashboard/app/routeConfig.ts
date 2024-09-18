import { RouteConfig } from "./types";

export const SERVICE_ROUTE = "service";
export const IPFS_SUBFOLDER_ROUTE = "service_ipfs_subfolder";

export const routeConfig: RouteConfig[] = [
  {
    id: IPFS_SUBFOLDER_ROUTE,
    path: "/",
    file: "routes/index.tsx",
  },
  {
    id: SERVICE_ROUTE,
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
        path: "api-keys",
        file: "routes/account/api-keys.tsx",
      },
      {
        path: "security",
        file: "routes/account/security.tsx",
      },
    ],
  },
  {
    path: "account/verify",
    file: "routes/account/verify.tsx",
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
