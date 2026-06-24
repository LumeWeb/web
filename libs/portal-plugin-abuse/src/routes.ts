import {
  createNamespacedId,
  type RouteDefinition,
} from "@lumeweb/portal-framework-core";

const routes = [
  {
    component: "AbuseLayout",
    id: createNamespacedId("abuse", "root"),
    navigation: {
      label: "Abuse",
    },
    path: "/abuse",
    children: [
      {
        component: "Dashboard",
        index: true,
      },
      {
        children: [
          {
            component: "CaseList",
            index: true,
          },
          {
            component: "CaseView",
            path: ":id",
          },
        ],
        component: "CaseLayout",
        path: "cases",
        navigation: {
          label: "Cases",
        },
      },
      {
        children: [
          {
            component: "ReporterList",
            index: true,
          },
          {
            component: "ReporterView",
            path: ":id",
          },
        ],
        component: "ReporterLayout",
        path: "reporters",
        navigation: {
          label: "Reporters",
        },
      },
      {
        children: [
          {
            component: "SubjectList",
            index: true,
          },
          {
            component: "SubjectView",
            path: ":id",
          },
        ],
        component: "SubjectLayout",
        path: "subjects",
        navigation: {
          label: "Subjects",
        },
      },
      {
        children: [
          {
            component: "BlockListList",
            index: true,
          },
          {
            component: "BlockListView",
            path: ":id",
          },
        ],
        component: "BlockListLayout",
        path: "blocklist",
        navigation: {
          label: "Blocklist",
        },
      },
    ],
  },
] satisfies RouteDefinition[];

export default routes;
