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
    path: "/services/lbry/devices",
    component: "devices",
    id: createNamespacedId(CORE_NS, "lbry-devices"),
    navigation: {
      label: "Devices",
      description: "Manage LBRY streaming devices",
      icon: Monitor,
      order: 11,
      section: "Public Data",
    },
  },
  {
    path: "/services/lbry/streams",
    component: "streams",
    id: createNamespacedId(CORE_NS, "lbry-streams"),
    navigation: {
      label: "Streams",
      description: "Browse LBRY content streams",
      icon: Anchor,
      order: 12,
      section: "Public Data",
    },
  },
] satisfies RouteDefinition[];

export default routes;
