import {
  createNamespacedId,
  type RouteDefinition,
} from "@lumeweb/portal-framework-core";

const routes = [
  {
    component: "Index",
    id: createNamespacedId("admin", "root"),
    index: false,
    navigation: {
      label: "Home",
      order: -1,
    },
    path: "/",
  },
  {
    component: "Dashboard",
    id: createNamespacedId("admin", "dashboard"),
    index: false,
    path: "dashboard",
  },
  {
    component: "Login",
    id: createNamespacedId("admin", "login"),
    index: false,
    path: "/login",
  },
] satisfies RouteDefinition[];

export default routes;
