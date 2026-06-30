import {
  createNamespacedId,
  type RouteDefinition,
} from "@lumeweb/portal-framework-core";
import { lazyIcon } from "@lumeweb/portal-framework-ui-core";
const Folder = lazyIcon("Folder");


const routes = [
  {
    path: "/services/ipfs/files",
    component: "file-manager",
    id: createNamespacedId("ipfs", "file-manager"),
    navigation: {
      label: "Files",
      description: "Browse and manage IPFS files",
      icon: Folder,
      order: 10,
      section: "Public Data",
    },
  },
] satisfies RouteDefinition[];

export default routes;
