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
      description: "Abuse management and moderation",
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
          description: "Review and manage abuse cases",
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
          description: "View abuse reporters",
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
          description: "View reported subjects",
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
          description: "Manage blocked entities",
        },
      },
    ],
  },
] satisfies RouteDefinition[];

export default routes;
