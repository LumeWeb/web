import {
  createNamespacedId,
  type RouteDefinition,
} from "@lumeweb/portal-framework-core";
import { lazyIcon } from "@lumeweb/portal-framework-ui-core";

const HardDrive = lazyIcon("HardDrive");

const routes = [
  {
    path: "/services/sia/apps",
    component: "apps",
    id: createNamespacedId("core", "private-data"),
    navigation: {
      label: "Private Data",
      description: "Secure private storage on Sia",
      icon: HardDrive,
      order: 20,
      section: "Private Data",
    },
  },
] satisfies RouteDefinition[];

export default routes;
