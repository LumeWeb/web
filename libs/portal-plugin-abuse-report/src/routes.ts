import type { RouteDefinition } from "@lumeweb/portal-framework-core";

const routes = [
  {
    component: "Layout",
    id: "root",
    path: "/",
    children: [
      {
        component: "Index",
        index: true,
      },
      {
        component: "Report",
        path: "/report",
      },
      {
        component: "CaseAccess",
        path: "/case/access",
      },
      {
        component: "CaseView",
        path: "/case/:id",
      },
    ],
  },
] satisfies RouteDefinition[];

export default routes;
