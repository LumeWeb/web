import {
  createNamespacedId,
  type RouteDefinition,
} from "@lumeweb/portal-framework-core";
import { lazyIcon } from "@lumeweb/portal-framework-ui-core";
const Home = lazyIcon("Home");
const Settings = lazyIcon("Settings");


const routes = [
  {
    path: "/template",
    component: "./dashboard",
    id: createNamespacedId("template", "dashboard"),
    navigation: {
      label: "Template Dashboard",
      icon: Home,
      order: 10,
    },
  },
  {
    path: "/template/settings",
    component: "./settings",
    id: createNamespacedId("template", "settings"),
    navigation: {
      label: "Template Settings",
      icon: Settings,
      order: 11,
    },
  },
] satisfies RouteDefinition[];

export default routes;