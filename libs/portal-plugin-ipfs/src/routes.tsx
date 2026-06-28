import {
  createNamespacedId,
  type RouteDefinition,
} from "@lumeweb/portal-framework-core";
import { lazyIcon } from "@lumeweb/portal-framework-ui-core";
const Folder = lazyIcon("Folder");


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
