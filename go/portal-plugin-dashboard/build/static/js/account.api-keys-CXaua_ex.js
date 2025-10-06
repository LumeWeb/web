import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__, jsxRuntimeExports } from './jsx-runtime-D_0QkpWj.js';
import { core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__ } from './core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__-CFuxgGnQ.js';
import { core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__ } from './core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__-DOYraqnS.js';
import { z } from './index-DESmQ-Cl.js';
import { createLucideIcon } from './createLucideIcon-BcyKBqCx.js';
import { createColumnHelper } from './index-BGqH-Bku.js';
import { format } from './format-CT9KiSuR.js';

/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode$1 = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "M12 5v14", key: "s699le" }]
];
const Plus = createLucideIcon("plus", __iconNode$1);

/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */


const __iconNode = [
  ["path", { d: "M3 6h18", key: "d0wm0j" }],
  ["path", { d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6", key: "4alrt4" }],
  ["path", { d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2", key: "v07s0e" }],
  ["line", { x1: "10", x2: "10", y1: "11", y2: "17", key: "1uufr5" }],
  ["line", { x1: "14", x2: "14", y1: "11", y2: "17", key: "xtxkd" }]
];
const Trash2 = createLucideIcon("trash-2", __iconNode);

const schema = z.object({
  name: z.string().min(1, "Name cannot be empty").max(100, "Name must be less than 100 characters").refine((val) => val.trim().length > 0, {
    message: "Name cannot be empty or whitespace only"
  })
});

function createApiKeyForm() {
  return {
    action: "create",
    actionButtonsLayout: "horizontal",
    fields: [
      {
        description: "Give your API key a descriptive name to help you identify its purpose",
        label: "Key Name",
        name: "name",
        placeholder: "e.g., Production API, Development Testing",
        type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.FormFieldType.TEXT
      }
    ],
    refine: true,
    resource: "api-keys",
    successNotification: () => ({
      description: `The API key has been created.`,
      message: "API Key Created",
      type: "success"
    }),
    validationSchema: schema
  };
}

function createApiKeyDialogConfig(onSuccess) {
  return {
    formConfig: createApiKeyForm(),
    onSuccess: (response) => {
      if (response?.token) {
        onSuccess(response.token);
      }
    },
    title: "Create New API Key",
    type: core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DialogTypes.FORM
  };
}

function ApiKeyAlertMessage({ apiKey }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm", children: "Your new API key is:" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "textarea",
      {
        className: "min-h-[60px] w-full resize-none overflow-hidden break-all rounded bg-gray-800 p-2 font-mono",
        onClick: (e) => e.currentTarget.select(),
        readOnly: true,
        rows: Math.max(3, Math.ceil(apiKey.length / 60)),
        value: apiKey
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-destructive text-sm", children: "This is the ONLY time this key will be shown. Please save it somewhere secure." })
  ] });
}

const columnHelper = createColumnHelper();
const columns = [
  columnHelper.accessor("name", {
    cell: (info) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-white", children: info.getValue() }),
    header: "Name"
  }),
  columnHelper.accessor("created_at", {
    cell: (info) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gray-400", children: format(new Date(info.getValue()), "MMM d, yyyy, hh:mm a") }),
    header: "Created"
  })
];
function AccountApiKeys() {
  const { openDialog } = core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.useDialog();
  const { mutate: deleteApiKey } = core_dashboard__loadShare___mf_0_refinedev_mf_1_core__loadShare__.useDelete();
  const handleCreateClick = () => {
    openDialog(
      createApiKeyDialogConfig((key) => {
        openDialog({
          actionButtonsLayout: "horizonal",
          confirmText: "I've Saved My Key",
          description: /* @__PURE__ */ jsxRuntimeExports.jsx(ApiKeyAlertMessage, { apiKey: key }),
          size: "2xl",
          status: "warning",
          title: "API Key Created",
          type: "alert"
        });
      })
    );
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-between sm:flex-row", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.PageHeader,
        {
          description: "Manage your API keys for accessing your services",
          title: "API Keys"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui_mf_2_core__loadShare__.Button, { className: "mt-2 sm:mt-0", onClick: handleCreateClick, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "mr-2 h-4 w-4" }),
        "Create API Key"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      core_dashboard__loadShare___mf_0_lumeweb_mf_1_portal_mf_2_framework_mf_2_ui__loadShare__.DataTable,
      {
        actionMenu: {
          items: [
            {
              icon: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "mr-2 h-4 w-4" }),
              label: "Delete",
              onClick: (row) => {
                openDialog({
                  confirmText: "Delete",
                  description: `Are you sure you want to delete the API key "${row.name}"? This action cannot be undone.`,
                  onConfirm: async () => {
                    await deleteApiKey({
                      id: row.uuid,
                      resource: "api-keys",
                      successNotification: () => ({
                        description: `The API key "${row.name}" has been deleted.`,
                        message: "API Key Deleted",
                        type: "success"
                      })
                    });
                  },
                  title: "Delete API Key",
                  type: "confirm",
                  variant: "destructive"
                });
              }
            }
          ]
        },
        columns,
        emptyStateMessage: "No API keys found. Create your first key to get started.",
        pagination: true,
        resource: "api-keys",
        responsive: true
      }
    )
  ] });
}

export { AccountApiKeys as default };
