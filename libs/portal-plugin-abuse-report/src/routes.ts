import {
  createNamespacedId,
  type RouteDefinition,
} from "@lumeweb/portal-framework-core";

const routes = [
  {
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
    component: "Layout",
    id: createNamespacedId("core", "abuse-report-root"),
    path: "/",
  },
] satisfies RouteDefinition[];

export default routes;
