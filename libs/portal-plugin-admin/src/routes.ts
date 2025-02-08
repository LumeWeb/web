import type { RouteDefinition } from "@lumeweb/portal-framework-core";

const routes = [
  {
    component: "Index",
    id: "root",
    index: false,
    navigation: {
      label: "Home",
      order: -1,
    },
    path: "/",
  },
  {
    component: "Dashboard",
    id: "dashboard",
    index: false,
    path: "dashboard",
  },
  {
    component: "Login",
    id: "login",
    index: false,
    path: "/login",
  },
] satisfies RouteDefinition[];

export default routes;
