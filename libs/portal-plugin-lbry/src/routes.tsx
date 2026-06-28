import {
  CORE_NS,
  createNamespacedId,
  type RouteDefinition,
} from "@lumeweb/portal-framework-core";
import { lazyIcon } from "@lumeweb/portal-framework-ui-core";
const Anchor = lazyIcon("Anchor");
const Monitor = lazyIcon("Monitor");


const routes = [
  {
    path: "/lbry/devices",
    component: "devices",
    id: createNamespacedId(CORE_NS, "lbry-devices"),
    navigation: {
      label: "Devices",
      icon: Monitor,
      order: 3,
    },
  },
  {
    path: "/lbry/streams",
    component: "streams",
    id: createNamespacedId(CORE_NS, "lbry-streams"),
    navigation: {
      label: "Streams",
      icon: Anchor,
      order: 4,
    },
  },
] satisfies RouteDefinition[];

export default routes;
