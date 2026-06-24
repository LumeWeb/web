import {
  createNamespacedId,
  type RouteDefinition,
} from "@lumeweb/portal-framework-core";
import { Folder } from "lucide-react";

const routes = [
  {
    path: "/files",
    component: "file-manager",
    id: createNamespacedId("ipfs", "file-manager"),
    navigation: {
      label: "File Manager",
      icon: Folder,
      order: 1,
    },
  },
] satisfies RouteDefinition[];

export default routes;
