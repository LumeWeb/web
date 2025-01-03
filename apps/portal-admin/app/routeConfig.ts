import { RouteConfig } from "portal-shared/types";

export const routeConfig: RouteConfig[] = [
  {
    path: "/",
    file: "routes/index.tsx",
  },
  {
    path: "dashboard",
    file: "routes/dashboard/index.tsx",
  },
  {
    path: "login",
    file: "routes/login/index.tsx",
  },
  {
    path: "cron",
    file: "routes/cron/index.tsx",
  },
  {
    path: "settings",
    file: "routes/settings/index.tsx",
  },
];
