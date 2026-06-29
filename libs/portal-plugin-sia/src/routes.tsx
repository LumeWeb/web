import {
  createNamespacedId,
  type RouteDefinition,
} from "@lumeweb/portal-framework-core";
import { lazyIcon } from "@lumeweb/portal-framework-ui-core";

const HardDrive = lazyIcon("HardDrive");

const routes = [
  {
    path: "/sia/apps",
    component: "apps",
    id: createNamespacedId("core", "sia-apps"),
    navigation: {
      label: "My Apps",
      icon: HardDrive,
      order: 5,
    },
  },
] satisfies RouteDefinition[];

export default routes;
