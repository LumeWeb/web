import {
  createNamespacedId,
  type RouteDefinition,
} from "@lumeweb/portal-framework-core";
import { lazyIcon } from "@lumeweb/portal-framework-ui-core";
const LayoutGrid = lazyIcon("LayoutGrid");

const routes = [
  {
    component: "sites",
    id: createNamespacedId("ipfs", "sites"),
    navigation: {
      description: "Workspaces and websites hosted on IPFS",
      icon: LayoutGrid,
      label: "Sites",
      order: 3,
      section: "Public Data",
    },
    path: "/sites",
  },
  {
    component: "sites/new",
    id: createNamespacedId("ipfs", "sites-new"),
    path: "/sites/new",
  },
  {
    component: "sites/workspace",
    id: createNamespacedId("ipfs", "sites-detail"),
    path: "/sites/:workspaceId",
  },
] satisfies RouteDefinition[];

export default routes;
