import type { RouteDefinition } from "@lumeweb/portal-framework-core";
import { Home, Settings } from "lucide-react";

const routes = [
  {
    path: "/template",
    component: "dashboard",
    id: "template-dashboard",
    navigation: {
      label: "Template Dashboard",
      icon: Home,
      order: 10,
    },
  },
  {
    path: "/template/settings",
    component: "settings",
    id: "template-settings",
    navigation: {
      label: "Template Settings",
      icon: Settings,
      order: 11,
    },
  },
] satisfies RouteDefinition[];

export default routes;