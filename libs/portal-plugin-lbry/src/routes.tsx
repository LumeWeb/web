import type { RouteDefinition } from "@lumeweb/portal-framework-core";
import { Monitor, Anchor } from "lucide-react";

const routes = [
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
