import { core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__ } from './core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__-BwLVOP21.js';
import { RefineResource } from './index-Bms_1MiW.js';

class Capability {
  dependencies = ["core:core:sdk"];
  id = "core:abuse:refine-config";
  metadata;
  status;
  type = "core:refine-config";
  version;
  async destroy() {
  }
  getConfig(existing) {
    existing = {
      options: {},
      resources: [
        {
          name: RefineResource.Case,
          meta: {
            template: "/abuse/cases"
          },
          list: "/abuse/cases",
          show: "/abuse/cases/:id"
        },
        {
          name: RefineResource.Reporter,
          meta: {
            template: "/abuse/reporters"
          },
          list: "/abuse/reporters",
          show: "/abuse/reporters/:id"
        },
        {
          name: RefineResource.Subject,
          meta: {
            template: "/abuse/subjects"
          },
          list: "/abuse/subjects",
          show: "/abuse/subjects/:id"
        },
        {
          name: RefineResource.CaseCommunication,
          meta: {
            template: "/abuse/cases/:caseId/communications"
          }
        }
      ],
      ...existing
    };
    return {
      options: {
        ...existing.options,
        syncWithLocation: true,
        warnWhenUnsavedChanges: true
      },
      resources: [...existing.resources]
    };
  }
  async initialize(_) {
  }
}

const routes = [
  {
    component: "AbuseLayout",
    id: "abuse",
    navigation: {
      label: "Abuse"
    },
    path: "/abuse",
    children: [
      {
        component: "Dashboard",
        index: true
      },
      {
        children: [
          {
            component: "CaseList",
            index: true
          },
          {
            component: "CaseView",
            path: ":id"
          }
        ],
        component: "CaseLayout",
        path: "cases",
        navigation: {
          label: "Cases"
        }
      },
      {
        children: [
          {
            component: "ReporterList",
            index: true
          },
          {
            component: "ReporterView",
            path: ":id"
          }
        ],
        component: "ReporterLayout",
        path: "reporters",
        navigation: {
          label: "Reporters"
        }
      },
      {
        children: [
          {
            component: "SubjectList",
            index: true
          },
          {
            component: "SubjectView",
            path: ":id"
          }
        ],
        component: "SubjectLayout",
        path: "subjects",
        navigation: {
          label: "Subjects"
        }
      },
      {
        children: [
          {
            component: "BlockListList",
            index: true
          },
          {
            component: "BlockListView",
            path: ":id"
          }
        ],
        component: "BlockListLayout",
        path: "blocklist",
        navigation: {
          label: "Blocklist"
        }
      }
    ]
  }
];

function index() {
  return {
    capabilities: [new Capability()],
    async destroy(_framework) {
      console.log("Plugin Abuse destroyed");
    },
    id: core_abuse__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_core__loadShare__.createNamespacedId("core", "abuse"),
    async initialize(_framework) {
      console.log("Plugin Abuse initialized");
    },
    routes
  };
}

export { index as default };
