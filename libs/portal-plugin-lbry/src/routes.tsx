import type { RouteDefinition } from "@lumeweb/portal-framework-core";
import { Anchor, Monitor } from "lucide-react";

const routes = [
  {
    path: "/lbry/devices",
    component: "devices",
    id: "lbry_devices",
    navigation: {
      label: "Devices",
      icon: Monitor,
      order: 3,
    },
  },
  {
    path: "/lbry/streams",
    component: "streams",
    id: "lbry_streams",
    navigation: {
      label: "Streams",
      icon: Anchor,
      order: 4,
    },
  },
] satisfies RouteDefinition[];

export default routes;
