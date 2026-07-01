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
      label: "Private Cloud Data",
      description: "Secure private cloud storage on Sia",
      icon: HardDrive,
      order: 20,
      section: "Private Cloud Data",
    },
  },
] satisfies RouteDefinition[];

export default routes;
